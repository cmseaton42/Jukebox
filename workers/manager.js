const watchCurrentlyPlaying = require('./watch-currently-playing');
const refreshAccessToken = require('./refresh-access-token');

module.exports = (state) => {

    watchCurrentlyPlaying.initialize(state);
    refreshAccessToken.initialize(state);

}