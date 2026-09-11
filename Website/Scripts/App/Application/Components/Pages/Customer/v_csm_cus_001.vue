<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-widget">
          <div class="box-body">
            <!-- Customer List -->
            <div class="row" v-show="show_panel===0">
              <div class="col-md-12">
                <!-- Search Panel , New Customer -->
                <div class="row">
                  <div class="col-md-4 col-sm-6 col-xs-6">
                    <div class="form-group">
                      <label v-text="ui.re_search_text ||'Search Text'"></label>
                      <div class="input-group">
                        <input type="text" class="form-control" placeholder="Keyword : Code / Name / Tel" v-model.trim="search.text" @keypress.enter="loadData(),loadOldCust()" />
                        <span class="input-group-btn">
                          <button class="btn btn-default" @click="loadData(),loadOldCust()"><i class="fa fa-search"></i></button>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-8 col-sm-6 col-xs-6">
                    <div class="pull-right" style="margin-top:30px;" v-show="!is_mango()">
                      <button class="btn btn-sm btn-success" @click.prevent="newClick()"><i class="fa fa-plus"></i> <span v-text="ui.re_newcustomers || 'New Customer'"></span></button>
                    </div>
                  </div>
                </div>
                <div class="nav-tabs-custom">
                  <ul class="nav nav-tabs">
                    <li v-bind:class="{active:tabActive===3}"><a href="#" @click.prevent="onTabChange(3),loadData()">ลูกค้าใหม่ ({{customerTotal || 0}})</a></li>
                    <li v-bind:class="{active:tabActive===4}"><a href="#" @click.prevent="onTabChange(4),loadOldCust()">ลูกค้าเก่า ({{oldCustTotal || 0}})</a></li>
                  </ul>
                  <div class="tab-content">
                    <!-- New Customer List-->
                    <div class="tab-pane" v-bind:class="{active:tabActive===3}">
                      <div class="row">
                        <div class="col-sm-12">
                          <ag-table ref="agr_new"
                            :footer="false"
                            @ready="initTableNew()"
                            :saveColumns="'Y'"
                            :doctype="'VIEW'"
                            :page_name="'v_csm_cus_001_new'">
                          </ag-table>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-lg-12 col-md-12" style="margin-top:8px;">
                          <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page, 'CustomerList')"></pagination>
                        </div>
                      </div>
                    </div>
                    <!-- Old Customer List-->
                    <div class="tab-pane" v-bind:class="{active:tabActive===4}">
                      <div class="row">
                        <div class="col-sm-12">
                          <ag-table ref="agr_old"
                            :footer="false"
                            @ready="initTableOld()"
                            :saveColumns="'Y'"
                            :doctype="'VIEW'"
                            :page_name="'v_csm_cus_001_old'">
                          </ag-table>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-lg-12 col-md-12" style="margin-top:8px;">
                          <pagination class="pull-left" ref="paging2" @page-change="pageChange($event.page, 'OldCustList')"></pagination>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <!-- Form Main Data -->
            <div class="nav-tabs-custom" v-show="show_panel===1">
              <ul class="nav nav-tabs">
                <li :class="{active:tabActive===0}"><a href="#" @click.prevent="onTabChange(0)" v-show="!oldCust">Information</a></li>
                <li :class="{active:tabActive===5}"><a href="#" @click.prevent="onTabChange(5)" v-show="oldCust">Information</a></li>
                <li :class="{active:tabActive===1}">
                  <a href="#" @click.prevent="onTabChange(1)">
                    {{ui.re_mobile_phone || 'Mobile No.'}}
                  </a>
                </li>
                <li :class="{ active:tabActive === 2 }">
                  <a href="#" @click.prevent="onTabChange(2)">
                    {{ui.re_contect_person || 'Contact Person (Corporation)'}}
                  </a>
                </li>
              </ul>
              <div class="tab-content">
                <!-- Tab1 : New Cust Information -->
                <div class="tab-pane" v-bind:class="{active:tabActive===0}">
                  <fieldset>

                    <!-- Section: Identity -->
                    <div class="cus-section">
                      <div class="cus-section-header cus-header-blue">
                        <i class="fas fa-id-card"></i> {{ ui.re_identity || 'Identity' }}
                      </div>
                      <div class="cus-section-body">
                        <div class="row">
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.cust_code || 'Customer Code' }}</label>
                              <input type="text" class="form-control input-sm cus-readonly" readonly v-model.trim="form.customer_code">
                            </div>
                          </div>
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_persontype || 'Person Type' }}</label>
                              <select class="form-control input-sm" v-model="form.legal_person">
                                <option value="N">บุคคลธรรมดา</option>
                                <option value="Y">นิติบุคคล</option>
                              </select> 
                            </div>
                          </div>
                        </div>
                        <div class="cus-divider">ชื่อ (ภาษาไทย)</div>
                        <div class="row">
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_nametitle || 'Title' }}</label>
                              <input type="text" class="form-control input-sm" list="title_th" v-model="form.title_name" maxlength="250">
                              <datalist id="title_th">
                                <option>นาย</option><option>นางสาว</option><option>นาง</option><option>บริษัท</option>
                              </datalist>
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label cus-required">{{ ui.re_firstname || 'Firstname' }}</label>
                              <input type="text" class="form-control input-sm" v-model="form.first_name" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_lastname || 'Lastname' }}</label>
                              <input type="text" class="form-control input-sm" v-model="form.last_name" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_nickname || 'Nickname' }}</label>
                              <input type="text" class="form-control input-sm" v-model="form.nickname" maxlength="50">
                            </div>
                          </div>
                        </div>
                        <div class="cus-divider">ชื่อ (ภาษาอื่น)</div>
                        <div class="row">
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_title_other || 'Title (Other)' }}</label>
                              <input type="text" class="form-control input-sm" list="title_en" v-model="form.title_name_en" maxlength="10">
                              <datalist id="title_en">
                                <option>Mr.</option><option>Mrs.</option><option>Ms.</option>
                              </datalist>
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_first_other || 'Firstname (Other)' }}</label>
                              <input type="text" class="form-control input-sm" v-model="form.first_name_en" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_last_other || 'Lastname (Other)' }}</label>
                              <input type="text" class="form-control input-sm" v-model="form.last_name_en" maxlength="50">
                            </div>
                          </div>
                        </div>
                        <div class="cus-divider">ข้อมูลส่วนตัว</div>
                        <div class="row">
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_sex || 'Sex' }}</label>
                              <select class="form-control input-sm" v-model="form.sex">
                                <option value="" v-text="ui.re_pls_select || '- Please Select -'"></option>
                                <option value="M">ชาย</option>
                                <option value="F">หญิง</option>
                                <option value="O">อื่นๆ</option>
                              </select>
                            </div>
                          </div>
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_dateofbirth || 'Date Of Birth' }}</label>
                              <datepicker input-class="form-control input-sm" overdate="" v-model="form.birthday" @change="form.age = birthCount(form.birthday)"></datepicker>
                            </div>
                          </div>
                          <div class="col-md-1">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_age_year || 'Age' }}</label>
                              <input type="text" class="form-control input-sm cus-readonly" readonly v-model="form.age">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_marriage_status || 'Marriage Status' }}</label>
                              <select class="form-control input-sm" v-model="form.status">
                                <option value="" v-text="ui.re_pls_select || '- Please Select -'"></option>
                                <option value="01">Single - โสด</option>
                                <option value="02">Married - สมรส</option>
                                <option value="04">Divorced - หย่าร้าง</option>
                                <option value="03">Widowed - หม้าย</option>
                                <option value="06">Marriage is not registered - สมรสไม่จดทะเบียน</option>
                                <option value="07">Separated - แยกกันอยู่</option>
                              </select>
                            </div>
                          </div>
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_nationality || 'Nationality' }}</label>
                              <input type="text" class="form-control input-sm" list="nationality" v-model="form.nationality" maxlength="50">
                            </div>
                          </div>
                        </div>
                        <div class="cus-divider">
                          เอกสารประจำตัว
                          <span v-if="cardPassError" class="cus-error-hint"><i class="fas fa-exclamation-circle"></i> กรุณากรอกอย่างน้อย 1 รายการ</span>
                        </div>
                        <div class="row">
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_cardid || 'Card ID' }}</label>
                              <input type="text" class="form-control input-sm" :class="{'is-invalid': cardPassError}" v-model="form.card_id" maxlength="13">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_passportid || 'Passport ID' }}</label>
                              <input type="text" class="form-control input-sm" :class="{'is-invalid': cardPassError}" v-model="form.pass_id" maxlength="30">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_taxid || 'Tax ID' }}</label>
                              <input type="text" class="form-control input-sm" :class="{'is-invalid': cardPassError}" v-model="form.tax_id" maxlength="15">
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_class_passport_date || 'Issue Date' }}</label>
                              <datepicker input-class="form-control input-sm" v-model="form.issue_date" overdate=""></datepicker>
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_card_pas_ex || 'Expire Date' }}</label>
                              <datepicker input-class="form-control input-sm" v-model="form.exp_date" overdate=""></datepicker>
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_card_pass_by || 'Issue by' }}</label>
                              <input type="text" class="form-control input-sm" v-model="form.issue_by" maxlength="50">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Section: Contact Info -->
                    <div class="cus-section">
                      <div class="cus-section-header cus-header-teal">
                        <i class="fas fa-phone-alt"></i> {{ ui.re_contact_info_v2 || 'Contact Info' }}
                      </div>
                      <div class="cus-section-body">
                        <div class="row">
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">Mobile No.</label>
                              <input type="text" class="form-control input-sm" v-model="form.telephone">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">Tel.</label>
                              <input type="text" class="form-control input-sm" v-model="form.tel">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_fax || 'Fax' }}</label>
                              <input type="text" class="form-control input-sm" v-model="form.fax_id">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">E-Mail</label>
                              <input type="text" class="form-control input-sm" v-model="form.mail">
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">Line ID</label>
                              <input type="text" class="form-control input-sm" v-model="form.id_line" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">Facebook</label>
                              <input type="text" class="form-control input-sm" v-model="form.facebook" maxlength="200">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_send_direct_mail || 'Send Direct Mail' }}</label>
                              <select class="form-control input-sm" v-model="form.send_dm">
                                <option value="" disabled v-text="ui.re_pls_select || '- Please Select -'"></option>
                                <option value="Y">ส่ง</option>
                                <option value="N">ไม่ส่ง</option>
                              </select>
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_send_sms || 'Send SMS.' }}</label>
                              <select class="form-control input-sm" v-model="form.send_sms">
                                <option value="" disabled v-text="ui.re_pls_select || '- Please Select -'"></option>
                                <option value="Y">ส่ง</option>
                                <option value="N">ไม่ส่ง</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Section: Address -->
                    <div class="cus-section">
                      <div class="cus-section-header cus-header-green">
                        <i class="fas fa-map-marker-alt"></i> Address
                      </div>
                      <div class="cus-section-body">
                        <div class="row">
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_house_no || 'House No.' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.unit_no" placeholder="บ้านเลขที่" maxlength="10">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_village || 'Village' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.vaillage" placeholder="หมู่บ้าน" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_building || 'Building' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.building" placeholder="อาคาร" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_moo || 'Moo' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.m_no" placeholder="หมู่ที่" maxlength="10">
                            </div>
                          </div>
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_lane_juntion || 'Sub-Road / Junction' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.junction" placeholder="ซอย/แยก" maxlength="50">
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_road || 'Road' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.road" placeholder="ถนน" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_subdis || 'Sub-District' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.sub_district" placeholder="ตำบล" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_district || 'District' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.district" placeholder="อำเภอ" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_province || 'Province' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.province" placeholder="จังหวัด" maxlength="50">
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_country || 'Country' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.country" list="country" placeholder="ประเทศ" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_zipcode || 'Zipcode' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.zip_code" placeholder="รหัสไปรษณีย์" maxlength="15">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_phone || 'Phone' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.telephone" placeholder="โทรศัพท์" maxlength="40">
                            </div>
                          </div>
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_fax || 'Fax' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.fax" placeholder="Fax" maxlength="40">
                            </div>
                          </div>
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_branch_number || 'Branch Number' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.branch_number" placeholder="Branch Number" maxlength="5">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </fieldset>
                </div>
                <!-- Tab1 : Old Cust Information -->
                <div class="tab-pane" v-bind:class="{active:tabActive===5}">
                  <fieldset disabled>

                    <!-- Section: Identity (Old) -->
                    <div class="cus-section">
                      <div class="cus-section-header cus-header-blue">
                        <i class="fas fa-id-card"></i> {{ ui.re_identity || 'Identity' }}
                      </div>
                      <div class="cus-section-body">
                        <div class="row">
                          <div class="col-md-2">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.cust_code || 'Customer Code' }}</label>
                              <input type="text" class="form-control input-sm cus-readonly" readonly v-model.trim="form.customer_code">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label cus-required">{{ ui.re_firstname || 'ชื่อลูกค้า' }}</label>
                              <input type="text" class="form-control input-sm" v-model="form.customer_name" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">ประเภทลูกค้า</label>
                              <input type="text" class="form-control input-sm" v-model="form.cust_type_name" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_first_other || 'ชื่อ (ภาษาอื่น)' }}</label>
                              <input type="text" class="form-control input-sm" v-model="form.customer_name_en" maxlength="50">
                            </div>
                          </div>
                        </div>
                        <div class="row" v-if="view_csm.view_csm=='N'">
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_cardid || 'Card ID' }}</label>
                              <input type="text" class="form-control input-sm" v-model="form.card_id" maxlength="13">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_taxid || 'Tax ID' }}</label>
                              <input type="text" class="form-control input-sm" v-model="form.tax_id" maxlength="15">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_dateofbirth || 'Date Of Birth' }}</label>
                              <datepicker input-class="form-control input-sm" overdate="" v-model="form.birthday" @change="form.age = birthCount(form.birthday)"></datepicker>
                            </div>
                          </div>
                          <div class="col-md-1">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_age_year || 'Age' }}</label>
                              <input type="text" class="form-control input-sm cus-readonly" readonly v-model="form.age">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Section: Contact Info (Old) -->
                    <div class="cus-section">
                      <div class="cus-section-header cus-header-teal">
                        <i class="fas fa-phone-alt"></i> {{ ui.re_contact_info_v2 || 'Contact Info' }}
                      </div>
                      <div class="cus-section-body">
                        <div class="row">
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">Tel.</label>
                              <input type="text" class="form-control input-sm" v-model="form.phone">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.re_fax || 'Fax' }}</label>
                              <input type="text" class="form-control input-sm" v-model="form.fax">
                            </div>
                          </div>
                          <div class="col-md-3">
                            <div class="form-group">
                              <label class="cus-label">E-Mail</label>
                              <input type="text" class="form-control input-sm" v-model="form.email">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Section: Address (Old) -->
                    <div class="cus-section">
                      <div class="cus-section-header cus-header-green">
                        <i class="fas fa-map-marker-alt"></i> Address
                      </div>
                      <div class="cus-section-body">
                        <div class="row">
                          <div class="col-md-4">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.address1 || 'Address 1' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.address1" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-4">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.address2 || 'Address 2' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.address2" maxlength="50">
                            </div>
                          </div>
                          <div class="col-md-4">
                            <div class="form-group">
                              <label class="cus-label">{{ ui.address3 || 'Address 3' }}</label>
                              <input type="text" class="form-control input-sm" v-model="addr.address3" maxlength="10">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </fieldset>
                </div>
                <!-- Tab2 : Mobile No. (NEW) -->
                <div class="tab-pane" v-bind:class="{active:tabActive===1}">
                  <fieldset v-bind:disabled="is_mango()">

                    <div class="cus-section">
                      <div class="cus-section-header cus-header-teal">
                        <i class="fas fa-mobile-alt"></i> {{ ui.re_mobile_phone || 'Mobile No.' }}
                      </div>
                      <div class="cus-section-body">
                        <div v-for="(x, idx) in phoneList" :key="x.itemno" class="mobile-row">
                          <div class="mobile-row-label">No. {{ x.itemno }}</div>
                          <div class="mobile-row-body">
                            <div class="row">
                              <div class="col-md-4">
                                <input type="text" class="form-control input-sm" v-model="x.detail"
                                       placeholder="Mobile No." maxlength="10"
                                       @input="set_contact_defaultOninput(x.itemno)">
                              </div>
                              <div class="col-md-3" style="padding-top:6px;">
                                <label class="mobile-default-label">
                                  <input type="radio" name="mobile" v-model.trim="x.default_contact" value="Y"
                                         @click="set_contact_default(x.itemno)">
                                  <span>Set As Default</span>
                                </label>
                              </div>
                              <div class="col-md-2">
                                <button class="btn btn-sm btn-danger" v-if="idx!=0"
                                        @click="remove_contact(x)"
                                        v-bind:disabled="x.default_contact=='Y'">
                                  <i class="fa fa-times"></i> Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style="margin-top:10px;">
                          <button class="btn btn-sm btn-info" @click="addPhone()" v-show="auth.is_admin">
                            <i class="fa fa-plus"></i> Append Row
                          </button>
                        </div>
                      </div>
                    </div>

                  </fieldset>
                </div>
                <!-- Tab3 : Contact Person (Corporation) (NEW) -->
                <div class="tab-pane" v-bind:class="{active:tabActive===2}">

                  <div class="cus-section">
                    <div class="cus-section-header cus-header-purple">
                      <i class="fas fa-users"></i> {{ ui.re_contect_person || 'Contact Person (Corporation)' }}
                      <button class="btn btn-sm btn-light cus-section-btn" @click="addPerson()">
                        <i class="fas fa-plus"></i> {{ ui.re_append_row || 'Append Row' }}
                      </button>
                    </div>
                    <div class="cus-section-body" style="padding:0;">
                      <fieldset>
                        <div class="table-responsive">
                          <table class="table table-hover cus-contact-table">
                            <thead>
                              <tr>
                                <th style="width:80px;" class="text-center">Edit</th>
                                <th style="width:40px;" class="text-center">#</th>
                                <th style="width:180px;">{{ ui.re_contacts || 'Contacts' }}</th>
                                <th style="width:150px;">{{ ui.re_position || 'Position' }}</th>
                                <th style="width:120px;">{{ ui.re_phone || 'Phone' }}</th>
                                <th style="width:180px;">{{ ui.re_email || 'E-mail' }}</th>
                                <th style="width:120px;">{{ ui.re_line || 'Line' }}</th>
                                <th style="width:150px;">{{ ui.re_web || 'Website' }}</th>
                                <th style="width:150px;">{{ ui.re_remark || 'Remark' }}</th>
                                <th style="width:100px;" class="text-center">{{ ui.csm_up_program || 'Up Program' }}</th>
                                <th style="width:100px;" class="text-center">{{ ui.csm_training || 'Training' }}</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(x,idx) in cmList" :key="x.ctp_code">
                                <td class="text-center">
                                  <a href="#" @click.prevent="edit(x)" class="text-primary" title="แก้ไข"><i class="fa fa-edit"></i></a>
                                  <a href="#" @click.prevent="remove_person(x)" class="text-danger" title="ลบ" style="margin-left:6px;"><i class="fa fa-trash"></i></a>
                                </td>
                                <td class="text-center">{{ idx+1 }}</td>
                                <td><input type="text" class="form-control input-sm" v-model.trim="x.person_name" :readonly="!x.isEdit" /></td>
                                <td><input type="text" class="form-control input-sm" v-model.trim="x.position" :readonly="!x.isEdit" /></td>
                                <td><input type="text" class="form-control input-sm" v-model.trim="x.phone" :readonly="!x.isEdit" /></td>
                                <td><input type="text" class="form-control input-sm" v-model.trim="x.email" :readonly="!x.isEdit" /></td>
                                <td><input type="text" class="form-control input-sm" v-model.trim="x.lineid" :readonly="!x.isEdit" /></td>
                                <td><input type="text" class="form-control input-sm" v-model.trim="x.website" :readonly="!x.isEdit" /></td>
                                <td><input type="text" class="form-control input-sm" v-model.trim="x.remark" :readonly="!x.isEdit" /></td>
                                <td class="text-center" v-if="!x.isEdit" :class="{'text-success': x.set_update=='Y','text-danger': x.set_update!='Y'}">
                                  {{ x.set_update == 'Y' ? 'Yes' : 'No' }}
                                </td>
                                <td class="text-center" v-if="!x.isEdit" :class="{'text-success': x.set_training=='Y','text-danger': x.set_training!='Y'}">
                                  {{ x.set_training == 'Y' ? 'Yes' : 'No' }}
                                </td>
                                <td v-if="x.isEdit">
                                  <select class="form-control input-sm" v-model="x.set_update">
                                    <option value="N">No</option>
                                    <option value="Y">Yes</option>
                                  </select>
                                </td>
                                <td v-if="x.isEdit">
                                  <select class="form-control input-sm" v-model="x.set_training">
                                    <option value="N">No</option>
                                    <option value="Y">Yes</option>
                                  </select>
                                </td>
                              </tr>
                              <tr v-if="cmList.length == 0">
                                <td class="text-center text-muted" colspan="11" style="padding:20px;">
                                  <i class="fa fa-inbox"></i> ไม่มีข้อมูล
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </fieldset>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <app-form ref="appForm"></app-form>
          </div>
        </div>
      </template>
    </re-page>

  </div>
