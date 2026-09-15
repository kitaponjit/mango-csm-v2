<template>
  <div class="v_csm_mas_012">
    <re-page ref="page">
      <template #body>
        <app-form-2 ref="appForm" :exportData_header="onSetup_beforeExport('header')"
          :exportData="onSetup_beforeExport('detail')" exportName="QC" exportSelect="B"
          exportUrl="csm/master/QC_ExportExcel">
          <template #form-detail>
            <div class="box box-widget">
              <div class="box-body">
                <div class="row">
                  <div class="col-lg-2">
                    <div class="form-group">
                      <label>Search By</label>
                      <select class="form-control input-sm" v-model="filter">
                        <option v-for="x in op" :value="x.name_db">{{ x.key }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-3">
                    <div class="form-group">
                      <label>Search</label>
                      <div class="input-group">
                        <input type="text" class="form-control input-sm" placeholder="Search" v-model="search"
                          @keyup.enter="loadData()" />
                        <span class="input-group-btn">
                          <button class="btn btn-sm bg-navy" @click="loadData()"><i class="fa fa-search"></i></button>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="col margin-t-35 margin-r-20">
                    <b class="pull-right">(จำนวนข้อมูลทั้งหมด &nbsp {{ this.total_datalist
                      }} &nbsp รายการ)
                    </b>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12">
                    <ag-table ref="agr"
                              :footer="false"
                              :sorting="true"
                              @cell-clicked="onCellClicked"
                              @ready="initTable()">
                    </ag-table>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-12">
                    <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
                    <!-- <b class="pull-right" v-show="this.total_datalist">(จำนวนข้อมูลทั้งหมด &nbsp {{ this.total_datalist
                      }} &nbsp รายการ)
                    </b> -->
                  </div>
                </div>
              </div>
            </div>
            <input type="file" ref="File" accept=".xls, .xlsx" v-show="false" />
          </template>
        </app-form-2>

        <!-- Modal NEW/EDIT-->
        <modal-2 ref="modal">
          <template #header>
            <h4><i class="fa fa-edit margin-r-5"></i>{{ isEdit ? 'แก้ไขชุดคำถาม' : 'สร้างชุดคำถามใหม่' }}</h4>
          </template>
          <template #body>
            <div class="me-container">
              <!-- Form Fields -->
              <div class="me-form-grid">
                <div class="me-field">
                  <label class="me-label me-label--required">Form Code</label>
                  <input type="text" class="me-input" :class="{ 'me-input--disabled': isEdit }" v-model.trim="form['code']" :disabled="isEdit" placeholder="ระบุรหัสฟอร์ม" />
                </div>
                <div class="me-field">
                  <label class="me-label">Form Name</label>
                  <input type="text" class="me-input" v-model.trim="form['description']" placeholder="ระบุชื่อฟอร์ม" />
                </div>
              </div>
              <div class="me-field">
                <label class="me-label">Remark</label>
                <textarea class="me-textarea" rows="3" v-model.trim="form['remark']" maxlength="2000" placeholder="หมายเหตุ..."></textarea>
              </div>

              <!-- Items Section -->
              <div class="me-section-header">
                <span class="me-section-title"><i class="fas fa-list-ol margin-r-5"></i>รายการคำถาม ({{ detail.length }} รายการ)</span>
                <button class="me-btn-add" @click="addItem()"><i class="fa fa-plus"></i> เพิ่มรายการ</button>
              </div>
              <div class="me-table-wrap">
                <table class="me-table">
                  <thead>
                    <tr>
                      <th style="width: 60px; text-align: center;">No.</th>
                      <th style="width: 60px; text-align: center;">ลบ</th>
                      <th>Item Name</th>
                      <th style="width: 120px; text-align: center;">Max Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="x in detail_paging" :key="x.itemno">
                      <td style="text-align: center; font-weight: 600;">{{ x.itemno }}</td>
                      <td style="text-align: center;">
                        <button class="me-btn-del" @click="doDelete(x.itemno)"><i class="far fa-trash-alt"></i></button>
                      </td>
                      <td>{{ x.itemname }}</td>
                      <td><input type="text" class="me-input me-input--sm me-input--center" v-model.number="x['maxscore']" /></td>
                    </tr>
                    <tr v-if="detail_paging.length === 0">
                      <td colspan="4" style="text-align: center; color: #94a3b8; padding: 24px;">ยังไม่มีรายการ — กดปุ่ม "เพิ่มรายการ" เพื่อเริ่มต้น</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="me-pagination">
                <pagination class="pull-left" ref="paging_modal" @page-change="pageChange_modal($event.page)"></pagination>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="me-footer">
              <button class="me-btn me-btn--save" @click="doSave(); $refs.modal.closeModal()">
                <i class="fa fa-save"></i> บันทึกข้อมูล
              </button>
            </div>
          </template>
        </modal-2>

        <!-- Modal Form Items -->
        <modal-2 ref="modal_item" class="margin-t-50">
          <template #header>
            <h4><i class="fas fa-list-ul margin-r-10"></i>เลือกรายการคำถาม</h4>
          </template>
          <template #body>
            <div class="mi-container">
              <!-- Search Bar -->
              <div class="mi-search-bar">
                <div class="mi-search-field">
                  <label class="mi-label">ค้นหาตาม</label>
                  <select class="mi-select" v-model="filter_item">
                    <option v-for="x in op_item" :value="x.name_db">{{ x.key }}</option>
                  </select>
                </div>
                <div class="mi-search-field mi-search-field--grow">
                  <label class="mi-label">คำค้นหา</label>
                  <div class="mi-input-group">
                    <input type="text" class="mi-input" placeholder="พิมพ์เพื่อค้นหา..." v-model="search_item" @keypress.enter="loadItem()" />
                    <button class="mi-btn-search" @click="loadItem()"><i class="fa fa-search"></i></button>
                  </div>
                </div>
              </div>
              <!-- Select All -->
              <div class="mi-select-all">
                <label class="mi-checkbox-label">
                  <input type="checkbox" class="mi-checkbox" v-model="selectAll" @change="setSelectAll()" />
                  <span>เลือกทั้งหมด</span>
                </label>
                <span class="mi-count">{{ itemData.filter(x => x.selected).length }} / {{ itemData.length }} รายการ</span>
              </div>
              <!-- Table -->
              <div class="mi-table-wrap">
                <table class="mi-table">
                  <thead>
                    <tr>
                      <th style="width: 50px; text-align: center;"></th>
                      <th style="width: 100px; text-align: center;">Item Code</th>
                      <th>Item Name</th>
                      <th style="width: 200px;">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="x in Display_Detail" :key="x.line_number" :class="{ 'mi-row--selected': x.selected }">
                      <td style="text-align: center;">
                        <input type="checkbox" class="mi-checkbox" v-model="x.selected" @change="unSelectAll()">
                      </td>
                      <td style="text-align: center; font-weight: 600;">{{ x.line_number }}</td>
                      <td>{{ x.itemname }}</td>
                      <td class="mi-text-muted">{{ x.remark }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="mi-footer">
              <pagination class="pull-left" ref="paging_item" @page-change="pageChange_item($event.page)"></pagination>
              <div class="mi-footer-actions">
                <button class="mi-btn mi-btn--cancel" @click="CloseModalItem()">
                  <i class="fas fa-times"></i> ยกเลิก
                </button>
                <button class="mi-btn mi-btn--confirm" @click="selectList(); CloseModalItem()">
                  <i class="fas fa-check"></i> เลือกรายการ
                </button>
              </div>
            </div>
          </template>
        </modal-2>
      </template>
    </re-page>
  </div>
</template>
<script>
import XLSX from 'xlsx';
// no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
let page = { loadingBox: { show() {}, hide() {} } };
let appForm = {};
let process = false;
let paging = {};
let paging_item = {};
let paging_modal = {};

export default {
  data() {
    return {
      // activeTab: 1,
      op: [
        {
          key: "Form Code",
          name_db: "code"
        },
        {
          key: "Form Name",
          name_db: "description"
        },
        {
          key: "Remark",
          name_db: "remark"
        },
      ],
      op_item: [
        {
          key: "Item Name",
          name_db: "itemname"
        },
        {
          key: "Remark",
          name_db: "remark"
        },
      ],
      filter: "code",
      search: "",
      filter_item: "itemname",
      search_item: "",
      form: {},
      datalist: [],
      Display_Data: [],
      detail: [],
      detail_paging: [],
      Display_Detail: [],
      itemData: [],
      datalist_export: [],
      isEdit: false,
      pageNumber: 1,
      pageNumber_item: 1,
      pageNumber_modal: 1,
      selectAll: false,
      total_datalist: [],
    }
  },
  methods: {
    initTable() {
      let agr = this.$refs.agr;
      let fields = [
        ["item", "No.", "text", { width: 100, align: "center" }],
        ["action_edit", "Edit", "text", { width: 120, align: "center", cellRenderer: () => `<a class="text-black"><i class="fa fa-edit"></i></a>` }],
        ["action_del", "Delete", "text", { width: 120, align: "center", cellRenderer: () => `<a class="text-danger"><i class="far fa-trash-alt"></i></a>` }],
        ["code", "Form Code", "text", { width: 150, align: "center" }],
        ["description", "Form Name", "text", { flex: 1 }],
        ["remark", "Remark", "text", { flex: 1 }],
      ];
      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);
      agr.setDisplay(this.Display_Data);
    },
    onCellClicked(event) {
      if (event.col === 'action_edit') {
        this.doEdit(event.data);
      } else if (event.col === 'action_del') {
        this.onDel(event.data.code);
      }
    },
    addItem() {
      try {
        page.loadingBox.show();
        this.itemData = []
        this.Display_Detail = []
        this.loadItem().then(() => {
          this.$refs.modal_item.openModal();
          page.loadingBox.hide();
        });
      } catch {
        console.log("addItem is error");
        page.loadingBox.hide();
      }
    },
    setSelectAll() {
      this.itemData.forEach(x => {
        x.selected = this.selectAll;
      });
    },
    unSelectAll() {

      // this.selectAll = false;
      this.selectAll = this.itemData.every(x => x.selected);
    },
    pageChange(pn) {
      pn = pn || 1;
      this.pageNumber = pn;
      paging.setCurrentPage(pn);
      this.Display_Data = $linq(this.datalist).skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray();
      paging.createPagesArray();
      if (this.$refs.agr) {
        this.$refs.agr.setDisplay(this.Display_Data);
      }
    },
    pageChange_item(pn) {
      pn = pn || 1;
      this.pageNumber_item = pn;
      paging_item.setCurrentPage(pn);
      this.Display_Detail = $linq(this.itemData).skip(paging_item.skipItems()).take(paging_item.getItemsPerPage()).toArray();
      paging_item.createPagesArray();
    },
    pageChange_modal(pn) {
      pn = pn || 1;
      this.pageNumber_modal = pn;
      paging_modal.setCurrentPage(pn);
      this.detail_paging = $linq(this.detail).skip(paging_modal.skipItems()).take(paging_modal.getItemsPerPage()).toArray();
      paging_modal.createPagesArray();
    },
    async loadData() {
      // let act = `CSM/Master/QC_ReadList`;
      // let rsp = await $xt.getServer(act);
      try {
        let act = `CSM/Master/QC_Read_Filter?filter=${this.filter || ''}&text=${this.search || ''}`;
        let rsp = await $xt.getServer(act);
        this.datalist = rsp.data.data;
        this.total_datalist = rsp.data.total;

        this.datalist_export = rsp.data.data;

      } catch (error) {
        console.error("Error loading data:", error);
      }

      let i = 0;
      $linq(this.datalist).foreach(x => {
        x.item = ++i;
      });

      this.pageChange(this.pageNumber);
      paging.setTotalItems(this.total_datalist);
      if (!paging.getItemsPerPage()) {
        paging.setCurrentPage(1);
      }
      paging.createPagesArray();

    },
    doReset() {
      this.form = {};
      this.detail = [];
      this.detail_paging=[];
      this.isEdit = false;
    },
    async doSave() {

      if (!this.form.code || !this.form.description || !this.form.remark) {
        $msg.alert(`Warning`, `กรุณากรอกข้อมูลให้ครบถ้วน`, `warning`)
        return
      }

      try {
        page.loadingBox.show();

        await this.loadData();
        let f = {
          header: this.form,
          detail: this.detail,
        };
        var act = `CSM/Master/QC_Create`;
        if (this.isEdit) { var act = `CSM/Master/QC_Update`; }
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) {
          throw rsp.error;
        }

      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
        await this.loadData()
        process = false;
        page.loadingBox.hide();
      }

    },
    async doDelete(itemno) {
      this.detail = $linq(this.detail).where(x => x.itemno != itemno).toArray();
      paging_modal.setTotalItems(this.detail.length);
      if (this.pageNumber_modal > paging_modal.getTotalPages()) {
        this.pageNumber_modal = paging_modal.getTotalPages();
      }
      this.pageChange_modal(this.pageNumber_modal);
    },
    async onDel(x) {

      if (!await $msg.confirm(`Do you want to delete this form code : ${x}`)) {
        return;
      }

      try {
        page.loadingBox.show();
        let act = `CSM/Master/QC_Delete?code=${x}`;
        let rsp = await $xt.getServer(act);
        if (!rsp.success) {
          throw rsp.error;
        }

        await this.doReset();
        await this.loadData();

        $msg.alert(``, `Success`, `success`);
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
        page.loadingBox.hide();
      }
    },
    async doEdit(x) {
      this.isEdit = true;
      page.loadingBox.show();
      let act = `CSM/Master/QC_Read?code=${x.code}`;
      let rsp = await $xt.getServer(act);
      this.form = x;
      this.detail = rsp;

      this.pageChange_modal(this.pageNumber);
      paging_modal.setTotalItems(this.detail.length);
      if (!paging_modal.getItemsPerPage()) {
        paging_modal.setCurrentPage(1);
      }
      paging_modal.createPagesArray();

      this.$refs.modal.openModal();
      page.loadingBox.hide();
    },
    async loadItem() {
      let act = `CSM/Master/QCItem_ReadList?filter=${this.filter_item || ''}&search_text=${this.search_item || ''}`;
      let rsp = await $xt.getServer(act);

      this.itemData = rsp.filter(item => {
        return !this.detail.some(detail => detail.itemcode === item.itemno);
      });

      this.total_datalist = this.itemData.length;
      paging_item.setTotalItems(this.total_datalist);
      this.pageChange_item(1);
      if (!paging_item.getItemsPerPage()) {
        paging_item.setCurrentPage(1);
      }
      paging_item.createPagesArray();
    },
    selectList() {
      let arr = $linq(this.itemData).where(x => x.selected).toArray();
      arr.forEach((x, idx) => {
        let itemno = this.detail.length == 0 ? 1 : $linq(this.detail).max(x => x.itemno) + 1;
        this.detail.push({
          itemno: itemno,
          itemcode: x.line_number,
          itemname: x.itemname,
          maxscore: 0
        });
      });

      paging_modal.setTotalItems(this.detail.length);
      this.pageChange_modal(paging_modal.getTotalPages());
      if (!paging_modal.getItemsPerPage()) {
        paging_modal.setCurrentPage(1);
      };
      paging_modal.createPagesArray();

    },
    CloseModalItem() {
      this.$refs.modal_item.closeModal()
      this.selectAll = false;
      this.Display_Detail = []
    },
    // onExport() {
    //   let arr = [];
    //   if (this.datalist_export.length > 0) {
    //     $linq(this.datalist_export).foreach(x => {
    //       arr.push({
    //         'code': x.code,
    //         'description': x.description,
    //         'remark': x.remark,

    //       })
    //     });
    //   }
    //   else {
    //     arr.push({
    //       'code': "",
    //       'description': "",
    //       'remark': "",
    //     })
    //   }
    //   var dataWS = XLSX.utils.json_to_sheet(arr);
    //   var wb = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(wb, dataWS);
    //   XLSX.writeFile(wb, 'QC.xlsx');
    // },
    //IMPORT
    // addFile() {
    //   $(this.$refs.File).click();
    // },
    // async doUpload(f) {
    //   page.loadingBox.show();
    //   try {
    //     let act = `CSM/Master/QC_Import`;
    //     let fd = new FormData();
    //     fd.append('file', f);
    //     console.log(fd)
    //     let rsp = await $xt.postServerForm(act, fd);
    //     if (!rsp.success) {
    //       throw new Error(rsp.error);
    //     }
    //     else {
    //       $notify.success('นำเข้าข้อมูลเสร็จสิ้น');
    //       await this.loadData();
    //     }
    //   } catch (ex) {
    //     $msg.alert("", ex.toString(), "");
    //   }
    //   finally {
    //     page.loadingBox.hide();
    //   }
    // },
    onSetup_beforeExport(keyword) {
      switch (keyword) {
        case "header":
          let header = [
            {
              header: 'Code', key: 'code', fill: { type: 'pattern', pattern: 'none', fgColor: { argb: 'ffffffff' }, bgColor: { argb: '00000000' } }
            },
            {
              header: 'Description', key: 'description', fill: { type: 'pattern', pattern: 'none', fgColor: { argb: 'ffffffff' }, bgColor: { argb: '00000000' } }
            },
            {
              header: 'Remark', key: 'remark', fill: { type: 'pattern', pattern: 'none', fgColor: { argb: 'ffffffff' }, bgColor: { argb: '00000000' } }
            }
          ];
          return header
        case "detail":
          let detail = []
          this.datalist.forEach(x => {
            detail.push({
              'code': x.code,
              'description': x.description,
              'remark': x.remark,
            })
          })
          return detail
      }
    },
    appForm_click() {
      this.doReset();
      this.$refs.modal.openModal();
    }
  },
  mounted() {
    page = this.$refs.page;
    page.pageTitle = 'Setup : จัดการชุดคำถาม';
    document.title = page.pageTitle;

    paging = this.$refs.paging;
    paging.setCurrentPage(1);
    paging.setItemsPerPage(10);

    this.$refs.modal_item.setSize('modal-xl');
    paging_item = this.$refs.paging_item;
    paging_item.setCurrentPage(1);
    paging_item.setItemsPerPage(5);

    paging_modal = this.$refs.paging_modal;
    paging_modal.setCurrentPage(1);
    paging_modal.setItemsPerPage(5);

    this.loadData();


    appForm = this.$refs.appForm
    appForm.btnDelete.show = false
    appForm.btnSave.show = false
    appForm.btnNew.click = this.appForm_click
    appForm.btnImport.show = false
    appForm.btnImport_center.show = true
    appForm.btnImport_center.click=this.loadData
    appForm.btnImport_center.url="CSM/Master/QC_Import"


      // (async () => {
      //   this.$nextTick(() => {
      //     $(this.$refs.File).on('click', (e) => {
      //       e.target.value = null;
      //     });
      //     $(this.$refs.File).on('change', (e) => {
      //       if (e.target.files && e.target.files[0]) {
      //         this.doUpload(e.target.files[0]);
      //       }
      //     });
      //   });
      // })();
  }

};
</script>

