var projSubmitted;
var projApproved;
var projApproval;


function loadProjInfo(afterDiv, projNo, page){
	try {
		var $afterdiv = $('#'+afterDiv);
		$.ajax({
			url : contextPath + "/project/info?projNo="+nvl(projNo, '')+'&page='+page,
			method : "GET",
	        async: false,
			success : function(result) {
				
				//if (checkErrorOnResponse(result)) {
				if(afterDiv != null){
					$afterdiv.after(result);
				}else{
					$main_body.html(result);
					$('#createNewProj').removeClass("hide");
					$('#projNo').addClass('common-editable-fields');
					//loadProjPlanPeriod('projinfo-div');
				}
				if(projNo != null && 'openReqInfo' == page){
					populateProjInfo(getProjInfByNo(projNo));
					$('#projNo').removeClass('pad-right-25');
					$('#seachProj').hide();
					$('#createNewProj').addClass('hide');
					console.log(projApproved);
					if (projApproved != 1) {
						$('span > .required').removeClass('hide');
					}
				}else if(projNo == null && 'addProj' == page){
					projApproved = 0;
					initAddProjInfo();
					$('.required').removeClass('hide');
				}else if(projNo != null && 'updateProj' == page){
					populateProjInfo(getProjInfByNo(projNo));
					initAddProjInfo();
					$('.required').removeClass('hide');
				}
				//}
			},
		});
		
		
	} catch (e) {
		alert( 'loadProjInfo - ' + e);
	}
}

function loadProjPlanPeriod(afterDiv, projNo){
	try {
		var $afterdiv = $('#'+afterDiv);
		$.ajax({
			url : contextPath + "/project/planperiod",
			method : "GET",
	        async: false,
			success : function(result) {
				//if (checkErrorOnResponse(result)) {
				if(afterDiv != null){
					$afterdiv.after(result);
				}else{
					$main_body.html(result);
				}
				if(projNo != null){
					reloadPeriodList(listPeriod(projNo));
					reloadInfraList(listInfra(projNo));
				}
				//}
			},
		});
	} catch (e) {
		alert( 'loadProjPlanPeriod - ' + e);
	}
}

function getProjInfByNo(projNo){
	var obj = null;
	$.ajax({
		url : contextPath + "/project/infobyno?projNo="+projNo,
		method : "GET",
        async: false,
		success : function(result) {
			//if (checkErrorOnResponse(result)) {
			obj = result;
			//}
		},
	});
	return obj;
}

function getProjAttachmentList(projNo){
	$("#fileDiv").empty();
	try {
		$.ajax({
			url : contextPath + "/project/attachments?projNo="+projNo,
			method : "GET",
	        async: false,
			success : function(response) {
				var obj = JSON.parse(response);
				if(obj.length == 0){
					 $("#fileDiv").append(
							 $("<label>No files have been uploaded.</label>"));
				}else{
					for(var k in obj)
					    if ({}.hasOwnProperty.call(obj, k))
					    	 $("#fileDiv").append(
					                    $("<tr><td></td></tr>").html(obj[k]));
				}
				
			},
		});
	} catch (e) {
		alert( 'getReqStatusList - ' + e);
	}
}

function populateProjInfo(projInfo){
	if(projInfo != null){
		$('#projNo').val(padLeft(nvl(projInfo.projNo, ''), 6));
		$('#createdBy').val(nvl(projInfo.createdBy, ''));
		$('#projName').val(unescapeHTML(nvl(projInfo.name, '')));
		$('#projManager').val(nvl(projInfo.projManager, ''));
		$('#bussinessUnit').val(nvl(projInfo.businesUnit, ''));
		$('#projStatus').val(nvl(projInfo.status, ''));
		$('#projDesc').val(unescapeHTML(nvl(projInfo.desc, ''))).attr('remarks', nvl(projInfo.remarks, ''));
		$('#projInfoHealth').removeClass('health-g health-y health-r');
		projApproved = projInfo.approved;
		projSubmitted = projInfo.submitted;
		if ( nvl(projInfo.health, '') == 'Completed' ){
			$('#projInfoHealth').addClass('health-g');
		}else if ( nvl(projInfo.health, '') == 'Failed' ){
			$('#projInfoHealth').addClass('health-r');
		}else if ( nvl(projInfo.health, '') == 'On-going' ){
			$('#projInfoHealth').addClass('health-y');
		}
	}else{
		$('#projNo').val('');
		$('#createdBy').val('');
		$('#projName').val('');
		$('#projManager').val('');
		$('#bussinessUnit').val('');
		$('#projStatus').val('');
		$('#projDesc').val('');
		$('#projInfoHealth').removeClass('health-g health-y health-r');
	}
}

