<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-widget page-box">
          <div class="box-body">

            <!-- Section: Filter -->
            <div class="section-panel">
              <div class="section-title"><i class="fas fa-filter"></i> ค้นหาโครงการ</div>
              <div class="row filter-row">
                <div class="col-lg-2 col-md-3">
                  <label class="field-label text-danger">Project Contract <span class="req">*</span></label>
                  <span class="input-group">
                    <input type="text" class="form-control input-sm text-bold" v-model="header.pre_event" readonly placeholder="เลือกโครงการ..." />
                    <span class="input-group-btn">
                      <button class="btn btn-sm bg-navy" @click="$refs.ct_project.openModal()"><i class="fa fa-search"></i></button>
                      <button class="btn btn-sm btn-danger" @click="clearData(header, ['pre_event', 'pre_des'])"><i class="fa fa-close"></i></button>
                    </span>
                  </span>
                </div>
                <div class="col-lg-4 col-md-5">
                  <label class="field-label">ชื่อโครงการหลัก</label>
                  <input type="text" class="form-control input-sm" v-model="header.pre_des" readonly placeholder="-" />
                </div>
                <div v-show="header.pre_event" class="col-lg-2 col-md-2">
                  <label class="field-label" v-text="ui.search_by || 'Search By'"></label>
                  <select class="form-control input-sm" v-model="search.field">
                    <option value="refcode">Ref Code</option>
                    <option value="pre_event">Project No.</option>
                    <option value="pre_des">Project Name</option>
                  </select>
                </div>
                <div v-show="header.pre_event" class="col-lg-3 col-md-4">
                  <label class="field-label" v-text="ui.search || 'Search'"></label>
                  <span class="input-group">
                    <input type="text" class="form-control input-sm" v-model="search.text" @keyup.enter="doSearch()" placeholder="พิมพ์แล้วกด Enter..." />
                    <span class="input-group-btn">
                      <button class="btn btn-sm bg-navy" @click.prevent="doSearch()"><i class="fas fa-search"></i></button>
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Section: Data -->
            <div class="section-panel" v-show="header.pre_event">
              <!-- Summary Row -->
              <div class="summary-row">
                <div class="summary-left">
                  <div class="summary-chip">
                    <i class="fas fa-sitemap"></i>
                    <span>โครงการย่อย</span>
                    <b>{{projPhase.length || 0}}</b>
                  </div>
                  <div class="summary-chip">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Area</span>
                    <b>{{projArea.length || 0}}</b>
                  </div>
                </div>
                <div class="summary-right">
                  <app-form-2 ref="appForm"></app-form-2>
                </div>
              </div>

              <!-- Phase Cards -->
              <div class="phase-list">
                <template v-if="displayData.length > 0">
                  <div class="phase-card" v-for="(x, idx) in displayData" :key="idx" :class="{ 'phase-card--open': collapseState[idx] }">
                    <!-- Card Header -->
                    <div class="phase-card__header" @click="toggleCollapse(idx)">
                      <div class="phase-card__toggle">
                        <i class="fas fa-chevron-right icon-transition" :class="{ rotated: collapseState[idx] }"></i>
                      </div>
                      <div class="phase-card__info">
                        <span class="phase-card__refcode" v-if="x.refcode">{{x.refcode}}</span>
                        <span class="phase-card__code">{{x.pre_event}}</span>
                        <span class="phase-card__sep">|</span>
                        <span class="phase-card__name">{{x.pre_des}}</span>
                      </div>
                      <div class="phase-card__badge" v-if="x.totalChkY > 0">
                        <i class="fas fa-check-circle"></i> {{x.totalChkY}} / {{projArea.length}}
                      </div>
                      <div class="phase-card__badge phase-card__badge--empty" v-else>
                        0 / {{projArea.length}}
                      </div>
                    </div>
                    <!-- Card Body (Area Table) -->
                    <div v-show="collapseState[idx]" class="phase-card__body">
                      <table class="area-tbl">
                        <thead>
                          <tr>
                            <th class="area-tbl__th" style="width: 180px;">รหัส Area</th>
                            <th class="area-tbl__th">ชื่อ Area</th>
                            <th class="area-tbl__th area-tbl__th--center" style="width: 90px;">เลือก</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="area-tbl__row" v-for="(z, idx2) in projArea" :key="idx2">
                            <td class="area-tbl__td area-tbl__td--code">{{z.loccode}}</td>
                            <td class="area-tbl__td">{{z.locname}}</td>
                            <td class="area-tbl__td area-tbl__td--center">
                              <label class="custom-chk">
                                <input type="checkbox" v-model="x['chk,'+x.pre_event+','+z.loccode]" :id="'id'+idx2+'#'+idx" true-value="Y" false-value="N" />
                                <span class="custom-chk__box"><i class="fas fa-check"></i></span>
                              </label>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </template>

                <!-- Empty State -->
                <div class="empty-state" v-else>
                  <div class="empty-state__icon"><i class="fas fa-inbox"></i></div>
                  <div class="empty-state__text">ไม่พบข้อมูลโครงการย่อย</div>
                  <div class="empty-state__sub">กรุณาเลือก Project Contract ด้านบน</div>
                </div>
              </div>

              <!-- Pagination -->
              <div class="pagination-row" v-show="projPhase.length > 0">
                <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"/>
              </div>
            </div>

          </div>
        </div>
      </template>
    </re-page>

    <!-- Center Modal -->
    <vue-project-list ref="ct_project" @send-data="sendComponent($event, 'project')"></vue-project-list>
  </div>
