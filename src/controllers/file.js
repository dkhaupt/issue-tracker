const fs = require('fs');
const Path = require('path');

var File = require('../models/file');
var Issue = require('../models/issue');

// list all Files
exports.listAll = async (req, h) => {

    try {

        // get all Files
        files = await File.find({}).populate('issue').exec();

        return { files: files };

    } catch (err) { 

        // return any error for display
        return h.response({ err: err.message }).code(400);

    }
}

// list Files associated to an Issue
exports.list = async (req, h) => {

    try {

        // try to get the issue
        issue = await Issue.findById(req.params.id).populate('files').exec();

        // return w/ 404 if the issue doesn't exist
        if (!issue) return h.response({ message: 'Issue not found' }).code(404);

        // find the Files associated to the given issue
        files = issue.files;

        return h.file(files[0].filePath);

    } catch (err) { 

        // return any error for display
        return h.response({ err: err.message }).code(400);

    }
}

// get File by ID
exports.get = async (req, h) => {
    
    try {

        // try to get the requested File 
        file = await file.findById(req.params.fileId).exec();

        // if there isn't one, respond with message + appropriate code
        if (!file) return h.response({ message: 'File not found' }).code(404); 

        // return the issue if it was found
        return { file: file };

    } catch (err) {

        return h.response({ err: err.message }).code(400);

    }
}

// get file by issue ID & filename
exports.getFile = async (req, h) => {

    try {

        // use the id & filename to construct the path
        return h.file(`${req.params.id}/${req.params.filename}`);

    } catch (err) {

        return h.response({ err: err.message }).code(400);

    }
}

// upload File(s) & associate to an Issue
exports.create = async (req, h) => {

    try {

        // attempt to get the related Issue
        issue = await Issue.findById(req.params.id).populate('files').exec();

        // return w/ 404 if the Issue doesn't exist
        if (!issue) return h.response({ message: 'Issue not found' }).code(404);

        // check that the 'file' payload entry is present (required)
        if (!req.payload.file) return h.response( {message: 'No files selected for upload'}).code(400);

        // process the payload
        let fileDocs = await this.saveFiles(issue, req.payload);

        // return message & proper status code
        return h.response({ message: 'Files uploaded successfully', files: fileDocs }).code(201);

    } catch (err) {

        return h.response({ err: err.message }).code(400);

    }
}

exports.saveFiles = async (issue, payload) => {
    /*
    This utility function processes uploaded files & an existing issue
    Files are saved to the files/{issueId}/{filename} location - the combination of issueId and filename must be unique
    Resulting File documents are returned
    */

    // construct the absolute base path where files are stored
    let basePath = Path.join(__dirname, '..', '..', 'files');

    // check for the directory that holds related files to this issue
    let issueDir = `${basePath}/${issue._id}`;
    if (!fs.existsSync(issueDir)) {

        fs.mkdirSync(issueDir);

    }

    // initialize array to hold created File documents for return
    let fileDocs = [];

    // if only 1 file is being uploaded, it wont be in an array
    // fix that so it's consistent with uploads of 2+ files
    let files = [];

    if (!payload.file.length) {

        files.push(payload.file);

    } else {

        files = payload.file;

    }

    // loop over the uploaded files
    for (var i = 0; i < files.length; i++) {

        // generate the full path by appending the filename to the Issue directory absolute path
        let file = files[i]
        let fileName = file.hapi.filename;
        let filePath = `${issueDir}/${fileName}`;

        // save the file
        file.pipe(fs.createWriteStream(filePath));

        // reset the filepath to a relative path - that's what should be saved
        // include 'issues' in the path so the client can append it to the API root URL for easy file download
        filePath = `/issues/${issue._id}/${fileName}`;

        // check for a provided description, if not present use the filename
        let description = payload.description ? payload.description : fileName;

        // set the data for a new File document
        const fileData = {
            filePath: filePath,
            description: description,
            issue: issue._id
        };

        // create a File document to track association to the Issue
        fileDoc = await File.create(fileData);

        // append to our master list
        fileDocs.push(fileDoc)

        // update the Issue.files array
        updatedIssue = await Issue.findByIdAndUpdate(issue._id, { $addToSet: { files: fileDoc._id } }, { new: true }).populate('files');
    }

    // return the array of created Files
    return fileDocs;

}

// delete by ID
// this is for testing only
exports.remove = async (req, h) => {
    
    try {

        // try to get the document using the file ID
        file = await File.findById(req.params.id).exec();

        // if it doesn't exist, return message + appropriate code
        if (!file) return h.response({ message: 'File not found' }).code(404);

        // if it does, remove it (immediate)
        file.remove();

        // inform the app of success
        return { success: true };

    } catch (err) {

        return h.response({ err: err.message }).code(400);

    }
}