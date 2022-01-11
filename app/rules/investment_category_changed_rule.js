const get = require('lodash.get');
const map = require('lodash.map');
const bluebird = require('bluebird');

var log = require('log4js').getLogger("investment_category_changed_rule");

const rally_utils = require('../common/rally_utils')

module.exports.doesRuleApply = (message) => {
  let result = false;

  if (message && message.changesByField['InvestmentCategory']) {
    log.info("rule applies");
    console.log("investment_category_changed_rule does apply");
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
      // as the InvestmentCategory is explicitly ignored on Business Initiatives.
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
        promise = Promise.resolve(undefined);
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
            // Collect this items children for update.
            // To minimize conflict from concurrent webhooks, don't attempt to update all descendents. Update only immediate children
            // and rely on the webhook callback for those updates to allow us to update their children.
            // Otherwise you may get Concurrency Exceptions from Agile Central.
            let childrenRef = get(message, ['stateByField', 'Children', 'ref']);
            if (childrenRef) {
              // TODO paginate children
              return rally_utils
                .getArtifactByRef(childrenRef, workspaceRef, ['InvestmentCategory'])
                .then(response => {
                  return response.Results;
                });
            }
            else {
              return []; // No children (example Features have no portfolio item children, only ChildStories)
            }
          }
        })

        // Update the list of OIDs (either reverting the 1 item, or updating all its children)
        .then((itemsToUpdate) => {
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