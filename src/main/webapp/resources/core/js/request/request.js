var status_jsp;
var req_type;
var reqStatusList;
var reqUpdatedHist;
var reqHist = [];

function createRequest(){
	projApproved = undefined;
	req_type = undefined;
	loadProjInfo(null, null, 'createReq');
	makeFieldsUneditable('createReq');
	$back.removeClass('hide');
}

function createProjRequest(){
	loadReqInfo(null, null, 'createProjReq');
	loadProjInfo('reqinfo-div', null, 'addProj');
	loadProjAdtlInfo('projinfo-div');
	$('#deployment-col').remove();
	setFieldsToEditable();
	$back.removeClass('hide');
	userPreviliges();
}

//NEW -Ronnie
function userPreviliges(){
	if (useraccess == "bu"){
		$('#projInfra').remove();
		$('#projcost-col').removeClass("col-xs-6");
		$('#projcost-col').addClass("col-xs-12");
		$("#projSaveBtn, #projCancelBtn, #proj-period :input").prop('disabled',false);
	}
	
	if(useraccess != "pm"){
		$('#projCostStatus').remove();
	}
}

function loadReqInfo(afterDiv, reqNo, reqType) {
	if(useraccess != "pm"){
		$('#projCostStatus').remove();
	}
	try {
		var $afterdiv = $('#' + afterDiv);

			$.ajax({
					url : contextPath + "/request/info",
					method : "GET",
					async : false,
					success : function(result) {
						// if (checkErrorOnResponse(result)) {
						if (afterDiv != null) {
							$afterdiv.after(result);

						} else {
							$main_body.html(result);
						}

						if (reqNo != null) {
							$('#reqinfo-div').find('.panel-heading').html('Request Details');
							populateReqInfo(getReqInfoByNo(reqNo));
							
							if (projApproved != 1) {
								$('#reqinfo-div').find('span.required').removeClass('hide');
							}
							
							$('#attachDiv').show();
							if (useraccess == 'pm' && nvl($('#ravBy').val(), '') == '') {
								// if(useraccess == 'ba' && nvl($('#ravBy').val(), '') == ''){
								$('#reqSaveBtn').html('Approve').attr('disabled', false);
								setFieldsToEditable();
								updateBtnFunction();
							} else if (useraccess == 'bu' && nvl($('#ravBy').val(), '') == '') {
								setFieldsToEditable();
								updateBtnFunction();
							} else if (useraccess == 'ba' && nvl($('#ravBy').val(), '') == '') {
								setFieldsToEditable();
								updateBtnFunction();
							}
						}
						if (reqType == 'createProjReq') {
							$('#reqinfo-div').hide();
						}

					}
				});

	} catch (e) {
		alert('loadReqInfo - ' + e); 
	}

}

function getReqAttachmentList(reqNo){
	$("#fileDiv").empty();
	try {
		$.ajax({
			url : contextPath + "/request/attachments?reqNo="+reqNo,
			method : "GET",
	        async: false,
			success : function(response) {
				var obj = JSON.parse(response);
				for(var k in obj)
				    if ({}.hasOwnProperty.call(obj, k))
				    	 $("#fileDiv").append(
				                    $("<tr><td></td></tr>").html(obj[k]));
			},
		});
	} catch (e) {
		alert( 'getReqStatusList - ' + e);
	}
}

function setFieldsToEditable(){
	
	$('#reqSummary').prop('readOnly');
	$('#reqSummary').attr('readOnly',false);
	$('#reqDesc').prop('readOnly');
	$('#reqDesc').attr('readOnly',false);
	$('#reqRemarks').prop('readOnly');
	$('#reqRemarks').attr('readOnly',false);
	
	if (useraccess == "bu") {
		$('#assignedDev').attr('readOnly');
		$('#assignedDev').attr('readOnly',true);
		$('#assignedBA').prop('readOnly',true);
		$('#assignedQA').attr('readOnly',true);
		$('#assignedOPs').attr('readOnly');
		$('#assignedOPs').attr('readOnly',true);
	} else {
		$('#assignedDev').attr('readOnly');
		$('#assignedDev').attr('readOnly',false);
		$('#assignedBA').prop('readOnly',false);
		$('#assignedQA').attr('readOnly',false);
		/* added by SHARIE MANIPON 11.21.2017 */
		$('#assignedOPs').attr('readOnly');
		$('#assignedOPs').attr('readOnly',false);
	}
	
}

