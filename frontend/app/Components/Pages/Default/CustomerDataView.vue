<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="cdv-wrapper">

          <!-- ===== MAIN TAB NAVIGATION ===== -->
          <div class="cdv-card">
            <div class="cdv-header">
              <ul class="cdv-main-tabs">
                <li v-for="x in visibleTabs" :key="x.id"
                    :class="['cdv-main-tab', { active: x.id === tabActive }]">
                  <a href="#" @click.prevent="onTabChange(x.id)">
                    <i :class="['cdv-tab-icon', mainTabIcons[x.id]]"></i>
                    <span v-text="x.text"></span>
                  </a>
                </li>
              </ul>

              <!-- Toolbar Buttons -->
              <div class="cdv-toolbar">
                <button class="btn btn-sm btn-primary cdv-btn"
                        @click.prevent="addNew()"
                        v-show="subTabSelected!=0 && tabActive=='tab1' && subTabSelected!=4">
                  <i class="fas fa-plus"></i> {{ui.new || 'New'}}
                </button>
                <button class="btn btn-sm btn-primary cdv-btn"
                        @click="addAppList()"
                        v-if="['tab3','tab4'].includes(tabActive)">
                  <i class="fas fa-plus"></i>{{ ui.new || "New"}}
                </button>
                <button class="btn btn-sm btn-default cdv-btn" @click="autoPrintForm()">
                  <i class="fa fa-print"></i> {{ui.print == null ? "Print" : ui.print}}
                </button>
                <button class="btn btn-sm btn-success cdv-btn"
                        @click.prevent="handle_save_data()"
                        v-show="(subTabSelected==5 && tabActive=='tab1') || ((![1,2,3].includes(subTabSelected) || tabActive!='tab1') && isDeveloper())">
                  <i class="fas fa-save"></i> บันทึกข้อมูล
                </button>
              </div>
            </div>

            <!-- ===== TAB CONTENT ===== -->
            <div class="cdv-tab-content">

              <!-- TAB 1: Information -->
              <div class="cdv-pane" :class="{ active: tabActive === 'tab1' }">

                <!-- Sub-tab Bar -->
                <div class="cdv-subtab-bar">
                  <!-- Left: Title / Search -->
                  <div class="cdv-subtab-left">
                    <template v-if="subTabSelected === 0">
                      <span class="cdv-section-title">
                        <i class="fas fa-info-circle"></i> Information
                        <span class="cdv-section-sub">รายละเอียด</span>
                      </span>
                      <span v-if="formData.service_inactive==='Y'" class="cdv-inactive-badge">
                        <i class="fas fa-exclamation-triangle"></i> หยุดการใช้งานชั่วคราว
                      </span>
                    </template>
                    <template v-if="subTabSelected !== 0 && subTabSelected !== 4 && subTabSelected !== 5">
                      <div class="cdv-search-group">
                        <div class="input-group input-group-sm">
                          <input type="text" class="form-control"
                                 placeholder="ค้นหา..."
                                 v-model="search.text"
                                 @keyup.enter="onSearch()" />
                          <span class="input-group-btn">
                            <button class="btn btn-sm bg-navy" @click="onSearch()">
                              <i class="fas fa-search"></i>
                            </button>
                          </span>
                        </div>
                      </div>
                    </template>
                  </div>

                  <!-- Right: Sub-tabs -->
                  <ul class="cdv-subtabs">
                    <li :class="['cdv-subtab', { active: subTabSelected === 0 }]">
                      <a href="#" @click.prevent="onSubTabChange(0)">
                        <i class="fas fa-file-alt"></i> Detail
                      </a>
                    </li>
                    <li :class="['cdv-subtab', { active: subTabSelected === 1 }]">
                      <a href="#" @click.prevent="onSubTabChange(1)">
                        <i class="fas fa-random"></i> Flow
                      </a>
                    </li>
                    <li :class="['cdv-subtab', { active: subTabSelected === 2 }]">
                      <a href="#" @click.prevent="onSubTabChange(2)">
                        <i class="fas fa-sliders-h"></i> Config
                      </a>
                    </li>
                    <li :class="['cdv-subtab', { active: subTabSelected === 3 }]">
                      <a href="#" @click.prevent="onSubTabChange(3)">
                        <i class="fas fa-file-invoice"></i> Form
                      </a>
                    </li>
                    <li :class="['cdv-subtab', { active: subTabSelected === 4 }]">
                      <a href="#" @click.prevent="onSubTabChange(4)">
                        <i class="fas fa-tasks"></i> Project Data
                      </a>
                    </li>
                    <li :class="['cdv-subtab', { active: subTabSelected === 5 }]">
                      <a href="#" @click.prevent="onSubTabChange(5)">
                        <i class="fas fa-users"></i> Contact Person
                      </a>
                    </li>
                  </ul>
                </div>

                <!-- Sub-tab Content -->
                <div class="cdv-subcontent">
                  <!-- Detail -->
                  <div v-if="subTabSelected === 0">
                    <info-detail ref="infomation_detail"
                                 @send-data="isVaild()"
                                 @loading="loadingBox($event)"
                                 :data="sendToComponents('detail')"
                                 :formData="formData"
                                 :pre_event="queryString.pre_event"
                                 :customer_code="queryString.customer_code" />
                  </div>
                  <!-- Flow -->
                  <div v-if="subTabSelected === 1">
                    <info-flow ref="infomation_flow"
                               @loading="loadingBox($event)"
                               :customer_code="queryString.customer_code"
                               :search="search.text" />
                  </div>
                  <!-- Config -->
                  <div v-if="subTabSelected === 2">
                    <info-config ref="infomation_config"
                                 @loading="loadingBox($event)"
                                 :customer_code="queryString.customer_code"
                                 :search="search.text" />
                  </div>
                  <!-- Form -->
                  <div v-if="subTabSelected === 3">
                    <info-form ref="infomation_form"
                               @loading="loadingBox($event)"
                               :customer_code="queryString.customer_code"
                               :search="search.text" />
                  </div>
                  <!-- Project Data -->
                  <div v-if="subTabSelected === 4">
                    <div class="bg-boxfilterh" style="margin-bottom:10px">
                      <info-Project ref="infomation_Project"
                                    :customer_code="queryString.customer_code"
                                    :search="search.text" />
                    </div>
                  </div>
                  <!-- Contact Person -->
                  <div v-if="subTabSelected === 5">
                    <div class="bg-boxfilterh" style="margin-bottom:10px">
                      <info-Person ref="infomation_Person"
                                   :customer_code="queryString.customer_code"
                                   :pre_event="queryString.pre_event" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- TAB 2: Network and Server -->
              <div class="cdv-pane" :class="{ active: tabActive === 'tab2' }">
                <div class="cdv-scroll-content">
                  <network-server ref="network_server"
                                  @loading="loadingBox($event)"
                                  :customer_code="queryString.customer_code"
                                  :pre_event="queryString.pre_event"
                                  :old_password="old_password"
                                  :formData="formData" />
                </div>
              </div>

              <!-- TAB 3: Application -->
              <div class="cdv-pane" :class="{ active: tabActive === 'tab3' }">
                <div class="cdv-scroll-content">
                  <application ref="application_type"
                               :appTypeData="appTypeData"
                               :appListData="appListData"
                               :formDatax="formData" />
                </div>
              </div>

              <!-- TAB 4: Document -->
              <div class="cdv-pane" :class="{ active: tabActive === 'tab4' }">
                <div class="cdv-scroll-content">
                  <file-attach-v2 ref="attchAddFile"
                                  @uploaded="setAttachFile($event)"
                                  document-type="CSMDATA"
                                  :show-upload-file="true">
                  </file-attach-v2>
                </div>
              </div>

            </div>
          </div>

        </div>
        <!-- Input Attach File -->
        <input type="file" ref="myFile" name="myFile"
               accept=".doc, .docx, .xls, .xlsx, .txt, .ppt, .pptx, .pdf, .zip, .rar, .mp4, image/*"
               style="display:none;">
      </template>
    </re-page>
  </div>
