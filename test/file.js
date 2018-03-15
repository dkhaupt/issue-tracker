'use strict';

const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const Path = require('path');
const FormData = require('form-data');
const streamToPromise = require('stream-to-promise');
const fs = require('fs');

// use the main server
const Server = require('../server.js');

// test files must require the lab module and export a test script
const lab = (exports.lab = Lab.script());

// lab shortcuts
const experiment = lab.experiment;
const test = lab.test;
const { describe, it } = lab

// code shortcuts
const expect = Code.expect;

// issueId to use across tests
let issueId = 0;

describe('Issue creation with attached files', () => {

    // let issueId;

    // attach 1 file at issue creation time
    it('asserts that Issue can be created with 1 attached file', async () => {

        const injectionOptions = {
            method: 'POST',
            url: '/issues',
        }

        // create the payload with the proper encoding
        const form = new FormData()
        form.append('title', 'Test Issue ' + (Math.random() * 100000).toString());
        form.append('description', 'Test issue description');

        // read the file to stream and add to form
        var fileStream = fs.createReadStream('./test/test_files/test_file.rtf');
        form.append('file', fileStream);

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
            expect(response.result.issue.files).to.have.length(1);

            // save the issue ID for future tests
            issueId = response.result.issue._id;

        });

    });

    // attach 2 files at Issue creation time
    it('asserts that Issue can be created with 2 attached files', async () => {

        const injectionOptions = {
            method: 'POST',
            url: '/issues',
        }

        // create the payload with the proper encoding
        const form = new FormData()
        form.append('title', 'Test Issue ' + (Math.random() * 100000).toString());
        form.append('description', 'Test issue description');

        // read the file to stream and add to form
        var fileStream = fs.createReadStream('./test/test_files/test_file.rtf');
        form.append('file', fileStream);
        fileStream = fs.createReadStream('./test/test_files/test_pic.png');
        form.append('file', fileStream);

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
            expect(response.result.issue.files).to.have.length(2);

        });

    });

});

describe('Associate files to existing Issue', () => {

    // attach 1 file to existing Issue
    it('asserts that 1 file can be associated to existing Issue', async () => {

        const injectionOptions = {
            method: 'POST',
            url: `/issues/${issueId}/files`,
        }

        // create the payload with the proper encoding
        const form = new FormData()
        form.append('description', 'Test file description');

        // this issue has test_file.rtf attached, so add test_pic.png
        var fileStream = fs.createReadStream('./test/test_files/test_pic.png');
        form.append('file', fileStream);

        // set the headers with Content-Type and boundary for multipart/form-data
        injectionOptions.headers = form.getHeaders()

        // stream the form to a promise
        // hapi seems to natively support stream payloads now, but i can't figure out how to use them
        await streamToPromise(form).then( async (payload) => {

            injectionOptions.payload = payload;

            const response = await Server.inject(injectionOptions);

            expect(response.statusCode).to.equal(201);
            expect(response.result.message).to.equal('Files uploaded successfully');
            expect(response.result.files).to.exist();
            expect(response.result.files).to.have.length(1);

        });

    });

    // attach 2 files to existing Issue
    it('asserts that 2 files can be associated to existing Issue', async () => {

        const injectionOptions = {
            method: 'POST',
            url: `/issues/${issueId}/files`,
        }

        // create the payload with the proper encoding
        const form = new FormData()
        form.append('description', 'Test file description');

        // this issue has test_file.rtf and test_pic.png attached, so add test_pic_small.png and another_pic.png
        var fileStream = fs.createReadStream('./test/test_files/test_pic_small.png');
        form.append('file', fileStream);
        fileStream = fs.createReadStream('./test/test_files/another_pic.png');
        form.append('file', fileStream);

        // set the headers with Content-Type and boundary for multipart/form-data
        injectionOptions.headers = form.getHeaders()

        // stream the form to a promise
        // hapi seems to natively support stream payloads now, but i can't figure out how to use them
        await streamToPromise(form).then( async (payload) => {

            injectionOptions.payload = payload;

            const response = await Server.inject(injectionOptions);

            expect(response.statusCode).to.equal(201);
            expect(response.result.message).to.equal('Files uploaded successfully');
            expect(response.result.files).to.exist();
            expect(response.result.files).to.have.length(2);

        });

    });

});

describe('Basic File info request (accessory endpoint)', () => {

    let fileId;

    it('asserts that unofficial file list endpoint works', async () => {
        
        const response = await Server.inject('/files');

        expect(response.statusCode).to.equal(200);
        expect(response.result.files).to.exist();

    });

    it('asserts that unofficial file list for Issue endpoint works', async () => {
        
        let issueUrl = `/issues/${issueId}/files`;
        const response = await Server.inject(issueUrl);

        // at this point, issueId has 4 files
        expect(response.statusCode).to.equal(200);
        expect(response.result.files).to.exist();
        expect(response.result.files).to.have.length(4);

        // save the first fileId for use in the next test
        fileId = response.result.files[0]._id;

    });

    it('asserts that unofficial file detail endpoint works', async () => {

        let fileUrl = `/files/${fileId}`;
        const response = await Server.inject(fileUrl);

        expect(response.statusCode).to.equal(200);
        expect(response.result.file).to.exist();

    });

});
