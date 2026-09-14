<template>
  <div>
    <modal ref="centerModal" sheet-class="ct-sheet">
      <template #header>
        <div class="emp-modal-header">
          <div class="emp-modal-header-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="emp-modal-header-text">
            <h4>{{ui.erp_emp_list||'รายชื่อพนักงาน'}}</h4>
            <small>เลือกพนักงานโดยดับเบิลคลิกที่รายการ</small>
          </div>
        </div>
      </template>
      <template #body>
        <div class="emp-search-section">
          <div class="emp-search-row">
            <div class="emp-search-input-wrap">
              <i class="fa fa-search emp-search-icon"></i>
              <input type="text"
                     class="form-control input-sm emp-search-input"
                     placeholder="ค้นหาชื่อ, รหัส, ชื่อเล่น..."
                     v-model.trim="retrieveSearch['search_text']"
                     @keyup.enter="onSearch" />
              <button class="btn btn-sm emp-search-btn" @click="onSearch">
                <i class="fa fa-search"></i> {{ ui.search || 'ค้นหา' }}
              </button>
            </div>
            <div class="emp-checkbox-wrap" v-if="!isHideCheckbox">
              <label class="emp-toggle-label">
                <input type="checkbox" class="emp-toggle-input" v-model="showAll" @change="onSearch" />
                <span class="emp-toggle-slider"></span>
                <span class="emp-toggle-text">แสดงพนักงานทั้งหมด</span>
              </label>
            </div>
            <div class="emp-view-toggle">
              <button type="button" class="emp-view-btn" :class="{'emp-view-btn--active': viewMode === 'table'}" @click="viewMode = 'table'" title="Table View">
                <i class="fas fa-th-list"></i>
              </button>
              <button type="button" class="emp-view-btn" :class="{'emp-view-btn--active': viewMode === 'card'}" @click="viewMode = 'card'" title="Card View">
                <i class="fas fa-th-large"></i>
              </button>
            </div>
          </div>
          <div class="emp-result-count" v-if="respData.length > 0">
            <i class="fas fa-list-ul"></i> {{ ui.csm_remain_show || 'แสดง' }} <strong>{{respData.length}}</strong> {{ ui.csm_remain_unit_item || 'รายการ' }}
          </div>
        </div>
        <div class="emp-table-wrap" v-show="viewMode === 'table'">
          <ag-table ref="agr"
                    :footer="false"
                    :scale="420"
                    @ready="initTable()"
                    @cell-clicked="pickOnNarrow($event.data)"
                    @double-cell-clicked="sendData($event.data)"></ag-table>
        </div>
        <div class="emp-card-grid" v-show="viewMode === 'card'">
          <div class="emp-card" v-for="(x, i) in respData" :key="x.empcode + '-' + i" @click="pickOnNarrow(x)" @dblclick="sendData(x)">
            <div class="emp-avatar"><i class="fas fa-user"></i></div>
            <div class="emp-card-body">
              <div class="emp-card-name">{{x.empfullname}}</div>
              <div class="emp-card-sub">
                <span class="emp-code-badge">{{x.empcode}}</span>
                <span v-if="x.posname_t" class="emp-card-pos">{{x.posname_t}}</span>
              </div>
            </div>
          </div>
          <div v-if="respData.length === 0" class="emp-empty">
            <i class="fas fa-inbox"></i>
            <p>ไม่พบข้อมูลพนักงาน</p>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="emp-footer">
          <div class="emp-footer-paging pull-left">
            <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
          </div>
          <button type="button" class="btn btn-sm emp-close-btn" @click="closeModal()">
            <i class="fa fa-times"></i> {{ ui.csm_v2_close_window || 'ปิดหน้าต่าง' }}
          </button>
        </div>
      </template>
    </modal>
  </div>
</template>

