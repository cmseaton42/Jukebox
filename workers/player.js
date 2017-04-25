require('dotenv').config();
const spotify = require('../helpers/spotify');
const slack = require('../helpers/slack-webhook');
const chalk = require('chalk');
const querystring = require('querystring');


module.exports.initialize = (state) => {

    state.player = setInterval(() => {

        if (!(state.refreshingToken) && state.accessToken !== null && state.queue.length > 0) {
            state.pingingCurrentPlayback = true;

            spotify.getRemainingDuration(state.accessToken, (err, resp, data) => {
                if (err) throw err;

                state.pingingCurrentPlayback = false;

                if (resp.statusCode !== 200 && resp.statusCode !== 204) {
                    console.log(chalk.red('Error (' + resp.statusCode + '):') + ' Failed to Retrieve Active Song Data...');
                } else if (!(state.playingNextTrack)) {
                    let remainingDuration = data.item.duration_ms - (data.progress_ms === null ? 0 : data.progress_ms);

                    if (remainingDuration <= (state.pollingRate + 200) || !(data.is_playing)) {
                        state.playingNextTrack = true;

                        let nextTrack = state.queue.shift();
                        console.log(chalk.green('Playing: ') + nextTrack.track_name + ' - ' + nextTrack.artist)

                        if (nextTrack !== undefined) {
                            spotify.playTrack(nextTrack.track_uri, state.accessToken, (err, resp) => {
                                if (err) throw err;

                                if (resp.statusCode !== 204) {
                                    console.log(chalk.red('Error (' + resp.statusCode + '):') + ' Failed to Play Song...\n');
                                } else {
                                    let message = {
                                        attachments: [
                                            {   
                                                title: 'Now Playing',
                                                image_url: nextTrack.album_url,
                                                color: '#b250fc',
                                            },
                                            {
                                                title: nextTrack.track_name,
                                                title_link: nextTrack.track_link,
                                                color: '#b250fc',
                                                fields: [
                                                    {
                                                        title: 'Album',
                                                        value: nextTrack.album_name,
                                                        short: true
                                                    },
                                                    {
                                                        title: 'Artist',
                                                        value: nextTrack.artist,
                                                        short: true
                                                    }
                                                ],
                                                footer: 'Powered by Spotify.',
                                                footer_icon: 'https://raw.githubusercontent.com/gustawho/spotify-kde-integration/master/src/icons/light/spotify-linux-512.png',
                                               // ts: Date.now()
                                            }
                                        ]
                                    }

                                    slack.postToChannel(message, (err, data) => {
                                        if (err) throw err;
                                    });
                                }

                                state.playingNextTrack = false;
                            });
                        }
                    }
                }
            });
        }

    }, state.pollingRate);

}