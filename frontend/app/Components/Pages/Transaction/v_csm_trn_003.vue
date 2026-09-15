<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="nav-tabs-custom animated fadeIn">
          <ul class="nav nav-tabs">
            <li v-for="tab in tabs" :key="tab.id" :class="{ active: selectedTabs == tab.id }">
              <a href="#" @click.prevent="changeTab(tab.id)">{{ tab.name }}</a>
            </li>
          </ul>
          <div class="tab-content" ref="myContent">
            <!-- Tab 1 -->
            <div class="tab-pane" v-bind:class="{ active: selectedTabs == 'tab_header1' }">
              <div class="trn003-form-body">

                <!-- Section: ข้อมูลเอกสาร -->
                <div class="trn003-section">
                  <div class="trn003-section-header">
                    <i class="fas fa-file-alt"></i> ข้อมูลเอกสาร
                  </div>
                  <div class="trn003-section-body">
                    <div class="row">
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="trn003-label">{{ ui.csm_reqno || 'เลขที่เอกสาร' }}</label>
                          <input type="text" class="form-control input-sm trn003-readonly" maxlength="255"
                                 v-model="header.job_no" readonly />
                        </div>
                      </div>
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="trn003-label">{{ ui.csm_docdate || 'วันที่เอกสาร' }}</label>
                          <datepicker input-class="form-control input-sm trn003-readonly"
                                      v-model="header.job_date" :disabled="true"></datepicker>
                        </div>
                      </div>
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="trn003-label">Request By</label>
                          <input type="text" class="form-control input-sm trn003-readonly" maxlength="255"
                                 v-model="header.request_empno_name" readonly />
                        </div>
                      </div>
                      <div class="col-lg-3">
                        <div class="row">
                          <div class="col-xs-6">
                            <div class="form-group">
                              <label class="trn003-label">{{ ui.re_job_type || 'ประเภทงาน' }}</label>
                              <input type="text" class="form-control input-sm trn003-readonly" maxlength="255"
                                     value="Usability / การใช้งาน" readonly />
                            </div>
                          </div>
                          <div class="col-xs-6">
                            <div class="form-group">
                              <label class="trn003-label">{{ ui.csm_req_type || 'ส่วนงาน' }}</label>
                              <input type="text" class="form-control input-sm trn003-readonly" maxlength="255"
                                     value="Helpdesk" readonly />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Section: ข้อมูลโครงการ / ลูกค้า -->
                <div class="trn003-section">
                  <div class="trn003-section-header">
                    <i class="fas fa-building"></i> โครงการและลูกค้า
                  </div>
                  <div class="trn003-section-body">
                    <div class="row">
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="trn003-label required">{{ ui.project || 'Project' }}</label>
                          <div class="input-group">
                            <input type="text" class="form-control input-sm trn003-readonly"
                                   v-model="header['pre_event']" ref="pre_event" readonly />
                            <span class="input-group-btn">
                              <button class="btn btn-sm btn-search" @click="$refs.ct_project2.openModal()">
                                <i class="fa fa-search"></i>
                              </button>
                              <button class="btn btn-sm btn-clear"
                                      @click="clearData(header, ['pre_event', 'pre_des', 'customer_code', 'customer_name'])">
                                <i class="fa fa-times"></i>
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="trn003-label">&nbsp;</label>
                          <input type="text" class="form-control input-sm trn003-readonly"
                                 v-model="header['pre_des']" ref="pre_des" readonly />
                        </div>
                      </div>
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="trn003-label required">{{ ui.customer || 'ลูกค้า' }}</label>
                          <div class="input-group">
                            <input type="text" class="form-control input-sm trn003-readonly"
                                   v-model="header['customer_code']" ref="customer_code" readonly />
                            <span class="input-group-btn">
                              <button class="btn btn-sm btn-search" @click="$refs.ct_cm_customer.openModal()">
                                <i class="fa fa-search"></i>
                              </button>
                              <button class="btn btn-sm btn-clear"
                                      @click="clearData(header, ['customer_code', 'customer_name'])">
                                <i class="fa fa-times"></i>
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="trn003-label">&nbsp;</label>
                          <input type="text" class="form-control input-sm trn003-readonly"
                                 v-model="header['customer_name']" ref="customer_name" readonly />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Section: ข้อมูลผู้ติดต่อ -->
                <div class="trn003-section">
                  <div class="trn003-section-header">
                    <i class="fas fa-user"></i> ข้อมูลผู้ติดต่อ
                  </div>
                  <div class="trn003-section-body">
                    <div class="row">
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="trn003-label required">{{ ui.re_name_contact || 'ชื่อผู้ติดต่อ' }}</label>
                          <input type="text" class="form-control input-sm" maxlength="255"
                                 v-model="header['contract_user']" ref="contract_user" />
                        </div>
                      </div>
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="trn003-label">{{ ui.contract_pos || 'ตำแหน่งผู้ติดต่อ' }}</label>
                          <input type="text" class="form-control input-sm" maxlength="255"
                                 v-model="header['contract_pos']" ref="contract_pos" />
                        </div>
                      </div>
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="trn003-label">{{ ui.re_phone || 'Tel.' }}</label>
                          <div class="input-group">
                            <span class="input-group-addon"><i class="fas fa-phone" style="font-size:11px;"></i></span>
                            <input type="text" class="form-control input-sm" maxlength="255"
                                   v-model="header['phone']" ref="phone" />
                          </div>
                        </div>
                      </div>
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="trn003-label">{{ ui.re_email || 'E-mail' }}</label>
                          <div class="input-group">
                            <span class="input-group-addon"><i class="fas fa-envelope" style="font-size:11px;"></i></span>
                            <input type="text" class="form-control input-sm" maxlength="255"
                                   v-model="header['email']" ref="email" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- Task Section -->
        <div class="trn003-section" style="margin-top:14px;">
          <div class="trn003-section-header" style="display:flex;align-items:center;justify-content:space-between;">
            <span><i class="fas fa-tasks"></i> รายการ Task</span>
            <span class="trn003-task-count">{{ detail.length }} รายการ</span>
          </div>
          <div class="trn003-section-body" style="padding-bottom:0;">
            <div class="row">
              <div class="col-md-12">
                <table-stick-2 ref="stick_001" :cellpad="14" :scale="310">
                  <table class="table table-bordered trn003-table">
                    <thead>
                      <tr>
                        <th class="tf-2 text-center">No.</th>
                        <th class="tf-2 text-center">Action</th>
                        <th class="tf-3">Platform</th>
                        <th class="tf-3">Module</th>
                        <th class="tf-4">Subject</th>
                        <th class="tf-4">Description</th>
                        <th class="tf-2 text-center">File</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(a, index) in detail" :key="index" class="trn003-row">
                        <td align="center" class="trn003-no-cell">{{ index + 1 }}</td>
                        <td align="center">
                          <button class="btn btn-xs trn003-btn-delete" @click="deleteDetail(a.itemno)" title="ลบ">
                            <i class="far fa-trash-alt"></i>
                          </button>
                        </td>
                        <td class="px-4">
                          <vue-select-2 :options="newPlatformCodeData"
                                        :settings="{ theme: 'bootstrap', selectionCssClass: 'form-control input-sm' }"
                                        v-model="a.platform">
                          </vue-select-2>
                        </td>
                        <td class="px-4">
                          <vue-select-2 :options="newModuleForMango"
                                        :settings="{ theme: 'bootstrap', selectionCssClass: 'form-control input-sm' }"
                                        @change="moduleChange" v-model="a.module">
                          </vue-select-2>
                        </td>
                        <td class="px-4">
                          <textarea class="form-control input-sm" rows="1" v-model="a.subject"
                                    style="resize:none;"></textarea>
                        </td>
                        <td class="px-4">
                          <voice-typing v-model="a.detail" />
                        </td>
                        <td align="center">
                          <button class="btn btn-xs trn003-btn-file" @click="OpenAttchFile(a)" title="แนบไฟล์">
                            <i class="fas fa-paperclip"></i>
                            <span v-if="attachFile.filter(f => f.ref_itemno === a.itemno).length > 0"
                                  class="trn003-file-badge">
                              {{ attachFile.filter(f => f.ref_itemno === a.itemno).length }}
                            </span>
                          </button>
                        </td>
                      </tr>
                      <tr v-if="detail.length === 0">
                        <td colspan="7" class="trn003-empty">
                          <i class="fas fa-inbox" style="font-size:24px;color:#d0d3e0;display:block;margin-bottom:6px;"></i>
                          ยังไม่มีรายการ Task — กดปุ่ม "เพิ่มรายการ" เพื่อเริ่มต้น
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </table-stick-2>
              </div>
            </div>
            <div class="trn003-table-footer">
              <button class="btn btn-sm trn003-btn-add" @click="addDetail()">
                <i class="fas fa-plus"></i> เพิ่มรายการ
              </button>
            </div>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="trn003-action-bar">
          <button class="btn btn-sm trn003-btn-save" @click="isCheckSave()">
            <i class="fas fa-save"></i> บันทึกข้อมูล
          </button>
        </div>

        <vue-project2-list ref="ct_project2" @send-data="sendComponent($event, 'project')"></vue-project2-list>
        <vue-cm-customer-list ref="ct_cm_customer"
                              @send-data="sendComponent($event, 'cm_customer')"></vue-cm-customer-list>

        <!-- MODAL -->
        <modal ref="modal" class="modal-xl">
          <template #header>
            <h4>ADD</h4>
          </template>
          <template #body>
            <div class="row">
              <div class="col-md-12">
                <div class="padding-detail">
                  <file-attach ref="attchAddFile" document-type="CSM" :show-upload-file="true"></file-attach>
                  <!-- <file-attach ref="attchAddFile" :document-type="documentType" :show-upload-file="true" :attachFile="attachFile"></file-attach> -->
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <div>
              <button type="button" class="btn btn-sm btn-success" @click="setAttachFile()">บันทึกข้อมูล</button>
              <button class="btn btn-sm bg-danger" @click="$refs.modal.closeModal()">
                <i class="fas fa-times"></i>ปิดหน้าต่าง
              </button>
            </div>
          </template>
        </modal>
      </template>
    </re-page>
  </div>

