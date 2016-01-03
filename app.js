'use strict';

var MongoClient = require('mongodb').MongoClient;

var express = require('express');
var parser  = require('body-parser');

var app = express();

app.set('json spaces', 4);

app.use(parser.json());

app.use(function(req, res, next) {
  console.log(req.body);
  next();
});

app.post('/location', function(req, res) {

	MongoClient.connect("mongodb://localhost:27017/parco-proto", function(err, db) {
		if (err) { return console.dir(err); }

		var collection = db.collection('location');

		collection.insert(req.body, function(err, result) {
			if (err) {
				console.dir(err);
				res.status(500).json({ message: 'DB error', date: new Date() });
			} else {
				res.status(201).json({ message: 'Success', date: new Date() });
			}
		});

	});

});

app.listen(1225);
