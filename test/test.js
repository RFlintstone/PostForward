let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../forwarder/index');
chai.use(chaiHttp);

describe('GET /api/expected/', function() {
    this.timeout(300);
    this.retries(2);

    it('responds with json', function(done) {
        chai.request(server)
            .get('/api/v1/expected')
            .end(function (err, res){
                if (err) return done(err);
                const head = res.body.head;
                const body = res.body.body;
                if (head.fromCtry !== 'value') throw Error('Test doesnt return correct value')
                if (head.fromBank !== 'value') throw Error('Test doesnt return correct value')
                if (head.toCtry !== 'value') throw Error('Test doesnt return correct value')
                if (head.toBank !== 'value') throw Error('Test doesnt return correct value')
                if (body.pin !== 1234) throw Error('Test doesnt return correct value')
                return done();
            })
    });
});
