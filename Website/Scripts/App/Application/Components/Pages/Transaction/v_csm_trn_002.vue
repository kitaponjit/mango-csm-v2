<template>
  <div class="csm-request-page">
    <re-page ref="page">
      <template #body>
        <div class="csm-container animated fadeIn">
          <!-- Page Header -->
          <div class="csm-page-header">
            <div class="csm-page-header__left">
              <h2 class="csm-page-title">{{ ui.csm_trn2_page_title }}</h2>
              <span class="csm-page-subtitle">{{ ui.csm_trn2_page_subtitle }}</span>
            </div>
            <div class="csm-page-header__right">
              <span class="csm-badge csm-badge--count" v-if="header.length > 0">
                <i class="fas fa-inbox"></i> {{ totalRequests }} {{ ui.csm_remain_unit_item }}
              </span>
            </div>
          </div>

          <!-- Tabs -->
          <div class="csm-tabs">
            <button v-for="tab in tabs" :key="tab.id"
                    class="csm-tab-btn"
                    :class="{ 'csm-tab-btn--active': selectedTabs == tab.id }"
                    @click="changeTab(tab.id)">
              <i :class="tab.icon"></i>
              <span>{{ tab.name }}</span>
              <span class="csm-tab-indicator" v-if="selectedTabs == tab.id"></span>
            </button>
          </div>

          <!-- Tab Content -->
          <div class="csm-tab-content">
            <!-- Tab 1: แจ้งเรื่อง -->
            <div class="csm-tab-pane" v-show="selectedTabs == 'tab_header1'">
              <!-- Search & Actions Bar -->
              <div class="csm-toolbar">
                <div class="csm-toolbar__search">
                  <div class="csm-search-group">
                    <select class="csm-select" v-model="form['field']">
                      <option v-for="x in searchParams" :key="x.key" :value="x.key">{{ x.name }}</option>
                    </select>
                    <select class="csm-select" v-model="form['status']">
                      <option v-for="x in statusParams" :key="x.key" :value="x.key">{{ x.name }}</option>
                    </select>
                    <div class="csm-search-input-wrap">
                      <i class="fas fa-search csm-search-icon"></i>
                      <input type="text" class="csm-search-input"
                             :placeholder="ui.csm_trn2_search_placeholder"
                             v-model="form['text']"
                             @keyup.enter="beforeOnReadList('tab_header1')"
                             :disabled="form.field === 'add_dt'">
                    </div>
                    <button class="csm-btn csm-btn--search" @click="beforeOnReadList('tab_header1')">
                      <i class="fas fa-search"></i> {{ ui.search }}
                    </button>
                  </div>
                  <!-- Date Range -->
                  <div class="csm-date-range" v-if="form.field === 'add_dt'">
                    <datepicker v-model="form['start_date']" input-class="csm-date-input" :placeholder="ui.erp_from_date"></datepicker>
                    <span class="csm-date-separator">{{ ui.erp_to }}</span>
                    <datepicker v-model="form['end_date']" input-class="csm-date-input" :placeholder="ui.erp_to_date"></datepicker>
                  </div>
                </div>
                <div class="csm-toolbar__actions">
                  <button class="csm-btn csm-btn--outline" @click="export_excel()">
                    <i class="fas fa-file-export"></i> {{ ui.erp_export_excel }}
                  </button>
                  <button class="csm-btn csm-btn--success" :disabled="CheckedArrLenght(selectedData)" @click="CreateAndRejectData('C')">
                    <i class="fas fa-plus-circle"></i> {{ ui.csm_create }}
                  </button>
                  <button class="csm-btn csm-btn--danger" :disabled="CheckedArrLenght(selectedData)" @click="openModalReject()">
                    <i class="fas fa-ban"></i> {{ ui.csm_v2_status_reject }}
                  </button>
                </div>
              </div>

              <!-- Status Legend -->
              <div class="csm-status-legend">
                <span class="csm-legend-item"><span class="csm-legend-dot csm-legend-dot--pending"></span> {{ ui.erp_pending }}</span>
                <span class="csm-legend-item"><span class="csm-legend-dot csm-legend-dot--wait"></span> {{ ui.csm_status_wait }}</span>
                <span class="csm-legend-item"><span class="csm-legend-dot csm-legend-dot--progress"></span> {{ ui.csm_v2_status_in_progress }}</span>
                <span class="csm-legend-item"><span class="csm-legend-dot csm-legend-dot--complete"></span> {{ ui.erp_complete }}</span>
              </div>

              <!-- Data Table (Body Section) -->
              <div class="csm-table-wrap">
                  <table class="csm-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{{ ui.erp_no }}</th>
                        <th>{{ ui.csm_trn2_req_no }}</th>
                        <th>{{ ui.csm_trn2_req_date }}</th>
                        <th>{{ ui.csm_v2_convenient_date }}</th>
                        <th>{{ ui.csm_trn2_time_range }}</th>
                        <th>{{ ui.csm_trn2_backup_date }}</th>
                        <th>{{ ui.csm_trn2_time_range_backup }}</th>
                        <th>{{ ui.erp_bd_phone }}</th>
                        <th v-if="isMango()">{{ ui.erp_module }}</th>
                        <th v-if="!isMango()">{{ ui.csm_trn_field_area }}</th>
                        <th>{{ ui.csm_v2_subject }}</th>
                        <th>{{ ui.csm_v2_description }}</th>
                        <th>{{ ui.csm_trn2_additional_note }}</th>
                        <th>{{ ui.csm_trn2_picture }}</th>
                        <th>CSM</th>
                        <th>{{ ui.csm_trn2_task_no }}</th>
                        <th>{{ ui.csm_trn_checker }}</th>
                        <th v-if="showHStatusColumns">{{ ui.erp_requestor }}</th>
                        <th v-if="showHStatusColumns">{{ ui.csm_trn_worker }}</th>
                        <th v-if="showHStatusColumns">{{ ui.csm_trn_field_response_date }}</th>
                        <th v-if="showHStatusColumns">{{ ui.csm_v2_due_date }}</th>
                        <th v-if="showHStatusColumns">{{ ui.csm_trn_field_service_type }}</th>
                        <th v-if="showHStatusColumns">{{ ui.erp_duration }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="item in header">
                        <tr class="csm-group-row csm-group-row--project">
                          <td colspan="24">
                            <i class="fas fa-building"></i>
                            <span>{{ item.pre_des }} <span class="csm-project-no">({{ ui.erp_project_no }} {{ item.pre_event2 }}<template v-if="item.pre_event !== item.pre_event2"> / {{ ui.erp_phase_no }} {{ item.pre_event }}</template>)</span></span>
                          </td>
                        </tr>
                        <template v-for="g in item.group_contract">
                          <tr class="csm-group-row csm-group-row--contract">
                            <td>
                              <div class="csm-checkbox-wrap">
                                <label class="csm-checkbox">
                                  <input type="checkbox" true-value="Y" false-value="N" v-model="g.select" :disabled="g.disabled" @change="selectRow_header(item, g, item)" />
                                  <span class="csm-checkbox__mark"></span>
                                </label>
                              </div>
                            </td>
                            <td colspan="23">
                              <i class="fas fa-user"></i>
                              <span>{{ g.contract }}</span>
                            </td>
                          </tr>
                          <tr v-for="(v, index) in g.detail" :key="v.reqno + '_' + index"
                              class="csm-data-row"
                              :class="{ 'csm-row--pending': v.status == 'N' && v.h_status == '' && v.d_status == '',
                                        'csm-row--complete': v.status == 'S' && v.h_status == 'Y' && (v.d_status == 'Y' || v.d_status == 'R'),
                                        'csm-row--wait': (v.status == 'S' || v.status == 'N') && (v.h_status == 'W' || v.h_status == 'H') && (v.d_status == 'W' || v.d_status == 'Y'),
                                        'csm-row--progress': v.h_status == 'I' }">
                            <td>
                              <div class="csm-checkbox-wrap">
                                <label class="csm-checkbox">
                                  <input type="checkbox" true-value="Y" false-value="N" v-model="v.select" :disabled="!xt.isEmpty(v.job_no)" @change="selectRow_detail(g, v, item)" />
                                  <span class="csm-checkbox__mark"></span>
                                </label>
                              </div>
                            </td>
                            <td align="center">{{ index + 1 }}</td>
                            <td align="center"><span class="csm-reqno">{{ v.reqno }}</span></td>
                            <td align="center">{{ $date(v.add_dt, 'DD/MM/YYYY HH:mm') }}</td>
                            <td align="center">{{ $date(v.date_convenient1, 'DD/MM/YYYY') }}</td>
                            <td align="center">{{ $date(v.stdate_convenient1, 'HH:mm') }} - {{ $date(v.enddate_convenient1, 'HH:mm') }}</td>
                            <td align="center">{{ $date(v.date_convenient2, 'DD/MM/YYYY') }}</td>
                            <td align="center">{{ $date(v.stdate_convenient2, 'HH:mm') }} - {{ $date(v.enddate_convenient2, 'HH:mm') }}</td>
                            <td>{{ v.contract_tel }}</td>
                            <td v-if="isMango()" align="center">{{ v.module }}</td>
                            <td v-if="!isMango()" align="center">{{ v.locname }}</td>
                            <td>{{ v.subject }}</td>
                            <td>{{ v.description }}</td>
                            <td>{{ v.note }}</td>
                            <td align="center">
                              <button class="csm-btn-icon" @click="viewImage(v.picture)">
                                <i class="fas fa-image"></i>
                                <span class="csm-btn-icon__badge" v-if="v.picture.length > 0">{{ v.picture.length }}</span>
                              </button>
                            </td>
                            <td align="center">
                              <a v-bind:href="openReq(v)" target="_blank" class="csm-link">{{ v.job_no }}</a>
                            </td>
                            <td align="center">{{ v.task_no }}</td>
                            <td align="center">{{ v.checker_name }}</td>
                            <td v-if="showHStatusColumns" align="center">{{ v.req_name }}</td>
                            <td v-if="showHStatusColumns" align="center">{{ v.assign_name }}</td>
                            <td v-if="showHStatusColumns" align="center">{{ $date(v.response_date, 'DD/MM/YYYY') }}</td>
                            <td v-if="showHStatusColumns" align="center">{{ $date(v.due_date, 'DD/MM/YYYY') }}</td>
                            <td v-if="showHStatusColumns" align="center">{{ v.item_name || '' }}</td>
                            <td v-if="showHStatusColumns" align="center" class="fw-bold">{{ v.diff_days != null ? v.diff_days + ' ' + ui.erp_day : '' }}</td>
                          </tr>
                        </template>
                      </template>
                    </tbody>
                  </table>
              </div>
            </div>

            <!-- Tab 2: Reject -->
            <div class="csm-tab-pane" v-show="selectedTabs == 'tab_header2'">
              <div class="csm-toolbar">
                <div class="csm-toolbar__search">
                  <div class="csm-search-group">
                    <select class="csm-select" v-model="form['field']">
                      <option v-for="x in searchParamsReject" :key="x.key" :value="x.key">{{ x.name }}</option>
                    </select>
                    <div class="csm-search-input-wrap">
                      <i class="fas fa-search csm-search-icon"></i>
                      <input type="text" class="csm-search-input"
                             :placeholder="ui.csm_trn2_search_placeholder"
                             v-model="form['text']"
                             @keyup.enter="beforeOnReadList('tab_header2')">
                    </div>
                    <button class="csm-btn csm-btn--search" @click="beforeOnReadList('tab_header2')">
                      <i class="fas fa-search"></i> {{ ui.search }}
                    </button>
                  </div>
                  <div class="csm-date-range" v-if="form.field === 'add_dt'">
                    <datepicker v-model="form['start_date']" input-class="csm-date-input" :placeholder="ui.erp_from_date"></datepicker>
                    <span class="csm-date-separator">{{ ui.erp_to }}</span>
                    <datepicker v-model="form['end_date']" input-class="csm-date-input" :placeholder="ui.erp_to_date"></datepicker>
                  </div>
                </div>
              </div>

              <div class="csm-table-wrap">
                  <table class="csm-table">
                    <thead>
                      <tr>
                        <th>{{ ui.erp_no }}</th>
                        <th>{{ ui.csm_trn2_req_no }}</th>
                        <th>{{ ui.csm_trn2_req_date }}</th>
                        <th>{{ ui.csm_v2_convenient_date }}</th>
                        <th>{{ ui.csm_trn2_time_range }}</th>
                        <th>{{ ui.csm_trn2_backup_date }}</th>
                        <th>{{ ui.csm_trn2_time_range_backup }}</th>
                        <th>{{ ui.erp_bd_phone }}</th>
                        <th>{{ ui.erp_module }}</th>
                        <th>{{ ui.csm_v2_subject }}</th>
                        <th>{{ ui.csm_v2_description }}</th>
                        <th>{{ ui.csm_trn_cancel_reason }}</th>
                        <th>{{ ui.csm_trn2_picture }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="item in header">
                        <tr class="csm-group-row csm-group-row--project">
                          <td colspan="14">
                            <i class="fas fa-building"></i>
                            <span>{{ item.pre_des }} <span class="csm-project-no">({{ ui.erp_project_no }} {{ item.pre_event2 }}<template v-if="item.pre_event !== item.pre_event2"> / {{ ui.erp_phase_no }} {{ item.pre_event }}</template>)</span></span>
                          </td>
                        </tr>
                        <template v-for="g in item.group_contract">
                          <tr class="csm-group-row csm-group-row--contract">
                            <td colspan="13">
                              <i class="fas fa-user"></i>
                              <span>{{ g.contract }}</span>
                            </td>
                          </tr>
                          <tr v-for="(v, index) in g.detail" :key="'rej_' + v.reqno + '_' + index" class="csm-data-row csm-row--reject">
                            <td align="center">{{ index + 1 }}</td>
                            <td align="center"><span class="csm-reqno">{{ v.reqno }}</span></td>
                            <td align="center">{{ $date(v.add_dt, 'DD/MM/YYYY HH:mm') }}</td>
                            <td align="center">{{ $date(v.date_convenient1, 'DD/MM/YYYY') }}</td>
                            <td align="center">{{ $date(v.stdate_convenient1, 'HH:mm') }} - {{ $date(v.enddate_convenient1, 'HH:mm') }}</td>
                            <td align="center">{{ $date(v.date_convenient2, 'DD/MM/YYYY') }}</td>
                            <td align="center">{{ $date(v.stdate_convenient2, 'HH:mm') }} - {{ $date(v.enddate_convenient2, 'HH:mm') }}</td>
                            <td>{{ v.contract_tel }}</td>
                            <td align="center">{{ v.module }}</td>
                            <td>{{ v.subject }}</td>
                            <td>{{ v.description }}</td>
                            <td><span class="csm-reject-reason" v-if="!xt.isEmpty(v.reject_remark)">{{ v.reject_remark }}</span></td>
                            <td align="center">
                              <button class="csm-btn-icon" @click="viewImage(v.picture)">
                                <i class="fas fa-image"></i>
                                <span class="csm-btn-icon__badge" v-if="v.picture.length > 0">{{ v.picture.length }}</span>
                              </button>
                            </td>
                          </tr>
                        </template>
                      </template>
                    </tbody>
                  </table>
              </div>
            </div>
          </div>
        </div>
      </template>
    </re-page>

    <!-- Reject Modal -->
    <modal-2 ref="rejectModal">
      <template #header>
        <div class="csm-modal-header">
          <div class="csm-modal-header__icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h4>{{ ui.csm_trn2_modal_reject_title }}</h4>
        </div>
      </template>
      <template #body>
        <div class="csm-modal-body">
          <label class="csm-modal-label">{{ ui.csm_trn2_modal_reject_label }} <span class="csm-required">*</span></label>
          <textarea class="csm-textarea" v-model.trim="rejectRemark" :placeholder="ui.csm_trn2_modal_reject_placeholder"></textarea>
        </div>
      </template>
      <template #footer>
        <div class="clearfix" style="width:100%">
          <button class="csm-btn csm-btn--ghost pull-left" @click="$refs.rejectModal.closeModal()">
            <i class="fas fa-times"></i> {{ ui.cancel || 'Cancel' }}
          </button>
          <button class="csm-btn csm-btn--danger pull-right" @click="rejectTask()">
            <i class="fa fa-check"></i> {{ ui.csm_trn2_confirm_reject }}
          </button>
        </div>
      </template>
    </modal-2>
  </div>
</template>

<script>
  let page = {}

  import PhotoSwipe from 'photoswipe';
  import 'photoswipe/style.css';

  export default {
    data() {
      return {
        auth,
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        xt: $xt,
        rejectRemark: '',
        company: window.baseCompany,
        /*------ Select Tabs------*/
        selectedTabs: 'tab_header1',
        tabs: [
          { name: window.ui.csm_trn2_tab_notify, status: false, icon: 'fas fa-clipboard-list', id: "tab_header1" },
          { name: window.ui.csm_v2_status_reject, status: false, icon: 'fas fa-times-circle', id: "tab_header2" }
        ],
        /*---- Search Params -------*/
        form: {
          field: "reqno",
          text: "",
          status: "N",
          start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
        searchParams: [
          { name: window.ui.csm_trn2_req_no, key: 'reqno' },
          { name: window.ui.erp_contact_name, key: 'contract' },
          { name: window.ui.erp_project_name, key: 'pre_des' },
          { name: window.ui.csm_v2_tel, key: 'phone' },
          { name: window.ui.csm_trn2_req_date, key: 'add_dt' },
          { name: window.ui.erp_csm_no, key: 'job_no' },
          { name: window.ui.erp_requestor, key: 'req_name' },
          { name: window.ui.csm_trn_worker, key: 'assign_name' },
        ],
        searchParamsReject: [
          { name: window.ui.csm_trn2_req_no, key: 'reqno' },
          { name: window.ui.erp_contact_name, key: 'contract' },
          { name: window.ui.erp_project_name, key: 'pre_des' },
          { name: window.ui.csm_v2_tel, key: 'phone' },
          { name: window.ui.csm_trn2_req_date, key: 'add_dt' },
        ],
        statusParams: [
          { name: window.ui.csm_v2_status_all, key: 'ALL' },
          { name: window.ui.erp_pending, key: 'N' },
          { name: window.ui.csm_status_wait, key: 'W' },
          { name: window.ui.csm_v2_status_in_progress, key: 'I' },
          { name: window.ui.erp_complete, key: 'Y' },
        ],
        header: [],
        pics: [],
        openPicture: false,
        selectedData: [],
        storeMapLocation: {},
      }
    },
    methods: {
      isMango() {
        let isMango = $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault();
        return isMango == "Y" ? true : false;
      },
      CheckedArrLenght(arr = []) {
        return arr.length == 0
      },
      changeTab(id) {
        if (id === 'tab_header1') {
          this.selectedData = []
        }
        this.selectedTabs = id
        this.beforeOnReadList(id)
      },
      async beforeOnReadList(keyword) {
        page.loadingBox.show();

        let url = ""
        let f = this.form

        let start_dt = moment(f.start_date).format('YYYY-MM-DD')
        let end_dt = moment(f.end_date).format('YYYY-MM-DD')

        if (keyword == 'tab_header1') {
          url = `CSM/Data/CSM_Line_ReadListX?field=${f.field}&text=${encodeURIComponent(f.text)}&status=${f.status}&baseUrl=${window.dataServer}`
          if (f.field === 'add_dt') {
            url += `&start_date=${encodeURIComponent(start_dt)}&end_date=${encodeURIComponent(end_dt)}`
          }
        } else {
          url = `CSM/Data/CSM_Line_ReadListX?field=${f.field}&text=${encodeURIComponent(f.text)}&status=R&baseUrl=${window.dataServer}`
          if (f.field === 'add_dt') {
            url += `&start_date=${encodeURIComponent(start_dt)}&end_date=${encodeURIComponent(end_dt)}`
          }
        }
        await this.OnReadList(url)
        page.loadingBox.hide();

      },
      async OnReadList(url) {
        let rsp = await $xt.getServer(url);
        this.header = rsp.data
      },
      async selectRow_header(h, d, itm) {
        $linq(h.group_contract).where(x => x.contract == d.contract).firstOrDefault().detail.forEach(x => this.$set(x, "select", $xt.isEmpty(x.job_no) ? d.select : "N"))
        let isnotIn_contract = $linq(h.group_contract).where(x => x.contract != d.contract).toArray()
        isnotIn_contract.forEach(x => {
          this.$set(x, "select", "N")
          x.detail.forEach(x => this.$set(x, "select", "N"))
        })
        let filter_contract = $linq(h.group_contract).where(x => x.contract == d.contract).firstOrDefault()

        let onlyDraft = $linq(filter_contract.detail).where(x => $xt.isEmpty(x.job_no)).toArray()

        this.$set(this, "selectedData", filter_contract.select == "Y" ? onlyDraft : [])

        await $xt.sleep(100)
        await this.clearCheckboxList(h.pre_event)

        this.$forceUpdate();
      },
      async selectRow_detail(h, d, itm) {
        let filter_contract_inproj = $linq(itm.group_contract).where(x => x.contract != h.contract).toArray()
        filter_contract_inproj.forEach(x => {
          this.$set(x, "select", "N")
          x.detail.forEach(v => {
            this.$set(v, "select", "N")
          })
        })

        let detail_arr = $linq(h.detail).where(x => $xt.isEmpty(x.job_no)).toArray()
        let isChecked = $linq(detail_arr).all(x => x.select == "Y")
        this.$set(h, "select", isChecked == true ? "Y" : "N")
        this.$set(this, "selectedData", $linq(h.detail).where(x => $xt.isEmpty(x.job_no) && x.select == "Y").toArray())

        await $xt.sleep(100)
        await this.clearCheckboxList(d.pre_event)

        this.$forceUpdate();
      },
      async clearCheckboxList(pre_event) {
        let item = $linq(this.header).where(x => x.pre_event != pre_event).toArray()
        $linq(item).foreach(x => {
          $linq(x.group_contract).foreach(w => {
            this.$set(w, "select", "N")
            $linq(w.detail).where(g => $xt.isEmpty(g.job_no)).foreach(v => {
              this.$set(v, "select", "N")
            })
          })
        })
      },
      createFilePath(x) {
        return dataServer + "Api/File/DownLoad?id=" + x
      },
      viewImage(source) {
        this.pics = source
        const options = {
          dataSource: source,
          showHideAnimationType: 'none'
        };

        const pswp = new PhotoSwipe(options);
        pswp.on('uiRegister', function () {
          pswp.ui.registerElement({
            name: 'bulletsIndicator',
            className: 'pswp__bullets-indicator',
            appendTo: 'wrapper',
            onInit: (el, pswp) => {
              const bullets = [];
              let bullet;
              let prevIndex = -1;

              for (let i = 0; i < pswp.getNumItems(); i++) {
                bullet = document.createElement('div');
                bullet.className = 'pswp__bullet';
                bullet.onclick = (e) => {
                  pswp.goTo(bullets.indexOf(e.target));
                };
                el.appendChild(bullet);
                bullets.push(bullet);
              }

              pswp.on('change', (a,) => {
                if (prevIndex >= 0) {
                  bullets[prevIndex].classList.remove('pswp__bullet--active');
                }
                bullets[pswp.currIndex].classList.add('pswp__bullet--active');
                prevIndex = pswp.currIndex;
              });
            }
          });
          pswp.ui.registerElement({
            name: 'download-button',
            order: 8,
            isButton: true,
            tagName: 'a',

            html: {
              isCustomSVG: true,
              inner: '<path d="M20.5 14.3 17.1 18V10h-2.2v7.9l-3.4-3.6L10 16l6 6.1 6-6.1ZM23 23H9v2h14Z" id="pswp__icn-download"/>',
              outlineID: 'pswp__icn-download'
            },

            onInit: (el, pswp) => {
              el.setAttribute('download', '');
              el.setAttribute('target', '_blank');
              el.setAttribute('rel', 'noopener');

              pswp.on('change', () => {
                el.href = pswp.currSlide.data.src;
              });
            }
          });
          pswp.ui.registerElement({
            name: 'custom-caption',
            order: 9,
            isButton: false,
            appendTo: 'root',
            html: 'Caption text',
            onInit: (el, pswp) => {
              pswp.on('change', () => {
                const currSlideElement = pswp.currSlide.data.alt;
                el.innerHTML = currSlideElement || '';
              });
            }
          });
        });
        pswp.init();
      },
      async CreateAndRejectData(keyword) {
        page.loadingBox.show();
        if (keyword == "C") {
          let f = this.selectedData[0]

          let sb2 = $linq(this.selectedData).select(x => x.subject).toArray();

          let formData = {
            pre_event: f.pre_event,
            pre_event2: f.pre_event2,
            pre_des: f.pre_des,
            phone: f.contract_tel,
            contract_user: f.contract,
            customer_code: f.customer_code,
            customer_name: f.customer_name,
            remark: f.note,
            subject: f.subject,
            request_empno: auth.empno,
            job_date: new Date()
          }

          let detailData = []
          let itemno = 1
          let attachmentData = []
          this.selectedData.forEach(x => {
            detailData.push({
              add_dt: new Date(),
              subject: x.subject,
              detail: x.description,
              itemno: itemno,
              is_db: false,
              status_tmp: "W",
              ref_docno: x.reqno,
              ref_docdate: x.add_dt,
              status: "W",
              map_desc: x.map_desc || '',
              map_gps: x.map_gps || '',
              map_url: x.map_url || ''
            })
            x.picture.forEach(p => {
              attachmentData.push({
                description: p.description,
                filename: p.filename,
                filepath: p.file_hex,
                item_type: "B",
                itemno: p.itemno,
                ref_itemno: itemno,
                add_dt: new Date()
              })
            })
            itemno++
          })

          localStorage.setItem('X-Customer-Draft', JSON.stringify({
            formData,
            detailData,
            attachmentData
          }))
          window.open(baseUrl + `page/transaction/v_csm_trn_001/`)

        } else {

          let ff = this.selectedData.map(item => ({
            ...item,
            reject_remark: this.rejectRemark
          }));

          let url = `CSM/Data/CSM_Line_Reject`
          let f = {
            data: ff,
          }
          await $xt.postServerJson(url, f);
          this.changeTab(this.selectedTabs)
        }
        page.loadingBox.hide();
      },
      async export_excel() {
        if (!await $msg.confirm(this.ui.csm_trn2_confirm_export_excel)) return;

        let f = this.form;
        let start_dt = moment(f.start_date).format('YYYY-MM-DD');
        let end_dt = moment(f.end_date).format('YYYY-MM-DD');
        let url = `CSM/Data/CSM_Line_Export?field=${f.field}&text=${f.text}&status=${f.status}`;
        if (f.field === 'add_dt') {
          url += `&start_date=${encodeURIComponent(start_dt)}&end_date=${encodeURIComponent(end_dt)}`;
        }

        let rsp = await $xt.postServerJson(url, f);
        window.open(window.dataServer + `API/File/DownLoad?download=true&id=${rsp.data}`)

        $notify.success(this.ui.alert_save_success);
      },
      async rejectTask() {
        if ($xt.isEmpty(this.rejectRemark)) {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn2_alert_require_reject_remark, `warning`)
          return
        }
        await this.CreateAndRejectData('R')
        $notify.success(this.ui.csm_trn2_reject_success)
        this.$refs.rejectModal.closeModal()
      },
      openModalReject() {
        this.rejectRemark = ''
        this.$refs.rejectModal.openModal()
      },
      openReq(x) {
        x = x || ''
        if ($xt.isEmpty(x)) {
          return this.baseUrl + `page/Transaction/v_csm_trn_001/`
        }
        else {
          return this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${x.job_no}`
        }
      },
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = this.ui.csm_trn2_page_title
      document.title = page.pageTitle
      this.beforeOnReadList("tab_header1")
    },
    computed: {
      configData() { return store.state.configData },
      showHStatusColumns() {
        return this.header.some(item =>
          item.group_contract.some(g =>
            g.detail.some(v => v.h_status == 'Y' || v.h_status == 'W' || v.h_status == 'I' || v.h_status == 'H')
          )
        );
      },
      totalRequests() {
        let count = 0;
        this.header.forEach(item => {
          item.group_contract.forEach(g => {
            count += g.detail.length;
          });
        });
        return count;
      }
    },
  }
</script>

<style scoped>
  /* ============================================================
   * CSM Request Page - Modern UI
   * Clean, professional dashboard aesthetic
   * ============================================================ */

  .csm-request-page {
    --csm-primary: #2563eb;
    --csm-primary-light: #dbeafe;
    --csm-primary-dark: #1d4ed8;
    --csm-success: #059669;
    --csm-success-light: #d1fae5;
    --csm-danger: #dc2626;
    --csm-danger-light: #fee2e2;
    --csm-warning: #d97706;
    --csm-warning-light: #fef3c7;
    --csm-gray-50: #f8fafc;
    --csm-gray-100: #f1f5f9;
    --csm-gray-200: #e2e8f0;
    --csm-gray-300: #cbd5e1;
    --csm-gray-400: #94a3b8;
    --csm-gray-500: #64748b;
    --csm-gray-600: #475569;
    --csm-gray-700: #334155;
    --csm-gray-800: #1e293b;
    --csm-gray-900: #0f172a;
    --csm-radius: 8px;
    --csm-radius-lg: 12px;
    --csm-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --csm-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
    --csm-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --csm-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    display: flex;
    flex-direction: column;
    height: calc(100vh - 60px);
    overflow: hidden;
  }

  .csm-container {
    padding: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Page Header */
  .csm-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 28px;
    background: linear-gradient(135deg, #0f2744 0%, #1e4078 50%, #2563eb 100%);
    border-radius: var(--csm-radius-lg) var(--csm-radius-lg) 0 0;
    margin: -10px -10px 0 -10px;
    flex-shrink: 0;
  }

  .csm-page-title {
    font-size: 22px;
    font-weight: 700;
    color: #ffffff !important;
    margin: 0;
    letter-spacing: -0.3px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .csm-page-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
    margin-top: 3px;
    display: block;
    font-weight: 400;
  }

  .csm-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
  }

  .csm-badge--count {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    font-size: 14px;
  }

  /* Tabs */
  .csm-tabs {
    display: flex;
    gap: 4px;
    padding: 12px 24px 0;
    background: #ffffff;
    border-bottom: 1px solid var(--csm-gray-200);
    margin: 0 -10px;
    flex-shrink: 0;
  }

  .csm-tab-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: none;
    background: transparent;
    color: var(--csm-gray-500);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: var(--csm-radius) var(--csm-radius) 0 0;
    transition: var(--csm-transition);
  }

  .csm-tab-btn:hover {
    color: var(--csm-primary);
    background: var(--csm-primary-light);
  }

  .csm-tab-btn--active {
    color: var(--csm-primary);
    background: #ffffff;
  }

  .csm-tab-indicator {
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--csm-primary);
    border-radius: 3px 3px 0 0;
  }

  /* Tab Content */
  .csm-tab-content {
    padding: 16px 24px;
    background: #ffffff;
    margin: 0 -10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .csm-tab-pane {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  /* Toolbar */
  .csm-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  .csm-toolbar__search {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .csm-search-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .csm-select {
    padding: 8px 32px 8px 12px;
    border: 1px solid var(--csm-gray-200);
    border-radius: var(--csm-radius);
    font-size: 13px;
    color: var(--csm-gray-700);
    background: #ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M2.5 4.5L6 8l3.5-3.5'/%3E%3C/svg%3E") no-repeat right 10px center;
    appearance: none;
    cursor: pointer;
    transition: var(--csm-transition);
    min-width: 120px;
  }

  .csm-select:focus {
    outline: none;
    border-color: var(--csm-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .csm-search-input-wrap {
    position: relative;
    min-width: 280px;
  }

  .csm-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--csm-gray-400);
    font-size: 13px;
  }

  .csm-search-input {
    width: 100%;
    padding: 8px 12px 8px 34px;
    border: 1px solid var(--csm-gray-200);
    border-radius: var(--csm-radius);
    font-size: 13px;
    color: var(--csm-gray-700);
    transition: var(--csm-transition);
  }

  .csm-search-input:focus {
    outline: none;
    border-color: var(--csm-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .csm-search-input:disabled {
    background: var(--csm-gray-100);
    cursor: not-allowed;
  }

  .csm-search-input::placeholder {
    color: var(--csm-gray-400);
  }

  /* Date Range */
  .csm-date-range {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .csm-date-separator {
    color: var(--csm-gray-500);
    font-size: 13px;
    font-weight: 500;
  }

  .csm-date-range >>> .csm-date-input {
    padding: 8px 12px;
    border: 1px solid var(--csm-gray-200);
    border-radius: var(--csm-radius);
    font-size: 13px;
    width: 140px;
  }

  /* Buttons */
  .csm-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: var(--csm-radius, 8px);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--csm-transition, all 0.2s cubic-bezier(0.4, 0, 0.2, 1));
    white-space: nowrap;
  }

  .csm-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .csm-btn--search {
    background: var(--csm-primary, #2563eb);
    color: #ffffff;
  }

  .csm-btn--search:hover {
    background: var(--csm-primary-dark, #1d4ed8);
    box-shadow: var(--csm-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
  }

  .csm-btn--success {
    background: var(--csm-success, #059669);
    color: #ffffff;
  }

  .csm-btn--success:hover:not(:disabled) {
    background: #047857;
    box-shadow: var(--csm-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
  }

  .csm-btn--danger {
    background: var(--csm-danger, #dc2626);
    color: #ffffff;
  }

  .csm-btn--danger:hover:not(:disabled) {
    background: #b91c1c;
    box-shadow: var(--csm-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
  }

  .csm-btn--outline {
    background: #ffffff;
    color: var(--csm-gray-700, #334155);
    border: 1px solid var(--csm-gray-200, #e2e8f0);
  }

  .csm-btn--outline:hover {
    background: var(--csm-gray-50, #f8fafc);
    border-color: var(--csm-gray-300, #cbd5e1);
  }

  .csm-btn--ghost {
    background: transparent;
    color: var(--csm-gray-600, #475569);
    border: 1px solid var(--csm-gray-200, #e2e8f0);
  }

  .csm-btn--ghost:hover {
    background: var(--csm-gray-100, #f1f5f9);
  }

  .csm-toolbar__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Status Legend */
  .csm-status-legend {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    background: var(--csm-gray-50);
    border-radius: var(--csm-radius);
    border: 1px solid var(--csm-gray-100);
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  .csm-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--csm-gray-600);
    font-weight: 500;
  }

  .csm-legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .csm-legend-dot--pending {
    background: var(--csm-gray-700);
  }

  .csm-legend-dot--wait {
    background: var(--csm-danger);
  }

  .csm-legend-dot--progress {
    background: var(--csm-primary);
  }

  .csm-legend-dot--complete {
    background: var(--csm-success);
  }

  /* Table */
  .csm-table-wrap {
    border-radius: var(--csm-radius-lg);
    border: 1px solid var(--csm-gray-200);
    overflow: auto;
    box-shadow: var(--csm-shadow-sm);
    flex: 1;
  }

  .csm-table {
    width: max-content;
    min-width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 13px;
    table-layout: fixed;
  }

  .csm-table thead {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .csm-table thead tr {
    background: linear-gradient(135deg, #1e3a5f 0%, #2a4a7f 100%);
  }

  .csm-table thead th {
    padding: 14px 14px;
    font-weight: 600;
    color: #ffffff;
    text-align: center;
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.12);
    white-space: nowrap;
    font-size: 13px;
    text-transform: none;
    letter-spacing: 0;
    background: inherit;
    min-width: 120px;
  }

  .csm-table thead th:first-child {
    min-width: 50px;
  }

  .csm-table thead th:nth-child(2) {
    min-width: 50px;
  }

  .csm-table thead th:last-child {
    border-right: none;
  }

  .csm-table thead th:last-child {
    border-right: none;
  }

  .csm-table tbody td {
    padding: 11px 14px;
    border-bottom: 1px solid var(--csm-gray-100);
    color: var(--csm-gray-800);
    vertical-align: middle;
    font-size: 13px;
    white-space: nowrap;
  }

  /* Group Rows */
  .csm-group-row {
    transition: var(--csm-transition);
  }

  .csm-group-row--project td {
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
    font-weight: 600;
    color: var(--csm-primary-dark);
    padding: 10px 14px;
    font-size: 13px;
    border-bottom: 1px solid #c7d2fe;
  }

  .csm-group-row--project td i {
    margin-right: 8px;
    opacity: 0.7;
  }

  .csm-project-no {
    font-weight: 500;
    opacity: 0.75;
    font-size: 12px;
  }

  .csm-group-row--contract td {
    background: var(--csm-gray-50);
    font-weight: 500;
    color: var(--csm-gray-600);
    padding: 8px 14px;
    font-size: 12.5px;
    border-bottom: 1px solid var(--csm-gray-200);
  }

  .csm-group-row--contract td i {
    margin-right: 6px;
    opacity: 0.6;
    font-size: 11px;
  }

  /* Data Rows */
  .csm-data-row {
    transition: var(--csm-transition);
  }

  .csm-data-row:hover {
    background: var(--csm-gray-50);
  }

  .csm-table tbody tr.csm-row--pending td {
    color: var(--csm-gray-800);
  }

  .csm-table tbody tr.csm-row--wait td {
    color: var(--csm-danger);
  }

  .csm-table tbody tr.csm-row--progress td {
    color: var(--csm-primary);
  }

  .csm-table tbody tr.csm-row--complete td {
    color: var(--csm-success);
  }

  .csm-table tbody tr.csm-row--reject td {
    color: var(--csm-danger);
  }

  /* Req No Tag */
  .csm-reqno {
    display: inline-block;
    padding: 2px 8px;
    background: var(--csm-gray-100);
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    font-weight: 600;
    color: inherit;
  }

  /* Checkbox */
  .csm-checkbox-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .csm-checkbox {
    position: relative;
    display: inline-flex;
    cursor: pointer;
    margin: 0;
  }

  .csm-checkbox input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .csm-checkbox__mark {
    width: 18px;
    height: 18px;
    border: 2px solid var(--csm-gray-300);
    border-radius: 4px;
    transition: var(--csm-transition);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .csm-checkbox__mark::after {
    content: '';
    width: 5px;
    height: 9px;
    border: solid #ffffff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg) scale(0);
    transition: transform 0.15s ease;
  }

  .csm-checkbox input:checked + .csm-checkbox__mark {
    background: var(--csm-primary);
    border-color: var(--csm-primary);
  }

  .csm-checkbox input:checked + .csm-checkbox__mark::after {
    transform: rotate(45deg) scale(1);
  }

  .csm-checkbox input:disabled + .csm-checkbox__mark {
    background: var(--csm-gray-100);
    border-color: var(--csm-gray-200);
    cursor: not-allowed;
  }

  /* Icon Button */
  .csm-btn-icon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--csm-radius);
    background: var(--csm-gray-100);
    color: var(--csm-gray-600);
    cursor: pointer;
    transition: var(--csm-transition);
  }

  .csm-btn-icon:hover {
    background: var(--csm-primary-light);
    color: var(--csm-primary);
  }

  .csm-btn-icon__badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    background: var(--csm-primary);
    color: #ffffff;
    border-radius: 10px;
    padding: 0 4px;
  }

  /* Link */
  .csm-link {
    color: var(--csm-primary);
    text-decoration: none;
    font-weight: 500;
    transition: var(--csm-transition);
  }

  .csm-link:hover {
    color: var(--csm-primary-dark);
    text-decoration: underline;
  }

  /* Reject Reason */
  .csm-reject-reason {
    display: inline-block;
    padding: 4px 8px;
    background: var(--csm-danger-light);
    color: var(--csm-danger);
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Modal */
  .csm-modal-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .csm-modal-header__icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--csm-danger-light);
    color: var(--csm-danger);
    border-radius: 50%;
    font-size: 18px;
  }

  .csm-modal-header h4 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--csm-gray-800);
  }

  .csm-modal-body {
    padding: 20px;
  }

  .csm-modal-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--csm-gray-700);
    margin-bottom: 8px;
  }

  .csm-required {
    color: var(--csm-danger);
  }

  .csm-textarea {
    width: 100%;
    min-height: 150px;
    padding: 12px 16px;
    border: 1px solid var(--csm-gray-200);
    border-radius: var(--csm-radius);
    font-size: 14px;
    color: var(--csm-gray-700);
    resize: vertical;
    transition: var(--csm-transition);
    line-height: 1.5;
  }

  .csm-textarea:focus {
    outline: none;
    border-color: var(--csm-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .csm-textarea::placeholder {
    color: var(--csm-gray-400);
  }

  .csm-modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 10px;
    width: 100%;
  }

  /* PhotoSwipe Overrides */
  .pswp__bg {
    background-color: rgba(15, 23, 42, 0.9);
  }

  .pswp__bullets-indicator {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translate(-50%, 0);
  }

  .pswp__bullet {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    margin: 0 4px;
    transition: var(--csm-transition);
  }

  .pswp__bullet--active {
    background: var(--csm-primary);
    transform: scale(1.3);
  }

  .pswp__custom-caption {
    background: var(--csm-primary) !important;
    font-size: 14px;
    color: #fff;
    width: calc(100% - 32px);
    max-width: 400px;
    padding: 6px 12px;
    border-radius: var(--csm-radius);
    position: absolute;
    left: 50%;
    bottom: 60px;
    transform: translateX(-50%);
    text-align: center;
  }

  .pswp__custom-caption a {
    color: #fff;
    text-decoration: underline;
  }

  /* Custom Scrollbar for Table */
  .csm-table-wrap::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .csm-table-wrap::-webkit-scrollbar-track {
    background: var(--csm-gray-100);
    border-radius: 4px;
  }

  .csm-table-wrap::-webkit-scrollbar-thumb {
    background: var(--csm-gray-300);
    border-radius: 4px;
  }

  .csm-table-wrap::-webkit-scrollbar-thumb:hover {
    background: var(--csm-gray-400);
  }

  /* Responsive */
  @media (max-width: 992px) {
    .csm-toolbar {
      flex-direction: column;
    }

    .csm-toolbar__actions {
      width: 100%;
      justify-content: flex-end;
    }

    .csm-search-group {
      flex-wrap: wrap;
    }

    .csm-search-input-wrap {
      min-width: 200px;
    }
  }
</style>
