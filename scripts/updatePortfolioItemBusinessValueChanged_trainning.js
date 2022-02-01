const request = require("request");
const utils = require("../app/utils.js");
//const targetUrl = utils.getTargetUrl();

//const targetUrl ="https://o8fki03ts0.execute-api.us-east-1.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3" // AWS Cox environemnt
// const targetUrl = "https://2p316jv2tk.execute-api.us-east-2.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3"; // JCM  environment for testing
const targetUrl = "https://jdy3dk37sf.execute-api.us-east-1.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3"; // TEST environmnet



//const wh_ref = "84516def-eeab-4021-abee-98e49679cf98"; // This is the webhook _ref or ID for Rally Training environment
const wh_ref = "9ed1aea9-3c87-44f4-b45f-4bddcafc5d1d" //Portfolio Item Business Value Changed c_CAIBenefit

const webhookUrl = `https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/${wh_ref}`;

var options = {
	method: "PATCH",
	url: webhookUrl, // The URL for the Defect Closed Declined Change Webhook on Training environemnt
	headers: {
		"content-type": "application/json",
		cookie: `ZSESSIONID=${process.env.WEBHOOK_RALLY_API_KEY}`
	},
	body: {
		AppUrl: targetUrl,
		TargetUrl: targetUrl,
		Expressions: [{
			"AttributeID": "f7be48fa-c502-4f5c-a5d0-646a85a586f1", // C_CAIBenefit field must change: https://rally1.rallydev.com/slm/webservice/v2.0/attributedefinition/72c54fac-1164-4e2e-88d3-3442860c7c9e
			"Operator": "changed"
		},
		{
			"AttributeName": "Workspace",
			"Operator": "=",
			"Value": process.env.WEBHOOK_RALLY_WORKSPACE_UUID
		}
		],
		ObjectTypes: ["Feature", "Epic"], //Removed investment
		Disabled: false,
	},
	json: true
};

request(options, function (error, response, body) {
	if (error) throw new Error(error);
	console.log(`Updated webhook: ${body._ref} (${body.Name})`);
	var nyc = body;
	var propValue;
	for (var propName in nyc) {
		propValue = nyc[propName];

		console.log(propName, propValue);
	}
});
