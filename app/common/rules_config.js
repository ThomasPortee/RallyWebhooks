const app_config = require('../config/app.json')
const rally_utils = require('../common/rally_utils')
var log = require('log4js').getLogger("rules_config")
var _ = require('lodash/core');

const getRules = (payload) => {

return new Promise((resolve, reject) => {

	let webhook_name = payload && payload.rule && payload.rule.Name || null 

	let project = payload && payload.message && payload.message.project && payload.message.project.name || null

	let project_uuid = payload && payload.message && payload.message.project && payload.message.project.uuid || null


	//log.debug('webhook_name', webhook_name, project)

	let promises = []

	if((app_config.webhook_requests[webhook_name] && app_config.webhook_requests[webhook_name].rules)){
		for ( i in app_config.webhook_requests[webhook_name].rules){
			let rule = app_config.webhook_requests[webhook_name].rules[i]
			let top_project_names = rule.Projects || []

			promises.push(rally_utils.projectIncluded(rule.Name, top_project_names, project_uuid))
		}
	}
	
	//log.info('promises',promises)

	Promise.all(promises)
			.then((results) => {
					let rules = []

					if((app_config.webhook_requests[webhook_name] && app_config.webhook_requests[webhook_name].rules)){
						for ( i in app_config.webhook_requests[webhook_name].rules){
							let rule = app_config.webhook_requests[webhook_name].rules[i]
							let valid = _.find(results, function(o) { return o[rule.Name]; });
							//log.info('results[rule.Name]',rule.Name, valid)
							if(!project){ // if project is null for some reason, add the rule if enabled.
								if(rule.Enabled) rules.push(rule)
							}else{
								if(valid){
									if(rule.Enabled) rules.push(rule)
								}
							}
						}
					}
					resolve(rules)
			})

	})
}

module.exports.getRules = getRules;