<div id="businessUModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="businessUModal" data-backdrop="static" data-keyboard="false">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header modal-header-primary">
        <button id="closeBUP" type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="gridSystemModalLabel">Business Unit</h4>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-xs-12">
          	<table id="businessUPopupTb" class="table table-hover common-table table-sm table-striped dt-responsive nowrap" style="width: 100%">
				<thead class="tblHead">
					<tr>
						<th>Business Unit Name</th>
					</tr>
				</thead>
			</table>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button id="okBUPbtn" type="button" class="btn btn-info">Ok</button>
        <button id="closeBUP" type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
<script>
	businessupopup = $.parseJSON(nvl('[{"buName": "Marketing"},{"buName": "Training"},{"buName": "Accounting and Finance"},{"buName": "Internal Systems"},{"buName": "Product and Development"},{"buName": "Human Resources"},{"buName": "Project Management Office"},{"buName": "Operations"}]', '[]'));
	initBusinessUPopup();
</script>