function initReqInfo(){
	if(nvl($('#reqNo').val(), '') == ''){
		$('#attachDiv').hide();
	}
	$('#reqUpdateBtn').hide();
	$('#reqCancelBtn').click(function(){
		loadMainPage();
		loadRequestList();
		$back.addClass('hide');	
	});
	
	$('#reqSaveBtn').click(function(){
		if(nvl($('#reqNo').val(), '') == ''){
			insertRequest();
		}else{
			// Added By Bryan
			var errCount = checkRequired("approve");
			if(errCount == 0){
				/* added by SHARIE MANIPON 11.21.2017 */
				var message = "Hi, "+ $('#reqRequestor').val() + "\n\nYour project has been approved!";
				   if($('#projTotBudget').val() == '0') {
					message = message + "\n\nNote: You have 0.00 balance as your total budget for the project.";
				}
				$("#reqUpdateBtn").hide();
				approveRequest();
				sendEmailReq($('#reqNo').val(), message);
			}else{
				$('#savingSuccess').modal('toggle');
				$('#savingSuccess').find("#gridSystemModalLabel").text('Warning');
				$('#saveProjNo').html('Please fill all the required fields.');
			}
		}   
		//$("#reqUpdateBtn").hide();
	});

} 

function updateBtnFunction(){
	$('#reqUpdateBtn').show();
	$('#reqUpdateBtn').attr('disabled', false);
	$('#reqUpdateBtn').click(function(){
		
		//Added by Bryan
		var errCount = checkRequired("update");
		if(errCount == 0){
			updateProj();
		}else{
			$('#savingSuccess').modal('toggle');
			$('#savingSuccess').find("#gridSystemModalLabel").text('Warning');
			$('#saveProjNo').html('Please fill all the required fields.');
		}
		
		setTimeout(function(){
			updateReq();
		}, 1000);
	});
}

/*function updateBtnFunction(){
	$('#reqUpdateBtn').show();
	$('#reqUpdateBtn').attr('disabled', false);
	$('#reqUpdateBtn').click(function(){
		updateReq();
	});
}*/

/* added by SHARIE MANIPON 11.21.2017 */
function sendEmailReq(requestNo, msg){
	var reqName = $('#reqRequestor').val();
	try {
		$.ajax({
			url : contextPath + "/request/sendEmailReq",
			method : "POST",
			data : {subject	  : "Sample Request E-mail",
					message   : msg, 
					sender    : "trueci.projectmanagement@gmail.com",
					password  : "projectmanagement12345",
					reqNo	  : requestNo},
			async: false,
			success : function(result) {},
		});
	} catch (e) {
		alert(e);
	}
}

function updateReq(){
	try {
		$.ajax({
			url : contextPath + "/request/updateReq",
			method : "POST",
			data : prepareRequestInfo(),
			async: false,
			success : function(result) {
				if(result.status == 'SUCCESS'){
					$('#reqNo').val(padLeft(result.reqNo, 8));
					$('#dateSubmitted').val(result.dateSubmitted);
					if(useraccess == 'pm'){
					//if(useraccess == 'ba'){
						$('#reqSaveBtn').html('Approve');
					}else{
						disableReqSave(true);
					}
					//loadReqStatusMain('reqinfo-div', result.reqNo);
				}
			},
		});
	} catch (e) {
		alert( 'insertRequest - ' + e);
	}
}

function disableReqInfo(disable){
	var fields = [/*'ravBy', */'reqSummary', 'reqDesc', 'reqRemarks'];
	for (i = 0, len = fields.length; i < len; i++) { 
		var $obj = $('#' + fields[i]);
		if(disable && !$obj.prop('readonly')){
			$obj.prop('readonly', disable);
		}else if(!disable && $obj.prop('readonly')){
			$obj.prop('readonly', disable);
		}
	}
}

function disableInvolved(disable){
	var fields = [/*'ravBy', */'assignedDev','assignedBA','assignedQA','assignedOPs', 'reqRemarks', 'seachDeveloper','searchBA','searchQA','searchOPs'];
	for (i = 0, len = fields.length; i < len; i++) { 
		var $obj = $('#' + fields[i]);
		if(disable && !$obj.prop('readonly')){
			//$obj.prop('readonly', disable);
			$obj.prop('disabled', disable);
		}else if(!disable && $obj.prop('readonly')){
			$obj.prop('readonly', disable);
		}
	}
}

