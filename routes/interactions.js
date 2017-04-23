require('dotenv').config();
const express = require('express');
const spotify = require('../helpers/spotify');
const chalk = require('chalk');
const querystring = require('querystring');


module.exports.route = (app, state) => {

    app.post('/interactions', (req, res) => {
        let payload = JSON.parse(req.body.payload);

        if (payload.token === process.env.SLACK_TOKEN) {
            let actions = payload.actions;

            switch (payload.callback_id) {

                case 'Track_Search':
                    let track = payload.actions[0].value;
                    let user = payload.user;

                    track = JSON.parse(track);

                    state.queue.push(track);
                    
                    console.log(chalk.yellow('Queueing: ') + track.track_name + ' - ' + track.artist)

                    // Respond with Slack Formatted Message
                    res.status(200).json({
                        text: ':white_check_mark: @' + user.name + ' added _*' + track.track_name + '*_ to the play queue... :notes::musical_note:',
                        mrkdwn: true,
                        replace_original: true,
                        response_type: 'in_channel',
                        attachments: [
                            {
                                color: '#01d509',
                                thumb_url: track.album_url,
                                fields: [
                                    {
                                        title: 'Album',
                                        value: track.album_name,
                                        short: true
                                    },
                                    {
                                        title: 'Artist',
                                        value: track.artist,
                                        short: true
                                    }
                                ]
                            }
                        ]
                    });
                    break;

                case 'Dismiss':
                    // Remove Message from Channel
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

}