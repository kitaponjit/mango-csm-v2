<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="ed">
          <div class="ed-bar">
            <div class="ed-bar__row">
              <div class="ed-search">
                <i class="fas fa-search"></i>
                <input type="text" v-model="retrieveSearch['text']" @keyup.enter="doSearch()" placeholder="พิมพ์คำค้นหา..." />
                <i v-if="retrieveSearch['text']" class="fas fa-times ed-search__clear" @click="clearSearch()"></i>
              </div>
              <div class="ed-field">
                <i class="fas fa-crosshairs"></i>
                <select v-model="retrieveSearch['field']">
                  <option v-for="x in fields" :key="x.key" :value="x.key">{{ x.name }}</option>
                </select>
              </div>
              <button class="ed-btn" @click="doSearch()"><i class="fas fa-search"></i> ค้นหา</button>
              <label class="ed-switch" :class="{ on: onlyme === 'Y' }">
                <input type="checkbox" true-value="Y" false-value="N" v-model="onlyme" @change="doSearch()" />
                <span class="ed-switch__track"><span class="ed-switch__knob"></span></span>
                <span class="ed-switch__text">เฉพาะงานของฉัน</span>
              </label>
            </div>
            <div class="ed-bar__row ed-bar__row--sub">
              <span class="ed-bar__label"><i class="fas fa-filter"></i> สถานะงาน</span>
              <div class="ed-types">
                <button v-for="x in status" :key="x.name" class="ed-type"
                  :class="{ 'is-on': retrieveSearch['job_status'] === x.value }" @click="pickStatus(x.value)">
                  <i :class="statusIcon(x.value)"></i> {{ x.name }}
                </button>
              </div>
              <span class="ed-bar__count"><b>{{ n(total) }}</b> รายการ</span>
            </div>
          </div>

          <div class="ed-panel">
            <ag-table ref="agr"
                      :scale="360"
                      :footer="false"
                      @ready="initTable()"
                      :saveColumns="'Y'"
                      :doctype="'CSMTOOLS'"
                      :page_name="'v_csm_tools'"></ag-table>

            <div class="ed-foot">
              <span class="ed-foot__range">{{ rangeText }}</span>
              <div class="ed-foot__right">
                <div class="ed-field ed-field--sm">
                  <i class="fas fa-list-ol"></i>
                  <select v-model.number="perPage" @change="setPerPage(perPage)">
                    <option v-for="p in [20, 50, 100, 200]" :key="p" :value="p">{{ p }} / หน้า</option>
                  </select>
                </div>
                <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
              </div>
            </div>
          </div>
        </div>
      </template>
    </re-page>

    <!-- Modal : Tools -->
    <modal ref="toolModal">
      <template slot="header">
        <div class="ed-mh">
          <span class="ed-mh__icon"><i class="fas fa-file-alt"></i></span>
          <div class="ed-mh__id">
            <div class="ed-mh__title">Edit Document</div>
            <div class="ed-mh__sub">CSM No.&nbsp;<b>{{formData['job_no']}}</b></div>
          </div>
        </div>
      </template>
      <template slot="body">
        <div class="modal-section-title"><i class="fas fa-file-alt"></i> Document : Header</div>
        <div class="row">
          <div class="col-md-2 col-sm-6 col-xs-6">
            <div class="form-group">
              <label>Document No.</label>
              <input type="text" class="form-control input-sm text-bold pointer" @click="openReq()" v-model="formData['job_no']" readonly />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Job Status</label>
              <select class="form-control input-sm" v-model="formData['job_status']" @change="changeCompleteDate(formData, 'job_status', 'job_complete_date')">
                <option v-for="x in statusCode" v-bind:value="x.id">{{x.name}}</option>
              </select>
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Due Date</label>
              <datepicker input-class="form-control input-sm" v-model.trim="formData['job_due_date']"></datepicker>
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Job Complete Date</label>
              <datepicker input-class="form-control input-sm" v-model.trim="formData['job_complete_date']"></datepicker>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-2">
            <div class="form-group">
              <label>Responsible Person (ผู้รับผิดชอบหลัก)</label>
              <span class="input-group">
                <input type="text" class="form-control input-sm" @click="openEmployeeModal('req')" v-model="formData['request_empno']" readonly />
                <span class="input-group-btn">
                  <button class="btn btn-sm bg-navy" @click="openEmployeeModal('req')"><i class="fa fa-search"></i></button>
                </span>
              </span>
            </div>
          </div>
          <div class="col-md-3 col-sm-6 col-xs-6">
            <div class="form-group">
              <label>&nbsp;</label>
              <input type="text" class="form-control input-sm" v-model="formData['request_empno_name']" readonly />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Assign</label>
              <span class="input-group">
                <input type="text" class="form-control input-sm" @click="openEmployeeModal('assign')" v-model="formData['assign_empno']" readonly />
                <span class="input-group-btn">
                  <button class="btn btn-sm bg-navy" @click="openEmployeeModal('assign')"><i class="fa fa-search"></i></button>
                </span>
              </span>
            </div>
          </div>
          <div class="col-md-3 col-sm-6 col-xs-6">
            <div class="form-group">
              <label>&nbsp;</label>
              <input type="text" class="form-control input-sm" v-model="formData['assign_empno_name']" disabled />
            </div>
          </div>
        </div>
        <hr />
        <div class="nav-tabs-custom">
          <div class="ed-seg ed-seg--modal">
            <button :class="{ 'is-on': tabDetail === 0 }" @click.prevent="changeTab(0)"><i class="fas fa-list-alt"></i> Detail</button>
            <button :class="{ 'is-on': tabDetail === 1 }" @click.prevent="changeTab(1)"><i class="fas fa-puzzle-piece"></i> Addspec</button>
          </div>
          <div class="tab-content">
            <div class="tab-pane" v-bind:class="{active:tabDetail===0}">
              <div class="modal-section-title"><i class="fas fa-list-alt"></i> Document : Detail</div>
              <div class="row">
                <div class="col-md-12">
                  <div class="table-responsive">
                    <table class="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th class="tf-2-5 text-center">Item No.</th>
                          <th class="tf-3">Module</th>
                          <th class="tf-4">Subject</th>
                          <th class="tf-3-5">Type</th>
                          <th class="tf-3-5">Req. Type</th>
                          <th class="tf-3-5">Status</th>
                          <th class="tf-3-5">Response Date</th>
                          <th class="tf-3-5">Due Date</th>
                          <th class="tf-3-5">Complete Date</th>
                          <th class="tf-2-5 text-center">Revision</th>
                          <th class="tf-3 text-center">Revision No.</th>
                          <th class="tf-3 text-center">Wrong Program</th>
                          <th class="tf-3 text-center">Approve</th>
                          <th class="tf-3 text-center">Form Status</th>
                          <th class="tf-3 text-center">Tester Appr</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(x,idx) in detailData" v-bind:class="statusClass('',x.status)">
                          <td align="center" class="text-bold">{{x.itemno}}.</td>
                          <td>
                            <select class="form-control input-sm" v-model="x.module">
                              <option v-for="m in moduleForMango" v-bind:value="m">{{m}}</option>
                            </select>
                          </td>
                          <td><input type="text" class="form-control input-sm" v-model.trim="x.subject" /></td>
                          <td width="100">
                            <select class="form-control input-sm" v-model="x.item_type">
                              <option v-for="item in serviceCodeData" v-bind:value="item.serv_code">{{item.serv_name}}</option>
                            </select>
                          </td>
                          <td>
                            <select class="form-control input-sm" v-model="x.req_type">
                              <option v-for="req in requestCodeData" v-bind:value="req.req_code">{{req.req_des}}</option>
                            </select>
                          </td>
                          <td>
                            <select class="form-control input-sm" v-model="x.status" @change="changeCompleteDate(x, 'status', 'complete_date')">
                              <option v-for="status in statusCodeData" v-bind:value="status.id">{{status.name}}</option>
                            </select>
                          </td>
                          <td><datepicker input-class="form-control input-sm" v-model.trim="x.response_date"></datepicker></td>
                          <td><datepicker input-class="form-control input-sm" v-model.trim="x.due_date"></datepicker></td>
                          <td><datepicker input-class="form-control input-sm" v-model.trim="x.complete_date"></datepicker></td>
                          <td align="center"><input type="checkbox" v-model="x.revision_is_import" true-value="Y" false-value="N" /></td>
                          <td><input type="text" class="form-control input-sm" v-model.trim="x.revision" :disabled="x.revision_is_import != 'Y'" /></td>
                          <td align="center"><input type="checkbox" v-model="x.wrong_program" true-value="Y" false-value="N" /></td>
                          <td>
                            <select class="form-control input-sm" v-model="x.approve_status">
                              <option value="N">Waiting</option>
                              <option value="C">Reject</option>
                              <option value="Y">Approve</option>
                            </select>
                          </td>
                          <td>
                            <select class="form-control input-sm" v-model="x.formcode_status">
                              <option value="N">None</option>
                              <option value="Y">Sign</option>
                            </select>
                          </td>
                          <td>
                            <select class="form-control input-sm" v-model="x.tester_approve">
                              <option value="N">None</option>
                              <option value="Y">Approved</option>
                              <option value="R">Reject</option>
                            </select>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div class="tab-pane" v-bind:class="{active:tabDetail===1}">
              <div class="modal-section-title"><i class="fas fa-puzzle-piece"></i> Document : Addspec</div>
              <div class="row">
                <div class="col-md-12">
                  <div class="table-responsive">
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th class="tf-3 text-center">Add Spec</th>
                          <th class="tf-2-5 text-center">Item No.</th>
                          <th class="tf-3">Module</th>
                          <th class="tf-4">Subject</th>
                          <th class="tf-3-5">Type</th>
                          <th class="tf-3-5">Req. Type</th>
                          <th class="tf-3-5">Status</th>
                          <th class="tf-3-5">Response Date</th>
                          <th class="tf-3-5">Due Date</th>
                          <th class="tf-3-5">Complete Date</th>
                          <th class="tf-2-5 text-center">Revision</th>
                          <th class="tf-3 text-center">Revision No.</th>
                          <th class="tf-3 text-center">Wrong Program</th>
                          <th class="tf-3 text-center">Approve</th>
                          <th class="tf-3 text-center">Form Status</th>
                          <th class="tf-3 text-center">Tester Appr</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-for="(x, idx) in detailData">
                          <!-- Main Row -->
                          <tr v-bind:class="statusClass('', x.status)">
                            <td class="text-center">
                              <button class="btn btn-sm btn-primary" @click="openModalAddspec(x.itemno)">
                                <i class="fas fa-plus"></i> เพิ่ม
                              </button>
                            </td>
                            <td align="center" class="text-modulebold">{{ x.itemno }}.</td>
                            <td align="center">{{ x.module }}</td>
                            <td align="center">{{ x.subject }}</td>
                            <td align="center" v-for="item in serviceCodeData" :key="item.serv_code" v-if="item.serv_code === x.item_type">
                              {{ item.serv_name || 'No DATA' }}
                            </td>
                            <td align="center">
                              <template v-if="x.req_type === null">
                                <td>-</td>
                              </template>
                              <template v-else>
                                <td v-for="req in requestCodeData" :key="req.req_code" align="center">
                                  {{ req.req_code === x.req_type ? req.req_des : '' }}
                                </td>
                              </template>
                            </td>
                            <td align="center" v-for="status in statusCodeData" :key="status.id" v-if="status.id === x.status">
                              {{ status.name || '-' }}
                            </td>
                            <td align="center">{{ x.response_date | date('DD/MM/YYYY') }}</td>
                            <td align="center">{{ x.due_date | date('DD/MM/YYYY') }}</td>
                            <td align="center">{{ x.complete_date | date('DD/MM/YYYY') }}</td>
                            <td align="center">{{ x.revision_is_import === 'Y' ? '✓' : '' }}</td>
                            <td align="center">{{ x.revision }}</td>
                            <td align="center">{{ x.wrong_program === 'Y' ? '✓' : '' }}</td>
                            <td align="center">{{ x.approve_status === 'Y' ? 'Approve' : x.approve_status === 'N' ? 'Waiting' : 'Reject' }}</td>
                            <td align="center">{{ x.formcode_status === 'Y' ? 'Sign' : 'None' }}</td>
                            <td align="center">{{ x.tester_approve === 'Y' ? 'Approved' : x.tester_approve === 'N' ? 'None' : 'Reject' }}</td>
                          </tr>

                          <template v-if="x.addspec && x.addspec.length">
                            <tr class="addspec-subheader">
                              <td class="text-center">Action</td>
                              <td class="text-center">Item No.</td>
                              <td class="text-center">Module</td>
                              <td class="text-center">Object Name</td>
                              <td colspan="2" class="text-center">Remark</td>
                              <td class="text-center">Add Date</td>
                            </tr>
                            <tr v-for="(item, index) in x.addspec">
                              <td align="center">
                                <a href="#" @click.prevent="deleteSpec(x, index)">
                                  <i class="far fa-trash-alt text-danger"></i>
                                </a>
                              </td>
                              <td align="center" class="text-bold">{{ x.itemno }}.{{ index + 1 }}</td>
                              <td align="center">{{ item.filename }}</td>
                              <td>{{ item.description }}</td>
                              <td colspan="2">
                                <input type="text" class="form-control input-sm" v-model="item.description2" />
                              </td>
                              <td align="center">{{ item.add_dt | date('DD/MM/YYYY HH:mm') }}</td>
                            </tr>
                          </template>
                        </template>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template slot="footer">
        <div class="ed-mf">
          <button class="ed-abtn ed-abtn--warn" @click="confirmResetApprove(formData['job_no'], 'reset')">
            <i class="fa fa-undo"></i> ล้างสถานะอนุมัติ
          </button>
          <button class="ed-abtn ed-abtn--violet" @click="confirmResetApprove(formData['job_no'], 'active')">
            <i class="fa fa-check-circle"></i> Approve
          </button>
          <button class="ed-abtn ed-abtn--teal" @click="TesterApprove()">
            <i class="fas fa-user-check"></i> Tester Approve
          </button>
          <button class="ed-abtn ed-abtn--green" @click="All_Complete()">
            <i class="fas fa-check-double"></i> ปิดงานทั้งหมด
          </button>
          <button class="ed-abtn ed-abtn--danger" @click="Delete(formData['job_no'])">
            <i class="fa fa-trash"></i> ลบเอกสาร
          </button>
          <div class="ed-mf__gap"></div>
          <button class="ed-abtn ed-abtn--save" @click="update()">
            <i class="fa fa-save"></i> บันทึกข้อมูล
          </button>
        </div>
      </template>
    </modal>
    <!-- Modal : Center -->
    <vue-employee-list ref="ct_emp" @send-data="sendComponent($event, 'employee')"></vue-employee-list>
    <vue-addspec-list ref="ct_addspec" @send-data="sendAddSpec($event)"></vue-addspec-list>
  </div>
