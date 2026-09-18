<template>
  <div>
    <re-page ref="page">
      <template #body>
        <app-form-2 ref="appForm"
        exportSelect="B"
        :exportUrl= exportUrl
        >
        <template #extraBtn>
          <button class="btn btn-sm btn-instagram" v-if="btnShow" @click="exportValidate">
            <i class="fas fa-cloud-download-alt"></i> <span v-text="ui.export_excel || 'Export Document (Excel)'"></span>
          </button>
        </template>
          <template #form-detail>
            <div class="box box-widget"style="border-radius: 2px !important;" >
              <div class="box-body" >
                <!-- Project Contract & Unit/Phase -->
                <div class="row filter-section">
                  <div class="col-lg-2 col-md-3">
                    <div class="form-group mb-5">
                      <label class="text-danger">โครงการหลัก</label>
                      <span class="input-group">
                        <input type="text" class="form-control input-sm text-bold" v-model="headerData['pre_event']" readonly />
                        <span class="input-group-btn">
                          <button class="btn btn-sm bg-navy" @click="$refs.ct_project.openModal()" ref="pre_event"><i class="fa fa-search"></i></button>
                          <button class="btn btn-sm btn-danger" @click="resetData()"><i class="fa fa-close"></i></button>
                        </span>
                      </span>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-4">
                    <div class="form-group mb-5">
                      <label class="text">ชื่อโครงการหลัก</label>
                      <input type="text" class="form-control input-sm" v-model="headerData.pre_des" readonly />
                    </div>
                  </div>
                  <div class="col-lg-2 col-md-3">
                    <div class="form-group mb-5">
                      <label class="text-danger">โครงการย่อย (Unit/Phase)</label>
                      <span class="input-group">
                        <input type="text" class="form-control input-sm text-bold" v-model="headerData['pre_event_unit']" readonly />
                        <span class="input-group-btn">
                          <button class="btn btn-sm bg-navy" @click="$refs.ct_project_unit.openModal()" ref="pre_event" :disabled="xt.isEmpty(headerData.pre_event)"><i class="fa fa-search"></i></button>
                          <button class="btn btn-sm btn-danger" @click="resetDataPhase()" :disabled="xt.isEmpty(headerData.pre_event)"><i class="fa fa-close"></i></button>
                        </span>
                      </span>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-4">
                    <div class="form-group mb-5">
                      <label class="text">ชื่อโครงการย่อย</label>
                      <input type="text" class="form-control input-sm" v-model="headerData['pre_des_unit']" readonly />
                    </div>
                  </div>
                </div>
                <!-- Search & Action -->
                <div class="row filter-section" v-show="!xt.isEmpty(headerData.pre_event)">
                  <div class="col-lg-2 col-md-3">
                    <div class="form-group mb-5">
                      <label v-text="ui.search_by || 'Search By'"></label>
                      <select class="form-control input-sm" v-model="searchMainData.search_field">
                        <option value="loccode">Area Code</option>
                        <option value="loccname">Area Name</option>
                        <option value="war_code">Warranty Code</option>
                        <option value="war_des">Warranty Name</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-4">
                    <div class="form-group mb-5">
                      <label v-text="ui.search || 'Search'"></label>
                      <span class="input-group">
                        <input type="text" class="form-control input-sm text-bold" v-model="searchMainData.search_text" @keyup.enter="mainSearch(searchMainData.search_field,searchMainData.search_text)"/>
                        <span class="input-group-btn">
                          <button class="btn btn-sm bg-navy" @click.prevent="mainSearch(searchMainData.search_field,searchMainData.search_text)"><i class="fa fa-search"></i></button>
                        </span>
                      </span>
                    </div>
                  </div>
                  <div class="col-lg-5 col-md-5 text-right" v-if="dataListDisplay.length > 0" style="padding-top: 20px;">
                    <button class="btn btn-sm bg-navy" :disabled="activeCheck" @click="startWarrantyAllItem()">
                      <i class="ion ion-play"></i> เริ่มต้นประกันทั้งหมด (ทุก Area)
                    </button>
                  </div>
                </div>
                <!-- Show Area -->
                <div class="row">
                  <div class="col-lg-12 col-md-12 col-sm-12">
                    <div class="box box-solid" style="border-radius: 2px !important;">
                      <div class="box-body scrollable-area">
                        <div class="row margin-b-5">
                          <div class="col-lg-6 col-md-6 col-sm-6">
                            <div><span class="text-danger">* หมายเหตุ : </span> หากกดเริ่มประกันแล้ว ไม่กดปุ่ม Save ด้านล่าง ข้อมูลทั้งหมดจะไม่มีผลใดๆทั้งสิ้น</div>
                          </div>
                          <div class="col-lg-6 col-md-6 col-sm-6">
                            <span class="pull-right">ผลลัพธ์ของข้อมูลทั้งหมด คือ {{dataListDisplay.length || 0}} รายการ</span>
                          </div>
                        </div>
                        <template v-for="(x,idx) in dataListDisplay">
                          <div class="area-header-row"  @click="toggleCollapse(idx)">
                            <div class="area-header-left"  :class="{ 'text-black': x.item_warranty.length > 0, 'text-gray': x.item_warranty.length === 0 }">
                              <h5 class="area-title">
                                <i class="fas fa-chevron-right icon-transition" :class="{ rotated: collapseState[idx] }"></i>
                                รหัสพื้นที่โครงการ : {{x.loccode}} | พื้นที่โครงการ : {{x.locname}}
                                <i class="fas fa-folder-open" :class="{ 'text-olive': x.item_warranty.length > 0, 'text-gray': x.item_warranty.length === 0 }"></i>
                                <span class="badge-count">{{x.item_warranty.length}}</span>
                              </h5>
                            </div>
                            <div class="area-header-right">
                              <button class="btn btn-sm btn-info" @click.stop="openAddModal(x)">
                                <i class="fas fa-plus"></i> เพิ่มรายการประกันใน Area นี้
                              </button>
                              <button class="btn btn-sm btn-default" :disabled="startDateCheckbyArea(x.item_warranty)" @click.stop="startWarrantybyArea(x.item_warranty)" v-if="x.item_warranty.length > 0">
                                <i class="ion ion-play"></i> เริ่มต้นรายการประกันทั้งหมดใน Area
                              </button>
                              <button class="btn btn-sm bg-navy" @click.stop="copyWarrantyDate(x)" v-if="x.item_warranty.length > 0">
                                <i class="fa fa-copy"></i> Copy Start Date
                              </button>
                            </div>
                          </div>
                          <div v-show="collapseState[idx]" class="area-ag-table-wrap">
                            <div class="area-search-row">
                              <input type="text" class="form-control input-sm" v-model="searchByAG[idx]" @input="searchByAGFilter(idx)" placeholder="ค้นหา Warranty Code, Name, Model, Serial..." style="max-width:350px;" />
                            </div>
                            <ag-table :ref="'agrArea' + idx" :scale="400" :footer="false" :key="'agrArea' + idx + agTableKey"></ag-table>
                            <div class="clearfix">
                              <pagination class="pull-left margin-t-5" :ref="'areaPaging' + idx" @page-change="areaPageChange(idx, $event.page)"></pagination>
                            </div>
                          </div>
                  
                        </template>
                        <div class="row">
                          <div class="col-md-12">
                            <pagination v-show="!xt.isEmpty(headerData.pre_event)" class="pull-left margin-t-5" ref="paging" @page-change="pageChange($event.page)"/>
                          </div>
                        </div>
                                <hr style="margin-top: 20px;"/>
                      </div>
                      <!-- Loading -->
                      <div class="overlay" v-if="isLoading">
                        <i class="fa fa-refresh fa-spin"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </app-form-2>
        <input type="file" ref="File" accept=".xls, .xlsx" v-show="false" />
      </template>
    </re-page>
    <vue-project-list ref="ct_project" @send-data="sendComponent($event, 'project')"></vue-project-list>
    <vue-project-unit-list ref="ct_project_unit" :pre_event2="headerData['pre_event2']" @send-data="sendComponent($event, 'project_unit')"></vue-project-unit-list>
    <!-- Modal : Template Import Data -->
    <import-data ref="importData" @send-import="onImport($event)" :clear-input="()=> importForm = {}" :default-input="defaultImport">
      <template #body-import>
        <div class="row">
          <div class="col-md-12 margin-b-10">
            <button class="btn btn-sm btn-success" @click="xt.downloadTemplateExcel('Template_Warranty')"><i class="fas fa-download"></i> ดาวน์โหลดเทมเพลต</button>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label>Project</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['pre_event']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Area Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['loccode']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Warranty Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['war_code']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Model Name</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['itemname_other']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Serial Number</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['serial_number']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Remark</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['remark']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Start Date (Customer)</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['startdate']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>End Date (Customer)</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['enddate']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Vendor</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['vendor']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Start Date (Vendor)</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['vendor_start_dt']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>End Date (Vendor)</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['vendor_end_dt']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Remark Vendor</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['vendor_remark']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Active Warranty</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['active_row']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Start Warranty</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['active']" maxlength="2" />
            </div>
          </div>
        </div>
      </template>
    </import-data>

    <modal-2 ref="addModal">
      <template #header>
        <h4><i class="fa fa-edit">Add Item Warranty</i></h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-lg-4 col-md-4">
            <div class="form-group">
              <label>รหัสพื้นที่</label>
              <input type="text" class="form-control input-sm" :value="storeDataList.loccode" readonly />
            </div>
          </div>
          <div class="col-lg-6 col-6">
            <div class="form-group">
              <label>ชื่อพื้นที่</label>
              <input type="text" class="form-control input-sm" :value="storeDataList.locname" readonly />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-4 col-md-4">
            <div class="form-group">
              <label v-text="ui.search_by || 'Search By'"></label>
              <select class="form-control input-sm" v-model="searchData.search_field">
                <option value="war_code">Warranty Code</option>
                <option value="war_des">Warranty Name</option>
              </select>
            </div>
          </div>
          <div class="col-lg-6 col-md-6">
            <div class="form-group">
              <label v-text="ui.search || 'Search'"></label>
              <div class="input-group">
                <input type="text" class="form-control input-sm" v-model="searchData.search_text" @keyup.enter="doSearch()"/>
                <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click.prevent="doSearch()"><i class="fas fa-search"></i></button></span>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12 col-md-12">
            <div class="table-responsive">
              <table class="table table-bordered table-striped table-hover">
                <thead>
                  <tr>
                    <th style="width:1px">
                      <div class="d-flex justify-content-center" >
                        <div class="form-check form-check-custom form-check-solid form-check-sm" v-if="addItemDisplay.length <= 5 ">
                          <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="selectAllChecked" @change="selectAll"/>
                        </div>
                      </div>
                    </th>
                    <th style="width:1px">No.</th>
                    <th style="width:150px;">Warranty Code</th>
                    <th>Warranty Name</th>
                    <th>Item</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="x,idx in addItemDisplay">
                    <td>
                      <div class="d-flex justify-content-center" >
                        <div class="form-check form-check-custom form-check-solid form-check-sm">
                          <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="x.checked" @change="selectItem(x)" :disabled="x.checked !== 'Y' && selectedItems.length >= 5"/>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">{{x.itemno}}.</td>
                    <td>{{x.war_code}}</td>
                    <td>{{x.war_des}}</td>
                    <td>
                      <input class="form-control input-sm text-center" 
                             type="number" def min="1" max="10"
                             oninput="this.value = Math.max(1, Math.min(10, this.value));"  
                             :value="x.item || 1" 
                             @input="x.item = $event.target.value"
                             />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <pagination class="pull-left" ref="itemWarPaging" @page-change="pageModalChange($event.page)"></pagination>
        <button type="button" class="btn btn-sm btn-default" @click="addItemWar()">
          <i class="fa fa-plus"></i> Selected
        </button>
      </template>
    </modal-2>

    <modal-2 ref="revModal">
      <template #header>
        <h4><i class="fas fa-eye"></i> View Revise</h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-lg-4 col-md-4">
            <div class="form-group">
              <label>Revise No.</label>
              <div class="input-group">
                <input type="text" class="form-control input-sm text-center" v-model.trim="retrieveSearch.text" @keyup.enter="reviseSearch" @keypress="isNumber" />
                <span class="input-group-btn"><a class="btn btn-sm bg-navy" @click="reviseSearch"><i class="fas" v-bind:class="{'fa-spinner fa-spin': isLoading, 'fa-search': !isLoading}"></i></a></span>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-4">
            <div class="form-group">
              <label>&nbsp;</label>
              <div class="form-check form-switch form-check-custom form-check-solid form-check-sm me-5">
                <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="retrieveSearch.all" @change="reviseSearch" />
                <label class="form-check-label">Show All Revise</label>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12 col-md-12">
            <div>
              <label class="margin-l-5">รหัสพื้นที่โครงการ : {{tmpData.loccode}}</label>
              <label class="margin-l-5">พื้นที่โครงการ : {{tmpData.locname}}</label>
              <label class="margin-l-5">Warranty Code : {{tmpData.war_code || ''}}</label>
              <label class="margin-l-5">Serial Number : {{tmpData.serial_number || ''}}</label>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12 col-md-12">
            <ag-table ref="agrRevise" :scale="500" :footer="false"></ag-table>
          </div>
        </div>
      </template>
    </modal-2>

    <!-- Edit Warranty Item Modal -->
    <modal-2 ref="editWarModal">
      <template #header>
        <h4><i class="fa fa-edit"></i> Edit Warranty Item</h4>
      </template>
      <template #body>
        <div class="row" v-if="editWarData">
          <div class="col-lg-4 col-md-4">
            <div class="form-group">
              <label>Warranty Code</label>
              <input type="text" class="form-control input-sm" :value="editWarData.war_code" readonly />
            </div>
          </div>
          <div class="col-lg-6 col-md-6">
            <div class="form-group">
              <label>Warranty Name</label>
              <input type="text" class="form-control input-sm" :value="editWarData.war_des" readonly />
            </div>
          </div>
          <div class="col-lg-2 col-md-2">
            <div class="form-group">
              <label>Duration</label>
              <input type="text" class="form-control input-sm" :value="editWarData.lifetime == 'Y' ? 'ตลอดอายุ' : editWarData.tot_warranty" readonly />
            </div>
          </div>
        </div>
        <div class="row" v-if="editWarData">
          <div class="col-lg-4 col-md-4" v-if="isREcustomer()">
            <div class="form-group">
              <label>Model Name</label>
              <input type="text" class="form-control input-sm" v-model="editWarData.itemname_other" />
            </div>
          </div>
          <div class="col-lg-4 col-md-4" v-if="isREcustomer()">
            <div class="form-group">
              <label>Serial Number</label>
              <input type="text" class="form-control input-sm" v-model="editWarData.serial_number" :disabled="editWarData.active === 'Y'" />
            </div>
          </div>
          <div class="col-lg-4 col-md-4">
            <div class="form-group">
              <label>Remark</label>
              <input type="text" class="form-control input-sm" v-model="editWarData.remark" />
            </div>
          </div>
        </div>
        <hr/>
        <div class="row" v-if="editWarData">
          <div class="col-lg-4 col-md-4">
            <div class="form-group">
              <label class="text-danger">Start Date (Customer)</label>
              <datepicker input-class="form-control input-sm" v-model="editWarData.startdate" :clearable="false" :disabled="editWarData.active === 'Y'" @change="setWarrantyDate(editWarData)"></datepicker>
            </div>
          </div>
          <div class="col-lg-4 col-md-4">
            <div class="form-group">
              <label class="text-danger">End Date (Customer)</label>
              <datepicker input-class="form-control input-sm" v-model="editWarData.enddate" :clearable="false" :disabled="true"></datepicker>
            </div>
          </div>
          <div class="col-lg-2 col-md-2">
            <div class="form-group">
              <label>Active</label>
              <div class="form-check form-check-custom form-check-solid form-check-sm" style="padding-top: 5px;">
                <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="editWarData.active_row"/>
                <label class="form-check-label">Active</label>
              </div>
            </div>
          </div>
          <div class="col-lg-2 col-md-2">
            <div class="form-group">
              <label>&nbsp;</label>
              <div>
                <button class="btn btn-sm bg-navy" :disabled="editWarData.active === 'Y'" @click="startWarrantybyItem(editWarData)">
                  <i class="ion ion-play"></i> Start
                </button>
              </div>
            </div>
          </div>
        </div>
        <hr/>
        <div class="row" v-if="editWarData">
          <div class="col-lg-3 col-md-3">
            <div class="form-group">
              <label>Vendor Name</label>
              <input type="text" class="form-control input-sm" v-model="editWarData.vendorName" :disabled="!xt.isEmpty(editWarData.ic_docno) && !xt.isEmpty(editWarData.ic_itemno)" />
            </div>
          </div>
          <div class="col-lg-3 col-md-3">
            <div class="form-group">
              <label>Start Date (Vendor)</label>
              <datepicker input-class="form-control input-sm" v-model="editWarData.vardor_st_date" :disabled="editWarData.active === 'Y' || !xt.isEmpty(editWarData.ic_docno) && !xt.isEmpty(editWarData.ic_itemno)"></datepicker>
            </div>
          </div>
          <div class="col-lg-3 col-md-3">
            <div class="form-group">
              <label>End Date (Vendor)</label>
              <datepicker input-class="form-control input-sm" v-model="editWarData.vardor_ed_date" :disabled="editWarData.active === 'Y' || !xt.isEmpty(editWarData.ic_docno) && !xt.isEmpty(editWarData.ic_itemno)"></datepicker>
            </div>
          </div>
          <div class="col-lg-3 col-md-3">
            <div class="form-group">
              <label>Remark Vendor</label>
              <input type="text" class="form-control input-sm" v-model="editWarData.vendor_remark" />
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-sm btn-danger" :disabled="editWarData && editWarData.active === 'Y'" @click="delWarrantyFromModal()">
          <i class="fa fa-trash"></i> ลบ
        </button>
        <button type="button" class="btn btn-sm bg-navy" :disabled="editWarData && warrantyDisabled(editWarData)" @click="warrantyRenewalFromModal()">
          <i class="fa fa-rotate-right"></i> Warranty Renewal
        </button>
        <button type="button" class="btn btn-sm btn-default" @click="openReviseFromModal()">
          <i class="fas fa-eye"></i> View History ({{editWarData ? editWarData.revno || 0 : 0}})
        </button>
        <button type="button" class="btn btn-sm btn-primary" @click="closeEditWarModal()">
          <i class="fa fa-check"></i> ตกลง
        </button>
      </template>
    </modal-2>

  </div>
