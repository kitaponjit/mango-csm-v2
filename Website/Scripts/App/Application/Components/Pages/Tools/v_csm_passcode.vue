<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="nav-tabs-custom">
          <ul class="nav nav-tabs">
            <li :class="{ active: x.id === tabActive }"v-for="x in tabField"v-if="x.show">
              <a href="#" @click.prevent="onTabChange(x.id)">
                <i class="fas" v-bind:class="xt.isEmpty(x.icon) ? 'fa-circle' : x.icon"></i>
                <span v-text="x.text"></span></a>
            </li>
          </ul>
          <div class="tab-content">
            <!-- Tab 1 : Passcode -->
            <div class="tab-pane" v-bind:class="{ active: tabActive === 0 }">
              <div class="row" style="margin-bottom: 12px;">
                <div class="col-md-9">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label v-text="ui.search || 'ค้นหา'"></label>
                    <div class="input-group">
                      <input type="text" class="form-control input-md" v-model="retrieveSearch.search" @keyup.enter="onSearchRetrieve()"/>
                      <span class="input-group-btn">
                        <button class="btn btn-sm bg-navy" @click.prevent="onSearchRetrieve()">
                          <i class="fa fa-search"></i>
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 text-right" style="padding-top: 24px;">
                  <button class="btn btn-sm btn-primary" v-on:click="checkNewItems()">
                    <i class="fa fa-plus"></i> ทำรายการใหม่
                  </button>
                </div>
              </div>

              <!-- AG Table : Passcode -->
              <div class="row">
                <div class="col-sm-12">
                  <ag-table ref="agr"
                    :footer="false"
                    @ready="initTable()"
                    :saveColumns="'Y'"
                    :doctype="'VIEW'"
                    :page_name="'v_csm_passcode'">
                  </ag-table>
                </div>
              </div>
              <!-- Pagination -->
              <div class="row">
                <div class="col-md-12" style="margin-top: 10px;">
                  <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
                </div>
              </div>
            </div>
            <div class="tab-pane">
              <div class="row">
                <div class="col-md-2">
                  <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(formData.cus_code),}">
                    <label class="text-danger">Passcode</label>
                    <input type="text" class="form-control input-sm" id="cus_code" v-model.trim="formData['cus_code']" ref="passcode" placeholder="Enter Passcode here..."/>
                  </div>
                </div>
                <div class="col-md-2">
                  <div class="form-group">
                    <label>Password</label>
                    <input type="text" class="form-control input-sm" id="user_pass" v-model.trim="formData['user_pass']" placeholder="Enter Password here..."/>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-group">
                    <label>Line Token</label>
                    <input type="text" class="form-control input-sm" id="app_path_prod" v-model.trim="formData['line_token']" placeholder="Line Token"/>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-4">
                  <div class="form-group">
                    <label>Production Path</label>
                    <input type="text" class="form-control input-sm" id="app_path_prod" v-model.trim="formData['app_path_prod']" placeholder="Enter Production Path..."/>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-group">
                    <label>Demo Path</label>
                    <input type="text" class="form-control input-sm" id="app_path_demo" v-model.trim="formData['app_path_demo']" placeholder="Enter Demo Path..."/>
                  </div>
                </div>
                <div class="col-sm-2 pull-right">
                  <div class="pull-right" style="margin-top: 23px">
                    <button class="btn btn-sm btn-tumblr" @click.prevent="addcarabal()"><i class="fa fa-plus"></i> เพิ่มรายการ</button>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-sm-12">
                  <div class="table-responsive">
                    <table class="table table-bordered table-striped table-hover">
                      <thead>
                        <tr>
                          <th class="tf-2-5">Manage</th>
                          <th class="tf-2-5">No.</th>
                          <th class="tf-4">Application Type</th>
                          <th>Production Path</th>
                          <th>Demo Path</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr class="form-group" v-for="(x, idx) in showAppList()">
                          <td align="center">
                            <a class="text-danger" href="#"  @click.prevent="removeAppList(idx)">
                            <v-icon name="trash-2" class="v-icon-width"></v-icon>
                            </a>
                          </td>
                          <td align="center">{{ x.itemno }}.</td>
                          <td>
                            <select class="form-control input-sm" v-model.trim="x.app_type">
                              <option value="">-- Please Select --</option>
                              <option v-for="x in appTypeData" v-bind:value="x.id">{{ x.name }}</option>
                            </select>
                          </td>
                          <td>
                            <input type="text" class="form-control input-sm" v-model="x.app_path_prod"/>
                          </td>
                          <td>
                            <input type="text" class="form-control input-sm" v-model="x.app_path_demo"/>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </re-page>
              <!-- Tab 2 : Create Passcode -->
          <modal ref="add_modal">
              <template #header>
                <div style="display:flex;align-items:center;gap:10px;">
                  <i class="fa" :class="isEdit ? 'fa-edit' : 'fa-plus-circle'" style="font-size:16px;"></i>
                  <h4 style="margin:0;font-size:15px;font-weight:600;">{{ msg }}</h4>
                </div>
              </template>
              <template #body>
                <div style="background:#f8f9fa;padding:20px;margin:-15px;margin-bottom:0;">

                  <!-- Section 1: ข้อมูลหลัก -->
                  <div class="modal-section-card">
                    <div class="modal-section-header modal-section-blue">
                      <i class="fa fa-key"></i> ข้อมูล Passcode
                    </div>
                    <div class="modal-section-body">
                      <div class="row">
                        <div class="col-md-3">
                          <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(formData.cus_code)}">
                            <label class="modal-field-label modal-field-required">Passcode</label>
                            <input type="text" class="form-control input-sm"
                                   v-model.trim="formData['cus_code']"
                                   :disabled="isEdit"
                                   ref="passcode"
                                   placeholder="Enter Passcode..." />
                          </div>
                        </div>
                        <div class="col-md-3">
                          <div class="form-group">
                            <label class="modal-field-label">Password</label>
                            <input type="text" class="form-control input-sm"
                                   v-model.trim="formData['user_pass']"
                                   placeholder="Enter Password..." />
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-group">
                            <label class="modal-field-label">Line Token</label>
                            <input type="text" class="form-control input-sm"
                                   v-model.trim="formData['line_token']"
                                   placeholder="Line Token" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Section 2: Application Path -->
                  <div class="modal-section-card">
                    <div class="modal-section-header modal-section-purple">
                      <i class="fa fa-server"></i> Application Path
                    </div>
                    <div class="modal-section-body">
                      <div class="row">
                        <div class="col-md-5">
                          <div class="form-group">
                            <label class="modal-field-label">Production Path</label>
                            <input type="text" class="form-control input-sm"
                                   v-model.trim="formData['app_path_prod']"
                                   placeholder="Enter Production Path..." />
                          </div>
                        </div>
                        <div class="col-md-5">
                          <div class="form-group">
                            <label class="modal-field-label">Demo Path</label>
                            <input type="text" class="form-control input-sm"
                                   v-model.trim="formData['app_path_demo']"
                                   placeholder="Enter Demo Path..." />
                          </div>
                        </div>
                        <div class="col-md-2" style="padding-top:24px;">
                          <button class="btn btn-sm btn-success btn-block" @click.prevent="addcarabal()">
                            <i class="fa fa-plus"></i> เพิ่มแถว
                          </button>
                        </div>
                      </div>

                      <!-- App List Table -->
                      <div class="table-responsive" style="margin-top:8px;">
                        <table class="table table-bordered table-hover modal-inner-table">
                          <thead>
                            <tr>
                              <th style="width:60px;" class="text-center">Del</th>
                              <th style="width:60px;" class="text-center">No.</th>
                              <th style="width:180px;">Application Type</th>
                              <th>Production Path</th>
                              <th>Demo Path</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(x, idx) in showAppList()" :key="idx">
                              <td class="text-center">
                                <a class="text-danger" href="#" @click.prevent="removeAppList(idx)" title="ลบ">
                                  <i class="fa fa-trash"></i>
                                </a>
                              </td>
                              <td class="text-center">{{ x.itemno }}.</td>
                              <td>
                                <select class="form-control input-sm" v-model.trim="x.app_type">
                                  <option value="">-- Select --</option>
                                  <option v-for="t in appTypeData" :value="t.id">{{ t.name }}</option>
                                </select>
                              </td>
                              <td>
                                <input type="text" class="form-control input-sm" v-model="x.app_path_prod" />
                              </td>
                              <td>
                                <input type="text" class="form-control input-sm" v-model="x.app_path_demo" />
                              </td>
                            </tr>
                            <tr v-if="showAppList().length === 0">
                              <td colspan="5" class="text-center text-muted" style="padding:16px;font-size:13px;">
                                <i class="fa fa-inbox"></i> ยังไม่มีรายการ — กด "เพิ่มแถว" เพื่อเพิ่ม
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>
              </template>
              <template #footer>
                <div>
                  <button class="btn btn-sm bg-olive" @click.prevent="save()">
                    <i class="fa fa-save"></i> บันทึกข้อมูล
                  </button>
                  <button class="btn btn-sm bg-danger" @click="$refs.add_modal.closeModal()">
                    <i class="fas fa-times"></i> ปิด
                  </button>
                </div>
              </template>
            </modal>

            <!-- modal ทำรายการใหม่ -->
            <!-- <modal ref="add_passcode_modal">
              <template #header>
                <div>
                  <h2 style="font-size: 15px; margin-top: 10px;margin-bottom: 0px;">เพิ่มรายการใหม่</h2>
                </div></template
              >
              <template #body>
                <div>
                  <div class="row">
                    <div class="col-md-2">
                      <div class="form-group" v-bind:class="{ 'has-error': xt.isEmpty(formData.cus_code),}">
                        <label class="text-danger">Passcode</label>
                        <input type="text" class="form-control input-sm" id="cus_code" v-model.trim="formData['cus_code']" ref="passcode" placeholder="Enter Passcode here..."/>
                      </div>
                    </div>
                    <div class="col-md-2">
                      <div class="form-group">
                        <label>Password</label>
                        <input type="text" class="form-control input-sm" id="user_pass" v-model.trim="formData['user_pass']" placeholder="Enter Password here..."/>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-group">
                        <label>Line Token</label>
                        <input type="text" class="form-control input-sm" id="app_path_prod" v-model.trim="formData['line_token']" placeholder="Line Token"/>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-4">
                      <div class="form-group">
                        <label>Production Path</label>
                        <input type="text" class="form-control input-sm" id="app_path_prod" v-model.trim="formData['app_path_prod']" placeholder="Enter Production Path..."/>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-group">
                        <label>Demo Path</label>
                        <input type="text" class="form-control input-sm" id="app_path_demo" v-model.trim="formData['app_path_demo']" placeholder="Enter Demo Path..."/>
                      </div>
                    </div>
                    <div class="col-sm-2 pull-right">
                      <div class="pull-right" style="margin-top: 23px">
                        <button class="btn btn-sm btn-tumblr" @click.prevent="addcarabal()">
                          <i class="fa fa-plus"></i> 
                          เพิ่มรายการ
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm-12">
                      <div class="table-responsive">
                        <table class="table table-bordered table-striped table-hover">
                          <thead>
                            <tr>
                              <th class="tf-2-5">Manage</th>
                              <th class="tf-2-5">No.</th>
                              <th class="tf-4">Application Type</th>
                              <th>Production Path</th>
                              <th>Demo Path</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr class="form-group" v-for="(x, idx) in showAppList()">
                              <td align="center">
                                <a class="text-danger" href="#" @click.prevent="removeAppList(idx)">
                                  <v-icon  name="trash-2" class="v-icon-width"></v-icon>
                                </a>
                              </td>
                              <td align="center">{{ x.itemno }}.</td>
                              <td>
                                <select class="form-control input-sm" v-model.trim="x.app_type">
                                  <option value="">-- Please Select --</option>
                                  <option v-for="x in appTypeData" v-bind:value="x.id">{{ x.name }}</option>
                                </select>
                              </td>
                              <td>
                                <input type="text" class="form-control input-sm" v-model="x.app_path_prod"/>
                              </td>
                              <td>
                                <input type="text" class="form-control input-sm" v-model="x.app_path_demo"/>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template #footer>
                <div>
                  <button class="btn btn-sm bg-olive" @click.prevent="save()">
                    <i class="fa fa-save"></i> 
                    บันทึกข้อมูล
                  </button>
                  <button class="btn btn-sm bg-danger" @click="$refs.add_passcode_modal.closeModal()">
                    <i class="fas fa-times"></i> 
                    ปิด
                  </button>
                </div>
              </template>
            </modal> -->
  </div>
