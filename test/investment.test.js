var assert = require('assert');

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

describe('Calls Rally API Investment I330', () => {
    describe(' Check Investment Category', () => {
        const response = restApi.query({
            ref: refUtils.getRelative(ref),
            fetch: ['PortfolioItemType', 'FormattedID', 'InvestmentCategory', 'c_CAIBenefit'],
            scope: {
                workspace: refUtils.getRelative(workspaceRef)
            },
            limit: Infinity
        });

        //console.log(response)

        it('must be named I330', async () => {

            let r = await response
            //console.log(r)
            assert.equal(r['FormattedID'], 'I330');
        })

        it('must be of portfolio type Investment', async () => {

            let r = await response
            //console.log(r)
            assert.equal(r['PortfolioItemType']['_refObjectName'], 'Investment');
        })

        it('must have Enhancements as Investment Category', async () => {
            let r = await response
            assert.equal(r['InvestmentCategory'], 'Enhancements');
        })
    })
})


describe("Creates a new Investment", () => {

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
