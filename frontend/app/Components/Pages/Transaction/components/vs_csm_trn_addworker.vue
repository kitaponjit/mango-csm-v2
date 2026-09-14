<template>
  <modal-2 ref="openAddWork1" sheet-class="ct-sheet" :hideFooter="true">
    <template #header>
      <div style="display:flex; align-items:center; gap:10px;">
        <i class="fas fa-users" style="color:#3c8dbc; font-size:18px;"></i>
        <span style="font-weight:700; font-size:16px;">Add Worker</span>
        <span style="background:#6c757d; color:#fff; border-radius:12px; padding:2px 10px; font-size:12px;">
          {{ modalWorkers.filter(w => w.empfullname).length }} / {{ modalWorkers.length }}
        </span>
      </div>
    </template>
    <template #body>

      <!-- Header Actions -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <small style="color:#888;">
          <i class="fas fa-info-circle"></i> เลือก Worker ที่รับผิดชอบงานนี้
        </small>
        <button class="btn btn-sm btn-success" @click="addWorkerLine" v-bind:disabled="!canEdit_">
          <i class="fa fa-plus"></i> Add Worker
        </button>
      </div>

      <!-- Worker Card Grid -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div v-for="(w, index) in modalWorkers" :key="index"
             style="border-radius:8px; padding:12px; border:1px solid;"
             :style="w.empfullname
               ? 'border-color:#3c8dbc; background:#f0f7ff; box-shadow:0 1px 4px rgba(60,141,188,0.15);'
               : 'border-color:#dee2e6; border-style:dashed; background:#f8f9fa;'">

          <!-- Top row: badge + avatar + name -->
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
            <span style="background:#3c8dbc; color:#fff; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0;">
              {{ w.itemno }}
            </span>
            <div style="width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;"
                 :style="w.empfullname ? 'background:#d0e8f5;' : 'background:#e9ecef;'">
              <i class="fas fa-user" :style="w.empfullname ? 'color:#3c8dbc; font-size:13px;' : 'color:#adb5bd; font-size:13px;'"></i>
            </div>
            <span style="font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                  :style="w.empfullname ? 'font-weight:600; color:#2c5f7a;' : 'color:#adb5bd;'">
              {{ w.empfullname || ui.erp_not_selected || 'ยังไม่ได้เลือก' }}
            </span>
          </div>

          <!-- Input + Buttons -->
          <div class="input-group input-group-sm">
            <input type="text" class="form-control"
                   :value="w.empfullname"
                   :placeholder="(ui.csm_trn_worker || 'Worker') + ' ' + w.itemno"
                   readonly
                   style="font-size:12px;" />
            <span class="input-group-btn">
              <button class="btn btn-sm bg-navy" v-bind:disabled="!canEdit_"
                      @click="empModalSelectedWorker(w.itemno)" :title="ui.search || 'ค้นหา'">
                <i class="fa fa-search"></i>
              </button>
              <button class="btn btn-sm btn-danger" v-bind:disabled="!canEdit_"
                      @click="removeWorkerLine(w.itemno)" :title="ui.erp_delete || 'ลบ'">
                <i class="fa fa-times"></i>
              </button>
            </span>
          </div>

        </div>
      </div>

      <!-- Empty State -->
      <div v-if="modalWorkers.length === 0"
           style="text-align:center; padding:32px 16px; color:#adb5bd;">
        <i class="fas fa-users" style="font-size:36px; display:block; margin-bottom:10px; opacity:0.3;"></i>
        <p style="margin-bottom:12px;">ยังไม่มี Worker</p>
        <button class="btn btn-outline-success btn-sm" @click="addWorkerLine" v-bind:disabled="!canEdit_">
          <i class="fa fa-plus"></i> เพิ่ม Worker คนแรก
        </button>
      </div>

      <hr style="margin:16px 0;" />

      <!-- Footer Buttons -->
      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button type="button" class="btn btn-sm btn-default"
                @click="$refs.openAddWork1.hide()">
          <i class="fa fa-times"></i> {{ ui.cancel || 'ยกเลิก' }}
        </button>
        <button type="button" class="btn btn-sm btn-primary"
                @click.prevent="UpdateRefWork()" v-bind:disabled="!canEdit_">
          <i class="fa fa-check"></i> OK
        </button>
      </div>

    </template>
  </modal-2>
</template>

<script type="text/javascript">
  export default {
    props: {
      modalWorkers: Array,
      canEdit_: Boolean,
      addWorkerLine: Function,
      empModalSelectedWorker: Function,
      removeWorkerLine: Function,
      UpdateRefWork: Function,
    },
    data() {
      return {
        ui: window.ui,
      }
    },
    methods: {
      openModal() {
        this.$refs.openAddWork1.openModal()
      },
      closeModal() {
        this.$refs.openAddWork1.closeModal()
      },
      setSize(size) {
        this.$refs.openAddWork1.setSize(size)
      },
    },
  }
</script>
