<template>
  <div class="cx-page">
    <customer-page ref="page">
      <template slot="body">
        <div class="cx-hero">
          <span class="cx-hero__icon"><i class="fa fa-fw fa-users"></i></span>
          <div class="cx-hero__body">
            <h2 class="cx-hero__title">{{customer_name}}</h2>
            <p class="cx-hero__sub">ปะหน้า ({{formcode}}) {{formname}}</p>
          </div>
          <span class="cx-chip"><i class="fas fa-file-signature"></i> ตรวจรับฟอร์มเอกสาร</span>
        </div>

        <div class="box box-solid">
          <div class="box-body">
            <div class="nav-tabs-custom">
              <ul class="nav nav-tabs">
                <li v-for="x in tabData" v-bind:class="{'active':x.id==tabSelected}" v-show="x.show">
                  <a href="#" v-on:click.prevent="mainTabSelected(x)">
                    <label class="label label-success" v-if="x.total > 0">{{x.total}}</label>
                    {{x.text}}
                    <span v-if="x.badge">({{x.badge}})</span>
                  </a>
                </li>
              </ul>
              <div class="tab-content tab-box">
                <div class="tab-pane" v-bind:class="{'active':tabSelected}">
                  <div class="panel cx-panel" v-bind:class="{'cx-panel--done': (idx+1) <= 2, 'cx-panel--wait': (idx+1) > 2}" v-for="(x, idx) in data" v-if="tabSelected == 'tab1' ? x.active == 'N' : x.active == 'Y' ">
                    <div class="panel-heading">
                      <h3 class="panel-title"><i class="fas fa-file-alt"></i> CSM No. {{x.job_no}} (ครั้งที่ {{idx+1}})</h3>
                      <span class="label label-success" v-if="x.active == 'Y'"><i class="fas fa-check"></i> ลงชื่อแล้ว</span>
                      <span class="label label-warning" v-else><i class="far fa-clock"></i> รอลงชื่อ</span>
                    </div>
                    <div class="panel-body">
                      <div class="cx-def">
                        <div class="cx-def__k">Description</div>
                        <div class="cx-def__v">
                          <label class="cx-def__box">{{x.detail}}</label>
                        </div>

                        <div class="cx-def__k">Attach File By IT</div>
                        <div class="cx-def__v">
                          <div class="cx-filebar cx-filebar--named">
                            <a v-for="(x,idx) in x.qa" v-bind:href="createFilePath(x.filepath)" target="_blank" :title="x.filename">
                              <i class="fas fa-file-word" v-if="['doc','docx'].includes(getFileExt(x.filename))"></i>
                              <i class="fas fa-file-excel" v-else-if="['xls','xlsx'].includes(getFileExt(x.filename))"></i>
                              <i class="fas fa-file-powerpoint" v-else-if="['ppt','pptx'].includes(getFileExt(x.filename))"></i>
                              <i class="fas fa-file-pdf" v-else-if="['pdf'].includes(getFileExt(x.filename))"></i>
                              <i class="fas fa-file" v-else=""></i>
                              <span class="cx-filebar__name">{{x.filename}}</span>
                            </a>
                          </div>
                        </div>

                        <div class="cx-def__k">{{is_dev() ? 'Choose file' : 'Additional Attachments'}}</div>
                        <div class="cx-def__v">
                          <span class="cx-warn-text" v-show="x.signature == null && is_dev()">คุณจะทำการอัปโหลดไฟล์ได้ หลังจากที่ CSM ใบนี้ได้รับลายเซ็นต์แล้วเท่านั้น</span>
                          <span class="cx-dash" v-if="x.filepath == null && !is_dev()">-</span>
                          <div class="cx-filebar cx-filebar--named" v-if="x.filepath != null">
                            <a v-for="(x,idx) in x.qa" v-bind:href="createFilePath(x.filepath)" target="_blank" :title="x.filename">
                              <i class="fas fa-file-word" v-if="['doc','docx'].includes(getFileExt(x.filename))"></i>
                              <i class="fas fa-file-excel" v-else-if="['xls','xlsx'].includes(getFileExt(x.filename))"></i>
                              <i class="fas fa-file-powerpoint" v-else-if="['ppt','pptx'].includes(getFileExt(x.filename))"></i>
                              <i class="fas fa-file-pdf" v-else-if="['pdf'].includes(getFileExt(x.filename))"></i>
                              <i class="fas fa-file" v-else=""></i>
                              <span class="cx-filebar__name">{{x.filename}}</span>
                            </a>
                          </div>
                          <div v-show="x.signature != null && is_dev()">
                            <button class="cx-btn cx-btn--ghost custom-file-input" @click="addFile()"><i class="fas fa-upload"></i> Browse..</button>
                            <!-- Input Attach File -->
                            <input type="file" ref="myFile" name="myFile" accept=".doc, .docx, .xls, .xlsx, .txt, .ppt, .pptx, .pdf, .zip, .rar, image/*" style="display:none;">
                          </div>
                        </div>

                        <div class="cx-def__k">Signature</div>
                        <div class="cx-def__v">
                          <div class="cx-signrow">
                            <input type='checkbox' class='ios8-switch' id='checkbox-1' v-model.trim="x.active" true-value="Y" false-value="N" disabled>
                            <label for='checkbox-1'></label>
                            <div v-show="x.signature || !is_dev()">
                              <button v-if="tabSelected == 'tab1'" class="cx-btn cx-btn--primary" @click="openSignature(x)"><i class="fa fa-pencil-alt"></i> ลงชื่อตรวจรับฟอร์ม</button>
                              <span v-if="tabSelected == 'tab2'" class="label label-info"><i class="fa fa-pencil-alt"></i> Signature By : {{x.signature}}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="cx-empty" v-if="!data.filter(w => tabSelected == 'tab1' ? w.active == 'N' : w.active == 'Y').length">
                    <i class="fas fa-inbox"></i>
                    {{ tabSelected == 'tab1' ? 'ไม่มีฟอร์มที่รอลงชื่อตรวจรับ' : 'ยังไม่มีประวัติการลงชื่อ' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </customer-page>
    <!-- Modal : Signature -->
    <div class="modal fade" id="signatureModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h4 class="modal-title"><i class="fas fa-file-signature"></i> <label id="modalTitle"></label></h4>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Signature</label>
              <input type="text" class="form-control" v-model="formData.signature" v-bind:readonly="isReadOnly" placeholder="Enter signature here...">
            </div>
          </div>
          <div class="modal-footer" v-show="!isReadOnly">
            <button type="button" class="btn btn-sm btn-github" v-on:click="save()">ยืนยันการตรวจรับฟอร์ม</button>
          </div>
          <div class="modal-footer" v-show="isReadOnly">
            <button type="button" class="btn btn-sm btn-default" data-dismiss="modal">ปิดหน้าต่าง</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/javascript">
  let page = {};
  let cpn = {
    data() {
      return {
        accept: '',
        auth,
        ui: window.ui,
        baseUrl,
        data: [],
        sort_key: '',
        sort_type: 'asc',
        customer_name: '',
        formcode: '',
        formname: '',
        formData: {},
        qString: queryString,
        department: auth.department,
        attachmentData: [],
        editDetailData: {},
        tabData: [],
        tabSelected: '',
      }
    },
    methods: {
      addFile() {
        $(this.$refs.myFile).click();
      },
      async loadRetrieve() {
        let url = `CSM/CustomerData/FormSignRead?customer_code=${this.qString.customer_code}&formcode=${this.qString.formcode}`;

        let rsp = await $xt.getCustomerServer(url);
        this.data = rsp.data;
        this.customer_name = rsp.customer_name;
        this.formcode = this.qString.formcode;
        this.formname = rsp.formname;
        this.attachmentData = rsp.data.qa;

        page.pageTitle = this.customer_name;
        document.title = page.pageTitle;

        this.getTabTotal('tab1', $linq(this.data).where(w => w.active == "N").count());
        this.getTabTotal('tab2', $linq(this.data).where(w => w.active == "Y").count());

      },
      getFileExt(f) {
        return f.split('.').pop().toLowerCase();
      },
      createFilePath(x) {
        /* B = Requestor , A = Worker , Y = Checker , T = Update List */
        return dataServer + "Api/File/DownLoad?id=" + x
      },
      async save() {
        if (this.formData.signature == "" || $xt.isEmpty(this.formData.signature)) {
          $alert('Error', 'กรุณากรอก Signature', 'danger')
          return
        }
        //$loadingBox.show();
        try {
          this.formData.formcode = this.qString.formcode;
          let f = {
            form: this.formData,
          };
          let url = `CSM/CustomerData/FormCreate`;
          let rsp = await $xt.postCustomerJson(url, f);

          if (!rsp.success) {
            throw rsp.error;
          }
          this.isReadOnly = true;
          $msg.alert(``, `Success`, `success`);
          await this.loadRetrieve();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          //$loadingBox.hide();
        }
      },
      openSignature(x) {
        //$refs.modalsm.openModal()
        $("#signatureModal").modal("show");
        $("#modalTitle").text(x.job_no);

        //this.isReadOnly = !String.isNullOrEmpty(x.signature);
        this.signature = x.signature;

        if (this.isReadOnly) {
          $('#sigReadOnly').signature('enable').signature('draw', x.signature).signature('disable');
        }

        this.formData = {
          job_no: x.job_no,
          ref_itemno: x.itemno,
          pre_event: x.pre_event,
          customer_code: x.customer_code,
          //filepath: this.chooseData.filepath,
          //filename: this.chooseData.filename,
        };
      },
      async fileUpload(file) {
        alert('FileUp');
        let f = new FormData();
        f.append("file", file);
        try {
          let r = await $xt.postServerForm('Data/CSM_FileUploadToTemp', f);
          if (!r.success) {
            throw r.error;
          }
          /* หากสำเร็จจะทำการ Push Data ลงใน attachmentData */
          let itemno = (this.attachmentData.length == 0 ? 0 : ($linq(this.attachmentData).max(x => x.itemno) || 0)) + 1;
          this.attachmentData.push({
            itemno: itemno,
            item_type: "A",
            filepath: r.id || "",
            filename: r.filename || "",
            ref_itemno: this.attachmentData.ref_itemno,
            add_user: this.auth.userid,
            add_dt: new Date(),
          });
        }
        catch (ex) {
          $msg.alert('', ex.toString(), 'danger');
        }
      },
      clearSignature() {
        //$('#sig').signature('clear');
      },
      is_dev() {
        return this.department == 'IT';
      },
      is_implement() {
        return this.department == 'IM';
      },
      getTabTotal(id, field) {
        $linq(this.tabData).where(x => x.id == id).foreach(x => {
          x.total = field;
        });
      },
      mainTabSelected(x) {
        this.tabSelected = x.id;
      },
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = 'ตรวจรับฟอร์มเอกสาร';
      document.title = page.pageTitle;

      this.tabData = [
        { id: 'tab1', icon: '', text: 'Signature Request', show: true, total: 0 },
        { id: 'tab2', icon: '', text: 'Signature History', show: true, total: 0 },
      ];

      this.mainTabSelected({ 'id': 'tab1' });

      this.loadRetrieve();

      this.$nextTick(() => {
        $(this.$refs.myFile).on('change', (e) => {
          this.fileUpload(e.target.files[0]);
        })
      })
    }
  };
  export default cpn;
</script>
