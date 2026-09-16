<template>
  <div class="cx-page">
    <customer-page ref="page">
      <template #body>
        <!-- Summary -->
        <div class="cx-hero">
          <span class="cx-hero__icon"><i class="fas fa-file-alt"></i></span>
          <div class="cx-hero__body">
            <h2 class="cx-hero__title">{{formData['job_no']}}</h2>
            <p class="cx-hero__sub">รายละเอียดใบงาน &middot; รายการที่ {{formData['itemno']}}</p>
          </div>
          <span class="cx-chip" v-if="formData['module']"><i class="fas fa-paste"></i> {{formData['module']}}</span>
          <span class="cx-chip" v-if="formData['serv_name']"><i class="fa fa-laptop"></i> {{formData['serv_name']}}</span>
          <span class="cx-chip" v-if="formData['platform']"><i class="fa fa-television"></i> {{formData['platform']}}</span>
        </div>

        <div class="row cx-row">
          <!--Left Side-->
          <div class="col-lg-8">
            <!-- Task Details -->
            <div class="box box-solid">
              <div class="box-body">
                <div class="cx-head">
                  <div class="cx-head__title">
                    <i class="fas fa-clipboard-list"></i>
                    <span>ข้อมูลงาน</span>
                  </div>
                </div>

                <div class="cx-ro">
                  <div class="form-group">
                    <label><i class="fa fa-folder"></i> Subject</label>
                    <input type="text" class="form-control" v-model.trim="formData['subject']" />
                  </div>
                  <div class="form-group">
                    <label><i class="fa fa-pencil-square-o"></i> Description</label>
                    <textarea class="form-control" rows="4" v-model.trim="formData['detail']"></textarea>
                  </div>

                  <div class="cx-sub"><i class="fas fa-tags"></i> ประเภทงาน</div>
                  <div class="cx-grid">
                    <div class="form-group">
                      <label><i class="fa fa-laptop"></i> Service Type</label>
                      <input class="form-control" v-model.trim="formData['serv_name']" readonly>
                    </div>
                    <div class="form-group">
                      <label><i class="fa fa-television"></i> Platform</label>
                      <input class="form-control" v-model.trim="formData['platform']" readonly>
                    </div>
                    <div class="form-group">
                      <label><i class="fas fa-paste"></i> Module</label>
                      <input class="form-control" v-model.trim="formData['module']" readonly>
                    </div>
                    <div class="form-group">
                      <label><i class="fa fa-user"></i> Req. Type</label>
                      <input class="form-control" v-model.trim="formData['req_des']" readonly>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timeline & owners -->
            <div class="box box-solid">
              <div class="box-body">
                <div class="cx-head">
                  <div class="cx-head__title">
                    <i class="far fa-calendar-alt"></i>
                    <span>กำหนดเวลา และผู้รับผิดชอบ</span>
                  </div>
                </div>

                <div class="cx-dates">
                  <div class="cx-date cx-date--info">
                    <span class="cx-date__ico"><i class="fa fa-calendar"></i></span>
                    <div class="cx-date__body">
                      <span class="cx-date__key">ติดต่อกลับ</span>
                      <label class="cx-date__val">{{$date(formData['response_date'], 'DD/MM/YYYY')}}</label>
                    </div>
                  </div>
                  <div class="cx-date cx-date--warn">
                    <span class="cx-date__ico"><i class="far fa-calendar-times"></i></span>
                    <div class="cx-date__body">
                      <span class="cx-date__key">วันที่ครบกำหนด</span>
                      <label class="cx-date__val">{{$date(formData['due_date'], 'DD/MM/YYYY')}}</label>
                    </div>
                  </div>
                  <div class="cx-date cx-date--ok">
                    <span class="cx-date__ico"><i class="far fa-calendar-check"></i></span>
                    <div class="cx-date__body">
                      <span class="cx-date__key">วันที่แล้วเสร็จ</span>
                      <label class="cx-date__val">{{$date(formData['complete_date'], 'DD/MM/YYYY')}}</label>
                    </div>
                  </div>
                </div>

                <div class="cx-divider"></div>

                <div class="cx-ro">
                  <div class="cx-grid">
                    <div class="form-group">
                      <label><i class="fas fa-user-cog"></i> Operator</label>
                      <input type="text" class="form-control" v-model.trim="formData['operator_name']" readonly />
                    </div>
                    <div class="form-group">
                      <label><i class="fas fa-user-tie"></i> Contract User</label>
                      <input type="text" class="form-control" v-model.trim="formData['contract_user']" readonly />
                    </div>
                    <div class="form-group">
                      <label><i class="fa fa-phone-volume"></i> Phone</label>
                      <input type="text" class="form-control" v-model.trim="formData['phone']" readonly />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!--Right Side-->
          <div class="col-lg-4">
            <div class="box box-solid cx-sticky">
              <div class="box-body">
                <div class="cx-head">
                  <div class="cx-head__title">
                    <i class="fas fa-comment-dots"></i>
                    <span>กล่องแสดงความคิดเห็น</span>
                  </div>
                  <span class="cx-chip">{{commentData.length}} ข้อความ</span>
                </div>

                <div class="cx-chat-box">
                  <textarea class="form-control" v-model.trim="commentText" placeholder="พิมพ์ข้อความ.."></textarea>
                  <div class="cx-chat-actions">
                    <button type="button" class="cx-send" @click.prevent="createComment()">
                      <i class="fa fa-paper-plane"></i> ส่งข้อความ
                    </button>
                  </div>
                </div>

                <div class="cx-sub"><i class="far fa-comments"></i> ประวัติการสนทนา</div>
                <div class="cx-thread">
                  <div class="cx-bubble" v-for="x,idx in commentData">
                    <div class="cx-bubble__head">
                      <span class="cx-bubble__who">
                        <i class="fas fa-user"></i>
                        {{idx+1}}. {{xt.isEmpty(x.customer_code) ? x.req_name : x.customer_name}}
                      </span>
                      <span class="cx-bubble__time"><i class="far fa-clock"></i> {{$date(x.add_dt, 'DD/MM/YYYY HH:mm:ss')}}</span>
                    </div>
                    <span class="cx-bubble__text">{{x.description}}</span>
                  </div>
                  <div class="cx-empty" v-if="!commentData.length"><i class="far fa-comment-dots"></i> ยังไม่มีข้อความ</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!--Attach File-->
        <div class="row">
          <div class="col-md-12">
            <div class="box box-solid">
              <div class="box-body">
                <div class="cx-head">
                  <div class="cx-head__title">
                    <i class="fas fa-paperclip"></i>
                    <span>ไฟล์แนบ</span>
                  </div>
                  <span class="cx-chip"><i class="fas fa-file"></i> {{attachFile.length}} ไฟล์</span>
                </div>

                <div class="cx-files" v-if="attachFile.length">
                  <div class="cx-file" v-for="x,idx in attachFile">
                    <a class="cx-file__media" :href="createFilePath(x.filepath)" target="_blank">
                      <i class="fas fa-file-image" v-if="['png','jpeg','jpg'].includes(getFileExt(x.filename))"></i>
                      <i class="fas fa-file-word" v-else-if="['doc','docx'].includes(getFileExt(x.filename))"></i>
                      <i class="fas fa-file-excel" v-else-if="['xls','xlsx'].includes(getFileExt(x.filename))"></i>
                      <i class="fas fa-file-powerpoint" v-else-if="['ppt','pptx'].includes(getFileExt(x.filename))"></i>
                      <i class="fas fa-file-pdf" v-else-if="['pdf'].includes(getFileExt(x.filename))"></i>
                      <i class="fas fa-file" v-else=""></i>
                      <span class="cx-file__thumb"
                            v-if="['png','jpeg','jpg'].includes(getFileExt(x.filename))"
                            :style="{ backgroundImage: 'url(' + createFilePath(x.filepath) + ')' }"></span>
                    </a>
                    <div class="cx-file__body">
                      <a class="cx-file__name" :href="createFilePath(x.filepath)" target="_blank">
                        <i class="fas fa-download"></i> {{x.filename}}
                      </a>
                      <div class="cx-file__desc" v-if="x.description">{{x.description}}</div>
                      <div class="cx-file__meta">
                        {{idx+1}}. {{$date(x.add_dt, 'DD/MM/YYYY HH:mm')}}
                        <span class="cx-file__ext">{{getFileExt(x.filename)}}</span>
                        <i class="fas fa-times" v-if="x.add_user===auth.userid"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="cx-empty" v-else><i class="fas fa-folder-open"></i> ไม่มีไฟล์แนบ</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </customer-page>
  </div>
