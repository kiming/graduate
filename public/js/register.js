function handin() {
	if ($('#pw').val() != $('#pwr').val())
		return inform('对不起，两次输入的密码不一致');
	
	$.post('/user/reg', {
		m: $('#mailbox').val(),
		p: $('#pw').val(),
		n: $('#nick').val()
	}, function(result) {
		var obj = JSON.parse(result);
		if (obj.f == 1)
			return inform(obj.m)
		else if (obj.f == 0)
			return inform(obj.e.m);
	});	
};

function inform(str) {
	$("#modal_msg").html(str);
	$("#modal").modal({
		backdrop:true,
    	keyboard:true,
    	show:true
	});
};