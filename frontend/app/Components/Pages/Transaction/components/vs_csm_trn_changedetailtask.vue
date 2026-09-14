<template>
  <modal-3 ref="change_w" sheet-class="ct-sheet">
    <template #header>
      <div style="display:flex; align-items:center; gap:10px;">
        <i class="fas fa-edit" style="font-size:18px; color:#00a65a;"></i>
        <span style="font-size:16px; font-weight:600;">Change Detail Task</span>
        <span v-if="detailChange.length" style="margin-left:4px; background:#00a65a; color:#fff; border-radius:12px; padding:1px 10px; font-size:12px; font-weight:600;">
          {{ detailChange.length }} {{ ui.csm_remain_unit_item || 'รายการ' }}
        </span>
      </div>
    </template>
    <template #body>

      <!-- PPN Info Banner -->
      <div v-if="!xt.isEmpty(formData.ref_pre_event_ppn)"
           style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;
                  background:#f0f8ff; border:1px solid #b8d9f0; border-radius:6px;
                  padding:10px 14px; margin-bottom:14px;">
        <i class="fas fa-project-diagram" style="color:#3c8dbc; font-size:15px;"></i>
        <span style="font-size:12px; color:#555;">{{ ui.erp_proj_ppn || 'โครงการ PPN' }} :</span>
        <span style="background:#fff3cd; color:#856404; border:1px solid #ffc107;
                     border-radius:4px; padding:2px 8px; font-size:12px; font-weight:600;">
          {{ formData.ref_pre_event_ppn }}
          <span v-if="formData.ppnname" style="font-weight:400;"> ({{ formData.ppnname }})</span>
        </span>
        <span style="font-size:12px; color:#555; margin-left:4px;">แผน PPN :</span>
        <span style="background:#d1f5d3; color:#155724; border:1px solid #28a745;
                     border-radius:4px; padding:2px 8px; font-size:12px; font-weight:600;">
          {{ formData.ref_plancode }}
          <span v-if="formData.planname" style="font-weight:400;"> ({{ formData.planname }})</span>
        </span>
      </div>

      <!-- Task Cards -->
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div
          v-for="(x, idx) in detailChange"
          :key="x.itemno || idx"
          style="border:1px solid #e0e0e0; border-radius:8px; overflow:hidden; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.06);"
        >
          <!-- Card Header -->
          <div style="display:flex; align-items:center; gap:10px;
                      background:#f7f9fc; border-bottom:1px solid #e8ecf0;
                      padding:8px 14px;">
            <span style="display:inline-flex; align-items:center; justify-content:center;
                          width:26px; height:26px; border-radius:50%;
                          background:#3c8dbc; color:#fff; font-size:12px; font-weight:700; flex-shrink:0;">
              {{ idx + 1 }}
            </span>
            <span style="font-weight:600; font-size:13px; color:#333; flex:1; min-width:0;
                          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              {{ x.subject || '(ไม่มีชื่องาน)' }}
            </span>
            <button type="button"
                    class="btn btn-xs btn-outline"
                    :disabled="x.aiAnalysisLoading"
                    @click.prevent="runAiAnalysis(x)"
                    style="flex-shrink:0; border:1px solid #9b59b6; color:#9b59b6; background:#fff;
                           border-radius:5px; padding:3px 10px; font-size:11px; font-weight:600;
                           display:inline-flex; align-items:center; gap:5px;">
              <i :class="x.aiAnalysisLoading ? 'fas fa-spinner fa-spin' : 'fas fa-robot'"></i>{{ x.aiAnalysisLoading ? (ui.csm_trn_analyzing || 'กำลังวิเคราะห์...') : (ui.csm_remain_ai_analysis || 'AI Analysis') }}
              <span style="background:#9b59b6; color:#fff; border-radius:3px; padding:1px 5px; font-size:9px; font-weight:700; letter-spacing:0.3px;">LLM</span>
            </button>
          </div>

          <!-- Card Body -->
          <div style="padding:12px 14px;">
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">

              <!-- Start Date -->
              <div>
                <label style="font-size:11px; color:#888; font-weight:600; margin-bottom:4px; display:block;">
                  <i class="fas fa-play-circle" style="color:#00a65a; margin-right:4px;"></i>Start Date Worker
                </label>
                <datepicker
                  input-class="form-control input-sm"
                  type="datetime"
                  format="DD/MM/YYYY HH:mm"
                  v-model="x.worker_start_date"
                  overdate=""
                  @change="validateWorkerDates(x)">
                </datepicker>
              </div>

              <!-- End Date -->
              <div>
                <label style="font-size:11px; color:#888; font-weight:600; margin-bottom:4px; display:block;">
                  <i class="fas fa-stop-circle" style="color:#dd4b39; margin-right:4px;"></i>End Date Worker
                </label>
                <datepicker
                  input-class="form-control input-sm"
                  v-model="x.worker_end_date"
                  overdate=""
                  @change="validateWorkerDates(x)">
                </datepicker>
              </div>

              <!-- Due Date -->
              <div>
                <label style="font-size:11px; color:#888; font-weight:600; margin-bottom:4px; display:block;">
                  <i class="fas fa-calendar-check" style="color:#f39c12; margin-right:4px;"></i>Due Date (REQ.)
                </label>
                <datepicker
                  input-class="form-control input-sm"
                  v-model="x.due_date"
                  >
                </datepicker>
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr auto; gap:12px; align-items:end;">

              <!-- Worker -->
              <div>
                <label style="font-size:11px; color:#888; font-weight:600; margin-bottom:4px; display:block;">
                  <i class="fas fa-user-cog" style="color:#3c8dbc; margin-right:4px;"></i>Worker Task
                </label>
                <div style="display:flex; align-items:center; gap:6px;
                             background:#f8f9fa; border:1px solid #ddd; border-radius:4px;
                             padding:5px 10px; min-height:30px;">
                  <i class="fas fa-user" style="color:#aaa; font-size:12px;"></i>
                  <span style="flex:1; font-size:13px; color:#333;">
                    {{ x.assign_empno_name || '(ยังไม่ระบุ)' }}
                  </span>
                  <a href="#"
                     @click.prevent="empModalSelected2('change_worker_d', x.itemno)"
                     style="color:#3c8dbc; font-size:13px; flex-shrink:0;"
                     :title="ui.erp_select_employee || 'เลือกพนักงาน'">
                    <i class="fas fa-search"></i>
                  </a>
                  <a v-if="idx === 0 && detailChange.length > 1"
                     href="#"
                     @click.prevent="copyWorkerTaskToAll()"
                     style="color:#00a65a; font-size:13px; flex-shrink:0; border-left:1px solid #ddd; padding-left:8px;"
                     title="Copy Worker Task ไปยังทุก Task">
                    <i class="fas fa-clone"></i>
                  </a>
                </div>
              </div>

              <!-- Level of Difficult -->
              <div style="min-width:140px;">
                <label style="font-size:11px; color:#888; font-weight:600; margin-bottom:4px; display:block;">
                  <i class="fas fa-tachometer-alt" style="color:#9b59b6; margin-right:4px;"></i>Level of Difficult
                </label>
                <div style="display:flex; gap:4px;">
                  <button
                    v-for="lv in [1,2,3,4,5]"
                    :key="lv"
                    type="button"
                    @click="x.level_task = String(lv)"
                    :style="{
                      width: '28px', height: '28px',
                      border: 'none', borderRadius: '4px',
                      fontWeight: '700', fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      background: String(x.level_task) === String(lv)
                        ? (lv <= 2 ? '#00a65a' : lv === 3 ? '#f39c12' : '#dd4b39')
                        : '#e9ecef',
                      color: String(x.level_task) === String(lv) ? '#fff' : '#666',
                      boxShadow: String(x.level_task) === String(lv) ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                    }"
                  >{{ lv }}</button>
                </div>
              </div>

            </div>

            <!-- AI Analysis Result -->
            <div v-if="x.ai_analysis_result" style="margin-top:12px; text-align:right;">
              <button type="button"
                      @click.prevent="openAiAnalysisModal(x)"
                      style="border:1px solid #9b59b6; color:#9b59b6; background:#faf5ff;
                             border-radius:5px; padding:5px 12px; font-size:12px; font-weight:600;
                             display:inline-flex; align-items:center; gap:6px;">
                <i class="fas fa-file-alt"></i>{{ ui.csm_trn_view_ai_analysis || 'ดูผลวิเคราะห์ AI' }}
                <span style="background:#9b59b6; color:#fff; border-radius:3px; padding:1px 5px; font-size:9px; font-weight:700; letter-spacing:0.3px;">LLM</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="detailChange.length === 0"
           style="text-align:center; padding:40px 0; color:#aaa;">
        <i class="fas fa-inbox" style="font-size:40px; margin-bottom:10px; display:block;"></i>
        ไม่มีรายการ Task
      </div>

    </template>
    <template #footer>
      <div style="display:flex; justify-content:flex-end; gap:8px; width:100%;">
        <button type="button" class="btn btn-default btn-sm" @click="$refs.change_w.closeModal()" style="border-radius:6px; padding:7px 16px; font-weight:500; border:1px solid #dce4ec;">
          <i class="fas fa-times" style="margin-right:4px;"></i> {{ ui.erp_close || 'ปิด' }}
        </button>
        <button type="button" class="btn btn-success btn-sm" @click.prevent="ValidUpdateDetailTask()" style="border-radius:6px; padding:7px 18px; font-weight:600; box-shadow:0 2px 6px rgba(0,166,90,0.3);">
          <i class="fas fa-save" style="margin-right:4px;"></i> บันทึกการเปลี่ยนแปลง
        </button>
      </div>
    </template>
  </modal-3>
</template>

<script type="text/javascript">
  export default {
    props: {
      detailChange: Array,
      formData: Object,
      runAiAnalysis: Function,
      validateWorkerDates: Function,
      empModalSelected2: Function,
      copyWorkerTaskToAll: Function,
      openAiAnalysisModal: Function,
      ValidUpdateDetailTask: Function,
    },
    data() {
      return {
        ui: window.ui,
        xt: $xt,
      }
    },
    methods: {
      openModal() {
        this.$refs.change_w.openModal()
      },
      closeModal() {
        this.$refs.change_w.closeModal()
      },
      setSize(size) {
        this.$refs.change_w.setSize(size)
      },
    },
  }
</script>
