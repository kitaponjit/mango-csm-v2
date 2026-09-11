<template>
  <div>
    <re-page ref="page">

      <template slot="body">
        <div class="box box-widget">
          <div class="row">
            <div class="col-md-12 col-sm-12 col-xs-12">
              <div class="nav nav-tabs-custom">
                <ul class="nav nav-tabs">
                  <li v-for="(x,idx) in headerTab" :key="`header-${idx}`" :class="{'active':x.id==mainTabSelected}" v-show="x.show">
                    <a href="#" @click.prevent="clickTabSelected(x.id, 'main')">&nbsp;<i class="fas" :class="xt.isEmpty(x.icon) ? 'fa-circle' : x.icon"></i>&nbsp;{{x.text}} <span v-if="x.total > 0">({{x.total}})</span></a>
                  </li>
                  <li class="pull-right" style="margin-top:3px;">
                    <button class="btn btn-sm btn-success" @click="SaveChange()">
                      <i class="fas fa-save"></i>Save
                    </button>
                  </li>
                </ul>
                <div class="tab-content">
                  <!-- Approve Document -->
                  <div class="tab-pane animated fadeIn" :class="{'active': mainTabSelected == 'header_tab1'}">
                    <div class="padding-detail">
                      <div class="row">
                        <div class="col-lg-2">
                          <div class="form-group">
                            <label v-text="ui.search_by || 'ค้นหาโดย'"></label>
                            <select class="form-control input-sm" v-model="select_s">
                              <option value="DocNo">Document No.</option>
                              <option value="vender">Supplier</option>
                              <option value="Doctype">Document Type.</option>
                            </select>
                          </div>
                        </div>
                        <div class="col-lg-3">
                          <div class="form-group">
                            <label v-text="ui.search || 'ค้นหา'"></label>
                            <div class="input-group">
                              <input v-if="select_s=='DocNo'" type="text" class="form-control input-sm" v-model.trim="searchDocNo" @keyup.enter="loadRetrieve()" />
                              <input v-if="select_s=='vender'" type="text" class="form-control input-sm" v-model.trim="searchvender" @keyup.enter="loadRetrieve()" />
                              <input v-if="select_s=='Doctype'" type="text" class="form-control input-sm" v-model.trim="searchDoctype" @keyup.enter="loadRetrieve()" />
                              <span class="input-group-btn">
                                <button class="btn btn-sm bg-navy" @click="loadRetrieve()"><i class="fas fa-search"></i></button>
                                <button class="btn btn-sm btn-default" @click="searchDocNo='';"><i class="fa fa-times"></i></button>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-lg-12 col-md-12">
                          <div class="table-responsive" id="tableFixed">
                            <table class="table table-bordered table table-hover">
                              <thead>
                                <tr>
                                  <!--<th class="tf-2">No.</th>-->
                                  <th class="tf-4">Approve</th>
                                  <th class="tf-3">Status</th>
                                  <th class="tf-3-5">Document No.</th>
                                  <th class="tf-3-5">Paid Amount</th>
                                  <th class="tf-3-5">Amount</th>
                                  <th class="tf-3-5">VAT</th>
                                  <th class="tf-3-5">VAT Amount</th>
                                  <th class="tf-3-5">Total</th>
                                  <th class="tf-2-5">Currency</th>
                                  <th class="tf-3-5">Document Date</th>
                                  <th class="tf-3-5">Approve Date</th>
                                  <!--<th class="tf-3-5">Project/Department No.</th>-->
                                  <th class="tf-4">Project/Department</th>
                                  <th class="tf-3-5">Room</th>
                                  <th class="tf-3">By</th>
                                  <th class="tf-3-5">Level</th>
                                  <th class="tf-5">Remark</th>
                                  <th class="tf-4">Supplier</th>
                                  <th class="tf-3">Attach</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(x,idx) in displayD" style="cursor:pointer">
                                  <!--<td align="center" class="text-bold">{{idx+1}}.</td>-->
                                  <td>
                                    <span class="radio radio-inline">
                                      <label>
                                        <input type="radio" name="status1" value="Y" v-model="x.status2" v-on:click="onApprove(x, 'Y');ProCdate(x)" />
                                        <input v-show="false" type="checkbox" name="status2" true-value="Y" v-model="x.status2" v-on:click="onApprove(x, 'Y')" disabled>
                                        <span class="cr"><i class="cr-icon fas fa-circle" v-if="x.status2 == 'Y'"></i></span>
                                        Approve
                                      </label>
                                    </span>
                                    <span class="radio radio-inline">
                                      <label>
                                        <input type="radio" name="status2" value="C" v-model="x.status2" v-on:click="onApprove(x, 'C');modalRemark(x.prno);" />
                                        <input v-show="false" type="checkbox" name="status2" true-value="C" v-model="x.status2" v-on:click="onApprove(x, 'C');modalRemark(x.prno);" disabled>
                                        <span class="cr"><i class="cr-icon fas fa-circle" v-if="x.status2 == 'C'"></i></span>
                                        Reject
                                      </label>
                                    </span>
                                    <span class="radio radio-inline">
                                      <label>
                                        <input type="radio" name="status3" value="N" v-model="x.status2" v-on:click="onApprove(x, 'N');ProCdateCl(x);" />
                                        <input v-show="false" type="checkbox" name="status2" true-value="N" v-model="x.status2" v-on:click="onApprove(x, 'N')" disabled>
                                        <span class="cr"><i class="cr-icon fas fa-circle" v-if="x.status2 == 'N'"></i></span>
                                        None
                                      </label>
                                    </span>
                                  </td>
                                  <td align="center">{{x.doctype2}}</td>
                                  <td align="center">
                                    <a href="#" @click.prevent="pushpage(x)">{{x.prno}}</a>
                                  </td>
                                  <td align="right">{{(x.paidamt || 0) | currency}}</td>
                                  <td align="right">{{(x.tamt || 0) | currency}}</td>
                                  <td align="center">
                                    <span v-if="x.vattype == 'E'">Exclude Vat</span>
                                    <span v-if="x.vattype == 'I'">Include Vat</span>
                                    <span v-if="x.vattype == 'N'">Not Vat<</span>
                                  </td>
                                  <td align="right">{{(x.vatamt || 0) | currency}}</td>
                                  <td align="right">{{(x.totamt || 0) | currency}}</td>
                                  <td align="center">{{x.curren}}</td>
                                  <td align="center">{{x.docdate | date('DD/MM/YYYY')}}</td>
                                  <td align="center">{{x.apdate | date('DD/MM/YYYY')}}</td>
                                  <!--<td align="center">{{x.pre_event2}}</td>-->
                                  <td v-if="x.pre_des">{{x.pre_des}}({{x.refcode}})</td>
                                  <td v-if="!x.pre_des"></td>
                                  <td align="center">{{x.room}}</td>
                                  <td align="center">{{x.username}}</td>
                                  <td align="center">
                                    <b v-if="x.levelapp == '5'">
                                      <b>
                                        <span class="distance"><b>Review</b></span>
                                      </b>
                                    </b>
                                    <b style="color: green;" v-if="x.levelapp == '9'">
                                      <b>
                                        <span class="distance"><b>Sequence Approval</b></span>
                                      </b>
                                    </b>
                                    <b style="color: orange;" v-if="x.levelapp == '2'">
                                      <b>
                                        <span class="distance"><b>Upper Approval</b></span>
                                      </b>
                                    </b>
                                    <b style="color: yellowgreen;" v-if="x.levelapp == '7'">
                                      <b>
                                        <span class="distance"><b>Last Approval</b></span>
                                      </b>
                                    </b>
                                    <b style="color: burlywood;" v-if="x.levelapp == '0'">
                                      <b>
                                        <span class="distance"><b>Upper Authorized</b></span>
                                      </b>
                                    </b>
                                  </td>
                                  <td>{{x.remark}}</td>
                                  <td>{{x.cust_name}}</td>
                                  <td v-on:click="showModalFile(x)" align="center">{{x.attach_lile}}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12 col-sm-12 col-xs-12">
                          <pagination class="pull-left" ref="pagingD" @page-change="pageChange($event.page, 'Document')" v-show="displayD.length > 0"></pagination>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Approve Waiting -->
                  <div class="tab-pane animated fadeIn" :class="{'active': mainTabSelected == 'header_tab2'}">
                    <div class="padding-detail">
                      <div class="row">
                        <div class="col-lg-2">
                          <div class="form-group">
                            <label v-text="ui.search_by || 'ค้นหาโดย'"></label>
                            <select class="form-control input-sm" v-model="select_s">
                              <option value="DocNo">Document No.</option>
                              <option value="vender">Supplier</option>
                              <option value="Doctype">Document Type.</option>
                            </select>
                          </div>
                        </div>
                        <div class="col-lg-3">
                          <div class="form-group">
                            <label v-text="ui.search || 'ค้นหา'"></label>
                            <div class="input-group">
                              <input v-if="select_s=='DocNo'" type="text" class="form-control input-sm" v-model.trim="searchDocNo" @keyup.enter="loadRetrieveW()" />
                              <input v-if="select_s=='vender'" type="text" class="form-control input-sm" v-model.trim="searchvender" @keyup.enter="loadRetrieveW()" />
                              <input v-if="select_s=='Doctype'" type="text" class="form-control input-sm" v-model.trim="searchDoctype" @keyup.enter="loadRetrieveW()" />
                              <span class="input-group-btn">
                                <button class="btn btn-sm bg-navy" @click="loadRetrieveW()"><i class="fas fa-search"></i></button>
                                <button class="btn btn-sm btn-default" @click="searchDocNo='';"><i class="fa fa-times"></i></button>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-lg-12 col-md-12">
                          <div class="row">
                            <div class="col-lg-12 col-md-12">
                              <div class="table-responsive" id="tableFixed">
                                <table class="table table-bordered table-hover">
                                  <thead>
                                    <tr>
                                      <!--<th class="tf-2">No.</th>-->
                                      <th class="tf-3">Status</th>
                                      <th class="tf-3-5">Document No.</th>
                                      <th class="tf-3-5">Paid Amount</th>
                                      <th class="tf-3-5">Amount</th>
                                      <th class="tf-3-5">VAT</th>
                                      <th class="tf-3-5">VAT Amount</th>
                                      <th class="tf-3-5">Total</th>
                                      <th class="tf-2-5">Currency</th>
                                      <th class="tf-3-5">Document Date</th>
                                      <th class="tf-3-5">Approve Date</th>
                                      <!--<th class="tf-3-5">Project/Department No.</th>-->
                                      <th class="tf-4">Project/Department</th>
                                      <th class="tf-3-5">Room</th>
                                      <th class="tf-3">By</th>
                                      <th class="tf-3-5">Level</th>
                                      <th class="tf-5">Remark</th>
                                      <th class="tf-4">Supplier</th>
                                      <th class="tf-3">Attach</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr v-for="(x,idx) in displayW" style="cursor:pointer">
                                      <!--<td class="text-center">{{idx+1}}</td>-->
                                      <td class="text-center">{{x.doctype2}}</td>
                                      <td class="text-left">
                                        <!--<a href="#" @click.prevent="modalStatus(x.prno,x.doctype)">{{x.prno}}</a>-->
                                        <a href="#" @click.prevent="pushpage(x)">{{x.prno}}</a>
                                      </td>
                                      <td align="right">{{(x.paidamt || 0) | number(2)}}</td>
                                      <td align="right">{{(x.tamt || 0) | number(2)}}</td>
                                      <td align="center">
                                        <span v-if="x.vattype == 'E'">Exclude Vat</span>
                                        <span v-if="x.vattype == 'I'">Include Vat</span>
                                        <span v-if="x.vattype == 'N'">Not Vat<</span>
                                      </td>
                                      <td align="right">{{(x.vatamt || 0) | number(2)}}</td>
                                      <td align="right">{{(x.totamt || 0) | number(2)}}</td>
                                      <td class="text-center">{{x.curren}}</td>
                                      <td class="text-center">{{x.docdate | date('DD/MM/YYYY')}}</td>
                                      <td class="text-center">{{x.apdate | date('DD/MM/YYYY')}}</td>
                                      <!--<td class="text-left">{{x.pre_event2}}</td>-->
                                      <td v-if="x.pre_des">{{x.pre_des}}({{x.refcode}})</td>
                                      <td v-if="!x.pre_des"></td>
                                      <td class="text-left">{{x.room}}</td>
                                      <td class="text-left">{{x.username}}</td>
                                      <td class="text-left">
                                        <b v-if="x.levelapp == '5'">
                                          <b>
                                            <span class="distance"><b>Review</b></span>
                                          </b>
                                        </b>
                                        <b style="color: green;" v-if="x.levelapp == '9'">
                                          <b>
                                            <span class="distance"><b>Sequence Approval</b></span>
                                          </b>
                                        </b>
                                        <b style="color: orange;" v-if="x.levelapp == '2'">
                                          <b>
                                            <span class="distance"><b>Upper Approval</b></span>
                                          </b>
                                        </b>
                                        <b style="color: yellowgreen;" v-if="x.levelapp == '7'">
                                          <b>
                                            <span class="distance"><b>Last Approval</b></span>
                                          </b>
                                        </b>
                                        <b style="color: burlywood;" v-if="x.levelapp == '0'">
                                          <b>
                                            <span class="distance"><b>Upper Authorized</b></span>
                                          </b>
                                        </b>
                                      </td>
                                      <td class="text-left">{{x.remark}}</td>
                                      <td class="text-left">{{x.cust_name}}</td>
                                      <td v-on:click="showModalFile(x)" class="text-center">{{x.attach_lile}}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12 col-sm-12 col-xs-12">
                          <pagination class="pull-left" ref="pagingW" @page-change="pageChange($event.page, 'Waiting')" v-show="displayW.length > 0"></pagination>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Approve Upper -->
                  <div class="tab-pane animated fadeIn" :class="{'active': mainTabSelected == 'header_tab3'}">
                    <div class="padding-detail">
                      <div class="row">
                        <div class="col-lg-2">
                          <div class="form-group">
                            <label v-text="ui.search_by || 'ค้นหาโดย'"></label>
                            <select class="form-control input-sm" v-model="select_s">
                              <option value="DocNo">Document No.</option>
                              <option value="vender">Supplier</option>
                              <option value="Doctype">Document Type.</option>
                            </select>
                          </div>
                        </div>
                        <div class="col-lg-3">
                          <div class="form-group">
                            <label v-text="ui.search || 'ค้นหา'"></label>
                            <div class="input-group">
                              <input v-if="select_s=='DocNo'" type="text" class="form-control input-sm" v-model.trim="searchDocNo" @keyup.enter="loadRetrieveU()" />
                              <input v-if="select_s=='vender'" type="text" class="form-control input-sm" v-model.trim="searchvender" @keyup.enter="loadRetrieveU()" />
                              <input v-if="select_s=='Doctype'" type="text" class="form-control input-sm" v-model.trim="searchDoctype" @keyup.enter="loadRetrieveU()" />
                              <span class="input-group-btn">
                                <button class="btn btn-sm bg-navy" @click="loadRetrieveU()"><i class="fas fa-search"></i></button>
                                <button class="btn btn-sm btn-default" @click="searchDocNo='';"><i class="fa fa-times"></i></button>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-lg-12 col-md-12">
                          <div class="row">
                            <div class="col-lg-12 col-md-12">
                              <div class="row">
                                <div class="col-lg-12 col-md-12">
                                  <div class="table-responsive" id="tableFixed">
                                    <table class="table table-bordered table-hover">
                                      <thead>
                                        <tr class="text-center">
                                          <!--<th class="tf-2">No.</th>-->
                                          <th class="tf-4">Approve</th>
                                          <th class="tf-3">Status</th>
                                          <th class="tf-3-5">Document No.</th>
                                          <th class="tf-3-5">Paid Amount</th>
                                          <th class="tf-3-5">Amount</th>
                                          <th class="tf-3-5">VAT</th>
                                          <th class="tf-3-5">VAT Amount</th>
                                          <th class="tf-3-5">Total</th>
                                          <th class="tf-2-5">Currency</th>
                                          <th class="tf-3-5">Document Date</th>
                                          <th class="tf-3-5">Approve Date</th>
                                          <th class="tf-3-5"><!--Project/Department No.--></th>
                                          <th class="tf-4">Project/Department</th>
                                          <th class="tf-3-5">Room</th>
                                          <th class="tf-3">By</th>
                                          <th class="tf-3-5">Level</th>
                                          <th class="tf-5">Remark</th>
                                          <th class="tf-4">Supplier</th>
                                          <th class="tf-3">Attach</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr v-for="(x,idx) in displayU" style="cursor:pointer">
                                          <!--<td class="text-center">{{idx+1}}</td>-->
                                          <td>
                                            <
                                            <span class="radio radio-inline">
                                              <label>
                                                <input type="radio" name="status1" value="Y" v-model="x.status2" v-on:click="onApproveU(x, 'Y');ProCdateU(x);" />
                                                <input v-show="false" type="checkbox" name="status2" true-value="Y" v-model="x.status2" v-on:click="onApproveU(x, 'Y')" disabled>
                                                <span class="cr"><i class="cr-icon fas fa-circle" v-if="x.status2 == 'Y'"></i></span>
                                                Approve
                                              </label>
                                            </span>
                                            <span class="radio radio-inline">
                                              <label>
                                                <input type="radio" name="status2" value="C" v-model="x.status2" v-on:click="onApproveU(x, 'C');modalRemarkU(x.prno);" />
                                                <input v-show="false" type="checkbox" name="status2" true-value="C" v-model="x.status2" v-on:click="onApproveU(x, 'C');modalRemarkU(x.prno);" disabled>
                                                <span class="cr"><i class="cr-icon fas fa-circle" v-if="x.status2 == 'C'"></i></span>
                                                Reject
                                              </label>
                                            </span>
                                            <span class="radio radio-inline">
                                              <label>
                                                <input type="radio" name="status3" value="N" v-model="x.status2" v-on:click="onApproveU(x, 'N');ProCdateClU(x);" />
                                                <input v-show="false" type="checkbox" name="status2" true-value="N" v-model="x.status2" v-on:click="onApproveU(x, 'N')" disabled>
                                                <span class="cr"><i class="cr-icon fas fa-circle" v-if="x.status2 == 'N'"></i></span>
                                                None
                                              </label>
                                            </span>
                                          </td>
                                          <td class="text-center">{{x.doctype2}}</td>
                                          <td class="text-left">
                                            <!--<a href="#" @click.prevent="modalStatus(x.prno,x.doctype)">{{x.prno}}</a>-->
                                            <a href="#" @click.prevent="pushpage(x)">{{x.prno}}</a>
                                          </td>
                                          <td align="right">{{(x.paidamt || 0) | number(2)}}</td>
                                          <td align="right">{{(x.tamt || 0) | number(2)}}</td>
                                          <td align="center">
                                            <span v-if="x.vattype == 'E'">Exclude Vat</span>
                                            <span v-if="x.vattype == 'I'">Include Vat</span>
                                            <span v-if="x.vattype == 'N'">Not Vat<</span>
                                          </td>
                                          <td align="right">{{(x.vatamt || 0) | number(2)}}</td>
                                          <td align="right">{{(x.totamt || 0) | number(2)}}</td>
                                          <td class="text-center">{{x.curren}}</td>
                                          <td class="text-center">{{x.docdate|date('DD/MM/YYYY')}}</td>
                                          <td class="text-center">{{x.apdate|date('DD/MM/YYYY')}}</td>
                                          <td class="text-left"><!--{{x.pre_event2}}--></td>
                                          <td v-if="x.pre_des">{{x.pre_des}}({{x.refcode}})</td>
                                          <td v-if="!x.pre_des"></td>
                                          <td class="text-left">{{x.room}}</td>
                                          <td class="text-left">{{x.username}}</td>
                                          <td class="text-left">
                                            <b v-if="x.levelapp == '5'">
                                              <b>
                                                <span class="distance"><b>Review</b></span>
                                              </b>
                                            </b>
                                            <b style="color: green;" v-if="x.levelapp == '9'">
                                              <b>
                                                <span class="distance"><b>Sequence Approval</b></span>
                                              </b>
                                            </b>
                                            <b style="color: orange;" v-if="x.levelapp == '2'">
                                              <b>
                                                <span class="distance"><b>Upper Approval</b></span>
                                              </b>
                                            </b>
                                            <b style="color: yellowgreen;" v-if="x.levelapp == '7'">
                                              <b>
                                                <span class="distance"><b>Last Approval</b></span>
                                              </b>
                                            </b>
                                            <b style="color: burlywood;" v-if="x.levelapp == '0'">
                                              <b>
                                                <span class="distance"><b>Upper Authorized</b></span>
                                              </b>
                                            </b>
                                          </td>
                                          <td class="text-left">{{x.remark}}</td>
                                          <td class="text-left">{{x.cust_name}}</td>
                                          <td v-on:click="showModalFile(x)" class="text-center">{{x.attach_lile}}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12 col-sm-12 col-xs-12">
                          <pagination class="pull-left" ref="pagingU" @page-change="pageChange($event.page, 'Upper')" v-show="displayU.length > 0"></pagination>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Approve Cancel -->
                  <div class="tab-pane animated fadeIn" :class="{'active': mainTabSelected == 'header_tab4'}">
                    <div class="padding-detail">
                      <div class="row">
                        <div class="col-lg-2">
                          <div class="form-group">
                            <label v-text="ui.search_by || 'ค้นหาโดย'"></label>
                            <select class="form-control input-sm" v-model="select_s">
                              <option value="DocNo">Document No.</option>
                              <option value="vender">Supplier</option>
                              <option value="Doctype">Document Type.</option>
                            </select>
                          </div>
                        </div>
                        <div class="col-lg-3">
                          <div class="form-group">
                            <label v-text="ui.search || 'ค้นหา'"></label>
                            <div class="input-group">
                              <input v-if="select_s=='DocNo'" type="text" class="form-control input-sm" v-model.trim="searchDocNo" @keyup.enter="loadRetrieveC()" />
                              <input v-if="select_s=='vender'" type="text" class="form-control input-sm" v-model.trim="searchvender" @keyup.enter="loadRetrieveC()" />
                              <input v-if="select_s=='Doctype'" type="text" class="form-control input-sm" v-model.trim="searchDoctype" @keyup.enter="loadRetrieveC()" />
                              <span class="input-group-btn">
                                <button class="btn btn-sm bg-navy" @click="loadRetrieveC()"><i class="fas fa-search"></i></button>
                                <button class="btn btn-sm btn-default" @click="searchDocNo='';"><i class="fa fa-times"></i></button>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-lg-12 col-md-12">
                          <div class="row">
                            <div class="col-lg-12 col-md-12">
                              <div class="row">
                                <div class="col-lg-12 col-md-12">
                                  <div class="table-responsive" id="tableFixed">
                                    <table class="table table-bordered table-hover">
                                      <thead>
                                        <tr class="text-center">
                                          <!--<th class="tf-2">No.</th>-->
                                          <th class="tf-4">Approve</th>
                                          <th class="tf-3">Status</th>
                                          <th class="tf-3-5">Document No.</th>
                                          <th class="tf-3-5">Paid Amount</th>
                                          <th class="tf-3-5">Amount</th>
                                          <th class="tf-3-5">VAT</th>
                                          <th class="tf-3-5">VAT Amount</th>
                                          <th class="tf-3-5">Total</th>
                                          <th class="tf-2-5">Currency</th>
                                          <th class="tf-3-5">Document Date</th>
                                          <th class="tf-3-5">Approve Date</th>
                                          <!--<th class="tf-3-5">Project/Department No.</th>-->
                                          <th class="tf-4">Project/Department</th>
                                          <th class="tf-3-5">Room</th>
                                          <th class="tf-3">By</th>
                                          <th class="tf-3-5">Level</th>
                                          <th class="tf-5">Remark</th>
                                          <th class="tf-4">Supplier</th>
                                          <th class="tf-3">Attach</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr v-for="(x,idx) in displayC" style="cursor:pointer">
                                          <!--<td class="text-center">{{idx+1}}</td>-->
                                          <td>
                                            <span class="radio radio-inline">
                                              <label>
                                                <input type="radio" name="status1" value="Y" v-model="x.status2" v-on:click="onApproveCh(x, 'Y');" />
                                                <input v-show="false" type="checkbox" name="status2" true-value="Y" v-model="x.status2" v-on:click="onApprove(x, 'Y');" disabled>
                                                <span class="cr"><i class="cr-icon fas fa-circle" v-if="x.status2 == 'Y'"></i></span>
                                                Cancel
                                              </label>
                                            </span>
                                            <span class="radio radio-inline">
                                              <label>
                                                <input type="radio" name="status2" value="C" v-model="x.status2" v-on:click="onApproveCh(x, 'C');modalRemarkC(x.prno);" />
                                                <input v-show="false" type="checkbox" name="status2" true-value="C" v-model="x.status2" v-on:click="onApprove(x, 'C')" disabled>
                                                <span class="cr"><i class="cr-icon fas fa-circle" v-if="x.status2 == 'C'"></i></span>
                                                Reject
                                              </label>
                                            </span>
                                          </td>
                                          <td class="text-center">{{x.doctype2}}</td>
                                          <td class="text-left">
                                            <!--<a href="#" @click.prevent="modalStatus(x.prno,x.doctype)">{{x.prno}}</a>-->
                                            <a href="#" @click.prevent="pushpage(x)">{{x.prno}}</a>
                                          </td>
                                          <td align="right">{{(x.paidamt || 0) | number(2)}}</td>
                                          <td align="right">{{(x.tamt || 0) | number(2)}}</td>
                                          <td align="center">
                                            <span v-if="x.vattype == 'E'">Exclude Vat</span>
                                            <span v-if="x.vattype == 'I'">Include Vat</span>
                                            <span v-if="x.vattype == 'N'">Not Vat<</span>
                                          </td>
                                          <td align="right">{{(x.vatamt || 0) | number(2)}}</td>
                                          <td align="right">{{(x.totamt || 0) | number(2)}}</td>
                                          <td class="text-center">{{x.curren}}</td>
                                          <td class="text-center">{{x.docdate|date('DD/MM/YYYY')}}</td>
                                          <td class="text-center">{{x.apdate|date('DD/MM/YYYY')}}</td>
                                          <!--<td class="text-left">{{x.pre_event2}}</td>-->
                                          <td v-if="x.pre_des">{{x.pre_des}}({{x.refcode}})</td>
                                          <td v-if="!x.pre_des"></td>
                                          <td class="text-left">{{x.room}}</td>
                                          <td class="text-left">{{x.username}}</td>
                                          <td class="text-left">
                                            <b v-if="x.levelapp == '5'">
                                              <b>
                                                <span class="distance"><b>Review</b></span>
                                              </b>
                                            </b>
                                            <b style="color: green;" v-if="x.levelapp == '9'">
                                              <b>
                                                <span class="distance"><b>Sequence Approval</b></span>
                                              </b>
                                            </b>
                                            <b style="color: orange;" v-if="x.levelapp == '2'">
                                              <b>
                                                <span class="distance"><b>Upper Approval</b></span>
                                              </b>
                                            </b>
                                            <b style="color: yellowgreen;" v-if="x.levelapp == '7'">
                                              <b>
                                                <span class="distance"><b>Last Approval</b></span>
                                              </b>
                                            </b>
                                            <b style="color: burlywood;" v-if="x.levelapp == '0'">
                                              <b>
                                                <span class="distance"><b>Upper Authorized</b></span>
                                              </b>
                                            </b>
                                          </td>
                                          <td class="text-left">{{x.remark}}</td>
                                          <td class="text-left">{{x.cust_name}}</td>
                                          <td v-on:click="showModalFile(x)" class="text-center">{{x.attach_lile}}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12 col-sm-12 col-xs-12">
                          <pagination class="pull-left" ref="pagingC" @page-change="pageChange($event.page, 'Cancel')" v-show="displayC.length > 0"></pagination>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Remark -->
        <div class="modal fade" ref="myModalRemark" role="dialog">
          <div class="modal-dialog " style="width: 50% !important; height: 50% !important;">
            <div class="modal-content">
              <div class="modal-header" style="background-color: #222d32">
                <h4 style="margin: 0px;color: white">Docno: {{remark_reject}}</h4>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-lg-12 col-md-12 col-sm-12">
                    <label>Remark: </label>
                    <textarea v-for="(x,idx) in h_data" v-if="x.prno == remark_reject" v-model="x.remark_cancel" class="form-control input-sm"></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer" style="background-color: #e8e8e8;">
                <button class="btn btn-sm btn-success" data-dismiss="modal"><i class="fas fa-save"></i> <span v-text="ui.save || 'Save'"></span></button>
                <button type="button" class="btn btn-danger" data-dismiss="modal" v-on:click="REremark()"><i class="fa fa-remove">&nbsp;Close</i></button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal fade" ref="myModalRemarkU" role="dialog">
          <div class="modal-dialog " style="width: 50% !important; height: 50% !important;">
            <div class="modal-content">
              <div class="modal-header" style="background-color: #222d32">
                <h4 style="margin: 0px;color: white">Docno: {{remark_reject}}</h4>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-lg-12 col-md-12 col-sm-12">
                    <label>Remark: </label>
                    <textarea v-for="(x,idx) in h_dataU" v-if="x.prno == remark_reject" v-model="x.remark_cancel" class="form-control input-sm"></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer" style="background-color: #e8e8e8;">
                <button class="btn btn-sm btn-success" data-dismiss="modal"><i class="fas fa-save"></i> <span v-text="ui.save || 'Save'"></span></button>
                <button type="button" class="btn btn-danger" data-dismiss="modal" v-on:click="REremark()"><i class="fa fa-remove">&nbsp;Close</i></button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal fade" ref="myModal" role="dialog">
          <div class="modal-dialog " style="width: 50% !important; height: 50% !important;">
            <div class="modal-content">
              <div class="modal-header" style="background-color: #222d32">
                <h4 style="margin: 0px;color: white">Docno: {{prno_l}}</h4>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-lg-12 col-md-12 col-sm-12">
                    <div class="table-responsive">
                      <table class="table table-bordered table-hover" style="border-top: 5px solid #e8e8e8;" v-for="(x,idx) in l_data">
                        <tr>
                          <td style="width: 1%;padding: 15px;"></td>
                          <td style="padding: 15px;">
                            คุณ: {{x.empname_t}} <br />
                            (<span v-if="x.levelapp == '5'"><b>Review</b></span>
                            <span v-if="x.levelapp == '9'" style="color: green;"><b>Sequence Approval</b></span>
                            <span v-if="x.levelapp == '2'" style="color: orange;"><b>Upper Approval</b></span>
                            <span v-if="x.levelapp == '7'" style="color: yellowgreen;"><b>Last Approval</b></span>
                            <span v-if="x.levelapp == '0'" style="color: burlywood;"><b>Upper Authorized</b></span>
                            )
                          </td>
                          <td class="text-center" style="width: 10%; padding: 15px;" v-if="x.seqapp == 'Y' && x.status == 'Y'">
                            <i class="fas fa-check-circle" style="color: green"></i><br />
                            อนุมัติแล้ว
                          </td>
                          <td class="text-center" style="width: 10%; padding: 15px;" v-if="x.seqapp == 'N' && x.status == 'Y'">
                            <i class="fas fa-check-circle" style="color: green"></i><br />
                            อนุมัติแล้ว
                          </td>
                          <td class="text-center" style="width: 10%; padding: 15px;" v-if="x.seqapp == 'Y' && x.status == 'N'">
                            <i class="fas fa-clock" style="color: green"></i><br />
                            รออนุมัติ
                          </td>
                          <td class="text-center" style="width: 10%; padding: 15px;" v-if="x.seqapp == 'N' && x.status == 'N'">
                            <i class="fas fa-clock" style="color: green"></i><br />
                            รออนุมัติ
                          </td>
                        </tr>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer" style="background-color: #e8e8e8;">
                <button type="button" class="btn btn-danger" data-dismiss="modal"><i class="fa fa-remove">&nbsp;Close</i></button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal fade" ref="retrieveModalShowFile" role="dialog">
          <div class="modal-dialog " style="width: 80% !important; height: 80% !important;">
            <!-- Modal content-->
            <div class="modal-content">
              <div class="modal-header" style="background-color: #222d32">
                <h4 style="margin: 0px;color: white">Docno: {{prno_l}}</h4>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-6 col-sm-6">
                    <div class="table-responsive" style="min-height:450px;height:450px">
                      <table class="table table-bordered table-striped table-hover" style="min-width:1000px;overflow:auto;">
                        <thead>
                          <tr class="text-center">
                            <!--<th style="width:1%">Manage</th>-->
                            <th style="width:1%">No.</th>
                            <!--<th style="width:2%">Group Doc.</th>-->
                            <th style="width:5%">Description</th>
                            <th style="width:3%">File Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(x,idx) in file_upload" style="cursor:pointer">
                            <!--<td class="text-center">
                                <a href="#" v-on:click.prevent="spliceFile(idx,x)"><i class="fas fa-trash font-bold text-danger" style="font-size:14px"></i></a>&nbsp;
                                <a v-bind:href="'@(Url.Content(" ~/Home/Download?id="))'+x.pathto"><i class="fas fa-download font-bold text-primary" style="font-size:14px"></i></a>
                            </td>-->
                            <td class="text-center">{{idx+1}}</td>
                            <td>
                              <textarea class="form-control input-sm" v-model="x.docdesc"></textarea>
                            </td>
                            <td><a href="#" v-on:click.prevent="sendShowFile(x)">{{x.docfilename}}</a></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div class="col-6 col-sm-6" style="border:1px solid;min-height:700px;height:700px">
                    <div class="row">
                      <div class="col-4 col-sm-4">
                        &nbsp;
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-12 col-sm-12">
                        <div class="text-center">
                          Preview File (ตัวอย่างไฟล์)
                          <img class="img-responsive rounded" v-if="['png','jpeg','jpg'].includes(getFileExt(getFileName)) && currentFile == 1" style="width:100%;height:auto" v-bind:src="createFilePath(getShowFile)" />
                          <div v-if="!['png','jpeg','jpg','pdf'].includes(getFileExt(getFileName)) && currentFile == 1">
                            <i class="fa fa-file-word-o fa-5x" v-if="['doc','docx'].includes(getFileExt(getFileName))"></i>
                            <i class="fa fa-file-excel-o fa-5x" v-else-if="['xls','xlsx'].includes(getFileExt(getFileName))"></i>
                            <i class="fa fa-file-powerpoint-o fa-5x" v-else-if="['ppt','pptx'].includes(getFileExt(getFileName))"></i>
                            <h3>No Display in area, please download file (ไม่สามารถแสดงผลที่นี้ได้ กรุณาดาวน์โหลดไฟล์ของท่าน)</h3>
                          </div>
                          <div v-if="['pdf'].includes(getFileExt(getFileName)) && currentFile == 1">
                            <object :data="createFilePath(getShowFile)" type="application/pdf" style="width:100%;height:650px"></object>
                            <!--<object data="" v-bind:data="'@(Url.Content(" ~/Home/Show?id="))'+ getShowFile" type="application/pdf" style="width:100%;height:650px"></object>-->
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer" style="background-color: #e8e8e8;">
                <button type="button" class="btn btn-danger" data-dismiss="modal" v-on:click="recancel()"><i class="fa fa-remove">&nbsp;Close</i></button>
              </div>
            </div>
          </div>
        </div>
        <!-- Show Follow Status -->
        <div class="modal fade" data-backdrop="static" data-keyboard="false" ref="retrieveStatus">
          <div class="modal-dialog full-modal-dialog">
            <div class="modal-content full-modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 style="margin: 5px;color: white">Docno: {{prno_l}}</h4>&nbsp;&nbsp;
                Size :
                <a v-on:click="sizeset('x1')" style="color: white;cursor:pointer;">x1 |</a>
                <a v-on:click="sizeset('x2')" style="color: white;cursor:pointer;">x2 |</a>
                <a v-on:click="sizeset('x3')" style="color: white;cursor:pointer;">x3</a>
              </div>

              <div class="modal-body">
                <iframe v-if="prno_doctype == 'OTH'" id="tabContent" v-bind:src="`${baseUrl}page/transaction/of/v_of_trn100?docno=${prno_l}&view=Y`" style="width: 100%;height: 100%"></iframe>
                <iframe v-if="prno_doctype == 'PR'" id="tabContentPR" v-bind:src="`${baseUrl}page/transaction/of/v_of_trn200?docno=${prno_l}&view=Y`" style="width: 100%;height: 100%;"></iframe>
                <iframe v-if="prno_doctype != 'PR'&&prno_doctype != 'OTH'" id="tabContentPR" v-bind:src="`${baseUrl}page/pagetest?docno=${prno_l}&doctype2=${prno_doctype}`" style="width: 100%;height: 100%"></iframe>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-sm btn-default" data-dismiss="modal"><i class="fas fa-times-circle"></i> ปิดหน้าต่าง</button>
              </div>
            </div>
          </div>
        </div>
        <!-- Remark Cancel -->
        <div class="modal fade" ref="myModalRemarkC" role="dialog">
          <div class="modal-dialog " style="width: 50% !important; height: 50% !important;">

            <!-- Modal content-->

            <div class="modal-content">
              <div class="modal-header" style="background-color: #222d32">
                <h4 style="margin: 0px;color: white">Docno: {{remark_reject}}</h4>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-lg-12 col-md-12 col-sm-12">
                    <label>Remark: </label>
                    <textarea v-for="(x,idx) in h_dataC" v-if="x.prno == remark_reject" v-model="x.remark_cancel" class="form-control input-sm"></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer" style="background-color: #e8e8e8;">
                <button class="btn btn-sm btn-success" data-dismiss="modal"><i class="fas fa-save"></i> <span v-text="ui.save || 'Save'"></span></button>
                <button type="button" class="btn btn-danger" data-dismiss="modal" v-on:click="REremark()"><i class="fa fa-remove">&nbsp;Close</i></button>
              </div>
            </div>
          </div>
        </div>
        <!-- Remark Reject -->
        <div class="modal fade" ref="myModalRemarkJ" role="dialog">
          <div class="modal-dialog " style="width: 50% !important; height: 50% !important;">

            <!-- Modal content-->

            <div class="modal-content">
              <div class="modal-header" style="background-color: #222d32">
                <h4 style="margin: 0px;color: white">Docno: {{remark_reject}}</h4>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-lg-12 col-md-12 col-sm-12">
                    <label>Remark: </label>
                    <textarea v-for="(x,idx) in h_dataC" v-if="x.prno == remark_reject" v-model="x.remark_cancel" class="form-control input-sm"></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer" style="background-color: #e8e8e8;">
                <button class="btn btn-sm btn-success" data-dismiss="modal"><i class="fas fa-save"></i> <span v-text="ui.save || 'Save'"></span></button>
                <button type="button" class="btn btn-danger" data-dismiss="modal" v-on:click="REremark()"><i class="fa fa-remove">&nbsp;Close</i></button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </re-page>
  </div>
