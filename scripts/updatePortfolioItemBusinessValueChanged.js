const request = require("request");
const utils = require("../app/utils.js");
//const targetUrl = utils.getTargetUrl();

//const targetUrl ="https://o8fki03ts0.execute-api.us-east-1.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3" // AWS Cox environemnt
// const targetUrl = "https://2p316jv2tk.execute-api.us-east-2.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3"; // JCM  environment for testing
const targetUrl = "https://jdy3dk37sf.execute-api.us-east-1.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3";



//const wh_ref = "84516def-eeab-4021-abee-98e49679cf98"; // This is the webhook _ref or ID for Rally Training environment
const wh_ref = "bcfcba77-3e32-4d28-9670-3f53027a74a6" //Portfolio Item Investment Category Changed

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
		ObjectTypes: ["Feature", "Epic", "Investment"], //Removed investment
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
