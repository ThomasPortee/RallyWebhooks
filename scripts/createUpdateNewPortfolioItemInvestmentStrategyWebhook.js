const utils = require("../app/utils.js");
const request = require("request");
//const targetUrl = utils.getTargetUrl();
const targetUrl = "https://jdy3dk37sf.execute-api.us-east-1.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3";
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
    "Name": "Update New Portfolio Item Investment Strategy",
    "CreatedBy": utils.getAppId(),
    "TargetUrl": targetUrl,
    "ObjectTypes": ["Feature", "Epic", "Investment"],
    "Expressions": [{
      "AttributeID": "2fae400d-b1f8-4c9b-b304-c15f43016a65", // c_Strategy
        "Operator": "has"
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

request(options, function(error, response, body) {
  if (error) throw new Error(error);
  //console.log(`Created webhook: ${body._ref} (${body.Name})`);
});
