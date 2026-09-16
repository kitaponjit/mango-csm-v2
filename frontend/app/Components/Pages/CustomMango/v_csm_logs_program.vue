<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="page-container">
          <!-- Search Card -->
            <div class="search-card">
              <div class="row align-items-end">

                <!-- Filter Type Program -->
                <div class="col-md-2">
                  <div class="form-group">
                    <label class="field-label">Type Program</label>
                    <select class="form-control input-sm" v-model="retrieveSearch.program" @change="onRead()">
                      <option v-for="(item, index) in type_pg" :key="index" :value="item.pg_code">
                        {{ item.pg_name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Year -->
                <div class="col-md-1">
                  <div class="form-group">
                    <label class="field-label">Year</label>
                    <datepicker input-class="form-control input-sm" v-model="year" type="year" format="YYYY" :clearable="false" @input="convertYearToNumber()"></datepicker>
                  </div>
                </div>

                <!-- Month -->
                <div class="col-md-1">
                  <div class="form-group">
                    <label class="field-label">Month</label>
                    <select class="form-control input-sm" v-model="retrieveSearch.month" @change="onRead()">
                      <option v-for="m in monthOptions" :key="m" :value="m">{{ m }}</option>
                    </select>
                  </div>
                </div>

                <!-- Search By -->
                <div class="col-md-2">
                  <div class="form-group">
                    <label class="field-label">Search By</label>
                    <select class="form-control input-sm" v-model="retrieveSearch.field" @change="retrieveSearch.text = ''">
                      <option v-for="(item, index) in fields" :key="index" :value="item.key">
                        {{ item.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Search -->
                <div class="col-md-3">
                  <div class="form-group">
                    <label class="field-label">Search</label>
                    <div class="input-with-button">
                      <template v-if="retrieveSearch.field === 'due_date' || retrieveSearch.field === 'prod_date' || retrieveSearch.field === 'log_date_search'">
                        <datepicker input-class="form-control input-sm" v-model="retrieveSearch.text" @change="onRead()" placeholder="Select Date"></datepicker>
                      </template>
                      <template v-else>
                        <input type="text" class="form-control input-sm" v-model.trim="retrieveSearch.text" @keyup.enter="onRead()" placeholder="Search..." />
                      </template>
                      <button class="btn-search" @click="onRead()"><i class="fa fa-search"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Table Card -->
            <div class="table-card">
              <div class="table-container">
                <div class="row align-items-center margin-b-15">
                  <div class="col-md-7">
                    <div class="table-actions" style="margin-bottom: 0;">
                      <!-- Dropdown Add Row -->
                      <div class="btn-group dropdown" :class="{ 'disabled-group': retrieveSearch.program === 'All' }">
                        <button type="button" class="btn-add-row dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                          :disabled="retrieveSearch.program === 'All'"
                          :style="retrieveSearch.program === 'All' ? 'opacity:0.5; cursor:not-allowed;' : ''">
                          <i class="fa fa-plus"></i> Insert Row
                        </button>
                        <ul class="dropdown-menu custom-dropdown-menu">
                          <li><a href="javascript:void(0)" @click="retrieveSearch.program !== 'All' && addRow('empty')"><i class="fa fa-plus"></i> Insert Row</a></li>
                          <li><a href="javascript:void(0)" @click="addRowUpdate()"><i class="fa fa-plus-circle"></i> Insert Row Update Program</a></li>
                        </ul>
                      </div>

                      <button class="btn-delete-row" @click="removeRow()"
                        :disabled="retrieveSearch.program === 'All'"
                        :style="retrieveSearch.program === 'All' ? 'opacity:0.5; cursor:not-allowed;' : ''">
                        <i class="fa fa-minus-circle"></i> Delete Row
                      </button>
                    </div>
                  </div>
                  <div class="col-md-5">
                    <div class="search-actions">
                      <!-- Auto Save -->
                      <div class="auto-save-container">
                        <div class="auto-save-toggle is-active" style="cursor: not-allowed; opacity: 0.8;">
                          <div class="toggle-track">
                            <div class="toggle-handle"></div>
                          </div>
                          <span class="auto-save-label">Auto Save</span>
                        </div>
                        <div v-if="savingStatus" class="saving-indicator">
                          <i class="fa fa-spinner fa-spin"></i> {{ savingStatus }}
                        </div>
                      </div>
                      <!-- Export Excel -->
                      <button class="btn-export" @click="exportExcel"><i class="fa fa-download"></i><span>Excel</span></button>
                    </div>
                  </div>
                </div>
                <!-- Handsontable -->
                <div ref="hotTable" class="disable-auto-theme"></div>
              </div>
            </div>
        </div>
      </template>
    </re-page>

    <modal ref="taskModal">
      <template #header>
        <h4>CSM No. : {{ selectedCsmNo.job_no }} - Task : {{ selectedCsmNo.ref_task }}</h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-sm-12 col-md-12 col-lg-12">
            <ag-table ref="agr"
              :footer="false"
              @ready="initTable()">
            </ag-table>
          </div>
        </div>
      </template>
    </modal>

  </div>
</template>

<script>
import Handsontable from 'handsontable/base';
import { textRenderer } from 'handsontable/renderers';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import moment from 'moment';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

registerAllModules();

// no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
let page = { loadingBox: { show() {}, hide() {} } };

export default {
  data() {
    return {
      auth,
      ui: window.ui,
      xt: $xt,
      baseUrl,
      isAutoSave: true,
      saveTimer: null,
      savingStatus: '',
      isAutoSave: true,
      tableData: [],
      fullTableData: [],
      hotInstance: null,
      fields: [
        { name: 'CSM No.', key: 'job_no' },
        { name: 'Work IT', key: 'worker_name' },
        { name: 'Date Time', key: 'log_date_search' },
        { name: 'Description', key: 'remark' },
        { name: 'ระดับความสำคัญ', key: 'prioity_des' },
        { name: 'Due Date', key: 'due_date' },
        { name: 'Type CSM', key: 'serv_name' },
        { name: 'Prod. Date', key: 'prod_date' },
        { name: 'Tester', key: 'tester_name' }
      ],
      year: new Date(),
      retrieveSearch: {
        program: 'All',
        field: 'job_no',
        text: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
      },
      changedRows: new Set(),
      changedFields: new Map(), // key = rowIndex, value = Set of field names that changed
      data: [],
      type_pg: [],
      selectedCsmNo: '',
      maxProdDateTs: null,
      taskData: [],
      lockedFieldsList: [],     // [{ id, fieldId, user, connectionId }]
      activeRowId: null,
      activeFieldId: null,      // currently locked field/property name
      lastSearchParams: null,
      fieldMaxLengths: {
        remark: 255,
        worker_name: 100,
      },
      column_readonly: [],
      pollingInterval: null,
      socketInstance: null,
      lockHeartbeatTimer: null,
      isReading: false,
      status_text: {
        'Y': 'ผ่าน',
        'N': 'ไม่ผ่าน',
        'U': 'ด่วนมาก',
        'I': 'รอทดสอบ',
        'F': 'FIX',
        'S': 'SQL',
      },
      selectedTheme: "ht-theme-main",
    };
  },
  computed: {
    monthOptions() {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    },
    mangoSocketUrl() {
      console.log("window.mangoSocketUrl", window.mangoSocketUrl)
      return window.mangoSocketUrl
    },
    viewMode() {
      if (this.auth?.dpt_code === '002') return 'worker';
      if (this.auth?.dpt_code === '006') return 'tester';
      return 'readonly';
    }
  },
  methods: {
    convertYearToNumber() {
      const curYear = new Date().getFullYear();
      let y = new Date(this.year).getFullYear();
      if (!this.year || isNaN(y) || y < 2000 || y > curYear + 1) {
        y = curYear;
        this.year = new Date(y, 0, 1);   // เซ็ตกลับให้ datepicker แสดงปีเสมอ
      }
      this.retrieveSearch.year = y;
      this.onRead();
    },
    getLockUser(user) {
      if (user && typeof user === 'string' && user.startsWith('{')) {
        try {
          const parsed = JSON.parse(user);
          return parsed.UserId || parsed.user || user;
        } catch (e) { /* ignore */ }
      }
      return user;
    },
    changeTheme() {
      const currentData = this.tableData ? JSON.parse(JSON.stringify(this.tableData)) : [];
      if (this.hotInstance) {
        this.hotInstance.destroy();
        this.hotInstance = null;
      }
      this.$nextTick(() => {
        this.initHandsontable();
        if (currentData.length > 0 && this.hotInstance) {
          this.hotInstance.loadData(currentData);
        }
      });
    },
    initHandsontable() {
      const vm = this;
      
      const calculateHeight = () => {
        const rect = this.$refs.hotTable.getBoundingClientRect();
        return window.innerHeight - rect.top - 100;
      };

      const log_status_map = {
        'ผ่าน': 'Y',
        'ไม่ผ่าน': 'N',
        'ด่วนมาก': 'U',
        'รอทดสอบ': 'I',
        'FIX': 'F',
        'SQL': 'S',
      };

      this.hotInstance = new Handsontable(this.$refs.hotTable, {
        licenseKey: 'non-commercial-and-evaluation',
        themeName: this.selectedTheme,
        mergeCells: true,
        fillHandle: false,
        // rowHeaders: true, // ย้ายไปใช้ rowHeaders function ด้านล่างแทน
        contextMenu: ['alignment', 'copy', 'cut'],
        filters: true,
        dropdownMenu: ['col_left', 'col_right', 'remove_col', 'alignment', 'filter_by_condition', 'filter_by_value', 'filter_action_bar'],
        manualColumnResize: true,
        manualRowResize: true,
        columnSorting: true,
        autoWrapRow: false,
        autoWrapCol: false,
        autoRowSize: false,
        wordWrap: false,
        undo: true,
        redo: true,
        copyPaste: true,
        outsideClickDeselects: false,
        data: this.tableData,
        width: '100%',
        height: calculateHeight(),
        rowHeights: 30,
        columnHeaderHeight: 36,
        fixedColumnsStart: 2,
        minSpareRows: 0,
        minSpareCols: 0,
        colWidths: [180, 150, 180, 250, 200, 450, 180, 180, 220, 180, 180, 200, 250, 250, 300, 400, 300],
        colHeaders: ['CSM No.', 'Task', 'เลขอ้างอิง', 'Work IT', 'Date Time', 'Description', 'Status', 'Status2', 'ระดับความสำคัญ', 'Due Date', 'Type CSM', 'Prod. Date', 'Revision Prod.', 'Tester', 'Remark', 'Link Test', 'Type Program'],
        columns: [
          {
            data: 'job_no',
            readOnly: true,
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
              textRenderer.apply(this, arguments);
              if (value && value !== 'Update Program') {
                const url = vm.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${value}`;
                td.innerHTML = `<a href="${url}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">${value}</a>`;
              }
            }
          },
          {
            data: 'ref_task',
            readOnly: true,
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
              textRenderer.apply(this, arguments);
              if (value) {
                const lineCnt = instance.getDataAtRowProp(row, 'line_cnt');
                const suffix = lineCnt ? ` (ครั้งที่ ${lineCnt})` : '';
                td.innerHTML = `<a href="javascript:void(0)" class="task-link" data-row="${row}" style="color: #2563eb; text-decoration: underline; font-weight: 600; cursor: pointer;">${value}${suffix}</a>`;
                // Add click event listener
                td.onclick = function(e) {
                  if (e.target.classList.contains('task-link')) {
                    vm.openTaskModal(value, row);
                  }
                };
              }
            }
          },
          {
            data: 'ch_gest',
          },
          {
            data: 'worker_name',
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
              td.style.fontWeight = '600';
              textRenderer.apply(this, arguments);
              const physicalRow = instance.toPhysicalRow(row);
              const rowData = instance.getSourceDataAtRow(physicalRow);
              if (rowData && rowData.color_w) {
                td.style.setProperty('color', rowData.color_w, 'important');
              } else {
                td.style.removeProperty('color');
              }
            }
          },
          {
            data: 'log_date',
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
              textRenderer.apply(this, arguments);

              // ไม่แสดงวันที่สำหรับแถว Update Program
              const physicalRow = instance.toPhysicalRow(row);
              const rowData = instance.getSourceDataAtRow(physicalRow);
              if (rowData && String(rowData.remark || '').trim() === 'Update Program') {
                td.innerText = '';
                return;
              }

              if (value) {
                const m = moment(value, ['DD/MM/YYYY HH:mm', 'D/M/YYYY H:mm', 'DD/MM/YYYY HH:mm:ss', 'D/M/YYYY HH:mm', 'YYYY-MM-DD HH:mm', moment.ISO_8601]);
                if (m.isValid()) {
                  td.innerText = m.format('DD/MM/YYYY HH:mm');
                } else {
                  td.innerText = value;
                }
              }
            }
          },
          {
            data: 'remark',
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
              textRenderer.apply(this, arguments);

              // reset ทุกครั้ง ป้องกันสีค้างตอน filter/sort
              td.style.backgroundColor = '';
              td.style.color = '';
              td.classList.remove('update-program-row');

              const physicalRow = instance.toPhysicalRow(row);
              const rowData = instance.getSourceDataAtRow(physicalRow);

              const isUpdate = rowData && String(rowData.remark).trim() === 'Update Program';

              if (isUpdate) {
                td.classList.add('update-program-row');
              }

              // If cell is locked by another user, apply locked styling but continue to show SQL/FIX colors
              const isCellLocked = (cellProperties.className || '').includes('cell-locked');
              if (isCellLocked) {
                td.style.cursor = 'not-allowed';
              }

              const stringValue = value == null ? '' : String(value);
              const upperValue = stringValue.toUpperCase();

              // SQL / FIX COLOR (แสดงเสมอไม่ว่าจะ readOnly หรือไม่)
              if (!isUpdate) {
                const isDark = document.body.classList.contains('dark-mode')
                if (upperValue.includes('FIX')) {
                  td.style.setProperty('background-color', isDark ? '#1a3040' : '#e0f2fe', 'important');
                  td.style.setProperty('color', isDark ? '#7dd3fc' : '#0369a1', 'important');

                } else if (upperValue.includes('SQL')) {
                  td.style.setProperty('background-color', isDark ? '#2d2a10' : '#fef9c3', 'important');
                  td.style.setProperty('color', isDark ? '#fde68a' : '#92400e', 'important');
                }
              }

              // CREATE LINK
              const link = rowData ? rowData.link_test : '';
              let content = stringValue;

              if (link) {
                content = `<a href="${link}" target="_blank" style="color:#2563eb; text-decoration:underline;">${stringValue}</a>`;
              }

              // RENDER CONTENT
              td.innerHTML = `<div style="width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${content}</div> `;

              td.title = stringValue;
            }
          },
          {
            data: 'log_status',
            editor: 'select',
            selectOptions: ['ผ่าน', 'ไม่ผ่าน', 'ด่วนมาก', 'รอทดสอบ', 'FIX', 'SQL'],
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
              textRenderer.apply(this, arguments);

              if (row === null || row === undefined || row < 0) return;
              const physicalRow = instance.toPhysicalRow(row);
              if (physicalRow === null || physicalRow === undefined || physicalRow < 0) return;
              
              // Update Program rows ไม่แสดง status
              const rowRemark = instance.getDataAtRowProp(row, 'remark');
              if (rowRemark === 'Update Program') {
                td.innerText = '';
                td.style.removeProperty('background-color');
                td.style.removeProperty('color');
                return;
              }

              const statusCode = log_status_map[value] || value;

              const isDark = document.body.classList.contains('dark-mode')
              const statusMap = isDark ? {
                'Y': { text: 'ผ่าน',     bg: '#162d22', color: '#4ade80' },
                'N': { text: 'ไม่ผ่าน',  bg: '#2a1010', color: '#f87171' },
                'U': { text: 'ด่วนมาก', bg: '#7f1d1d', color: '#ffffff' },
                'I': { text: 'รอทดสอบ', bg: '#1e2a3a', color: '#c9d1d9' },
                'F': { text: 'FIX',      bg: '#1a3040', color: '#7dd3fc' },
                'S': { text: 'SQL',      bg: '#2d2a10', color: '#fde68a' },
                } : {
                'Y': { text: 'ผ่าน',     bg: '#dcfce7', color: '#16a34a' },
                'N': { text: 'ไม่ผ่าน',  bg: '#fee2e2', color: '#dc2626' },
                'U': { text: 'ด่วนมาก', bg: '#dc2626', color: '#ffffff' },
                'I': { text: 'รอทดสอบ', bg: '#ffffff',  color: '#000000' },
                'F': { text: 'FIX',      bg: '#e0f2fe', color: '#0369a1' },
                'S': { text: 'SQL',      bg: '#fef9c3', color: '#92400e' },
              };

              const status = statusMap[statusCode];

              td.style.fontWeight = '700';
              td.style.textAlign = 'center';

              if (status) {
                td.innerText = status.text;
                // ถ้า cell ถูก dim ไว้ ให้แสดงสีจางลง แต่ยังคง style
                if (td.classList.contains('htDimmed')) {
                  td.style.setProperty('background-color', status.bg, 'important');
                  td.style.setProperty('color', status.color, 'important');
                  td.style.opacity = '0.8';
                } else {
                  td.style.setProperty('background-color', status.bg, 'important');
                  td.style.setProperty('color', status.color, 'important');
                  td.style.opacity = '';
                }
              } else {
                td.style.removeProperty('background-color');
                td.style.removeProperty('color');
                td.style.opacity = '';
              }
            }
          },
          {
            data: 'log_status2',
            editor: 'select',
            selectOptions: ['ผ่าน', 'ไม่ผ่าน', 'ด่วนมาก', 'รอทดสอบ', 'FIX', 'SQL'],
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
              textRenderer.apply(this, arguments);

              if (row === null || row === undefined || row < 0) return;
              const physicalRow = instance.toPhysicalRow(row);
              if (physicalRow === null || physicalRow === undefined || physicalRow < 0) return;
              
              // Update Program rows ไม่แสดง status
              const rowRemark = instance.getDataAtRowProp(row, 'remark');
              if (rowRemark === 'Update Program') {
                td.innerText = '';
                td.style.removeProperty('background-color');
                td.style.removeProperty('color');
                return;
              }

              const statusCode = log_status_map[value] || value;

              const isDark = document.body.classList.contains('dark-mode')
              const statusMap = isDark ? {
                'Y': { text: 'ผ่าน',     bg: '#162d22', color: '#4ade80' },
                'N': { text: 'ไม่ผ่าน',  bg: '#2a1010', color: '#f87171' },
                'U': { text: 'ด่วนมาก', bg: '#7f1d1d', color: '#ffffff' },
                'I': { text: 'รอทดสอบ', bg: '#1e2a3a', color: '#c9d1d9' },
                'F': { text: 'FIX',      bg: '#1a3040', color: '#7dd3fc' },
                'S': { text: 'SQL',      bg: '#2d2a10', color: '#fde68a' },
                } : {
                'Y': { text: 'ผ่าน',     bg: '#dcfce7', color: '#16a34a' },
                'N': { text: 'ไม่ผ่าน',  bg: '#fee2e2', color: '#dc2626' },
                'U': { text: 'ด่วนมาก', bg: '#dc2626', color: '#ffffff' },
                'I': { text: 'รอทดสอบ', bg: '#ffffff',  color: '#000000' },
                'F': { text: 'FIX',      bg: '#e0f2fe', color: '#0369a1' },
                'S': { text: 'SQL',      bg: '#fef9c3', color: '#92400e' },
              };

              const status = statusMap[statusCode];

              td.style.fontWeight = '700';
              td.style.textAlign = 'center';

              if (status) {
                td.innerText = status.text;
                // ถ้า cell ถูก dim ไว้ ให้แสดงสีจางลง แต่ยังคง style
                if (td.classList.contains('htDimmed')) {
                  td.style.setProperty('background-color', status.bg, 'important');
                  td.style.setProperty('color', status.color, 'important');
                  td.style.opacity = '0.8';
                } else {
                  td.style.setProperty('background-color', status.bg, 'important');
                  td.style.setProperty('color', status.color, 'important');
                  td.style.opacity = '';
                }
              } else {
                td.style.removeProperty('background-color');
                td.style.removeProperty('color');
                td.style.opacity = '';
              }
            }
          },
          {
            data: 'prioity_des',
            readOnly: true,
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
              textRenderer.apply(this, arguments);
              td.style.fontWeight = '600';
              const physicalRow = instance.toPhysicalRow(row);
              const rowData = instance.getSourceDataAtRow(physicalRow);
              if (rowData && rowData.priority_color) {
                td.style.setProperty('color', rowData.priority_color, 'important');
              } else {
                td.style.removeProperty('color');
              }
            }
          },
          {
            data: 'due_date',
            readOnly: true,
          },
          {
            data: 'serv_name',
            readOnly: true,
          },
          {
            data: 'prod_date',
            type: 'date',
            dateFormat: 'DD/MM/YYYY',
            correctFormat: true,
            datePickerConfig: {
              format: 'DD/MM/YYYY',
              container: document.body,
              onOpen: function() {
                const picker = this.el;
                const field = this._o.trigger;

                if (!picker || !field) return;

                picker.style.position = 'absolute';
                picker.style.zIndex = '99999';
                picker.style.display = 'block';

                const pickerRect = picker.getBoundingClientRect();
                const fieldRect = field.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const spaceBelow = viewportHeight - fieldRect.bottom;

                if (spaceBelow < pickerRect.height) {
                  const currentTop = parseFloat(picker.style.top || 0);
                  const newTop = currentTop - pickerRect.height - fieldRect.height;

                  picker.style.top = `${newTop}px`;
                  picker.style.transformOrigin = 'bottom left';
                }
              }
            },
            renderer(instance, td, row, col, prop, value) {
              textRenderer.apply(this, arguments);

              td.style.backgroundColor = '';
              td.style.color = '';

              if (!value) return;

              const m = moment(value, ['DD/MM/YYYY', moment.ISO_8601], true);
              if (!m.isValid()) return;

              td.innerText = m.format('DD/MM/YYYY');

              if (!vm.maxProdDateTs) return;

              const isDark = document.body.classList.contains('dark-mode')
              const ts = m.valueOf();
              if (ts === vm.maxProdDateTs) {
                td.style.setProperty('background-color', '#198754', 'important');
                td.style.setProperty('color', '#ffffff', 'important');
              } else {
                td.style.setProperty('background-color', isDark ? '#1a3d2a' : '#d1e7dd', 'important');
                td.style.setProperty('color', isDark ? '#c9d1d9' : '#000000', 'important');
              }
            },
          },
          {
            data: 'revision_prod',
          },
          {
            data: 'tester_name',
            readOnly: true,
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
              td.style.fontWeight = '600';
              textRenderer.apply(this, arguments);
              const physicalRow = instance.toPhysicalRow(row);
              const rowData = instance.getSourceDataAtRow(physicalRow);
              if (rowData && rowData.color_t) {
                td.style.setProperty('color', rowData.color_t, 'important');
              } else {
                td.style.removeProperty('color');
              }
            }
          },
          {
            data: 'remark2',
          },
          {
            data: 'link_test',
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
              textRenderer.apply(this, arguments);
              if (value && (String(value).startsWith('http://') || String(value).startsWith('https://'))) {
                td.innerHTML = `<a href="${value}" target="_blank" style="color: #2563eb; text-decoration: underline; cursor: pointer;">${value}</a>`;
              }
            }
          },
          {
            data: 'pg_name',
            type: 'dropdown',
            // source: function() { return vm.type_pg.map(t => t.pg_name); },
            source: (query, process) => {
              if (vm.type_pg && vm.type_pg.length > 0) {
                process(vm.type_pg.map(t => t.pg_name));
              } else {
                process([]);
              }
            },
            strict: true,
            allowInvalid: false,
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
              textRenderer.apply(this, arguments);
              if (row < 0) return;
              const physicalRow = instance.toPhysicalRow(row);
              if (physicalRow === null || physicalRow === undefined) return;
              const rowData = instance.getSourceDataAtRow(physicalRow);
              const isUpdateRow = rowData && String(rowData.remark).trim() === 'Update Program';
              if (isUpdateRow) {
                td.innerText = '';
              }
            }
          },
        ],
        cells: function (row, col) {
          const cellProperties = {};

          if (!this.instance) return cellProperties;

          const hot = this.instance;
          const physicalRow = hot.toPhysicalRow(row);
          const rowData = hot.getSourceDataAtRow(physicalRow);
          const prop = hot.colToProp(col);

          // === Global read-only when "All" is selected ===
          if (vm.retrieveSearch.program === 'All') {
            cellProperties.readOnly = true;
            if ([3, 5, 13, 14].includes(col)) {
              cellProperties.className = 'htLeft htMiddle htDimmed';
            } else {
              cellProperties.className = 'htCenter htMiddle htDimmed';
            }
            return cellProperties;
          }

          // BASE READONLY COLUMNS
          // if ([0, 1, 7, 8, 9, 12].includes(col)) {
          if ([0, 1, 8, 9, 10, 12].includes(col)) {
            cellProperties.readOnly = true;
          }

          // BASE ALIGNMENT
          if ([3, 5, 13, 14].includes(col)) {
            cellProperties.className = 'htLeft htMiddle';
          } else {
            cellProperties.className = 'htCenter htMiddle';
          }

          // MASTER COLUMN READONLY
          if (vm.column_readonly && vm.column_readonly.length > 0) {
            const isReadOnly = vm.column_readonly.some(c => c.column_name === prop && c.hides === 'Y');

            if (isReadOnly) {
              cellProperties.readOnly = true;
              cellProperties.className += ' htDimmed';
            }
          }

          // PROD DATE LOCK LOGIC
          if (prop === 'prod_date' && rowData) {
            const statusVal = rowData.log_status;
            const status2Val = rowData.log_status2;
            const revisionVal = rowData.revision_prod;
            const prodDate = rowData.prod_date;

            const editableStatuses = ['Y', 'F', 'S', 'ผ่าน', 'FIX', 'SQL'];
            const statusEditable = editableStatuses.includes(statusVal) || editableStatuses.includes(status2Val);
            if ((revisionVal && revisionVal !== '') || !statusEditable) {
              cellProperties.readOnly = true;
              cellProperties.className += ' cell-disabled';

              if (!prodDate) {
                cellProperties.className += ' htDimmed';
              }
            }
          }

          // prod_date is not null or '' so revision_prod is editable
          if (prop === 'revision_prod' && rowData) {
            const prodDate = rowData.prod_date;
            if (!prodDate || prodDate === '') {
              cellProperties.readOnly = true;
              cellProperties.className += ' cell-disabled htDimmed';
            }
          }

          // Set Readonly PG Name — editable เฉพาะเมื่อ Status เป็น FIX หรือ SQL
          if (prop === 'pg_name') {
            const statusVal = rowData ? rowData.log_status : null;
            const isFixOrSql = statusVal === 'FIX' || statusVal === 'SQL' || statusVal === 'F' || statusVal === 'S';
            if (!isFixOrSql) {
              cellProperties.readOnly = true;
            }
          }

          // UPDATE PROGRAM ROW — class is applied via afterRenderer hook
          const remarkVal = hot.getDataAtCell(row, 5);
          const isUpdateRow = String(remarkVal).trim() === 'Update Program';

          if (isUpdateRow) {
            // cellProperties.className += ' update-program-row';
            cellProperties.readOnly = true; // lock ทั้ง row
          }

          // ROLE-BASED PERMISSIONS
          if (vm.viewMode === 'tester') {
            const testerEditable = ['log_status', 'log_status2', 'remark2', 'link_test'];
            if (!testerEditable.includes(prop)) {
              cellProperties.readOnly = true;
              cellProperties.className += ' htDimmed';
            }
          } else if (vm.viewMode === 'worker') {
            const workerEditable = ['ch_gest', 'worker_name', 'log_date', 'remark', 'prod_date', 'revision_prod'];
            if (!workerEditable.includes(prop)) {
              cellProperties.readOnly = true;
              cellProperties.className += ' htDimmed';
            }
          } else {
            // ไม่ใช่ทั้ง worker และ tester — readOnly ทั้งหมด
            cellProperties.readOnly = true;
            cellProperties.className += ' htDimmed';
          }

          // field-level lock
          if (rowData?.log_id) {
            const fieldLock = vm.lockedFieldsList
              ? vm.lockedFieldsList.find(x => String(x.id) === String(rowData.log_id) && x.fieldId === prop)
              : null;

            if (fieldLock && fieldLock.user !== vm.auth.userid) {
              cellProperties.readOnly = true;
              cellProperties.className += ' cell-locked';
            }
          }

          return cellProperties;
        },
        beforeCopy(data) {
          const selected = this.getSelected();
          if (!selected || selected.length <= 1) return;

          const rows = new Set();
          const cols = new Set();

          selected.forEach(([r1, c1, r2, c2]) => {
            for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) rows.add(r);
            for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) cols.add(c);
          });

          const rArr = [...rows].sort((a, b) => a - b);
          const cArr = [...cols].sort((a, b) => a - b);

          data.length = 0;
          rArr.forEach(r =>
            data.push(cArr.map(c => this.getDataAtCell(r, c)))
          );
        },
        beforeCreateRow: (index, amount, source) => {
          if (source === 'loadData') return;
          if (vm.viewMode !== 'worker') {
            $notify.warning(`ไม่มีสิทธิ์เพิ่มแถว`);
            return false;
          }
        },
        beforeChange: (changes, source) => {
          if (source === 'loadData' || !changes) return;

          for (let i = changes.length - 1; i >= 0; i--) {
            const [row, prop, oldValue, newValue] = changes[i];

            if (oldValue === newValue) {
              changes.splice(i, 1);
              continue;
            }

            // Check field length limits
            if (vm.fieldMaxLengths[prop] && newValue) {
              const strValue = String(newValue);
              if (strValue.length > vm.fieldMaxLengths[prop]) {
                const originalLength = strValue.length;
                const maxLength = vm.fieldMaxLengths[prop];
                $notify.warning(`ข้อมูลยาวเกินไป! (${originalLength} ตัวอักษร) จะบันทึกเพียง ${maxLength} ตัวอักษรแรก`);
                changes[i][3] = strValue.substring(0, vm.fieldMaxLengths[prop]);
              }
            }

            if ((prop === 'log_status' || prop === 'log_status2') && log_status_map[newValue]) {
              // changes[i][3] = log_status_map[newValue];
              const statusText = Object.keys(log_status_map).find(key => log_status_map[key] === newValue);
              if (statusText) {
                changes[i][3] = statusText;
              }
            }

            if (prop === 'log_date' && newValue) {
              // 1. Define all possible input formats including seconds
              const formats = [
                'DD/MM/YYYY HH:mm:ss', 
                'DD/MM/YYYY HH:mm',
                'D/M/YYYY HH:mm:ss', 
                'D/M/YYYY HH:mm',
                'D/M/YYYY H:mm:ss', 
                'D/M/YYYY H:mm',
                'YYYY-MM-DD HH:mm:ss', 
                'YYYY-MM-DD HH:mm',
                moment.ISO_8601
              ];

              // Convert Buddhist Era (พ.ศ.) to CE (ค.ศ.) if year > 2400
              let dateStr = String(newValue);
              const beMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
              if (beMatch) {
                let year = parseInt(beMatch[3]);
                if (year > 2400) {
                  year -= 543;
                  dateStr = dateStr.replace(beMatch[3], String(year));
                }
              }

              // 2. Try to parse strictly first
              let m = moment(dateStr, formats, true);

              // 3. If strict failed, try non-strict but keep the time if it's there
              if (!m.isValid()) {
                m = moment(dateStr, formats, false); 
              }

              if (m.isValid()) {
                // This will now preserve the time parsed from the string
                changes[i][3] = m.format('DD/MM/YYYY HH:mm');
              } else {
                // 4. Last resort: Date only fallback
                const dateOnly = moment(dateStr, ['DD/MM/YYYY', 'D/M/YYYY', 'YYYY-MM-DD'], true);
                if (dateOnly.isValid()) {
                  changes[i][3] = dateOnly.format('DD/MM/YYYY HH:mm');
                }
              }
            }
          }

          if (changes.length === 0) return false;
        },
        // field-level lock check
        beforeBeginEditing: (row, col) => {
          const hot = vm.hotInstance;
          const physicalRow = hot.toPhysicalRow(row);
          const rowData = hot.getSourceDataAtRow(physicalRow);
          const prop = hot.colToProp(col);

          if (!rowData?.log_id) return true;

          // [NEW] Check field-level lock instead of row-level
          const lockInfo = vm.lockedFieldsList.find(
            x => String(x.id) === String(rowData.log_id) && x.fieldId === prop
          );

          if (lockInfo && lockInfo.user !== vm.auth.userid) {
            $notify.warning(`ถูกล็อกโดย ${vm.getLockUser(lockInfo.user)}`);
            return false;
          }
          return true;
        },
        afterBeginEditing: (row, col) => {
          const prop = this.hotInstance.colToProp(col);

          if (prop === 'log_status') {
            const value = this.hotInstance.getDataAtRowProp(row, prop);
            const codeToStatusMap = {
              'Y': 'ผ่าน',
              'N': 'ไม่ผ่าน',
              'U': 'ด่วนมาก',
              'I': 'รอทดสอบ',
              'F': 'FIX',
              'S': 'SQL',
            };

            if (codeToStatusMap[value]) {
              const editor = this.hotInstance.getActiveEditor();
              if (editor) {
                editor.setValue(codeToStatusMap[value]);
                editor.enableFullEditMode(); // Select all text
              }
            }
          }

          if (prop === 'log_date') {
            const value = this.hotInstance.getDataAtRowProp(row, prop);
            const editor = this.hotInstance.getActiveEditor();
            
            if (editor) {
              // Set formatted value in editor
              if (value) {
                const m = moment(value, ['DD/MM/YYYY HH:mm', 'D/M/YYYY H:mm', 'DD/MM/YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm', moment.ISO_8601]);
                if (m.isValid()) {
                  editor.setValue(m.format('DD/MM/YYYY HH:mm'));
                }
              }

              // Open flatpickr on the editor's TEXTAREA
              if (vm._fpInstance) {
                vm._fpInstance.destroy();
                vm._fpInstance = null;
              }
              if (vm._fpInput) {
                vm._fpInput.remove();
                vm._fpInput = null;
              }

              let defaultDate = null;
              if (value) {
                const m2 = moment(value, ['DD/MM/YYYY HH:mm', 'D/M/YYYY H:mm', 'DD/MM/YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm', moment.ISO_8601]);
                if (m2.isValid()) defaultDate = m2.toDate();
              }

              vm._fpInput = document.createElement('input');
              vm._fpInput.type = 'text';
              // Position near the cell being edited
              const td = vm.hotInstance.getCell(row, col);
              const rect = td ? td.getBoundingClientRect() : { left: 0, top: 0, height: 0 };
              vm._fpInput.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top + rect.height}px;opacity:0;width:0;height:0;pointer-events:none;`;
              document.body.appendChild(vm._fpInput);

              vm._fpInstance = flatpickr(vm._fpInput, {
                enableTime: true,
                time_24hr: true,
                dateFormat: 'd/m/Y H:i',
                defaultDate: defaultDate,
                appendTo: document.body,
                onClose: (selectedDates) => {
                  if (selectedDates.length > 0) {
                    const formatted = moment(selectedDates[0]).format('DD/MM/YYYY HH:mm');
                    vm.hotInstance.setDataAtRowProp(row, 'log_date', formatted);
                  }
                  vm.hotInstance.destroyEditor(true);
                  if (vm._fpInstance) { vm._fpInstance.destroy(); vm._fpInstance = null; }
                  if (vm._fpInput) { vm._fpInput.remove(); vm._fpInput = null; }
                }
              });

              vm._fpInstance.open();
            }
          }
        },
        afterChange: (changes, source) => {
          if (source === 'loadData' || source === 'server_sync' || source === 'server_insert' || source === 'auto_pg' || !changes) return;

          let prodDateChanged = false;
          let hasRealChange = false;
          
          const hot = this.hotInstance; 

          changes.forEach(([row, prop, oldValue, newValue]) => {

            if (oldValue === newValue) return;

            hasRealChange = true;
            const physRow = hot.toPhysicalRow(row); 
            this.changedRows.add(physRow);
            // Track which fields changed per row
            if (!this.changedFields.has(physRow)) {
              this.changedFields.set(physRow, new Set());
            }
            this.changedFields.get(physRow).add(prop);

            this.handleRowChange([row, prop, oldValue, newValue], source);

            if (prop === 'prod_date') {
              prodDateChanged = true;
            }

            // Sync log_status when remark changes — เฉพาะแถวใหม่ หรือ status ยังว่าง
            // (แถวเก่าที่ tester ตั้ง status ไว้แล้ว จะไม่ถูกแตะ กันชน lock ของ tester + ไม่ทับค่าเดิม)
            if (prop === 'remark' && newValue !== 'Update Program') {
              const rd = hot.getSourceDataAtRow(physRow);
              const statusEmpty = !rd || rd.log_status === null || rd.log_status === undefined || rd.log_status === '';
              if (!rd || !rd.log_id || statusEmpty) {
                const val = (newValue || '').toUpperCase();
                const newStatus = val.includes('SQL') ? 'SQL' : val.includes('FIX') ? 'FIX' : 'I';
                hot.setDataAtRowProp(row, 'log_status', newStatus, 'auto_sync');
              }
            }

            // Auto-populate pg_name when status changes to FIX or SQL on a new row
            if (prop === 'log_status') {
              const rowData = hot.getSourceDataAtRow(physRow);
              const statusCode = log_status_map[newValue] || newValue;

              if ((statusCode === 'F' || statusCode === 'S') && !rowData.log_id) {
                if (vm.retrieveSearch.program !== 'All') {
                  const pgMatch = vm.type_pg.find(t => t.pg_code === vm.retrieveSearch.program);
                  if (pgMatch && !rowData.pg_name) {
                    hot.setDataAtRowProp(row, 'pg_name', pgMatch.pg_name, 'auto_pg');
                  }
                }
              }
            }
          });

          if (!hasRealChange) return;

          if (prodDateChanged) {
            this.recalcMaxProdDate();
            this.hotInstance.render();
          }

          if (this.isAutoSave) this.debouncedSave();
        },
        // field-level lock
        afterSelectionEnd: (row, col) => {
          const hot = this.hotInstance;
          const physicalRow = hot.toPhysicalRow(row);
          const rowData = hot.getSourceDataAtRow(physicalRow);
          const fieldId = hot.colToProp(col);

          if (!rowData?.log_id) return;

          const newRowId = rowData.log_id;
          const newFieldId = fieldId;

          // Same cell — no action needed
          if (this.activeRowId === newRowId && this.activeFieldId === newFieldId) return;

          // Unlock previous cell
          if (this.activeRowId && this.activeFieldId) {
            this.unlockField(this.activeRowId, this.activeFieldId);
          }

          // Check if target cell is locked by another user
          const lockInfo = this.lockedFieldsList.find(
            x => String(x.id) === String(newRowId) && x.fieldId === newFieldId
          );
          if (lockInfo && lockInfo.user !== this.auth.userid) {
            $notify.warning(`ถูกล็อกโดย ${vm.getLockUser(lockInfo.user)}`);
            this.activeRowId = null;
            this.activeFieldId = null;
            return;
          }

          // Lock new cell
          this.tryLockField(newRowId, newFieldId);
          this.activeRowId = newRowId;
          this.activeFieldId = newFieldId;
        },
        rowHeaders: function(row) { 
          const hot = vm.hotInstance;
          if (!hot || row < 0) return row + 1;

          let physicalRow = null;
          try {
            physicalRow = hot.toPhysicalRow(row);
          } catch (e) {
            return row + 1;
          }
          
          if (physicalRow === null || physicalRow === undefined || physicalRow < 0) return row + 1;

          const rowData = hot.getSourceDataAtRow(physicalRow);

          // แถวที่ save แล้วโชว์ itemno จริงจาก DB; แถวใหม่ที่ยังไม่ save โชว์ ＋ (เลขจริงตัดสินที่ backend ตอน save)
          return rowData && rowData.log_id && rowData.itemno ? rowData.itemno : '＋';
        },
        afterDeselect: () => {
          if (this.activeRowId && this.activeFieldId) {
            this.unlockField(this.activeRowId, this.activeFieldId);
            this.activeRowId = null;
            this.activeFieldId = null;
          }
        },
        beforeFilter(conditionsStack) {
          // Clear cached className meta so styles are re-applied fresh after filter
          const hot = vm.hotInstance;
          if (hot) {
            hot.deselectCell();
            const rowCount = hot.countRows();
            const colCount = hot.countCols();
            for (let r = 0; r < rowCount; r++) {
              for (let c = 0; c < colCount; c++) {
                hot.removeCellMeta(r, c, 'className');
              }
            }
          }

          if (!conditionsStack || conditionsStack.length === 0) return true;
          const hasEmptyFilter = conditionsStack.some(condition => !condition.conditions || condition.conditions.length === 0);
          return !hasEmptyFilter;
        },
        afterFilter: function() {
          if (vm.hotInstance) vm.hotInstance.render();
        },
        afterRenderer: (td, row, col, prop, value, cellProperties) => {
          // Reliably apply/remove update-program-row class directly on DOM after every render
          if (!vm.hotInstance) return;
          const physicalRow = vm.hotInstance.toPhysicalRow(row);
          if (physicalRow === null || physicalRow === undefined || physicalRow < 0) return;
          const rowData = vm.hotInstance.getSourceDataAtRow(physicalRow);
          const isUpdate = rowData && String(rowData.remark || '').trim() === 'Update Program';
          if (isUpdate) {
            td.classList.add('update-program-row');
          } else {
            td.classList.remove('update-program-row');
          }

          // Show not-allowed cursor for readOnly cells
          if (cellProperties.readOnly) {
            td.classList.add('cell-no-edit');
          } else {
            td.classList.remove('cell-no-edit');
          }

          // [NEW] Field-level lock badge (optimized — avoid reflow)
          if (td._lockBadge) {
            if (td._lockBadge.parentNode === td) {
              td.removeChild(td._lockBadge);
            }
            td._lockBadge = null;
            td.classList.remove('cell-lock-border');
          }

          if (rowData?.log_id && vm.lockedFieldsList && vm.lockedFieldsList.length > 0) {
            const rowId = String(rowData.log_id);
            const fieldLock = vm.lockedFieldsList.find(x => String(x.id) === rowId && x.fieldId === prop);

            // Only show badge for OTHER users' locks (not your own)
            if (fieldLock && fieldLock.user !== vm.auth.userid) {
              const lockUser = vm.getLockUser(fieldLock.user);
              const initial = lockUser ? lockUser.charAt(0).toUpperCase() : '?';

              // Determine badge color — random per user, consistent within session
              if (!vm._userColorMap) vm._userColorMap = {};
              const userKey = lockUser || fieldLock.user || '';
              if (!vm._userColorMap[userKey]) {
                const hue = Math.floor(Math.random() * 360);
                vm._userColorMap[userKey] = `hsl(${hue}, 65%, 50%)`;
              }
              const badgeColor = vm._userColorMap[userKey];

              // Use classList for positioning (avoids forced reflow from inline style reads)
              td.classList.add('cell-lock-border');
              td.style.setProperty('--lock-color', badgeColor);

              const badge = document.createElement('span');
              badge.className = 'lock-badge';
              badge.textContent = initial;
              badge.title = lockUser;
              badge.style.setProperty('background-color', badgeColor, 'important');
              td.appendChild(badge);
              td._lockBadge = badge; // cache reference for fast removal
            }
          }
        },
      });
      // Update height on resize
      vm._resizeHandler = () => {
        if (this.hotInstance) {
          this.hotInstance.updateSettings({ height: calculateHeight() });
        }
      };
      window.addEventListener('resize', vm._resizeHandler);
    },
    clearRowLockUI(rowId) {
      const hot = this.hotInstance;
      if (!hot) return;

      const sourceData = hot.getSourceData();
      const physRow = sourceData.findIndex(r => String(r.log_id) === String(rowId));
      if (physRow === -1) return;

      const visualRow = hot.toVisualRow(physRow);

      if (visualRow === null || visualRow === undefined || visualRow < 0) return;

      const colCount = hot.countCols();

      for (let col = 0; col < colCount; col++) {
        hot.setCellMeta(visualRow, col, 'readOnly', false);
        hot.setCellMeta(visualRow, col, 'className', '');
      }

      hot.render();
    },

    tryLockField(rowId, fieldId) {
      if (this.socketInstance?.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket Not connected. Skip lock.')
        return
      }

      const isMyLock = this.lockedFieldsList.some(
        x => String(x.id) === String(rowId) && x.fieldId === fieldId && x.user === this.auth.userid
      )
      if (isMyLock) return

      // Optimistic update
      this.lockedFieldsList.push({
        id: String(rowId),
        fieldId: fieldId,
        user: this.auth.userid,
        connectionId: null
      })
      this.refreshTableCells()

      this._wsSend('lock_field', {
        id: String(rowId),
        fieldId,
        userid: this.auth.userid
      })

      this.startLockHeartbeat()
    },

    unlockField(rowId, fieldId) {
      if (!rowId || !fieldId) return

      this.lockedFieldsList = this.lockedFieldsList.filter(
        x => !(String(x.id) === String(rowId) && x.fieldId === fieldId)
      )

      if (String(this.activeRowId) === String(rowId) && this.activeFieldId === fieldId) {
        this.activeRowId = null
        this.activeFieldId = null

        if (this.lockHeartbeatTimer) {
          clearInterval(this.lockHeartbeatTimer)
          this.lockHeartbeatTimer = null
        }
      }

      this.refreshTableCells()

      if (this.socketInstance?.readyState === WebSocket.OPEN) {
        this._wsSend('unlock_field', { id: String(rowId), fieldId })
      }
    },

    async getActiveLocks() {
      let rsp;
      try {
        rsp = await fetch(`${this.mangoSocketUrl}/api/lock/get-all`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }).then(r => r.json());
      } catch (e) {
        console.warn('getActiveLocks Socket server unreachable:', e.message);
        return;
      }
      if (!rsp.success) return;

      const newList = (rsp.data.data || []).map(entry => ({
        id: entry.id,
        fieldId: entry.fieldId || null,
        user: entry.user,
        connectionId: entry.connectionId || null
      }));

      this.lockedFieldsList = newList;
      this.$nextTick(() => {
        this.refreshTableCells();
      });
    },

    refreshTableCells() {
      if (!this.hotInstance) return;
      this.hotInstance.updateSettings({
        cells: this.hotInstance.getSettings().cells
      });
    },
    
    handleRowChange([row, prop, oldVal, newVal], source) {
      const physicalRow = this.hotInstance.toPhysicalRow(row);
      this.changedRows.add(physicalRow);

      this.handleAutoStatus(row, prop, newVal, source, physicalRow);
      this.handleProdDateSync(row, prop, newVal, source);
    },

    handleAutoStatus(row, prop, newVal, source, physicalRow) {
      const rowData = this.hotInstance.getSourceDataAtRow(physicalRow);

      if (source === 'auto_status') return;

      // auto set log_status เฉพาะแถวใหม่ (ยังไม่มี log_id) — แถวเก่าปล่อยให้ tester จัดการ กันชน lock/ทับค่าของ tester
      if (rowData && rowData.log_id) return;

      const statusEmpty = rowData.log_status === null || rowData.log_status === undefined || rowData.log_status === '';

      // 1. remark trigger — highest priority
      if (prop === 'remark' && newVal && statusEmpty) {
        const text = String(newVal).toUpperCase();
        if (text.includes('SQL')) return this.setStatus(row, 'S');
        if (text.includes('FIX')) return this.setStatus(row, 'F');
      }

      // 2. fallback status — but check remark content first to avoid overriding FIX/SQL
      if (!statusEmpty) return;

      const remarkVal = rowData.remark ? String(rowData.remark).toUpperCase() : '';
      if (remarkVal.includes('SQL')) return this.setStatus(row, 'S');
      if (remarkVal.includes('FIX')) return this.setStatus(row, 'F');

      const hasCsmNo = rowData.job_no && rowData.job_no !== 'Update Program';
      const hasAllFields = rowData.ch_gest && rowData.worker_name && rowData.log_date && rowData.remark;

      if (hasCsmNo || hasAllFields) {
        this.setStatus(row, 'I');
      }
    },

    setStatus(row, status) {
      this.hotInstance.setDataAtRowProp(row, 'log_status', status, 'auto_status');
    },

    handleProdDateSync(row, prop, newVal, source) {
      if (prop !== 'prod_date' || !newVal || source === 'auto_sync') return;

      const statusVal = this.hotInstance.getDataAtRowProp(row, 'log_status');

      const m = moment(newVal, ['DD/MM/YYYY', moment.ISO_8601], true);
      if (!m.isValid()) return;

      const currentTypeVal = this.hotInstance.getDataAtRowProp(row, 'pg_name');
      const matchedType = this.type_pg.find(item => item.pg_name === currentTypeVal);
      
      if (matchedType) {
        if (['CSM', 'ERP'].includes(matchedType.pg_code)) {
          this.hotInstance.setDataAtRowProp(row, 'revision_prod', m.format('YYYYMMDD'), 'auto_sync');
        }
      }
    },

    recalcMaxProdDate() {
      const hot = this.hotInstance;
      if (!hot) return;

      let dataToUse = (this.fullTableData && this.fullTableData.length > 0) ? this.fullTableData : this.tableData;
      const values = dataToUse.map(r => r.prod_date);
      let maxTs = null;

      for (let i = 0; i < values.length; i++) {
        // Support multiple formats and disable strict mode to be safe
        const m = moment(values[i], ['DD/MM/YYYY', 'YYYY-MM-DD', 'D/M/YYYY', moment.ISO_8601], false);
        if (!m.isValid()) continue;

        const ts = m.valueOf();
        if (maxTs === null || ts > maxTs) {
          maxTs = ts;
        }
      }
      
      // If we are getting a subset via Prod Date search, prefer the known Global Max to avoid false positive
      if (this.retrieveSearch.field === 'prod_date' && this.retrieveSearch.text) {
        if (this.globalMaxTs && maxTs < this.globalMaxTs) {
          maxTs = this.globalMaxTs;
        }
      } else {
        // Update Global Max if this is a "broader" search or first load
        if (maxTs) {
          this.globalMaxTs = maxTs;
        }
      }
      
      this.maxProdDateTs = maxTs;
    },

    async onRead(silent = false) {
      try {
        this.isReading = true;
        if (!silent) page.loadingBox.show();

        this.changedRows.clear();
        this.changedFields.clear();

        this.lastSearchParams = JSON.parse(JSON.stringify(this.retrieveSearch));

        let searchText = this.retrieveSearch.text;
        if (['due_date', 'prod_date', 'log_date_search'].includes(this.retrieveSearch.field) && searchText) {
          searchText = moment(searchText).format('YYYY-MM-DD');
        }

        let action = `CSM/Data/CSM_ReadListLogProgram?program=${encodeURIComponent(this.retrieveSearch.program)}&year=${encodeURIComponent(this.retrieveSearch.year)}&month=${encodeURIComponent(this.retrieveSearch.month)}&field=${encodeURIComponent(this.retrieveSearch.field)}&text=${encodeURIComponent(searchText || '')}`;
        let rsp = await $xt.getServer(action);
        
        const logs = rsp.data.q.map(item => {
          const m = item.log_date ? moment(item.log_date, ['DD/MM/YYYY HH:mm', 'YYYY-MM-DD HH:mm', moment.ISO_8601]) : null;
          return {
            ...item,
            log_status: this.status_text[item.log_status],
            log_status2: this.status_text[item.log_status2],
            log_date: (m && m.isValid()) ? m.format('DD/MM/YYYY HH:mm') : item.log_date,
          };
        });

        this.tableData = logs;
        this.fullTableData = JSON.parse(JSON.stringify(logs));

        if (this.hotInstance) {
          this.hotInstance.loadData(logs);
          this.recalcMaxProdDate();
          this.hotInstance.render();
        }

        await this.getActiveLocks();
        
        return logs;
      } catch (error) {
        if (!silent) $msg.alert('Error', error.toString(), 'danger');
        return [];
      } finally {
        if (!silent) page.loadingBox.hide();
        this.isReading = false;
      }
    },

    addRowUpdate() {
      const pgMatch = this.type_pg.find(t => t.pg_code === this.retrieveSearch.program);
      this.addRow('update', pgMatch ? pgMatch.pg_name : null);
    },

    addRow(mode, pgName) {
      if (this.viewMode != 'worker') {
        $notify.warning(`ไม่มีสิทธิ์เพิ่มแถว`);
        return;
      }

      if (!this.retrieveSearch.program || this.retrieveSearch.program === 'All') {
        $notify.warning(`กรุณาเลือก Type Program ก่อน`);
        return;
      }

      const now = new Date();
      const currentYear  = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const selYear  = Number(this.retrieveSearch.year);
      const selMonth = Number(this.retrieveSearch.month);

      // คำนวณเดือน/ปีก่อนหน้า (รองรับข้ามปี)
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevYear  = prevMonthDate.getFullYear();
      const prevMonth = prevMonthDate.getMonth() + 1;

      const isCurrentPeriod = selYear === currentYear && selMonth === currentMonth;
      // อนุญาตเดือนก่อนหน้าได้ถ้าอยู่ใน 7 วันแรกของเดือนใหม่ (เช่น ลง 31 ศุกร์ ไม่ทัน มาลงวันจันทร์)
      const isPrevPeriod = selYear === prevYear && selMonth === prevMonth && now.getDate() <= 7;

      if (!isCurrentPeriod && !isPrevPeriod) {
        $notify.warning(`ไม่สามารถเพิ่มแถวได้ กรุณาเลือกเดือน/ปีปัจจุบัน (${currentMonth}/${currentYear})`);
        return;
      }

      const hot = this.hotInstance;
      const lastRowIndex = hot.countRows();

      let insertAt;
      hot.batch(() => {
        if (lastRowIndex === 0) {
          hot.alter('insert_row_above', 0, 1);
          insertAt = 0;
        } else {
          hot.alter('insert_row_below', lastRowIndex - 1, 1);
          insertAt = lastRowIndex;
        }

        if (mode === 'update') {
          hot.setDataAtRowProp(insertAt, 'remark', 'Update Program');
          hot.setDataAtRowProp(insertAt, 'log_date', moment(now).format('DD/MM/YYYY HH:mm'));

          if (pgName) {
            hot.setDataAtRowProp(insertAt, 'pg_name', pgName);
          }

          const merge = hot.getPlugin('mergeCells');
          const lastColIndex = hot.countCols() - 1;
          if (insertAt >= 0) {
            merge.merge(insertAt, 0, insertAt, 4);
            if (lastColIndex > 5) {
              merge.merge(insertAt, 6, insertAt, lastColIndex);
            }
          }
        } else if (mode === 'empty') {
          if (this.retrieveSearch.program !== 'All') {
            const pgMatch = this.type_pg.find(t => t.pg_code === this.retrieveSearch.program);
            if (pgMatch) {
              hot.setDataAtRowProp(insertAt, 'pg_name', pgMatch.pg_name, 'auto_pg');
            }
          }
          // Default Status is Waiting test
          const remark = hot.getDataAtRowProp(insertAt, 'remark');
          const fixStatuses = ['FIX', 'SQL'];
          if (!fixStatuses.includes(remark)) {
            hot.setDataAtRowProp(insertAt, 'log_status', 'I');
          }
        }
      });

      // Update fullTableData after batch completes
      const newRowData = hot.getSourceDataAtRow(hot.toPhysicalRow(insertAt));
      if (newRowData) {
        newRowData._cid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        this.fullTableData.splice(insertAt, 0, JSON.parse(JSON.stringify(newRowData)));
      }
    },

    removeRow() {
      const hot = this.hotInstance;
      const selected = hot.getSelected();

      if (this.viewMode != 'worker') {
        $notify.warning(`ไม่มีสิทธิ์ลบแถว`);
        return;
      }
      
      if (!selected) {
        return $notify.warning('กรุณาเลือกแถวที่ต้องการลบ');
      }

      const removable = new Set();
      let hasRestricted = false;

      // วนลูปเช็คทุกแถวที่ User เลือก
      selected.forEach(([r1, , r2]) => {
        // วนจากแถวแรกถึงแถวสุดท้ายในช่วงที่เลือก
        for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
          const physicalRow = hot.toPhysicalRow(r);
          const rowData = hot.getSourceDataAtRow(physicalRow);

          if (rowData && rowData.log_id) {
            hasRestricted = true; // ติดล็อค ลบไม่ได้
          } else {
            removable.add(r); // ไม่มี ID ลบได้เลย
          }
        }
      });

      if (removable.size > 0) {
        // เก็บ physical index ของแถวที่จะลบไว้ก่อน splice (index ยังถูกต้องอยู่)
        const removedPhys = [...removable]
          .map(r => hot.toPhysicalRow(r))
          .filter(p => p !== null && p !== undefined && p >= 0);

        [...removable].sort((a, b) => b - a).forEach(r => hot.alter('remove_row', r));

        // reconcile tracking ให้ตรงหลังลบ — กัน index เพี้ยน (changedRows/changedFields เป็น physical index)
        const removedSet = new Set(removedPhys);
        const removedAsc = [...removedPhys].sort((a, b) => a - b);
        const shiftIndex = (idx) => idx - removedAsc.filter(p => p < idx).length;

        const newChangedRows = new Set();
        const newChangedFields = new Map();
        this.changedRows.forEach(idx => {
          if (removedSet.has(idx)) return; // แถวที่ถูกลบ ทิ้ง tracking
          const ni = shiftIndex(idx);
          newChangedRows.add(ni);
          if (this.changedFields.has(idx)) {
            newChangedFields.set(ni, this.changedFields.get(idx));
          }
        });
        this.changedRows = newChangedRows;
        this.changedFields = newChangedFields;

        // ลบแถวเดียวกันออกจาก fullTableData ให้ index ยัง align กับ tableData
        [...removedPhys].sort((a, b) => b - a).forEach(p => this.fullTableData.splice(p, 1));

        this.recalcMaxProdDate();
        hot.render();
      }

      if (hasRestricted) {
        $notify.warning('ไม่สามารถลบข้อมูลที่มีการบันทึกแล้วได้');
      }
    },

    async exportExcel() {
      if (!await $msg.confirm('Are you sure you want to export this data?')) return;
      
      try {
        page.loadingBox.show();

        const hot = this.hotInstance;
        const exportData = [];

        hot.getSourceData().forEach((rowData, physRow) => {
          if (!rowData) return;
          const visualRow = hot.toVisualRow(physRow);
          if (visualRow !== null && visualRow !== undefined && visualRow >= 0) {
            exportData.push(rowData);
          }
        });

        let f = {
          form: exportData 
        };

        let action = `CSM/Data/ExportExcel_Log_PG`; 
        let rsp = await $xt.postServerJson(action, f);

        if (!rsp.success) {
          $msg.alert('Error', rsp.error || 'Export failed', 'danger');
          return;
        }
        window.open(window.hostServer + `API/File/DownLoad?download=true&id=${rsp.data}`);
      } catch (error) {
        console.error(error);
        $msg.alert('Error', error.toString(), 'danger');
      } finally {
        page.loadingBox.hide();
      }
    },

    debouncedSave() {
      if (this.saveTimer) clearTimeout(this.saveTimer);
      this.savingStatus = 'Waiting...';
      this.saveTimer = setTimeout(() => {
        this.saveData();
      }, 3000); // 3 seconds delay
    },

    findRowRef(list, rowData, rowIndex) {
      if (!Array.isArray(list) || !rowData) return null;

      if (rowData.log_id) {
        const byId = list.find(r => r && String(r.log_id) === String(rowData.log_id));
        if (byId) return byId;
      }
      if (rowData._cid) {
        const byCid = list.find(r => r && r._cid && String(r._cid) === String(rowData._cid));
        if (byCid) return byCid;
      }
      return list[rowIndex] || null;
    },

    async saveData() {
      if (!this.hotInstance || this.changedRows.size === 0) return;
      this.savingStatus = 'Saving...';
      const rowIndices = Array.from(this.changedRows);

      try {
        for (const rowIndex of rowIndices) {
          if (!this.hotInstance) break;

          const rowData = this.tableData[rowIndex];

          if (!rowData) {
            this.changedRows.delete(rowIndex);
            this.changedFields.delete(rowIndex);
            continue;
          }

          let dataToSave = JSON.parse(JSON.stringify(rowData));

          const log_status_map = { 'ผ่าน': 'Y', 'ไม่ผ่าน': 'N', 'ด่วนมาก': 'U', 'รอทดสอบ': 'I', 'FIX': 'F', 'SQL': 'S' };
          // แปลง log_status เป็นตัวย่อ
          if (log_status_map[dataToSave.log_status]) {
            dataToSave.log_status = log_status_map[dataToSave.log_status];
          }
          if (log_status_map[dataToSave.log_status2]) {
            dataToSave.log_status2 = log_status_map[dataToSave.log_status2];
          }

          // แปลง pg_name → code_program (pg_code) ก่อนส่ง DB
          if (dataToSave.pg_name) {
            const pgMatch = this.type_pg.find(t => t.pg_name === dataToSave.pg_name);
            if (pgMatch) {
              dataToSave.code_program = pgMatch.pg_code;
            }
          }

          // แปลง log_date DD/MM/YYYY HH:mm → ISO ก่อนส่ง DB
          if (dataToSave.log_date) {
            const mDate = moment(dataToSave.log_date, ['DD/MM/YYYY HH:mm', 'D/M/YYYY H:mm', 'DD/MM/YYYY HH:mm:ss', 'D/M/YYYY HH:mm', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'], false);
            if (mDate.isValid()) {
              dataToSave.log_date = mDate.toISOString();
            } else {
              console.error("Invalid Date Format:", dataToSave.log_date);
            }
          }

          // Check if row is empty
          const isEmpty = Object.values(rowData).every(x => x === null || x === undefined || x === '');
          if (isEmpty) {
            this.changedRows.delete(rowIndex);
            this.changedFields.delete(rowIndex);
            continue;
          }

          const hasChGest = rowData.ch_gest && String(rowData.ch_gest).trim() !== '';
          const hasWorker = rowData.worker_name && String(rowData.worker_name).trim() !== '';
          const hasDate = rowData.log_date && String(rowData.log_date).trim() !== '';
          const hasRemark = rowData.remark && String(rowData.remark).trim() !== '';

          if (!rowData.log_id) {
            // New row: require at least one of 4 fields
            if (!hasChGest && !hasWorker && !hasDate && !hasRemark) continue;
          }

          // Check if modified (Compare with original)
          if (this.fullTableData[rowIndex]) {
            const originalRow = this.fullTableData[rowIndex];
            if (JSON.stringify(originalRow) === JSON.stringify(rowData)) {
              this.changedRows.delete(rowIndex);
              this.changedFields.delete(rowIndex);
              continue;
            }
          }

          let f = {
            form: dataToSave,
            year:  this.retrieveSearch.year  || null,
            month: this.retrieveSearch.month || null
          };

          // If updating existing row, send per-field requests
          const fieldsChanged = this.changedFields.get(rowIndex);
          
          if (rowData.log_id && fieldsChanged && fieldsChanged.size > 0) {
            // Send one request per changed field
            const failedFields = [];
            for (const fieldName of fieldsChanged) {
              let fieldForm = JSON.parse(JSON.stringify(dataToSave));
              fieldForm.fieldId = fieldName;
              let fieldAction = `CSM/Data/CSM_CreateAndUpdateLogProgram`;
              let fieldRsp = await $xt.postServerJson(fieldAction, { form: fieldForm });
              if (!fieldRsp.success) {
                failedFields.push(fieldName);
                console.error(`Failed to save field: ${fieldName}`, fieldRsp.error);
              }
            }
            if (failedFields.length > 0) {
              // Keep failed fields for retry
              this.changedFields.set(rowIndex, new Set(failedFields));
              throw `บันทึกไม่สำเร็จ: ${failedFields.join(', ')}`;
            }
          } else {
            // New row (no log_id) — send all fields at once
            let action = `CSM/Data/CSM_CreateAndUpdateLogProgram`;
            let rsp = await $xt.postServerJson(action, f);
            
            if (!rsp.success) throw rsp.error;
            
            if (!rowData.log_id && rsp.data) {
              let newId = rsp.data.ref_id || (rsp.data.h ? rsp.data.h.log_id : null) || rsp.data.log_id;

              if (newId) {
                // tableData ถูกแทนที่ทั้ง array ได้ระหว่าง await (realtime/poll แทรกแถว) — reference เดิมกลายเป็นแถวกำพร้า
                const liveRow = this.findRowRef(this.tableData, rowData, rowIndex);
                if (liveRow) liveRow.log_id = newId;
                rowData.log_id = newId;

                const original = this.findRowRef(this.fullTableData, rowData, rowIndex);
                if (original) {
                  original.log_id = newId;
                } else {
                  this.fullTableData[rowIndex] = JSON.parse(JSON.stringify(rowData));
                }
              }
            }
          }

          const originalRef = this.findRowRef(this.fullTableData, rowData, rowIndex);
          if (originalRef) {
            Object.assign(originalRef, JSON.parse(JSON.stringify(rowData)));
          }

          this.changedRows.delete(rowIndex);
          this.changedFields.delete(rowIndex);
        }
        
        if (this.hotInstance) {
          this.hotInstance.render(); 
        }

        this.savingStatus = 'Saved';
        $notify.success('บันทึกสำเร็จ');

        setTimeout(() => {
          if (this.savingStatus === 'Saved') this.savingStatus = '';
        }, 2000);

      } catch (error) {
        console.error("Save Error:", error);
        this.savingStatus = 'Error';
        
        // Extract meaningful error message
        let errorMsg = 'Save Failed';
        if (error && error.message) {
          errorMsg = error.message;
        } else if (typeof error === 'string') {
          errorMsg = error;
        } else if (error && error.error) {
          errorMsg = error.error;
        }
        
        $notify.error(errorMsg);
      }
    },

    async list_type_pg() {
      try {
        let act = `csm/master/Group_pg`;
        let rsp = await $xt.getServer(act);
        this.type_pg = rsp.data;
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      }
    },

    async load_task(job_no, ref_task) {
      try {
        page.loadingBox.show();
        let act = `CSM/Data/Load_Task?job_no=${encodeURIComponent(job_no)}&ref_task=${encodeURIComponent(ref_task)}`;
        let rsp = await $xt.getServer(act);
        if (!rsp.success) throw rsp.error;
        this.taskData = rsp.data.q;
        let agr = this.$refs.agr;

        agr.setDisplay(this.taskData);
        this.initTable()
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
        page.loadingBox.hide();
      }
    },

    async initTable() {
      let agr = this.$refs.agr;
      let fields = [
        ["item_no", "No.", "text", { width: 100, align: "center" }],
        ["ch_gest", "เลขอ้างอิง", "text", { width: 150, align: "center" }],
        ["worker_name", "Worker IT", "text", { width: 200, align: "left" }],
        ["log_date", "Date Time", "text", { width: 150, align: "center" }],
        ["remark", "Description", "text", { width: 350, align: "left" }],
        ["log_status", "Status", "text", { width: 150, align: "center" }],
        ["send_to_qc_date", "Send To QC Date", "datetime", { width: 180, align: "center" }, { useCellRenderer: true }],
        ["sendback_date", "Send Back Date", "datetime", { width: 200, align: "center" }, { useCellRenderer: true }],
        ["prod_date", "Prod Date", "date", { width: 180, align: "center" }],
        ["addspec", "Addspec", "text", { width: 350, align: "left" }],
      ];
      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);
      this.grid_header = header;
    },

    openTaskModal(taskValue, rowIndex) {
      try {
        page.loadingBox.show();
        const rowData = this.hotInstance.getSourceDataAtRow(this.hotInstance.toPhysicalRow(rowIndex));
        this.selectedCsmNo = rowData;
        this.$refs.taskModal.openModal();
        
        if (this.selectedCsmNo) {
          this.load_task(this.selectedCsmNo.job_no, this.selectedCsmNo.ref_task);
        }
      } catch (error) {
        $msg.alert(``, error.toString(), `danger`);
      } finally {
        page.loadingBox.hide();
      }
    },

    addNewRowRealtime(serverRow) {
      // console.log("addNewRowRealtime", serverRow);
      if (!this.hotInstance || !serverRow || this.isReading) return;

      if (serverRow.log_status && this.status_text[serverRow.log_status]) {
        serverRow.log_status = this.status_text[serverRow.log_status];
      }

      if (serverRow.log_status2 && this.status_text[serverRow.log_status2]) {
        serverRow.log_status2 = this.status_text[serverRow.log_status2];
      }

      if (!serverRow.pg_name && serverRow.code_program) {
        const pgMatch = this.type_pg.find(t => t.pg_code === serverRow.code_program);
        if (pgMatch) serverRow.pg_name = pgMatch.pg_name;
      }

      const existsInFull = this.fullTableData.some(r => String(r.log_id) === String(serverRow.log_id));

      if (existsInFull) {
        this.handleRealtimeUpdate(serverRow);
        return;
      }

      this.fullTableData.push(JSON.parse(JSON.stringify(serverRow)));
      const isMatch = this.checkRowMatchCondition(serverRow);

      if (isMatch) {
        const currentData = JSON.parse(JSON.stringify(this.tableData));
        // จับคู่ echo กับ draft ของตัวเองด้วย _cid เท่านั้น — ถ้าไม่ใช่ของเรา (คนละ _cid) จะ push เป็นแถวใหม่แยก ไม่ hijack
        const pendingIndex = (serverRow._cid)
          ? currentData.findIndex(r => !r.log_id && r._cid && String(r._cid) === String(serverRow._cid))
          : -1;

        if (pendingIndex !== -1) {
          Object.assign(currentData[pendingIndex], serverRow);
        } else {
          currentData.push(serverRow);
        }
        
        this.tableData = currentData;
        this.hotInstance.loadData(this.tableData);
        this.$nextTick(() => this.hotInstance.render());
      }

      if (serverRow.job_no) {
        $notify.info(`New Log Added: ${serverRow.job_no}`);
      } else {
        $notify.info(`New Log Added`);
      }

      if (this.recalcMaxProdDate) this.recalcMaxProdDate();
    },

    handleRealtimeUpdate(serverRow) {
      // console.log("handleRealtimeUpdate", serverRow)
      if (!this.hotInstance || !serverRow) return;

      if (serverRow.log_status && this.status_text[serverRow.log_status]) {
        serverRow.log_status = this.status_text[serverRow.log_status];
      }

      if (serverRow.log_status2 && this.status_text[serverRow.log_status2]) {
        serverRow.log_status2 = this.status_text[serverRow.log_status2];
      }

      const hot = this.hotInstance;
      const sId = String(serverRow.log_id);
      const sourceData = hot.getSourceData();
      const physIndex = sourceData.findIndex(r => String(r.log_id) === sId);

      if (physIndex === -1) return;

      // block เฉพาะ field ที่ user คนนี้แก้ค้างอยู่ (ยังไม่ save) — field อื่นให้ sync ของคนอื่นได้ปกติ
      const pendingFields = this.changedRows.has(physIndex) ? (this.changedFields.get(physIndex) || null) : null;

      // realtime แบบราย field (payload มี fieldId) → apply เฉพาะ field ที่เปลี่ยนจริง
      const fieldId = serverRow.fieldId || null;

      const visualRow = hot.toVisualRow(physIndex);

      // ผู้ใช้กำลังพิมพ์ค้างอยู่ที่ cell ไหน — จำ cell + ค่าที่พิมพ์ (ยังไม่ commit) เพื่อคืนหลัง render (render ปิด editor เสมอ)
      const editor = hot.getActiveEditor();
      const editing = editor && typeof editor.isOpened === 'function' && editor.isOpened()
        ? { row: editor.row, col: editor.col, prop: hot.colToProp(editor.col), value: editor.getValue() }
        : null;

      if (visualRow === null || visualRow === undefined || visualRow < 0) {
        // แถวถูก filter/scroll ออก — merge เข้า source (apply ตาม fieldId + ข้าม field ที่แก้ค้าง) แล้ว render รอบถัดไป
        const target = sourceData[physIndex];
        Object.keys(serverRow).forEach(k => {
          if (fieldId && k !== fieldId) return;
          if (pendingFields && pendingFields.has(k)) return;
          target[k] = serverRow[k];
        });
        this.$nextTick(() => { if (this.hotInstance) this.hotInstance.render(); });
        return;
      }


      // กันเฉพาะ field ที่ editor กำลังเปิดพิมพ์อยู่ ณ ขณะนี้ (ยังไม่ commit) กันค่าที่พิมพ์หาย
      const activeEditor = hot.getActiveEditor();
      let editingField = null;
      if (activeEditor && typeof activeEditor.isOpened === 'function' && activeEditor.isOpened() && activeEditor.row === visualRow) {
        editingField = hot.colToProp(activeEditor.col);
      }

      const lRow = sourceData[physIndex];
      const changes = [];
      const checkFields = ['ch_gest', 'worker_name', 'color_w', 'log_date', 'remark', 'log_status', 'log_status2', 'prod_date', 'revision_prod', 'tester_name', 'color_t', 'link_test', 'pg_name'];

      checkFields.forEach(field => {
        // ข้าม field ที่ payload ไม่ได้ส่งมา (กันค่าอย่าง color_w/color_t ถูกทับเป็น undefined แล้วสีหาย)
        if (!Object.prototype.hasOwnProperty.call(serverRow, field)) return;

        // realtime ราย field → apply เฉพาะ field ที่เปลี่ยนจริง (field อื่นใน snapshot อาจ stale)
        if (fieldId && field !== fieldId) return;

        // ข้าม field ที่ user คนนี้แก้ค้างอยู่ ยังไม่ save (กันค่าที่พิมพ์ไว้ถูกทับ)
        if (pendingFields && pendingFields.has(field)) return;

        // ข้าม field ที่ editor กำลังเปิดพิมพ์อยู่ ณ ขณะนี้ (กันค่าที่พิมพ์กลางคันหลุด)
        if (editingField && field === editingField) return;

        let newVal = serverRow[field]
        if(field == 'prod_date' && newVal){
          const m = moment(newVal, ['DD/MM/YYYY', 'YYYY-MM-DD', moment.ISO_8601], true);
          if (m.isValid()) {
            newVal = m.format('DD/MM/YYYY');
          }
        }

        // แปลง log_date จาก ISO → DD/MM/YYYY HH:mm ก่อน compare
        if (field === 'log_date' && newVal) {
          const m = moment(newVal, ['DD/MM/YYYY HH:mm', 'YYYY-MM-DD HH:mm', moment.ISO_8601]);
          if (m.isValid()) {
            newVal = m.format('DD/MM/YYYY HH:mm');
          }
        }

        if (String(lRow[field] || '') !== String(newVal || '')) {
          changes.push([visualRow, field, newVal]);
        }
      });

      if (changes.length > 0) {
        hot.setDataAtRowProp(changes, 'server_sync');
        this.recalcMaxProdDate();
        hot.render();
        this.restoreEditor(editing);
      }
    },

    restoreEditor(editing) {
      if (!editing || !this.hotInstance) return;

      const hot = this.hotInstance;
      const cur = hot.getActiveEditor();
      // editor ยังเปิดที่ cell เดิมอยู่ (render ไม่ได้ปิด) → ไม่ต้องทำอะไร
      if (cur && typeof cur.isOpened === 'function' && cur.isOpened() && cur.row === editing.row && cur.col === editing.col) return;

      hot.selectCell(editing.row, editing.col);
      const ed = hot.getActiveEditor();
      if (ed) {
        ed.beginEditing();
        ed.setValue(editing.value);
        if (typeof ed.enableFullEditMode === 'function') ed.enableFullEditMode();
        const ta = ed.TEXTAREA;
        if (ta && typeof ta.setSelectionRange === 'function') {
          const len = String(editing.value == null ? '' : editing.value).length;
          ta.setSelectionRange(len, len);
          ta.focus();
        }
      }
    },

    parseDateLoose(val) {
      if (!val) return null;
      if (val instanceof Date) {
        const md = moment(val);
        return md.isValid() ? md : null;
      }
      const s = String(val).trim();
      const m = /^\d{1,2}\/\d{1,2}\/\d{4}/.test(s)
        ? moment(s, ['DD/MM/YYYY HH:mm', 'DD/MM/YYYY'])
        : moment(s, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD', moment.ISO_8601]);
      return m.isValid() ? m : null;
    },

    checkRowMatchCondition(row) {
      const search = this.lastSearchParams || this.retrieveSearch;
      if (!search) return true;
      
      const isAll = !search.program || search.program === 'All';
      if (!isAll) {
        if (row.code_program != search.program) return false; 
      }

      if (row.log_date) {
        const m = moment(row.log_date, ['DD/MM/YYYY HH:mm', moment.ISO_8601]);
        if (m.isValid()) {
          const rowYear = m.year();
          const rowMonth = m.month() + 1; // moment month เริ่มที่ 0
          
          if (parseInt(search.year) !== rowYear) return false;
          if (parseInt(search.month) !== rowMonth) return false;
        }
      }

      if (search.text && String(search.text).trim() !== '') {
        const field = search.field || 'job_no'; // default field

        // field วันที่ backend เทียบเป็นช่วงวัน (BuildDateRangeCond) แต่ค่าในแถวเป็น dd/MM/yyyy — เทียบ substring ไม่ได้
        const dateProp = { log_date_search: 'log_date_search', due_date: 'due_date', prod_date: 'prod_date' }[field];

        if (dateProp) {
          const searchDate = this.parseDateLoose(search.text);
          if (!searchDate) return true;

          let rowDate = this.parseDateLoose(row[dateProp]);
          if (!rowDate && dateProp === 'log_date_search') {
            rowDate = this.parseDateLoose(row.log_date);
          }

          if (!rowDate) return false;
          if (!rowDate.isSame(searchDate, 'day')) return false;
        } else {
          const searchText = String(search.text).toLowerCase();
          const rowValue = String(row[field] || '').toLowerCase();

          if (!rowValue.includes(searchText)) return false;
        }
      }

      return true; // ถ้าผ่านทุกด่าน แสดงว่าตรงเงื่อนไข
    },

    handleLock(data) {
      if (!data?.id) return;

      const fieldId = data.fieldId || null;

      // Ignore events without fieldId (graceful handling)
      if (!fieldId) return;

      const exists = this.lockedFieldsList.some(
        x => String(x.id) === String(data.id) && x.fieldId === fieldId
      );

      if (!exists) {
        this.lockedFieldsList.push({
          id: String(data.id),
          fieldId: fieldId,
          user: data.userid,
          connectionId: data.connectionId || null
        });
        this.hotInstance.render();
      }
    },

    startLockHeartbeat() {
      if (this.lockHeartbeatTimer) clearInterval(this.lockHeartbeatTimer)
      this.lockHeartbeatTimer = setInterval(() => {
        if (!this.activeRowId || !this.activeFieldId) return
        if (this.socketInstance?.readyState !== WebSocket.OPEN) return
        this._wsSend('refresh_lock', {
          id: String(this.activeRowId),
          fieldId: this.activeFieldId
        })
      }, 30000)
    },

    _wsSend(type, payload) {
      if (this.socketInstance?.readyState === WebSocket.OPEN) {
        this.socketInstance.send(JSON.stringify({ type, payload }))
      }
    },

    handleLockRejected({ id, fieldId, lockedBy }) {
      this.lockedFieldsList = this.lockedFieldsList.filter(
        x => !(String(x.id) === String(id) && x.fieldId === fieldId && x.user === this.auth.userid)
      )
      if (String(this.activeRowId) === String(id) && this.activeFieldId === fieldId) {
        this.activeRowId = null
        this.activeFieldId = null
        if (this.lockHeartbeatTimer) {
          clearInterval(this.lockHeartbeatTimer)
          this.lockHeartbeatTimer = null
        }
      }
      this.hotInstance?.destroyEditor()
      this.refreshTableCells()
      $notify.warning(`ถูกล็อกโดย ${lockedBy || 'another user'}`)
    },

    handleUnlock(data) {
      if (!data?.id) return;

      const fieldId = data.fieldId || null;

      // [NEW] field-level unlock
      if (fieldId) {
        this.lockedFieldsList = this.lockedFieldsList.filter(
          x => !(String(x.id) === String(data.id) && x.fieldId === fieldId)
        );
      } else {
        // Fallback: remove all locks for this row (backward compat)
        this.lockedFieldsList = this.lockedFieldsList.filter(
          x => String(x.id) !== String(data.id)
        );
      }

      this.refreshTableCells();
    },

    initWebSocket() {
      if (!this.mangoSocketUrl) return
      const url = `${this.mangoSocketUrl}/ws?module=csm`

      const connect = () => {
        if (this._wsDestroyed) return

        const ws = new WebSocket(url)
        this.socketInstance = ws

        ws.onopen = () => {
          console.log('WebSocket Connected')
          this._wsRetryDelay = 2000
          this.getActiveLocks()
          if (this.activeRowId && this.activeFieldId) {
            this._wsSend('lock_field', {
              id: String(this.activeRowId),
              fieldId: this.activeFieldId,
              userid: this.auth.userid
            })
          }
        }

        ws.onmessage = (event) => {
          try {
            const { type, payload } = JSON.parse(event.data)
            switch (type) {
              case 'new_row':        this.addNewRowRealtime(payload);   break
              case 'update_row':     this.handleRealtimeUpdate(payload); break
              case 'field_locked':   this.handleLock(payload);           break
              case 'field_unlocked': this.handleUnlock(payload);         break
              case 'lock_rejected':  this.handleLockRejected(payload);   break
            }
          } catch (e) {
            console.error('WebSocket onmessage parse error:', e)
          }
        }

        ws.onclose = (event) => {
          console.warn('WebSocket Disconnected:', event.code, event.reason)
          if (!this._wsDestroyed) {
            const delay = this._wsRetryDelay || 2000
            this._wsRetryDelay = Math.min(30000, delay * 2)
            this._wsReconnectTimer = setTimeout(connect, delay)
          }
        }

        ws.onerror = () => {
          console.error('WebSocket error')
        }
      }

      this._wsDestroyed = false
      this._wsRetryDelay = 2000
      connect()
    },

    async ReadHideColumn() {
      try {
        let act  =  `CSM/Data/ReadHideColumn?doctype=TSCSM&page_name=v_csm_logs_program`;
        let rsp = await $xt.getServer(act);
        this.column_readonly = rsp.data;
        if(this.hotInstance){
          this.hotInstance.render();
        }
      } catch (error) {
        console.log(error);
      }
    },

    startPolling() {
      this.stopPolling();
      this.pollingInterval = setInterval(() => {
        this.onPollRead();
      }, 30000);
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },

    async onPollRead() {
      if (this.savingStatus === 'Saving...' || this.savingStatus === 'Waiting...') return;

      // ไม่ bail เพราะแค่มีแถว draft ค้าง — draft (ไม่มี log_id) ไม่ถูก poll แตะ และ dedup ใช้ _cid กัน hijack แล้ว
      const activeEditor = this.hotInstance.getActiveEditor();
      if (activeEditor && typeof activeEditor.isOpened === 'function' && activeEditor.isOpened()) return;

      try {
        if (!this.lastSearchParams) return;

        let searchText = this.lastSearchParams.text;
        if (['due_date', 'prod_date', 'log_date_search'].includes(this.lastSearchParams.field) && searchText) {
          searchText = moment(searchText).format('YYYY-MM-DD');
        }

        let action = `CSM/Data/CSM_ReadListLogProgram?program=${encodeURIComponent(this.lastSearchParams.program)}&year=${encodeURIComponent(this.lastSearchParams.year)}&month=${encodeURIComponent(this.lastSearchParams.month)}&field=${encodeURIComponent(this.lastSearchParams.field)}&text=${encodeURIComponent(searchText || '')}`;
        let rsp = await $xt.getServer(action);

        // สถานะเปลี่ยนได้ระหว่างรอ response (กด Insert Row / เริ่มพิมพ์ / เริ่ม save) — เช็คซ้ำก่อน apply
        if (!this.hotInstance || this.isReading) return;
        if (this.savingStatus === 'Saving...' || this.savingStatus === 'Waiting...') return;
        const editorNow = this.hotInstance.getActiveEditor();
        if (editorNow && typeof editorNow.isOpened === 'function' && editorNow.isOpened()) return;

        const logs = (rsp && rsp.data && rsp.data.q) ? rsp.data.q : (rsp.data || []);

        if (!logs || logs.length === 0) return;

        logs.forEach(serverRow => {
          serverRow.status = serverRow.log_status; // Ensure mappin
          const sId = String(serverRow.log_id);
          const localRow = this.fullTableData.find(r => String(r.log_id) === sId)
          if (!localRow) {
            this.addNewRowRealtime(serverRow);
          } else {
            this.handleRealtimeUpdate(serverRow);
          }
        });

      } catch (error) {
        console.warn("Polling error (silent):", error);
      }
    },
    async handleWindowFocus() {
      if (this.isReading) return;

      try {
        await this.getActiveLocks();

        if (this.activeRowId && this.activeFieldId) {
          const myLock = this.lockedFieldsList.find(
            x => String(x.id) === String(this.activeRowId) && x.fieldId === this.activeFieldId && x.user === this.auth.userid
          );

          if (!myLock) {
            console.log("Field lock refreshed for data consistency.");
            this.tryLockField(this.activeRowId, this.activeFieldId);
          }
        }

        // Re-read data when no unsaved changes to refresh tester_name etc.
        const isEditing = this.hotInstance && this.hotInstance.getActiveEditor() && this.hotInstance.getActiveEditor().isOpened();
        if (this.changedRows.size === 0 && !isEditing && this.savingStatus !== 'Saving...' && this.savingStatus !== 'Waiting...') {
          await this.onRead(true);
        }
      } catch (e) {
        console.error("Focus sync error:", e);
      }
    },
  },
  beforeUnmount() {
    // ปิด MutationObserver dark mode
    if (this._darkObserver) {
      this._darkObserver.disconnect()
      this._darkObserver = null
    }

    // ปิด Timer การบันทึกข้อมูล
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }

    // ปิด Polling
    this.stopPolling();

    // ปิด BroadcastChannel
    if (this._csmChannel) {
      this._csmChannel.close();
      this._csmChannel = null;
    }

    // ปิด Timer การ Refresh Lock
    if (this.lockHeartbeatTimer) {
      clearInterval(this.lockHeartbeatTimer);
      this.lockHeartbeatTimer = null;
    }

    // ปิด Handsontable
    if (this.hotInstance) {
      this.hotInstance.destroy();
      this.hotInstance = null;
    }

    // ปิด Event Listener การ Resize
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
    
    // ปิด Event Listener การปิดหน้าจอ
    window.removeEventListener('focus', this.handleWindowFocus);

    // ปลดล็อคแถว
    if (this.activeRowId && this.activeFieldId) {
      this.unlockField(this.activeRowId, this.activeFieldId);
    }

    // ปิด WebSocket
    this._wsDestroyed = true;
    if (this._wsReconnectTimer) {
      clearTimeout(this._wsReconnectTimer);
      this._wsReconnectTimer = null;
    }
    if (this.socketInstance) {
      this.socketInstance.close(1000, 'destroy');
      this.socketInstance = null;
    }

  },
  mounted() {
    page = this.$refs.page
    page.pageTitle = 'CSM Logs Program'
    document.title = page.pageTitle

    this.$refs.taskModal.setSize("modal-lg")

    // Init Handsontable theme ตาม dark mode ปัจจุบัน
    const isDark = document.body.classList.contains('dark-mode')
    this.selectedTheme = isDark ? 'ht-theme-main-dark' : 'ht-theme-main'

    this.initHandsontable();
    this.onRead();
    this.list_type_pg();
    this.initWebSocket();
    this.ReadHideColumn();
    this.startPolling();

    window.addEventListener('focus', this.handleWindowFocus);

    // BroadcastChannel — รับ message เมื่อหน้า CSM บันทึกข้อมูล (เช่น Tester เปลี่ยน)
    try {
      this._csmChannel = new BroadcastChannel('csm_data_updated');
      this._csmChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'csm_updated') {
          if (this.changedRows.size === 0 && this.savingStatus !== 'Saving...' && this.savingStatus !== 'Waiting...') {
            this.onRead();
          }
        }
      };
    } catch (e) { /* BroadcastChannel not supported */ }

    // MutationObserver — เปลี่ยน theme อัตโนมัติเมื่อ dark mode toggle
    this._darkObserver = new MutationObserver(() => {
      const dark = document.body.classList.contains('dark-mode')
      const newTheme = dark ? 'ht-theme-main-dark' : 'ht-theme-main'
      if (this.selectedTheme !== newTheme) {
        this.selectedTheme = newTheme
        this.changeTheme()
      }
    })
    this._darkObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  },
};
</script>

<style scoped>
/* Page Container */
.page-container {
  padding: 16px;
  background: #f1f5f9;
  /* min-height: calc(100vh - 60px); */
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 400;
}

.btn-export {
  height: 30px;
  padding: 0 12px;
  background: #ffffff;
  color: #188038;
  border: 1px solid #dadce0;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
  box-shadow: none;
}

.btn-export:hover {
  background: #f2fbf4;
  border-color: #188038;
  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.15);
}

.btn-export:active {
  background: #e6f4ea;
}

/* Last saved label (right toolbar) */
.last-saved {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 500;
  color: #16a34a;
  white-space: nowrap;
}

.last-saved i {
  font-size: 13px;
}

/* Auto Save Toggle */
.search-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: flex-end;
  height: 36px;
}

.auto-save-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.auto-save-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 16px;
  background: #f1f5f9;
  transition: all 0.3s ease;
  border: 1.5px solid #e2e8f0;
  user-select: none;
}

.auto-save-toggle.is-active {
  background: #ecfdf5;
  border-color: #10b981;
}

.toggle-track {
  width: 28px;
  height: 16px;
  background-color: #cbd5e1;
  border-radius: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.auto-save-toggle.is-active .toggle-track {
  background-color: #10b981;
}

.toggle-handle {
  width: 12px;
  height: 12px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.auto-save-toggle.is-active .toggle-handle {
  transform: translateX(12px);
}

.auto-save-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.3s ease;
}

.auto-save-toggle.is-active .auto-save-label {
  color: #059669;
}

.saving-indicator {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 70px;
}

.saving-indicator i {
  color: #2563eb;
}

/* Search Card */
.search-card {
  background: white;
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 6px 20px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-input-field {
  max-width: 350px;
}

.search-field-small {
  min-width: auto;
}

.field-input-small {
  width: 100%;
  height: 30px;
  padding: 0 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13.5px;
  color: #1e293b;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: center;
}

.field-input-small:hover {
  border-color: #cbd5e1;
}

.field-input-small:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.search-card .mx-datepicker {
  width: 100%;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin: 0;
  letter-spacing: 0.2px;
}

.field-select {
  height: 30px;
  padding: 0 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13.5px;
  color: #1e293b;
  background: #ffffff;
  transition: all 0.2s ease;
  cursor: pointer;
  font-weight: 500;
}

.field-select:hover {
  border-color: #cbd5e1;
}

.field-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.input-with-button {
  display: flex;
  gap: 0;
  position: relative;
}

.field-input {
  flex: 1;
  height: 36px;
  padding: 0 16px;
  border: 1.5px solid #dadce0;
  border-right: none;
  border-radius: 8px 0 0 8px;
  font-size: 14px;
  color: #202124;
  transition: all 0.2s ease;
  font-weight: 500;
}

.field-input::placeholder {
  color: #94a3b8;
}

.field-input:hover {
  border-color: #bdc1c6;
}

.field-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.field-input:focus + .btn-search {
  border-color: #2563eb;
}

.btn-search {
  width: 38px;
  height: 30px;
  background: #2563eb;
  color: white;
  border: 1.5px solid transparent;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.btn-search:hover {
  background: #1d4ed8;
}

.btn-search:active {
  transform: scale(0.96);
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 14px;
  padding: 16px 20px 20px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 6px 20px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
}

.table-container {
  border-radius: 6px;
  overflow: hidden;
}
/* Table Actions */
.table-actions {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.btn-add-row {
  height: 30px;
  padding: 0 12px;
  background: #ffffff;
  color: #2563eb;
  border: 1px solid #dadce0;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
  box-shadow: none;
}

.btn-add-row:hover {
  background: #f6faff;
  border-color: #2563eb;
  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.15);
}

.btn-add-row:active {
  background: #eff4ff;
}

.btn-add-row.dropdown-toggle::after {
  margin-left: 8px;
}

.custom-dropdown-menu {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  margin-top: 5px;
  min-width: 250px;
}

.custom-dropdown-menu li a {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
}

.custom-dropdown-menu li a i {
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.custom-dropdown-menu li a:hover {
  background-color: #f8fafc;
  color: #2563eb;
  text-decoration: none;
}

.btn-update-program {
  height: 38px;
  padding: 0 20px;
  background: #fdf2f8;
  color: #9d174d;
  border: 1.5px solid #fbcfe8;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(157, 23, 77, 0.05);
}

.btn-update-program i {
  font-size: 16px;
}

.btn-update-program:hover {
  background: #fce7f3;
  border-color: #f9a8d4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(157, 23, 77, 0.1);
}

.btn-update-program:active {
  transform: translateY(0);
}

.btn-delete-row {
  height: 30px;
  padding: 0 12px;
  background: #ffffff;
  color: #d93025;
  border: 1px solid #dadce0;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
  box-shadow: none;
  margin-left: 8px;
}

.btn-delete-row i {
  font-size: 14px;
}

.btn-delete-row:hover {
  background: #fef6f5;
  border-color: #d93025;
  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.15);
}

.btn-delete-row:active {
  background: #fce8e6;
}

.handsontable td.update-program-row {
  background-color: #fde2e4 !important;
  font-weight: 700 !important;
  text-align: left !important;
  font-size: 15px !important;
  color: #9d174d !important;
  padding-left: 15px !important;
  vertical-align: middle !important;
}

.row-owned td {
  background-color: #ecfeff !important;
}

.row-locked td {
  background-color: #f3f4f6 !important;
  cursor: not-allowed;
}

/* ============================================================
 * DARK MODE OVERRIDES
 * ============================================================ */

/* Page background */
body.dark-mode .page-container {
  background-color: transparent;
}

/* Search Card */
body.dark-mode .search-card {
  background: #1b2230 !important;
  border-color: #2b3340 !important;
  box-shadow: 0 6px 20px rgba(0,0,0,0.35) !important;
}

/* Table Card */
body.dark-mode .table-card {
  background: #1b2230 !important;
  border-color: #2b3340 !important;
  box-shadow: 0 6px 20px rgba(0,0,0,0.35) !important;
}

/* Field Label */
body.dark-mode .field-label {
  color: #8b949e !important;
}

/* Field Select */
body.dark-mode .field-select {
  background: #111d2b !important;
  border-color: #3d5570 !important;
  color: #c9d1d9 !important;
}

body.dark-mode .field-select:focus {
  border-color: #3c8dbc !important;
  box-shadow: 0 0 0 3px rgba(60, 141, 188, 0.2) !important;
}

/* Field Input */
body.dark-mode .field-input,
body.dark-mode .field-input-small {
  background: #111d2b !important;
  border-color: #3d5570 !important;
  color: #c9d1d9 !important;
}

body.dark-mode .field-input::placeholder,
body.dark-mode .field-input-small::placeholder {
  color: #4d6680 !important;
}

body.dark-mode .field-input:focus,
body.dark-mode .field-input-small:focus {
  border-color: #3c8dbc !important;
  box-shadow: 0 0 0 3px rgba(60, 141, 188, 0.2) !important;
}

/* Datepicker in search card — dark mode */
body.dark-mode .search-card .mx-input {
  background: #111d2b !important;
  border-color: #3d5570 !important;
  color: #c9d1d9 !important;
}
body.dark-mode .search-card .mx-input:focus {
  border-color: #3c8dbc !important;
  box-shadow: 0 0 0 3px rgba(60, 141, 188, 0.2) !important;
}
body.dark-mode .search-card .mx-icon-calendar,
body.dark-mode .search-card .mx-icon-clear {
  color: #4d6680 !important;
}

/* Btn Add Row */
body.dark-mode .btn-add-row {
  background: #232c3a !important;
  color: #93c5fd !important;
  border-color: #374150 !important;
}

body.dark-mode .btn-add-row:hover {
  background: #2c2f55 !important;
  border-color: #3b82f6 !important;
}

/* Btn Delete Row */
body.dark-mode .btn-delete-row {
  background: #2a1a1f !important;
  color: #fca5a5 !important;
  border-color: #5a2a30 !important;
}

body.dark-mode .btn-delete-row:hover {
  background: #3a1f25 !important;
  border-color: #ef4444 !important;
}

/* Btn Export (Excel) */
body.dark-mode .btn-export {
  background: #18271d !important;
  color: #6ee7a0 !important;
  border-color: #2c4a35 !important;
}

body.dark-mode .btn-export:hover {
  background: #1f3326 !important;
  border-color: #22c55e !important;
}

/* Row count chip */
body.dark-mode .row-count-chip {
  background: #232c3a !important;
  color: #93c5fd !important;
  border-color: #374150 !important;
}

/* Last saved label */
body.dark-mode .last-saved {
  color: #6ee7a0 !important;
}

/* Custom Dropdown Menu */
body.dark-mode .custom-dropdown-menu {
  background: #1e2a3a !important;
  border-color: #2d4057 !important;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
}

body.dark-mode .custom-dropdown-menu li a {
  color: #c9d1d9 !important;
}

body.dark-mode .custom-dropdown-menu li a:hover {
  background-color: #2d4057 !important;
  color: #7dd3fc !important;
}

/* Auto Save Toggle */
body.dark-mode .auto-save-toggle {
  background: #1a2d40 !important;
  border-color: #2d4057 !important;
}

body.dark-mode .auto-save-toggle.is-active {
  background: #162d22 !important;
  border-color: #10b981 !important;
}

body.dark-mode .auto-save-label {
  color: #8b949e !important;
}

body.dark-mode .auto-save-toggle.is-active .auto-save-label {
  color: #10b981 !important;
}

body.dark-mode .saving-indicator {
  color: #8b949e !important;
}

/* Row states — Handsontable */
body.dark-mode .row-owned td {
  background-color: #1a3340 !important;
}

body.dark-mode .row-locked td {
  background-color: #1a1f28 !important;
}
</style>

<style>
.htDropdownMenu, 
.htContextMenu {
  max-height: 60vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

.htDimmed.update-program-row,
.update-program-row {
  background-color: #fde2e4 !important;
  color: #9d174d !important;
  font-weight: 700 !important;
  font-size: 15px !important;
}

/* No-edit cursor for readOnly cells */
.cell-no-edit {
  cursor: not-allowed !important;
}

/* ============================================================
 * GOOGLE SHEETS LOOK — Handsontable ht-theme-main (light)
 * ============================================================ */
.ht-theme-main {
  --ht-font-size: 13px;
  --ht-line-height: 20px;
  --ht-foreground-color: #202124;
  --ht-background-color: #ffffff;
  --ht-accent-color: #2563eb;

  /* gridlines */
  --ht-cell-horizontal-border-color: #e1e3e6;
  --ht-cell-vertical-border-color: #e1e3e6;
  --ht-wrapper-border-color: #c4c7c5;

  /* selection */
  --ht-cell-selection-border-color: #2563eb;
  --ht-cell-selection-background-color: rgba(37, 99, 235, 0.08);
  --ht-cell-editor-border-width: 2px;
  --ht-cell-editor-border-color: #2563eb;

  /* column headers */
  --ht-header-background-color: #f8f9fa;
  --ht-header-foreground-color: #5f6368;
  --ht-header-font-weight: 500;
  --ht-header-highlighted-background-color: #dbeafe;
  --ht-header-highlighted-foreground-color: #1d4ed8;
  --ht-header-active-background-color: #2563eb;
  --ht-header-active-foreground-color: #ffffff;
  --ht-header-active-border-color: #2563eb;

  /* row headers */
  --ht-header-row-background-color: #f8f9fa;
  --ht-header-row-foreground-color: #5f6368;
  --ht-header-row-highlighted-background-color: #dbeafe;
  --ht-header-row-highlighted-foreground-color: #1d4ed8;
  --ht-header-row-active-background-color: #2563eb;
  --ht-header-row-active-foreground-color: #ffffff;
}

/* Modern light header — off-white, dark-gray text, hairline border.
   Color (blue) appears only on the active/hovered column. */
.ht-theme-main .ht_clone_top th,
.ht-theme-main .ht_clone_top_inline_start_corner th,
.ht-theme-main .ht_clone_top_left_corner th {
  background: #f9fafb !important;
  color: #3c4043 !important;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-color: #e5e7eb !important;
  border-bottom: 1px solid #d0d7de !important;
  transition: background 0.15s ease;
}

.ht-theme-main .ht_clone_top th:hover {
  background: #eef1f5 !important;
}

/* Soft shadow under the column-header row for depth when scrolling */
.ht-theme-main .ht_clone_top {
  box-shadow: 0 2px 4px -1px rgba(60, 64, 67, 0.18);
}

/* Filter dropdown button */
.ht-theme-main thead th .changeType {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0 !important;
  line-height: 1 !important;
  background: #ffffff !important;
  border: 1px solid #d0d7de !important;
  color: #5f6368 !important;
  border-radius: 4px;
  opacity: 1;
  box-shadow: 0 1px 1px rgba(15, 23, 42, 0.06);
  transition: all 0.15s ease;
}

/* Center the arrow glyph (pseudo / svg / inner element) inside the button */
.ht-theme-main thead th .changeType::before,
.ht-theme-main thead th .changeType::after,
.ht-theme-main thead th .changeType > * {
  position: static !important;
  margin: 0 !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}

.ht-theme-main thead th .changeType:hover {
  background: #2563eb !important;
  border-color: #2563eb !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(8, 35, 80, 0.38);
  transform: translateY(-1px);
}

.ht-theme-main thead th .changeType:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(8, 35, 80, 0.25);
}

/* Keep the arrow visible on the highlighted / open column (white bg, blue arrow) */
.ht-theme-main thead th.ht__highlight .changeType {
  background: #ffffff !important;
  color: #2563eb !important;
  border-color: rgba(8, 35, 80, 0.08) !important;
}

.ht-theme-main thead th.ht__highlight .changeType::before,
.ht-theme-main thead th.ht__highlight .changeType::after,
.ht-theme-main thead th.ht__highlight .changeType svg,
.ht-theme-main thead th.ht__highlight .changeType i {
  color: #2563eb !important;
  fill: #2563eb !important;
}

/* Force a compact header that matches columnHeaderHeight — both themes */
.ht-theme-main thead th,
.ht-theme-main-dark thead th {
  height: 36px !important;
  line-height: 1.1 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  vertical-align: middle !important;
}

.ht-theme-main thead th .relative,
.ht-theme-main-dark thead th .relative {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* Row headers — light, with the row number centered */
.ht-theme-main .ht_clone_inline_start th,
.ht-theme-main .ht_clone_left th {
  background-color: #f8f9fa !important;
  color: #5f6368 !important;
  font-weight: 500;
  font-size: 12px;
  border-color: #e1e3e6 !important;
  text-align: center !important;
}

.ht-theme-main .ht_clone_inline_start th .relative,
.ht-theme-main .ht_clone_left th .relative {
  text-align: center !important;
}

/* Compact rows + editable cells are clean white */
.ht-theme-main td {
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}

/* Row hover highlight — soft indigo tint. Cells with their own color
   (status, prod_date, FIX/SQL) keep it via inline !important; the pink
   Update Program row is excluded. */
.ht-theme-main tbody tr:hover > td:not(.update-program-row) {
  background-color: #f1f5f9 !important;
}

/* Frozen-column edge — subtle Google Sheets divider shadow */
.ht-theme-main .ht_clone_inline_start,
.ht-theme-main .ht_clone_left,
.ht-theme-main .ht_clone_top_inline_start_corner,
.ht-theme-main .ht_clone_top_left_corner {
  box-shadow: 2px 0 5px -2px rgba(60, 64, 67, 0.28);
}

/* Highlighted header — column/row of the active cell turns Google blue-tint */
.ht-theme-main .ht_clone_top th.ht__highlight,
.ht-theme-main .ht_clone_inline_start th.ht__highlight,
.ht-theme-main .ht_clone_left th.ht__highlight,
.ht-theme-main th.ht__highlight {
  background: #eff4ff !important;
  color: #1d4ed8 !important;
  font-weight: 700;
  border-bottom: 2px solid #2563eb !important;
}

/* Google-blue selection outline (covers builds that paint inline border divs) */
.ht-theme-main .wtBorder.current,
.ht-theme-main .wtBorder.area,
.ht-theme-main .wtBorder.fill {
  background-color: #2563eb !important;
}

/* ============================================================
 * INDIGO DARK THEME — Handsontable ht-theme-main-dark
 * ============================================================ */
.ht-theme-main-dark {
  --ht-font-size: 13px;
  --ht-foreground-color: #c7cad6;
  --ht-background-color: #1a2130;
  --ht-accent-color: #3b82f6;
  --ht-cell-horizontal-border-color: #2b3340;
  --ht-cell-vertical-border-color: #2b3340;
  --ht-wrapper-border-color: #2b3340;
  --ht-cell-selection-border-color: #3b82f6;
  --ht-cell-selection-background-color: rgba(99, 102, 241, 0.18);
  --ht-cell-editor-border-color: #3b82f6;
  --ht-header-background-color: #2a3140;
  --ht-header-foreground-color: #cbd5e1;
  --ht-header-highlighted-background-color: #1e40af;
  --ht-header-highlighted-foreground-color: #dbeafe;
  --ht-header-active-background-color: #2563eb;
  --ht-header-active-foreground-color: #ffffff;
  --ht-header-row-background-color: #2a3140;
  --ht-header-row-foreground-color: #cbd5e1;
}

/* Column & corner headers — indigo gradient */
.ht-theme-main-dark .ht_clone_top th,
.ht-theme-main-dark .ht_clone_top_inline_start_corner th,
.ht-theme-main-dark .ht_clone_top_left_corner th {
  background: linear-gradient(180deg, #374150 0%, #232c3a 100%) !important;
  color: #cbd5e1 !important;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-color: rgba(255, 255, 255, 0.08) !important;
  border-bottom: 2px solid #2563eb !important;
}

/* Row headers */
.ht-theme-main-dark .ht_clone_inline_start th,
.ht-theme-main-dark .ht_clone_left th {
  background: #2a3140 !important;
  color: #94a3b8 !important;
  font-size: 12px;
  border-color: #2b3340 !important;
  text-align: center !important;
}

/* Highlighted header (column/row of active cell) */
.ht-theme-main-dark .ht_clone_top th.ht__highlight,
.ht-theme-main-dark .ht_clone_inline_start th.ht__highlight,
.ht-theme-main-dark .ht_clone_left th.ht__highlight,
.ht-theme-main-dark th.ht__highlight {
  background: #1e40af !important;
  color: #dbeafe !important;
  font-weight: 600;
}

/* Cells — soft slate, not pure black */
.ht-theme-main-dark td {
  background-color: #1a2130;
}

/* Row hover */
.ht-theme-main-dark tbody tr:hover > td:not(.update-program-row) {
  background-color: #273140 !important;
}

/* Selection outline */
.ht-theme-main-dark .wtBorder.current,
.ht-theme-main-dark .wtBorder.area,
.ht-theme-main-dark .wtBorder.fill {
  background-color: #3b82f6 !important;
}

/* Frozen-column edge shadow */
.ht-theme-main-dark .ht_clone_inline_start,
.ht-theme-main-dark .ht_clone_left,
.ht-theme-main-dark .ht_clone_top_inline_start_corner,
.ht-theme-main-dark .ht_clone_top_left_corner {
  box-shadow: 2px 0 6px -2px rgba(0, 0, 0, 0.5);
}

/* Filter dropdown button — light glass on indigo header */
.ht-theme-main-dark thead th .changeType {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0 !important;
  line-height: 1 !important;
  background: rgba(255, 255, 255, 0.14) !important;
  border: 1px solid rgba(255, 255, 255, 0.22) !important;
  color: #dbeafe !important;
  border-radius: 4px;
  box-shadow: none;
  transition: all 0.15s ease;
}

.ht-theme-main-dark thead th .changeType:hover {
  background: #2563eb !important;
  border-color: #2563eb !important;
  color: #ffffff !important;
}

/* Update Program row — muted maroon instead of bright pink */
body.dark-mode .handsontable td.update-program-row,
.ht-theme-main-dark .update-program-row {
  background-color: #3a2233 !important;
  color: #f5a9cf !important;
}

/* Fix: filter by value checkbox text color for dark themes */
.ht-theme-main-dark .htFiltersMenuValue .htUIMultipleSelectHot td,
.ht-theme-horizon-dark .htFiltersMenuValue .htUIMultipleSelectHot td,
.ht-theme-classic-dark .htFiltersMenuValue .htUIMultipleSelectHot td,
.ht-theme-main-dark .htFiltersMenuValue .htUIMultipleSelectHot .htCheckboxRendererLabel,
.ht-theme-horizon-dark .htFiltersMenuValue .htUIMultipleSelectHot .htCheckboxRendererLabel,
.ht-theme-classic-dark .htFiltersMenuValue .htUIMultipleSelectHot .htCheckboxRendererLabel {
  color: var(--ht-foreground-color, #fff) !important;
}

.ht-theme-main-dark .htFiltersMenuValue .htUIMultipleSelectHot .htCheckboxRendererInput::before,
.ht-theme-horizon-dark .htFiltersMenuValue .htUIMultipleSelectHot .htCheckboxRendererInput::before,
.ht-theme-classic-dark .htFiltersMenuValue .htUIMultipleSelectHot .htCheckboxRendererInput::before {
  border-color: var(--ht-foreground-color, #fff) !important;
}

/* Lock Badge — field-level lock indicator */
.lock-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #2563eb;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  pointer-events: auto;
  cursor: default;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Cell locked by another user */
.cell-locked {
  background-color: #f9fafb !important;
  cursor: not-allowed !important;
}

/* Cell with lock border — uses CSS variable for dynamic color */
.cell-lock-border {
  position: relative;
  overflow: visible;
  border: 2px solid var(--lock-color, #2563eb) !important;
}

/* Dark mode overrides */
body.dark-mode .lock-badge {
  background-color: #60a5fa;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

body.dark-mode .cell-locked {
  background-color: #1f2937 !important;
}

</style>