</template>
<script>
  import infomation_detail from './components/v_csm_information_detail.vue'
  import infomation_flow from './components/v_csm_information_flow.vue'
  import infomation_config from './components/v_csm_information_config.vue'
  import infomation_form from './components/v_csm_information_form.vue'
  import network_server from './components/v_csm_networkandserver.vue'
  import application_type from './components/v_csm_application.vue'
  import infomation_Person from './components/v_csm_conPerson.vue'
  import infomation_Project from './components/v_csm_projectData.vue'
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let cpn = {
    components: {
      "info-detail": infomation_detail,
      "info-flow": infomation_flow,
      "info-config": infomation_config,
      "info-form": infomation_form,
      "network-server": network_server,
      "application": application_type,
      "info-Person": infomation_Person,
      "info-Project": infomation_Project,
    },
    data() {
      return {
        auth,
        ui: window.ui,
        queryString,
        baseUrl,
        xt: $xt,
        tabField: [
          { id: "tab1", text: 'Information', show: true, icon: "" },
          { id: "tab2", text: 'Network and Server', show: true, icon: "" },
          { id: "tab3", text: 'Application', show: true, icon: "" },
          { id: "tab4", text: 'Document', show: true, icon: "" },
        ],
        mainTabIcons: {
          tab1: 'fas fa-info-circle',
          tab2: 'fas fa-server',
          tab3: 'fas fa-cubes',
          tab4: 'fas fa-paperclip',
        },
        tabActive: "tab1",
        subTabSelected: 0,
        formData: {
          package_code: "",
          isDb: "N"
        },
        customer_code: "",
        pre_event: "",
        tabSelected: '',
        search: {},
        info: {},
        retrieveSearch: {},
        old_password: '',
        appListData: [],
        appTypeData: [],
        tabInfo_isEdit: false,
        attachFile: [],
      };
    },
    computed: {
      visibleTabs() {
        return this.tabField.filter(x => x.show);
      },
    },
    methods: {
      async loadRetrieve(customer_code, pre_event) {
        let url = `CSM/Data/CustomerDataViewRead?customer_code=${customer_code || this.customer_code}&pre_event=${pre_event || this.pre_event}`;
        let rsp = await $xt.getServer(url);

        if (rsp.data) {
          this.formData = rsp.data;
          this.tabInfo_isEdit = this.formData['cus_code'] ? true : false;
          this.old_password = rsp.data.user_pass;
          this.formData.db_type = rsp.data.db_type ?? "";
          this.formData.isDb = "Y";
          this.attachFile = rsp.f;
          this.formData.proj_name = rsp.data.proj_name;
          await this.$refs.attchAddFile.setDocumentDefault(rsp.f)
        }

        if (rsp.ar_cust != null) {
          this.formData.ref_cus_code = rsp.ar_cust.customer_code;
          this.formData.cus_name = rsp.ar_cust.customer_name;

          this.formData.tax_id = rsp.ar_cust.tax_id;
          this.formData.card_id = rsp.ar_cust.card_id;
          this.formData.address1 = rsp.ar_cust.address1;
          this.formData.address2 = rsp.ar_cust.address2;
          this.formData.address3 = rsp.ar_cust.address3;
          this.formData.contact = rsp.ar_cust.contact;
          this.formData.salename = rsp.ar_cust.salename;

          this.formData.userid = rsp.ar_cust.userid;
          this.formData.userpass = rsp.ar_cust.userpass;



        }
        this.appListData = rsp.app_list;
        this.appTypeData = rsp.app_type;

        page.pageTitle = `Detail : ${this.formData['cus_name']}`;
        document.title = page.pageTitle;
      },
      /*Tab*/
      onTabChange(t) {
        this.tabActive = t;
        this.subTabSelected = 0;
      },
      async onSubTabChange(t) {
        this.search = {};
        this.onSearch();
        this.subTabSelected = t;
        await $xt.sleep(500)
      },
      onSearch() {
        switch (this.subTabSelected) {
          //Flow
          case 1:
            this.$refs.infomation_flow.loadFlowData();
            break;
          //Config
          case 2:
            this.$refs.infomation_config.setNumberPage()
            this.$refs.infomation_config.loadCustConfig();
            break;
          //Form
          case 3:
            this.$refs.infomation_form.loadFormData();
            break;
          case 4:
            this.$refs.infomation_Project.loadProjectData()
            break;
        };
      },
      /*Create Passcode*/
      async createPassword() {
        let url = `CSM/Data/RandomKey?length=16`;
        let rsp = await $xt.getServer(url);
        this.formData.user_pass = rsp;
      },
      /*LoadData*/
      isDeveloper() {
        let department = auth.empcode.substring(0, 2);
        return department == 'IT' ||
          [
            'AD001',
            'AD002',
            'AD003',
            'AD004',
            'IMP003',
            'IMP004',
            'IT001',
            'PS007',
            'X0007',
            'AD011',
            'IMP016',
            'EX0001',
            'MG',
          ].includes(auth.empcode) || auth.emppos == 'P013';
      },
      /*Other*/
      sendToComponents(keyword) {
        switch (keyword) {
          case "detail":
            return {
              cus_code: this.formData.cus_code,
              ref_cus_code: this.formData.ref_cus_code,
              cus_name: this.formData.cus_name,
              ref_pre_event: this.formData.ref_pre_event,
              pre_des: this.formData.pre_des,
              warranty_start_dt: this.formData.warranty_start_dt || new Date(),
              warranty_end_dt: this.formData.warranty_end_dt || new Date(),
              tenant: this.formData.tenant,
              cloud_rent: this.formData.cloud_rent,
              ma_start_dt: this.formData.ma_start_dt || new Date(),
              ma_end_dt: this.formData.ma_start_dt || new Date(),
              package_code: this.formData.package_code,
              total_license: this.formData.total_license,
              unlimit_license: this.formData.unlimit_license,
              branch: this.formData.branch,
              multi_comp: this.formData.multi_comp,
              database_total: this.formData.database_total,
              db_type: this.formData.db_type,
              go_live: this.formData.go_live,
              user_pass: this.formData.user_pass,
              service_inactive: this.formData.service_inactive,
            }
          case "flow":
            return
          case "config":
            return
          case "form":
            return
        }
      },
      getData_fromComponents(e) {
        this.formData = e
      },
      loadingBox(status) {
        if (status == 'show') {
          this.$refs.page.loadingBox.show()
        } else {
          this.$refs.page.loadingBox.hide()
        }
      },
      async isVaild() {
        let has_error = false;
        let error_message = "<ul>";

        if ($xt.isEmpty(this.formData.cus_code)) {
          error_message += "<li>รหัสเข้าใช้งาน (Application)</li>";
          has_error = true;
          this.tabSelected = 'tab1';
        } else if ($xt.isEmpty(this.formData.user_pass)) {
          error_message += "<li>กรุณากดปุ่ม สร้างรหัสผ่าน</li>";
          has_error = true;
          this.tabSelected = 'tab1';
         }
       //  else if ($xt.isEmpty(this.formData.ref_pre_event)) {
        //             error_message += "<li>โครงการ</li>";
        //             has_error = true;
        //             this.tabSelected = 'tab1';
        //         }


        if (!$xt.isEmpty(this.formData.user_pass) && this.formData.user_pass != this.old_password) {
          if (!await $msg.confirm(`คุณได้ทำการเปลี่ยนแปลงรหัสผ่านเดิมที่ลูกค้าใช้เข้าสู่ระบบ CRM ซึ่งหากคุณต้องการเปลี่ยนแปลงรหัสผ่านใหม่ กรุณากดยืนยันเพื่อบันทึกข้อมูลและทำการแจ้งรหัสผ่านใหม่ให้ลูกค้ารับทราบด้วย`)) {
            return;
          }
          this.isSave();
          this.tabSelected = 'tab1';
          return;
        }
        error_message += "</ul>";
        if (has_error) {
          $msg.alert('คำเตือน', error_message, 'warning');
          return
        }
        this.isSave();
      },
      async isSave() {
        try {
          let form = {
            cus_active: this.formData.cus_active,
            cus_ma: this.formData.cus_ma,
            go_live: this.formData.go_live,
            cus_code: this.formData.cus_code,
            cus_name: this.formData.cus_name,
            user_id: this.formData.user_id,
            user_pass: this.formData.user_pass,
            ref_pre_event: this.formData.ref_pre_event,
            ref_cus_code: this.formData.ref_cus_code,
            cus_ma_remark1: this.formData.cus_ma_remark1,
            cus_ma_remark2: this.formData.cus_ma_remark2,
            cus_ma_remark3: this.formData.cus_ma_remark3,
            cus_ma_remark4: this.formData.cus_ma_remark4,
            cus_ma_remark5: this.formData.cus_ma_remark5,
            server_ip: this.formData.server_ip,
            cloud_bucket: this.formData.cloud_bucket,
            server_domain: this.formData.server_domain,
            server_username: this.formData.server_username,
            server_password: this.formData.server_password,
            server_ip_vpn: this.formData.server_ip_vpn,
            server_domain_vpn: this.formData.server_domain_vpn,
            server_username_vpn: this.formData.server_username_vpn,
            server_password_vpn: this.formData.server_password_vpn,
            remark_vpn: this.formData.remark_vpn,
            remark_server: this.formData.remark_server,
            username_meeting: this.formData.username_meeting,
            password_meeting: this.formData.password_meeting,
            user_license: this.formData.user_license,
            add_license: this.formData.add_license,
            total_license: this.formData.total_license,
            database_total: this.formData.database_total,
            multi_comp: this.formData.multi_comp,
            unlimit_license: this.formData.unlimit_license,
            ma_st: this.formData.ma_st,
            mrp_st: this.formData.mrp_st,
            rental_st: this.formData.rental_st,
            projplan_st: this.formData.projplan_st,
            projection_st: this.formData.projection_st,
            re_st: this.formData.re_st,
            saleorder_st: this.formData.saleorder_st,
            qcm_st: this.formData.qcm_st,
            evaluacation_st: this.formData.evaluacation_st,
            application_st: this.formData.application_st,
            db_type: this.formData.db_type,
            warranty_start_dt: this.formData.warranty_start_dt,
            warranty_end_dt: this.formData.warranty_end_dt,
            ma_start_dt: this.formData.ma_start_dt,
            ma_end_dt: this.formData.ma_end_dt,
            line_token: this.formData.line_token,
            db_name: this.formData.db_name,
            backup_ip: this.formData.backup_ip,
            backup_port: this.formData.backup_port,
            backup_path: this.formData.backup_path,
            backup_path2: this.formData.backup_path2,
            daily_backup_name: this.formData.daily_backup_name,
            hour_backup_name: this.formData.hour_backup_name,
            tenant: this.formData.tenant,
            package_code: this.formData.package_code,
            cloud_rent: this.formData.cloud_rent,
            auto_update: this.formData.auto_update,
            service_inactive: this.formData.service_inactive,
          };

          let dataList = this.$refs.application_type.getAppList()
          let result = []
          $linq(dataList).foreach(x => {
            let newObj = { ...x, ...form };
            result.push(newObj)
          });

          let url = '';
          if (this.tabInfo_isEdit) {
            url = 'CSM/Data/CustomerDataViewUpdate';
          } else {
            url = 'CSM/Data/CustomerDataViewCreate'
          }
          this.$refs.page.loadingBox.show()
          let rsp = await $xt.postServerJson(url, { detail: result, file: this.attachFile });
          if (!rsp.success) {
            throw rsp.error;
          }

          await this.autoPrintForm()

          this.loadRetrieve(this.queryString.customer_code, this.queryString.pre_event);
          $notify.success(this.ui.alert_save_success);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          this.$refs.page.loadingBox.hide()
        }
      },
      async addNew() {
        if ($xt.isEmpty(this.formData['cus_code'])) {
          $msg.alert('คำเตือน', 'ลูกค้ายังไม่มี Passcode <br/> ติดต่อทาง IT Support', 'warning');
          return
        }

        this.editMode = false;
        this.form = {
          customer_code: this.customer_code,
          pre_event: this.pre_event,
          license: this.formData.license || 0,
          add_license: this.formData.add_license || 0,
          tot_license: this.formData.tot_license || 0,
          total: this.formData.total || 0,
        };
        switch (this.subTabSelected) {
          //Flow
          case 1:
            this.$refs.infomation_flow.resetFlow()
            this.$refs.infomation_flow.$refs.attachAddFlow.clearFile()
            this.$refs.infomation_flow.$refs.FlowModal.openModal('show')
            this.$refs.infomation_flow.$refs.FlowModal.setSize('modal-xl')
            break;
          //Config
          case 2:
            this.$refs.infomation_config.resetConfig()
            this.$refs.infomation_config.loadERPConfig()
            this.$refs.infomation_config.$refs.configcode_paging.setCurrentPage(1)
            this.$refs.infomation_config.$refs.ConfigCodeModal.openModal('show')
            this.$refs.infomation_config.$refs.ConfigCodeModal.setSize('modal-xl')
            break;
          //Form
          case 3:
            this.$refs.infomation_form.resetForm()
            this.$refs.infomation_form.$refs.FormModal.openModal('show')
            this.$refs.infomation_form.$refs.FormModal.setSize('modal-xl')
            break;
          // Contact Person
          case 5:
            this.$refs.infomation_Person.appendContact()
            break;
        };
      },
      handle_save_data() {
        switch (this.subTabSelected) {
          case 5:
            this.$refs.infomation_Person.saveData()
            break;
          default:
            this.isVaild();
            break;
        }
      },
      addAppList() {
        this.$refs.application_type.addAppList()
      },
      async autoPrintForm() {
        page.loadingBox.show()
        try {
          let docno = this.queryString.customer_code
          let path = []
          let oth = {}
          let params = {
            cc_trn: 'csm_print_customer',
            cust_code: docno
          }

          let arr = ['CSM_CUST']
          oth = await $xt.findSelectFormPrint('CSM', docno, arr, params, true, auth.maincode)
          if (oth != null) path.push(oth.path)
          await $xt.mergeDocumentPath(path)
        }
        catch {
          await $msg.alert((this.ui.erp_error || 'System Error'), 'ระบบไม่สามารถพิมพ์เอกสารได้ กรุณาลองใหม่อีกครั้ง.', 'danger')
        }
        finally {
          page.loadingBox.hide()
          this.loadRetrieve(this.queryString.customer_code, this.queryString.pre_event);
        }
      },
      setAttachFile(e) {
        this.attachFile = e
      },
    },
    mounted() {
      page = this.$refs.page;

      if (!$xt.isEmpty(this.queryString.customer_code) && !$xt.isEmpty(this.queryString.pre_event)) {
        this.customer_code = this.queryString.customer_code;
        this.pre_event = this.queryString.pre_event;
        (async () => {
          await this.loadRetrieve(this.queryString.customer_code, this.queryString.pre_event);
        })();
      }
      if (!$xt.isEmpty(this.queryString.tabSelected)) {
        this.onTabChange(this.queryString.tabSelected);
      } else {
        this.onTabChange("tab1");
      }
    }
  };
  export default cpn;
