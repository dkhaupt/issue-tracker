'use strict';

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
    
    // even if 0 exist, the 'issues' array will be returned empty
    it('asserts a list of issues is returned', async () => {

        const response = await Server.inject('/issues');

        expect(response.statusCode).to.equal(200);
        expect(response.result.issues).to.exist();

    });

    // variable to hold ID of created issue
    let issueId;

    it('asserts an issue can be created', async () => {

        const injectionOptions = {
            method: 'POST',
            url: '/issues',
        }

        // create the payload with the proper encoding
        const form = new FormData()
        form.append('title', 'Test Issue ' + (Math.random() * 100000).toString());
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

            // save the issue ID for future tests
            issueId = response.result.issue._id;

        });
 
    });

    it('asserts the created issue can be retrieved', async () => {

        // retrieve the issue created in the preceding test
        let issueUrl = `/issues/${issueId}`;
        const response = await Server.inject(issueUrl);

        expect(response.statusCode).to.equal(200);
        expect(response.result.issue).to.exist();
        expect(response.result.issue._id).to.equal(issueId);

    });

});

// test bad requests to basic endpoints
describe('basic invalid Issue requests', () => {

    it('asserts detail request to an invalid ID (non-parseable) fails', async () => {

        // '1' is not a valid ObjectID
        const response = await Server.inject('/issues/1');

        // expect 400 (bad request) and a message in the 'err' key
        expect(response.statusCode).to.equal(400);
        expect(response.result.err).to.exist();
    });

    it('asserts detail request to a non-existent ID fails', async () => {

        // this ID was previously used (valid ObjectID) and shouldn't exist again b/c seconds make up the first 4 bytes of ObjectID format
        let badId = '5aa9bb1fb17a29392d6611a6'

        // request the badId endpoint. if it returns 200, things should get interesting
        const response = await Server.inject(`/issues/${badId}`);

        // expect 404 (not found)
        expect(response.statusCode).to.equal(404);
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

            // expect 400 and a message in the 'err' key
            expect(response.statusCode).to.equal(400);
            expect(response.result.err).to.exist();
        });

    });

    it('asserts creation of Issue without description fails', async () => {

        const injectionOptions = {
            method: 'POST',
            url: '/issues',
        }

        // create the payload with the proper encoding but without a title
        const form = new FormData()
        form.append('title', 'Test Issue Title');

        // set the headers with Content-Type and boundary for multipart/form-data
        injectionOptions.headers = form.getHeaders()

        // stream the form to a promise
        // hapi seems to natively support stream payloads now, but i can't figure out how to use them
        await streamToPromise(form).then( async (payload) => {

            injectionOptions.payload = payload;

            const response = await Server.inject(injectionOptions);

             // expect 400 and a message in the 'err' key
            expect(response.statusCode).to.equal(400);
            expect(response.result.err).to.exist();
        });

    });

});