
var question_service = require("../services/question_service");
var topic_service = require("../services/topic_service");
var indices_service = require("../services/indices_service");
var Topic = require("./Topic");

function Question(question) {
	this.id;//qid
	this.ct = question.ct;//cate 在uncheckedQuestion中会用到，通过时会被删除
	this.tid = question.tid;//topic id是属于哪个topic的

	this.ts = question.ts;//topic str//在uncheckedQuestion中会用到，通过时会被删除

	this.m = question.m;//mode 0-topic不是手动输入的 1-topic是手动输入的

	this.tt = question.tt;//title 题面
	this.ac = question.ac;//answer correct正确答案内容
	this.tc = 0;//time correct正确答案上总共花的时间(秒)
	this.nc = 0;//number correct正确答案被选次数
	this.a1 = question.a1;//答案1内容
	this.t1 = 0;
	this.n1 = 0;
	this.a2 = question.a2;//答案2内容
	this.t2 = 0;
	this.n2 = 0;
	this.a3 = question.a3;
	this.t3 = 0;
	this.n3 = 0;
	this.nn = 0;//该题目被回答总次数
	this.tn = 0;//该题目被回答总时间
	this.di = 50;//难度系数，正确率和回答分数的调和平均数
	this.i = Math.random();//随机数
};

module.exports = Question;

Question.saveQuestion = function(question, callback) {
	if (question.m == 0) {//默认模式，topic是选择的
		saveQuestionService(question, callback);
	}
	else if (question.m == 1) {//topic是手动输入的
		console.log('here1');
		topic_service.getTopicByCateAndName(question.ct, question.ts, function(err, topic){
			console.log('here2');
			if (err)
				return callback({i: 21, m: '连接错误'});
			if (topic) {
				question.m = 0;
				question.tid = topic.id;
			}
			saveQuestionService(question, callback);
		});
	}
};

var saveQuestionService = function(question, callback) {
	indices_service.returnValue('question', function(err, val) {
		if (err)
			return callback({i: 1, m: '连接错误'});
		question.id = val;
		indices_service.addOneBack(val, 'question', function(err, new_val) {
			if (err) {
				indices_service.returnValue('question', function(err, val2) {
					if (val + 1 == val2)
						writeBack(question, callback);
					else
						return callback({i: 2, m: '计数器错误'});
				});
			}
			writeBack(question, callback);
		});
	});
};

var writeBack = function(question, callback) {
	question_service.addQuestion(question, 'unques', function(err, ques) {
		if (err)
			return callback({i: 3, m: '连接错误'});
		return callback(null, ques);
	});
};

Question.getAllUnchecked = function(callback) {
	question_service.getAllUncheckedQuestions(function(err, array) {
		if (err)
			return callback({i: 1, m: '连接错误'});
		searchTopicNames(array, callback);
	});
};

var searchTopicNames = function(array, callback) {
	var todo = [];
	for (var index in array) {
		if (array[index].m == 0)
			todo.push(array[index]);
		else
			array[index].cs = Topic.getCateNameByID(array[index].ct);
	}
	var length = todo.length - 1, i = 0;
	if (length == -1)
		return callback(null, array);
	todo.forEach(function(entry) {
		entry.cs = Topic.getCateNameByID(entry.ct);
		Topic.getTopicNameByID(entry.tid, function(err, name) {
			if (err)
				entry.ts = '查询失败';
			//console.log(name);
			entry.ts = name;
			if (i++ == length)
				return callback(null, array);
		});
	});
};

Question.approve = function(id, callback) {
	question_service.getQuestionById(id, 'unques', function(err, origin) {
		if (err)
			return callback({i: 0, m: '连接错误'});
		if (!origin)
			return callback({i: 1, m: '该问题不存在，可能已被处理，请刷新页面再试'});
		if (origin.m == 0) {
			//删除m和ts
			delete origin.ts;
			delete origin.m;
			moveCheckedQuestion(origin, function(err) {
				if (err)
					return callback(err);
				return callback(null);
			});
		}
		else if (origin.m == 1) {
			//首先创建新的topic
			Topic.addTopic(origin.ts, origin.ct, function(err, topic) {
				if (err)
					return callback({i: 2, m: '连接错误'});
//上次写到这里了，下面应该使用question_service.mergeQuestionsToThisTopic
				question_service.mergeQuestionsToThisTopic(topic, function(err, ct) {
					if (err)
						return callback({i: 3, m: '连接错误'});
					delete origin.ts;
					delete origin.m;
					moveCheckedQuestion(origin, function(err) {
						if (err)
							return callback(err);
						return callback(null);
					});
				});
			});
		}
	});
};

var moveCheckedQuestion = function(question, callback) {
	question_service.addQuestion(question, 'questions', function(err, ques) {
		if (err)
			return callback({i: 11, m: '连接错误'});
		if (!ques)
			return callback({i: 12, m: '问题转移失败'});
		question_service.deleteQuestion(question.id, 'unques', function(err, ct) {
			if (err)
				return callback({i: 13, m: '连接错误，删除失败'});
			if (!ct)
				return callback({i: 14, m: '删除失败'});
			return callback(null);
		});
	});
};


/*
			indices_service.returnValue('topic', function(err, val) {
				if (err)
					return callback({i: 2, m: '连接错误'});
				indices_service.addOneBack(val, 'question', function(err, new_val) {
					if (err)
						return callback({i: 3, m: '连接错误'});
					
				});
				indices_service.returnValue('question', function(err, val2) {
					if (val + 1 != val2)
						return callback({i: 3, m: '计数器错误'});

				});
			});

*/

Question.reject = function(id, callback) {
	if (id <= 0)
		return callback({i: 1, m: id+'不是一个合法的id'});
	question_service.updateQuestionID(id, -id, function(err, ct) {
		if (err)
			return callback({i: 2, m: "连接错误"});
		if (ct == 0)
			return callback({i: 3, m: '失败，请重试'});
		return callback(null);
	});
};

Question.getRandomQuestion = function(topicid, exceptions, callback) {
	question_service.getOneRandomQuestion(topicid, exceptions, function(err, ques) {
		if (err == 13)
			return callback({i: 4, m: '没有找到相关的问题'});
		if (err)
			return callback({i: 5, m: '连接错误'});
		return callback(null, ques);
	});
};