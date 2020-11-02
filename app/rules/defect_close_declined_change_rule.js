const get = require('lodash.get');
const map = require('lodash.map');
const bluebird = require('bluebird');


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
var log = require('log4js').getLogger("defect_close_declined_change_rule");

const rally_utils = require('../common/rally_utils')

module.exports.doesRuleApply = (message) => {
  let result = false;

  if (message && message.changesByField['State'] && message.object_type == "Defect") {
    log.info("rule applies");
    console.log("defect_close_declined_change_rule applies");
    this.printObj(message);
    result = true;
  } else {
    console.log("business_value_changed_rule does NOT apply");
    this.printObj(message);
  }

  return result;
}

module.exports.run = (message) => {
  var result = new Promise((resolve, reject) => {


    if (message) {

      
      // Validate if the object type is a Defect
      if(message.object_type == "Defect"){

        this.printObj(message);
        // Get the State
        // Validat if object has closed date

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

