
var topic_service = exports;
var MongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
var db;

MongoClient.connect("mongodb://" + settings.host + ':' + settings.port + '/' + settings.db, function(err, getdb){
    if (err)
        return console.log(err);
    db = getdb;
});

topic_service.addTopic = function(topic, callback) {
	//checked为true时表示是直接插入正式topic表中，否则为临时表utopic
	db.collection('topics', function(err, collection) {
		if (err)
			return callback(err);
		collection.insert(topic, function(err, flag) {
			if (err)
				return callback(err);
			return callback(null, flag);
		});
	});
};

//返回一组该cate下的topic
topic_service.getTopicByCate = function(cate, callback) {
	db.collection('topics', function(err, collection) {
		if (err)
			return callback(err);
		collection.find({pr: cate}, {_id: 0, pr: 0}).toArray(function(err, array) {
			console.log(JSON.stringify({pr: cate}));
			if (err)
				return callback(err);
			return callback(null, array);
		});
	});
};

topic_service.getTopicById = function(id, callback) {
	db.collection('topics', function(err, collection) {
		if (err)
			return callback(err);
		collection.findOne({id: id}, function(err, topic) {
			if (err)
				return callback(err);
			return callback(null, topic);
		});
	});
};

topic_service.getTopicByName = function(topic, callback) {
	db.collection('topics', function(err, collection) {
		if (err)
			return callback(err);
		collection.findOne({pr: topic.pr, n: topic.n}, {_id: 0}, function(err, topic) {
			if (err)
				return callback(err);
			return callback(err, topic);
		});
	});
};

topic_service.getTopicByCateAndName = function(cate, name, callback) {
	db.collection('topics', function(err, collection) {
		if (err)
			return callback(err);
		collection.findOne({pr: cate, n: name}, {_id: 0}, function(err, topic) {
			if (err)
				return callback(err);
			return callback(null, topic);
		});
	});
};
