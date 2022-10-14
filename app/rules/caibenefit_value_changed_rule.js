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

//var log = require('log4js').getLogger("caibenefit_value_changed_rule");
var log = require('log4js').getLogger("caibenefit_value_changed_rule");

const rally_utils = require('../common/rally_utils')

module.exports.doesRuleApply = (message) => {
  let result = false;

  if (message && message.changesByField['c_CAIBenefit']) {
    log.info("rule applies");
    console.log("rule c_CAIBenefit_changed_rule applies");

    result = true;
  } else {
    console.log("rule c_CAIBenefit_changed_rule does NOT apply");
    //this.printObj(message);
  }

  //console.log(JSON.stringify(message));

  return result;
}

module.exports.run = (message) => {
  console.log("rule caibenefit_value_changed_rule Running");

  var result = new Promise((resolve, reject) => {

    const EPIC = 'EPIC_(NEEDS_NO_PARENT)';

    if (message) {

      //this.printObj(message);
      let currentBusinessValue = get(message, ['stateByField', 'c_CAIBenefit', 'value']);
      let desiredBusinessValue = currentBusinessValue;
      let workspaceId = get(message, ['stateByField', 'Workspace', 'value', 'detail_link'], "").split('/').pop();
      let workspaceRef = `/workspace/${workspaceId}`;

      var promise;
      // First, if the Portfolio Item is not an Investment, get the parent's Business Value. If the PI is an Investment, 
      // ignore the parent Business Initiative as the Business value is explicitly ignored on Business Initiatives.
      let parentRef = get(message, ['stateByField', 'Parent', 'value', 'ref']);

      // If Portfolio Item is Epic, will cascade down to all features the c_CAIBenefit value
      // If Portfolio Item is Feature will take the value C_CAI Benefit of Parent

      if (parentRef && (message.object_type != "Epic")) {
        // Return the parent artifact Business value
        console.log("Epic will cascade down to children");
        promise = rally_utils.getArtifactByRef(parentRef, workspaceRef, ['c_CAIBenefit'])
          .then((response) => {
            return get(response, ['c_CAIBenefit']);
          });
      }
      else {
        if ((message.object_type != "Epic")) {
          promise = Promise.resolve(null);
          console.log("No parent - Not EPIC");
        } else {
          promise = Promise.resolve(EPIC);
          console.log("No parent - but EPIC");
        }
      }

      // Build the list of objects to update.
      promise
        .then((parentBusinessValue) => {
          console.log("Entering promise, parentBusinessValue value is " + parentBusinessValue);
          if (parentBusinessValue != EPIC && parentBusinessValue != currentBusinessValue) {
            // Update only this item. The portfolio item has been changed to have a Business value
            // that doesn't match the parent. Change it back.

            console.log("Setting desired BusinessValue to " + parentBusinessValue);
            desiredBusinessValue = parentBusinessValue;
            //resolve(`Setting desired BusinessValue to ${parentBusinessValue}`)
            return [{
              _ref: message.ref,
              c_CAIBenefit: currentBusinessValue
            }];
          }
          else {
            // Collect this items children for update.
            // To minimize conflict from concurrent webhooks, don't attempt to update all descendents. Update only immediate children
            // and rely on the webhook callback for those updates to allow us to update their children.
            // Otherwise you may get Concurrency Exceptions from Agile Central.
            console.log("Finding all first level children and updating those");
            let childrenRef = get(message, ['stateByField', 'Children', 'ref']);
            if (childrenRef) {
              console.log("childrenRef value");
              console.log(JSON.stringify(childrenRef))
              //this.printObj(childrenRef);
              return rally_utils
                .getArtifactByRef(childrenRef, workspaceRef, ['c_CAIBenefit'])
                .then(response => {
                  console.log("Result of updating the children");
                  //this.printObj(response);
                  return response.Results;
                });
            }
            else {
              console.log("No children found");
              return []; // No children (example Features have no portfolio item children, only ChildStories)
            }
          }
        })

        // Update the list of OIDs (either reverting the 1 item, or updating all its children)
        .then((itemsToUpdate) => {
          log.info("Items to update: ", itemsToUpdate);
          console.log("Items to update: ", JSON.stringify(itemsToUpdate));
          return bluebird.map(itemsToUpdate, (item) => {
            console.log("Item");
            //this.printObj(item);

            if (item.c_CAIBenefit != desiredBusinessValue) {
              console.log("Updating item to " + desiredBusinessValue);
              return rally_utils.updateArtifact(
                item._ref,
                workspaceRef, ['FormattedID', 'Name', 'c_CAIBenefit'], {
                c_CAIBenefit: desiredBusinessValue
              }
              );
            }
            else {
              console.log("No update needed for this item as " + item.c_CAIBenefit + " is equal to " + desiredBusinessValue);
              // No update needed for this item
              return;
            }
          });
        })
        .then((updates) => {
          console.log("Resolving all updates");
          resolve(updates);
        })
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