</template>

<script>
  let page = {};
  let paging = {};
  let appForm = {};
  let cpn = {
    data() {
      return {
        auth,
        ui: window.ui,
        tabActive: 0,
        projPhase: [],
        displayData: [],
        pageNumber: 1,
        projArea: [],
        collapseState: {},
        search: {
          field: "pre_event",
          text: ""
        },
        header: {},
        dataAdmin: {},
      };
    },
    methods: {
      changeTab(t) {
        this.tabActive = t;
      },
      resetProjCon() {
        this.header = {};
      },
      clearData(data, field) {
        $linq(field).foreach(x => this.$set(data, x, null));
        if (field[0] == 'pre_event') {
          this.projPhase = [];
          this.projArea = [];
          this.displayData = [];
        }
        this.search = {};
      },
      checkAll(e, loccode) {
        $linq(this.projPhase).foreach(x => {
          if (e.target.checked) {
            this.$set(x, `chk,${x.pre_event},${loccode}`, "Y");
          } else {
            this.$set(x, `chk,${x.pre_event},${loccode}`, "N");
          }
        });
      },
      toggleCollapse(idx) {
        this.$set(this.collapseState, idx, !this.collapseState[idx]);
      },
      async pageChange(pn) {
        pn = pn || 1;
        this.pageNumber = pn;
        paging.setCurrentPage(pn);
        this.$set(this, "displayData", $linq(this.projPhase).skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray());
        this.collapseState = {};
        paging.createPagesArray();
      },
      async doSearch() {
        await this.loadPhase(this.header.pre_event2);
        await this.pageChange(1);
        await this.loadArea(this.header.pre_event2);
        await this.loadProjArea(this.header.pre_event);
      },
      async loadPhase(pre_event2) {
        let url = `CSM/Center/UnitPhase0_ReadList?pre_event2=${pre_event2 || ''}`;
        this.collapseState = {};
        for (var key in this.search) {
          url += `&${key}=${encodeURIComponent(this.search[key])}`;
        }
        let resp = await $xt.getServer(url);
        this.projPhase = resp.data.data_rows;
        paging.setTotalItems(resp.data.total);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();
      },
      async loadArea(pre_event2) {
        let act = `CSM/MASTER/ProjArea_ReadList?pre_event2=${pre_event2}`;
        let rsp = await $xt.getServer(act);
        $linq(rsp.data.data_rows.data).foreach(x => {
          x.cc_select = "N";
        });
        this.projArea = $linq(rsp.data.data_rows.data).where(x => x.active == "Y").toArray();
      },
      async loadProjArea(pre_event) {
        let act = `CSM/MASTER/AreaInProject_ReadList?pre_event=${pre_event}`;
        let rsp = await $xt.getServer(act);

        $linq(this.projPhase).foreach(f => {
          let p = $linq(rsp).where(w => w.pre_event == f.pre_event).toArray();
          let totalChkY = 0;
          $linq(p).foreach(x => {
            let chkKey = `chk,${x.pre_event},${x.loccode}`;
            this.$set(f, chkKey, "Y");
            totalChkY++;
          });
          this.$set(f, "totalChkY", totalChkY);
        });
      },
      setData() {
        let arr = [];
        $linq(this.projPhase).foreach(m => {
          let p = Object.getOwnPropertyNames(m);
          $linq(p).where(x1 => x1.indexOf('chk,') > -1).foreach(f => {
            let sp = f.split(",");
            let activeValue = m[f] == "Y" ? "Y" : "N";
            arr.push({
              pre_event: sp[1],
              loccode: sp[2],
              active: activeValue
            });
          });
        });
        return arr;
      },
      async saveData() {
        try {
          let formData = this.setData();
          let f = {
            pre_event: this.header.pre_event,
            header: formData
          };
          let act = `CSM/MASTER/AreaInProjec_Create`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          $msg.alert(`Success`, `Your information has been saved successfully.`, `success`);
          this.loadProjArea(this.header.pre_event);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      sendComponent(e, type) {
        switch (type) {
          case "project":
            this.$set(this.header, "pre_event", e.pre_event);
            this.$set(this.header, "pre_event2", e.pre_event2);
            this.$set(this.header, "pre_des", e.pre_des);
            (async () => {
              await this.loadPhase(e.pre_event2);
              await this.pageChange(1);
              await this.loadArea(e.pre_event2);
              await this.loadProjArea(e.pre_event);
            })();
            break;
        }
      },
    },
    computed: {},
    mounted() {
      page = this.$refs.page;
      page.pageTitle = 'Master : ตั้งค่าพื้นที่โครงการ';
      document.title = page.pageTitle;

      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(10);

      appForm = this.$refs.appForm;
      appForm.btnRetrieve.show = false;
      appForm.btnNew.show = false;
      appForm.btnDelete.show = false;
      appForm.btnExport.show = false;
      appForm.btnImport.show = false;
      appForm.btnSave.show = true;
      appForm.btnSave.click = this.saveData;
    }
  };

  export default cpn;
</script>

<style scoped>
/* ===== Page Box ===== */
.page-box {
  border-radius: 4px !important;
  border: none;
  box-shadow: none;
}

/* ===== Section Panel ===== */
.section-panel {
  background: #fff;
  border: 1px solid #e3e6ea;
  border-radius: 6px;
  padding: 16px 20px;
  margin-bottom: 14px;
}
.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #3c4858;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f2f5;
}
.section-title i {
  margin-right: 6px;
  color: #3c8dbc;
}

/* ===== Filter Row ===== */
.filter-row {
  align-items: flex-end;
}
.field-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.field-label .req {
  color: #dc3545;
}

/* ===== Summary Row ===== */
.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
}
.summary-left {
  display: flex;
  gap: 14px;
}
.summary-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0f4f8;
  border: 1px solid #dce3eb;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  color: #4a5568;
}
.summary-chip i {
  color: #3c8dbc;
  font-size: 12px;
}
.summary-chip b {
  color: #2d3748;
  font-size: 13px;
}
.summary-right {
  display: flex;
  align-items: center;
}

