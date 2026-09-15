<template>
  <div class="v-csm-remain">
    <re-page ref="page">
      <template #body>
        <section class="content rc-wrap">
          <!-- Filter / search bar -->
          <div class="rc-bar">
            <div class="rc-bar__head">
              <div class="rc-bar__title">
                <i class="fas fa-filter"></i>
                <span>Filter / เงื่อนไข</span>
              </div>
              <div class="rc-bar__actions">
                <button class="rc-bar__btn rc-bar__btn--ghost" @click="resetFilter()" title="ล้างตัวกรอง"><i class="fas fa-eraser"></i> ล้าง</button>
                <button class="rc-bar__btn rc-bar__btn--toggle" @click="filterOpen = !filterOpen" :title="filterOpen ? 'หุบ Filter' : 'ขยาย Filter'">
                  <i class="fas fa-chevron-down rc-bar__chevron" :class="{ open: filterOpen }"></i>
                </button>
              </div>
            </div>
            <div class="rc-bar__summary" v-if="!filterOpen && activeFilterChips.length">
              <span class="rc-fchip" v-for="(chip, i) in activeFilterChips" :key="i">
                <i :class="chip.icon"></i> {{ chip.label }}: <b>{{ chip.value }}</b>
                <i class="fas fa-times rc-fchip__rm" @click.stop="chip.clear(); loadData()"></i>
              </span>
            </div>
            <transition name="rc-filter">
            <div class="rc-cond-groups" v-show="filterOpen">
              <!-- กลุ่ม 1: ช่วงวันที่ -->
              <div class="rc-cond-group">
                <div class="rc-cond-group__label"><i class="fas fa-carlendar"></i> ช่วงวันที่</div>
                <div class="rc-cond rc-cond--4">
                  <div class="rc-cond__item">
                    <label>Req. Date</label>
                    <div style="display: flex; align-items: center;">
                      <datepicker input-class="form-control input-sm" v-model="filter.reqdt_st"></datepicker>
                      <span style="margin: 0 8px;">-</span>
                      <datepicker input-class="form-control input-sm" v-model="filter.reqdt_end"></datepicker>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>Due Date</label>
                    <div style="display: flex; align-items: center;">
                      <datepicker input-class="form-control input-sm" v-model="filter.duedt_st"></datepicker>
                      <span style="margin: 0 8px;">-</span>
                      <datepicker input-class="form-control input-sm" v-model="filter.duedt_end"></datepicker>
                    </div>
                  </div>
                </div>
              </div>
              <!-- กลุ่ม 2: ข้อมูลการกรอง -->
              <div class="rc-cond-group">
                <div class="rc-cond-group__label"><i class="fas fa-filter"></i> ข้อมูลการกรอง</div>
                <div class="rc-cond rc-cond--6">
                  <div class="rc-cond__item">
                    <label>Project</label>
                    <div class="rc-msdrop" :class="{ open: projectDropOpen }" v-click-outside="() => projectDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="projectDropOpen = !projectDropOpen">
                        <span v-if="!filter.projects.length" class="rc-msdrop__placeholder">-- ทั้งหมด --</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(p, i) in filter.projects" :key="i">{{ projectName(p) }}<i class="fas fa-times" @click.stop="filter.projects.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="projectDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="projectSearch" placeholder="ค้นหา..." @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(p, i) in filteredProjects" :key="i">
                          <input type="checkbox" :value="p.project_code" v-model="filter.projects" />
                          <span>{{ p.project_name }}</span>
                        </label>
                        <div v-if="!filteredProjects.length" class="rc-msdrop__empty">ไม่พบข้อมูล</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>Department</label>
                    <div class="rc-msdrop" :class="{ open: departmentDropOpen }" v-click-outside="() => departmentDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="departmentDropOpen = !departmentDropOpen">
                        <span v-if="!filter.departments.length" class="rc-msdrop__placeholder">-- ทั้งหมด --</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(d, i) in filter.departments" :key="i">{{ departmentName(d) }}<i class="fas fa-times" @click.stop="filter.departments.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="departmentDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="departmentSearch" placeholder="ค้นหา..." @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(d, i) in filteredDepartments" :key="i">
                          <input type="checkbox" :value="d.dpt_code" v-model="filter.departments" />
                          <span>{{ d.dpt_name }}</span>
                        </label>
                        <div v-if="!filteredDepartments.length" class="rc-msdrop__empty">ไม่พบข้อมูล</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>Customer</label>
                    <div class="rc-msdrop" :class="{ open: customerDropOpen }" v-click-outside="() => customerDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="customerDropOpen = !customerDropOpen">
                        <span v-if="!filter.customers.length" class="rc-msdrop__placeholder">-- ทั้งหมด --</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(c, i) in filter.customers" :key="i">{{ customerName(c) }}<i class="fas fa-times" @click.stop="filter.customers.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="customerDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="customerSearch" placeholder="ค้นหา..." @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(c, i) in filteredCustomers" :key="i">
                          <input type="checkbox" :value="c.customer_code" v-model="filter.customers" />
                          <span>{{ c.customer_name }}</span>
                        </label>
                        <div v-if="!filteredCustomers.length" class="rc-msdrop__empty">ไม่พบข้อมูล</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>Service Type</label>
                    <div class="rc-msdrop" :class="{ open: serviceDropOpen }" v-click-outside="() => serviceDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="serviceDropOpen = !serviceDropOpen">
                        <span v-if="!filter.services.length" class="rc-msdrop__placeholder">-- ทั้งหมด --</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(s, i) in filter.services" :key="i">{{ serviceName(s) }}<i class="fas fa-times" @click.stop="filter.services.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="serviceDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="serviceSearch" placeholder="ค้นหา..." @click.stop /></div>
                        <div v-for="(grp, gi) in filteredServicesGrouped" :key="'g'+gi">
                          <div class="rc-msdrop__group">{{ grp.serv_group_name }}</div>
                          <label class="rc-msdrop__item" v-for="(s, i) in grp.services" :key="i">
                            <input type="checkbox" :value="s.serv_code" v-model="filter.services" />
                            <span>{{ s.serv_name }}</span>
                          </label>
                        </div>
                        <div v-if="!filteredServicesGrouped.length" class="rc-msdrop__empty">ไม่พบข้อมูล</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>Job Status</label>
                    <div class="rc-msdrop" :class="{ open: statusDropOpen }" v-click-outside="() => statusDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="statusDropOpen = !statusDropOpen">
                        <span v-if="!filter.statuses.length" class="rc-msdrop__placeholder">-- ทั้งหมด --</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(s, i) in filter.statuses" :key="i">{{ s }}<i class="fas fa-times" @click.stop="filter.statuses.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="statusDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="statusSearch" placeholder="ค้นหา..." @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(name, i) in filteredStatusNames" :key="i">
                          <input type="checkbox" :value="name" v-model="filter.statuses" />
                          <span>{{ name }}</span>
                        </label>
                        <div v-if="!filteredStatusNames.length" class="rc-msdrop__empty">ไม่พบข้อมูล</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>Approve Status</label>
                    <select class="rc-select" v-model="filter.approve">
                      <option value="">-- ทั้งหมด --</option>
                      <option v-for="(a, i) in approveStatuses" :key="i" :value="a.value">{{ a.label }}</option>
                    </select>
                  </div>
                </div>
              </div>
              <!-- กลุ่ม 3: ข้อมูลผู้เกี่ยวข้อง -->
              <div class="rc-cond-group">
                <div class="rc-cond-group__label"><i class="fas fa-user-tie"></i> ข้อมูลผู้เกี่ยวข้อง</div>
                <div class="rc-cond rc-cond--5">
                  <div class="rc-cond__item" :class="{ 'rc-cond__item--disabled': filter.teamRequesters.length }">
                    <label>Requester By</label>
                    <div class="rc-msdrop" :class="{ open: requesterDropOpen, disabled: filter.teamRequesters.length }" v-click-outside="() => requesterDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="!filter.teamRequesters.length && (requesterDropOpen = !requesterDropOpen)">
                        <span v-if="filter.teamRequesters.length" class="rc-msdrop__placeholder">-- ใช้ Teams Requester --</span>
                        <span v-else-if="!filter.requesters.length" class="rc-msdrop__placeholder">-- ทั้งหมด --</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(r, i) in filter.requesters" :key="i">{{ requesterName(r) }}<i class="fas fa-times" @click.stop="filter.requesters.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="requesterDropOpen && !filter.teamRequesters.length">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="requesterSearch" placeholder="ค้นหา..." @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(r, i) in filteredRequesters" :key="i">
                          <input type="checkbox" :value="r.empno" v-model="filter.requesters" />
                          <span>{{ r.name }}</span>
                        </label>
                        <div v-if="!filteredRequesters.length" class="rc-msdrop__empty">ไม่พบข้อมูล</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>Team Requester</label>
                    <div class="rc-msdrop" :class="{ open: teamRequesterDropOpen }" v-click-outside="() => teamRequesterDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="teamRequesterDropOpen = !teamRequesterDropOpen">
                        <span v-if="!filter.teamRequesters.length" class="rc-msdrop__placeholder">-- ทั้งหมด --</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(t, i) in filter.teamRequesters" :key="i">{{ teamRequesterName(t) }}<i class="fas fa-times" @click.stop="filter.teamRequesters.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="teamRequesterDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="teamRequesterSearch" placeholder="ค้นหา..." @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(t, i) in filteredTeamRequesters" :key="i">
                          <input type="checkbox" :value="t.team_code" v-model="filter.teamRequesters" />
                          <span>{{ t.team_name }}</span>
                        </label>
                        <div v-if="!filteredTeamRequesters.length" class="rc-msdrop__empty">ไม่พบข้อมูล</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item" :class="{ 'rc-cond__item--disabled': filter.teamWorkers.length }">
                    <label>Worker</label>
                    <div class="rc-msdrop" :class="{ open: workerDropOpen, disabled: filter.teamWorkers.length }" v-click-outside="() => workerDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="!filter.teamWorkers.length && (workerDropOpen = !workerDropOpen)">
                        <span v-if="filter.teamWorkers.length" class="rc-msdrop__placeholder">-- ใช้ Teams Worker --</span>
                        <span v-else-if="!filter.workers.length" class="rc-msdrop__placeholder">-- ทั้งหมด --</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(w, i) in filter.workers" :key="i">{{ workerName(w) }}<i class="fas fa-times" @click.stop="filter.workers.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="workerDropOpen && !filter.teamWorkers.length">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="workerSearch" placeholder="ค้นหา..." @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(w, i) in filteredWorkers" :key="i">
                          <input type="checkbox" :value="w.empno" v-model="filter.workers" />
                          <span>{{ w.name }}</span>
                        </label>
                        <div v-if="!filteredWorkers.length" class="rc-msdrop__empty">ไม่พบข้อมูล</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>Team Worker</label>
                    <div class="rc-msdrop" :class="{ open: teamWorkerDropOpen }" v-click-outside="() => teamWorkerDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="teamWorkerDropOpen = !teamWorkerDropOpen">
                        <span v-if="!filter.teamWorkers.length" class="rc-msdrop__placeholder">-- ทั้งหมด --</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(t, i) in filter.teamWorkers" :key="i">{{ teamWorkerName(t) }}<i class="fas fa-times" @click.stop="filter.teamWorkers.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="teamWorkerDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="teamWorkerSearch" placeholder="ค้นหา..." @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(t, i) in filteredTeamWorkers" :key="i">
                          <input type="checkbox" :value="t.team_code" v-model="filter.teamWorkers" />
                          <span>{{ t.team_name }}</span>
                        </label>
                        <div v-if="!filteredTeamWorkers.length" class="rc-msdrop__empty">ไม่พบข้อมูล</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>{{ is_mango ? 'Tester' : 'Checker' }}</label>
                    <div class="rc-msdrop" :class="{ open: testerQcDropOpen }" v-click-outside="() => testerQcDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="testerQcDropOpen = !testerQcDropOpen">
                        <span v-if="!filter.testerQcs.length" class="rc-msdrop__placeholder">-- ทั้งหมด --</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(t, i) in filter.testerQcs" :key="i">{{ testerQcName(t) }}<i class="fas fa-times" @click.stop="filter.testerQcs.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="testerQcDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="testerQcSearch" placeholder="ค้นหา..." @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(t, i) in filteredTesterQcs" :key="i">
                          <input type="checkbox" :value="t.empno" v-model="filter.testerQcs" />
                          <span>{{ t.name }}</span>
                        </label>
                        <div v-if="!filteredTesterQcs.length" class="rc-msdrop__empty">ไม่พบข้อมูล</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="rc-cond-foot" style="display:flex; justify-content:flex-end; margin-top:4px;">
                <button class="rc-bar__btn" @click="loadData()"><i class="fas fa-search"></i> เรียกข้อมูล</button>
              </div>
            </div>
            </transition>
          </div>

          <!-- Stat strip -->
          <div class="rc-cond rc-cond--3" style="margin-bottom:12px" v-if="queried">
            <div class="rc-stat rc-stat--danger">
              <div class="rc-stat__icon"><i class="fas fa-tasks"></i></div>
              <div class="rc-stat__body">
                <span class="rc-stat__label">งานคงค้างทั้งหมด</span>
                <span class="rc-stat__value">{{summary.task_total || 0}}<small>รายการ</small></span>
              </div>
            </div>
            <div class="rc-stat rc-stat--warn">
              <div class="rc-stat__icon"><i class="fas fa-exclamation-circle"></i></div>
              <div class="rc-stat__body">
                <span class="rc-stat__label">งานเกิน Due Date</span>
                <span class="rc-stat__value">{{overdueCount}}<small>รายการ ({{overduePercent}}%)</small></span>
              </div>
            </div>
            <div class="rc-stat rc-stat--soft">
              <div class="rc-stat__icon"><i class="fas fa-chart-bar"></i></div>
              <div class="rc-stat__body">
                <span class="rc-stat__label">งานที่รออนุมัติ</span>
                <span class="rc-stat__value">{{waitApproveCount}}<small>งาน</small></span>
              </div>
            </div>
          </div>

          <!-- Report by Requester -->
          <div class="rc-panel" v-if="queried">
            <div class="rc-panel__head">
              <h2 class="rc-panel__title"><i class="fas fa-user"></i> รายงานตาม Requester</h2>
              <button class="rc-ftr-btn rc-ftr-btn--excel rc-dt-excel" @click="exportReportExcel()"><i class="fas fa-file-excel"></i> Excel</button>
            </div>
            <div class="rc-table ag-grid-bordered">
              <ag-table 
                ref="agrReport" 
                :scale="400" 
                :footer="true" 
                @ready="initTable('report')"
                @cell-clicked="onReportCellClicked($event)">
              </ag-table>
            </div>
          </div>

          <!-- Drill-down: รายละเอียดงานของ Requester (แสดงต่อลงมาจากตารางด้านบน) -->
          <div class="rc-panel rc-detail" v-show="detailOpen" ref="detailPanel">
            <div class="rc-panel__head">
              <h2 class="rc-panel__title">
                <i class="fas fa-user"></i> รายละเอียดงานของ : {{ detailReqName || '-' }}
                <span class="rc-pill rc-detail__count">{{ detailRows.length }} รายการ</span>
              </h2>
              <button class="rc-bar__btn rc-bar__btn--ghost" @click="closeDetail()"><i class="fas fa-times"></i> ปิด</button>
            </div>
            <div class="rc-detail__body">
              <div class="modal-search-card">
                <div class="rc-toolbar">
                  <div class="rc-field">
                    <label>Search By</label>
                    <select class="form-control input-sm" v-model="detailSearch.field" @change="detailSearch.text = ''; searchDetail()">
                      <option v-for="(item, index) in detailFields" :key="index" :value="item.key">{{ item.name }}</option>
                    </select>
                  </div>
                  <div class="rc-field rc-field--grow">
                    <label>Search</label>
                    <template v-if="detailSearch.field === 'due_date' || detailSearch.field === 'response_date'">
                      <datepicker input-class="form-control input-sm" v-model="detailSearch.text" @change="searchDetail()" placeholder="Select Date"></datepicker>
                    </template>
                    <div v-else class="input-group">
                      <input type="text" class="form-control input-sm" v-model.trim="detailSearch.text" @keyup.enter="searchDetail()"/>
                      <span class="input-group-btn"><button class="rc-btn-search" @click.prevent="searchDetail()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14" fill="currentColor"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg></button></span>
                    </div>
                  </div>
                  <div class="rc-field rc-count">
                    <label>&nbsp;</label>
                    <span class="rc-pill">{{ filteredDetailRows.length }} รายการ</span>
                  </div>
                  <div class="rc-field rc-dt-action">
                    <label>&nbsp;</label>
                    <button class="rc-ftr-btn rc-ftr-btn--excel rc-dt-excel" @click="exportDetailExcel()"><i class="fas fa-file-excel"></i> Excel</button>
                  </div>
                </div>
              </div>
              <div class="rc-table ag-grid-bordered rc-dt-grid">
                <ag-table ref="agr"
                  :footer="false"
                  @ready="initTable('detail')"
                  @cell-clicked="onDetailCellClicked($event)">
                </ag-table>
              </div>
              <div class="detail-paging-left rc-dt-foot">
                <pagination-2 ref="detailPaging" @page-change="detailPageChange($event.page)"></pagination-2>
              </div>
            </div>
          </div>

        </section>
      </template>
    </re-page>

  </div>
