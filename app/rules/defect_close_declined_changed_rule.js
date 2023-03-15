const get = require('lodash.get');
const map = require('lodash.map');
const bluebird = require('bluebird');
var log = require('log4js').getLogger("defect_close_declined_change_rule");

const rally_utils = require('../common/rally_utils')


/***
 * 
 * 
 * Child Elements:
*     State
*       Logic:  When set to Closed Declined, change to Closed, and then back to Closed Declined
      ClosedDate
        Logic:  If Closed Date contains a value, do not change State
        
    You will need the following Object UUIDs for Rally’s training workspace (we will need to change these values when we promote the webhook to production, as they are workspace specific):
      Defect:  291043d3-d000-4a57-9621-b5501406723f
      State:  e0caf6dd-304b-447e-9d61-09ac9c96e85a
      Closed Date:  24a49498-e2d6-4ded-b200-313933da132e
 * 
 */

//var log = require('log4js').getLogger("business_value_changed_rule");


module.exports.doesRuleApply = (message) => {

  let result = false;
  let closedDate = get(message, ['stateByField', 'ClosedDate', 'value'])

  console.log("Validates if rule applies to this message")
  console.log(message)
  console.log(closedDate)

  if (message && message.changesByField['State'] && message.object_type == "Defect" && (!closedDate || closedDate == '')) {
    log.info("rule applies");
    console.log("defect_close_declined_change_rule applies");
    this.printObj(message);
    result = true;
  } else {
    console.log("defect_close_declined_change_rule does NOT apply");
    this.printObj(message);
  }

  return result;
}

module.exports.run = (message) => {
  var result = new Promise((resolve, reject) => {


    if (message) {

      let workspaceId = get(message, ['stateByField', 'Workspace', 'value', 'detail_link'], "").split('/').pop();
      let workspaceRef = `/workspace/${workspaceId}`;

      let state = get(message, ['stateByField', 'State', 'value'])
      let closedDate = get(message, ['stateByField', 'ClosedDate', 'value'])

      var promise

      console.log(`Closed Date: ${closedDate}`)


      if (message.object_type == "Defect" && (closedDate == undefined || closedDate == '' || closedDate == null)) {

        // If it's a Defect and does not have a Closed Date:
        console.log("Generating promise to Change state to closed")

        // change state to closed with rally_utils.updateArtifact

        rally_utils.updateArtifact(message.ref, workspaceRef, ['State'], {
          State: "Closed"
        })
          .then(() => {
            console.log("Defect changed to Status:Closed")
            // Get artifact by referecne to see the update
            // Is message available here
            return rally_utils.updateArtifact(message.ref, workspaceRef, ['State'], {
              State: "Closed Declined"
            })

          })
          .then((result) => {
            console.log("Defech changed to Closed Declined")
            resolve(result)
          })

      } else {
        // If no object exists return undefined
        console.log("Nothing to do")
        //promise = Promise.resolve(undefined)
        reject(undefined)

      }


    }
    else {
      reject("No message in webhook");
    }
  });


  return result;
}


module.exports.printObj = (obj) => {
  var propValue;
  for (var propName in obj) {
    propValue = obj[propName]

    console.log(propName, propValue);
  }
}


