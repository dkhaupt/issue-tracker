'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileModel = new Schema({
    path: { type: String, required: true },
    description: { type: String, required: true },
    _issueId: { type: Schema.Types.ObjectId, required: true}
}, {
    timestamps: true
});

module.exports = mongoose.model('File', fileModel, 'files');