require('dotenv').config();
const spotify = require('../helpers/spotify');
const chalk = require('chalk');
const querystring = require('querystring');
const player = require('./player');


module.exports.initialize = (state) => {

    spotify.getAccessToken((err, data) => {
        if (err) throw err;

        state.refreshingToken = false;
        state.accessToken = data.access_token;

        console.log(chalk.cyan('\nAccess Token Retrieved: ') + data.access_token.substr(0, 60) + '...\n');

        player.initialize(state);

        state.tokenManager = setInterval(() => {
            state.accessToken = null;
            state.refreshingToken = true;

            if (state.player) {
                clearInterval(state.player);
                state.player = false;
            }

            let temp = setTimeout(() => {
                spotify.getAccessToken((err, data) => {
                    if (err) throw err;

                    state.refreshingToken = false;
                    state.accessToken = data.access_token;

                    console.log(chalk.cyan('\nAccess Token Refreshed: ') + data.access_token.substr(0, 60) + '...\n');

                    player.initialize(state);
                });
            }, 1500);

        }, state.tokenTimeoutLimit);

    });






}