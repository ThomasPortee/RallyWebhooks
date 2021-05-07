const get = require('lodash.get');
const map = require('lodash.map');
const bluebird = require('bluebird');


/***
 * 
 * 
 * Child Elements:
*     State
*       Logic:  When the c_Strategy field changes on Portfolio Item, the child elements must 
                cascade the change into the child elements
 */

//var log = require('log4js').getLogger("business_value_changed_rule");
var log = require('log4js').getLogger("strategy_value_changed_rule");

const rally_utils = require('../common/rally_utils')

module.exports.doesRuleApply = (message) => {
  console.log("Validate if the Rule applies")
  let result = false;

  if (message && message.changesByField['c_Strategy']) { // For investment and cascade down.
    console.log("strategy_value_changed_rule applies");
    console.log(message);
    log.info(message);
    result = true;
  } else {
    console.log("strategy_value_changed_rule does NOT apply");
    this.printObj(message);
  }

  return result;
}

module.exports.run = (message) => {
  var result = new Promise((resolve, reject) => {

    const INVESTMENT = 'INVESTMENT_(NEEDS_NO_PARENT)';

    if (message) {
      log.info("***Message:")
      console.log(message);
      let currentStrategyValue = get(message, ['stateByField', 'c_Strategy', 'value']);
      let desiredStrategyValue = currentStrategyValue;
      let workspaceId = get(message, ['stateByField', 'Workspace', 'value', 'detail_link'], "").split('/').pop();
      let workspaceRef = `/workspace/${workspaceId}`;


      var promise;
      // First, if the Portfolio Item is not an Investment, get the parent's Business Value. If the PI is an Investment, ignore the parent Business Initiative
      // as the Business value is explicitly ignored on Business Initiatives.
      let parentRef = get(message, ['stateByField', 'Parent', 'value', 'ref']);
      if (parentRef && (message.object_type != "Investment")) {
        // Return the parent artifact Business value
        console.log("With parent - Not Investment");
        promise = rally_utils.getArtifactByRef(parentRef, workspaceRef, ['c_Strategy'])
          .then((response) => {
            return get(response, ['c_Strategy']);
          });
      }
      else {
        if((message.object_type != "Investment")) {
          promise = Promise.resolve(null);
          console.log("No parent - Not Investment");
        } else {
          promise = Promise.resolve(INVESTMENT);
          console.log("No parent - but Investment");
        }
      }

      // Build the list of objects to update.
      promise
        .then((parentStrategyValue) => {
          console.log("Entering promise, parentStrategyValue value is "+parentStrategyValue);
          if ( parentStrategyValue != INVESTMENT && parentStrategyValue != currentStrategyValue) {
            // Update only this item. The portfolio item has been changed to have a Business value
            // that doesn't match the parent. Change it back.

            console.log("Setting desiredStrategyValue to "+parentStrategyValue);
            desiredStrategyValue = parentStrategyValue;
            return [{
              _ref: message.ref,
              c_Strategy: currentStrategyValue
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
              console.log(childrenRef);
              return rally_utils
                .getArtifactByRef(childrenRef, workspaceRef, ['c_Strategy'])
                .then(response => {
                  console.log("Result of updating the children");
                  this.printObj(response);
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
          console.log("Items to update: ", itemsToUpdate);
          return bluebird.map(itemsToUpdate, (item) => {

            console.log("Item");
            this.printObj(item);

            if (item.c_Strategy != desiredStrategyValue) {
              console.log("Updating item to " + desiredStrategyValue);
              return rally_utils.updateArtifact(
                item._ref,
                workspaceRef, ['FormattedID', 'Name', 'c_Strategy'], {
                  c_Strategy: desiredStrategyValue
                }
              );
            }
            else {
              console.log("No update needed for this item as "+item.c_Strategy+" is equal to "+desiredStrategyValue);
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

