const fetch = require('node-fetch-json');
const bluebird = require('bluebird');
const qs = require('qs');
const utils = require("../app/utils.js");

const query = {
    pagesize: 1,
    start: 1
};

function queryWebhooks(query) {
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
            //console.log(`${item._ref} (${item.Name})`);
        }
    });

    if ((response.StartIndex + response.PageSize) <= response.TotalResultCount) {
        var query = {
            pagesize: response.PageSize,
            start: response.StartIndex + response.PageSize
        };
        promise = queryWebhooks(query).then(handleGetWebhooks);
    }

    return promise;
}

return queryWebhooks()
    .then(handleGetWebhooks)
    .then(() => {
        //console.log("Done");
    });