</template>

<script>
  let page = {}
  let paging = {}
  let cpn = {
    data() {
      return {
        auth,
        tabDetail: 0,
        search: {},
        form: {},
        baseUrl,
        ui: window.ui,
        fields: [
          { key: 'job_no', name: 'CSM No.', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'pre_des', name: 'Project', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'dpt_no_name', name: 'Department', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'request_empno_name', name: 'Req. By', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'contract_user', name: 'Contact By', type: 's', search: true, sort: true, sort_default: true, width: 200 },
        ],
        status: [
          { key: 'job_status', name: 'All Item', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: '' },
          { key: 'job_status', name: 'None', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'W' },
          { key: 'job_status', name: 'In Progress', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'I' },
          { key: 'job_status', name: 'Done', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'D' },
          { key: 'job_status', name: 'Complete', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'C' },
        ],
        retrieveSearch: {},
        datalist: [],
        formData: {},
        detailData: [],
        isLoading: false,
        moduleForMango: moduleCodeData,
        platformCodeData,
        statusCode,
        statusCodeData,
        empType: "",
        itemnoCopy: '',
        onlyme: 'N',
        total: 0,
        skipNow: 0,
        perPage: 100
      }
    },
    methods: {
      n(v) {
        return $xt.formatNumber($xt.int(v), 0)
      },
      statusIcon(v) {
        switch (v) {
          case 'W': return 'fas fa-hourglass-half'
          case 'I': return 'fas fa-spinner'
          case 'D': return 'fas fa-clipboard-check'
          case 'C': return 'fas fa-check-double'
          default: return 'fas fa-layer-group'
        }
      },
      pickStatus(v) {
        this.$set(this.retrieveSearch, 'job_status', v)
        this.doSearch()
      },
      doSearch() {
        paging.setCurrentPage(1)
        this.loadData()
      },
      clearSearch() {
        this.$set(this.retrieveSearch, 'text', '')
        this.doSearch()
      },
      setPerPage(n) {
        paging.setItemsPerPage(n)
        paging.setCurrentPage(1)
        this.loadData()
      },
      async loadData() {
        this.isLoading = true
        page.loadingBox.show()
        let act = `CSM/Data/ReadDocument?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}&tabSelected=3&subTabSelected=0&onlyme=${this.onlyme}`
        for (var key in this.retrieveSearch) {
          act += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`
        }
        let rsp = await $xt.getServer(act)
        this.datalist = rsp.data.detail
        this.total = rsp.data.total
        this.skipNow = paging.skipItems()
        paging.setTotalItems(rsp.data.total)
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1)
        }
        paging.createPagesArray()
        this.isLoading = false

        await this.$nextTick()
        this.applyGrid()
        page.loadingBox.hide()
      },
      applyGrid() {
        let agr = this.$refs.agr
        if (!agr || !agr.topGridOptions || !agr.topGridOptions.api) return
        agr.setDisplay(this.datalist)
      },
      pageChange(pn) {
        paging.setCurrentPage(pn)
        this.loadData()
      },
      async initTable() {
        let agr = this.$refs.agr
        if (!agr) return

        let self = this

        let fields = [
          ["job_no", "CSM No.", "text", {
            width: 165,
            align: "center",
            pinned: 'left',
            cellStyle: { "white-space": "nowrap" },
            cellRenderer: (params) => {
              let x = params.data
              return `<a href="#" class="btn-open-csm ed-cell-link" data-job_no="${x.job_no}">${x.job_no}<i class="fas fa-pen"></i></a>`
            }
          }],
          ["job_date", "Date", "date", { width: 110, align: "center", sortable: true }, { useCellRenderer: true }],
          ["subject", "Subject", "text", { width: 350, align: "left", sortable: true }],
          ["project", "Project", "text", { width: 220, align: "left", sortable: true }],
          ["request_empno_name", "Req. By", "text", { width: 180, align: "left", sortable: true }],
          ["contract_user", "Contact By", "text", { width: 180, align: "left", sortable: true }],
          ["phone", "Tel", "text", { width: 140, align: "center", sortable: true }],
          ["job_priority", "Job Priority", "text", {
            width: 180,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              let code = params.value
              let name = self.priorityName(code)
              if (!name) return ''
              let c = code == '4' ? '#F2685E' : code == '3' ? '#F5A623' : '#8B9CB8'
              return `<span class="ed-cell-tag" style="--c:${c}"><i></i>${name}</span>`
            }
          }],
          ["job_status", "Job Status", "text", {
            width: 160,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              let m = self.jobStatusMeta(params.value)
              return `<span class="ed-cell-badge" style="--c:${m.color};--sf:${m.soft};--dp:${m.deep}"><i></i>${m.name}</span>`
            }
          }],
          ["response_date", "Response Date", "date", { width: 130, align: "center", sortable: true }, { useCellRenderer: true }],
          ["job_due_date", "Job Due Date", "date", { width: 130, align: "center", sortable: true }, { useCellRenderer: true }],
          ["job_complete_date", "Complete Date", "date", {
            width: 130,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              let x = params.data
              let val = x.job_status == 'N' ? x.cancel_dt : x.job_complete_date
              return val ? $xt.dateFormat(val, 'DD/MM/YYYY') : ''
            }
          }],
          ["overdue", "Over Due", "text", {
            width: 120,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              let x = params.data
              if (x.is_overdue) return `<span class="ed-cell-over">${x.overdue || ''}</span>`
              return `<span class="ed-cell-dim">${x.overdue || '—'}</span>`
            }
          }],
        ]

        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)
        this.applyGrid()
      },
      bindOpenLink() {
        let self = this
        $(document).off('click', '.btn-open-csm')
        $(document).on('click', '.btn-open-csm', function (e) {
          e.preventDefault()
          let job_no = $(this).data('job_no')
          let rowData = $linq(self.datalist).where(x => x.job_no == job_no).firstOrDefault()
          if (rowData) {
            self.openModal(rowData)
          }
        })
      },
      openModal(x) {
        this.$refs.toolModal.openModal()
        var job_no = this.$set(this.formData, 'job_no', x.job_no)
        this.$set(this.formData, 'job_status', x.job_status)
        this.loadDataModal(job_no)

        this.itemnoCopy = ''
      },
      openEmployeeModal(type) {
        this.empType = type || ""
        this.$refs.ct_emp.openModal()
      },
      async sendComponent(e, type) {
        switch (this.empType) {
          case "req":
            this.$set(this.formData, 'request_empno', e.empno)
            this.$set(this.formData, 'request_empno_name', e.empfullname)
            break
          case "assign":
            this.$set(this.formData, 'assign_empno', e.empno)
            this.$set(this.formData, 'assign_empno_name', e.empfullname)
            break
        }
      },
      async loadDataModal(job_no) {
        let url = `CSM/Data/CSM_Read?job_no=${encodeURIComponent(job_no)}`
        let resp = await $xt.getServer(url)
        this.$set(this, 'formData', resp.data.form)
        this.$set(this, 'detailData', resp.data.detail)
      },
      async update() {
        let newAttachfile = []
        this.detailData.forEach(x => {
          x.addspec.forEach(item => {
            newAttachfile.push({
              ref_itemno: item.ref_itemno,
              filename: item.filename, 
              description: item.description,
              description2: item.description2,
              add_dt: item.add_dt,
              add_user: item.add_user,
              edit_dt : item.edit_dt,
              edit_user : item.edit_user
            })
          });
        })
        
        try {
          let f = {
            form: this.formData,
            detail: this.detailData,
            attachfile: newAttachfile,
          }
          let act = `CSM/Tools/csr_update_db`
          let rsp = await $xt.postServerJson(act, f)
          if (!rsp.success) {
            throw rsp.error
          }
          this.loadDataModal(this.formData['job_no'])
          this.loadData()
          $notify.success(this.ui.alert_save_success)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {

        }
      },
      async confirmResetApprove(job_no, type) {
        if (!await $msg.confirm(`การกระทำนี้ไม่สามารถกู้คืนได้ โปรดยืนยัน`)) {
          return
        }
        switch (type) {
          case "reset":
            this.deleteApprove(job_no)
            break
          case "active":
            this.activeApprove(job_no)
            break
        }
      },
      async TesterApprove() {
        try {
          let f = {
            detail: this.detailData,
          }
          let act = `CSM/Tools/CSM_TesterApprove`
          let rsp = await $xt.postServerJson(act, f)
          if (!rsp.success) {
            throw rsp.error
          }
          this.loadDataModal(this.formData['job_no'])
          this.loadData()
          $notify.success(this.ui.alert_save_success)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {

        }
      },
      async All_Complete() {
        try {
          let f = {
            form: this.formData,
            detail: this.detailData,
          }
          let act = `CSM/Tools/CSM_AllComplete`
          let rsp = await $xt.postServerJson(act, f)
          if (!rsp.success) {
            throw rsp.error
          }
          this.loadDataModal(this.formData['job_no'])
          this.loadData()
          $notify.success(this.ui.alert_save_success)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
        }
      },
      async activeApprove(job_no) {
        try {
          let act = `CSM/Tools/csr_active_approve?job_no=${job_no}`
          let rsp = await $xt.postServerJson(act, null)
          if (!rsp.success) {
            throw rsp.error
          }
          this.loadDataModal(this.formData['job_no'])
          this.loadData()
          $notify.success(this.ui.alert_save_success)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {

        }
      },
      async deleteApprove(job_no) {
        try {
          let act = `CSM/Tools/csr_delete_approve?job_no=${job_no}`
          let rsp = await $xt.postServerJson(act, null)
          if (!rsp.success) {
            throw rsp.error
          }
          this.loadDataModal(this.formData['job_no'])
          this.loadData()
          $notify.success(this.ui.alert_save_success)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {

        }
      },
      async Delete(job_no) {
        if (!await $msg.confirm(`การกระทำนี้ไม่สามารถกู้คืนได้ โปรดยืนยันการลบข้อมูล`)) {
          return
        }

        try {
          let act = `CSM/Tools/csr_delete_db?job_no=${job_no}`
          let rsp = await $xt.postServerJson(act, null)
          if (!rsp.success) {
            throw rsp.error
          }
          this.loadData()
          this.$refs.toolModal.closeModal()
          $notify.success(this.ui.alert_save_success)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
        }
      },
      changeCompleteDate(parent, field, update) {
        this.$set(parent, update, parent[field] == 'Y' ? new Date() : null)
      },
      priorityName(code) {
        return $linq(this.priorityCodeData).where(x => x.prioity_code == code).select(x => x.prioity_des).firstOrDefault() || ''
      },
      priorityStatusClass(code) {
        /* Variable : prioity_code, prioity_des, priority_status = 1 (ปกติ) , 2 (สำคัญ) , 3 (สำคัญมาก), active */
        var status = $linq(this.priorityCodeData).where(w => w.prioity_code == code).select(x => x.priority_status).firstOrDefault() || ""
        return status == "3" ? "text-danger" : status == "2" ? "text-warning" : "text-info"
      },
      statusClass(prefix, status) {
        return status == 'Y' ? prefix + 'success' : status == 'I' ? prefix + 'info' : status == 'N' ? prefix + 'danger' : status == 'H' ? prefix + 'warning' : ''
      },
      statusName(code) {
        return $linq(this.statusCode).where(x => x.id == code).select(x => x.name).firstOrDefault() || ''
      },
      jobStatusMeta(code) {
        let map = {
          W: ['#8B9CB8', 'rgba(139,156,184,.16)', '#5C6E8A'],
          I: ['#4C8DFF', 'rgba(76,141,255,.14)', '#1E63D6'],
          H: ['#F5A623', 'rgba(245,166,35,.17)', '#A9700B'],
          Y: ['#2FBF8F', 'rgba(47,191,143,.15)', '#1E8A66'],
          N: ['#F2685E', 'rgba(242,104,94,.14)', '#C93B31'],
          D: ['#9AA7B8', 'rgba(154,167,184,.16)', '#63728A']
        }
        let c = map[code] || map.D
        return { name: this.statusName(code) || code || '—', color: c[0], soft: c[1], deep: c[2] }
      },
      openReq() {
        window.open(this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${this.formData['job_no']}`, "_blank")
      },
      changeTab(t) {
        this.tabDetail = t
      },
      sendAddSpec(dataArray) {
        dataArray.forEach(data => {
            let findIndex = this.detailData.findIndex(x => x.itemno == this.itemnoCopy)
            let x = {
                ref_itemno: this.itemnoCopy || '',
                filename: data.module || '',
                description: data.object_name || '',
                description2: '',
                add_dt: new Date()
            };
              this.detailData[findIndex].addspec.push(x)
        });
      },
      openModalAddspec(itemno) {
        this.itemnoCopy = itemno
        this.$refs.ct_addspec.openModal()
      },
      deleteSpec(dataItem, specIndex) {
        dataItem.addspec.splice(specIndex, 1);
      }
    },
    computed: {
      rangeText() {
        if (!this.total) return 'ไม่พบรายการ'
        return `แสดง ${this.n(this.skipNow + 1)} – ${this.n(this.skipNow + this.datalist.length)} จาก ${this.n(this.total)} รายการ`
      },
      serviceCodeData() { return store.state.serviceCodeData },
      configData() { return store.state.configData },
      requestCodeData() { return store.state.requestCodeData },
      priorityCodeData() { return store.state.priorityCodeData },
    },
    async mounted() {
      page = this.$refs.page
      page.pageTitle = `CSM : Admin Tools`
      document.title = page.pageTitle
      window.page = page

      paging = this.$refs.paging
      paging.setCurrentPage(1)
      paging.setItemsPerPage(this.perPage)

      this.bindOpenLink()

      let field_init = $linq(this.fields).where(x => x.search).firstOrDefault() || {}
      this.$set(this.retrieveSearch, 'field', field_init.key || '')
      this.$set(this.retrieveSearch, 'field_type', field_init.type || 's')
      this.$set(this.retrieveSearch, 'job_status', this.status[0].value || '')

      this.loadData()

      this.$refs.toolModal.setSize('modal-xl-2')
    },
    beforeDestroy() {
      $(document).off('click', '.btn-open-csm')
    }
  }

  export default cpn