</template>

<script>
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } }
  import { mapState, mapGetters } from '~/stores/helpers'

  import PhotoSwipe from 'photoswipe';
  import 'photoswipe/style.css';

  import { platform } from 'chart.js'

  export default {
    component() {
    },
    data() {
      return {
        newAttachFile: [],
        attachFile: [],
        auth,
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        xt: $xt,
        company: window.baseCompany,
        /*------ Select Tabs------*/
        selectedTabs: 'tab_header1',
        selectedTabsTwo: 'tab_header2',
        tabs: [
          { name: 'รายละเอียดเอกสาร', status: false, icon: '', id: 'tab_header1' },
        ],
        tabs2: [
          { name: 'Task', status: false, icon: '', id: 'tab_header2' },
        ],
        header: {
          //////SET Default
          serv_code_d: '08',
          dpt_code: auth.dpt_code,
          // job_status: 'Y', //
          // approve_status: 'Y',
          assign_empno: auth.empno,
          assign_empno_name: auth.empname,
          assign_empno_email: auth.empmail,
          assign_empno_empmob: auth.empmob, //
          assign_empno_emptel: auth.emptel,
          job_date: new Date(),
          request_empno: auth.empno,
          request_empno_name: auth.userid,
          request_empno_name: auth.empname,
          request_empno_email: auth.empmail,
          request_empno_empmob: auth.empmob, //
          request_empno_emptel: auth.emptel,
          pre_event: '',
          pre_des: '',
          customer_code: '',
          customer_name: '',
          contract_user: '',
          contract_pos: '',
          phone: '',
          email: '',
          connection_type: '002',
          job_priority: '1',
          // tester_test_status: 'Y',
          // send_pretest_to_tester_status: 'Y'
        },
        detail: [],
        ref_itemno: '',
        // pic: null,
        // moduleCodeData: '',
        newPlatformCodeData: [],
        moduleForMango: moduleCodeData,
        platformCodeData,
        editDetailData: {},
        newModuleForMango: [],
        itemno: '',
      }
    },
    methods: {
      setAttachFile() {
        this.$refs.attchAddFile.attachFile.forEach(x => x.ref_itemno = this.itemno)

        let add_Attachfile = this.$refs.attchAddFile.attachFile;

        this.attachFile = this.attachFile.filter(x => x.ref_itemno != this.itemno);
        this.attachFile.push(...add_Attachfile);
        this.$refs.modal.closeModal()
      },
      OpenAttchFile(a) {
        const AttachEdit = this.attachFile.filter((F) => F.ref_itemno === a.itemno);

        this.itemno = a.itemno;
        this.$refs.attchAddFile.attachFile = AttachEdit;

        this.$refs.modal.openModal();
      },
      CheckedArrLenght(arr = []) {
        return arr.length == 0
      },
      changeTab(id) {
        this.selectedTabs = id
      },
      // createFilePath(x) {
      //   return dataServer + 'Api/File/DownLoad?id=' + x
      // },
      is_mango() {
        let isMango = $linq(this.configData).where(x => x.config_id == 'TRN0001').select(x => x.config_value).firstOrDefault()
        return isMango == 'Y' ? true : false
      },
      async sendComponent(e, type) {
        switch (type) {
          case 'project':
            if (this.is_mango()) {
              let test = ''
              if (test != 'Y') {
                if (this.formData.mg_ma == 'N') {
                  $msg.alert(`คำเตือน`,
                    'Customer Code ' + e.customer_code + '</br>' +
                    'Customer Name ' + e.customer_name + '</br></br>' +

                    'ไม่ได้ต่อ MA กับทาง ' + this.auth.mainname + '</br>' +
                    'ดังนั่นลูกค้าจะไม่สามารถแจ้งเรื่องต่างๆ ที่เกี่ยวกับการเพิ่มเติม แก้ไข โปรแกรม รายงาน ฟอร์ม ได้'
                    , `warning`)
                }
                else if (this.formData.mg_ma == 'S') {
                  $msg.alert(`คำเตือน`, `ลูกค้ายังไม่มี Passcode โปรดติดต่อ IT Support เพื่อสร้าง Passcode ก่อนใช้งาน`, `warning`)
                  return
                }
              }
            }
            this.header.pre_event = e.pre_event
            this.header.pre_event2 = e.pre_event2
            this.header.pre_des = e.pre_des
            this.header.customer_code = e.customer_code
            this.header.customer_name = e.customer_name
            break
          case 'cm_customer':
            this.header.customer_code = e.customer_code
            this.header.customer_name = e.name_th
            this.setContractData()
            break
        }
      },
      clearData(data, field) {
        $linq(field).foreach(x => data[x] = null)
      },
      async loadArea() {
        let act = `CSM/MASTER/ProjArea_ReadList?pre_event2=${this.header['pre_event2']}`
        let rsp = await $xt.getServer(act)
        this.moduleCodeData = $linq(rsp.data.data_rows.data).where(x => x.active == 'Y').select(s => {
          return {
            id: s?.loccode,
            text: s?.locname
          }
        }).toArray()
      },
      is_qc() {
        let isQC = $linq(this.serviceCodeData).where(w => w.serv_code == this.editDetailData['item_type']).select(x => x.qc_st).firstOrDefault()
        return isQC == 'Y' ? true : false
      },
      async getManagerTester() {
        let act = `CSM/Center/EmployeeTesterManager?type=${this.editDetailData.module}`
        let resp = await $xt.getServer(act)
        if (resp.data) {
          this.editDetailData.tester_empno = resp.data.empno
          this.editDetailData.tester_empno_name = resp.data.name
          this.editDetailData.tester_empno_tmp = this.editDetailData['tester_empno']
          this.editDetailData.tester_empno_name_tmp = this.editDetailData['tester_empno_name']
        }
      },
      moduleChange() {
        if (this.is_qc()) {
          this.getManagerTester()
        }

        if (['RE', 'QCM', 'CSM', 'PPN', 'TS'].includes(this.editDetailData.module)) this.editDetailData.platform = 'WEB'
        else this.editDetailData.platform = 'WIN'
      },
      addDetail() {
        let itemno = $linq(this.detail)
          .select(x => Number(x.itemno))
          .where(x => !isNaN(x))
          .toArray();
        let max = itemno.length > 0 ? Math.max(...itemno) : 0; // ถ้าไม่มีค่าให้ max = 0
        this.detail.push({
          item_type: '08',
          itemno: max + 1,
          platform: '',
          module: '',
          subject: '',
          detail: '',
          status: 'W',
          risk_status: 'N',
          req_type: '04',
          contract_type: 'N',
          tester_empno: this.auth.empno,
          tester_empno_name: this.auth.empname,
          due_date: this.header.job_date,
          response_date: this.header.job_date,
          worker_start_date: this.header.job_date,
          worker_end_date: this.header.job_date,
          worker_send_date: this.header.job_date,
          // tester_test_status: 'Y',
          // send_pretest_to_tester_status: 'Y'
        });
      },
      async deleteDetail(index) {
        if (!await $msg.confirm('ต้องการลบแถวที่นี้ ใช่หรือไม่')) {
          return;
        }
        const detailIndex = this.detail.findIndex(item => item.itemno === index);
        if (detailIndex !== -1) {
          this.detail.splice(detailIndex, 1);
        } else {
          console.error(`nono`);
        }
        this.attachFile = this.attachFile.filter(file => file.ref_itemno !== index);
        this.newAttachFile = this.newAttachFile.filter(file => file.ref_itemno !== index);
      },
      async isCheckSave() {
        if ($xt.isEmpty(this.header['pre_event'])) {
          this.$refs.pre_event.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(`Warning`, `These fields are required : ${this.ui.project}`, `warning`)
          return
        }
        else if ($xt.isEmpty(this.header['pre_des']) && $xt.isEmpty(this.header['dpt_no']) && !this.is_mango()) {
          this.$refs.pre_des.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(`Warning`, `These fields are required : pre_des`, `warning`)
          return
        }
        else if (($xt.isEmpty(this.header['customer_code']))) {
          this.$refs.customer_code.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(`Warning`, `These fields are required : ${this.ui.customer}`, `warning`)
          return
        }
        else if ($xt.isEmpty(this.header['customer_name'])) {
          this.$refs.customer_name.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(`Warning`, `These fields are required : customer_name`, `warning`)
          return
        }
        else if ($xt.isEmpty(this.header['contract_user'].trim())) {
          this.$refs.contract_user.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(`Warning`, `These fields are required : ${this.ui.re_name_contact}`, `warning`)
          return
        }
        else if (this.detail.length === 0) {
          $msg.alert(`คำเตือน`, `กรุณาเพิ่มรายละเอียดเพิ่มเติม`, `warning`)
          return
        }
        else if (this.detail.length > 0 && !this.detail.every(item => item.platform !== null && item.platform !== '' && item.module !== null && item.module !== ''
          && item.subject.trim() !== null && item.subject.trim() !== '' && item.detail.trim() !== null && item.detail.trim() !== '')) {
          $msg.alert(`คำเตือน`, `มีรายระเอียดเอกสารที่ยังไม่ได้กรอกเพิ่มเติมในตาราง`, `warning`)
          return
        } else {
          for (let i = 0; i < this.attachFile.length; i++) {
            const file = this.attachFile[i]
            const updatedFile = {
              itemno: file.itemno,
              item_type: 'B',
              filepath: file.pathto,
              filename: file.docfilename,
              ref_itemno: file.ref_itemno,
              add_user: file.adduser,
              add_dt: file.add_dt,
              description: file.docdesc
            }
            this.newAttachFile.push(updatedFile)
          }

          if (this.detail.length === 1) {
            //กรณี 1 module ///
            this.header.subject = `สอบถามการใช้งาน ${this.detail[0].module}`
          } else {
            //สอบถามการใช้งาน modeule, delimiter///
            let modules = ''
            this.detail.forEach((item, index) => {
              modules += item.module + (index < this.detail.length - 1 ? ',' : '')
            })
            this.header.subject = `สอบถามการใช้งาน ${modules}`
          }
          this.header.job_date = new Date()
          this.saveClick()
        }
      },
      async saveClick() {
        try {
          let f = {
            form: this.header,
            detail: this.detail,
            // risk: this.risk,
            attach: this.newAttachFile,
            // formcode: this.approveFormCode,
            // baseUrl: (this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=`).toString()
          }
          page.loadingBox.show()
          // let act = `CSM/Data/CSM_Create_Mini`
          let act = `CSM/Data/CSM_trn003_Create`
          let rsp = await $xt.postServerJson(act, f)
          if (!rsp.success) {
            console.log('rsp error', rsp.error)
            console.log('rsp', rsp)
            throw rsp.error
          }
          $notify.success(this.ui.alert_save_success)
          this.clearFrom()


          $('html,body').animate({ scrollTop: 0 }, 'slow')
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          page.loadingBox.hide()
          this.loadArea()

        }
      },
      clearFrom() {
        const field = ['pre_event', 'pre_des', 'customer_code', 'customer_name', 'contract_user', 'contract_pos', 'phone', 'email', 'job_date']
        $linq(field).foreach(x => this.header[x] = null)
        this.header.job_date = new Date()
        const detailIndex = this.detail.findIndex(item => item.itemno);
        if (detailIndex !== -1) {
          this.detail.splice(this.detail.indexOf(detailIndex));
        } else {
          console.error(`nono`);
        }
        this.attachFile = []
        this.newAttachFile = []
        this.detail = []
      }
    },
    computed: {
      ...mapState(['serviceCodeData']),
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = 'Request to CSM'
      document.title = page.pageTitle
      this.newModuleForMango = $linq(this.moduleForMango).select(s => {
        return {
          id: s,
          text: s
        }
      }).toArray()
      this.newPlatformCodeData = $linq(this.platformCodeData).select(s => {
        return {
          id: s.id,
          text: s.name
        }
      }).toArray()

      this.$refs.modal.setSize('modal-xl')
    },
  }