function listPeriod(projNo){
	var obj = null;
	$.ajax({
		url : contextPath + "/project/periodlist?projNo="+projNo,
		method : "GET",
        async: false,
		success : function(result) {
			//if (checkErrorOnResponse(result)) {
			obj = result;
			//}
		},
	});
	return obj;
}

function listInfra(projNo){
	var obj = null;
	$.ajax({
		url : contextPath + "/project/infralist?projNo="+projNo,
		method : "GET",
        async: false,
		success : function(result) {
			//if (checkErrorOnResponse(result)) {
			obj = result;
			//}
		},
	});
	return obj;
}

function loadAddProj(){
	loadProjInfo(null, null, 'addProj');
	loadProjAdtlInfo('projinfo-div');
	$back.removeClass('hide');
}

function loadUpdateProj(projNo){
	
	loadProjInfo(null, projNo, 'updateProj');
	loadProjAdtlInfo('projinfo-div', projNo);
	makeFieldsUneditable('updateProj');
	
	if(useraccess == 'bu'){
		$('#projInfra').remove();
		$('#projcost-col').removeClass("col-xs-6");
		$('#projcost-col').addClass("col-xs-12");
		$('#projCostStatus').remove();
	}
	if(current_dashboard == 'deployment'){
		$('#projcost-col').remove();;
	}else{
		$('#deployment-col').remove();
	}
	
	$back.removeClass('hide');
}

function initAddProjInfo(){
	var link = '<a id="editProjHealth" class="margin-left-3" data-toggle="modal" data-target="#projHealthPopupModal" style="cursor: pointer; cursor: hand;">Edit</a>';
	if (projApproved != 1) {
		$('#projNo').removeClass('pad-right-25');
		$('#seachProj').hide();
		$('#projInfoHealth').addClass('health-g margin-left-3').removeClass('margin-left-15').after(link);
		$('#projMoreInfoBtn').hide();
		$('#createdBy').css('width', '');
		$('#projName').removeAttr('readonly');
		$('#projManager').addClass('pad-right-25');
		$('#bussinessUnit').addClass('pad-right-25');
		$('#projStatus').addClass('pad-right-25');
		$('#projDesc').removeAttr('readonly').addClass('pad-right-25');
		$('#seachProjManager').removeClass('hide');
		$('#seachbusUnit').removeClass('hide');
		$('#seachStatus').removeClass('hide');
		$('#projDescEditor').removeClass('hide');
	}
	$('#createNewProj').addClass("hide");
}

function loadProjAdtlInfo(afterDiv, projNo){
	try {
		var $afterdiv = $('#'+afterDiv);
		$.ajax({
			url : contextPath + '/project/adtlinfo?projNo=' + nvl(projNo, 0),
			method : "GET",
	        async: false,
			success : function(result) {
				//if (checkErrorOnResponse(result)) {
				if(afterDiv != null){
					$afterdiv.after(result);
					if (projNo == undefined || projNo == null || projApproved == 0)
						$('#projadtlinfo-div').find('span.required').removeClass('hide');
				}else{
					$main_body.html(result);
				}
				//}
			},
		});
	} catch (e) {
		alert( 'loadProjAdtlInfo - ' + e);
	}
	
	//removed by Ronnie
	$('#uploadBtn').click(function(){
		getProjAttachmentList(projNo);
	});
	
}