</template>
<script>
  let process = false;
  let page = {};
  let appForm = {};
  let paging = {};
  let paging2 = {};
  let cpn = {
    data() {
      return {
        auth,
        ui: window.ui,
        tabActive: 0,
        show_panel: 0,
        search: {},
        customerList: [],
        OldCustList: [],
        customerTotal: 0,
        oldCustTotal: 0,
        switchTotal: 0,
        form: {},
        addr: {},
        phoneList: [],
        cmList: [],
        editMode: false,
        oldCust: true,
        view_csm: {},
        lang: (window.langList || {}).userLang,
  
      };
    },
    methods: {
      async onTabChange(t) {
        this.tabActive = t;
      },
      async onPanelChange(t) {
        this.show_panel = t;
        switch (this.show_panel) {
          case 0:
            appForm.btnSave.show = false;
            appForm.btnDelete.show = false;
            appForm.btnBack.show = false;
            break;
          case 1:
            appForm.btnSave.show = true;
            appForm.btnDelete.show = this.auth.is_admin && !this.oldCust;
            appForm.btnBack.show = true;
            break;
        }
      },

      /* ─── AG Table : ลูกค้าใหม่ ─────────────────────────── */
      initTableNew() {
        let agr = this.$refs.agr_new;
        if (!agr) return;

        let fields = [
          ['', 'Action', 'text', {
            width: 120, align: 'center', pinned: 'left', sortable: false,
            child: [
              ['', '', 'text', {
                width: 120, align: 'center', pinned: 'left',
                cellRenderer: (params) => {
                   return`<a href="#" class="text-black ag-action-edit" data-idx="${params.rowIndex}"><i class="fas fa-edit"></i></a>`;
                }
              }]
            ]
          }],
          ['customer_code', 'Code', 'text', { width: 180, sortable: true, pinned: 'left', cellStyle: { 'font-weight': '600' } }],
          ['_fullname', 'Name', 'text', {
            width: 500, sortable: false,
            cellRenderer: (params) => {
              if (!params.data) return '';
              let d = params.data;
              let name = [d.title_name, d.first_name, d.last_name].filter(Boolean).join(' ');
              return `<a href="#" class="ag-cus-new-open" data-idx="${params.rowIndex}" style="color:#1a6fa8;text-decoration:none;">${name}</a>`;
            }
          }],
          ['address', 'Address', 'text', { width: 500, sortable: false }],
          ['telephone', 'Mobile', 'text', { width: 160, align: 'center' }],
          ['tel', 'Tel', 'text', { width: 160, align: 'center' }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
        agr.setDisplay(this.customerList);
    this.$nextTick(() => {
          agr.$el.addEventListener('click', (e) => {
            let editBtn = e.target.closest('.ag-action-edit');
            let editBtn2 = e.target.closest('.ag-cus-new-open');
            if (editBtn) {
              e.preventDefault();
              let idx = parseInt(editBtn.getAttribute('data-idx'));
              this.setEdit(this.customerList[idx]);
            }
            if (editBtn2) {
              e.preventDefault();
              let idx = parseInt(editBtn2.getAttribute('data-idx'));
              this.setEdit(this.customerList[idx]);
            }
           
          });
        });

      },

      /* ─── AG Table : ลูกค้าเก่า ─────────────────────────── */
      initTableOld() {
        let agr = this.$refs.agr_old;
        if (!agr) return;

        let fields = [
          ['', 'Action', 'text', {
            width: 120, align: 'center', pinned: 'left', sortable: false,
            child: [
              ['', '', 'text', {
                width: 120, align: 'center', pinned: 'left',
                cellRenderer: (params) => {
                  return`<a href="#" class="text-black ag-action-edit" data-idx="${params.rowIndex}"><i class="fas fa-edit"></i></a>`;
                }
              }]
            ]
          }],
          ['customer_code', 'Code', 'text', { width: 180, sortable: true, pinned: 'left', cellStyle: { 'font-weight': '600' } }],
          ['customer_name', 'Name', 'text', {
            width: 600, sortable: true,
            cellRenderer: (params) => {
              if (!params.data) return '';
              return `<a href="#" class="ag-cus-old-open" data-idx="${params.rowIndex}" style="color:#1a6fa8;text-decoration:none;">${params.value || ''}</a>`;
            }
          }],
          ['address', 'Address', 'text', { width: 600, sortable: false }],
          ['phone', 'Mobile', 'text', { width: 160, align: 'center' }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
        agr.setDisplay(this.OldCustList);
        this.$nextTick(() => {
              agr.$el.addEventListener('click', (e) => {
                let editBtn = e.target.closest('.ag-action-edit');
                let editBtn2 = e.target.closest('.ag-cus-old-open');
                if (editBtn) {
                  e.preventDefault();
                  let idx = parseInt(editBtn.getAttribute('data-idx'));
                  this.editCust(this.customerList[idx]);
                }
                if (editBtn2) {
                  e.preventDefault();
                  let idx = parseInt(editBtn2.getAttribute('data-idx'));
                  this.editCust(this.customerList[idx]);
                }
              
              });
            });
      },
      async pageChange(pn, type) {
        switch (type) {
          case "CustomerList":
            paging.setCurrentPage(pn);
            await this.loadData();
            break;
          case "OldCustList":
            paging2.setCurrentPage(pn);
            await this.loadOldCust();
            break;
        };
      },
      async resetData() {
        this.SetData();

        this.onPanelChange(0);
        this.onTabChange(3);

        this.editMode = false;
        this.oldCust = true;
        await this.loadData();
      },
      async SetData() {
        this.form = {};
        this.addr = {};
        this.phoneList = [];
        this.cmList = [];
        //this.addPhone();
        //this.addPerson();
      },
      async newClick() {
        this.SetData();

        this.onPanelChange(1);
        this.onTabChange(0);
        this.oldCust = false;
        appForm.btnDelete.show = false;
      },
      async loadData() {
        let act = `CSM/Master/Customer_ReadList?search_text=${encodeURIComponent(this.search.text || '')}&skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;
        let rsp = await $xt.getServer(act);

        this.customerList = rsp.data.data_rows.data;
        this.customerTotal = rsp.data.data_rows.total;

        paging.setTotalItems(this.customerTotal);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();

        this.$nextTick(() => this.initTableNew());
      },
      async loadOldCust() {
        let act = `CSM/Master/OldCust_ReadList?search_text=${encodeURIComponent(this.search.text || '')}&skip=${paging2.skipItems()}&take=${paging2.getItemsPerPage()}`;
        let rsp = await $xt.getServer(act);

        this.OldCustList = rsp.data.data_rows.data;
        this.oldCustTotal = rsp.data.data_rows.total;

        paging2.setTotalItems(this.oldCustTotal);
        if (!paging2.getItemsPerPage()) {
          paging2.setCurrentPage(1);
        }
        paging2.createPagesArray();

        this.$nextTick(() => this.initTableOld());
      },
      async readData(x) {
        let act = `CSM/Master/Customer_Read?customer_code=${encodeURIComponent(x || '')}`;
        let rsp = await $xt.getServer(act);

        this.form = rsp.info;
        this.addr = rsp.address == null ? {} : rsp.address;
        if (rsp.mobile.length != 0) { this.phoneList = rsp.mobile };
        if (rsp.contact.length != 0) { this.cmList = rsp.contact };
        this.csr = rsp.ck_csr;

        $linq(this.cmList).foreach(x => {
          x.set_update = x.status1 ?? "N";
          x.set_training = x.status2 ?? "N";
          this.$set(x, "isEdit", false)
        });
        this.oldCust = false;
      },
      async oldCustRead(x) {
        let act = `CSM/Master/OldCust_Read?customer_code=${encodeURIComponent(x || '')}`;
        let rsp = await $xt.getServer(act);

        this.form = rsp.info;
        this.addr = rsp.address == null ? {} : rsp.address;
        if (rsp.mobile.length != 0) { this.phoneList = rsp.mobile };
        if (rsp.contact.length != 0) { this.cmList = rsp.contact };
        this.csr = rsp.ck_csr;

        $linq(this.cmList).foreach(x => {
          x.set_update = x.status1 ?? "N";
          x.set_training = x.status2 ?? "N";
          x.isEdit = false;
        });
        this.oldCust = true;
      },
      async saveClick() {
        if (process) return;
        if ($xt.isEmpty(this.form.first_name) && !this.oldCust) {
          $msg.alert(`คำเตือน`, "กรุณาระบุ " + this.ui.re_firstname, `warning`);
          return;
        }
        if (!this.isFormValid) {

          this.lang == 'TH' ? $msg.alert(`คำเตือน`, "ระบุเลขที่ประจำตัวผู้เสียภาษี หรือ เลขที่บัตรประชาชน หรือ หนังสือเดินทาง", `warning`) : $msg.alert(`คำเตือน`, "Tax ID or Personanal ID or Passport No. is required", `warning`)
          return
        }
        $linq(this.cmList).foreach(x => {
          x.status1 = x.set_update ?? "N";
          x.status2 = x.set_training ?? "N";
        });
        try {
          let f = {
            info: this.form,
            address: this.addr,
            mobile: this.phoneList,
            contact: this.cmList
          };
          let act = `CSM/Master/Customer_Create`;
          if (this.editMode) {
            act = `CSM/Master/Customer_Update`;
            if (this.oldCust) {
              act = `CSM/Master/OldCust_Update`;
            }
          }
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          this.resetData();
          $msg.alert(``, this.ui.alert_save_success, `success`);
        } catch (ex) {
          $msg.alert(`Warning`, ex.toString(), `warning`);
        } finally {
          process = false;
          page.loadingBox.hide();
        }
      },
      async deleteClick() {
        if (process) return;
        if (!this.editMode) return;
        if (!await $msg.confirm(this.ui.alert_delete_data)) {
          return;
        }
        try {
          let f = {
            info: this.form,
            address: this.addr,
            mobile: this.phoneList,
            contact: this.cmList
          };
          let act = `CSM/Master/Customer_Delete`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          this.resetData();
          $msg.alert(``, this.ui.alert_delete_success, `success`);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          page.loadingBox.hide();
        }
      },
      setEdit(x) {
        this.onPanelChange(1);
        this.onTabChange(0);
        this.editMode = true;
        this.readData(x.customer_code);
        $('html,body').scrollTop(0);
      },
      editCust(x) {
        this.onPanelChange(1);
        this.onTabChange(5);
        this.editMode = true;
        this.oldCustRead(x.customer_code);
        $('html,body').scrollTop(0);
      },
      birthCount(birth) {
        birth = birth || moment(new Date()).format('YYYY');
        let day = new Date();
        let now = day.getFullYear();
        birth = moment(birth).format('YYYY');
        let age = now - birth;
        if (age < 0) age = 0;
        return age;
      },
      set_contact_default(itemno) {
        $linq(this.phoneList).foreach(x => {
          x.default_contact = (x.itemno == itemno) ? 'Y' : 'N';
        });
        this.$set(this.form, "telephone", $linq(this.phoneList).where(x => x.itemno == itemno).select(x => x.detail).firstOrDefault());
      },
      set_contact_defaultOninput(itemno) {
        let findItem = this.phoneList.find( x => x.itemno == itemno && x.default_contact == 'Y')
        if(findItem != undefined) {
          this.$set(this.form, "telephone", $linq(this.phoneList).where(x => x.itemno == itemno).select(x => x.detail).firstOrDefault());
        }
      },
      addPhone() {
        let itemno = this.phoneList.length == 0 ? 1 : ($linq(this.phoneList).select(x => x.itemno).max() + 1);
        this.phoneList.push({
          itemno: itemno,
          detail: '',
          default_contact: 'N',
        })
      },
      remove_contact(d) {
        if (d.default_contact == "Y") {
          $msg.alert(`คำเตือน`, " ไม่สามารถลบเบอร์โทรหลักได้", `warning`);
          return;
        }
        this.phoneList = $linq(this.phoneList).where(x => x.itemno != d.itemno).toArray();
        let run_item = 1;
        $linq(this.phoneList).foreach(x => {
          x.itemno = run_item;
          run_item++;
        });
      },
      addPerson() {
        let ctp_code = $linq(this.cmList).select(x => x.ctp_code).lastOrDefault() || 0;
        this.cmList.push({
          ctp_code: ++ctp_code,
          person_name: '',
          position: '',
          phone: '',
          email: '',
          website: '',
          lineid: '',
          website: '',
          remark: '',
          set_update: 'N',
          set_training: 'N',
          isEdit: true
        })
      },
      edit(data) {
        let d = $linq(this.cmList).where(x => x.cpt_code == data.cpt_code).firstOrDefault()
        this.$set(d, "isEdit", !d.isEdit)
        console.log("D " + JSON.stringify(d))
      },
      remove_person(data) {
        this.cmList = ($linq(this.cmList).where(x => x.ctp_code != data.ctp_code).toArray());
        let run_item = 1;
        $linq(this.cmList).foreach(x => {
          x.ctp_code = run_item;
          run_item++;
        });
      },
      SetPerson(d, type) {
        switch (type) {
          case "Update":
            $linq(this.cmList).foreach(x => {
              x.set_update = (x.ctp_code == d.ctp_code) ? 'Y' : 'N';
            });
            break;
          case "Training":
            $linq(this.cmList).foreach(x => {
              x.set_training = (x.ctp_code == d.ctp_code) ? 'Y' : 'N';
            });
            break;
        }
      },
      is_mango() {
        let isMango = $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault();
        return isMango == "Y" ? true : false;
      },
      async view() {
        let act = `CSM/Master/View_csm_on`;
        let rsp = await $xt.getServer(act);
       
        this.$set(this, 'view_csm', rsp.data)
     
      },
    
    },
    computed: {
      configData() { return store.state.configData },
      cardPassError() {
        return !this.form.card_id && !this.form.pass_id && !this.form.tax_id
      },
      isFormValid() {
        return !this.cardPassError 
      },
    },
    mounted() {
      (async () => {
        page = this.$refs.page;
        page.pageTitle = `Setup : Customers`;
        document.title = page.pageTitle;

        appForm = this.$refs.appForm;
        appForm.btnNew.show = false;
        appForm.btnPrint.show = false;
        
        appForm.btnAddRow.show = false;
        
        appForm.btnRetrieve.show = false;
        appForm.btnSave.click = this.saveClick;
        appForm.btnBack.click = this.resetData;
        appForm.btnDelete.click = this.deleteClick;

        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(15);

        paging2 = this.$refs.paging2;
        paging2.setCurrentPage(1);
        paging2.setItemsPerPage(15);

        this.onTabChange(3);
        this.resetData();
        this.view();

        let ref_customer = localStorage.getItem("X-Master-Customer");
        if (ref_customer != null || ref_customer != undefined) {
          let p = JSON.parse(ref_customer);
          this.newClick();
          this.editMode = true;
          this.$set(this.form, 'customer_code', p.customer_code);
          this.$set(this.form, 'first_name', p.first_name);
          this.$set(this.form, 'last_name', p.last_name);
          this.$set(this.form, 'nickname', p.nickname);
          this.$set(this.form, 'tel', p.tel);
          this.$set(this.form, 'mail', p.mail);
          localStorage.removeItem('X-Master-Customer');
        }

        this.loadOldCust();
      })();
    }
  };

  export default cpn;
</script>
<style scoped>
  .showaddr {
    background-color: white;
    border-color: white;
  }

  /* ─── Section Cards ──────────────────────────────────── */
  .cus-section {
    background: #fff;
    border-radius: 10px;
    border: 1px solid #e4e7ec;
    margin-bottom: 14px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  .cus-section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
  }

  .cus-header-blue   { background: linear-gradient(135deg, #1a6fa8, #2980b9); }
  .cus-header-teal   { background: linear-gradient(135deg, #00897b, #26a69a); }
  .cus-header-green  { background: linear-gradient(135deg, #2e7d32, #43a047); }
  .cus-header-purple { background: linear-gradient(135deg, #6a1b9a, #8e24aa); }

  .cus-section-btn {
    margin-left: auto;
    font-size: 11px;
    padding: 2px 10px;
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.4);
    color: #fff;
    border-radius: 4px;
  }
  .cus-section-btn:hover { background: rgba(255,255,255,0.35); color: #fff; }

  .cus-section-body {
    padding: 14px 16px 8px;
  }

  /* ─── Labels ─────────────────────────────────────────── */
  .cus-label {
    font-size: 12px;
    font-weight: 600;
    color: #4a5568;
    margin-bottom: 4px;
    display: block;
  }

  .cus-required::after {
    content: ' *';
    color: #e53e3e;
  }

  .cus-readonly {
    background-color: #f7f8fa !important;
    color: #6b7280 !important;
  }

  /* ─── Divider ────────────────────────────────────────── */
  .cus-divider {
    font-size: 11px;
    font-weight: 700;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px dashed #e2e8f0;
    padding-bottom: 4px;
    margin: 10px 0 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cus-error-hint {
    font-size: 11px;
    color: #e53e3e;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0;
  }

  /* ─── Mobile No. rows ────────────────────────────────── */
  .mobile-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #f1f3f5;
  }
  .mobile-row:last-of-type { border-bottom: none; }

  .mobile-row-label {
    min-width: 60px;
    font-size: 12px;
    font-weight: 700;
    color: #4a5568;
    padding-top: 7px;
  }

  .mobile-row-body { flex: 1; }

  .mobile-default-label {
    font-size: 12px;
    font-weight: 500;
    color: #4a5568;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
  }

  /* ─── Contact Person table ───────────────────────────── */
  .cus-contact-table {
    font-size: 12px;
    margin-bottom: 0;
  }

  .cus-contact-table thead tr {
    background: #f1f3f5;
  }

  .cus-contact-table thead th {
    font-size: 11px;
    font-weight: 700;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 8px 8px;
    border-bottom: 2px solid #dee2e6;
    white-space: nowrap;
  }

  .cus-contact-table tbody td {
    padding: 5px 6px;
    vertical-align: middle;
  }

  .cus-contact-table tbody tr:hover {
    background: #f8f9fa;
  }
  /deep/ .content-body {
    overflow-y: auto !important;
    height: calc(100vh - 120px);
  }
</style>
