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

    
    const INVESTMENT = 'INVESTMENT_(NEEDS_NO_PARENT)';
    if (message) {
      let currentInvestmentCategory = get(message, ['stateByField', 'InvestmentCategory', 'value', 'value']);
      // TODO Test UUID - The Workspace.value.ref ends in a UUID, which isn't accepted by lookback. Get the ID from the detail_link
      let workspaceId = get(message, ['stateByField', 'Workspace', 'value', 'detail_link'], "").split('/').pop();
      let workspaceRef = `/workspace/${workspaceId}`;

      var promiseStateByField;
      var updateArray = [];
      // First, if the Portfolio Item is not an Investment, get the parent's Investment Category. If the PI is an Investment, ignore the parent Business Initiative
      // as the InvestmentCategory is explicitly ignored on Business Initiatives.
      let parentRef = get(message, ['stateByField', 'Parent', 'value', 'ref']);
      if (message.object_type != "Investment" && parentRef) {
        // Return the parent artifact InvestmentCategory
        promiseStateByField = rally_utils.getArtifactByRef(parentRef, workspaceRef, ['InvestmentCategory'])
          .then((response) => {
            return get(response, ['InvestmentCategory']);
          });
      }
      else {
        // No parent, return undefined as parent InvestmentCategory
        promiseStateByField = Promise.resolve(undefined);
      }

      promiseStateByField
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
          //resolve(updates);
        })


      // Business Value
      var promiseBenefit;
      var updateArrayBenefit = [];
      let currentBusinessValue = get(message, ['stateByField', 'c_CAIBenefit', 'value']);
      const EPIC = 'EPIC_(NEEDS_NO_PARENT)';
      
      if (message.object_type != "Epic" && parentRef) {
        console.log("Updating CAIBenefit")
        // Return the parent artifact Business Value
        promiseBenefit = rally_utils.getArtifactByRef(parentRef, workspaceRef, ['c_CAIBenefit'])
          .then((response) => {
            return get(response, ['c_CAIBenefit']);
          });
      }
      else {
        if(message.object_type != "Epic") {
          promiseBenefit = Promise.resolve(null);
        } else {
          promiseBenefit = Promise.resolve(EPIC);
        }
      }
      promiseBenefit
      .then((parentBusinessValue) => {
        if (parentBusinessValue != EPIC && parentBusinessValue != currentBusinessValue) {
          console.log("parentBusinessValue");
          console.log(parentBusinessValue);
          // Update only this item. The portfolio item has been changed to have an business value
          // that doesn't match the parent. Change it back.
          return rally_utils.updateArtifact(
            message.ref,
            workspaceRef, ['FormattedID', 'Name', 'c_CAIBenefit'], {
              c_CAIBenefit: parentBusinessValue
            }
          );
        }
        else {
          // No update needed for this item
          console.log("No update needed for this item")
          return;
        }
      })
      .then((updates) => {
        console.log("Resolving updates parenBusinessValue");
        console.log(updates);
        //updateArrayBenefit.push(updates);
        //resolve(updateArrayBenefit);
      })



      // c_Strategy
      var promiseStrategy;
      var updateArrayStrategy = [];
      let currentStrategy = get(message, ['stateByField', 'c_Strategy', 'value']);
      if (message.object_type != "Investment" && parentRef) {
        console.log("Updating Strategy")
        // Return the parent artifact Business Value
        promiseStrategy = rally_utils.getArtifactByRef(parentRef, workspaceRef, ['c_Strategy'])
          .then((response) => {
            return get(response, ['c_Strategy']);
          });
      }
      else {
        if(message.object_type != "Investment") {
          promiseStrategy = Promise.resolve(null);
        } else {
          promiseStrategy = Promise.resolve(INVESTMENT);
        }
      }


      promiseStrategy
        .then((parentStrategy) => {
          if (parentStrategy != INVESTMENT && parentStrategy != currentStrategy) {
            // Update only this item. The portfolio item has been changed to have an business value
            // that doesn't match the parent. Change it back.
            return rally_utils.updateArtifact(
              message.ref,
              workspaceRef, ['FormattedID', 'Name', 'c_Strategy'], {
                c_Strategy: parentStrategy
              }
            );
          }
          else {
            // No update needed for this item
            return;
          }
        })
        .then((updates) => {
          console.log("Resolving updates Strategy");
          console.log(updates);
          //updateArrayStrategy.push(updates);
          //resolve(updateArrayStrategy);
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