const fetch = require('node-fetch-json');
//const bluebird = require('bluebird');
const qs = require('qs');
const utils = require("../app/utils.js");
const targetUrl = utils.getTargetUrl();

const request = require("request");

const query = {
    pagesize: 200,
    start: 1,
    order: "Name"
};

const queryWebhooks = async (query) => {
    const webhookUrl = `https://rally1.rallydev.com/apps/pigeon/api/v2/webhook?${qs.stringify(query)}`;
    return await fetch(webhookUrl, {
        headers: {
            cookie: `ZSESSIONID=${process.env.RALLY_API_KEY}`,
            ZSESSIONID: process.env.RALLY_API_KEY
        },
        method: 'GET'
    });
}

const handleGetWebhooks = async (response) => {
    var promise = Promise.resolve();
    const appId = utils.getAppId();

    response.Results.forEach((item) => {
        if (item.CreatedBy === appId) {

            let ws = item["Expressions"].filter(exp => exp["AttributeName"] == "Workspace")
                .map(ws => {
                    if (ws["Value"] == "8fe6f2f2-7a83-43f6-ac30-29cef4f8f1b2") {
                        return "Trainning"
                    }
                    return "Production"
                });

            console.log(`${item._ref} | ${item.Name}  <${ws[0]}>`);

        }
    });

    if ((response.StartIndex + response.PageSize) <= response.TotalResultCount) {
        var query = {
            pagesize: response.PageSize,
            start: response.StartIndex + response.PageSize,
            order: "Name"
        };
        promise = queryWebhooks(query).then(handleGetWebhooks);
    }

    return promise;
}

/*
return queryWebhooks()
    .then(handleGetWebhooks)
    .then(() => {
        console.log("Done");
    });
    */
const updateWebhook = async (uuid, targetURL, new_name) => {
    const webhookUrl = `https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/${uuid}`;

    // if new name contains "Update" then operator is "changed" else is "has"   
    const operator = new_name.includes("Updated") ? "changed" : "has";

    const options = {
        method: "PATCH",
        url: webhookUrl, // The URL for the Defect Closed Declined Change Webhook on Training environemnt
        headers: {
            cookie: `ZSESSIONID=${process.env.RALLY_API_KEY}`,
            ZSESSIONID: process.env.RALLY_API_KEY
        },
        body: {
            Expressions: [
                {
                    "AttributeID": "f7be48fa-c502-4f5c-a5d0-646a85a586f1",
                    "Operator": operator,
                },
                {
                    "AttributeName": "Workspace",
                    "Operator": "=",
                    "Value": "8fe6f2f2-7a83-43f6-ac30-29cef4f8f1b2"
                }
            ],
            Name: new_name,
            AppUrl: targetUrl,
            TargetUrl: targetURL
        },
        json: true
    }

    return await request(options, (err, res, body) => {
        if (err) throw new Error(err);
        if (res.statusCode != 200) {
            console.error(JSON.stringify(body['Errors']))
            throw new Error(`Error updating webhook ${uuid} - ${res.statusCode} - ${res.statusMessage}`);
        }
        console.log(`Updated ${body.Name} <${body.AppUrl}>`);
        console.log(JSON.stringify(body))
    });
}

(async () => {
    console.log("Fetching Trainnig Webhooks");
    const query = {
        order: "Name"
    };
    var wh = await queryWebhooks(query)
    var results = [...wh.Results]

    while (results.length < wh.TotalResultCount) {
        const query = {
            pagesize: 200,
            start: wh.PageSize + wh.StartIndex,
            order: "Name"
        };
        wh = await queryWebhooks(query)
        results.push(...wh.Results)
    }
    console.log(`Retrieved ${results.length} Webhooks`);

    // Filter by Workspace
    const workspaceId = process.env.WEBHOOK_RALLY_WORKSPACE_UUID;
    const targetURL = process.env.WEBHOOK_TARGET_URL;


    const filtered_results = results.filter(result => {
        return result.CreatedBy === utils.getAppId() && result.Expressions.filter(exp => exp.AttributeName == "Workspace").map(ws => ws.Value).includes(workspaceId)
    })

    webhooks_to_update = ['Portfolio Item Business Value Changed', 'Update New Portfolio Item Business Value']

    new_names = {
        "Portfolio Item Business Value Changed": " Portfolio Item CAIBenefit Updated Value",
        "Update New Portfolio Item Business Value": "Portfolio Item CAIBenefit New Value"
    }

    filtered_results.forEach(async (item) => {
        // if item.Name is in webhooks_to_update
        if (webhooks_to_update.includes(item.Name)) {
            console.log(`Updating ${item.ObjectUUID} || ${item.Name} Webhook`);
            // send request to update
            await updateWebhook(item.ObjectUUID, targetURL, new_names[item.Name]);
        }

        //console.log(`${item._ref} | ${item.Name}`);
    });
    //console.log(JSON.stringify(filtered_results))


})();


/* Steps

https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/9ed1aea9-3c87-44f4-b45f-4bddcafc5d1d 

# Change Name
Portfolio Item Business Value Changed -> Portfolio Item CAIBenefit Updated Value

https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/2e1492a1-0252-494a-83d0-df85e8b0edf6 

# Change Name
Update New Portfolio Item Business Value -> Portfolio Item CAIBenefit New Value


# Update Target URL to targetUrl

*/