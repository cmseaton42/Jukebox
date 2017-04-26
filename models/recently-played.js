// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// mongoose.Promise = Promise;

// let pollSchema = Schema({
//     title: { type: String, unique: true },
//     url: { type: String, unique: true },
//     options: [{
//         text: String,
//         count: { type: Number, default: 0 }
//     }],
//     creator: String,
//     user_votes: [String],
//     latest_timestamp: { type: Date, default: Date.now },
//     timestamp: { type: Date, default: Date.now },
// });



// module.exports = mongoose.model('Poll', pollSchema);



// if (poll) {
//     req.flash('error_messages', 'This Poll Already Exists');
//     res.redirect('/polls/new');
// } else {
//     let newPoll = new Poll();

//     newPoll.title = req.body.title
//     newPoll.url = slugify(req.body.title);
//     newPoll.creator = req.user.username;

//     for (let option of req.body.options) {
//         let opt = {}
//         opt.text = option;
//         opt.count = 0;

//         newPoll.options.push(opt);
//     }

//     newPoll.save((err) => {
//         if (err) throw err;

//         req.flash('success_messages', 'New Poll <' + req.body.title + '> Created');
//         res.redirect('/polls');
//     });
// }