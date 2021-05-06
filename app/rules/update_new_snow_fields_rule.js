const get = require('lodash.get');
const bluebird = require('bluebird');

var log = require('log4js').getLogger("update_new_snow_fields_rule");

const rally_utils = require('../common/rally_utils');

module.exports.doesRuleApply = (message) => {
  let result = false;

  if (message) {
    if (message.action == "Created") {
      result = true;
    }
  }

  if (result) {
    //log.info("rule applies");
  }
  return result
}


module.exports.run = (message) => {
  var result = new Promise((resolve, reject) => {
    if (message) {
      let snowIndicator = get(message, ['stateByField', 'c_SendtoSNOWIndicatorDSEONLY', 'value']);
      let snowStatus = get(message, ['stateByField', 'c_SNOWStatusDontTouchAdminONLY', 'value']);
      // TODO Test UUID - The Workspace.value.ref ends in a UUID, which isn't accepted by lookback. Get the ID from the detail_link
      let workspaceId = get(message, ['stateByField', 'Workspace', 'value', 'detail_link'], "").split('/').pop();
      let workspaceRef = `/workspace/${workspaceId}`;

      // The webhook config only allows logical AND of expressions. This means that in order to clear both SNOW
      // fields two different webhooks had to be created. To improve robustness, clear BOTH fields when called
      // from either webhook invocations. The downside is that we may get concurrent modification exceptions, which
      // we can safely ignore.
      if (snowIndicator || snowStatus) {
        return rally_utils.updateArtifact(
          message.ref,
          workspaceRef, [], {
            c_SendtoSNOWIndicatorDSEONLY: null,
            c_SNOWStatusDontTouchAdminONLY: null
          }
        ).then(() => {
          resolve("SNOW fields cleared");
        }, (error) => {
          // Ignore concurrency errors since we update both fields in each webhook
          if (error && error.message && !error.message.startsWith('Concurrency')) {
            //log.error(error);
          }
          resolve(error);
        })
      }
      else {
        // No update needed for this item
        resolve("No updated needed");
      }

    }
    else {
      reject("No message in webhook");
    }

  });

  return result;
}
