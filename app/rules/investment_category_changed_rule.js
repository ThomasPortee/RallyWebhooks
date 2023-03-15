const get = require('lodash.get');
const map = require('lodash.map');
const bluebird = require('bluebird');

var log = require('log4js').getLogger("investment_category_changed_rule");

const rally_utils = require('../common/rally_utils')


/**
 * investment_category_changed
 * Change Investment Category Reflector:  Always cascade Investment Category from Investment to Epic and Feature.
    1. If Investment Category is set on an orphan Epic or Feature, remove Investment Category.
    2. If Investment Category is set on a Feature or Epic whose parent does not have an Investment Category, remove Investment Category.
 * @param {*} message 
 * @returns 
 */

module.exports.doesRuleApply = (message) => {
  let result = false;
  console.log("MESSAGE")
  console.log(message)

  if (message && message.changesByField['InvestmentCategory'] && message.action == "Updated") {
    log.info("rule applies");
    console.log("investment_category_changed_rule applies");
    this.printObj(message);
    result = true;
  } else {
    console.log("investment_category_changed_rule does NOT apply");
    this.printObj(message);
  }

  return result;
}

module.exports.run = (message) => {
  var result = new Promise((resolve, reject) => {
    if (message) {
      let currentInvestmentCategory = get(message, ['stateByField', 'InvestmentCategory', 'value', 'value']);
      let desiredInvestmentCategory = currentInvestmentCategory;
      // TODO Test UUID - The Workspace.value.ref ends in a UUID, which isn't accepted by lookback. Get the ID from the detail_link
      let workspaceId = get(message, ['stateByField', 'Workspace', 'value', 'detail_link'], "").split('/').pop();
      let workspaceRef = `/workspace/${workspaceId}`;

      var promise;
      // First, if the Portfolio Item is not an Investment, get the parent's Investment Category. If the PI is an Investment, ignore the parent Business Initiative
      // 
      let parentRef = get(message, ['stateByField', 'Parent', 'value', 'ref']);
      if (parentRef && (message.object_type != "Investment")) {
        // Return the parent artifact InvestmentCategory
        promise = rally_utils.getArtifactByRef(parentRef, workspaceRef, ['InvestmentCategory'])
          .then((response) => {
            return get(response, ['InvestmentCategory']);
          });
      }
      else {
        // No parent, return undefined as parent InvestmentCategory
        //1. If Investment Category is set on an orphan Epic or Feature, set Investment Category to None.
        promise = Promise.resolve('None');
      }

      // Build the list of objects to update.
      promise
        .then((parentInvestmentCategory) => {
          if (parentInvestmentCategory && parentInvestmentCategory != 'None' && parentInvestmentCategory != currentInvestmentCategory) {
            // Update only this item. The portfolio item has been changed to have an investment category
            // that doesn't match the parent. Change it back.
            desiredInvestmentCategory = parentInvestmentCategory;
            return [{
              _ref: message.ref,
              InvestmentCategory: currentInvestmentCategory
            }];
          }
          else {

            // This will return the Investnment Category as None.
            if (parentInvestmentCategory == 'None' && message.object_type != 'Investment') {
              desiredInvestmentCategory = 'None';
            } else {
              desiredInvestmentCategory = currentInvestmentCategory;
            }

            // Collect this items children for update.
            // To minimize conflict from concurrent webhooks, don't attempt to update all descendents. Update only immediate children
            // and rely on the webhook callback for those updates to allow us to update their children.
            // Otherwise you may get Concurrency Exceptions from Agile Central.
            let childrenRef = get(message, ['stateByField', 'Children', 'ref']);
            let children_count = get(message, ['stateByField', 'DirectChildrenCount', 'value'])
            log.debug(`children count: ${children_count}`);
            if (childrenRef && children_count > 0) {
              // TODO paginate children
              return rally_utils
                .getArtifactByRef(childrenRef, workspaceRef, ['InvestmentCategory'])
                .then(response => {
                  return response.Results;
                });
            }
            else {
              return [{
                _ref: message.ref,
                InvestmentCategory: currentInvestmentCategory //Must be None
              }]; // No children (example Features have no portfolio item children, only ChildStories)
            }
          }
        })

        // Update the list of OIDs (either reverting the 1 item, or updating all its children)
        .then((itemsToUpdate) => {
          if (desiredInvestmentCategory == 'None') {
            itemsToUpdate.push(
              {
                _ref: message.ref,
                InvestmentCategory: currentInvestmentCategory //Must be None
              }
            )
          }
          log.info("Items to update: ", itemsToUpdate);
          return bluebird.map(itemsToUpdate, (item) => {
            if (item.InvestmentCategory != desiredInvestmentCategory) {
              return rally_utils.updateArtifact(
                item._ref,
                workspaceRef, ['FormattedID', 'Name', 'InvestmentCategory'], {
                InvestmentCategory: desiredInvestmentCategory
              }
              );
            }
            else {
              // No update needed for this item
              return;
            }
          });
        })
        .then((updates) => {
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