const request = require("request");
const utils = require("../app/utils.js");
//const targetUrl = utils.getTargetUrl();

const targetUrl = 'https://jdy3dk37sf.execute-api.us-east-1.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3' // this is the trainning target URL this point to AwsrallyNP lambda

var options = {
  "method": "PUT",
  "url": "https://rally1.rallydev.com/apps/pigeon/api/v2/webhook",
  "headers": {
    "content-type": "application/json",
    "cookie": `ZSESSIONID=${process.env.WEBHOOK_RALLY_API_KEY}`
  },
  "body": {
    "AppName": "Reflector",
    "AppUrl": targetUrl,
    // TODO Constant for the name
    "Name": "Portfolio Item Business Value Changed",
    "CreatedBy": utils.getAppId(),
    "TargetUrl": targetUrl,
    "ObjectTypes": ["Feature", "Epic"],
    "Expressions": [{
        "AttributeID": "f7be48fa-c502-4f5c-a5d0-646a85a586f1", // C_CAIBenefit field must change: https://rally1.rallydev.com/slm/webservice/v2.0/attributedefinition/72c54fac-1164-4e2e-88d3-3442860c7c9e
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
