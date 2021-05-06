var log = require('log4js').getLogger("rally_utils");

const rally = require('rally'),
	restApi = rally(),
	refUtils = rally.util.ref;

module.exports.projectIncluded = (rule_name, top_project_names, project_uuid) => {
	if (top_project_names.length) {
		throw ("Project restrictions not supported");
	}

	let x = {};
	x[rule_name] = true
	return Promise.resolve(x);
}

module.exports.updateArtifact = (ref, workspaceRef, fetch, data) => {
	//log.info('Updating: ', ref, data);
	return new Promise((resolve, reject) => {
		restApi.update({
			ref: refUtils.getRelative(ref),
			data: data,
			fetch: fetch,
			scope: {
				workspace: refUtils.getRelative(workspaceRef)
			}
		}, function(error, result) {
			if (error) {
				//log.debug(`Error updating ref: ${ref}`, error);
				reject(error);
			}
			else {
				resolve(result)
			}
		});
	})

}

module.exports.getArtifactByRef = (ref, workspaceRef, fetch) => {
	return new Promise((resolve, reject) => {
		restApi.query({
			ref: refUtils.getRelative(ref),
			fetch: fetch,
			scope: {
				workspace: refUtils.getRelative(workspaceRef)
			},
			limit: Infinity
		}, function(error, result) {
			if (error) {
				//log.error(error)
			}
			else {
				resolve(result)
			}
		});
	})
}
