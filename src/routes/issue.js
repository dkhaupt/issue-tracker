const IssueController = require('../controllers/issue');

module.exports = [

    // route to retrieve all issues
    {
        method:'GET',
        path: '/issues',
        config: {
            handler: IssueController.list,
            description: 'List all issues',
            notes: 'Returns a list of all issues',
            tags: ['api'],
        },
    },

    // route to retrieve a single issue
    {
        method: 'GET',
        path: '/issues/{id}',
        config: {
            handler: IssueController.get,
            description: 'Get a single issue',
            notes: 'Fetches an issue and returns',
            tags: ['api']
        },
    },

    // route to create an issue - accepts files to associate to new issue
    {
        method: 'POST',
        path: '/issues',
        config: {
            payload : {
                output: 'stream',
                allow: ['multipart/form-data'],
                parse: true,
                maxBytes: 2 * 1000 * 1000
            },
            handler: IssueController.create,
            description: 'Create an issue',
            notes: 'Creates a new issue with provided parameters',
            tags: ['api']
        },
    },
]