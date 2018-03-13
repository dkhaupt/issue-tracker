'use strict';

// basic setup
const Hapi = require('hapi');
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

// import issue controller
const IssueController = require('./src/controllers/issue');

// server definition
const server = Hapi.server({
    port: 3000,
    host: 'localhost',
});

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
        handler: IssueController.create,
        description: 'Create an issue',
        notes: 'Creates a new issue with provided parameters',
        tags: ['api']
    },
});

server.route({
    method: 'PUT',
    path: '/issues/{id}',
    handler: IssueController.update
});

server.route({
    method: 'PATCH',
    path: '/issues/{id}',
    handler: IssueController.patch
});

server.route({
    method: 'DELETE',
    path: '/issues/{id}',
    handler: IssueController.remove
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