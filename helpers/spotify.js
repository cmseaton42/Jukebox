require('dotenv').config();
const request = require('request');


SEARCH_ENDPOINT = '/v1/search?';
CURRENTLY_PLAYING_ENDPOINT = '/v1/me/player/currently-playing';
PLAY_SONG_ENDPOINT = '/v1/me/player/play';
REFRESH_ACCESS_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

module.exports.search = (searchString, callback) => {

  let options = {
    url: process.env.SPOTIFY_URI + SEARCH_ENDPOINT + searchString,
    Authorization: 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_SECRET).toString('base64'))
  }

  request.get(options, (err, response, body) => {

    if (err) {
      callback(err, null);
    } else if (response.statusCode !== 200) {
      callback(new Error(response.statusCode + ': Search Failed'), null);
    } else {
      callback(null, JSON.parse(body));
    }
  });
}

module.exports.getAccessToken = (callback) => {

  // requesting access token from refresh token
  let refresh_token = process.env.SPOTIFY_USER_REFRESH_TOKEN;

  let authOptions = {
    url: REFRESH_ACCESS_TOKEN_ENDPOINT,
    headers: { 'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_SECRET).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let access_token = body.access_token;

      callback(null, { access_token })

    } else {
      if (error) {
        callback(error, null);
      } else {
        callback(new Error(response.statusCode + ': Failed to retrieve new Access Token.'), null);
      }
    }
  });
};

module.exports.getRemainingDuration = (accessToken, callback) => {

  let options = {
    url: process.env.SPOTIFY_URI + CURRENTLY_PLAYING_ENDPOINT,
    headers: { 'Authorization': 'Bearer ' + accessToken },
  }

  request.get(options, (err, response, body) => {

    if (err) {
      callback(err, null);
    } else {
      callback(null, response, JSON.parse(body));
    }
  });
};

module.exports.playTrack = (trackURI, accessToken, callback) => {

  let options = {
    url: process.env.SPOTIFY_URI + PLAY_SONG_ENDPOINT,
    headers: { 'Authorization': 'Bearer ' + accessToken },
    json: {
      uris: [
        trackURI
      ]
    }
  };

  request.put(options, (err, response, body) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, response);
    }
  });
}