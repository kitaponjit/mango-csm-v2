<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <app-form-2 ref="appForm"
          exportName=""
          exportSelect="B"
          exportUrl="csm/master/WarrantyItemExport_Master"
        >
          <template slot="extraBtn">
            <button class="btn btn-sm bg-navy" v-if="maincomp.iccost == '3'" @click="openModalRefIC"><i class="fas fa-file"></i>Reference IC</button>
            <button class="btn btn-sm bg-olive text-white" @click="openImportAllModal()"><i class="fas fa-cloud-upload-alt"></i>Import All Warranty (Excel)</button>
          </template>
          <template slot="form-detail">
            <div class="box box-widget">
              <div class="box-body">
                <div class="row d-flex">
                  <div class="col-md-2">
                    <div class="form-group">
                      <label v-text="ui.search_by || 'Search By'"></label>
                      <select class="form-control input-sm" v-model="search.field">
                        <option value="war_code">Warranty Code</option>
                        <option value="war_des">Warranty Name</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-group">
                      <label v-text="ui.search || 'Search'"></label>
                      <div class="input-group">
                        <input type="text" class="form-control input-sm" v-model="search.text" @keyup.enter="doSearch('main')" />
                        <span class="input-group-btn"><button class="btn btn-sm bg-navy"@click.prevent="doSearch('main')"><i class="fas fa-search"></i></button></span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="form-group">
                      <label>&nbsp;</label>
                      <div class="form-check form-switch form-check-custom form-check-solid form-check-sm me-5">
                        <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="search.active" @change="doSearch('main')" />
                        <label class="form-check-label">Active</label>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 col-md-offset-4 align-content-end margin-b-8">
                    <span class="pull-right">(จำนวนข้อมูลทั้งหมด {{ datalist.length || 0 }} รายการ)</span>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-12">
                    <ag-table ref="agr"
                      :footer="false"
                      :sorting="true"
                      @cell-clicked="onCellClicked"
                      @ready="initTable()"
                      :saveColumns="'Y'"
                      :doctype="'MSCSM'"
                      :page_name="'v_csm_mas_002'"
                    ></ag-table>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12">
                    <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"/>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </app-form-2>
      </template>
    </re-page>
    <modal-2 ref="modal">
      <template slot="header">
        <h4><i class="fa fa-edit margin-r-5"></i>{{ !editMode ? 'เพิ่มรายการประกัน' : 'แก้ไขรายการประกัน' }}</h4>
      </template>
      <template slot="body">
        <div class="wm-container">
          <!-- Section 1: ข้อมูลหลัก -->
          <div class="wm-section">
            <div class="wm-section__title">
              <span><i class="fas fa-info-circle margin-r-5"></i>ข้อมูลหลัก</span>
              <button type="button" class="wm-pill-btn" :class="{ 'wm-pill-btn--active': formData['active'] === 'Y', 'wm-pill-btn--inactive': formData['active'] !== 'Y' }" @click="formData['active'] = formData['active'] === 'Y' ? 'N' : 'Y'">
                <i :class="formData['active'] === 'Y' ? 'fas fa-check-circle' : 'fas fa-ban'"></i>
                <span>{{ formData['active'] === 'Y' ? 'ACTIVE' : 'INACTIVE' }}</span>
              </button>
            </div>
            <div class="wm-grid wm-grid--2col">
              <div class="wm-field">
                <label class="wm-label wm-label--required">Warranty Code</label>
                <input type="text" class="wm-input" :class="{ 'wm-input--disabled': editMode }" maxlength="15" v-model="formData['war_code']" :readonly="editMode" placeholder="รหัสประกัน" />
                <span class="wm-hint">{{ xt.textLength(formData.war_code, 15) }}</span>
              </div>
              <div class="wm-field">
                <label class="wm-label wm-label--required">Warranty Name</label>
                <input type="text" class="wm-input" maxlength="150" v-model="formData['war_des']" placeholder="ชื่อรายการประกัน" />
                <span class="wm-hint">{{ xt.textLength(formData.war_des, 150) }}</span>
              </div>
            </div>
          </div>

          <!-- Section 2: ระยะเวลาประกัน -->
          <div class="wm-section">
            <div class="wm-section__title">
              <span><i class="fas fa-clock margin-r-5"></i>ระยะเวลาประกัน</span>
              <button type="button" class="wm-pill-btn" :class="{ 'wm-pill-btn--lifetime': formData['lifetime'] === 'Y', 'wm-pill-btn--no-lifetime': formData['lifetime'] !== 'Y' }" @click="formData['lifetime'] = formData['lifetime'] === 'Y' ? 'N' : 'Y'; setLifeTime()">
                <i :class="formData['lifetime'] === 'Y' ? 'fas fa-infinity' : 'fas fa-hourglass-half'"></i>
                <span>{{ formData['lifetime'] === 'Y' ? 'LIFETIME' : 'กำหนดเวลา' }}</span>
              </button>
            </div>
            <div class="wm-grid" style="grid-template-columns: 1fr 1fr 1fr;">
              <div class="wm-field">
                <label class="wm-label">Days</label>
                <number class="wm-input wm-input--number" decimals="0" v-model.number="formData['tot_date']" :readonly="formData['lifetime'] == 'Y'" v-on:change="testday()"></number>
              </div>
              <div class="wm-field">
                <label class="wm-label">Month</label>
                <number class="wm-input wm-input--number" decimals="0" v-model.number="formData['tot_month']" :readonly="formData['lifetime'] == 'Y'"></number>
              </div>
              <div class="wm-field">
                <label class="wm-label">Year</label>
                <number class="wm-input wm-input--number" decimals="0" v-model.number="formData['tot_year']" :readonly="formData['lifetime'] == 'Y'"></number>
              </div>
            </div>
            <div class="wm-callout" v-if="formData.lifetime == 'Y'">
              <i class="fas fa-exclamation-triangle margin-r-5"></i>
              <span>Lifetime = ประกันตลอดอายุการใช้งาน (ไม่ต้องกำหนด Days / Month / Year)</span>
            </div>
          </div>

          <!-- Section 3: Work Type & Material -->
          <div class="wm-section">
            <div class="wm-section__title"><i class="fas fa-cogs margin-r-5"></i>Work Type & Material</div>
            <div class="wm-grid wm-grid--2col">
              <div class="wm-field">
                <label class="wm-label">Work Type</label>
                <div class="wm-input-group">
                  <input type="text" class="wm-input" style="max-width:120px;" v-model="formData['type_code']" readonly placeholder="Code" />
                  <input type="text" class="wm-input" v-model="formData['type_name']" readonly placeholder="Name" />
                  <button class="wm-btn-icon" @click="$refs.ct_worktype.openModal()"><i class="fa fa-search"></i></button>
                  <button class="wm-btn-icon wm-btn-icon--danger" @click="clearData(formData, ['type_code', 'type_name'])"><i class="fa fa-times"></i></button>
                </div>
              </div>
              <div class="wm-field">
                <label class="wm-label">Material Code</label>
                <div class="wm-input-group">
                  <input type="text" class="wm-input" style="max-width:120px;" v-model="formData.itemcode" readonly placeholder="Code" />
                  <input type="text" class="wm-input" :value="formData.itemname" readonly placeholder="Name" />
                  <button class="wm-btn-icon" @click="$refs.ct_itemcode.openModal()"><i class="fa fa-search"></i></button>
                  <button class="wm-btn-icon wm-btn-icon--danger" @click="clearData(formData, ['itemcode', 'itemname'])"><i class="fa fa-times"></i></button>
                </div>
              </div>
            </div>
            <!-- Serial No -->
            <div v-if="!xt.isEmpty(formData.ic_docno)" style="margin-top: 10px;">
              <span class="wm-pill-btn wm-pill-btn--serial" :class="{ 'wm-pill-btn--serial-on': formData['serial_ty'] === 'Y' }">
                <i :class="formData['serial_ty'] === 'Y' ? 'fas fa-barcode' : 'fas fa-minus-circle'"></i>
                <span>{{ formData['serial_ty'] === 'Y' ? 'SERIAL NO.' : 'NO SERIAL' }}</span>
              </span>
            </div>
          </div>

          <!-- Section 4: IC Reference (conditional) -->
          <div class="wm-section" v-if="!xt.isEmpty(formData.ic_docno)">
            <div class="wm-section__title"><i class="fas fa-file-invoice margin-r-5"></i>IC Reference</div>
            <div class="wm-grid" style="grid-template-columns: 2fr 1fr 1fr;">
              <div class="wm-field">
                <label class="wm-label">Vendor</label>
                <input type="text" class="wm-input" :value="formData.vendor" readonly />
              </div>
              <div class="wm-field">
                <label class="wm-label">Start Date</label>
                <input type="text" class="wm-input" :value="$date(formData.war_date_start)" readonly />
              </div>
              <div class="wm-field">
                <label class="wm-label">End Date</label>
                <input type="text" class="wm-input" :value="$date(formData.war_date_end)" readonly />
              </div>
            </div>
            <div class="wm-grid wm-grid--2col">
              <div class="wm-field">
                <label class="wm-label">IC Doc No.</label>
                <input type="text" class="wm-input" :value="formData.ic_docno" readonly />
              </div>
              <div class="wm-field">
                <label class="wm-label">IC Item No.</label>
                <input type="text" class="wm-input" :value="formData.ic_itemno" readonly />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template slot="footer">
        <div class="wm-footer">
          <button class="wm-btn-save" @click.prevent="save()"><i class="fa fa-save"></i> บันทึกข้อมูล</button>
        </div>
      </template>
    </modal-2>

    <modal-2 ref="refICModal">
      <template #header>
        <h4><i class="fas fa-file margin-r-5"></i>Reference IC — เลือกรายการอ้างอิงจากใบรับสินค้า</h4>
      </template>
      <template #body>
        <div class="ric-container">
          <!-- Search -->
          <div class="ric-search">
            <div class="ric-field">
              <label class="ric-label">ค้นหาตาม</label>
              <select class="ric-select" v-model="searchRefIC.search_field">
                <option value="war_code">Warranty Code</option>
                <option value="war_des">Warranty Name</option>
              </select>
            </div>
            <div class="ric-field ric-field--grow">
              <label class="ric-label">คำค้นหา</label>
              <div class="ric-input-group">
                <input type="text" class="ric-input" v-model="searchRefIC.search_text" @keyup.enter="doSearch('refIC')" placeholder="พิมพ์เพื่อค้นหา..." />
                <button class="ric-btn-search" @click.prevent="doSearch('refIC')"><i class="fas fa-search"></i></button>
              </div>
            </div>
          </div>
          <!-- Select All -->
          <div class="ric-toolbar">
            <label class="ric-checkbox-label">
              <input type="checkbox" class="ric-checkbox" true-value="Y" false-value="N" v-model="selectAllChecked" @change="selectAll"/>
              <span>เลือกทั้งหมด</span>
            </label>
            <span class="ric-count">เลือก {{ selectedItems.length }} รายการ</span>
          </div>
          <!-- Table -->
          <div class="ric-table-wrap">
            <table class="ric-table">
              <thead>
                <tr>
                  <th style="width:45px; text-align:center;"></th>
                  <th style="width:50px; text-align:center;">No.</th>
                  <th>Warranty Code</th>
                  <th>Warranty Name</th>
                  <th>Vendor</th>
                  <th style="width:110px; text-align:center;">Start Date</th>
                  <th style="width:110px; text-align:center;">End Date</th>
                  <th>IC Doc No.</th>
                  <th style="width:60px; text-align:center;">IC No.</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="x in dataListIC" :key="x.row" :class="{ 'ric-row--selected': x.cc_select === 'Y' }">
                  <td style="text-align:center;">
                    <input type="checkbox" class="ric-checkbox" true-value="Y" false-value="N" v-model="x.cc_select" @change="selectItem"/>
                  </td>
                  <td style="text-align:center; font-weight:600;">{{ x.row }}.</td>
                  <td><span class="ric-code">{{ x.war_code }}</span></td>
                  <td>{{ x.war_des }}</td>
                  <td>{{ x.cust_name }}</td>
                  <td style="text-align:center;">{{ $date(x.war_date_start) }}</td>
                  <td style="text-align:center;">{{ $date(x.war_date_end) }}</td>
                  <td>{{ x.ic_docno }}</td>
                  <td style="text-align:center;">{{ x.ic_itemno }}</td>
                </tr>
                <tr v-if="dataListIC.length === 0">
                  <td colspan="9" style="text-align:center; color:#94a3b8; padding:30px;">ไม่พบข้อมูล</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="ric-footer">
          <pagination class="pull-left" ref="pagingRefIC" @page-change="pageChangeRefIC($event.page)"></pagination>
          <button class="ric-btn-save" @click.prevent="addRefIC()"><i class="fa fa-save"></i> บันทึกข้อมูล</button>
        </div>
      </template>
    </modal-2>

    <!-- Modal : Template Import Data -->
    <import-data ref="importDataAuto" @send-import="onImportAuto($event)" :clear-input="()=> importFormAuto = {}" :default-input="defaultImportAuto">
      <template #body-import>
        <div class="row">
          <div class="col-md-12 margin-b-10">
            <button class="btn btn-sm btn-success" @click.prevent="xt.downloadTemplateExcel('Template_All_Warranty')"><i class="fas fa-download"></i> ดาวน์โหลดเทมเพลต</button>
          </div>
        </div>
        <div class="row">
          <div class="col-md-2">
            <div class="form-group">
              <label>Project</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['pre_event']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Area Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['loccode']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Area Name</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['locname']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Warranty Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['war_code']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Warranty Name</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['war_des']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Work Type</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['type_code']" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-2">
            <div class="form-group">
              <label>Material Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['itemcode']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Warranty Day</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['tot_date']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Warranty Month</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['tot_month']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Warranty Year</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['tot_year']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Lifetime</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['lifetime']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Model Name</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['itemname_other']" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-2">
            <div class="form-group">
              <label>Serial Number</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['serial_number']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Start Date (Customer)</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['startdate']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>End Date (Customer)</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['enddate']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Vendor</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['vendor']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Start Date (Vendor)</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['vendor_start_dt']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>End Date (Vendor)</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['vendor_end_dt']" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-2">
            <div class="form-group">
              <label>Remark Vendor</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['vendor_remark']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Remark</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['remark']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Active Warranty</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['active_row']" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Start Warranty</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormAuto['active']" />
            </div>
          </div>
        </div>
      </template>
    </import-data>

    <vue-worktype-list ref="ct_worktype" @send-data="sendComponent($event, 'work_type')"></vue-worktype-list>
    <vue-itemcode-list ref="ct_itemcode" @send-data="sendComponent($event, 'itemcode')"></vue-itemcode-list>
    <!-- Modal : Template Import Data -->
    <import-data ref="importDataMaster" @send-import="onImportMaster($event)" :clear-input="()=> importFormMaster = {}" :default-input="defaultImportMaster">
      <template #body-import>
        <div class="row">
          <div class="col-md-12 margin-b-10">
            <button class="btn btn-sm btn-success" @click.prevent="xt.downloadTemplateExcel('Template_List_Warranty')"><i class="fas fa-download"></i> ดาวน์โหลดเทมเพลต</button>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label>Warranty Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormMaster['war_code']" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Warranty Name</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormMaster['war_des']" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Work Type</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormMaster['type_code']" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Warranty Day</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormMaster['tot_date']" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label>Warranty Month</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormMaster['tot_month']" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Warranty Year</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormMaster['tot_year']" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Lifetime</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormMaster['lifetime']" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Material Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormMaster['itemcode']" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label>Vendor</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormMaster['vendor']" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Start Date</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormMaster['war_date_start']" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>End Date</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormMaster['war_date_end']" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Active</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" maxlength="2" v-model="importFormMaster['active']" />
            </div>
          </div>
        </div>
      </template>
    </import-data>
  </div>