</template>
<script>
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let appForm = {};
  let itemWarPaging = {};
  let paging = {};
  let cpn = {
    data() {
      return {
        auth,
        ui: window.ui,
        xt: $xt,
        isLoading: false,
        headerData: {},
        dataList: [],
        dataAdmin: {},
        company: window.baseCompany,
        transferDate: null,
        searchData : {
          search_field : "war_code",
          search_text : ""
        },
        searchMainData: {
          search_field: "loccode",
          search_text: ""
        },
        pageNumber: 1,
        storeDataList: [],
        addItemDisplay: [],
        selectAllChecked: "N",
        selectedItems: [],
        exportUrl: '',
        exportSearch: {},
        copyDataList: [],
        btnShow: false,
        collapseState: {},
        page_modal_number: 1,
        page_number: 1,
        dataListDisplay: [],

        tmpData: [],

        reviseList: [],
        reviseDisplay: [],
        retrieveSearch: {
          all: 'N'
        },
        reviseSelect: 0,

        dateNow : new Date(),

        // ag-table related
        agTableKey: 0,
        editWarData: null,
        editWarAreaData: null,
        editWarAreaIdx: null,
        areaPageState: {},
        areaItemsPerPage: 10,
        searchByAG: {},
        importForm: {
          pre_event: 'A', loccode: 'B', war_code: 'C', itemname_other: 'E', serial_number: 'F', remark: 'G',
          startdate: 'H', enddate: 'I', vendor: 'J', vendor_start_dt: 'K', vendor_end_dt: 'L', vendor_remark: 'M',
          active_row: 'N', active: 'O'
        }
      };
    },
    methods: {
      resetData() {
        appForm.btnSave.disabled = true
        // appForm.btnExport.show = false
        appForm.btnImport.show = false

        let arr = ['pre_event', 'pre_des', 'pre_event_unit', 'pre_des_unit'];
        $linq(arr).foreach(f => this.headerData[f] = null);
        this.dataList = [];
        this.dataListDisplay = [];
        this.btnShow = false
        this.exportUrl = ''
        this.collapseState = {}
        this.page_number = 1
        paging.setCurrentPage(1);
        this.searchMainData.search_field = 'loccode'
        this.searchMainData.search_text = ''
        this.reviseList = []
        // await this.loadData();
      },
      async resetDataPhase() {
        let arr = ['pre_event_unit', 'pre_des_unit'];
        $linq(arr).foreach(f => this.headerData[f] = null);
        this.dataList = [];
        this.dataListDisplay = [];
        this.collapseState = {}
        this.page_number = 1
        this.exportUrl = `csm/master/WarrantyItemExport?pre_event=${this.headerData.pre_event}&pre_event2=${this.headerData.pre_event2}`
        paging.setCurrentPage(1);
        this.searchMainData.search_field = 'loccode'
        this.searchMainData.search_text = ''
        this.reviseList = []
        await this.loadData();
      },
      async loadData() {
        this.isLoading = true;
        //if true Use(StartWarranty_ReadList2)
        // let comp = ['GIS'].includes(this.company) ? '2' : '';

        let act = `CSM/MASTER/StartWarranty_ReadList2?pre_event2=${encodeURIComponent(this.headerData.pre_event2 || '')}&pre_event=${encodeURIComponent(this.headerData.pre_event_unit || this.headerData.pre_event)}`;
        // let act = `CSM/MASTER/StartWarranty_ReadList2?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}&pre_event2=${encodeURIComponent(this.headerData.pre_event2 || '')}&pre_event=${encodeURIComponent(this.headerData.pre_event_unit || this.headerData.pre_event)}`;
        // for (var key in this.searchMainData) {
        //   act += `&${key}=${encodeURIComponent(this.searchData[key])}`
        // }
        let rsp = await $xt.getServer(act);
        this.dataList = rsp.data.data_rows;
        this.copyDataList = []
        this.reviseList = []

        this.pageChange(this.pageNumber);
        paging.setTotalItems(rsp.data.total);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();

        this.dataList.forEach(product => {
          this.copyDataList.push({
            ...product,
            item_warranty: [...product.item_warranty]
          });
          // product.item_warranty.forEach(warranty => {
          //     if (warranty.startdate && warranty.enddate) {
          //         const difference = this.calculateDifference(warranty.startdate, warranty.enddate);
          //         warranty.tot_year = difference.years;
          //         warranty.tot_month = difference.months;
          //         warranty.tot_date = difference.days;
          //         warranty.tot_warranty = `${warranty.tot_year} ปี /${warranty.tot_month} เดือน /${warranty.tot_date} วัน`;
          //     }
          // });

          // loop default warranty To add an item that doesn't exist yet item warranty
          product.default_warranty.forEach(warranty => {
              const isDuplicate = product.item_warranty.some(existingWarranty => existingWarranty.war_code === warranty.war_code);
              if (!isDuplicate) {
                  product.item_warranty.push(warranty);
              }
          });

          // sort item_warranty by itemno
          product.item_warranty.sort((a, b) => a.itemno - b.itemno);
        });
        this.dataListDisplay = this.dataList
        this.isLoading = false;
        this.agTableKey++;
        this.$nextTick(() => { this.refreshAllAreaTables(); });
      },
      async readWarranty(pre_event) {

        let act = `CSM/MASTER/StartWarranty_Read?pre_event=${pre_event}`;
        let rsp = await $xt.getServer(act);

        $linq(this.dataList).foreach(f => {
          $linq(f.item_warranty).foreach(x => {
            let p = $linq(rsp).where(w => w.war_code == x.war_code && w.loccode == f.loccode && w.itemno == x.itemno).firstOrDefault();

            if (!$xt.isEmpty(p)) {
              x.itemname_other = p.itemname_other;
              x.startdate = p.startdate;
              x.enddate = p.enddate;
              x.serial_number = p.serial_number;
              x.remark = p.remark;
            }
          });
        });

        await this.loadTransferDate(pre_event);

      },
      async loadTransferDate(pre_event) {
        let act = `CSM/MASTER/StartWarranty_TransferDate?pre_event=${pre_event || ''}`;
        let rsp = await $xt.getServer(act);
        this.transferDate = rsp;

        if (rsp != null) {
          $linq(this.dataList).foreach(f => {
            $linq(f.item_warranty).foreach(x => {
              this.startWarranty(x);
            });
          });
        }
      },
      async saveData() {
        try {
          let formData = this.setData();
          let formDetail = this.reviseList
          let f = {
            header: formData,
            detail: formDetail
          };
          this.isLoading = true;
          
          // return
          
          const duplicates = this.checkDuplicate(formData);
          if (!this.validateActiveRows(formData)) {
            return;
          }

          if (duplicates.length > 0) {
            const issue = duplicates[0]
            $msg.alert(
              `Error`,
              `พบข้อมูลซ้ำใน รหัสพื้นที่โครงการ: ${issue.loccode}, Warranty Code: ${issue.war_code}, Serial Number: ${issue.serial_number || "มีค่าว่างเหมือนกัน"}`,
              `danger`
            );
            this.isLoading = false;
            return;
          }

          let act = `CSM/MASTER/StartWarranty_Create`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          
          $msg.alert(`Success`, `Your information has been saved successfully.` , `success`)

          this.loadData();
          this.isLoading = false;
        } catch (ex) {
          this.isLoading = false;
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          this.isLoading = false;
        }
      },
      async deleteData() {
        if (!await $msg.confirm(`คุณต้องการลบข้อมูลรายการประกันทั้งหมด ใช่หรือไม่`)) {
          return;
        }

        try {
          let f = {
            pre_event: this.headerData['pre_event'],
            pre_event2: this.headerData['pre_event2']
          };
          this.isLoading = true;
          let act = `CSM/MASTER/StartWarranty_Delete`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          $msg.alert(``, `Success`, `success`);
          this.isLoading = false;
        } catch (ex) {
          this.isLoading = false;
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          this.isLoading = false;
        }
        this.loadData();
      },
      setData() {
        let arr = [];
        $linq(this.dataList).foreach(f => {
          $linq(f.item_warranty).foreach(x => {
              arr.push({
                pre_event2: this.headerData["pre_event2"],
                pre_event: $xt.isEmpty(this.headerData["pre_event_unit"]) ? this.headerData["pre_event"] : this.headerData["pre_event_unit"],
                loccode: f.loccode,
                war_code: x.war_code,
                war_des: x.war_des,
                itemname_other: x.itemname_other,
                serial_number: x.serial_number,
                startdate: x.startdate,
                enddate: x.enddate,
                vendor: x.vendorName,
                vendor_start_dt: x.vardor_st_date,
                vendor_end_dt: x.vardor_ed_date,
                vendor_remark: x.vendor_remark,
                tot_date: x.tot_date,
                tot_month: x.tot_month,
                tot_year: x.tot_year,
                remark: x.remark,
                active: x.active,
                active_row: x.active_row,
                itemno: x.itemno,
                maincode: this.auth.maincode,
                revno: x.revno,
                lifetime: x.lifetime
              });
          });
        });
        return arr;
      },
      setWarrantyDate(x) {
        if (x.lifetime === 'Y') {
          const selectedDate = x.startdate ?? new Date(); 
          x.startdate = selectedDate;

          const transferMoment = moment(selectedDate);
          const enddate = transferMoment.year(9999).toDate(); 
          x.enddate = enddate;
        } 
        else if ((x.tot_year + x.tot_month + x.tot_date) === 0 && $xt.isEmpty(x.startdate)) {
          var todayDate = this.transferDate ?? new Date();
          todayDate = moment(todayDate).add(x.tot_year, 'years');
          todayDate = moment(todayDate).add(x.tot_month, 'months');
          todayDate = moment(todayDate).add((x.tot_date + 1), 'days');
          x.startdate = this.transferDate ?? new Date();
          x.enddate = todayDate;
        }
        else if ((x.tot_year + x.tot_month + x.tot_date) > 0 && $xt.isEmpty(x.startdate)) {
          var todayDate = this.transferDate ?? new Date();
          todayDate = moment(todayDate).add(x.tot_year, 'years');
          todayDate = moment(todayDate).add(x.tot_month, 'months');
          todayDate = moment(todayDate).add((x.tot_year + x.tot_month === 0 ? x.tot_date : x.tot_date - 1), 'days');
          x.startdate = this.transferDate ?? new Date();
          x.enddate = todayDate;
        }
        else {
          var todayDate = x.startdate;
          todayDate = moment(todayDate).add(x.tot_year, 'years');
          todayDate = moment(todayDate).add(x.tot_month, 'months');
          todayDate = moment(todayDate).add((x.tot_year + x.tot_month === 0 ? x.tot_date : x.tot_date - 1), 'days');
          x.enddate = todayDate;
        }
      },
      async startWarrantybyItem(x) {
        if (!await $msg.confirm(`คุณต้องการเริ่มต้นประกัน ${x.war_des} ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนคืนได้ เมื่อ Start แล้ว กรุณากดปุ่ม Save เพื่อบันทึกรายการ`)) {
          return;
        }
        else {
          this.startWarranty(x);
          // Refresh ag-table to update icon
          this.$nextTick(() => { this.refreshAllAreaTables(); });
        }
      },
      async startWarrantybyEnddate(x) {
        if (!await $msg.confirm(`คุณต้องการเริ่มต้นประกัน ${x.war_des} ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนคืนได้ เมื่อ Start แล้ว กรุณากดปุ่ม Save เพื่อบันทึกรายการ`)) {
          return;
        }
        else {
          var a = moment(x.enddate);
          var b = moment(x.startdate);

          var years = a.diff(b, 'year');
          b.add(years, 'years');

          var months = a.diff(b, 'months');
          b.add(months, 'months');

          var days = a.diff(b, 'days');
          x.tot_date = days;
          x.tot_month = months;
          x.tot_year = years;
          x.tot_warranty = (years + ' ปี/' + months + ' เดือน/' + days + ' วัน');

          //console.log(years + ' years ' + months + ' months ' + days + ' days');
          //console.log(x.tot_year + ' years ' + x.tot_month + ' months ' + x.tot_date + ' days');
        }
      },
      async startWarrantybyArea(item) {
        if (!await $msg.confirm(`คุณต้องการเริ่มต้นประกันทั้งหมดใน Area นี้ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนคืนได้ เมื่อ Start แล้ว กรุณากดปุ่ม Save เพื่อบันทึกรายการ`)) {
          return;
        }
        else {
          $linq(item).foreach(x => {
            this.startWarranty(x);
            x.active_row = 'Y';
          });
          this.$nextTick(() => { this.refreshAllAreaTables(); });
        }
      },
      async startWarrantyAllItem() {
        if (!await $msg.confirm(`คุณต้องการเริ่มต้นประกันทั้งหมด ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนคืนได้ เมื่อ Start แล้ว กรุณากดปุ่ม Save เพื่อบันทึกรายการ`)) {
          return;
        }
        else {
          $linq(this.dataList).foreach(f => {
            $linq(f.item_warranty).foreach(x => {
              this.startWarranty(x);
              x.active_row = 'Y';
            });
          });
          this.$nextTick(() => { this.refreshAllAreaTables(); });
        }
      },
      async startWarrantyInArea(x) {
        x.item_warranty.push({
          itemno: 1,
          war_code: x.war_code,
          war_des: x.war_des,
          loccode: x.loccode,
          locname: x.locname,
          serial_number: x.serial_number || ''
        });
      },
      async sendComponent(e, type) {
        switch (type) {
          case "project":
            appForm.btnSave.disabled = false
            // appForm.btnExport.show = true
            appForm.btnImport.show = true
            this.btnShow = true
            
            this.headerData.pre_event = e.pre_event;
            this.headerData.pre_event2 = e.pre_event2;
            this.headerData.pre_des = e.pre_des;
            
            this.exportUrl = `csm/master/WarrantyItemExport?pre_event=${e.pre_event}&pre_event2=${e.pre_event2}`
            this.dataList = [];
            this.collapseState = {};
            this.page_number = 1
            this.headerData.pre_event_unit = null;
            this.headerData.pre_des_unit = null;

            await this.loadData();
            // await this.readWarranty(e.pre_event);
            break;
          case "project_unit":
            this.headerData.pre_event_unit = e.pre_event;
            this.headerData.pre_des_unit = e.pre_des;
            this.exportUrl = `csm/master/WarrantyItemExport?pre_event=${e.pre_event}&pre_event2=${e.pre_event2}`
            await this.loadData();
            // await this.readWarranty(e.pre_event);
            break;
        }
      },
      startWarranty(x) {
        if (x.active !== 'Y') {
          x._justStarted = true;
        }
        x.active = 'Y';
        if (x.lifetime === 'Y') {
          const selectedDate = x.startdate ?? this.transferDate ?? new Date();
          x.startdate = selectedDate;

          const transferMoment = moment(selectedDate);
          const enddate = transferMoment.year(9999).toDate();
          x.enddate = enddate;
        } 
        else if ((x.tot_year + x.tot_month + x.tot_date) === 0 && $xt.isEmpty(x.startdate)) {
          var todayDate = this.transferDate ?? new Date();
          todayDate = moment(todayDate).add(x.tot_year, 'years');
          todayDate = moment(todayDate).add(x.tot_month, 'months');
          todayDate = moment(todayDate).add((x.tot_date + 1), 'days');
          x.startdate = this.transferDate ?? new Date();
          x.enddate = todayDate;
        }
        else if ((x.tot_year + x.tot_month + x.tot_date) > 0 && $xt.isEmpty(x.startdate)) {
          var todayDate = this.transferDate ?? new Date();
          todayDate = moment(todayDate).add(x.tot_year, 'years');
          todayDate = moment(todayDate).add(x.tot_month, 'months');
          todayDate = moment(todayDate).add((x.tot_year + x.tot_month === 0 ? x.tot_date : x.tot_date - 1), 'days');
          x.startdate = this.transferDate ?? new Date();
          x.enddate = todayDate;
        }
        else {
          var todayDate = x.startdate;
          todayDate = moment(todayDate).add(x.tot_year, 'years');
          todayDate = moment(todayDate).add(x.tot_month, 'months');
          todayDate = moment(todayDate).add((x.tot_year + x.tot_month === 0 ? x.tot_date : x.tot_date - 1), 'days');
          if($xt.isEmpty(x.enddate)) {
            x.enddate = todayDate;
          }
        }
      },
      async delWarranty(x) {
        if (!await $msg.confirm(`คุณต้องการลบวันเริ่มต้นประกัน ${x.war_des} ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนคืนได้ เมื่อลบแล้ว กรุณากดปุ่ม Save เพื่อบันทึกรายการ`)) {
          return;
        }
        else {
          x.startdate = null;
          x.enddate = null;
        }
      },
      async onImport(e) {
        page.loadingBox.show();
        try {
          let pre_event = this.dataListDisplay[0] ? this.dataListDisplay[0].pre_event : '';
          let pre_event2 = this.dataListDisplay[0] ? this.dataListDisplay[0].pre_event2 : '';
          let act = `CSM/Master/WarrantyItemImport2Data?pre_event=${encodeURIComponent(pre_event || '')}&pre_event2=${encodeURIComponent(pre_event2 || '')}`;
          let f = { data: this.arrImport(e) };
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw new Error(rsp.error);
          }
          $notify.success('นำเข้าข้อมูลเสร็จสิ้น');
          this.$refs.importData.closeImport();
          await this.loadData();
        } catch (ex) {
          $msg.alert("", ex.toString(), "danger");
        } finally {
          page.loadingBox.hide();
        }
      },
      arrImport(e) {
        let arr = []
        e.forEach((x) => {
          arr.push({
            pre_event: x[this.importForm.pre_event],
            loccode: x[this.importForm.loccode],
            war_code: x[this.importForm.war_code],
            itemname_other: x[this.importForm.itemname_other],
            serial_number: x[this.importForm.serial_number],
            remark: x[this.importForm.remark],
            startdate: x[this.importForm.startdate],
            enddate: x[this.importForm.enddate],
            vendor: x[this.importForm.vendor],
            vendor_start_dt: x[this.importForm.vendor_start_dt],
            vendor_end_dt: x[this.importForm.vendor_end_dt],
            vendor_remark: x[this.importForm.vendor_remark],
            active_row: x[this.importForm.active_row],
            active: x[this.importForm.active]
          })
        })
        return arr
      },
      defaultImport() {
        this.importForm = {
          pre_event: 'A', loccode: 'B', war_code: 'C', itemname_other: 'E', serial_number: 'F', remark: 'G',
          startdate: 'H', enddate: 'I', vendor: 'J', vendor_start_dt: 'K', vendor_end_dt: 'L', vendor_remark: 'M',
          active_row: 'N', active: 'O'
        }
      },
      addFile() {
        $(this.$refs.File).click();
      },
      async doUpload(f) {
        page.loadingBox.show();
        try {
          let act = `CSM/Master/WarrantyItemImport`;
          let fd = new FormData();
          fd.append('file', f);
          fd.append('pre_event', $xt.isEmpty(this.headerData["pre_event_unit"]) ? this.headerData["pre_event"] : this.headerData["pre_event_unit"]);

          let rsp = await $xt.postServerForm(act, fd);
          if (!rsp.success) {
            throw new Error(rsp.error);
          }
          else {
            $notify.success('นำเข้าข้อมูลเสร็จสิ้น');
          }
        } catch (ex) {
          $msg.alert("", ex.toString(), "danger");
        }
        finally {
          page.loadingBox.hide();
        }
        await this.loadData();
        // await this.readWarranty(this.headerData['pre_event']);
      },
      isREcustomer() {
        return this.company != 'PAL';
      },
      useVendor() {
        return !['MG', 'PANNA', 'PAL'].includes(this.company);
      },
      startDateCheckbyArea(data){
        return data.every(item => item.active === 'Y')
      },
      openAddModal(data) {
        this.selectedItems = []
        this.selectAllChecked = "N"
        this.storeDataList = data
        this.$refs.addModal.openModal()
        this.loadItemArea(this.storeDataList)
      },
      addItemWar() {
        this.$refs.addModal.closeModal();
        
        this.dataList.forEach(itemA => {
          this.selectedItems.forEach(itemB => {
            if (itemA.loccode === itemB.loccode) {
              const itemCount = Number(itemB.item) || 1;  

              for (let i = 0; i < itemCount; i++) {
                itemA.item_warranty.push({
                  maincode: this.auth.maincode,
                  pre_event: itemB.pre_event,
                  pre_event2: itemB.pre_event2,
                  itemno: '', 
                  war_code: itemB.war_code,
                  war_des: itemB.war_des,
                  tot_warranty: itemB.tot_warranty,
                  tot_year: itemB.tot_year,
                  tot_month: itemB.tot_month,
                  tot_date: itemB.tot_date,
                  lifetime: itemB.lifetime,
                  serial_number: '',
                  itemname_other: '',
                  remark: '',
                  startdate: '',
                  enddate: '',
                  vendor: '',
                  vendor_start_dt: '',
                  vendor_end_dt: '',
                  vendor_remark: '',
                  active: 'N',
                  active_row: 'N'
                });
              }
            }
          });
        });
      },
      selectAll() {
        this.selectAllChecked == "Y" ? this.selectedItems = [...this.addItemDisplay] : this.selectedItems = []
        this.addItemDisplay.forEach(x => x.checked = this.selectAllChecked == "Y" ? "Y" : "N")
      },
      selectItem(item){
        let findIndex = this.addItemDisplay.findIndex(x => x.itemno == item.itemno && x.war_code == item.war_code)
        
        this.addItemDisplay[findIndex].checked = item.checked
        this.selectedItems = this.addItemDisplay.filter(x => x.checked == "Y")
        this.selectAllChecked = this.addItemDisplay.every(x => x.checked == "Y") ? "Y" : "N"
      },
      async loadItemArea(data) {
        let act = `CSM/Master/ItemArea_ReadList?skip=${itemWarPaging.skipItems()}&take=${itemWarPaging.getItemsPerPage()}&pre_event=${data.pre_event || ''}&pre_event2=${data.pre_event2 || ''}&loccode=${data.loccode || ''}`;
        for (var key in this.searchData) {
          act += `&${key}=${encodeURIComponent(this.searchData[key])}`
        }
        let rsp = await $xt.getServer(act);
        this.addItemDisplay = rsp.data.data_rows;

        itemWarPaging.setTotalItems(rsp.data.total);
        if (!itemWarPaging.getItemsPerPage()) {
          itemWarPaging.setCurrentPage(1);
        }
        itemWarPaging.createPagesArray();
      },
      checkDuplicate(dataRows) {
        const duplicates = [];
        const seen = new Set();

        dataRows.forEach((row) => {
          const key = `${row.loccode}-${row.war_code}-${row.serial_number || ''}`;

          if (seen.has(key)) {
            duplicates.push({
              loccode: row.loccode,
              war_code: row.war_code,
              serial_number: row.serial_number || '',
            });
          } else {
            seen.add(key);
          }
        });

        return duplicates;
      },
      validateActiveRows(data) {
        for (const x of data) {
          if (x.active_row === 'Y') {
            if (x.lifetime === 'Y') {
              continue; 
            }

            // if (!x.startdate || !x.enddate) {
            if (x.active === 'N') {
              $msg.alert(
                `Error`,
                // `รหัสพื้นที่โครงการ: ${x.loccode}, Warranty Code: ${x.war_code}, Serial Number: ${x.serial_number || ""} ก่อนที่จะ active ต้องมีวันที่เริ่มและสิ้นสุดประกันก่อน`,
                `รหัสพื้นที่โครงการ: ${x.loccode}, Warranty Code: ${x.war_code}, Serial Number: ${x.serial_number || ""} ก่อนที่จะ active จำเป็นต้องกดเริ่มประกันก่อน`,
                `danger`
              );
              return false;
            }
          }
        }
        return true;
      },
      async doSearch(){
        itemWarPaging.setCurrentPage(1);
        await this.loadItemArea(this.storeDataList)
      },
      async mainSearch(field, text){
        paging.setCurrentPage(1)
        await this.loadData()
        if ($xt.isEmpty(text)) {
          this.dataListDisplay = this.dataList
          await this.loadData()
        } else if (field === 'loccode') {
          const result = this.dataListDisplay.filter(item =>
            item.loccode.toLowerCase().includes(text.toLowerCase())
          );
          this.dataList = result
          let t = $linq(result).count();
          paging.setTotalItems(t);
          this.pageChange(this.page_number)
        } else if (field === 'loccname') {
          const result = this.dataListDisplay.filter(item =>
            item.locname.toLowerCase().includes(text.toLowerCase())
          );
          this.dataList = result
          let t = $linq(result).count();
          paging.setTotalItems(t);
          this.pageChange(this.page_number)
        } else if (field === 'war_code') {
          const result = this.dataListDisplay.map(item => {
            const filteredWarranty = item.item_warranty.filter(warranty =>
              warranty.war_code.toLowerCase().includes(text.toLowerCase())
            );
            return {
              ...item,
              item_warranty: filteredWarranty
            };
          }).filter(item => item.item_warranty.length > 0);
          this.dataList = result
          let t = $linq(result).count();
          paging.setTotalItems(t);
          this.pageChange(this.page_number)
        }  else if (field === 'war_des') {
          const result = this.dataListDisplay.map(item => {
            const filteredWarranty = item.item_warranty.filter(warranty =>
              warranty.war_des && warranty.war_des.toLowerCase().includes(text.toLowerCase())
            );
            return {
              ...item,
              item_warranty: filteredWarranty
            };
          }).filter(item => item.item_warranty.length > 0);
          this.dataList = result
          let t = $linq(result).count();
          paging.setTotalItems(t);
          this.pageChange(this.page_number)
        }
      },
      async pageModalChange(pn) {
        this.page_modal_number = pn
        itemWarPaging.setCurrentPage(pn)
        await this.loadItemArea(this.storeDataList)
      },
      async pageChange(pn) {
        // this.page_number = pn
        // paging.setCurrentPage(pn)
        // await this.loadData()

        pn = pn || 1;
        this.page_number = pn;
        paging.setCurrentPage(pn);
        this.dataListDisplay = $linq(this.dataList).skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray();
        paging.createPagesArray();
        this.collapseState = {};
        this.agTableKey++;
      },
      openImportModal() {
        this.$refs.importData.openImport();
      },
      exportValidate() { 
        const hasItemWarranty = this.copyDataList.some(product => product.item_warranty && product.item_warranty.length > 0);
        
        if (hasItemWarranty) {
          appForm.btnExportClick()
        } else {
          $msg.alert('Warning', `Please save the data before exporting.`, 'warning')
        }
    },
    toggleCollapse(idx) {
      this.collapseState[idx] = !this.collapseState[idx];
      if (this.collapseState[idx]) {
        this.$nextTick(() => {
          this.initAreaTable(idx);
          // Trigger resize so ag-table recalculates height
          setTimeout(() => { $(window).trigger('resize'); }, 100);
        });
      }
    },
    initAreaTable(idx) {
      let agr = this.$refs['agrArea' + idx];
      if (Array.isArray(agr)) agr = agr[0];
      if (!agr) return;

      let areaPaging = this.$refs['areaPaging' + idx];
      if (Array.isArray(areaPaging)) areaPaging = areaPaging[0];

      let self = this;
      let x = this.dataListDisplay[idx];
      if (!x) return;

      // Filter by searchByAG
      let filteredWarranty = x.item_warranty;
      if (this.searchByAG[idx]) {
        let term = this.searchByAG[idx].toLowerCase();
        filteredWarranty = x.item_warranty.filter(w => 
          (w.war_code && w.war_code.toLowerCase().includes(term)) ||
          (w.war_des && w.war_des.toLowerCase().includes(term)) ||
          (w.itemname_other && w.itemname_other.toLowerCase().includes(term)) ||
          (w.serial_number && w.serial_number.toLowerCase().includes(term))
        );
      }

      // Setup area pagination
      if (areaPaging) {
        let currentPage = (this.areaPageState[idx] || 1);
        areaPaging.setItemsPerPage(this.areaItemsPerPage);
        areaPaging.setTotalItems(filteredWarranty.length);
        areaPaging.setCurrentPage(currentPage);
        areaPaging.createPagesArray();
      }

      // Get paginated data
      let currentPage = this.areaPageState[idx] || 1;
      let skip = (currentPage - 1) * this.areaItemsPerPage;
      let displayWarranty = filteredWarranty.slice(skip, skip + this.areaItemsPerPage);
      let startIdx = skip; // offset for data-row to map back to filteredWarranty

      let fields = [
        ["_no", "No.", "text", { width: 80,  pinned: 'left', align: "center", cellRenderer: (p) => { return (startIdx + p.rowIndex + 1) + '.'; } }],
        ["war_code", "Warranty Code", "text", { width: 200,  pinned: 'left', align: "left", cellStyle: { "font-weight": "bold" } }],
        ["war_des", "Warranty Name", "text", { width: 250,  pinned: 'left', align: "left" }],
      ];

      if (this.isREcustomer()) {
        fields.push(["itemname_other", "Model Name", "text", { width: 220, align: "left", cellRenderer: (p) => {
          let val = p.value || '';
          let disabled = p.data.active === 'Y' ? 'disabled' : '';
          return `<input type="text" class="form-control input-sm ag-input-cell" data-field="itemname_other" data-row="${p.rowIndex}" value="${val}" ${disabled} style="width:200px;height:28px;font-size:12px;" />`;
        }}]);
      }

      fields.push(["_duration", "Warranty Duration", "text", { width: 180, align: "center", cellRenderer: (p) => {
        let d = p.data;
        return d.lifetime == 'Y' ? 'ประกันตลอดอายุการใช้งาน' : (d.tot_warranty || '');
      }}]);

      if (this.isREcustomer()) {
        fields.push(["serial_number", "Serial Number", "text", { width: 220, align: "left", cellRenderer: (p) => {
          let val = p.value || '';
          let disabled = p.data.active === 'Y' ? 'disabled' : '';
          return `<input type="text" class="form-control input-sm ag-input-cell" data-field="serial_number" data-row="${p.rowIndex}" value="${val}" ${disabled} style="width:200px;height:28px;font-size:12px;" />`;
        }}]);
      }

      fields.push(["remark", "Remark", "text", { width: 250, align: "left", cellRenderer: (p) => {
        let val = p.value || '';
        return `<input type="text" class="form-control input-sm ag-input-cell" data-field="remark" data-row="${p.rowIndex}" value="${val}" style="width:240px;height:28px;font-size:12px;" />`;
      }}]);

      fields.push(["startdate", "Start Date (Customer)", "text", { width: 200, align: "center", cellStyle: { "background-color": "#fdabab" }, cellRenderer: (p) => {
        let val = p.data.startdate ? moment(p.data.startdate).format('YYYY-MM-DD') : '';
        let disabled = p.data.active === 'Y' ? 'disabled' : '';
        return `<input type="date" class="form-control input-sm ag-date-cell" data-field="startdate" data-row="${p.rowIndex}" value="${val}" ${disabled} style="width:200px;height:28px;font-size:12px;text-align:center;" />`;
      }}]);

      fields.push(["enddate", "End Date (Customer)", "text", { width: 200, align: "center", cellStyle: { "background-color": "#fdabab" }, cellRenderer: (p) => {
        let val = p.data.enddate ? moment(p.data.enddate).format('YYYY-MM-DD') : '';
        return `<input type="date" class="form-control input-sm" data-field="enddate" data-row="${p.rowIndex}" value="${val}" disabled style="width:200px;height:28px;font-size:12px;text-align:center;" />`;
      }}]);

      fields.push(["_start", "Start", "text", { width: 100, align: "center", cellRenderer: (p) => {
        let d = p.data;
        let isSavedActive = d.active === 'Y' && !d._justStarted;
        let cls = isSavedActive ? 'disabled-icon' : '';
        let icon = d.active === 'Y' ? 'fas fa-pause' : 'ion ion-play';
        return `<a href="#" class="ag-btn-start ${cls}" data-row="${p.rowIndex}"><i class="${icon}"></i></a>`;
      }}]);

      fields.push(["active_row", "Active", "text", { width: 100, align: "center", cellRenderer: (p) => {
        let checked = p.value === 'Y' ? 'checked' : '';
        return `<input class="form-check-input ag-chk-active" type="checkbox" data-row="${p.rowIndex}" ${checked} style="margin:0;" />`;
      }}]);

      fields.push(["_del", "Delete", "text", { width:100, align: "center", cellRenderer: (p) => {
        let cls = p.data.active === 'Y' ? 'disabled-icon' : 'text-danger';
        return `<a href="#" class="ag-btn-del ${cls}" data-row="${p.rowIndex}"><i class="fa fa-trash"></i></a>`;
      }}]);

      fields.push(["vendorName", "Vendor Name", "text", { width: 220, align: "left", cellRenderer: (p) => {
        let val = p.value || '';
        let disabled = (!$xt.isEmpty(p.data.ic_docno) && !$xt.isEmpty(p.data.ic_itemno)) ? 'disabled' : '';
        return `<input type="text" class="form-control input-sm ag-input-cell" data-field="vendorName" data-row="${p.rowIndex}" value="${val}" ${disabled} style="width:200px;height:28px;font-size:12px;" />`;
      }}]);

      fields.push(["vardor_st_date", "Start Date (Vendor)", "text", { width: 180, align: "center", cellRenderer: (p) => {
        let val = p.data.vardor_st_date ? moment(p.data.vardor_st_date).format('YYYY-MM-DD') : '';
        let disabled = (p.data.active === 'Y' || (!$xt.isEmpty(p.data.ic_docno) && !$xt.isEmpty(p.data.ic_itemno))) ? 'disabled' : '';
        return `<input type="date" class="form-control input-sm ag-date-cell" data-field="vardor_st_date" data-row="${p.rowIndex}" value="${val}" ${disabled} style="width:180px;height:28px;font-size:12px;text-align:center;" />`;
      }}]);

      fields.push(["vardor_ed_date", "End Date (Vendor)", "text", { width: 180, align: "center", cellRenderer: (p) => {
        let val = p.data.vardor_ed_date ? moment(p.data.vardor_ed_date).format('YYYY-MM-DD') : '';
        let disabled = (p.data.active === 'Y' || (!$xt.isEmpty(p.data.ic_docno) && !$xt.isEmpty(p.data.ic_itemno))) ? 'disabled' : '';
        return `<input type="date" class="form-control input-sm ag-date-cell" data-field="vardor_ed_date" data-row="${p.rowIndex}" value="${val}" ${disabled} style="width:180px;height:28px;font-size:12px;text-align:center;" />`;
      }}]);

      fields.push(["vendor_remark", "Remark Vendor", "text", { width: 250, align: "left", cellRenderer: (p) => {
        let val = p.value || '';
        return `<input type="text" class="form-control input-sm ag-input-cell" data-field="vendor_remark" data-row="${p.rowIndex}" value="${val}" style="width:240px;height:28px;font-size:12px;" />`;
      }}]);

      fields.push(["_renewal", "Renewal", "text", { width: 120, align: "center", cellRenderer: (p) => {
        return `<a href="#" class="ag-btn-renewal" data-row="${p.rowIndex}" style="color:#333;"><i class="fa fa-rotate-right"></i></a>`;
      }}]);

      fields.push(["revno", "History", "text", { width: 100, align: "center", cellRenderer: (p) => {
        let val = p.value || 0;
        return `<button class="text-black btn btn-sm ag-btn-history" data-row="${p.rowIndex}">${val}</button>`;
      }}]);

      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);
      agr.setDisplay(displayWarranty || []);

      // Event delegation for inputs and actions
      this.$nextTick(() => {
        let el = agr.$el;
        // Remove old listeners
        $(el).off('input', '.ag-input-cell');
        $(el).off('change', '.ag-date-cell');
        $(el).off('change', '.ag-chk-active');
        $(el).off('click', '.ag-btn-start');
        $(el).off('click', '.ag-btn-del');
        $(el).off('click', '.ag-btn-renewal');
        $(el).off('click', '.ag-btn-history');

        // Text input change
        $(el).on('input', '.ag-input-cell', function() {
          let row = startIdx + parseInt($(this).data('row'));
          let field = $(this).data('field');
          if (filteredWarranty[row]) {
            self.filteredWarranty[row][field] = $(this).val();
          }
        });

        // Date input change (type="date" returns YYYY-MM-DD)
        $(el).on('change', '.ag-date-cell', function() {
          let row = startIdx + parseInt($(this).data('row'));
          let field = $(this).data('field');
          let val = $(this).val();
          if (filteredWarranty[row]) {
            if (val) {
              let parsed = moment(val, 'YYYY-MM-DD');
              if (parsed.isValid()) {
                self.filteredWarranty[row][field] = parsed.toDate();
                if (field === 'startdate') {
                  self.setWarrantyDate(filteredWarranty[row]);
                  self.refreshAreaTable(idx);
                }
              }
            } else {
              self.filteredWarranty[row][field] = null;
            }
          }
        });

        // Checkbox active_row
        $(el).on('change', '.ag-chk-active', function() {
          let row = startIdx + parseInt($(this).data('row'));
          if (filteredWarranty[row]) {
            self.filteredWarranty[row].active_row = $(this).is(':checked') ? 'Y' : 'N';
          }
        });

        // Start button (toggle: play → start warranty, pause → undo start only if not yet saved)
        $(el).on('click', '.ag-btn-start', function(e) {
          e.preventDefault();
          let row = startIdx + parseInt($(this).data('row'));
          if (filteredWarranty[row]) {
            let item = filteredWarranty[row];
            if (item.active === 'Y' && item._justStarted) {
              // Undo start (กลับเป็นยังไม่ start เพราะยังไม่ได้ save)
              item.active = 'N';
              item._justStarted = false;
              item.startdate = null;
              item.enddate = null;
              self.refreshAreaTable(idx);
            } else if (item.active !== 'Y') {
              self.startWarrantybyItem(item);
            }
          }
        });

        // Delete button
        $(el).on('click', '.ag-btn-del', function(e) {
          e.preventDefault();
          let row = startIdx + parseInt($(this).data('row'));
          if (filteredWarranty[row] && filteredWarranty[row].active !== 'Y') {
            self.delWarranty(filteredWarranty[row]);
          }
        });

        // Renewal button
        $(el).on('click', '.ag-btn-renewal', function(e) {
          e.preventDefault();
          let row = startIdx + parseInt($(this).data('row'));
          if (filteredWarranty[row]) {
            self.warrantyRenewal(x, idx, filteredWarranty[row]);
            self.$nextTick(() => { self.initAreaTable(idx); });
          }
        });

        // History button
        $(el).on('click', '.ag-btn-history', function(e) {
          e.preventDefault();
          let row = startIdx + parseInt($(this).data('row'));
          if (filteredWarranty[row]) {
            let originalIdx = x.item_warranty.indexOf(filteredWarranty[row]);
            self.reviseModal(x, originalIdx >= 0 ? originalIdx : row);
          }
        });
      });
    },
    refreshAreaTable(idx) {
      let agr = this.$refs['agrArea' + idx];
      if (Array.isArray(agr)) agr = agr[0];
      if (!agr) return;
      let x = this.dataListDisplay[idx];
      if (!x) return;
      let currentPage = this.areaPageState[idx] || 1;
      let skip = (currentPage - 1) * this.areaItemsPerPage;
      let displayWarranty = x.item_warranty.slice(skip, skip + this.areaItemsPerPage);
      agr.setDisplay(displayWarranty || []);
    },
    refreshAllAreaTables() {
      this.dataListDisplay.forEach((x, idx) => {
        if (this.collapseState[idx]) {
          this.$nextTick(() => { this.initAreaTable(idx); });
        }
      });
    },
    areaPageChange(idx, pn) {
      pn = pn || 1;
      this.areaPageState[idx] = pn;
      this.initAreaTable(idx);
    },
    searchByAGFilter(idx) {
      // Reset page to 1 and refresh only the specific area
      this.areaPageState[idx] = 1;
      if (this.collapseState[idx]) {
        this.initAreaTable(idx);
      }
    },
    openEditWarModal(areaData, areaIdx, warIdx) {
      this.editWarData = areaData.item_warranty[warIdx];
      this.editWarAreaData = areaData;
      this.editWarAreaIdx = areaIdx;
      this.$refs.editWarModal.openModal();
    },
    closeEditWarModal() {
      this.$refs.editWarModal.closeModal();
      if (this.editWarAreaIdx !== null) {
        this.refreshAreaTable(this.editWarAreaIdx);
      }
    },
    delWarrantyFromModal() {
      if (this.editWarData) {
        this.delWarranty(this.editWarData);
        this.refreshAreaTable(this.editWarAreaIdx);
      }
    },
    warrantyRenewalFromModal() {
      if (this.editWarData && this.editWarAreaData) {
        this.warrantyRenewal(this.editWarAreaData, this.editWarAreaIdx, this.editWarData);
        this.refreshAreaTable(this.editWarAreaIdx);
      }
    },
    openReviseFromModal() {
      if (this.editWarData && this.editWarAreaData) {
        let warIdx = this.editWarAreaData.item_warranty.indexOf(this.editWarData);
        this.reviseModal(this.editWarAreaData, warIdx);
      }
    },
    warrantyRenewal(dataX, index, dataZ) {
      try {
        if(dataZ.startdate != null && dataZ.enddate != null && dataZ.active === 'Y') {
          const revno_count = (dataZ.revno || 0) + 1
          const datenow = new Date()
          const enddate = new Date(dataZ.enddate)

          const oldStartDate = moment(dataZ.startdate).format('YYYY-MM-DD')
          const oldEndDate = moment(dataZ.enddate).format('YYYY-MM-DD')
  
          const timeDifference = enddate - datenow
          const daysRemaining = timeDifference / (1000 * 3600 * 24)
          
          if(daysRemaining <= 0) {
            const startDate = new Date(enddate);
            startDate.setDate(startDate.getDate() + dataZ.tot_date); // เพิ่มวัน
            startDate.setMonth(startDate.getMonth() + dataZ.tot_month); // เพิ่มเดือน
            startDate.setFullYear(startDate.getFullYear() + dataZ.tot_year); // เพิ่มปี

            dataZ.startdate = enddate;
            dataZ.enddate = startDate;
            dataZ.revno = revno_count;

            // this.SetRevise(dwno, coltype, data, temp, colnm, coltext)
            
            this.SetRevise(2, 'D', dataZ, oldStartDate, 'startdate', 'Start Date (Customer)', dataX)
            this.SetRevise(2, 'D', dataZ, oldEndDate, 'enddate', 'End Date (Customer)', dataX)
            
          }
        }
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } 
    },
    SetRevise(dwno, coltype, data, temp, colnm, coltext, data2) {
      
      //dwno : 1 = header,2 = detail
      //coltype : S = string, M = number, D = date
      //data : ข้อมูลปัจจุบัน
      //temp : ข้อมูลเก่า
      //rowno : header ให้เซ็ต 1, detail ให้เซ็ตตาม row
      let value_old = null
      let value_new = null
      let rowno = null   
      
      value_old = temp
      rowno = data.itemno
      if (colnm === 'startdate') {
        value_new = data.startdate
      } else {
        value_new = data.enddate
      }
        this.reviseList.push({
          maincode : auth.maincode,
          module: 'CSM',
          window_c: 'V_CSM_MAS_008',
          docno: `${data2.loccode}${data.war_code}${data.serial_number}`,
          revno: data.revno,
          doctype: 'CSM',
          rowno: rowno,
          coltext: coltext,
          colnm: colnm,
          coltype: coltype,
          value_old: coltype == 'D' ? (!$xt.isEmpty(value_old) ? moment(value_old).format('DD/MM/YYYY') : null) : value_old,
          value_new: coltype == 'D' ? (!$xt.isEmpty(value_new) ? moment(value_new).format('DD/MM/YYYY') : null) : value_new,
          dwno: dwno,
          add_dt : moment().format('YYYY-MM-DD HH:mm:ss'),
          adduser: this.auth.userid,
          edit_dt : data.revno > 1 ? moment().format('YYYY-MM-DD HH:mm:ss') : null,
          edituser: data.revno > 1 ? this.auth.userid : null,
        })
    },
    warrantyDisabled(data) {
      const tot_duration = (data.tot_date || 0) + (data.tot_month || 0) + (data.tot_year || 0)
      
      if (!data.enddate || !data.startdate || data.active !== 'Y' || tot_duration === 0 ) {
        return true;
      }
      
      const currentDate = new Date();
      const expiryDate = new Date(data.enddate);
      const startDateValue = new Date(data.startdate)
      
      if (isNaN(expiryDate)) {
        return true
      }
      
      return currentDate < startDateValue || (expiryDate - currentDate) / (1000 * 3600 * 24) > 0;
    },
    reviseModal(data, index) {
      // this.tmpData = data
      this.tmpData.war_code = data.item_warranty[index].war_code
      this.tmpData.serial_number = data.item_warranty[index].serial_number
      this.tmpData.loccode = data.loccode
      this.tmpData.locname = data.locname
      
      this.retrieveSearch.all = 'N'
      this.retrieveSearch.text = data.item_warranty[index].revno
      
      
      this.reviseSearch()
      this.$refs.revModal.openModal()
    },
    async loadRevise(data) {
      let act = `CSM/Master/ReadRevise?module=CSM&docno=${data.loccode}${data.war_code}${data.serial_number}&revno=${this.reviseSelect}`;
        for (var key in this.retrieveSearch) {
          act += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`
        }
        let rsp = await $xt.getServer(act);
        this.reviseDisplay = rsp.data.data_rows;
        this.$nextTick(() => { this.initReviseTable(); });
    },
    initReviseTable() {
      let agr = this.$refs.agrRevise;
      if (!agr) return;

      let fields = [
        ["revno", "Revise No.", "text", { width: 100, align: "center", cellStyle: { "font-weight": "bold" } }],
        ["coltext", "Table", "text", { width: 180, align: "left" }],
        ["value_old", "Old", "text", { width: 180, align: "left" }],
        ["value_new", "New", "text", { width: 180, align: "left" }],
        ["_editby", "Edit By", "text", { width: 150, align: "left", cellRenderer: (p) => {
          return p.data.edituser || p.data.adduser || '';
        }}],
        ["_editdate", "Edit Date", "text", { width: 150, align: "center", cellRenderer: (p) => {
          let dt = p.data.edit_dt || p.data.add_dt;
          return dt ? moment(dt).format('DD/MM/YYYY') : '';
        }}],
      ];

      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);
      agr.setDisplay(this.reviseDisplay || []);
    },
    reviseSearch() {
      this.reviseSelect = this.retrieveSearch.text || 0
      
      // this.pageNumber = 1
      this.loadRevise(this.tmpData)
    },
    isNumber(evt) {
      evt = (evt) ? evt : window.event
      var charCode = (evt.which) ? evt.which : evt.keyCode
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46 && charCode !== 45) {
        evt.preventDefault()
      } else {
        return true
      }
    },
    copyWarrantyDate(data) {
      if (data.item_warranty[0].startdate != null) {
        //loop หา startdate ของทุกตัวใน item warranty ที่เป็นค่าว่าง
        data.item_warranty.forEach(item => {
          if (item.startdate == null && item.active !== 'Y') {
            item.startdate = data.item_warranty[0].startdate;
            //ทำการคำนวณ enddate ใหม่ ตาม Warranty Duration
            var todayDate = item.startdate;
            todayDate = moment(todayDate).add(item.tot_year, 'years');
            todayDate = moment(todayDate).add(item.tot_month, 'months');
            todayDate = moment(todayDate).add((item.tot_year + item.tot_month === 0 ? item.tot_date : item.tot_date - 1), 'days');
            item.enddate = todayDate;
          }
        });
      }
      
    }

    },
    computed: {
      activeCheck() {
        return Object.values(this.dataList).every(items =>
          (items.item_warranty).every(item => item.active ==='Y')
        )
      }
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = `Master : เริ่มต้นรายการประกัน`;
      document.title = page.pageTitle;

      itemWarPaging = this.$refs.itemWarPaging;
      itemWarPaging.setCurrentPage(1);
      itemWarPaging.setItemsPerPage(500);

      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(50);

      appForm = this.$refs.appForm
      appForm.btnDelete.show = false
      appForm.btnSave.show = true
      appForm.btnSave.disabled = true
      appForm.btnNew.show = true
      appForm.btnExport.show = false
      appForm.btnImport.show = false
      appForm.btnImport_center.show = false
      appForm.btnImport.click = this.openImportModal
      appForm.btnNew.click = this.resetData
      appForm.btnSave.click = this.saveData

      this.$nextTick(() => {
        $(this.$refs.File).on('click', (e) => {
          e.target.value = null;
        });
        $(this.$refs.File).on('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            this.doUpload(e.target.files[0]);
          }
        });
      });

    }
  };

  export default cpn;
</script>

<style scoped>
.filter-section {
  align-items: flex-end;
}
.filter-section .form-group {
  margin-bottom: 8px;
}
.filter-section label {
  font-size: 12px;
  margin-bottom: 3px;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mb-5 {
  margin-bottom: 5px !important;
}

/* Scrollable area */
.scrollable-area {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  overflow-x: hidden;
}

/* Area header */
.area-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.15s;
}
.area-header-row:hover {
  background-color: #f0f4f8;
}
.area-header-left {
  flex: 1;
}
.area-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}
.area-header-right {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.badge-count {
  display: inline-block;
  background: #e8f0fe;
  color: #315fbd;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  margin-left: 8px;
}
.area-ag-table-wrap {
  padding: 0 4px 8px 4px;
  min-height: 100px;
  overflow: hidden;
  position: relative;
  clear: both;
}
.area-search-row {
  padding: 4px 0 6px 0;
}
.area-ag-table-wrap /deep/ .content-body {
  height: 300px !important;
  max-height: 300px !important;
  overflow: auto !important;
}
.area-ag-table-wrap /deep/ .ag-flex {
  height: 100% !important;
}
.area-ag-table-wrap /deep/ .ag-theme-alpine {
  height: 100% !important;
}
.area-ag-table-wrap /deep/ .ag-body-viewport {
  overflow-y: auto !important;
}

.disabled-icon{
  pointer-events: none;
  color: gray; 
  cursor: not-allowed;
}

.icon-transition {
  transition: transform 0.3s ease; 
}
.rotated {
  transform: rotate(90deg); 
}

.table-wrapper {
  overflow-x: hidden;
}

.table-wrapper .table-responsive {
  overflow-x: auto;
}

input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
/* firefox */
input[type=number] {
    appearance: textfield;
    -moz-appearance: textfield;
}

</style>
