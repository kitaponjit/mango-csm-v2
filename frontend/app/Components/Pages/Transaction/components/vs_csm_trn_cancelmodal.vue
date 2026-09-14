<template>
  <div class="modal fade ct-sheet" data-backdrop="static" data-keyboard="false" id="cancelModal">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-danger">กรุณาระบุเหตุผลที่ต้องการ Cancel Request *</h5>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group">
              <label for="message-text" class="col-form-label">ข้อความยืนยัน</label>
              <textarea class="form-control input-sm" v-model="formData.cancel_remark" rows="5"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-sm btn-success" @click="cancelRequest()">{{ ui.erp_confirm_transaction || 'ยืนยันการทำรายการ' }}</button>
          <button class="btn btn-sm bg-navy" data-dismiss="modal"><i class="fas fa-times"></i> {{ ui.csm_v2_close_window || 'ปิดหน้าต่าง' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  export default {
    props: {
      formData: Object,
      cancelRequest: Function,
    },
    data() {
      return {
        ui: window.ui,
      }
    },
  }
</script>
