const utils = require("../app/utils.js");
const request = require("request");
const targetUrl = utils.getTargetUrl();
var options = {
  "method": "POST",
  "url": "https://rally1.rallydev.com/apps/pigeon/api/v2/webhook",
  "headers": {
    "content-type": "application/json",
    "cookie": `ZSESSIONID=${process.env.WEBHOOK_RALLY_API_KEY}`
  },
  "body": {
    "AppName": "Reflector",
    "AppUrl": targetUrl,
    // TODO Constant for the name
    "Name": "Portfolio Item CAIBenefit Updated",
    "CreatedBy": utils.getAppId(),
    "TargetUrl": targetUrl,
    "ObjectTypes": ["Feature", "Epic", "Investment"],
    "Expressions": [{
      "AttributeID": "f7be48fa-c502-4f5c-a5d0-646a85a586f1", // c_CAIBenefit
      "Operator": "changed"
    },
    {
      "AttributeName": "Workspace",
      "Operator": "=",
      "Value": process.env.WEBHOOK_RALLY_WORKSPACE_UUID
    }
    ]
  },
  "json": true
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  console.log(`Created webhook: ${body._ref} (${body.Name})`);
});
