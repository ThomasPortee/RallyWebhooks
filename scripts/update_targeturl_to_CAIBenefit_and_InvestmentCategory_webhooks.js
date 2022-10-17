const fetch = require('node-fetch-json');

const qs = require('qs');
const utils = require("../app/utils.js");
const targetUrl = utils.getTargetUrl();


const query = {
    pagesize: 200,
    start: 1,
    order: "Name"
};


const changeTargetURL = async (id) => {
    const webhookUrl = `https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/${id}`;
    return await fetch(webhookUrl, {
        headers: {
            cookie: `ZSESSIONID=${process.env.RALLY_API_KEY}`
        },
        body: {
            "AppUrl": targetUrl,
            "TargetUrl": targetUrl
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
        "2e1492a1-0252-494a-83d0-df85e8b0edf6": "Portfolio Item CAIBenefit New",
        "9ed1aea9-3c87-44f4-b45f-4bddcafc5d1d": "Portfolio Item CAIBenefit Updated",
        "b215a6f5-e572-4d4c-8e85-08c39b908c15": "Portfolio Item InvestmentCategory Updated",
        "8071d783-2f50-45e7-b460-5a3098f0e9c3": "Portfolio Item InvestmentCategory New"
    }

    // for each new_name
    for (const [key, value] of Object.entries(new_names)) {
        //display key and value
        console.log(`${key}: ${value}`);
        // change the target url
        try {
            const response = await changeTargetURL(key);
            console.log(response);
        } catch (err) {
            console.log(err);
        }

    }
})();