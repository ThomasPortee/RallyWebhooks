const request = require("request");
const utils = require("../app/utils.js");
const targetUrl = utils.getTargetUrl();
var options = {
  "method": "POST",
  "url": "https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/73fa2964-2e9c-4daa-8b83-842d4f0e425c",
  "headers": {
    "content-type": "application/json",
    "cookie": `ZSESSIONID=${process.env.WEBHOOK_RALLY_API_KEY}`
  },
  "body": {
    "Expressions": [{
        "AttibuteID":"e0caf6dd-304b-447e-9d61-09ac9c96e85a",
        "AttributeName": "State", 
        "Operator": "=",
        "Value":"Closed Declined"
      },      -
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
  console.log(`Created webhook: ${body._ref} (${body.Name})`);
  var nyc = body;
  var propValue;
  for(var propName in nyc) {
    propValue = nyc[propName]

    console.log(propName,propValue);
}
});
