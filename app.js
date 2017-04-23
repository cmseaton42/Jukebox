require('dotenv').config();
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const querystring = require('querystring');
const router = require('./routes/router');

const spotify = require('./helpers/spotify');

const app = express();
let state = {
    queue: [],
    pingSpotifyInterval: null,
    timeSinceLastTokenRefresh: 0,
    tokenTimeoutLimit: 60 * 30 * 1000, // 30 minutes in ms
    tokenIsValid: false,
    pingingCurrentPlayback: false,
    playingNextTrack: false,
    accessToken: null
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router(app, state);

app.listen(process.env.PORT, () => {
    console.log(chalk.green("Listening on Port: ") + process.env.PORT + chalk.green("..."));

    pingSpotifyInterval = setInterval(pingSpotify, 1000);
});

function pingSpotify() {

    if (state.timeSinceLastTokenRefresh >= state.tokenTimeoutLimit) state.tokenIsValid = false;

    if (state.tokenIsValid) {
        state.pingingCurrentPlayback = true;

        if (state.queue.length > 0) {
            spotify.getRemainingDuration(state.accessToken, (err, data) => {
                if (err) throw err;

                state.pingingCurrentPlayback = false;
                let remainingTime = data.item.duration_ms - (data.progress_ms === null ? 0 : data.progress_ms);

                if (remainingTime <= 1000 || !(data.is_playing)) {

                    let nextTrack = state.queue.shift();
                    state.playingNextTrack = true;

                    console.log(chalk.green('Playing: ') + nextTrack.track_name + ' - ' + nextTrack.artist)

                    if (nextTrack !== undefined) {
                        spotify.playTrack(nextTrack.track_uri, state.accessToken, (err, status) => {

                            if (err) throw err;

                            state.playingNextTrack = false;
                        });
                    }
                }
            });
        }
    } else if (!(state.tokenIsValid) && !(state.pingingCurrentPlayback) && !(state.playingNextTrack)) {

        spotify.getAccessToken((err, data) => {
            if (err) throw err;

            state.accessToken = data.access_token;

            console.log(chalk.cyan('\nAccess Token Refreshed: ') + state.accessToken + '\n');

            state.tokenIsValid = true;
            state.timeSinceLastTokenRefresh = 0;
        });

    }

    state.timeSinceLastTokenRefresh++;
}