</script>
<style scoped>
.ed {
  --ink: #16263D;
  --ink-2: #4A5A72;
  --ink-3: #8593A8;
  --line: #E4E9F2;
  --surface: #FFFFFF;
  --canvas: #F1F4F9;
  --radius: 16px;
  --shadow: 0 1px 2px rgba(16,32,54,.05), 0 14px 34px -22px rgba(16,32,54,.4);
  font-family: 'Sarabun', 'Helvetica Neue', sans-serif;
  color: var(--ink);
  padding: 2px 0 20px;
}

.ed *,
.ed *::before,
.ed *::after { box-sizing: border-box; }

.ed-bar {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  padding: 14px 16px;
  animation: edRise .45s both;
}

.ed-bar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.ed-bar__row--sub {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
  gap: 12px;
}

.ed-bar__label {
  font-family: 'Prompt', sans-serif;
  font-size: 11.5px;
  color: var(--ink-3);
  white-space: nowrap;
}

.ed-bar__label i { margin-right: 6px; }

.ed-bar__count {
  margin-left: auto;
  font-size: 12px;
  color: var(--ink-3);
  white-space: nowrap;
}

.ed-bar__count b {
  font-family: 'Prompt', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  margin-right: 4px;
  font-variant-numeric: tabular-nums;
}

