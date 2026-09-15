<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="nav-tabs-custom">
          <ul class="nav nav-tabs">
            <li :class="{active: x.id===tabActive}" v-for="x in tabField" v-if="x.show">
              <a href="#" @click.prevent="onTabChange(x.id)"><i class="fas" v-bind:class="xt.isEmpty(x.icon) ? 'fa-circle' : x.icon"></i> <span v-text="x.text"></span></a>
            </li>
            <li class="pull-right">
              <div v-if="tabActive == 1">
                <button class="btn btn-sm btn-primary" v-on:click="checkNewItems()"><i class="fa fa-plus"></i> ทำรายการใหม่</button>
                <button class="btn btn-sm bg-olive" @click.prevent="save()"><i class="fa fa-save"></i> บันทึกข้อมูล</button>
              </div>
            </li>
          </ul>
          <div class="tab-content">
            <!-- Tab 1 : Passcode -->
            <div class="tab-pane" v-bind:class="{active: tabActive===0}">
              <div class="row">
                <div class="col-md-3">
                  <div class="form-group">
                    <label v-text="ui.search || 'ค้นหา'"></label>
                    <div class="input-group">
                      <input type="text" class="form-control input-sm" v-model="retrieveSearch.text" @keyup.enter="onSearchRetrieve()" />
                      <span class="input-group-btn">
                        <button class="btn btn-sm bg-navy" @click.prevent="onSearchRetrieve()"><i class="fa fa-search"></i></button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Table : Passcode -->
              <div class="row">
                <div class="col-md-12">
                  <ag-table ref="agr"
                            :scale="300"
                            :footer="false"
                            @ready="initTable()"
                            :saveColumns="'Y'"
                            :doctype="'DBLIST'"
                            :page_name="'v_csm_db_list'"></ag-table>
                </div>
              </div>
              <div class="row margin-t-5">
                <div class="col-md-12">
                  <pagination class="pull-left" ref="retrieve_paging" @page-change="pageChange($event.page, 'Retrieve')"></pagination>
                </div>
              </div>
            </div>
            <!-- Tab 2 : Create Passcode -->
            <div class="tab-pane" v-bind:class="{active: tabActive===1}">
              <div class="row">
                <div class="col-md-2">
                  <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(formData.customer_code)}">
                    <label class="text-danger">Customer Code</label>
                    <input type="text" class="form-control input-sm" v-model.trim="formData.customer_code" v-bind:disabled="isEdit">
                  </div>

                  <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(formData.customer_code)}">
                    <label class="text-danger" v-text="ui.customer || 'Customer'"></label>
                    <span class="input-group">
                      <input type="text" class="form-control input-sm text-bold" v-model="formData.customer_code" readonly />
                      <span class="input-group-btn">
                        <button class="btn btn-sm bg-navy" @click="openCustomerModal()"><i class="fa fa-search"></i></button>
                      </span>
                    </span>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="form-group">
                    <label>Application Type</label>
                    <select class="form-control input-sm" v-model="formData.app_type" v-bind:disabled="isEdit">
                      <option value="PM">Project Status Overview</option>
                      <option value="AUTO_BILL">Auto Create Document Bill Subc. (Progress)</option>
                      <option value="AUTO_RETENTION"> Auto Create Document Bill Subc. (Retention)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-2">
                  <div class="form-group">
                    <label>Production Type</label>
                    <select class="form-control input-sm" v-model="formData.prod_type" v-bind:disabled="isEdit">
                      <option value="DEMO">Demo</option>
                      <option value="TRAIN">Tranning</option>
                      <option value="PROD">Production</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="form-group">
                    <label>Time Schedule</label>
                    <timepicker v-model.trim="formData.action_time" format="HH:mm"></timepicker>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-2">
                  <div class="form-group">
                    <label>Active</label>
                    <select class="form-control input-sm" v-model="formData.active">
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="form-group">
                    <label>Endpoint URL</label>
                    <input type="text" class="form-control input-sm" v-model.trim="formData.endpoint_url">
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="form-group">
                    <label>Remark</label>
                    <input type="text" class="form-control input-sm" v-model.trim="formData.remark">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </re-page>

    <vue-cm-customer-list ref="customer" @send-data="sendComponent($event, 'customer')"></vue-cm-customer-list>
  </div>
</template>

