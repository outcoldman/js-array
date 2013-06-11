var express = require('express');
var request = require('request');
var Q = require('q');
var zlib = require('zlib');
var jsonArray = require('./../../lib/jsonArray');

var app = express();

app.use(express.compress());

var requestWithEncoding = function(options, callback) {
    var req = request.get(options);

    req.on('response', function(res) {
        var chunks = [];
        res.on('data', function(chunk) {
            chunks.push(chunk);
        });

        res.on('end', function() {
            var buffer = Buffer.concat(chunks);
            var encoding = res.headers['content-encoding'];
            if (encoding == 'gzip') {
                zlib.gunzip(buffer, function(err, decoded) {
                    callback(err, decoded && decoded.toString());
                });
            } else if (encoding == 'deflate') {
                zlib.inflate(buffer, function(err, decoded) {
                    callback(err, decoded && decoded.toString());
                })
            } else {
                callback(null, buffer.toString());
            }
        });
    });

    req.on('error', function(err) {
        callback(err);
    });
};

var getAllAnswers = function (pages) {
    var answers = [];
    var promise = null;

    var getAnswersByPage = function(page) {
        return Q.nfcall(requestWithEncoding,
            {
                url: 'https://api.stackexchange.com/answers?page=' + page + '&pagesize=100&order=desc&sort=activity&site=stackoverflow',
                headers: { 'Accept-Encoding': 'gzip' }
            }).then(function(response){
                answers.push(JSON.parse(response));
                return answers;
            });
    }

    for (var i = 1; i <= pages; i++) {
        if (!promise) {
            promise = getAnswersByPage(i);
        } else {
            promise = promise.then(function(){
                return getAnswersByPage(i);
            });
        }
    }

    return promise;
}

app.get('/', function(req, res){

    var answers = [];
    getAllAnswers(10)
        .then(function(answers) {
            res.json(jsonArray.toJSONArray(answers));
        });
});

app.listen(3100);