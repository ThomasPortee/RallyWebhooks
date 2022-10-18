const get = require('lodash.get');
const bluebird = require('bluebird');

var log = require('log4js').getLogger("investmentcategory_changed_rule");

const rally_utils = require('../common/rally_utils');


module.exports.doesRuleApply = (message) => {
  let result = false;
  if (!message) {
    throw new Error("No message receive");
  }



  return true;


  const fields_updated = ['InvestmentCategory']

  if (message) {
    log.debug(`${message.action} on ${message.object_type} ${JSON.stringify(Object.keys(message.changesByField))}`);
    log.debug(`${message.detail_link}`);
    if (message.action == "Created" && message.object_type != "Investment") {
      result = true;
    }
    else if (message.action == "Updated" && Object.keys(message.changesByField).includes(fields_updated[0])) {
      result = true;
    }
  }

  if (result) {
    log.info("rule investmentcategory_changed_rule applies");
    //this.printObj(message);
  }
  else {
    log.warn("rule investmentcategory_changed_rule does NOT apply");
    //this.printObj(message);
  }
  return result
}


module.exports.run = async (message) => {
  try {
    var result = await (async () => {
      if (!message) {
        throw new Error("No message was sent to Reflector")
      }
      var current_values = {};
      var parent_values = {};
      // Obtain children:
      let childrenRef = get(message, ['stateByField', 'Children', 'ref']);
      let children_count = get(message, ['stateByField', 'DirectChildrenCount', 'value'])

      // If the artifacts has no children
      // if the type is Investment
      // returns
      // if type is different than investment
      //  if parent is undefined request set InvestmentCategory as NULL and return
      //  else Set InvestmentCategory as current_value
      //  Request update for the Epic Or feature

      // Get these from current item
      check_fields.forEach((field) => {
        if (field != 'c_CAIBenefit') {
          current_values[field] = get(message, ['stateByField', field, 'value', 'value']);
          return;
        }
        current_values[field] = get(message, ['stateByField', field, 'value']);
      });


      // Then should be Epic or Feature
      // Get Parent field values
      // TODO Test UUID - The Workspace.value.ref ends in a UUID, which isn't accepted by lookback. Get the ID from the detail_link
      let workspaceId = get(message, ['stateByField', 'Workspace', 'value', 'detail_link'], "").split('/').pop();
      let workspaceRef = `/workspace/${workspaceId}`;




    });

    return result;

  } catch (error) {

    throw new Error(error)

  }
}



