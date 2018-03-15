// 'use strict';

const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const Path = require('path');
const FormData = require('form-data');
const streamToPromise = require('stream-to-promise');

const Server = require('../server.js');

// test files must require the lab module and export a test script
const lab = (exports.lab = Lab.script());

// lab shortcuts
const experiment = lab.experiment;
const test = lab.test;
const { describe, it } = lab

// code shortcuts
const expect = Code.expect;

// test basic endpoints- GET all, GET one, POST one
describe('basic Issue requests of the server', () => {
    
    it('asserts a list of issues is returned', async () => {

        const response = await Server.inject('/issues');

        expect(response.statusCode).to.equal(200);
        expect(response.result.issues).to.exist();

    });

    let issueId;

    it('asserts an issue can be created', async () => {

        const injectionOptions = {
            method: 'POST',
            url: '/issues',
        }

        // create the payload with the proper encoding
        const form = new FormData()
        form.append('title', 'Test Issue 1');
        form.append('description', 'Test issue description');

        // set the headers with Content-Type and boundary for multipart/form-data
        injectionOptions.headers = form.getHeaders()

        // stream the form to a promise
        // hapi seems to natively support stream payloads now, but i can't figure out how to use them
        await streamToPromise(form).then( async (payload) => {

            injectionOptions.payload = payload;

            const response = await Server.inject(injectionOptions);

            expect(response.statusCode).to.equal(201);
            expect(response.result.message).to.equal('Issue created successfully');
            expect(response.result.issue).to.exist();

            issueId = response.result.issue._id;

        });
 
    });

    it('asserts the created issue can be retrieved', async () => {

        // retrieve the issue created in the preceding test
        let issueUrl = `/issues/${issueId}`;
        response = await Server.inject(issueUrl);

        expect(response.statusCode).to.equal(200);
        expect(response.result.issue).to.exist();
        expect(response.result.issue._id).to.equal(issueId);

    })

});

// test bad requests to basic endpoints
describe('basic invalid Issue requests', () => {

    it('asserts detail request to an invalid ID (non-parseable) fails', async () => {

        // '1' is not a valid ObjectID
        response = await Server.inject('/issues/1');

        // expect 400 (bad request) and a message in the 'err' key
        expect(response.statusCode).to.equal(400);
        expect(response.result.err).to.exist();
    });

    it('asserts creation of Issue without title fails', async () => {

        const injectionOptions = {
            method: 'POST',
            url: '/issues',
        }

        // create the payload with the proper encoding but without a title
        const form = new FormData()
        form.append('description', 'Test issue description');

        // set the headers with Content-Type and boundary for multipart/form-data
        injectionOptions.headers = form.getHeaders()

        // stream the form to a promise
        // hapi seems to natively support stream payloads now, but i can't figure out how to use them
        await streamToPromise(form).then( async (payload) => {

            injectionOptions.payload = payload;

            const response = await Server.inject(injectionOptions);

            expect(response.statusCode).to.equal(400);
            expect(response.result.err).to.exist();
        });

    });
})