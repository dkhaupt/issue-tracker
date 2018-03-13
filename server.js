'use strict';

const Hapi = require('hapi');
const mongoose = require('mongoose');
const MongoDBUrl = 'mongodb://localhost:27017/issueapi';

// server definition
const server = Hapi.server({
    port: 3000,
    host: 'localhost',
});

// basic route
server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Hello world';
    }
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

    await server.register(require('inert'));

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