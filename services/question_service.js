var question_service = exports;
var MongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
var db;

MongoClient.connect("mongodb://" + settings.host + ':' + settings.port + '/' + settings.db, function(err, getdb){
    if (err)
        return console.log(err);
    db = getdb;
});

question_service.addQuestion = function(question, coll, callback) {
	db.collection(coll, function(err, collection) {
		if (err)
			return callback(err);
		collection.insert(question, function(err, qu) {
			if (err)
				return callback(err);
			return callback(null, qu[0]);
		});
	});
};

question_service.getAllUncheckedQuestions = function(callback) {
	db.collection('unques', function(err, collection) {
		if (err)
			return callback(err);
		collection.find({id: {$gte: 0}}, {_id: 0}).sort({id: 1}).toArray(function(err, array) {
			if (err)
				return callback(err);
			return callback(null, array);
		});
	});
};

question_service.getQuestionById = function(id, coll, callback) {
	db.collection(coll, function(err, collection) {
		if (err)
			return callback(err);
		collection.findOne({id: id}, function(err, entry) {
			if (err)
				return callback(err);
			return callback(null, entry);
		});
	});
};

question_service.deleteQuestion = function(id, coll, callback) {
	db.collection(coll, function(err, collection) {
		if (err)
			return callback(err);
		collection.remove({id: id}, function(err, amount) {
			if (err)
				return callback(err);
			return callback(null, amount);
		});
	});
};

question_service.updateQuestionID = function(id, newid, callback){
	db.collection('unques', function(err, collection) {
		if (err)
			return callback(err);
		collection.update({id: id}, {$set: {id: newid}}, function(err, ct) {
			if (err)
				return callback(err);
			return callback(null, ct);
		});
	});
};

question_service.mergeQuestionsToThisTopic = function(topic, callback) {
	db.collection('unques', function(err, collection) {
		if (err)
			return callback(err);
		collection.update({id: {$gt: 0}, m: 1, ts: topic.n, ct: topic.pr}, {$set: {m: 0, tid: topic.id}}, {multi: true}, function(err, ct) {
			if (err)
				return callback(err);
			return callback(null, ct);
		});
	});
};

question_service.getOneRandomQuestion = function(topicid, exceptions, callback) {
	//exceptions是个数组，用来表示已经选过的题目
	var ran = Math.random();
	db.collection('questions', function(err, collection) {
		if (err)
			return callback(10);
		collection.findOne({id: {$not: {$in: exceptions}}, i: {$gte: ran}}, function(err, ques) {
			if (err)
				return callback(11);
			if (!ques) {
				collection.findOne({id: {$not: {$in: exceptions}}, i: {$lte: ran}}, function(err, ques){
					if (err)
						return callback(12);
					if (!ques)
						return callback(13);//!!!!!!!!!!!!!!!
					return callback(null, ques);
				});
			}
			return callback(null, ques);
		});
	});
};