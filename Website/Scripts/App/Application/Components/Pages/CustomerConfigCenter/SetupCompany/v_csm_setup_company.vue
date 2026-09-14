<template>
  <div>
    <!-- <page ref="page"> -->
    <re-page ref="page">
      <template slot="body">
        <section class="content">
          <!-- Control Button : Company -->
          <div class="row">
            <div class="col-md-12">
              <div class="pull-right">
                <button class="btn btn-sm btn-facebook" @click.prevent="$refs.company.openModal({
                  servicePath: servicePath,
                })"><i class="fas fa-list"></i> <span v-text="ui.retrieve || 'Retrieve Document'"></span></button>
                <template v-if="auth.is_admin || (auth.userid.toUpperCase() || '') == 'MANGO'">
                  <button class="btn btn-sm btn-linkedin" @click.prevent="confirmResetCompany"><i class="fas fa-plus"></i> <span v-text="ui.new || 'สร้างเอกสารใหม่'"></span></button>
                  <button class="btn btn-sm btn-success" @click.prevent="saveCompany"><i class="fas fa-save"></i> <span v-text="ui.save || 'บันทึกเอกสาร'"></span></button>
                </template>
              </div>
            </div>
          </div>
          <div class="nav nav-tabs-custom margin-t-10">
            <ul class="nav nav-tabs">
              <li v-for="(x,idx) in headerTab" :key="`header-${idx}`" :class="{'active':x.id==headerTabSelected}" v-show="x.show">
                <a href="#" @click.prevent="clickTabSelected(x, 'header')">&nbsp;<i class="fas" v-bind:class="xt.isEmpty(x.icon) ? 'fa-circle' : x.icon"></i>&nbsp;{{x.text}} <span v-if="x.total > 0">({{x.total}})</span></a>
              </li>
              <li class="pull-right" v-if="!xt.isEmpty(mainCompany.maincode)">
                <div class="margin-t-10 margin-r-20">
                  <p>Edit by : {{mainCompany.edituser}} Edit Date : {{$date(mainCompany.edit_dt, 'DD/MM/YYYY HH:mm:ss')}}</p>
                </div>
              </li>
            </ul>
            <div class="tab-content">
              <!-- Tab : Company Information -->
              <div class="tab-pane" v-bind:class="{'active': headerTabSelected == 'header_tab1'}">
                <div class="content-body" ref="contentPanel">
                  <div class="padding-detail">
                    <div class="row">
                      <!-- Company : Panel Left -->
                      <div class="col-md-8">
                        <div class="box box-info">
                          <div class="box-body">
                            <!-- Company Left : Row 1 -->
                            <div class="row">
                              <div class="col-md-2">
                                <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(mainCompany.maincode)}">
                                  <label class="text-danger" v-text="ui.erp_company || 'Company Code'"></label>
                                  <input type="text" class="form-control input-sm text-center" v-model="mainCompany.maincode" v-bind:disabled="editCompany" />
                                </div>
                              </div>
                              <div class="col-md-2">
                                <div class="form-group">
                                  <label>Initial</label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.initi_name" maxlength="20" />
                                </div>
                              </div>
                              <div class="col-md-6">
                                <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(mainCompany.mainname)}">
                                  <label class="text-danger" v-text="ui.erp_company_name || 'Company Name'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.mainname" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 2 -->
                            <!-- <div class="row">
                              <div class="col-md-2">
                                <div class="form-group">
                                  <label class="text-dark-blue" v-text="'Priority Company'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.group_h">
                                    <option value="Y">Parent Company</option>
                                    <option value="N">Subsidiary Company</option>
                                  </select>
                                </div>
                              </div>
                              <div class="col-md-8">
                                <div class="form-group">
                                  <label v-text="ui.erp_company || 'Company'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.group_code" v-bind:disabled="mainCompany.group_h != 'N'">
                                    <option v-for="(x,idx) in parentcompany" v-bind:value="x.maincode">({{x.maincode}}) {{x.mainname}}</option>
                                  </select>
                                </div>
                              </div>
                            </div> -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="d-flex">
                                  <div class="form-check form-switch form-check-custom form-check-solid me-5">
                                    <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.show" />
                                    <label class="form-check-label" v-text="ui.erp_active || 'Active'"></label>
                                  </div>
                                  <div class="form-check form-switch form-check-custom form-check-solid me-5">
                                    <input class="form-check-input h-20px w-30px" type="checkbox" true-value="0" false-value="1" v-model="mainCompany.default_login" />
                                    <label class="form-check-label">Default From Login</label>
                                  </div>
                                  <div class="form-check form-switch form-check-custom form-check-solid form-check-warning me-5">
                                    <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.use_cheque_tracking" />
                                    <label class="form-check-label">Supplier Tracking</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <hr />
                            <!-- Company Left : Row 3 -->
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_address1 || 'Address (1)'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.mainadr1" />
                                </div>
                              </div>
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_address2 || 'Address (2)'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.mainadr2" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 4 -->
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_building_en || 'Building (TH)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.building_th" @keyup="autoChangeAddress('TH', '1')" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_room_en || 'Room (TH)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.room_th" @keyup="autoChangeAddress('TH', '1')" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_floor || 'Floor (TH)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.floor_th" @keyup="autoChangeAddress('TH', '1')" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 5 -->
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_village_en || 'Village (TH)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.village_th" @keyup="autoChangeAddress('TH', '1')" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_unit_en || 'Unit No. (TH)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.unit_no_th" @keyup="autoChangeAddress('TH', '1')" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_moo_en || 'Moo. (TH)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.m_no" @keyup="autoChangeAddress('TH', '1')" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 6 -->
                            <div class="row">
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_junction_en || 'Junction (TH)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.junction_th" @keyup="autoChangeAddress('TH', '1')" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_road_en || 'Road (TH)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.road_th" @keyup="autoChangeAddress('TH', '1')" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_sub_district_en || 'Sub District (TH)'"></label>
                                  <thai-address-input type="subdistrict"
                                                      v-model="mainCompany.sub_district_th"
                                                      input-class="form-control input-sm"
                                                      @selected="onSelected($event, '2')"></thai-address-input>
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_district_en || 'District (TH)'"></label>
                                  <thai-address-input type="district"
                                                      v-model="mainCompany.district_th"
                                                      input-class="form-control input-sm"
                                                      @selected="onSelected($event, '2')"></thai-address-input>
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 7 -->
                            <div class="row">
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_province || 'Province (TH)'"></label>
                                  <thai-address-input type="province"
                                                      v-model="mainCompany.province_th"
                                                      input-class="form-control input-sm"
                                                      @selected="onSelected($event, '2')"></thai-address-input>
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_country || 'Country (TH)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.country_th" @keyup="autoChangeAddress('TH', '2')" />
                                </div>
                              </div>
                            </div>
                            <hr />
                            <!-- Company Left : Row 8 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label v-text="ui.erp_name || 'Name (ENG)'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.engname" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 9 -->
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_address1 || 'Address (1) (ENG)'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.engaddr1" />
                                </div>
                              </div>
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_address2 || 'Address (2) (ENG)'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.engaddr2" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 10 -->
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_building_en || 'Building (ENG)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.building_en" @keyup="autoChangeAddress('EN', '1')" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_room_en || 'Room (ENG)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.room_en" @keyup="autoChangeAddress('EN', '1')" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_floor || 'Floor (ENG)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.floor_en" @keyup="autoChangeAddress('EN', '1')" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 11 -->
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_village_en || 'Village (ENG)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.village_en" @keyup="autoChangeAddress('EN', '1')" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_junction_en || 'Junction (ENG)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.junction_en" @keyup="autoChangeAddress('EN', '1')" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_road_en || 'Road (ENG)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.road_en" @keyup="autoChangeAddress('EN', '1')" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 12 -->
                            <div class="row">
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_sub_district_en || 'Sub District (ENG)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.sub_district_en" @keyup="autoChangeAddress('EN', '2')" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_district_en || 'District (ENG)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.district_en" @keyup="autoChangeAddress('EN', '2')" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_province || 'Province (ENG)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.province_en" @keyup="autoChangeAddress('EN', '2')" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_country || 'Country (ENG)'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.country_en" @keyup="autoChangeAddress('EN', '2')" />
                                </div>
                              </div>
                            </div>
                            <hr />
                            <!-- Company Left : Row 13 -->
                            <div class="row">
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_post_code || 'Post Code'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.mainpost" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_contact_tel || 'Tel.'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.maintel" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_fax || 'Fax'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.mainfax" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_tax_no || 'Tax No.'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.maintaxid" maxlength="13" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 14 -->
                            <div class="row">
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_branch || 'Branch'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.v_branch" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_vat || 'VAT (%)'"></label>
                                  <div class="input-group">
                                    <span class="input-group-addon"><i class="fas fa-percentage"></i></span>
                                    <number class="form-control input-sm" decimals="2" v-model.number="mainCompany.vatper"></number>
                                  </div>
                                </div>
                              </div>
                              <div class="col-md-2">
                                <div class="d-flex margin-t-25">
                                  <div class="form-check form-switch form-check-custom form-check-solid me-5">
                                    <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.acvat" />
                                    <label class="form-check-label" v-text="ui.erp_a_by_c_vat || 'A/C VAT'"></label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 15 -->
                            <div class="row">
                              <div class="col-md-4">
                                <div class="form-group">
                                  <label>A/C Cost (PM)</label>
                                  <div class="input-group">
                                    <input type="text" class="form-control input-sm text-center" v-model="mainCompany.ac_code_cost1" />
                                    <span class="input-group-addon">-</span>
                                    <input type="text" class="form-control input-sm text-center" v-model="mainCompany.ac_code_cost2" />
                                  </div>
                                </div>
                              </div>
                              <div class="col-md-4">
                                <div class="form-group">
                                  <label>A/C Revenue (PM)</label>
                                  <div class="input-group">
                                    <input type="text" class="form-control input-sm text-center" v-model="mainCompany.ac_code_rev1" />
                                    <span class="input-group-addon">-</span>
                                    <input type="text" class="form-control input-sm text-center" v-model="mainCompany.ac_code_rev2" />
                                  </div>
                                </div>
                              </div>
                              <div class="col-md-4">
                                <div class="form-group">
                                  <label v-text="'A/C Expense'"></label>
                                  <div class="input-group">
                                    <input type="text" class="form-control input-sm text-center" v-model="mainCompany.ac_code_exp1" />
                                    <span class="input-group-addon">-</span>
                                    <input type="text" class="form-control input-sm text-center" v-model="mainCompany.ac_code_exp2" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 16 -->
                            <div class="row">
                              <div class="col-md-4">
                                <div class="form-group">
                                  <label>A/C Cost (GL)</label>
                                  <div class="input-group">
                                    <input type="text" class="form-control input-sm text-center" v-model="mainCompany.gl_code_cost1" />
                                    <span class="input-group-addon">-</span>
                                    <input type="text" class="form-control input-sm text-center" v-model="mainCompany.gl_code_cost2" />
                                  </div>
                                </div>
                              </div>
                              <div class="col-md-4">
                                <div class="form-group">
                                  <label>A/C Revenue (GL)</label>
                                  <div class="input-group">
                                    <input type="text" class="form-control input-sm text-center" v-model="mainCompany.gl_code_rev1" />
                                    <span class="input-group-addon">-</span>
                                    <input type="text" class="form-control input-sm text-center" v-model="mainCompany.gl_code_rev2" />
                                  </div>
                                </div>
                              </div>
                              <div class="col-md-4">
                                <div class="form-group">
                                  <label>A/C Expense Type</label>
                                  <select class="form-control input-sm" v-model="mainCompany.ac_code_exp_proj">
                                    <option value="Y">Department and Project</option>
                                    <option value="N">Department Only</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 17 -->
                            <div class="row">
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="'Start A/C Date'"></label>
                                  <datepicker input-class="form-control input-sm" v-model="mainCompany.vchdate"></datepicker>
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="'GL Retention AP'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.glretap">
                                    <option value="1">AP</option>
                                    <option value="2">Paid (PL/PV)</option>
                                  </select>
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="'GL Retention AR'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.glretar">
                                    <option value="1">AR</option>
                                    <option value="2">Receipt (RL/RV)</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 18 -->
                            <div class="row">
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label class="text-danger">Currency</label>
                                  <select class="form-control input-sm" v-model="mainCompany.currency_c">
                                    <option v-for="(x, idx) in currency" :value="x.curren" v-text="x.descript"></option>
                                  </select>
                                </div>
                              </div>
                              <div class="col-md-3" v-if="(config.COMPSHOW_ICTYPE || 'N') == 'Y'">
                                <div class="form-group">
                                  <label>IC Type</label>
                                  <select class="form-control input-sm" v-model="mainCompany.iccost_type">
                                    <option value="1">Periodic</option>
                                    <option value="2">Perpetual</option>
                                  </select>
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_ic_cost_method || 'IC Cost Method'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.iccost" v-bind:disabled="mainCompany.lock_ic">
                                    <option value="1">Average</option>
                                    <option value="2">FIFO</option>
                                    <option value="3">Specific Identification</option>
                                  </select>
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_ic_cost_amount || 'IC Cost Amount'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.iccost_amount" v-bind:disabled="mainCompany.lock_ic && !auth.is_super_admin">
                                    <option value="Y">Exclude VAT</option>
                                    <option value="N">Include VAT</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 19 -->
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_path_picture_m_to || 'Path Picture Material To'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.dirpic_mat" />
                                </div>
                              </div>
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_path_picture_en_to || 'Path Picture Employee To'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.dirpic_emp" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 20 -->
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_path_asset_to || 'Path Picture Asset To'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.dirpic_asset" />
                                </div>
                              </div>
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_path_backup_to || 'Path Backup To'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.dirbk" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 21 -->
                            <div class="row">
                              <div class="col-md-2">
                                <div class="form-group">
                                  <label v-text="ui.erp_comfirm_p_o || 'Confirm P/O or LOI'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.poconf">
                                    <option value="Y">Yes</option>
                                    <option value="N">No</option>
                                  </select>
                                </div>
                              </div>
                              <div class="col-md-2">
                                <div class="form-group">
                                  <label v-text="ui.erp_open_leave_work || 'Open Leave Work'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.absconf">
                                    <option value="Y">Yes</option>
                                    <option value="N">No</option>
                                  </select>
                                </div>
                              </div>
                              <div class="col-md-2">
                                <div class="form-group">
                                  <label v-text="ui.erp_lock_create_po || 'Lock Create PO'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.lock_po_wo">
                                    <option value="Y">Yes</option>
                                    <option value="N">No</option>
                                  </select>
                                </div>
                              </div>
                              <div class="col-md-2">
                                <div class="form-group">
                                  <label v-text="ui.erp_lock_create_wo || 'Lock Create WO'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.lock_wo_po">
                                    <option value="Y">Yes</option>
                                    <option value="N">No</option>
                                  </select>
                                </div>
                              </div>
                              <div class="col-md-2">
                                <div class="form-group">
                                  <label v-text="ui.erp_depeciation_day_of_y || 'Depeciation Day of year'"></label>
                                  <input class="form-control input-sm text-center" v-model="mainCompany.day_of_year" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 22 -->
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_website || 'Ref. Website'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.website" maxlength="500" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Left : Row 23 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label v-text="ui.erp_remark || 'Remark'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.comp_remark" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="box box-info" ref="boxTransfer">
                          <div class="box-header with-border">
                            <h4 class="box-title">Transfer Bank</h4>
                            <div class="box-tools pull-right">
                              <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                            </div>
                          </div>
                          <div class="box-body">
                            <!-- Transfer Bank : Row 1 -->
                            <div class="row">
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_pay_default || 'Pay Default'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.paytype_default">
                                    <option value="B">Cheque</option>
                                    <option value="1">Transfer Bank</option>
                                    <option value="2">Cheque Direct</option>
                                  </select>
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_sort_default || 'Sort Default (Export)'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.exportbank_default">
                                    <option value="1">Document No. (F)</option>
                                    <option value="2">PL No.</option>
                                  </select>
                                </div>
                              </div>
                              <div class="col-md-6">
                                <div class="d-flex margin-t-25">
                                  <div class="form-check form-switch form-check-custom form-check-solid me-5">
                                    <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.holdwt" />
                                    <label class="form-check-label" v-text="'Hold W/T'"></label>
                                  </div>
                                  <div class="form-check form-switch form-check-custom form-check-solid me-5">
                                    <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.chqpost" />
                                    <label class="form-check-label" v-text="'Post Dated Cheque'"></label>
                                  </div>
                                  <div class="form-check form-switch form-check-custom form-check-solid me-5">
                                    <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.alert_msg" />
                                    <label class="form-check-label" v-text="'Alert Message'"></label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <!-- Transfer Bank : Row 2 -->
                            <div class="row">
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_save_text_f_bank || 'Save text File Bank'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.savebk_flag">
                                    <option value="Y">Automatic</option>
                                    <option value="N">Custom</option>
                                  </select>
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_timer || 'Timer'"></label>
                                  <div class="input-group input-group-sm">
                                    <number class="form-control input-sm" decimals="2" v-model="mainCompany.alert_time"></number>
                                    <span class="input-group-addon">minutes</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <!-- Transfer Bank : Row 3 -->
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_ref_name || 'Ref. Name'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.refname" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_ref_code || 'Ref. Code'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.refcode" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_ref_code2 || 'Ref. Code 2'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.refcode2" />
                                </div>
                              </div>
                            </div>
                            <!-- Transfer Bank : Row 4 -->
                            <div class="row">
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_ref_code3 || 'Ref. Code 3'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.refcode3" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label v-text="ui.erp_ref_code4 || 'Ref. Code 4'"></label>
                                  <input class="form-control input-sm" v-model="mainCompany.refcode4" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="box box-info" ref="boxWarehouse" v-show="(config.IC_WH_AUTO || 'N') == 'Y'">
                          <div class="box-header with-border">
                            <h4 class="box-title">Setup Default Warehouse (IC)</h4>
                            <div class="box-tools pull-right">
                              <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                            </div>
                          </div>
                          <div class="box-body">
                            <!-- Select : Warehouse (Construction) -->
                            <div class="row">
                              <div class="col-md-2">
                                <div class="d-flex">
                                  <div class="form-check form-switch form-check-custom form-check-solid me-5">
                                    <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.st_con_warehouse" />
                                    <label class="form-check-label" v-text="ui.erp_default_construction || 'Default Construction'"></label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <hr />
                            <!-- Template : Warehouse (Construction) -->
                            <template v-if="mainCompany.st_con_warehouse == 'Y'">
                              <div class="row">
                                <div class="col-md-3">
                                  <div class="form-group">
                                    <label v-text="ui.erp_warehouse || 'Warehouse Code'"></label> <span class="pull-right">{{(mainCompany.con_warehouse_code || '').length}} / 15</span>
                                    <input type="text" class="form-control input-sm" v-model="mainCompany.con_warehouse_code" maxlength="15" />
                                  </div>
                                </div>
                                <div class="col-md-5">
                                  <div class="form-group">
                                    <label v-text="ui.erp_warehoune_name || 'Warehouse Name'"></label> <span class="pull-right">{{(mainCompany.con_warehouse_name || '').length}} / 100</span>
                                    <input type="text" class="form-control input-sm" v-model="mainCompany.con_warehouse_name" maxlength="100" />
                                  </div>
                                </div>
                              </div>
                              <div class="row">
                                <div class="col-md-3">
                                  <div class="form-group">
                                    <label v-text="ui.erp_project_type_code || 'Project Type Code'"></label> <span class="pull-right">{{(mainCompany.con_typecode || '').length}} / 10</span>
                                    <input type="text" class="form-control input-sm" v-model="mainCompany.con_typecode" maxlength="10" />
                                  </div>
                                </div>
                                <div class="col-md-5">
                                  <div class="form-group">
                                    <label v-text="ui.erp_gro_type_pro || 'Project Type Name'"></label> <span class="pull-right">{{(mainCompany.con_typename || '').length}} / 100</span>
                                    <input type="text" class="form-control input-sm" v-model="mainCompany.con_typename" maxlength="100" />
                                  </div>
                                </div>
                              </div>
                              <div class="row">
                                <div class="col-md-3">
                                  <div class="form-group">
                                    <label v-text="ui.erp_asset_code || 'Project Area Code'"></label> <span class="pull-right">{{(mainCompany.con_loccode || '').length}} / 15</span>
                                    <input type="text" class="form-control input-sm" v-model="mainCompany.con_loccode" maxlength="15" />
                                  </div>
                                </div>
                                <div class="col-md-5">
                                  <div class="form-group">
                                    <label v-text="ui.erp_project_area_code || 'Project Area Name'"></label> <span class="pull-right">{{(mainCompany.con_locname || '').length}} / 500</span>
                                    <input type="text" class="form-control input-sm" v-model="mainCompany.con_locname" maxlength="500" />
                                  </div>
                                </div>
                              </div>
                              <hr />
                            </template>
                            <!-- Select : Warehouse (Trading) -->
                            <div class="row">
                              <div class="col-md-2">
                                <div class="d-flex">
                                  <div class="form-check form-switch form-check-custom form-check-solid me-5">
                                    <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.st_trading_warehouse" />
                                    <label class="form-check-label" v-text="ui.erp_default_trading || 'Default Trading'"></label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <hr />
                            <!-- Template : Warehouse (Trading) -->
                            <template v-if="mainCompany.st_trading_warehouse == 'Y'">
                              <div class="row">
                                <div class="col-md-3">
                                  <div class="form-group">
                                    <label v-text="ui.erp_warehouse || 'Warehouse Code'"></label> <span class="pull-right">{{(mainCompany.trading_warehouse_code || '').length}} / 15</span>
                                    <input type="text" class="form-control input-sm" v-model="mainCompany.trading_warehouse_code" maxlength="15" />
                                  </div>
                                </div>
                                <div class="col-md-5">
                                  <div class="form-group">
                                    <label v-text="ui.erp_warehoune_name || 'Warehouse Name'"></label> <span class="pull-right">{{(mainCompany.trading_warehouse_name || '').length}} / 100</span>
                                    <input type="text" class="form-control input-sm" v-model="mainCompany.trading_warehouse_name" maxlength="100" />
                                  </div>
                                </div>
                              </div>
                              <div class="row">
                                <div class="col-md-3">
                                  <div class="form-group">
                                    <label v-text="ui.erp_project_type_code || 'Project Type Code'"></label> <span class="pull-right">{{(mainCompany.trading_typecode || '').length}} / 10</span>
                                    <input type="text" class="form-control input-sm" v-model="mainCompany.trading_typecode" maxlength="10" />
                                  </div>
                                </div>
                                <div class="col-md-5">
                                  <div class="form-group">
                                    <label v-text="ui.erp_gro_type_pro|| 'Project Type Name'"></label> <span class="pull-right">{{(mainCompany.trading_typename || '').length}} / 100</span>
                                    <input type="text" class="form-control input-sm" v-model="mainCompany.trading_typename" maxlength="100" />
                                  </div>
                                </div>
                              </div>
                              <div class="row">
                                <div class="col-md-3">
                                  <div class="form-group">
                                    <label v-text="ui.erp_asset_code || 'Project Area Code'"></label> <span class="pull-right">{{(mainCompany.trading_loccode || '').length}} / 15</span>
                                    <input type="text" class="form-control input-sm" v-model="mainCompany.trading_loccode" maxlength="15" />
                                  </div>
                                </div>
                                <div class="col-md-5">
                                  <div class="form-group">
                                    <label v-text="ui.letter_project || 'Project Area Name'"></label> <span class="pull-right">{{(mainCompany.trading_locname || '').length}} / 500</span>
                                    <input type="text" class="form-control input-sm" v-model="mainCompany.trading_locname" maxlength="500" />
                                  </div>
                                </div>
                              </div>
                              <hr />
                            </template>
                          </div>
                        </div>
                      </div>
                      <!-- Company : Panel Right -->
                      <div class="col-md-4">
                        <!-- Company Right : Attach File -->
                        <div class="box box-warning" ref="boxAttach">
                          <div class="box-header with-border">
                            <h4 class="box-title">Logo Company</h4>
                            <div class="box-tools pull-right">
                              <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                            </div>
                          </div>
                          <div class="box-body">
                            <table style="width:100%">
                              <tbody>
                                <tr>
                                  <td align="center">
                                    <img :src="showPictures('company')" class="img-responsive" v-if="!xt.isEmpty(mainCompany.dirpic_logo)" height="500" />
                                    <input type="file" ref="File" accept="image/*" style="display:none" />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <!-- Company Right : Logo ISO (27-05-2024) (CSM-20240500440) -->
                        <div class="box box-warning" ref="boxLogoISO">
                          <div class="box-header with-border">
                            <h4 class="box-title">Logo ISO</h4>
                            <div class="box-tools pull-right">
                              <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                            </div>
                          </div>
                          <div class="box-body">
                            <table style="width:100%">
                              <tbody>
                                <tr>
                                  <td align="center">
                                    <img :src="showPictures('iso')" class="img-responsive" v-if="!xt.isEmpty(mainCompany.dirpic_logo_iso)" height="500" />
                                    <input type="file" ref="File2" accept="image/*" style="display:none" />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <!-- Company Right : Email Settings -->
                        <div class="box box-warning" ref="boxEmail">
                          <div class="box-header with-border">
                            <h4 class="box-title">Setup E-mail</h4>
                            <div class="box-tools pull-right">
                              <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                            </div>
                          </div>
                          <div class="box-body">
                            <!-- Company Right : Row 1 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label class="text-blue" v-text="ui.erp_email || 'Default Send Email'"></label>&nbsp;
                                  <p-check class="p-icon p-curve p-smooth" color="primary" true-value="Y" false-value="N" v-model="mainCompany.auto_email">
                                    <i class="icon mdi mdi-check" slot="extra"></i>
                                    Auto Email
                                  </p-check>
                                </div>
                              </div>
                            </div>
                            <!-- Company Right : Row 2 -->
                            <div class="row">
                              <div class="col-md-9">
                                <div class="form-group">
                                  <label>SMTP</label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.email_smtp" />
                                </div>
                              </div>
                              <div class="col-md-3">
                                <div class="form-group">
                                  <label>Port (Email)</label>
                                  <input type="text" class="form-control input-sm input-center" v-model="mainCompany.email_port" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Right : Row 3 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <p-check class="p-icon p-curve p-smooth" color="primary" true-value="Y" false-value="N" v-model="mainCompany.email_smtp_user">
                                    <i class="icon mdi mdi-check" slot="extra"></i>
                                    Requires User ID/Password
                                  </p-check>
                                  <p-check class="p-icon p-curve p-smooth" color="primary" true-value="Y" false-value="N" v-model="mainCompany.email_smtp_tls">
                                    <i class="icon mdi mdi-check" slot="extra"></i>
                                    Requires TLS Encryption
                                  </p-check>
                                </div>
                              </div>
                            </div>
                            <!-- Company Right : Row 4 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label>Link Web</label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.toweb" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Right : Row 5 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label>Email</label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.email" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Right : Row 6 -->
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label>User (Email)</label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.usermail" />
                                </div>
                              </div>
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.change_password || 'Password (Email)'"></label>
                                  <input type="password" class="form-control input-sm" v-model="mainCompany.passemail" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Right : Row 7 -->
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_db_user || 'DB User'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.dbuser" />
                                </div>
                              </div>
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_db_password || 'DB Password'"></label>
                                  <input type="password" class="form-control input-sm" v-model="mainCompany.dbpass" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Right : Row 8 -->
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label>DB DSN</label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.dbdsn" />
                                </div>
                              </div>
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label v-text="ui.erp_db_server_name || 'DB Server Name'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.dbeng" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Right : Row 9 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label v-text="ui.erp_database_name || 'Database Name'"></label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.dbdbn" />
                                </div>
                              </div>
                            </div>
                            <!-- Company Right : Row 10 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label v-text="ui.erp_email || 'Email System'"></label>
                                  <select class="form-control input-sm" v-model="mainCompany.email_system">
                                    <option value="SMTP">SMTP</option>
                                    <option value="TAXI">Taxi Mail</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <!-- Company Right : Row 11 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label>Email (Taxi)</label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.email_taxi" maxlength="200" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- Oauth : Allkons -->
                        <div class="box box-warning">
                          <div class="box-header with-border">
                            <h4 class="box-title padding-t-5">Allkons ID OAuth</h4>
                          </div>
                          <div class="box-body">
                            <!-- Oauth : Row 1 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label>Client ID</label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.oauth_id" maxlength="1000" />
                                </div>
                              </div>
                            </div>
                            <!-- Oauth : Row 2 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label>Client Secret</label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.oauth_pass" maxlength="2000" />
                                </div>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-md-12">
                                <div class="pull-right">
                                  <button class="btn btn-sm" style="background-color: orange; color: white;" @click.prevent="checkOauth">Check Oauth</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- Company Right : Payzave Setting -->
                        <div class="box box-warning">
                          <div class="box-header with-border">
                            <h4 class="box-title padding-t-5">Payzave</h4>
                          </div>
                          <div class="box-body">
                            <!-- Payzave : Row 1 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label>Secret Key</label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.payzave_secret_key" placeholder="secret key จาก payzave" maxlength="200" />
                                </div>
                              </div>
                            </div>
                            <!-- Payzave : Row 2 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label>URL</label>
                                  <input type="text" class="form-control input-sm" v-model="mainCompany.payzave_url" placeholder="ไม่ต้องใส่ http" maxlength="200" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- Company Right : Company Due Date -->
                        <div class="box box-warning">
                          <div class="box-body">
                            <!-- Company Right : Row 1 -->
                            <div class="row">
                              <div class="box-header with-border">
                                <h4 class="box-title padding-t-5">Company Due Date</h4>
                                <div class="pull-right">
                                  <button class="btn btn-sm bg-navy" @click.prevent="appendRow('due')"><i class="fas fa-plus"></i> <span v-text="ui.add_detail || 'เพิ่มรายการ'"></span></button>
                                </div>
                              </div>
                              <div class="col-md-12">
                                <table-stick-2 :cellpad="14" :scale="500" class="margin-t-5">
                                  <table class="table table-striped table-bordered table-hover">
                                    <thead>
                                      <tr>
                                        <th class="tf-2">Action</th>
                                        <th class="tf-2-5">No.</th>
                                        <th class="tf-3">Date (DD)</th>
                                        <th>Description</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr v-for="(x,idx) in dueDate">
                                        <td align="center">
                                          <a href="#" class="text-danger" @click.prevent="xt.removeRow(dueDate,idx,'item')">
                                            <v-icon name="trash-2" class="v-icon-width"></v-icon>
                                          </a>
                                        </td>
                                        <td align="center">{{x.item}}.</td>
                                        <td><input type="text" class="form-control table text-center" v-model="x.itemno" /></td>
                                        <td><input type="text" class="form-control table" v-model="x.due_description" /></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </table-stick-2>
                              </div>
                            </div>
                            <hr>
                            <!-- Company Right : Row 2 -->
                            <div class="row" v-if="(config.EBILL_DATETERM || 'N') == 'Y'">
                              <div class="box-header with-border">
                                <h4 class="box-title padding-t-5">Company Billing Date</h4>
                                <div class="pull-right">
                                  <button class="btn btn-sm bg-navy" @click.prevent="appendRow('billing')"><i class="fas fa-plus"></i> <span v-text="ui.add_detail || 'เพิ่มรายการ'"></span></button>
                                </div>
                              </div>
                              <div class="col-md-12">
                                <table-stick-2 :cellpad="14" :scale="500" class="margin-t-5">
                                  <table class="table table-striped table-bordered table-hover">
                                    <thead>
                                      <tr>
                                        <th class="tf-2">Action</th>
                                        <th class="tf-2-5">Type</th>
                                        <th class="tf-2">Date (DD)</th>
                                        <th class="tf-2">Date (DD)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr v-for="(x,idx) in BillingdueDate">
                                        <td align="center">
                                          <a href="#" class="text-danger" @click.prevent="xt.removeRow(BillingdueDate,idx,'item')">
                                            <v-icon name="trash-2" class="v-icon-width"></v-icon>
                                          </a>
                                        </td>
                                        <td align="center">
                                          <select class="form-control input-sm table" v-model="x.chqtype">
                                            <option value="P">PO</option>
                                            <option value="W">WO</option>
                                          </select>
                                        </td>
                                        <td><i-input input-class="form-control table" v-model="x.start_date" :number-only="true"></i-input></td>
                                        <td><i-input input-class="form-control table" v-model="x.end_date" :number-only="true"></i-input></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </table-stick-2>
                              </div>
                            </div>
                            <hr>
                            <!-- Company Right : Row 3 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label v-text="ui.erp_regulations || 'Regulations (Billing)'"></label>
                                  <span v-if="!xt.isEmpty(mainCompany.regulations_billing_attach)"> <a href="#" @click.prevent="downloadFile('bill')"><img :src="`${baseUrl}Content/Images/Icon SVG/pdf.svg`" width="20" height="20" /></a></span>
                                  <textarea class="form-control input-sm" v-model="mainCompany.regulations_billing" rows="6"></textarea>
                                </div>
                              </div>
                            </div>
                            <!-- Company Right : Row 4 -->
                            <div class="row">
                              <div class="col-md-12">
                                <div class="form-group">
                                  <label v-text="ui.erp_regulations_ch || 'Regulations (Cheque)'"></label>
                                  <span v-if="!xt.isEmpty(mainCompany.regulations_cheque_attach)"> <a href="#" @click.prevent="downloadFile('chq')"><img :src="`${baseUrl}Content/Images/Icon SVG/pdf.svg`" width="20" height="20" /></a></span>
                                  <textarea class="form-control input-sm" v-model="mainCompany.regulations_cheque" rows="6"></textarea>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Tab : Company Config -->
              <div class="tab-pane" v-bind:class="{'active': headerTabSelected == 'header_tab2'}">
                <div class="padding-detail">
                  <table-stick-2 :cellpad="14" :scale="240">
                    <table class="table table-striped table-bordered table-hover">
                      <thead>
                        <tr>
                          <th class="tf-2-5">ลำดับที่</th>
                          <th>รายการตั้งค่า</th>
                          <th class="tf-3">ใช้งาน</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td align="center">1.</td>
                          <td>รูปแบบสรรพกร</td>
                          <td align="center">
                            <div class="form-check form-check-custom form-check-solid form-switch form-switch-sm form-swtich-center">
                              <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.rdtype" />
                              <label class="form-check-label"></label>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center">2.</td>
                          <td>Web Real Estate</td>
                          <td align="center">
                            <div class="form-check form-check-custom form-check-solid form-switch form-switch-sm form-swtich-center">
                              <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.web_re" />
                              <label class="form-check-label"></label>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center">3.</td>
                          <td>Company Plugin</td>
                          <td align="center">
                            <div class="form-check form-check-custom form-check-solid form-switch form-switch-sm form-swtich-center">
                              <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.company_pugin" />
                              <label class="form-check-label"></label>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center">4.</td>
                          <td>PR/MR Use BOQ QTY Only</td>
                          <td align="center">
                            <div class="form-check form-check-custom form-check-solid form-switch form-switch-sm form-swtich-center">
                              <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.prboqqty" />
                              <label class="form-check-label"></label>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center">5.</td>
                          <td>Copy Master to Company (Costcode,Material,Referent by)</td>
                          <td align="center">
                            <div class="form-check form-check-custom form-check-solid form-switch form-switch-sm form-swtich-center">
                              <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.mascopy" />
                              <label class="form-check-label"></label>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center">6.</td>
                          <td>Form Show ISO</td>
                          <td align="center">
                            <div class="form-check form-check-custom form-check-solid form-switch form-switch-sm form-swtich-center">
                              <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.show_iso" />
                              <label class="form-check-label"></label>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center">7.</td>
                          <td>PR/MR Use BOQ Amount Only</td>
                          <td align="center">
                            <div class="form-check form-check-custom form-check-solid form-switch form-switch-sm form-swtich-center">
                              <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.prboq" />
                              <label class="form-check-label"></label>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center">8.</td>
                          <td>Forecast Progress Payment of WO</td>
                          <td align="center">
                            <div class="form-check form-check-custom form-check-solid form-switch form-switch-sm form-swtich-center">
                              <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="mainCompany.wobill_plan" />
                              <label class="form-check-label"></label>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </table-stick-2>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    <!-- </page> -->
    </re-page>

    <!-- Modal : Template Import Data -->
    <!-- <import-data ref="importData" @send-import="onImport($event)" :clear-input="()=> importForm = {}" :default-input="defaultImport">
      <template #body-import>
        <div class="row">
          <div class="col-md-2">
            <div class="form-group">
              <label v-text="ui.erp_account_code || 'Account Code'"></label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['datacode']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label v-text="ui.erp_item_no || 'Item No.'"></label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['itemno']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label v-text="ui.erp_data_type_p || 'Data Type'"></label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['datatype']" maxlength="2" />
            </div>
          </div>
        </div>
      </template>
    </import-data> -->

    <!-- Modal : Center -->
    <vue-company-list ref="company" @send-data="addInfoComponent($event, 'company')"></vue-company-list>
  </div>
