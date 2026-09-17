<template>
  <div>
    <re-page ref="page">
      <template #body>
        <app-form-2 ref="appForm">
         <template #extraBtn>

            <button 
                    class="btn btn-sm btn-primary"
                    @click.prevent="setNew()">
              <i class="fas fa-plus"></i> Set Team Emp.
            </button>

        

          </template>
          <template #form-detail>
            <div class="box box-widget">
              <div class="box-body">
                <div class="row d-flex">

                  <div class="col-md-3">
                    <div class="form-group">
                      <label v-text="ui.search_by || 'Search By'"></label>
                      <select class="form-control input-sm" v-model="searchData.search_field">
                        <option value="team_code">Team Code</option>
                        <option value="team_name">Team Name</option>
                        <option value="empfullname_t">Employee Name</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label v-text="ui.search || 'Search'"></label>
                      <div class="input-group">
                        <input type="text" class="form-control input-sm" v-model="searchData.search_text" @keyup.enter="doSearch()" />
                        <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click.prevent="doSearch()"><i class="fas fa-search"></i></button></span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 col-md-offset-4 align-content-end margin-b-8">
                       <span class="pull-right">(Total: {{ requestCodeTotal || 0 }} items)</span>
                  </div>
                </div>
                <div class="row">
                  <div class="col-sm-12 col-md-12 col-lg-12">
                    <ag-table ref="agr"
                              :footer="false"
                              @ready="initTable()"
                              @cell-clicked="onCellClicked"
                               :saveColumns="'Y'"
                              :doctype="'VIEW'"
                              :page_name="'v_csm_mas_program'">
                    </ag-table>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-12 col-md-12">
                    <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </app-form-2>
      </template>
    </re-page>
    <modal-3 ref="formModal_emp">
      <template #header>
        <div class="tm-header">
          <div class="tm-header__icon"><i class="fas fa-users-cog"></i></div>
          <div class="tm-header__text">
            <h4 class="tm-header__title">Create New Team</h4>
            <p class="tm-header__sub">Add Employee Team</p>
          </div>
        </div>
      </template>
      <template #body>
        <div class="tm-form">
          <!-- Section 1: Team Info -->
          <div class="tm-section">
            <div class="tm-section__label">
              <i class="fas fa-id-card"></i> Team Info
              <div class="tw-ctrl__toggle" style="margin-left:auto;">
                <button type="button" class="tw-toggle-btn" :class="{ 'tw-toggle-btn--active': formTeam.active_tm !== 'N' }" @click="formTeam.active_tm = 'Y'">Active</button>
                <button type="button" class="tw-toggle-btn" :class="{ 'tw-toggle-btn--active tw-toggle-btn--off': formTeam.active_tm === 'N' }" @click="formTeam.active_tm = 'N'">Inactive</button>
              </div>
            </div>
            <div class="tm-row">
              <div class="tm-field tm-field--sm">
                <div class="tm-field__head">
                  <label class="tm-field__label tm-field__label--req">Team Code</label>
                  <span class="tm-field__count">{{ xt.textLength(formTeam.team_code, 20) }}</span>
                </div>
                <div class="tm-input-wrap" :class="{ 'tm-input-wrap--error': xt.isEmpty(formTeam.team_code) }">
                  <i class="fas fa-hashtag tm-input-icon"></i>
                  <input type="text" class="tm-input"
                         v-model.trim="formTeam.team_code"
                         maxlength="20"
                         placeholder="Enter team code" />
                </div>
              </div>
              <div class="tm-field tm-field--lg">
                <div class="tm-field__head">
                  <label class="tm-field__label tm-field__label--req">Team Name</label>
                  <span class="tm-field__count">{{ xt.textLength(formTeam.team_name, 100) }}</span>
                </div>
                <div class="tm-input-wrap" :class="{ 'tm-input-wrap--error': xt.isEmpty(formTeam.team_name) }">
                  <i class="fas fa-tag tm-input-icon"></i>
                  <input type="text" class="tm-input"
                         v-model.trim="formTeam.team_name"
                         maxlength="100"
                         placeholder="Enter team name" />
                </div>
              </div>
            </div>
            <div class="tm-row">
              <div class="tm-field tm-field--lg">
                <div class="tm-field__head">
                  <label class="tm-field__label tm-field__label--req">Team Leader</label>
                </div>
                <div class="rc-msdrop" :class="{ open: leaderDropOpen }" v-click-outside="() => leaderDropOpen = false">
                  <div class="rc-msdrop__trigger" @click="leaderDropOpen = !leaderDropOpen">
                    <span v-if="!formTeam.empno_h" class="rc-msdrop__placeholder"><i class="fas fa-user-tie"></i> Select Team Leader...</span>
                    <span v-else class="rc-msdrop__tags">
                      <span class="rc-msdrop__tag">
                        {{ getMemberName(formTeam.empno_h) }}
                        <i class="fas fa-times" @click.stop="formTeam.empno_h = null"></i>
                      </span>
                    </span>
                    <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                  </div>
                  <div class="rc-msdrop__menu" v-show="leaderDropOpen">
                    <div class="rc-msdrop__search">
                      <i class="fas fa-search"></i>
                      <input type="text" v-model="searchLeader" placeholder="Search employee..." @click.stop />
                    </div>
                    <label class="rc-msdrop__item"
                           v-for="emp in filteredLeaderList"
                           :key="emp.empno"
                           :class="{ 'rc-msdrop__item--active': emp.empno === formTeam.empno_h }"
                           @click="selectLeader(emp.empno)">
                      <span>{{ emp.empfullname }}</span>
                      <i v-if="emp.empno === formTeam.empno_h" class="fas fa-check rc-msdrop__check"></i>
                    </label>
                    <div v-if="!filteredLeaderList.length" class="rc-msdrop__empty"><i class="fas fa-inbox"></i> No data found</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Members & Programs -->
          <div class="tm-grid">
            <!-- Members -->
            <div class="tm-section">
              <div class="tm-section__label">
                <i class="fas fa-user-friends"></i> Team Members
                <span class="tm-badge" v-if="formTeam.members.length">{{ formTeam.members.length }}</span>
              </div>
              <div class="rc-msdrop" :class="{ open: memberDropOpen }" v-click-outside="() => memberDropOpen = false">
                <div class="rc-msdrop__trigger" @click="memberDropOpen = !memberDropOpen">
                  <span v-if="!formTeam.members.length" class="rc-msdrop__placeholder"><i class="fas fa-user-plus"></i> Select Member...</span>
                  <span v-else class="rc-msdrop__tags">
                    <span class="rc-msdrop__tag" v-for="(m, i) in formTeam.members" :key="i">
                      {{ getMemberName(m) }}
                      <i class="fas fa-times" @click.stop="formTeam.members.splice(i, 1)"></i>
                    </span>
                  </span>
                  <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                </div>
                <div class="rc-msdrop__menu" v-show="memberDropOpen">
                  <div class="rc-msdrop__search">
                    <i class="fas fa-search"></i>
                    <input type="text" v-model="searchMember" placeholder="Search employee..." @click.stop />
                  </div>
                  <label class="rc-msdrop__item" v-for="emp in filteredEmployeeList" :key="emp.empno">
                    <input type="checkbox" :value="emp.empno" v-model="formTeam.members" />
                    <span>{{ emp.empfullname }}</span>
                  </label>
                  <div v-if="!filteredEmployeeList.length" class="rc-msdrop__empty"><i class="fas fa-inbox"></i> No data found</div>
                </div>
              </div>
              <!-- Selected members preview -->
              <div class="tm-selected-list" v-if="formTeam.members.length">
                <div class="tm-selected-item" v-for="(m, i) in formTeam.members" :key="i">
                  <span class="tm-selected-item__no">{{ i + 1 }}</span>
                  <span class="tm-selected-item__name">{{ getMemberName(m) }}</span>
                  <i class="fas fa-times-circle tm-selected-item__rm" @click="formTeam.members.splice(i, 1)"></i>
                </div>
              </div>
              <div class="tm-empty-slot" v-else>
                <i class="fas fa-user-slash"></i>
                <span>No members selected</span>
              </div>
            </div>

            <!-- Programs -->
            <div class="tm-section" v-if="is_mango()">
              <div class="tm-section__label">
                <i class="fas fa-laptop-code"></i> Programs
                <span class="tm-badge tm-badge--teal" v-if="formTeam.programs.length">{{ formTeam.programs.length }}</span>
              </div>
              <div class="rc-msdrop" :class="{ open: programDropOpen }" v-click-outside="() => programDropOpen = false">
                <div class="rc-msdrop__trigger" @click="programDropOpen = !programDropOpen">
                  <span v-if="!formTeam.programs.length" class="rc-msdrop__placeholder"><i class="fas fa-plus-circle"></i> Select Program...</span>
                  <span v-else class="rc-msdrop__tags">
                    <span class="rc-msdrop__tag rc-msdrop__tag--teal" v-for="(p, i) in formTeam.programs" :key="i">
                      {{ getProgramName(p) }}
                      <i class="fas fa-times" @click.stop="formTeam.programs.splice(i, 1)"></i>
                    </span>
                  </span>
                  <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                </div>
                <div class="rc-msdrop__menu" v-show="programDropOpen">
                  <div class="rc-msdrop__search">
                    <i class="fas fa-search"></i>
                    <input type="text" v-model="searchProgram" placeholder="Search program..." @click.stop />
                  </div>
                  <label class="rc-msdrop__item" v-for="pg in filteredProgramList" :key="pg.pg_code">
                    <input type="checkbox" :value="pg.pg_code" v-model="formTeam.programs" />
                    <span>{{ pg.pg_name }}</span>
                  </label>
                  <div v-if="!filteredProgramList.length" class="rc-msdrop__empty"><i class="fas fa-inbox"></i> No data found</div>
                </div>
              </div>
              <!-- Selected programs preview -->
              <div class="tm-selected-list tm-selected-list--teal" v-if="formTeam.programs.length">
                <div class="tm-selected-item" v-for="(p, i) in formTeam.programs" :key="i">
                  <span class="tm-selected-item__no">{{ i + 1 }}</span>
                  <span class="tm-selected-item__name">{{ getProgramName(p) }}</span>
                  <i class="fas fa-times-circle tm-selected-item__rm" @click="formTeam.programs.splice(i, 1)"></i>
                </div>
              </div>
              <div class="tm-empty-slot" v-else>
                <i class="fas fa-folder-open"></i>
                <span>No programs selected</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="tm-footer">
          <button class="tm-btn tm-btn--ghost" @click.prevent="$refs.formModal_emp.closeModal()">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button class="tm-btn tm-btn--primary" @click.prevent="beforeSaveTeam()">
            <i class="fas fa-save"></i> Create
          </button>
        </div>
      </template>
    </modal-3>

    <!-- Modal: View/Edit Team Detail -->
    <modal-3 ref="formModal_team_detail">
      <template #header>
        <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
          <h4 style="margin:0;">
            <i class="fa fa-users"></i>
              <span v-if="isTeamOwner">Edit Team Details</span>
              <span v-else>View Team Details</span>
          </h4>
        </div>
      </template>
      <template #body>
        <div class="team-detail-form">
          <!-- ส่วนที่ 1: Head (หัวหน้าทีม) -->
          <div class="team-section team-section--sticky">
            <div class="team-section__title"><i class="fas fa-user-tie"></i> Team Lead
              <button v-if="isTeamOwner" class="btn btn-xs btn-primary" @click="addWorkerRow()" style="margin-left:auto; border-radius:6px;">
                <i class="fas fa-plus"></i> Add Member
              </button>
            </div>
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Team Code</label>
                  <input type="text" class="form-control input-sm" :value="teamHead.code_tm" disabled />
                </div>
              </div>
              <div :class="is_mango() ? 'col-md-5' : 'col-md-9'">
                <div class="form-group">
                  <label>Team Name</label>
                  <input type="text" class="form-control input-sm" v-model="teamHead.name_tm" :disabled="!isTeamOwner" />
                </div>
              </div>
              <div class="col-md-4" v-if="is_mango()">
                <div class="form-group">
                  <label>Programs</label>
                  <div class="program-tags-box">
                    <span class="program-tag" v-for="(pg, i) in teamHeadPrograms" :key="i">
                      {{ pg }}
                    </span>
                    <span v-if="!teamHeadPrograms.length" class="text-muted">-</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-4">
                <div class="form-group">
                  <label>Team Lead Name</label>
                  <div class="input-group" v-if="isTeamOwner">
                    <input type="text" class="form-control input-sm" :value="teamHead.empfullname_t" disabled />
                    <span class="input-group-btn">
                      <button type="button" class="btn btn-sm btn-info" @click="openLeaderSearch()" title="เปลี่ยนหัวหน้าทีม">
                        <i class="fas fa-search"></i>
                      </button>
                    </span>
                  </div>
                  <input v-else type="text" class="form-control input-sm" :value="teamHead.empfullname_t" disabled />
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label>Position</label>
                  <input type="text" class="form-control input-sm" :value="teamHead.posname_t" disabled />
                </div>
              </div>
              <div class="col-md-2">
                <div class="form-group">
                  <label>Active</label>
                  <select v-if="isTeamOwner" class="form-control input-sm" v-model="teamHead.active_tm">
                    <option value="Y">Active</option>
                    <option value="N">Inactive</option>
                  </select>
                  <div v-else>
                    <span v-if="teamHead.active_tm === 'Y'" class="label label-success">Active</span>
                    <span v-else class="label label-default">Inactive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ส่วนที่ 2: Work (ลูกทีม) - Card Style -->
          <div class="team-section">
            <div class="team-section__title">
              <i class="fas fa-users"></i> Workers
               <span class="badge bg-blue">{{ teamWorkers.length }} Members</span>
            </div>
            <div class="team-worker-cards">
              <div class="tw-card" v-for="(w, idx) in teamWorkers" :key="idx" :class="{'tw-card--inactive': w.active_tm === 'N'}">
                <div class="tw-card__header">
                  <span class="tw-card__no">{{ idx + 1 }}</span>
                  <div class="tw-card__info">
                    <span class="tw-card__name" v-if="w.empfullname_t">{{ w.empfullname_t }}</span>
                    <span class="tw-card__name tw-card__name--empty" v-else>Please select</span>
                    <span class="tw-card__pos" v-if="w.posname_t">{{ w.posname_t }}</span>
                  </div>
                  <span v-if="w.asst_tm === 'Y'" class="badge" style="background-color: #fda22a; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">
                    <i class="fas fa-star" style="margin-right: 4px;"></i> Assistant Leader
                  </span>
                  <span v-else class="badge" style="background-color: #64748b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">
                    <i class="fas fa-user" style="margin-right: 4px;"></i> Worker
                  </span>
                  <span class="tw-card__status" :class="{'tw-card__status--active': w.active_tm === 'Y'}">
                    <i :class="w.active_tm === 'Y' ? 'fas fa-check-circle' : 'fas fa-minus-circle'"></i>
                  </span>
                  <button v-if="isTeamOwner && !w.empfullname_t" class="btn btn-xs btn-info tw-card__search" @click="openEmpSearch(idx)" title="ค้นหาพนักงาน">
                    <i class="fas fa-search"></i>
                  </button>
                  <button v-if="isTeamOwner && !w.empfullname_t" class="btn btn-xs btn-danger" @click="removeWorker(w, idx)" title="ลบ" style="border-radius:50%; width:26px; height:26px; padding:0; display:flex; align-items:center; justify-content:center; margin-left:4px;">
                    <i class="fas fa-times" style="font-size:10px;"></i>
                  </button>
                </div>
                <!-- Row 2: Controls (owner only, show only when emp selected) -->
                <div class="tw-card__body" v-if="isTeamOwner && w.empfullname_t">
                  <div class="tw-ctrl">
                    <span class="tw-ctrl__label">Status</span>
                    <div class="tw-ctrl__toggle">
                      <button type="button" class="tw-toggle-btn" :class="{'tw-toggle-btn--active': w.active_tm === 'Y'}" @click="w.active_tm = 'Y'; updateWorkerType(w)">Active</button>
                      <button type="button" class="tw-toggle-btn" :class="{'tw-toggle-btn--active tw-toggle-btn--off': w.active_tm === 'N'}" @click="w.active_tm = 'N'; updateWorkerType(w)">Inactive</button>
                    </div>
                  </div>
                  <div class="tw-ctrl">
                    <span class="tw-ctrl__label">Team Role</span>
                    <div class="tw-ctrl__toggle">
                      <button type="button" class="tw-toggle-btn" :class="{'tw-toggle-btn--active tw-toggle-btn--asst': w.asst_tm === 'Y'}" @click="w.asst_tm = 'Y'; updateWorkerType(w)">Assistant Leader</button>
                      <button type="button" class="tw-toggle-btn" :class="{'tw-toggle-btn--active': w.asst_tm === 'N'}" @click="w.asst_tm = 'N'; updateWorkerType(w)">Staff</button>
                    </div>
                  </div>
                  <!-- <div class="tw-ctrl">
                    <span class="tw-ctrl__label">Type</span>
                    <span class="tw-type-badge">{{ w.asst_tm === 'Y' ? 'A' : 'W' }}</span>
                  </div> -->
                  <div class="tw-card__actions">
                    <button class="btn btn-xs btn-danger" @click="removeWorker(w, idx)" title="Remove Member">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                <div class="tw-card__body" v-else>
                  <div class="tw-ctrl">
                    <span class="tw-ctrl__label">Status</span>
                    <span class="tw-ctrl__value" :class="w.active_tm === 'Y' ? 'tw-ctrl__value--on' : 'tw-ctrl__value--off'">
                     {{ w.active_tm === 'Y' ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <div class="tw-ctrl">
                    <span class="tw-ctrl__label">Team Role</span>
                    <span class="tw-ctrl__value">{{ w.asst_tm === 'Y' ? 'Assistant Leader' : 'Staff' }}</span>
                  </div>
                  <!-- <div class="tw-ctrl">
                    <span class="tw-ctrl__label">Type</span>
                    <span class="tw-type-badge">{{ w.asst_tm === 'Y' ? 'A' : 'W' }}</span>
                  </div> -->
                </div>
              </div>
              <div v-if="!teamWorkers.length" class="tw-empty">
                <i class="fas fa-user-slash"></i>
                <p>No team members yet.</p>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-sm btn-default" @click.prevent="$refs.formModal_team_detail.closeModal()">
          <i class="fas fa-times"></i> Close
        </button>
        <button v-if="isTeamOwner" class="btn btn-sm btn-success" @click.prevent="saveTeamEdit()">
          <i class="fas fa-save"></i> Update
        </button>
      </template>
    </modal-3>
    <vue-employee-list ref="ct_emp" @send-data="sendComponent($event, 'emp')"></vue-employee-list>
  </div>
</template>
<script type="text/javascript">
  import { mapState, mapGetters } from '~/stores/helpers'
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let paging = {};
  let appForm = {};

  let cpn = {
    directives: {
      clickOutside: {
        beforeMount(el, binding) {
          el._clickOutsideHandler = (e) => { if (!el.contains(e.target)) binding.value(e); };
          document.addEventListener("click", el._clickOutsideHandler);
        },
        unmounted(el) { document.removeEventListener("click", el._clickOutsideHandler); }
      }
    },
    data() {
      return {
        auth,
        pageNumber: 1,
        form: {},
        ui: window.ui,
        display: [],
        xt: $xt,
        isEdit: false,
        requestCodeTotal: [],
        searchData: {
          search_field: "team_code",
          search_text: "",
          search_pg: ""
        },
        fileName: null,
        infoFile: {},
        moduleForMango: moduleCodeData,
        platformCodeData,
        newModuleForMango: [],
        newPlatformCodeData: [],
        pg_lists: [],
        type_pg: [],
        moduleList: [],
        platformList: [],
        // === Employee Team Modal ===
        formTeam: {
          team_code: "",
          team_name: "",
          empno_h: null,
          active_tm: "Y",
          members: [],
          programs: []
        },
        searchMember: "",
        searchProgram: "",
        searchLeader: "",
        memberDropOpen: false,
        programDropOpen: false,
        leaderDropOpen: false,
        employeeList: [],   // โหลดจาก API: [{emp_code, emp_name}]
        programList: [],    // โหลดจาก API: [{pg_code, pg_name}]
        // === Team Detail Modal ===
        teamHead: {},
        teamWorkers: [],
        isTeamOwner: false,
        selectedWorkerIdx: null,
        editingLeader: false
      };
    },
    methods: {
      async pageChange(pn) {
        this.page_number = pn
        paging.setCurrentPage(pn)
        await this.loadData()
      },
      doSearch() {
        let field = this.searchData.search_field;
        let text = (this.searchData.search_text || '').trim().toLowerCase();
        let agr = this.$refs.agr;

        if (!text) {
          // ถ้าไม่มีคำค้น → แสดงทั้งหมด
          agr.setDisplay(this.pg_lists);
          this.requestCodeTotal = this.pg_lists.length;
          return;
        }

        let filtered = this.pg_lists.filter(row => {
          let val = '';
          if (field === 'team_code') val = String(row.code_tm || '');
          else if (field === 'team_name') val = String(row.name_tm || '');
          else if (field === 'empfullname_t') val = String(row.empfullname_t || '');
          else val = String(row[field] || '');
          return val.toLowerCase().includes(text);
        });

        agr.setDisplay(filtered);
        this.requestCodeTotal = filtered.length;
      },
   
      setNew() {
        this.resetTeamData();
        this.$refs.formModal_emp.setSize("modal-lg");
        this.$refs.formModal_emp.openModal();
      },
      async onTemplateExcel() {
        let act = `csm/master/TemplateExcelRequest`
        let rsp = await $xt.getServer(act)
        window.open(window.dataServer + `API/File/DownLoad?download=true&id=${rsp.data}`)

      },
      async setEdit(x) {
        try {
          page.loadingBox.show();
          this.isTeamOwner = (x.empno_h == auth.empno || auth.is_admin);
          let act = `csm/master/Read_Team?code_tm=${encodeURIComponent(x.code_tm)}&emp_h=${encodeURIComponent(x.empno_h)}`;
          let rsp = await $xt.getServer(act);

          if (!rsp.success) {
            throw rsp.error;
          }

          // set ข้อมูล head และ workers
          this.teamHead = rsp.data.head || {};
          this.teamWorkers = rsp.data.work || [];

          // เปิด modal
          this.$refs.formModal_team_detail.setSize("modal-lg");
          this.$refs.formModal_team_detail.openModal();

        } catch (ex) {
          $msg.alert('', ex.toString(), 'danger');
        } finally {
          page.loadingBox.hide();
        }
      },
      async loadData() {
        try {
          page.loadingBox.show();
          let act = `csm/master/ReadList_Team`;

          let rsp = await $xt.getServer(act);
          let agr = this.$refs.agr;

       
          this.pg_lists = rsp.data.data || [];
          console.log('dssdds', this.pg_lists)
          this.requestCodeTotal = rsp.data.total || 0
          let gf = this.pg_lists

   
          paging.setTotalItems(rsp.data.total || 0);
          paging.createPagesArray();

          agr.setDisplay(gf);
          this.initTable()

        } catch (error) {
          $msg.alert(``, error.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async onDeleteData(x) {
        if(x.empno_h != auth.empno){return;}
        if (!await $msg.confirm(`Do you want to delete this </br> Team  : ${x.name_tm}`)) {
          return;
        }
        try {
          page.loadingBox.show();
            let f = {
                form: x
            };


          let act = `csm/master/Delete_Team`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          await this.loadData();
          $notify.success(ui.alert_save_success)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      addFile() {
        $(this.$refs.File).click();
      },
      async initTable() {
        let agr = this.$refs.agr;

        let fields = [
          ["edit_", "Edit", "text", {
                            width: 90,
                            align: "center" ,pinned: 'left',
                            cellRenderer: (params) => {
                                if (params.data && params.data.empno_h == auth.empno) {
                                    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;"><i class="fas fa-pen" style="cursor:pointer;color:#00478c;font-size:14px;"></i></span>`;
                                } else {
                                    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;"><i class="fas fa-eye" style="cursor:pointer;color:#2d4964;font-size:14px;"></i></span>`;
                                }
                            }
                            }],
          ["code_tm", "Team Code", "text", { width: 140, align: "center"  ,pinned: 'left'}],
          ["name_tm", "Team Name", "text", { width: 220, align: "left"  ,pinned: 'left'}],
         ["empfullname_t", "Team Lead Name", "text", { width: 220, align: "left" ,pinned: 'left' }],
          ["type_tm", "Role", "text", {
            width: 110, align: "center",
            cellRenderer: (params) => {
              let v = params.value || "";
              if (v === "H") return `<span class="badge" style="background-color: #fda22a; color: white; padding: 5px 10px; border-radius: 20px;">
                                          <i class="fas fa-crown" style="margin-right: 5px;"></i> Team Lead
                                      </span>`;
              if (v === "A") return `<span class="label label-warning">Assistant Leader</span>`;
              if (v === "W") return `<span class="label label-default">Staff</span>`;
              return v;
            }
          }],
          ["posname_t", "Position", "text", { width: 200, align: "left" }],
          ["active_tm", "Active", "text", {
            width: 100, align: "center",
            cellRenderer: (params) => {
              let v = params.value || "";
              if (v === "Y") return `<span class="text-success"><i class="fas fa-check-circle"></i></span>`;
              return `<span class="text-muted"><i class="fas fa-minus-circle"></i></span>`;
            }
          }],

          ["add_by", "Add User", "text", { width: 150, align: "center" }],
          ["add_dt", "Add Date", "datetime", { width: 160, align: "center" }, { useCellRenderer: true }],
          ["edit_by", "Edit User", "text", { width: 150, align: "center" }],
          ["edit_dt", "Edit Date", "datetime", { width: 160, align: "center" }, { useCellRenderer: true }],
          ["del_", "Delete", "text", {
                            width: 90,
                            align: "center" ,
                            cellRenderer: (params) => {
                                if (params.data && params.data.empno_h == auth.empno) {
                                    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;"><i class="fas fa-trash-alt" style="cursor:pointer;color:#e53935;font-size:14px;"></i></span>`;
                                } else {
                                    return ``;
                                }
                            }
                            }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
        this.grid_header = header;
      },
      is_mango() {
        let isMango = $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault();
        return isMango == "Y" ? true : false;
      },
      permission() {
        let data = (!this.is_mango() || auth.is_admin);
        return data;
      },
      createPdfData() {
        return this.$refs.agr.createPdfData();
      },
      async list_type_pg(req_code) {
        try {
          page.loadingBox.show();
          let act = `csm/master/Group_pg`;
          let rsp = await $xt.getServer(act);
          this.type_pg = rsp.data;

          if (this.type_pg.length > 0) {
            this.searchData.search_pg = this.type_pg[0].pg_code;
          }

        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      onCellClicked(event) {
        switch (event.col) {
          case 'edit_':

            this.setEdit(event.data);
            break;

          case 'del_':

            this.onDeleteData(event.data);
            break;
          default:
            // Optional: handle unknown columns if needed
            break;
        }
      },
      selectAllModule() {
        this.form.mo_dule = [...this.moduleList];
      },
      clearAllModule() {
        this.form.mo_dule = [];
      },
      // === Employee Team Modal Methods ===
      setNewTeam() {
        this.resetTeamData();
        this.$refs.formModal_emp.openModal();
      },
      resetTeamData() {
        this.formTeam = {
          team_code: "",
          team_name: "",
          empno_h: auth.empno,
          active_tm: "Y",
          members: [],
          programs: []
        };
        this.searchMember = "";
        this.searchProgram = "";
        this.searchLeader = "";
        this.memberDropOpen = false;
        this.programDropOpen = false;
        this.leaderDropOpen = false;
      },
      selectAllMembers() {
        this.formTeam.members = this.filteredEmployeeList.map(e => e.empno);
      },
      clearAllMembers() {
        this.formTeam.members = [];
      },
      selectAllPrograms() {
        this.formTeam.programs = this.filteredProgramList.map(p => p.pg_code);
      },
      clearAllPrograms() {
        this.formTeam.programs = [];
      },
      getMemberName(code) {
        let emp = this.employeeList.find(e => e.empno === code);
        return emp ? emp.empfullname : code;
      },
      async selectLeader(empno) {
        if (this.is_mango()) {
          let emp = this.employeeList.find(e => e.empno === empno);
          let dpt = emp ? String(emp.dpt_code || '').trim() : '';
          let prefix = emp ? String(emp.empcode || '').substring(0, 2).toUpperCase() : '';

          if ((dpt === '002' || dpt === '011') && prefix === 'IT') {
            try {
              let rsp = await $xt.getServer(`csm/master/valid_check_lead?emp_h=${empno}`);
              if (!rsp.data) {
                let confirmed = await $msg.confirm('ต้องการ Set  User นี้เป็น Team Lead ใช่หรือไม่ เนื่องจาก ไม่มีการ Set Project PPN');
                if (!confirmed) {
                  return;
                }
              }
            } catch (ex) {
              $msg.alert('', ex.toString(), 'danger');
              return;
            }
          }
        }

        this.formTeam.empno_h = empno;
        let idx = this.formTeam.members.indexOf(empno);
        if (idx > -1) {
          this.formTeam.members.splice(idx, 1);
        }
        this.leaderDropOpen = false;
        this.searchLeader = "";
      },
      getProgramName(code) {
        let pg = this.programList.find(p => p.pg_code === code);
        return pg ? pg.pg_name : code;
      },
      beforeSaveTeam() {
        if (!this.formTeam.team_code) {
          $msg.alert('', 'กรุณากรอก Team Code', 'warning');
          return;
        }
        if (!this.formTeam.team_name) {
          $msg.alert('', 'กรุณากรอก Team Name', 'warning');
          return;
        }
        if (!this.formTeam.empno_h) {
          $msg.alert('', 'กรุณาเลือกหัวหน้าทีม', 'warning');
          return;
        }
        if (!this.formTeam.members || this.formTeam.members.length === 0) {
          $msg.alert('', 'กรุณาเลือกสมาชิกทีมอย่างน้อย 1 คน', 'warning');
          return;
        }
        if (this.is_mango() && (!this.formTeam.programs || this.formTeam.programs.length === 0)) {
          $msg.alert('', 'กรุณาเลือกโปรแกรมอย่างน้อย 1 รายการ', 'warning');
          return;
        }
        this.onSaveTeam();
      },
      async onSaveTeam() {
        try {
          page.loadingBox.show();

          let code_tm = this.formTeam.team_code;
          let name_tm = this.formTeam.team_name;
          let empno_h = this.formTeam.empno_h;
          let pg_code_tm = this.formTeam.programs.join(','); // join เช่น "CSM,ERP"
          let members = this.formTeam.members; // empno array (ลูกทีม)

          // helper: หา emppos จาก employeeList
          let getEmpPos = (empno) => {
            let emp = this.employeeList.find(e => e.empno == empno);
            return emp ? (emp.emppos || '') : '';
          };

          let formList = [];

          // record แรก: ตัวเอง (หัวหน้า) type_tm = 'H'
          formList.push({
            code_tm: code_tm,
            name_tm: name_tm,
            type_tm: 'H',
            emppos: getEmpPos(empno_h),
            pg_code_tm: pg_code_tm,
            empno: empno_h,
            empno_h: empno_h,
            active_tm: this.formTeam.active_tm || 'Y',
            asst_tm: 'N'
          });

          // record ลูกทีม: type_tm = 'W'
          members.forEach(empno => {
            formList.push({
              code_tm: code_tm,
              name_tm: name_tm,
              type_tm: 'W',
              emppos: getEmpPos(empno),
              pg_code_tm: pg_code_tm,
              empno: empno,
              empno_h: empno_h,
              active_tm: 'Y',
              asst_tm: 'N'
            });
          });

          const payload = { form: formList };
          console.log('payload', payload);

          let act = 'csm/master/EmpTeam_Create';
          let rsp = await $xt.postServerJson(act, payload);

          if (!rsp.success) {
            throw rsp.error;
          }

          $msg.alert('Success', 'บันทึกข้อมูลทีมสำเร็จ', 'success');
          this.$refs.formModal_emp.closeModal();
          this.resetTeamData();
          await this.loadData();

        } catch (ex) {
          $msg.alert('', ex.toString(), 'danger');
        } finally {
          page.loadingBox.hide();
        }
      },
      async loadEmployeeList() {
        try {
          let act = 'CSM/Center/Employee_ReadList?all=Y';
          let rsp = await $xt.getServer(act);
          this.employeeList = rsp.data.data_rows || [];
        } catch (ex) {
          console.error('Load employee list error:', ex);
        }
      },
      async loadProgramListForTeam() {
        try {
          let act = 'csm/master/Group_pg';
          let rsp = await $xt.getServer(act);
          let data = rsp.data || [];
            this.programList = data.filter(item => item.pg_code !== 'ALL');
        //  this.programList = rsp.data || [];
          
        } catch (ex) {
          console.error('Load program list error:', ex);
        }
      },
      // === Team Detail Modal Methods ===
      toggleWorkerActive(w) {
        w.active_tm = (w.active_tm === 'Y') ? 'N' : 'Y';
      },
      updateWorkerType(w) {
        // ถ้า asst_tm = Y → type_tm = A, ถ้า N หรือ null → type_tm = W
        w.type_tm = (w.asst_tm === 'Y') ? 'A' : 'W';
      },
      addWorkerRow() {
        this.teamWorkers.push({
          maincode: this.teamHead.maincode || '',
          code_tm: this.teamHead.code_tm || '',
          name_tm: this.teamHead.name_tm || '',
          type_tm: 'W',
          empfullname_t: '',
          posname_t: '',
          pg_code_tm: this.teamHead.pg_code_tm || '',
          empno: null,
          empno_h: this.teamHead.empno_h || auth.empno,
          active_tm: 'Y',
          asst_tm: 'N',
          isNew: true
        });
      },
      openEmpSearch(idx) {
        this.selectedWorkerIdx = idx;
        this.$refs.ct_emp.openModal();
      },
      openLeaderSearch() {
        this.editingLeader = true;
        this.$refs.ct_emp.openModal();
      },
      async sendComponent(data, type) {
        if (type === 'emp' && this.editingLeader) {
          let newEmpno = data.empno;
          let existingWorker = this.teamWorkers.find(w => w.empno == newEmpno);
          if (existingWorker) {
            $msg.alert('Duplicate', `${data.empfullname || data.empfullname_t || 'This employee'} is already a member of this team.`, 'warning');
            this.editingLeader = false;
            return;
          }

          if (this.is_mango()) {
            let dpt = String(data.dpt_code || '').trim();
            let prefix = String(data.empcode || '').substring(0, 2).toUpperCase();

            if ((dpt === '002' || dpt === '011') && prefix === 'IT') {
              try {
                let rsp = await $xt.getServer(`csm/master/valid_check_lead?emp_h=${newEmpno}`);
                if (!rsp.data) {
                  let confirmed = await $msg.confirm('ต้องการ Set  User นี้เป็น Team Lead ใช่หรือไม่ เนื่องจาก ไม่มีการ Set Project PPN');
                  if (!confirmed) {
                    this.editingLeader = false;
                    return;
                  }
                }
              } catch (ex) {
                $msg.alert('', ex.toString(), 'danger');
                this.editingLeader = false;
                return;
              }
            }
          }

          this.teamHead.empno_h = data.empno;
          this.teamHead.empfullname_t = data.empfullname || data.empfullname_t || '';
          this.teamHead.posname_t = data.posname || data.posname_t || '';
          this.teamHead.emppos = data.emppos || '';
          this.editingLeader = false;
          return;
        }
        if (type === 'emp' && this.selectedWorkerIdx !== null) {
          let newEmpno = data.empno;
          // Check duplicate with head
          if (this.teamHead.empno_h && this.teamHead.empno_h == newEmpno) {
            $msg.alert('Duplicate', 'This employee is already the team head.', 'warning');
            this.selectedWorkerIdx = null;
            return;
          }
          // Check duplicate with existing workers
          let existingWorker = this.teamWorkers.find((w, i) => i !== this.selectedWorkerIdx && w.empno == newEmpno);
          if (existingWorker) {
            $msg.alert('Duplicate', `${data.empfullname || data.empfullname_t || 'This employee'} is already a member of this team.`, 'warning');
            this.selectedWorkerIdx = null;
            return;
          }
          let w = this.teamWorkers[this.selectedWorkerIdx];
          if (w) {
            w.empno = data.empno;
            w.empfullname_t = data.empfullname || data.empfullname_t || '';
            w.posname_t = data.posname || data.posname_t || '';
            w.emppos = data.emppos || '';
          }
          this.selectedWorkerIdx = null;
        }
      },
      async removeWorker(w, idx) {
        if (!await $msg.confirm(`ต้องการลบ ${w.empfullname_t} ออกจากทีมใช่หรือไม่?`)) {
          return;
        }
        this.teamWorkers.splice(idx, 1);
      },
      async saveTeamEdit() {
        try {
          page.loadingBox.show();

          // รวม head + workers เป็น flat list ส่งไป backend
          let formList = [];

          // head (type_tm = 'H')
          formList.push({
            ...this.teamHead,
            type_tm: 'H'
          });

          // workers (type_tm ตาม asst_tm: Y→A, N→W)
          this.teamWorkers.forEach(w => {
            if (!w.empno) return; // ข้ามถ้ายังไม่ได้เลือกพนักงาน
            formList.push({
              ...w,
              code_tm: this.teamHead.code_tm,
              name_tm: this.teamHead.name_tm,
              pg_code_tm: this.teamHead.pg_code_tm,
              empno_h: this.teamHead.empno_h,
              type_tm: (w.asst_tm === 'Y') ? 'A' : 'W',
              active_tm: w.active_tm || 'Y',
              asst_tm: w.asst_tm || 'N',
              add_by:this.teamHead.add_by,
              add_dt:this.teamHead.add_dt,
            });
          });

          const payload = { form: formList };
     
          console.log('saveTeamEdit payload', payload); 
              // return;

          let act = 'csm/master/EmpTeam_Update';
          let rsp = await $xt.postServerJson(act, payload);

          if (!rsp.success) {
            throw rsp.error;
          }

          $msg.alert('Success', 'บันทึกข้อมูลทีมสำเร็จ', 'success');
          this.$refs.formModal_team_detail.closeModal();
          await this.loadData();

        } catch (ex) {
          $msg.alert('', ex.toString(), 'danger');
        } finally {
          page.loadingBox.hide();
        }
      },

    },
    computed: {
      configData() { return store.state.configData },
      filteredEmployeeList() {
        let list = this.employeeList.filter(e => e.empno !== this.formTeam.empno_h);
        if (!this.searchMember) return list;
        let keyword = this.searchMember.toLowerCase();
        return list.filter(e =>
          String(e.empno || '').toLowerCase().includes(keyword) ||
          String(e.empfullname || '').toLowerCase().includes(keyword)
        );
      },
      filteredLeaderList() {
        if (!this.searchLeader) return this.employeeList;
        let keyword = this.searchLeader.toLowerCase();
        return this.employeeList.filter(e =>
          String(e.empno || '').toLowerCase().includes(keyword) ||
          String(e.empfullname || '').toLowerCase().includes(keyword)
        );
      },
      teamHeadPrograms() {
        let names = this.teamHead.program_names || '';
        if (!names) return [];
        return names.split(',').map(s => s.trim()).filter(s => s);
      },
      filteredProgramList() {
        let list = this.programList.filter(p => String(p.pg_code || '').toUpperCase() !== 'ALL');
        if (!this.searchProgram) return list;
        let keyword = this.searchProgram.toLowerCase();
        return list.filter(p =>
          String(p.pg_code || '').toLowerCase().includes(keyword) ||
          String(p.pg_name || '').toLowerCase().includes(keyword)
        );
      },
      ...mapState(['connectionCodeData', 'requestCodeData', 'priorityCodeData', 'serviceCodeData', 'configData', 'config', 'activeconfig', 'configReadlist']),
    },
    async mounted() {
      page = this.$refs.page;
      page.pageTitle = 'Setup :Employee Team Setup';
      document.title = page.pageTitle;

      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(500);

      appForm = this.$refs.appForm
      appForm.btnDelete.show = false
      appForm.btnSave.show =false
          appForm.btnNew.show =false
    //   appForm.btnNew.click = this.setNew
      appForm.btnImport.click = false
      appForm.btnImport.show = false
      appForm.btnExportClick.show = false
      appForm.btnExport.show = false

      this.moduleList = this.moduleForMango
      this.platformList = this.platformCodeData.map(x => ({
        id: x.id,
        name: x.name
      }))
      this.newModuleForMango = $linq(this.moduleForMango).select(s => {
        return {
          id: s,
          text: s
        }
      }).toArray()
      this.newPlatformCodeData = $linq(this.platformCodeData).select(s => {
        return {
          id: s.id,
          text: s.name
        }
      }).toArray()
      await this.list_type_pg();
    //  this.resetData();
      this.loadData();

      // โหลดข้อมูลสำหรับ Employee Team modal
      await this.loadEmployeeList();
      await this.loadProgramListForTeam();
    }
  };

  export default cpn;
</script>
<style scoped>
  .action-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }

  .action-icon {
    cursor: pointer;
    font-size: 16px;
  }

    .action-icon.edit {
      color: #000;
    }

    .action-icon.delete {
      color: #ff4d4f;
    }

  .module-scroll {
    max-height: 500px;
    overflow-y: auto;
    border: 1px solid #ddd;
  }

  /* Employee Team Form - rc-msdrop style */
  .emp-team-form {
    --rc-accent: #4f6ef7;
    --rc-accent2: #7c8cff;
    --rc-line: #eceff5;
    --rc-ink: #1e2330;
    --rc-muted: #8a93a6;
    min-height: 450px;
    overflow: visible;
  }

  .rc-msdrop {
    position: relative;
  }
  .rc-msdrop__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 34px;
    padding: 4px 10px;
    border: 1px solid var(--rc-line);
    border-radius: 9px;
    background: #fff;
    cursor: pointer;
    font-size: 13px;
    color: var(--rc-ink);
    transition: border-color .15s ease;
    gap: 6px;
  }
  .rc-msdrop__trigger:hover,
  .rc-msdrop.open .rc-msdrop__trigger {
    border-color: var(--rc-accent);
  }
  .rc-msdrop.open .rc-msdrop__trigger {
    box-shadow: 0 0 0 3px rgba(79,110,247,.12);
  }
  .rc-msdrop__placeholder {
    color: var(--rc-muted);
    flex: 1;
  }
  .rc-msdrop__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex: 1;
  }
  .rc-msdrop__tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 1px 7px;
    border-radius: 7px;
    background: #eef1fe;
    color: var(--rc-accent);
    font-size: 11.5px;
    font-weight: 600;
  }
  .rc-msdrop__tag i {
    font-size: 9px;
    cursor: pointer;
    opacity: .7;
  }
  .rc-msdrop__tag i:hover {
    opacity: 1;
  }
  .rc-msdrop__arrow {
    flex: 0 0 auto;
    font-size: 10px;
    color: var(--rc-muted);
    transition: transform .2s ease;
  }
  .rc-msdrop.open .rc-msdrop__arrow {
    transform: rotate(180deg);
  }
  .rc-msdrop__menu {
    position: absolute;
    z-index: 120;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid var(--rc-line);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(31,41,76,.12);
    max-height: 220px;
    overflow-y: auto;
    padding: 4px 0;
  }
  .rc-msdrop__menu::-webkit-scrollbar {
    width: 5px;
  }
  .rc-msdrop__menu::-webkit-scrollbar-thumb {
    background: #d3d9e6;
    border-radius: 4px;
  }
  .rc-msdrop__search {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 10px;
    border-bottom: 1px solid var(--rc-line);
    position: sticky;
    top: -5px;
    background: #fff;
    z-index: 2;
    min-height: 36px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .rc-msdrop__search i {
    font-size: 11px;
    color: var(--rc-muted);
    flex: 0 0 auto;
  }
  .rc-msdrop__search input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 12.5px;
    color: var(--rc-ink);
    background: transparent;
  }
  .rc-msdrop__search input::placeholder {
    color: var(--rc-muted);
  }
  .rc-msdrop__item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 7px 12px;
    cursor: pointer;
    font-size: 13px;
    color: var(--rc-ink);
    transition: background .1s ease;
    margin: 0;
  }
  .rc-msdrop__item:hover {
    background: #f6f7fb;
  }
  .rc-msdrop__item input[type="checkbox"] {
    accent-color: var(--rc-accent);
    width: 14px;
    height: 14px;
    cursor: pointer;
  }
  .rc-msdrop__item--active {
    background: #eef1fe;
    color: var(--rc-accent);
    font-weight: 600;
  }
  .rc-msdrop__check {
    margin-left: auto;
    font-size: 11px;
    color: var(--rc-accent);
  }
  .rc-msdrop__empty {
    padding: 10px 12px;
    font-size: 12px;
    color: var(--rc-muted);
  }

  /* ป้องกัน modal-body overflow hidden ตัด dropdown */
  .emp-team-form .form-group {
    position: relative;
  }

  /* Team Detail Modal */
  .team-detail-form {
    min-height: 400px;
  }
  .team-section {
    margin-bottom: 16px;
    padding: 12px;
    border: 1px solid #eceff5;
    border-radius: 8px;
    background: #fafbfd;
  }
  .team-section--sticky {
    position: sticky;
    top: -18px;
    z-index: 10;
    background: #fff;
    margin: -15px -15px 16px -15px;
    padding: 15px 15px 12px 15px;
    border-bottom: 1px solid #eceff5;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .team-section__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #4f6ef7;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #eceff5;
  }
  .team-section__title i {
    font-size: 14px;
  }
  .team-worker-list {
    max-height: 320px;
    overflow-y: auto;
    border: 1px solid #eceff5;
    border-radius: 6px;
  }
  .team-worker-list table {
    margin-bottom: 0;
  }

  /* Worker Cards (card style like the reference image) */
  .team-worker-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 6px;
  }
  .tw-card {
    border: 1px solid #e8ecf0;
    border-radius: 10px;
    padding: 0;
    background: #fff;
    overflow: hidden;
    transition: box-shadow .2s ease, border-color .2s ease;
    position: relative;
  }
  .tw-card:hover {
    border-color: #1976d2;
    box-shadow: 0 4px 14px rgba(25, 118, 210, 0.1);
  }
  .tw-card--inactive {
    opacity: 0.6;
    background: #f9fafb;
  }
  .tw-card__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e8ecf0;
  }
  .tw-card__no {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(135deg, #1976d2, #1565c0);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    flex: 0 0 26px;
    box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
  }
  .tw-card__info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
  .tw-card__name {
    font-size: 13px;
    font-weight: 600;
    color: #1a2a4a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tw-card__name--empty {
    color: #ef5350;
    font-style: italic;
    font-weight: 500;
  }
  .tw-card__pos {
    font-size: 11px;
    color: #7f8c8d;
    margin-top: 1px;
  }
  .tw-card__badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    background: #eceff1;
    color: #546e7a;
    flex-shrink: 0;
  }
  .tw-card__badge--asst {
    background: linear-gradient(135deg, #fff3e0, #ffe0b2);
    color: #e65100;
    border: 1px solid #ffcc80;
  }
  .tw-card__status {
    flex-shrink: 0;
    font-size: 14px;
    color: #bdbdbd;
  }
  .tw-card__status--active {
    color: #4caf50;
  }
  .tw-card__search {
    flex: 0 0 auto;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1976d2, #1565c0);
    border: none;
    color: #fff;
    box-shadow: 0 2px 6px rgba(25, 118, 210, 0.3);
    transition: transform .15s;
  }
  .tw-card__search:hover {
    transform: scale(1.1);
  }
  .tw-card__actions {
    margin-left: auto;
  }
  .tw-card__actions .btn-danger {
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 11px;
    transition: all .15s;
  }
  .tw-card__actions .btn-danger:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 6px rgba(244, 67, 54, 0.3);
  }

  /* Toggle button controls */
  .tw-card__body {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 14px;
    flex-wrap: wrap;
    border-top: 1px solid #f0f2f5;
  }
  .tw-ctrl {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .tw-ctrl__label {
    font-size: 11px;
    font-weight: 600;
    color: #90a4ae;
    white-space: nowrap;
  }
  .tw-ctrl__toggle {
    display: inline-flex;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #e0e0e0;
  }
  .tw-toggle-btn {
    border: none;
    background: #f5f5f5;
    color: #757575;
    font-size: 11px;
    font-weight: 500;
    padding: 4px 12px;
    cursor: pointer;
    transition: all .15s;
    outline: none;
  }
  .tw-toggle-btn:hover {
    background: #eeeeee;
  }
  .tw-toggle-btn--active {
    background: #1976d2;
    color: #fff;
    font-weight: 600;
  }
  .tw-toggle-btn--active:hover {
    background: #1565c0;
  }
  .tw-toggle-btn--off {
    background: #ef5350;
    color: #fff;
  }
  .tw-toggle-btn--off:hover {
    background: #e53935;
  }
  .tw-toggle-btn--asst {
    background: #f57c00;
    color: #fff;
  }
  .tw-toggle-btn--asst:hover {
    background: #ef6c00;
  }
  .tw-type-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 22px;
    border-radius: 4px;
    background: #e3f2fd;
    color: #1565c0;
    font-size: 11px;
    font-weight: 700;
  }
  .tw-ctrl__value {
    font-size: 12px;
    font-weight: 500;
    color: #455a64;
  }
  .tw-ctrl__value--on {
    color: #2e7d32;
  }
  .tw-ctrl__value--off {
    color: #9e9e9e;
  }
  .tw-card__active-icon {
    font-size: 15px;
    color: #bdbdbd;
    flex-shrink: 0;
  }
  .tw-card__active-icon--on {
    color: #4caf50;
  }
  .tw-card__role-pill {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    background: #eceff1;
    color: #546e7a;
    flex-shrink: 0;
  }
  .tw-card__role-pill--asst {
    background: linear-gradient(135deg, #fff3e0, #ffe0b2);
    color: #e65100;
    border: 1px solid #ffcc80;
  }
  .tw-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 20px;
    color: #b0bec5;
  }
  .tw-empty i {
    font-size: 32px;
    opacity: .4;
  }
  .tw-empty p {
    margin: 0;
    font-size: 13px;
  }

  /* Program tags in team detail */
  .program-tags-box {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    padding: 5px 0;
  }
  .program-tag {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 6px;
    background: #eef1fe;
    color: #4f6ef7;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  /* ============================
     Create Team Modal (tm-*)
     ============================ */
  .tm-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .tm-header__icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: linear-gradient(135deg, #4f6ef7 0%, #7c3aed 100%);
    color: #fff;
    font-size: 17px;
    box-shadow: 0 4px 12px rgba(79, 110, 247, 0.3);
  }
  .tm-header__text {
    flex: 1;
  }
  .tm-header__title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #e0dedeff;
  }
  .tm-header__sub {
    margin: 0;
    font-size: 12px;
    color: #8a93a6;
    font-weight: 400;
  }

  .tm-form {
    --tm-accent: #4f6ef7;
    --tm-teal: #0ea5a0;
    --tm-line: #eceff5;
    --tm-ink: #1e2330;
    --tm-muted: #8a93a6;
    --tm-bg: #f8f9fc;
    padding: 4px 0;
    overflow: visible;
  }

  .tm-section {
    background: var(--tm-bg);
    border: 1px solid var(--tm-line);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 14px;
    position: relative;
    overflow: visible;
  }
  .tm-section__label {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 700;
    color: var(--tm-accent);
    margin-bottom: 10px;
  }
  .tm-section__label i {
    font-size: 13px;
    opacity: .85;
  }

  .tm-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    background: var(--tm-accent);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    margin-left: 4px;
  }
  .tm-badge--teal {
    background: var(--tm-teal);
  }

  .tm-row {
    display: flex;
    gap: 12px;
  }
  .tm-field {
    flex: 1;
  }
  .tm-field--sm {
    flex: 0 0 200px;
  }
  .tm-field--lg {
    flex: 1;
  }
  .tm-field__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 5px;
  }
  .tm-field__label {
    font-size: 12px;
    font-weight: 600;
    color: var(--tm-ink);
  }
  .tm-field__label--req::after {
    content: "*";
    color: #ef5a6f;
    margin-left: 3px;
    font-weight: 700;
  }
  .tm-field__count {
    font-size: 11px;
    color: var(--tm-muted);
    font-weight: 500;
  }

  .tm-input-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1.5px solid var(--tm-line);
    border-radius: 9px;
    padding: 0 12px;
    height: 38px;
    background: #fff;
    transition: border-color .15s, box-shadow .15s;
  }
  .tm-input-wrap:focus-within {
    border-color: var(--tm-accent);
    box-shadow: 0 0 0 3px rgba(79, 110, 247, .1);
  }
  .tm-input-wrap--error {
    border-color: #ef5a6f;
  }
  .tm-input-wrap--error:focus-within {
    box-shadow: 0 0 0 3px rgba(239, 90, 111, .1);
  }
  .tm-input-icon {
    font-size: 12px;
    color: var(--tm-muted);
    flex-shrink: 0;
  }
  .tm-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 13px;
    color: var(--tm-ink);
    background: transparent;
  }
  .tm-input::placeholder {
    color: #c0c7d4;
  }

  /* Selected items list */
  .tm-selected-list {
    margin-top: 10px;
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-right: 4px;
  }
  .tm-selected-list::-webkit-scrollbar { width: 4px; }
  .tm-selected-list::-webkit-scrollbar-thumb { background: #d3d9e6; border-radius: 4px; }

  .tm-selected-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 8px;
    background: #fff;
    border: 1px solid var(--tm-line);
    transition: border-color .15s, background .15s;
  }
  .tm-selected-item:hover {
    border-color: var(--tm-accent);
    background: #f5f7ff;
  }
  .tm-selected-list--teal .tm-selected-item:hover {
    border-color: var(--tm-teal);
    background: #f0fdfb;
  }
  .tm-selected-item__no {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--tm-accent);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .tm-selected-list--teal .tm-selected-item__no {
    background: var(--tm-teal);
  }
  .tm-selected-item__name {
    flex: 1;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--tm-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tm-selected-item__rm {
    font-size: 13px;
    color: #d1d5e0;
    cursor: pointer;
    transition: color .15s;
    flex-shrink: 0;
  }
  .tm-selected-item__rm:hover {
    color: #ef5a6f;
  }

  .tm-empty-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 28px 12px;
    border: 1.5px dashed #d3d9e6;
    border-radius: 10px;
    margin-top: 10px;
    color: var(--tm-muted);
    font-size: 12.5px;
  }
  .tm-empty-slot i {
    font-size: 16px;
    opacity: .5;
  }

  /* Footer */
  .tm-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
  .tm-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 18px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all .15s ease;
  }
  .tm-btn--ghost {
    background: #f4f6fb;
    color: var(--tm-muted);
    border: 1px solid var(--tm-line);
  }
  .tm-btn--ghost:hover {
    background: #eceff5;
    color: var(--tm-ink);
  }
  .tm-btn--primary {
    background: linear-gradient(135deg, #4f6ef7 0%, #7c3aed 100%);
    color: #fff;
    box-shadow: 0 4px 14px rgba(79, 110, 247, .3);
  }
  .tm-btn--primary:hover {
    box-shadow: 0 6px 20px rgba(79, 110, 247, .4);
    transform: translateY(-1px);
  }

  /* Tag variant for programs */
  .rc-msdrop__tag--teal {
    background: #e6faf9;
    color: var(--tm-teal);
  }

  /* Fix: dropdown ไม่ทับ footer */
  .tm-form .rc-msdrop {
    position: relative;
  }
  .tm-form .rc-msdrop__menu {
    max-height: 160px;
    z-index: 9999;
  }
  .tm-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    min-height: 280px;
    padding-bottom: 40px;
  }
</style>
