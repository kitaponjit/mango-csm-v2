<template>
  <div class="">
    <table-stick-2>
      <table class="table table-hover table-bordered">
        <thead>
          <tr>
            <th class="tf-1">No.</th>
            <th class="tf-2">Action</th>
            <th class="tf-3">Form Code</th>
            <th class="tf-6">Form Name</th>
            <th class="tf-2">Add User</th>
            <th class="tf-3">Add Date</th>
            <th class="tf-2">Edit User</th>
            <th class="tf-3">Edit Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(x,idx) in customerFormData" :key="idx">
            <td align="center">{{ idx+1 }}</td>
            <td align="center">
              <a class="text-black" href="#" @click.prevent="setEdit(x)"><v-icon name="edit" class="v-icon-width" ></v-icon></a>
              <a class="text-danger" href="#" @click.prevent="onDelForm(x.form_code)"><v-icon name="trash-2" class="v-icon-width"></v-icon></a>
            </td>
            <td>{{x.form_code}}</td>
            <td>{{x.form_name}}</td>
            <td>{{x.adduser}}</td>
            <td align="center">{{x.add_dt|date('DD/MM/YYYY HH:mm')}}</td>
            <td>{{x.edituser}}</td>
            <td align="center">{{x.edit_dt|date('DD/MM/YYYY HH:mm')}}</td>
          </tr>
        </tbody>
      </table>
    </table-stick-2>
    <div class="row">
      <div class="col-lg-12 col-md-12">
        <pagination class="pull-left" ref="form_paging" @page-change="pageChange($event.page)"></pagination>
      </div>
    </div>
    <input type="file" ref="myFile" name="myFile" accept=".doc, .docx, .xls, .xlsx, .txt, .ppt, .pptx, .pdf, .zip, .rar, .mp4, image/*" style="display:none;">
    <!-- ══ Modal: Add / Edit Form ══ -->
    <modal-2 ref="FormModal">
      <template #header>
        <div class="vm-header">
          <i class="fas fa-file-alt vm-header-icon vm-icon-green"></i>
          <span>{{ editMode ? 'แก้ไข Form' : 'เพิ่ม Form' }}</span>
        </div>
      </template>
      <template #body>
        <div class="vm-body">
          <div class="vm-field" style="max-width:260px">
            <label class="vm-label">Form Code <span class="vm-required">*</span></label>
            <div class="vm-input-btn">
              <input type="text" class="vm-input" :class="editMode ? 'vm-input-readonly' : ''" v-model.trim="form.form_code" maxlength="30" :disabled="editMode" readonly>
              <button class="vm-icon-btn" @click="formModal()" :disabled="editMode" v-tooltip="'ค้นหา Form'"><i class="fas fa-search"></i></button>
            </div>
          </div>
          <div class="vm-field vm-mt">
            <label class="vm-label">Form Name</label>
            <input type="text" class="vm-input" v-model.trim="form.form_name" maxlength="100" placeholder="กรอกชื่อ Form...">
          </div>
          <div class="vm-field vm-mt">
            <label class="vm-label">แนบไฟล์</label>
            <file-attach ref="attachAddForm" @uploaded="setAttachFile($event)" document-type="SOweb" :show-upload-file="true"/>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="vm-footer">
          <button class="vm-btn-save" @click="onSaveForm()"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
        </div>
      </template>
    </modal-2>
    <vue-project-list ref="Project" @send-data="setProject($event)"></vue-project-list>
    <vue-form-list ref="form_modal_1" :customer_code="form['customer_code']" :filter_code="filter_code()" @send-data="sendComponent($event)"></vue-form-list>
  </div>
