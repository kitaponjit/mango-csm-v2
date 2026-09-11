<template>
  <modal-2 ref="select_plan" sheet-class="ct-sheet" :hideFooter="true">
    <template #header>
      <div style="display:flex; align-items:center; gap:10px;">
        <i class="fas fa-project-diagram" style="font-size:20px; color:#3c8dbc;"></i>
        <span style="font-size:16px; font-weight:600;">เลือกแผนงาน (Project Planning)</span>
      </div>
    </template>
    <template #body>
      <div class="row">
        <div class="col-md-12">
          <!-- Info banner -->
          <div class="callout callout-info" style="margin-bottom:14px; padding:8px 14px;">
            <i class="fas fa-info-circle"></i>
            <span style="margin-left:6px;">กรุณาเลือกแผนงานที่ต้องการผูกกับงานนี้ หรือดับเบิลคลิกที่แถวเพื่อยืนยันทันที</span>
          </div>

          <!-- Empty state -->
          <div v-if="list_ppn.length === 0" class="text-center" style="padding:30px 0; color:#999;">
            <i class="fas fa-folder-open" style="font-size:36px; margin-bottom:10px; display:block;"></i>
            <span>ไม่พบแผนงานที่สามารถเลือกได้</span>
          </div>

          <!-- Plan list as cards -->
          <div v-else style="max-height:340px; overflow-y:auto; padding-right:4px;">
            <div
              v-for="(x, idx) in list_ppn"
              :key="x.plan_code"
              @click="$emit('update:selectedPlan', x)"
              @dblclick="DBgetApiPPN(x, idx)"
              :style="{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                marginBottom: '8px',
                borderRadius: '6px',
                border: selectedPlan && selectedPlan.plan_code === x.plan_code
                  ? '2px solid #3c8dbc'
                  : '1px solid #ddd',
                background: selectedPlan && selectedPlan.plan_code === x.plan_code
                  ? '#eaf4fb'
                  : '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }"
            >
              <!-- Radio indicator -->
              <div style="flex-shrink:0;">
                <span
                  :style="{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: selectedPlan && selectedPlan.plan_code === x.plan_code
                      ? '2px solid #3c8dbc'
                      : '2px solid #bbb',
                    background: selectedPlan && selectedPlan.plan_code === x.plan_code
                      ? '#3c8dbc'
                      : '#fff'
                  }"
                >
                  <i v-if="selectedPlan && selectedPlan.plan_code === x.plan_code"
                     class="fas fa-check"
                     style="font-size:10px; color:#fff;"></i>
                </span>
              </div>

              <!-- Plan icon -->
              <div style="flex-shrink:0;">
                <span style="display:inline-flex; align-items:center; justify-content:center;
                              width:36px; height:36px; border-radius:8px;
                              background:#3c8dbc; color:#fff; font-size:15px;">
                  <i class="fas fa-tasks"></i>
                </span>
              </div>

              <!-- Plan info -->
              <div style="flex:1; min-width:0;">
                <div style="font-weight:600; font-size:13px; color:#333; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  {{ x.planname || '(ไม่มีชื่อแผน)' }}
                </div>
                <div style="font-size:11px; color:#888; margin-top:2px;">
                  <i class="fas fa-tag" style="margin-right:4px;"></i>{{ x.plan_code }}
                </div>
              </div>

              <!-- Double-click hint -->
              <div style="flex-shrink:0; font-size:10px; color:#aaa; text-align:right;">
                <i class="fas fa-mouse-pointer"></i><br>{{ ui.erp_double_click || 'ดับเบิลคลิก' }}<br>เพื่อเลือก
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer actions -->
      <div style="display:flex; justify-content:flex-end; align-items:center; gap:8px; margin-top:16px; padding-top:12px; border-top:1px solid #eee;">
        <span v-if="selectedPlan" style="font-size:12px; color:#555; margin-right:auto;">
          <i class="fas fa-check-circle" style="color:#3c8dbc;"></i>
          {{ ui.erp_select || 'เลือก' }}: <strong>{{ selectedPlan.planname }}</strong>
        </span>
        <button type="button" class="btn btn-default btn-sm" @click="$refs.select_plan.closeModal()">
          <i class="fas fa-times"></i> {{ ui.cancel || 'ยกเลิก' }}
        </button>
        <button
          type="button"
          class="btn btn-primary btn-sm"
          :disabled="!selectedPlan"
          @click.prevent="getApiPPN()"
          :style="{ opacity: selectedPlan ? 1 : 0.5 }"
        >
          <i class="fas fa-check"></i> ยืนยันการเลือก
        </button>
      </div>
    </template>
  </modal-2>
</template>

<script type="text/javascript">
  export default {
    props: {
      list_ppn: Array,
      selectedPlan: Object,
      DBgetApiPPN: Function,
      getApiPPN: Function,
    },
    data() {
      return {
        ui: window.ui,
      }
    },
    methods: {
      openModal() {
        this.$refs.select_plan.openModal()
      },
      closeModal() {
        this.$refs.select_plan.closeModal()
      },
      setSize(size) {
        this.$refs.select_plan.setSize(size)
      },
    },
  }
</script>