function showReqFile(show){
	if(show){
		$('#reqFile').addClass('hide');
	}else{
		$('#reqFile').removeClass('hide');
	}
}

function disableReqSave(disable){
	var $obj = $('#reqSaveBtn');
	if(disable && !$obj.prop('disabled')){
		$obj.prop('disabled', disable);
	}else if(!disable && $obj.prop('disabled')){
		$obj.prop('disabled', disable);
	}
}

function insertRequest(){
	try {
		$.ajax({
			url : contextPath + "/request/save",
			method : "POST",
			data : prepareRequestInfo(),
			async: false,
			success : function(result) {
				if(result.status == 'SUCCESS'){
					$('#reqNo').val(padLeft(result.reqNo, 8));
					$('#dateSubmitted').val(result.dateSubmitted);
					$('#reqRequestor').val(result.requestor);
					if(useraccess == 'pm'){
					//if(useraccess == 'ba'){ // remove -Arvic
						$('#reqSaveBtn').html('Approve');
					}else{
						disableReqSave(true);
					}
					loadReqStatusMain('reqinfo-div', result.reqNo);
				}
			},
		});
	} catch (e) {
		alert( 'insertRequest - ' + e);
	}
}

function insertProjRequest(){
	try {
		$.ajax({
			url : contextPath + "/request/saveproj",
			method : "POST",
			data : prepareProjRequestInfo(),
			async:false,
			success : function(result) {
//				if(result.status == 'SUCCESS'){
//					$('#reqNo').val(padLeft(result.reqNo, 8));
//					$('#dateSubmitted').val(result.dateSubmitted);
//					$('#reqRequestor').val(result.requestor);
					if(useraccess == 'pm'){
						$('#reqSaveBtn').html('Approve');
					}else{
						disableReqSave(true);
					}
//					loadReqStatusMain('reqinfo-div', result.reqNo);
//				}
			},
		});
	} catch (e) {
		alert( 'insertRequest - ' + e);
	}
}

function approveRequest(){
	try {
		$('#ravBy').val($('#username-header').html());
		$.ajax({
			url : contextPath + "/request/approve",
			method : "POST",
			data : prepareRequestInfo(),
			async: false,
			success : function(result) {
				//if (checkErrorOnResponse(result)) {
				if(result == 'success'){
					if(req_type == 1){
						approveProject();
					}
					disableReqSave(true);
					changeReqStatus(2);
					reqStatusTimer();
				}
			},
		});
	} catch (e) {
		alert( 'insertRequest - ' + e); 
	}
}

function populateReqInfo(req){
	req_type = req.requestType;
	$('#reqNo').val(padLeft(nvl(req.reqNo, ''), 8));
	$('#dateSubmitted').val(nvl(req.dateSubmitted, ''));
	$('#ravBy').val(nvl(req.ravBy, ''));
	$("#assignedDevId").val(nvl(req.devId,''));
	$("#assignedBAId").val(nvl(req.baId,''));
	$("#assignedQAId").val(nvl(req.qaId,''));
	$("#assignedOPsId").val(nvl(req.opId,'')); // SHARIE
	$('#reqSummary').val(unescapeHTML(nvl(req.summary, '')));
	$('#assignedDev').val(nvl(req.assignedDev, ''));
	$('#assignedBA').val(nvl(req.assignedBA, ''));
	$('#assignedQA').val(nvl(req.assignedQA, ''));
	$('#assignedOPs').val(nvl(req.assignedOPs, '')); // SHARIE
	$('#assignedDevEmail').val(nvl(req.devMail,''));
	$('#assignedBAEmail').val(nvl(req.baMail,''));
	$('#assignedQAEmail').val(nvl(req.qaMail,''));
	$('#assignedOPsEmail').val(nvl(req.opMail,'')); // SHARIE
	$('#reqDesc').val(unescapeHTML(nvl(req.desc, '')));
	$('#reqRemarks').val(unescapeHTML(nvl(req.remarks, '')));
	$('#reqRequestor').val(unescapeHTML(nvl(req.requestor, '')));
}

