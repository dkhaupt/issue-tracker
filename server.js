'use strict';

// basic setup
const Hapi = require('hapi');
const Path = require('path');
const mongoose = require('mongoose');
const MongoDBUrl = 'mongodb://localhost:27017/issueapi';

// API spec setup
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

const swaggerOptions = {
    info: {
        title: 'Issue Tracker API Documentation',
        version: Pack.version
    },
};

// server definition
const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'files')
        }
    }
});

// import controllers
const IssueController = require('./src/controllers/issue');
const FileController = require('./src/controllers/file');

// basic test route
server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Hello world';

    }
});

// issue routes
server.route({
    method:'GET',
    path: '/issues',
    config: {
        handler: IssueController.list,
        description: 'List all issues',
        notes: 'Returns a list of all issues',
        tags: ['api'],
    },
});

server.route({
    method: 'GET',
    path: '/issues/{id}',
    config: {
        handler: IssueController.get,
        description: 'Get a single issue',
        notes: 'Fetches an issue and returns',
        tags: ['api']
    },
});

server.route({
    method: 'POST',
    path: '/issues',
    config: {
        payload : {
            output: 'stream',
            allow: 'multipart/form-data',
            parse: true,
            maxBytes: 2 * 1000 * 1000
        },
        handler: IssueController.create,
        description: 'Create an issue',
        notes: 'Creates a new issue with provided parameters',
        tags: ['api']
    },
});

server.route({
    method: 'DELETE',
    path: '/issues/{id}',
    config: {
        handler: IssueController.remove,
        description: 'Delete a single issue',
        notes: 'Deletes an issue and returns success',
        tags: ['api']
    },
});

// file routes
server.route({
    method: 'GET',
    path: '/files',
    config: {
        handler: FileController.listAll,
        description: 'Get all files',
        notes: 'Fetches all files ',
        tags: ['api']
    },
});

server.route({
    method: 'GET',
    path: '/issues/{id}/files',
    config: {
        handler: FileController.list,
        description: 'Get all files for a single issue',
        notes: 'Fetches all files for the given issue',
        tags: ['api']
    },
});

server.route({
    method: 'GET',
    path: '/issues/{id}/{filename}',
    config : {
        handler: FileController.getFile,
        description: 'Download a file associated to an issue',
        notes: 'Downloads the supplied filename, must be associated to the supplied issue'
    },
})

server.route({
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
});

server.route({
    method: 'DELETE',
    path: '/files/{id}',
    config: {
        handler: FileController.remove,
        description: 'Delete a single file',
        notes: 'Deletes a file and returns success',
        tags: ['api']
    },
});

// terminal logging of request path & response code
server.events.on('response', function(request) {
    console.log(request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.url.path + ' --> ' + request.response.statusCode);
})

// register plugins, start, and connect to MongoDB
const init = async () => {

    await server.register({
        plugin: require('hapi-pino'),
        options: {
            prettyPrint: false,
            logEvents: [ ]
        }
    });

    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: swaggerOptions
        }
    ]);

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);

    mongoose.connect(MongoDBUrl, {}).then(() => { console.log(`Connected to Mongo server`) }, err => { console.log(err) });
};

// handle error
process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

// call init
init();