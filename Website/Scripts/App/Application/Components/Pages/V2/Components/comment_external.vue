<template>
  <div>
    <div v-for="(x, idx) in showCommentExtLength()">
      <div class="row">
        <div class="col-lg-8 col-md-8 col-sm-12">
          <div v-bind:class="{
            'box box-success': x.customer_code != null && x.req_empno == null,
            'box box-warning': x.req_empno != null,
          }">
            <div class="box-body with-border">
              <div class="row">
                <div class="col-lg-6 col-md-6 col-sm-6">
                  {{ x.itemno }}. <b>{{ x.req_name }}</b>
                </div>
                <div class="col-lg-6 col-md-6 col-sm-6">
                  <b class="pull-right">{{ x.date_c }}</b>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-12 col-md-12 col-sm-12">
                  <div v-if="!x.editExt" style="margin-top: 15px; margin-bottom: 15px">
                    <span style="font-size: 14px" v-html="createBr(x['detail_c'])"></span>
                  </div>
                  <div v-if="x.editExt">
                    <div class="row">
                      <div class="col-md-12 col-sm-12 col-xs-12">
                        <textarea class="form-control input-sm" rows="2" v-model.trim="x.detail_c"></textarea>
                      </div>
                      <!-- Function Edit Comment -->
                      <!-- <div class="row">
                        <div class="col-md-12 col-sm-12 col-xs-12">
                          <div class="pull-right">
                            <a href="#" @click.prevent="updateCommentExt(x)"> แก้ไข</a>&nbsp;
                            <a href="#" @click.prevent="setEditCommentExt(x,false)"> ยกเลิก</a>
                          </div>
                        </div>
                      </div> -->
                    </div>
                  </div>
                </div>
              </div>
              <div class="row"  v-if="x.customer_code == cus_auth.customer_code && !x.editExt && chkstatus_detail.job_status != 'Y'">
                <div class="col-md-12 col-sm-12 col-xs-12">
                  <!-- Icon Edit Comment -->
                  <!-- <a href="#" @click.prevent="setEditCommentExt(x,true)">
                    <v-icon name="edit" v-tooltip=" 'Edit' " style="width:22px"></v-icon>
                  </a> -->
                  <a href="#" @click.prevent="deleteCommentExt(x)">
                    <v-icon name="trash-2" v-tooltip=" 'Delete' " style="width:22px"></v-icon>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row" v-show="(chkstatus_detail.userid === cus_auth.userid) && chkstatus_detail.job_status != 'H'">
      <div class="col-lg-8 col-md-8 col-sm-12">
        <div class="form-group">
          <label>Add Comment</label><span class="pull-right">
            <b class="text-danger">{{ ui.csm_v2_note }} : </b><span class="text-warning">{{ ui.csm_v2_color_yellow }}</span> {{ ui.csm_v2_comment_note_other }}
            <span class="text-success">{{ ui.csm_v2_color_green }}</span> {{ ui.csm_v2_comment_note_mine }}
          </span>
          <textarea class="form-control input-sm" rows="3" v-model.trim="localCommentExt" :disabled="chkstatus_detail.job_status == 'Y'"></textarea>
        </div>
        <button class="btn btn-sm bg-aqua" @click="createComment()" :disabled="chkstatus_detail.job_status == 'Y'">
          <i class="fa fa-check-circle"></i> {{ ui.csm_v2_send_message }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    showCommentExtLength: Function,
    showCommentExt: Function,
    chkstatus_detail: Object,
    data_comment: Array,
  },
  data() {
    return {
      localCommentExt: "",
      cus_auth: window.customer_auth,
      ui: window.ui,
      xt: $xt,
      intervalId: null,
      editExt: false,
    };
  },
  methods: {
    async createComment() {
      try {
        if ($xt.isEmpty(this.localCommentExt)) { $msg.alert(this.ui.csm_v2_warning, this.ui.csm_v2_alert_input_comment,); return;}
        let comment = {
          description: this.localCommentExt || "",
          job_no: this.chkstatus_detail.job_no,
          customer_code: this.cus_auth.customer_code,
          customer_name: this.cus_auth.customer_name,
          maincode: this.cus_auth.maincode,
          reqno: this.chkstatus_detail.reqno,
          edit: false,
        };
        let f = {
          comment: $xt.isEmpty(this.localCommentExt) ? null : comment,
          docno: this.chkstatus_detail.job_no,
        };
        let act = `CSM/CustomerData/CSM_CreateComment_ExternalCus`;
        let rsp = await $xt.postCustomerJson(act, f);
        if (!rsp.success) {
          throw rsp.error;
        }
        if (rsp.success) {
          this.localCommentExt = "";
          await this.showCommentExt(rsp.data.job_no, rsp.data.reqno);

          let newCaseData = rsp.data || [];
          let hub = window.signalR();
          //console.log("Sending case to hub", newCaseData, hub);
          hub.reHub.server.sendNewComment001(newCaseData);

          $notify.success(this.ui.alert_save_success);
        } else {
          // this.isView = false;
        }
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
      }
    },
     
    async deleteCommentExt(x) {
      if (!await $msg.confirm(this.ui.csm_v2_confirm_delete_comment)) { return } 
      try {
        let comment = {
          maincode : this.cus_auth.maincode,
          job_no: x.job_no,
          reqno: x.reqno,
          refitemno: x.itemno,
        } 
        let f = {
          comment: comment,
        }
        let act = `CSM/CustomerData/CSM_DeleteCommentExtCus`
        let rsp = await $xt.postCustomerJson(act, f)
        if (!rsp.success) {
          throw rsp.error
        }
        let newCaseData = rsp.data || [];
        let hub = window.signalR();
       // console.log("Sending case to hub", newCaseData, hub);
        hub.reHub.server.sendNewComment001(newCaseData);
        $notify.success(this.ui.alert_delete_success)
        await this.showCommentExt(rsp.data.job_no, rsp.data.reqno);
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`)
      } finally {
      }
    },
    createBr(text) {
      text = text.replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@@:%_\+.~#?&//=]*)/ig, (url) => {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
      });
      return (text || '').replace(/(?:\r\n|\r|\n)/g, '<br />')
    },
  },
  mounted() {
    console.log("chkstatus_detail", this.chkstatus_detail);
    console.log("cus_auth", this.cus_auth);
    
    //setInterval(() => {
    //  if  (this.editExt == false)
    //  {
    //    let job_no = $linq(this.data_comment).select((x) => x.job_no).firstOrDefault();
    //    let reqno = $linq(this.data_comment).select((x) => x.reqno).firstOrDefault();
    //    this.showCommentExt(job_no, reqno);
    //  }
    //}, 10000);
    this.signalR = window.signalR({
      ReceiveNewComment: (newCase) => {
        // console.log("Received new case:", newCase);
        let job_no = $linq(newCase).select((x) => x.job_no).firstOrDefault();
        let reqno = $linq(newCase).select((x) => x.reqno).firstOrDefault();
            this.showCommentExt(job_no, reqno);
        
        //this.data_comment.push(newCase);
      }
    });
  },
};
</script>