<style scoped>
  /* Modal Edit/New Styles */
  .me-container {
    padding: 4px 0;
  }

  .me-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 14px;
  }

  .me-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 12px;
  }

  .me-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .me-label--required::after {
    content: ' *';
    color: #dc2626;
  }

  .me-input {
    padding: 9px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    color: #1e293b;
    transition: all 0.15s;
    width: 100%;
  }

  .me-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }

  .me-input--disabled {
    background: #f8fafc;
    color: #dc2626;
    font-weight: 600;
  }

  .me-input--sm {
    padding: 6px 8px;
    font-size: 13px;
  }

  .me-input--center {
    text-align: center;
  }

  .me-textarea {
    padding: 10px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    color: #1e293b;
    resize: vertical;
    width: 100%;
    font-family: inherit;
    transition: all 0.15s;
  }

  .me-textarea:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }

  /* Section Header */
  .me-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    margin-top: 8px;
    border-top: 1px solid #f1f5f9;
  }

  .me-section-title {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }

  .me-btn-add {
    padding: 6px 14px;
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: background 0.15s;
  }

  .me-btn-add:hover {
    background: #1d4ed8;
  }

  /* Table */
  .me-table-wrap {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    max-height: 260px;
    overflow-y: auto;
  }

  .me-table-wrap::-webkit-scrollbar { width: 5px; }
  .me-table-wrap::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

  .me-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .me-table thead {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .me-table thead th {
    padding: 9px 10px;
    background: #f1f5f9;
    color: #475569;
    font-weight: 600;
    font-size: 12px;
    border-bottom: 1px solid #e2e8f0;
  }

  .me-table tbody td {
    padding: 8px 10px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }

  .me-table tbody tr:hover {
    background: #f8fafc;
  }

  .me-btn-del {
    background: #fee2e2;
    color: #dc2626;
    border: none;
    border-radius: 5px;
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 12px;
  }

  .me-btn-del:hover {
    background: #dc2626;
    color: #fff;
  }

  .me-pagination {
    margin-top: 10px;
  }

  /* Footer */
  .me-footer {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

  .me-btn {
    padding: 9px 20px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
  }

  .me-btn--save {
    background: #059669;
    color: #fff;
    box-shadow: 0 2px 6px rgba(5,150,105,0.2);
  }

  .me-btn--save:hover {
    background: #047857;
    box-shadow: 0 4px 10px rgba(5,150,105,0.3);
  }

  /* Modal Item Styles */
  .mi-container {
    padding: 4px 0;
  }

  .mi-search-bar {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    margin-bottom: 16px;
  }

  .mi-search-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 140px;
  }

  .mi-search-field--grow {
    flex: 1;
  }

  .mi-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .mi-select {
    padding: 8px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    color: #334155;
    background: #fff;
  }

  .mi-select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }

  .mi-input-group {
    display: flex;
    gap: 4px;
  }

  .mi-input {
    flex: 1;
    padding: 8px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    color: #334155;
  }

  .mi-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }

  .mi-input::placeholder {
    color: #94a3b8;
  }

  .mi-btn-search {
    padding: 8px 14px;
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .mi-btn-search:hover {
    background: #1d4ed8;
  }

  /* Select All */
  .mi-select-all {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .mi-checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #334155;
    cursor: pointer;
    margin: 0;
  }

  .mi-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #2563eb;
  }

  .mi-count {
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
  }

  /* Table */
  .mi-table-wrap {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    max-height: 320px;
    overflow-y: auto;
  }

  .mi-table-wrap::-webkit-scrollbar { width: 6px; }
  .mi-table-wrap::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

  .mi-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .mi-table thead {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .mi-table thead th {
    padding: 10px 12px;
    background: #f1f5f9;
    color: #475569;
    font-weight: 600;
    font-size: 12px;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
  }

  .mi-table tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }

  .mi-table tbody tr:hover {
    background: #f8fafc;
  }

  .mi-row--selected {
    background: #eff6ff !important;
  }

  .mi-row--selected td {
    color: #1d4ed8;
  }

  .mi-text-muted {
    color: #94a3b8;
  }

  /* Footer */
  .mi-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .mi-footer-actions {
    display: flex;
    gap: 8px;
  }

  .mi-btn {
    padding: 8px 18px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
  }

  .mi-btn--cancel {
    background: #f1f5f9;
    color: #475569;
  }

  .mi-btn--cancel:hover {
    background: #e2e8f0;
  }

  .mi-btn--confirm {
    background: #2563eb;
    color: #fff;
    box-shadow: 0 2px 6px rgba(37,99,235,0.2);
  }

  .mi-btn--confirm:hover {
    background: #1d4ed8;
    box-shadow: 0 4px 10px rgba(37,99,235,0.3);
  }
</style>