function prepareRequestInfo(){
	var req = {};
	req.reqNo = $('#reqNo').val();
	req.projNo = $('#projNo').val();
	req.summary = $('#reqSummary').val();
	req.dateSubmitted = $('#dateSubmitted').val();
	req.ravBy = $('#ravBy').val();
	req.assignedDev = $('#assignedDevId').val();
	req.assignedBA = $('#assignedBAId').val();
	req.assignedQA = $('#assignedQAId').val();
	req.assignedOPs = $('#assignedOPsId').val(); // SHARIE
	req.desc = $('#reqDesc').val();
	req.remarks = $('#reqRemarks').val();
	req.requestor = $('#reqRequestor').val();
	req.requestType = req_type;
	return req;
}

function prepareProjRequestInfo(){
	var req = {};
	req.reqNo = $('#reqNo').val();
	req.projNo = $('#projNo').val();
	req.summary = 'Project Request - ' + $('#projName').val();
	req.dateSubmitted = $('#dateSubmitted').val();
	req.ravBy = $('#ravBy').val();
	req.assignedDev = $('#assignedDev').val();
	req.assignedBA = $('#assignedBAId').val();
	req.assignedQA = $('#assignedQAId').val();
	req.assignedOPs = $('#assignedOPs').val(); //SHARIE
	req.desc = $('#reqDesc').val();
	req.remarks = 'Project Request';
	req.requestor = $('#reqRequestor').val();
	req.requestType = 1;
	return req;
}

function getReqInfoByNo(reqNo){
	var obj = null;
	$.ajax({
		url : contextPath + "/request/infobyno?reqNo="+reqNo,
		method : "GET",
        async: false,
		success : function(result) {
			//if (checkErrorOnResponse(result)) {
			obj = result;
			//getReqAttachmentList(reqNo);
			//}
		},
	});
	return obj;
}

function loadReqStatusMain(afterDiv, reqNo){
	try {
		var $afterdiv = $('#'+afterDiv);
		$.ajax({
			url : contextPath + "/request/statusmain?reqNo="+reqNo,
			method : "GET",
			async: false,
			success : function(result) {
				//if (checkErrorOnResponse(result)) {
				if(afterDiv != null){
					$afterdiv.after(result);
				}else{
					$main_body.html(result);
				}
				if(reqNo != null){
					loadReqStatus(reqNo);
					getUpdatedReqHist();
					reqStatusTimer();
				}
				//}
			},
		});
	} catch (e) {
		alert( 'loadReqStatusMain - ' + e);
	}
}

function loadReqStatus(reqNo){
	var $req_status_body = $('#req-status-body');
	if(reqStatusList == null) getReqStatusList();
	for (i = 0, ctr = 1, len = reqStatusList.length; i < len; i++) { 
		var html = ''
		if(reqStatusList[i].lastTag == 'N'){
			html = status_jsp;
		}else if(reqStatusList[i].lastTag == 'Y'){
			html = '<div id="reqstatus-div" class="col-xs-3 hide" rsno="0">' +
				   '<div id="status-dtl"></div>' +
				   '<span class="finish-flag"></span>' +
				   '</div>';
		}
		if(ctr == 1){
			html = '<div class="row">' + html + '</div>';
		}
		if(i == 0){
			$req_status_body.html(html);
		}else if(ctr == 1){
			$req_status_body.find('.row:last').after(html);
		}else{
			$req_status_body.find('.col-xs-3:last').after(html);
		}
		populateReqStatus(reqStatusList[i], ctr);
		if(ctr == 4){
			ctr = 1;
		}else{
			ctr++;
		}
	}
}

function populateReqStatus(obj, ctr){
	try{
		var div = $('div[id="reqstatus-div"][rsno="0"]');
		var status = getReqHistStatus(obj.rsNo);
		var statusDtl = '';
		div.attr('rsno', obj.rsNo);
		div.find('.panel-heading').html(obj.statusName);
		if(obj.lastTag == 'Y'){
			$('div[id="reqstatus-div"][rsno="' + (obj.seqNo - 1) + '"]').find('#status-arrow').addClass('hide');
			statusDtl = '<b>' + nvl(obj.completeDesc, '') + '</b>';
			if(status == 'Completed'){
				div.removeClass('hide');
			}
		}else if(status == 'On-going'){
			statusDtl = nvl(obj.ongoingDesc, '');
			div.find('#status-health').addClass('health-y');
		}else if(status == 'Completed'){
			statusDtl = nvl(obj.completeDesc, '');
			div.find('#status-health').addClass('health-g');
			div.find('#status-arrow').addClass('fill').removeClass('no-fill');
			div.find('#status-vw-dtls').html('View Details');
		}else if(status == 'Failed'){
			statusDtl = nvl(obj.failedDesc, '');
			div.find('#status-health').addClass('health-r');
		} 
		statusDtl = statusDtl.replace('reqNo', $('#reqNo').val()).replace('QA Name', $('#assignedQA').val());
		div.find('#status-dtl').html(statusDtl);
		if(ctr == 4){
			div.find('#status-arrow').removeClass('fill no-fill');
		}
	}catch(e){
		alert('populateReqStatus - ' + e);
	}
}

