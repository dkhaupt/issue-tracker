const FileController = require('../controllers/file');

module.exports = [

    // route to retrieve all files
    {
        method: 'GET',
        path: '/files',
        config: {
            handler: FileController.listAll,
            description: 'Get all files',
            notes: 'Fetches all files ',
            tags: ['api']
        },
    },

    // route to retrieve all files for a single Issue
    {
        method: 'GET',
        path: '/issues/{id}/files',
        config: {
            handler: FileController.list,
            description: 'Get information of all files associated to a single issue',
            notes: 'Fetches information for all files for the given issue',
            tags: ['api']
        },
    },

    // route to retrieve a single file associated to an Issue
    {
        method: 'GET',
        path: '/issues/{id}/{filename}',
        config : {
            handler: FileController.getFile,
            description: 'Download a file associated to an issue',
            notes: 'Downloads the supplied filename, must be associated to the supplied issue',
            tags: ['api']
        },
    },

    // route to associate files to an Issue
    {
        method: 'POST',
        path: '/issues/{id}/files',
        config: {
            payload : {
                output: 'stream',
                allow: 'multipart/form-data',
                parse: true,
                maxBytes: 2 * 1000 * 1000
            },
            handler: FileController.create,
            description: 'Associate a file to an issue',
            notes: 'Finds the associated issue, saves the file, creates a File instance to represent it in the DB',
            tags: ['api']
        },
    },
]