<template>
  <div class="">
    <table-stick-2>
      <table class="table table-hover table-bordered">
        <thead>
          <tr>
            <th class="tf-1">No.</th>
            <th class="tf-2">Action</th>
            <th class="tf-3">Config Code</th>
            <th class="tf-8">Description</th>
            <th class="tf-2">Active</th>
            <th class="tf-2">Default</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(x,idx) in customerConfigData" :key="idx">
            <td align="center">{{ x.item || idx+1 }}</td>
            <td align="center">
              <a class="text-black" href="#" @click.prevent="setEdit(x)"><v-icon name="edit" class="v-icon-width"></v-icon></a>
              <a class="text-danger" href="#" @click.prevent="onDelConfig(x.config_code)"><v-icon name="trash-2" class="v-icon-width"></v-icon></a>
            </td>
            <td>{{x.config_code}}</td>
            <td>{{x.config_name || x.remark}}</td>
            <td align="center">{{x.active}}</td>
            <td align="center"><span v-show="x.def_active == 'Y'"><i class="fa fa-check"></i></span></td>
          </tr>
        </tbody>
      </table>
    </table-stick-2>
    <div class="row">
      <div class="col-lg-12 col-md-12">
        <pagination class="pull-left" ref="config_paging" @page-change="pageChange($event.page,'config')"></pagination>
      </div>
    </div>
    <!-- ══ Modal: เลือก Config Code ══ -->
    <modal-2 ref="ConfigCodeModal">
      <template #header>
        <div class="vm-header">
          <i class="fas fa-cog vm-header-icon vm-icon-indigo"></i>
          <span>เลือก Config</span>
        </div>
      </template>
      <template #body>
        <div class="vm-body">
          <div class="vm-field" style="max-width:320px">
            <label class="vm-label">ค้นหา</label>
            <div class="vm-search-wrap">
              <i class="fas fa-search vm-search-ico"></i>
              <input type="text" class="vm-input vm-input-pl" v-model="retrieveSearch['search_text']" @keyup.enter="loadERPConfig()" placeholder="ค้นหา Code หรือ Remark...">
              <button class="vm-search-btn" @click="loadERPConfig()">ค้นหา</button>
            </div>
          </div>
          <div class="vm-table-wrap vm-mt">
            <table class="vm-table">
              <thead>
                <tr>
                  <th class="text-center" style="width:60px">เลือก</th>
                  <th>Code</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(x,idx) in displayERPConfig" :key="idx" style="cursor:pointer" @click="x.selected = !x.selected" :class="{ 'vm-row-selected': x.selected }">
                  <td class="text-center">
                    <label class="vm-checkbox-wrap">
                      <input type="checkbox" v-model="x.selected" @click.stop>
                      <span class="vm-checkbox"></span>
                    </label>
                  </td>
                  <td><span class="vm-code-tag">{{x.code}}</span></td>
                  <td>{{x.remark}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="vm-footer vm-footer-spread">
          <pagination ref="configcode_paging" @page-change="pageChange($event.page,'configcode')"></pagination>
          <button class="vm-btn-save" @click="onSaveConfig()"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
        </div>
      </template>
    </modal-2>

    <!-- ══ Modal: Edit Config ══ -->
    <modal-2 ref="ConfigModal">
      <template #header>
        <div class="vm-header">
          <i class="fas fa-edit vm-header-icon vm-icon-blue"></i>
          <span>Edit Config</span>
        </div>
      </template>
      <template #body>
        <div class="vm-body">
          <div class="vm-field-row">
            <div class="vm-field" style="flex:0 0 200px">
              <label class="vm-label">Config Code</label>
              <input type="text" class="vm-input vm-input-readonly" v-model.trim="form.config_code" maxlength="30" readonly>
            </div>
            <div class="vm-field vm-field-grow">
              <label class="vm-label">Config Name</label>
              <input type="text" class="vm-input vm-input-readonly" v-model.trim="form.config_name" maxlength="2000" readonly>
            </div>
          </div>
          <div class="vm-field vm-mt">
            <label class="vm-label">Description</label>
            <input type="text" class="vm-input" v-model.trim="form.remark" maxlength="2000" placeholder="กรอกคำอธิบาย...">
          </div>
          <div class="vm-field vm-mt">
            <label class="vm-label">Active</label>
            <label class="vm-toggle-wrap" :class="{ 'is-on': form.active === 'Y' }">
              <input type="checkbox" v-model="form.active" true-value="Y" false-value="N">
              <span class="vm-toggle-pill">
                <i :class="form.active === 'Y' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                {{ form.active === 'Y' ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
              </span>
            </label>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="vm-footer">
          <button class="vm-btn-save" @click="onSaveConfig()"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
        </div>
      </template>
    </modal-2>
  </div>
</template>
<script>
  let config_paging = {};
  let configcode_paging = {}
  export default {
    props: {
      customer_code : {
        type : String,
        default : ""
      },
      search : {
        type : String,
        default : ""
      }
    },

  data() {
    return {
      form : {},
      customerConfigData: [],
      customerConfigDataAll: [],
      displayConfig: [],
      displayERPConfig: [],
      ERPConfigData: [],
      configERPList: [],
      pageNumber: 1,
      retrieveSearch: {},
    }
  },
  methods: {
    async loadCustConfig() {
      let act = `csm/data/CustomerConfig_ReadList?customer_code=${this.customer_code}&skip=${config_paging.skipItems()}&take=${config_paging.getItemsPerPage()}&search_text=${this.search || ''}`;
      let act_all = `csm/data/CustomerConfig_ReadList?customer_code=${this.customer_code}`;
      let rsp = await $xt.getServer(act);
      let rsp_all = await $xt.getServer(act_all);

      this.customerConfigData = rsp.data;
      this.customerConfigDataAll = rsp_all.data_all

      let i = config_paging.skipItems() == 0 ? 0 : config_paging.skipItems()
        this.customerConfigData.forEach((x) => {
          this.$set(x , 'item', ++i)
        })

      config_paging.setTotalItems(rsp.total || 1);
      if (!config_paging.getItemsPerPage()) {
        config_paging.setCurrentPage(1);
      }
      config_paging.createPagesArray();
    },
    async loadERPConfig() {
      
      let act = `csm/Tools/ERPconfig_ReadList?search_text=${this.retrieveSearch.search_text || ''}`;
      let rsp = await $xt.getServer(act);

      this.configERPList = rsp.data;
      var nameConfig = new Set(this.customerConfigDataAll.map(x => x.config_code))
      this.configERPList = this.configERPList.filter(y => !nameConfig.has(y.code))

      this.$set(this, "displayERPConfig", $linq(this.configERPList).skip(configcode_paging.skipItems()).take(configcode_paging.getItemsPerPage()).toArray());
      this.pageChange(1,"configcode")
      configcode_paging.setTotalItems(this.configERPList.length || 1);
      if (!configcode_paging.getItemsPerPage()) {
        configcode_paging.setCurrentPage(1);  
      }
      configcode_paging.createPagesArray();

    },
    async onSaveConfig() {
      try {
        let d = []
        $linq(this.configERPList).where(x=> x.selected == true).foreach(x=> {
          x.customer_code = this.customer_code
          x.config_code = x.code
        })
        let f = {
          data: $linq(this.configERPList).where(x=> x.selected == true).toArray() || []
        };
        let act = `CSM/Data/CustomerConfig_Create`;
        if (this.editMode) {
          act = `CSM/Data/CustomerConfig_Update`;
        }
        this.$emit("loading", "show")
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) {
          throw rsp.error;
        }
        this.$refs.ConfigCodeModal.closeModal()
        await this.loadCustConfig();
        $msg.alert(``, `Success`, `success`);
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
        this.$emit("loading" , "hide")
      }
    },
    async onDelConfig(x) {
      if (!await $msg.confirm(`ต้องการลบข้อมูล ${x} ใช่หรือไม่`)) {
        return;
      }
      try {
        let f = {
          customer_code: this.customer_code,
          config_code: x
        };
        let act = `CSM/Data/CustomerConfig_Delete`;
        this.$emit('loading', 'show')
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) {
          throw rsp.error;
        }

        // await this.reset();
        await this.loadCustConfig();
        $msg.alert(``, `Success`, `success`);
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
        this.$emit('loading', 'hide')
      }
    },
    setEdit(x) {
      this.editMode = true;
      this.$set(this, 'form', JSON.parse(JSON.stringify(x)));
      // console.log("setEdit" + type)
      this.$refs.ConfigModal.openModal()
    },
    loadConfigpage(){
      this.$set(this, 'pageNumber' , 1)
      let txt = this.retrieveSearch.search_text || ''
      this.$set(this, "displayERPConfig", $linq(this.configERPList).where(x=> $xt.isEmpty(txt) ? true : (x.code == txt || x.remark == txt)).skip(configcode_paging.skipItems()).take(configcode_paging.getItemsPerPage()).toArray());
     
    },
    setNumberPage(){
      config_paging.setCurrentPage(1);
    },
    pageChange(pn, keyword) {
      switch(keyword) {
        case "config":
          pn = pn || 1;
          config_paging.setCurrentPage(pn);
          this.loadCustConfig();
          break
        case "configcode":
          pn = pn || 1;
          this.pageNumber = pn;
          configcode_paging.setCurrentPage(pn);
          this.$set(this, "displayERPConfig", $linq(this.configERPList).skip(configcode_paging.skipItems()).take(configcode_paging.getItemsPerPage()).toArray());
          configcode_paging.createPagesArray();
          break
      }
    },
    resetConfig() {
      this.retrieveSearch.search_text =""
    },
  },
  mounted() {

    config_paging = this.$refs.config_paging;
    config_paging.setCurrentPage(1);
    config_paging.setItemsPerPage(500);

    configcode_paging = this.$refs.configcode_paging;
    configcode_paging.setCurrentPage(1);
    configcode_paging.setItemsPerPage(10);

    this.loadCustConfig()
    
    },
  }
