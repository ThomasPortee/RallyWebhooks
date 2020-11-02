const get = require('lodash.get');
const bluebird = require('bluebird');

var log = require('log4js').getLogger("update_new_investment_category_rule");

const rally_utils = require('../common/rally_utils');

module.exports.doesRuleApply = (message) => {
  let result = false;

  if (message) {
    if (message.action == "Created") {
      result = true;
    }
    else if ((message.action == "Updated") && message.changesByField['Parent']) {
      result = true;
    }
  }

  if (result) {
    log.info("rule applies");
    console.log("rule update_new_investment_category_rule applies");
    this.printObj(message);
  }
  else {
    console.log("rule update_new_investment_category_rule does NOT apply");
    this.printObj(message);
  }
  return result
}


module.exports.run = (message) => {
  var result = new Promise((resolve, reject) => {

    var updateArray = [];
    const INVESTMENT = 'INVESTMENT_(NEEDS_NO_PARENT)';
    if (message) {
      let currentInvestmentCategory = get(message, ['stateByField', 'InvestmentCategory', 'value', 'value']);
      // TODO Test UUID - The Workspace.value.ref ends in a UUID, which isn't accepted by lookback. Get the ID from the detail_link
      let workspaceId = get(message, ['stateByField', 'Workspace', 'value', 'detail_link'], "").split('/').pop();
      let workspaceRef = `/workspace/${workspaceId}`;

      var promise;
      // First, if the Portfolio Item is not an Investment, get the parent's Investment Category. If the PI is an Investment, ignore the parent Business Initiative
      // as the InvestmentCategory is explicitly ignored on Business Initiatives.
      let parentRef = get(message, ['stateByField', 'Parent', 'value', 'ref']);
      if (message.object_type != "Investment" && parentRef) {
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

      promise
        .then((parentInvestmentCategory) => {
          if (parentInvestmentCategory && parentInvestmentCategory != 'None' && parentInvestmentCategory != currentInvestmentCategory) {
            // Update only this item. The portfolio item has been changed to have an investment category
            // that doesn't match the parent. Change it back.
            return rally_utils.updateArtifact(
              message.ref,
              workspaceRef, ['FormattedID', 'Name', 'InvestmentCategory'], {
                InvestmentCategory: parentInvestmentCategory
              }
            );
          }
          else {
            // No update needed for this item
            return;
          }
        })
        .then((updates) => {
          updateArray.push(updates);
        })


      let currentBusinessValue = get(message, ['stateByField', 'c_BusinessValuePrimary', 'value']);
      if (message.object_type != "Investment" && parentRef) {
        // Return the parent artifact Business Value
        promise = rally_utils.getArtifactByRef(parentRef, workspaceRef, ['c_BusinessValuePrimary'])
          .then((response) => {
            return get(response, ['c_BusinessValuePrimary']);
          });
      }
      else {
        if(message.object_type != "Investment") {
          promise = Promise.resolve(null);
        } else {
          promise = Promise.resolve(INVESTMENT);
        }
      }

      promise
        .then((parentBusinessValue) => {
          if (parentBusinessValue != INVESTMENT && parentBusinessValue != currentBusinessValue) {
            // Update only this item. The portfolio item has been changed to have an business value
            // that doesn't match the parent. Change it back.
            return rally_utils.updateArtifact(
              message.ref,
              workspaceRef, ['FormattedID', 'Name', 'c_BusinessValuePrimary'], {
                c_BusinessValuePrimary: parentBusinessValue
              }
            );
          }
          else {
            // No update needed for this item
            return;
          }
        })
        .then((updates) => {
          updateArray.push(updates);
          resolve(updateArray);
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
   for(var propName in obj) {
     propValue = obj[propName]
 
     console.log(propName,propValue);
 }}