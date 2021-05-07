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
    console.log(webhookUrl)
   
    return fetch(webhookUrl, {
        headers: {
            cookie: `ZSESSIONID=${process.env.RALLY_API_KEY}`,
            ZSESSIONID: process.env.RALLY_API_KEY
        },
        method: 'GET'
    });
}

function deleteWebhook(ref) {
    return fetch(ref, {
        headers: {
            cookie: `ZSESSIONID=${process.env.RALLY_API_KEY}`,
            ZSESSIONID: process.env.RALLY_API_KEY
        },
        method: 'DELETE'
    });
}

const itemsToDelete = [
    //'e0b41ef5-ce92-4ee5-94de-17e74d77dc0c'
    'Update New Portfolio Item Investment Strategy'
];

function handleGetWebhooks(response) {
    var promise = Promise.resolve();
    const appId = utils.getAppId();
    if (response.Results) {
        response.Results.forEach((item) => {
            if (item.CreatedBy === appId) {
                itemsToDelete.push(item);
            }
        });

        if ((response.StartIndex + response.PageSize) <= response.TotalResultCount) {
            var query = {
                pagesize: response.PageSize,
                start: response.StartIndex + response.PageSize
            };
            promise = queryWebhooks(query).then(handleGetWebhooks);
        }
        else {
            if (itemsToDelete.length) {
                console.log(`Deleting ${itemsToDelete.length} webhooks...`);
                promise = bluebird.map(itemsToDelete, (item) => {
                    console.log(`Deleting webhook: ${item._ref} (${item.Name})`);
                    return null;
                    //return deleteWebhook(item._ref);
                });
            }
            else {
                console.log(`No webhooks found for this app.`);
            }
        }
    }
    else {
        // No results
        promise = Promise.reject(response.message);
    }

    return promise;
}

return queryWebhooks()
    .then(handleGetWebhooks)
    .then(() => {
        console.log("Done");
    });
