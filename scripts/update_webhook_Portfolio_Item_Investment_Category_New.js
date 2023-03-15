const request = require("request");
const utils = require("../app/utils.js");
const targetUrl = utils.getTargetUrl();

//const targetUrl ="https://o8fki03ts0.execute-api.us-east-1.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3" 
// AWS Cox  dev environemnt
//const targetUrl = "https://pmgy8b70wb.execute-api.us-east-1.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3"; // JCM  environment for testing

// NGROK target for testing
//const targetUrl = "https://5cb4-2806-2f0-92e4-9cd5-9e70-54de-4951-f0d9.ngrok.io/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3";

// webhook url for TRAINNING
//https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/8071d783-2f50-45e7-b460-5a3098f0e9c3"
const wh_ref = "8071d783-2f50-45e7-b460-5a3098f0e9c3";
// This is the webhook _ref or ID for Webhoh Portfolio Investment Category change

const webhookUrl = `https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/${wh_ref}`;

var options = {
    method: "PATCH",
    url: webhookUrl, // The URL for the Defect Closed Declined Change Webhook on Training environemnt
    headers: {
        "content-type": "application/json",
        cookie: `ZSESSIONID=${process.env.WEBHOOK_RALLY_API_KEY}`
    },
    body: {
        "Expressions": [
            {
                "AttributeID": "5736cb0d-4ef8-4e83-a086-cb11e9a705e2", // Investment category
                //"AttributeName": null,
                "Operator": "has",
                //"Value": null
            },
            /*
            {
                //"AttributeID": "5f5b1fb22-6c15-44b5-a592-19189fafe5f2", // Version ID must be equal to 2
                "AttributeName": "VersionId",
                "Operator": "<=",
                "Value": 2
            },
            */

            {
                "AttributeID": null,
                "AttributeName": "Workspace",
                "Operator": "=",
                "Value": "8fe6f2f2-7a83-43f6-ac30-29cef4f8f1b2"
            }
        ],
        AppUrl: targetUrl,
        TargetUrl: targetUrl,
        Name: "Portfolio Item InvestmentCategory New", // previous name "Update New Portfolio Item Business Value"
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
