<template>
  <div>
    <!-- Comment List -->
    <div class="gm-comment-section">
      <!-- Empty State -->
      <div v-if="showComment().length === 0" class="gm-comment-empty">
        <i class="fa fa-comments"></i>
        <span>ยังไม่มี Comment</span>
      </div>
      <div v-for="x in showComment()" :key="x.itemno"
           :class="['gm-comment-card', x.add_user == auth.userid ? 'gm-comment-card--mine' : 'gm-comment-card--other']">
        <!-- Avatar -->
        <div :class="['gm-comment-avatar', x.add_user == auth.userid ? 'gm-comment-avatar--mine' : 'gm-comment-avatar--other']">
          {{ x.comment_user ? x.comment_user.charAt(0) : '#' }}
        </div>
        <!-- Body -->
        <div class="gm-comment-body">
          <!-- Header -->
          <div class="gm-comment-header">
            <div class="gm-comment-user">
              <span class="gm-comment-itemno">#{{ x.itemno }}</span>
              {{ x.comment_user }}
            </div>
            <span class="gm-comment-time">{{ $date(x.add_dt, 'DD/MM/YYYY HH:mm:ss') }}</span>
          </div>
          <!-- Text (view mode) -->
          <div v-if="!x.edit" class="gm-comment-text">
            <span v-html="createBr(x['description'])"></span>
          </div>
          <!-- Edit mode -->
          <div v-if="x.edit" class="gm-comment-edit-area">
            <textarea class="form-control" rows="2" v-model.trim="x.description"></textarea>
            <div class="gm-comment-edit-actions">
              <a href="#" class="gm-comment-edit-btn gm-comment-edit-btn--cancel" @click.prevent="setEditComment(x)">ยกเลิก</a>
              <a href="#" class="gm-comment-edit-btn gm-comment-edit-btn--save" @click.prevent="updateComment(x)"><i class="fa fa-check"></i> แก้ไข</a>
            </div>
          </div>
          <!-- Actions (hover) -->
          <div class="gm-comment-actions" v-if="x.add_user == auth.userid && !x.edit">
            <a href="#" class="gm-comment-action-btn" @click.prevent="setEditComment(x)" v-tooltip="'Edit'">
              <v-icon name="edit" style="width:15px"></v-icon>
            </a>
            <a href="#" class="gm-comment-action-btn gm-comment-action-btn--delete" @click.prevent="deleteComment(x)" v-tooltip="'Delete'">
              <v-icon name="trash-2" style="width:15px"></v-icon>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Comment -->
    <div class="gm-comment-compose" v-show="(editDetailData.is_db && (isAdmin || (formData.job_no && ((formData.job_status != 'H' && !isView) || editDetailData.tester_empno == auth.empno || (isUserInWorkers(auth.empno) && formData.job_status != 'W'))))) || canSAApprove()">
      <div class="gm-comment-compose-header">
        <span class="gm-comment-compose-label"><i class="fa fa-comment-dots"></i> Add Comment</span>
        <span class="gm-comment-legend">
          <span><span class="gm-comment-legend-dot gm-comment-legend-dot--other"></span>คนอื่น</span>
          <span><span class="gm-comment-legend-dot gm-comment-legend-dot--mine"></span>ของเรา</span>
        </span>
      </div>
      <div class="gm-comment-compose-wrap">
        <textarea class="form-control" rows="3" v-model.trim="localCommentText" placeholder="พิมพ์ข้อความ... (Ctrl+Enter เพื่อส่ง)" @keydown.ctrl.enter="handleCreateComment()"></textarea>
        <div class="gm-comment-compose-footer">
          <span class="gm-comment-shortcut-hint"><kbd>Ctrl</kbd> + <kbd>Enter</kbd></span>
          <button class="gm-comment-send-btn" :disabled="!localCommentText" :class="{ 'gm-comment-send-btn--disabled': !localCommentText }" @click="handleCreateComment()"><i class="fa fa-paper-plane"></i> ส่งข้อความ</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

  export default {
    props: {
      showComment: Function,
      formData: Object,
      editDetailData: Object,
      isAdmin: Boolean,
      commentText: String,
      isView: Boolean,
      updateComment: Function,
      setEditComment: Function,
      deleteComment: Function,
      // createComment: Function,
      createBr: Function,
      isUserInWorkers: Function,
      is_mango: Function,
      list_emp_sa_mg: String,

    },
    data() {
      return {
        auth,
        baseUrl,
        ui: window.ui,
        xt: $xt,
        localCommentText: ''
      }
    },
    computed: {
      isMango() {
        return this.is_mango()
      },
    },
    methods: {
      handleCreateComment() {
        if (!this.localCommentText) return;
        this.$emit('UpdateCommentText', this.localCommentText);
        this.localCommentText = '';
      },
      clearComment() {
        this.localCommentText = '';
      },
      canSAApprove() {
     //   console.log('list_emp_sa_mg', this.list_emp_sa_mg)
        if (!this.list_emp_sa_mg) return false;

        // แปลงเป็น array ของตัวเลข
        let empList = this.list_emp_sa_mg.split(',').map(Number);

        return empList.includes(this.auth.empno) && !['Y', 'N'].includes(this.formData.job_status) && !$xt.isEmpty(this.formData.job_no) && (this.editDetailData.tester_approve === 'Y' && this.editDetailData.approve_status === 'Y') && this.isMango;
      }

    },
    watch: {
      localCommentText(newVal) {
        this.$emit('UpdateCommentText2', newVal);
      }
    }
  }
</script>

<style scoped>
/* ให้ textarea สามารถยืดหุบได้ */
.gm-comment-compose-wrap textarea.form-control {
  resize: vertical; /* ยืดหุบได้แนวตั้งอย่างเดียว */
  min-height: 60px; /* ความสูงต่ำสุด */
}

.gm-comment-edit-area textarea.form-control {
  resize: vertical;
  min-height: 50px;
}
</style>
