<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-widget">
          <div class="box-body">
            <!-- Project Contract -->
            <div class="row">
              <div class="col-lg-2 col-md-4">
                <div class="form-group">
                  <label class="text-danger">โครงการหลัก</label>
                  <span class="input-group">
                    <input type="text" class="form-control input-sm" v-model="area.pre_event" readonly />
                    <span class="input-group-btn">
                      <button class="btn btn-sm btn-default" @click="searchModal"><i class="fa fa-search"></i></button>
                      <button class="btn btn-sm btn-danger" @click="clearData(area, ['pre_event', 'pre_des'])"><i class="fa fa-close"></i></button>
                    </span>
                  </span>
                </div>
              </div>
              <div class="col-lg-4 col-md-6">
                <div class="form-group">
                  <label class="pull-right">&nbsp;</label>
                  <input type="text" class="form-control input-sm" v-model="area.pre_des" readonly />
                </div>
              </div>
            </div>

            <!-- Main Data -->
            <div class="row">
              <div class="col-lg-12 col-md-12">
                <div class="nav-tabs-custom">
                  <div class="tab-content">
                          <button class="btn btn-sm btn-default" @click="openProjectModal()" :disabled="!area.pre_event"><i class="fas fa-copy"></i> คัดลอกพิ้นที่ไปยังโครงการอื่น</button>    
                      <div class="row">
                        <div class=" col-md-5"> 
                          <div class="form-group">
                            <label v-text="ui.serach || 'ค้นหา'"></label> 
                            <div class="input-group">
                              <input type="text" class="form-control input-sm" v-model.trim="searchArea.text" @keypress.enter="loadArea" />
                              <span class="input-group-btn">
                                <button class="btn btn-sm btn-default" @click="loadArea"><i class="fa fa-search"></i></button>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-1">
                          <div class="form-group">
                            <label>&nbsp;</label>
                            <div class="form-check form-switch form-check-custom form-check-solid form-check-sm me-5">
                              <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="searchArea.active" @change="loadArea" />
                              <label class="form-check-label">Active</label>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <label>&nbsp;</label>
                          <div class="form-group">
                            <div class="pull-right">
                              <app-form-2 ref="appForm" exportName="" exportSelect="B" :exportUrl= exportUrl />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-lg-12 col-md-12">
                          <ag-table ref="agr"
                                    :scale="400"
                                    :footer="false"
                                    @ready="initTable()"
                                    :saveColumns="'Y'"
                                    :doctype="'PROJAREA'"
                                    :page_name="'v_csm_mas_003'"></ag-table>
                        </div>
                      </div>
                    </div>
                    </div>
                    <div class="row" v-show="data_area.length > 0">
                    <div class="col-md-12">
                      <div class="col-md-12">
                        <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
                      </div>
                    </div>
                  </div>
                  </div>

            </div>
          </div>
        </div>
        <!-- </div>
        </div> -->

      </template>
    </re-page>
        <!--modal edit -->
              <modal ref="editdata">
                <template slot="header">
                  <h4 class="text-white mb-0">แก้ไข</h4>
                </template>

                <template slot="body">
                  <div class="row align-items-end">
                    <div class="col-lg-3 col-md-4">
                      <div class="form-group mb-0">
                        <label class="text-danger small font-weight-bold">รหัสพื้นที่</label>
                        <input type="text" class="form-control form-control-sm bg-light" 
                          v-model="area.loccode" 
                          :disabled="!area.pre_event || editMode" />
                      </div>
                    </div>

                    <div class="col-lg-7 col-md-5">
                      <div class="form-group mb-0">
                        <label class="small font-weight-bold">ชื่อพื้นที่</label>
                        <input type="text" class="form-control form-control-sm" 
                          v-model="area.locname" 
                          :disabled="!area.pre_event" />
                      </div>
                    </div>

                    <div class="col-lg-2 col-md-3">
                      <div class="form-check form-check-custom form-check-solid form-check-sm mb-1">
                        <input class="form-check-input" type="checkbox" id="activeChk"
                          v-model="area.active" true-value="Y" false-value="N" 
                          :disabled="!area.pre_event"/>
                        <label class="form-check-label ml-2" for="activeChk">
                          <span class="font-weight-bold small">ACTIVE</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </template>

                <template slot="footer">
                  <div class="row w-100" style="margin-left: 10px;">
                    <div class="col-12 text-right">
                      <button class="btn btn-sm btn-success px-4" @click.prevent="saveArea">
                        <i class="fa fa-save"></i> บันทึกข้อมูล
                      </button>
                    </div>
                  </div>
                </template>
              </modal>
    <!-- modal main data -->
    <modal ref="maindata">
      <template slot="header">
        <h4>Main Data</h4>
      </template>
      <template slot="body">
        <div class="row">
          <div class="col-lg-2 col-md-4">
            <div class="form-group">
              <label>รหัสพื้นที่</label>
              <input type="text" class="form-control input-sm" :value="show_area.loccode" readonly />
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="form-group">
              <label>ชื่อพื้นที่</label>
              <input type="text" class="form-control input-sm" :value="show_area.locname" readonly />
            </div>
          </div>
          <div class="col-lg-6 col-md-12">
            <div class="form-group pull-right">
              <label>&nbsp;</label>
              <div class="input-group">
                <button class="btn btn-sm btn-info" @click.prevent="addItem " :disabled="!area.pre_event"><i class="fa fa-plus"> ทำรายการใหม่ </i></button>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-12 col-md-12">
            <ag-table ref="agrItem"
                      :scale="250"
                      :footer="false"
                      @ready="initItemTable()"
                      :saveColumns="'Y'"
                      :doctype="'PROJAREA_ITEM'"
                      :page_name="'v_csm_mas_003_item'"></ag-table>
          </div>
        </div>

      </template>
      <template slot="footer">
        <pagination class="pull-left" ref="paging1" @page-change="pageChange1($event.page)"></pagination>
        <button class="btn btn-sm  btn-success" @click.prevent="saveItem"><i class="fa fa-save"></i> บันทึกข้อมูล</button>
      </template>
    </modal>
    <!-- Item Warranty -->
    <modal ref="ItemWarranty">
      <template slot="header">
        <h4>Item Warranty</h4>
      </template>
      <template slot="body">
        <div class="row">
          <div class="col-md-4">
            <div class="form-group">
              <label>Search :</label>
              <div class="input-group">
                <input type="text" class="form-control input-sm" v-model.trim="itemSearch.search" @keyup.enter="loadItem" />
                <span class="input-group-btn"><button class="btn btn-sm btn-default" @click="loadItem"><i class="fa fa-search"></i></button></span>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>&nbsp;</label>
              <div class="form-check form-check-custom form-check-solid form-check-sm">
                <input class="form-check-input" type="checkbox" @click="selectAllWarr()" v-model="all_select" />
                <label class="form-check-label">Select All</label>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12 col-md-12">
            <ag-table ref="agrWarranty"
                      :scale="300"
                      :footer="false"
                      @ready="initWarrantyTable()"
                      :saveColumns="'Y'"
                      :doctype="'PROJAREA_WARRANTY'"
                      :page_name="'v_csm_mas_003_warranty'"></ag-table>
          </div>
        </div>
      </template>
      <template slot="footer">
        <pagination class="pull-left" ref="itemPaging" @page-change="onPageSelected($event.page, 'war_list')"></pagination>
        <button type="button" class="btn btn-sm btn-default" @click="pushItem"><i class="fa fa-plus"></i> Selected</button>
      </template>
    </modal>
    <!-- Item Materials -->
    <modal ref="ItemMaterials">
      <template slot="header">
        <h4>Item Materials</h4>
      </template>
      <template slot="body">
        <div class="row">
          <div class="col-lg-3 col-md-4 col-sm-2">
            <div class="form-group">
              <label>Search :</label>
              <div class="input-group">
                <input type="text" class="form-control input-sm" v-model.trim="itemSearch.search" @keyup.enter="loadItemMat" />
                <span class="input-group-btn"><a class="btn btn-default" @click="loadItemMat"><i class="fa fa-search"></i></a></span>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12 col-md-12">
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th style="width:5px"></th>
                    <th style="width:1px">#</th>
                    <th>Material Code</th>
                    <th>Material Group</th>
                    <th>Material Name</th>
                    <th>Spec/Size</th>
                    <th>Brand</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="x in displayData" :class="{'table-light-green': x.cc_select == 'Y'}" @click="x.cc_select == 'N' ? x.cc_select = 'Y' : x.cc_select = 'N'" style="cursor:pointer">
                    <td align="center"><input type="checkbox" true-value="Y" false-value="N" v-model="x.cc_select" /></td>
                    <td align="center">{{x.item}}.</td>
                    <td>{{x.type_code}}</td>
                    <td>{{x.c_des}}</td>
                    <td>{{x.c_des1}}</td>
                    <td>{{x.c_des2}}</td>
                    <td>{{x.c_des3}}</td>
                    <td>{{x.unitname}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
      <template slot="footer">
        <pagination class="pull-left" ref="itemMatPaging" @page-change="onPageSelected($event.page, 'mat_list')"></pagination>
        <button type="button" class="btn btn-sm btn-default" @click="pushItemMat"><i class="fa fa-plus"></i> Selected</button>
      </template>
    </modal>
    <!-- Modal : Copy Area to Project -->
    <modal ref="projectCopyModal">
      <template slot="header">
        <h4><i class="fas fa-building"></i> Project Contract</h4>
      </template>
      <template slot="body">
        <div class="row">
          <div class="col-md-2">
            <div style="margin-bottom:10px">
              <button class="btn btn-sm bg-navy" @click="selectProjectAll()"><i class="fas fa-check-circle"></i> Select All</button>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12 col-md-12">
            <ag-table ref="agrProject"
                      :scale="300"
                      :footer="false"
                      @ready="initProjectTable()"
                      :saveColumns="'Y'"
                      :doctype="'PROJAREA_COPY'"
                      :page_name="'v_csm_mas_003_project'"></ag-table>
          </div>
        </div>
      </template>
      <template slot="footer">
        <pagination class="pull-left" ref="projectPaging" @page-change="onPageSelected($event.page, 'ProjectContractCopy')"></pagination>
        <button class="btn btn-sm bg-olive" @click.prevent="copyClick()"><i class="fas fa-save"></i> <span v-text="ui.save || 'Save'"></span></button>
      </template>
    </modal>
    <!-- tab1-m1 -->
    <modal ref="tab1">
      <template slot="header"><div class="form-group">
        <h4>เพิ่มรายการใหม่</h4></div></template>
        <template slot="body"> 
          <div class="row">
          <div class="col-lg-3 col-md-4">
            <div class="form-group">
              <label class="text-danger">รหัสพื้นที่</label>
              <input type="text" class="form-control input-sm" maxlength="15" v-model="area.loccode" :disabled="!area.pre_event" />
            </div>
          </div>
          <div class="col-lg-7 col-md-4">
            <div class="form-group">
              <label>ชื่อพื้นที่</label>
              <input type="text" class="form-control input-sm" maxlength="200" v-model="area.locname" :disabled="!area.pre_event" />
            </div>
          </div>
          <div class="col-lg-2 col-md-4">
            <div class="d-flex margin-t-25">
              <div class="form-check form-check-custom form-check-solid form-check-sm">
                <input class="form-check-input" type="checkbox" v-model="area.active" true-value="Y" false-value="N" :disabled="!area.pre_event"/>
                <label class="form-check-label"><span>Active</span></label>
              </div>
            </div>
          </div>
        </div>   
      </template>
      <template slot="footer">
        <button class="btn btn-sm  btn-success" @click.prevent="saveArea "><i class="fa fa-save"></i> บันทึกข้อมูล</button>
      </template>
    </modal>
    <!-- Modal : Template Import Data -->
    <import-data ref="importData" @send-import="onImport($event)" :clear-input="()=> importForm = {}" :default-input="defaultImport">
      <template #body-import>
        <div class="row">
          <div class="col-md-12 margin-b-10">
            <button class="btn btn-sm btn-success" @click.prevent="onTemplateExcel"><i class="fas fa-download"></i> ดาวน์โหลดเทมเพลต</button>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label>เลขที่โครงการหลัก</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['pre_event']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>รหัสพื้นที่</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['loccode']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>ชื่อพื้นที่</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['locname']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Active</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['active']" maxlength="2" />
            </div>
          </div>
        </div>
      </template>
    </import-data>
    <!-- Center Modal -->
    <vue-project-list ref="ct_project" @send-data="sendComponent($event, 'project')"></vue-project-list>

  </div>
</template>
<script>
  let process = false;
  let page = {};
  let itemPaging = {};
  let itemMatPaging = {};
  let projectPaging = {};
  let paging = {};
  let paging1 = {};
  let appForm = {};

  let cpn = {
    data() {
      return {
        ui: window.ui,
        company: window.baseCompany,
        xt: $xt,
        tabActive: 0,
        searchArea: {
          active:"Y"
        },
        itemSearch: { search: "" },
        area: {
          active:"N"
        },
        data_area: [],
        data_item: [],
        displayData: [],
        display_area: [],
        display_item: [],
        show_area: {},
        itemlist: [],
        itemPage: 1,
        auth,
        editMode: false,
        editItem: false,
        projectContract: [],
        displayProject: [],
        projectPage: 1,
        all_select: false,
        pageNumber: 1,
        totalData: 0,
        exportUrl:"",
        importForm: {
          pre_event: 'A',
          loccode: 'B',
          locname: 'C',
          active: 'D'
        }
      };
    },
    methods: {
      pageChange(pn) {
        pn = pn || 1;
        this.pageNumber = pn;
        paging.setCurrentPage(pn);

        let displayData = $linq(this.data_area).skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray();
        this.$set(this, "display_area", displayData);
        paging.createPagesArray();

        this.$nextTick(() => {
          let agr = this.$refs.agr;
          if (agr) {
            agr.setDisplay(displayData);
          }
        });
      },

      async initTable() {
        let agr = this.$refs.agr;
        if (!agr) return;

        let self = this;
        let hasPermission = this.permission();

        let fields = [
          ["itemno", "ลำดับ", "text", { width: 80, align: "center", pinned: 'left', cellStyle: { "font-weight": "bold" } }],
        ];

        if (hasPermission) {
          fields.push(["manage", "แก้ไข", "text", {
            width: 100,
            align: "center",
            pinned: 'left',
            cellRenderer: (params) => {
              let x = params.data;
              let editBtn = `<a href="#" class="btn-edit-area text-black" style="margin-right: 8px;" data-loccode="${x.loccode}"><i class="fa fa-edit"></i></a>`;
              let delBtn = `<a href="#" class="btn-del-area text-danger" data-loccode="${x.loccode}"><i class="fa fa-trash"></i></a>`;
              return editBtn + delBtn;
            },
          }]);
        }

        fields.push(["warranty", "ประกัน", "text", {
          width: 100,
          align: "center",
           pinned: 'left',
          cellRenderer: (params) => {
            let x = params.data;
            let cls = x.count_item === 'Y' ? 'text-olive' : '';
            return `<a href="#" class="btn-set-item ${cls}" data-loccode="${x.loccode}" data-locname="${x.locname}"><i class="fa fa-copy"></i></a>`;
          },
        }]);

        fields = fields.concat([
          ["loccode", "รหัสพื้นที่", "text", { width: 180, align: "left", sortable: true }],
          ["locname", "ชื่อพื้นที่", "text", { width: 300, align: "left", sortable: true }],
          ["active", "Active", "text", {
            width: 120,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              let x = params.data;
              let cls = x.active == 'Y' ? 'text-success' : 'text-danger';
              let txt = x.active == 'Y' ? 'Yes' : 'No';
              return `<span class="${cls}">${txt}</span>`;
            },
          }],
          ["adduser", "เพิ่มโดย", "text", { width: 200, align: "center", sortable: true }],
          ["adddatetime", "วันที่เพิ่ม", "datetime", {
            width: 220,
            align: "center",
            sortable: true,
          
          }, { useCellRenderer: true }],
          ["edituser", "แก้ไขโดย", "text", { width: 200, align: "center", sortable: true }],
          ["editdatetime", "วันที่แก้ไข", "datetime", {
            width: 220,
            align: "center",
            sortable: true,
          
          }, { useCellRenderer: true }],
        ]);

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);

        this.$nextTick(() => {
          $(document).off('click', '.btn-edit-area');
          $(document).off('click', '.btn-del-area');
          $(document).off('click', '.btn-set-item');

          $(document).on('click', '.btn-edit-area', function(e) {
            e.preventDefault();
            let loccode = $(this).data('loccode');
            let rowData = $linq(self.data_area).where(x => x.loccode == loccode).firstOrDefault();
            if (rowData) {
              self.editArea(rowData);
            }
          });

          $(document).on('click', '.btn-del-area', function(e) {
            e.preventDefault();
            let loccode = $(this).data('loccode');
            let rowData = $linq(self.data_area).where(x => x.loccode == loccode).firstOrDefault();
            if (rowData) {
              self.delArea(rowData);
            }
          });

          $(document).on('click', '.btn-set-item', function(e) {
            e.preventDefault();
            let loccode = $(this).data('loccode');
            let locname = $(this).data('locname');
            let rowData = $linq(self.data_area).where(x => x.loccode == loccode).firstOrDefault();
            if (rowData) {
              self.setItem(rowData);
            }
          });
        });
      },

      pageChange1(pn) {
        let t = $linq(this.data_item).count();
        let maxPage = Math.max(1, Math.ceil(t / paging1.getItemsPerPage()));

        // ตรวจสอบว่าหน้าปัจจุบันไม่เกิน maxPage
        if (!pn || pn > maxPage) {
            pn = maxPage;
        }

        this.pageNumber = pn;
        paging1.setCurrentPage(pn);

        const startIndex = (pn - 1) * paging1.getItemsPerPage();
        this.$set(this, "display_item", $linq(this.data_item).skip(startIndex).take(paging1.getItemsPerPage()).toArray());

        this.display_item.sort((a, b) => {
            const aStr = String(a.war_code);
            const bStr = String(b.war_code);

            const isANum = /^\d+$/.test(aStr);
            const isBNum = /^\d+$/.test(bStr);

            if (isANum && isBNum) {
                return parseInt(aStr) - parseInt(bStr);
            }

            const aMatch = aStr.match(/^(\D*)(\d*)$/);
            const bMatch = bStr.match(/^(\D*)(\d*)$/);

            if (!aMatch || !bMatch) {
                return 0;
            }

            const aText = aMatch[1];
            const bText = bMatch[1];

            if (aText < bText) return -1;
            if (aText > bText) return 1;

            const aNum = aMatch[2] ? parseInt(aMatch[2]) : 0;
            const bNum = bMatch[2] ? parseInt(bMatch[2]) : 0;

            return aNum - bNum;
        });

        this.display_item.forEach((item, index) => {
            item.itemno = startIndex + index + 1;
        });

        paging1.createPagesArray();

        this.$nextTick(() => {
          let agrItem = this.$refs.agrItem;
          if (agrItem) {
            agrItem.setDisplay(this.display_item);
          }
        });
      },

      async initItemTable() {
        let agrItem = this.$refs.agrItem;
        if (!agrItem) return;

        let self = this;
        let hasPermission = this.permission();

        let fields = [
          ["itemno", "#", "text", { width: 60, align: "center", pinned: 'left' }],
        ];

        if (hasPermission) {
          fields.push(["manage", "Delete", "text", {
            width: 120,
            align: "center",
            pinned: 'left',
            cellRenderer: (params) => {
              let x = params.data;
              return `<a href="#" class="btn-remove-item text-danger" data-itemno="${x.itemno}"><i class="fa fa-trash"></i></a>`;
            },
          }]);
        }

        fields = fields.concat([
          ["war_code", "Warranty Code", "text", { width: 220, align: "left", sortable: true }],
          ["war_des", "Warranty Name", "text", { width: 440, align: "left", sortable: true }],
        ]);

        let header = agrItem.createHeaderFromArray(fields);
        agrItem.setHeader(header);

        this.$nextTick(() => {
          $(document).off('click', '.btn-remove-item');

          $(document).on('click', '.btn-remove-item', function(e) {
            e.preventDefault();
            let itemno = parseInt($(this).data('itemno'));
            let rowData = $linq(self.data_item).where(x => x.itemno == itemno).firstOrDefault();
            if (rowData) {
              self.removeItem(rowData);
            }
          });
        });
      },

      async initWarrantyTable() {
        let agrWarranty = this.$refs.agrWarranty;
        if (!agrWarranty) return;

        let self = this;

        let fields = [
          ["cc_select", "", "text", {
            width: 50,
            align: "center",
            pinned: 'left',
            cellRenderer: (params) => {
              let x = params.data;
              let checked = x.cc_select == 'Y' ? 'checked' : '';
              return `<input type="checkbox" class="chk-warranty-select" data-item="${x.item}" ${checked} />`;
            },
          }],
          ["item", "#", "text", { width: 60, align: "center", pinned: 'left' }],
          ["war_code", "Warranty Code", "text", { width: 150, align: "left", sortable: true }],
          ["war_des", "Warranty Name", "text", { width: 250, align: "left", sortable: true }],
          ["type_name", "Work Type", "text", { width: 150, align: "left", sortable: true }],
          ["tot_warranty", "Warranty Date", "text", {
            width: 200,
            align: "left",
            sortable: true,
            cellRenderer: (params) => {
              let x = params.data;
              return x.lifetime == 'Y' ? 'ประกันตลอดอายุการใช้งาน' : (x.tot_warranty || '');
            },
          }],
          ["lifetime", "Lifetime", "text", {
            width: 140,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              let x = params.data;
              let cls = x.lifetime == 'Y' ? 'text-green' : 'text-red';
              let txt = x.lifetime == 'Y' ? 'Yes' : 'No';
              return `<span class="font-bold ${cls}">${txt}</span>`;
            },
          }],
          ["active", "Active", "text", {
            width: 140,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              let x = params.data;
              let cls = x.active == 'Y' ? 'text-green' : 'text-red';
              let txt = x.active == 'Y' ? 'Yes' : 'No';
              return `<span class="font-bold ${cls}">${txt}</span>`;
            },
          }],
        ];

        let header = agrWarranty.createHeaderFromArray(fields);
        agrWarranty.setHeader(header);

        this.$nextTick(() => {
          $(document).off('click', '.chk-warranty-select');

          $(document).on('click', '.chk-warranty-select', function(e) {
            e.stopPropagation();
            let item = parseInt($(this).data('item'));
            let rowData = $linq(self.itemlist).where(x => x.item == item).firstOrDefault();
            if (rowData) {
              rowData.cc_select = rowData.cc_select == 'Y' ? 'N' : 'Y';
            }
          });
        });
      },

      async initProjectTable() {
        let agrProject = this.$refs.agrProject;
        if (!agrProject) return;

        let self = this;

        let fields = [
          ["isSelected", "Select", "text", {
            width: 100,
            align: "center",
            pinned: 'left',
            cellRenderer: (params) => {
              let x = params.data;
              let checked = x.isSelected == 'Y' ? 'checked' : '';
              return `<input type="checkbox" class="chk-project-select" data-pre_event="${x.pre_event}" ${checked} />`;
            },
          }],
          ["refcode", "Ref.Code", "text", { width: 180, align: "left", sortable: true }],
          ["pre_event", "Project No", "text", { width: 180, align: "left", sortable: true }],
          ["pre_des", "Project Name", "text", {
            width: 400,
            align: "left",
            sortable: true,
            cellRenderer: (params) => {
              let x = params.data;
              let closed = x.clo == 'Y' ? ' <span class="text-danger pull-right" style="font-weight:bold;">(Closed)</span>' : '';
              return `${x.pre_des || ''}${closed}`;
            },
          }],
          ["customer_name", "Customer", "text", { width:400, align: "left", sortable: true }],
        ];

        let header = agrProject.createHeaderFromArray(fields);
        agrProject.setHeader(header);

        this.$nextTick(() => {
          $(document).off('click', '.chk-project-select');

          $(document).on('click', '.chk-project-select', function(e) {
            e.stopPropagation();
            let pre_event = $(this).data('pre_event');
            let rowData = $linq(self.projectContract).where(x => x.pre_event == pre_event).firstOrDefault();
            if (rowData) {
              rowData.isSelected = rowData.isSelected == 'Y' ? 'N' : 'Y';
            }
          });
        });
      },

      resetData() {
        this.show_area = {};
        this.data_area = [];
        this.data_item = [];
        this.display_area = [];
        this.display_item = [];
        this.resetArea();
      },
      resetArea() {
        this.$set(this.area, "loccode", "");
        this.$set(this.area, "locname", "");
        this.$set(this.area, "active", "Y");
        this.editMode = false;


      },
      searchModal() {
        this.$refs.ct_project.openModal()
      },

      setNew() {
        this.resetArea();
        this.$refs.tab1.setSize("modal-md")
        this.$refs.tab1.openModal();

      },
      setImport() {
        this.$refs.importData.openImport();
      },
      async onImport(e) {
        page.loadingBox.show();
        try {
          let f = {
            data: this.arrImport(e)
          };
          let act = `CSM/Master/Area_ImportData`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw new Error(rsp.error);
          }
          $notify.success(this.ui.alert_save_success)
          this.$refs.importData.closeImport()
          if (this.area.pre_event != null) {
            await this.loadArea();
          }
        } catch (ex) {
          $msg.alert("", ex.toString(), "danger");
        }
        finally {
          page.loadingBox.hide();
        }
      },
      arrImport(e) {
        let arr = []
        e.forEach((x) => {
          arr.push({
            pre_event: x[this.importForm.pre_event],
            loccode: x[this.importForm.loccode],
            locname: x[this.importForm.locname],
            active: x[this.importForm.active]
          })
        })
        return arr
      },
      defaultImport() {
        this.$set(this, 'importForm', {
          pre_event: 'A',
          loccode: 'B',
          locname: 'C',
          active: 'D'
        })
      },
      async onTemplateExcel(){
        let act = `csm/master/TemplateExcelArea`
        let rsp = await $xt.getServer(act)
        window.open(window.dataServer + `API/File/DownLoad?download=true&id=${rsp.data}`)
      },

      setEditArea() {
        this.$refs.editdata.openModal()
        this.editMode = true;
      },
      async editArea(x) {

        $('html,body').scrollTop(0);
        await this.readArea(x.loccode);

      },
      async saveArea() {

        if (process) return;
        try {
          let f = {
            header: this.area
          };

          let act = `CSM/MASTER/ProjArea_Create`;
          if (this.editMode) {
            act = `CSM/MASTER/ProjArea_Update`;
          }
          process = true;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          
          await this.loadArea();
          $msg.alert(`Success`, `Your information has been saved successfully.` , `success`)
          this.$refs.editdata.closeModal();
          this.$refs.tab1.closeModal();

        } catch (ex) {
          $msg.alert(`Error`, ex.toString(), `danger`);


        } finally {
          process = false;
        }

      },
      async delArea(x) {

        if (!await $msg.confirm(`คุณต้องการลบข้อมูล Area : ${x.loccode} นี้ ใช่หรือไม่`)) {
          return;
        }

        try {
          let f = {
            header: x
          };

          let act = `csm/master/ProjArea_Delete002`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw $msg.alert(`warning`, rsp.error, `warning`);;
          }
          await this.resetArea();
          await this.loadArea();
          $msg.alert(``, `Success`, `success`);
        } catch (ex) {
         // $msg.alert(``, ex.toString(), `danger`);
        }
      },
      setItem(x) {
        this.$refs.maindata.openModal();
        this.$set(this.show_area, "loccode", x.loccode);
        this.$set(this.show_area, "locname", x.locname);
        this.loadItemArea();
      },
      addItem() {
        if (this.isMaterial()) {
          this.itemSearch.search = ""
          this.loadItemMat();
          this.$refs.ItemMaterials.openModal();
        }
        else {
          this.itemSearch.search = ""
          this.loadItem();
          this.$refs.ItemWarranty.openModal();
        }
      },
      //LoadData
      async loadArea() {
        let act = `CSM/MASTER/ProjArea_ReadList?search_text=${this.searchArea.text || ''}&pre_event2=${this.area.pre_event2}`;
        for (var key in this.searchArea) {
          act += `&${key}=${encodeURIComponent(this.searchArea[key])}`
        }
        let rsp = await $xt.getServer(act);
        this.data_area = rsp.data.data_rows.data;
        // this.totalData = rsp.data.total;
        this.totalData = rsp.data.data_rows.total;

        let i = 1;
        $linq(this.data_area).foreach(x => {
          x.itemno = i++;
        });

        this.pageChange(this.pageNumber);
        paging.setTotalItems(this.totalData);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();

        await this.$nextTick();
        await this.initTable();

        // this.pageChange1(this.pageNumber);
        // paging1.setTotalItems(this.totalData);
        // if (!paging1.getItemsPerPage()) {
        //   pagin1.setCurrentPage(1);
        // }
        // paging1.createPagesArray();
      },
      async readArea(loccode) {
        this.resetArea();
        let act = `csm/master/ProjArea_Read?loccode=${encodeURIComponent(loccode || '')}&pre_event2=${this.area.pre_event2}`;
        let rsp = await $xt.getServer(act);
        this.$set(this.area, "loccode", rsp.data.loccode);
        this.$set(this.area, "locname", rsp.data.locname);
        this.$set(this.area, "active", rsp.data.active);
        this.$set(this.area, "maincode", rsp.data.maincode);
        this.setEditArea();

      },
      async loadItemArea() {
        let act = `CSM/Master/ItemArea_ReadList?pre_event=${this.area.pre_event || ''}&pre_event2=${this.area.pre_event2 || ''}&loccode=${this.show_area.loccode || ''}`;
        let rsp = await $xt.getServer(act);
        this.data_item = rsp.data.data_rows;
        this.display_item =  rsp.data.data_rows;
   
        paging1.setTotalItems(rsp.data.total);
        this.pageChange1(1);

        await this.$nextTick();
        await this.initItemTable();
      },
      async loadItem(pn) {
        this.$set(this, "itemPage", 1)
        let act = `CSM/MASTER/WarrantyItem_ReadList2?search_text=${this.itemSearch.search}`;
        let rsp = await $xt.getServer(act);

        this.all_select = false;
        $linq(rsp.data.data_rows).foreach(x => {
          x.cc_select = "N"
        });

        this.itemlist = $linq(rsp.data.data_rows).where(x => x.active == "Y").toArray() || [];
        const findDuplicateWarcode = this.itemlist.filter(itemA => !this.data_item.some(itemB => itemB.war_code === itemA.war_code));
        this.itemlist = findDuplicateWarcode

        itemPaging.setTotalItems(this.itemlist.length || 1);

        let i = 0;
        $linq(this.itemlist).foreach(x => {
          this.$set(x, "item", ++i);
        });

        this.onPageSelected(this.itemPage, 'war_list');

        await this.$nextTick();
        await this.initWarrantyTable();
      },
      async loadItemMat(pn) {
        this.$set(this, "itemPage", 1)
        let act = `csm/Center/Material_ReadList?search_text=${this.itemSearch.search}`;
        let rsp = await $xt.getServer(act);

        $linq(rsp.data.data_rows).foreach(x => {
          x.cc_select = "N"
        });

        this.itemlist = $linq(rsp.data.data_rows).toArray() || [];

        const findDuplicateTypecode = this.itemlist.filter(itemA => !this.data_item.some(itemB => itemB.war_code === itemA.type_code));
        this.itemlist = findDuplicateTypecode

        let i = 0;
        $linq(this.itemlist).foreach(x => {
          this.$set(x, "item", ++i);
        });
        this.onPageSelected(this.itemPage, 'mat_list');
        
      },
      async pushItem() {
        let itemSelect = $linq(this.itemlist).where(x => x.cc_select == "Y").toArray() || [];
        let itemno = ((this.data_item.length == 0) ? 0 : ($linq(this.data_item).max(x => x.itemno) || 0)) + 1;
        $linq(itemSelect).foreach(x => {
          this.data_item.push({
            itemno: itemno++,
            war_code: x.war_code,
            war_des: x.war_des
          });
        });

        let t = $linq(this.data_item).count();
        // paging.setTotalItems(t);
        paging1.setTotalItems(t);
        // this.pageChange(this.pageNumber);
        this.pageChange1(this.pageNumber);

        this.$refs.ItemWarranty.closeModal();
      },
      async pushItemMat() {
        let itemSelect = $linq(this.itemlist).where(x => x.cc_select == "Y").toArray() || [];
        let itemno = ((this.data_item.length == 0) ? 0 : ($linq(this.data_item).max(x => x.itemno) || 0)) + 1;
        $linq(itemSelect).foreach(x => {
          this.data_item.push({
            itemno: itemno++,
            war_code: x.type_code,
            war_des: x.c_des1
          });
        });

        let t = $linq(this.data_item).count();
        paging.setTotalItems(t);
        paging1.setTotalItems(t);
        this.pageChange(this.pageNumber);
        this.pageChange1(this.pageNumber);

        this.$refs.ItemMaterials.closeModal();
      },
      removeItem(x) {
        this.data_item = $linq(this.data_item).where(w => !(w.itemno == x.itemno)).toArray() || [];
        
        let runno = 1;
        $linq(this.data_item).foreach(f => {
            f.itemno = runno++;
        });

        let t = $linq(this.data_item).count();
        paging1.setTotalItems(t);

        let maxPage = Math.max(1, Math.ceil(t / paging1.getItemsPerPage()));

        if (this.pageNumber > maxPage) {
            this.pageNumber = maxPage;
        }

        paging1.createPagesArray(); 
        this.pageChange1(this.pageNumber);
      },
      async saveItem() {
        if (process) return;
        try {
          let header = {
            pre_event: this.area.pre_event,
            pre_event2: this.area.pre_event2,
            loccode: this.show_area.loccode
          };

          $linq(this.data_item).foreach(x => {
            x.pre_event = this.area.pre_event;
            x.pre_event2 = this.area.pre_event2;
            x.loccode = this.show_area.loccode;
          });

          let act = `CSM/Master/ItemArea_Create`;
          process = true;
          let rsp = await $xt.postServerJson(act, { header, detail: this.data_item });
          if (!rsp.success) {
            throw rsp.error;
          }
          await this.loadItemArea();
          $notify.success(this.ui.alert_save_success);
          this.$refs.maindata.closeModal();
          this.$refs.tab1.closeModal();


        } catch (ex) {
          $msg.alert(`ผิดพลาด`, ex.toString(), `danger`);

        } finally {
          process = false;
        }
      },
      onPageSelected(pn, type) {
        switch (type) {
          case "war_list":
            pn = pn || 1;
            this.itemPage = pn;
            itemPaging.setCurrentPage(pn);

            this.displayData = $linq(this.itemlist).skip(itemPaging.skipItems()).take(itemPaging.getItemsPerPage()).toArray();
            this.displayData.push()
            itemPaging.createPagesArray();

            this.$nextTick(() => {
              let agrWarranty = this.$refs.agrWarranty;
              if (agrWarranty) {
                agrWarranty.setDisplay(this.displayData);
              }
            });
            break;
          case "mat_list":
            pn = pn || 1;
            this.itemPage = pn;
            itemMatPaging.setCurrentPage(pn);

            this.displayData = $linq(this.itemlist).skip(itemMatPaging.skipItems()).take(itemMatPaging.getItemsPerPage()).toArray();
            this.displayData.push()
            itemMatPaging.createPagesArray();
            break;
          case "ProjectContractCopy":
            pn = pn || 1;
            this.projectPage = pn;
            projectPaging.setCurrentPage(pn);

            this.displayProject = $linq(this.projectContract).skip(projectPaging.skipItems()).take(projectPaging.getItemsPerPage()).toArray();
            this.displayProject.push()
            projectPaging.createPagesArray();

            this.$nextTick(() => {
              let agrProject = this.$refs.agrProject;
              if (agrProject) {
                agrProject.setDisplay(this.displayProject);
              }
            });
            break;
        }
      },
      sendComponent(e, type) {
        switch (type) {
          case "project":
            this.$set(this.area, "pre_event", e.pre_event);
            this.$set(this.area, "pre_event2", e.pre_event2);
            this.$set(this.area, "pre_des", e.pre_des);
            this.exportUrl = `csm/master/Area_Export?pre_event2=${this.area.pre_event2}`
            this.loadArea();
            break;
        }
      },
      clearData(data, field) {
        if (field[0] == "pre_event") this.resetData();
        $linq(field).foreach(x => this.$set(data, x, null));
      },
      openProjectModal() {
        this.$refs.projectCopyModal.setSize('modal-xl');
        this.$refs.projectCopyModal.openModal();
        this.loadProjectContractCopy();
      },
      async loadProjectContractCopy() {
        let act = `CSM/Master/ProjectContract_Copy`;
        let rsp = await $xt.getServer(act);
        this.projectContract = $linq(rsp.data.data_rows).where(x => x.pre_event != this.area.pre_event).toArray() || [];

        projectPaging.setTotalItems(rsp.data.total || 1);
        this.onPageSelected(this.projectPage, 'ProjectContractCopy');

        await this.$nextTick();
        await this.initProjectTable();
      },
      async copyClick() {
        var arr = $linq(this.projectContract).where(x => x.isSelected).toArray() || [];
        try {
          let f = {
            arr: arr,
            pre_event: this.area.pre_event
          };
          page.loadingBox.show();
          let act = `CSM/Master/ProjArea_CopyArea`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          $msg.alert(``, `Success`, `success`);
          this.$refs.projectCopyModal.closeModal();
        } catch (ex) {
          page.loadingBox.hide();
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      selectProjectAll() {
        const allSelected = this.projectContract.every(x => x.isSelected === 'Y');
        $linq(this.projectContract).foreach(x => {
          x.isSelected = allSelected ? 'N' : 'Y';
        });
        // Refresh current page display in ag-table
        this.onPageSelected(this.projectPage, 'ProjectContractCopy');
      },
      isMaterial() {
        return this.company == "GIS";
      },
      selectAllWarr() {
        $linq(this.displayData).foreach(x => {
          x.cc_select = !this.all_select ? "Y" : "N";
        });
        this.$nextTick(() => {
          let agrWarranty = this.$refs.agrWarranty;
          if (agrWarranty) {
            agrWarranty.setDisplay(this.displayData);
          }
        });
      },
      is_mango() {
        let isMango = $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault();
        return isMango == "Y" ? true : false;
      },
      permission() {
        let data = (!this.is_mango() || auth.is_admin);
        return data;
      },
    },
    computed: {
      configData() { return store.state.configData },
    },
    mounted() {
      (async () => {
        page = this.$refs.page;
        page.pageTitle = 'Master : เพิ่มพื้นที่ในโครงการ';
        document.title = page.pageTitle;
        this.$refs.tab1.setSize('modal-xl')
        this.$refs.ItemWarranty.setSize('modal-xl-2')


        itemPaging = this.$refs.itemPaging;
        itemPaging.setCurrentPage(1);
        itemPaging.setItemsPerPage(20);

        itemMatPaging = this.$refs.itemMatPaging;
        itemMatPaging.setCurrentPage(1);
        itemMatPaging.setItemsPerPage(10);

        projectPaging = this.$refs.projectPaging;
        projectPaging.setCurrentPage(1);
        projectPaging.setItemsPerPage(15);

        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(10);

        paging1 = this.$refs.paging1;
        paging1.setCurrentPage(1);
        paging1.setItemsPerPage(10);
        
        appForm = this.$refs.appForm
        appForm.btnDelete.show = false
        appForm.btnSave.show = false
        appForm.btnNew.disabled = !this.area.pre_event
        appForm.btnExport.disabled = !this.area.pre_event
        appForm.btnNew.click = this.setNew
        appForm.btnImport.click = this.setImport

        this.resetArea();
        this.$refs.ItemWarranty.setSize('modal-lg');
        this.$refs.ItemMaterials.setSize('modal-xl');
      })();
    },
    watch: {
      // คอยสังเกตการเปลี่ยนแปลงของ this.area.pre_event
      'area.pre_event': function(newVal) {
        // เมื่อ area.pre_event เปลี่ยนแปลง
        const appForm = this.$refs.appForm;
        appForm.btnExport.disabled = !newVal;
        appForm.btnNew.disabled = !newVal;
      }
    },
    beforeDestroy() {
      $(document).off('click', '.btn-edit-area');
      $(document).off('click', '.btn-del-area');
      $(document).off('click', '.btn-set-item');
      $(document).off('click', '.btn-remove-item');
      $(document).off('click', '.chk-warranty-select');
      $(document).off('click', '.chk-project-select');
    }
  };
  export default cpn;
</script>
<style scoped>
  .isDisabled {
    cursor: not-allowed;
    pointer-events: none;
  }

  .text-red {
    color: #ff0000 !important;
  }

  .text-green {
    color: #00c116 !important;
  }

  .checkbox, .radio {
    margin-top: unset;
    margin-bottom: unset;
  }

    .checkbox label, .radio label {
      padding-left: 10px;
    }
</style>
