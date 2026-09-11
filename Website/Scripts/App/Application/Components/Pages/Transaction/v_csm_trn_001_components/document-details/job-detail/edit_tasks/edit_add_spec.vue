<template>
  <div class="gm-spec-root">
    <!-- Main Modal Section -->
    <div class="modal-body">
      <!-- Header: Add button -->
      <div class="gm-spec-header">
        <button class="gm-spec-btn" @click="openAddSpecModal">
          <i class="fas fa-plus"></i> เพิ่ม Specification
        </button>
        <span class="gm-spec-count" v-if="attachFileTab().length">
          {{ attachFileTab().length }} รายการ
        </span>
      </div>

      <!-- Empty State -->
      <div class="gm-spec-empty" v-if="attachFileTab().length === 0">
        <i class="fas fa-clipboard-list"></i>
        <p>ยังไม่มีรายการ Specification</p>
      </div>

      <!-- Spec List -->
      <div class="gm-spec-list" v-else>
        <div class="gm-spec-item" v-for="(x, idx) in attachFileTab()" :key="x.itemno">
          <!-- Left: Index Badge -->
          <div class="gm-spec-no">{{ idx + 1 }}</div>

          <!-- Middle: Info -->
          <div class="gm-spec-info">
            <div class="gm-spec-info-head">
              <span class="gm-spec-module">
                <i class="fas fa-cube"></i> {{ x.filename }}
              </span>
              <span class="gm-spec-date">
                <i class="fas fa-clock"></i> {{ x.add_dt | date('DD/MM/YYYY HH:mm') }}
              </span>
            </div>
            <div class="gm-spec-object">
              <span class="gm-spec-label">Object:</span>
              <span class="gm-spec-object-name">{{ x.description }}</span>
            </div>
            <div class="gm-spec-remark">
              <span class="gm-spec-label">Remark:</span>
              <input type="text"
                     class="form-control input-sm gm-spec-remark-input"
                     v-model="x.description2"
                     maxlength="100"
                     placeholder="เพิ่ม Remark..."
                     :disabled="x.adduser !== auth.userid" />
            </div>
          </div>

          <!-- Right: Delete -->
          <div class="gm-spec-actions">
            <a href="#"
               class="gm-spec-del"
               @click.prevent="delFile(x.itemno, x.item_type)"
               v-if="x.add_user === auth.userid || isAdmin"
               title="Delete">
              <i class="fas fa-times"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      attachFileTab: Function,
      delFile: Function,
      isAdmin: Boolean,
    },
    data() {
      return {
        auth,
        baseUrl,
        ui: window.ui,
        xt: $xt,
      }
    },
    methods: {
      openAddSpecModal() {
       this.$emit('openAddSpecModal')
      }

    },
  }
</script>
<style scoped>
  .modal {
    z-index: 1050 !important;
  }
</style>
