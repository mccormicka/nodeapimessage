'use strict';

describe('NodeAPIMessage Tests', function () {

    var TestClass = require('../index');
    var Status = require('../lib/NodeAPIStatus');
    var mockgoose = require('Mockgoose');
    var mongoose = require('mongoose');

    mockgoose(mongoose);
    var connection = mongoose.createConnection('mongodb://localhost:3001/TestingDB');
    var request = require('supertest');
    var express = require('express');
    var partialResponse = require('express-partial-response');

    beforeEach(function (done) {
        mockgoose.reset();
        done();
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('SHOULD', function () {

        it('Middleware should add apiMessage to response object', function (done) {

            var middleware = TestClass.initialize(connection);
            var req = {};
            var res = {};
            middleware(req, res, function (err) {
                expect(typeof res.apiMessage === 'function').toBe(true);
                done(err);
            });
        });

        it('Be able to send an api message', function (done) {
            var app = express();
            app.configure(function () {
                app.use(TestClass.initialize(connection));
            });
            app.get('/something', function (req, res) {
                res.apiMessage(Status.OK, 'some message here', {'one': 'two'});
            });

            request(app)
                .get('/something')
                .end(function (err, result) {
                    expect(err).toBeNull();
                    expect(result).not.toBeNull();
                    if (result) {
                        var data = JSON.parse(result.text);
                        delete data._id;
                        expect(data).toEqual(
                            {
                                data: { one: 'two' },
                                code: 2000000,
                                status: 200,
                                message: 'some message here',
                                href: '/apimessages/2000000',
                                type: 'apimessage'
                            });
                        done();
                    } else {
                        done('Error retrieving response');
                    }
                });
        });

        it('Handle Error Messages', function (done) {
            var app = express();
            app.configure(function () {
                app.use(TestClass.initialize(connection));
                app.use(app.router);
                app.use(TestClass.apiMessageHandler);
            });
            app.get('/something', function (req, res, next) {
                next('Some bloody error!', 1);
            });

            request(app)
                .get('/something')
                .end(function (err, result) {
                    expect(err).toBeNull();
                    expect(result).not.toBeNull();
                    if (result) {
                        expect(result.status).toBe(500);
                        var data = JSON.parse(result.text);
                        delete data._id;
                        expect(data).toEqual(
                            {
                                code: 5000000,
                                status: 500,
                                message: 'Internal server error!',
                                href: '/apimessages/5000000',
                                type: 'apimessage'
                            });
                        done();
                    } else {
                        done('Error retrieving response');
                    }
                });
        });

        it('Work with express-partial-response', function (done) {

            var app = express();
            app.configure(function () {
                app.use(TestClass.initialize(connection));
                app.use(partialResponse());
            });
            app.get('/something', function (req, res) {
                res.apiMessage(Status.OK, 'some message here', {'one': 'two'});
            });

            request(app)
                .get('/something?fields=message')
                .end(function (err, result) {
                    expect(err).toBeNull();
                    expect(result).not.toBeNull();
                    if (result) {
                        var data = JSON.parse(result.text);
                        expect(data).toEqual({ message: 'some message here' });
                        done();
                    } else {
                        done('Error retrieving response');
                    }
                });

        });

        it('Add APIMessages to Mongoose', function (done) {
            var middleware = TestClass.initialize(connection);
            var req = {};
            var res = {
                status: function () {
                },
                format: function (value) {
                    value.html();
                },
                send: function () {
                }
            };
            spyOn(res, 'send').andCallFake(function () {
                TestClass.APIMessage.findOne({message: 'something awesome happened'}, function (err, result) {
                    if (result) {
                        expect(result.status).toBe(Status.OK);
                        //Data should not be saved to the database as it can change
                        //on each request
                        expect(result.data).not.toBe({my: 'data'});
                        done(err);
                    } else {
                        done('Error creating and finding api message');
                    }
                });
            });
            middleware(req, res, function () {
            });
            res.apiMessage(Status.OK, 'something awesome happened', {my: 'data'});
        });

        it('Padd out error codes small count (1)', function (done) {
            TestClass.initialize(connection);
            var APIMessage = TestClass.APIMessage;
            spyOn(APIMessage, 'count').andCallFake(function (query, next) {
                next(null, 1);
            });
            APIMessage.response(Status.OK, 'something', null, function (err, result) {
                if (result) {
                    expect(result.code).toBe(2000001);
                    done(err);
                } else {
                    done('Error creating api message');
                }
            });
        });

        it('Padd out error codes medium count (555)', function (done) {
            TestClass.initialize(connection);
            var APIMessage = TestClass.APIMessage;
            spyOn(APIMessage, 'count').andCallFake(function (query, next) {
                next(null, 555);
            });
            APIMessage.response(Status.OK, 'something', null, function (err, result) {
                if (result) {
                    expect(result.code).toBe(2000555);
                    done(err);
                } else {
                    done('Error creating api message');
                }
            });
        });

        it('Padd out error codes large count (9999)', function (done) {
            TestClass.initialize(connection);
            var APIMessage = TestClass.APIMessage;
            spyOn(APIMessage, 'count').andCallFake(function (query, next) {
                next(null, 9999);
            });
            APIMessage.response(Status.OK, 'something', null, function (err, result) {
                if (result) {
                    expect(result.code).toBe(2009999);
                    done(err);
                } else {
                    done('Error creating api message');
                }
            });
        });

        it('Return a different apimessage if status/message combination is different', function (done) {
            TestClass.initialize(connection);
            var APIMessage = TestClass.APIMessage;
            APIMessage.response(Status.OK, 'something', null, function (err, result) {
                if (result) {
                    expect(result.code).toBe(2000000);
                    expect(result.message).toBe('something');
                    APIMessage.response(Status.OK, 'new message', null, function(err, result){
                        expect(result.code).toBe(2000001);
                        expect(result.message).toBe('new message');
                        done(err);
                    });
                } else {
                    done('Error creating api message');
                }
            });
        });

        iit('Return the same apimessage if status/message combination is same', function (done) {
            TestClass.initialize(connection);
            var APIMessage = TestClass.APIMessage;
            APIMessage.response(Status.OK, 'something', null, function (err, result) {
                if (result) {
                    expect(result.code).toBe(2000000);
                    expect(result.message).toBe('something');
                    APIMessage.response(Status.OK, 'something', null, function(err, result){
                        expect(result.code).toBe(2000000);
                        expect(result.message).toBe('something');
                        done(err);
                    });
                } else {
                    done('Error creating api message');
                }
            });
        });
    });
});