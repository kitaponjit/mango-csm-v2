<template>
  <modal ref="approveModal" sheet-class="ct-sheet">
    <template #header>
      <h4 class="modal-title" style="margin:0; display:flex; align-items:center; gap:10px;">
        <span style="display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; background:rgba(255,255,255,0.15);">
          <i class="fas fa-paper-plane" style="font-size:15px;"></i>
        </span>
        <span>{{ ui.erp_submit_approval || 'ยืนยันการส่งอนุมัติ' }}</span>
      </h4>
    </template>
    <template #body>
      <div style="padding:4px 0;">
        <!-- Form Approve Selection -->
        <div class="approve-modal-section">
          <label class="approve-modal-label">
            <i class="fas fa-file-alt" style="color:#e74c3c; margin-right:6px;"></i>
            <span>Form Approve <span style="color:#e74c3c;">*</span></span>
          </label>
          <vue-select-2 :options="approveFormOptions"
                        :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm', placeholder: '-- Select Form Approve --', allowClear: true}"
                        v-model="localApproveFormCode">
          </vue-select-2>
        </div>

        <!-- Warning Callout -->
        <div class="approve-modal-callout">
          <div class="approve-modal-callout-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="approve-modal-callout-text">
            <strong>{{ ui.erp_remark || 'หมายเหตุ' }} :</strong> กรุณาตรวจสอบรายชื่อของผู้อนุมัติ ก่อนทำการกด Submit
          </div>
        </div>

        <!-- Approver Table -->
        <div class="approve-modal-table-wrapper">
          <ag-table ref="agr" :footer="false" @ready="initTable()"></ag-table>
        </div>
      </div>
    </template>
    <template #footer>
      <div style="display:flex; justify-content:flex-end; gap:8px; width:100%;">
        <button class="btn btn-sm btn-default" @click="closeApproveModal()" style="border-radius:6px; padding:7px 16px; font-weight:500; border:1px solid #dce4ec;">
          <i class="fas fa-times" style="margin-right:4px;"></i> {{ ui.csm_v2_close_window || 'ปิดหน้าต่าง' }}
        </button>
        <button class="btn btn-sm btn-success" @click="confirmApprove()" style="border-radius:6px; padding:7px 18px; font-weight:600; box-shadow:0 2px 6px rgba(39,174,96,0.3);">
          <i class="fas fa-paper-plane" style="margin-right:4px;"></i> {{ ui.erp_submit_approval || 'ยืนยันการส่งอนุมัติ' }}
        </button>
      </div>
    </template>
  </modal>
</template>

<script type="text/javascript">
  export default {
    props: {
      approveFormOptions: Array,
      approveFormCode: String,
      approveDetailData: Array,
      loadFormDetail: Function,
      closeApproveModal: Function,
      confirmApprove: Function,
    },
    data() {
      return {
        ui: window.ui,
        localApproveFormCode: this.approveFormCode,
      }
    },
    watch: {
      approveFormCode(val) {
        this.localApproveFormCode = val
      },
      localApproveFormCode(val) {
        this.$emit('update:approveFormCode', val)
        this.loadFormDetail()
      },
      approveDetailData() {
        this.refreshGrid()
      },
    },
    methods: {
      openModal() {
        this.$refs.approveModal.openModal()
      },
      closeModal() {
        this.$refs.approveModal.closeModal()
      },
      setSize(size) {
        this.$refs.approveModal.setSize(size)
      },
      refreshGrid() {
        this.$nextTick(() => {
          let agr = this.$refs.agr
          if (agr) agr.setDisplay(this.approveDetailData || [])
        })
      },
      initTable() {
        let agr = this.$refs.agr
        if (!agr) return

        let fields = [
          ['itemno', this.ui.erp_no || 'No.', 'text', { width: 80, align: 'center', sort: 'asc' }],
          ['empfullname_t', this.ui.erp_employee || 'Employee', 'text', {
            width: 400,
            cellRenderer: (params) => {
              let wrapper = document.createElement('div')
              wrapper.style.cssText = 'display:flex; align-items:center; gap:8px;'

              let avatar = document.createElement('span')
              avatar.style.cssText = 'width:24px; height:24px; border-radius:50%; background:#eef1f7; color:#607089; display:flex; align-items:center; justify-content:center; flex-shrink:0;'
              avatar.innerHTML = '<i class="fas fa-user" style="font-size:11px;"></i>'
              wrapper.appendChild(avatar)

              let name = document.createElement('span')
              name.style.fontWeight = '500'
              name.textContent = params.value || ''
              wrapper.appendChild(name)

              return wrapper
            }
          }],
          ['fr_proj_type', this.ui.erp_position || 'Position', 'text', { width: 260, align: 'center' }],
          ['levelapp', 'Level Approve', 'text', {
            width: 350, align: 'center',
            cellRenderer: (params) => `${this.ui.erp_level || 'Level'} ${params.value || ''}`
          }],
        ]

        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)
        this.refreshGrid()
      },
    },
  }
</script>

<style scoped>
  .approve-modal-section {
    margin-bottom: 16px;
  }

  .approve-modal-label {
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 6px;
  }

  .approve-modal-callout {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #fffbf0;
    border: 1px solid #ffeaa7;
    border-left: 4px solid #f39c12;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 16px;
  }

  .approve-modal-callout-icon {
    color: #f39c12;
    font-size: 16px;
    margin-top: 1px;
    flex-shrink: 0;
  }

  .approve-modal-callout-text {
    font-size: 12px;
    color: #7d6608;
    line-height: 1.5;
  }

  .approve-modal-table-wrapper {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e8ecf0;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
</style>
