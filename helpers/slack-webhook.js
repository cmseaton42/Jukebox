require('dotenv').config();
const request = require('request');

WEBHOOK_URI = process.env.SLACK_WEBHOOK_URI;

module.exports.postToChannel = (message, callback) => {

    let options = {
        url: WEBHOOK_URI,
        headers: { 'Content-type': 'application/json' },
        json: message
    };

    request.post(options, (err, response, body) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, response);
        }
    });

}