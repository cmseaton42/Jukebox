const player = require('./player');
const refreshAccessToken = require('./refresh-access-token');

module.exports = (state) => {

    refreshAccessToken.initialize(state);

}