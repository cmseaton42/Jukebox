require('dotenv').config();
const request = require('request');


SEARCH_ENDPOINT = '/v1/search?'

module.exports.search = (searchString, callback) => {

  let options = {
    url: process.env.SPOTIFY_URI + SEARCH_ENDPOINT + searchString,
    Authorization: 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_SECRET).toString('base64'))
  }

  request.get(options, (err, response, body) => {

    if (err) {
      callback(err, null);
    } else if (response.statusCode !== 200) {
      callback({
        status: response.statusCode,
        message: 'Request Rejected'
      }, null);
    } else {
      callback(null, body);
    }
  });
}