.ed-search {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: 1 1 260px;
  max-width: 420px;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  padding: 0 34px;
  transition: border-color .2s ease, box-shadow .2s ease;
}

.ed-search:focus-within {
  border-color: #4FD1C5;
  box-shadow: 0 0 0 3px rgba(79,209,197,.15);
}

.ed-search > i {
  position: absolute;
  left: 13px;
  font-size: 12px;
  color: var(--ink-3);
}

.ed-search > i.ed-search__clear {
  left: auto;
  right: 12px;
  cursor: pointer;
}

.ed-search > i.ed-search__clear:hover { color: var(--ink); }

.ed-search input {
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 13px;
  width: 100%;
  height: 100%;
  color: var(--ink);
}

.ed-field {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 38px;
  min-width: 165px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  padding-left: 32px;
}

.ed-field > i {
  position: absolute;
  left: 12px;
  font-size: 12px;
  color: var(--ink-3);
  pointer-events: none;
}

.ed-field select {
  appearance: none;
  -webkit-appearance: none;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  width: 100%;
  height: 100%;
  padding: 0 26px 0 0;
  outline: none;
  cursor: pointer;
}

.ed-field::after {
  content: '';
  position: absolute;
  right: 13px;
  width: 6px;
  height: 6px;
  border-right: 1.5px solid var(--ink-3);
  border-bottom: 1.5px solid var(--ink-3);
  transform: rotate(45deg) translateY(-2px);
  pointer-events: none;
}

