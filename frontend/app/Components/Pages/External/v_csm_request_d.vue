<template>
  <div class="cx-page">
    <customer-page ref="page" id="toppage">
      <template #body>
        <div class="row">
          <!-- Comments Customer -->
          <div class="col-lg-8 col-md-8">
            <div class="cx-hero">
              <span class="cx-hero__icon"><i class="fa fa-comment"></i></span>
              <div class="cx-hero__body">
                <h2 class="cx-hero__title">Comment</h2>
                <p class="cx-hero__sub">แสดงความคิดเห็นหรือข้อเสนอแนะเกี่ยวกับเมนูนี้</p>
              </div>
            </div>

            <div class="box box-solid">
              <div class="box-body">
                <div class="cx-head">
                  <div class="cx-head__title">
                    <i class="fas fa-pen"></i>
                    <span>เขียนความคิดเห็น</span>
                  </div>
                </div>
                <div class="cx-chat-box">
                  <textarea ref="inputcomment" class="form-controlb" v-model="commentText" placeholder="พิมพ์ความคิดเห็นของคุณ.."></textarea>
                  <div class="cx-chat-actions">
                    <button class="cx-send" @click.prevent="Comment()"><i class="fa fa-paper-plane"></i> Enter</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="box box-solid">
              <div class="box-body">
                <div class="cx-head">
                  <div class="cx-head__title">
                    <i class="far fa-comments"></i>
                    <span>ความคิดเห็นทั้งหมด</span>
                  </div>
                  <span class="cx-chip">{{formData.length}} รายการ</span>
                </div>

                <div class="cx-bubble" v-for="x in formData">
                  <div class="cx-bubble__head">
                    <span class="cx-bubble__who">
                      <i class="fas fa-user-edit"></i>
                      {{x.customer_name}}
                    </span>
                  </div>
                  <span class="cx-bubble__text" v-if="!x.editMode">{{x.description}}</span>
                  <textarea v-if="x.editMode" class="form-control" rows="3" v-model.trim="x.description"></textarea>
                  <div class="cx-bubble__tools">
                    <a v-if="!x.editMode" class="pointer" @click.prevent="setedit(x)"><i class="fas fa-pen"></i> Edit</a>
                    <a v-if="x.editMode" class="pointer" @click.prevent="updateDetail(x)"><i class="fas fa-check"></i> Save</a>
                    <a class="pointer is-danger" @click.prevent="deleteComment(x)"><i class="fas fa-trash-alt"></i> Delete</a>
                  </div>
                </div>
                <div class="cx-empty" v-if="!formData.length"><i class="far fa-comment-dots"></i> ยังไม่มีความคิดเห็น</div>

                <div class="cx-chat-actions">
                  <a class="cx-btn cx-btn--ghost pointer" @click="newcomment()"><i class="fas fa-arrow-up"></i> แสดงความคิดเห็น</a>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-4">
            <div class="box box-solid">
              <div class="box-body">
                <div class="cx-head">
                  <div class="cx-head__title">
                    <i class="fas fa-info-circle"></i>
                    <span>ข้อมูลเมนู</span>
                  </div>
                </div>
                <div class="cx-kv">
                  <div class="cx-kv__row">
                    <span class="cx-kv__key"><i class="fas fa-circle"></i> Module</span>
                    <label class="cx-kv__val">{{menuData.module}}</label>
                  </div>
                  <div class="cx-kv__row">
                    <span class="cx-kv__key"><i class="fas fa-circle"></i> MenuID</span>
                    <label class="cx-kv__val">{{menuData.menu_id}}</label>
                  </div>
                  <div class="cx-kv__row">
                    <span class="cx-kv__key"><i class="fas fa-circle"></i> MenuName Thai</span>
                    <label class="cx-kv__val">{{menuData.menu_text}}</label>
                  </div>
                  <div class="cx-kv__row">
                    <span class="cx-kv__key"><i class="fas fa-circle"></i> MenuName Eng.</span>
                    <label class="cx-kv__val">{{menuData.menu_text_e}}</label>
                  </div>
                </div>
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
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        xt: $xt,
        historyData: [],
        historyTotal: [],
        formData: [],
        menuData: {},
        commentText: "",
        d_data: [],
        change: false,
      };
    },
    methods: {
      async loadData() {
        let url = `CSM/CustomerData/ExternalModuleReadList?module=${this.queryString.module}&menu_id=${this.queryString.menu_id}`;
        let rsp = await $xt.getCustomerServer(url);

        $linq(rsp.data).foreach(x => {
          x.editMode = false;
        });
        this.formData = rsp.data;
        this.menuData = rsp.menu;
        console.log(this.menuData)

      },
      async Comment() {
        try {

          let comment = {
            customer_code: this.formData.customer_code,
            module: this.queryString.module,
            menu_id: this.queryString.menu_id,
            itemno: null,
            description: this.commentText || '',
          };
          let f = {
            comment: comment
          }
          let url = `CSM/CustomerData/ExternalModuleComment`;
          let rsp = await $xt.postCustomerJson(url, f);
          await this.loadData();
          this.commentText = "";
          if (!rsp.success) {
            throw rsp.error;
          }
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {

        }
      },
      async deleteComment(x) {
        if (!await $msg.confirm(`คุณต้องการลบ Comment นี้ใช่หรือไม่ โปรดยืนยันข้อมูลก่อนทำรายการดังกล่าว`)) {
          return;
        }
        try {
          let f = {
            comment: x
          };
          this.isLoading = true;
          let act = `CSM/CustomerData/Ext_DeleteCommentCustomer`;
          let rsp = await $xt.postCustomerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          $notify.success(this.ui.alert_delete_success);
          await this.loadData(rsp.data);
        } catch (ex) {
          this.isLoading = false;
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          this.isLoading = false;
        }
      },
      setedit(x) {
        x.editMode = !x.editMode;
      },
      async updateDetail(x) {
        try {
          let comment = {
            customer_code: this.formData.customer_code,
            module: this.queryString.module,
            menu_id: this.queryString.menu_id,
            itemno: x.itemno,
            description: x.description,
          };
          let f = {
            comment: comment
          };
          this.isLoading = true;
          //let act = `CSM/CustomerData/ExternalModuleComment?module=${this.queryString.module}&menu_id=${this.queryString.menu_id}`;
          let act = `CSM/CustomerData/ExternalModuleComment`;
          let rsp = await $xt.postCustomerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }

          await this.loadData();

          this.commentText = "";

          if (!rsp.success) {
            throw rsp.error;
          }
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {

        }
      },
      newcomment() {
        this.change = true;
        $('html,body').scrollTop($('#toppage').offset().top);
      },


    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = 'CSM | Request Detail';
      document.title = page.pageTitle;

      this.loadData();


    }
  };
  export default cpn;
</script>
