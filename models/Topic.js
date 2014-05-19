
var categories = require("../config/category").data;
var topic_service = require("../services/topic_service");
var indices_service = require("../services/indices_service");

function Topic(topic) {
	this.id = topic.id;
	this.n = topic.name;
	this.pr = topic.pr;


	/* 三级子目录的结构
	 * {cid: 编号, cn: name}
	 * 一个二级目录中ct的结构例子
	 * [{cid:22101, cn: }]
	 *
	 **/
};

module.exports = Topic;

Topic.getCateList = function() {
	return categories;
};
 
Topic.getTopicListByCateId = function(cateid, callback) {
	topic_service.getTopicByCate(cateid, function(err, topic) {
		if (err)
			return callback({i: 1, m: '连接错误'});
		return callback(null, topic);
	});
};

Topic.getCateNameByID = function(id, callback) {
	for (var i in categories) {
		var entry = categories[i];
		if (entry.i == id)
			return entry.n;
	}
	return "不合法";
};

Topic.getTopicNameByID = function(id, callback) {
	topic_service.getTopicById(id, function(err, topic) {
		if (err)
			return callback(err);
		return callback(null, topic.n);
	});
};

Topic.addTopic = function(tpname, cate, callback) {
	indices_service.returnValue('topic', function(err, val) {
		if (err)
			return callback({i: 61, m: '连接错误'});
		indices_service.addOneBack(val, 'topic', function(err, new_val) {
			if (err) {
				indices_service.returnValue('topic', function(err, val2) {
					if (val + 1 != val2)
						return callback({i: 62, m: '计数器错误'});
					saveTopic(val, tpname, cate, callback); 
				});
			}
			//无错误的话
			saveTopic(val, tpname, cate, callback); 
		});
	})
};

var saveTopic = function(tpid, tpname, cate, callback) {
	var topic = new Topic({
		id: tpid,
		name: tpname, 
		pr: cate
	});
	topic_service.addTopic(topic, function(err, flag) {
		if (err)
			return callback({i: 71, m: '连接错误'});
		if (!flag)
			return callback({i: 72, m: '新建话题失败'});
		return callback(null, topic);
	});
};