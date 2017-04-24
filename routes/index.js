require('dotenv').config();
const express = require('express');
const spotify = require('../helpers/spotify');
const chalk = require('chalk');
const querystring = require('querystring');


module.exports.route = (app, state) => {

    app.get('/', (req, res) => {
        if (state.enabled) {
            res.send('JukeBot is Alive!!! Party on Wayne..');
        } else {
            res.send('JukeBot is Taking a nap');
        }
        
    });
    
}
