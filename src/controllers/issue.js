var Issue = require('../models/issue');

// list issues
exports.list = async (req, h) => {

    try {

        issues = await Issue.find({}).exec();

        return { issues: issues };

    } catch (err) { 

        return { err: err };

    }
}

// get issue by ID
exports.get = async (req, h) => {
    
    try {

        issue = await Issue.findById(req.params.id).exec();

        if (!issue) return h.response({ message: 'Issue not found' }).code(404); 

        return { issue: issue };

    } catch (err) {

        return { err: err };

    }
}

// create a issue
exports.create = async (req, h) => {

    try {

        const issueData = {
            title: req.payload.title,
            genre: req.payload.genre,
            pageCount: req.payload.pageCount,
            image: req.payload.image
        };

        issue = await Issue.create(issueData);

        return h.response({ message: 'Issue created successfully', issue: issue }).code(201);

    } catch (err) {

        return { err: err };

    }
}

// update a issue
exports.update = async (req, h) => {

    try {

        issue = await Issue.findById(req.params.id).exec();

        if (!issue) return h.response({ message: 'Issue not found' }).code(404);

        issue.title = req.payload.title;
        issue.genre = req.payload.genre;
        issue.pageCount = req.payload.pageCount;
        issue.image = req.payload.image;

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

        issue = await Issue.findById(req.params.id).exec();

        if (!issue) return h.response({ message: 'Issue not found' }).code(404);

        issue.remove();

        return { success: true };

    } catch (err) {

        return { err: err };

    }
}