const player = require('./player');
const refreshAccessToken = require('./refresh-access-token');

module.exports = (state) => {

    player.initialize(state);
    refreshAccessToken.initialize(state);

}