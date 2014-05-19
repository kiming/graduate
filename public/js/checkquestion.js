
$(document).ready(function() {
	/*$("#edit").modal({
		backdrop:true,
		keyboard:true,
		show:true
	});*/
	$.get('/topic/cates', function(data) {
		var obj = JSON.parse(data);
		for (var i in obj) {
			var entry = obj[i];
			var str = '<option value="' + entry.i + '">' + entry.n + '</option>';
			$('#cates1').append(str);
			$('#cates2').append(str);
		}
	});
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
	$('#topic').css('display', 'none');
	$('#inputmode').click(function() {
		setFormMode(parseInt($('#mode').val()));
	});
	$('#modal').on('hidden', function () {
		if (parseInt($('#refresh').val()) == 1)
			location.reload();
	});
});

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

function setRefreshFlag() {
	$('#refresh').val(1);
};

function approve(t) {
	$.get('/question/approve?id='+t, function(result) {
		var obj = JSON.parse(result);
		if (obj.f == 0) {
			show(obj.e.m);
		}
		else if (obj.f == 1) {
			setRefreshFlag();
			show("操作成功！");
		}
	});
};

function reject(t) {
	$.get('/question/reject?id='+t, function(result) {
		var obj = JSON.parse(result);
		if (obj.f == 0) {
			show(obj.e.m);
		}
		else if (obj.f == 1) {
			setRefreshFlag();
			show("操作成功！");
		}
	});
};

function allocate(t) {
	setFormMode(0);
	$.get('/question/getone?id=' + t, function(result1) {
		var obj = JSON.parse(result1);
		if (obj.f == 0)
			return show(obj.e.m);
		else if (obj.f == 1) {
			var question = obj.q;
			$('#cates1').val(obj.q.c);
			$.get('/topic/list?id=' + $('#cates1').val(), function(result) {
				var obj1 = JSON.parse(result);
				if (obj1.f==0) {
					$("#modal_msg").html(obj1.e.m);
					$("#modal").modal({
						backdrop:true,
    					keyboard:true,
    					show:true
					});
				}
				else if (obj1.f == 1) {
					var array = obj1.a;
					resetTopicSelect();
					for (var i in array) {
						var entry = array[i];
						$('#topic').append('<option value="' + entry.id + '">' + entry.n + '</option>');
					}
				}
			});

			$('#topics').val(obj.q.ts);
			$('#topic').val(obj.q.tp);
		}
		$('#qid').val(t);
		$("#edit").modal({
			backdrop:true,
			keyboard:true,
			show:true
		});
	});
};

function confirm_allocate() {
	$.post('/admin/topic/add', {
		c: $('#cates1').val(),
		n: $('#topics').val(),
		tp: $('#topic').val(),
		m: $('#mode').val(),
		q: $('#qid').val()
	}, function(result) {
		var obj = JSON.parse(result);
		if (obj.f == 0) {
			$('#edit').modal('hide');
			show(obj.e.m);
		}
			
		else if (obj.f == 1) {
			$("#edit").modal('hide');
			setRefreshFlag();
			show(obj.m);
		}

	});

};

var resetTopicSelect = function() {
	$('#topic').empty();
	$('#topic').append('<option value="0">请选择</option>');
};

var rekect = function(str) {
	show(str);
};