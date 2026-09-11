<template>
  <modal ref="modalRef" sheet-class="ct-sheet">
    <template #header>
      <div class="upm-head">
        <span class="upm-head-icon"><i class="fas fa-cloud-download-alt"></i></span>
        <div class="upm-head-text">
          <h4 class="modal-title upm-head-title">เช็คลิสต์อัปเดตโปรแกรม (Update Program)</h4>
          <div class="upm-head-sub">
            <span class="upm-head-doc">{{ info.job_no }}</span>
            <span v-if="workDate"><i class="far fa-calendar-alt"></i> วันที่ปฏิบัติงาน {{ workDate }}</span>
            <span v-if="workTime"><i class="far fa-clock"></i> {{ ui.erp_time || 'เวลา' }} {{ workTime }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <fieldset class="upm" :disabled="isView">
        <div class="upm-stack">

        <!-- เลือกดำเนินการ -->
        <div class="upm-card">
          <div class="upm-card-title">
            เลือกดำเนินการ <span>(เลือกได้เพียง 1 รายการ)</span>
          </div>
          <label v-for="t in targets" :key="t.key"
                 class="upm-choice" :class="{ 'is-active': selected === t.key }">
            <input type="radio" :value="t.key" v-model="selected" @change="resetForm()" />
            <span class="upm-choice-no">{{ t.no }}</span>
            <span class="upm-choice-name">{{ t.name }}</span>
          </label>
        </div>

        <!-- 1.1.1 ERP Windows -->
        <div class="upm-panel" :class="{ 'is-open': selected === 'WIN' }">
          <div class="upm-panel-head" @click="togglePanel('WIN')">
            <span class="upm-panel-no">1.1.1</span>
            <span class="upm-panel-name">ERP Windows</span>
            <span class="upm-chip">Program</span>
            <i class="fas fa-chevron-down upm-caret" :class="{ 'is-up': selected === 'WIN' && panelOpen }"></i>
          </div>
          <div class="upm-panel-body" v-if="selected === 'WIN'" v-show="panelOpen">

            <div class="upm-sec">Task Description</div>
            <div class="upm-row">
              <label class="upm-label">Database</label>
              <select class="form-control input-sm" v-model="form.database_pg">
                <option v-for="o in databaseOptions" :key="o.value" :value="o.value">{{ o.text }}</option>
              </select>
            </div>
            <div class="upm-row">
              <label class="upm-label">Database Type</label>
              <select class="form-control input-sm" v-model="form.database_ty">
                <option v-for="o in databaseTypeOptions" :key="o.value" :value="o.value">{{ o.text }}</option>
              </select>
            </div>

            <div class="upm-sec">Environment Description</div>
            <div class="upm-row">
              <label class="upm-label">Server Access</label>
              <select class="form-control input-sm" v-model="form.server_acc">
                <option v-for="o in serverAccessOptions" :key="o.value" :value="o.value">{{ o.text }}</option>
              </select>
            </div>
            <div class="upm-row">
              <label class="upm-label">Server Account</label>
              <input type="text" class="form-control input-sm" placeholder="Administrator / ......" v-model.trim="form.server_aco" />
            </div>
            <div class="upm-row">
              <label class="upm-label">Server User Right</label>
              <input type="text" class="form-control input-sm" placeholder="Administrators" v-model.trim="form.server_user_r" />
            </div>
            <div class="upm-row">
              <label class="upm-label">Compression</label>
              <select class="form-control input-sm" v-model="form.compression">
                <option v-for="o in compressionOptions" :key="o.value" :value="o.value">{{ o.text }}</option>
              </select>
            </div>

            <div class="upm-sec">Software Description</div>
            <div class="upm-row">
              <label class="upm-label">Request Revision</label>
              <input type="text" class="form-control input-sm" :placeholder="ui.erp_revision_no || 'Revision No.'" maxlength="20" v-model.trim="form.request_version" />
            </div>
            <div class="upm-row">
              <label class="upm-label">Current Revision</label>
              <input type="text" class="form-control input-sm" :placeholder="ui.erp_revision_no || 'Revision No.'" maxlength="20" v-model.trim="form.current_version" />
            </div>

          </div>
        </div>

        <!-- 1.2.1 ERP Web -->
        <div class="upm-panel" :class="{ 'is-open': selected === 'WEB' }">
          <div class="upm-panel-head" @click="togglePanel('WEB')">
            <span class="upm-panel-no">1.2.1</span>
            <span class="upm-panel-name">ERP Web</span>
            <span class="upm-chip">Program</span>
            <i class="fas fa-chevron-down upm-caret" :class="{ 'is-up': selected === 'WEB' && panelOpen }"></i>
          </div>
          <div class="upm-panel-body" v-if="selected === 'WEB'" v-show="panelOpen">

            <div class="upm-sec">Task Description</div>
            <div class="upm-subtitle">Program</div>
            <div class="upm-grid">
              <label v-for="p in programOptions" :key="p.value"
                     class="upm-check" :class="{ 'is-checked': selectedPrograms.includes(p.value) }">
                <input type="checkbox" :value="p.value" v-model="selectedPrograms" />
                <span>{{ p.text }}</span>
              </label>
            </div>
            <div class="upm-row">
              <label class="upm-label">Database</label>
              <select class="form-control input-sm" v-model="form.database_pg">
                <option v-for="o in databaseOptions" :key="o.value" :value="o.value">{{ o.text }}</option>
              </select>
            </div>
            <div class="upm-row">
              <label class="upm-label">Database Type</label>
              <select class="form-control input-sm" v-model="form.database_ty">
                <option v-for="o in databaseTypeOptions" :key="o.value" :value="o.value">{{ o.text }}</option>
              </select>
            </div>

            <div class="upm-sec">Environment Description</div>
            <div class="upm-row">
              <label class="upm-label">Server Access</label>
              <select class="form-control input-sm" v-model="form.server_acc">
                <option v-for="o in serverAccessOptions" :key="o.value" :value="o.value">{{ o.text }}</option>
              </select>
            </div>
            <div class="upm-row">
              <label class="upm-label">Server Account</label>
              <input type="text" class="form-control input-sm" placeholder="Administrator / ......" v-model.trim="form.server_aco" />
            </div>
            <div class="upm-row">
              <label class="upm-label">Server User Right</label>
              <input type="text" class="form-control input-sm" placeholder="Administrators" v-model.trim="form.server_user_r" />
            </div>
            <div class="upm-row">
              <label class="upm-label">Compression</label>
              <select class="form-control input-sm" v-model="form.compression">
                <option v-for="o in compressionOptions" :key="o.value" :value="o.value">{{ o.text }}</option>
              </select>
            </div>
            <div class="upm-row">
              <label class="upm-label">Windows Collaborating</label>
              <select class="form-control input-sm" v-model="form.win_coll">
                <option v-for="o in yesNoOptions" :key="o">{{ o }}</option>
              </select>
            </div>

            <div class="upm-sec"><span class="upm-sec-no">1.2.1.10</span> Check Version</div>
            <div v-if="!selectedPrograms.length" class="upm-hint">
              <i class="fas fa-info-circle"></i> เลือกโปรแกรมใน Task Description เพื่อระบุเวอร์ชัน
            </div>
            <div v-else class="upm-vtable-wrap">
              <table class="upm-vtable">
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>Current Version</th>
                    <th>Request Version</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="v in versionPrograms" :key="v.value">
                    <td class="upm-vtable-name">{{ v.text }}</td>
                    <td>
                      <input type="text" class="form-control input-sm" placeholder="เช่น 20260415" maxlength="20"
                             v-model.trim="versions[v.value].current_version" />
                    </td>
                    <td>
                      <input type="text" class="form-control input-sm" placeholder="เช่น 20260815" maxlength="20"
                             v-model.trim="versions[v.value].request_version" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="upm-sec">
              <span class="upm-sec-no">1.2.1.13</span> Check Patch Update
              <span v-if="patchFiles.length" class="upm-sec-count">{{ patchFiles.length }} ไฟล์</span>
            </div>
            <div v-if="patchLoading" class="upm-hint">
              <i class="fas fa-spinner fa-spin"></i> กำลังโหลดรายการไฟล์...
            </div>
            <div v-else-if="!patchFiles.length" class="upm-hint">
              <i class="fas fa-info-circle"></i> ไม่พบไฟล์ใน UpdateStructure
            </div>
            <div class="upm-pgrid">
              <label v-for="p in patchFiles" :key="p.filename" :title="p.filename"
                     class="upm-listrow" :class="{ 'is-checked': selectedPatches.includes(p.name) }">
                <input type="checkbox" :value="p.name" v-model="selectedPatches" />
                <span class="upm-listrow-name">{{ p.name }}</span>
                <span class="upm-ver">{{ p.file_dt | date }}</span>
              </label>
            </div>

          </div>
        </div>

        <!-- อัปเดตสถานะงาน (Worker) -->
        <div class="upm-card" v-if="isMango && canWorkerUpdate && !isView">
          <div class="upm-card-title">
            อัปเดตสถานะงาน <span>(ผู้ปฏิบัติงาน)</span>
          </div>

          <div class="upm-wstack">
            <div class="upm-wsec">
              <a class="upm-wsec-head" :class="{ 'is-open': statusSecOpen }" @click.prevent="statusSecOpen = !statusSecOpen">
                <span class="upm-wsec-ic"><i class="fas fa-check-circle"></i></span>
                <span class="upm-wsec-title">{{ ui.csm_home_job_status || 'สถานะงาน' }}</span>
                <span class="upm-wsec-chev"><i class="fas fa-chevron-down"></i></span>
              </a>
              <div class="upm-wsec-body" v-show="statusSecOpen">
                <div class="upm-pills">
                  <label v-for="s in statusOptions" :key="s.value"
                         class="upm-pill" :class="['is-' + s.tone, { 'is-active': worker.status_update === s.value }]">
                    <input type="radio" :value="s.value" v-model="worker.status_update" />
                    <i :class="s.icon"></i>
                    <span>{{ s.text }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="upm-wsec">
              <a class="upm-wsec-head" :class="{ 'is-open': progressSecOpen }" @click.prevent="progressSecOpen = !progressSecOpen">
                <span class="upm-wsec-ic"><i class="fas fa-chart-line"></i></span>
                <span class="upm-wsec-title">{{ ui.csm_trn_work_progress || 'ความคืบหน้างาน' }}</span>
                <span class="upm-wsec-chev"><i class="fas fa-chevron-down"></i></span>
              </a>
              <div class="upm-wsec-body" v-show="progressSecOpen">
                <div class="upm-tiles">
                  <div class="upm-tile">
                    <label>{{ ui.csm_trn_new_progress || 'New Progress %' }}</label>
                    <number decimals="3" class="form-control input-sm text-right" v-model.trim="worker.n_progress" @input="onProgressInput()"></number>
                  </div>
                  <div class="upm-tile">
                    <label>{{ ui.csm_trn_new_manhour || 'New Man-Hour (HH:MM)' }}</label>
                    <timepicker input-class="form-control input-sm" format="HH:mm" v-model="worker.n_manhour" @input="onManhourInput"></timepicker>
                  </div>
                  <div class="upm-tile">
                    <label>{{ ui.csm_trn_total_manhour || 'Total Man-Hour (MM)' }}</label>
                    <div class="upm-tile-val">{{ totalManhour }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="upm-wgrid">
            <div class="form-group">
              <label class="text-danger">{{ ui.csm_trn_revision_uat || 'เลขที่ Revision (UAT)' }}</label>
              <input type="text" class="form-control input-sm" :placeholder="ui.csm_trn_revision_uat_ph || 'เลขที่ Revision (UAT)'" maxlength="28" v-model.trim="worker.revision" />
            </div>
            <div class="form-group">
              <label>{{ ui.csm_trn_revision_prod || 'เลขที่ Revision (PROD)' }}</label>
              <input type="text" class="form-control input-sm" :placeholder="ui.csm_trn_revision_prod_ph || 'เลขที่ Revision (Production)'" maxlength="28" v-model.trim="worker.revision_prod" />
            </div>
            <div class="form-group">
              <label>{{ ui.csm_trn_update_program_date || 'วันที่อัพเดทโปรแกรม' }}</label>
              <datepicker input-class="form-control input-sm" v-model="worker.update_software_dt"></datepicker>
            </div>
          </div>
          <div class="form-group">
            <label>{{ ui.csm_trn_worker_remark || 'ความคิดเห็นจากผู้ปฏิบัติงาน' }}</label>
            <textarea class="form-control input-sm" rows="6" :placeholder="ui.csm_trn_type_comment_ph || 'พิมพ์ความคิดเห็น...'" v-model.trim="worker.description_worker"></textarea>
          </div>
        </div>

        <!-- อัปเดตสถานะงาน (อ่านอย่างเดียว) -->
        <div class="upm-card" v-if="isView">
          <div class="upm-card-title">
            สถานะงาน / ความคืบหน้างาน <span>(ผู้ปฏิบัติงาน)</span>
          </div>
          <table class="upm-kv">
            <tr><td>{{ ui.csm_home_job_status || 'สถานะงาน' }}</td><td>{{ workerView.status }}</td></tr>
            <tr><td>{{ ui.csm_trn_total_progress || 'Total Progress %' }}</td><td>{{ workerView.t_progress }} %</td></tr>
            <tr><td>{{ ui.csm_trn_total_manhour || 'Total Man-Hour (MM)' }}</td><td>{{ workerView.t_manhour }}</td></tr>
            <tr><td>{{ ui.csm_trn_revision_uat || 'เลขที่ Revision (UAT)' }}</td><td>{{ workerView.revision }}</td></tr>
            <tr><td>{{ ui.csm_trn_revision_prod || 'เลขที่ Revision (PROD)' }}</td><td>{{ workerView.revision_prod }}</td></tr>
            <tr><td>{{ ui.csm_trn_update_program_date || 'วันที่อัพเดทโปรแกรม' }}</td><td>{{ workerView.update_software_dt }}</td></tr>
            <tr><td>{{ ui.csm_trn_worker_remark || 'ความคิดเห็นจากผู้ปฏิบัติงาน' }}</td><td class="upm-pre">{{ workerView.description_worker }}</td></tr>
          </table>
        </div>

        <!-- ผู้เกี่ยวข้อง -->
        <div class="upm-signrow">
          <div><span>ลูกค้าบริษัท :</span> {{ info.cus_name || '-' }}</div>
          <div><span>ผู้แจ้งงาน :</span> {{ info.request_name || '-' }}</div>
          <div><span>ผู้อัพเดทโปรแกรม :</span> {{ info.assign_name || '-' }}</div>
        </div>

        </div>
      </fieldset>
    </template>

    <template #footer>
      <div class="upm-foot">
        <button class="btn btn-sm btn-default upm-btn-close" @click="close()">
          <i class="fas fa-times"></i> {{ ui.csm_v2_close_window || 'ปิดหน้าต่าง' }}
        </button>
        <button v-if="isView" class="btn btn-sm btn-danger upm-btn-save" @click="genPdf()" v-bind:disabled="pdfLoading">
          <i class="fas" :class="pdfLoading ? 'fa-spinner fa-spin' : 'fa-file-pdf'"></i> Gen PDF
        </button>
        <button v-else class="btn btn-sm btn-success upm-btn-save" @click="saveClick()">
          <i class="fas fa-check"></i> อัพเดตข้อมูล
        </button>
      </div>
    </template>
  </modal>
</template>

<script type="text/javascript">
  let process = false;
  export default {
    data() {
      return {
        ui: window.ui,
        mode: 'edit',
        pdfLoading: false,
        info: {},
        selected: '',
        targets: [
          { key: 'WIN', no: '1.1.1', name: 'ERP Windows' },
          { key: 'WEB', no: '1.2.1', name: 'ERP Web' },
        ],
        databaseOptions: [
          { value: 'P', text: 'Production' },
          { value: 'D', text: 'DEMO' },
        ],
        databaseTypeOptions: [
          { value: '1', text: 'SQL' },
          { value: '2', text: 'Sybase' },
        ],
        serverAccessOptions: [
          { value: '1', text: 'Remote Desktop' },
          { value: '2', text: 'AnyDesk' },
          { value: '3', text: 'TeamViewer' },
          { value: '4', text: 'UltraViewer' },
          { value: '5', text: 'VNC' },
          { value: '6', text: 'Google Remote Desktop' },
          { value: '7', text: 'Quick Assist' },
          { value: '8', text: 'PAM' },
        ],
        compressionOptions: [
          { value: '1', text: '7Zip' },
          { value: '2', text: 'WinRAR' },
          { value: '3', text: 'PeaZip' },
          { value: '4', text: 'Windows Replace' },
        ],
        yesNoOptions: ['Y', 'N'],
        statusOptions: [
          { value: 'W', text: window.ui.erp_none || 'None', icon: 'far fa-circle', tone: 'grey' },
          { value: 'R', text: window.ui.erp_reject || 'Reject', icon: 'fas fa-times', tone: 'red' },
          { value: 'I', text: window.ui.csm_v2_status_in_progress || 'In Progress', icon: 'far fa-clock', tone: 'cyan' },
          { value: 'H', text: window.ui.csm_trn_status_hold || 'Hold', icon: 'fas fa-pause', tone: 'amber' },
          { value: 'S', text: window.ui.csm_trn_send_pretest || 'Send Pretest', icon: 'fas fa-arrow-right', tone: 'green' },
        ],
        form: {},
        worker: {},
        versions: {},
        selectedPatches: [],
        panelOpen: true,
        statusSecOpen: true,
        progressSecOpen: true,
        programOptions: [
          { value: 'ERP', text: 'ERP Web' },
          { value: 'Planning', text: window.ui.erp_planning || 'Planning' },
          { value: 'CSM', text: 'CSM' },
          { value: 'RE', text: 'RE' },
          { value: 'ReQ', text: 'RealtyQuick' },
          { value: 'RE3', text: 'RE3' },
          { value: 'SFC-DC', text: 'SFC-DC' },
          { value: 'MCA-DC', text: 'MCA-DC' },
          { value: 'MCA-DC-B', text: 'MCA-DC-Backend' },
          { value: 'CBF', text: 'Carbon Foot Print' },
          { value: 'ADD', text: 'Add Spec' },
          { value: 'BK', text: 'Booking' },
        ],
        selectedPrograms: [],
        patchFiles: [],
        patchLoading: false,
      }
    },
    computed: {
      workDate() {
        return $xt.formatDate(this.info.upd_software_dt)
      },
      workTime() {
        return $xt.formatDate(this.info.upd_software_dt, 'HH.mm.ss')
      },
      versionPrograms() {
        return this.programOptions.filter(x => this.selectedPrograms.includes(x.value))
      },
      isMango() {
        return $linq(this.$store.state.configData)
          .where(x => x.config_id == 'TRN0001')
          .select(x => x.config_value)
          .firstOrDefault() == 'Y'
      },
      isView() {
        return this.mode === 'view'
      },
      workerView() {
        return {
          status: this.info.status_description || '-',
          t_progress: parseFloat(this.info.t_progress) || 0,
          t_manhour: $xt.isEmpty(this.info.t_manhour) ? 0 : this.info.t_manhour,
          revision: this.info.revision || '-',
          revision_prod: this.info.revision_prod || '-',
          update_software_dt: $xt.formatDate(this.info.update_software_dt) || '-',
          description_worker: this.info.description_worker || '-',
        }
      },
      canWorkerUpdate() {
        return !['X', 'T', 'Y'].includes((this.info.status || '').toString())
          && (this.info.job_status || '').toString() != 'H'
      },
      baseProgress() {
        let t = parseFloat(this.info.t_progress) || 0
        return Math.min(100, Math.max(0, t))
      },
      totalManhour() {
        return $xt.isEmpty(this.info.t_manhour) ? 0 : this.info.t_manhour
      },
    },
    methods: {
      onProgressInput() {
        let t = Math.round(this.baseProgress * 1000) / 1000
        let n = Math.round((parseFloat(this.worker.n_progress) || 0) * 1000) / 1000

        if (t >= 100 && n > 0) {
          this.worker.n_progress = 0
          $msg.alert(this.ui.csm_v2_warning || 'Warning', this.ui.csm_trn_progress_full_100 || 'Total Progress ครบ 100% แล้วไม่สามารถกรอกยอด New Progress ค่าบวกเพิ่มได้', 'warning')
          return
        }

        let total = t + n
        if (total > 100) {
          this.worker.n_progress = 100 - t
          $msg.alert(this.ui.csm_v2_warning || 'Warning', `ไม่สามารถเพิ่ม Total Progress มากกว่า 100% ได้   คุณสามารถเพิ่ม New Progress ได้สูงสุดไม่เกิน ${(100 - t).toFixed(0)}% เท่านั้น`, 'warning')
        }
        else if (total < 0) {
          this.worker.n_progress = -t
          $msg.alert(this.ui.csm_v2_warning || 'Warning', `ไม่สามารถลด Total Progress ต่ำกว่า 0% ได้    คุณสามารถลด New Progress ได้สูงสุดไม่เกิน ${t.toFixed(0)}% เท่านั้น`, 'warning')
        }
      },
      onManhourInput(val) {
        if (val === '' || val === null) {
          this.worker.n_manhour = null
          return
        }
        this.worker.n_manhour = moment(val, 'HH:mm').isValid() ? moment(val, 'HH:mm').format('HH:mm') : val
      },
      togglePanel(key) {
        if (this.selected !== key) return
        this.panelOpen = !this.panelOpen
      },
      resetForm() {
        this.panelOpen = true
        this.selectedPrograms = []
        this.selectedPatches = []
        let object_type = (this.info.object_type || '').toString().trim().toUpperCase()
        this.form = {
          database_pg: this.databaseOptions.some(x => x.value === object_type) ? object_type : 'P',
          database_ty: '1',
          server_acc: '1',
          server_aco: '',
          server_user_r: '',
          compression: '1',
          win_coll: 'Y',
          current_version: '',
          request_version: '',
        }
        let versions = {}
        this.programOptions.forEach(x => {
          versions[x.value] = { current_version: '', request_version: '' }
        })
        this.versions = versions
      },
      resetWorker() {
        let status = (this.info.status || '').toString()
        this.worker = {
          status_update: ['W', 'R', 'I', 'H', 'S'].includes(status) ? status : '',
          n_progress: null,
          n_manhour: '',
          revision: this.info.revision || '',
          revision_prod: this.info.revision_prod || '',
          update_software_dt: this.info.update_software_dt || null,
          description_worker: this.info.description_worker || '',
        }
      },
      open(row, mode) {
        this.info = row || {}
        this.mode = mode === 'view' ? 'view' : 'edit'
        let platform = (this.info.platform || '').toString().trim().toUpperCase()
        this.selected = ['WIN', 'WEB'].includes(platform) ? platform : ''
        this.resetForm()
        this.resetWorker()
        this.$refs.modalRef.setSize('modal-lg')
        this.$refs.modalRef.openModal()
        this.loadPatchFiles()
        this.loadSaved()
      },
      async loadSaved() {
        try {
          let act = `CSM/Data/CSM_ReadTrnUpdatePGList?job_no=${encodeURIComponent(this.info.job_no || '')}&itemno=${encodeURIComponent(this.info.itemno)}`
          let rsp = await $xt.getServer(act)
          if (!rsp.success) throw rsp.error

          let rows = rsp.data.data || []
          if (!rows.length) {
            if (this.isView) {
              this.selected = ''
              $msg.alert(this.ui.csm_v2_notification || 'แจ้งเตือน', 'ยังไม่มีข้อมูลเช็คลิสต์อัปเดตโปรแกรมของรายการนี้', 'warning')
            }
            return
          }

          let first = rows[0]
          this.selected = rows.length === 1 && first.pg_code === 'ERP_WEB' ? 'WIN' : 'WEB'
          this.form = {
            database_pg: first.database_pg || 'P',
            database_ty: first.database_ty || '1',
            server_acc: first.server_acc || '1',
            server_aco: first.server_aco || '',
            server_user_r: first.server_user_r || '',
            compression: first.compression || '1',
            win_coll: first.win_coll || 'Y',
            current_version: first.current_version || '',
            request_version: first.request_version || '',
          }

          let versions = {}
          this.programOptions.forEach(x => {
            let r = rows.find(y => y.pg_code == x.value)
            versions[x.value] = {
              current_version: r ? r.current_version || '' : '',
              request_version: r ? r.request_version || '' : '',
            }
          })
          this.versions = versions
          this.selectedPrograms = this.selected === 'WEB' ? rows.map(x => x.pg_code) : []

          try {
            this.selectedPatches = JSON.parse(first.patch_update || '[]') || []
          } catch (e) {
            this.selectedPatches = []
          }
        } catch (ex) {
          $msg.alert(this.ui.csm_v2_warning || 'Warning', ex.toString(), 'warning')
        }
      },
      async genPdf() {
        try {
          this.pdfLoading = true
          let rsp = await $xt.postServerJson(`CSM/Data/CSM_GenerateUpdatePGPdf`, {
            job_no: this.info.job_no,
            itemno: this.info.itemno,
          })
          if (!rsp.success) throw rsp.error

          let filename = encodeURIComponent(rsp.data.filename || 'Update_Program.pdf')
          window.open(`${dataServer}Api/File/DownLoad?id=${rsp.data.id}&download=true&filename=${filename}`, '_blank')
        } catch (ex) {
          $msg.alert(this.ui.csm_v2_warning || 'Warning', ex.toString(), 'warning')
        } finally {
          this.pdfLoading = false
        }
      },
      close() {
        this.$refs.modalRef.closeModal()
      },
      buildRows() {
        let env = {
          job_no: this.info.job_no,
          itemno: this.info.itemno,
          database_pg: this.form.database_pg,
          database_ty: this.form.database_ty,
          server_acc: this.form.server_acc,
          server_aco: this.form.server_aco,
          server_user_r: this.form.server_user_r,
          compression: this.form.compression,
        }

        if (this.selected === 'WIN') {
          return [{
            ...env,
            itemno_row: 1,
            pg_code: 'ERP_WEB',
            win_coll: null,
            current_version: this.form.current_version,
            request_version: this.form.request_version,
            patch_update: null,
          }]
        }

        let patch_update = JSON.stringify(this.selectedPatches)
        return this.versionPrograms.map((x, i) => ({
          ...env,
          itemno_row: i + 1,
          pg_code: x.value,
          win_coll: this.form.win_coll,
          current_version: this.versions[x.value].current_version,
          request_version: this.versions[x.value].request_version,
          patch_update,
        }))
      },
      async saveClick() {
        if (process) return
        try {
          if (!this.selected) throw 'กรุณาเลือกดำเนินการ 1 รายการ'
          if (this.selected === 'WEB' && !this.selectedPrograms.length) throw 'กรุณาเลือกโปรแกรมใน Task Description'

          let n = parseFloat(this.worker.n_progress) || 0
          if (this.isMango && this.baseProgress + n > 100) {
            throw `ไม่สามารถเพิ่ม Total Progress มากกว่า 100% ได้ คุณสามารถเพิ่ม New Progress ได้สูงสุดไม่เกิน ${100 - this.baseProgress}% เท่านั้น`
          }
          if (this.isMango && this.baseProgress + n < 0) {
            throw `ไม่สามารถลด Total Progress ต่ำกว่า 0% ได้ คุณสามารถลด New Progress ได้สูงสุดไม่เกิน ${this.baseProgress}% เท่านั้น`
          }

          let f = {
            job_no: this.info.job_no,
            itemno: this.info.itemno,
            rows: this.buildRows(),
            worker: this.isMango && this.canWorkerUpdate ? this.worker : null,
          }

          process = true
          let rsp = await $xt.postServerJson(`CSM/Data/CSM_UpdateTrnUpdatePG`, f)
          if (!rsp.success) throw rsp.error

          $notify.success(this.ui.alert_save_success || 'บันทึกสำเร็จ')
          this.close()
          this.$emit('saved')
        } catch (ex) {
          $msg.alert(this.ui.csm_v2_warning || 'Warning', ex.toString(), 'warning')
        } finally {
          process = false
        }
      },
      async loadPatchFiles() {
        if (this.patchFiles.length || this.patchLoading) return
        try {
          this.patchLoading = true
          let rsp = await $xt.getServer(`CSM/Data/CSM_ReadListUpdateStructure`)
          if (!rsp.success) throw rsp.error

          this.patchFiles = rsp.data.data || []
        } catch (ex) {
          $msg.alert(this.ui.csm_v2_warning || 'Warning', ex.toString(), 'warning')
        } finally {
          this.patchLoading = false
        }
      },
    },
  }
</script>

<style scoped>
  /* ===== Header ===== */
  .upm-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .upm-head-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, .16);
    background: rgba(255, 255, 255, .15);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, .22);
    font-size: 16px;
    flex-shrink: 0;
  }

  .upm-head-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: .2px;
  }

  .upm-head-sub {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 4px;
    font-size: 11.5px;
    color: rgba(255, 255, 255, .78);
  }

  .upm-head-sub i {
    margin-right: 3px;
    opacity: .8;
  }

  .upm-head-doc {
    padding: 2px 9px;
    border-radius: 999px;
    background: rgba(255, 255, 255, .16);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .2);
    font-weight: 700;
    letter-spacing: .6px;
    color: #fff;
  }

  /* ===== Body ===== */
  .upm {
    border: 0;
    margin: 0;
    padding: 2px 0;
    min-width: 0;
  }

  .upm-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .upm-stack > * {
    animation: upm-rise .42s cubic-bezier(.22, .85, .3, 1) both;
  }

  .upm-stack > *:nth-child(2) { animation-delay: .05s; }
  .upm-stack > *:nth-child(3) { animation-delay: .1s; }
  .upm-stack > *:nth-child(4) { animation-delay: .15s; }
  .upm-stack > *:nth-child(n+5) { animation-delay: .2s; }

  @keyframes upm-rise {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }

  @keyframes upm-reveal {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: none; }
  }

  .upm[disabled] .upm-panel-head,
  .upm[disabled] .upm-choice,
  .upm[disabled] .upm-check,
  .upm[disabled] .upm-listrow {
    cursor: default;
  }

  .upm[disabled] .upm-choice:hover,
  .upm[disabled] .upm-check:hover,
  .upm[disabled] .upm-listrow:hover,
  .upm[disabled] .upm-pill:hover {
    transform: none;
    box-shadow: none;
  }

  .upm-card {
    border: 1px solid #e8ecf3;
    border-radius: 12px;
    background: #fff;
    padding: 15px 16px;
    box-shadow: 0 1px 1px rgba(15, 35, 66, .03),
                0 6px 16px -12px rgba(15, 35, 66, .5);
  }

  .upm-card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 700;
    color: #334862;
    margin-bottom: 12px;
  }

  .upm-card-title::before {
    content: '';
    flex: 0 0 auto;
    width: 3px;
    height: 13px;
    border-radius: 2px;
    background: linear-gradient(180deg, #2f6fb4 0%, #02234e 100%);
  }

  .upm-card-title span {
    font-weight: 500;
    color: #90a0b5;
  }

  /* ===== Choice (radio) ===== */
  .upm-choice {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    margin: 0 0 8px;
    padding: 11px 14px 11px 17px;
    border: 1px solid #e4e9f1;
    border-radius: 10px;
    background: #fff;
    font-weight: 400;
    cursor: pointer;
    overflow: hidden;
    transition: border-color .16s ease, background-color .16s ease, box-shadow .16s ease, transform .18s cubic-bezier(.5, 1.35, .4, 1);
  }

  .upm-choice::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #2f6fb4 0%, #02234e 100%);
    transform: scaleY(0);
    transition: transform .22s cubic-bezier(.5, 1.35, .4, 1);
  }

  .upm-choice.is-active::before {
    transform: scaleY(1);
  }

  .upm-choice:last-child {
    margin-bottom: 0;
  }

  .upm-choice:hover {
    border-color: #bcd0e8;
    background: #fafcff;
    transform: translateY(-1px);
    box-shadow: 0 6px 14px -10px rgba(15, 35, 66, .75);
  }

  .upm-choice.is-active {
    border-color: #2f6fb4;
    background: #f2f8ff;
    box-shadow: 0 0 0 3px rgba(47, 111, 180, .1);
  }

  .upm-choice input {
    margin: 0;
    width: 15px;
    height: 15px;
    accent-color: #2f6fb4;
    cursor: pointer;
  }

  .upm-choice-no {
    padding: 2px 8px;
    border-radius: 6px;
    background: #eef2f8;
    font-family: Consolas, Menlo, monospace;
    font-size: 12px;
    font-weight: 700;
    color: #7b8ca4;
    letter-spacing: .5px;
    transition: background-color .16s ease, color .16s ease;
  }

  .upm-choice.is-active .upm-choice-no {
    background: linear-gradient(180deg, #2f6fb4 0%, #1d4b86 100%);
    color: #fff;
  }

  .upm-choice-name {
    font-size: 13px;
    font-weight: 600;
    color: #22364f;
  }

  /* ===== Panel ===== */
  .upm-panel {
    position: relative;
    border: 1px solid #e8ecf3;
    border-radius: 12px;
    background: #fbfcfe;
    overflow: hidden;
    transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease;
  }

  .upm-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #2f6fb4 0%, #02234e 100%);
    transform: scaleY(0);
    transform-origin: top;
    transition: transform .28s cubic-bezier(.22, .85, .3, 1);
  }

  .upm-panel.is-open::before {
    transform: scaleY(1);
  }

  .upm-panel.is-open {
    background: #fff;
    border-color: #dde6f2;
    box-shadow: 0 2px 10px rgba(15, 35, 66, .06),
                0 18px 34px -28px rgba(15, 35, 66, .8);
  }

  .upm-panel-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    cursor: pointer;
    user-select: none;
  }

  .upm-panel-head {
    transition: background-color .16s ease;
  }

  .upm-panel:not(.is-open):hover .upm-panel-head {
    background: #f7f9fd;
  }

  .upm[disabled] .upm-panel:not(.is-open):hover .upm-panel-head {
    background: transparent;
  }

  .upm-panel:not(.is-open) .upm-panel-head {
    cursor: default;
  }

  .upm-panel-no {
    font-family: Consolas, Menlo, monospace;
    font-size: 12px;
    font-weight: 700;
    color: #b3bdcb;
    letter-spacing: .5px;
  }

  .upm-panel-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #98a5b6;
  }

  .upm-panel.is-open .upm-panel-no {
    color: #6f8199;
  }

  .upm-panel.is-open .upm-panel-name {
    color: #16283e;
  }

  .upm-chip {
    padding: 2px 9px;
    border-radius: 999px;
    background: #eef2f8;
    color: #8797ab;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .3px;
  }

  .upm-panel.is-open .upm-chip {
    background: #e8f0fe;
    color: #315fbd;
  }

  .upm-caret {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    margin-left: auto;
    border-radius: 50%;
    background: #f1f4f9;
    font-size: 10px;
    color: #b9c3d0;
    transition: transform .22s cubic-bezier(.5, 1.35, .4, 1), background-color .16s ease, color .16s ease;
  }

  .upm-panel.is-open .upm-caret {
    background: #e8f0fe;
    color: #2f6fb4;
  }

  .upm-caret.is-up {
    transform: rotate(180deg);
  }

  .upm-panel-body {
    padding: 4px 16px 18px;
    border-top: 1px solid #eef1f6;
    animation: upm-reveal .28s cubic-bezier(.22, .85, .3, 1) both;
  }

  /* ===== Section / rows ===== */
  .upm-sec {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 18px 0 12px;
    padding-bottom: 7px;
    border-bottom: 1px dashed #e2e8f1;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #7f93ad;
  }

  .upm-sec::before {
    content: '';
    flex: 0 0 auto;
    width: 3px;
    height: 11px;
    border-radius: 2px;
    background: #c2cfdf;
  }

  .upm-sec-no {
    font-family: Consolas, Menlo, monospace;
    letter-spacing: .5px;
    color: #a9b6c7;
    text-transform: none;
  }

  .upm-sec-count {
    margin-left: auto;
    padding: 2px 9px;
    border-radius: 999px;
    background: #e8f0fe;
    color: #315fbd;
    font-size: 10px;
    letter-spacing: .3px;
    text-transform: none;
    font-variant-numeric: tabular-nums;
  }

  .upm-hint {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 11px 13px;
    border: 1px dashed #dfe6f0;
    border-radius: 8px;
    background: #fafcff;
    font-size: 12px;
    color: #8d9cb0;
  }

  .upm-subtitle {
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #4a5f79;
  }

  .upm-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 9px;
  }

  .upm-label {
    flex: 0 0 165px;
    margin: 0;
    font-size: 12.5px;
    font-weight: 500;
    color: #46596f;
  }

  .upm-row .form-control {
    flex: 1 1 auto;
    height: 34px;
    border-radius: 7px;
    border-color: #dfe6ef;
    font-size: 12.5px;
    box-shadow: none;
  }

  .upm-row .form-control:focus {
    border-color: #2f6fb4;
    box-shadow: 0 0 0 3px rgba(47, 111, 180, .12);
  }

  /* ===== Program grid ===== */
  .upm-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 14px;
  }

  .upm-check {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 0;
    padding: 9px 12px;
    border: 1px solid #e4e9f1;
    border-radius: 8px;
    background: #fff;
    font-size: 12px;
    font-weight: 500;
    color: #46596f;
    cursor: pointer;
    transition: border-color .16s ease, background-color .16s ease, box-shadow .16s ease, transform .18s cubic-bezier(.5, 1.35, .4, 1);
  }

  .upm-check:hover {
    border-color: #bcd0e8;
    background: #fafcff;
    transform: translateY(-1px);
    box-shadow: 0 6px 14px -10px rgba(15, 35, 66, .75);
  }

  .upm-check input {
    margin: 0;
    width: 14px;
    height: 14px;
    accent-color: #2f6fb4;
    cursor: pointer;
  }

  .upm-check.is-checked {
    border-color: #2f6fb4;
    background: #f2f8ff;
    box-shadow: inset 3px 0 0 #2f6fb4;
  }

  .upm-check input:checked ~ span {
    color: #1d4b86;
    font-weight: 600;
  }

  /* ===== Version table ===== */
  .upm-vtable-wrap {
    overflow-x: auto;
    margin-bottom: 6px;
  }

  .upm-vtable {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  .upm-vtable th {
    padding: 0 10px 8px;
    border-bottom: 1px solid #eef1f6;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .8px;
    text-transform: uppercase;
    color: #93a3b8;
    white-space: nowrap;
  }

  .upm-vtable th:first-child,
  .upm-vtable td:first-child {
    padding-left: 2px;
    width: 180px;
  }

  .upm-vtable td {
    padding: 7px 10px;
    vertical-align: middle;
    transition: background-color .14s ease;
  }

  .upm-vtable tbody tr:hover td {
    background: #f7fafd;
  }

  .upm-vtable tbody tr:hover td:first-child {
    border-radius: 8px 0 0 8px;
  }

  .upm-vtable tbody tr:hover td:last-child {
    border-radius: 0 8px 8px 0;
  }

  .upm-vtable-name {
    font-size: 12.5px;
    font-weight: 600;
    color: #2b3f57;
  }

  .upm-vtable .form-control {
    height: 34px;
    border-radius: 7px;
    border-color: #dfe6ef;
    font-size: 12.5px;
    box-shadow: none;
  }

  .upm-vtable .form-control:focus {
    border-color: #2f6fb4;
    box-shadow: 0 0 0 3px rgba(47, 111, 180, .12);
  }

  /* ===== Checklist rows ===== */
  .upm-pgrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .upm-pgrid .upm-listrow {
    margin: 0;
    padding: 7px 10px;
    gap: 8px;
  }

  .upm-pgrid .upm-listrow-name {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 11.5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .upm-pgrid .upm-ver {
    font-size: 9.5px;
  }

  .upm-listrow {
    display: flex;
    align-items: center;
    gap: 11px;
    width: 100%;
    margin: 0 0 7px;
    padding: 10px 13px;
    border: 1px solid #e4e9f1;
    border-radius: 8px;
    background: #fff;
    font-weight: 400;
    cursor: pointer;
    transition: border-color .16s ease, background-color .16s ease, box-shadow .16s ease, transform .18s cubic-bezier(.5, 1.35, .4, 1);
  }

  .upm-listrow:hover {
    border-color: #bcd0e8;
    background: #fafcff;
    transform: translateY(-1px);
    box-shadow: 0 6px 14px -10px rgba(15, 35, 66, .75);
  }

  .upm-listrow.is-checked {
    border-color: #2f6fb4;
    background: #f2f8ff;
    box-shadow: inset 3px 0 0 #2f6fb4;
  }

  .upm-check.is-checked:hover,
  .upm-listrow.is-checked:hover {
    box-shadow: inset 3px 0 0 #2f6fb4, 0 6px 14px -10px rgba(15, 35, 66, .75);
  }

  .upm-listrow input {
    margin: 0;
    width: 14px;
    height: 14px;
    accent-color: #2f6fb4;
    cursor: pointer;
  }

  .upm-listrow-name {
    font-size: 12.5px;
    color: #3a4d64;
  }

  .upm-listrow input:checked ~ .upm-listrow-name {
    color: #1d4b86;
    font-weight: 600;
  }

  .upm-ver {
    margin-left: auto;
    font-family: Consolas, Menlo, monospace;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .4px;
    color: #9aa8bb;
  }

  /* ===== Worker (Update Status) ===== */
  .upm-wstack {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 14px;
  }

  .upm-wsec {
    border: 1px solid #e0e6ed;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
  }

  .upm-wsec-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 15px;
    background: linear-gradient(180deg, #f7f9fc 0%, #f1f4f9 100%);
    border-bottom: 1px solid #e7ebf1;
    cursor: pointer;
    text-decoration: none;
    transition: background-color .16s ease;
  }

  .upm-wsec-head:hover,
  .upm-wsec-head:focus {
    background: #eef2f7;
    text-decoration: none;
  }

  .upm-wsec-ic {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: #e5edf6;
    box-shadow: inset 0 0 0 1px rgba(47, 111, 180, .16);
    color: #0d3661;
    font-size: 12px;
    flex-shrink: 0;
  }

  .upm-wsec-title {
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
  }

  .upm-wsec-chev {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-left: auto;
    color: #5c6b7d;
    font-size: 11px;
    transition: transform .2s ease;
  }

  .upm-wsec-head.is-open .upm-wsec-chev {
    transform: rotate(180deg);
  }

  .upm-wsec-body {
    padding: 15px;
  }

  .upm-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .upm-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 7px 15px;
    border: 1px solid #e0e6ed;
    border-radius: 999px;
    background: #fff;
    font-size: 12.5px;
    font-weight: 500;
    color: #5c6b7d;
    cursor: pointer;
    transition: border-color .16s ease, background-color .16s ease, color .16s ease, box-shadow .16s ease, transform .18s cubic-bezier(.5, 1.35, .4, 1);
  }

  .upm-pill input {
    margin: 0;
    width: 14px;
    height: 14px;
    cursor: pointer;
  }

  .upm-pill > i {
    font-size: 11px;
    opacity: .8;
  }

  .upm-pill:hover {
    border-color: #c3cede;
    background: #fafcff;
    transform: translateY(-1px);
  }

  .upm-pill.is-active {
    font-weight: 600;
  }

  .upm-pill.is-grey input { accent-color: #64748b; }
  .upm-pill.is-red input { accent-color: #e03131; }
  .upm-pill.is-cyan input { accent-color: #0c8599; }
  .upm-pill.is-amber input { accent-color: #b45309; }
  .upm-pill.is-green input { accent-color: #237a4b; }

  .upm-pill.is-grey.is-active {
    border-color: #64748b;
    background: #f1f5f9;
    color: #475569;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, .1);
  }

  .upm-pill.is-red.is-active {
    border-color: #e03131;
    background: #fdeaea;
    color: #b93d39;
    box-shadow: 0 0 0 3px rgba(224, 49, 49, .1);
  }

  .upm-pill.is-cyan.is-active {
    border-color: #0c8599;
    background: #e6f7fa;
    color: #0b6c7d;
    box-shadow: 0 0 0 3px rgba(12, 133, 153, .1);
  }

  .upm-pill.is-amber.is-active {
    border-color: #b45309;
    background: #fff2df;
    color: #9d5f07;
    box-shadow: 0 0 0 3px rgba(180, 83, 9, .1);
  }

  .upm-pill.is-green.is-active {
    border-color: #237a4b;
    background: #e8f8ef;
    color: #237a4b;
    box-shadow: 0 0 0 3px rgba(35, 122, 75, .1);
  }

  .upm-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 14px;
  }

  .upm-tile {
    position: relative;
    padding: 12px 14px;
    border: 1px solid #e7ebf1;
    border-radius: 10px;
    background: #f4f6fa;
    overflow: hidden;
  }

  .upm-tile::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #2f6fb4 0%, rgba(47, 111, 180, 0) 85%);
  }

  .upm-tile > label {
    display: block;
    margin-bottom: 8px;
    font-size: 11.5px;
    color: #5c6b7d;
  }

  .upm-tile-val {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -.01em;
    font-variant-numeric: tabular-nums;
    color: #1e293b;
  }

  .upm-wgrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(165px, 1fr));
    gap: 0 14px;
  }

  /* ===== Read-only summary ===== */
  .upm-kv {
    width: 100%;
    border-collapse: collapse;
  }

  .upm-kv td {
    padding: 8px 10px;
    font-size: 12.5px;
    vertical-align: top;
    transition: background-color .14s ease;
  }

  .upm-kv tr:hover td {
    background: #f7fafd;
  }

  .upm-kv tr:hover td:first-child {
    border-radius: 7px 0 0 7px;
  }

  .upm-kv tr:hover td:last-child {
    border-radius: 0 7px 7px 0;
  }

  .upm-kv td:first-child {
    width: 190px;
    color: #5c6b7d;
  }

  .upm-kv td:last-child {
    font-weight: 600;
    color: #22364f;
  }

  .upm-kv tr + tr td {
    border-top: 1px solid #f0f3f8;
  }

  .upm-pre {
    white-space: pre-wrap;
  }

  .upm-signrow {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    font-size: 12px;
    font-weight: 600;
    color: #22364f;
  }

  .upm-signrow > div {
    padding: 10px 13px;
    border: 1px solid #e8ecf3;
    border-radius: 10px;
    background: #fafbfe;
  }

  .upm-signrow span {
    display: block;
    margin-bottom: 3px;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: #90a0b5;
  }

  /* ===== Footer ===== */
  .upm-foot {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    width: 100%;
  }

  .upm-btn-close {
    border: 1px solid #dce4ec;
    border-radius: 9px;
    padding: 7px 16px;
    font-weight: 500;
    transition: transform .18s cubic-bezier(.5, 1.35, .4, 1), box-shadow .16s ease;
  }

  .upm-btn-save {
    border-radius: 9px;
    padding: 7px 20px;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(39, 174, 96, .3);
    transition: transform .18s cubic-bezier(.5, 1.35, .4, 1), box-shadow .16s ease;
  }

  .upm-btn-close:hover,
  .upm-btn-save:hover {
    transform: translateY(-1px);
  }

  .upm-btn-close:active,
  .upm-btn-save:active {
    transform: translateY(0);
  }

  .upm-btn-save:disabled,
  .upm-btn-save[disabled] {
    transform: none;
    box-shadow: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .upm-stack > *,
    .upm-panel-body {
      animation: none;
    }

    .upm-choice,
    .upm-check,
    .upm-listrow,
    .upm-pill,
    .upm-btn-close,
    .upm-btn-save,
    .upm-caret,
    .upm-choice::before,
    .upm-panel::before {
      transition: none;
    }

    .upm-choice:hover,
    .upm-check:hover,
    .upm-listrow:hover,
    .upm-pill:hover,
    .upm-btn-close:hover,
    .upm-btn-save:hover {
      transform: none;
    }
  }

  .upm-foot i {
    margin-right: 5px;
  }

  /* ===== Dark mode ===== */
  body.dark-mode .upm-card,
  body.dark-mode .upm-panel,
  body.dark-mode .upm-choice,
  body.dark-mode .upm-check,
  body.dark-mode .upm-listrow {
    background: #1a2a3a;
    border-color: #2d4057;
  }

  body.dark-mode .upm-panel.is-open {
    background: #16242f;
  }

  body.dark-mode .upm-choice:hover,
  body.dark-mode .upm-check:hover,
  body.dark-mode .upm-listrow:hover {
    background: rgba(60, 141, 188, .1);
    border-color: #3c6d99;
  }

  body.dark-mode .upm-choice.is-active,
  body.dark-mode .upm-check.is-checked,
  body.dark-mode .upm-listrow.is-checked {
    background: rgba(60, 141, 188, .16);
    border-color: #4d8bc4;
    box-shadow: none;
  }

  body.dark-mode .upm-hint {
    background: rgba(60, 141, 188, .07);
    border-color: #2d4057;
  }

  body.dark-mode .upm-sec-count {
    background: rgba(60, 141, 188, .18);
    color: #9fd0f5;
  }

  body.dark-mode .upm-card-title,
  body.dark-mode .upm-choice-name,
  body.dark-mode .upm-panel.is-open .upm-panel-name,
  body.dark-mode .upm-vtable-name,
  body.dark-mode .upm-subtitle,
  body.dark-mode .upm-label,
  body.dark-mode .upm-listrow-name,
  body.dark-mode .upm-check {
    color: #c9d1d9;
  }

  body.dark-mode .upm-panel-body,
  body.dark-mode .upm-sec,
  body.dark-mode .upm-vtable th {
    border-color: #2d4057;
  }

  body.dark-mode .upm-chip {
    background: rgba(60, 141, 188, .18);
    color: #9fd0f5;
  }

  body.dark-mode .upm-wsec,
  body.dark-mode .upm-tile,
  body.dark-mode .upm-pill {
    background: #1a2a3a;
    border-color: #2d4057;
  }

  body.dark-mode .upm-pill:hover {
    background: rgba(60, 141, 188, .1);
    border-color: #3c6d99;
  }

  body.dark-mode .upm-pill.is-active {
    background: rgba(60, 141, 188, .16);
    box-shadow: none;
  }

  body.dark-mode .upm-wsec-head {
    background: #16242f;
    border-bottom-color: #2d4057;
  }

  body.dark-mode .upm-wsec-ic {
    background: rgba(60, 141, 188, .18);
    color: #9fd0f5;
  }

  body.dark-mode .upm-wsec-title,
  body.dark-mode .upm-tile-val,
  body.dark-mode .upm-kv td:last-child,
  body.dark-mode .upm-signrow {
    color: #c9d1d9;
  }

  body.dark-mode .upm-kv tr + tr td,
  body.dark-mode .upm-signrow {
    border-color: #2d4057;
  }

  body.dark-mode .upm-row .form-control,
  body.dark-mode .upm-vtable .form-control {
    background: #16242f;
    border-color: #2d4057;
    color: #c9d1d9;
  }

  body.dark-mode .upm-choice-no {
    background: rgba(60, 141, 188, .14);
    color: #9fb3c8;
  }

  body.dark-mode .upm-choice.is-active .upm-choice-no,
  body.dark-mode .upm-choice::before,
  body.dark-mode .upm-panel::before,
  body.dark-mode .upm-card-title::before {
    background: linear-gradient(180deg, #4d8bc4 0%, #1e3a56 100%);
  }

  body.dark-mode .upm-check.is-checked,
  body.dark-mode .upm-listrow.is-checked {
    box-shadow: inset 3px 0 0 #4d8bc4;
  }

  body.dark-mode .upm-check.is-checked:hover,
  body.dark-mode .upm-listrow.is-checked:hover {
    box-shadow: inset 3px 0 0 #4d8bc4, 0 6px 14px -10px rgba(0, 0, 0, .9);
  }

  body.dark-mode .upm-choice:hover,
  body.dark-mode .upm-check:hover,
  body.dark-mode .upm-listrow:hover {
    box-shadow: 0 6px 14px -10px rgba(0, 0, 0, .9);
  }

  body.dark-mode .upm-panel:not(.is-open):hover .upm-panel-head {
    background: rgba(60, 141, 188, .07);
  }

  body.dark-mode .upm-caret {
    background: rgba(60, 141, 188, .12);
  }

  body.dark-mode .upm-panel.is-open .upm-caret {
    background: rgba(60, 141, 188, .22);
    color: #9fd0f5;
  }

  body.dark-mode .upm-sec::before {
    background: #3c6d99;
  }

  body.dark-mode .upm-wsec-head {
    background: linear-gradient(180deg, #1b2a37 0%, #16242f 100%);
  }

  body.dark-mode .upm-wsec-ic {
    box-shadow: inset 0 0 0 1px rgba(60, 141, 188, .28);
  }

  body.dark-mode .upm-tile::before {
    background: linear-gradient(90deg, #3c6d99 0%, rgba(60, 141, 188, 0) 85%);
  }

  body.dark-mode .upm-vtable tbody tr:hover td,
  body.dark-mode .upm-kv tr:hover td {
    background: rgba(60, 141, 188, .07);
  }

  body.dark-mode .upm-signrow > div {
    background: #16242f;
    border-color: #2d4057;
  }
</style>
