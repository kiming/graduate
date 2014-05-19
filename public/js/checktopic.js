
function approve(t) {
	$.get('/topic/approve?id='+t, function(result) {
		var obj = JSON.parse(result);
		if (obj.f == 0) {
			$("#modal_msg").html(obj.e.m);
			$("#modal").modal({
				backdrop:true,
    			keyboard:true,
    			show:true
			});
		}
		else if (obj.f == 1) {
			location.reload();
		}
	});
}

function reject(t) {
	$.get('/topic/reject?id='+t, function(result) {
		var obj = JSON.parse(result);
		if (obj.f == 0) {
			$('#modal_msg').html(obj.e.m);
			$("#modal").modal({
				backdrop:true,
    			keyboard:true,
    			show:true
			});
		}
		else if (obj.f == 1) {
			$("#modal_msg").html("操作成功！");
			$("#modal").modal({
				backdrop:true,
    			keyboard:true,
    			show:true
			});
		}
	});
}