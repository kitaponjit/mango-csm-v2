<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="ec">
          <!-- Toolbar -->
          <div class="ec-bar">
            <div class="ec-bar__row">
              <div class="ec-search">
                <i class="fas fa-search"></i>
                <input type="text" v-model="retrieveSearch['search_text']" @keyup.enter="loadData()" placeholder="ค้นหา Config Code / Description..." />
                <i v-if="retrieveSearch['search_text']" class="fas fa-times ec-search__clear" @click="clearSearch()"></i>
              </div>
              <button class="ec-btn" @click="loadData()"><i class="fas fa-search"></i> ค้นหา</button>
              <span class="ec-bar__gap"></span>
              <button class="ec-abtn ec-abtn--indigo" @click="OpenFind()"><i class="fas fa-search-plus"></i> Find Config(Mango)</button>
              <button class="ec-abtn ec-abtn--green" @click="onExport()"><i class="fas fa-file-excel"></i> นำข้อมูลออกเป็น Excel</button>
              <button class="ec-abtn ec-abtn--teal" @click="addFile('import')"><i class="fas fa-file-import"></i> นำเข้าข้อมูลจาก Excel</button>
              <button class="ec-abtn ec-abtn--save" @click="addNew()"><i class="fas fa-plus"></i> เพิ่มรายการ</button>
            </div>
          </div>
          <!-- List Data -->
          <div class="ec-panel">
            <ag-table ref="agr"
                      :scale="300"
                      :footer="false"
                      @ready="initTable()"
                      :saveColumns="'Y'"
                      :doctype="'ERPCONFIG'"
                      :page_name="'v_csm_erp_config'"></ag-table>
            <div class="ec-foot">
              <span class="ec-foot__count"><b>{{xt.formatNumber(total_datalist, 0) || 0}}</b> รายการ</span>
              <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
            </div>
          </div>
        </div>
        <input type="file" ref="File" accept=".xls, .xlsx" v-show="false" />
      </template>
    </re-page>

    <!-- Modal : Add ERP Config -->
    <modal ref="addModal">
      <template slot="header">
        <div class="ec-mh">
          <span class="ec-mh__icon"><i class="fas" :class="editMode ? 'fa-pen' : 'fa-plus'"></i></span>
          <div class="ec-mh__text">
            <div class="ec-mh__title">{{editMode ? 'Edit ERP Config' : 'Add ERP Config'}}</div>
            <div class="ec-mh__sub" v-if="editMode">Config Code&nbsp;<b>{{form['code']}}</b></div>
            <div class="ec-mh__sub" v-else>สร้าง Config ใหม่สำหรับโปรแกรม ERP</div>
          </div>
        </div>
      </template>
      <template slot="body">
        <div class="ec-form">

          <!-- Basic Information Card -->
          <section class="ec-card">
            <div class="ec-card__head"><i class="fas fa-info-circle"></i> ข้อมูลพื้นฐาน</div>
            <div class="row">
              <div class="col-md-6">
                <div class="ec-fld">
                  <label for="code">Code <em>*</em></label>
                  <input type="text" id="code" class="form-control" v-model.trim="form['code']" maxlength="30" v-bind:disabled="editMode" placeholder="Enter config code" />
                </div>
              </div>
              <div class="col-md-6">
                <div class="ec-fld">
                  <label for="module">Module <em>*</em></label>
                  <select id="module" class="form-control" v-model.trim="form['module']">
                    <option value="">-- Select Module --</option>
                    <option v-for="x in moduleCodeData" :value="x">{{x}}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="ec-fld">
                  <label for="value_data">Value Data</label>
                  <input type="text" id="value_data" class="form-control" v-model.trim="form['value_data']" maxlength="10" placeholder="Enter value" />
                </div>
              </div>
              <!-- <div class="col-md-6">
                <div class="ec-fld">
                  <label for="job_no">CSM No. <span class="ec-fld__hint">{{xt.textLength(form['job_no'], 15)}} / 15</span></label>
                  <input type="text" id="job_no" class="form-control" v-model.trim="form['job_no']" maxlength="15" placeholder="Enter CSM number" />
                </div>
              </div> -->
              <div class="col-md-6">
                <div class="ec-fld">
                  <label>Options</label>
                  <div class="ec-chk-row">
                    <label class="ec-chk" :class="{'is-on': form['v_default'] === 'Y'}">
                      <input type="checkbox" v-model="form['v_default']" true-value="Y" false-value="N" />
                      <i class="fas fa-check-circle"></i> Default
                    </label>
                    <label class="ec-chk ec-chk--green" :class="{'is-on': form['charge'] === 'Y'}">
                      <input type="checkbox" v-model="form['charge']" true-value="Y" false-value="N" />
                      <i class="fas fa-dollar-sign"></i> Charges
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Description Card -->
          <section class="ec-card">
            <div class="ec-card__head ec-card__head--violet"><i class="fas fa-align-left"></i> รายละเอียด</div>
            <div class="row">
              <div class="col-md-12">
                <div class="ec-fld">
                  <label for="remark">Description 1</label>
                  <input type="text" id="remark" class="form-control" v-model.trim="form['remark']" maxlength="300" placeholder="Enter description" />
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <div class="ec-fld">
                  <label for="remark2">Description 2</label>
                  <input type="text" id="remark2" class="form-control" v-model.trim="form['remark2']" maxlength="2000" placeholder="Enter additional description" />
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="ec-fld">
                  <label for="remark_return"><span class="ec-tag ec-tag--on">ACTIVE</span> Description</label>
                  <textarea id="remark_return" class="form-control" rows="4" v-model.trim="form['remark_return']" maxlength="2000" placeholder="Enter active description"></textarea>
                </div>
              </div>
              <div class="col-md-6">
                <div class="ec-fld">
                  <label for="remark_return2"><span class="ec-tag ec-tag--off">INACTIVE</span> Description</label>
                  <textarea id="remark_return2" class="form-control" rows="4" v-model.trim="form['remark_return2']" maxlength="2000" placeholder="Enter inactive description"></textarea>
                </div>
              </div>
            </div>
          </section>

        </div>
      </template>
      <template slot="footer">
        <div class="ec-mf">
          <button type="button" class="ec-abtn ec-abtn--danger" v-if="editMode" v-on:click="onDel()"><i class="fas fa-trash"></i> ลบข้อมูล</button>
          <span class="ec-mf__gap"></span>
          <button type="button" class="ec-abtn ec-abtn--ghost" v-on:click="$refs.addModal.closeModal()"><i class="fas fa-times"></i> ยกเลิก</button>
          <button type="button" class="ec-abtn ec-abtn--save" v-on:click="onSave()"><i class="fas fa-check"></i> บันทึกข้อมูล</button>
        </div>
      </template>
    </modal>

    <!-- Modal : Find Config -->
    <modal ref="find_config">
      <template slot="header">
        <div class="ec-mh">
          <span class="ec-mh__icon"><i class="fas fa-search-plus"></i></span>
          <div class="ec-mh__text">
            <div class="ec-mh__title">Find Config (Mango)</div>
            <div class="ec-mh__sub">ค้นหา Config ที่เคยใช้งานจากงาน CSM ทั้งหมด</div>
          </div>
        </div>
      </template>
      <template slot="body">
        <div class="ec ec--modal">
          <div class="ec-bar ec-bar--flat">
            <div class="ec-bar__row">
              <div class="ec-search">
                <i class="fas fa-search"></i>
                <input type="text" v-model.trim="findSearch['find']" @keyup.enter="loadFindData()" placeholder="Config Code / CSM No. / ชื่อลูกค้า" />
                <i v-if="findSearch['find']" class="fas fa-times ec-search__clear" @click="clearFind()"></i>
              </div>
              <button class="ec-btn" @click="loadFindData()"><i class="fas fa-search"></i> ค้นหา</button>
              <span class="ec-bar__count"><b>{{findList.length}}</b> รายการ</span>
            </div>
          </div>
          <div class="ec-panel ec-panel--flat">
            <ag-table ref="agrfind"
                      :scale="400"
                      :footer="false"
                      @ready="initFindTable()"></ag-table>
          </div>
        </div>
      </template>
      <template slot="footer">
        <div class="ec-mf">
          <span class="ec-mf__gap"></span>
          <button type="button" class="ec-abtn ec-abtn--ghost" v-on:click="$refs.find_config.closeModal()"><i class="fas fa-times"></i> ปิด</button>
        </div>
      </template>
    </modal>

  </div>