module.exports.__run = (message) => {
  var result = new Promise((resolve, reject) => {
    if (message) {

      // 2022-08-27: Here we will define the fields that need to be validated and changed 
      // in case an item has been changed to a different parent or if an item is created
      // and these fields have to cascade down

      const check_fields = ['InvestmentCategory']

      var current_values = {};
      var parent_values = {};

      // Get these from current item
      check_fields.forEach((field) => {
        if (field != 'c_CAIBenefit') {
          current_values[field] = get(message, ['stateByField', field, 'value', 'value']);
          return;
        }
        current_values[field] = get(message, ['stateByField', field, 'value']);
      });


      // Get Parent field values
      // TODO Test UUID - The Workspace.value.ref ends in a UUID, which isn't accepted by lookback. Get the ID from the detail_link
      let workspaceId = get(message, ['stateByField', 'Workspace', 'value', 'detail_link'], "").split('/').pop();
      let workspaceRef = `/workspace/${workspaceId}`;

      // First, if the Portfolio Item is not an Investment, get the parent's Investment Category. If the PI is an Investment, ignore the parent Business Initiative
      // as the InvestmentCategory is explicitly ignored on Business Initiatives.
      let parentRef = get(message, ['stateByField', 'Parent', 'value', 'ref']);


      // If the object_type is Investment AND has Children
      // update the first children (Epic)
      // If the object_type is different than investment
      //  if the object has a parent and parent has InvestmentCategory, copy from that
      //  if the object DOES not have parent, set Investment Category as NULL
      //  If the oject has children. cascade the InvestmentCategory Down
      // 


      if (message.object_type != "Investment" && parentRef) {

        // Return the parent artifact for each check_field

        var response = rally_utils.getArtifactByRef(parentRef, workspaceRef, check_fields)
          .then((r) => {
            parent_values = extract_result(check_fields, r);
            let changes = {};
            check_fields.map(f => {
              if (current_values[f] != parent_values[f]) {
                changes[f] = parent_values[f]
              }
            })
            return changes;
          })
          .catch((err) => {
            log.error(err.message, err.stack)
          });

      }
      else {
        // No parent
        response = Promise.resolve(undefined);
      }

      response.then((parentChanges) => {

        // Obtain children:
        let childrenRef = get(message, ['stateByField', 'Children', 'ref']);
        let children_count = get(message, ['stateByField', 'DirectChildrenCount', 'value'])

        log.debug(`children count: ${children_count}`);

        let items_to_update = [];

        if ((parentChanges == undefined || parentChanges == null || Object.keys(parentChanges).length <= 0) && message.object_type != "Investment") {
          log.info("Will only indicate changes when the element (Epic or Feature) is orphan")

          if (children_count <= 0) {
            return check_fields.map((field) => {
              var updating_fields = {}
              updating_fields["_ref"] = message.ref;
              updating_fields[field] = null;

              return updating_fields
            })

          }

          return rally_utils
            .getArtifactByRef(childrenRef, workspaceRef, check_fields)
            .then(response => {
              //console.log(response)
              return response.Results;
            }).then((children) => {
              return children.map((child) => {
                return {
                  _ref: child._ref,
                  InvestmentCategory: null
                }
              });
            }).then((childrenToUpdate) => {
              // Add to children to Update current element
              let item = {
                _ref: message.ref,
                InvestmentCategory: null
              }
              childrenToUpdate.push(item);
              return childrenToUpdate;
            })
        }

        log.info("Generate changes for current element and children")


        if (childrenRef && children_count > 0) {
          if (!parentChanges) {
            parentChanges = current_values;
          }
          log.info(parentChanges)
          //TODO paginate children
          return rally_utils
            .getArtifactByRef(childrenRef, workspaceRef, check_fields)
            .then(response => {
              //console.log(response)
              return response.Results;
            })
            .then((children) => {
              return children.map((child) => {
                let item = {}
                Object.keys(parentChanges).forEach((key) => {
                  // Validate if children needs to be updated
                  if (child[key] != parentChanges[key]) {
                    item['_ref'] = child._ref;
                    item[key] = parentChanges[key]
                  }
                });
                return item;
              });
            }).then((childrenToUpdate) => {
              // Add to children to Update current element
              let item = {};
              Object.keys(parentChanges).forEach((key) => {
                // Validate if children needs to be updated
                item['_ref'] = message.ref;
                item[key] = parentChanges[key]

              });
              childrenToUpdate.push(item);
              return childrenToUpdate;
            })
        } // Only if it has children
        else {
          // does not have children
          let item = {};
          Object.keys(parentChanges).forEach((key) => {
            // Validate if children needs to be updated
            if (current_values[key] != parentChanges[key]) {
              item['_ref'] = message.ref;
              item[key] = parentChanges[key]
            }
          });
          items_to_update.push(item)
          return items_to_update;
        }
      }).then((itemsToUpdate) => {
        log.debug("ITEMS TO UPDATE:");
        log.debug(itemsToUpdate);
        return bluebird.map(itemsToUpdate, (item) => {
          let artifact_update = {};
          Object.keys(item).forEach(key => {
            if (key != '_ref') {
              artifact_update[key] = item[key];
            }
          });
          log.debug("UPDATING:", item);
          log.debug(artifact_update)
          const keys = Object.keys(artifact_update)
          return rally_utils.updateArtifact(
            item._ref,
            workspaceRef, ['FormattedID', 'Name', ...keys], artifact_update);

        });
      }).then((updates) => {
        log.debug("Finished updates!")
        resolve(updates)
      })
        .catch((err) => {
          reject(err);
        })

    }
    else {
      reject("No message in webhook");
    }
  });

  return result;
}

function extract_result(fields, result) {
  let pv = {}
  fields.forEach((f) => {
    pv[f] = get(result, f);
  });

  return pv;
}

module.exports.printObj = (obj) => {
  var propValue;
  for (var propName in obj) {
    propValue = obj[propName]
    log.debug(propName);
    log.debug(propValue);
  }
}

// On update c_CAIBenefit does not update