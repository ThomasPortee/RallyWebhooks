const handler = require('./common/message_handler');
const rules_config = require('./common/rules_config');
const foreach = require('lodash.foreach');

var log = require('log4js').getLogger("router");

module.exports.processMessage = (payload) => {
	// message is the payload from Rally already objectified

	// Transform so that the field values are in a hash with a key that is the field name
	// instead of the field's UUID


	const message = payload.message

	// Get all the rules that applies to this payload
	const result = rules_config.getRules(payload)
		.then((rules) => {
			if (rules && rules.length == 0) {
				log.info('Rules does not match or enabled')
				return;
			}

			//Check if the rule applies to a specific set of projects. 

			let ruleResults = []
			message.changesByField = handler.transformFields(message.changes)
			message.stateByField = handler.transformFields(message.state)

			var delayExecuted = false;

			for (var i in rules) {
				let rule = require(rules[i].Path)

				if (!rule.doesRuleApply(message)) {
					log.info("Rule does not apply")
				}
				else {
					if ((rules[i].Name === 'Business Value Changed Rule' ||
						rules[i].Name === 'Update New Portfolio Item Investment Category Rule' ||
						rules[i].Name === 'Investment Category Changed Rule' ||
						rules[i].Name === 'Strategy Value Changed Rule'
					) && delayExecuted === false) {
						var msTimeout = parseInt(process.env.MSTIMEOUT)
						var waitTill = new Date(new Date().getTime() + msTimeout);
						//var waitTill = new Date(new Date().getTime() + 5 * 100); //There was a 5 second delay to not overlap the calls.
						while (waitTill > new Date()) { }
						delayExecuted = true;
					}

					ruleResults.push(rule.run(message));
				}
			}

			return Promise.all(ruleResults)
				.then((values) => {
					foreach(values, value => {
						log.info('result', value);
					});
				})
				.catch((error) => {
					log.error(error.message, error.stack)
				});
		})

	return result;
}
