const ApiBuilder = require('claudia-api-builder'),
    AWS = require('aws-sdk');
var api = new ApiBuilder(),
    dynamoDb = new AWS.DynamoDB.DocumentClient();

api.post('/albumspresave', function (request) { // SAVE your icecream
    var params = {
        TableName: 'albumspresave',
        Item: {
            albumid: request.body.albumid,
            albumUPC: request.body.albumUPC,
            username: request.body.username, // users' usernames
            refToken: request.body.refToken,
            email: request.body.email,
            userID: request.body.userID
        }
    }
    return dynamoDb.put(params).promise(); // returns dynamo result
}, { success: 201 }); // returns HTTP status 201 - Created if successful

api.get('/albumspresavelist', function (request) { // GET all users
    return dynamoDb.scan({ TableName: 'albumspresave' }).promise()
        .then(response => response.Items)
});
api.delete('/albumdeletepresave', function (request) { // GET all users
    var params = {
        TableName:'albumspresave',
        Key:{
            albumid: request.body.albumid
        }
    };
    return dynamoDb.delete(params).promise();
});


module.exports = api;