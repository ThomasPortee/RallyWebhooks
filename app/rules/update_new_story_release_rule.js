const get = require('lodash.get');

const types_of_interest = ['HierarchicalRequirement'];
var log = require('log4js').getLogger("update_new_story_release_rule");

const rally_utils = require('../common/rally_utils')

const didAppropriateRecordTypeChange = (message) => {
    if (types_of_interest.length === 0) {
        return true
    }

    if (!message || !message.object_type) {
        return false;
    }

    for (var j = 0; j < types_of_interest.length; j++) {
        if (message.object_type.toLowerCase() == types_of_interest[j].toLowerCase()) {
            return true;
        }
    }

}

const hasAppropriateState = (message) => {
    let result = false;
    if (message) {
        const releaseObject = message.stateByField['Release'];
        if (releaseObject && !releaseObject.value) {
            result = true;
        }
    }
    return result;
}

const isAppropriateAction = (message) => {
    let result = false;
    if (message && message.action == "Created") {
        result = true;
    }
    return result;
}


module.exports.doesRuleApply = (message) => {
    let result = false;
    if (isAppropriateAction(message) &&
        hasAppropriateState(message) &&
        didAppropriateRecordTypeChange(message)) {

        result = true;
    }
    return result;
}


module.exports.run = (message) => {
    var result = new Promise((resolve, reject) => {
        if (message && message.changesByField && message.stateByField) {
            let objectId = get(message, ['stateByField', 'ObjectID', 'value']);
            let featureRef = get(message, ['stateByField', 'Feature', 'value', 'ref']);
            let workspaceRef = get(message, ['stateByField', 'Workspace', 'value', 'ref']);

            if (featureRef) {
                rally_utils.getArtifactByRef(featureRef, workspaceRef, ['Release', 'Name'])
                    .then(response => {
                        const releaseRef = get(response, ['Release', '_ref']);
                        if (releaseRef) {
                            const data = {
                                Release: releaseRef
                            };
                            return rally_utils.updateArtifact(
                                `/hierarchicalrequirement/${objectId}`,
                                workspaceRef, ['FormattedID', 'Name', 'Release'],
                                data)
                        }
                    })
                    .then((updates) => {
                        resolve(updates);
                    });
            }
            else {
                resolve(); // Nothing to do
            }
        }
        else {
            resolve(); // Nothing to do
        }
    });

    return result;
}
