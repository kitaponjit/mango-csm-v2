<template>
  <div class="">
    <table-stick-2>
      <table class="table table-hover table-bordered">
        <thead>
          <tr>
            <th class="tf-1">No.</th>
            <th class="tf-2">Action</th>
            <th class="tf-3">Code</th>
            <th class="tf-5">Description</th>
            <th class="tf-1">Module</th>
            <th class="tf-5">Remark</th>
            <th class="tf-2">Add User</th>
            <th class="tf-3">Add Date</th>
            <th class="tf-2">Edit User</th>
            <th class="tf-3">Edit Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(x,idx) in customerFlowData" :key="idx">
            <td align="center">{{ x.item || idx+1 }}</td>
            <td align="center">
              <a class="text-black" href="#" @click.prevent="setEdit(x)"><v-icon name="edit" class="v-icon-width"></v-icon></a>
              <a class="text-danger" href="#" @click.prevent="onDelFlow(x.flow_code)"><v-icon name="trash-2" class="v-icon-width"></v-icon></a>
            </td>
            <td>{{x.flow_code}}</td>
            <td>{{x.flow_name}}</td>
            <td>{{x.module}}</td>
            <td>{{x.remark}}</td>
            <td>{{x.adduser}}</td>
            <td align="center">{{$date(x.add_dt, 'DD/MM/YYYY HH:mm')}}</td>
            <td>{{x.edituser}}</td>
            <td align="center">{{$date(x.edit_dt, 'DD/MM/YYYY HH:mm')}}</td>
          </tr>
        </tbody>
      </table>
    </table-stick-2>
    <div class="row">
      <div class="col-lg-12 col-md-12">
        <pagination class="pull-left" ref="flow_paging" @page-change="pageChange($event.page,'flow')"></pagination>
      </div>
    </div>  
    <!-- ══ Modal: Add / Edit Flow ══ -->
    <modal-2 ref="FlowModal">
      <template #header>
        <div class="vm-header">
          <i class="fas fa-random vm-header-icon vm-icon-teal"></i>
          <span>{{ editMode ? 'แก้ไข Flow' : 'เพิ่ม Flow' }}</span>
        </div>
      </template>
      <template #body>
        <div class="vm-body">
          <div class="vm-field-row">
            <div class="vm-field" style="flex:0 0 200px">
              <label class="vm-label">Flow Code <span class="vm-required">*</span></label>
              <div class="vm-input-btn">
                <input type="text" class="vm-input" :class="editMode ? 'vm-input-readonly' : ''" maxlength="30" v-model.trim="form.flow_code" :disabled="editMode" readonly>
                <button class="vm-icon-btn" @click="addNew()" :disabled="editMode" v-tooltip="'ค้นหา Flow'"><i class="fas fa-search"></i></button>
              </div>
            </div>
            <div class="vm-field" style="flex:0 0 160px">
              <label class="vm-label">Module</label>
              <select class="vm-select" v-model.trim="form.module">
                <option v-for="x in moduleCodeData" :key="x" :value="x">{{x}}</option>
              </select>
            </div>
          </div>
          <div class="vm-field vm-mt">
            <label class="vm-label">Description <span class="vm-required">*</span></label>
            <input type="text" class="vm-input vm-input-readonly" v-model.trim="form.flow_name" maxlength="100" readonly>
          </div>
          <div class="vm-field vm-mt">
            <label class="vm-label">Remark</label>
            <textarea class="vm-textarea" rows="3" maxlength="1000" v-model.trim="form.remark" placeholder="กรอกหมายเหตุ..."></textarea>
            <span class="vm-hint">{{ (form.remark || '').length }} / 1000</span>
          </div>
          <div class="vm-field vm-mt">
            <label class="vm-label">แนบไฟล์</label>
            <file-attach ref="attachAddFlow" @uploaded="setAttachFile($event)" document-type="SOweb" :show-upload-file="true"/>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="vm-footer">
          <button class="vm-btn-save" @click="onSaveFlow()"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
        </div>
      </template>
    </modal-2>

    <!-- ══ Modal: เลือก Workflow ══ -->
    <modal-2 ref="WorkFlowModal">
      <template #header>
        <div class="vm-header">
          <i class="fas fa-project-diagram vm-header-icon vm-icon-purple"></i>
          <span>เลือก Workflow</span>
        </div>
      </template>
      <template #body>
        <div class="vm-body">
          <div class="vm-table-wrap">
            <table class="vm-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(x,idx) in WorkflowData" :key="idx" class="vm-row-clickable" @click="sendComponent(x)">
                  <td><span class="vm-code-tag">{{x.flow_code}}</span></td>
                  <td>{{x.flow_name}}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="vm-paging-wrap">
            <pagination ref="workflow_paging" @page-change="pageChange($event.page,'workflow')"></pagination>
          </div>
        </div>
      </template>
      <template #footer><div></div></template>
    </modal-2>
    <input type="file" ref="myFile" name="myFile" accept=".doc, .docx, .xls, .xlsx, .txt, .ppt, .pptx, .pdf, .zip, .rar, .mp4, image/*" style="display:none;">
  </div>
