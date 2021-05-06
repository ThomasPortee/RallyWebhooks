const request = require("request");
const utils = require("../app/utils.js");
//const targetUrl = utils.getTargetUrl();

//const targetUrl ="https://o8fki03ts0.execute-api.us-east-1.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3"
//const targetUrl ="https://hvvka74ls2.execute-api.us-east-2.amazonaws.com/dev/defect_close_declined_change_rule"
const targetUrl =
  "https://2p316jv2tk.execute-api.us-east-2.amazonaws.com/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3";

var options = {
  method: "PATCH",
  url:
    "https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/73fa2964-2e9c-4daa-8b83-842d4f0e425c",
  headers: {
    "content-type": "application/json",
    cookie: `ZSESSIONID=${process.env.WEBHOOK_RALLY_API_KEY}`,
  },
  body: {
    TargetUrl: targetUrl,
    Expressions: [
      {
        AttributeName: "State",
        Operator: "=",
        Value: "Closed Declined",
      },
      {
        AttributeName: "Workspace",
        Operator: "=",
        Value: process.env.WEBHOOK_RALLY_WORKSPACE_UUID,
      }
    ],
  },
  json: true,
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  //console.log(`Created webhook: ${body._ref} (${body.Name})`);
  var nyc = body;
  var propValue;
  for (var propName in nyc) {
    propValue = nyc[propName];

    //console.log(propName, propValue);
  }
});