function getReqStatusList(){
	try {
		$.ajax({
			url : contextPath + "/request/status/list",
			method : "GET",
	        async: false,
			success : function(result) {
				//if (checkErrorOnResponse(result)) {
				reqStatusList = result;
				//}
			},
		});
	} catch (e) {
		alert( 'getReqStatusList - ' + e);
	}
}

function getReqHistStatus(rsNo){
	for (x = 0, l = reqHist.length; x < l; x++) { 
		if(rsNo == reqHist[x].rsNo){
			return reqHist[x].status;
		}
	}
	return '';
}

function getReqHistRhNo(rsNo){
	for (x = 0, l = reqHist.length; x < l; x++) { 
		if(rsNo == reqHist[x].rsNo){
			return reqHist[x].rhNo;
		}
	}
	return '';
}

function reqStatusTimer(){
	/*$('#timer-div').timer({
	    duration: '10s',
	    callback: function() {
	        var currRsNo = $('#status-health.health-y').parents('#reqstatus-div').attr('rsno');
	        if(changeReqStatus(currRsNo)){
    			$('#timer-div').timer('remove');
	    	}
	    },
	    repeat: true
	});*/
	var currRsNo = $('#status-health.health-y').parents('#reqstatus-div').attr('rsno');
	if(currRsNo != 1 && currRsNo != 2){
		$('#timer-div').timer({
		    //duration: nvl(getRSTimerSec(currRsNo), '10s'), //ARVIC
			duration: '10s',
		    callback: function() {
		    	$('#timer-div').timer('remove');
		    	if(!changeReqStatus(currRsNo)){
		        	reqStatusTimer();
		    	}
		    }
		});
	}
}

function changeReqStatus(currRsNo){
	if(nvl(currRsNo, '') == '') return true;
	var nextrsNo = parseInt(currRsNo) + 1;
	var currRsDesc = nvl(getReqStatus(currRsNo).completeDesc, '');
	var nextRs = getReqStatus(nextrsNo);
	var $currDiv = $('#reqstatus-div[rsno="' + currRsNo + '"]');
	var $nextDiv = $('#reqstatus-div[rsno="' + nextrsNo + '"]');

	/*if (currRsNo == 2) {
		updateReqHist(currRsNo, nextrsNo, nextRs.lastTag);
	}*/
	
	/*do {
		alert(getReqHistStatus(currRsNo));
		alert("in do" + currRsNo);
		alert(JSON.stringify(reqHist));
	} while (getReqHistStatus(currRsNo) != "Completed");*/
	
	/*$currDiv. find('#status-health').removeClass('health-y').addClass('health-g');
	$currDiv.find('#status-dtl').html(currRsDesc.replace('reqNo', $('#reqNo').val()).replace('ravBy', $('#ravBy').val()).replace('assignedDev', $('#assignedDev').val()));
	if($currDiv.find('#status-arrow').hasClass('no-fill')){
		$currDiv.find('#status-arrow').removeClass('no-fill').addClass('fill');
	}
	$currDiv.find('#status-vw-dtls').html('View Details');
		
	if (currRsNo == 2) {
		setTimeout(function(){
		updateReqHist(currRsNo, nextrsNo, nextRs.lastTag);
		}, 2000);	
	}
		
	if(nextRs.lastTag == 'Y'){
		$nextDiv.removeClass('hide');
		return true;
	}else{
		$nextDiv.find('#status-health').addClass('health-y');
		$nextDiv.find('#status-dtl').html(nvl(nextRs.ongoingDesc, '').replace('reqNo', $('#reqNo').val()).replace('ravBy', $('#ravBy').val()).replace('assignedDev', $('#assignedDev').val()));
		return false;
	}*/
	
	//SHA
	if (currRsNo == 2) {
		updateReqHist(currRsNo, nextrsNo, nextRs.lastTag); 
	} else {
		if (currRsNo >= 3) {
			getUpdatedReqHist();
		}
	}
	
	//setTimeout(function(){
		if (getReqHistStatus(currRsNo) == "Completed" || getUpdatedReqHistStatus(currRsNo) == "Completed") {
			$currDiv. find('#status-health').removeClass('health-y').addClass('health-g');
			$currDiv.find('#status-dtl').html(currRsDesc.replace('reqNo', $('#reqNo').val()).replace('ravBy', $('#ravBy').val()).replace('QA Name', $('#assignedQA').val()));
			if($currDiv.find('#status-arrow').hasClass('no-fill')){
				$currDiv.find('#status-arrow').removeClass('no-fill').addClass('fill');
			}
			$currDiv.find('#status-vw-dtls').html('View Details');
			
			if(nextRs.lastTag == 'Y'){
				$nextDiv.removeClass('hide');
				return true;
			}else{
				$nextDiv.find('#status-health').addClass('health-y');
				$nextDiv.find('#status-dtl').html(nvl(nextRs.ongoingDesc, '').replace('reqNo', $('#reqNo').val()).replace('ravBy', $('#ravBy').val()).replace('assignedDev', $('#assignedDev').val()));
				return false;
			}
		}
	//}, 2000);
}