</script>
<style scoped>
/* ============================================
   Customer Data View — Modern UX/UI
   ============================================ */

.cdv-wrapper {
  padding: 0;
}

/* ---- Main Card ---- */
.cdv-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* ---- Header: Main Tabs + Toolbar ---- */
.cdv-header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  background: linear-gradient(135deg, #1e2d4f 0%, #2c4a7a 100%);
  padding: 0 16px 0 0;
  flex-wrap: wrap;
  gap: 0;
}

.cdv-main-tabs {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  flex-wrap: wrap;
}

.cdv-main-tab {
  display: flex;
}

.cdv-main-tab a {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 13px 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
  white-space: nowrap;
}

.cdv-main-tab a:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.cdv-main-tab.active a {
  color: #fff;
  border-bottom-color: #4fc3f7;
  background: rgba(255, 255, 255, 0.1);
}

.cdv-tab-icon {
  font-size: 14px;
  opacity: 0.85;
}

/* ---- Toolbar ---- */
.cdv-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
}

.cdv-btn {
  border-radius: 6px !important;
  font-size: 12px !important;
  padding: 5px 12px !important;
  white-space: nowrap;
}

/* ---- Tab Content ---- */
.cdv-tab-content {
  background: #f8f9fc;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px - 50px);
  overflow: hidden;
}