function initProjBtn(){
	$('#projCancelBtn').click(function(){
		loadMainPage();
		loadProjectList();
		$back.addClass('hide');
	});
	
	$('#projSaveBtn').click(function(){
		if(nvl($('#projNo').val(), '') == ''){
			var errCount = checkRequired("new");
			if(errCount == 0){
				insertProj();
			}else{
				$('#savingSuccess').modal('toggle');
				$('#savingSuccess').find("#gridSystemModalLabel").text('Warning');
				$('#saveProjNo').html('Please fill all the required fields.');
			}
		}else{
			updateProj();
		}
	});
	
	$('#dropApproved').click(function(){
		$('#approved').css("color", "black");
		$('#rejected').css("color", "white");
		projApproval = $('#dropApproved').text();
		$('#lblFilter').html(projApproval);
	});
	
	$('#dropRejected').click(function(){
		$('#rejected').css("color", "black");
		$('#approved').css("color", "white");
		projApproval = $('#dropRejected').text();
		$('#lblFilter').html(projApproval);
	});
	
	/*	Rochelle - END*/
}

// Added By Bryan
function checkRequired(status){
	var fields = [];
	
	if(status == "new"){
		fields.projInfo 	= $('#projName');
		fields.busUnit 		= $('#bussinessUnit');
		fields.projManager 	= $('#projManager');
		fields.status 		= $('#projStatus');
		fields.projPSD		= $('#projPSD');
		fields.projPFD		= $('#projPFD');
		fields.projASD	 	= $('#projASD');
		fields.projACD		= $('#projACD');
		
		if(useraccess != "bu"){
			fields.os 			= $('#projOS');
			fields.middleware 	= $('#projMW');
			fields.application  = $('#projApp');
			fields.cpu			= $('#projCPU');
			fields.memory		= $('#projMemory');
		}
	}
	
	if(status == "approve"){
//		fields.projInfo 	= $('#projName');
//		fields.busUnit 		= $('#bussinessUnit');
//		fields.projManager 	= $('#projManager');
//		fields.status 		= $('#projStatus');
		fields.projPSD		= $('#projPSD');
		fields.projPFD		= $('#projPFD');
		fields.projASD	 	= $('#projASD');
		fields.projACD		= $('#projACD');
		fields.os 			= $('#projOS');
		fields.middleware 	= $('#projMW');
		fields.application  = $('#projApp');
		fields.cpu			= $('#projCPU');
		fields.memory		= $('#projMemory');
		fields.dev			= $('#assignedDev');
		fields.ba			= $('#assignedBA');
		fields.qa			= $('#assignedQA');
		fields.op			= $('#assignedOPs');
	}
	
	if(status == "update" && useraccess == "bu"){
		fields.projPSD		= $('#projPSD');
		fields.projPFD		= $('#projPFD');
		fields.projASD	 	= $('#projASD');
		fields.projACD		= $('#projACD');
	}
	
	return checkFields(fields);
}

