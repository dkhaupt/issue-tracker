'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileModel = new Schema({
    filePath: { type: String, required: true },
    description: { type: String, required: true },
    issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true}
}, {
    timestamps: true
});

module.exports = mongoose.model('File', fileModel, 'files');