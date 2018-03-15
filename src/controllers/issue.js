var Issue = require('../models/issue');
const FileController = require('../controllers/file');

// list Issues
exports.list = async (req, h) => {

    try {

        // find all Issues and return
        issues = await Issue.find({}).populate('files').exec();

        return { issues: issues };

    } catch (err) { 

        // return any error for display
        return h.response({ err: err.message }).code(400);

    }
}

// get Issue by ID
exports.get = async (req, h) => {
    
    try {

        // try to get the requested Issue 
        issue = await Issue.findById(req.params.id).populate('files').exec();

        // if it doesn't exist, respond with message + appropriate code
        if (!issue) return h.response({ message: 'Issue not found' }).code(404); 

        // return the issue if it was found
        return { issue: issue };

    } catch (err) {

        return h.response({ err: err.message }).code(400);

    }
}

// create a new Issue
exports.create = async (req, h) => {

    try {

        // get the new Issue data from the payload
        const issueData = {
            title: req.payload.title,
            description: req.payload.description,
        };

        // create (immediate)
        issue = await Issue.create(issueData);

        // if file(s) included, process those now
        let fileDocs = []
        if (req.payload.file) {

            // call the file processor
            fileDocs = await FileController.saveFiles(issue, req.payload);

            // refresh the Issue & populate the associated files
            issue = await Issue.findById(issue._id).populate('files').exec();

        }

        // return message & proper code
        return h.response({ message: 'Issue created successfully', issue: issue }).code(201);

    } catch (err) {

        return h.response({ err: err.message }).code(400);

    }
}