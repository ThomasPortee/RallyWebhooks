/**
 * Given a list of Portfolio Item attribute Display Names for SNOW fields, create webhook listeners.
 */

var attributes = [{
    name: 'Send to SNOW Indicator (DSE ONLY)',
    elementName: 'c_SendtoSNOWIndicatorDSEONLY'
  },
  {
    name: "SNOW Status (Don't Touch – Admin ONLY)",
    elementName: 'c_SNOWStatusDontTouchAdminONLY'
  }
];

const utils = require("../app/utils.js");
const request = require("request");
const uuidUtils = require('@agile-central-technical-services/utils-attribute-uuid');
const targetUrl = utils.getTargetUrl();

attributes.forEach((attribute) => {
  return uuidUtils.attributeNameToUUID(
      process.env.WEBHOOK_RALLY_API_KEY,
      process.env.WEBHOOK_RALLY_WORKSPACE_UUID,
      'PortfolioItem',
      attribute.name)
    .then((uuid) => {
      return createWebhook(attribute.elementName, uuid)
    });
});

function createWebhook(elementName, attributeUUID) {
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
      "Name": `Update New Portfolio Item ${elementName}`,
      "CreatedBy": utils.getAppId(),
      "TargetUrl": targetUrl,
      "ObjectTypes": ["Feature", "Epic", "Investment", "BusinessInitiative"],
      "Expressions": [{
          // AttributeName not accepted by API
          "AttributeID": attributeUUID,
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

}
