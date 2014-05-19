var user_service = exports;
var MongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
var db;

MongoClient.connect("mongodb://" + settings.host + ':' + settings.port + '/' + settings.db, function(err, getdb){
    if (err)
        return console.log(err);
    db = getdb;
});

user_service.createUser = function(user, callback) {
	db.collection('users', function(err, collection) {
		if (err)
			return callback(err);
		collection.insert(user, function(err, user) {
			if (err)
				return callback(err);
			return callback(null, user);
		});
	});
};

user_service.checkUser = function(u, callback) {
	db.collection('users', function(err, collection) {
		if (err)
			return callback(err);
		collection.findOne(u, function(err, entry) {
			if (err)
				return callback(err);
			return callback(null, entry);
		});
	});
};