</template>
<script>
import XLSX from 'xlsx';
import { mapState, mapGetters } from '~/stores/helpers'

let page = {};
let paging = {};
let pagingRefIC = {};
let appForm = {};
let process = false;
let cpn = {
  data() {
    return {
      auth,
      xt : $xt,
      ui: window.ui,
      pageNumber: 1,
      pageNumberRefIC: 1,
      editMode: false,
      search: {
        field : "war_code",
        text : "",
        active : "Y"
      },
      formData: {},
      datalist: [],
      displayData: [],
      total_datalist: 0,
      dataAdmin: {},
      msg:'',
      searchRefIC : {
          search_field : "war_code",
          search_text : ""
      },
      dataListIC: [],
      selectAllChecked: 'N',
      selectedItems: [],
      importFormMaster: {
        war_code: 'A', war_des: 'B', type_code: 'C', tot_date: 'D', tot_month: 'E', tot_year: 'F',
        lifetime: 'G', itemcode: 'H', vendor: 'J', war_date_start: 'K', war_date_end: 'L', active: 'M'
      },
      importFormAuto: {
        pre_event: 'A', loccode: 'B', locname: 'C', war_code: 'D', war_des: 'E', type_code: 'F', itemcode: 'G',
        tot_date: 'H', tot_month: 'I', tot_year: 'J', lifetime: 'K', itemname_other: 'L', serial_number: 'M',
        startdate: 'N', enddate: 'O', vendor: 'P', vendor_start_dt: 'Q', vendor_end_dt: 'R', vendor_remark: 'S',
        remark: 'T', active_row: 'U', active: 'V'
      }
    };
  },
  methods: {
    initTable() {
      let agr = this.$refs.agr;
      let fields = [
        ["item", "No.", "text", { width: 100, align: "center" }],
      ];
      if (this.permission()) {
        fields.push(["action_edit", "Edit", "text", { width: 120, align: "center", cellRenderer: () => `<a class="text-black"><i class="fa fa-edit"></i></a>` }]);
        fields.push(["action_del", "Delete", "text", { width: 120, align: "center", cellRenderer: () => `<a class="text-danger"><i class="far fa-trash-alt"></i></a>` }]);
      }
      fields.push(
        ["war_code", "Warranty Code", "text", { width: 180 }],
        ["war_des", "Warranty Name", "text", { width:240}],
        ["type_name", "Work Type", "text", { width: 180 }],
        ["tot_warranty", "Warranty Duration", "text", { width: 200, cellRenderer: (p) => p.data.lifetime === 'Y' ? 'ประกันตลอดอายุการใช้งาน' : (p.data.tot_warranty || '') }],
        ["lifetime", "Lifetime", "text", { width: 120, align: "center", cellRenderer: (p) => p.value === 'Y' ? `<span style="color:#00c116;font-weight:600">Yes</span>` : `<span style="color:#ff0000;font-weight:600">No</span>` }],
        ["active", "Active", "text", { width: 120, align: "center", cellRenderer: (p) => p.value === 'Y' ? `<span style="color:#00c116;font-weight:600">Yes</span>` : `<span style="color:#ff0000;font-weight:600">No</span>` }],
        ["add_user", "Add User", "text", { width: 130 }],
        ["add_dt", "Add Date", "datetime", { width: 140, align: "center" }, { useCellRenderer: true }],
        ["edit_user", "Edit User", "text", { width: 130 }],
        ["edit_dt", "Edit Date", "datetime", { width: 140, align: "center" }, { useCellRenderer: true }]
      );
      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);
      agr.setDisplay(this.datalist);
    },
    onCellClicked(event) {
      if (event.col === 'action_edit') {
        this.edit(event.data);
      } else if (event.col === 'action_del') {
        this.deleteData(event.data);
      }
    },
    reset() {
      this.editMode = false;
    },
    setNew() {
      this.reset();
      this.loadWorkType();
      this.$refs.modal.openModal();
    },
    async pageChange(pn) {
      pn = pn || 1;
      this.pageNumber = pn;
      paging.setCurrentPage(pn);
      await this.load()
    },
    async pageChangeRefIC(pn) {
      pn = pn || 1;
      this.pageNumberRefIC = pn;
      pagingRefIC.setCurrentPage(pn);
      await this.loadRefIC()
    },
    reset() {
      (async () => {
        this.editMode = false;
        this.formData = {
          war_code: "",
          war_des: "",
          type_code: "",
          type_name: "",
          itemcode: "",
          tot_date: 0,
          tot_month: 0,
          tot_year: 0,
          lifetime: "N",
          active: "Y"
        };

        await this.load();
      })();
    },
    async edit(x) {
      await this.read(x.war_code);
      this.editMode = true;
      this.msg = 'แก้ไขรายการ';
      this.loadWorkType();
      this.$refs.modal.openModal();
    },
    doSearch(type) {
      if(type === 'main') {
        this.load();     
        paging.setCurrentPage(1);
      } else {
        this.loadRefIC()  
        pagingRefIC.setCurrentPage(1);
      }
    },
    load() {
      (async () => {
        let act = `csm/master/WarrantyItem_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;
        for (var key in this.search) {
          act += `&${key}=${encodeURIComponent(this.search[key])}`
        }
        let rsp = await $xt.getServer(act);
        this.datalist = rsp.data.data_rows;
        this.total_datalist = rsp.data.total;
        
        let i = paging.skipItems() == 0 ? 0 : paging.skipItems();
        $linq(this.datalist).foreach(x => {
        x.item = ++i;
        });
        paging.setTotalItems(rsp.data.total);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();
        
        if (this.$refs.agr) {
          this.$refs.agr.setDisplay(this.datalist);
        }
      })();
    },
    async loadRefIC(filter) {
      let act = `csm/master/WarrantyRefIC?skip=${pagingRefIC.skipItems()}&take=${pagingRefIC.getItemsPerPage()}`;
      for (var key in this.searchRefIC) {
        act += `&${key}=${encodeURIComponent(this.searchRefIC[key])}`
      }
      let rsp = await $xt.getServer(act);
      this.dataListIC = rsp.data.data
      
      if(filter){
        const findDuplicateRefIC = this.dataListIC.filter(itemA => !this.datalist.some(itemB => itemB.ic_docno === itemA.ic_docno && itemB.ic_itemno === itemA.ic_itemno));
        this.dataListIC = findDuplicateRefIC
      }
      

      pagingRefIC.setTotalItems(rsp.data.total);
      if (!pagingRefIC.getItemsPerPage()) {
        pagingRefIC.setCurrentPage(1);
      }
      pagingRefIC.createPagesArray();
    },
    async loadWorkType() {
      try {
        page.loadingBox.show();
        let act = `csm/master/WarrantyGroup_ReadList?active=Y`;
        // for (var key in this.searchData) {
        //   act += `&${key}=${encodeURIComponent(this.searchData[key])}`
        // }
        let rsp = await $xt.getServer(act);
        let workData = $linq(rsp.data.data).where(x => x.default_ == 'Y').firstOrDefault();
        
        if (workData) {
          this.formData.type_code = workData.type_code;
          this.formData.type_name = workData.type_name;
        }
        
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
        page.loadingBox.hide();
      }

    },
    async getDefaultWorkType() {
      try {
        let act = `csm/master/WarrantyGroup_ReadList?active=Y`;
        let rsp = await $xt.getServer(act);
        let workData = $linq(rsp.data.data).where(x => x.default_ == 'Y').firstOrDefault();
        
        if (workData) {
          return {
            type_code: workData.type_code,
            type_name: workData.type_name
          };
        }
        
        return { type_code: "", type_name: "" };
      } catch (ex) {
        console.error('Error getting default work type:', ex);
        return { type_code: "", type_name: "" };
      }
    },
    read(war_code) {
      (async () => {
        let act = `csm/master/WarrantyItem_Read?war_code=${encodeURIComponent(war_code || '')}`;
        let rsp = await $xt.getServer(act);
        this.formData = rsp.data;
        this.editMode = true
      })();
    },
   
    save() {
      (async () => {
        if (process) return;
        try {
          let f = {
            header: this.formData
          };
          let act = `CSM/MASTER/WarrantyItem_Create`;
          if (this.editMode) {
            act = `CSM/MASTER/WarrantyItem_Update`;
          }

          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }

          //await this.read(rsp.data);
          await this.load();
          await this.reset();

          $msg.alert(`Success`, `Your information has been saved successfully.` , `success`)

          this.reset();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          // process = false;
          page.loadingBox.hide();
        }
        this.$refs.modal.closeModal();
      })();
    },
    deleteData(x) {
      (async () => {
        if (!await $msg.confirm(`คุณต้องการลบข้อมูล Warranty : ${x.war_code} นี้ ใช่หรือไม่`)) {
          return;
        }
        try {
          let f = {
            header: x
          };
          let act = `CSM/Master/WarrantyItem_Delete`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          await this.reset();
          await this.load();
          $msg.alert(`ทำการลบข้อมมูลเสร็จสิ้น`, `ทำการลบข้อมมูล : ${x.war_code} เรียบร้อยแล้ว`, `success`);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          // process = false;
          page.loadingBox.hide();
        }
      })();
    },
    sendComponent(e, type) {
      switch (type) {
        case "work_type":
          this.formData.type_code = e.type_code;
          this.formData.type_name = e.type_name;
          break;
        case "itemcode":
          this.formData.itemcode = e.type_code;
          this.formData.itemname = e.type_name;
          if ($xt.isEmpty(this.formData["war_code"]) || $xt.isEmpty(this.formData["war_des"])) {
            this.formData["war_code"] = e.type_code;
            this.formData["war_des"] = e.type_name;
          }
          break;
      }
    },
    clearData(data, field) {
      $linq(field).foreach(x => data[x] = null);
    },
    setLifeTime() {
      this.formData.tot_year = 0;
      this.formData.tot_month = 0;
      this.formData.tot_date = 0;
    },
    is_mango() {
      let isMango = $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault();
      return isMango == "Y" ? true : false;
    },
    permission() {
      let data = (!this.is_mango() || auth.is_admin);
      return data;
    },
    onExport() {
      let arr = [];
      if (this.datalist.length > 0) {
        $linq(this.datalist).foreach(x => {
          arr.push({
            'war_code': x.war_code,
            'war_des': x.war_des,
            'type_code': x.type_code,
            'itemcode': x.itemcode,
            'active': x.active,
            'tot_date': x.tot_date,
            'tot_month': x.tot_month,
            'tot_year': x.tot_year,
            'lifetime': x.lifetime,
          })
        });
      }
      else {
        arr.push({
          'war_code': "",
          'war_des': "",
          'type_code': "",
          'itemcode': "",
          'active': "",
          'tot_date': "",
          'tot_month': "",
          'tot_year': "",
          'lifetime': "",
        })
      }
      var dataWS = XLSX.utils.json_to_sheet(arr);
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, dataWS);
      XLSX.writeFile(wb, 'Warranty_Item.xlsx');
    },
    async onImportMaster(e) {
      page.loadingBox.show();
      try {
        let f = { data: this.arrImportMaster(e) };
        let act = `CSM/Master/WarrantyItemImportData_Master`;
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) {
          throw new Error(rsp.error);
        }
        $notify.success('นำเข้าข้อมูลเสร็จสิ้น');
        this.$refs.importDataMaster.closeImport();
        await this.load();
      } catch (ex) {
        $msg.alert("", ex.toString(), "danger");
      } finally {
        page.loadingBox.hide();
      }
    },
    arrImportMaster(e) {
      let arr = []
      e.forEach((x) => {
        arr.push({
          war_code: x[this.importFormMaster.war_code],
          war_des: x[this.importFormMaster.war_des],
          type_code: x[this.importFormMaster.type_code],
          tot_date: x[this.importFormMaster.tot_date],
          tot_month: x[this.importFormMaster.tot_month],
          tot_year: x[this.importFormMaster.tot_year],
          lifetime: x[this.importFormMaster.lifetime],
          itemcode: x[this.importFormMaster.itemcode],
          vendor: x[this.importFormMaster.vendor],
          war_date_start: x[this.importFormMaster.war_date_start],
          war_date_end: x[this.importFormMaster.war_date_end],
          active: x[this.importFormMaster.active]
        })
      })
      return arr
    },
    defaultImportMaster() {
      this.importFormMaster = {
        war_code: 'A', war_des: 'B', type_code: 'C', tot_date: 'D', tot_month: 'E', tot_year: 'F',
        lifetime: 'G', itemcode: 'H', vendor: 'J', war_date_start: 'K', war_date_end: 'L', active: 'M'
      }
    },
    async addRefIC() {
      try {
        let saveNewData = [];
        for (const x of this.selectedItems) {
          const difference = this.calculateDifference(x.war_date_start, x.war_date_end);
          
          // Get default work type if not provided
          let typeCode = x.type_code || "";
          let typeName = x.type_name || "";
          if (!typeCode || !typeName) {
            const defaultWorkType = await this.getDefaultWorkType();
            typeCode = defaultWorkType.type_code || "";
            typeName = defaultWorkType.type_name || "";
          }
          
          saveNewData.push({
            war_code: x.war_code || "",
            war_des: x.war_des || "",
            type_code: typeCode,
            type_name: typeName,
            itemcode: x.itemcode || "",
            tot_date: difference.tot_date,
            tot_month: difference.tot_month,
            tot_year: difference.tot_year,
            lifetime: "N",
            active: "Y",
            acct_no: x.acct_no || "",
            ic_docno: x.ic_docno || "",
            ic_itemno: x.ic_itemno || "",
            war_date_start: x.war_date_start || "",
            war_date_end: x.war_date_end || "",
            vendor: x.cust_name || "",
            pre_event: x.pre_event,
            pre_event2: x.pre_event2,
            loccode: x.loccode,
          });
        }

        page.loadingBox.show();

        const requests = saveNewData.map(async (item) => {
          let act = `CSM/MASTER/WarrantyItem_Create`;
          let f = { header: item };
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
        });
        await Promise.all(requests);

        await this.load();
        this.reset();

        $msg.alert(`Success`, `Your information has been saved successfully.`, `success`);
      } catch (ex) {
        $msg.alert(`Error`, ex.toString(), `danger`);
      } finally {
        page.loadingBox.hide();
        this.$refs.refICModal.closeModal();
      }
    },
    openModalRefIC() {
      this.selectedItems = []
      this.dataListIC.forEach(x => x.cc_select = "N")
      this.selectAllChecked = "N"
      this.loadRefIC(true)
      this.$refs.refICModal.setSize("modal-lg-2")
      this.$refs.refICModal.openModal()
    },
    selectAll() {
      this.selectAllChecked == "Y" ? this.selectedItems = [...this.dataListIC] : this.selectedItems = []
      this.dataListIC.forEach(x => x.cc_select = this.selectAllChecked == "Y" ? "Y" : "N")
      // this.pageChange(this.pageNumber)
    },
    selectItem() {
      this.selectedItems = this.dataListIC.filter(x => x.cc_select == "Y")
      this.selectAllChecked = this.dataListIC.every(x => x.cc_select == "Y") ? "Y" : "N"
      // this.pageChange(this.pageNumber)
    },
    calculateDifference(startDate, endDate) {
      const start = moment(startDate);
      const end = moment(endDate);

      if (!$xt.isEmpty(startDate) && !$xt.isEmpty(endDate)) {
        let diffInYears = end.diff(start, 'years');
        let diffInMonths = end.diff(start.clone().add(diffInYears, 'years'), 'months');
        let diffInDays = end.diff(start.clone().add(diffInYears, 'years').add(diffInMonths, 'months'), 'days');

        return {
          tot_year: Math.abs(diffInYears),
          tot_month: Math.abs(diffInMonths),
          tot_date: Math.abs(diffInDays)
        };
      } else {
        return {
          tot_year: 0,
          tot_month: 0,
          tot_date: 0
        };
      }
    },
    async onImportAuto(e) {
      page.loadingBox.show();
      try {
        let f = { data: this.arrImportAuto(e) };
        let act = `CSM/Master/WarrantyAutoImportData`;
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) {
          throw new Error(rsp.error);
        }
        $notify.success(this.ui.alert_save_success)
        this.$refs.importDataAuto.closeImport();
        await this.load();
      } catch (ex) {
        $msg.alert("Warning", ex.toString(), "warning");
      } finally {
        page.loadingBox.hide();
      }
    },
    arrImportAuto(e) {
      let arr = []
      e.forEach((x) => {
        arr.push({
          pre_event: x[this.importFormAuto.pre_event],
          loccode: x[this.importFormAuto.loccode],
          locname: x[this.importFormAuto.locname],
          war_code: x[this.importFormAuto.war_code],
          war_des: x[this.importFormAuto.war_des],
          type_code: x[this.importFormAuto.type_code],
          itemcode: x[this.importFormAuto.itemcode],
          tot_date: x[this.importFormAuto.tot_date],
          tot_month: x[this.importFormAuto.tot_month],
          tot_year: x[this.importFormAuto.tot_year],
          lifetime: x[this.importFormAuto.lifetime],
          itemname_other: x[this.importFormAuto.itemname_other],
          serial_number: x[this.importFormAuto.serial_number],
          startdate: x[this.importFormAuto.startdate],
          enddate: x[this.importFormAuto.enddate],
          vendor: x[this.importFormAuto.vendor],
          vendor_start_dt: x[this.importFormAuto.vendor_start_dt],
          vendor_end_dt: x[this.importFormAuto.vendor_end_dt],
          vendor_remark: x[this.importFormAuto.vendor_remark],
          remark: x[this.importFormAuto.remark],
          active_row: x[this.importFormAuto.active_row],
          active: x[this.importFormAuto.active]
        })
      })
      return arr
    },
    defaultImportAuto() {
      this.importFormAuto = {
        pre_event: 'A', loccode: 'B', locname: 'C', war_code: 'D', war_des: 'E', type_code: 'F', itemcode: 'G',
        tot_date: 'H', tot_month: 'I', tot_year: 'J', lifetime: 'K', itemname_other: 'L', serial_number: 'M',
        startdate: 'N', enddate: 'O', vendor: 'P', vendor_start_dt: 'Q', vendor_end_dt: 'R', vendor_remark: 'S',
        remark: 'T', active_row: 'U', active: 'V'
      }
    },
    openImportModal() {
      this.$refs.importDataMaster.openImport();
    },
    openImportAllModal() {
      this.$refs.importDataAuto.openImport();
    }
  },
  computed: {
    configData() { return store.state.configData },
    ...mapState(['maincomp']),
  },
  mounted() {
    (async () => {
      page = this.$refs.page;
      page.pageTitle = 'Master : รายการสินค้าประกัน';
      document.title = page.pageTitle;

      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(500);

      pagingRefIC = this.$refs.pagingRefIC;
      pagingRefIC.setCurrentPage(1);
      pagingRefIC.setItemsPerPage(500);
      this.$refs.modal.setSize("modal-xl-2");

      appForm = this.$refs.appForm
      appForm.btnDelete.show = false
      appForm.btnSave.show = false
      appForm.btnNew.click = this.setNew
      // appForm.btnImport.show = false
      // appForm.btnImport_center.show = true
      // appForm.btnImport_center.click = this.load
      // appForm.btnImport.click = this.openImportModal
      // appForm.btnImport_center.url = "csm/master/WarrantyItemImport_Master"

      appForm.btnImport.show = true
      appForm.btnImport_center.show = false
      appForm.btnImport.click = this.openImportModal

      this.reset();
      this.load();
      this.loadRefIC();
    })();
  }
};

export default cpn;
</script>

<style scoped>
  /* Reference IC Modal */
  .ric-container { padding: 4px 0; }

  .ric-search {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    margin-bottom: 14px;
  }

  .ric-field { display: flex; flex-direction: column; gap: 4px; min-width: 150px; }
  .ric-field--grow { flex: 1; }

  .ric-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .ric-select {
    padding: 8px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    color: #334155;
    background: #fff;
  }

  .ric-select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

  .ric-input-group { display: flex; gap: 4px; }

  .ric-input {
    flex: 1;
    padding: 8px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    color: #334155;
  }

  .ric-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .ric-input::placeholder { color: #94a3b8; }

  .ric-btn-search {
    padding: 8px 14px;
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .ric-btn-search:hover { background: #1d4ed8; }

  /* Toolbar */
  .ric-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .ric-checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #334155;
    cursor: pointer;
    margin: 0;
  }

  .ric-checkbox { width: 16px; height: 16px; cursor: pointer; accent-color: #2563eb; }
  .ric-count { font-size: 12px; color: #64748b; font-weight: 500; }

  /* Table */
  .ric-table-wrap {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    max-height: 380px;
    overflow-y: auto;
  }

  .ric-table-wrap::-webkit-scrollbar { width: 6px; }
  .ric-table-wrap::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

  .ric-table { width: 100%; border-collapse: collapse; font-size: 13px; }

  .ric-table thead { position: sticky; top: 0; z-index: 2; }

  .ric-table thead th {
    padding: 10px 10px;
    background: #f1f5f9;
    color: #475569;
    font-weight: 600;
    font-size: 12px;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
    white-space: nowrap;
  }

  .ric-table tbody td {
    padding: 9px 10px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }

  .ric-table tbody tr:hover { background: #f8fafc; }
  .ric-row--selected { background: #eff6ff !important; }
  .ric-row--selected td { color: #1d4ed8; }

  .ric-code {
    font-family: monospace;
    font-size: 12px;
    font-weight: 600;
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
  }

  /* Footer */
  .ric-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .ric-btn-save {
    padding: 9px 20px;
    background: #059669;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
    box-shadow: 0 2px 6px rgba(5,150,105,0.2);
  }

  .ric-btn-save:hover { background: #047857; box-shadow: 0 4px 10px rgba(5,150,105,0.3); }

  /* Warranty Modal */
  .wm-container { padding: 4px 0; }

  .wm-section {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
  }

  .wm-section:last-child { margin-bottom: 0; }

  .wm-section__title {
    font-size: 13px;
    font-weight: 700;
    color: #1e40af;
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .wm-grid { display: grid; gap: 14px; margin-bottom: 8px; }
  .wm-grid--2col { grid-template-columns: 1fr 1fr; }
  .wm-grid--3col { grid-template-columns: 2fr 3fr 80px; align-items: end; }
  .wm-grid--4col { grid-template-columns: 1fr 1fr 1fr 80px; align-items: end; }

  .wm-field { display: flex; flex-direction: column; gap: 4px; }

  .wm-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .wm-label--required::after { content: ' *'; color: #dc2626; }

  .wm-input {
    padding: 8px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    color: #1e293b;
    transition: all 0.15s;
    width: 100%;
    background: #ffffff;
  }

  .wm-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .wm-input--disabled { background: #fef2f2; color: #dc2626; font-weight: 600; border-color: #fecaca; cursor: not-allowed; }
  .wm-input--readonly { background: #f1f5f9; color: #64748b; border-color: #e2e8f0; border-style: dashed; cursor: default; }
  .wm-input[readonly] { background: #f1f5f9; color: #64748b; border-color: #e2e8f0; border-style: dashed; cursor: default; }

  .wm-hint { font-size: 10px; color: #94a3b8; text-align: right; }

  .wm-input-group { display: flex; gap: 4px; align-items: center; }
  .wm-input-group .wm-input { flex: 1; background: #f1f5f9; border-style: dashed; color: #64748b; }

  .wm-btn-icon {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: #2563eb;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    flex-shrink: 0;
    transition: background 0.15s;
  }

  .wm-btn-icon:hover { background: #1d4ed8; }
  .wm-btn-icon--danger { background: #fee2e2; color: #dc2626; }
  .wm-btn-icon--danger:hover { background: #dc2626; color: #fff; }

  .wm-switch-label {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 500;
    color: #334155;
    cursor: pointer;
    margin: 0;
    padding-top: 6px;
  }

  .wm-switch {
    position: relative;
    width: 40px;
    height: 22px;
    appearance: none;
    -webkit-appearance: none;
    background: #cbd5e1;
    border-radius: 22px;
    outline: none;
    cursor: pointer;
    transition: background 0.25s;
    flex-shrink: 0;
  }

  .wm-switch::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: transform 0.25s;
  }

  .wm-switch:checked {
    background: #2563eb;
  }

  .wm-switch:checked::before {
    transform: translateX(18px);
  }

  .wm-switch--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #94a3b8;
  }

  .wm-switch--disabled:checked {
    background: #ff0a0aff;
  }

  .wm-switch-label--disabled {
    opacity: 0.7;
    cursor: not-allowed;
    color: #64748b;
    font-style: italic;
  }

  .wm-input--number {
    text-align: right;
  }

  /* Pill Buttons (Active / Lifetime) */
  .wm-pill-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    border: 2px solid;
    transition: all 0.2s;
    background: #fff;
  }

  .wm-pill-btn i { font-size: 12px; }

  /* Active state */
  .wm-pill-btn--active {
    border-color: #2563eb;
    color: #2563eb;
    background: #eff6ff;
  }

  .wm-pill-btn--active:hover {
    background: #dbeafe;
  }

  /* Inactive state */
  .wm-pill-btn--inactive {
    border-color: #fca5a5;
    color: #dc2626;
    background: #fef2f2;
  }

  .wm-pill-btn--inactive:hover {
    background: #fee2e2;
  }

  /* Lifetime ON */
  .wm-pill-btn--lifetime {
    border-color: #2563eb;
    color: #2563eb;
    background: #eff6ff;
  }

  .wm-pill-btn--lifetime:hover {
    background: #dbeafe;
  }

  /* Lifetime OFF (กำหนดเวลา) */
  .wm-pill-btn--no-lifetime {
    border-color: #e2e8f0;
    color: #64748b;
    background: #f8fafc;
  }

  .wm-pill-btn--no-lifetime:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  /* Serial No (read-only display pill) */
  .wm-pill-btn--serial {
    cursor: default;
    border-color: #e2e8f0;
    color: #94a3b8;
    background: #f8fafc;
    opacity: 0.7;
  }

  .wm-pill-btn--serial-on {
    border-color: #a7f3d0;
    color: #059669;
    background: #ecfdf5;
    opacity: 1;
  }

  .wm-callout {
    margin-top: 10px;
    padding: 10px 14px;
    background: #fef3c7;
    border: 1px solid #fde68a;
    border-radius: 8px;
    font-size: 12px;
    color: #92400e;
  }

  .wm-footer { display: flex; justify-content: flex-end; width: 100%; }

  .wm-btn-save {
    padding: 9px 22px;
    background: #059669;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
    box-shadow: 0 2px 6px rgba(5,150,105,0.2);
  }

  .wm-btn-save:hover { background: #047857; box-shadow: 0 4px 10px rgba(5,150,105,0.3); }
</style>