function getUpdatedReqHist(){
	try {
		$.ajax({
			url : contextPath + "/request/history/list",
			method : "GET",
	        data: {
	        	reqNo : parseInt($('#reqNo').val())
	        },
	        async: false,
			success : function(result) {
				reqUpdatedHist = result;
			},
		});
	} catch (e) {
		alert( 'getReqStatusList - ' + e);
	}
}

function getUpdatedReqHistStatus(rsNo){
	for (x = 0, l = reqUpdatedHist.length; x < l; x++) {
		if(rsNo == reqUpdatedHist[x].rsNo){
			return reqUpdatedHist[x].status;
		}
	}
	return '';
}

function getReqStatus(rsNo){
	for (x = 0, l = reqStatusList.length; x < l; x++) { 
		if(rsNo == reqStatusList[x].rsNo){
			return reqStatusList[x];
		}
	}
}

function updateReqHist(rsNoDone, rsNoStart, rsNoStartLastTag){
	var obj = {};
	obj.reqNo = $('#reqNo').val().toString();
	obj.rhNo = getReqHistRhNo(rsNoDone).toString();
	obj.rsNoDone = rsNoDone.toString();
	obj.rsNoStart = rsNoStart.toString();
	obj.rsNoStartLastTag = rsNoStartLastTag;
	try {
		$.ajax({
			url : contextPath + "/request/status/update",
			method : "POST",
	        data: {
	        	param: JSON.stringify(obj)
	        },
	        async: false,
			success : function(result) {
				reqHist = result;
			},
		});
	} catch (e) {
		alert( 'getReqStatusList - ' + e);
	}
}

function getRSTimerSec(rsNo){
	var obj = [{"rsNo": "3", "sec": "30s"}, {"rsNo": "4", "sec": "45s"}, {"rsNo": "5", "sec": "10s"}, {"rsNo": "6", "sec": "20s"}, {"rsNo": "7", "sec": "16s"}, {"rsNo": "8", "sec": "10s"}, {"rsNo": "9", "sec": "15s"}]
	for (x = 0, l = obj.length; x < l; x++) { 
		if(rsNo == obj[x].rsNo){
			return obj[x].sec;
		}
	}
}

//NEW -Ronnie
function openReqInfo(reqNo, projNo, type){
	loadProjInfo(null, projNo, 'openReqInfo');
	loadProjAdtlInfo('projinfo-div', projNo);
	loadReqInfo('projadtlinfo-div', reqNo);
	makeFieldsUneditable('openReqInfo'); //SHA
	if(type == "deployment"){
		$('#projcost-col').remove();
		initDeploymentButtons();
	}else{
		$('#deployment-col').remove();
	}
	$("#additionalInformation-div").remove();
	loadReqStatusMain('reqinfo-div', reqNo);
	$back.removeClass('hide');
}