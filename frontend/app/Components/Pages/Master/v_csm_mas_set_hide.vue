<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <app-form-2 ref="appForm">
          <template slot="extraBtn">

            <button v-if="headerTabSelected == 'header_tab1'"
                    class="btn btn-sm btn-primary"
                    @click.prevent="setNew()">
              <i class="fas fa-save"></i> Set Hide Emp.
            </button>

            <button v-if="headerTabSelected == 'header_tab2'"
                    class="btn btn-sm bg-orange"
                    @click.prevent="OpenModalColor()">
              <i class="fas fa-save"></i> Color Emp.
            </button>

          </template>

          <div class="nav-tabs-custom">
            <ul class="nav nav-tabs">
              <li v-for="(x,idx) in headerTab"
                  :key="`header-${idx}`"
                  :class="{'active': x.id == headerTabSelected}"
                  v-show="x.show">
                <a href="#" @click.prevent="clickTabSelected(x, 'header')">
                  <i class="fas" v-bind:class="xt.isEmpty(x.icon) ? 'fa-circle' : x.icon"></i> {{x.text}}
                </a>
              </li>
            </ul>
          </div>

          <template slot="form-detail">
            <div class="nav-tabs-custom">
              <ul class="nav nav-tabs">
                <li v-for="(x,idx) in headerTab" :key="idx" :class="{'active': x.id == headerTabSelected}">
                  <a href="#" @click.prevent="clickTabSelected(x, 'header')">
                    <i class="fas" :class="x.icon"></i> {{x.text}}
                  </a>
                </li>
              </ul>

              <div class="tab-content">
                <div class="box-header with-border">
                  <div class="row d-flex">
                    <div class="col-md-3">
                      <div class="form-group">
                        <label>Search By</label>
                        <select class="form-control input-sm" v-model="searchData.search_field">
                          <option value="empname_t">Employee Name</option>
                          <option value="page_name">Page Name</option>
                          <option value="column_name">Column Name</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-group">
                        <label>Search</label>
                        <div class="input-group">
                          <input type="text" class="form-control input-sm" v-model="searchData.search_text" @keyup.enter="doSearch()" />
                          <span class="input-group-btn">
                            <button class="btn btn-sm bg-navy" @click.prevent="doSearch()"><i class="fas fa-search"></i></button>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-2">
                      <div class="form-group">
                        <label>&nbsp;</label>
                        <div class="form-check form-switch form-check-custom form-check-solid form-check-sm me-5">
                          <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="searchData.active" @change="doSearch()" />
                          <label v-if="headerTabSelected == 'header_tab1'" class="form-check-label">Hide</label>
                          <label v-else class="form-check-label">Active</label>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <span class="pull-right margin-t-25">(จำนวนข้อมูลทั้งหมด {{ requestCodeTotal || 0 }} รายการ)</span>
                    </div>
                  </div>
                </div>

                <div class="tab-pane" :class="{'active': headerTabSelected == 'header_tab1'}">
                  <ag-table ref="agr" :footer="false" @cell-clicked="onCellClicked" @ready="initTable()"></ag-table>
                </div>

                <div class="tab-pane" :class="{'active': headerTabSelected == 'header_tab2'}">
                  <ag-table ref="agrColor" :footer="false" @cell-clicked="onCellClicked" @ready="initTable()"></ag-table>
                </div>

                <div class="row">
                  <div class="col-lg-12">
                    <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </app-form-2>
      </template>
    </re-page>
    <modal-3 ref="formModal">
      <template #header>
        <h4><i class="fa fa-edit">  {{ !isEdit ? 'Add Set Hide Column' : 'Edit Set Hide Column' }} </i></h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-lg-4 col-md-4 col-sm-4">
            <div class="form-group">
              <label>Employee Code</label>
              <span class="input-group">
                <input type="text" class="form-control input-sm" v-model="form['empcode']" readonly />
                <span class="input-group-btn">
                  <button class="btn btn-sm bg-navy" @click="ModalSelected('emp')" :disabled="isEdit"><i class="fa fa-search"></i></button>
                  <button class="btn btn-sm btn-danger" @click="clearData(form, ['empcode', 'empno','empname_t'])" :disabled="isEdit"><i class="fa fa-close"></i></button>
                </span>
              </span>
            </div>
          </div>
          <div class="col-lg-4 col-md-4 col-sm-4">
            <div class="form-group">
              <label>Employee Name</label>
              <input type="text" class="form-control input-sm" v-model="form['empname_t']" readonly />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-4 col-md-4 col-sm-4">
            <div class="form-group">
              <label>Page Code</label>
              <span class="input-group">
                <input type="text" class="form-control input-sm" v-model="form['page_name']" :disabled="isEdit" />
                <span class="input-group-btn">
                  <button class="btn btn-sm bg-navy" @click="ModalSelected('menucsm')" :disabled="isEdit"><i class="fa fa-search"></i></button>
                  <button class="btn btn-sm btn-danger" @click="clearData(form, ['remark', 'page_name'])" :disabled="isEdit"><i class="fa fa-close"></i></button>
                </span>
              </span>
            </div>
          </div>
          <div class="col-lg-4 col-md-4 col-sm-4">
            <div class="form-group">
              <label>Page Name</label>
              <input v-if="!isEdit" type="text" class="form-control input-sm" v-model="form['remark']" readonly />
              <input v-else type="text" class="form-control input-sm" v-model="form['menu_text']" readonly />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-3 col-md-4 col-sm-4">
            <div class="form-group">
              <label class="text-danger" v-text="ui.erp_doctype || 'Doc Type'"></label>
              <select class="form-control input-sm" v-model="form['doctype']" :disabled="isEdit">
                <option value="TSCSM" selected>Transaction</option>
                <option value="RTCSM">Report</option>
                <option value="MSCSM">Master</option>
              </select>
            </div>
          </div>
          <div class="col-lg-4 col-md-4 col-sm-4">
            <div class="form-group">
              <label>Column Name</label>
              <span class="input-group">
                <input type="text" class="form-control input-sm" v-model="form['column_name']" :disabled="isEdit" />
                <span class="input-group-btn">
                  <button class="btn btn-sm bg-navy" @click="ModalSelected('column_name')" :disabled="isEdit"><i class="fa fa-search"></i></button>
                  <button class="btn btn-sm btn-danger" @click="clearData(form, ['column_name'])" :disabled="isEdit"><i class="fa fa-close"></i></button>
                </span>
              </span>
            </div>
          </div>
          <div class="col-lg-1 col-md-1 col-md-1">
            <div class="d-flex margin-t-25">
              <div class="form-check form-check-custom form-check-solid form-check-sm">
                <input class="form-check-input" type="checkbox" v-model="form['hides']" true-value="Y" false-value="N" />
                <label class="form-check-label"><span>Hide</span></label>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-sm btn-success" @click.prevent="beforeSave('column')">
          <i class="fas fa-save"></i><span v-text="ui.save || 'Save Document'"></span>
        </button>
      </template>
    </modal-3>

    <!--Set Color Employee-->
    <modal-3 ref="formModalColor">
      <template #header>
        <h4><i class="fa fa-edit">  {{ !isEdit ? 'Add Set Color' : 'Edit Set Color' }} </i></h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-lg-4 col-md-4 col-sm-4">
            <div class="form-group">
              <label>Employee Code</label>
              <span class="input-group">
                <input type="text" class="form-control input-sm" v-model="form['empcode']" readonly />
                <span class="input-group-btn">
                  <button class="btn btn-sm bg-navy" @click.prevent="ModalSelected('emp')" :disabled="isEdit"><i class="fa fa-search"></i></button>
                  <button class="btn btn-sm btn-danger" @click.prevent="clearData(form, ['empcode', 'empno','empname_t'])" :disabled="isEdit"><i class="fa fa-close"></i></button>
                </span>
              </span>
            </div>
          </div>
          <div class="col-lg-4 col-md-4 col-sm-4">
            <div class="form-group">
              <label>Employee Name</label>
              <input type="text" class="form-control input-sm" v-model="form['empname_t']" readonly />
            </div>
          </div>
          <div class="col-lg-1 col-md-1 col-md-1">
            <div class="d-flex margin-t-25">
              <div class="form-check form-check-custom form-check-solid form-check-sm">
                <input class="form-check-input" type="checkbox" v-model="form['hides']" true-value="Y" false-value="N" />
                <label class="form-check-label"><span>Active</span></label>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <label style="margin-left: 15px;">Colors</label><br>
          <div class="col-md-4">
            <color-panel v-model="form['column_name']"></color-panel>
          </div>
          <div class="col-md-8">
            <h5 class="text-decoration-underline" v-text="ui.erp_mas_bd_mas400_testing_text_color || 'Testing Text Color'"></h5>
            <p v-bind:style="{'color': form.column_name}">The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex. Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! "Now fax quiz Jack!" my brave</p>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-sm btn-success" @click.prevent="beforeSave('color')">
          <i class="fas fa-save"></i><span v-text="ui.save || 'Save Document'"></span>
        </button>
      </template>
    </modal-3>
    <!--Set Color Employee-->
    <modal-3 ref="add_column">
      <template #header>
        <h4><i class="fa fa-edit"> {{ 'Add Spec column' }} </i></h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-12">
            <div class="table-responsive">
              <table class="table table-bordered table-striped table-hover">
                <thead>
                  <tr>
                    <th class="tf-3">Module</th>
                    <th class="tf-5">Object Name</th>
                    <th class="tf-3">Column Name</th>
                    <th>Event Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(x,idx) in m_column" style="cursor:pointer" @click.prevent="sendComponent(x ,'column')">
                    <td>{{ x.module }}</td>
                    <td>{{ x.object_name }}</td>
                    <td>{{ x.column_name }}</td>
                    <td>{{ x.event_type }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-sm btn-default" @click.prevent="closeModal()"><i class="fa fa-remove"></i> ปิดหน้าต่าง</button>
      </template>
    </modal-3>
    <!--Menu CSM-->
    <modal-3 ref="menucsm">
      <template #header>
        <h4><i class="fa fa-edit"> {{ 'Page Menu' }} </i></h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-12">
            <div class="table-responsive">
              <table class="table table-bordered table-striped table-hover">
                <thead>
                  <tr>
                    <th class="tf-3">No.</th>
                    <th class="tf-3">Module</th>
                    <th class="tf-5">Page Code</th>
                    <th class="tf-5">Page Name</th>

                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(x,idx) in n_menu" style="cursor:pointer" @click.prevent="sendComponent(x ,'menucsm')">
                    <td>{{ idx+1 }}</td>
                    <td>{{ x.webmodule }}</td>
                    <td>{{ x.page_name }}</td>
                    <td>{{ x.remark }}</td>
                  
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-sm btn-default" @click.prevent="closeModal1()"><i class="fa fa-remove"></i> ปิดหน้าต่าง</button>
      </template>
    </modal-3>
    <!--center modal-->
    <vue-employee-list ref="ct_emp" @send-data="sendComponent($event, 'emp')"></vue-employee-list>
    <vue-addspec-rpt ref="ct_addspec" @send-data="sendComponent($event ,'addsp')"></vue-addspec-rpt>

  </div>
</template>
<script type="text/javascript">
  import { mapState, mapGetters } from '~/stores/helpers'
  let page = {};
  let paging = {};
  let appForm = {};

  let cpn = {
    data() {
      return {
        auth,
        xt: $xt,
        pageNumber: 1,
        form: {
          empno: null,
          empname_t: null,
          empcode: null,
          remark: null,
          page_name: null,
          doctype: 'MSCSM',
          column_name: null,
          hides: 'N',
          module_t: null
        },
        ui: window.ui,
        display: [],
        xt: $xt,
        isEdit: false,
        requestCodeTotal: [],
        searchData: {
          active: 'Y',
          search_text: '',
          search_field:'page_name'
        },
        fileName: null,
        infoFile: {},
        moduleForMango: moduleCodeData,
        platformCodeData,
        newPlatformCodeData: [],
        pg_lists: [],
        type_pg: [],
        moduleList: [],
        m_column: [],
        n_menu: [],
        headerTab: [
          { id: 'header_tab1', icon: 'fa-folder-open', text:'Hide Column', show: true, total: 0 },
          { id: 'header_tab2', icon: 'fa-folder-plus', text:'Set Color', show: true, total: 0 },
        ],
        headerTabSelected: 'header_tab1',
      };
    },
    methods: {
      async pageChange(pn) {
        this.page_number = pn
        paging.setCurrentPage(pn)
        await this.loadData()
      },
      doSearch() {
        paging.setCurrentPage(1);
        this.loadData();
      },
      resetData() {
        this.isEdit = false;
        this.form = {
          empno: null,
          empname_t: null,
          empcode: null,
          remark: null,
          page_name: null,
          doctype: 'MSCSM',
          column_name: null,
          hides: 'Y'
        };
      },
      setNew() {
        this.resetData();
        this.$refs.formModal.openModal();
      },
      async setEdit(x) {
        this.isEdit = true;
        this.form = { ...x };
        this.$refs.formModal.openModal();
      },
      async setEditColor(x) {
        this.isEdit = true;
        this.form = { ...x };
        this.$refs.formModalColor.openModal();
      },
      async loadData() {
        try {
          page.loadingBox.show();
          let act = `CSM/Config/ReadList?active=${encodeURIComponent(this.searchData.active)}&field=${encodeURIComponent(this.searchData.search_field)}&text=${encodeURIComponent(this.searchData.search_text)}`;
          let rsp = await $xt.getServer(act);
          let rawData = rsp.data || [];
          if (this.headerTabSelected === 'header_tab1') {
            this.pg_lists = rawData.filter(x => x.type !== 'color');
            if (this.$refs.agr) this.$refs.agr.setDisplay(this.pg_lists);
          } else {
            this.pg_lists = rawData.filter(x => x.type === 'color');
            if (this.$refs.agrColor) this.$refs.agrColor.setDisplay(this.pg_lists);
          }
          this.requestCodeTotal = this.pg_lists.length;
          paging.setTotalItems(this.requestCodeTotal);
          paging.createPagesArray();

        } catch (error) {
          $msg.alert(``, error.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      beforeSave(f) {
        switch (f) {
          case 'column':
            if (!this.form.empno) {
              $msg.alert('', 'กรุณาเลือกพนักงาน', 'warning');
              return;
            }
            if (!this.form.page_name) {
              $msg.alert('', 'กรุณาเลือก Page Name ', 'warning');
              return;
            }
            if (!this.form.column_name) {
              $msg.alert('', 'กรุณากรอกชื่อ Column', 'warning');
              return;
            }
            this.onSave();
            break
          case 'color':
            if (!this.form.empno) {
              $msg.alert('', 'กรุณาเลือกพนักงาน', 'warning');
              return;
            }

            this.onSaveColor();
            break
        }
      },
      async onSave() {
        try {
          page.loadingBox.show();
          const payload = {
            data: this.form
          };

          console.log('payload column', payload);


          let act = this.isEdit
            ? 'CSM/Config/Update_column'
            : 'CSM/Config/Create_column';


          console.log('act', act, 'sss this.isEdit', this.isEdit);
          let rsp = await $xt.postServerJson(act, payload);

          if (!rsp.success) {
            throw rsp.error;
          }

          $msg.alert('Success', 'Your information has been saved successfully.', 'success');
          this.$refs.formModal.closeModal();
          this.resetData();
         await this.loadData();

        } catch (ex) {
          $msg.alert('', ex.toString(), 'danger');
        } finally {
          page.loadingBox.hide();
        }
      },
      async onSaveColor() {
        try {
          page.loadingBox.show();
          const payload = {
            data: this.form
          };

          console.log('payload color', payload);
          // return;
          //  return; // ใช้ debug ได้

          let act = this.isEdit
            ? 'CSM/Config/Update_color'
            : 'CSM/Config/Create_Color';

          let rsp = await $xt.postServerJson(act, payload);

          if (!rsp.success) {
            throw rsp.error;
          }



          $msg.alert('Success', 'Your information has been saved successfully.', 'success');
          this.$refs.formModalColor.closeModal();
          this.resetData();
           await this.loadData();

        } catch (ex) {
          $msg.alert('', ex.toString(), 'danger');
        } finally {
          page.loadingBox.hide();
        }
      },
      async onDeleteData(x) {
        const confirmMsg = x.type === 'color'
          ? `Do you want to delete this Color of ${x.empname_t}?`
          : `Do you want to delete this Column Name: ${x.column_name} of ${x.empname_t}?`;
        if (!await $msg.confirm(confirmMsg)) {
          return;
        }
        try {
          page.loadingBox.show();
          let f = {
            form: x
          };

          let act = `CSM/Config/SET_Delete`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          await this.loadData();
          $notify.success(ui.alert_save_success)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async initTable() {
        // ใช้ Logic เดิมในการสร้าง Header [cite: 101-113]
        const fields = [
          ["no_", "No.", "text", { width: 100, align: "center" }],
          ['', 'Action', 'text', {
            width: 100, child: [
              ["edit_", "Edit", "text", { align: "center", cellRenderer: () => `<i class="fas fa-edit edit" style="cursor:pointer"></i>` }],
              ["del_", "Delete", "text", { align: "center", cellRenderer: () => `<i class="fas fa-trash-alt delete" style="cursor:pointer;color:red"></i>` }]
            ]
          }],
          ["empno", "Employee No.", "text", { width: 150, align: "center" }],
          ["empname_t", "Employee Name", "text", { width: 200 }],
        ];

        const columnField = [
          ["page_name", "Page Code", "text", { width: 250 }],
          ["menu_text", "Page Name", "text", { width: 250 }],
          ["column_name", "Column", "text", { width: 300 }]
        ];
        const colorField = ["column_name", "Color", "text", {
          width: 150,
          cellRenderer: (p) => `<span class="badge" style="background-color:${p.value}">${p.value}</span>`
        }];

        const changeField = [
          ["adduser", "Add By", "text", { width: 150}],
          ["add_dt", "Add Date", "datetime", { width: 150, align: "center"}, { useCellRenderer: true }],
          ["edituser", "Edit By", "text", { width: 150 }],
          ["edit_dt", "Edit Date", "datetime", { width: 150, align: "center"}, { useCellRenderer: true }],
        ];

        const hideField = ["hides", "Hide", "text", { width: 120, align: "center",
          cellRenderer: (params) => params.value === 'Y'
            ? `<span style="color:#00c116;">Yes</span>`
            : `<span style="color:#ff0000;">No</span>`
        }];

        const activeField = ["hides", "Active", "text", { width: 120, align: "center",
          cellRenderer: (params) => params.value === 'Y'
            ? `<span style="color:#00c116;">Yes</span>`
            : `<span style="color:#ff0000;">No</span>`
        }];

        if (this.$refs.agr) {
          this.$refs.agr.setHeader(this.$refs.agr.createHeaderFromArray([...fields, ...columnField, ...changeField, hideField]));
        }
        if (this.$refs.agrColor) {
          this.$refs.agrColor.setHeader(this.$refs.agrColor.createHeaderFromArray([...fields, colorField, ...changeField, activeField]));
        }
      },
      is_mango() {
        let isMango = $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault();
        return isMango == "Y" ? true : false;
      },
      permission() {
        let data = (!this.is_mango() || auth.is_admin);
        return data;
      },
      createPdfData() {
        return this.$refs.agr.createPdfData();
      },
      ModalSelected(gf) {
        switch (gf) {
          case 'addsp':
            this.$refs.ct_addspec.openModal()
            break
          case 'emp':
            this.$refs.ct_emp.openModal()
            break
          case 'column_name':
            this.addspec_column_center(this.form.page_name)
            this.$refs.add_column.openModal()
            break
          case 'menucsm':
            this.readlist_menu_csm(this.form.page_name)
            this.$refs.menucsm.openModal()
            break
        }
      },
      clearData(data, field) {
        $linq(field).foreach(x => data[x] = null)
        this.$eventBus.$emit('reload-history')
      },
      async sendComponent(e, type) {
        switch (type) {
          case 'addsp':
            this.form.remark = e.remark
            this.form.page_name = e.object_name

            break
          case 'emp':
            this.form.empno = e.empno
            this.form.empname_t = e.empfullname
            this.form.empcode = e.empcode
            break
          case 'column':
            this.form.column_name = e.column_name
        
            this.closeModal()
            break
          case 'menucsm':
            this.form.page_name = e.page_name
            this.form.remark = e.remark
        
            this.closeModal1()
            break
        }
      },
      OpenModalColor() {
        this.resetData();
        this.form.doctype = 'COCSM'
        this.form.page_name = 'all_csm'
        this.$refs.formModalColor.openModal()
      },
      async addspec_column_center(x) {
        let act = `CSM/Center/addspec_column_center?object_name=${x}`
        let resp = await $xt.getServer(act)
        this.m_column = resp.data
      },
      async readlist_menu_csm(x) {
        let act = `CSM/Center/readlist_menu_csm`
        let resp = await $xt.getServer(act)
        this.n_menu = resp.data
      },
      closeModal() {
        this.$refs.add_column.closeModal()
      },
      closeModal1() {
        this.$refs.menucsm.closeModal()
      },
      onCellClicked(e) {
        switch (e.col) {
          case 'edit_':
            if (e.data.type == 'color')
            {
              this.setEditColor(e.data);
            }
            else
            {
              this.setEdit(e.data);
            }
            break;
          case 'del_':
            this.onDeleteData(e.data);
            break;
          default:
            break;
        }
      },
      clickTabSelected(x, keyword) {
        if (keyword === 'header') {
          this.headerTabSelected = x.id; // [cite: 130]
          this.searchData.active = 'Y';
          this.doSearch(); // โหลดข้อมูลใหม่เมื่อสลับ Tab
        }
      },

    },
    computed: {
      configData() { return store.state.configData },
      ...mapState(['connectionCodeData', 'requestCodeData', 'priorityCodeData', 'serviceCodeData', 'configData', 'config', 'activeconfig', 'configReadlist']),
    },
    async mounted() {
      page = this.$refs.page;
      page.pageTitle = 'Setup : Set Access Rights (Hide Columns , Color)';
      document.title = page.pageTitle;

      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(500);

      appForm = this.$refs.appForm
      appForm.btnDelete.show = false
      appForm.btnSave.show = false
      appForm.btnNew.click = false
      appForm.btnNew.show = false
      appForm.btnImport.click = false
      appForm.btnImport.show = false
      appForm.btnExportClick.show = false
      appForm.btnExport.show = false

      this.clickTabSelected({ id: 'header_tab1' }, 'header')

         this.resetData();
         this.loadData();
  
    }
  };

  export default cpn;
</script>
<style scoped>
  .action-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px; /* ระยะห่าง icon */
  }

  .action-icon {
    cursor: pointer;
    font-size: 16px;
  }

    .action-icon.edit {
      color: #000; /* ดำ */
    }

    .action-icon.delete {
      color: #ff4d4f; /* แดง */
    }

  .module-scroll {
    max-height: 500px; /* ปรับความสูงตามต้องการ */
    overflow-y: auto;
    border: 1px solid #ddd;
  }
  .dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: inline-block;
  }

</style>
