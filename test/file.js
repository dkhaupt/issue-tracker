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

// issueId and fileId to use across tests
let issueId = 0;
let fileId = 0;

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
        // leave out description to ensure it's set to the filename
        const form = new FormData()

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

    // attempt attach existing file to existing Issue
    it('asserts that a file cannot be re-attached to existing Issue', async () => {

        const injectionOptions = {
            method: 'POST',
            url: `/issues/${issueId}/files`,
        }

        // create the payload with the proper encoding
        const form = new FormData()
        form.append('description', 'Test file description');

        // this issue has test_file.rtf attached, so try to add it again
        var fileStream = fs.createReadStream('./test/test_files/test_file.rtf');
        form.append('file', fileStream);

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

});

describe('Basic File info request (accessory endpoint)', () => {

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

describe('File download request', () => {

    it('asserts that files can be downloaded', async () => {

        // get the file with fileId in order to access the filePath
        let fileUrl = `/files/${fileId}`;
        let response = await Server.inject(fileUrl);

        // check that the request was ok
        expect(response.statusCode).to.equal(200);
        expect(response.result.file).to.exist();

        let file = response.result.file;

        // now retrieve the file itself
        fileUrl = file.filePath;
        response = await Server.inject(fileUrl);

        expect(response.statusCode).to.equal(200);
        expect(response.result).to.exist();

    });

});

describe('Bad requests', () => {

    // attach file to nonexistent Issue
    it('asserts that a file cant be associated to nonexistent Issue', async () => {

        // use fileId as an Issue ID
        const injectionOptions = {
            method: 'POST',
            url: `/issues/${fileId}/files`,
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

            expect(response.statusCode).to.equal(404);
            expect(response.result.message).to.equal('Issue not found');

        });

    });

    // "attach" file to existing Issue but forget to include 'file' key in payload
    it('asserts that attempting to attach file without including file fails', async () => {

        const injectionOptions = {
            method: 'POST',
            url: `/issues/${issueId}/files`,
        }

        // create the payload with the proper encoding
        const form = new FormData()
        form.append('description', 'Test file description');

        // do not add filestream to the payload

        // set the headers with Content-Type and boundary for multipart/form-data
        injectionOptions.headers = form.getHeaders()

        // stream the form to a promise
        // hapi seems to natively support stream payloads now, but i can't figure out how to use them
        await streamToPromise(form).then( async (payload) => {

            injectionOptions.payload = payload;

            const response = await Server.inject(injectionOptions);

            expect(response.statusCode).to.equal(400);
            expect(response.result.message).to.exist();
            expect(response.result.message).to.equal('No files selected for upload');

        });

    });

    // request file list for non existent Issue
    it('asserts that unofficial file list for Issue endpoint 404s for nonexistent Issues', async () => {
        
        // use fileId as an Issue ID
        let issueUrl = `/issues/${fileId}/files`;
        const response = await Server.inject(issueUrl);

        // at this point, issueId has 4 files
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal('Issue not found');

    });

    // request file detail for non existent file
    it('asserts that unofficial file detail endpoint 404s for nonexistent files', async () => {

        // use issueId as a File ID
        let fileUrl = `/files/${issueId}`;
        const response = await Server.inject(fileUrl);

        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal('File not found');

    });

    // request file download for non existent file
    it('asserts that nonexistent files cant be downloaded', async () => {

        // construct a nonsense fileUrl
        let fileUrl = `/issues/${fileId}/nonexistent.txt`
        const response = await Server.inject(fileUrl);

        expect(response.statusCode).to.equal(404);

    });

})