</template>

<script type="text/javascript">
    import { mapState, mapGetters } from '~/stores/helpers'
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let cpn = {
    data() {
      let _now = new Date();
      let _pad = n => (n < 10 ? '0' + n : '' + n);
      let _ym = _now.getFullYear() + '-' + _pad(_now.getMonth() + 1) + '-';
      return {
        auth: window.auth,
        xt: $xt,
        baseUrl,
        ui: window.ui,
        reportRows: [],
        reportColumns: [],
        reportGrand: {},
        reportSummary: {},
        detailReqName: "",
        detailRows: [],
        detailOpen: false,
        detailPage: 1,
        detailPerPage: 20,
        detailSearch: { field: "job_no", text: "" },
        customersList: [],
        projectsList: [],
        departmentsList: [],
        statusesList: [],
        services: [],
        workers: [],
        requesters: [],
        teamWorkersList: [],
        teamRequestersList: [],
        testerQcList: [],
        approveStatusList: [],
        statusList: [],
        filter: {
          text: "",
          reqdt_st: _ym + '01',
          reqdt_end: _ym + _pad(_now.getDate()),
          duedt_st: "",
          duedt_end: "",
          year: "",
          groups: [],
          projects: [],
          departments: [],
          customers: [],
          services: [],
          statuses: [],
          priorities: [],
          over_due: "",
          approve: "",
          sort: "qty_desc",
          workers: [],
          requesters: [],
          teamWorkers: [],
          teamRequesters: [],
          testerQcs: [],
        },
        filterOpen: true,
        queried: false,
        workerDropOpen: false,
        requesterDropOpen: false,
        teamWorkerDropOpen: false,
        teamRequesterDropOpen: false,
        testerQcDropOpen: false,
        projectDropOpen: false,
        departmentDropOpen: false,
        customerDropOpen: false,
        serviceDropOpen: false,
        statusDropOpen: false,
        workerSearch: "",
        requesterSearch: "",
        teamWorkerSearch: "",
        teamRequesterSearch: "",
        testerQcSearch: "",
        projectSearch: "",
        departmentSearch: "",
        customerSearch: "",
        serviceSearch: "",
        statusSearch: "",
      };
    },
    directives: {
      clickOutside: {
        bind(el, binding) {
          el._clickOutsideHandler = (e) => { if (!el.contains(e.target)) binding.value(e); };
          document.addEventListener("click", el._clickOutsideHandler);
        },
        unbind(el) { document.removeEventListener("click", el._clickOutsideHandler); }
      }
    },
    methods: {
      async loadFilterOptions() {
        let rsp = await $xt.getServer(`csm/report/FilterOptions`);
        let statusList = rsp.statusList || [];
        this.statusList = statusList;
        this.customersList = rsp.customers || [];
        this.projectsList = rsp.projects || [];
        this.departmentsList = rsp.departments || [];
        this.statusesList = rsp.statuses || [];
        this.services = rsp.services || [];
        this.workers = rsp.workers || [];
        this.requesters = rsp.requesters || [];
        this.teamWorkersList = (rsp.team_wo || []).map(t => ({ team_code: t.code_tm, team_name: t.name_tm }));
        this.teamRequestersList = (rsp.team_req || []).map(t => ({ team_code: t.code_tm, team_name: t.name_tm }));
        this.testerQcList = rsp.tester_qc || [];
        this.approveStatusList = rsp.approve_status || [];
      },
      buildFilterParams() {
        let f = this.filter;
        let fmtDate = (v) => v ? $xt.formatDate(v, "YYYY-MM-DD") : "";
        return [
          `reqdt_st=${encodeURIComponent(fmtDate(f.reqdt_st))}`,
          `reqdt_end=${encodeURIComponent(fmtDate(f.reqdt_end))}`,
          `duedt_st=${encodeURIComponent(fmtDate(f.duedt_st))}`,
          `duedt_end=${encodeURIComponent(fmtDate(f.duedt_end))}`,
          `proj=${encodeURIComponent((f.projects || []).join(","))}`,
          `dpt=${encodeURIComponent((f.departments || []).join(","))}`,
          `cust=${encodeURIComponent((f.customers || []).join(","))}`,
          `serv_ty=${encodeURIComponent((f.services || []).join(","))}`,
          `job_status=${encodeURIComponent((f.statuses || []).join(","))}`,
          `appr_status=${encodeURIComponent(f.approve || "")}`,
          `req_name=${encodeURIComponent((f.requesters || []).join(","))}`,
          `worker=${encodeURIComponent((f.workers || []).join(","))}`,
          `t_worker=${encodeURIComponent((f.teamWorkers || []).join(","))}`,
          `t_req=${encodeURIComponent((f.teamRequesters || []).join(","))}`,
          `tester=${encodeURIComponent((f.testerQcs || []).join(","))}`
        ].join("&");
      },
      async loadData() {
        try {
          page.loadingBox.show();
          this.detailOpen = false;
          this.detailReqName = "";
          this.detailRows = [];
          let p = this.buildFilterParams();
          let rsp = await $xt.getServer(`csm/report/ReadData?${p}`);
          if (rsp && rsp.success === false) {
            $msg.alert('Error', rsp.error || 'โหลดข้อมูลไม่สำเร็จ', 'danger');
            return;
          }
          let d = rsp.data || {};
          this.reportRows = d.requesters || [];
          this.reportColumns = d.columns || [];
          this.reportGrand = d.grand_total || {};
          this.reportSummary = d.summary || {};
          this.queried = true;
          this.filterOpen = false;
          this.$nextTick(() => this.initTable('report'));
        } catch (error) {
          $msg.alert('Error', error.message, 'danger');
        } finally {
          page.loadingBox.hide();
        }
      },
      initTable(type) {
        switch (type) {
          case "report": {
            let agr = this.$refs.agrReport;
            if (!agr) return;
            let fields = [
              ["request_by", "Requester By", "text", { width: 220, align: "left", pinned: "left", cellRenderer: (p) => `<a style="color:#4f6ef7;font-weight:600;cursor:pointer;">${p.value || ''}</a>` }],
              ...(this.reportColumns || [])
                .filter(c => this.is_mango || !/update\s*program/i.test(c.name || ''))
                .map(c => [c.code, c.name, "text", { width: 160, align: "center" }]),
              ["total", "Total", "text", { width: 100, align: "center", cellRenderer: (p) => `<b style="color:#4f6ef7;">${p.value != null ? p.value : ''}</b>` }]
            ];
            agr.setHeader(agr.createHeaderFromArray(fields));
            agr.setDisplay(this.reportRows);
            agr.setBottomData([this.reportGrand]);
            break;
          }
          case "detail": {
            let agr = this.$refs.agr;
            if (!agr) return;
            let fields = [
              ["job_no", "CSM No.", "text", { width: 140, pinned: "left", cellRenderer: (p) => `<a style="color:#4f6ef7;font-weight:600;cursor:pointer;">${p.value || ''}</a>` }],
              ["customer_name", "ชื่อลูกค้า", "text", { width: 220, align: "left" }],
              ["serv_name", "ประเภทบริการ", "text", { width: 150, align: "left" }],
              ["subject", "หัวข้อเรื่อง", "text", { width: 280, align: "left" }],
              ["response_date", "Response Date", "date", { width: 130, align: "center"}, { useCellRenderer: true }],
              ["due_date", "Due Date", "date", { width: 120, align: "center" }, { useCellRenderer: true }],
              ["worker_name", "Worker", "text", { width: 200, align: "left" }],
              ["team_worker", "Team Worker", "text", { width: 180, align: "left" }],
              ["tester_name", this.is_mango ? "Tester" : "Checker", "text", { width: 150, align: "left" }],
              ["status_name", "Status", "text", { width: 150, align: "center", cellRenderer: (p) => this.statusBadge(p.value) }],
              ["approve", "Approve Status", "text", { width: 150, align: "center", cellRenderer: (p) => this.approveBadge(p.value) }]
            ];
            agr.setHeader(agr.createHeaderFromArray(fields));
            this.detailPage = 1;
            this.renderDetailPage();
            break;
          }
        }
      },
      onReportCellClicked(e) {
        if (!e || e.col !== "request_by") return;
        let row = e.data || {};
        if (!row.req_empno || row.request_by === "รวมทั้งหมด") return;
        this.openDetail(row.req_empno, row.request_by);
      },
      onDetailCellClicked(e) {
        if (!e || e.col !== "job_no") return;
        let value = e.data && e.data.job_no;
        if (!value) return;
        const url = this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${value}`;
        window.open(url, "_blank");
      },
      async openDetail(empno, name) {
        this.detailReqName = name || "";
        this.detailSearch = { field: "job_no", text: "" };
        this.detailPage = 1;
        this.detailOpen = true;
        try {
          page.loadingBox.show();
          let rsp = await $xt.getServer(`csm/report/ReadDetail?empno=${encodeURIComponent(empno || "")}&${this.buildFilterParams()}`);
          if (rsp && rsp.success === false) {
            $msg.alert('Error', rsp.error || 'โหลดรายละเอียดไม่สำเร็จ', 'danger');
            return;
          }
          let d = rsp.data || {};
          this.detailRows = d.rows || [];
          this.$nextTick(() => {
            this.initTable('detail');
            if (this.$refs.detailPanel) this.$refs.detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        } catch (error) {
          $msg.alert('Error', error.message, 'danger');
        } finally {
          page.loadingBox.hide();
        }
      },
      closeDetail() {
        this.detailOpen = false;
      },
      searchDetail() {
        try {
          page.loadingBox.show();
          this.detailPage = 1;
          this.renderDetailPage();
        } finally {
          page.loadingBox.hide();
        }
      },
      detailPageChange(pn) {
        this.detailPage = pn || 1;
        let agr = this.$refs.agr;
        if (agr) agr.setDisplay(this.pagedDetailRows);
      },
      renderDetailPage() {
        let agr = this.$refs.agr;
        if (!agr) return;
        let paging = this.$refs.detailPaging;
        if (paging) {
          paging.setItemsPerPage(this.detailPerPage);
          paging.setTotalItems(this.filteredDetailRows.length);
          paging.setCurrentPage(this.detailPage);
        }
        agr.setDisplay(this.pagedDetailRows);
      },
      async exportReportExcel() {
        let agr = this.$refs.agrReport;
        if (!agr) return;
        await agr.exportExcel('Report By Requester');
      },
      async exportDetailExcel() {
        let agr = this.$refs.agr;
        if (!agr) return;
        agr.setDisplay(this.filteredDetailRows);
        await this.$nextTick();
        try {
          await agr.exportExcel(this.detailReqName || 'detail');
        } finally {
          this.renderDetailPage();
        }
      },
      badgeBase() {
        return 'display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 10px;border-radius:12px;line-height:1;font-weight:600;white-space:nowrap;vertical-align:middle;';
      },
      statusBadge(v) {
        if (!v) return '';
        let map = {
          'Draft': ['#546E7A', '#ECEFF1'],
          'Queued': ['#00838F', '#E0F7FA'],
          'Wait': ['#B26A00', '#FFF3E0'],
          'In Progress': ['#0277BD', '#E1F5FE'],
          'Test': ['#C2185B', '#FCE4EC'],
          'Reject': ['#C62828', '#FFEBEE'],
          'Cancel': ['#283593', '#E8EAF6'],
          'HOLD': ['#F57F17', '#FFF8E1'],
          'Send Pretest': ['#558B2F', '#F1F8E9'],
          'Send To QC': ['#4527A0', '#EDE7F6'],
          'Send Back': ['#9C27B0', '#F3E5F5'],
          'Update Program': ['#F57F17', '#FFF8E1'],
          'Complete': ['#2E7D32', '#E8F5E9'],
          'Other': ['#5E35B1', '#EDE7F6'],
        };
        let c = map[v] || ['#607D8B', '#ECEFF1'];
        return `<span style="${this.badgeBase()}color:${c[0]};background:${c[1]};"><span style="width:8px;height:8px;border-radius:50%;background:${c[0]};flex:none;"></span>${v}</span>`;
      },
      approveBadge(v) {
        if (!v) return '';
        let map = { 'Approve': ['#2E7D32', '#E8F5E9'], 'Wait Approve': ['#B26A00', '#FFF3E0'], 'Reject': ['#C62828', '#FFEBEE'] };
        let c = map[v] || ['#607D8B', '#ECEFF1'];
        return `<span style="${this.badgeBase()}color:${c[0]};background:${c[1]};">${v}</span>`;
      },
      resetFilter() {
        let now = new Date();
        let pad = n => (n < 10 ? '0' + n : '' + n);
        let ym = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-';
        this.filter = { text: "", reqdt_st: ym + '01', reqdt_end: ym + pad(now.getDate()), duedt_st: "", duedt_end: "", year: "", groups: [], projects: [], departments: [], customers: [], services: [], statuses: [], priorities: [], over_due: "", approve: "", sort: "qty_desc", workers: [], requesters: [], teamWorkers: [], teamRequesters: [], testerQcs: [] };
        this.workerSearch = "";
        this.requesterSearch = "";
        this.teamWorkerSearch = "";
        this.teamRequesterSearch = "";
        this.testerQcSearch = "";
        this.projectSearch = "";
        this.departmentSearch = "";
        this.customerSearch = "";
        this.serviceSearch = "";
      },
      serviceName(code) {
        let s = this.services.find(x => x.serv_code == code);
        return s ? s.serv_name : code;
      },
      customerName(code) {
        let c = this.customers.find(x => x.customer_code == code);
        return c ? c.customer_name : code;
      },
      projectName(code) {
        let p = this.projects.find(x => x.project_code == code);
        return p ? p.project_name : code;
      },
      departmentName(code) {
        let d = this.departments.find(x => x.dpt_code == code);
        return d ? d.dpt_name : code;
      },
      teamWorkerName(code) {
        let t = this.teamWorkersList.find(x => x.team_code == code);
        return t ? t.team_name : code;
      },
      teamRequesterName(code) {
        let t = this.teamRequestersList.find(x => x.team_code == code);
        return t ? t.team_name : code;
      },
      requesterName(empno) {
        let r = this.requesters.find(x => x.empno == empno);
        return r ? r.name : empno;
      },
      workerName(empno) {
        let w = this.workers.find(x => x.empno == empno);
        return w ? w.name : empno;
      },
      testerQcName(empno) {
        let t = this.testerQcList.find(x => x.empno == empno);
        return t ? t.name : empno;
      },
    },
    computed: {
      ...mapState(['configData']),
      detailFields() {
        return [
          { key: "job_no", name: "CSM No." },
          { key: "customer_name", name: "ชื่อลูกค้า" },
          { key: "serv_name", name: "ประเภทบริการ" },
          { key: "subject", name: "หัวข้อเรื่อง" },
          { key: "worker_name", name: "Worker" },
          { key: "team_worker", name: "Team Worker" },
          { key: "tester_name", name: this.is_mango ? "Tester" : "Checker" },
          { key: "status_name", name: "Status" },
          { key: "approve", name: "Approve Status" },
          { key: "response_date", name: "Response Date" },
          { key: "due_date", name: "Due Date" },
        ];
      },
      activeFilterChips() {
        let f = this.filter;
        let chips = [];
        if (f.year) chips.push({ icon: "fas fa-calendar-alt", label: "ปี", value: f.year, clear: () => { this.filter.year = ""; } });
        if (f.text) chips.push({ icon: "fas fa-search", label: "ค้นหา", value: f.text, clear: () => { this.filter.text = ""; } });
        if (f.projects.length) chips.push({ icon: "fas fa-project-diagram", label: "Project", value: f.projects.map(c => this.projectName(c)).join(", "), clear: () => { this.filter.projects = []; } });
        if (f.departments.length) chips.push({ icon: "fas fa-sitemap", label: "Department", value: f.departments.map(c => this.departmentName(c)).join(", "), clear: () => { this.filter.departments = []; } });
        if (f.services.length) chips.push({ icon: "fas fa-cog", label: "Service", value: f.services.map(c => this.serviceName(c)).join(", "), clear: () => { this.filter.services = []; } });
        if (f.statuses.length) chips.push({ icon: "fas fa-flag", label: "Status", value: f.statuses.join(", "), clear: () => { this.filter.statuses = []; } });
        if (f.customers.length) chips.push({ icon: "fas fa-building", label: "Customer", value: f.customers.map(c => this.customerName(c)).join(", "), clear: () => { this.filter.customers = []; } });
        if (f.approve) chips.push({ icon: "fas fa-check-circle", label: "Approve Status", value: f.approve, clear: () => { this.filter.approve = ""; } });
        if (f.workers.length) chips.push({ icon: "fas fa-user-tie", label: "Worker", value: f.workers.map(c => this.workerName(c)).join(", "), clear: () => { this.filter.workers = []; } });
        if (f.requesters.length) chips.push({ icon: "fas fa-user", label: "Requester", value: f.requesters.map(c => this.requesterName(c)).join(", "), clear: () => { this.filter.requesters = []; } });
        if (f.teamWorkers.length) chips.push({ icon: "fas fa-users-cog", label: "Teams Worker", value: f.teamWorkers.map(c => this.teamWorkerName(c)).join(", "), clear: () => { this.filter.teamWorkers = []; } });
        if (f.teamRequesters.length) chips.push({ icon: "fas fa-users", label: "Teams Requester", value: f.teamRequesters.map(c => this.teamRequesterName(c)).join(", "), clear: () => { this.filter.teamRequesters = []; } });
        if (f.testerQcs.length) chips.push({ icon: "fas fa-user-check", label: this.is_mango ? "Tester" : "Checker", value: f.testerQcs.map(c => this.testerQcName(c)).join(", "), clear: () => { this.filter.testerQcs = []; } });
        return chips;
      },
      filteredWorkers() {
        let q = (this.workerSearch || "").trim().toLowerCase();
        return q ? this.workers.filter(w => (w.name || "").toLowerCase().includes(q)) : this.workers;
      },
      filteredRequesters() {
        let q = (this.requesterSearch || "").trim().toLowerCase();
        return q ? this.requesters.filter(r => (r.name || "").toLowerCase().includes(q)) : this.requesters;
      },
      filteredTeamWorkers() {
        let q = (this.teamWorkerSearch || "").trim().toLowerCase();
        return q ? this.teamWorkersList.filter(t => t.team_name.toLowerCase().includes(q)) : this.teamWorkersList;
      },
      filteredTeamRequesters() {
        let q = (this.teamRequesterSearch || "").trim().toLowerCase();
        return q ? this.teamRequestersList.filter(t => t.team_name.toLowerCase().includes(q)) : this.teamRequestersList;
      },
      filteredTesterQcs() {
        let q = (this.testerQcSearch || "").trim().toLowerCase();
        return q ? this.testerQcList.filter(t => (t.name || "").toLowerCase().includes(q)) : this.testerQcList;
      },
      allStatusNames() {
        let order = this.statusList.map(s => s.name);
        return (this.statusesList || []).slice().sort((a, b) => {
          let ia = order.indexOf(a);
          let ib = order.indexOf(b);
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        });
      },
      filteredStatusNames() {
        let q = (this.statusSearch || "").trim().toLowerCase();
        return q ? this.allStatusNames.filter(name => (name || "").toLowerCase().includes(q)) : this.allStatusNames;
      },
      projects() {
        return this.projectsList;
      },
      filteredProjects() {
        let q = (this.projectSearch || "").trim().toLowerCase();
        return q ? this.projects.filter(p => (p.project_name || "").toLowerCase().includes(q)) : this.projects;
      },
      departments() {
        return this.departmentsList;
      },
      filteredDepartments() {
        let q = (this.departmentSearch || "").trim().toLowerCase();
        return q ? this.departments.filter(d => (d.dpt_name || "").toLowerCase().includes(q) || (d.dpt_code || "").toLowerCase().includes(q)) : this.departments;
      },
      customers() {
        return this.customersList;
      },
      filteredCustomers() {
        let q = (this.customerSearch || "").trim().toLowerCase();
        return q ? this.customers.filter(c => (c.customer_name || "").toLowerCase().includes(q) || (c.customer_code || "").toLowerCase().includes(q)) : this.customers;
      },
      approveStatuses() {
        return (this.approveStatusList || []).map(s => ({ value: s, label: s }));
      },
      servicesInGroup() {
        if (!this.filter.groups.length) return this.services;
        return this.services.filter(s => this.filter.groups.includes(s.serv_group_code));
      },
      servicesGrouped() {
        let src = this.servicesInGroup;
        let order = [];
        let map = {};
        src.forEach(s => {
          let code = s.serv_group_code || "other";
          if (!map[code]) {
            map[code] = { serv_group_code: code, serv_group_name: s.serv_group_name || "อื่นๆ", services: [] };
            order.push(code);
          }
          map[code].services.push(s);
        });
        return order.map(c => map[c]);
      },
      filteredServicesGrouped() {
        let q = (this.serviceSearch || "").trim().toLowerCase();
        if (!q) return this.servicesGrouped;
        return this.servicesGrouped.map(grp => ({
          ...grp,
          services: grp.services.filter(s => s.serv_name.toLowerCase().includes(q))
        })).filter(grp => grp.services.length);
      },
      summary() {
        return this.reportSummary || {};
      },
      overdueCount() {
        return this.reportSummary.overdue_count || 0;
      },
      overduePercent() {
        let t = this.reportSummary.task_total || 0;
        return t ? Math.round((this.overdueCount / t) * 100) : 0;
      },
      waitApproveCount() {
        return this.reportSummary.wait_approve_count || 0;
      },
      filteredDetailRows() {
        let f = this.detailSearch || {};
        let key = f.field;
        let text = f.text;
        if (!key || text === "" || text === null || text === undefined) return this.detailRows;
        let isDate = key === "due_date" || key === "response_date";
        if (isDate) {
          let target = $xt.formatDate(text, "DD/MM/YYYY");
          return this.detailRows.filter(r => r[key] != null && $xt.formatDate(r[key], "DD/MM/YYYY") === target);
        }
        let q = ("" + text).toLowerCase();
        return this.detailRows.filter(r => r[key] != null && ("" + r[key]).toLowerCase().includes(q));
      },
      pagedDetailRows() {
        let start = (this.detailPage - 1) * this.detailPerPage;
        return this.filteredDetailRows.slice(start, start + this.detailPerPage);
      },
      is_mango() {
        let isMango = $linq(this.configData).where(x => x.config_id == 'TRN0001').select(x => x.config_value).firstOrDefault()
        return isMango == 'Y' ? true : false
      },
    },
    watch: {
      'filter.teamWorkers'(val) {
        if (val && val.length) this.filter.workers = [];
      }
    },
   async mounted() {
      page = this.$refs.page;
      page.pageTitle = 'CSM : Dashboard CSM by Requester';
      document.title = page.pageTitle;

      page.loadingBox.show();
      await this.loadFilterOptions();
      page.loadingBox.hide();

    }
  };
  export default cpn;
</script>
<style scoped>
  @import '../Dashboard/CSS/v_csm_remain_by_customer.css';

  .detail-paging-left > div {
    justify-content: flex-start !important;
  }

  /* Inline drill-down panel */
  .rc-detail {
    position: relative;
    border-top: 3px solid transparent;
    border-image: linear-gradient(90deg, var(--rc-accent), var(--rc-accent2)) 1;
  }
  .rc-detail__count {
    margin-left: 10px;
    vertical-align: middle;
  }
  .rc-detail__body { padding: 14px; }
  .rc-detail .rc-dt-grid { padding: 0; }
  .rc-detail .rc-field--grow { flex: 0 1 360px; }
  .rc-detail .rc-count { margin-left: auto; }

  .rc-dt-action { min-width: auto; }
  .rc-dt-excel {
    height: 34px;
    padding: 0 16px;
    font-size: 13px;
  }
  .rc-dt-foot { margin-top: 12px; }
</style>