</template>
<script>
let flow_paging = {};
var workflow_paging = {}
export default {
  props : {
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
      ui: window.ui,
      attachFile: [],
      getAttachFile:[],
      customerFlowData: [],
      WorkflowData: [],
      editMode : false,
      moduleCodeData,
      form: {},
      formtype: "",
    }
  },
  methods: {
    async loadFlowData() {
      let act = `csm/data/CustomerFlow_ReadList?customer_code=${this.customer_code}&skip=${flow_paging.skipItems()}&take=${flow_paging.getItemsPerPage()}&search_text=${this.search || ''}`;
      let rsp = await $xt.getServer(act);

      this.customerFlowData = rsp.data;

      let i = flow_paging.skipItems() == 0 ? 0 : flow_paging.skipItems()
        this.customerFlowData.forEach((x) => {
          this.$set(x , 'item', ++i)
        })

      flow_paging.setTotalItems(rsp.total || 1);
      if (!flow_paging.getItemsPerPage()) {
        flow_paging.setCurrentPage(1);
      }
      flow_paging.createPagesArray();
    },
    async readFlowData(d) {

    let act = `csm/Data/CustomerFlow_Read?customer_code=${d.customer_code}&itemno=${d.itemno}&flow_code=${d.flow_code}`;
    let rsp = await $xt.getServer(act);

    this.form = rsp.header
    let rwd = [];
    rsp.detail.forEach((x, idx) => {
      rwd.push({
        pathto: x.filepath,
        docdesc: x.filename,
        docfilename: x.filename,
        adduser : x.adduser,
        itemno : idx+1,  
        add_dt : x.add_dt, 
        customer_code : x.customer_code,
        flow_code : x.flow_code,
        old_data : true
      });
    });
    this.$set(this ,"attachFile" , rwd )
    
    this.$refs.attachAddFlow.attachFile = rwd
    },
    async loadWorkflowData() {
      let act = `csm/master/Flow_ReadList?skip=${workflow_paging.skipItems()}&take=${workflow_paging.getItemsPerPage()}&search_text=${this.search.text || ''}`;
      let rsp = await $xt.getServer(act);

      this.WorkflowData = rsp.data.data;

      workflow_paging.setTotalItems(rsp.data.total || 1);
      if (!workflow_paging.getItemsPerPage()) {
        workflow_paging.setCurrentPage(1);
      }
      workflow_paging.createPagesArray();
    },
    async onSaveFlow() {
      if(this.form.flow_code == null || '' ){
        await $msg.alert(`คำเตือน`, 'กรุณาเลือก Flow code ', 'warning')
        return
      }
      let data = [];
      this.attachFile.forEach((x) => {
          data.push({
            filepath: x.pathto || x.filepath,
            filename: x.docfilename || x.filename,
            add_dt : x.old_data == true ?  x.add_dt : null,
            adduser :x.old_data == true ? x.adduser : null,
          });
        });       
      try {
        this.$set(this.form, "customer_code", this.customer_code)
        let f = {
          header: this.form,
          detail : data
        }

        let act = `CSM/Data/CustomerFlow_Create`
        if(this.editMode){
          act = `CSM/Data/CustomerFlow_Update`
        }
        
        this.$emit('loading' , 'show');
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) {
          throw rsp.error;
        }
        await this.$refs.FlowModal.closeModal();
        await this.loadFlowData();
        $msg.alert(``, `Success` , `success`)
        
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      }finally{
        this.$emit('loading' , 'hide');
      }
    },
    async onDelFlow(x) {
      if (!await $msg.confirm(`ต้องการลบข้อมูล ${x} ใช่หรือไม่`)) {
        return;
      }
      try {
        let f = {
          customer_code: this.customer_code,
          flow_code: x
        };
        let act = `CSM/Data/CustomerFlow_Delete`;
        this.$emit('loading' , 'show')
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) {
          throw rsp.error;
        }

        await this.loadFlowData();
        $msg.alert(``, `Success`, `success`);
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
        this.$emit('loading' , 'hide')
      }
    },
    setEdit(x) {
      this.$refs.attachAddFlow.clearFile()
      this.editMode = true;
      this.readFlowData(x);
      this.$refs.FlowModal.openModal();
      this.$refs.FlowModal.setSize('modal-xl');
    },
    sendComponent(e) {
      this.$set(this.form, 'flow_code', e.flow_code);
      this.$set(this.form, 'flow_name', e.flow_name);
      this.$refs.WorkFlowModal.closeModal()
    },
    resetFlow (){
      this.editMode = false;
      this.form ={}
    },
    pageChange(pn , keyword){
      switch (keyword) {
        case 'flow':
          pn = pn || 1;
          flow_paging.setCurrentPage(pn);
          this.loadFlowData();
          break;
        case 'workflow':
          pn = pn || 1;
          workflow_paging.setCurrentPage(pn);
          this.loadWorkflowData();
          break;
      }
    },
    async addNew(){
      this.editMode = false;
      this.loadWorkflowData();
      this.$refs.WorkFlowModal.openModal();
    },
    /*Attachfile*/
    setAttachFile(e) {
      this.$set(this, 'attachFile', e);
    },
    addFile(type) {
      this.formtype = type != null ? type : "";
      $(this.$refs.myFile).click();
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
        this.$set(this.form, `filepath${this.formtype}`, r.id || "");
        this.$set(this.form, `filename${this.formtype}`, r.filename || "");
      }
      catch (ex) {
        $msg.alert('', ex.toString(), 'danger');
      }
    },
    downLoadFile(x, i) {
      i = i || '';
      let path = x['filepath' + i] || '';
      let name = x['filename' + i] || '';

      return dataServer + `API/File/DownLoad?id=${path}&download=true&filename=${name}`;
    },
    getFileExt(f) {
      if (!$xt.isEmpty(f)) {
        return f.split('.').pop().toLowerCase();
      }
    },
    createFilePath(x) {
      return dataServer + "Api/File/DownLoad?id=" + x
    },
  },
  mounted() {
    flow_paging = this.$refs.flow_paging;
    flow_paging.setCurrentPage(1);
    flow_paging.setItemsPerPage(500);

    workflow_paging = this.$refs.workflow_paging;
    workflow_paging.setCurrentPage(1);
    workflow_paging.setItemsPerPage(10);
    this.loadFlowData();
    this.$nextTick(() => {
      $(this.$refs.myFile).on('change', (e) => {
        this.fileUpload(e.target.files[0]);
      });
    });
  },
}
</script>

