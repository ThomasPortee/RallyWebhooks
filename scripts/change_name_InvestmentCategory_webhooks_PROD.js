const fetch = require('node-fetch-json');

const qs = require('qs');
const utils = require("../app/utils.js");
const targetUrl = utils.getTargetUrl();


const query = {
    pagesize: 200,
    start: 1,
    order: "Name"
};

const getCurrentName = async (id) => {
    const webhookUrl = `https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/${id}`;
    return await fetch(webhookUrl, {
        headers: {
            cookie: `ZSESSIONID=${process.env.RALLY_API_KEY}`
        },
        method: 'GET'
    });
}

const changeName = async (id, new_name) => {
    const webhookUrl = `https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/${id}`;
    return await fetch(webhookUrl, {
        headers: {
            cookie: `ZSESSIONID=${process.env.RALLY_API_KEY}`
        },
        body: {
            "Name": new_name
        },
        method: 'PATCH'
    });
}


(async () => {
    console.log("Fetching Trainnig Webhooks");

    /* PRODUCTION DO NOT CHANGE */

    /*
    const prod_names = {
        "84516def-eeab-4021-abee-98e49679cf98": "Portfolio Item CAIBenefit Updated", // Portfolio Item Business Value Changed<Production>
        "bcfcba77-3e32-4d28-9670-3f53027a74a6": "Portfolio Item InvestmentCategory Updated", //Portfolio Item Investment Category Changed  <Production>
        "abb2422c-b8d7-4cf3-882b-00138f8ce2c4": "Portfolio Item InvestmentCategory New" //Update New Portfolio Item Investment Category  <Production>
        // There is no  "Portfolio Item CAIBenefit New", in production
    }
    */


    const new_names = {
        "bcfcba77-3e32-4d28-9670-3f53027a74a6": "Portfolio Item InvestmentCategory Updated",
        "abb2422c-b8d7-4cf3-882b-00138f8ce2c4": "Portfolio Item InvestmentCategory New"
    }

    // for each new_name
    for (const [key, value] of Object.entries(new_names)) {
        //display key and value
        console.log(`${key}: ${value}`);
        //get current name  of webhook
        const current_name = await getCurrentName(key);
        console.log(`Current Name: ${current_name.Name} will change to ${value}`);
        const response = await changeName(key, value)
        console.log(`Response: ${JSON.stringify(response)}`);

    }
})();