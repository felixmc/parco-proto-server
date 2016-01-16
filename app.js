'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectId    = require('mongodb').ObjectId;

var express = require('express');
var parser	= require('body-parser');
var Promise = require('promise');

var app = express();

app.set('json spaces', 4);

app.use(parser.json());

app.use(function(req, res, next) {
	console.log(req.body);
	next();
});

function mongoConnect() {
	return new Promise(function(resolve, reject) {
		MongoClient.connect('mongodb://localhost:27017/parco-proto', function(err, db) {
			if (err) {
				reject(err);
			} else {
				resolve(db);
			}
		});

	});
}

app.get('/list', function(req, res) {
	mongoConnect()
		.then(function(db) {
			var collection = db.collection('location');

			var hexSeconds = (Math.floor(Date.now()/1000) - 60).toString(16);

			// Create an ObjectId with that hex timestamp
			var timebound = ObjectId(hexSeconds + "0000000000000000");

			collection.aggregate([{ $group: { _id: '$uuid' }, $match: { _id: { $gt: timebound } } }], function(err, results) {
				if (err) {
					console.dir(err);
					res.status(500).json({ message: 'db error', date: new Date() });
				} else {
					res.status(200).json({ message: 'success', data: results.map(function(r) {
						return r._id;
					}), date: new Date() });
				}
			});
		})
		.catch(console.dir);
});


app.get('/user/:uuid', function(req, res) {
	mongoConnect()
		.then(function(db) {
			var collection = db.collection('location');

			collection.find({ uuid: req.params.uuid })
				.sort({ _id: -1 })
				.limit(1)
				.exec(function(err, result) {
					if (err) {
						console.dir(err);
						res.status(500).json({ message: 'db error', date: new Date() });
					} else if (!result.length) {
						res.status(404).json({ message: 'not found', date: new Date() });
					} else {
						res.status(200).json({ message: 'success', data: result[1], date: new Date() });
					}
				});
		})
		.catch(console.dir);
});


app.post('/location', function(req, res) {
	mongoConnect()
		.then(function(db) {
			var collection = db.collection('location');

			collection.insert(req.body, function(err, result) {
				if (err) {
					console.dir(err);
					res.status(500).json({ message: 'db error', date: new Date() });
				} else {
					res.status(201).json({ message: 'success', date: new Date() });
				}
			});
		})
		.catch(console.dir);
});

app.listen(1225);
