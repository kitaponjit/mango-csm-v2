<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="box box-solid">
          <div class="box-body">
            <!-- Search Panel -->
            <div class="row">
              <div class="col-lg-3 col-md-3">
                <div class="form-group">
                  <label>{{ui.search||'Search'}}</label>
                  <div class="input-group">
                    <input type="text" class="form-control input-sm" v-model="retrieveSearch['search_text']" @keyup.enter="loadData()" />
                    <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click="loadData()"><i class="fa fa-search"></i></button></span>
                  </div>
                </div>
              </div>
              <div class="col-md-9 col-sm-6 col-xs-6" v-if="isSuperAdmin">
                <div class="pull-right">
                  <div class="margin-t-25">
                    <button class="btn btn-sm btn-tumblr" @click="addNew()"><i class="fas fa-plus-circle"></i> เพิ่มรายการ</button>
                  </div>
                </div>
              </div>
            </div>
            <!-- List Data -->
            <div class="row">
              <div class="col-md-12">
                <ag-table ref="agr"
                          :scale="300"
                          :footer="false"
                          @ready="initTable()"
                          :saveColumns="'Y'"
                          :doctype="'DOCRUNNING'"
                          :page_name="'v_csm_doc_running'"></ag-table>
              </div>
            </div>
            <!-- Pagination -->
            <div class="row">
              <div class="col-md-12 margin-t-10">
                <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
              </div>
            </div>
          </div>
        </div>
      </template>
    </re-page>

    <!-- Modal : Add Document Running -->
    <modal ref="addModal">
      <template #header>
        <h4>{{editMode ? 'Edit Document Running' : 'Add Document Running'}}</h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group">
              <label for="">Form Code :</label>
              <input type="text" class="form-control input-sm" v-model.trim="form['formcode']" maxlength="10" v-bind:disabled="editMode">
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group">
              <label for="">Form Name :</label>
              <input type="text" class="form-control input-sm" v-model.trim="form['formname']">
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-sm bg-olive" v-on:click="onSave()">บันทึกช้อมูล</button>
        <button type="button" class="btn btn-sm btn-default" v-on:click="$refs.addModal.closeModal()">ปิดหน้าต่าง</button>
      </template>
    </modal>

  </div>
</template>
<script>
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let paging = {};
  let cpn = {
    data() {
      return {
        auth,
        tab1Active: 0,
        xt: $xt,
        retrieveSearch: {},
        form: {},
        ui: window.ui,
        datalist: [],
        total_datalist: 0,
        isSuperAdmin: false,
        editMode: false,
        pageNumber: 1,
      };
    },
    methods: {
      changeTab1(t) {
        this.tab1Active = t;
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
      reset() {
        this.form = {};
        this.editMode = false;
      },
      addNew() {
        this.$refs.addModal.openModal();
        this.editMode = false;
        this.form = {};
      },
      editData(x) {
        this.$refs.addModal.openModal();
        this.editMode = true;
        this.form = JSON.parse(JSON.stringify(x));
      },
      async loadData() {
        let act = `CSM/Tools/Docrunning_ReadList?search_text=${encodeURIComponent(this.retrieveSearch.search_text || '')}`;
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
      async onSave() {
        try {
          let f = {
            data: this.form
          };
          var act = `CSM/Tools/Docrunning_Create`;
          if (this.editMode) {
            act = `CSM/Tools/Docrunning_Update`;
          }
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          this.$refs.addModal.closeModal();
          await this.loadData();
          $msg.alert(``, `Success`, `success`);
          this.reset();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async onDel(x) {
        if (!await $msg.confirm(`ต้องการลบข้อมูลใช่หรือไม่`)) {
          return;
        }
        try {
          let f = {
            data: x
          };
          let act = `CSM/Tools/Docrunning_Delete`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          this.$refs.addModal.closeModal();
          this.reset();
          await this.loadData();
          $msg.alert(``, `Success`, `success`);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async initTable() {
        let agr = this.$refs.agr;
        if (!agr) return;

        let self = this;

        let fields = [
          ["manage", "Manage", "text", {
            width: 140,
            align: "center",
            pinned: 'left',
            cellRenderer: (params) => {
              let x = params.data;
              let editBtn = `<a href="#" class="btn-edit-row text-black" style="margin-right: 8px;" data-formcode="${x.formcode}"><i class="fa fa-edit"></i></a>`;
              let delBtn = `<a href="#" class="btn-del-row text-danger" data-formcode="${x.formcode}"><i class="fa fa-trash"></i></a>`;
              return editBtn + delBtn;
            },
          }],
          ["formcode", "Form Code", "text", { width: 220, align: "center", sortable: true, pinned: 'left', cellStyle: { "font-weight": "bold" } }],
          ["formname", "Form Name", "text", { width: 600, align: "left", sortable: true }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);

        // Add click events using event delegation
        this.$nextTick(() => {
          $(document).off('click', '.btn-edit-row');
          $(document).off('click', '.btn-del-row');

          $(document).on('click', '.btn-edit-row', function(e) {
            e.preventDefault();
            let formcode = $(this).data('formcode');
            let rowData = $linq(self.datalist).where(x => x.formcode == formcode).firstOrDefault();
            if (rowData) {
              self.editData(rowData);
            }
          });

          $(document).on('click', '.btn-del-row', function(e) {
            e.preventDefault();
            let formcode = $(this).data('formcode');
            let rowData = $linq(self.datalist).where(x => x.formcode == formcode).firstOrDefault();
            if (rowData) {
              self.onDel(rowData);
            }
          });
        });
      },
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = `Document Running / Form`;
      document.title = page.pageTitle;
      this.isSuperAdmin = page.isSuperAdmin();

      this.$refs.addModal.setSize('modal-md');

      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(15);

      this.loadData();
    },
    beforeUnmount() {
      // Clean up event listeners
      $(document).off('click', '.btn-edit-row');
      $(document).off('click', '.btn-del-row');
    }
  };
  export default cpn;
</script>