</template>
<script type="text/javascript">

  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let cpn = {
    data() {
      return {
        auth,
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        xt: $xt,
        formData: {},
        attachFile: [],
        commentData: [],
        commentText: "",
        platformCodeData,
      };
    },
    methods: {
      async loadData() {
        let url = `CSM/CustomerData/ExternalRead?job_no=${this.queryString.job_no}&itemno=${this.queryString.itemno}`;
        let resp = await $xt.getCustomerServer(url);
        this.formData = resp.detail;
        this.attachFile = resp.attach;
        this.commentData = resp.comment;
        this.formData.platform = $linq(this.platformCodeData).where(x => x.id == this.formData.platform).select(x => x.name).firstOrDefault();

        page.pageTitle = `รายละเอียดเอกสารเลขที่ ${this.formData.job_no}`;
        document.title = page.pageTitle;

      },
      createFilePath(x) {
        return dataServer + "Api/File/DownLoad?id=" + x
      },
      getFileExt(f) {
        return f.split('.').pop().toLowerCase();
      },
      async createComment() {
        try {
          let comment = {
            job_no: this.formData.job_no,
            ref_itemno: this.formData.itemno,
            itemno: null,
            description: this.commentText || '',
          };
          let f = {
            comment: comment
          };
          let url = `CSM/CustomerData/ExternalCommentCreate`;

          let rsp = await $xt.postCustomerJson(url, f);
          if (!rsp.success) {
            throw rsp.error;
          }

          this.commentText = "";
          await this.loadData();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {

        }

      },

    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = 'รายละเอียดเอกสาร';
      document.title = page.pageTitle;

      this.loadData();

    }
  };
  export default cpn;
</script>
