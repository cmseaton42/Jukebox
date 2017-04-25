require('dotenv').config();
const express = require('express');
const spotify = require('../helpers/spotify');
const manager = require('../workers/manager');
const chalk = require('chalk');
const querystring = require('querystring');


module.exports.route = (app, state) => {

    app.post('/jukebox', (req, res) => {

        let searchStr = req.body.text ? req.body.text : '';
        let user = req.body.user_name ? req.body.user_name : '';
        let admin = process.env.ADMIN;

        if (req.body.token === process.env.SLACK_TOKEN) {

            if (searchStr === '') {
                res.json({
                    text: '*HELP:* Start by trying the following command `/jukebox dave matthews band` :notes::musical_note:',
                    username: 'JukeBot',
                    mrkdwn: true
                });
            } else if (searchStr === '**DISABLE**' && state.enabled) {
                if (user === admin) {
                    state.queue = [];
                    state.enabled = false;
                    if (state.player) clearInterval(state.player);
                    if (state.tokenManager) clearInterval(state.tokenManager);
                    state.pingingCurrentPlayback = false;
                    state.playingNextTrack = false;
                    state.accessToken = null;

                    res.json({
                        text: 'Alright, Now\'s a good time for a nap anyway... :sleeping::zzz:',
                        username: 'JukeBot',
                        mrkdwn: true
                    });
                } else {
                    res.json({
                        text: 'You aren\'t cool enough to have *Admin* superpowers... :sunglasses:',
                        username: 'JukeBot',
                        mrkdwn: true
                    });
                }

            } else if (searchStr === '**ENABLE**' && !(state.enabled)) {
                if (user === admin) {
                    state.enabled = true;
                    manager(state);

                    res.json({
                        text: 'Let\'s Do This!',
                        username: 'JukeBot',
                        mrkdwn: true
                    });
                } else {
                    res.json({
                        text: 'You aren\'t cool enough to have *Admin* superpowers... :sunglasses:',
                        username: 'JukeBot',
                        mrkdwn: true
                    });
                }
            } else if (state.enabled) {
                spotify.search(querystring.stringify({
                    type: 'track',
                    q: searchStr,
                    limit: 5
                }), (err, data) => {
                    if (err) throw err;

                    let tracks = null;
                    if (data.tracks.items.length > 0) {
                        tracks = [];

                        for (let item of data.tracks.items) {
                            let track = {};

                            track.color = '#03c2fb';
                            track.callback_id = 'Track_Search';
                            track.thumb_url = item.album.images[1].url;
                            track.title = item.name;

                            track.fields = [
                                {
                                    title: 'Album',
                                    value: item.album.name,
                                    short: true
                                },
                                {
                                    title: 'Artist',
                                    value: item.artists[0].name,
                                    short: true
                                }
                            ];

                            track.actions = [
                                {
                                    name: 'AddToQueue',
                                    text: 'Add to Queue',
                                    type: 'button',
                                    value: JSON.stringify({
                                        album_name: item.album.name,
                                        album_url: item.album.images[1].url,
                                        artist: item.artists[0].name,
                                        track_uri: item.uri,
                                        track_name: item.name,
                                        track_link: item.href
                                    })
                                }
                            ]

                            tracks.push(track);
                        }

                        let track = {
                            color: '#03c2fb',
                            callback_id: 'Dismiss',
                            actions: [
                                {
                                    name: 'dismiss',
                                    text: 'Dismiss',
                                    type: 'button',
                                    value: ''
                                }
                            ]
                        }

                        tracks.push(track);

                        res.json({
                            text: '',
                            username: 'JukeBot',
                            mrkdwn: true,
                            attachments: tracks
                        });
                    } else {
                        res.json({
                            text: '_*Whoops,*_ I didn\'t find anything... :cry:',
                            username: 'JukeBot',
                            mrkdwn: true
                        });
                    }


                });
            } else {
                res.json({
                    text: '_*Shhhhhh*_ I\'m trying to sleep... :sleeping: :zzz:',
                    username: 'JukeBot',
                    mrkdwn: true
                });
            }
        } else {
            res.status(403).end();
        }
    });

}