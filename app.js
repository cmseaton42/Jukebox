require('dotenv').config();
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const querystring = require('querystring');
const router = require('./routes/router');
const manager = require('./workers/manager');

const spotify = require('./helpers/spotify');

const app = express();
let state = {
    queue: [],
    player: false,
    tokenManager: false,
    tokenTimeoutLimit: 1000 * 60 * 45, // 30 minutes in ms
    pollingRate: 1000, // ms
    pingingCurrentPlayback: false,
    playingNextTrack: false,
    refreshingToken: false,
    accessToken: null
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router(app, state);

app.listen(process.env.PORT, () => {
    console.log(chalk.green("Listening on Port: ") + process.env.PORT + chalk.green("..."));

    manager(state);
});
