<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="box box-widget">
          <div class="box-body">
            <div class="nav-tabs-custom">
              <ul class="nav nav-tabs">
                <li :class="{active:tabActive===0}"><a href="#" @click.prevent="onChangeTab(0)"><i class="fas fa-th-large"></i><span> Area</span></a></li>
                <li :class="{active:tabActive===1}"><a v-bind:class="{'disabled-menu': tabActive === 0}" href="#" @click.prevent="onChangeTab(1)"><i class="fas fa-clipboard-check"></i><span> Warranty</span></a></li>
                <li class="pull-right">
                <div class="margin-r-5">
                  <button class="btn btn-sm btn-instagram" v-if="tabActive === 0 && dataAreaDisplay.length > 0" @click.prevent="selectArea" :disabled="dataAreaDisplay.every(x => x.checked == 'N')"><i class="fas fa-plus"></i> เลือกพื้นที่</button>
                  <button class="btn btn-sm btn-danger" v-if="tabActive === 1" @click="deleteWarranty" :disabled="dataWarrantyDisplay.every(x => x.checked == 'N')"><i class="fas 	fas fa-trash"></i> ลบข้อมูล</button>
                </div>
              </li>
              </ul>

              <div class="tab-content">
                <div class="tab-pane" :class="{active:tabActive===0}">
                  <!-- Project Contract -->
                  <div class="row">
                    <div class="col-lg-2 col-md-4">
                      <div class="form-group">
                        <label class="text-danger">โครงการหลัก</label>
                        <span class="input-group">
                          <input type="text" class="form-control input-sm text-bold" v-model="headerData['pre_event']" readonly />
                          <span class="input-group-btn">
                            <button class="btn btn-sm bg-navy" @click="$refs.ct_project.openModal()" ref="pre_event"><i class="fa fa-search"></i></button>
                            <button class="btn btn-sm btn-danger" @click="resetData('project')"><i class="fa fa-close"></i></button>
                          </span>
                        </span>
                      </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                      <div class="form-group">
                        <label style="text-overflow: ellipsis; white-space:nowrap;" class="pull-right">(กรุณาเลือกโครงการหลักก่อน ดูรายละเอียดของ Area นั้น)</label>
                        <input type="text" class="form-control input-sm" v-model="headerData.pre_des" readonly />
                      </div>
                    </div>
                  </div>
                  <!-- Project Unit/Phase -->
                  <div class="row">
                    <div class="col-lg-2 col-md-4">
                      <div class="form-group">
                        <label class="text-danger">โครงการย่อย (Unit / Phase)</label>
                        <span class="input-group">
                          <input type="text" class="form-control input-sm text-bold" v-model="headerData['pre_event_unit']" readonly />
                          <span class="input-group-btn">
                            <button class="btn btn-sm bg-navy" @click="$refs.ct_project_unit.openModal()" ref="pre_event" :disabled="xt.isEmpty(headerData.pre_event)"><i class="fa fa-search"></i></button>
                            <button class="btn btn-sm btn-danger" :disabled="xt.isEmpty(headerData.pre_event)" @click="resetData('phase')"><i class="fa fa-close"></i></button>
                          </span>
                        </span>
                      </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                      <div class="form-group">
                        <label style="text-overflow: ellipsis; white-space:nowrap;" class="pull-right">(หากต้องการ Set โครงการหลักอย่างเดียว ไม่จำเป็นต้องเลือกช่องนี้)</label>
                        <input type="text" class="form-control input-sm" v-model="headerData['pre_des_unit']" readonly />
                      </div>
                    </div>
                  </div>
                  <div class="row" v-show="!xt.isEmpty(headerData['pre_event'])">
                    <div class="col-lg-2 col-md-4">
                      <div class="form-group">
                        <label v-text="ui.search_by || 'Search By'"></label>
                        <select class="form-control input-sm" v-model="searchArea.search_field">
                          <option value="loccode">Area Code</option>
                          <option value="locname">Area Name</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                      <div class="form-group">
                        <label v-text="ui.search || 'Search'"></label>
                        <span class="input-group">
                          <input type="text" class="form-control input-sm text-bold" v-model="searchArea.search_text" @keyup.enter="doSearch('area')"/>
                          <span class="input-group-btn">
                            <button class="btn btn-sm bg-navy" @click="doSearch('area')"><i class="fa fa-search"></i></button>
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="row" v-show="!xt.isEmpty(headerData['pre_event'])">
                    <div class="col-lg-12 col-md-12 col-sm-12">
                      <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                          <thead>
                            <tr>
                              <th class="tf-1 text-center">
                                <div class="d-flex justify-content-center" >
                                  <div class="form-check form-check-custom form-check-solid form-check-sm">
                                    <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="selectAllArea" @change="selectAll('area')"/>
                                  </div>
                                </div>
                              </th>
                              <th class="tf-1 text-center">#</th>
                              <th class="tf-6-5">Area Code</th>
                              <th class="tf-6-5">Area Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(x,idx) in dataAreaDisplay">
                              <td align="center">
                                <div class="d-flex justify-content-center" >
                                  <div class="form-check form-check-custom form-check-solid form-check-sm">
                                    <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="x.checked" @change="selectItem(x, 'area')"/>
                                  </div>
                                </div>
                              </td>
                              <td align="center">{{x.rowno}}.</td>
                              <td class="text-bold">{{x.loccode}}</td>
                              <td>{{x.locname}}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div class="row" v-show="!xt.isEmpty(headerData['pre_event'])">
                    <div class="col-lg-12 col-md-12">
                      <pagination class="pull-left" ref="pagingArea" @page-change="pageAreaChange($event.page)"></pagination>
                    </div>
                  </div>
                </div>
                <div class="tab-pane" :class="{active:tabActive===1}">
                  <div class="row" v-show="!xt.isEmpty(headerData['pre_event'])">
                    <div class="col-lg-2 col-md-4">
                      <div class="form-group">
                        <label v-text="ui.search_by || 'Search By'"></label>
                        <select class="form-control input-sm" v-model="searchWarranty.search_field">
                          <option value="loccode">Area Code</option>
                          <option value="locname">Area Name</option>
                          <option value="war_code">Warranty Code</option>
                          <option value="war_des">Warranty Name</option>
                          <option value="itemname_other">Model Name</option>
                          <option value="serial_number">Serial Number</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                      <div class="form-group">
                        <label v-text="ui.search || 'Search'"></label>
                        <span class="input-group">
                          <input type="text" class="form-control input-sm text-bold" v-model="searchWarranty.search_text" @keyup.enter="doSearch('warranty')"/>
                          <span class="input-group-btn">
                            <button class="btn btn-sm bg-navy" @click="doSearch('warranty')"><i class="fa fa-search"></i></button>
                          </span>
                        </span>
                      </div>
                    </div>
                    <div class="col-lg-2 col-md-2">
                    <div class="form-group">
                      <label>&nbsp;</label>
                      <div class="form-check form-switch form-check-custom form-check-solid form-check-sm me-5">
                        <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="searchWarranty.search_active" @change="doSearch('warranty')" />
                        <label class="form-check-label">All Warranty</label>
                      </div>
                    </div>
                  </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12">
                      <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                          <thead>
                            <tr>
                              <th class="tf-1 text-center">
                                <div class="d-flex justify-content-center" >
                                  <div class="form-check form-check-custom form-check-solid form-check-sm">
                                    <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="selectAllWarranty" @change="selectAll('warranty')"/>
                                  </div>
                                </div>
                              </th>
                              <th class="tf-1 text-center">#</th>
                              <th class="tf-3">Area Code</th>
                              <th class="tf-3">Area Name</th>
                              <th class="tf-4">Warranty Code</th>
                              <th class="tf-4">Warranty Name</th>
                              <th class="tf-4">Model Name</th>
                              <th class="tf-4">Serial Number</th>
                              <th class="tf-4">Remark</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(x,idx) in dataWarrantyDisplay" :style="{ backgroundColor: x.active === 'Y' ? '#D3D3D3' : '' , color: x.active === 'Y' ? '#A9A9A9 ' : ''}">
                              <td align="center">
                                <div class="d-flex justify-content-center" >
                                  <div class="form-check form-check-custom form-check-solid form-check-sm">
                                    <input class="form-check-input" :disabled ="x.active === 'Y'" type="checkbox" true-value="Y" false-value="N" v-model="x.checked" @change="selectItem(x, 'warranty')"/>
                                  </div>
                                </div>
                              </td>
                              <td align="center">{{x.rowno}}.</td>
                              <td>{{x.loccode}}</td>
                              <td>{{x.locname}}</td>
                              <td class="text-bold">{{x.war_code}}</td>
                              <td>{{x.war_des}}</td>
                              <td>{{x.itemname_other}}</td>
                              <td>{{x.serial_number}}</td>
                              <td>{{x.remark}}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div class="row" v-show="!xt.isEmpty(headerData['pre_event'])">
                    <div class="col-lg-12 col-md-12">
                      <pagination class="pull-left" ref="pagingWarranty" @page-change="pageWarrantyChange($event.page)"></pagination>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Loading (remove the following to stop the loading)-->
          <div class="overlay" v-if="isLoading">
            <i class="fa fa-refresh fa-spin"></i>
          </div>
          <!-- end loading -->
        </div>
      </template>
    </re-page>
    <vue-project-list ref="ct_project" @send-data="sendComponent($event, 'project')"></vue-project-list>
    <vue-project-unit-list ref="ct_project_unit" :pre_event2="headerData['pre_event2']" @send-data="sendComponent($event, 'project_unit')"></vue-project-unit-list>
  </div>