<script type="text/javascript">
  let paging = {}
  export default {
    props: {
      defaultShowAll: {
        type: Boolean,
        default: false
      },
      hideCheckbox: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui,
        retrieveSearch: {
          search_text: '',
        },
        showAll: false,
        isHideCheckbox: false,
        respData: [],
        viewMode: 'table',
        isSending: false,
      }
    },
    methods: {
      async openModal(options) {
        let opts = options || {}
        this.isSending = false
        this.retrieveSearch.search_text = ''
        this.showAll = opts.hideCheckbox ? false : this.defaultShowAll
        this.isHideCheckbox = opts.hideCheckbox || this.hideCheckbox
        this.$refs.centerModal.openModal()
        await this.loadData()
      },
      closeModal() {
        this.$refs.centerModal.closeModal()
      },
      async pageChange(pn) {
        paging.setCurrentPage(pn)
        await this.loadData()
      },
      onSearch() {
        paging.setCurrentPage(1)
        this.loadData()
      },
      async loadData() {
        let all = this.showAll ? 'N' : ''
        let url = `CSM/Center/Employee_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}&all=${all}`
        for (var key in this.retrieveSearch) {
          url += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`
        }

        let resp = await $xt.getServer(url)
        this.respData = resp.data.data_rows

        paging.setTotalItems(resp.data.total)
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1)
        }
        paging.createPagesArray()

        await this.$nextTick()
        await this.initTable()
        this.$refs.agr.setDisplay(this.respData)
      },
      pickOnNarrow(x) {
        if (!window.matchMedia('(max-width: 939px)').matches) return
        this.sendData(x)
      },
      sendData(x) {
        if (this.isSending) return
        this.isSending = true
        this.$emit('send-data', x)
        this.closeModal()
      },
      initTable() {
        let agr = this.$refs.agr
        if (!agr) return

        let fields = [
          ['empcode', this.ui.erp_employee_code || 'Employee Code', 'text', {
            width: 220, align: 'center', sortable: true, pinned: 'left',
            cellRenderer: (params) => {
              let badge = document.createElement('span')
              badge.style.cssText = 'display:inline-block; background:#eceff1; color:#37474f; font-weight:600; font-size:12px; padding:3px 10px; border-radius:6px; font-family:\'Courier New\', monospace;'
              badge.textContent = params.value || ''
              return badge
            }
          }],
          ['empfullname', this.ui.erp_employee_name || 'Employee Name', 'text', {
            width: 400, sortable: true,
            cellRenderer: (params) => {
              let wrapper = document.createElement('div')
              wrapper.style.cssText = 'display:flex; align-items:center; gap:10px;'

              let avatar = document.createElement('div')
              avatar.style.cssText = 'width:26px; height:26px; font-size:11px; border-radius:50%; background:linear-gradient(135deg, #e3f2fd, #bbdefb); display:flex; align-items:center; justify-content:center; color:#1976d2; flex-shrink:0;'
              avatar.innerHTML = '<i class="fas fa-user"></i>'
              wrapper.appendChild(avatar)

              let name = document.createElement('span')
              name.textContent = params.value || ''
              wrapper.appendChild(name)

              return wrapper
            }
          }],
          ['posname_t', 'Job Position', 'text', { width: 400, sortable: true }],
        ]

        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)
      },
    },
    mounted() {
      paging = this.$refs.paging
      paging.setCurrentPage(1)
      paging.setItemsPerPage(500)

      this.$refs.centerModal.setSize('modal-lg-2')
    }
  }
</script>

<style scoped>
/* ─── Modal Header ─────────────────────────── */
.emp-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.emp-modal-header-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1976d2, #0d47a1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  box-shadow: 0 3px 8px rgba(25, 118, 210, 0.3);
}
.emp-modal-header-text h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #ffffffff;
}
.emp-modal-header-text small {
  font-size: 11px;
  color: #7f8c8d;
  font-weight: 400;
}

/* ─── Search Section ───────────────────────── */
.emp-search-section {
  background: #f8fafc;
  border: 1px solid #e8ecf0;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.emp-search-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.emp-search-input-wrap {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 240px;
  position: relative;
  background: #fff;
  border: 1px solid #dce1e6;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.emp-search-input-wrap:focus-within {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}
.emp-search-icon {
  padding: 0 10px 0 12px;
  color: #95a5a6;
  font-size: 13px;
}
.emp-search-input {
  border: none !important;
  box-shadow: none !important;
  height: 34px;
  font-size: 13px;
  flex: 1;
  padding-left: 0;
}
.emp-search-input:focus {
  outline: none;
}
.emp-search-btn {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  color: #fff;
  border: none;
  border-radius: 0 6px 6px 0;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.emp-search-btn:hover {
  background: linear-gradient(135deg, #1565c0, #0d47a1);
  color: #fff;
}

/* ─── Toggle Switch ────────────────────────── */
.emp-checkbox-wrap {
  flex-shrink: 0;
}
.emp-toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin: 0;
  user-select: none;
}
.emp-toggle-input {
  display: none;
}
.emp-toggle-slider {
  position: relative;
  width: 40px;
  height: 22px;
  background: #cfd8dc;
  border-radius: 12px;
  transition: background 0.3s;
  flex-shrink: 0;
}
.emp-toggle-slider::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.emp-toggle-input:checked + .emp-toggle-slider {
  background: linear-gradient(135deg, #43a047, #2e7d32);
}
.emp-toggle-input:checked + .emp-toggle-slider::after {
  transform: translateX(18px);
}
.emp-toggle-text {
  font-size: 13px;
  font-weight: 500;
  color: #455a64;
}

/* ─── View Mode Toggle ─────────────────────── */
.emp-view-toggle {
  display: flex;
  align-items: center;
  background: #eceff1;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
  flex-shrink: 0;
}
.emp-view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 26px;
  font-size: 12px;
  color: #6b7a90;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.emp-view-btn:hover {
  color: #1976d2;
  background: rgba(255,255,255,.5);
}
.emp-view-btn--active {
  color: #1976d2;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}

/* ─── Result Count ─────────────────────────── */
.emp-result-count {
  margin-top: 10px;
  font-size: 12px;
  color: #7f8c8d;
}
.emp-result-count i {
  margin-right: 4px;
}

/* ─── Table ────────────────────────────────── */
.emp-table-wrap {
  border: 1px solid #e8ecf0;
  border-radius: 10px;
  overflow: hidden;
}

.emp-code-badge {
  display: inline-block;
  background: #eceff1;
  color: #37474f;
  font-weight: 600;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
}

.emp-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;
  font-size: 12px;
  flex-shrink: 0;
}

/* ─── Card Grid ────────────────────────────── */
.emp-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px;
  padding: 2px 0;
  max-height: calc(100vh - 440px);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #d0d5dd transparent;
}
.emp-card-grid::-webkit-scrollbar {
  width: 5px;
}
.emp-card-grid::-webkit-scrollbar-thumb {
  background: #d0d5dd;
  border-radius: 3px;
}
.emp-card-grid::-webkit-scrollbar-track {
  background: transparent;
}
.emp-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #edf0f5;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(.4,0,.2,1);
}
.emp-card:hover {
  border-color: #90caf9;
  background: #e3f2fd;
  box-shadow: 0 2px 12px rgba(25,118,210,.12);
  transform: translateY(-1px);
}
.emp-card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.emp-card-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.emp-card-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}
.emp-card-pos {
  color: #607d8b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ─── Empty State ──────────────────────────── */
.emp-empty {
  text-align: center;
  padding: 40px 20px !important;
  color: #b0bec5;
  grid-column: 1 / -1;
}
.emp-empty i {
  font-size: 36px;
  display: block;
  margin-bottom: 10px;
  opacity: 0.5;
}
.emp-empty p {
  margin: 0;
  font-size: 13px;
}

/* ─── Footer ───────────────────────────────── */
.emp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}
.emp-footer-paging {
  flex: 0 0 auto;
}
.emp-close-btn {
  background: #eceff1;
  color: #455a64;
  border: 1px solid #cfd8dc;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
}
.emp-close-btn:hover {
  background: #cfd8dc;
  color: #263238;
}
</style>
