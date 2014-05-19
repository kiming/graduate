
var user_service = require('../services/user_service');
var indices_service = require("../services/indices_service");

function User(user) {
	this.id;//用户id
	this.m = user.m;//用户邮箱mailbox
	this.p = user.p;//用户密码
	this.n = user.n;//用户昵称
	this.g;//grade
};

module.exports = User;

User.save = function(user, callback) {
	indices_service.returnValue('user', function(err, val) {
		if (err)
			return callback({i: 1, m: '连接错误'});
		user.id = val;
		indices_service.addOneBack(val, 'user', function(err, new_val) {
			if (err){
				indices_service.returnValue('user', function(err, val2) {
					if (val + 1 == val2)
						writeBack(user, callback);
					else
						return callback({i: 2, m: '计数器错误'});
				});
			}
			writeBack(user, callback);
		});
	});
};

var writeBack = function(user, callback) {
	user_service.createUser(user, function(err, u){
		if (err)
			return callback({i: 10, m: '连接错误'});
		if (!u)
			return callback({i: 11, m: '创建用户失败'});
		return callback(null, u);
	});
};

User.checkLogin = function(u, callback) {
	user_service.checkUser(u, function(err, user) {
		if (err)
			return callback({i: 0, m: '连接错误'});
		if (!user)
			return callback({i: 0, m: '用户名或密码错误'});
		return callback(null, user);
	});
};