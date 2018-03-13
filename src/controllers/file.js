const fs = require('fs');

var File = require('../models/file');
var Issue = require('../models/issue');

// list all files
exports.listAll = async (req, h) => {

    try {

        // get all files
        files = await File.find({}).populate('issue').exec();

        return { files: files };

    } catch (err) { 

        // return any error for display
        return { err: err };

    }
}

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

        let basePath = '/Users/david/Source/issue-tracker/files/';

        // attempt to get the issue
        issue = await Issue.findById(req.params.id).populate('files').exec();

        // return w/ 404 if the issue doesn't exist
        if (!issue) return h.response({ message: 'Issue not found' }).code(404);

        // check for the issue directory that holds related files
        let issueDir = `${basePath}/${issue._id}`;
        if (!fs.existsSync(issueDir)) {

            fs.mkdirSync(issueDir);

        }

        // generate the filename and filepath based on the issue directory and existing filename
        let file = req.payload['file']
        let fileName = file.hapi.filename;
        let filePath = `${issueDir}/${fileName}`;

        // save the file
        // result = await fs.writeFile(filePath, file);
        file.pipe(fs.createWriteStream(filePath));

        // get the new issue data from the payload
        const fileData = {
            filePath: filePath,
            description: req.payload.description,
            issue: issue._id
        };

        // create the File document (immediate)
        fileDoc = await File.create(fileData);

        // update the issue files array
        issue = await Issue.findByIdAndUpdate(req.params.id, { $addToSet: { files: fileDoc._id } }, { new: true }).populate('files');

        // return message & proper code
        return h.response({ message: 'File uploaded successfully', file: fileDoc }).code(201);

    } catch (err) {

        return h.response({ err: err.message }).code(400);

    }
}

// delete by ID
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

        return { err: err };

    }
}