</script>

<style scoped>
/* ── Modal shared (vm-*) ── */
.vm-header { display:flex; align-items:center; gap:10px; font-size:15px; font-weight:700; color:#fff; width:100%; }
.vm-header-icon { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
.vm-icon-blue   { background:rgba(255,255,255,.18); color:#fff; }
.vm-icon-indigo { background:rgba(255,255,255,.18); color:#fff; }
.vm-ml-auto { margin-left:auto; }
.vm-body { padding:20px 22px; }
.vm-mt  { margin-top:14px; }
.vm-field { display:flex; flex-direction:column; gap:5px; }
.vm-field-row { display:flex; flex-wrap:wrap; gap:14px; align-items:flex-start; }
.vm-field-grow { flex:1; }
.vm-label { font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.4px; margin:0; }
.vm-required { color:#ef4444; }
.vm-hint { font-size:11px; color:#94a3b8; text-align:right; }
.vm-input { height:36px; border:1.5px solid #dde3ee; border-radius:7px; padding:0 11px; font-size:13px; color:#334155; background:#f8fafc; outline:none; width:100%; transition:border-color .15s; box-sizing:border-box; }
.vm-input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.1); background:#fff; }
.vm-input-readonly, .vm-input:disabled { background:#f1f5f9 !important; color:#94a3b8; cursor:default; }
.vm-input-pl { padding-left:34px; }
.vm-select { height:36px; border:1.5px solid #dde3ee; border-radius:7px; padding:0 10px; font-size:13px; color:#334155; background:#f8fafc; outline:none; width:100%; cursor:pointer; }
.vm-select:focus { border-color:#3b82f6; }
.vm-input-btn { display:flex; }
.vm-input-btn .vm-input { border-radius:7px 0 0 7px; border-right:none; }
.vm-icon-btn { width:36px; height:36px; border:1.5px solid #dde3ee; border-left:none; border-radius:0 7px 7px 0; background:#f0f4ff; color:#3b5080; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .15s; }
.vm-icon-btn:hover { background:#3b82f6; color:#fff; border-color:#3b82f6; }
.vm-icon-btn:disabled { opacity:.45; cursor:not-allowed; }
/* Search wrap */
.vm-search-wrap { position:relative; display:flex; }
.vm-search-ico { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:13px; pointer-events:none; }
.vm-search-btn { height:36px; padding:0 14px; background:#3b82f6; color:#fff; border:none; border-radius:0 7px 7px 0; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; }
.vm-search-btn:hover { background:#1d4ed8; }
.vm-search-wrap .vm-input { border-radius:7px 0 0 7px; border-right:none; flex:1; }
/* Toggle pill */
.vm-toggle-wrap { margin:0; cursor:pointer; }
.vm-toggle-wrap input[type="checkbox"] { display:none; }
.vm-toggle-pill { display:inline-flex; align-items:center; gap:7px; padding:8px 18px; border-radius:20px; font-size:13px; font-weight:600; border:1.5px solid #d1d9e6; background:#f4f6fb; color:#7a89a8; transition:all .18s; user-select:none; }
.vm-toggle-wrap.is-on .vm-toggle-pill { background:#ecfdf5; border-color:#6ee7b7; color:#059669; }
/* Table */
.vm-table-wrap { overflow-x:auto; border-radius:8px; border:1px solid #e4e9f2; }
.vm-table { width:100%; border-collapse:collapse; font-size:13px; margin:0; }
.vm-table thead tr th { background:#f7f9fc; color:#475569; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.4px; padding:10px 12px; border-bottom:2px solid #e4e9f2; white-space:nowrap; }
.vm-table tbody tr td { padding:9px 12px; border-bottom:1px solid #f1f5f9; color:#334155; vertical-align:middle; }
.vm-table tbody tr:last-child td { border-bottom:none; }
.vm-table tbody tr:hover { background:#f8fbff; }
.vm-row-selected td { background:#eff6ff !important; }
.vm-row-clickable { cursor:pointer; }
.vm-row-clickable:hover { background:#f0f7ff !important; }
/* Checkbox */
.vm-checkbox-wrap { position:relative; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; margin:0; }
.vm-checkbox-wrap input { display:none; }
.vm-checkbox { width:18px; height:18px; border:2px solid #d1d9e6; border-radius:5px; background:#f8fafc; display:inline-block; transition:all .15s; }
.vm-checkbox-wrap input:checked ~ .vm-checkbox { background:#3b82f6; border-color:#3b82f6; }
.vm-checkbox-wrap input:checked ~ .vm-checkbox::after { content:'✓'; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:700; height:100%; }
/* Code tag */
.vm-code-tag { display:inline-block; background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; border-radius:5px; padding:2px 8px; font-size:12px; font-weight:700; font-family:monospace; }
/* Paging */
.vm-paging-wrap { padding:10px 12px; border-top:1px solid #f1f5f9; background:#fafbfc; }
/* Footer */
.vm-footer { display:flex; align-items:center; justify-content:flex-end; padding:12px 16px; gap:10px; width:100%; }
.vm-footer-spread { justify-content:space-between; gap:24px; }
.vm-btn-save { display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:8px; padding:8px 18px; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 2px 8px rgba(16,185,129,.25); transition:opacity .15s; white-space:nowrap; }
.vm-btn-save:hover { opacity:.88; }
</style>