.cdv-pane {
  display: none;
}

.cdv-pane.active {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding: 0;
}

/* tab1 มี subtab-bar fixed + scroll เฉพาะ subcontent */
.cdv-pane.active .cdv-subtab-bar {
  flex-shrink: 0;
}

.cdv-pane.active .cdv-subcontent {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

/* ---- Sub-tab Bar ---- */
.cdv-subtab-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e5e9f2;
  padding: 0 16px;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 48px;
}

.cdv-subtab-left {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  flex: 1;
  min-width: 0;
}

.cdv-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c4a7a;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.cdv-section-title i {
  color: #4a90d9;
}

.cdv-section-sub {
  font-size: 12px;
  color: #8c9ab0;
  font-weight: 400;
}

.cdv-inactive-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.cdv-search-group {
  width: 240px;
}

/* ---- Sub-tabs ---- */
.cdv-subtabs {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.cdv-subtab a {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 14px 14px;
  color: #6b7a99;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.cdv-subtab a:hover {
  color: #2c4a7a;
  border-bottom-color: #aac4e8;
}

.cdv-subtab.active a {
  color: #2c4a7a;
  border-bottom-color: #2c7be5;
  font-weight: 600;
}

.cdv-subtab a i {
  font-size: 12px;
}

/* ---- Sub Content ---- */
.cdv-subcontent {
  padding: 20px 24px;
}

/* ---- Scrollable content wrapper (tab2/3/4) ---- */
.cdv-scroll-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  height: 100%;
}
</style>