</template>

<script type="text/javascript">
let page = {};
let paging = {};
let cpn = {
  data() {
    return {
      auth,
      baseUrl,
      baseRoute,
      ui: window.ui,
      xt: $xt,
      passcodeListData: [],   // ข้อมูลทั้งหมด (client-side)
      displayData: [],        // ข้อมูลที่แสดงในหน้าปัจจุบัน
      retrieveSearch: {},
      formData: {},
      appListData: [],
      appTypeData: [],
      isEdit: false,
      tabField: [],
      tabActive: 0,
      msg: '',
    };
  },
  methods: {
    /* ─── AG Table ──────────────────────────────────────── */
    async initTable() {
      let agr = this.$refs.agr;
      if (!agr) return;

      let self = this;

      let fields = [
    ['', 'Manage', 'text', { width: 160, child:
      [
             ["", "Edit", "text", {
            width: 120,
            align: "center",
            pinned: 'left',
            cellRenderer: (params) => {
        
             return`<a href="#" class="text-black ag-action-edit" data-idx="${params.rowIndex}"><i class="fas fa-edit"></i></a>`;

            },
          }],
           ["", "Delelt", "text", {
            width: 120,
            align: "center",
            pinned: 'left',
            cellRenderer: (params) => {
              return ` <a href="#" class="text-danger m-5 ag-action-delete" data-idx="${params.rowIndex}"><i class="fas fa-trash-alt"></i></a>`;
            
            },
          }]
      ] 
    }],
        ["no1", "No.", "text", {
          width: 100,
          align: "center",
          sortable: false,
     
        }],
        ["cus_code", "Passcode", "text", {
          width: 1200,
          align: "left",
          sortable: true,
          cellStyle: { "font-weight": "600", "color": "#1a5276" }
        }],
      ];

      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);

      // Event delegation — แบบเดียวกับ v_csm_erp_config
           this.$nextTick(() => {
          agr.$el.addEventListener('click', (e) => {
            let editBtn = e.target.closest('.ag-action-edit');
            let deleteBtn = e.target.closest('.ag-action-delete');
            if (editBtn) {
              e.preventDefault();
              let idx = parseInt(editBtn.getAttribute('data-idx'));
              this.editData(this.displayData[idx]);
            }
            if (deleteBtn) {
              e.preventDefault();
              let idx = parseInt(deleteBtn.getAttribute('data-idx'));
              this.onDel(this.displayData[idx]);
            }
          });
        });
    },

    /* ─── Pagination (client-side) ──────────────────────── */
    pageChange(pn) {
      pn = pn || 1;
      paging.setCurrentPage(pn);

      this.displayData = $linq(this.passcodeListData)
        .skip(paging.skipItems())
        .take(paging.getItemsPerPage())
        .toArray();

      paging.createPagesArray();

      this.$nextTick(() => {
        let agr = this.$refs.agr;
        if (agr) agr.setDisplay(this.displayData);
      });
    },

    /* ─── Load data ─────────────────────────────────────── */
    async loadRetrieve() {
      let act = `CSM/Tools/GeneratePasscodeReadList?skip=0&take=9999`;
      for (var key in this.retrieveSearch) {
        act += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`;
      }
      page.loadingBox.show();
      let rsp = await $xt.getServer(act);
      page.loadingBox.hide();

      this.appTypeData = rsp.app_type;
      let i = 1;
      $linq(rsp.data).foreach(x => { x.checked = false; x.no1 = i++ });
      this.passcodeListData = rsp.data;

      // Setup pagination
      paging.setTotalItems(rsp.total || rsp.data.length);
      if (!paging.getItemsPerPage()) paging.setCurrentPage(1);
      paging.createPagesArray();

      // Display first page + init header
      this.pageChange(1);
      await this.$nextTick();
      await this.initTable();
    },

    onSearchRetrieve() {
      let keyword = (this.retrieveSearch.search || '').trim().toLowerCase();
      if (keyword) {
        let filtered = this.passcodeListData.filter(x => {
          return (x.cus_code || '').toLowerCase().indexOf(keyword) > -1;
        });
        paging.setTotalItems(filtered.length);
        paging.setCurrentPage(1);
        paging.createPagesArray();

        this.displayData = $linq(filtered)
          .skip(paging.skipItems())
          .take(paging.getItemsPerPage())
          .toArray();

        this.$nextTick(() => {
          let agr = this.$refs.agr;
          if (agr) agr.setDisplay(this.displayData);
        });
      } else {
        // ไม่มี keyword — แสดงทั้งหมด
        paging.setTotalItems(this.passcodeListData.length);
        this.pageChange(1);
      }
    },

    /* ─── CRUD ──────────────────────────────────────────── */
    showAppList() {
      return $linq(this.appListData).toArray();
    },
    addcarabal() {
      let itemno =
        this.appListData.length == 0
          ? 1
          : ($linq(this.appListData).select(x => x.itemno).max() || 0) + 1;
      this.appListData.push({
        itemno: itemno++,
        app_type: "",
        app_path_prod: "",
        app_path_demo: "",
      });
    },
    async removeAppList(x) {
      if (!(await $msg.confirm("คุณกำลังจะลบ Path App นี้ โปรดยืนยัน"))) return;
      this.appListData.splice(x, 1);
      let max = 1;
      let q = $linq(this.appListData).orderBy(x => x.itemno);
      $linq(q).foreach(x => { this.$set(x, "itemno", max++); });
    },
    async onDel(x) {
      if (!(await $msg.confirm(`ท่านต้องการจะลบ Passcode : ${x.cus_code} ใช่หรือไม่ ?`))) return;
      let url = `CSM/Tools/DeletePasscode?cus_code=${x.cus_code}`;
      let rsp = await $xt.getServer(url);
      if (!rsp.success) {
        $msg.alert(`เกิดข้อผิดพลาด`, rsp.error, `danger`);
        return;
      }
      $notify.success(this.ui.alert_delete_success);
      this.formData = {};
      await this.loadRetrieve();
    },
    async save() {
      if ($xt.isEmpty(this.formData["cus_code"])) {
        $msg.alert(`Warning`, `Passcode ไม่สามารถเป็นค่าว่างได้`, `warning`);
        return;
      }
      try {
        let form = [{
          itemno: 99999,
          cus_active: "Y",
          cus_code: this.formData["cus_code"],
          user_id: this.formData["user_id"],
          user_pass: this.formData["user_pass"],
          app_path_prod: this.formData["app_path_prod"],
          app_path_demo: this.formData["app_path_demo"],
          line_token: this.formData["line_token"],
        }];
        $linq(this.appListData).foreach(x => { form.push(x); });

        let url = this.isEdit
          ? `CSM/Tools/CustomerDataViewUpdateForEnterprise`
          : `CSM/Tools/CustomerDataViewCreate`;

        page.loadingBox.show();
        let rsp = await $xt.postServerJson(url, { form });
        if (!rsp.success) throw rsp.error;

        this.$refs.add_modal.closeModal();
        await this.loadRetrieve();
        $msg.alert(`ทำรายการเสร็จสิ้น`, `บันทึกข้อมูล Passcode เสร็จสิ้น`, `success`);
      } catch (ex) {
        $msg.alert(`เกิดข้อผิดพลาด`, ex.toString(), `danger`);
      } finally {
        page.loadingBox.hide();
      }
    },
    async editData(x) {
      this.msg = 'เพิ่ม/แก้ไขข้อมูล';
      this.isEdit = true;
      this.$refs.add_modal.openModal();
      this.$refs.add_modal.setSize("modal-xl-2");

      let ac = `CSM/Tools/GeneratePasscodeRead?cus_code=${x.cus_code}`;
      let rsp = await $xt.getServer(ac);
      this.formData = rsp.data;
      this.appListData = rsp.app_list;
      this.appTypeData = rsp.app_type;
    },
    newItems() {
      this.isEdit = false;
      this.formData = {};
      this.appListData = [];
    },
    checkNewItems() {
      this.newItems();
      this.msg = 'รายการข้อมูล';
      this.$refs.add_modal.openModal();
      this.$refs.add_modal.setSize("modal-xl-2");
    },
    onTabChange(t) {
      this.tabActive = t;
    },
  },
  mounted() {
    page = this.$refs.page;
    page.pageTitle = "IT : Create Passcode for Tester";
    document.title = page.pageTitle;

    paging = this.$refs.paging;
    paging.setCurrentPage(1);
    paging.setItemsPerPage(20);

    this.loadRetrieve();
  },
  beforeDestroy() {
    $(document).off('click', '.btn-passcode-edit');
    $(document).off('click', '.btn-passcode-del');
  },
};
export default cpn;
</script>

<style scoped>
/* ─── Modal section cards ────────────────────────────── */
.modal-section-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  margin-bottom: 14px;
  overflow: hidden;
}

.modal-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.modal-section-blue   { background: linear-gradient(135deg, #1a6fa8, #2980b9); }
.modal-section-purple { background: linear-gradient(135deg, #6c3483, #9b59b6); }

.modal-section-body {
  padding: 16px;
}

/* ─── Field labels inside modal ──────────────────────── */
.modal-field-label {
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 4px;
  display: block;
}

.modal-field-required::after {
  content: ' *';
  color: #e53e3e;
}

/* ─── Inner table (App List) ─────────────────────────── */
.modal-inner-table {
  font-size: 12px;
  margin-bottom: 0;
}

.modal-inner-table thead tr {
  background: #f1f3f5;
}

.modal-inner-table thead th {
  font-size: 11px;
  font-weight: 700;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 7px 10px;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.modal-inner-table tbody td {
  padding: 6px 8px;
  vertical-align: middle;
}

.modal-inner-table tbody tr:hover {
  background: #f8f9fa;
}
</style>
