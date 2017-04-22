require('dotenv').config();
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const querystring = require('querystring');

const spotify = require('./spotify');

const app = express();
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
            "text": "How Bout Some Dave????",
            "username": "JukeBot",
            "mrkdwn": true
        });
    } else {
        spotify.search(querystring.stringify({
            type: 'track',
            q: searchStr,
            limit: 3
        }), (err, data) => {
            if (err) throw err;

            let searchData = JSON.parse(data);

            let tracks = null;
            if (searchData.tracks.items.length > 0) {
                tracks = [];

                for (let item of searchData.tracks.items) {
                    let track = {};

                    track.color = "#269900";
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
                            "name": "search",
                            "text": "Add to Queue",
                            "type": "button",
                            "value": item.uri
                        }
                    ]

                    tracks.push(track);
                }

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



app.listen(process.env.PORT, () => {
    console.log("Listening on Port: " + process.env.PORT + "...");
});