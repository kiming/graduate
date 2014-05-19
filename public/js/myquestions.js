$(document).ready(function() {
	$('#cates1').change(function() {
		$.get('/topic/list?id=' + $('#cates1').val(), function(result) {
			var obj = JSON.parse(result);
			if (obj.f==0) {
				$("#modal_msg").html(obj.e.m);
				$("#modal").modal({
					backdrop:true,
    				keyboard:true,
    				show:true
				});
			}
			else if (obj.f == 1) {
				var array = obj.a;
				resetTopicSelect();
				for (var i in array) {
					var entry = array[i];
					$('#topic').append('<option value="' + entry.id + '">' + entry.n + '</option>');
				}
			}
		});
	});
	$('#inputmode').click(function() {
		setFormMode(parseInt($('#mode').val()));
	});
	$('#modal').on('hidden', function () {
		if (parseInt($('#refresh').val()) == 1)
			location.reload();
	});
});

function reedit(qid) {
	$.get('/question/getone?id=' + qid, function(result) {
		var obj = JSON.parse(result);
		if (obj.f == 0)
			show(obj.e.m)
		else if (obj.f == 1) {
			var question = obj.q;
			setFormMode(1-question.m);
			$('#ques').val(question.q);
			var anss = question.a;
			$('#tans').val(anss[0]);
			$('#fansa').val(anss[1]);
			$('#fansb').val(anss[2]);
			$('#fansc').val(anss[3]);
			$('#qid').val(qid);
			$.get('/topic/cates', function(data) {
				var obj2 = JSON.parse(data);
				for (var i in obj2) {
					var en = obj2[i];
					var str = '<option value="' + en.i + '">' + en.n + '</option>';
					$('#cates1').append(str);
				}
				$('#cates1').val(question.c);
				$.get('/topic/list?id=' + question.c, function(result2) {
					var obj2 = JSON.parse(result2);
					if (obj2.f==0) {
						$("#modal_msg").html(obj2.e.m);
						$("#modal").modal({
							backdrop:true,
    						keyboard:true,
							show:true
						});
					}
					else if (obj2.f == 1) {
						var array2 = obj2.a;
						resetTopicSelect();
						for (var i in array2) {
							var entry = array2[i];
							$('#topic').append('<option value="' + entry.id + '">' + entry.n + '</option>');
						}
						$('#topic').val(question.tp);
						$('#topics').val(question.ts);
						$("#edit").modal({
							backdrop:true,
							keyboard:true,
							show:true
						});
					}
				});
			});
		}
	});
};

function deleteQ(qid) {
	$('#qid').val(qid);
	$('#confirm').modal({
		backdrop:true,
		keyboard:true,
		show:true
	});
};

function confirm_edit() {
	var a = [
		$('#tans').val(),
		$('#fansa').val(),
		$('#fansb').val(),
		$('#fansc').val()
	];
	$.post('/question/edit', {
		q: $('#ques').val(),
		a: a,
		qid: $('#qid').val(),
		c: $('#cates1').val(),
		tp: $('#topic').val(),
		ts: $('#topics').val(),
		m: $('#mode').val()
	}, function(result) {
		var obj = JSON.parse(result);
		if (obj.f == 0) {
			$("#edit").modal('hide');
			show(obj.e.m);
		}
		else if (obj.f == 1) {
			setRefreshFlag();
			$("#edit").modal('hide');
			show(obj.m);
		}
	});
};

function confirm_del() {
	$.get('/question/userdel?qid=' + $('#qid').val(), function(result) {
		var obj = JSON.parse(result);
		$('#confirm').modal('hide');
		if (obj.f == 0) {
			show(obj.e.m);
		}
		else if (obj.f == 1) {
			setRefreshFlag();
			show(obj.m);
		}
	});
};


function setFormMode(mode) {
	if (mode == 0) {
		$('#mode').val(1);
		$('#inputmode').text('列表选择');
		$('#topics').css('display', 'inline');
		$('#topic').css('display', 'none');
	}
	else {
		$('#mode').val(0);
		$('#inputmode').text('手动输入');
		$('#topic').css('display', 'inline');
		$('#topics').css('display', 'none');
	}
};

function show(str) {
	$("#modal_msg").html(str);
	$("#modal").modal({
		backdrop:true,
		keyboard:true,
		show:true
	});
};

var resetTopicSelect = function() {
	$('#topic').empty();
	$('#topic').append('<option value="0">请选择</option>');
};

function setRefreshFlag() {
	$('#refresh').val(1);
};