.ed-field--sm {
  height: 32px;
  min-width: 118px;
}

.ed-field--sm select { font-size: 12px; }

.ed-btn {
  height: 38px;
  padding: 0 20px;
  border: 0;
  border-radius: 10px;
  background: #4FD1C5;
  color: #06232B;
  font-family: 'Prompt', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 8px 18px -12px rgba(79,209,197,.95);
  transition: transform .18s ease, background .18s ease;
}

.ed-btn i { margin-right: 6px; }
.ed-btn:hover { background: #6BE0D5; transform: translateY(-1px); }

.ed-switch {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  height: 38px;
  padding: 0 14px 0 12px;
  margin: 0;
  border: 1px solid var(--line);
  border-radius: 10px;
  font-weight: 400;
  cursor: pointer;
  user-select: none;
  transition: border-color .18s ease, background .18s ease;
}

.ed-switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.ed-switch__track {
  position: relative;
  width: 34px;
  height: 18px;
  border-radius: 20px;
  background: #DDE3ED;
  transition: background .2s ease;
}

.ed-switch__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(16,32,54,.35);
  transition: transform .2s cubic-bezier(.2,.7,.2,1);
}

.ed-switch__text {
  font-size: 12.5px;
  color: var(--ink-2);
}

.ed-switch.on {
  border-color: rgba(79,209,197,.65);
  background: rgba(79,209,197,.09);
}