</template>

<script type="text/javascript">
  import "@mdi/font/css/materialdesignicons.css";
  import { mapState, mapGetters } from 'vuex'
//   import vueAttachFile from '../../Component/file-attach.vue'
  import { Splitpanes, Pane } from 'splitpanes'
  import 'splitpanes/dist/splitpanes.css'
  import { forEach } from 'mathjs'

  let page = {}
  export default {
    components: {
      Splitpanes,
    //   attachFile: vueAttachFile,
      Pane
    },
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        xt: $xt,
        auth: window.auth,
        headerTab: [
          { id: 'header_tab1', icon: 'fa-info-circle', text: 'Information', show: true, total: 0 },
          { id: 'header_tab2', icon: 'fa-tools', text: 'Setup', show: true, total: 0 }
        ],
        headerTabSelected: null,
        search: {
          text: '',
          field: 'datatype',
        },
        /* Variables : Company */
        searchCompany: {},
        // noProcess: [],
        // displayNoProcess: [],
        dueDate: [],
        BillingdueDate: [],
        company: [],
        maincode: '',
        mainname: '',
        mainCompany: {},
        /* Variables : Other */
        editCompany: false,
        /* Variables : Center */
        maincomp: [],
        currency: [],
        // parentcompany: [],
        /* Import Not Process */
        importForm: {},
        /* Copy initial data for compare change*/
        dumpData: {
          data: [],
          dueDate: [],
          billing: []
        },
        servicePath: "",
        MangoToken: "",
        typeKey: "",
        ref_cus_code: "",
      }
    },
    methods: {
      clickTabSelected(x, keyword) {
        switch (keyword) {
          case 'header':
            this.headerTabSelected = x.id
            break
        }
      },
      // async parentcompanyList() {
      //   const formData = {
      //     form:
      //     {
      //         ServicePath: this.servicePath ?? "",
      //         ServiceEvent: "Company",
      //         ServiceName: "ParentcompanyList",
      //         MangoToken: this.MangoToken
      //     },
      //   };

      //   let url = "CSM/Gateway/Dispath";
      //   let respNew = await $xt.postServerJson(url, formData);
      //   let data = respNew?.data?.Data || {};
          
      //   this.parentcompany = $linq(data.data).where(w => !$xt.isEmpty(this.mainCompany.maincode) ? w.maincode != this.mainCompany.maincode : true).toArray()
      // },
      async loadDefault() {
        await this.resetCompany()

        // Load Token from URL
        await this.onLoadToken()

        // Not Have maincode Open select company from modal
        this.$refs.company.openModal({
          servicePath: this.servicePath,
        })
      },
      async onLoginGateway() {
        const formData = {
            form:
            {
                ServicePath: this.servicePath ?? "",
                ServiceEvent: "Login",
                ServiceName: "LoginGateWay",
                Query: { is_api: "N" },
                maincode: this.maincode,
            },
        };

        let url = "CSM/Gateway/GateWayLogin";
        let resp = await $xt.postServerJson(url, formData);

        let data = resp?.data?.data || [];
        this.$set(this, 'MangoToken', data)
      },
      async onLoadToken() {
        const token = this.$route.query.token;
        if (!token || Array.isArray(token)) return;

        const typeKey = this.$route.query.type;
        if (!typeKey || Array.isArray(typeKey)) return;

        this.$set(this, "typeKey", typeKey);

        const ref_cus_code = this.$route.query.ref_cus_code;
        if (!ref_cus_code || Array.isArray(ref_cus_code)) return;
        this.$set(this, "ref_cus_code", ref_cus_code);

        const kLocal = `svc:${token}`;
        const kSession = `svc:${token}`;

        // 1) ถ้ามีใน sessionStorage อยู่แล้ว (เคยโหลดไปแล้ว/รีเฟรช) => ใช้ต่อได้เลย
        let raw = sessionStorage.getItem(kSession);
        if (!raw) {
            // 2) ยังไม่เคยโหลดในแท็บนี้: ลองอ่านจาก localStorage
            raw = localStorage.getItem(kLocal);
            if (raw) {
                try {
                    // const obj = JSON.parse(raw);
                    // const fresh = Date.now() - (obj.t || 0) <= (obj.ttl || 5 * 60 * 1000);
                    // if (!fresh) {
                    //     // หมดอายุ: ลบทิ้งทั้งสองที่แล้วจบ
                    //     localStorage.removeItem(kLocal);
                    //     sessionStorage.removeItem(kSession);
                    //     return;
                    // }

                    // 2.1 ย้ายเข้า sessionStorage (คงอยู่ขณะรีเฟรช, หายเมื่อปิดแท็บ)
                    sessionStorage.setItem(kSession, raw);
                    // 2.2 ลบจาก localStorage เพื่อไม่ให้แท็บอื่นมาใช้/ซ้ำ
                    localStorage.removeItem(kLocal);
                } catch (e) {
                    // JSON เพี้ยน: ลบเพื่อความสะอาด
                    localStorage.removeItem(kLocal);
                    return;
                }
            } else {
                // ไม่พบทั้ง session/local => ไม่มีค่าให้ใช้
                return;
            }
        }

        // 3) อ่านค่าจาก sessionStorage (หลังย้ายแล้วหรืออยู่เดิม)
        try {
            const obj2 = JSON.parse(sessionStorage.getItem(kSession));
            // const fresh2 = Date.now() - (obj2.t || 0) <= (obj2.ttl || 5 * 60 * 1000);
            // if (!fresh2) {
            //     sessionStorage.removeItem(kSession);
            //     return;
            // }
            
            // set ค่าให้ component (Vue 2 ใช้ this.$set)
            this.$set(this, "servicePath", obj2.ServicePath || "");
        } catch {
            sessionStorage.removeItem(kSession);
        }
      },
      async readCompany() {
        page.loadingBox.show()
        try {
          const formData = {
            form:
            {
                ServicePath: this.servicePath ?? "",
                ServiceEvent: "Company",
                ServiceName: "CompanyRead",
                Query: {maincode: this.maincode},
                MangoToken: this.MangoToken,
                typeKey: this.typeKey,
                ref_cus_code: this.ref_cus_code,
            },

          };

          let url = "CSM/Gateway/Dispath";
          let resp = await $xt.postServerJson(url, formData);
          if (!resp.success) { 
            throw resp.error;
          }
          
          let response = resp?.data || {};
              
          this.mainCompany = response.header

          this.dumpData.data = JSON.parse(JSON.stringify(response.header))

          let i = 1
          response.dueDate.forEach(f => { f.item = i++ })
          this.dueDate = response.dueDate
          this.dumpData.dueDate = JSON.parse(JSON.stringify(response.dueDate))
          this.BillingdueDate = response.billingDate
          this.dumpData.billing = JSON.parse(JSON.stringify(response.billingDate))

          this.editCompany = true

          // await this.loadNoProcess()
          // await this.parentcompanyList()

          if (this.$refs.companyModal) this.$refs.companyModal.closeModal()
        }
        catch (ex) {
          $msg.alert('System Error', ex, 'danger')
        }
        finally {
          page.loadingBox.hide()
        }
      },
      async confirmResetCompany() {
        if (!(await $msg.confirm('คุณต้องการทำรายการใหม่ใช่หรือไม่ โปรดยืนยันการทำรายการ'))) return
        this.resetCompany()
      },
      async resetCompany() {
        this.editCompany = false
        this.clickTabSelected({ id: 'header_tab1' }, 'header')
        this.$set(this, 'mainCompany', {
          show: 'Y',
          glretap: 1,
          glretar: 1,
          vatper: 0,
          poconf: 'N',
          adsconf: 'N',
          rdtype: 'N',
          mascopy: 'N',
          iccost: 2,
          acvat: 'Y',
          email_port: 25,
          email_smtp_user: 'N',
          email_smtp_tls: 'N',
          paytype_default: 'B',
          savebk_flag: 'Y',
          chqpost: 'N',
          ac_code_exp_proj: 'N',
          alert_msg: 'N',
          alert_time: 0,
          wobill_plan: 'N',
          company_pugin: 'N',
          lock_po_wo: 'N',
          lock_wo_po: 'N',
          holdwt: 'N',
          iccost_type: '1',
          iccost_amount: 'Y',
          exportbank_default: '2'
        })

        // this.noProcess = []
        // this.displayNoProcess = []
        this.dueDate = []
        this.BillingdueDate = []

        // this.parentcompanyList()
      },
      async loadCurrency() {
        try {
          const formData = {
            form:
            {
                ServicePath: this.servicePath ?? "",
                ServiceEvent: "Company",
                ServiceName: "Currency",
                MangoToken: this.MangoToken,
                typeKey: this.typeKey,
                ref_cus_code: this.ref_cus_code,
            },
          
          };
          let url = "CSM/Gateway/Dispath";
          let respNew = await $xt.postServerJson(url, formData);
          let response = respNew?.data || {};
        
          this.$set(this, 'currency', response.data)
        
        } catch { }
      },
      showPictures(select = 'company') {
        let path = select == 'company' ? (this.mainCompany.dirpic_logo || '') : (this.mainCompany.dirpic_logo_iso || '')
        return this.servicePath + '/Api/File/DownLoad?id=' + path
      },
      async saveCompany() {
        if (this.mainCompany.vatper >= 100) {
          $msg.alert(`Warning`, `จำนวน VAT ห้ามเกิน 100`, `warning`)
          return
        }

        if (this.mainCompany.group_h == 'Y') {
          this.$set(this.mainCompany, 'group_code', '')
        }

        try {
          let f = {
            data: this.mainCompany,
            dueDate: this.dueDate,
            billing: this.BillingdueDate,
          }
          
          let changedData = $xt.compareObject(this.dumpData, f)
          let payload = {
            type: this.editCompany ? "updated" : "created",
            setup_company: changedData
          }

          page.loadingBox.show()

          // ===== CROSS SERVICE =====
          const formData = {
            form:
            {
                ServicePath: this.servicePath ?? "",
                ServiceEvent: "Company",
                ServiceName: this.editCompany ? "UpdateCompany" : "CreateCompany",
                MangoToken: this.MangoToken,
                payload: f,
                Log: payload,
                maincode: this.maincode,
                mainname: this.mainname,
                typeKey: this.typeKey,
                ref_cus_code: this.ref_cus_code,
            },
          };

          let url = "CSM/Gateway/Dispath";
          let resp = await $xt.postServerJson(url, formData);
          if (!resp.success) {
            throw resp.error
          }

          $notify.success(this.ui.alert_save_success)
          this.resetCompany()
        }
        catch (ex) {
          $msg.alert('System Error', ex, 'danger')
        }
        finally {
          page.loadingBox.hide()
        }
      },
      getFileExt(f) {
        return f?.split('.').pop().toLowerCase()
      },
      downloadFile(x) {
        if (x == 'bill') {
          let pathto = this.mainCompany.regulations_billing_attach
          let fileTarget = window.hostServer + "Api/File/DownLoad?id=" + pathto
          window.open(fileTarget, "_blank")
        } else if (x == 'chq') {
          let pathto = this.mainCompany.regulations_cheque_attach
          let fileTarget = window.hostServer + "Api/File/DownLoad?id=" + pathto
          window.open(fileTarget, "_blank")
        }
      },
      /* Method : Not Process */
      // async loadNoProcess() {
      //   try {
      //     this.search = {
      //       text: '',
      //       field: 'datatype',
      //     }

      //     const formData = {
      //       form:
      //       {
      //           ServicePath: this.servicePath ?? "",
      //           ServiceEvent: "Company",
      //           ServiceName: "NoProcessReadList",
      //           QueryString: {maincode: this.mainCompany.maincode},//`?maincode=${this.mainCompany.maincode}`,
      //           MangoToken: this.MangoToken
      //       },

      //     };

      //     let url = "CSM/Gateway/Dispath";
      //     let respNew = await $xt.postServerJson(url, formData);
      //     let data = respNew?.data?.Data || {};

      //     $linq(data.data).foreach(x => { x.isEdit = true })
      //     this.noProcess = data.data

      //     this.searchNoProcess()
      //   }
      //   catch (ex) {
      //     $msg.alert('System Error', ex, 'danger')
      //   }
      // },
      // searchNoProcess() {
      //   let text = this.search.text?.trim()?.toLowerCase()
      //   let field = this.search.field
      //   if (!$xt.isEmpty(text)) {
      //     this.displayNoProcess = $linq(this.noProcess).where(w => w[field]?.toLowerCase().includes(text) || $xt.isEmpty(w.datacode)).toArray()
      //   }
      //   else {
      //     this.$set(this, 'displayNoProcess', this.noProcess)
      //   }
      // },
      appendRow(keyword) {
        switch (keyword) {
          case 'due':
            let itemno = this.dueDate.length + 1 || 1
            this.dueDate.push({
              item: itemno++
            })
            break
          case 'billing':
            let i = this.BillingdueDate.length + 1 || 1
            this.BillingdueDate.push({
              itemno: 0,
              duedate: new Date
            })
            break
        }
      },
      // modalClick(x, keyword) {
      //   switch (keyword) {
      //     case 'account':
      //       this.$refs.account.openModal()
      //       break
      //   }
      //   this.onTable = x
      // },
      async addInfoComponent(e, keyword) {
        switch (keyword) {
          case 'company':
            this.$set(this, 'maincode', e.maincode)
            this.$set(this, 'mainname', e.mainname)
            await this.onLoginGateway()
            await this.readCompany()
            await this.loadCurrency()
            break

          case 'account':
            this.$set(this.onTable, 'datacode', e.ac_code)
            this.$set(this.onTable, 'dataname', e.ac_des)
            break
        }
      },
      autoChangeAddress(keyword, control = '1') {
        switch (keyword) {
          case 'TH':
            let mainadr1 = ''
            let mainadr2 = ''

            let action = (key) => {
              let value = ''
              key.forEach((f, idx) => {
                if (!$xt.isEmpty(this.mainCompany[f])) {
                  value += idx == 0 ? this.mainCompany[f] : ' ' + this.mainCompany[f]
                }
              })
              return value
            }

            if (control == '1') {
              let key_addr1 = ['building_th', 'room_th', 'floor_th', 'village_th', 'unit_no_th', 'm_no', 'junction_th', 'road_th']
              mainadr1 = action(key_addr1)

              this.$set(this.mainCompany, 'mainadr1', mainadr1)
            }
            else if (control == '2') {
              let key_addr2 = ['sub_district_th', 'district_th', 'province_th', 'mainpost']
              mainadr2 = action(key_addr2)

              this.$set(this.mainCompany, 'mainadr2', mainadr2)
            }
            break

          case 'EN':
            let engaddr1 = ''
            let engaddr2 = ''

            let action1 = (key) => {
              let value = ''
              key.forEach((f, idx) => {
                if (!$xt.isEmpty(this.mainCompany[f])) {
                  value += idx == 0 ? this.mainCompany[f] : ' ' + this.mainCompany[f]
                }
              })
              return value
            }

            let key_en_addr1 = ['building_en', 'room_en', 'floor_en', 'village_en', 'junction_en', 'road_en']
            engaddr1 = action1(key_en_addr1)

            let key_en_addr2 = ['sub_district_en', 'district_en', 'province_en', 'mainpost']
            engaddr2 = action1(key_en_addr2)

            this.$set(this.mainCompany, 'engaddr1', engaddr1)
            this.$set(this.mainCompany, 'engaddr2', engaddr2)
            break
        }
      },
      onSelected(address, control = '1') {
        this.mainCompany.sub_district_th = address?.subdistrict
        this.mainCompany.district_th = address?.district
        this.mainCompany.province_th = address?.province

        this.autoChangeAddress('TH', control)
      },
      checkOauth() {
        this.ValidateAccessKeyAllkons()
      },
      async ValidateAccessKeyAllkons() {
        page.loadingBox.show()
        try {
          const formData = {
              form:
              {
                  ServicePath: this.servicePath ?? "",
                  ServiceEvent: "Company",
                  ServiceName: "ValidateAccessKeyAllkons",
                  MangoToken: this.MangoToken,
                  typeKey: this.typeKey,
                  ref_cus_code: this.ref_cus_code,
                  Query: {
                      maincode: this.maincode,
                      oauth_id: this.mainCompany.oauth_id,
                      oauth_pass: this.mainCompany.oauth_pass
                  }
              },
          };
          
          let act =  `CSM/Gateway/Dispath`
          let resp = await $xt.postServerJson(act, formData)
          let response = resp?.data || {};
          
          if (response?.data?.Status == false || response?.data == null) {
            await $msg.alert(`คำเตือน`, `ไม่สามารถใช้ Allkons ได้ เนื่องจาก Client ID & Client Secret ไม่ตรง`, `warning`)
          }
          else {
            await $msg.alert(`ทำรายการเสร็จสิ้น`, `Allkons Client ID & Client Secret ตรงเปิดใช้งาน`, `success`)
          }
        }
        catch (ex) {
          $msg.alert('เกิดข้อผิดพลาด', ex, 'danger')
        }
        finally {
          page.loadingBox.hide()
        }
      },
    },
    computed: {
      ...mapState(['config'])
    },
    beforeMount() {
      this.$nextTick(() => {
        $(window).resize(() => { $(this.$refs.contentPanel).css({ 'max-height': $(window).height() - 250 + 'px' }) })
        $(window).trigger('resize')
      })
    },
    async mounted() {
      
      page = this.$refs.page
      page.pageTitle = 'Master : Setup Company'
      document.title = page.pageTitle

      $(this.$refs.boxTransfer).boxWidget()
      $(this.$refs.boxWarehouse).boxWidget()
      $(this.$refs.boxAttach).boxWidget()
      $(this.$refs.boxEmail).boxWidget()

      page.loadingBox.show()
      await this.$store.dispatch('findCodeConfig')
      // await this.loadCurrency()
      await this.loadDefault()
      page.loadingBox.hide()
    }
  }
</script>

<style scoped>
  fieldset.scheduler-border {
    border: 1px groove #ddd !important;
    padding: 0 1.4em 1.4em 1.4em !important;
    margin: 0 0 1.5em 0 !important;
    -webkit-box-shadow: 0px 0px 0px 0px #000;
    box-shadow: 0px 0px 0px 0px #000;
  }

  legend.scheduler-border {
    font-size: 1.2em !important;
    font-weight: bold !important;
    text-align: left !important;
    width: auto;
    padding: 0 10px;
    border-bottom: none;
  }
</style>
