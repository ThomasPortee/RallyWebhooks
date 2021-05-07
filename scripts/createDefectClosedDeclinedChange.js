const request = require("request");
const utils = require("../app/utils.js");
const targetUrl = utils.getTargetUrl();
var options = {
  method: "POST",
  url: "https://rally1.rallydev.com/apps/pigeon/api/v2/webhook",
  headers: {
    "content-type": "application/json",
    cookie: `ZSESSIONID=${process.env.WEBHOOK_RALLY_API_KEY}`,
  },
  body: {
    AppName: "Reflector",
    AppUrl: targetUrl,
    // TODO Constant for the name
    Name: "Defects Change Closed Declined",
    CreatedBy: utils.getAppId(),
    TargetUrl: targetUrl,
    ObjectTypes: ["Defect"],
    Expressions: [
      {
        AttibuteID: "e0caf6dd-304b-447e-9d61-09ac9c96e85a",
        AttributeName: "State", // Business Value - For prod use 4283471c-75a8-43f6-9a09-e3e0bb45bb02
        Operator: "=",
        Value: "Closed Declined",
      },
      {
        AttributeName: "Workspace",
        Operator: "=",
        Value: process.env.WEBHOOK_RALLY_WORKSPACE_UUID,
      },
    ],
  },
  json: true,
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  console.log(`Created webhook: ${body._ref} (${body.Name})`);
  var nyc = body;
  var propValue;
  for (var propName in nyc) {
    propValue = nyc[propName];

    console.log(propName, propValue);
  }
});
