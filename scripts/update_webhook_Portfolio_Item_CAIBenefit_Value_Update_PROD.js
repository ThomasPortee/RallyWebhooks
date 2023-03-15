const request = require("request");
const utils = require("../app/utils.js");
const targetUrl = utils.getTargetUrl();

//const targetUrl ="https://o8fki03ts0.execute-api.us-east-1.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3" // AWS Cox environemnt
//const targetUrl = "https://pmgy8b70wb.execute-api.us-east-1.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3"; // JCM  environment for testing

// NGROK target for testing
//const targetUrl = "https://5cb4-2806-2f0-92e4-9cd5-9e70-54de-4951-f0d9.ngrok.io/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3";

// webhook url for TRAINNING
//https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/18e9b41c-5b37-41ff-b09a-b8471f8634eb
const wh_ref = "18e9b41c-5b37-41ff-b09a-b8471f8634eb";
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
        ObjectTypes: ["Feature", "Epic"],
        Expressions: [
            {
                "AttributeID": "f7be48fa-c502-4f5c-a5d0-646a85a586f1",
                //"AttributeName": "c_CAIBenefit",
                "Operator": "changed",
                //"Value": null
            },
            {
                "AttributeName": "Workspace",
                "Operator": "=",
                "Value": process.env.WEBHOOK_RALLY_WORKSPACE_UUID
            }
        ],
        Name: "Portfolio Item CAIBenefit Updated", // previous name "Update New Portfolio Item Business Value"
        AppUrl: targetUrl,
        TargetUrl: targetUrl
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
