const index = require('./index');
const interactions = require('./interactions');
const jukebox = require('./jukebox');
const oauth = require('/oauth');

module.exports = (app, state) => {

    index.route(app, state); // Handles Landing Page for Jukebot
    interactions.route(app, state); // Handles Interactive Messaging Endpoint
    jukebox.route(app, state); // Handles the '/jukebox [song] - [artist]' slash command
    oauth.route(app, state); // Handles Slack OAuth [UNUSED]

};