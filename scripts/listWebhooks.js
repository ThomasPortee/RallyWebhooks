const fetch = require('node-fetch-json');
const bluebird = require('bluebird');
const qs = require('qs');
const utils = require("../app/utils.js");

const query = {
    pagesize: 1,
    start: 1,
    order: "Name"
};

function queryWebhooks(query) {
    //console.log(query)
    const webhookUrl = `https://rally1.rallydev.com/apps/pigeon/api/v2/webhook?${qs.stringify(query)}`;



    return fetch(webhookUrl, {
        headers: {
            cookie: `ZSESSIONID=${process.env.RALLY_API_KEY}`,
            ZSESSIONID: process.env.RALLY_API_KEY
        },
        method: 'GET'
    });
}

function handleGetWebhooks(response) {
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

return queryWebhooks()
    .then(handleGetWebhooks)
    .then(() => {
        console.log("Done");
    });