.ed-switch.on .ed-switch__track { background: #2FBF8F; }
.ed-switch.on .ed-switch__knob { transform: translateX(16px); }
.ed-switch.on .ed-switch__text { color: var(--ink); }

.ed-types {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.ed-type {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 13px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--surface);
  font-family: inherit;
  font-size: 12.5px;
  color: var(--ink-2);
  cursor: pointer;
  transition: border-color .18s ease, color .18s ease, background .18s ease;
}

.ed-type i { font-size: 10.5px; color: var(--ink-3); }

.ed-type:hover {
  border-color: #C9D3E2;
  color: var(--ink);
}

.ed-type.is-on {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

.ed-type.is-on i { color: #4FD1C5; }

.ed-panel {
  margin-top: 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  padding: 14px 16px 14px;
  animation: edRise .5s .08s both;
}

.ed-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 13px;
  margin-top: 13px;
  border-top: 1px solid var(--line);
}

.ed-foot__range {
  font-size: 12px;
  color: var(--ink-3);
}

.ed-foot__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

@keyframes edRise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}

::v-deep .pagination {
  margin: 0;
  display: inline-flex;
  gap: 4px;
}

::v-deep .pagination > li > a {
  border: 1px solid var(--line);
  border-radius: 8px;
  min-width: 32px;
  height: 32px;
  line-height: 30px;
  padding: 0 9px;
  text-align: center;
  color: var(--ink-2);
  background: var(--surface);
  font-family: 'Prompt', sans-serif;
  font-size: 12px;
  transition: border-color .18s ease, color .18s ease, background .18s ease;
}

::v-deep .pagination > li > a:hover {
  border-color: #4FD1C5;
  color: var(--ink);
  background: var(--surface);
}

::v-deep .pagination > li.active > a,
::v-deep .pagination > li.active > a:hover {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

::v-deep .pagination > li > a.disabled-menu {
  opacity: .4;
  pointer-events: none;
}

::v-deep .ed-cell-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: 'Prompt', sans-serif;
  font-size: 12.5px;
  font-weight: 500;
  color: #16263D;
  text-decoration: none;
}

::v-deep .ed-cell-link i {
  font-size: 9px;
  color: #C0CAD8;
  transition: color .18s ease;
}

::v-deep .ed-cell-link:hover {
  color: #127C8E;
  text-decoration: underline;
}

::v-deep .ed-cell-link:hover i { color: #127C8E; }

::v-deep .ed-cell-badge {
  --c: #8B9CB8;
  --sf: rgba(139,156,184,.16);
  --dp: #5C6E8A;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 2px 11px;
  border-radius: 20px;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--dp);
  background: var(--sf);
}

::v-deep .ed-cell-badge i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c);
}

