'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const issueModel = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    files: [{ type: Schema.Types.ObjectId, ref: 'File' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Issue', issueModel, 'issues');