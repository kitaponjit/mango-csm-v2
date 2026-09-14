<template>
  <modal-3 ref="ai_analysis_modal" sheet-class="ct-sheet">
    <template #header>
      <div style="display:flex; align-items:center; gap:10px;">
        <i class="fas fa-robot" style="font-size:18px; color:#9b59b6;"></i>
        <span style="font-size:16px; font-weight:600;">ผลวิเคราะห์ AI</span>
        <span style="background:#9b59b6; color:#fff; border-radius:3px; padding:1px 6px; font-size:10px; font-weight:700; letter-spacing:0.3px;">Powered by AI LLM</span>
        <span v-if="aiAnalysisModalTokenIn !== null"
              style="background:#f1eafb; color:#6a34a8; border-radius:3px; padding:1px 7px; font-size:10px; font-weight:600; letter-spacing:0.2px;">
          <i class="fas fa-microchip" style="margin-right:3px;"></i>Token: In {{ aiAnalysisModalTokenIn.toLocaleString() }} / Out {{ aiAnalysisModalTokenOut.toLocaleString() }}
        </span>
      </div>
    </template>
    <template #body>
      <div style="font-size:12px; color:#555; margin-bottom:10px;" v-if="aiAnalysisModalSubject">
        <i class="fas fa-tag" style="margin-right:4px;"></i>{{ aiAnalysisModalSubject }}
      </div>

      <div style="display:flex; gap:4px; margin-bottom:16px; border-bottom:2px solid #f0f0f0;">
        <button type="button" @click="$emit('update:aiModalTab', 'master')"
                :style="{
                  padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                  borderBottom: aiModalTab === 'master' ? '2px solid #9b59b6' : '2px solid transparent',
                  marginBottom: '-2px', fontWeight: aiModalTab === 'master' ? '700' : '500',
                  color: aiModalTab === 'master' ? '#9b59b6' : '#888', fontSize: '13px'
                }">
          <i class="fas fa-file-alt" style="margin-right:5px;"></i>ผลวิเคราะห์ AI (ต้นฉบับ)
        </button>
        <button type="button" @click="$emit('update:aiModalTab', 'worker')"
                :style="{
                  padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                  borderBottom: aiModalTab === 'worker' ? '2px solid #f39c12' : '2px solid transparent',
                  marginBottom: '-2px', fontWeight: aiModalTab === 'worker' ? '700' : '500',
                  color: aiModalTab === 'worker' ? '#f39c12' : '#888', fontSize: '13px'
                }">
          <i class="fas fa-tasks" style="margin-right:5px;"></i>Checklist (Worker)
        </button>
        <button type="button" @click="onClickCompareSpecTab()"
                :style="{
                  padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                  borderBottom: aiModalTab === 'compare' ? '2px solid #3c8dbc' : '2px solid transparent',
                  marginBottom: '-2px', fontWeight: aiModalTab === 'compare' ? '700' : '500',
                  color: aiModalTab === 'compare' ? '#3c8dbc' : '#888', fontSize: '13px'
                }">
          <i class="fas fa-balance-scale" style="margin-right:5px;"></i>Compare Spec
        </button>
      </div>

      <template v-if="aiModalTab === 'master'">
        <div v-if="aiAnalysisModalDifficultyLevel" style="margin-bottom:16px;">
          <span :style="{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: difficultyStyle(aiAnalysisModalDifficultyLevel).bg,
            color: difficultyStyle(aiAnalysisModalDifficultyLevel).text,
            border: '1px solid ' + difficultyStyle(aiAnalysisModalDifficultyLevel).border,
            borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: '700'
          }">
            <i class="fas fa-tachometer-alt"></i>ระดับความยาก {{ aiAnalysisModalDifficultyLevel }}/5 &middot; {{ difficultyStyle(aiAnalysisModalDifficultyLevel).label }}
          </span>
          <span v-if="aiAnalysisModalEstimatedEndDate"
                style="display:inline-flex; align-items:center; gap:6px; margin-left:8px;
                       background:#eaf3fb; color:#2f6f95; border:1px solid #cfe4f2;
                       border-radius:20px; padding:5px 14px; font-size:12px; font-weight:700;">
            <i class="fas fa-calendar-alt"></i>คาดว่าจะเสร็จ {{ formatThaiDate(aiAnalysisModalEstimatedEndDate) }} ({{ aiAnalysisModalEstimatedDays }} วันทำงาน)
          </span>
          <div v-if="aiAnalysisModalDifficultyReason" style="font-size:12px; color:#777; margin-top:6px;">
            {{ aiAnalysisModalDifficultyReason }}
          </div>
        </div>

        <div v-if="aiAnalysisModalApprovalInfo"
             style="margin-bottom:16px; font-size:12px; color:#555; background:#f8f9fa; border:1px solid #e9ecef; border-radius:8px; padding:10px 14px;">
          <template v-if="aiAnalysisModalApprovalInfo.type === 'test_bug'">
            <div style="margin-bottom:4px;">
              <i class="fas fa-bug" style="margin-right:6px; color:#dd4b39;"></i>ผู้ทดสอบ Bug: <b>{{ aiAnalysisModalApprovalInfo.tester_name || '-' }}</b>
              <span v-if="aiAnalysisModalApprovalInfo.tester_test_date"> &middot; ทดสอบเมื่อ {{ formatThaiDate(aiAnalysisModalApprovalInfo.tester_test_date) }}</span>
            </div>
            <div>
              <i class="fas fa-check-circle" style="margin-right:6px; color:#00a65a;"></i>{{ ui.erp_approved_by || 'อนุมัติโดย' }}: <b>{{ aiAnalysisModalApprovalInfo.approver_name || '-' }}</b>
              <span v-if="aiAnalysisModalApprovalInfo.approve_date"> &middot; เมื่อ {{ formatThaiDate(aiAnalysisModalApprovalInfo.approve_date) }}</span>
            </div>
          </template>
          <template v-else>
            <i class="fas fa-check-circle" style="margin-right:6px; color:#00a65a;"></i>{{ ui.erp_approved_by || 'อนุมัติโดย' }}: <b>{{ aiAnalysisModalApprovalInfo.approver_name || '-' }}</b>
            <span v-if="aiAnalysisModalApprovalInfo.approve_date"> เมื่อ {{ formatThaiDate(aiAnalysisModalApprovalInfo.approve_date) }}</span>
            <span v-if="aiAnalysisModalApprovalInfo.days_to_approve !== null && aiAnalysisModalApprovalInfo.days_to_approve !== undefined">
              (ใช้เวลา {{ aiAnalysisModalApprovalInfo.days_to_approve }} วัน จากวันที่เปิดเอกสาร {{ formatThaiDate(aiAnalysisModalApprovalInfo.open_date) }})
            </span>
          </template>
        </div>

        <div v-if="aiAnalysisSectionList.length === 0" style="font-size:13px; color:#333; white-space:pre-wrap; line-height:1.6;">{{ aiAnalysisModalText }}</div>
        <div v-else v-for="sec in aiAnalysisSectionList" :key="sec.num" style="margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span :style="{
              width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700', color: '#fff', background: sec.color
            }">{{ sec.num }}</span>
            <span style="font-size:13px; font-weight:700; color:#333;">{{ sec.title }}</span>
          </div>
          <ol v-if="sec.num === 5 && sec.steps && sec.steps.length > 0" style="list-style:none; padding-left:30px; margin:0;">
            <li v-for="(step, i) in sec.steps" :key="i"
                style="display:flex; align-items:flex-start; gap:8px; padding:6px 0; font-size:13px; color:#444; border-bottom:1px dashed #f0e0c0;">
              <span style="flex-shrink:0; width:20px; height:20px; border-radius:50%; background:#f39c12; color:#fff; font-size:11px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; margin-top:1px;">{{ i + 1 }}</span>
              <span>{{ step }}</span>
            </li>
          </ol>
          <div v-else style="font-size:13px; color:#444; white-space:pre-wrap; line-height:1.7; padding-left:30px;">{{ sec.text }}</div>
        </div>
      </template>

      <template v-else-if="aiModalTab === 'worker'">
        <div v-if="!aiEffectiveWorkerSection5" style="font-size:13px; color:#888; text-align:center; padding:30px 0;">
          <i class="fas fa-info-circle" style="margin-right:6px;"></i>เคสนี้ไม่มี TODO List ให้ทำ Checklist
        </div>
        <template v-else>
          <div style="font-size:12px; color:#999; margin-bottom:10px;" v-if="!aiAnalysisModalTextWk">
            <i class="fas fa-info-circle" style="margin-right:4px;"></i>ยังไม่เคยบันทึก Checklist ของ Worker
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span :style="{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700', color: '#fff', background: aiEffectiveWorkerSection5.color
              }">5</span>
              <span style="font-size:13px; font-weight:700; color:#333;">{{ aiEffectiveWorkerSection5.title }}</span>
            </div>
            <a href="#" v-if="aiAnalysisModalTextWk && canEditAiChecklist" @click.prevent="syncAiAnalysisFromMaster()"
               style="font-size:11px; color:#9b59b6; white-space:nowrap;">
              <i class="fas fa-sync-alt" style="margin-right:4px;"></i>ดึงข้อมูลล่าสุดจากต้นฉบับ
            </a>
          </div>
          <div v-if="!canEditAiChecklist" style="font-size:11px; color:#999; margin-bottom:8px;">
            <i class="fas fa-eye" style="margin-right:4px;"></i>คุณมีสิทธิ์ดูได้อย่างเดียว
          </div>
          <ul style="list-style:none; padding-left:30px; margin:0;">
            <li v-for="(step, i) in aiEffectiveWorkerSection5.steps" :key="i"
                style="display:flex; align-items:flex-start; gap:8px; padding:6px 0; font-size:13px; color:#444; border-bottom:1px dashed #f0e0c0;">
              <span :style="{
                flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', marginTop: '1px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700', color: '#fff',
                background: aiAnalysisChecklist[i] ? '#c9c2b0' : '#f39c12'
              }">{{ i + 1 }}</span>
              <input type="checkbox"
                     :disabled="!canEditAiChecklist"
                     :checked="!!aiAnalysisChecklist[i]"
                     @change="aiAnalysisChecklist[i] = $event.target.checked"
                     style="margin-top:3px; width:15px; height:15px; flex-shrink:0; accent-color:#f39c12;" />
              <span :style="{ textDecoration: aiAnalysisChecklist[i] ? 'line-through' : 'none', color: aiAnalysisChecklist[i] ? '#999' : '#444' }">{{ step }}</span>
            </li>
          </ul>
        </template>
      </template>

      <template v-else-if="aiModalTab === 'compare'">
        <div v-if="aiCompareSpecLoading" style="text-align:center; padding:40px 0; color:#888;">
          <i class="fas fa-spinner fa-spin" style="font-size:22px; margin-bottom:10px; display:block;"></i>
          กำลังวิเคราะห์เปรียบเทียบ Spec...
        </div>
        <div v-else-if="aiCompareSpecError" style="font-size:13px; color:#888; text-align:center; padding:30px 0;">
          <i class="fas fa-info-circle" style="margin-right:6px;"></i>{{ aiCompareSpecError }}
        </div>
        <template v-else-if="aiCompareSpecData">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; gap:8px; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:8px; font-size:12px; color:#888;">
              <span><i class="fas fa-layer-group" style="margin-right:5px;"></i>{{ aiCompareSpecData.stages.join(' → ') }}</span>
              <span v-if="aiCompareSpecData.token_usage_in !== null && aiCompareSpecData.token_usage_in !== undefined"
                    style="background:#f1eafb; color:#6a34a8; border-radius:3px; padding:1px 7px; font-size:10px; font-weight:600; letter-spacing:0.2px; white-space:nowrap;">
                <i class="fas fa-microchip" style="margin-right:3px;"></i>Token: In {{ aiCompareSpecData.token_usage_in.toLocaleString() }} / Out {{ aiCompareSpecData.token_usage_out.toLocaleString() }}
              </span>
            </div>
            <a href="#" @click.prevent="runAiCompareSpec()" style="font-size:11px; color:#3c8dbc; white-space:nowrap;">
              <i class="fas fa-sync-alt" style="margin-right:4px;"></i>วิเคราะห์ใหม่
            </a>
          </div>

          <div v-for="(cmp, idx) in aiCompareSpecData.comparisons" :key="idx"
               style="margin-bottom:16px; background:#fafbfc; border:1px solid #eef0f2; border-radius:10px; padding:14px 16px;">
            <div style="font-size:13px; font-weight:700; color:#333; margin-bottom:10px;">{{ cmp.label }}</div>
            <div style="display:flex; gap:10px; margin-bottom:10px;">
              <div style="flex:1; background:#eafaf1; border-radius:8px; padding:8px 12px;">
                <div style="font-size:10px; color:#00a65a; font-weight:700; letter-spacing:0.3px;">COVERAGE</div>
                <div style="font-size:20px; font-weight:800; color:#00a65a;">{{ cmp.coverage_percent }}%</div>
              </div>
              <div style="flex:1; background:#eaf3fb; border-radius:8px; padding:8px 12px;">
                <div style="font-size:10px; color:#2f6f95; font-weight:700; letter-spacing:0.3px;">EXTRA SCOPE</div>
                <div style="font-size:20px; font-weight:800; color:#2f6f95;">{{ cmp.extra_percent }}%</div>
              </div>
            </div>
            <div style="font-size:13px; color:#444; white-space:pre-wrap; line-height:1.7;">{{ cmp.detail }}</div>
          </div>

          <div style="background:#f8f5fc; border:1px solid #ecdcfa; border-radius:10px; padding:14px 16px;">
            <div style="font-size:13px; font-weight:700; color:#6a34a8; margin-bottom:8px;">
              <i class="fas fa-clipboard-check" style="margin-right:6px;"></i>สรุปภาพรวม
            </div>
            <div style="font-size:13px; color:#444; white-space:pre-wrap; line-height:1.7;">{{ aiCompareSpecData.overall_summary }}</div>
          </div>
        </template>
      </template>
    </template>
    <template #footer>
      <div style="display:flex; justify-content:flex-end; gap:8px; width:100%;">
        <button type="button" class="btn btn-default btn-sm" @click="$refs.ai_analysis_modal.closeModal()" style="border-radius:6px; padding:7px 16px; font-weight:500; border:1px solid #dce4ec;">
          <i class="fas fa-times" style="margin-right:4px;"></i> {{ ui.erp_close || 'ปิด' }}
        </button>
        <button type="button"
                v-if="aiModalTab === 'worker' && aiEffectiveWorkerSection5 && canEditAiChecklist"
                class="btn btn-sm"
                :disabled="aiAnalysisChecklistSaving"
                @click.prevent="updateAiAnalysisChecklist()"
                style="border-radius:6px; padding:7px 18px; font-weight:600; background:#00a65a; color:#fff; border:none;">
          <i :class="aiAnalysisChecklistSaving ? 'fas fa-spinner fa-spin' : 'fas fa-check-double'" style="margin-right:4px;"></i>{{ aiAnalysisChecklistSaving ? 'กำลังบันทึก...' : 'อัพเดท Checklist' }}
        </button>
        <button type="button"
                v-if="aiModalTab !== 'compare' && aiAnalysisModalText"
                class="btn btn-sm"
                :disabled="aiAnalysisExcelLoading"
                @click.prevent="generateAiAnalysisChecklistExcel()"
                style="border-radius:6px; padding:7px 18px; font-weight:600; background:#12a86e; color:#fff; border:none;">
          <i :class="aiAnalysisExcelLoading ? 'fas fa-spinner fa-spin' : 'fas fa-file-excel'" style="margin-right:4px;"></i>{{ aiAnalysisExcelLoading ? 'กำลังสร้าง Excel...' : (ui.csm_trn_create_excel || 'สร้าง Excel') }}
        </button>
        <button type="button"
                v-if="aiModalTab !== 'compare'"
                class="btn btn-sm"
                :disabled="aiAnalysisPdfLoading"
                @click.prevent="generateAiAnalysisPdf()"
                style="border-radius:6px; padding:7px 18px; font-weight:600; background:#9b59b6; color:#fff; border:none;">
          <i :class="aiAnalysisPdfLoading ? 'fas fa-spinner fa-spin' : 'fas fa-file-pdf'" style="margin-right:4px;"></i>{{ aiAnalysisPdfLoading ? 'กำลังสร้าง PDF...' : 'สร้างคู่มือ PDF' }}
        </button>
        <button type="button"
                v-if="aiModalTab === 'compare' && aiCompareSpecData"
                class="btn btn-sm"
                :disabled="aiCompareSpecPdfLoading"
                @click.prevent="generateAiCompareSpecPdf()"
                style="border-radius:6px; padding:7px 18px; font-weight:600; background:#3c8dbc; color:#fff; border:none;">
          <i :class="aiCompareSpecPdfLoading ? 'fas fa-spinner fa-spin' : 'fas fa-file-pdf'" style="margin-right:4px;"></i>{{ aiCompareSpecPdfLoading ? 'กำลังสร้าง PDF...' : 'สร้าง PDF Compare Spec' }}
        </button>
      </div>
    </template>
  </modal-3>