</template>
<script>
  let form_paging ={};

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
        attachFile: [],
        customerFormData: [],
        customerFormAllData: [],
        editMode: false,
        form: {},
        formtype: ""
      }
    },
    methods: {
      async loadFormData() {
        let act = `csm/data/CustomerForm_ReadList?customer_code=${this.customer_code}&skip=${form_paging.skipItems()}&take=${form_paging.getItemsPerPage()}&search_text=${this.search || ''}`;
        let rsp = await $xt.getServer(act);

        this.customerFormData = rsp.data;
        this.customerFormAllData = rsp.data_all
        
        form_paging.setTotalItems(rsp.total || 1);
        if (!form_paging.getItemsPerPage()) {
          form_paging.setCurrentPage(1);
        }
        form_paging.createPagesArray();
      },
      async readFormData(d) {

        let act = `csm/Data/CustomerForm_Read?customer_code=${d.customer_code}&itemno=${d.itemno}&form_code=${d.form_code}`;
        let rsp = await $xt.getServer(act);
        
        this.form = rsp.header
        let rwd = [];
        rsp.detail.forEach((x) => {
          rwd.push({
            pathto: x.filepath,
            docdesc: x.form,
            docfilename: x.form,
            adduser : x.adduser,
            itemno : x.itemno,  
            add_dt : x.edit_dt, 
            customer_code : x.customer_code,
            form_code : x.form_code,
            old_data : true
          });
        });
        this.attachFile = rwd
        this.$refs.attachAddForm.attachFile = rwd
      },
      async onSaveForm() {
        let data = [];
        this.attachFile.forEach((x) => {
          data.push({
            filepath: x.pathto,
            form: x.docfilename,
            add_dt : x.old_data == true ?  x.add_dt : null,
            adduser :x.old_data == true ? x.adduser : null,
          });
        });
        try {
          this.$set(this.form, 'customer_code', this.customer_code)
          let f = {
            header: this.form,
            detail : data
          };

          let act = `CSM/Data/CustomerForm_Create`;
          if (this.editMode) {
            act = `CSM/Data/CustomerForm_Update`;
          }
          this.$emit("loading" , "show")
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          this.$refs.FormModal.closeModal()
          await this.loadFormData();
          $msg.alert(``, `Success`, `success`);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          this.$emit("loading" , "hide")
        }
      },
      async onDelForm(x) {
        if (!await $msg.confirm(`ต้องการลบข้อมูล ${x} ใช่หรือไม่`)) {
          return;
        }
        try {
          let f = {
            customer_code: this.customer_code,
            form_code: x
          };
          let act = `CSM/Data/CustomerForm_Delete`;
          this.$emit('loading' , 'show');
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          await this.loadFormData();
          $msg.alert(``, `Success`, `success`);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          this.$emit('loading' , 'hide');
        }
      },
      resetForm() {
        this.form = {}
        this.$refs.attachAddForm.clearFile();
        this.editMode = false
      },
      pageChange(pn){
        pn = pn || 1;
        form_paging.setCurrentPage(pn);
        this.loadFormData();
      },
      formModal(){
        this.$refs.form_modal_1.$refs.paging.setCurrentPage(1)
        this.$refs.form_modal_1.retrieveSearch.text=""
        this.$refs.form_modal_1.openModal()
      },
      filter_code(){
        return $linq(this.customerFormAllData).select(x => x.form_code).toArray();
      },
      /*Attachfile*/
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
      setAttachFile(e) {
        this.$set(this, 'attachFile', e);
      },
      addFile(type) {
        this.formtype = type != null ? type : "";
        $(this.$refs.myFile).click();
      },
      downLoadFile(x, i) {
        i = i || '';
        let path = x['filepath' + i] || '';
        let name = x['filename' + i] || '';

        return dataServer + `API/File/DownLoad?id=${path}&download=true&filename=${name}`;
      },
      sendComponent(e){
        this.$set(this.form, 'form_code', e.formcode);
        this.$set(this.form, 'form_name', e.formname);
      },
      setEdit(x){
        this.$refs.attachAddForm.showFileName = ''
        this.editMode = true;
        this.readFormData(x);
        this.$refs.FormModal.openModal()
        this.$refs.FormModal.setSize('modal-xl')
      }
    },
    
    mounted() {
      form_paging = this.$refs.form_paging;
      form_paging.setCurrentPage(1);
      form_paging.setItemsPerPage(500);
      
      this.loadFormData();
      this.$nextTick(() => {
        $(this.$refs.myFile).on('change', (e) => {
          this.fileUpload(e.target.files[0]);
        });
      });
    },
  }
</script>

<style scoped>
.vm-header { display:flex; align-items:center; gap:10px; font-size:15px; font-weight:700; color:#fff; width:100%; }
.vm-header-icon { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
.vm-icon-green { background:rgba(255,255,255,.18); color:#fff; }
.vm-body { padding:20px 22px; }
.vm-mt { margin-top:14px; }
.vm-field { display:flex; flex-direction:column; gap:5px; }
.vm-label { font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.4px; margin:0; }
.vm-required { color:#ef4444; }
.vm-input { height:36px; border:1.5px solid #dde3ee; border-radius:7px; padding:0 11px; font-size:13px; color:#334155; background:#f8fafc; outline:none; width:100%; transition:border-color .15s; box-sizing:border-box; }
.vm-input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.1); background:#fff; }
.vm-input-readonly, .vm-input:disabled { background:#f1f5f9 !important; color:#94a3b8; cursor:default; }
.vm-input-btn { display:flex; }
.vm-input-btn .vm-input { border-radius:7px 0 0 7px; border-right:none; }
.vm-icon-btn { width:36px; height:36px; border:1.5px solid #dde3ee; border-left:none; border-radius:0 7px 7px 0; background:#f0f4ff; color:#3b5080; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .15s; }
.vm-icon-btn:hover { background:#3b82f6; color:#fff; border-color:#3b82f6; }
.vm-icon-btn:disabled { opacity:.45; cursor:not-allowed; }
.vm-footer { display:flex; align-items:center; justify-content:flex-end; padding:12px 16px; gap:10px; }
.vm-btn-save { display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:8px; padding:8px 18px; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 2px 8px rgba(16,185,129,.25); transition:opacity .15s; white-space:nowrap; }
.vm-btn-save:hover { opacity:.88; }
</style>