// Added By Bryan
function checkFields(fields){
	var reg = /[^A-Za-z0-9^.*?\s \-\,+#]/;
	var errorFieldsCount = 0;
	
	for(var x in fields){

		var field = (fields[x].val() == null || fields[x].val().length == 0) ? "invalid" : fields[x].val();
		
		if(fields[x].val() == null || fields[x].val().length == 0 || reg.test(field)){
			fields[x].css("border", "1px solid #EF4836");
			errorFieldsCount++;
		}else{
			fields[x].css("border", "");
		}
	}
	
	return errorFieldsCount;
}

function insertProj(){
	try {
		$('#createdBy').val($('#username-header').html());
		var projInfo = prepareProjInfo('insert');
		var projPeriod = prepareProjPeriod();
		var projInfra = prepareProjInfra();
		var projCost = prepareProjCost();
		$.ajax({
			url : contextPath + "/project/insert",
			method : "POST",
			data : {
				projInfo: JSON.stringify(projInfo),
				projPeriod: JSON.stringify(projPeriod),
				projInfra: JSON.stringify(projInfra),
				projCost: JSON.stringify(projCost)
			},
			async: false,
			success : function(result) {
				$('#projNo').val(padLeft(result, 6));
				$('#saveProjNo').html('Project No. ' + padLeft(result, 6) + '  successfully saved!');
				$('#savingSuccess').modal('toggle');
				$('#savingSuccess').on('hidden.bs.modal',function(e){
					e.preventDefault();
					setTimeout(function(){
						loadMainPage();
						loadRequestList();
					}, 2000);
				});
			},
		});
		//setTimeout(function(){
			insertProjRequest();
		//}, 2000);
		
	} catch (e) {
		alert( 'insertProj - ' + e);
	}
}

function updateProj(){
	try {
		var projInfo = prepareProjInfo('update');
		var projPeriod = prepareProjPeriod();
		var projInfra = prepareProjInfra();
		var projCost = prepareProjCost();
		
		$.ajax({
			url : contextPath + "/project/update",
			method : "POST",
			data : {
				projInfo: JSON.stringify(projInfo),
				projPeriod: JSON.stringify(projPeriod),
				projInfra: JSON.stringify(projInfra),
				projCost: JSON.stringify(projCost)
			},
			async: false,
			success : function(result) {
				//if (checkErrorOnResponse(result)) {
				if(result = 'success'){
					$('#saveProjNo').html('Project No. ' + $('#projNo').val() + '  successfully saved!');
				}else{
					$('#saveProjNo').html('Saving Project No. ' + $('#projNo').val() + '  failed!');
				}
				$('#savingSuccess').modal('toggle');
				projApproved = 0;
				//}
				
			},
		});
	} catch (e) {
		alert( 'updateProj - ' + e);
	}
}

function prepareProjInfo(action){
	var projInfo = {};
	if(nvl($('#projNo').val(), '') != ''){
		projInfo.projNo = $('#projNo').val();
	}
	projInfo.name = $('#projName').val();
	projInfo.businesUnit = $('#bussinessUnit').val();
	projInfo.desc = $('#projDesc').val();
	projInfo.createdBy = $('#createdBy').val();
	projInfo.projManager = $('#projManager').val();
	projInfo.status = $('#projStatus').val();
	projInfo.remarks = $('#projRemarks').val();
	projInfo.submitted = projSubmitted; //	Rochelle
	
	if(nvl(action, '') != ''){
		if (action == 'insert') {
			projInfo.approved = 0;
		} else {
			projInfo.approved = projApproved;
		}
	} 
	if ( $('#projInfoHealth').hasClass('health-g') ){
		projInfo.health = 'Completed';
	}else if ( $('#projInfoHealth').hasClass('health-r') ){
		projInfo.health = 'Failed';
	}else if ( $('#projInfoHealth').hasClass('health-y') ){
		projInfo.health = 'On-going';
	}
	return projInfo;
}
//ROCHELLE
function prepareApprvReqProjInfo(){
	var projInfo = {};
	if(nvl($('#projNo').val(), '') != ''){
		projInfo.projNo = $('#projNo').val();
	}
	
	projInfo.approved = 1;
	projInfo.name = $('#projName').val();
	projInfo.businesUnit = $('#bussinessUnit').val();
	projInfo.desc = $('#projDesc').val();
	projInfo.createdBy = $('#createdBy').val();
	projInfo.projManager = $('#projManager').val();
	projInfo.status = $('#projStatus').val();
	projInfo.remarks = $('#projRemarks').val();
	
	if ( $('#projInfoHealth').hasClass('health-g') ){
		projInfo.health = 'Completed';
	}else if ( $('#projInfoHealth').hasClass('health-r') ){
		projInfo.health = 'Failed';
	}else if ( $('#projInfoHealth').hasClass('health-y') ){
		projInfo.health = 'On-going';
	}
	
	return projInfo;
}

function prepareProjPeriod(){
	var projPeriod = {};
	if(nvl($('#projPSD').attr('ppno'), '') != ''){
		projPeriod.ppNo = $('#projPSD').attr('ppno');
		projPeriod.projNo = $('#projNo').val();
	}
	projPeriod.plannedStartDate = $('#projPSD').val();
	projPeriod.plannedFinishDate = $('#projPFD').val();
	projPeriod.startDate = $('#projASD').val();
	projPeriod.finishDate = $('#projACD').val();
	projPeriod.region = $('#projRegion').val();
	projPeriod.phase = $('#projPhase').val();
	return projPeriod;
}

function prepareProjInfra(){
	var projInfra = {};
	if(nvl($('#projOS').attr('pino'), '') != ''){
		projInfra.piNo = $('#projOS').attr('pino');
		projInfra.projNo = $('#projNo').val();
	}
	projInfra.os = $('#projOS').val();
	projInfra.middleware = $('#projMW').val();
	projInfra.application = $('#projApp').val();
	projInfra.cpuMemory = $('#projCPU').val() + ' CPU/s, '  + $('#projMemory').val();
	return projInfra;
}

function prepareProjCost(){
	var projCost = {};
	if(nvl($('#projTotBudget').attr('pcno'), '') != ''){
		projCost.pcNo = $('#projTotBudget').attr('pcno');
		projCost.projNo = $('#projNo').val();
	}
	projCost.totalBudget = $('#projTotBudget').val();
	projCost.budgetToDate = $('#projBudToDate').val();
	projCost.actualToDate = $('#projActToDate').val();
	projCost.status = $("input[name='optradio']:checked").val(); //SHA
	return projCost;
}

function populateProjAdtlInfo(projAdtlInfo){
	if(projAdtlInfo != null){
		$('#projPSD').val(nvl(projAdtlInfo.projPeriod.plannedStartDate, '')).attr('ppNo', projAdtlInfo.projPeriod.ppNo);
		$('#projPFD').val(nvl(projAdtlInfo.projPeriod.plannedFinishDate, ''));
		$('#projASD').val(nvl(projAdtlInfo.projPeriod.startDate, ''));
		$('#projACD').val(nvl(projAdtlInfo.projPeriod.finishDate, ''));
		$('#projRegion').val(nvl(projAdtlInfo.projPeriod.region, ''));
		$('#projPhase').val(nvl(projAdtlInfo.projPeriod.phase, ''));
		$('#projOS').val(nvl(projAdtlInfo.projInfra.os, '')).attr('piNo', projAdtlInfo.projInfra.piNo);
		$('#projMW').val(nvl(projAdtlInfo.projInfra.middleware, ''));
		$('#projApp').val(nvl(projAdtlInfo.projInfra.application, ''));
		var cpuMemory = nvl(projAdtlInfo.projInfra.cpuMemory, '')
		$('#projCPU').val(cpuMemory.substr(0, cpuMemory.indexOf(' CPU/s')));
		$('#projMemory').val(cpuMemory.substr(cpuMemory.indexOf('s,') + 3));
		$('#projTotBudget').val(nvl(projAdtlInfo.projCost.totalBudget, '0.00')).attr('pcNo', projAdtlInfo.projCost.pcNo);
		$('#projBudToDate').val(nvl(projAdtlInfo.projCost.budgetToDate, '0.00'));
		$('#projActToDate').val(nvl(projAdtlInfo.projCost.actualToDate, '0.00'));
		$('#projRemarks').val(unescapeHTML($('#projDesc').attr('remarks')));
		nvl(projAdtlInfo.projCost.status, '0') == "1" ? $('#rBtnApproved').prop('checked', true) : $('#rBtnDisApproved').prop('checked', true); //SHA
	}else{
		$('#projPSD').val('');
		$('#projPFD').val('');
		$('#projASD').val('');
		$('#projACD').val('');
		$('#projRegion').val('');
		$('#projPhase').val('');
		$('#projOS').val('');
		$('#projMW').val('');
		$('#projApp').val('');
		$('#projCPU').val('');
		$('#projMemory').val('');
		$('#projTotBudget').val('');
		$('#projBudToDate').val('');
		$('#projActToDate').val('');
		$('#projRemarks').val('');
	}
}


/* Rochelle Villaruz */

function submitProject(){
	try {
		var projInfo = prepareProjInfo();
		$.ajax({
			url : contextPath + "/project/submit",
			method : "POST",
			data : prepareProjInfo(),
			success : function(result) {
				if(result == 'success'){
					loadProjStatusMain('projadtlinfo-div', projInfo.projNo);
				}
			},
		});
	} catch (e) {
		alert( 'submitProject - ' + e);
	}
}

function submitApproval(){
	try {				
//			$('#projSubmitBtn').prop('disabled', true);
			$('#projstatusmain-div').remove();
			changeProjStatus(2);
			return true;
	} catch (e) {
		alert( 'submitProject - ' + e);
	}
}

function approveProject(){
	try {
		var projInfo = prepareApprvReqProjInfo();
		$.ajax({
			url : contextPath + "/project/approve",
			method : "POST",
			//data : prepareApprvReqProjInfo(),
			data : projInfo,
			async: false,
			success : function(result) {
				if(result == 'success'){
					disableProjSave(true);
					createVM();
				}
			},
		});
	} catch (e) {
		alert( 'submitProject - ' + e);
	}
}

function disableProjSave(disable){
	var $objSave = $('#projSaveBtn');
	var $objSubmit = $('#projSubmitBtn');
	if(disable && !$objSave.prop('disabled')){
		$objSave.prop('disabled', disable);
	} else if(!disable && $objSave.prop('disabled')){
		$objSave.prop('disabled', disable);
	}
	
}

var proj_status_jsp;
var projStatusList;
var projHist = [];

function loadProjStatusMain(afterDiv, projNo){
	try {
		var $afterdiv = $('#'+afterDiv);
		$.ajax({
			url : contextPath + "/project/statusmain?projNo="+projNo,
			method : "GET",
			success : function(result) {
				if(afterDiv != null){
					$($afterdiv).after(result);
				}else{
					$main_body.html(result);
				}
				if(projNo != null){
					loadProjStatus(projNo);
					reqStatusTimer();
				}
			},
		});
	} catch (e) {
		alert( 'loadReqStatusMain - ' + e);
	}
}

function loadProjStatus(projNo){
	var $proj_status_body = $('#proj-status-body');
	if(projStatusList == null) getProjStatusList();
	for (i = 0, ctr = 1, len = projStatusList.length; i < len; i++) { 
		var html = '';
		if(projStatusList[i].lastTag == 'N'){
			html = proj_status_jsp;
		}else if(projStatusList[i].lastTag == 'Y'){
			html = '<div id="projstatus-div" class="col-xs-3 hide" psno="0">' +
					'<div class="panel panel-default req-status-panel">' +
					'<div id="status-title" class="panel-heading">Review and Analysis</div>' +
					'<div class="panel-body">' +   '<div id="status-dtl" class="margin-right-40 status-dtl"></div>' +
					'<span id="status-health" class="req-status-health health-g"></span>' +
				   '</div>' + '</div>' +
				   '</div>';
		}
		if(ctr == 1){
			html = '<div class="row">' + html + '</div>';
		}
		if(i == 0){
			$proj_status_body.html(html);
		}else if(ctr == 1){
			$proj_status_body.find('.row:last').after(html);
		}else{
			$proj_status_body.find('.col-xs-3:last').after(html);
		}
		populateProjStatus(projStatusList[i], ctr);
		if(ctr == 4){
			ctr = 1;
		}else{
			ctr++;
		}
	}
}

function populateProjStatus(obj, ctr){
	try{
		var div = $('div[id="projstatus-div"][psno="0"]');
		var status = getProjHistStatus(obj.psNo);
		var statusDtl = '';
		div.attr('psno', obj.psNo);
		div.find('.panel-heading').html(obj.statusName);
		if(obj.lastTag == 'Y'){
			div.find('.panel-heading').html('Approval');
			$('div[id="projstatus-div"][psno="' + (obj.seqNo - 1) + '"]').find('#status-arrow').addClass('hide');
			statusDtl = nvl(obj.completeDesc, '');
			if(status == 'Completed'){
				div.removeClass('hide');
			} else if(status == 'Failed'){
				div.removeClass('hide');
				statusDtl = nvl(obj.completeDesc, '');
				div.find('#status-health').addClass('health-r');
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
		statusDtl = statusDtl.replace('projNo', $('#projNo').val());
		div.find('#status-dtl').html(statusDtl);
		if(ctr == 4){
			div.find('#status-arrow').removeClass('fill no-fill');
		}
	}catch(e){
		alert('populateProjStatus - ' + e);
	}
}

function getProjStatusList(){
	try {
		
		$.ajax({
			url : contextPath + "/project/status/list",
			method : "GET",
	        async: false,
			success : function(result) {
				projStatusList = result;
			},
		});
	} catch (e) {
		alert( 'getProjStatusList - ' + e);
	}
}

function getProjHistStatus(psNo){
	for (x = 0, l = projHist.length; x < l; x++) { 
		if(psNo == projHist[x].psNo){
			return projHist[x].status;
		}
	}
	return '';
}

function getProjHistPhNo(psNo){
	for (x = 0, l = projHist.length; x < l; x++) { 
		if(psNo == projHist[x].psNo){
			return projHist[x].phNo;
		}
	}
	return '';
}

function changeProjStatus(currPsNo){
	if(nvl(currPsNo, '') == '') return true;
	var approved;
	/*		Rochelle -begin	*/
	if (projApproval == "Approved") {
		approved = 1;
	} else if (projApproval == "Rejected") {
		approved = 2;
	} else {
		approved = 0;
	}	
	/*		Rochelle -end	*/
	var nextpsNo = parseInt(currPsNo) + approved;
	var currPsDesc = nvl(getProjStatus(currPsNo).completeDesc, '');
	var nextPs = getProjStatus(nextpsNo);
	var $currDiv = $('#reqstatus-div[psno="' + currPsNo + '"]');
	var $nextDiv = $('#reqstatus-div[psno="' + nextpsNo + '"]');
	
	$currDiv.find('#status-health').removeClass('health-y').addClass('health-g');
	if($currDiv.find('#status-arrow').hasClass('no-fill')){
		$currDiv.find('#status-arrow').removeClass('no-fill').addClass('fill');
	}
	$currDiv.find('#status-vw-dtls').html('View Details');
	
	updateProjHist(currPsNo, nextpsNo, nextPs.lastTag);
	if(nextPs.lastTag == 'Y'){
		$nextDiv.removeClass('hide');
		return true;
		
	}else{
		$nextDiv.find('#status-health').addClass('health-y');
		return false;
	}
}

function getProjStatus(psNo){
	for (x = 0, l = projStatusList.length; x < l; x++) { 
		if(psNo == projStatusList[x].psNo){
			return projStatusList[x];
		}
	}
}

function updateProjHist(psNoDone, psNoStart, psNoStartLastTag){
	var obj = {};
	obj.projNo = $('#projNo').val().toString();	
	obj.psNoDone = psNoDone.toString();
	obj.phNo = getProjHistPhNo(psNoDone).toString();
	obj.psNoStart = psNoStart.toString();
	obj.psNoStartLastTag = psNoStartLastTag;
	var approved;
	if (projApproval == "Approved") {
		approved = 1;
	} else if (projApproval == "Rejected") {
		approved = 2;
	} else {
		approved = 0;
	}
	obj.approval = approved.toString();
	try {
		$.ajax({
			url : contextPath + "/project/status/update",
			method : "POST",
	        data: {
	        	param: JSON.stringify(obj)
	        },
			success : function(result) {
				projHist = result;
			},
		});
	} catch (e) {
		alert( 'getProjStatusList - ' + e);
	}
}

function makeFieldsUneditable(action) {
	//project info fields
	$('#projName').prop('readonly', true);
	$('#bussinessUnit').prop('readonly', true);
	$('#projDesc').attr('readonly', true);
	$('#projManager').attr('readonly', true);
	$('#projStatus').attr('readonly', true);
	//
	
	if (action == 'openReqInfo') {
		if (projApproved == 1 && req_type == 1) {
			$('#projNo').removeClass('common-editable-fields');
			$('#projPSD').prop('readonly', true);
			$('#projPFD').prop('readonly', true);
			$('#projASD').prop('readonly', true);
			$('#projACD').prop('readonly', true);
			$('#seachProjRegion').addClass("hide");
			$('#projRegion').removeClass('common-editable-fields');
			$('#projPhase').attr('disabled', 'disabled');
			$('#projTotBudget').prop('readonly', true);
			$('#reqDesc').prop('readonly', true);
			$('#bussinessUnit').removeClass('common-editable-fields');
			$('#projManager').removeClass('common-editable-fields');
			$('#projStatus').removeClass('common-editable-fields');
			$("#projinfo-div span").addClass('hide');
			$("#seachDeveloper,#searchBA,#searchQA,#searchOPs").addClass("hide");
			// project infrastructure fields
			$("#projInfra span").addClass("hide");
			$('#projOS').removeClass('common-editable-fields');
			$('#projMW').removeClass('common-editable-fields');
			$('#projApp').removeClass('common-editable-fields');
			$('#projOS').prop('readonly', true);
			$('#projMW').prop('readonly', true);
			$('#projApp').prop('readonly', true);
			$('#projCPU').prop('disabled', true);
			$('#projMemory').prop('disabled', true);
		} else {
			if (useraccess == "bu") {
				$('#projNo').removeClass('common-editable-fields');
				$('#seachProjRegion').addClass("hide");
				$("#seachDeveloper,#searchBA,#searchQA,#searchOPs").addClass("hide");
				$("#projInfra span").addClass("hide");
				// project infrastructure fields
				$('#projOS').removeClass('common-editable-fields');
				$('#projMW').removeClass('common-editable-fields');
				$('#projApp').removeClass('common-editable-fields');
				$('#bussinessUnit').removeClass('common-editable-fields');
				$('#projManager').removeClass('common-editable-fields');
				$('#projStatus').removeClass('common-editable-fields');
				$('#projOS').prop('readonly', true);
				$('#projMW').prop('readonly', true);
				$('#projApp').prop('readonly', true);
				$('#projCPU').prop('disabled', true);
				$('#projMemory').prop('disabled', true);
				//
			}
			
			$('#projPSD').prop('readonly', false);
			$('#projPFD').prop('readonly', false);
			$('#projASD').prop('readonly', false);
			$('#projACD').prop('readonly', false);
			$('#projRegion').addClass('common-editable-fields');
			$('#projPhase').attr('disabled', false);
			$('#projTotBudget').prop('readonly', false);
			$('#reqDesc').prop('readonly', false);
		}
	} else if(action == 'updateProj') {
		if (projApproved == 1) {
			$('#projNo').removeClass('common-editable-fields');
			$('#projPSD').prop('readonly', true);
			$('#projPFD').prop('readonly', true);
			$('#projASD').prop('readonly', true);
			$('#projACD').prop('readonly', true);
			$('#seachProjRegion').addClass("hide");
			$('#projRegion').removeClass('common-editable-fields');
			$('#projPhase').attr('disabled', 'disabled');
			$('#projTotBudget').prop('readonly', true);
			$('#reqDesc').prop('readonly', true);
			$('#bussinessUnit').removeClass('common-editable-fields');
			$('#projManager').removeClass('common-editable-fields');
			$('#projStatus').removeClass('common-editable-fields');
			$("#projinfo-div span").addClass('hide');
			$("#seachDeveloper,#searchBA,#searchQA,#searchOPs").addClass("hide");
			$("#projInfra span").addClass("hide");
			
			// project infrastructure fields
			$('#projOS').removeClass('common-editable-fields');
			$('#projMW').removeClass('common-editable-fields');
			$('#projApp').removeClass('common-editable-fields');
			$('#projOS').prop('readonly', true);
			$('#projMW').prop('readonly', true);
			$('#projApp').prop('readonly', true);
			$('#projCPU').prop('disabled', true);
			$('#projMemory').prop('disabled', true);
		}
	} else {
		$('#bussinessUnit').removeClass('common-editable-fields');
		$('#projManager').removeClass('common-editable-fields');
		$('#projStatus').removeClass('common-editable-fields');
	}
	
	
	// project cost fields
	$('#projBudToDate').prop('readonly', true);
	$('#projActToDate').prop('readonly', true);
	$('#projCostDtls').prop('disable', true);
	//
	$('#projRemarks').prop('readonly', true);	
}