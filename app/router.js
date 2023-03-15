const handler = require('./common/message_handler');
const rules_config = require('./common/rules_config');
const foreach = require('lodash.foreach');
const utils = require('./utils');

var log = require('log4js').getLogger("router");

module.exports.processMessage = (payload) => {
	// message is the payload from Rally already objectified

	// Transform so that the field values are in a hash with a key that is the field name
	// instead of the field's UUID


	const message = payload.message

	// Get all the rules that applies to this payload
	const result = rules_config.getRules(payload)
		.then(async (rules) => {
			if (rules && rules.length == 0) {
				log.info('Rules does not match or enabled')
				return;
			}

			//Check if the rule applies to a specific set of projects. 

			let ruleResults = []
			message.changesByField = handler.transformFields(message.changes)
			message.stateByField = handler.transformFields(message.state)



			var rule_to_delay = [
				'Portfolio Item CAIBenefit Updated',
				'Portfolio Item CAIBenefit New',
				'Portfolio Item InvestmentCategory Updated',
				'Portfolio Item InvestmentCategory New'
			]

			for (var i in rules) {
				let rule = require(rules[i].Path)

				if (!rule.doesRuleApply(message)) {
					log.warn("Rule does not apply")
					continue;
				}

				/*
				if (rule_to_delay.includes(rules[i].Name)) {
					var result = await rule.run(message)
					log.debug("Rule result: " + JSON.stringify(result))
					return result;
				}*/


				ruleResults.push(rule.run(message));


				return Promise.all(ruleResults)
					.then((values) => {
						foreach(values, value => {
							log.info('result', value);
						});
					})
					.catch((error) => {
						log.error(error.message, error.stack)
					});


			}
		})

	return result;
}
