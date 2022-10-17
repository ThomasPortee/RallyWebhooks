var packageJson = require('../package.json');

module.exports.getAppId = function () {
    // Use the link to the version of this code on GitHub
    return "https://github.com/RallyTechServices/ac-integrations/releases/tag/v" + packageJson.version;
}

module.exports.getTargetUrl = function () {
    return `${process.env.WEBHOOK_TARGET_URL}`;
}

module.exports.getPath = function () {
    // Must match the paths used in serverless.yml events
    return `/${process.env.WEBHOOK_LISTENER_PATH}/${packageJson.version}`;
}


module.exports.randomBetween = (min, max) => {
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}