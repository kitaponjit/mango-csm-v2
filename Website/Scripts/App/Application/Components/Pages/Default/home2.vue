<template>
  <div class="home2-page">
  <re-page ref="page">
      <template #body>
        <!-- ===== Priority Cards Section ===== -->
        <div class="priority-section padding-l-30 padding-r-30">
          <div class="priority-cards-wrapper">
            <div
              class="pc-card"
              v-for="(item, index) in priorityList"
              :key="index"
              :style="{ '--pc': item.priority_color || '#149ce8', '--i': index }"
            >
              <!-- Header: icon + title + value -->
              <div class="pc-header">
                <div class="pc-icon-box" :style="{ background: (item.priority_color || '#149ce8') + '1a' }">
                  <i :class="['fas', pcIcons[index] || 'fa-tasks', 'pc-icon']"
                     :style="{ color: item.priority_color || '#149ce8' }"></i>
                </div>
                <div class="pc-title-group">
                  <div class="pc-title">{{ item.prioity_des }}</div>
                  <div class="pc-subtitle">Task Count</div>
                </div>
                <div class="pc-value" :style="{ color: item.priority_color || '#149ce8' }">
                  {{ item.total_priority }}
                </div>
              </div>

              <!-- Progress bar -->
              <div class="pc-progress-wrap">
                <div class="pc-bar-track">
                  <div
                    class="pc-bar-fill"
                    :style="{
                      width: getPercent(item) + '%',
                      background: item.priority_color || '#149ce8'
                    }"
                  ></div>
                </div>
                <div class="pc-scale">
                  <span>0</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                </div>
              </div>

              <!-- Footer -->
              <div class="pc-footer">
                <span class="pc-unit-label">
                  <span class="pc-unit-dot" :style="{ background: item.priority_color || '#149ce8' }"></span>
                  งาน
                </span>
                <span class="pc-percent-label" :style="{ color: item.priority_color || '#149ce8' }">
                  {{ getPercent(item) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== CSM Status Pie Chart Section (4 Cards) ===== -->
        <div class="pie-chart-section padding-l-30 padding-r-30 padding-t-10">
          <div class="pie-cards-wrapper">

            <!-- Card 1: รออนุมัติเอกสาร -->
            <div class="pie-card" @click="onPieCardClick('block1')">
              <div class="pie-card-header">
                <div class="pie-card-icon" style="background: rgba(124,37,83,0.12);">
                  <i class="fas fa-file-signature" style="color: #7E2553;"></i>
                </div>
                <div class="pie-card-title-group">
                  <div class="pie-card-title">รออนุมัติเอกสาร</div>
                  <div class="pie-card-subtitle">Pending Approval Documents</div>
                </div>
                <!-- <div class="pie-card-number" style="background: #7E2553;">1</div> -->
              </div>
              <div class="pie-card-body">
                <div class="pie-card-chart">
                  <ECharts :option="pieOption1" :style="{ width: '100%', height: pieChartHeight }" />
                </div>
                <div class="pie-card-info">
                  <span class="pie-card-link"><i class="fas fa-arrow-right"></i> คลิกเพื่อดูรายละเอียด</span>
                </div>
              </div>
            </div>

            <!-- Card 2: ใกล้ครบกำหนดส่งงาน -->
            <div class="pie-card" @click="onPieCardClick('block2')">
              <div class="pie-card-header">
                <div class="pie-card-icon" style="background: rgba(245,158,11,0.12);">
                  <i class="fas fa-clock" style="color: #f59e0b;"></i>
                </div>
                <div class="pie-card-title-group">
                  <div class="pie-card-title">ใกล้ครบกำหนดส่งงาน</div>
                  <div class="pie-card-subtitle">Upcoming Due Dates : 3 / 7 / 15 วัน</div>
                </div>
                <!-- <div class="pie-card-number" style="background: #f59e0b;">2</div> -->
              </div>
              <div class="pie-card-body">
                <div class="pie-card-chart">
                  <ECharts :option="pieOption2" :style="{ width: '100%', height: pieChartHeight }" />
                </div>
                <div class="pie-card-due-tags">
                  <span class="pie-due-tag">ภายใน 3 วัน <b class="pie-due-val">{{ pieChartData.graph2_1 || 0 }}</b></span>
                  <span class="pie-due-tag">ภายใน 7 วัน <b class="pie-due-val">{{ pieChartData.graph2_2 || 0 }}</b></span>
                  <span class="pie-due-tag">ภายใน 15 วัน <b class="pie-due-val">{{ pieChartData.graph2_3 || 0 }}</b></span>
                </div>
              </div>
            </div>

            <!-- Card 3: งานที่เลยกำหนด -->
            <div class="pie-card" @click="onPieCardClick('block3')">
              <div class="pie-card-header">
                <div class="pie-card-icon" style="background: rgba(239,68,68,0.12);">
                  <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                </div>
                <div class="pie-card-title-group">
                  <div class="pie-card-title">งานที่เลยกำหนด</div>
                  <div class="pie-card-subtitle">Overdue Tasks</div>
                </div>
                <!-- <div class="pie-card-number" style="background: #ef4444;">3</div> -->
              </div>
              <div class="pie-card-body">
                <div class="pie-card-chart">
                  <ECharts :option="pieOption3" :style="{ width: '100%', height: pieChartHeight }" />
                </div>
                <div class="pie-card-info">
                  <span class="pie-card-link"><i class="fas fa-arrow-right"></i> คลิกเพื่อดูรายละเอียด</span>
                </div>
              </div>
            </div>

            <!-- Card 4: รอตรวจสอบเพื่อปิดใบงาน -->
            <div class="pie-card" @click="onPieCardClick('block4')">
              <div class="pie-card-header">
                <div class="pie-card-icon" style="background: rgba(16,185,129,0.12);">
                  <i class="fas fa-check-circle" style="color: #10b981;"></i>
                </div>
                <div class="pie-card-title-group">
                  <div class="pie-card-title">รอตรวจสอบเพื่อปิดใบงาน</div>
                  <div class="pie-card-subtitle">Pending Inspection to Close</div>
                </div>
                <!-- <div class="pie-card-number" style="background: #10b981;">4</div> -->
              </div>
              <div class="pie-card-body">
                <div class="pie-card-chart">
                  <ECharts :option="pieOption4" :style="{ width: '100%', height: pieChartHeight }" />
                </div>
                <div class="pie-card-info">
                  <span class="pie-card-link"><i class="fas fa-arrow-right"></i> คลิกเพื่อดูรายละเอียด</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ===== Pie Chart Popup Modal ===== -->
        <modal-2 ref="pieModal" :hideFooter="true">
          <template #header>
            <h4 class="modal-title"><i class="fas fa-list margin-r-8"></i>{{ pieModalTitle }}</h4>
          </template>
          <template #body>
            <div :class="['pie-modal-content', 'pie-modal-type-' + pieModalType]">
              <!-- Summary banner -->
              <div class="pie-modal-summary">
                <span class="pie-modal-summary-icon">
                  <i :class="['fas', pieModalType === 'approve' ? 'fa-file-signature' : pieModalType === 'neardue' ? 'fa-clock' : pieModalType === 'overdue' ? 'fa-exclamation-triangle' : 'fa-check-circle']"></i>
                </span>
                <div class="pie-modal-summary-body">
                  <span class="pie-modal-summary-label">รายการทั้งหมด</span>
                  <span class="pie-modal-summary-count">{{ pieModalType === 'neardue' || pieModalType === 'overdue' ? pieModalAllData.length : pieModalData.length }}</span>
                </div>
              </div>

              <!-- Tab สำหรับ Block 2 (ใกล้ครบกำหนด) -->
              <div v-if="pieModalType === 'neardue'" class="pie-modal-tabs">
                <button :class="['pie-tab-btn', pieModalActiveTab === '3' ? 'active' : '']" @click="changePieTab('3')">
                  <i class="fas fa-bolt"></i> ภายใน 3 วัน <span class="pie-tab-count">{{ pieModalTabCounts.due3 }}</span>
                </button>
                <button :class="['pie-tab-btn', pieModalActiveTab === '7' ? 'active' : '']" @click="changePieTab('7')">
                  <i class="fas fa-hourglass-half"></i> ภายใน 7 วัน <span class="pie-tab-count">{{ pieModalTabCounts.due7 }}</span>
                </button>
                <button :class="['pie-tab-btn', pieModalActiveTab === '15' ? 'active' : '']" @click="changePieTab('15')">
                  <i class="fas fa-calendar-alt"></i> ภายใน 15 วัน <span class="pie-tab-count">{{ pieModalTabCounts.due15 }}</span>
                </button>
              </div>

              <!-- Tab สำหรับ Block 3 (เลยกำหนด) -->
              <div v-if="pieModalType === 'overdue'" class="pie-modal-tabs">
                <button :class="['pie-tab-btn', pieModalActiveTab === '7' ? 'active' : '']" @click="changePieTab('7')">
                  <i class="fas fa-exclamation-circle"></i> เลยกำหนด 1-7 วัน <span class="pie-tab-count">{{ pieModalTabCounts.over7 }}</span>
                </button>
                <button :class="['pie-tab-btn', pieModalActiveTab === '14' ? 'active' : '']" @click="changePieTab('14')">
                  <i class="fas fa-exclamation-triangle"></i> เลยกำหนด 8-14 วัน <span class="pie-tab-count">{{ pieModalTabCounts.over14 }}</span>
                </button>
                <button :class="['pie-tab-btn overdue-critical', pieModalActiveTab === '15' ? 'active' : '']" @click="changePieTab('15')">
                  <i class="fas fa-fire"></i> เลยกำหนด > 14 วัน <span class="pie-tab-count">{{ pieModalTabCounts.over15 }}</span>
                </button>
              </div>

              <!-- รายการเอกสาร -->
              <div class="pie-modal-list-wrap">
                <!-- Empty State -->
                <div v-if="pieModalData.length === 0" class="pie-modal-empty">
                  <i class="fas fa-inbox"></i>
                  <p>ไม่พบข้อมูล</p>
                </div>

                <!-- Document Cards -->
                <div class="pie-modal-list" v-if="pieModalData.length > 0">
                  <div :class="['pie-modal-item', getPieStatusClass(item.status)]" v-for="(item, idx) in pieModalPagedData" :key="idx" @click="openReq(item.job_no)">
                    <span class="pie-modal-item-idx">{{ (pieModalPage - 1) * pieModalPageSize + idx + 1 }}</span>
                    <div class="pie-modal-item-left">
                      <div class="pie-modal-item-no">
                        <i class="fas fa-file-alt"></i>
                        <span>{{ item.job_no }}</span>
                      </div>
                      <div class="pie-modal-item-project" v-if="item.project_name">{{ item.project_name }}</div>
                      <div class="pie-modal-item-subject" v-if="item.subject">{{ item.subject }}</div>
                    </div>
                    <div class="pie-modal-item-right">
                      <span :class="['pie-status-badge', getPieStatusClass(item.status)]">{{ item.status }}</span>
                      <i class="fas fa-chevron-right pie-modal-item-link"></i>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div class="pie-modal-pagination" v-if="pieModalTotalPages > 1">
                <button class="pie-page-btn" :disabled="pieModalPage === 1" @click="pieModalPage = 1">
                  <i class="fas fa-angle-double-left"></i>
                </button>
                <button class="pie-page-btn" :disabled="pieModalPage === 1" @click="pieModalPage--">
                  <i class="fas fa-angle-left"></i>
                </button>
                <span class="pie-page-info">{{ pieModalPage }} / {{ pieModalTotalPages }}</span>
                <button class="pie-page-btn" :disabled="pieModalPage === pieModalTotalPages" @click="pieModalPage++">
                  <i class="fas fa-angle-right"></i>
                </button>
                <button class="pie-page-btn" :disabled="pieModalPage === pieModalTotalPages" @click="pieModalPage = pieModalTotalPages">
                  <i class="fas fa-angle-double-right"></i>
                </button>
              </div>
            </div>
          </template>
          <template #footer></template>
        </modal-2>

        <!-- ===== Calendar + Document Section ===== -->
        <div class="row row-no-gutters padding-l-30 padding-r-30 padding-t-10 content-flex">
          <!-- Calendar -->
          <div class="col-lg-9 col-md-8 calendar-section">
            <div class="row row-no-gutters padding-r-20">
              <div class="col-md-12">
                <div class="box box-solid" id="CalendarBox" style="border-radius: 15px;">
                  <div class="box-header with-border" style="border-radius: 15px 15px 0 0; background: linear-gradient(135deg, #02244f 0%, #0a3d7a 100%); padding: 10px 18px;">
                    <h3 class="box-title" style="color:#fff; font-size:13px; font-weight:700;">
                      <i class="fas fa-calendar-alt margin-r-8"></i>ปฏิทิน
                    </h3>
                    <div class="box-tools pull-right">
                      <button type="button" class="btn btn-box-tool" data-widget="collapse" style="color:#fff;">
                        <i class="fas fa-minus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="box-body" style="border-radius: 0 0 15px 15px; box-shadow: rgba(0, 0, 0, 0.08) 0px 6px 20px;">
                    <div class="row row-no-gutters">
                      <div class="col-md-12">
                        <fullCalendar
                          ref="calendar"
                          class="customCalendar"
                          :options="calendarOptions"
                          :key="calendarKey"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Document Panel -->
          <div class="col-lg-3 col-md-4">
            <div class="row row-no-gutters">
              <div class="col-md-12">
                <div class="box box-solid doc-panel-box" id="DocPanelBox">
                  <div class="box-header with-border doc-panel-header">
                    <h3 class="box-title">
                      <i class="fas fa-file-alt margin-r-8"></i>เอกสาร ณ วันที่เลือก
                    </h3>
                    <div class="box-tools pull-right">
                      <button type="button" class="btn btn-box-tool" data-widget="collapse" style="color:#fff;">
                        <i class="fas fa-minus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="box-body padding-0 doc-body">

                    <!-- Empty State -->
                    <div v-if="documentList.length == 0" class="empty-state">
                      <i class="fas fa-folder-open empty-icon"></i>
                      <p class="empty-text">ไม่พบข้อมูล</p>
                    </div>

                    <!-- Today Documents -->
                    <template v-if="todayTask.length > 0">
                      <div class="doc-section-label today-label">
                        <span class="label-dot today-dot"></span>
                        Today documents
                        <span class="label-count">{{ todayTask.length }}</span>
                      </div>
                      <div class="dc-list">
                        <div
                          class="dc-card"
                          v-for="(item, index) in todayTask"
                          :key="'today-' + index"
                          @click="openReq(item.job_no)"
                          :style="{ '--dc': item.priority_color || '#149ce8' }"
                        >
                          <!-- Header row -->
                          <div class="dc-header">
                            <div class="dc-icon-box">
                              <i class="fas fa-file-alt dc-icon"></i>
                            </div>
                            <div class="dc-info">
                              <div class="dc-jobno">{{ item.job_no }}</div>
                              <div class="dc-meta">อนุมัติ {{ item.total_app }}/{{ item.total }}</div>
                            </div>
                            <span :class="['dc-badge', statusClass('badge-', item.status_name)]">
                              <i v-if="item.status_name == 'Checking' || item.status_name == 'Done'" class="fa fa-warning dc-warn"></i>
                              {{ item.status_name || 'None' }}
                            </span>
                          </div>
                          <!-- Progress -->
                          <div class="dc-progress-wrap">
                            <div class="dc-bar-track">
                              <div class="dc-bar-fill"
                                :style="{ width: item.total > 0 ? (item.total_app / item.total * 100) + '%' : '0%' }">
                              </div>
                            </div>
                            <div class="dc-scale">
                              <span>0</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                            </div>
                          </div>
                          <!-- Footer -->
                          <div class="dc-footer">
                            <span class="dc-foot-left">
                              <span class="dc-dot"></span>
                              {{ item.task_qty ? item.task_qty + ' งาน' : 'งาน' }}
                            </span>
                            <span class="dc-foot-pct">
                              {{ item.total > 0 ? Math.round(item.total_app / item.total * 100) : 0 }}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Accumulated Documents -->
                    <template v-if="anotherTask.length > 0 && todayTask.length > 0">
                      <div class="doc-section-label accumulated-label">
                        <span class="label-dot accumulated-dot"></span>
                        Accumulated documents
                        <span class="label-count">{{ anotherTask.length }}</span>
                      </div>
                    </template>
                    <template v-if="anotherTask.length > 0">
                      <div class="dc-list" :class="{ 'dc-list-notop': todayTask.length === 0 }">
                        <div
                          class="dc-card"
                          v-for="(item, index) in anotherTask"
                          :key="'another-' + index"
                          @click="openReq(item.job_no)"
                          :style="{ '--dc': item.priority_color || '#149ce8' }"
                        >
                          <div class="dc-header">
                            <div class="dc-icon-box">
                              <i class="fas fa-file-alt dc-icon"></i>
                            </div>
                            <div class="dc-info">
                              <div class="dc-jobno">{{ item.job_no }}</div>
                              <div class="dc-meta">อนุมัติ {{ item.total_app }}/{{ item.total }}</div>
                            </div>
                            <span :class="['dc-badge', statusClass('badge-', item.status_name)]">
                              <i v-if="item.status_name == 'Checking' || item.status_name == 'Done'" class="fa fa-warning dc-warn"></i>
                              {{ item.status_name || 'None' }}
                            </span>
                          </div>
                          <div class="dc-progress-wrap">
                            <div class="dc-bar-track">
                              <div class="dc-bar-fill"
                                :style="{ width: item.total > 0 ? (item.total_app / item.total * 100) + '%' : '0%' }">
                              </div>
                            </div>
                            <div class="dc-scale">
                              <span>0</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                            </div>
                          </div>
                          <div class="dc-footer">
                            <span class="dc-foot-left">
                              <span class="dc-dot"></span>
                              {{ item.task_qty ? item.task_qty + ' งาน' : 'งาน' }}
                            </span>
                            <span class="dc-foot-pct">
                              {{ item.total > 0 ? Math.round(item.total_app / item.total * 100) : 0 }}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </template>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </template>
    </re-page>
  </div>
</template>

<script >
import fullCalendar from '@fullcalendar/vue';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { mapState, mapGetters } from 'vuex'

  let page = {}

  export default {
    data() {
      return {
        ui: window.ui,
        baseUrl,
        auth,
        statusCode,
        today: moment().format('YYYY-MM-DD'),
        displayData: [],
        displayMonthData: [],
        calendarKey: 0,
        selectedDate: null,
        priorityCodeData_isActive: [],
        holidayDates: [],
        csmDoc: [],
        priorityList:[],
        pcIcons: ['fa-layer-group', 'fa-angle-double-down', 'fa-grip-lines', 'fa-bolt', 'fa-fire'],
        documentList: [],
        calendarList: [],
        todayTask: [],
        anotherTask: [],
        isLoadingMonth: false,
        currentMonth: null,
        isSmallScreen: true,
        pieChartHeight: '130px',

        // === Pie Chart Data ===
        pieChartData: { graph1: 0, graph2_1: 0, graph2_2: 0, graph2_3: 0, graph3: 0, graph4: 0 },
        pieModalTitle: '',
        pieModalType: '', // 'approve', 'neardue', 'overdue', 'closing'
        pieModalActiveTab: '',
        pieModalData: [],
        pieModalAllData: [], // เก็บข้อมูลทั้งหมดสำหรับ filter tab
        pieModalTabCounts: { due3: 0, due7: 0, due15: 0, over7: 0, over14: 0, over15: 0 },
        pieModalPage: 1,
        pieModalPageSize: 15,

        calendarOptions: {
          plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          // การตั้งค่าพื้นฐาน
          selectable: true,
          unselectAuto: false,
          height: '100%',

          // การตั้งค่า toolbar
          headerToolbar: {
            left: '',
            center: 'prev title next',
            right: ''
          },

          // การตั้งค่า event
          events: [],
          eventDisplay: 'list-item',
          dayMaxEvents: true,

          // callbacks
          dateClick: this.handleDateClick,
          dayCellDidMount: this.highlightDate,
          datesSet: this.applyHighlight,

          // การแสดงผล
          aspectRatio: 2.5,
          contentHeight: 'auto',
          handleWindowResize: true
        }

      }
    },
    components: {
      fullCalendar,
    },
    methods: {
      getPercent(item) {
        const max = Math.max(...this.priorityList.map(x => x.total_priority || 0))
        if (!max) return 0
        return Math.round((item.total_priority / max) * 100)
      },
      statusClass(prefix, status) {
        return status == 'Complete' ? prefix + 'success' : status == 'In Progress' ? prefix + 'info' : status == 'Done' ? prefix + 'warning' : status == 'Hold' ? prefix + 'warning' : status == 'Checking' ? prefix + 'purple' : ''
      },
      getPieStatusClass(status) {
        if (!status) return ''
        if (status.includes('รออนุมัติ')) return 'pie-status-approve'
        if (status.includes('เหลืออีก')) return 'pie-status-neardue'
        if (status.includes('เกินวันครบกำหนด') || status === 'critical') return 'pie-status-overdue'
        if (status.includes('รอตรวจสอบ')) return 'pie-status-closing'
        return ''
      },

      // === Pie Chart Methods ===
      async loadPieChartData() {
        try {
          let act = `csm/data/CsmPieChart?empno=${this.auth.empno}`
          let rsp = await $xt.getServer(act)
          this.pieChartData = rsp
        } catch (ex) {
          console.error('loadPieChartData error:', ex)
        }
      },
      async onPieCardClick(blockType) {
        try {
          page.loadingBox.show()
          let act = `csm/data/CsmPieChartPopup?empno=${this.auth.empno}&block=${blockType}`
          let rsp = await $xt.getServer(act)

          if (blockType === 'block1') {
            this.pieModalTitle = 'รออนุมัติเอกสาร'
            this.pieModalType = 'approve'
            this.pieModalActiveTab = ''
            this.pieModalPage = 1
            this.pieModalData = rsp.data || []
          } else if (blockType === 'block2') {
            this.pieModalTitle = 'ใกล้ครบกำหนดส่งงาน'
            this.pieModalType = 'neardue'
            this.pieModalAllData = rsp.data || []
            // นับจำนวนแต่ละ tab
            this.pieModalTabCounts.due3 = this.pieModalAllData.filter(x => x.daydiff >= 0 && x.daydiff <= 3).length
            this.pieModalTabCounts.due7 = this.pieModalAllData.filter(x => x.daydiff >= 4 && x.daydiff <= 7).length
            this.pieModalTabCounts.due15 = this.pieModalAllData.filter(x => x.daydiff >= 8 && x.daydiff <= 15).length
            this.pieModalActiveTab = '3'
            this.filterPieModalByTab()
          } else if (blockType === 'block3') {
            this.pieModalTitle = 'งานที่เลยกำหนด'
            this.pieModalType = 'overdue'
            this.pieModalAllData = rsp.data || []
            // นับจำนวนแต่ละ tab
            this.pieModalTabCounts.over7 = this.pieModalAllData.filter(x => x.overdue_days >= 1 && x.overdue_days <= 7).length
            this.pieModalTabCounts.over14 = this.pieModalAllData.filter(x => x.overdue_days >= 8 && x.overdue_days <= 14).length
            this.pieModalTabCounts.over15 = this.pieModalAllData.filter(x => x.overdue_days > 14).length
            this.pieModalActiveTab = '7'
            this.filterPieModalByTab()
          } else if (blockType === 'block4') {
            this.pieModalTitle = 'รอตรวจสอบเพื่อปิดใบงาน'
            this.pieModalType = 'closing'
            this.pieModalActiveTab = ''
            this.pieModalPage = 1
            this.pieModalData = rsp.data || []
          }

          this.$refs.pieModal.setSize('modal-lg-2')
          this.$refs.pieModal.openModal()
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          page.loadingBox.hide()
        }
      },
      changePieTab(tab) {
        this.pieModalActiveTab = tab
        this.pieModalPage = 1
        this.filterPieModalByTab()
      },
      filterPieModalByTab() {
        if (this.pieModalType === 'neardue') {
          if (this.pieModalActiveTab === '3') {
            this.pieModalData = this.pieModalAllData.filter(x => x.daydiff >= 0 && x.daydiff <= 3)
          } else if (this.pieModalActiveTab === '7') {
            this.pieModalData = this.pieModalAllData.filter(x => x.daydiff >= 4 && x.daydiff <= 7)
          } else if (this.pieModalActiveTab === '15') {
            this.pieModalData = this.pieModalAllData.filter(x => x.daydiff >= 8 && x.daydiff <= 15)
          }
        } else if (this.pieModalType === 'overdue') {
          if (this.pieModalActiveTab === '7') {
            this.pieModalData = this.pieModalAllData.filter(x => x.overdue_days >= 1 && x.overdue_days <= 7)
          } else if (this.pieModalActiveTab === '14') {
            this.pieModalData = this.pieModalAllData.filter(x => x.overdue_days >= 8 && x.overdue_days <= 14)
          } else if (this.pieModalActiveTab === '15') {
            this.pieModalData = this.pieModalAllData.filter(x => x.overdue_days > 14)
          }
        }
      },
      buildDonutOption(value, total, color, label) {
        const remaining = Math.max(0, total - value)
        const fontSize = value >= 100 ? 22 : value >= 10 ? 26 : 28
        return {
          series: [
            {
              type: 'pie',
              radius: ['52%', '75%'],
              center: ['50%', '50%'],
              silent: true,
              startAngle: 90,
              animationDuration: 900,
              animationEasing: 'cubicOut',
              label: {
                show: true,
                position: 'center',
                formatter: `{val|${value}}\n{lbl|${label}}`,
                rich: {
                  val: { fontSize: fontSize, fontWeight: '800', color: color, lineHeight: 32 },
                  lbl: { fontSize: 9, color: '#94a3b8', lineHeight: 16 }
                }
              },
              itemStyle: { borderRadius: 0, borderColor: '#fff', borderWidth: 0 },
              data: this.buildDonutData(value, remaining, color)
            }
          ]
        }
      },
      buildDonutData(value, remaining, baseColor) {
        if (value === 0) {
          return [{ value: 1, itemStyle: { color: '#f1f5f9' } }]
        }
        return [
          {
            value: value,
            itemStyle: {
              color: {
                type: 'linear', x: 0, y: 0, x2: 0.35, y2: 1,
                colorStops: [
                  { offset: 0, color: baseColor },
                  { offset: 1, color: this.adjustColorOpacity(baseColor, 0.5) }
                ]
              },
              borderRadius: remaining > 0 ? 10 : 0,
              shadowBlur: 12,
              shadowColor: this.adjustColorOpacity(baseColor, 0.35),
              shadowOffsetY: 2
            }
          },
          { value: remaining, itemStyle: { color: '#f1f5f9' } }
        ]
      },
      adjustColorOpacity(hex, opacity) {
        // แปลง hex เป็น rgba
        let r = 0, g = 0, b = 0
        if (hex.length === 4) {
          r = parseInt(hex[1] + hex[1], 16)
          g = parseInt(hex[2] + hex[2], 16)
          b = parseInt(hex[3] + hex[3], 16)
        } else if (hex.length === 7) {
          r = parseInt(hex.slice(1, 3), 16)
          g = parseInt(hex.slice(3, 5), 16)
          b = parseInt(hex.slice(5, 7), 16)
        }
        return `rgba(${r},${g},${b},${opacity})`
      },
      async loadHoliday(){
        let act = `CSM/Config/Holiday_ReadList`;
        let rsp = await $xt.getServer(act);
        this.holidayDates = rsp.data.map(x => moment(x.holiday_date).format('YYYY-MM-DD'));

        this.calendarKey++;
      },
      async handleDateClick(info) {
        this.selectedDate = moment(info.date).format('YYYY-MM-DD');
        // ลบ class 'fc-selected-date' จากทุก cell
        const oldSelected = document.querySelectorAll('.fc-selected-date');
        oldSelected.forEach(el => el.classList.remove('fc-selected-date'));

        // โหลดข้อมูลของวันที่เลือก แล้วจึงแสดงจำนวน Document
        await this.loadPriorityTask('calendar', this.selectedDate)
      },
      openReq(x) {
          window.open( this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${x}`)
      },
      highlightDate(info) {
        const selected = this.selectedDate;
        const cellDate = moment(info.date).format('YYYY-MM-DD');

        // ไฮไลต์วันที่เลือก
        if (selected === cellDate) {
          info.el.classList.add('fc-selected-date');
        }

        // ถ้าเป็นวันหยุด
        if (this.holidayDates.includes(cellDate)) {
          const numberEl = info.el.querySelector('.fc-daygrid-day-number');
          if (numberEl) {
            numberEl.classList.add('fc-holiday');
          }
        }
      },
      applyHighlight(info) {
        this.$nextTick(async () => {
          // ใช้ calendar API เพื่อหาเดือนปัจจุบันที่ถูกต้อง
          let monthStr;
          try {
            const calendarApi = this.$refs.calendar.getApi();
            const currentDate = calendarApi.getDate(); // วันที่ปัจจุบันที่ calendar กำลังแสดง
            monthStr = (month ? moment(month).startOf('month') : moment().startOf('month')).format('YYYY-MM-DD');
          } catch (e) {
            // fallback: หาจากกลางช่วงเวลาที่แสดง
            const middleDate = moment(info.start).add(15, 'days');
            monthStr = middleDate.format('YYYY-MM-DD');
          }

          // ป้องกัน infinite loop โดยเช็คว่าเปลี่ยนเดือนจริงหรือไม่
          if (this.currentMonth !== monthStr && !this.isLoadingMonth) {
            this.currentMonth = monthStr;
            this.isLoadingMonth = true;

            try {
              // เรียก API ตามเดือนใหม่ เฉพาะเดือนที่เปลี่ยนไป ไม่ load today
              await this.loadCalendarTask();
            } finally {
              this.isLoadingMonth = false;
            }
          }

          // ลบ class เก่าก่อน
          const oldSelected = document.querySelectorAll('.fc-selected-date');
          oldSelected.forEach(el => el.classList.remove('fc-selected-date'));

          // ถ้ามี selectedDate ให้ไฮไลต์
          if (this.selectedDate) {
            const selected = this.selectedDate;

            // หาทุก cell แล้วไฮไลต์ให้ตรงวัน
            const allCells = document.querySelectorAll('.fc-daygrid-day');
            allCells.forEach(cell => {
              const dateStr = cell.getAttribute('data-date');
              if (dateStr === selected) {
                cell.classList.add('fc-selected-date');
              }
            });
          }
        });
      },
      checkScreenSize() {
        if (window.innerWidth < 1600) {
          this.isSmallScreen = true
          this.calendarOptions.height = undefined
          this.calendarOptions.contentHeight = undefined
        } else {
          this.isSmallScreen = false
          this.calendarOptions.height = '100%'
          this.calendarOptions.contentHeight = 'auto'
        }

        // ต่ำกว่า 940px : ให้ปฏิทินสูงตามเนื้อหา
        // เดิมที่จอ < 1600px height/contentHeight ถูกตั้งเป็น undefined
        // FullCalendar จึงคิดความสูงจาก aspectRatio (2.5 = กว้าง 2.5 เท่าของสูง)
        // ได้กรอบเตี้ยกว่าที่ 6 แถวสัปดาห์ต้องใช้ แล้วใส่ตัวเลื่อนในตัวเอง
        // → เห็นวันไม่ครบเดือน  ตั้ง height/contentHeight เป็น auto ให้ยืดเต็ม
        if (window.matchMedia('(max-width: 939px)').matches) {
          this.$set(this.calendarOptions, 'height', 'auto')
          this.$set(this.calendarOptions, 'contentHeight', 'auto')
        }

        // ความสูงกราฟวงกลม : ของเดิมตรึง 130px ทุกจอ พอการ์ดเรียงเต็มความกว้าง
        // บนมือถือจะดูใหญ่เกินสัดส่วนการ์ด ย่อลงตามขนาดจอ
        this.pieChartHeight = window.matchMedia('(max-width: 639px)').matches ? '104px'
          : window.matchMedia('(max-width: 939px)').matches ? '116px'
            : '130px'

        this.$nextTick(() => {
          const calendarSection = document.querySelector('.calendar-section .box-body')
          const docHeader = document.querySelector('.box-header')
          const docBody = document.querySelector('.doc-body')

          // ต่ำกว่า 940px ปฏิทินกับพาเนลเอกสารเรียงลงมาคนละแถว ไม่ได้อยู่ข้างกัน
          // การล็อกความสูงพาเนลให้เท่าปฏิทินจึงไม่มีเหตุผล และทำให้เกิดกรอบสูง
          // ค้างไว้เมื่อไม่มีเอกสาร — ปล่อยให้สูงตามเนื้อหาแทน
          if (docBody && window.matchMedia('(max-width: 939px)').matches) {
            docBody.style.maxHeight = ''
            docBody.style.minHeight = ''
            return
          }

          if (calendarSection && docHeader && docBody) {
            docBody.style.maxHeight = '0%'
            docBody.style.minHeight = '0%'

            // คำนวณความสูงที่ควรจะเป็นของ doc-body
            const maxHeight = calendarSection.offsetHeight - docHeader.offsetHeight

            // กำหนด max-height ให้กับ doc-body
            docBody.style.maxHeight = `${maxHeight}px`
            docBody.style.minHeight = `${maxHeight}px`
          }
        })
      },
      async loadPriorityTask(type, date) {
         try {
          page.loadingBox.show()
          let act = `csm/data/PriorityAndAllTask?empno=${this.auth.empno}&type=${type}&date=${date}`
          let rsp = await $xt.getServer(act)

          if(type === 'total') {
            this.priorityList = rsp.p_list
          } else if (type === 'calendar') {
            this.documentList = rsp.q
            this.todayTask = rsp.dayTask
            this.anotherTask = rsp.allTask
          }
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          page.loadingBox.hide()
        }
      },
      async loadCalendarTask() {
         try {
          //ให้ date เป็นวันที่ 1 ของเดือนที่เลือกตามปฏิทิน
          const calendarApi = await this.$refs.calendar.getApi();
          const currentDate = calendarApi.getDate(); // วันที่ปัจจุบันที่ calendar กำลังแสดง
          var date = moment(currentDate).startOf('month').format('YYYY-MM-DD')

          page.loadingBox.show()
          let act = `csm/data/CalendarAllTask?empno=${this.auth.empno}&date=${date}`
          let rsp = await $xt.getServer(act)
          this.calendarList = rsp.q

        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          await this.updateCalendarEvents()
          page.loadingBox.hide()
        }
      },
      async updateCalendarEvents() {
        // สร้าง events จากข้อมูล displayData ที่โหลดมาแล้ว
        const events = [];

        this.calendarList.forEach(item => {
          events.push({
            title: `Document ${item.qtydoc}`,
            start: moment(item.job_date).format('YYYY-MM-DD'),
            display: 'list-item',
            backgroundColor: '#0a89ff',
            borderColor: '#0a89ff',
            textColor: 'white'
          });
        });

        // อัปเดต calendar events โดยไม่เพิ่ม calendarKey
        this.$set(this.calendarOptions, 'events', events);

      },

    },
    computed: {
      ...mapState(['priorityCodeData']),
      pieModalTotalPages() {
        return Math.ceil(this.pieModalData.length / this.pieModalPageSize) || 1
      },
      pieModalPagedData() {
        const start = (this.pieModalPage - 1) * this.pieModalPageSize
        return this.pieModalData.slice(start, start + this.pieModalPageSize)
      },
      pieOption1() {
        const d = this.pieChartData
        const val = d.graph1 || 0
        const total = val + ((d.graph2_1||0)+(d.graph2_2||0)+(d.graph2_3||0)) + (d.graph3||0) + (d.graph4||0)
        return this.buildDonutOption(val, total, '#7E2553', 'รายการรออนุมัติ')
      },
      pieOption2() {
        const d = this.pieChartData
         const val = d.graph2 || 0
        // const total = (d.graph1||0) + val + (d.graph3||0) + (d.graph4||0)
        const tot = d.graph2 || 0
        return this.buildDonutOption(val, tot, '#f59e0b', 'งานใกล้ครบกำหนด')
      },
      pieOption3() {
        const d = this.pieChartData
        const val = d.graph3 || 0
        const total = (d.graph1||0) + ((d.graph2_1||0)+(d.graph2_2||0)+(d.graph2_3||0)) + val + (d.graph4||0)
        return this.buildDonutOption(val, total, '#ef4444', 'งานที่เลยกำหนด')
      },
      pieOption4() {
        const d = this.pieChartData
        const val = d.graph4 || 0
        const total = (d.graph1||0) + ((d.graph2_1||0)+(d.graph2_2||0)+(d.graph2_3||0)) + (d.graph3||0) + val
        return this.buildDonutOption(val, total, '#10b981', 'รอตรวจสอบ')
      }
    },
    async mounted() {
      page = this.$refs.page
      page.pageTitle = 'CSM : Customer Service Management'
      document.title = page.pageTitle

      // เปิด scroll สำหรับ content-body ของหน้า home2
      this.$nextTick(() => {
        const contentBody = document.querySelector('.content-body')
        if (contentBody) {
          contentBody.classList.add('home2-scrollable')
        }
      })

      await this.loadPriorityTask('total', this.today)
      await this.loadPriorityTask('calendar', this.today)

      // ทำงานแบบ parallel เพื่อเพิ่มความเร็ว
      await Promise.all([
        this.loadHoliday(),
        this.loadPieChartData()
      ])

      // โหลดข้อมูลหลังจาก priority พร้อมแล้ว
      this.currentMonth = moment().format('YYYY-MM');

      await this.checkScreenSize()
      window.addEventListener("resize", this.checkScreenSize);

      // เปิดใช้งาน boxWidget สำหรับ collapse/expand
      this.$nextTick(() => {
        $('#CalendarBox').boxWidget()
        $('#DocPanelBox').boxWidget()
      })
    },
    beforeDestroy() {
      window.removeEventListener("resize", this.checkScreenSize);
      // ลบ class scroll เมื่อออกจากหน้า
      const contentBody = document.querySelector('.content-body')
      if (contentBody) {
        contentBody.classList.remove('home2-scrollable')
      }
    },
  }
</script>

<style>
/* All styles moved to Content/Site.css
   Search for: home2.vue — Priority Cards + Document Panel + Calendar */
@import './CSS/home2-responsive.css';
</style>
