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

// Autogenned docs options
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

// basic hello route
server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Hello world';
    }
});

// import API routes
var routes = require('./src/routes');

server.route(routes);

// terminal logging of request path & response code
server.events.on('response', function(request) {
    console.log(request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.url.path + ' --> ' + request.response.statusCode);
});

// register plugins, start, and connect to MongoDB
(async () => {

    // register logging plugin
    await server.register({
        plugin: require('hapi-pino'),
        options: {
            prettyPrint: false,
            logEvents: [ ]
        }
    });

    // register plugins for swagger, plus we need inert anyway
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

})();

module.exports = server;