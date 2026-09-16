<template>
  <div>
    <re-page ref="page">
      <template #body>
        <app-form-2 ref="appForm">
          <template #form-detail>
            <div class="box box-widget">
              <div class="box-body">
                <div class="row d-flex">
                  <div class="col-md-3">
                    <div class="form-group">
                      <label v-text="'Type Program'"></label>
                      <select class="form-control input-sm" v-model="searchData.search_pg">
                        <option v-for="x in type_pg"
                                :key="x.pg_code"
                                :value="x.pg_code">
                          {{ x.pg_name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-group">
                      <label v-text="ui.search_by || 'Search By'"></label>
                      <select class="form-control input-sm" v-model="searchData.search_field">
                        <option value="pg_code">Program Code</option>
                        <option value="pg_name">Program Name</option>
                        <option value="mo_dule">Module</option>
                        <option value="pg_id">ID Program</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label v-text="ui.search || 'Search'"></label>
                      <div class="input-group">
                        <input type="text" class="form-control input-sm" v-model="searchData.search_text" @keyup.enter="doSearch()" />
                        <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click.prevent="doSearch()"><i class="fas fa-search"></i></button></span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 col-md-offset-4 align-content-end margin-b-8">
                    <span class="pull-right">(จำนวนข้อมูลทั้งหมด {{ requestCodeTotal || 0 }} รายการ)</span>
                  </div>
                </div>
                <div class="row">
                  <div class="col-sm-12 col-md-12 col-lg-12">
                    <ag-table ref="agr"
                              :footer="false"
                              @ready="initTable()"
                              @cell-clicked="onCellClicked"
                               :saveColumns="'Y'"
                              :doctype="'VIEW'"
                              :page_name="'v_csm_mas_program'">
                    </ag-table>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-12 col-md-12">
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
        <h4><i class="fa fa-edit">  {{ !isEdit ? 'Add Program' : 'Edit Program' }} </i></h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-4">
            <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(form.pg_code)}">
              <label class="text-danger">Program Code</label><span class="pull-right">{{xt.textLength(form.pg_code, 20)}}</span>
              <input type="text" class="form-control input-sm" v-model.trim="form.pg_code" maxlength="20" />
            </div>
          </div>

          <div class="col-md-4">
            <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(form.pg_name)}">
              <label class="text-danger">Program Name</label><span class="pull-right">{{xt.textLength(form.pg_name, 100)}}</span>
              <input type="text" class="form-control input-sm" v-model.trim="form.pg_name" maxlength="100" />
            </div>
          </div>
        </div>
        <div class="row" v-if="isEdit">
          <div class="col-md-2 col-sm-4 col-xs-4">
            <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(form.module)}">
              <!-- <label class="text-danger" v-text="ui.module || 'Module'"></label> -->
              <label v-text="ui.module || 'Module'"></label>
              <vue-select-2 :options="newModuleForMango"
                            :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                            v-model="form.mo_dule">
              </vue-select-2>
            </div>
          </div>
          <div class="col-md-2 col-sm-4 col-xs-4">
            <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(form.platform)}">
              <!-- <label class="text-danger" v-text="ui.csm_platform || 'Platform'"></label> -->
              <label v-text="ui.csm_platform || 'Platform'"></label>
              <vue-select-2 :options="newPlatformCodeData"
                            :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                            v-model="form.platform">
              </vue-select-2>
            </div>
          </div>
        </div>
        <div class="row" v-if="!isEdit">
          <div class="col-md-4">
            <div class="mb-5">
              <button type="button"
                      class="btn btn-xs btn-default"
                      @click="selectAllModule">
                Select All
              </button>
              <button type="button"
                      class="btn btn-xs btn-default"
                      @click="clearAllModule">
                Clear
              </button>
            </div>

            <label class="text-danger">Module</label>

            <!-- ✅ กล่อง scroll -->
            <div class="module-scroll">
              <table class="table table-bordered table-hover mb-0">
                <thead>
                  <tr>
                    <th width="50">เลือก</th>
                    <th>Module</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="m in moduleList" :key="m">
                    <td class="text-center">
                      <input type="checkbox"
                             :value="m"
                             v-model="form.mo_dule">
                    </td>
                    <td>{{ m }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="col-md-4">
            <div class="mb-5">
              &nbsp;
            </div>
            <label class="text-danger">Platform</label>

            <table class="table table-bordered table-hover">
              <thead>
                <tr>
                  <th width="50">เลือก</th>
                  <th>Platform</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in platformList" :key="p.id">
                  <td class="text-center">
                    <input type="radio"
                           name="platform"
                           :value="p.id"
                           v-model="form.platform">
                  </td>
                  <td>{{ p.name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-sm btn-success" @click.prevent="beforeSave()">
          <i class="fas fa-save"></i><span v-text="ui.save || 'Save Document'"></span>
        </button>
      </template>
    </modal-3>
  </div>
</template>
<script type="text/javascript">
  import { mapState, mapGetters } from '~/stores/helpers'
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let paging = {};
  let appForm = {};

  let cpn = {
    data() {
      return {
        auth,
        pageNumber: 1,
        form: {},
        ui: window.ui,
        display: [],
        xt: $xt,
        isEdit: false,
        requestCodeTotal: [],
        searchData: {
          search_field: "pg_id",
          search_text: "",
          search_pg: ""
        },
        fileName: null,
        infoFile: {},
        moduleForMango: moduleCodeData,
        platformCodeData,
        newModuleForMango: [],
        newPlatformCodeData: [],
        pg_lists: [],
        type_pg: [],
        moduleList: [],
        platformList: []
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
          pg_code: "",
          pg_name: "",
          mo_dule: "",
          platform: "",
        };
      },
      setNew() {
        this.resetData();
        this.form.mo_dule = [];
        this.$refs.formModal.openModal();
      },
      setImport() {
        this.resetFile();
        this.$refs.importExcel.setSize("modal-sm");
        this.$refs.importExcel.openModal();
      },
      getFileName(event) {
        const file = event.target.files[0];
        if (file) {
          this.fileName = file.name;
        }
      },
      async doUpload(f) {
        this.infoFile = f
      },
      resetFile() {
        this.infoFile = {}
        this.fileName = null
      },
      async importPriority() {
        page.loadingBox.show();
        try {
          let act = `csm/master/RequestTypeImport`;
          let fd = new FormData();
          fd.append('file', this.infoFile);
          let rsp = await $xt.postServerForm(act, fd);
          if (!rsp.success) {
            throw new Error(rsp.error);
          }
          else {
            $notify.success(this.ui.alert_save_success)
            this.$refs.importExcel.closeModal()
            await this.loadData();
          }
        } catch (ex) {
          $msg.alert("", ex.toString(), "danger");
        }
        finally {
          page.loadingBox.hide();
        }
      },
      async onTemplateExcel() {
        let act = `csm/master/TemplateExcelRequest`
        let rsp = await $xt.getServer(act)
        window.open(window.dataServer + `API/File/DownLoad?download=true&id=${rsp.data}`)

      },
      async setEdit(x) {
        this.isEdit = true;
        await this.readData(x.pg_id);
        this.$refs.formModal.openModal();
      },
      async loadData() {
        try {
          page.loadingBox.show();

          // ดึง Parameter สำหรับ Paging
          let act = `csm/master/PG_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;
          for (var key in this.searchData) {
            act += `&${key}=${encodeURIComponent(this.searchData[key])}`;
          }

          let rsp = await $xt.getServer(act);
          let agr = this.$refs.agr;

          // จาก JSON: ข้อมูลจริงอยู่ที่ rsp.data.data
          this.pg_lists = rsp.data.data || [];
          console.log('dssdds', this.pg_lists)
          this.requestCodeTotal = rsp.data.total || 0
          let gf = this.pg_lists

          // อัปเดตจำนวนรายการทั้งหมดให้ Pagination
          paging.setTotalItems(rsp.data.total || 0);
          paging.createPagesArray();

          agr.setDisplay(gf);
          this.initTable()

        } catch (error) {
          $msg.alert(``, error.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async readData(pg_id) {
        try {
          page.loadingBox.show();
          let act = `csm/master/pg_Read?pg_id=${encodeURIComponent(pg_id || '')}`;
          let rsp = await $xt.getServer(act);
          this.form = rsp.data;
          $linq(this.form).foreach(f => this.form.module_t = f.mo_dule);


        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      beforeSave() {
        if (!this.form.pg_code ) {
          $msg.alert('', 'กรุณากรอก Program Code  ', 'warning');
          return;
        }
        if (!this.form.pg_name) {
          $msg.alert('', 'กรุณากรอก Program Name ', 'warning');
          return;
        }
        if (!this.form.mo_dule || this.form.mo_dule.length === 0) {
          $msg.alert('', 'กรุณาเลือก Module อย่างน้อย 1 รายการ', 'warning');
          return;
        }

        if (!this.form.platform ) {
          $msg.alert('', 'กรุณาเลือก Platform ', 'warning');
          return;
        }
        this.onSave();
      },
      async onSave() {
        try {
          page.loadingBox.show();
          let formList = null; // ✅ ประกาศก่อน

          if (this.isEdit === false) {
            formList = this.form.mo_dule.map(m => {
              return {
                pg_code: this.form.pg_code,
                pg_name: this.form.pg_name,
                mo_dule: m,
                platform: this.form.platform
              };
            });
          }

          const payload = {
            form: this.isEdit ? this.form : formList
          };

          console.log('payload', payload);
         //  return; // ใช้ debug ได้

          let act = this.isEdit
            ? 'csm/master/PG_Update'
            : 'csm/master/PG_Create';

          let rsp = await $xt.postServerJson(act, payload);

          if (!rsp.success) {
            throw rsp.error;
          }

          await this.list_type_pg();
    

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
      async onDeleteData(x) {
        if (!await $msg.confirm(`Do you want to delete this </br> Program Name  : ${x.pg_name} and Module : ${x.mo_dule}`)) {
          return;
        }
        try {
          page.loadingBox.show();
          let f = {
            form: x
          };

          let act = `csm/master/PG_Delete`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          this.list_type_pg();
          await this.loadData();
          $notify.success(ui.alert_save_success)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      addFile() {
        $(this.$refs.File).click();
      },
      async initTable() {
        let agr = this.$refs.agr;
        let bold_underline = { "font-weight": "bold" };
        let bold_style = (p) => (p?.data?.bold ? bold_underline : {});

        let fields = [
          ["No_", "No.", "text", { width: 100, align: "center" }],
          ['', 'Action', 'text', {
            width: 160, child:
              [
                ["edit_", "Edit", "text", {
                  width: 100,
                  align: "center",
                  cellRenderer: () => {
                    return `<a class="text-black"> <i class="fas fa-edit action-icon edit" style="cursor:pointer;margin-right:8px"></i></a>`;
                  }
                }],
                ["del_", "Delete", "text", {
                  width: 100,
                  align: "center",
                  cellRenderer: () => {
                    return `<a class="text-black">   <i class="fas fa-trash-alt action-icon delete" style="cursor:pointer"></i></a>`;
                  }
                }]
              ]
          }],
          ["mo_dule", "Module", "text", { width: 150, align: "center" }],
          ["platform_t", "Platform", "text", { width: 150, align: "center" }],
          ["pg_code", "Program Code", "text", { width: 180, align: "center" }],
          ["pg_name", "Program Name", "text", { width: 280, align: "left" }],
          ["add_user", "Add User", "text", { width: 180, align: "center" }],
          ["add_dt", "Add Date", "datetime", { width: 200, align: "center" }, { useCellRenderer: true }],
          ["edit_user", "Edit User", "text", { width: 180, align: "center" }],
          ["edit_dt", "Edit Date", "datetime", { width: 200, align: "center" }, { useCellRenderer: true }],
          ["pg_id", "ID", "text", { width: 200, align: "center" }]
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);

        this.grid_header = header;


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
      async list_type_pg(req_code) {
        try {
          page.loadingBox.show();
          let act = `csm/master/Group_pg`;
          let rsp = await $xt.getServer(act);
          this.type_pg = rsp.data;

          if (this.type_pg.length > 0) {
            this.searchData.search_pg = this.type_pg[0].pg_code;
          }

        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      onCellClicked(event) {
        switch (event.col) {
          case 'edit_':

            this.setEdit(event.data);
            break;

          case 'del_':

            this.onDeleteData(event.data);
            break;
          default:
            // Optional: handle unknown columns if needed
            break;
        }
      },
      selectAllModule() {
        this.form.mo_dule = [...this.moduleList];
      },
      clearAllModule() {
        this.form.mo_dule = [];
      },

    },
    computed: {
      configData() { return store.state.configData },
      ...mapState(['connectionCodeData', 'requestCodeData', 'priorityCodeData', 'serviceCodeData', 'configData', 'config', 'activeconfig', 'configReadlist']),
    },
    async mounted() {
      page = this.$refs.page;
      page.pageTitle = 'Setup : Type Program ';
      document.title = page.pageTitle;

      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(500);

      appForm = this.$refs.appForm
      appForm.btnDelete.show = false
      appForm.btnSave.show = false
      appForm.btnNew.click = this.setNew
      appForm.btnImport.click = false
      appForm.btnImport.show = false
      appForm.btnExportClick.show = false
      appForm.btnExport.show = false

      this.moduleList = this.moduleForMango
      this.platformList = this.platformCodeData.map(x => ({
        id: x.id,
        name: x.name
      }))
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
      await this.list_type_pg();
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
</style>
