var assert = require('assert');

var global;

const rally = require('rally'),
    restApi = rally({
        apiKey: process.env.WEBHOOK_RALLY_API_KEY,
    }),
    refUtils = rally.util.ref;

// INVESTMENT I330
//https://rally1.rallydev.com/slm/webservice/v2.x/portfolioitem/investment/651165337617

//let workspaceId = get(message, ['stateByField', 'Workspace', 'value', 'detail_link'], "").split('/').pop();
const workspaceRef = `/workspace/73024765556`;
const ref = "https://rally1.rallydev.com/slm/webservice/v2.x/portfolioitem/investment/651165337617"


describe('Creates a New Orphaned Feature', () => {
    describe('Creates a feature with None CAIBenefit and None InvestmentCategory', () => {

        const now = new Date();
        const uniquenow = now.toISOString().replace("-", "").replace("-", "").replace(":", "").replace(":", "").replace(".", "").replace("Z", "");

        const response = restApi.create({
            type: 'portfolioitem/feature',
            data: {
                Name: `Test feature IC "None" and c_CAIBenefit Null ${uniquenow}`,
                InvestmentCategory: "None",
                c_CAIBenefit: null,
            },
            scope: {
                workspace: workspaceRef,
            }
        });

        //console.log(response);

        it('must be Orphaned feature', async () => {
            let r = await response
            //console.log(r['Object']['_ref'])
            const q = await restApi.get({
                ref: r['Object']['_ref'],
                fetch: ['Parent'],
                scope: {
                    workspace: workspaceRef,
                }
            })
            //console.log(q)
            assert.equal(q['Object']['Parent'], null);
        })

        it('must be have InvestmentCategory as None', async () => {
            let r = await response
            const q = await restApi.get({
                ref: r['Object']['_ref'],
                fetch: ['InvestmentCategory'],
                scope: {
                    workspace: workspaceRef,
                }
            })
            //console.log(q)
            assert.equal(q['Object']['InvestmentCategory'], 'None');
        })

        it('must be have c_CAIBenefit as NULL', async () => {
            let r = await response
            //console.log(r)
            const q = await restApi.get({
                ref: r['Object']['_ref'],
                fetch: ['c_CAIBenefit'],
                scope: {
                    workspace: workspaceRef,
                }
            })
            //console.log(q)
            assert.equal(q['Object']['c_CAIBenefit'], null);
        })

    })

    describe('Filled CAIBenefit and InvestmentCategory', () => {

        const now = new Date();
        const uniquenow = now.toISOString().replace("-", "").replace("-", "").replace(":", "").replace(":", "").replace(".", "").replace("Z", "");

        const response = restApi.create({
            type: 'portfolioitem/feature',
            data: {
                Name: `Test feature IC "KTLO" and c_CAIBenefit "Client-specific Requests" ${uniquenow}`,
                InvestmentCategory: "KTLO",
                c_CAIBenefit: "Client-specific Requests",
            },
            scope: {
                workspace: workspaceRef,
            }
        });

        //console.log(response);

        it('must be Orphaned feature', async () => {

            let r = await response
            console.log(r['Object']['_ref'])
            const wait = await setTimeout(() => {
                console.log("Now we call it")
            }, 2000);
            const q = await restApi.get({
                ref: r['Object']['_ref'],
                fetch: ['Parent'],
                scope: {
                    workspace: workspaceRef,
                }
            })
            //console.log(q)
            assert.equal(q['Object']['Parent'], null);
        })

        it('must be have InvestmentCategory as None', async () => {
            await setTimeout(async () => {
                let r = await response
                console.log(r['Object']['_ref'])
                const q = await restApi.get({
                    ref: r['Object']['_ref'],
                    fetch: ['InvestmentCategory'],
                    scope: {
                        workspace: workspaceRef,
                    }
                })
                console.log(`InvestmentCategory ${q['Object']['InvestmentCategory']}`)
                assert.equal(q['Object']['InvestmentCategory'], 'None');
            }, 2000);

        })

        it('must be have c_CAIBenefit as NULL', async () => {
            await setTimeout(async () => {
                let r = await response
                console.log(r['Object']['_ref'])
                const q = restApi.get({
                    ref: r['Object']['_ref'],
                    fetch: ['c_CAIBenefit'],
                    scope: {
                        workspace: workspaceRef,
                    }
                })
                console.log(`CAI Benefit ${q['Object']['c_CAIBenefit']}`)
                assert.equal(q['Object']['c_CAIBenefit'], null);
            }, 2000);

        })

    })
})

/******************
 *  TEST Suite.
 * 
 * * Create an investment with Investment Category & NOT CAI Benefit:   IIC-nCAI
 * * Create an investment with CAIBenefit & NOT Investment Category:    ICAI-nIC
 * * Create an investment with Investment Category & CAIBenefit         IICCAI
 * * 
 * 
 * 
 * 
 */
