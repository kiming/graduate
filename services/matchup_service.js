
var events = require('events');
var match_service = require('./match_service');
var matchup_service = exports;
var emitter = new events.EventEmitter();
var counter = 0;

var user_buffer = [];
var res_buffer = [];
var res_buffer2 = {};
var last_time = [];

var unchecked_matches = {};
//{'m1': }

matchup_service.beginJoin = function(user, topic_id, res) {
	if (!user_buffer[topic_id] || (new Date().getTime() - last_time[topic_id] >= 30000)) {
		user_buffer[topic_id] = user;
		res_buffer[topic_id] = res;
		last_time[topic_id] = new Date().getTime();
	}
	else {
		var last_user = user_buffer[topic_id];
		var last_res = res_buffer[topic_id];
		user_buffer[topic_id] = null;
		res_buffer[topic_id] = null;
		last_time[topic_id] = null;
		var unchecked_match = {t: topic_id, u1: last_user, u2: user, f: false};
		var matchid = 'm' + counter++;
		unchecked_matches[matchid] = unchecked_match;
		setTimeout(function() {
			if (res_buffer2[matchid])
				res_buffer2[matchid].end(JSON.stringify({f: 0, e: {i: 10, m: '对手已放弃，请重新匹配'}}));
			unchecked_matches[matchid] = null;
			res_buffer2[matchid] = null;
		}, 20000);//20秒钟之后自动删除该场未成立的比赛
		res.end(JSON.stringify({f: 1, m: matchid, u: last_user}));
		last_res.end(JSON.stringify({f: 1, m: matchid, u: user}));
	}
};

matchup_service.confirmJoin = function(user, matchid, res) {
	var unchecked_match = unchecked_matches[matchid];
	if (!unchecked_match)
		return res.end(JSON.stringify({f: 0, e: {i: 0, m: '该场比赛已超时关闭'}}));
	if (user.id == unchecked_match.u1.id || user.id == unchecked_match.u2.id) {
		if (unchecked_match.f) {//如果对方已经同意过了
			match_service.createMatch(matchid, unchecked_match.u1, unchecked_match.u2, unchecked_match.t, function(err, ques) {
				var out = JSON.stringify({f: 1, q: ques});
				res_buffer2[matchid].end(out);
				res.end(out);
			});
		}
		else {
			unchecked_match.f = true;
			res_buffer2[matchid] = res;
		}
	}
	else {
		res.end(JSON.stringify({f: 0, e: {i: 1, m: '你并没有参与该场比赛'}}));
	}
};