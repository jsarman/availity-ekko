/*globals describe, beforeEach, before, after, afterEach, it*/
var request = require('superagent');
var chai = require('chai');
var _ = require('lodash');
var helper = require('../../tests/helpers');
var config = require('../../../config');
var expect = chai.expect;

describe('Proxy', function() {

  helper.serverSpecHelper();

  var proxy1;
  var server1;
  var proxy2;
  var server2;
  var proxy3;
  var server3;

  before(function() {
    config.testing.servers.api.proxy = true;
    config.testing.servers.other.proxy = true;
    config.testing.servers.serviceOverride.proxy = true;
  });

  after(function() {
    config.testing.servers.api.proxy = false;
    config.testing.servers.other.proxy = false;
    config.testing.servers.serviceOverride.proxy = false;
  });

  beforeEach(function(done) {
    var express = require('express');

    var finished = _.after(3, function() {
      done();
    });

    proxy1 = express();

    proxy1.get('/v1/route1', function(req, res) {
      res.json({z: 36});
    });

    proxy1.get('/v1/me', function(req, res) {
      res.json({me: req.headers.remoteuser});
    });

    proxy2 = express();

    proxy2.get('/v2/route2', function(req, res) {
      res.json({y: 35});
    });

    proxy2.get('/v2/me', function(req, res) {
      var body = {
        'me': req.headers.remoteuser,
        'custom1': ''
      };
      if (req.headers.custom1) {
        body.custom1 = req.headers.custom1;
      }
      res.json(body);
    });

    proxy3 = express();

    proxy3.get('/v3/service', function(req, res) {
      res.json({x: 34});
    });

    server1 = proxy1.listen(config.testing.servers.api.port, finished);
    server2 = proxy2.listen(config.testing.servers.other.port, finished);
    server3 = proxy3.listen(config.testing.servers.serviceOverride.port, finished);

  });

  afterEach(function(done) {

    var finished = _.after(3, function() {
      done();
    });

    if(server1 && server1.close) {
      server1.close(finished);
    } else {
      finished();
    }

    if(server2 && server2.close) {
      server2.close(finished);
    } else {
      finished();
    }

    if(server3 && server3.close) {
      server3.close(finished);
    } else {
      finished();
    }

  });

  it('should get a response from /api/v1/route1', function(done) {

    request.get(helper.getUrl('/api/v1/route1'))
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(_.isEqual(res.body, {'z': 36})).to.be.ok;
        done();
      });
  });

  it('should rewrite /ui/route1 and proxy to /v1/route1', function(done) {
    request.get(helper.getUrl('/ui/route1'))
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(_.isEqual(res.body, {'z': 36})).to.be.ok;
        done();
      });
  });

  it('should get a response from /test1/v2/route2', function(done) {
    request.get(helper.getUrl('/test1/v2/route2'))
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(_.isEqual(res.body, {'y': 35})).to.be.ok;
        done();
      });
  });

  it('should set custom header from global user option', function(done) {
    request.get(helper.getUrl('/api/v1/me'))
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(_.isEqual(res.body, {'me': 'testuser'})).to.be.ok;
        done();
      });
  });

  it('should set custom header from server options', function(done) {
    request.get(helper.getUrl('/test1/v2/me'))
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(_.isEqual(res.body, {'me': 'otheruser', 'custom1': ''})).to.be.ok;
        done();
      });
  });

  it('should get a response from /public/api/v2/route2', function(done) {
    request.get(helper.getUrl('/public/api/v2/route2'))
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('should select finer grained route', function(done) {
    request.get(helper.getUrl('/test1/service2/v3/service'))
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(_.isEqual(res.body, {'x': 34})).to.be.ok;
        done();
      });
  });

})
;
