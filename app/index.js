//require('./app/index');
const serverless = require('serverless-http');
process.title = process.argv[2];
const bodyParser = require('body-parser')
const express = require('express')
const router = require('./router')
const app_config = require('./config/app.json')
const utils = require('./utils.js');
const app = express()

// log4js Logger
const log4js = require('log4js');
log4js.configure('./app/config/log4js.json');

var log = log4js.getLogger('index');

const path = utils.getPath();
app.use(bodyParser.json());

app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));

app.get(path, (request, response) => {
	response.send("Thank you for visiting");
});

app.post(path, (request, response) => {
	// TODO (tj) How to repond immediately to webhook?
	//response.send("Thank you for visiting");

	let result;
	const payload = request.body;

	//log.info(JSON.stringify(payload))

	log.info('In catcher')

	//if webhook request is a delete (Recycled) operation, no action is required. 
	if (payload.message.subscription_id == process.env.RALLY_SUBSCRIPTION_ID && payload.message.action != "Recycled" && payload.message.action != "Deleted") {
		result = router.processMessage(payload)
	}
	else {
		log.error('Request from incorrect subscription and/or is a delete operation', payload.message.subscription_id, payload.message.action)
	}

	if (result) {
		return result.then(() => {
			response.send("Thank you for visiting");
		})
	}
	else {
		response.send("Thank you for visiting");
	}
})

if (process.env.SERVERLESS) {
	// Running as Serverless function
	module.exports.handler = serverless(app);
}
else {
	// Running as local service
	const port = process.env.PORT || 8080;
	const host = process.env.HOST || '0.0.0.0';
	app.listen(port, host, (err) => {
		if (err) {
			return log.error('error =>', err)
		}

		log.info(`server is listening on ${host}:${port}`)
	})
}