</template>
<script>
  import XLSX from 'xlsx';

  let page = {};
  let paging = {};
  let cpn = {
    data() {
      return {
        auth,
        xt: $xt,
        retrieveSearch: {},
        findSearch: { find: '' },
        findList: [],
        form: {},
        ui: window.ui,
        datalist: [],
        displayData: [],
        total_datalist: 0,
        isSuperAdmin: false,
        editMode: false,
        pageNumber: 1,
        moduleData: [],
        moduleCodeData,
        baseUrl
      };
    },
    methods: {
      reset() {
        this.form = {};
        this.editMode = false;
      },
      addNew() {
        this.$refs.addModal.openModal()
        this.editMode = false;
        this.form = {};
      },
      setEdit(x) {
        this.$refs.addModal.openModal()
        this.editMode = true;
        this.form = JSON.parse(JSON.stringify(x));
      },
      pageChange(pn) {
        pn = pn || 1;
        this.pageNumber = pn;
        paging.setCurrentPage(pn);
        
        // Client-side pagination - slice data from datalist
        let displayData = $linq(this.datalist).skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray();
        
        paging.createPagesArray();
        
        // Update ag-table display
        this.$nextTick(() => {
          let agr = this.$refs.agr;
          if (agr) {
            agr.setDisplay(displayData);
          }
        });
      },
      async loadData() {
        let act = `CSM/Tools/ERPconfig_ReadList?search_text=${encodeURIComponent(this.retrieveSearch.search_text || '')}`;
        let rsp = await $xt.getServer(act);
        this.datalist = rsp.data;
        this.total_datalist = rsp.total;

        let i = 0;
        $linq(this.datalist).foreach(x => {
          x.item = ++i;
        });

        // Set total items for pagination
        paging.setTotalItems(rsp.total);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();
        
        // Display first page
        this.pageChange(1);
        
        await this.$nextTick();
        await this.initTable();
      },
      async loadModuleData() {
        let act = `csm/master/Module_ReadList`;
        let rsp = await $xt.getServer(act);
        this.moduleData = rsp.data_rows
      },
      async onSave() {
        try {
          let f = {
            data: this.form
          };
          let act = `CSM/Tools/ERPconfig_Create`;
          if (this.editMode) {
            act = `CSM/Tools/ERPconfig_Update`;
          }
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          this.$refs.addModal.closeModal()
          await this.loadData();
          $msg.alert(``, `Success`, `success`);
          this.reset();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async onDel() {
        if (!await $msg.confirm(`ต้องการลบข้อมูล ${this.form.code} ใช่หรือไม่`)) {
          return;
        }
        try {
          let f = {
            code: this.form.code
          };
          let act = `CSM/Tools/ERPconfig_Delete`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          $(this.$refs.addModal).modal('hide');
          await this.reset();
          await this.loadData();
          $msg.alert(``, `Success`, `success`);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      statusName(value) {
        return value == 'Y' ? "Yes" : "No";
      },
      statusClass(status) {
        return status == 'Y' ? 'text-success' : 'text-danger';
      },
      statusPill(value) {
        let on = value == 'Y';
        return `<span class="ec-pill ${on ? 'is-yes' : 'is-no'}"><i></i>${this.statusName(value)}</span>`;
      },
      openCSM(job_no) {
        return this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${job_no}`
      },
      addFile(type) {
        console.log(type);
        switch (type) {
          case "import":
            $(this.$refs.File).click();
            break;
          case "addfile":
            $(this.$refs.myFile).click();
            break;
        }
      },
      async fileUpload(file) {
        let f = new FormData();
        f.append("file", file);
        try {
          let r = await $xt.postServerForm('Data/CSM_FileUploadToTemp', f);
          if (!r.success) {
            throw r.error;
          }
          /* หากสำเร็จจะทำการ Push Data ลงใน Form */
          this.form[`filepath`] = r.id || "";
          this.form[`filename`] = r.filename || "";
          console.log(JSON.stringify(this.form));
        }
        catch (ex) {
          $msg.alert('', ex.toString(), 'danger');
        }
      },
      createFilePath(x) {
        return dataServer + "Api/File/DownLoad?id=" + x
      },
      downLoadFile(x) {
        return dataServer + `API/File/DownLoad?id=${x.filepath}&download=true&filename=${x.filename || ''}`;
      },
      getFileExt(f) {
        return f.split('.').pop().toLowerCase();
      },
      onExport() {
        let arr = [];
        if (this.datalist.length > 0) {
          $linq(this.datalist).foreach(x => {
            arr.push({
              'Code': x.code,
              'Active': x.active ?? "N",
              'Value_data': x.value_data,
              'Module': x.module,
              'Revision': x.revision,
              'Default': x.v_default ?? "N",
              'Charge': x.charge ?? "N",
              'Description1': x.remark,
              'Description2': x.remark2,
              'Desc. Active': x.remark_return,
              'Desc. Inactive': x.remark_return2,
            })
          });
        }
        else {
          arr.push({
            'Code': '',
            'Active': '',
            'Value_data': '',
            'module': '',
            'revision': '',
            'default': '',
            'charge': '',
            'Description1': '',
            'Description2': '',
            'Desc. Active': '',
            'Desc. Inactive': '',
          })
        }
        var dataWS = XLSX.utils.json_to_sheet(arr);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, dataWS);
        XLSX.writeFile(wb, 'csm_sm_config.xlsx');
      },
      async doUpload(f) {
        page.loadingBox.show();
        try {
          let act = `CSM/Tools/CSM_smconfig_Import`;
          let fd = new FormData();
          fd.append('file', f);

          let rsp = await $xt.postServerForm(act, fd);
          if (!rsp.success) {
            throw new Error(rsp.error);
          }
          else {
            $notify.success('นำเข้าข้อมูลเสร็จสิ้น');
            await this.loadData();
          }
        } catch (ex) {
          $msg.alert("", ex.toString(), "danger");
        }
        finally {
          page.loadingBox.hide();
        }
      },
      async initTable() {
        let agr = this.$refs.agr;
        if (!agr) return;

        let self = this; // เก็บ reference ของ Vue instance

        let fields = [
          ["manage", "Manage", "text", {
            width: 110,
            align: "center",
            pinned: 'left',
            cellRenderer: (params) => {
              let x = params.data;
              let editBtn = `<a href="#" class="btn-edit-row ec-ico" title="แก้ไข" data-code="${x.code}"><i class="fas fa-pen"></i></a>`;
              let viewBtn = !self.xt.isEmpty(x.filename) && ['png','jpeg','jpg'].includes(self.getFileExt(x.filename))
                ? `<a href="${self.createFilePath(x.filepath)}" target="_blank" class="ec-ico ec-ico--blue" title="ดูไฟล์แนบ"><i class="fas fa-paperclip"></i></a>`
                : '';
              let downloadBtn = !self.xt.isEmpty(x.filename)
                ? `<a href="${self.downLoadFile(x)}" target="_blank" class="ec-ico ec-ico--teal" title="ดาวน์โหลด"><i class="fas fa-download"></i></a>`
                : '';
              return editBtn + viewBtn + downloadBtn;
            },
          }],
          ["code", "Config Code", "text", {
            width: 200,
            align: "left",
            sortable: true,
            pinned: 'left',
            cellRenderer: (params) => {
              return params.value ? `<span class="ec-code">${params.value}</span>` : '';
            }
          }],
          ["module", "Module", "text", {
            width: 130,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              return params.value ? `<span class="ec-chip">${params.value}</span>` : '';
            }
          }],
          ["revision", "Revision", "text", { width: 130, align: "center", sortable: true }],
          ["v_default", "Default", "text", {
            width: 100,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              return self.statusPill(params.value);
            }
          }],
          ["charge", "Charge", "text", {
            width: 100,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              return self.statusPill(params.value);
            }
          }],
          ["job_no", "CSM", "text", {
            width: 165,
            align: "left",
            sortable: true,
            cellRenderer: (params) => {
              let jobNo = params.value;
              if (jobNo) {
                return `<a href="${self.openCSM(jobNo)}" target="_blank" class="ec-cell-link"><i class="fas fa-external-link-alt"></i>${jobNo}</a>`;
              }
              return '';
            }
          }],
          ["customer_name", "Customer Name", "text", { width: 250, align: "left", sortable: true }],
          ["remark", "Description1", "text", { width: 300, align: "left", sortable: true }],
          ["remark2", "Description2", "text", { width: 300, align: "left", sortable: true }],
          ["remark_return", "Desc. Active", "text", { width: 250, align: "left", sortable: true }],
          ["remark_return2", "Desc. Inactive", "text", { width: 250, align: "left", sortable: true }],
          ["adduser", "Add User", "text", { width: 150, align: "center", sortable: true }],
          ["add_dt", "Add Date", "datetime", { width: 180, align: "center", sortable: true }, { useCellRenderer: true }],
          ["edituser", "Edit User", "text", { width: 150, align: "center", sortable: true }],
          ["edit_dt", "Edit Date", "datetime", { width: 180, align: "center", sortable: true }, { useCellRenderer: true }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);

        // Add click event for edit button using event delegation
        this.$nextTick(() => {
          // Remove old event listeners first
          $(document).off('click', '.btn-edit-row');

          // Add new event listener
          $(document).on('click', '.btn-edit-row', function(e) {
            e.preventDefault();
            let code = $(this).data('code');
            let rowData = $linq(self.datalist).where(x => x.code == code).firstOrDefault();
            if (rowData) {
              self.setEdit(rowData);
            }
          });
        });
      },
      clearSearch() {
        this.retrieveSearch.search_text = '';
        this.loadData();
      },
      clearFind() {
        this.findSearch.find = '';
        this.loadFindData();
      },
      OpenFind() {
        this.findSearch.find = '';
        this.$refs.find_config.openModal()
        this.loadFindData();
      },
      async loadFindData() {
        try {
          page.loadingBox.show();
          let act = `CSM/Tools/ERPconfig_Find?Find=${encodeURIComponent(this.findSearch.find || '')}`;
          let rsp = await $xt.getServer(act);
          this.findList = Array.isArray(rsp) ? rsp : (rsp.data || []);

          await this.$nextTick();
          await this.initFindTable();
          this.$refs.agrfind.setDisplay(this.findList);
        } catch (ex) {
          $msg.alert('', ex.toString(), 'danger');
        } finally {
          page.loadingBox.hide();
        }
      },
      initFindTable() {
        let agr = this.$refs.agrfind;
        if (!agr) return;

        let self = this;

        let fields = [
          ["job_no", "CSM No.", "text", {
            width: 180,
            align: "left",
            sortable: true,
            pinned: 'left',
            cellRenderer: (params) => {
              let jobNo = params.value;
              if (jobNo) {
                return `<a href="${self.openCSM(jobNo)}" target="_blank" class="ec-cell-link"><i class="fas fa-external-link-alt"></i>${jobNo}</a>`;
              }
              return '';
            }
          }],
          ["config_code", "Config Code", "text", {
            width: 200,
            align: "left",
            sortable: true,
            cellRenderer: (params) => {
              return params.value ? `<span class="ec-code">${params.value}</span>` : '';
            }
          }],
          ["customer_name", "Customer Name", "text", { width: 250, align: "left", sortable: true }],
          ["revision", "Revision", "text", { width:150, align: "center", sortable: true }],
          ["revision_bug", "Revision Production", "text", { width: 150, align: "center", sortable: true }],
          ["remark_config", "Remark (Config)", "text", { width: 320, align: "left", sortable: true }],
         ["assign_name", "Worker", "text", { width: 180, align: "left", sortable: true }],
           ["tester_name", "Tester", "text", { width: 180, align: "left", sortable: true }],
 
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
      },
    },
    mounted() {
      page = this.$refs.page
      page.pageTitle = `Software ERP Config`
      document.title = page.pageTitle

      this.$refs.addModal.setSize('modal-lg')
      
      this.$refs.find_config.setSize('modal-xl-2')

      paging = this.$refs.paging
      paging.setCurrentPage(1)
      paging.setItemsPerPage(50)

      this.isSuperAdmin = page.isSuperAdmin()

      this.loadData()

      this.$nextTick(() => {
        $(this.$refs.File).on('click', (e) => {
          e.target.value = null;
        });
        //Import File
        $(this.$refs.File).on('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            this.doUpload(e.target.files[0]);
          }
        });
        //Add File
        $(this.$refs.myFile).on('change', (e) => {
          this.fileUpload(e.target.files[0]);
        });
      });
    },
    beforeUnmount() {
      // Clean up event listeners
      $(document).off('click', '.btn-edit-row');
    }
  };

  export default cpn;
</script>

<style scoped>
  .ec,
  .ec-form,
  .ec-mh,
  .ec-mf {
    --ink: #16263D;
    --ink-2: #4A5A72;
    --ink-3: #8593A8;
    --line: #E4E9F2;
    --surface: #FFFFFF;
    --canvas: #F1F4F9;
    --accent: #4FD1C5;
    --radius: 16px;
    --shadow: 0 1px 2px rgba(16,32,54,.05), 0 14px 34px -22px rgba(16,32,54,.4);
    font-family: 'Sarabun', 'Helvetica Neue', sans-serif;
    color: var(--ink);
  }

  .ec { padding: 2px 0 20px; }
  .ec--modal { padding: 0; }

  .ec *,
  .ec *::before,
  .ec *::after,
  .ec-form *,
  .ec-form *::before,
  .ec-form *::after { box-sizing: border-box; }

  /* ── Toolbar ─────────────────────────────────────────── */
  .ec-bar {
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: var(--shadow);
    padding: 13px 15px;
    animation: ecRise .45s both;
  }

  .ec-bar--flat {
    box-shadow: none;
    background: var(--canvas);
    padding: 11px 13px;
    border-radius: 12px;
    animation: none;
  }

  .ec-bar__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .ec-bar__gap { flex: 1 1 auto; }

  .ec-bar__count {
    margin-left: auto;
    font-size: 12px;
    color: var(--ink-3);
    white-space: nowrap;
  }

  .ec-bar__count b {
    font-family: 'Prompt', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
    margin-right: 4px;
    font-variant-numeric: tabular-nums;
  }

  .ec-search {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex: 1 1 280px;
    max-width: 440px;
    height: 38px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--surface);
    padding: 0 34px;
    transition: border-color .2s ease, box-shadow .2s ease;
  }

  .ec-search:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(79,209,197,.15);
  }

  .ec-search > i {
    position: absolute;
    left: 13px;
    font-size: 12px;
    color: var(--ink-3);
  }

  .ec-search > i.ec-search__clear {
    left: auto;
    right: 12px;
    cursor: pointer;
  }

  .ec-search > i.ec-search__clear:hover { color: var(--ink); }

  .ec-search input {
    border: 0;
    outline: none;
    background: transparent;
    font: inherit;
    font-size: 13px;
    width: 100%;
    height: 100%;
    color: var(--ink);
  }

  .ec-btn {
    height: 38px;
    padding: 0 20px;
    border: 0;
    border-radius: 10px;
    background: var(--accent);
    color: #06232B;
    font-family: 'Prompt', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 8px 18px -12px rgba(79,209,197,.95);
    transition: transform .18s ease, background .18s ease;
  }

  .ec-btn i { margin-right: 6px; }
  .ec-btn:hover { background: #6BE0D5; transform: translateY(-1px); }

  /* ── Action buttons ──────────────────────────────────── */
  .ec-abtn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 36px;
    padding: 0 16px;
    border: 0;
    border-radius: 10px;
    color: #fff;
    font-family: 'Prompt', sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: transform .16s ease, filter .16s ease, background .16s ease;
  }

  .ec-abtn i { font-size: 12px; }
  .ec-abtn:hover { transform: translateY(-1px); filter: brightness(1.08); }
  .ec-abtn:active { transform: none; }

  .ec-abtn--indigo { background: #4C6FD6; box-shadow: 0 8px 18px -12px rgba(76,111,214,.95); }
  .ec-abtn--green  { background: #21A366; box-shadow: 0 8px 18px -12px rgba(33,163,102,.95); }
  .ec-abtn--teal   { background: #159C89; box-shadow: 0 8px 18px -12px rgba(21,156,137,.95); }
  .ec-abtn--danger { background: #D9453A; box-shadow: 0 8px 18px -12px rgba(217,69,58,.95); }

  .ec-abtn--save {
    background: linear-gradient(135deg, #16263D, #24405F);
    box-shadow: 0 8px 18px -10px rgba(22,38,61,.85);
  }

  .ec-abtn--ghost {
    background: var(--canvas);
    color: var(--ink-2);
    border: 1px solid var(--line);
  }

  .ec-abtn--ghost:hover { background: #E7ECF4; color: var(--ink); filter: none; }

  /* ── Data panel ──────────────────────────────────────── */
  .ec-panel {
    margin-top: 12px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: var(--shadow);
    padding: 14px 16px;
    animation: ecRise .5s .08s both;
  }

  .ec-panel--flat {
    box-shadow: none;
    padding: 0;
    border-radius: 12px;
    overflow: hidden;
    animation: none;
  }

  .ec-foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-top: 13px;
    margin-top: 13px;
    border-top: 1px solid var(--line);
  }

  .ec-foot__count { font-size: 12px; color: var(--ink-3); }

  .ec-foot__count b {
    font-family: 'Prompt', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
    margin-right: 4px;
    font-variant-numeric: tabular-nums;
  }

  @keyframes ecRise {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: none; }
  }

  /* ── Modal header / footer ───────────────────────────── */
  .ec-mh {
    display: flex;
    align-items: center;
    gap: 13px;
    min-width: 0;
  }

  .ec-mh__icon {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    display: grid;
    place-items: center;
    background: rgba(255,255,255,.14);
    border: 1px solid rgba(255,255,255,.24);
  }

  .ec-mh__icon i { font-size: 16px; color: #fff; }
  .ec-mh__text { min-width: 0; }

  .ec-mh__title {
    font-family: 'Prompt', sans-serif;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.3;
    color: #fff;
  }

  .ec-mh__sub {
    font-size: 12px;
    color: rgba(255,255,255,.72);
    margin-top: 2px;
  }

  .ec-mh__sub b {
    font-family: 'Prompt', sans-serif;
    font-weight: 600;
    color: #7EE3D8;
    letter-spacing: .04em;
  }

  .ec-mf {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
  }

  .ec-mf__gap { flex: 1 1 auto; }

  /* ── Form cards ──────────────────────────────────────── */
  .ec-card {
    border: 1px solid var(--line);
    border-radius: 14px;
    background: var(--surface);
    padding: 16px 18px 4px;
  }

  .ec-card + .ec-card { margin-top: 12px; }

  .ec-card__head {
    display: flex;
    align-items: center;
    gap: 9px;
    font-family: 'Prompt', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
    padding-bottom: 11px;
    margin-bottom: 14px;
    border-bottom: 1px solid var(--line);
  }

  .ec-card__head i {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    font-size: 12px;
    color: #127C8E;
    background: rgba(79,209,197,.16);
  }

  .ec-card__head--violet i { color: #7B57B5; background: rgba(123,87,181,.14); }

  .ec-fld { margin-bottom: 14px; }

  .ec-fld > label {
    display: block;
    margin-bottom: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--ink-3);
  }

  .ec-fld > label em { font-style: normal; color: #D9453A; }

  .ec-fld__hint {
    float: right;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
  }

  .ec-fld .form-control {
    height: 38px;
    border: 1px solid var(--line);
    border-radius: 10px;
    box-shadow: none;
    font-size: 13px;
    color: var(--ink);
    background: var(--surface);
    transition: border-color .18s ease, box-shadow .18s ease;
  }

  .ec-fld textarea.form-control {
    height: auto;
    padding-top: 9px;
    resize: vertical;
  }

  .ec-fld .form-control:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(79,209,197,.15);
  }

  .ec-fld .form-control[disabled] {
    background: var(--canvas);
    color: var(--ink-3);
    cursor: not-allowed;
  }

  .ec-tag {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .06em;
    color: #fff;
    margin-right: 6px;
    vertical-align: 1px;
  }

  .ec-tag--on { background: #21A366; }
  .ec-tag--off { background: #8593A8; }

  .ec-chk-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ec-chk {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 38px;
    padding: 0 15px;
    margin: 0;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--surface);
    font-weight: 400;
    font-size: 12.5px;
    color: var(--ink-2);
    cursor: pointer;
    user-select: none;
    transition: border-color .18s ease, background .18s ease, color .18s ease;
  }

  .ec-chk input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .ec-chk i { font-size: 12px; color: var(--ink-3); }
  .ec-chk:hover { border-color: #C9D3E2; }

  .ec-chk.is-on {
    background: #16263D;
    border-color: #16263D;
    color: #fff;
  }

  .ec-chk.is-on i { color: var(--accent); }

  .ec-chk--green.is-on { background: #21A366; border-color: #21A366; }
  .ec-chk--green.is-on i { color: #D6FBE8; }

  /* ── Pagination ──────────────────────────────────────── */
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
    border-color: var(--accent);
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

  /* ── Grid cell renderers ─────────────────────────────── */
  ::v-deep .ec-ico {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    color: #5C6E8A;
    background: #F1F4F9;
    font-size: 11px;
    text-decoration: none;
    margin-right: 5px;
    transition: background .16s ease, color .16s ease;
  }

  ::v-deep .ec-ico:last-child { margin-right: 0; }
  ::v-deep .ec-ico:hover { background: #16263D; color: #fff; }
  ::v-deep .ec-ico--blue:hover { background: #4C6FD6; }
  ::v-deep .ec-ico--teal:hover { background: #159C89; }

  ::v-deep .ec-code {
    font-family: 'Consolas', 'Menlo', monospace;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .01em;
    color: #16263D;
  }

  ::v-deep .ec-chip {
    display: inline-block;
    padding: 1px 10px;
    border-radius: 20px;
    font-size: 11.5px;
    line-height: 1.7;
    color: #4A5A72;
    background: rgba(133,147,168,.14);
  }

  ::v-deep .ec-cell-link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 12.5px;
    font-weight: 500;
    color: #127C8E;
    text-decoration: none;
  }

  ::v-deep .ec-cell-link i { font-size: 9px; color: #C0CAD8; transition: color .18s ease; }
  ::v-deep .ec-cell-link:hover { color: #0E6373; text-decoration: underline; }
  ::v-deep .ec-cell-link:hover i { color: #0E6373; }

  ::v-deep .ec-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 11px;
    border-radius: 20px;
    font-size: 11.5px;
    line-height: 1.6;
  }

  ::v-deep .ec-pill i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  ::v-deep .ec-pill.is-yes { color: #177A52; background: rgba(33,163,102,.14); }
  ::v-deep .ec-pill.is-yes i { background: #21A366; }
  ::v-deep .ec-pill.is-no { color: #8593A8; background: rgba(133,147,168,.14); }
  ::v-deep .ec-pill.is-no i { background: #B4BECC; }
</style>

<style>
  body.dark-mode .ec,
  body.dark-mode .ec-form,
  body.dark-mode .ec-mh,
  body.dark-mode .ec-mf {
    --ink: #E6EDF6;
    --ink-2: #A9B7C9;
    --ink-3: #7C8BA0;
    --line: #2A3648;
    --surface: #1B2433;
    --canvas: #232E3F;
    --shadow: 0 1px 2px rgba(0,0,0,.3), 0 14px 34px -22px rgba(0,0,0,.85);
  }

  body.dark-mode .ec-chk.is-on { background: #4FD1C5; border-color: #4FD1C5; color: #06232B; }
  body.dark-mode .ec-chk.is-on i { color: #06232B; }
  body.dark-mode .ec-chk--green.is-on { background: #21A366; border-color: #21A366; color: #fff; }
  body.dark-mode .ec-abtn--save { background: linear-gradient(135deg, #2B3B54, #3A5578); }
  body.dark-mode .ec-abtn--ghost:hover { background: #2A3648; }
  body.dark-mode .ec-ico { background: #232E3F; color: #A9B7C9; }
  body.dark-mode .ec-ico:hover { background: #4FD1C5; color: #06232B; }
  body.dark-mode .ec-code { color: #E6EDF6; }
  body.dark-mode .ec-chip { color: #A9B7C9; }
  body.dark-mode .ec-cell-link { color: #4FD1C5; }
  body.dark-mode .ec-cell-link:hover { color: #7EE3D8; }
</style>
