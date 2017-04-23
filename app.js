require('dotenv').config();
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const querystring = require('querystring');

const spotify = require('./spotify');

const app = express();

let queue = [];
let pingSpotifyInterval = null;
let timeSinceLastTokenRefresh = 0;
let tokenTimeoutLimit = 60 * 30; // 30 minutes
let tokenIsValid = false;
let pingingCurrentPlayback = false;
let playingNextTrack = false;
let accessToken = null;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('JukeBot is Alive!!!');
});

app.get('/oauth', (res, req) => {
    if (!req.query.code) {
        res.status(500);
        res.send({ "error": "Looks like we're not getting code." });
        console.log("Looks like we're not getting code.");
    } else {
        request({
            url: 'https://slack.com/api/oauth.access', //URL to hit
            qs: {  //Query string data
                code: req.query.code,
                client_id: process.env.SLACK_CLIENT_ID,
                client_secret: process.env.SLACK_SECRET
            },
            method: 'GET', //Specify the method

        }, (err, resp, body) => {
            if (err) {
                console.log(err);
            } else {
                res.json(body);

            }
        })
    }
});

app.post('/jukebox', (req, res) => {

    let searchStr = req.body.text ? req.body.text : '';

    if (!(req.body.channel_name === 'jukebox' || req.body.channel_name === 'test')) {
        res.json({
            "text": "I _only_ take orders from *Channel: _jukebox_*... :deal_with_it:",
            "username": "JukeBot",
            "mrkdwn": true
        });
    } else if (searchStr === '') {
        res.json({
            "text": "*HELP:* Start by trying the following command `/jukebox dave matthews band` :notes::musical_note:",
            "username": "JukeBot",
            "mrkdwn": true
        });
    } else {
        spotify.search(querystring.stringify({
            type: 'track',
            q: searchStr,
            limit: 5
        }), (err, data) => {
            if (err) throw err;

            let searchData = JSON.parse(data);

            let tracks = null;
            if (searchData.tracks.items.length > 0) {
                tracks = [];

                for (let item of searchData.tracks.items) {
                    let track = {};

                    track.color = "#03c2fb";
                    track.callback_id = "Track_Search";
                    track.thumb_url = item.album.images[1].url;
                    track.title = item.name;

                    track.fields = [
                        {
                            title: "Album",
                            value: item.album.name,
                            short: true
                        },
                        {
                            title: "Artist",
                            value: item.artists[0].name,
                            short: true
                        }
                    ];

                    track.actions = [
                        {
                            "name": "AddToQueue",
                            "text": "Add to Queue",
                            "type": "button",
                            "value": JSON.stringify({
                                album_name: item.album.name,
                                album_url: item.album.images[1].url,
                                artist: item.artists[0].name,
                                track_uri: item.uri,
                                track_name: item.name
                            })
                        }
                    ]

                    tracks.push(track);
                }

                let attachment = {
                    color: "#03c2fb",
                    callback_id: "Dismiss",
                    actions: [
                        {
                            name: "dismiss",
                            text: "Dismiss",
                            type: "button",
                            value: ""
                        }
                    ]
                }

                tracks.push(attachment);

                res.json({
                    "text": "",
                    "username": "JukeBot",
                    "mrkdwn": true,
                    "attachments": tracks
                });
            } else {
                res.json({
                    "text": "I didn't find anything... :cry:",
                    "username": "JukeBot",
                    "mrkdwn": true
                });
            }

        });
    }
})

app.post('/interactions', (req, res) => {
    let payload = JSON.parse(req.body.payload);

    if (payload.token === process.env.SLACK_TOKEN) {
        let actions = payload.actions;

        switch (payload.callback_id) {
            case 'Track_Search':
                let track = payload.actions[0].value;
                track = JSON.parse(track);

                let user = payload.user;

                console.log(chalk.yellow('Queueing: ') + track.track_name + ' - ' + track.artist)
                queue.push(track);

                res.status(200).json({
                    text: ":white_check_mark: @" + user.name + " added _*" + track.track_name + "*_ to the play queue... :notes::musical_note:",
                    mrkdwn: true,
                    replace_original: true,
                    response_type: "in_channel",
                    attachments: [
                        {
                            color: "#01d509",
                            thumb_url: track.album_url,
                            fields: [
                                {
                                    title: "Album",
                                    value: track.album_name,
                                    short: true
                                },
                                {
                                    title: "Artist",
                                    value: track.artist,
                                    short: true
                                }
                            ]
                        }
                    ]
                });
                break;
            case 'Dismiss':
                 res.status(200).json({
                    delete_original: true
                 });
                break;
            default:
                break;
        }

    } else {
        res.status(403).end();
    }
});

app.listen(process.env.PORT, () => {
    console.log(chalk.green("Listening on Port: ") + process.env.PORT + chalk.green("..."));

    pingSpotifyInterval = setInterval(pingSpotify, 1000);
});

function pingSpotify() {

    if (timeSinceLastTokenRefresh >= tokenTimeoutLimit) tokenIsValid = false;

    if (tokenIsValid) {
        pingingCurrentPlayback = true;

        if (queue.length > 0) {
            spotify.getRemainingDuration(accessToken, (err, data) => {
                if (err) throw err;

                pingingCurrentPlayback = false;
                let remainingTime = data.item.duration_ms - (data.progress_ms === null ? 0 : data.progress_ms);

                if (remainingTime <= 1000 || !(data.is_playing)) {

                    let nextTrack = queue.shift();
                    playingNextTrack = true;

                    console.log(chalk.green('Playing: ') + nextTrack.track_name + ' - ' + nextTrack.artist)

                    if (nextTrack !== undefined) {
                        spotify.playTrack(nextTrack.track_uri, accessToken, (err, status) => {

                            if (err) throw err;

                            playingNextTrack = false;
                        });
                    }
                }
            });
        }
    } else if (!(tokenIsValid) && !(pingingCurrentPlayback) && !(playingNextTrack)) {

        spotify.getAccessToken((err, data) => {
            if (err) throw err;

            accessToken = data.access_token;

            console.log(chalk.cyan('\nAccess Token Refreshed: ') + accessToken + '\n');

            tokenIsValid = true;
            timeSinceLastTokenRefresh = 0;
        });

    }

    timeSinceLastTokenRefresh++;
}