
# How to find the ID of a field?

This example is for getting the c_Strategy field from PortfolioItem/Investment.

For PortfolioItem/Investment, locate the ID ath the end of the request on the Rally App in this case: 
Portfolio > Portfolio Items 

For this example we will use this URL:
`https://rally1.rallydev.com/#/367462670832d/portfolioitemstreegrid?detail=%2Fportfolioitem%2Finvestment%2F601152697484`

The ID we need is the: **601152697484**

We need to find out the the Attribute elements this object for that we need to access the URL:
`https://rally1.rallydev.com/slm/webservice/v2.0/portfolioitem/investment/601152697484`

For the Portfolio Item we should look for PortfolioItemType to get the *Type Definition*, we get the following link:

`https://rally1.rallydev.com/slm/webservice/v2.0/PortfolioItem/Investment/601152697484/Investments`

Then we have to look for the _Attributes_ definiton, this is in:

`https://rally1.rallydev.com/slm/webservice/v2.0/TypeDefinition/73208213512/Attributes`

**NOTE:** _If we click the link directly the attributes will have a maximum of 20 attributes to show, to the last link we need to add:_

`?query=&fetch=true&start=1&pagesize=2000` at the end of the URL. 

After that we are going to be able all of the attributes, we will need to find the attribute, in this case c_Strategy, and get the **_refObjectUUID**

## Steps to publish
1. `npm run package` - This will create a zip file
2. `npm run push` - This will push the new code as a zip file to an S3 bucket
3. Access AWS:
  * Access the lambda
  * Update the code with the s3 URL
  * Validate
4. `node ./scripts/{name of the new webhook}` - to deploy the new webhook



### 2022-01-11
any investemnt should have Investment category should be the same
feature should match 

### URLS

This URL brings all of the attributes of an item in this case an Investment: [https://rally1.rallydev.com/slm/webservice/v2.0/portfolioitem/investment/601152697484](https://rally1.rallydev.com/slm/webservice/v2.0/portfolioitem/investment/601152697484)
This can privide the UUID of an specific attribute : [https://rally1.rallydev.com/slm/webservice/v2.0/TypeDefinition/73208213512/Attributes?query=&fetch=true&start=1&pagesize=2000](https://rally1.rallydev.com/slm/webservice/v2.0/TypeDefinition/73208213512/Attributes?query=&fetch=true&start=1&pagesize=2000)
Detail of CAI Benefit attribute: [https://rally1.rallydev.com/slm/webservice/v2.0/attributedefinition/72c54fac-1164-4e2e-88d3-3442860c7c9e](https://rally1.rallydev.com/slm/webservice/v2.0/attributedefinition/72c54fac-1164-4e2e-88d3-3442860c7c9e)
Production: Portfolio Item Business Value Changed: [https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/84516def-eeab-4021-abee-98e49679cf98](https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/84516def-eeab-4021-abee-98e49679cf98)
Trainning:  Portfolio Item Business Value Changed: [https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/9ed1aea9-3c87-44f4-b45f-4bddcafc5d1d](https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/9ed1aea9-3c87-44f4-b45f-4bddcafc5d1d)
API Webservice: [https://rally1.rallydev.com/slm/doc/webservice/](https://rally1.rallydev.com/slm/doc/webservice/)


I'm analyzing: https://rally1.rallydev.com/slm/webservice/v2.0/portfolioitem/epic/183271785068
I made the change: CAI BENEFIT added [Client-specific Requests] on 	01/28/2022 12:47 PM EST

I have disabled in trainning https://rally1.rallydev.com/apps/pigeon/api/v2/webhook/8071d783-2f50-45e7-b460-5a3098f0e9c3 Update New Portfolio Item Investment Category
it triggers on nay change because of this:
    {
      "AttributeID": "5736cb0d-4ef8-4e83-a086-cb11e9a705e2", // Investment category
      "AttributeName": null,
      "Operator": "has",
      "Value": null
    }, 
    So it has thtat attribute, but maybe we need to change it to on change or somehting similar.

### 2022-01-31. Test for CAI Benefit:

#### Working:
1. Changing the field on the child DOES trigger the webhook to force agreement (both webhooks).
2. Changing the values on the Parent DOES trigger the webhook to change the children (both webhooks).
3. Setting the CAI Benefit on child Feature whose Epic has no CAI Benefit does trigger the webhook to change the child - this is working as expected

#### In progress:
1. Creating a new Feature on an Epic is NOT triggering the webhook for New Portfolio Items for Investment Category // done --check strategy creation.
2. Setting the Investment Category on child Feature whose Epic has no Investment Category does not trigger the webhook to change the child - this is working as expected // done
2. Moving a Feature from one Epic to another with different CAI Benefit and Investment Category does NOT trigger the webhook to update the children.
4. Creating a Feature under an Epic with a CAI Benefit is NOT triggering the webhook for New Portfolio Item for CAI Benefit

#### Solutions:
1. Create a new webhook intended for Features that checks parent changes.


## Debuggin locally instructions

I added a debug configuration inside package.json, this configuration enables Serverless Offline in the local environment. I also added a "Launch Serverless Offline direct" configuration inside VS Code's launch.json, so it can be debugged with F5.
1. Start with VS Code with F5. This will enable Serverless Framework development environment and you will be able to access the POST and GET processes through http://localhost:3000 will display something similar to this:
`node ./node_modules/serverless/bin/serverless offline start --noTimeout dev

┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   POST |                                                                     │
│   http://localhost:3000/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3       │
│   POST | http://localhost:3000/2015-03-31/functions/app/invocations          │
│   GET  |                                                                     │
│   http://localhost:3000/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3       │
│   POST | http://localhost:3000/2015-03-31/functions/app/invocations          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
` 

2. Install and enable ngrok. This will make a tunnel to our local application.
2.1. Setup a new account at [ngrok](https://dashboard.ngrok.com/login), this is to generate a KEY API needed for creating the tunnel.
2.2. Install ngrok for you OS with the following instructions [https://dashboard.ngrok.com/get-started/setup](https://dashboard.ngrok.com/get-started/setup)
2.3. After you've setup your account, login and create an Authtoken and follow the instructions to set it up.
2.4. Open up an ngrok connection: `ngrok http 3000`
2.5. It will provide an URL that has to be set up as TargetURL in the training Reflector Webhook. i.e:`https://1da2-187-189-214-70.ngrok.io`  and you would have to set up your target URL as:`https://1da2-187-189-214-70.ngrok.io/dev/3277c954-e5fb-11e7-80c1-9a914cz093ae/1.1.3` 

3. Try it with a GET to the URL. It will return a _Thanks for visiting_ web page
4. 


### Look for Attribute Definition by ID:
https://rally1.rallydev.com/slm/webservice/v2.0/attributedefinition/f7be48fa-c502-4f5c-a5d0-646a85a586f1

