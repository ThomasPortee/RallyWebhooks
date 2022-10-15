const fetch = require('node-fetch-json');

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


    filtered_results.forEach(async (item) => {
        console.log(`${item._ref} | ${item.Name}`);
    });


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