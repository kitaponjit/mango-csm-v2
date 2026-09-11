<template>
    <div>
        <div v-for="x,idx in showCommentExtLength()">
            <div class="row">
                <div class="col-lg-8 col-md-8 col-sm-12">
                    <div v-bind:class="{'box box-success': x.req_empno != null, 'box box-warning': x.customer_code != null && x.req_empno == null}">
                        <div class="box-body with-border">
                            <div class="row">
                                <div class="col-lg-6 col-md-6 col-sm-6 ">
                                    {{x.itemno}}. <b>{{x.req_name}}</b>
                                </div>
                                <div class="col-lg-6 col-md-6 col-sm-6">
                                    <b class="pull-right">{{ x.date_c }}</b>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-12 col-md-12 col-sm-12">
                                    <div v-if="!x.editExt" style="margin-top:15px;margin-bottom:15px;">
                                        <span style="font-size:14px;" v-html="createBr(x['detail_c'])"></span>
                                    </div>
                                    <div v-if="x.editExt">
                                        <div class="row">
                                            <div class="col-md-12 col-sm-12 col-xs-12">
                                                <textarea class="form-control input-sm" rows="2" v-model.trim="x.detail_c"></textarea>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-12 col-sm-12 col-xs-12">
                                                <div class="pull-right">
                                                    <a href="#" @click.prevent="updateCommentExt(x)"> แก้ไข</a>&nbsp;
                                                    <a href="#" @click.prevent="setEditCommentExt(x,false)"> ยกเลิก</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row"  v-if="x.req_empno == auth.empno && !x.editExt && formData.job_status != 'Y'">
                                <div class="col-md-12 col-sm-12 col-xs-12">
                                    <a href="#" @click.prevent="setEditCommentExt(x,true)">
                                        <v-icon name="edit" v-tooltip=" 'Edit' " style="width:22px"></v-icon>
                                    </a>
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
        <div class="row" v-show="editDetailData.is_db && (isAdmin || (formData.job_no && ((formData.job_status != 'H' && !isView) || editDetailData.tester_empno == auth.empno || (isUserInWorkers(auth.empno) && formData.job_status != 'W'))))">
            <div class="col-lg-8 col-md-8 col-sm-12">
                <div class="form-group">
                    <label>Add Comment</label><span class="pull-right">
                    <b class="text-danger">หมายเหตุ : </b><span class="text-warning">สีเหลือง</span> คือ Comment ของคนอื่น <span class="text-success">สีเขียว</span> คือ Comment ของเรา
                    </span>
                    <textarea class="form-control input-sm" rows="3" v-model.trim="localCommentExt" :disabled="formData.job_status == 'Y'"></textarea>
                </div>
                <button class="btn btn-sm bg-aqua" @click="handleCreateCommentExt()" :disabled="formData.job_status == 'Y'"><i class="fa fa-check-circle"></i> ส่งข้อความ</button>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        showCommentExt: Function,
        showCommentExtLength: Function,
        formData: Object,
        editDetailData: Object,
        isAdmin: Boolean,
        commentTextExt: String,
        isView: Boolean,
        createBr: Function,
        data_: Array,
        updateCommentExt: Function,
        deleteCommentExt: Function,
        setEditCommentExt: Function,
        isUserInWorkers: Function,
    },
    data() {
        return {
            auth,
            baseUrl,
            ui: window.ui,
            xt: $xt,
            localCommentExt: "",
        };
    },
    methods: {
        handleCreateCommentExt(){
            this.$emit('UpdateCommentTextExt', this.localCommentExt);
        },
        clearCommentExt() {
            this.localCommentExt = '';
        }
    },
    watch: {
        localCommentExt(newVal) {
            this.$emit('UpdateCommentTextExt2', newVal);
        }
    },
     mounted() {
      //setInterval(() => {
      //  if  (this.editExt == false)
      //  {
      //    let job_no = $linq(this.data_comment).select((x) => x.job_no).firstOrDefault();
      //    let reqno = $linq(this.data_comment).select((x) => x.reqno).firstOrDefault();
      //    this.showCommentExt(job_no, reqno);
      //  }
      //}, 10000);
      this.signalR = window.signalR({
        ReceiveNewComment001: (newCase) => {
       //   console.log("Received new case:", newCase);
          let job_no = $linq(newCase).select((x) => x.job_no).firstOrDefault();
          let reqno = $linq(newCase).select((x) => x.reqno).firstOrDefault();
          this.showCommentExt(job_no, reqno);

          //this.data_comment.push(newCase);
        }
      });
    },
};
</script>