</template>

<script type="text/javascript">
  export default {
    props: {
      aiModalTab: String,
      aiAnalysisModalTokenIn: Number,
      aiAnalysisModalTokenOut: Number,
      aiAnalysisModalSubject: String,
      aiAnalysisModalDifficultyLevel: [Number, String],
      aiAnalysisModalEstimatedEndDate: [String, Date],
      aiAnalysisModalEstimatedDays: [Number, String],
      aiAnalysisModalDifficultyReason: String,
      aiAnalysisModalApprovalInfo: Object,
      aiAnalysisSectionList: Array,
      aiAnalysisModalText: String,
      aiEffectiveWorkerSection5: Object,
      aiAnalysisModalTextWk: String,
      canEditAiChecklist: Boolean,
      aiAnalysisChecklist: Object,
      aiAnalysisChecklistSaving: Boolean,
      aiCompareSpecLoading: Boolean,
      aiCompareSpecError: String,
      aiCompareSpecData: Object,
      aiAnalysisExcelLoading: Boolean,
      aiAnalysisPdfLoading: Boolean,
      aiCompareSpecPdfLoading: Boolean,
      difficultyStyle: Function,
      formatThaiDate: Function,
      syncAiAnalysisFromMaster: Function,
      updateAiAnalysisChecklist: Function,
      onClickCompareSpecTab: Function,
      runAiCompareSpec: Function,
      generateAiAnalysisChecklistExcel: Function,
      generateAiAnalysisPdf: Function,
      generateAiCompareSpecPdf: Function,
    },
    data() {
      return {
        ui: window.ui,
      }
    },
    methods: {
      openModal() {
        this.$refs.ai_analysis_modal.openModal()
      },
      closeModal() {
        this.$refs.ai_analysis_modal.closeModal()
      },
      setSize(size) {
        this.$refs.ai_analysis_modal.setSize(size)
      },
    },
  }
</script>
