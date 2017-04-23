require('dotenv').config();
const express = require('express');
const spotify = require('../helpers/spotify');
const chalk = require('chalk');
const querystring = require('querystring');


module.exports.route = (app, state) => {

    app.get('/oauth', (res, req) => {
        
        if (!req.query.code) {
            res.status(500);
            res.send({ error: 'Looks like we\'re not getting code.' });
            console.log('Looks like we\'re not getting code.');
        } else {
            let options = {
                url: 'https://slack.com/api/oauth.access', //URL to hit
                qs: {  //Query string data
                    code: req.query.code,
                    client_id: process.env.SLACK_CLIENT_ID,
                    client_secret: process.env.SLACK_SECRET
                },
                method: 'GET', //Specify the method
            }

            request(options, (err, resp, body) => {
                if (err) {
                    console.log(err);
                } else {
                    res.json(body);
                }
            })
        }
    });

}