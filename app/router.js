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

			var delayExecuted = false;

			//random integer
			var msTimeout = parseInt(process.env.MSTIMEOUT)
			var random_wait = utils.randomBetween(150, msTimeout)

			var rule_to_delay = [
				'Portfolio Item CAIBenefit Updated',
				'Portfolio Item CAIBenefit New',
				'Portfolio Item InvestmentCategory Updated',
				'Portfolio Item InvestmentCategory New',
				'Strategy Value Changed Rule'
			]

			for (var i in rules) {
				let rule = require(rules[i].Path)

				if (!rule.doesRuleApply(message)) {
					log.warn("Rule does not apply")
					return;
				}

				/*
				if (rule_to_delay.includes(rules[i].Name) && !delayExecuted) {
					log.info("Delaying execution of rule: " + rules[i].Name)
					delayExecuted = true;
					return setTimeout(function () {
						return rule.run(message);
					}, random_wait);

					return
				}
				*/

				var result = await rule.run(message)
				log.debug("Rule result: " + result)




				/*ruleResults.
					push(await rule.run(message));*/
				/*
				else {
					if (
						// if rule name is in the list of rules to delay
						rules[i].Name.indexOf(rule_to_delay) > -1
						&& delayExecuted === false) {

						var waitTill = new Date(new Date().getTime() + randomWait);
						//var waitTill = new Date(new Date().getTime() + 5 * 100); //There was a 5 second delay to not overlap the calls.
						while (waitTill > new Date()) {
							ruleResults.push(rule.run(message));
						}
						delayExecuted = true;
						return;
					}

					ruleResults.push(rule.run(message));
				}*/

			}

			//return await Promise.all(await ruleResults);

			/*
			return await Promise.all(ruleResults.map(async (value) => {
				// try catch to handle errors in the rule
				try {
					log.info('result', value);
					return await value;
				} catch (err) {
					log.error('Error in rule', err.message, err.stack);
					return err;
				}
			}));
			*/

			/*.then((values) => {
					foreach(values, value => {
						log.info('result', value);
					});
				})
				.catch((error) => {
					log.error(error.message, error.stack)
				});*/
		})

	return result;
}