</template>
<script>
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let pagingArea = {};
  let pagingWarranty = {};
  let appForm = {};
  let cpn = {
    data() {
      return {
        xt: $xt,
        headerNameModal: "",
        auth,
        areaPageNumber: 1,
        tabActive: 0,
        dataArea: [],
        dataAreaDisplay: [],
        dataWarranty: [],
        dataWarrantyDisplay: [],
        ui: window.ui,
        isLoading : false,
        headerData : {},
        searchArea: {
          search_field: "loccode",
          search_text: ""
        },
        searchWarranty: {
          search_field: "war_code",
          search_text: "",
          search_active: "N"
        },
        selectAllArea: "N",
        selectAllWarranty: "N",
        selectAreaItems: [],
        selectWarrantyItems: [],
        area_code: [],
      };
    },
    methods: {
      async sendComponent(e, type) {
        switch (type) {
          case "project":
            this.headerData.pre_event = e.pre_event;
            this.headerData.pre_event2 = e.pre_event2;
            this.headerData.pre_des = e.pre_des;
            
            this.dataArea = [];
            this.dataAreaDisplay = []
            this.areaPageNumber = 1
            this.headerData.pre_event_unit = null;
            this.headerData.pre_des_unit = null;
            await this.loadAreaData();
            await this.loadWarrantyData();
            break;
          case "project_unit":
            this.headerData.pre_event_unit = e.pre_event;
            this.headerData.pre_des_unit = e.pre_des;
            await this.loadAreaData();
            await this.loadWarrantyData();
            break;
        }
      },
      async resetData(type) {
        if (type === 'project') {
          let arr = ['pre_event', 'pre_des', 'pre_event_unit', 'pre_des_unit'];
          $linq(arr).foreach(f => this.headerData[f] = null);
          this.dataArea = [];
          this.dataAreaDisplay = [];
          this.areaPageNumber = 1
          this.warrantyPageNumber = 1
          this.selectAllArea = 'N'
          this.selectAreaItems = []
          pagingArea.setCurrentPage(1);
          this.searchArea.search_field = 'loccode'
          this.searchWarranty.search_field = 'war_code'
          this.searchArea.search_text = ''
          this.searchWarranty.search_text = ''
          this.area_code = []
        } else if (type === 'phase') {
          let arr = ['pre_event_unit', 'pre_des_unit'];
          $linq(arr).foreach(f => this.headerData[f] = null);
          this.area_code = []
          this.dataArea = [];
          this.dataAreaDisplay = [];
          this.areaPageNumber = 1
          this.warrantyPageNumber = 1
          this.selectAllArea = 'N'
          this.selectAreaItems = []
          pagingArea.setCurrentPage(1);
          this.searchArea.search_field = 'loccode'
          this.searchWarranty.search_field = 'war_code'
          this.searchArea.search_text = ''
          this.searchWarranty.search_text = ''
          await this.loadAreaData();
        } else if (type === 'tab') {
          this.dataWarrantyDisplay = [];
          this.areaPageNumber = 1
          this.warrantyPageNumber = 1
          this.selectAllArea = 'N'
          this.selectAllWarranty = 'N'
          this.selectAreaItems = []
          this.selectWarrantyItems = []
          this.area_code = []
          pagingArea.setCurrentPage(1);
          this.searchArea.search_field = 'loccode'
          this.searchWarranty.search_field = 'war_code'
          this.searchArea.search_text = ''
          this.searchWarranty.search_text = ''
          await this.loadAreaData();
        }
      },
      async loadAreaData() {
        try {
          this.isLoading = true
          let act = `csm/master/ReadAreaDel?pre_event2=${encodeURIComponent(this.headerData.pre_event2 || '')}&pre_event=${encodeURIComponent(this.headerData.pre_event_unit || this.headerData.pre_event)}`;
          for (var key in this.searchArea) {
            act += `&${key}=${encodeURIComponent(this.searchArea[key])}`
          }
          let rsp = await $xt.getServer(act);
          this.dataArea = rsp.data.data;
          
          this.dataArea.forEach((x) => {
            x.checked = "N";
          });
          
          this.dataArea.forEach((x, index) => {
            x.rowno = index + 1;
          });
          
          this.dataAreaDisplay = this.dataArea

          this.pageAreaChange(this.areaPageNumber)

          pagingArea.setTotalItems(rsp.data.total);
          if (!pagingArea.getItemsPerPage()) {
            pagingArea.setCurrentPage(1);
          }
          
          pagingArea.createPagesArray();

        } catch (ex) {
          $msg.alert(`Error`, ex.toString(), `danger`);
        } finally {
          this.isLoading = false
        }
      },
      async loadWarrantyData() {
        try {
          this.isLoading = true
          let act = `csm/master/ReadWarrantyDel?pre_event2=${encodeURIComponent(this.headerData.pre_event2 || '')}&pre_event=${encodeURIComponent(this.headerData.pre_event_unit || this.headerData.pre_event)}`;
          for (var key in this.searchWarranty) {
            act += `&${key}=${encodeURIComponent(this.searchWarranty[key])}`
          }
          let rsp = await $xt.getServer(act);

          this.dataWarranty = rsp.data.data;
          
          this.dataWarranty.forEach((x) => {
            x.checked = "N";
          });
          
          this.dataWarranty.forEach((x, index) => {
            x.rowno = index + 1;
          });

          if (this.area_code.length > 0) {
            this.dataWarrantyDisplay = this.dataWarranty.filter(item => this.area_code.includes(item.loccode))
            this.dataWarrantyDisplay.forEach((x, index) => {
            x.rowno = index + 1;
          });
          } else {
            this.dataWarrantyDisplay = this.dataWarranty
          }
          
          pagingWarranty.setTotalItems(this.area_code.length > 0 ? $linq(this.dataWarrantyDisplay).count() : rsp.data.total);
          if (!pagingWarranty.getItemsPerPage()) {
            pagingWarranty.setCurrentPage(1);
          }
          pagingWarranty.createPagesArray();

        } catch (ex) {
          $msg.alert(`Error`, ex.toString(), `danger`);
        } finally {
          this.isLoading = false
        }
      },
      async pageAreaChange(pn) {
        pn = pn || 1;
        this.areaPageNumber = pn;
        pagingArea.setCurrentPage(pn);
        this.dataAreaDisplay = $linq(this.dataArea).skip(pagingArea.skipItems()).take(pagingArea.getItemsPerPage()).toArray();
        pagingArea.createPagesArray();
      },
      pageWarrantyChange(pn){
        pn = pn || 1;
        this.warrantyPageNumber = pn;
        pagingWarranty.setCurrentPage(pn);
        if (this.area_code.length > 0) {
          this.dataWarrantyDisplay = this.dataWarranty.filter(item => this.area_code.includes(item.loccode))
          pagingWarranty.setTotalItems($linq(this.dataWarrantyDisplay).count());
          this.dataWarrantyDisplay = $linq(this.dataWarrantyDisplay).skip(pagingWarranty.skipItems()).take(pagingWarranty.getItemsPerPage()).toArray();
        } else {
          this.dataWarrantyDisplay = $linq(this.dataWarranty).skip(pagingWarranty.skipItems()).take(pagingWarranty.getItemsPerPage()).toArray();
        }
        pagingWarranty.createPagesArray();
      },
      async doSearch(type) {
        this.selectAllArea = 'N'
        this.selectAllWarranty = 'N'
        this.selectAreaItems = []
        this.selectWarrantyItems = []
        if (type === "area") {
            await this.loadAreaData();
            this.pageAreaChange(1);
        } else if (type === "warranty") {
            await this.loadWarrantyData();
            this.pageWarrantyChange(1);
        }
      },
      onChangeTab(t) {
        this.tabActive = t;
        if (t == 0) {
          this.resetData('tab')
        }
      },
      selectAll(type) {
        if (type === 'area') {
          this.selectAllArea == "Y" ? this.selectAreaItems = [...this.dataArea] : this.selectAreaItems = []
          this.dataArea.forEach(x => x.checked = this.selectAllArea == "Y" ? "Y" : "N")
          this.pageAreaChange(this.areaPageNumber)
        } else if (type === 'warranty') {
          this.selectAllWarranty == "Y" ? this.selectWarrantyItems = [...this.dataWarranty.filter(x => x.active !== 'Y')] : this.selectWarrantyItems = []
          this.dataWarranty.filter(a => a.active !== 'Y').forEach(x => x.checked = this.selectAllWarranty == "Y" ? "Y" : "N")
          this.pageWarrantyChange(this.warrantyPageNumber)
        }
      },
      selectItem(item, type){
        if (type === 'area') {
          let findIndex = this.dataAreaDisplay.findIndex(x => x.loccode == item.loccode)
          this.dataAreaDisplay[findIndex].checked = item.checked
          this.selectAreaItems = this.dataAreaDisplay.filter(x => x.checked == "Y")
          this.selectAllArea = this.dataAreaDisplay.every(x => x.checked == "Y") ? "Y" : "N"
          this.pageAreaChange(this.areaPageNumber)
        } else if (type === 'warranty') {
          let findIndex = this.dataWarrantyDisplay.findIndex(x => x.itemno == item.itemno && x.war_code == item.war_code && item.serial_number == x.serial_number)
          this.dataWarrantyDisplay[findIndex].checked = item.checked
          this.selectWarrantyItems = this.dataWarrantyDisplay.filter(x => x.checked == "Y")
          this.selectAllWarranty = this.dataWarrantyDisplay.filter(a => a.active !== 'Y').every(x => x.checked == "Y") ? "Y" : "N"
          this.pageWarrantyChange(this.warrantyPageNumber)
        }
      },
      async selectArea() {
        this.area_code = this.selectAreaItems.map(area => area.loccode)
        await this.loadWarrantyData()
        pagingWarranty.setCurrentPage(1);
        this.onChangeTab(1)
        this.pageWarrantyChange(1)
      },
      async deleteWarranty() {
        if (!await $msg.confirm(`คุณต้องการลบข้อมูล ใช่หรือไม่`)) {
          return;
        }

        try {
          let formData = this.selectWarrantyItems;
          let f = {
            header: formData
          };
          this.isLoading = true;

          let act = `CSM/MASTER/DeleteWarranty`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          
          $msg.alert(`Success`, `Your information has been delete successfully.` , `success`)

          this.isLoading = false;
        } catch (ex) {
          this.isLoading = false;
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          await this.loadWarrantyData();
          this.pageWarrantyChange(1);
          this.isLoading = false;
        }
      }
    },
    computed: {},
    mounted() {
        page = this.$refs.page;
        page.pageTitle = `Setup : Delete Import Warranty`;
        document.title = page.pageTitle;

        pagingArea = this.$refs.pagingArea;
        pagingArea.setCurrentPage(1);
        pagingArea.setItemsPerPage(50);

        pagingWarranty = this.$refs.pagingWarranty;
        pagingWarranty.setCurrentPage(1);
        pagingWarranty.setItemsPerPage(50);
    }
  };
  export default cpn;
</script>