/* ===== Phase List ===== */
.phase-list {
  max-height: calc(100vh - 340px);
  overflow-y: auto;
  padding-right: 4px;
}

/* ===== Phase Card ===== */
.phase-card {
  border: 1px solid #e2e6ea;
  border-radius: 6px;
  margin-bottom: 8px;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.phase-card:hover {
  border-color: #c5d0db;
}
.phase-card--open {
  border-color: #3c8dbc;
  box-shadow: 0 2px 8px rgba(60, 141, 188, 0.08);
}

/* Card Header */
.phase-card__header {
  display: flex;
  align-items: center;
  padding: 11px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
  gap: 12px;
}
.phase-card__header:hover {
  background-color: #f8fafb;
}

.phase-card__toggle {
  width: 20px;
  flex-shrink: 0;
  text-align: center;
}
.phase-card__toggle i {
  font-size: 11px;
  color: #888;
}

.phase-card__info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.phase-card__refcode {
  background: #edf2f7;
  color: #4a6785;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 3px;
  text-transform: uppercase;
  flex-shrink: 0;
}
.phase-card__code {
  font-weight: 800;
  font-size: 14px;
  color: #1a202c;
  flex-shrink: 0;
}
.phase-card__sep {
  color: #bbb;
  font-size: 14px;
  font-weight: 300;
}
.phase-card__name {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.phase-card__badge {
  flex-shrink: 0;
  background: #d4edda;
  color: #1e7e34;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  white-space: nowrap;
}
.phase-card__badge i {
  margin-right: 3px;
  font-size: 10px;
}
.phase-card__badge--empty {
  background: #f5f5f5;
  color: #999;
}

/* Card Body */
.phase-card__body {
  border-top: 1px solid #eef1f4;
  padding: 0;
}

/* ===== Area Table ===== */
.area-tbl {
  width: 100%;
  border-collapse: collapse;
}
.area-tbl__th {
  background: #2c3e50;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 10px 16px;
  border-bottom: none;
  text-align: left;
}
.area-tbl__th--center {
  text-align: center;
}
.area-tbl__td {
  font-size: 13px;
  padding: 10px 16px;
  border-bottom: 1px solid #eef0f2;
  color: #333;
  vertical-align: middle;
}
.area-tbl__td--code {
  font-weight: 700;
  font-size: 13px;
  color: #1a202c;
  letter-spacing: 0.2px;
}
.area-tbl__td--center {
  text-align: center;
}
.area-tbl__row:last-child .area-tbl__td {
  border-bottom: none;
}
.area-tbl__row:hover .area-tbl__td {
  background: #edf6fc;
}
.area-tbl__row:nth-child(even) .area-tbl__td {
  background: #fafbfc;
}
.area-tbl__row:nth-child(even):hover .area-tbl__td {
  background: #edf6fc;
}

/* ===== Custom Checkbox ===== */
.custom-chk {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0;
  position: relative;
}
.custom-chk input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.custom-chk__box {
  width: 20px;
  height: 20px;
  border: 2px solid #ced4da;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  background: #fff;
}
.custom-chk__box i {
  font-size: 10px;
  color: #fff;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.15s;
}
.custom-chk input[type="checkbox"]:checked + .custom-chk__box {
  background: #3c8dbc;
  border-color: #3c8dbc;
}
.custom-chk input[type="checkbox"]:checked + .custom-chk__box i {
  opacity: 1;
  transform: scale(1);
}
.custom-chk:hover .custom-chk__box {
  border-color: #3c8dbc;
}

/* ===== Empty State ===== */
.empty-state {
  text-align: center;
  padding: 50px 20px;
}
.empty-state__icon {
  font-size: 36px;
  color: #d0d5dd;
  margin-bottom: 12px;
}
.empty-state__text {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 4px;
}
.empty-state__sub {
  font-size: 12px;
  color: #999;
}

/* ===== Pagination ===== */
.pagination-row {
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
  margin-top: 8px;
}

/* ===== Utilities ===== */
.text-bold {
  font-weight: 600 !important;
}
.icon-transition {
  transition: transform 0.2s ease;
}
.rotated {
  transform: rotate(90deg);
}
</style>
