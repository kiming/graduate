
var events = require('events');
var Question = require('../models/Question');
var match_service = exports;

var matches = {};

match_service.createMatch = function(matchid, user1, user2, topicid, callback) {
	var match = {
		tp: topicid,//topic ID
		u1: user1.id,
		u2: user2.id,
		q: [],//问题的id集合
		tq: null,//当前的问题
		s1: [],//user1的分数
		s2: [],//user2的分数
		as1: 0,//user1对本题的回答
		as2: 0,//user2对本题的回答
		t1: [],//user1所花费的时间 如t1: []
		t2: [],//user2所花费的时间
		n: 0,//双方已经完成了多少个问题了
		re1: null,//第一个等待
		re2: null//第二个等待
	};
	matches[matchid] = match;

	Question.getRandomQuestion(match.tp, match.q, function(err, ques) {
		if (err) 
			return callback(err);
		var arr = give_random_list(4);
		var ass = random_sort_arr([ques.ac, ques.a1, ques.a2, ques.a3] ,arr);
		match.tq = {
			tt: ques.tt,
			as: ass,
			ar: arr
		};
		var user_q = {
			tt: ques.tt,
			as: ass
		};
		match.q.push(ques.id);
		return callback(null, user_q);
	});
};

match_service.waitForOther = function(res, uid, matchid) {
	var match = matches[matchid];
	if (uid == match.u1)
		match.re1 = res;
	else
		match.re2 = res;
};

match_service.answerQuestion = function(res, choice, time_cost, uid, matchid) {
	var match = matches[matchid];
	//先判断答案是否正确
	var choice = match.tq.ar[choice - 1];
	if (choice == 1) {//答案正确
		if (uid == match.u1) {
			match.t1.push(time_cost);
			match.s1.push(20 - time_cost);
			match.as1 = choice;
			res.end(JSON.stringify({f: 1, c: 1, m: '回答正确', s: 20 - time_cost}));
			match.re2.end(JSON.stringify({f: 1, c: 1, s: 20 - time_cost, cs: choice}));
		};
		else {
			match.t2.push(time_cost);
			match.s2.push(20 - time_cost);
			match.as2 = choice;
			res.end(JSON.stringify({f: 1, m: '回答正确', s: 20 - time_cost}));
			match.re1.end(JSON.stringify({f: 1, c: 1, s: 20 - time_cost, choice}));
		}
	}
	else {//答案错误
		var right = give_right(match.tq.ar);
		if (uid == match.u1) {
			match.t1.push(time_cost);
			match.s1.push(0);
			match.as1 = choice;
			res.end(JSON.stringify({f: 1, c: 0, r: right}));
			match.re2.end(JSON.stringify({f: 1, c: 1, s: 0, cs: choice}));
		}
		else {
			match.t2.push(time_cost);
			match.s2.push(0);
			match.as2 = choice;
			res.end(JSON.stringify({f: 1, c: 0, r: right}));
			match.re1.end(JSON.stringify({f: 1, c: 1, s: 0, cs: choice}));
		}
	}
};

var give_random_list = function(size) {
	var i = 1, a_in = [], a_out = [];
	for (; i <= size; i++)
		a_in.push(i);
	while(a_in.length > 0) {
		var index = Math.ceil(Math.random() * a_in.length) - 1;
		a_out.push((a_in.splice(index, 1))[0]);
	}
	return a_out;
};

var random_sort_arr = function(data, arr) {xc
	var out = [];
	for (var i in arr)
		out.push(data[arr[i] - 1]);
	return out;
};

var sum = function(arr) {
	var out = 0;
	for (var i in arr)
		out += arr[i];
	return out;
};

var give_right = function(arr) {
	for (var i in arr)
		if (arr[i] == 1)
			return i+1;
};