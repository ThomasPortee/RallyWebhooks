/**
 * Update serverless.yml to contain the current package.json 'version' string as a dash delimited suffix
 * Example `cox-webhook-messenger-1-1-2'
 */
var YAML = require('yamljs');
var packageJson = require('../package.json');
var fs = require('fs');

var serverlessYml = YAML.load('./serverless.yml');

//console.log(serverlessYml.service);
serverlessYml.service = `cox-webhook-messenger-` + packageJson.version.replace(/\./g, '-')
//console.log(serverlessYml.service);
var serverlessYmlString = YAML.stringify(serverlessYml, 4);

var fd = fs.openSync('./serverless.yml', 'w');
fs.writeSync(fd, serverlessYmlString);
fs.close(fd);
