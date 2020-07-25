const ApiBuilder = require('claudia-api-builder'),
    AWS = require('aws-sdk');
var api = new ApiBuilder(),
    dynamoDb = new AWS.DynamoDB.DocumentClient();

api.post('/albumspresave', function (request) { // SAVE your icecream
    var params = {
        TableName: 'SpotifyPreSave',
        Item: {
            presaveID: request.body.presaveID,
            albumUPC: request.body.albumUPC,
            username: request.body.username, // users' usernames
            refToken: request.body.refToken,
            country: request.body.country,
            email: request.body.email,
            userID: request.body.userID,
            wantsUpdates: request.body.wantsUpdates
        }
    }
    return dynamoDb.put(params).promise(); // returns dynamo result
}, { success: 201 }); // returns HTTP status 201 - Created if successful

api.post('/albumspresaveapple', function (request) { // SAVE your icecream
    var params = {
        TableName: 'AppleMusicPreAdd',
        Item: {
            presaveID: request.body.presaveID,
            albumUPC: request.body.albumUPC,
            userToken: request.body.userToken
        }
    }
    return dynamoDb.put(params).promise(); // returns dynamo result
}, { success: 201 });

api.get('/albumspresavelist', function (request) { // GET all users
    return dynamoDb.scan({ TableName: 'SpotifyPreSave' }).promise()
        .then(response => response.Items)
});
api.get('/albumsapplepresavelist', function (request) { // GET all users
    return dynamoDb.scan({ TableName: 'AppleMusicPreAdd' }).promise()
        .then(response => response.Items)
});
api.delete('/albumdeletepresave', function (request) { // GET all users
    var params = {
        TableName:'SpotifyPreSave',
        Key:{
            presaveID: request.body.presaveID
        }
    };
    return dynamoDb.delete(params).promise();
});
api.delete('/albumdeletepresaveapple', function (request) { // GET all users
    var params = {
        TableName:'AppleMusicPreAdd',
        Key:{
            presaveID: request.body.presaveID
        }
    };
    return dynamoDb.delete(params).promise();
});


module.exports = api;
