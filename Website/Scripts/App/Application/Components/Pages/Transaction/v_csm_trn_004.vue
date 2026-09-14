<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-widget">
          <div class="box-body">
            <!-- Customer List -->
            <div class="row" v-show="show_panel===0">
              <div class="col-md-12">

                <!-- Filter Panel -->
                <div class="trn004-filter-panel">
                  <div class="row">
                    <div class="col-md-2">
                      <div class="form-group">
                        <label class="trn004-label">Employee</label>
                        <select class="form-control input-sm"
                                v-on:change="onselectEmp($event)"
                                v-model="isEmp_no"
                                :class="{'red-border': isRedBook}">
                          <option v-for="(x, idx) in emp_youself"
                                  :value="x.empno"
                                  :key="x.empno"
                                  :class="{'red-text': x.empresign === 'Y'}">
                            {{ x.empfullname_t }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-group">
                        <label class="trn004-label trn004-label-required">Assign Employee</label>
                        <div class="input-group">
                          <input type="text" class="form-control input-sm trn004-readonly"
                                 v-model.trim="formData['assign_empno_name']"
                                 ref="assign_empno" readonly />
                          <span class="input-group-btn">
                            <button class="btn btn-sm trn004-btn-search"
                                    @click="empModalSelected('assign')"
                                    :disabled="['I','Y','N'].includes(formData['job_status'])">
                              <i class="fa fa-search"></i>
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-2">
                      <div class="form-group">
                        <label class="trn004-label">Search By</label>
                        <select class="form-control input-sm" v-model="search.field">
                          <option v-for="x in fields" :value="x.key">{{ x.name }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-group">
                        <label class="trn004-label">Search</label>
                        <div class="input-group">
                          <input type="text" class="form-control input-sm"
                                 v-model.trim="search.text"
                                 @keypress.enter="loadData()" />
                          <span class="input-group-btn">
                            <button class="btn btn-sm trn004-btn-search" @click="loadData()">
                              <i class="fa fa-search"></i>
                            </button>
                          </span>
                        </div>
                      </div>
                    </div></br>
                    <div class="col-md-2 d-flex align-items-end" style="padding-bottom:8px;">
                      <button class="btn btn-sm trn004-btn-update" @click="UpdateChangeWorker()">
                        <i class="fas fa-user-edit"></i> Update Assign
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Tabs -->
                <div class="trn004-tabs-wrap">
                  <ul class="trn004-tabs">
                    <li :class="{ active: tabActive===0 }" @click="onTabChange(0), loadData()">
                      <i class="fas fa-file-alt"></i> Request
                    </li>
                    <li :class="{ active: tabActive===1 }" @click="onTabChange(1), loadData()">
                      <i class="fas fa-user-check"></i> Responsible
                    </li>
                    <li :class="{ active: tabActive===2 }" @click="onTabChange(2), loadData()">
                      <i class="fas fa-tasks"></i> Assign
                    </li>
                    <li :class="{ active: tabActive===3 }" @click="onTabChange(3), loadData()">
                      <i class="fas fa-vial"></i> Tester
                    </li>
                  </ul>

                  <!-- Loading overlay -->
                  <vue-element-loading :active="isLoading" spinner="spinner" color="#02234e"
                                       text="ระบบกำลังค้นหาข้อมูล CSM ของท่าน กรุณารอสักครู่..." />

                  <!-- Table -->
                  <div class="trn004-selectall">
                    <div class="form-check form-check-custom form-check-solid form-check-sm">
                      <input class="form-check-input" type="checkbox" id="trn004SelectAll" v-model="selectAllChecked" @change="toggleSelectAll" />
                      <label class="form-check-label" for="trn004SelectAll">Select All ({{ datalist.length }})</label>
                    </div>
                  </div>
                  <div class="trn004-table-wrap">
                    <ag-table ref="agr" :scale="400" :footer="false" @ready="initTable()"></ag-table>
                  </div>

                  <!-- Pagination -->
                  <div class="trn004-paging-wrap">
                    <pagination class="pull-left" ref="paging"
                                @page-change="pageChange($event.page, 'CustomerList')"></pagination>
                    <span class="trn004-total-badge">
                      ทั้งหมด {{ customerTotal || 0 }} รายการ
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </template>
    </re-page>
    <!--<vue-responsible-employee-list ref="ct_responsible_emp" :pre_event="formData.pre_event" @send-data="sendComponent($event, 'emp')"></vue-responsible-employee-list>-->
    <vue-employee-list ref="ct_emp" @send-data="sendComponent($event, 'emp')"></vue-employee-list>
  </div>
</template>
<script>
  let process = false;
  let page = {};
  let appForm = {};
  let paging = {};
  let paging2 = {};
  let cpn = {
    data() {
      return {
        auth: window.auth,
        xt: $xt,
        ui: window.ui,
        tabActive: 0,
        show_panel: 0,
        search: { field: 'job_no' },
        search0: {},
        company: window.baseCompany,
        isLoading: false,
        baseUrl,
        datalist: [],
        selectAllChecked: false,
        customerTotal: 0,
        oldCustTotal: 0,
        switchTotal: 0,
        switchTotal: 0,
        form: {},
        addr: {},
        phoneList: [],
        cmList: [],
        editMode: false,
        oldCust: true,
        status: [
          { key: 'job_status', name: 'All Item', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: '' },
          { key: 'job_status', name: 'None', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'W' },
          { key: 'job_status', name: 'Pending', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'P' },
          { key: 'job_status', name: 'Done', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'D' },
          { key: 'job_status', name: 'Complete', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'C' },
          { key: 'job_status', name: 'Cancel', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'N' },
        ],
        fields: [
          { key: 'job_no', name: 'CSM No.', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'subject', name: 'Subject', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'project_name', name: 'Project Name ', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'contract_user', name: 'Contact By', type: 's', search: true, sort: true, sort_default: true, width: 200 },
        ],
        emp_youself: [],
        emp_target: [],
        isEmp_no: null,
        empno_0: null,
        empType: '',
        formData: {},
        statusCode,

      };
    },
    methods: {
      async onTabChange(t) {
        this.tabActive = t;
        switch (this.tabActive) {
          case 0:
            this.search0.doctype = 'R'
            break
          case 1:
            this.search0.doctype = 'A'
            if (this.is_mango()) {
            }
            break
          case 2:
            this.search0.doctype = 'W'
            if (this.is_mango()) {
            }
            break
          case 3:
            this.search0.doctype = 'T'
            break
        }
        await this.loadData()
      },
      onSetTab(j = []) {
        this.subtab.forEach(x => {
          if (j.includes(x.group)) {
            if (x.value == 5) {
              x.name = [1, 2].includes(this.tabActive) ? ui.csm_all_doc || 'เอกสารทั้งหมด' : ui.csm_waiting_approve_assign || 'เอกสารรอการตรวจสอบที่ได้รับมอบหมาย'
            }
            x.show = true
          }
          else
            x.show = false
        })
      },

      pageChange(pn, type) {
        switch (type) {
          case "CustomerList":
            paging.setCurrentPage(pn);
            paging.createPagesArray();
            this.showPage();
            break;
        };
      },
      empModalSelected(e) {
        this.empType = e || ''
        this.$refs.ct_emp.openModal()

      },
      async resetData() {
        this.SetData();
        this.onTabChange(0);
        this.editMode = false;
        this.oldCust = true;
      },
      async SetData() {
        this.form = {};
        this.addr = {};
        this.phoneList = [];
        this.cmList = [];
        //this.addPhone();
        //this.addPerson();
      },
      async newClick() {
        this.SetData();

        this.onPanelChange(1);
        this.onTabChange(0);
        this.oldCust = false;
        appForm.btnDelete.show = false;
      },
      /*      read data csm emp */
      async loademp() {
        let act = `CSM/Data/Read_emp_004`
        let rsp = await $xt.getServer(act);
        this.emp_youself = rsp.data.emp;
        if (this.emp_youself.length > 0) {
          this.isEmp_no = this.emp_youself[0].empno;
          this.empno_0 = this.isEmp_no;
          await this.loadData();
        }
      },
      async UpdateChangeWorker() {
        try {
          let q = $linq(this.datalist).where(x => x.cc_select).toArray();
          let has_error = false;
          let error_message = '<ul>';

          if ($linq(q).count() < 1) {
            error_message += '<li>กรุณาติ๊กเลือกอย่างน้อย 1 รายการก่อนทำการบันทึกข้อมูล</li>';
            has_error = true;
          }

          if (!this.formData.assign_empno) {
            error_message += '<li>กรุณาระบุพนักงานที่ต้องการมอบหมายงาน</li>';
            has_error = true;
          }

          error_message += '</ul>';

          if (has_error) {
            $msg.alert('Error', error_message, 'warning');
            return;
          }
          let act = `CSM/Data/update_chaeng_owner_csm`;

          let tab = this.tabActive.toString();
          let rsp = '';
          if (tab == '0' || tab == '1') {
            rsp = await $xt.postServerJson(act, { form: q, detail: null, empno: this.formData.assign_empno, tab: tab });
          }
          if (tab == '2' || tab == '3') {
            rsp = await $xt.postServerJson(act, { form: null, detail: q, empno: this.formData.assign_empno, tab: tab });
          }

          if (!rsp.success) {
            throw rsp.error;
          }
          $notify.success(this.ui.alert_save_success);
          this.loadData(this.formData.job_no)
        } catch (ex) {
          page.loadingBox.hide();
          $msg.alert('Danger', ex.toString(), 'danger');
        }
      },
      async sendComponent(e, type) {
        switch (type) {
          case 'emp':
            switch (this.empType) {
              case 'assign':
                this.$set(this.formData, 'assign_empno', e.empno)
                this.$set(this.formData, 'assign_empno_name', e.empfullname)
                this.$set(this.formData, 'assign_empno_email', e.email)
                this.$set(this.formData, 'assign_empno_emptel', e.emptel)
                this.$set(this.formData, 'assign_empno_empmob', e.empmob)
            }
            break
        }
      },
      async onselectEmp(e) {

        if (e && e.target) {
          let isEmp = e.target.value;
          let isEmp_0 = $linq(this.emp_youself).where(n => n.empno == isEmp).select(m => m.empno).firstOrDefault();

          this.$set(this, 'empno_0', isEmp);
          this.$set(this, 'isEmp_no', isEmp_0);
          await this.loadData();
        } else {

        }
      },
      async loadData() {

        this.isLoading = true;
        let act = `CSM/Data/Readlist_trn_004?skip=0&take=9999&doctype=${encodeURIComponent(this.search0.doctype || '')}&empno=${encodeURIComponent(this.isEmp_no || '')}`;

        for (var key in this.search) {
          act += `&${key}=${encodeURIComponent(this.search[key])}`;
        }
        let rsp = await $xt.getServer(act);

        this.$set(this, "datalist", rsp.data.csm);

        this.datalist.forEach((x, idx) => {
          this.$set(x, 'cc_select', false);
        });
        this.selectAllChecked = false;
        this.customerTotal = this.datalist.length;
        paging.setTotalItems(this.datalist.length);
        paging.setCurrentPage(1);
        paging.createPagesArray();
        this.showPage();
        this.isLoading = false;
      },
      async showPage() {
        let agr = this.$refs.agr;
        if (!agr) return;
        let skip = paging.skipItems();
        let take = paging.getItemsPerPage();
        agr.setDisplay(this.datalist.slice(skip, skip + take));

        await this.$nextTick();
        await $xt.sleep(100);
        if (!agr.$el) return;
        agr.$el.querySelectorAll('.ag-select-row').forEach(chk => {
          let row = this.datalist.find(d => d.job_no == chk.getAttribute('data-job-no'));
          chk.checked = row ? !!row.cc_select : false;
        });
      },
      toggleSelectAll() {
        this.datalist.forEach(x => this.$set(x, 'cc_select', this.selectAllChecked));
        this.showPage();
      },
      /*      read data csm emp */
      priorityName(code) {
        return $linq(this.priorityCodeData).where(x => x.prioity_code == code).select(x => x.prioity_des).firstOrDefault() || ''
      },
      priorityStatusClass(code) {
        /* Variable : prioity_code, prioity_des, priority_status = 1 (ปกติ) , 2 (สำคัญ) , 3 (สำคัญมาก), active */
        var status = $linq(this.priorityCodeData).where(w => w.prioity_code == code).select(x => x.priority_status).firstOrDefault() || ''
        return status == '3' ? 'text-danger' : status == '2' ? 'text-warning' : 'text-info'
      },
      statusClass(prefix, status) {
        return status == 'Y' ? prefix + 'success' : status == 'I' ? prefix + 'info' : status == 'N' ? prefix + 'danger' : status == 'H' ? prefix + 'warning' : ''
      },
      statusBadgeClass(status) {
        return status == 'Y' ? 'success' : status == 'I' ? 'info' : status == 'N' ? 'danger' : status == 'H' ? 'warning' : 'default';
      },
      statusName(code) {
        return $linq(this.statusCode).where(x => x.id == code).select(x => x.name).firstOrDefault() || ''
      },
      is_complete(x) {
        return x.task_send_pretest == x.task_count && !['Y', 'N'].includes(x.job_status)
      },
      is_mango() {
        let isMango = $linq(this.configData).where(x => x.config_id == 'TRN0001').select(x => x.config_value).firstOrDefault()
        return isMango == 'Y' ? true : false
      },
      isDeveloper() {
        let department = this.auth.empcode.substring(0, 2)
        return department == 'IT'
      },
      openReq(k) {
        k = k || ''
        if ($xt.isEmpty(k)) {
          return this.baseUrl + `page/Transaction/v_csm_trn_001/`
        }
        else {
          return this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${k.job_no}`
        }
      },
      rowExtraStyle(params) {
        let st = {};
        let jobStatus = params.data && params.data.job_status;
        if (jobStatus == 'H') st.backgroundColor = '#fff8dd';
        if (jobStatus == 'W') st.fontWeight = '700';
        return st;
      },
      badgeHtml(variant, text, tooltip) {
        let colors = {
          success: ['#e8fff3', '#50cd89'],
          warning: ['#fff8dd', '#f6c000'],
          danger: ['#fff5f8', '#f1416c'],
          info: ['#f1faff', '#009ef7'],
          teal: ['#e0f7f7', '#20c9c9'],
          purple: ['#f3f0ff', '#7239ea'],
          dark: ['#f1f3f8', '#3f4254'],
          default: ['#f5f8fa', '#7e8299'],
        };
        let [bg, fg] = colors[variant] || colors.default;
        let title = tooltip ? ` title="${tooltip}"` : '';
        return `<span${title} style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;white-space:nowrap;background:${bg};color:${fg};">${text}</span>`;
      },
      jobStatusBadge(x) {
        if (x.task_count == 0) return this.badgeHtml('danger', 'No Tasks');
        if (this.is_complete(x) && x.task_count > 0) {
          if (x.job_status == 'D') return this.badgeHtml('dark', 'Draft');
          return this.badgeHtml('warning', 'Done', 'ดำเนินการเสร็จแล้ว กรุณาตรวจสอบข้อมูล และปิดงาน');
        }
        if (x.task_count > 0 && x.task_send_qc > 0 && x.task_waiting_update == 0) return this.badgeHtml('purple', `Checking ${x.none_complete}`, 'กำลังถูกตรวจสอบโดย Checker');
        if (x.task_count > 0 && x.task_tester_approve > 0 && x.task_tester_reject == 0) return this.badgeHtml('teal', 'Wait Tester', 'รอ Tester ตรวจสอบ');
        if (x.task_count > 0 && x.task_waiting_approve > 0) return this.badgeHtml('teal', 'Wait Approve', 'รอการอนุมัติ');
        if (x.task_count > 0 && x.task_waiting_update > 0) return this.badgeHtml('teal', 'Update Program', 'รอ Programmer Update โปรแกรม');
        if (x.task_count > 0 && x.task_tester_reject > 0) return this.badgeHtml('danger', 'Reject Tester', 'Tester Reject โปรดตรวจสอบ');
        return this.badgeHtml(this.statusBadgeClass(x.job_status), `${this.statusName(x.job_status)} ${x.none_complete}`);
      },
      projectCellHtml(x) {
        let mutedStyle = 'color:#a1a5b7;font-style:italic;';
        let linkStyle = 'color:#009ef7;font-weight:600;text-decoration:none;';
        if (!this.is_mango()) {
          if ($xt.isEmpty(x.project_name) && $xt.isEmpty(x.dpt_no) && !$xt.isEmpty(x.customer_code)) {
            return `<span style="${mutedStyle}">ไม่ระบุโครงการ</span>`;
          } else if ($xt.isEmpty(x.project_name) && !$xt.isEmpty(x.customer_code)) {
            return `<span style="${mutedStyle}">By Customer</span>`;
          }
          return x.project_name || '';
        }
        if (!this.isDeveloper()) {
          if ($xt.isEmpty(x.project_name) && !$xt.isEmpty(x.customer_code)) {
            return `<span style="${mutedStyle}">By Customer</span>`;
          }
          return x.project_name || '';
        }
        if (!$xt.isEmpty(x.project_name)) {
          return `<a href="#" class="ag-remote-ip-link" data-job-no="${x.job_no}" style="${linkStyle}">${x.project_name}</a>`;
        } else if (!$xt.isEmpty(x.customer_code)) {
          return `<span style="${mutedStyle}">By Customer</span>`;
        }
        return '';
      },
      initTable() {
        let agr = this.$refs.agr;
        if (!agr) return;
        let fields = [
          ['cc_select', '', 'checkbox', { width: 60, align: 'center', pinned: 'left', cellRenderer: (p) => `<input type="checkbox" class="ag-select-row" data-job-no="${p.data.job_no}" ${p.data.cc_select ? 'checked' : ''} />` }],
          ['job_no', 'CSM No.', 'text', { width: 160, align: 'center', cellRenderer: (p) => `<a href="${this.openReq(p.data)}" target="_blank" style="color:#009ef7;font-weight:600;text-decoration:none;">${p.data.job_no}</a>`, cellStyle: (p) => this.rowExtraStyle(p) }],
          ['job_date', 'Date', 'text', { width: 150, align: 'center', cellRenderer: (p) => p.value ? this.$date(p.value, 'DD/MM/YYYY HH:mm') : '', cellStyle: (p) => this.rowExtraStyle(p) }],
          ['assign_date', 'Assign Date', 'text', { width: 120, align: 'center', cellRenderer: (p) => p.value ? this.$date(p.value) : '', cellStyle: (p) => this.rowExtraStyle(p) }],
          ['subject', 'Subject', 'text', { width: 320, align: 'left', cellStyle: (p) => this.rowExtraStyle(p) }],
          ['project_name', 'Project', 'text', { width: 180, align: 'left', cellRenderer: (p) => this.projectCellHtml(p.data), cellStyle: (p) => this.rowExtraStyle(p) }],
          ['customer_name', 'Customer', 'text', { width: 180, align: 'left', cellStyle: (p) => this.rowExtraStyle(p) }],
          ['request_empname', 'Req. By', 'text', { width: 140, align: 'left', cellStyle: (p) => this.rowExtraStyle(p) }],
          ['contract_user', 'Contact By', 'text', { width: 130, align: 'center', cellStyle: (p) => this.rowExtraStyle(p) }],
          ['phone', 'Phone', 'text', { width: 120, align: 'center', cellStyle: (p) => this.rowExtraStyle(p) }],
          ['job_priority', 'Priority', 'text', {
            width: 110, align: 'center',
            cellRenderer: (p) => this.priorityName(p.data.job_priority),
            cellStyle: (p) => ({ color: p.data.job_priority_color || '#000000', fontWeight: 600, ...this.rowExtraStyle(p) })
          }],
          ['job_status', 'Job Status', 'text', { width: 160, align: 'center', cellRenderer: (p) => this.jobStatusBadge(p.data), cellStyle: (p) => this.rowExtraStyle(p) }],
        ];
        agr.setHeader(agr.createHeaderFromArray(fields));
        this.showPage();
        this.$nextTick(() => {
          agr.$el.addEventListener('click', (e) => {
            let link = e.target.closest('.ag-remote-ip-link');
            if (link) {
              e.preventDefault();
              let jobNo = link.getAttribute('data-job-no');
              let row = this.datalist.find(d => d.job_no == jobNo);
              if (row) this.queryStringRemoteIP(row);
            }
            let chk = e.target.closest('.ag-select-row');
            if (chk) {
              let jobNo = chk.getAttribute('data-job-no');
              let row = this.datalist.find(d => d.job_no == jobNo);
              if (row) this.$set(row, 'cc_select', chk.checked);
            }
          });
        });
      },
      async readData(x) {
        let act = `CSM/Master/Customer_Read?customer_code=${encodeURIComponent(x || '')}`;
        let rsp = await $xt.getServer(act);

        this.form = rsp.info;
        this.addr = rsp.address == null ? {} : rsp.address;
        if (rsp.mobile.length != 0) { this.phoneList = rsp.mobile };
        if (rsp.contact.length != 0) { this.cmList = rsp.contact };
        this.csr = rsp.ck_csr;

        $linq(this.cmList).foreach(x => {
          x.set_update = x.status1 ?? "N";
          x.set_training = x.status2 ?? "N";
          this.$set(x, "isEdit", false)
        });
        this.oldCust = false;
      },
      async oldCustRead(x) {
        let act = `CSM/Master/OldCust_Read?customer_code=${encodeURIComponent(x || '')}`;
        let rsp = await $xt.getServer(act);

        this.form = rsp.info;
        this.addr = rsp.address == null ? {} : rsp.address;
        if (rsp.mobile.length != 0) { this.phoneList = rsp.mobile };
        if (rsp.contact.length != 0) { this.cmList = rsp.contact };
        this.csr = rsp.ck_csr;

        $linq(this.cmList).foreach(x => {
          x.set_update = x.status1 ?? "N";
          x.set_training = x.status2 ?? "N";
          x.isEdit = false;
        });
        this.oldCust = true;
      },
      async saveClick() {
        if (process) return;
        if ($xt.isEmpty(this.form.first_name) && !this.oldCust) {
          $msg.alert(`คำเตือน`, "กรุณาระบุ " + this.ui.re_firstname, `warning`);
          return;
        }
        $linq(this.cmList).foreach(x => {
          x.status1 = x.set_update ?? "N";
          x.status2 = x.set_training ?? "N";
        });
        try {
          let f = {
            info: this.form,
            address: this.addr,
            mobile: this.phoneList,
            contact: this.cmList
          };
          let act = `CSM/Master/Customer_Create`;
          if (this.editMode) {
            act = `CSM/Master/Customer_Update`;
            if (this.oldCust) {
              act = `CSM/Master/OldCust_Update`;
            }
          }
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          this.resetData();
          $msg.alert(``, this.ui.alert_save_success, `success`);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          page.loadingBox.hide();
        }
      },
      async deleteClick() {
        if (process) return;
        if (!this.editMode) return;
        if (!await $msg.confirm(this.ui.alert_delete_data)) {
          return;
        }
        try {
          let f = {
            info: this.form,
            address: this.addr,
            mobile: this.phoneList,
            contact: this.cmList
          };
          let act = `CSM/Master/Customer_Delete`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          this.resetData();
          $msg.alert(``, this.ui.alert_delete_success, `success`);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          page.loadingBox.hide();
        }
      },
      setEdit(x) {
        this.onPanelChange(1);
        this.onTabChange(0);
        this.editMode = true;
        this.readData(x.customer_code);
        $('html,body').scrollTop(0);
      },
      editCust(x) {
        this.onPanelChange(1);
        this.onTabChange(0);
        this.editMode = true;
        this.oldCustRead(x.customer_code);
        $('html,body').scrollTop(0);
      },
      birthCount(birth) {
        birth = birth || moment(new Date()).format('YYYY');
        let day = new Date();
        let now = day.getFullYear();
        birth = moment(birth).format('YYYY');
        let age = now - birth;
        if (age < 0) age = 0;
        return age;
      },
      set_contact_default(itemno) {
        $linq(this.phoneList).foreach(x => {
          x.default_contact = (x.itemno == itemno) ? 'Y' : 'N';
        });
        this.$set(this.form, "telephone", $linq(this.phoneList).where(x => x.itemno == itemno).select(x => x.detail).firstOrDefault());
      },
      set_contact_defaultOninput(itemno) {
        let findItem = this.phoneList.find(x => x.itemno == itemno && x.default_contact == 'Y')
        if (findItem != undefined) {
          this.$set(this.form, "telephone", $linq(this.phoneList).where(x => x.itemno == itemno).select(x => x.detail).firstOrDefault());
        }
      },
      addPhone() {
        let itemno = this.phoneList.length == 0 ? 1 : ($linq(this.phoneList).select(x => x.itemno).max() + 1);
        this.phoneList.push({
          itemno: itemno,
          detail: '',
          default_contact: 'N',
        })
      },
      remove_contact(d) {
        if (d.default_contact == "Y") {
          $msg.alert(`คำเตือน`, " ไม่สามารถลบเบอร์โทรหลักได้", `warning`);
          return;
        }
        this.phoneList = $linq(this.phoneList).where(x => x.itemno != d.itemno).toArray();
        let run_item = 1;
        $linq(this.phoneList).foreach(x => {
          x.itemno = run_item;
          run_item++;
        });
      },
      addPerson() {
        let ctp_code = $linq(this.cmList).select(x => x.ctp_code).lastOrDefault() || 0;
        this.cmList.push({
          ctp_code: ++ctp_code,
          person_name: '',
          position: '',
          phone: '',
          email: '',
          website: '',
          lineid: '',
          website: '',
          remark: '',
          set_update: 'N',
          set_training: 'N',
          isEdit: true
        })
      },
      edit(data) {
        let d = $linq(this.cmList).where(x => x.cpt_code == data.cpt_code).firstOrDefault()
        this.$set(d, "isEdit", !d.isEdit)
       // console.log("D " + JSON.stringify(d))
      },
      remove_person(data) {
        this.cmList = ($linq(this.cmList).where(x => x.ctp_code != data.ctp_code).toArray());
        let run_item = 1;
        $linq(this.cmList).foreach(x => {
          x.ctp_code = run_item;
          run_item++;
        });
      },
      SetPerson(d, type) {
        switch (type) {
          case "Update":
            $linq(this.cmList).foreach(x => {
              x.set_update = (x.ctp_code == d.ctp_code) ? 'Y' : 'N';
            });
            break;
          case "Training":
            $linq(this.cmList).foreach(x => {
              x.set_training = (x.ctp_code == d.ctp_code) ? 'Y' : 'N';
            });
            break;
        }
      },
      is_mango() {
        let isMango = $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault();
        return isMango == "Y" ? true : false;
      },
      async loadCenter() {
        await this.$store.dispatch('findPriority')
        await this.$store.dispatch('findConnection')
      },
      isRedBook() {
        const selectedEmp = this.emp_youself.find(
          emp => emp.empno === this.isEmp_no
        );
        return selectedEmp?.empresign === 'Y';
      },
    },
    computed: {
      configData() { return store.state.configData },
      priorityCodeData() { return store.state.priorityCodeData },
      connectionCodeData() { return store.state.connectionCodeData },
    },
    mounted() {
      (async () => {
        page = this.$refs.page;
        page.pageTitle = `Setup : Change Employee CSM Document`;
        document.title = page.pageTitle;


        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(10);


        this.onTabChange(0);
        await this.loademp();
        await $xt.sleep(100)
        await this.onselectEmp();
        await $xt.sleep(100)
        await this.loadData();
        this.resetData();
        await this.loadCenter()



      })();
    }
  };

  export default cpn;
</script>
<style scoped>
  /* ===== Filter Panel ===== */
  .trn004-filter-panel {
    background: #fff;
    border: 1px solid #e4e6ef;
    border-radius: 8px;
    padding: 14px 16px 6px;
    margin-bottom: 14px;
  }

  .trn004-label {
    font-size: 12px;
    font-weight: 600;
    color: #3f4254;
    margin-bottom: 4px;
    display: block;
  }

  .trn004-label-required::after {
    content: ' *';
    color: #f1416c;
  }

  .trn004-readonly {
    background-color: #f5f8fa !important;
    color: #5e6278 !important;
    border-color: #e4e6ef !important;
  }

  .trn004-btn-search {
    background: #1e2a3a;
    color: #fff;
    border: none;
    transition: background 0.2s;
  }

  .trn004-btn-search:hover {
    background: #3a5068;
    color: #fff;
  }

  .trn004-btn-update {
    background: #50cd89;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 14px;
    white-space: nowrap;
    transition: background 0.2s;
  }

  .trn004-btn-update:hover {
    background: #3db876;
    color: #fff;
  }

  /* ===== Custom Tabs ===== */
  .trn004-tabs-wrap {
    border: 1px solid #e4e6ef;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }

  .trn004-tabs {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    background: #f5f8fa;
    border-bottom: 2px solid #e4e6ef;
  }

  .trn004-tabs li {
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 600;
    color: #7e8299;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: color 0.2s, border-color 0.2s;
    user-select: none;
  }

  .trn004-tabs li:hover {
    color: #009ef7;
  }

  .trn004-tabs li.active {
    color: #009ef7;
    border-bottom-color: #009ef7;
    background: #fff;
  }

  /* ===== Table wrap ===== */
  .trn004-selectall {
    padding: 10px 12px 0;
  }

  .trn004-table-wrap {
    padding: 12px 12px 0;
  }

  /* ===== Pagination ===== */
  .trn004-paging-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px 10px;
    border-top: 1px solid #f1f3f8;
    margin-top: 6px;
  }

  .trn004-total-badge {
    font-size: 12px;
    color: #7e8299;
    font-weight: 600;
  }

  /* ===== Status badges ===== */
  .t4-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }

  .t4-badge-success  { background: #e8fff3; color: #50cd89; }
  .t4-badge-warning  { background: #fff8dd; color: #f6c000; }
  .t4-badge-danger   { background: #fff5f8; color: #f1416c; }
  .t4-badge-info     { background: #f1faff; color: #009ef7; }
  .t4-badge-teal     { background: #e0f7f7; color: #20c9c9; }
  .t4-badge-purple   { background: #f3f0ff; color: #7239ea; }
  .t4-badge-dark     { background: #f1f3f8; color: #3f4254; }
  .t4-badge-default  { background: #f5f8fa; color: #7e8299; }

  /* ===== Misc ===== */
  .red-text  { color: red; }
  .red-border { border: 1px solid red; }
</style>
