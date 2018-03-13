var File = require('../models/file');
var Issue = require('../models/issue');

// list files associated to an Issue
exports.list = async (req, h) => {

    try {

        // try to get the issue
        issue = await Issue.findById(req.params.id).exec();

        // return w/ 404 if the issue doesn't exist
        if (!issue) return h.response({ message: 'Issue not found' }).code(404);

        // find the files associated to the given issue
        files = await File.find({ _issueId: issue._id }).exec();

        return { files: files };

    } catch (err) { 

        // return any error for display
        return { err: err };

    }
}

// get file by ID
exports.get = async (req, h) => {
    
    try {

        // try to get the requested issue 
        file = await file.findById(req.params.fileId).exec();

        // if there isn't one, respond with message + appropriate code
        if (!file) return h.response({ message: 'File not found' }).code(404); 

        // return the issue if it was found
        return { file: file };

    } catch (err) {

        return { err: err };

    }
}

// create a file to associate to an issue
exports.create = async (req, h) => {

    try {

        // attempt to get the issue
        issue = await Issue.findById(req.params.id).exec();

        // return w/ 404 if the issue doesn't exist
        if (!issue) return h.response({ message: 'Issue not found' }).code(404);

        // get the new issue data from the payload
        const issueData = {
            path: req.payload.title,
            description: req.payload.description,
            _issueId: issue._id
        };

        // create (immediate)
        file = await File.create(fileData);

        // return message & proper code
        return h.response({ message: 'File uploaded successfully', issue: issue }).code(201);

    } catch (err) {

        return { err: err };

    }
}