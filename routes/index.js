
/*
 * GET home page.


exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

*/

var Topic = require("../models/Topic");
var Question = require("../models/Question");
var User = require("../models/User");
var matchup_service = require('../services/matchup_service');

module.exports = function(app) {
	app.get('/', function (req, res) {
		return res.render('index', { title: 'Express' });
	});

  app.get('/admin', function(req, res) {
  	return res.redirect('/admin/login');
  });

  app.get('/admin/login', function(req, res) {
  	if (req.session.user)
  		return res.redirect('/admin/index');
  	return res.render('index');
  });

  app.get('/user/login', function(req, res) {
  	if (req.session.user)
  		return res.redirect('/user/index');
  	return res.render('login');
  });

  app.get('/user/logout', function(req, res) {
    req.session.user = null;
    return res.redirect('/user/login');
  });

  app.post('/user/login', function(req, res) {
    res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
    var u = {
      m: req.body.m,
      p: require('crypto').createHash('md5').update(req.body.p).digest('hex')
    };
    User.checkLogin(u, function(err, user) {
      if (err)
        return res.end(JSON.stringify({f: 0, e: err}));
      delete user.p;
      delete user._id;
      req.session.user = user;
      return res.end(JSON.stringify({f: 1, m: '登录成功！'}));
    });
  });

  app.get('/user/reg', function(req, res) {
    return res.render('register');
  });

  app.post('/user/reg', function(req, res) {
    res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
    var user = new User({
      m: req.body.m,
      p: require('crypto').createHash('md5').update(req.body.p).digest('hex'),
      n: req.body.n
    });
    User.save(user, function(err, newuser) {
      if (err)
        return res.end(JSON.stringify({f: 0, e: err}));
      delete newuser.p;
      delete newuser._id;
      req.session.user = newuser;
      return res.end(JSON.stringify({f: 1, m: '注册成功'}));
    });
  });

  app.get('/question/add', function(req, res) {
  	return res.render("raiseup");
  });

  app.get('/topic/cates', function(req, res) {
    res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
    return res.end(JSON.stringify(Topic.getCateList()));
  });

  app.get('/topic/list', function(req, res) {
    res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
    Topic.getTopicListByCateId(parseInt(req.query.id), function(err, array) {
      if (err)
        return res.end(JSON.stringify({f: 0, e: err}));
      return res.end(JSON.stringify({f: 1, a: array}));
    });
  });

  app.post('/question/upload', function(req, res) {
    res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
    var question = new Question({
      ac: req.body.ac,
      a1: req.body.a1,
      a2: req.body.a2,
      a3: req.body.a3,
      ct: parseInt(req.body.ct),
      tid: parseInt(req.body.tid),
      ts: req.body.ts,
      tt: req.body.tt,
      m: parseInt(req.body.m)
    });
    Question.saveQuestion(question, function(err, ques) {
      if (err)
        return res.end(JSON.stringify({f: 0, e: err}));
      return res.end(JSON.stringify({f: 1, m: '问题已经上传成功，正在等待审核'}));
    });
  });

  app.get('/question/check', function(req, res) {
    Question.getAllUnchecked(function(err, array) {
      if (err)
        return res.end('读取列表时发生错误，请刷新或尝试拨打110');
      return res.render('checkquestion', {array: array});

      /*
      if (err)
        return res.end(JSON.stringify({f: 0, e: err}));
      return res.end(JSON.stringify({f: 1, a: array}));*/
    });
  });

  app.get('/question/approve', function(req, res) {
    res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
    Question.approve(parseInt(req.query.id), function(err, question) {
      if (err)
        return res.end(JSON.stringify({f: 0, e: err}));
      return res.end(JSON.stringify({f: 1}));
    });
  });

  app.get('/question/reject', function(req, res) {
    res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
    Question.reject(parseInt(req.query.id), function(err, question) {
      if (err)
        return res.end(JSON.stringify({f: 0, e: err}));
      return res.end(JSON.stringify({f: 1}));
    });
  });

  app.get('/matchup/join', function(req, res) {
    res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
    if (!req.session.user)
      return res.end(JSON.stringify({f: 0, e: {i: 0, m: '请先登录'}}));
    matchup_service.beginJoin(req.session.user, parseInt(req.query.topic), res);
  });

  app.get('/matchup/confirm', function(req, res) {
    res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
    if (!req.session.user)
      return res.end(JSON.stringify({f: 0, e: {i: 0, m: '请先登录'}}));
    matchup_service.confirmJoin(req.session.user, req.query.match, res);
  });

  app.get('/match/wait_answer', function(req, res) {
    res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
    if (!req.session.user)
      return res.end(JSON.stringify({f: 0, e: {i: 0, m: '请先登录'}}));
  });

  app.get('/match/answer', function(req, res) {
    res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
  });

  //this is for test
  app.get('/match/getq', function(req, res) {
    res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
    Question.getRandomQuestion(parseInt(req.query.topic), [1,2,4,5], function(err, ques) {
      if (err)
        return res.end(JSON.stringify({f: 0, e: err}));
      return res.end(JSON.stringify({f: 1, q: ques}));
    });
  });

};