<style scoped>
/* ── Modal shared (vm-*) ── */
.vm-header { display:flex; align-items:center; gap:10px; font-size:15px; font-weight:700; color:#fff; width:100%; }
.vm-header-icon { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
.vm-icon-teal   { background:rgba(255,255,255,.18); color:#fff; }
.vm-icon-purple { background:rgba(255,255,255,.18); color:#fff; }
.vm-body { padding:20px 22px; }
.vm-mt  { margin-top:14px; }
.vm-field { display:flex; flex-direction:column; gap:5px; }
.vm-field-row { display:flex; flex-wrap:wrap; gap:14px; align-items:flex-start; }
.vm-label { font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.4px; margin:0; }
.vm-required { color:#ef4444; }
.vm-hint { font-size:11px; color:#94a3b8; text-align:right; }
.vm-input { height:36px; border:1.5px solid #dde3ee; border-radius:7px; padding:0 11px; font-size:13px; color:#334155; background:#f8fafc; outline:none; width:100%; transition:border-color .15s; box-sizing:border-box; }
.vm-input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.1); background:#fff; }
.vm-input-readonly, .vm-input:disabled { background:#f1f5f9 !important; color:#94a3b8; cursor:default; }
.vm-select { height:36px; border:1.5px solid #dde3ee; border-radius:7px; padding:0 10px; font-size:13px; color:#334155; background:#f8fafc; outline:none; width:100%; cursor:pointer; }
.vm-select:focus { border-color:#3b82f6; }
.vm-textarea { border:1.5px solid #dde3ee; border-radius:7px; padding:10px 12px; font-size:13px; color:#334155; background:#f8fafc; outline:none; width:100%; resize:vertical; line-height:1.6; transition:border-color .15s; }
.vm-textarea:focus { border-color:#3b82f6; background:#fff; }
.vm-input-btn { display:flex; }
.vm-input-btn .vm-input { border-radius:7px 0 0 7px; border-right:none; }
.vm-icon-btn { width:36px; height:36px; border:1.5px solid #dde3ee; border-left:none; border-radius:0 7px 7px 0; background:#f0f4ff; color:#3b5080; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .15s; }
.vm-icon-btn:hover { background:#3b82f6; color:#fff; border-color:#3b82f6; }
.vm-icon-btn:disabled { opacity:.45; cursor:not-allowed; }
/* Code tag */
.vm-code-tag { display:inline-block; background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; border-radius:5px; padding:2px 8px; font-size:12px; font-weight:700; font-family:monospace; }
/* Table */
.vm-table-wrap { overflow-x:auto; border-radius:8px; border:1px solid #e4e9f2; }
.vm-table { width:100%; border-collapse:collapse; font-size:13px; margin:0; }
.vm-table thead tr th { background:#f7f9fc; color:#475569; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.4px; padding:10px 12px; border-bottom:2px solid #e4e9f2; white-space:nowrap; }
.vm-table tbody tr td { padding:9px 12px; border-bottom:1px solid #f1f5f9; color:#334155; vertical-align:middle; }
.vm-table tbody tr:last-child td { border-bottom:none; }
.vm-row-clickable { cursor:pointer; }
.vm-row-clickable:hover { background:#f0f7ff !important; }
/* Paging */
.vm-paging-wrap { padding:10px 12px; border-top:1px solid #f1f5f9; background:#fafbfc; }
/* Footer */
.vm-footer { display:flex; align-items:center; justify-content:flex-end; padding:12px 16px; gap:10px; }
.vm-btn-save { display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:8px; padding:8px 18px; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 2px 8px rgba(16,185,129,.25); transition:opacity .15s; white-space:nowrap; }
.vm-btn-save:hover { opacity:.88; }
</style>