::v-deep .ed-cell-tag {
  --c: #8B9CB8;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #4A5A72;
}

::v-deep .ed-cell-tag i {
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: var(--c);
}

::v-deep .ed-cell-over {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-family: 'Prompt', sans-serif;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.6;
  color: #fff;
  background: linear-gradient(135deg, #F2685E, #D9453A);
  box-shadow: 0 6px 14px -8px rgba(217,69,58,.9);
}

::v-deep .ed-cell-dim { color: #C3CBD8; }

.ed-mh {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ed-mh__icon {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.24);
}

.ed-mh__icon i {
  font-size: 17px;
  color: #fff;
}

.ed-mh__title {
  font-family: 'Prompt', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.3;
  color: #fff;
}

.ed-mh__sub {
  font-size: 12px;
  color: rgba(255,255,255,.7);
  margin-top: 2px;
}

.ed-mh__sub b {
  font-family: 'Prompt', sans-serif;
  font-weight: 600;
  color: #7EE3D8;
  letter-spacing: .04em;
}

.ed-seg--modal {
  display: inline-flex;
  height: 34px;
  margin-bottom: 12px;
  border: 1px solid #E4E9F2;
  border-radius: 9px;
  overflow: hidden;
  background: #F1F4F9;
}

.ed-seg--modal button {
  border: 0;
  background: transparent;
  padding: 0 18px;
  font-family: 'Prompt', sans-serif;
  font-size: 12.5px;
  color: #4A5A72;
  cursor: pointer;
  transition: background .2s ease, color .2s ease;
}

.ed-seg--modal button i { font-size: 11px; margin-right: 7px; }

.ed-seg--modal button.is-on {
  background: #16263D;
  color: #fff;
}

.ed-seg--modal button.is-on i { color: #4FD1C5; }

.ed-mf {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 22px;
}

.ed-mf__gap { flex: 1 1 auto; }

.ed-abtn {
  height: 32px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  color: #fff;
  font-family: 'Prompt', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: transform .16s ease, filter .16s ease;
}

.ed-abtn i { margin-right: 6px; font-size: 11px; }
.ed-abtn:hover { transform: translateY(-1px); filter: brightness(1.07); }

.ed-abtn--warn { background: #E8930C; }
.ed-abtn--violet { background: #7B57B5; }
.ed-abtn--teal { background: #159C89; }
.ed-abtn--green { background: #21A366; }
.ed-abtn--danger { background: #D9453A; }

.ed-abtn--save {
  height: 34px;
  padding: 0 22px;
  font-size: 13px;
  font-weight: 600;
  background: linear-gradient(135deg, #16263D, #24405F);
  box-shadow: 0 8px 18px -10px rgba(22,38,61,.85);
}

/* ─── Modal table scroll ───────────────────────────────── */
/deep/ .tab-content .table-responsive {
  max-height: calc(100vh - 380px);
  overflow-y: auto;
  overflow-x: auto;
}

/deep/ .tab-content .table-responsive {
  border: 1px solid #E4E9F2;
  border-radius: 12px;
}

/deep/ .tab-content .table-responsive thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f4f6f9;
}

/deep/ .tab-content .table-responsive thead th {
  background: #EEF2F8;
  border-bottom: 1px solid #DDE4EF !important;
  font-family: 'Prompt', sans-serif;
  font-size: 11.5px;
  font-weight: 500;
  color: #4A5A72;
  white-space: nowrap;
  vertical-align: middle;
}

/deep/ .tab-content .table-responsive tbody > tr > td {
  vertical-align: middle;
  font-size: 12.5px;
}

/deep/ .tab-content .table-responsive tbody > tr:hover > td {
  background: rgba(79,209,197,.06);
}

/deep/ .tab-content .table-responsive .form-control {
  border-radius: 7px;
  border-color: #E1E7F0;
  box-shadow: none;
  font-size: 12.5px;
}

/deep/ .tab-content .table-responsive .form-control:focus {
  border-color: #4FD1C5;
  box-shadow: 0 0 0 3px rgba(79,209,197,.14);
}

/deep/ .tab-content .table-responsive tr.addspec-subheader > td {
  background: #F5F7FB;
  font-family: 'Prompt', sans-serif;
  font-size: 11px;
  color: #8593A8;
  letter-spacing: .04em;
}

/deep/ .modal-body .nav-tabs-custom {
  margin-bottom: 0;
  box-shadow: none;
  border: 0;
}

/deep/ .modal-footer {
  position: relative;
  z-index: 20;
}
</style>

<style>
body.dark-mode .ed {
  --ink: #E6EDF6;
  --ink-2: #A9B7C9;
  --ink-3: #7C8BA0;
  --line: #2A3648;
  --surface: #1B2433;
  --canvas: #232E3F;
  --shadow: 0 1px 2px rgba(0,0,0,.3), 0 14px 34px -22px rgba(0,0,0,.85);
}

body.dark-mode .ed-type.is-on {
  background: #4FD1C5;
  border-color: #4FD1C5;
  color: #06232B;
}

body.dark-mode .ed-type.is-on i { color: #06232B; }
body.dark-mode .ed-switch__track { background: #33415A; }
body.dark-mode .ed-cell-link { color: #E6EDF6; }
body.dark-mode .ed-cell-link:hover,
body.dark-mode .ed-cell-link:hover i { color: #4FD1C5; }
body.dark-mode .ed-cell-badge { color: var(--c); }
body.dark-mode .ed-cell-tag { color: #A9B7C9; }
body.dark-mode .ed-cell-dim { color: #5C6B7F; }

body.dark-mode .pagination > li.active > a,
body.dark-mode .pagination > li.active > a:hover {
  background: #4FD1C5;
  border-color: #4FD1C5;
  color: #06232B;
}
</style>

