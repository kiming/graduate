var indices_service = exports;
var MongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
var db;

MongoClient.connect("mongodb://" + settings.host + ':' + settings.port + '/' + settings.db, function(err, getdb){
    if (err)
        return console.log(err);
    db = getdb;
});

indices_service.returnValue = function(kind, callback) {
	getCurrent(kind, function(err, value) {
		if (err)
			return callback(err);
		return callback(null, value)
	});
};

indices_service.addOneBack = function(origin, kind, callback) {
	writeBack(origin, kind, 1, function(err, new_value) {
		if (err)
			return callback(err);
		return callback(null, new_value);
	});
};

indices_service.minusOneBack = function(origin, kind, callback) {
	writeBack(origin, kind, -1, function(err, new_value) {
		if (err)
			return callback(err);
		return callback(null, new_value);
	});
};


var getCurrent = function(kind, callback) {
	db.collection('indices', function(err, collection) {
		if (err)
			return callback(err);
		collection.findOne({k: kind}, function(err, entry) {
			if (err)
				return callback(err);
			return callback(null, entry.v);
		});
	});
};

var writeBack = function(origin, kind, delta, callback) {
	db.collection('indices', function(err, collection) {
		if (err)
			return callback(-2);
		collection.update({k: kind}, {$inc: {v: delta}}, function(err, count) {
			if (err)
				return callback(-1);
			return callback(null, origin + delta);
		});
	});
};