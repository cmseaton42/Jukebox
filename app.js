require('dotenv').config();
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const chalk = require('chalk');

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

app.get('/jukebox', (req, res) => {
    res.json({
        "text": "*bold* `code` _italic_ ~strike~",
        "username": "JukeBot",
        "mrkdwn": true
    })
})



app.listen(process.env.PORT, () => {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Listening on Port: " + process.env.PORT + "...");
});