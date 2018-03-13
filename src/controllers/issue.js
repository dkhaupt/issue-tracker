var Issue = require('../models/issue');

// list issues
exports.list = async (req, h) => {

    try {

        // find all issues and return
        issues = await Issue.find({}).exec();

        return { issues: issues };

    } catch (err) { 

        // return any error for display
        return { err: err };

    }
}

// get issue by ID
exports.get = async (req, h) => {
    
    try {

        // try to get the requested issue 
        issue = await Issue.findById(req.params.id).exec();

        // if there isn't one, respond with message + appropriate code
        if (!issue) return h.response({ message: 'Issue not found' }).code(404); 

        // return the issue if it was found
        return { issue: issue };

    } catch (err) {

        return { err: err };

    }
}

// create an issue
exports.create = async (req, h) => {

    try {

        // get the new issue data from the payload
        const issueData = {
            title: req.payload.title,
            description: req.payload.description,
            attachments: req.payload.attachments
        };

        // create (immediate)
        issue = await Issue.create(issueData);

        // return message & proper code
        return h.response({ message: 'Issue created successfully', issue: issue }).code(201);

    } catch (err) {

        return { err: err };

    }
}

// update an issue
exports.update = async (req, h) => {

    try {

        // find the issue with the URL param
        issue = await Issue.findById(req.params.id).exec();

        // if no issue with the provided ID, return proper message and code
        if (!issue) return h.response({ message: 'Issue not found' }).code(404);

        // set fields- PUT expects a full object representation in the payload
        issue.title = req.payload.title;
        issue.description = req.payload.description;
        issue.attachments = req.payload.attachments;        

        issue = await issue.save()

        if (issue) { return { message: 'Issue updated successfully' }; }

    } catch (err) {

        return { err: err };

    }

}

// update 1+ fields without entire issue
exports.patch = async (req, h) => {

    try {

        issue = await Issue.findById(req.params.id).exec();

        if (!issue) return h.response({ message: 'Issue not found' }).code(404);

        issue = await issue.update(req.payload);

        return { message: 'Issue field(s) updated successfully' };

    } catch (err) { 

        return { err: err };

    }
}

// delete by ID
exports.remove = async (req, h) => {
    
    try {

        // try to get the issue using the ID
        issue = await Issue.findById(req.params.id).exec();

        // if it doesn't exist, return message + appropriate code
        if (!issue) return h.response({ message: 'Issue not found' }).code(404);

        // if it does, remove it (immediate)
        issue.remove();

        // inform the app of success
        return { success: true };

    } catch (err) {

        return { err: err };

    }
}