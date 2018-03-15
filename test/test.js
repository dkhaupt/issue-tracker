// 'use strict';

const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const Path = require('path');

const Server = require('../server.js');

// test files must require the lab module and export a test script
const lab = (exports.lab = Lab.script());

// lab shortcuts
const experiment = lab.experiment;
const test = lab.test;
const { describe, it } = lab

// code shortcuts
const expect = Code.expect;

describe('basic requests of the server', () => {

    it('asserts a basic GET of the root dir works', async () => {

        const response = await Server.inject('/');

        expect(response.statusCode).to.equal(200);

    });

});