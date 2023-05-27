const server = require('../forwarder');
const supertest = require('supertest');
const assert = require('assert');
const {response} = require("express");

const request = supertest(server);

describe('GET /api/expected/', function() {
    it('responds with json', function(done) {
        request
            .get('/api/v1/expected')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                const head = res.body.head;
                const body = res.body.body;
                if (head.fromCtry !== 'value') throw Error('Test doesnt return correct value')
                if (head.fromBank !== 'value') throw Error('Test doesnt return correct value')
                if (head.toCtry !== 'value') throw Error('Test doesnt return correct value')
                if (head.toBank !== 'value') throw Error('Test doesnt return correct value')
                if (body.pin !== 1234) throw Error('Test doesnt return correct value')
                done();
            })
    });
});