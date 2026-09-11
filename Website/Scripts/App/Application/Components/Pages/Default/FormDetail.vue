<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-solid">
          <div class="box-body">
            <div class="col-lg-6">
              <div class="small-box bg-aqua1 pointer">
                <div class="inner">
                  <h4 class="font-bold">{{customer_name}}</h4>
                  <p>ปะหน้า ({{formcode}}) {{formname}}</p>
                  <label></label>
                  <div class="icon" size="small">
                    <i class="fa fa-fw fa-users"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="box-body">
              <div class="row">
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
                      <div class="row">
                        <div class="col-lg-12">
                          <div class="panel" v-bind:class="{'panel-custom-success': (idx+1) <= 2, 'panel-custom-danger': (idx+1) > 2}" v-for="(x, idx) in data" v-if="tabSelected == 'tab1' ? x.active == 'N' : x.active == 'Y' ">
                            <div class="panel-heading " v-bind:class="{'panel-heading-success': (idx+1) <= 2, 'panel-heading-danger': (idx+1) > 2}">
                              <h3 class="panel-title">CRM No. {{x.job_no}} (ครั้งที่ {{idx+1}})</h3>
                            </div>
                            <div class="panel-body">
                              <div class="row">
                                <div class="col-md-12">
                                  <div class="row">
                                    <div class="form-group">
                                      <label class="col-lg-2 control-label text-right">Description</label>
                                      <div class="col-md-4">
                                        <label class="form-control" style="white-space:pre-wrap;height:auto ">{{x.detail}}</label>
                                      </div>
                                    </div>
                                  </div>
                                  <br />
                                  <div class="row">
                                    <div class="form-group">
                                      <label class="col-lg-2 control-label text-right">Attach File By IT</label>
                                      <div class="col-lg-10">
                                        <a v-for="(x,idx) in x.qa" v-bind:href="createFilePath(x.filepath)" target="_blank">
                                          <i class="fas fa-file-word fa-2x" v-if="['doc','docx'].includes(getFileExt(x.filename))"></i>
                                          <i class="fas fa-file-excel fa-2x" v-else-if="['xls','xlsx'].includes(getFileExt(x.filename))"></i>
                                          <i class="fas fa-file-powerpoint fa-2x" v-else-if="['ppt','pptx'].includes(getFileExt(x.filename))"></i>
                                          <i class="fas fa-file-pdf fa-2x" v-else-if="['pdf'].includes(getFileExt(x.filename))"></i>
                                          <i class="fas fa-file fa-2x" v-else=""></i>
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                  <br />
                                  <div class="row">
                                    <div class="form-group">
                                      <label class="col-lg-2 control-label text-right">{{is_dev() ? 'Choose file' : 'Additional Attachments'}}</label>
                                      <label class="col-lg-10 control-label text-danger" v-show="x.signature == null && is_dev()">คุณจะทำการอัปโหลดไฟล์ได้ หลังจากที่ CRM ใบนี้ได้รับลายเซ็นต์แล้วเท่านั้น</label>
                                      <div class="col-lg-10" v-if="x.filepath == null && !is_dev()">-</div>
                                      <div class="col-lg-10" v-if="x.filepath != null">
                                        <a v-for="(x,idx) in x.qa" v-bind:href="createFilePath(x.filepath)" target="_blank">
                                          <i class="fas fa-file-word fa-2x" v-if="['doc','docx'].includes(getFileExt(x.filename))"></i>
                                          <i class="fas fa-file-excel fa-2x" v-else-if="['xls','xlsx'].includes(getFileExt(x.filename))"></i>
                                          <i class="fas fa-file-powerpoint fa-2x" v-else-if="['ppt','pptx'].includes(getFileExt(x.filename))"></i>
                                          <i class="fas fa-file-pdf fa-2x" v-else-if="['pdf'].includes(getFileExt(x.filename))"></i>
                                          <i class="fas fa-file fa-2x" v-else=""></i>
                                        </a>
                                      </div>
                                      <div class="col-lg-10" v-bind:class="{'col-lg-offset-2': x.filepath != null}" v-show="x.signature != null && is_dev()">
                                        <div class="form-group">
                                          <div class="col-md-5">
                                            <div class="input-group">
                                              <button class="btn btn-sm bg-navy custom-file-input" @click="addFile()"><i class="fas fa-upload"></i> Browse..</button>
                                              <!-- Input Attach File -->
                                              <input type="file" ref="myFile" name="myFile" accept=".doc, .docx, .xls, .xlsx, .txt, .ppt, .pptx, .pdf, .zip, .rar, image/*" style="display:none;">
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <br />
                                  <div class="row">
                                    <div class="form-group">
                                      <label class="col-lg-2 control-label text-right">Signature</label>
                                      <div class="col-lg-10">
                                        <div class="form-group">
                                          <div class="input-group">
                                            <input type='checkbox' class='ios8-switch' id='checkbox-1' v-model.trim="x.active" true-value="Y" false-value="N" disabled>
                                            <label for='checkbox-1'></label>
                                            <div class="input-group-btn" v-show="x.signature || !is_dev()">
                                              <button v-if="tabSelected == 'tab1'" class="btn-primary btn-xs signature" @click="openSignature(x)"><i class="fa fa-pencil-alt"></i> Signature By :</button>
                                              <button v-if="tabSelected == 'tab2'" class="btn-primary btn-xs signature"><i class="fa fa-pencil-alt"></i> Signature By : {{x.signature}}</button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </re-page>
    <!-- Modal : Signature -->
    <div class="modal fade" id="signatureModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h4 class="modal-title"><label id="modalTitle"></label></h4>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Signature:</label>
              <input type="text" class="form-control" v-model="formData.signature" v-bind:readonly="isReadOnly" placeholder="Enter signature here...">
            </div>
          </div>
          <div class="modal-footer" v-show="!isReadOnly && is_implement()">
            <button type="button" class="btn btn-primary" v-on:click="save()">Save</button>
          </div>
          <div class="modal-footer" v-show="isReadOnly">
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!--<modal ref="modalsm">
        <template slot="header">
            <div class="row" style="margin-top:10px;margin-bottom:10px;">
                <div class="col-md-12 col-sm-12 col-xs-12">
                    <h4 class="extension-left"><span>Signature By </span></h4>
                </div>
            </div>
        </template>
        <template slot="body">
            <div class="col-lg-12">
                <input class="form-control" placeholder="Signature By Customer" style="text-align:center" />&nbsp;

            </div>
        </template>
        <template slot="footer">
            <div class="col-lg-12" align="center">
                <button class="btn-primary btn-xs signature" @click="Signature()">Confirm</button>
            </div>
        </template>
    </modal>-->
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
        //signature: '',
        tabData: [],
        tabSelected: '',
      }
    },
    methods: {
      addFile() {
        $(this.$refs.myFile).click();
      },
      async loadRetrieve() {
        let url = `CSM/Data/FormDetailRead?customer_code=${this.qString.customer_code}&formcode=${this.qString.formcode}`;

        let rsp = await $xt.getServer(url);
        this.data = rsp.data;
        this.customer_name = rsp.customer_name;
        this.formcode = this.qString.formcode;
        this.formname = rsp.formname;
        this.$set(this, 'attachmentData', rsp.data.qa);

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
        if (this.formData.signature == "") {
          $alert('Error', 'กรุณากรอก Signature', 'danger')
          return
        }
        //$loadingBox.show();
        try {
          let f = {
            form: this.formData,
          };
          let url = `CSM/Data/FormCreate`;
          let rsp = await $xt.postServerJson(url, f);

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
        this.$set(this, 'signature', x.signature);

        if (this.isReadOnly) {
          $('#sigReadOnly').signature('enable').signature('draw', x.signature).signature('disable');
        }

        this.$set(this, 'formData', {
          job_no: x.job_no,
          ref_itemno: x.itemno,
          pre_event: x.pre_event,
          customer_code: x.customer_code,
          //filepath: this.chooseData.filepath,
          //filename: this.chooseData.filename,
        });
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
          this.$set(x, 'total', field);
        });
      },
      mainTabSelected(x) {
        this.tabSelected = x.id;
      },
    },
    mounted() {
      page = this.$refs.page;

      this.$set(this, 'tabData', [
        { id: 'tab1', icon: '', text: 'Signature Request', show: true, total: 0 },
        { id: 'tab2', icon: '', text: 'Signature History', show: true, total: 0 },
      ]);

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
