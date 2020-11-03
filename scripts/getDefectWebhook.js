const fetch = require('node-fetch-json');
const bluebird = require('bluebird');
const qs = require('qs');
const utils = require("../app/utils.js");

const query = {
    pagesize: 1,
    start: 1
};
const whID="73fa2964-2e9c-4daa-8b83-842d4f0e425c"

const webhookUrl = `https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/${whID}`;

(async()=>{
    const response = await fetch(webhookUrl, {
        headers: {
            cookie: `ZSESSIONID=${process.env.RALLY_API_KEY}`,
            ZSESSIONID: process.env.RALLY_API_KEY
        },
        method: 'GET'
    })

    console.log(response)
})()