</script>

<style scoped>
  /* ===== Sections ===== */
  .trn003-form-body {
    padding: 4px 0;
  }

  .trn003-section {
    border: 1px solid #e4e6ef;
    border-radius: 8px;
    margin-bottom: 12px;
    overflow: hidden;
    background: #fff;
  }

  .trn003-section-header {
    background: #1e2a3a;
    color: #fff;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .trn003-section-body {
    padding: 14px 16px 6px;
  }

  /* ===== Labels ===== */
  .trn003-label {
    font-size: 12px;
    font-weight: 600;
    color: #3f4254;
    margin-bottom: 4px;
    display: block;
  }

  .trn003-label.required::after {
    content: ' *';
    color: #f1416c;
  }

  /* ===== Readonly fields ===== */
  .trn003-readonly {
    background-color: #f5f8fa !important;
    color: #5e6278 !important;
    border-color: #e4e6ef !important;
  }

  /* ===== Search / Clear buttons ===== */
  .btn-search {
    background: #1e2a3a;
    color: #fff;
    border: none;
    transition: background 0.2s;
  }

  .btn-search:hover {
    background: #3a5068;
    color: #fff;
  }

  .btn-clear {
    background: #fff5f8;
    color: #f1416c;
    border: 1px solid #fcd4df;
    transition: background 0.2s;
  }

  .btn-clear:hover {
    background: #f1416c;
    color: #fff;
  }

  /* ===== Task count badge ===== */
  .trn003-task-count {
    background: #e8f4fd;
    color: #009ef7;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 12px;
    border: 1px solid #c8e6f9;
  }

  /* ===== Table ===== */
  .trn003-table thead tr th {
    background: #f5f8fa;
    color: #3f4254;
    font-size: 12px;
    font-weight: 700;
    border-color: #e4e6ef;
    padding: 8px 10px;
    white-space: nowrap;
  }

  .trn003-row td {
    vertical-align: middle;
    border-color: #e4e6ef;
    padding: 6px 8px;
  }

  .trn003-row:hover td {
    background-color: #f0f7ff;
  }

  .trn003-no-cell {
    font-weight: 700;
    color: #7e8299;
    font-size: 12px;
  }

  /* ===== Empty state ===== */
  .trn003-empty {
    text-align: center;
    padding: 28px 20px;
    color: #a1a5b7;
    font-size: 13px;
  }

  /* ===== Table footer ===== */
  .trn003-table-footer {
    padding: 10px 4px 12px;
    border-top: 1px solid #f1f3f8;
    margin-top: 4px;
  }

  /* ===== Buttons ===== */
  .trn003-btn-add {
    background: #009ef7;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 16px;
    transition: background 0.2s;
  }

  .trn003-btn-add:hover {
    background: #0086d4;
    color: #fff;
  }

  .trn003-btn-delete {
    background: #fff5f8;
    color: #f1416c;
    border: 1px solid #fcd4df;
    border-radius: 5px;
    padding: 3px 8px;
    transition: background 0.2s;
  }

  .trn003-btn-delete:hover {
    background: #f1416c;
    color: #fff;
    border-color: #f1416c;
  }

  .trn003-btn-file {
    background: #e8f4fd;
    color: #009ef7;
    border: 1px solid #c8e6f9;
    border-radius: 5px;
    padding: 3px 8px;
    position: relative;
    transition: background 0.2s;
  }

  .trn003-btn-file:hover {
    background: #009ef7;
    color: #fff;
    border-color: #009ef7;
  }

  .trn003-file-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: #50cd89;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  /* ===== Action bar ===== */
  .trn003-action-bar {
    display: flex;
    justify-content: flex-end;
    padding: 12px 4px 4px;
  }

  .trn003-btn-save {
    background: #50cd89;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 24px;
    transition: background 0.2s;
  }

  .trn003-btn-save:hover {
    background: #3db876;
    color: #fff;
  }

  /* ===== Misc ===== */
  .vue-pic-75 figure.gallery-thumbnail img { width: 55px; height: 55px; }
  .gap-10 { gap: 10px; }
  .gallery-thumbnail { display: block !important; margin: 5px; }
</style>
