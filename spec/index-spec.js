const request = require('supertest');

describe('GET /', function() {
  let app = null

  beforeEach(() => {
    app = require('../')
  })

  it('responds with hello', function(done) {
    request(app)
      .get('/')
      .set('Accept', 'text/plain')
      .expect('Content-Type', /text/)
      .expect(200, done);
  });
});