</template>

<script>
  let page = {};
  let pagingW = {};
  let pagingD = {};
  let pagingU = {};
  let pagingC = {};
  let cpn = {
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        xt: $xt,
        d: new Date(),
        displayData: [],
        sort_status: 'W',
        displayW: [],
        displayD: [],
        displayU: [],
        displayC: [],
        sort_key: '',
        sort_type: 'desc',
        tabSelected: 'tab2',
        tabHeader: [],
        h_data: {},
        h_dataW: {},
        h_dataU: {},
        h_dataC: {},
        l_data: {},
        file_upload: {},
        cha_data: {},
        status_rc: 'N',
        show: true,
        prno_n: "prno",
        prno_l: "",
        prno_doctype: "",
        doctype_l: "",
        cha_data_pro: "",
        cha_data_exp: "",
        cha_data_pri: "",
        cha_data_detail: "",
        cha_data_unit: "",
        Woheader2: "",
        curren: "",
        remark_reject: "",
        getShowFile: "",
        getFileName: "",
        currentFile: 0,
        Prsum: 0,
        select_s: "DocNo",
        searchDocNo: "",
        searchvender: "",
        searchDoctype: "",
        start_date: "",
        end_date: "",
        remark_cancel: "",
        sumpoamt: 0,
        sumpovatamt: 0,
        sumponetamt: 0,
        sumdnponetamt: 0,
        sumtot_decrement: 0,
        headerTab: [
          { id: 'header_tab1', icon: 'fa-pencil-alt', text: 'Approve Document', show: true },
          { id: 'header_tab2', icon: 'fa-clock', text: 'Approve Waiting', show: true },
          { id: 'header_tab3', icon: 'fa-level-up-alt', text: 'Approve Upper', show: true },
          { id: 'header_tab4', icon: 'fa-ban', text: 'Cancel Authorized Signature', show: true },
        ],
        mainTabSelected: "",
        loadCount: {
          c1: 0,
          c2: 0,
          c3: 0,
          c4: 0,
        },
      };
    },
    methods: {
      pushpage(x) {
        //window.open(baseUrl + `page/${control}?docno=${x.prno}&doctype2=${x.doctype}`, '_blank');
        switch (x.doctype) {
          case "OTH": {
            window.open(baseUrl + `page/transaction/of/v_of_trn100?docno=${x.prno}`, '_blank');
          } break;
          case "PR": {
            window.open(baseUrl + `page/transaction/of/v_of_trn200?docno=${x.prno}`, '_blank');
          } break;
          case "RE_BOT": {
            window.open(baseUrl + `page/pagetest?docno=${x.prno}&doctype2=${x.doctype}`, '_blank');
          } break;
          case "RE_PRO": {
            window.open(baseUrl + `page/pagetest?docno=${x.prno}&doctype2=${x.doctype}`, '_blank');
          } break;
          case "RE_CON": {
            window.open(baseUrl + `page/pagetest?docno=${x.prno}&doctype2=${x.doctype}`, '_blank');
          } break;
          case "RE_CHA": {
            window.open(baseUrl + `page/pagetest?docno=${x.prno}&doctype2=${x.doctype}`, '_blank');
          } break;
          case "RE_CANCEL": {
            window.open(baseUrl + `page/pagetest?docno=${x.prno}&doctype2=${x.doctype}`, '_blank');
          } break;
          case "RE_RIGHT": {
            window.open(baseUrl + `page/pagetest?docno=${x.prno}&doctype2=${x.doctype}`, '_blank');
          } break;
          case "PO": {
            window.open(baseUrl + `page/pagetest?docno=${x.prno}&doctype2=${x.doctype}`, '_blank');
          } break;
          case "BIL": {
            window.open(baseUrl + `page/pagetest?docno=${x.prno}&doctype2=${x.doctype}`, '_blank');
          } break;
          case "WO": {
            window.open(baseUrl + `page/pagetest?docno=${x.prno}&doctype2=${x.doctype}`, '_blank');
          } break;
        }

      },

      ProCdate(x) {
        $linq(this.h_data).where(v => v.prno == x.prno).foreach(x => {
          x.apdate = new Date();
        });
      },
      ProCdateCl(x) {
        $linq(this.h_data).where(v => v.prno == x.prno).foreach(x => {
          x.apdate = "";
        });
      },
      ProCdateU(x) {
        $linq(this.h_dataU).where(v => v.prno == x.prno).foreach(x => {
          x.apdate = new Date();
        });
      },
      ProCdateClU(x) {
        $linq(this.h_dataU).where(v => v.prno == x.prno).foreach(x => {
          x.apdate = "";
        });
      },
      createFilePath(x) {
        return dataServer + "Api/File/DownLoad?id=" + x;
      },
      async SaveChangeC(xr, prno) {
        try {
          var prno_l = "";
          $linq(this.h_dataC).foreach(x => {
            if (x.status2 == "C") {
              if (!x.remark_cancel) {
                this.prno_l = x.prno;
                prno_l = x.prno;
                return this.modalRemarkJ(x.prno);
              }
            }
            //if (x.status2 == "Y") {
            //  if (!x.remark_cancel) {
            //    this.prno_l = x.prno;
            //    prno_l = x.prno;
            //    return this.modalRemarkC(x.prno);
            //  }
            //}
          });
          let f = {
            h_data: this.h_dataC
          };
          if (prno_l == "") {
            let element = this.$refs.modalRemarkJ
            $(element).modal('hide')
            let element2 = this.$refs.modalRemarkC
            $(element2).modal('hide')
            let f = {
              form: this.h_dataC,
            };
            let form = f;
            let act = `Approve_App/Approve/cancle_update`;
            //page.loadingBox.show();
            let rsp = await $xt.postServerJson(act, form);
            if (rsp.success) {
              //$msg.alert(``, `Success Approve Document`, `success`);
              //$notify.success("Success Approve");
              //this.SaveChangeU();
              this.loadRetrieveC();
            } else {
              $msg.alert(``, rsp.error, `danger`);
            }
          }
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          //page.loadingBox.hide();
        }
      },
      async SaveChangeU() {
        try {
          var prno_l = "";
          $linq(this.h_dataU).foreach(x => {
            if (x.status2 == "C") {
              if (!x.remark_cancel) {
                this.prno_l = x.prno;
                prno_l = x.prno;
                return this.modalRemarkU(x.prno);
              }
              if (this.remark_reject == x.prno && x.remark_cancel) {
                prno_l = "";
              }
            }
            //else {
            //  this.prno_l = "";
            //}
          });

          if (prno_l == "") {
            let element = this.$refs.myModalRemarkU
            $(element).modal('hide')
            let f = {
              form: this.h_dataU,
            };
            let form = f;
            let act = `Approve_App/Approve/Approve_review_Update`;
            //page.loadingBox.show();
            let rsp = await $xt.postServerJson(act, form);
            if (rsp.success) {
              //$msg.alert(``, `Success Approve Upper`, `success`);
              $notify.success("Success Approve");
              this.remark_reject = "";
              this.loadRetrieve();
              this.loadRetrieveU();
            } else {
              $msg.alert(``, rsp.error, `danger`);
            }
          }
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          //page.loadingBox.hide();
        }
      },
      async SaveChange(prno) {
        try {
          var prno_l = "";
          $linq(this.h_data).foreach(x => {
            if (x.status2 == "C") {
              if (!x.remark_cancel) {
                this.prno_l = x.prno;
                prno_l = x.prno;
                return this.modalRemark(x.prno);
              }
              if (this.remark_reject == x.prno && x.remark_cancel) {
                prno_l = "";
              }
            }
            //else {
            //  this.prno_l = "";
            //}
          });
          if (prno_l == "") {
            let element = this.$refs.myModalRemark
            $(element).modal('hide')
            let f = {
              form: this.h_data,
            };
            let form = f;
            let act = `Approve_App/Approve/Approve_review_Update`;
            //page.loadingBox.show();
            let rsp = await $xt.postServerJson(act, form);
            if (rsp.success) {
              //$msg.alert(``, `Success Approve Document`, `success`);
              //$notify.success("Success Approve");
              this.SaveChangeU();
              this.SaveChangeC();
            } else {
              $msg.alert(``, rsp.error, `danger`);
            }
          }
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          //page.loadingBox.hide();
        }
      },
      sum() {
        var totalpoamt = 0;
        var totalpovatamt = 0;
        var totalponetamt = 0;
        var totaldnponetamt = 0;
        var totaltot_decrement = 0;
        for (var i = 0; i < this.cha_data_detail.length; i++) {
          var data = this.cha_data_detail[i];

          totalpoamt += data.poamt;
          totalpovatamt += data.povatamt;
          totalponetamt += data.ponetamt;
          totaldnponetamt += data.dnponetamt;
          totaltot_decrement += data.tot_decrement;
        }
        this.sumpoamt = totalpoamt;
        this.sumpovatamt = totalpovatamt;
        this.sumponetamt = totalponetamt;
        this.sumdnponetamt = totaldnponetamt;
        this.sumtot_decrement = totaltot_decrement;
      },
      async loadRetrieveW() {
        let url = `Approve_App/Approve/Approve_waiting_Readlist?searchDocNo=${this.searchDocNo}&searchvender=${this.searchvender}&searchDoctype=${this.searchDoctype}`;
        let resp = await $xt.getServer(url);
        this.$set(this, 'h_dataW', resp.data);
        pagingW.setTotalItems(resp.total || 1);
        this.pageChange(1, 'Waiting');
        //$linq(this.h_dataW).foreach(x => {
        //  x.docdate = moment(x.docdate).format("DD/MM/YYYY");
        //});
      },
      async loadRetrieveU() {
        let url = `Approve_App/Approve/Approve_upper_Readlist?searchDocNo=${this.searchDocNo}&searchvender=${this.searchvender}&searchDoctype=${this.searchDoctype}`;
        let resp = await $xt.getServer(url);
        this.$set(this, 'h_dataU', resp.data);
        //$linq(this.h_dataU).foreach(x => {
        //  x.docdate = moment(x.docdate).format("DD/MM/YYYY");
        //});
        pagingU.setTotalItems(resp.total || 1);
        this.pageChange(1, 'Upper');
      },
      async loadRetrieveC() {
        let url = `Approve_App/Approve/Approve_cancle_Readlist?searchDocNo=${this.searchDocNo}&searchvender=${this.searchvender}&searchDoctype=${this.searchDoctype}`;
        let resp = await $xt.getServer(url);
        this.$set(this, 'h_dataC', resp.data);
        //$linq(this.h_dataC).foreach(x => {
        //  x.docdate = moment(x.docdate).format("DD/MM/YYYY");
        //});
        pagingC.setTotalItems(resp.total || 1);
        this.pageChange(1, 'Cancel');
      },
      clickTabSelected(x, keyword) {
        switch (keyword) {
          case "main":
            this.mainTabSelected = x;
            break;
        }

        if (this.mainTabSelected == 'header_tab1' && this.loadCount.c1 == 0) {
          this.loadCount.c1++;
          this.loadRetrieve();
        }
        if (this.mainTabSelected == 'header_tab2' && this.loadCount.c2 == 0) {
          this.loadCount.c2++;
          this.loadRetrieveW();
        }
        if (this.mainTabSelected == 'header_tab3' && this.loadCount.c3 == 0) {
          this.loadCount.c3++;
          this.loadRetrieveU();
        }
        if (this.mainTabSelected == 'header_tab4' && this.loadCount.c4 == 0) {
          this.loadCount.c4++;
          this.loadRetrieveC();
        }
      },
      getFileExt(f) {
        return f.split('.').pop();
      },
      sendShowFile(x) {
        this.getShowFile = x.pathto;
        this.getFileName = x.docfilename;
        this.currentFile = 1;
        //console.log(JSON.stringify(x));
      },
      recancel() {
        this.getShowFile = "";
        this.getFileName = "";
        this.currentFile = "";
      },
      modalRemark(prno) {
        let element = this.$refs.myModalRemark
        $(element).modal('show')
        this.remark_reject = prno;
      },
      modalRemarkC(prno) {
        let element = this.$refs.myModalRemarkC
        $(element).modal('show')
        this.remark_reject = prno;
      },
      modalRemarkJ(prno) {
        let element = this.$refs.myModalRemarkJ
        $(element).modal('show')
        this.remark_reject = prno;
      },
      modalRemarkU(prno) {
        let element = this.$refs.myModalRemarkU
        $(element).modal('show')
        this.remark_reject = prno;
      },
      ReRemark() {
        this.remark_reject = "";
      },
      async showModal(prno) {
        let url = `Approve_App/Approve/approve_loop?docno=${prno}`;
        let resp = await $xt.getServer(url);
        this.$set(this, 'l_data', resp.data);
        //$linq(this.h_data).foreach(x => {
        //    x.docdate = moment(x.docdate).format("DD/MM/YYYY");
        //});
        this.prno_l = prno;
        let element = this.$refs.myModal
        $(element).modal('show')
      },
      async showModalFile(x) {
        let url = `Approve_App/Approve/ap_file_Readlist?doctype=${x.doctype}&prno=${x.prno}&itemno=${x.refitemno}`;
        let resp = await $xt.getServer(url);
        this.$set(this, 'file_upload', resp.data);
        //$linq(this.h_data).foreach(x => {
        //    x.docdate = moment(x.docdate).format("DD/MM/YYYY");
        //});
        this.prno_l = x.prno;
        let element = this.$refs.retrieveModalShowFile
        $(element).modal('show')
      },
      async loadRetrieve() {
        let url = `Approve_App/Approve/Approve_review_Readlist?searchDocNo=${this.searchDocNo}&searchvender=${this.searchvender}&searchDoctype=${this.searchDoctype}`;
        let resp = await $xt.getServer(url);
        this.$set(this, 'h_data', resp.data);
        //$linq(this.h_data).foreach(x => {
        //  x.docdate = moment(x.docdate).format("DD/MM/YYYY");
        //});
        pagingD.setTotalItems(resp.total || 1);
        this.pageChange(1, 'Document');
      },
      modalStatus(prno, doctype) {
        this.prno_l = prno;
        this.prno_doctype = doctype;
        let element = this.$refs.retrieveStatus
        $(element).modal('show')
      },
      onApprove(item, wh) {
        this.h_data.forEach(dr => {
          if (item.doctype == "CRM") {
            if (dr.prno == item.prno && dr.itemno == item.itemno) {
              if (wh == "C") {
                dr.remark = null;
              } else {
                dr.remark = dr.remark2;
              }
              dr.status2 = wh;
            }
          } else {
            if (dr.prno == item.prno) {
              //if (wh == "C") {
              //  dr.remark = null;
              //} else {
              //  dr.remark = dr.remark2;
              //}
              dr.status2 = wh;
            }
          }
        });
      },
      onApproveU(item, wh) {
        this.h_dataU.forEach(dr => {
          if (item.doctype == "CRM") {
            if (dr.prno == item.prno && dr.itemno == item.itemno) {
              if (wh == "C") {
                dr.remark = null;
              } else {
                dr.remark = dr.remark2;
              }
              dr.status2 = wh;
            }
          } else {
            if (dr.prno == item.prno) {
              //if (wh == "C") {
              //  dr.remark = null;
              //} else {
              //  dr.remark = dr.remark2;
              //}
              dr.status2 = wh;
            }
          }
        });
      },
      onApproveCh(item, wh) {
        this.h_dataC.forEach(dr => {
          dr.status2 == wh;
        });
      },
      REremark() {
        this.prno_l = "";
      },
      sizeset(set) {
        if (set == "x3") {
          $(window).resize(() => {
            $("#tabContentPR").css({ "height": ($(window).height() - 50) + "px" });
          });
          $(window).trigger('resize');
        }
        if (set == "x2") {
          $(window).resize(() => {
            $("#tabContentPR").css({ "height": ($(window).height() - 110) + "px" });
          });
          $(window).trigger('resize');
        }
        if (set == "x1") {
          $(window).resize(() => {
            $("#tabContentPR").css({ "height": ($(window).height() - 190) + "px" });
          });
          $(window).trigger('resize');
        }
      },
      /* Method : Other Function */
      pageChange(pn, keyword) {
        switch (keyword) {
          case "Document":
            pn = pn || 1;
            pagingD.setCurrentPage(pn);

            this.displayD = $linq(this.h_data).skip(pagingD.skipItems()).take(pagingD.getItemsPerPage()).toArray();
            this.displayD.push()
            pagingD.createPagesArray();
            break;
          case "Waiting":
            pn = pn || 1;
            pagingW.setCurrentPage(pn);

            this.displayW = $linq(this.h_dataW).skip(pagingW.skipItems()).take(pagingW.getItemsPerPage()).toArray();
            this.displayW.push()
            pagingW.createPagesArray();
            break;
          case "Upper":
            pn = pn || 1;
            pagingU.setCurrentPage(pn);

            this.displayU = $linq(this.h_dataU).skip(pagingU.skipItems()).take(pagingU.getItemsPerPage()).toArray();
            this.displayU.push()
            pagingU.createPagesArray();
            break;
          case "Cancel":
            pn = pn || 1;
            pagingC.setCurrentPage(pn);

            this.displayC = $linq(this.h_dataC).skip(pagingC.skipItems()).take(pagingC.getItemsPerPage()).toArray();
            this.displayC.push()
            pagingC.createPagesArray();
            break;
        }
      },
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = 'Approve : อนุมัติเอกสาร';
      document.title = page.pageTitle;
      window.page = page;

      pagingW = this.$refs.pagingW;
      pagingW.setCurrentPage(1);
      pagingW.setItemsPerPage(15);

      pagingD = this.$refs.pagingD;
      pagingD.setCurrentPage(1);
      pagingD.setItemsPerPage(15);

      pagingU = this.$refs.pagingU;
      pagingU.setCurrentPage(1);
      pagingU.setItemsPerPage(15);

      pagingC = this.$refs.pagingC;
      pagingC.setCurrentPage(1);
      pagingC.setItemsPerPage(15);

      $('#1').slideUp(0);

      //this.mainTabSelected = "header_tab1";
      this.clickTabSelected('header_tab1', 'main');

      if (this.queryString.tabs) {
        this.mainTabSelected = this.queryString.tabs;
      }

      $(window).resize(() => {
        $("#tabContentPR").css({ "height": ($(window).height() - 110) + "px" });
      });
      $(window).trigger('resize');

    }
  };

  export default cpn;
</script>

<style scoped>
  .full-modal-dialog {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .full-modal-content {
    height: auto;
    min-height: 100%;
    border-radius: 0;
  }

  .modal-body {
    max-height: 100%;
  }

  .radio-inline + .radio-inline, .checkbox-inline + .checkbox-inline {
    margin-left: unset !important;
  }
</style>