<script type="text/javascript">
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } }
  let retrieve_paging = {}
  let paging = {}
  let process = false
  let cpn = {
    data() {
      return {
        auth,
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        xt: $xt,
        passcodeListData: [],
        datalist: [],
        pageNumber: 1,
        retrieveSearch: {},
        formData: {
          prod_type: 'DEMO',
          active: 'N',
          app_type: 'PM'
        },
        appListData: [],
        appTypeData: [],
        isEdit: false,
        tabField: [
          { id: 0, text: 'รายการข้อมูล', show: true, icon: '' },
          { id: 1, text: 'เพิ่ม/แก้ไขข้อมูล', show: true, icon: '' },
        ],
        tabActive: 0,
      }
    },
    methods: {
      showAppList() {
        return $linq(this.appListData).toArray()
      },
      pageChange(pn, keyword) {
        switch (keyword) {
          case 'Retrieve':
            pn = pn || 1;
            this.pageNumber = pn;
            retrieve_paging.setCurrentPage(pn);

            // Client-side pagination - slice data from datalist
            let displayData = $linq(this.datalist).skip(retrieve_paging.skipItems()).take(retrieve_paging.getItemsPerPage()).toArray();

            retrieve_paging.createPagesArray();

            // Update ag-table display
            this.$nextTick(() => {
              let agr = this.$refs.agr;
              if (agr) {
                agr.setDisplay(displayData);
              }
            });
            break;
        }
      },
      newItems() {
        this.isEdit = false
        this.formData = {}
        this.appListData = []
      },
      checkNewItems() {
        if (this.isEdit) {
          $confirm('คุณต้องสร้างรายการใหม่ใช่หรือไม่', () => {
            this.newItems()
          })
        } else {
          this.newItems()
        }
      },
      onTabChange(t) {
        this.tabActive = t
      },
      reset() {
        (async () => {
          this.isEdit = false
          this.formData = {
            customer_code: '',
            action_time: '',
            endpoint_url: '',
            remark: '',
            active: 'N',
            prod_type: 'DEMO',
            app_type: 'PM'
          }
        })()
      },
      onSearchRetrieve() {
        this.pageChange(1, 'Retrieve');
      },
      async editData(x) {
        this.tabActive = 1
        this.isEdit = true
        $linq(this.tabData).where(x => x.id == 'tab2').foreach(x => x.show = true)
        this.tabSelected = 'tab2'

        let ac = `CSM/Tools/DBList_Read?itemno=${x.itemno}&customer_code=${x.customer_code}`
        let rsp = await $xt.getServer(ac)
        this.formData = rsp
      },
      async loadData() {
        let act = `CSM/Tools/DBList_ReadList?search_text=${encodeURIComponent(this.retrieveSearch.text || '')}`;
        let rsp = await $xt.getServer(act);
        this.appTypeData = rsp.app_type;

        let i = 0;
        $linq(rsp.data).foreach(x => {
          x.checked = false;
          x.item = ++i;
        });
        this.datalist = rsp.data;
        this.passcodeListData = rsp.data;

        retrieve_paging.setTotalItems(rsp.total);
        if (!retrieve_paging.getItemsPerPage()) {
          retrieve_paging.setCurrentPage(1);
        }
        retrieve_paging.createPagesArray();

        // Display first page
        this.pageChange(1, 'Retrieve');

        await this.$nextTick();
        await this.initTable();
      },
      async onDel(x) {
        try {
          let f = {
            header: x
          }

          if (!await $msg.confirm(`ท่านต้องการจะลบ Customer Code : ${x.customer_code} ใช่หรือไม่ ?`)) {
            return
          }

          let url = `CSM/Tools/DBList_Delete`
          let rsp = await $xt.postServerJson(url, f)
          if (!rsp.success) {
            $msg.alert(`เกิดข้อผิดพลาด`, rsp.error, `danger`)
            return
          }
          $notify.success(this.ui.alert_delete_success)
          this.formData = {
            prod_type: 'DEMO',
            active: 'N'
          }

          await this.loadData()

        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          process = false
          page.loadingBox.hide()
        }
      },
      async save() {
        if (process) return

        try {
          let f = {
            header: this.formData
          }

          let act = `CSM/Tools/DBList_Create`

          if (this.isEdit) {
            act = `CSM/Tools/DBList_Update`
          }

          page.loadingBox.show()
          let rsp = await $xt.postServerJson(act, f)
          if (!rsp.success) {
            throw rsp.error
          }

          //await this.readData(rsp.data)
          await this.loadData()

          $notify.success(this.ui.alert_save_success)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          process = false
          page.loadingBox.hide()
        }
        this.reset()
      },
      openCustomerModal() {
        this.$refs.customer.openModal()
      },
      async sendComponent(e, type) {
        switch (type) {
          case 'cm_customer':
            this.formData.customer_code = e.customer_code
            break
        }
      },
      statusName(value) {
        return value == 'Y' ? 'Yes' : 'No';
      },
      async initTable() {
        let agr = this.$refs.agr;
        if (!agr) return;

        let self = this;

        let fields = [
          ["manage", "Action", "text", {
            width: 90,
            align: "center",
            pinned: 'left',
            cellRenderer: (params) => {
              let x = params.data;
              let editBtn = `<a href="#" class="btn-edit-row text-black" style="margin-right: 8px;" data-itemno="${x.itemno}" data-custcode="${x.customer_code}"><i class="fa fa-edit"></i></a>`;
              let delBtn = `<a href="#" class="btn-del-row text-danger" data-itemno="${x.itemno}" data-custcode="${x.customer_code}"><i class="fa fa-trash"></i></a>`;
              return editBtn + delBtn;
            },
          }],
          ["itemno", "Item No.", "text", { width: 90, align: "center", sortable: true }],
          ["customer_code", "Customer Code", "text", { width: 150, align: "left", sortable: true, pinned: 'left', cellStyle: { "font-weight": "bold" } }],
          ["app_type", "Application Type", "text", { width: 160, align: "center", sortable: true }],
          ["prod_type", "Production Type", "text", { width: 150, align: "center", sortable: true }],
          ["action_time", "Time Schedule", "datetime", { width: 160, align: "center", sortable: true }, { useCellRenderer: true }],
          ["endpoint_url", "Endpoint URL", "text", { width: 280, align: "left", sortable: true }],
          ["remark", "Remark", "text", { width: 200, align: "left", sortable: true }],
          ["active", "Active", "text", {
            width: 90,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              let value = params.value;
              let text = self.statusName(value);
              let className = value == 'Y' ? 'text-success' : 'text-danger';
              return `<span class="${className}">${text}</span>`;
            }
          }],
          ["adduser", "Add User", "text", { width: 130, align: "center", sortable: true }],
          ["adddate", "Add Date", "datetime", { width: 160, align: "center", sortable: true }, { useCellRenderer: true }],
          ["edituser", "Edit User", "text", { width: 130, align: "center", sortable: true }],
          ["editdate", "Edit Date", "datetime", { width: 160, align: "center", sortable: true }, { useCellRenderer: true }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);

        // Add click events using event delegation
        this.$nextTick(() => {
          $(document).off('click', '.btn-edit-row');
          $(document).off('click', '.btn-del-row');

          $(document).on('click', '.btn-edit-row', function(e) {
            e.preventDefault();
            let itemno = $(this).data('itemno');
            let custcode = $(this).data('custcode');
            let rowData = $linq(self.datalist).where(x => x.itemno == itemno && x.customer_code == custcode).firstOrDefault();
            if (rowData) {
              self.editData(rowData);
            }
          });

          $(document).on('click', '.btn-del-row', function(e) {
            e.preventDefault();
            let itemno = $(this).data('itemno');
            let custcode = $(this).data('custcode');
            let rowData = $linq(self.datalist).where(x => x.itemno == itemno && x.customer_code == custcode).firstOrDefault();
            if (rowData) {
              self.onDel(rowData);
            }
          });
        });
      },
    },
    mounted() {
      page = this.$refs.page
      page.pageTitle = 'IT : Database List'
      document.title = page.pageTitle

      retrieve_paging = this.$refs.retrieve_paging
      retrieve_paging.setCurrentPage(1)
      retrieve_paging.setItemsPerPage(10)

      this.loadData()
    },
    beforeUnmount() {
      // Clean up event listeners
      $(document).off('click', '.btn-edit-row');
      $(document).off('click', '.btn-del-row');
    }
  }
  export default cpn
</script>

<style scoped>

  .text-success {
    color: #00c116 !important;
  }

  .text-danger {
    color: #ff0000 !important;
  }
</style>
