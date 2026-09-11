<template>
  <div>
    <section class="header">
      <div class="content-header " v-show="selectedTabs.id != 'Header_tab4'">
        <div id="content-navbar">
          <nav class="navbar m-0 p-0">
            <!-- <nav class="navbar navbar-inverse navbar-fixed-top"> -->
            <div class="container-fluid py-5">
              <div class="navbar-header padding-l-10 padding-r-10">
                <a class="navbar-brand m-0 p-0 " :class="{ 'hidden-xs' : selectedTabs.id != 'Header_tab1' }" @click="TabChange(0)">
                  <img :src="baseUrl + 'Content/Images/Logo/logo_mango_dark_default.png'" class="max-height w-100 profile-img" alt="Mango Consultant" v-if=" (selectedTabs.isEdit && selectedTabs.id == 'Header_tab3') || selectedTabs.id == 'Header_tab5' || selectedTabs.id == 'Header_tab6'">
                  <img :src="`${baseUrl}Content/Images/Logo/logo_mango_light_default.png`" class=" max-height w-100 profile-img" alt="Mango Consultant" v-else>
                </a>
                <button type="button" class="navbar-toggle" @click.prevent="ToggleMenu('Open')">
                  <span class="glyphicon glyphicon-align-justify" :class="[(selectedTabs.isEdit && selectedTabs.id == 'Header_tab3') || selectedTabs.id == 'Header_tab5' || selectedTabs.id == 'Header_tab6' ? 'text-dark' : 'text-white']" aria-hidden="true" @click.prevent="ToggleMenu('Open')"></span>
                </button>
                <a v-if="selectedTabs.id != 'Header_tab1' && selectedTabs.id != 'Header_tab4'" class="navbar-brand visible-xs m-0 text-white">
                  <span :class="[(selectedTabs.isEdit && selectedTabs.id == 'Header_tab3') || selectedTabs.id == 'Header_tab5' || selectedTabs.id == 'Header_tab6' ? 'text-dark' : 'text-white']">{{ !selectedTabs.isEdit ? selectedTabs.text : selectedTabs.text2 }}</span>
                </a>

              </div>
              <div class="collapse navbar-collapse" id="myNavbar">
                <ul class="nav navbar-nav navbar-right hidden-xs d-flex gap-15">
                  <li v-for="(x, idx) in tabs" v-if="x.showbutton">
                    <a class="button-navbar" role="button" v-if="(selectedTabs.isEdit && selectedTabs.id == 'Header_tab3') || selectedTabs.id == 'Header_tab5' || selectedTabs.id == 'Header_tab6'" @click="TabChange(idx)" :class="[ selectedTabs.id == x.id ? 'text-success-v2 bg-success-v2-10' : 'text-success-v2']">{{ x.text }} <span v-if="x.showTotal">({{ x.total }})</span></a>
                    <a class="button-navbar" role="button" v-else @click="TabChange(idx)" :class="[ selectedTabs.id == x.id ? 'text-white bg-secondary-v4' : 'text-white' ]">{{ x.text }} <span v-if="x.showTotal">({{ x.total }})</span></a>
                  </li>
                  <li class="sidebar-button" @click.prevent="ToggleMenu('Open')">
                    <a class="button-navbar sidebar-button-a">
                      <img :src="baseUrl + 'Content/Images/Icon PNG/man.png'" class="profile-img sidebar-profile" width="23" height="23" alt="Your Logo" @click.prevent="ToggleMenu('Open')">
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          <!-- Content Header Tab -->
          <div @click="ToggleMenu('Close')">
            <div v-if="selectedTabs.id == 'Header_tab1' " class="Header_tab1">
              <div class="visible-lg">
                <p class="text-bold text-white fs-4vw ">{{ ui.csm_v2_welcome_to }}</p>
                <p class="text-bold text-white fs-4vw"> {{is_mango === 'Y' ? ui.csm_v2_system_desc_mango : ui.csm_v2_system_desc}}</p>
                <p class="text-bold text-white fs-4vw">{{ ui.csm_v2_customer_menu_hint }}</p>
              </div>
              <div class="visible-md visible-sm">
                <h1 class="text-bold text-white-60">{{ ui.csm_v2_welcome_to }}</h1>
                <h2 class="text-bold text-white fs-3vw">{{is_mango === 'Y' ? ui.csm_v2_system_desc_mango : ui.csm_v2_system_desc}}</h2>
                <h2 class="text-bold text-white fs-3vw">{{ ui.csm_v2_customer_menu_hint }}</h2>
              </div>
              <div class="visible-xs">
                <h1 class="text-bold text-white-60">{{ ui.csm_v2_welcome_to }}</h1>
                <h2 class="text-bold text-white">{{is_mango === 'Y' ? ui.csm_v2_system_desc_line1_mango : ui.csm_v2_system_desc_line1}}</h2>
                <h2 class="text-bold text-white">{{is_mango === 'Y' ? ui.csm_v2_system_desc_line2_mango : ui.csm_v2_system_desc_line2}}</h2>
                <h4 class="text-bold text-white">{{ ui.csm_v2_customer_menu_hint }}</h4>
              </div>
              <div class="d-flex flex-column gap-30 margin-t-30">
                <div class="d-flex flex-wrap gap-15">
                  <a class="btn btn-outline-light " @click="TabChange(1)">{{is_mango === 'Y' ? ui.csm_v2_create_request_mango : ui.csm_v2_create_request}}</a>
                  <a class="btn btn-outline-light" @click="TabChange(2)">{{ ui.csm_v2_status_follow_up }}</a>
                  <a class="btn btn-outline-light" @click="TabChange(8)">{{ ui.csm_v2_parcel_tracking }}</a>

                </div>
                <div class="d-flex flex-wrap gap-15" v-if="customer.type == 'ar_cust'">
                  <a class="btn btn-outline-light " @click="TabChange(6)">{{ ui.csm_v2_member }}</a>
                  <a class="btn btn-outline-light " @click="TabChange(7)">{{ ui.csm_v2_member_request }} ({{ tabs[7].total }})</a>
                </div>
              </div>
            </div>
            <div v-if="selectedTabs.id == 'Header_tab2'">
              <div class="container-fluid p-0" v-if="selectedTabs.id == 'Header_tab2' && !selectedTabs.isEdit">
                <div class="text-center margin-b-15 hidden-xs">
                  <span class="fs-1 text-white text-bold">{{is_mango === 'Y' ? ui.csm_v2_create_request_mango : ui.csm_v2_create_request}}</span>
                </div>
                <div class="visible-xs">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="input-group w-90p">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="password" name="password" style="display:none">
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="searchText" @keyup.enter="onReadList()">
                    </div>
                  </div>
                </div>
                <div class="visible-sm">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="input-group w-80p">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="searchText" @keyup.enter="onReadList()">
                    </div>
                  </div>
                </div>
                <div class="visible-md visible-lg">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="input-group w-50p ">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="searchText" @keyup.enter="onReadList()">
                    </div>
                  </div>
                </div>
              </div>
              <div class="container-fluid d-flex py-10 hidden-xs" v-else>
                <div class="d-flex justify-content-center align-items-center">
                  <a class="btn" @click="TabChange(1)">
                    <img :src="`${baseUrl}Content/Images/Icon SVG/left_arrow_bordered.svg`" />
                  </a>
                </div>
                <div class="d-flex justify-content-center align-items-center w-100p">
                  <span class="fs-1 text-white text-bold">{{is_mango === 'Y' ? ui.csm_v2_request_form_mango : ui.csm_v2_request_form}}</span>
                </div>
              </div>
              <div class="container-fluid sticky w-100p bg-white" v-if="selectedTabs.isEdit">
                <div class="container">
                  <div class="d-flex justify-content-between align-items-center p-15">
                    <div class="">
                      <ul class="nav d-flex">
                        <li>
                          <a class="nav-text active" @click="MovetoContent('form')"><h4>{{ ui.csm_v2_information }}</h4></a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <ul class="nav">
                        <li>
                          <button class="btn btn-green-submit border-radius-25 w-100 p-15"
                                  @click="$refs.modal_confirm.openModal()">
                            {{ ui.csm_v2_send }}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedTabs.id == 'Header_tab3'">
              <div class="container-fluid p-0" v-if="!selectedTabs.isEdit && !selectedTabs.rating">
                <div class="container d-flex justify-content-center margin-b-15">
                  <span class="fs-1 text-white text-bold hidden-xs">{{ ui.csm_v2_status_follow_up }}</span>
                </div>
                <div class="visible-xs">
                  <div class="container d-flex justify-content-center">
                    <div class="input-group w-90p">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="password" name="password" style="display:none">
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="searchText_status" @keyup.enter="Tracking_ReadList(status_text)">
                    </div>
                  </div>
                </div>
                <div class="visible-sm">
                  <div class="container d-flex justify-content-center">
                    <div class="input-group w-80p">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="searchText_status" @keyup.enter="Tracking_ReadList(status_text)">
                    </div>
                  </div>
                </div>
                <div class="visible-md visible-lg">
                  <div class="container d-flex justify-content-center">
                    <div class="input-group w-50p">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="searchText_status" @keyup.enter="Tracking_ReadList(status_text)">
                    </div>
                  </div>
                </div>
                <div class="visible-xs">
                  <div class="container margin-t-15 margin-b-15">
                     <div class="d-flex gap-10 align-items-center">
                        <div v-if="status_text=='All'" style="flex-shrink: 0;">
                          <ProjectFilterDropdown
                            :projects="projectList"
                            @change="onFilterChange"
                          />
                        </div>
                        <div class="d-flex gap-10 flex-nowrap grab overflow-x-auto no-scrollbar" style="flex-grow: 1;">
                          <button class="btn border-radius-10 text-white" @click="Tracking_ReadList('N')" :class="[ status_text == 'N' ? 'bg-success-v2' : 'bg-secondary-v3']">{{ ui.csm_v2_status_submitted }} ({{ List_status.N }})</button>
                          <button class="btn border-radius-10 text-white" @click="Tracking_ReadList('HW')" :class="[ status_text == 'HW' ? 'bg-success-v2' : 'bg-secondary-v3']">{{ ui.csm_v2_status_pending }} ({{ List_status.HW }})</button>
                          <button class="btn border-radius-10 text-white" @click="Tracking_ReadList('P')" :class="[ status_text == 'P' ? 'bg-success-v2' : 'bg-secondary-v3']">{{ ui.csm_v2_status_in_progress }} ({{ List_status.P }})</button>
                          <button class="btn border-radius-10 text-white" @click="Tracking_ReadList('Y')" :class="[ status_text == 'Y' ? 'bg-success-v2' : 'bg-secondary-v3']">{{ ui.csm_v2_status_complete }} ({{ List_status.Y }})</button>
                          <button class="btn border-radius-10 text-white" @click="Tracking_ReadList('R')" :class="[ status_text == 'R' ? 'bg-success-v2' : 'bg-secondary-v3']">{{ ui.csm_v2_status_reject }} ({{ List_status.R }})</button>
                          <button class="btn border-radius-10 text-white" @click="Tracking_ReadList('All')" :class="[ status_text=='All' ? 'bg-success-v2' : 'bg-secondary-v3' ]">{{ ui.csm_v2_status_all }} ({{ List_status.All }}) </button>
                        </div>
                     </div>
                  </div>
                </div>
                <div class="hidden-xs">
                  <div class="container justify-content-center d-flex gap-10 margin-t-15 margin-b-15 flex-wrap grab align-items-center">
                    <ProjectFilterDropdown
                      v-if="status_text=='All'"
                      :projects="projectList"
                      @change="onFilterChange"
                    />
                    <button class="btn border-radius-10 text-white" @click="Tracking_ReadList('N')" :class="[ status_text == 'N' ? 'bg-success-v2' : 'bg-secondary-v3']">{{ ui.csm_v2_status_submitted }} ({{ List_status.N }})</button>
                    <button class="btn border-radius-10 text-white" @click="Tracking_ReadList('HW')" :class="[ status_text == 'HW' ? 'bg-success-v2' : 'bg-secondary-v3']">{{ ui.csm_v2_status_pending }} ({{ List_status.HW }})</button>
                    <button class="btn border-radius-10 text-white" @click="Tracking_ReadList('P')" :class="[ status_text == 'P' ? 'bg-success-v2' : 'bg-secondary-v3']">{{ ui.csm_v2_status_in_progress }} ({{ List_status.P }})</button>
                    <button class="btn border-radius-10 text-white" @click="Tracking_ReadList('Y')" :class="[ status_text == 'Y' ? 'bg-success-v2' : 'bg-secondary-v3']">{{ ui.csm_v2_status_complete }} ({{ List_status.Y }})</button>
                    <button class="btn border-radius-10 text-white" @click="Tracking_ReadList('R')" :class="[ status_text=='R' ? 'bg-success-v2' : (List_status.R> 0 ? 'bg-danger' : 'bg-secondary-v3') ]">{{ ui.csm_v2_status_reject }} ({{ List_status.R }}) </button>
                    <button class="btn border-radius-10 text-white" @click="Tracking_ReadList('All')" :class="[ status_text=='All' ? 'bg-success-v2' : 'bg-secondary-v3' ]">{{ ui.csm_v2_status_all }} ({{ List_status.All }}) </button>
                  </div>
                </div>
              </div>
              <div class="container-fluid p-0" v-else-if="selectedTabs.isEdit && !selectedTabs.rating">
                <div class="d-flex hidden-xs">
                  <div class="d-flex justify-content-center align-items-center">
                    <a class="btn" @click="TabChange(2)">
                      <img :src="`${baseUrl}Content/Images/Icon SVG/left_arrow_bordered.svg`" />
                    </a>
                  </div>
                  <div class="d-flex justify-content-center align-items-center w-100p">
                    <span class="fs-1 text-dark text-bold">{{is_mango === 'Y'  ? ui.csm_v2_request_form_details_mango : ui.csm_v2_request_form_details}}</span>
                  </div>
                </div>
                <div class="margin-t-15 bg-secondary-v3">
                  <div class="hidden-xs">
                    <div class="d-flex justify-content-around p-15 text-secondary-v2">
                      <span class="fs-3 text-secondary-v2 text-nowrap">{{is_mango === 'Y'  ? ui.csm_v2_request_form_no_mango : ui.csm_v2_request_form_no}}</span>
                      <span class="fs-3 text-secondary-v2 text-nowrap">#DRAFT {{ chkstatus_detail.reqno }}</span>
                    </div>
                  </div>
                  <div class="visible-xs">
                    <div class="d-flex justify-content-between p-15 text-secondary-v2">
                      <span class="fs-3 text-secondary-v2 text-nowrap">{{is_mango === 'Y'  ? ui.csm_v2_request_form_no_mango : ui.csm_v2_request_form_no}}</span>
                      <span class="fs-3 text-secondary-v2 text-nowrap">#DRAFT {{ chkstatus_detail.reqno }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedTabs.id == 'Header_tab5'">
              <div class="container-fluid" style="padding-top: 20px; padding-bottom: 20px;">
                <div style="max-width: 400px; margin: 0 auto;">
                  <!-- Profile Card -->
                  <div class="d-flex flex-column align-items-center" style="background: rgba(255,255,255,0.95); border-radius: 16px; padding: 30px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div class="d-flex justify-content-center align-items-center" style="width: 80px; height: 80px; background: linear-gradient(135deg, #00BF9D 0%, #00a88a 100%); border-radius: 50%; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,191,157,0.3);">
                      <span class="text-white text-bold" style="font-size: 32px;">{{ (customer.customer_name || '?').charAt(0).toUpperCase() }}</span>
                    </div>
                    <span class="text-bold" style="font-size: 18px; color: #333; margin-bottom: 4px;">{{ customer.customer_name }}</span>
                    <span style="font-size: 13px; color: #00BF9D; background: #e6fff9; padding: 3px 12px; border-radius: 20px;">{{ customer.type == "ar_cust" ? ui.csm_v2_project_owner : customer.type == "line_member" ? ui.csm_v2_customer : '' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedTabs.id == 'Header_tab7'">
              <div class="container-fluid p-0" v-if="selectedTabs.id == 'Header_tab7' && !selectedTabs.isEdit">
                <div class="text-center margin-b-15 hidden-xs">
                  <span class="fs-1 text-white text-bold">{{ ui.csm_v2_member }}</span>
                </div>
                <div class="visible-xs">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="input-group w-90p">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="password" name="password" style="display:none">
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="searchText" @keyup.enter="onReadList()">
                    </div>
                  </div>
                </div>
                <div class="visible-sm">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="input-group w-80p">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="searchText" @keyup.enter="onReadList()">
                    </div>
                  </div>
                </div>
                <div class="visible-md visible-lg">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="input-group w-50p ">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="searchText" @keyup.enter="onReadList()">
                    </div>
                  </div>
                </div>
              </div>
              <div class="container-fluid d-flex py-10 hidden-xs" v-else>
                <div class="d-flex justify-content-center align-items-center">
                  <a class="btn" @click="TabChange(6)">
                    <img :src="`${baseUrl}Content/Images/Icon SVG/left_arrow_bordered.svg`" />
                  </a>
                </div>
                <div class="d-flex justify-content-center align-items-center w-100p">
                  <span class="fs-1 text-white text-bold">{{ selectedTabs.text2 }}</span>
                </div>
              </div>
              <div class="container-fluid sticky w-100p" v-if="selectedTabs.isEdit">
                <div class="visible-xs">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="form-group">
                      <div class="input-group input-group-sm border-radius-25">
                        <select class="form-control bg-secondary-v7 border-radius-t-l-25 border-radius-b-l-25" v-model="member_obj" @change="onReadList_member()">
                          <option class="text-black" v-for="x, index in detail" :value="x" v-text="x.pre_des"></option>
                        </select>
                        <span class="input-group-btn">
                          <button class="btn btn-sm bg-white border-radius-t-r-25 border-radius-b-r-25" @click="CopyUrl_Addmember()"><i class="fas fa-link text-primary-dark"></i></button>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="visible-sm">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="form-group">
                      <div class="input-group input-group-sm border-radius-25">
                        <select class="form-control bg-secondary-v7 border-radius-t-l-25 border-radius-b-l-25" v-model="member_obj" @change="onReadList_member()">
                          <option class="text-black" v-for="x, index in detail" :value="x" v-text="x.pre_des"></option>
                        </select>
                        <span class="input-group-btn  ">
                          <button class="btn btn-sm bg-white border-radius-t-r-25 border-radius-b-r-25" @click="CopyUrl_Addmember()"><i class="fas fa-link text-primary-dark"></i></button>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="visible-md visible-lg">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="form-group">
                      <div class="input-group input-group-sm border-radius-25">
                        <select class="form-control bg-secondary-v7 border-radius-t-l-25 border-radius-b-l-25" v-model="member_obj" @change="onReadList_member()">
                          <option class="text-black" v-for="x, index in detail" :value="x" v-text="x.pre_des"></option>
                        </select>
                        <span class="input-group-btn  ">
                          <button class="btn btn-sm bg-white border-radius-t-r-25 border-radius-b-r-25" @click="CopyUrl_Addmember()"><i class="fas fa-link text-primary-dark"></i></button>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedTabs.id == 'Header_tab8'">
              <div class="container-fluid p-0" v-if="!selectedTabs.isEdit">
                <div class="text-center margin-b-15 hidden-xs">
                  <span class="fs-1 text-white text-bold">{{ ui.csm_v2_member_request }}</span>
                </div>
                <div class="visible-xs">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="input-group w-90p">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="password" name="password" style="display:none">
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="searchText" @keyup.enter="MemberRequest_Read()">
                    </div>
                  </div>
                </div>
                <div class="visible-sm">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="input-group w-80p">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="searchText" @keyup.enter="MemberRequest_Read()">
                    </div>
                  </div>
                </div>
                <div class="visible-md visible-lg">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="input-group w-50p ">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="searchText" @keyup.enter="MemberRequest_Read()">
                    </div>
                  </div>
                </div>
              </div>
              <div class="container-fluid d-flex py-10 hidden-xs" v-else>
                <div class="d-flex justify-content-center align-items-center">
                  <a class="btn" @click="TabChange(7)">
                    <img :src="`${baseUrl}Content/Images/Icon SVG/left_arrow_bordered.svg`" />
                  </a>
                </div>
                <div class="d-flex justify-content-center align-items-center w-100p">
                  <span class="fs-1 text-white text-bold">{{ ui.csm_v2_member_request }}</span>
                </div>
              </div>
            </div>
            <div v-if="selectedTabs.id == 'Header_tab9'">
              <div class="container-fluid p-0">
                <div class="text-center margin-b-15 hidden-xs">
                  <span class="fs-1 text-white text-bold">{{ ui.csm_v2_parcel_tracking }}</span>
                </div>
                <div class="visible-xs">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="input-group w-90p">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="password" name="password" style="display:none">
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="rawSearchText" @keyup.enter="">
                    </div>
                  </div>
                </div>
                <div class="visible-sm">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="input-group w-80p">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="rawSearchText" @keyup.enter="">
                    </div>
                  </div>
                </div>
                <div class="visible-md visible-lg">
                  <div class="container d-flex justify-content-center margin-b-20">
                    <div class="input-group w-50p ">
                      <span class="input-group-addon  border-tl-30 border-bl-30 border-st-n bg-white-30" id="basic-addon1"><i class="fas fa-search text-white"></i></span>
                      <input type="text" class="form-control border-tr-30 border-br-30 border-st-n bg-white-30 text-white" placeholder="Search" aria-describedby="basic-addon1" autocomplete="off" v-model="rawSearchText" @keyup.enter="">
                    </div>
                  </div>
                </div>
                <div class="container padding-t-30">
                  <tracking :searchText="searchText" @clearSearch="rawSearchText = $event" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="body" @click="ToggleMenu('Close')">
      <!-- Content Detail Tab -->
      <div v-if="selectedTabs.id == 'Header_tab2'">
        <div v-if="!selectedTabs.isEdit">
          <div class="container padding-t-30">
            <div class="row">
              <div class="col-sm-6 col-md-4 my-10" v-for="x in project">
                <!-- <div class="card" :style="`background-image: linear-gradient(0deg, rgba(2,0,36,1) 0%, rgba(0,0,0,0.5) 1%, rgba(255,255,255,0) 100%), url(${showPictures(x.path_hex) }) !important;`"> -->
                <div class="card" :style="`
                  background: linear-gradient(0deg, rgba(2,0,36,1) 0%, rgba(0,0,0,0.5) 1%, rgba(255,255,255,0) 100%), url(${showPictures(x.path_hex) }) !important;
                  background-size: 100% 100% !important;
                  background-position: center !important;
                  background-repeat: no-repeat !important;
                  `">
                  <div class="btn-container-left">
                    <span class="text-white text-bold">{{ x.pre_des }}</span>
                  </div>
                  <div class="btn-container-right">
                    <button type="button" class="btn btn-sm btn-wrench" @click="SwitchContent('tab2_form', x)"><span class="glyphicon glyphicon-wrench margin-r-5" aria-hidden="true"></span><span>{{is_mango === 'Y' ? ui.csm_v2_create_request_mango : ui.csm_v2_create_request}}</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="selectedTabs.isEdit">
          <div class="container-fluid bg-white-f3">
            <div class="container p-0">
              <div class="card-content my-30" id="form">
                <div class="p-30">
                  <div class="d-flex justify-content-between flex-wrap margin-b-30">
                    <div class="pl-15 h-30px">
                      <span class="fs-1 text-bold d-flex align-self-center  m-0">{{ ui.csm_v2_information }}</span>
                    </div>
                    <div>
                      <div class="d-flex justify-content-center" v-if="customer.type == 'ar_cust'">
                        <div class="form-check form-switch form-check-custom form-check-solid">
                          <label class="form-check-label padding-r-15">{{ ui.csm_v2_project_owner }}</label>
                          <input class="form-check-input h-30px w-60px" type="checkbox" true-value="Y" false-value="N" disabled :checked="form.projrunno == 0" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-12">
                      <div class="form-group">
                        <label class="text-danger">{{ ui.csm_v2_project }}<sup>*</sup></label>
                        <select class="form-control input-sm border-x-0 border-t-0 border-radius-0" disabled>
                          <option>{{  projrunno_0() }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form_h.pre_event)}">
                        <label class="text-danger">{{ ui.csm_v2_phase }}<sup>*</sup></label>
                        <select class="form-control input-sm border-x-0 border-t-0 border-radius-0" v-model="form_h" @change="changeheader()">
                          <option v-for="x in detail" v-bind:value="x" v-text="x.pre_des"></option>
                        </select>
                        <span class="text-danger" v-show="xt.isEmpty(form_h.pre_event)">{{ ui.csm_v2_valid_select_required }}</span>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="form-group">
                        <label class="text-danger">{{ ui.csm_v2_contact_name }}<sup>*</sup></label>
                        <input type="password" name="password" style="display:none">
                        <input class="form-control input-sm border-x-0 border-t-0 border-radius-0" type="text" autocomplete="off" v-model="form.contract" />
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form.contract_tel)}">
                        <label class="text-danger">{{ ui.csm_v2_tel }}<sup>*</sup></label>
                        <input class="form-control input-sm border-x-0 border-t-0 border-radius-0" type="text" @keyup="onlyPressNumber($event)" v-model.trim="form.contract_tel" maxlength="50">
                        <span class="text-danger" v-show="xt.isEmpty(form.contract_tel)">{{ ui.csm_v2_valid_required }}</span>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="form-group">
                        <label>{{ ui.csm_v2_convenient_date }}</label>
                        <datepicker input-class="form-control border-x-0 border-t-0 border-radius-0" :date-before="disabledDate('start')" :date-after="99999" v-model="form.date_convenient1"></datepicker>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>{{ ui.csm_v2_start_time }}</label>
                        <timepicker format="HH:mm" input-class="border-x-0 border-t-0 w-100p" v-model="form.stdate_convenient1"></timepicker>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>{{ ui.csm_v2_end_time }}</label>
                        <timepicker format="HH:mm" input-class="border-x-0 border-t-0 w-100p" v-model="form.enddate_convenient1"></timepicker>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="form-group">
                        <label>{{ ui.csm_v2_alternative_date_note }}</label>
                        <datepicker input-class="form-control border-x-0 border-t-0 w-100p border-radius-0" :date-before="disabledDate('start')" :date-after="99999" v-model="form.date_convenient2"></datepicker>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>{{ ui.csm_v2_start_time }}</label>
                        <timepicker format="HH:mm" input-class="border-x-0 border-t-0 w-100p" v-model="form.stdate_convenient2"></timepicker>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>{{ ui.csm_v2_end_time }}</label>
                        <timepicker format="HH:mm" input-class="border-x-0 border-t-0 w-100p" v-model="form.enddate_convenient2"></timepicker>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <label>{{ ui.csm_v2_contact_request_details }}</label>
                      <a @click="openDescModal('description')" style="font-size: larger;padding: 5px;"><i class="fa fa-search"></i></a>
                      <textarea class="form-control input-sm" rows="5" maxlength="2000" v-model="form.note"></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-content my-30" id="form">
                <div class="p-30">
                  <div class="d-flex justify-content-between flex-wrap margin-b-30">
                    <div class="pl-15 h-30px">
                      <span class="fs-1 text-bold d-flex align-self-center  m-0">{{ ui.csm_v2_site }}</span>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-12">
                      <div>
                        <div class="row">
                          <div class="col-md-12">
                            <div class="form-group">
                              <label>Google Map URL</label>
                              <span class="input-group">
                                <input class="form-control input-sm border-x-0 border-t-0 border-radius-0" type="text" v-model="form.map_url" placeholder="https://goo.gl/maps/" />
                                <span class="input-group-btn">
                                  <button class="btn btn-sm bg-navy" @click="openMapUrl(form.map_url)"><i class="fas fa-map"></i></button>
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-12">
                            <div class="form-group" v-if="isSmallScreen">
                              <label>GPS Coordinates DD. (Latitude, Longitude)</label>
                              <input class="form-control input-sm border-x-0 border-t-0 border-radius-0" v-model="form.map_gps" @input="previewLocation(form.map_gps)" type="text" placeholder="10.00000, 10.00000" />
                            </div>
                            <div class="form-group" v-else>
                              <label>GPS Coordinates DD. (Latitude, Longitude)</label>
                              <span class="input-group">
                                <input class="form-control input-sm border-x-0 border-t-0 border-radius-0" v-model="form.map_gps" @input="previewLocation(form.map_gps)" type="text" placeholder="10.00000, 10.00000" />
                                <span class="input-group-btn">
                                  <button class="btn btn-sm bg-navy" @click="openModalLocation(form.map_gps)"><i class="fas fa-map-marked-alt"></i></button>
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-12">
                            <div class="form-group">
                              <label>Description</label> <span class="pull-right">{{xt.textLength(form.map_desc, 2000)}}</span>
                              <input class="form-control input-sm border-x-0 border-t-0 border-radius-0" type="text" v-model="form.map_desc" maxlength="2000" />
                            </div>
                          </div>
                        </div>
                        <div class="row" v-if="isSmallScreen">
                          <div class="col-md-12">
                            <div class="d-flex justify-content-center align-content-center">
                              <iframe :src="form.map_src" v-show="form.map_src" width="720" height="480" style="margin-top: 12px;"></iframe>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-content my-30" id="detail">
                <div class="p-15">
                  <div class="d-flex justify-content-between p-30">
                    <div class="d-flex align-content-center position">
                      <span class="text-bold fs-1">{{ ui.csm_v2_task }}</span>
                    </div>
                    <div>
                      <button class="btn btn-md btn-green-plus" @click="$refs.modal_addList.openModal()"><i class="fas fa-plus " style="padding-right:0px !important;"></i></button>
                    </div>
                  </div>
                  <div class="container-fluid p-0">
                    <div class="row p-0">
                      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6 margin-t-15 margin-b-15 " v-for="x,idx in form_picsAttach">
                        <div class="padding-5">
                          <div class="d-flex">
                            <div style="position:relative">

                              <span class=" padding-l-10 padding-r-10 padding-t-5 padding-b-5 text-white" style="font-size:10px !important;position:absolute; background-color: #00BF9D !important; right: -10px !important;top:-10px !important;border-radius: 50%;" v-text="x.picsAttach.length"></span>
                              <img v-if="x.picsAttach && x.picsAttach[0] && x.picsAttach[0].src && ['png','jpeg','jpg'].includes(getFileExt(x.picsAttach[0].filename))" class="w-100 h-100 border-radius-10 cursor" :src="x.picsAttach[0].src" @click="viewImage(x.picsAttach)"></img>
                              <i v-else="x.picsAttach && x.picsAttach[0] && x.picsAttach[0].src && !['png','jpeg','jpg'].includes(getFileExt(x.picsAttach[0].filename))" class="fas fa-file fa-5x w-100 h-100 border-radius-10 cursor text-center padding-t-15" @click="viewImage(x.picsAttach)"></i>
                              <!-- <img class="w-100 h-100 border-radius-10 cursor" :src="x.picsAttach[0].src" @click="viewImage(x.picsAttach)"> -->
                              <!-- <img :src="showPictures(x.fileid)" class="w-100 h-100 border-radius-10" /> -->
                            </div>
                            <div class="p-15" style="flex:1; min-width:0">
                              <p class="text-bold break-word" style="margin-bottom:2px">{{ x.subject }}</p>
                              <p class="text-bold break-word text-secondary-v2" style="margin-bottom:4px">#{{ idx+1 }}</p>
                              <p v-if="x.description" class="text-secondary-v2" style="margin:0; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; word-break:break-word;">{{ x.description }}</p>
                            </div>
                            <div class="d-flex align-self-start" style="column-gap:4px; margin-left:auto; padding-top:4px; flex-shrink:0">
                              <button class="btn btn-sm btn-default" style="padding:4px 8px" @click="openEdit(idx)"><i class="fas fa-edit" style="color:#3c8dbc"></i></button>
                              <button class="btn btn-sm btn-default" style="padding:4px 8px" @click="DeletePic('form_header', idx)"><i class="far fa-trash-alt trash"></i></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="container-fluid" v-if="form_picsAttach.length <= 0">
                    <div class="d-flex justify-content-center align-content-center">
                      <img :src="baseUrl + 'Content/Images/Icon PNG/document-green.png'" alt="Your Logo">
                    </div>
                    <div class="d-flex justify-content-center align-content-center">
                      <span v-if="is_mango === 'Y'" class="text-center">{{ ui.csm_v2_add_your_task_mango }}<br>{{ ui.csm_v2_for_requesting_mango }}</span>
                      <span v-else class="text-center">{{ ui.csm_v2_add_your_task }}<br>{{ ui.csm_v2_for_requesting }}</span>
                    </div>

                    <div class="d-flex justify-content-center align-content-center margin-t-50">
                      <button class="btn btn-lg bg-success-v2 px-10 py-2 border-radius-15 text-white" @click="$refs.modal_addList.openModal()">{{is_mango === 'Y' ? ui.csm_v2_add_task_mango : ui.csm_v2_add_task}}</button>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="container-fluid bg-white-f3">
            <div class="container p-0">
              <div class="card-content my-30" id="form">
                <div class="p-30">
                  <div class="d-flex justify-content-between flex-wrap margin-b-30">
                    <div class="pl-15 h-30px">
                      <span class="fs-1 text-bold d-flex align-self-center  m-0">{{ ui.csm_v2_information }}</span>
                    </div>
                    <div>
                      <div class="d-flex justify-content-center">
                        <div class="form-check form-switch form-check-custom form-check-solid">
                          <label class="form-check-label padding-r-15">{{ ui.csm_v2_project_owner }}</label>
                          <input class="form-check-input h-30px w-60px" type="checkbox" true-value="Y" false-value="N" disabled :checked="form.projrunno == 0" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-12">
                      <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form_h.pre_event)}">
                        <label class="text-danger">{{ ui.csm_v2_project }}<sup>*</sup></label>
                        <select class="form-control input-sm border-x-0 border-t-0 border-radius-0" v-model="form_h" @change="changeheader()">
                          <option v-for="x in detail" v-bind:value="x" v-text="x.pre_des"></option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="form-group">
                        <label class="text-danger">{{ ui.csm_v2_phase }}<sup>*</sup></label>
                        <input class="form-control input-sm border-x-0 border-t-0 border-radius-0" type="text" v-model="form.address" />
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="form-group">
                        <label class="text-danger">{{ ui.csm_v2_contact_name }}<sup>*</sup></label>
                        <input type="password" name="password" style="display:none">
                        <input class="form-control input-sm border-x-0 border-t-0 border-radius-0" type="text" autocomplete="off" v-model="form.contract" />
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form.contract_tel)}">
                        <label class="text-danger">{{ ui.csm_v2_tel }}<sup>*</sup></label>
                        <input class="form-control input-sm border-x-0 border-t-0 border-radius-0" @keyup="onlyPressNumber($event)" type="text" v-model.trim="form.contract_tel" />
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form.date_convenient1)}">
                        <label class="text-danger">{{ ui.csm_v2_convenient_date }}<sup>*</sup></label>
                        <datepicker input-class="form-control border-x-0 border-t-0 border-radius-0" :date-before="disabledDate('start')" :date-after="99999" v-model="form.date_convenient1"></datepicker>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form.stdate_convenient1)}">
                        <label>{{ ui.csm_v2_start_time }}</label>
                        <timepicker format="HH:mm" input-class="border-x-0 border-t-0 w-100p" v-model="form.stdate_convenient1"></timepicker>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form.enddate_convenient1)}">
                        <label>{{ ui.csm_v2_end_time }}</label>
                        <timepicker format="HH:mm" input-class="border-x-0 border-t-0 w-100p" v-model="form.enddate_convenient1"></timepicker>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="form-group">
                        <label>{{ ui.csm_v2_alternative_date_note }}</label>
                        <datepicker input-class="form-control border-x-0 border-t-0 w-100p border-radius-0" :date-before="disabledDate('start')" :date-after="99999" v-model="form.date_convenient2"></datepicker>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>{{ ui.csm_v2_start_time }}</label>
                        <timepicker format="HH:mm" input-class="border-x-0 border-t-0 w-100p" v-model="form.stdate_convenient2"></timepicker>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>{{ ui.csm_v2_end_time }}</label>
                        <timepicker format="HH:mm" input-class="border-x-0 border-t-0 w-100p" v-model="form.enddate_convenient2"></timepicker>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <label>{{ ui.csm_v2_contact_request_details }}</label>
                      <a @click="openDescModal('description')" style="font-size: larger;padding: 5px;"><i class="fa fa-search"></i></a>
                      <textarea class="form-control input-sm" rows="5" maxlength="2000" v-model="form.note"></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-content my-30" id="form">
                <div class="p-30">
                  <div class="d-flex justify-content-between flex-wrap margin-b-30">
                    <div class="pl-15 h-30px">
                      <span class="fs-1 text-bold d-flex align-self-center  m-0">{{ ui.csm_v2_site }}</span>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-12">
                      <div>
                        <div class="row">
                          <div class="col-md-12">
                            <div class="form-group">
                              <label>Google Map URL</label>
                              <span class="input-group">
                                <input class="form-control input-sm border-x-0 border-t-0 border-radius-0" type="text" v-model="form.map_url" placeholder="https://goo.gl/maps/" />
                                <span class="input-group-btn">
                                  <button class="btn btn-sm bg-navy" @click="openMapUrl(form.map_url)"><i class="fas fa-map"></i></button>
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-12">
                            <div class="form-group" v-if="isSmallScreen">
                              <label>GPS Coordinates DD. (Latitude, Longitude)</label>
                              <input class="form-control input-sm border-x-0 border-t-0 border-radius-0" v-model="form.map_gps" @input="previewLocation(form.map_gps)" type="text" placeholder="10.00000, 10.00000" />
                            </div>
                            <div class="form-group" v-else>
                              <label>GPS Coordinates DD. (Latitude, Longitude)</label>
                              <span class="input-group">
                                <input class="form-control input-sm border-x-0 border-t-0 border-radius-0" v-model="form.map_gps" @input="previewLocation(form.map_gps)" type="text" placeholder="10.00000, 10.00000" />
                                <span class="input-group-btn">
                                  <button class="btn btn-sm bg-navy" @click="openModalLocation(form.map_gps)"><i class="fas fa-map-marked-alt"></i></button>
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-12">
                            <div class="form-group">
                              <label>Description</label> <span class="pull-right">{{xt.textLength(form.map_desc, 2000)}}</span>
                              <input class="form-control input-sm border-x-0 border-t-0 border-radius-0" type="text" v-model="form.map_desc" maxlength="2000" />
                            </div>
                          </div>
                        </div>
                        <div class="row" v-if="isSmallScreen">
                          <div class="col-md-12">
                            <div class="d-flex justify-content-center align-content-center">
                              <iframe :src="form.map_src" v-show="form.map_src" width="720" height="480" style="margin-top: 12px;"></iframe>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-content my-30" id="detail">
                <div class="p-15">
                  <div class="d-flex justify-content-between p-30">
                    <div class="d-flex align-content-center">
                      <span class="text-bold fs-1">{{ ui.csm_v2_task }}</span>
                    </div>
                    <div>
                      <button class="btn btn-md btn-green-plus" @click="before_addedFile()"><i class="fas fa-plus" style="padding-right:0px !important;"></i></button>
                    </div>
                  </div>
                  <div class="container-fluid p-0">
                    <div class="row p-0">
                      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6 margin-t-15 margin-b-15 " v-for="x,idx in form_picsAttach">
                        <div class="padding-5">
                          <div class="d-flex">
                            <!-- <img :src="showPictures(x.fileid)" class="w-100 h-100 border-radius-10" /> -->
                            <div style="position:relative">
                              <span class=" padding-l-10 padding-r-10 padding-t-5 padding-b-5 text-white" style="font-size:10px !important;position:absolute; background-color: #00BF9D !important; right: -10px !important;top:-10px !important;border-radius: 50%;" v-text="x.picsAttach.length"></span>
                              <!-- <img :src="showPictures(x.fileid)" class="w-100 h-100 border-radius-10" /> -->
                              <img class="w-100 h-100 border-radius-10 cursor" :src="x.picsAttach[0].src" @click="viewImage(x.picsAttach)">

                            </div>

                            <div class="p-15" style="flex:1; min-width:0">
                              <p class="text-bold break-word" style="margin-bottom:2px">{{ x.subject }}</p>
                              <p class="text-bold break-word text-secondary-v2" style="margin-bottom:4px">#{{ idx+1 }}</p>
                              <p v-if="x.description" class="text-secondary-v2" style="margin:0; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; word-break:break-word;">{{ x.description }}</p>
                            </div>
                            <div class="d-flex align-self-start" style="column-gap:4px; margin-left:auto; padding-top:4px; flex-shrink:0">
                              <button class="btn btn-sm btn-default" style="padding:4px 8px" @click="openEdit(idx)"><i class="fas fa-edit" style="color:#3c8dbc"></i></button>
                              <button class="btn btn-sm btn-default" style="padding:4px 8px" @click="DeletePic('form_header', idx)"><i class="far fa-trash-alt trash"></i></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="container-fluid" v-if="form_picsAttach.length <= 0">
                    <div class="d-flex justify-content-center align-content-center">
                      <img :src="baseUrl + 'Content/Images/Icon PNG/document-green.png'" alt="Your Logo">
                    </div>
                    <div class="d-flex justify-content-center align-content-center">
                      <span v-if="is_mango === 'Y'" class="text-center">{{ ui.csm_v2_add_your_task_mango }}<br>{{ ui.csm_v2_for_requesting_mango }}</span>
                      <span v-else class="text-center">{{ ui.csm_v2_add_your_task }}<br>{{ ui.csm_v2_for_requesting }}</span>
                    </div>
                    <div class="d-flex justify-content-center align-content-center margin-t-50">
                      <button class="btn btn-lg bg-success-v2 px-10 py-2 border-radius-15 text-white" @click="before_addedFile()">{{is_mango === 'Y' ? ui.csm_v2_add_task_mango : ui.csm_v2_add_task}}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="selectedTabs.id == 'Header_tab3'" style="background-repeat: no-repeat; background-size: cover; background-position: center center">
        <div class="container-fluid" v-if="!selectedTabs.isEdit && !selectedTabs.rating">
          <div class="row padding-t-30">
            <!-- <div class="col-xs-12 col-sm-6 col-md-4" v-for="x,idx in chkstatusDisplay" :title="x.description"> -->
            <div class="col-xs-12 col-sm-12 col-md-6 col-lg-3" v-for="x,idx in chkstatusDisplay" :title="x.description">
              <div class="panel border-radius-20 bg-white">
                <div class="panel-body padding-10">
                  <!-- <div class="d-flex justify-content-between"> -->
                  <div>
                    <p v-if="!['N', 'R'].includes(status_text)" class="pull-right" v-bind:style="{'color': x.priority_color || '#000000'}">{{x.prioity_des || '&nbsp;'}}</p>
                    <div class="d-flex gap-10 align-items-center" style="width: 100%;">
                      <div style="position:relative" :class="isSmallScreen ? 'align-self-start' : ''">
                        <span class="d-flex" style="position: absolute; left: 10px;bottom: 10px; background-color: rgba(0, 0, 0, 0.5); border-radius: 4px;padding: 4px;">
                          <img class="margin-r-5" :src="`${baseUrl}Content/Images/Icon SVG/small-img.svg`" width="12" />
                          <p class="text-white" style="margin: 0px; font-size: 12px;">( {{x.pics.filter(pic => pic.item_type !== 'T').length || 0}} )</p>
                        </span>
                        <img v-if="x.pics && x.pics[0] && x.pics[0].src && ['png','jpeg','jpg'].includes(getFileExt(x.pics[0].filename))" class="w-100 h-100 border-radius-10 cursor" style="object-fit: cover;" :src="x.pics[0].src" @click="viewImage(x.pics.filter(pic => pic.item_type !== 'T'))"></img>
                        <i v-else="x.pics && x.pics[0] && x.pics[0].src && !['png','jpeg','jpg'].includes(getFileExt(x.pics[0].filename))" class="fas fa-file fa-5x w-100 h-100 border-radius-10 cursor text-center padding-t-15" @click="viewImage(x.pics.filter(pic => pic.item_type !== 'T'))"></i>
                      </div>
                      <div class="d-flex flex-column flex-grow-1" style="min-width: 0;">
                        <p v-if="!isWrap" :class="isSmallScreen ? 'text-wrap' : ''" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ x.subject }}</p>
                        <p v-if="isWrap" :class="!isWrap && status_text == 'All' ? 'text-wrap' : ''" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ x.subject }}</p>
                        <div class="margin-b-10" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="`${x.main_pre_des || ''} | ${x.pre_des || ''}`">
                          <span v-if="x.main_pre_des" class="bg-success-v2-10 text-success-v2 border-radius-5 padding-x-10 padding-y-3">{{ x.main_pre_des }}</span>
                          <span class="margin-x-10 text-secondary-v2" v-if="x.main_pre_des && x.pre_des">|</span>
                          <span v-if="x.pre_des" class="bg-secondary-v2 text-dark border-radius-5 padding-x-10 padding-y-3">{{ x.pre_des }}</span>
                        </div>
                        <p class="text-secondary-v2">#DRAFT {{ x.reqno }}</p>
                        <!-- <p class="text-secondary-v2" v-if="((status_text !== 'R') && (status_text !== 'N')) || ((status_text == 'N')&&(x.job_no != x.reqno))">{{ x.job_no }}</p> -->

                        <p class="text-secondary-v2" v-if="(((status_text !== 'R') && (status_text !== 'N')) || ((status_text == 'N')&&(x.job_no != x.reqno))) && x.job_no != null">{{ x.job_no }}</p>
                        <p class="text-secondary-v2" v-if="status_text == 'All'">Username: {{ x.userid}}</p>
                        <p class="text-secondary-v2" v-if="x.request_empno_name" :style="status_text == 'All' ? 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' : ''">Request By: {{ x.request_empno_name }}</p>
                        <p class="text-secondary-v2" v-if="x.assign_empno_name" :style="status_text == 'All' ? 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' : ''">Worker: {{ x.assign_empno_name }}</p>
                        <p class="text-secondary-v2" v-if="status_text == 'R'">Reject Remark: {{ x.reject_remark}}</p>

                        <p class="text-secondary-v2" v-if="x.job_no == null && status_text =='All'">&nbsp;</p>
                        <p class="text-secondary-v2" v-if="x.job_no == null && status_text =='All'">&nbsp;</p>
                        <p class="text-secondary-v2" v-if="x.job_no == null && status_text =='All'">&nbsp;</p>
                        <p class="text-secondary-v2" v-if="x.job_no != null && x.assign_empno_name == null && status_text =='All'">&nbsp;</p>
                      </div>
                    </div>

                  </div>
                  <div v-if="!isSmallScreen">
                    <div class="p-0 margin-t-10 text-secondary-v2">
                      <!-- <p>&nbsp; {{ x.description }}</p> -->
                      <p>&nbsp;</p>
                    </div>
                  </div>
                  <hr>
                  <div class="panel-footer-v2 p-0  d-flex justify-content-between">
                    <span class="m-0 text-secondary-cc" v-if="status_text == 'P'">{{ ui.csm_v2_due_date }} :<span class="text-secondary-v2"> {{ xt.isEmpty(x.worker_end_date) ? '-' : x.worker_end_date | date('DD/MM/YYYY') }}</span></span>
                    <span class="m-0 text-secondary-cc" v-else-if="status_text == 'HW'">{{ ui.csm_v2_due_date }} :<span class="text-secondary-v2"> {{ xt.isEmpty(x.due_date) ? '-' : x.due_date | date('DD/MM/YYYY') }}</span></span>
                    <span class="m-0 text-secondary-cc" v-else-if="x.job_status == 'W' || x.job_status == 'I'">{{ ui.csm_v2_due_date }} :<span class="text-secondary-v2"> {{ xt.isEmpty(x.due_date) ? '-' : x.due_date | date('DD/MM/YYYY') }}</span></span>
                    <div v-show="status_text == 'Y' || x.job_status == 'Y'">
                      <button class="form-control border-radius-10 hidden-xs" :class="[x.total_ans == 0 ? 'bg-success-v2-10 text-success-v2' : 'bg-secondary-v3']" @click="Score_Read('web',x)">
                        <img :src="`${baseUrl}Content/Images/Icon SVG/engineering_material-symbols-${x.total_ans != 0 ? `grey` : `green`}.svg`" width="22" />
                        <span class="margin-l-5" v-text="x.total_ans == 0 ? ui.csm_v2_worker_evaluation : ui.csm_v2_evaluated"></span>
                      </button>
                      <button class="form-control border-radius-10 visible-xs" :class="[x.total_ans == 0 ? 'bg-success-v2-10 text-success-v2' : 'bg-secondary-v3']" @click="Score_Read('mobile', x)">
                        <img :src="`${baseUrl}Content/Images/Icon SVG/engineering_material-symbols-${x.total_ans != 0 ? `grey` : `green`}.svg`" width="22" />
                        <span class="margin-l-5" v-text="x.total_ans == 0 ? ui.csm_v2_worker_evaluation : ui.csm_v2_evaluated"></span>
                      </button>
                    </div>
                    <button class="btn border-radius-10 text-dark bg-secondary-v2" @click="SwitchContent('tab3_form', x)">{{ ui.csm_v2_status_follow_up }}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="footer">
              <paginationv2 class="pull-right margin-t-10" ref="paging" @page-change="pageChange($event.page)"></paginationv2>
            </div>
          </div>
        </div>
        <div class="container-fluid" v-else-if="selectedTabs.isEdit && !selectedTabs.rating">
          <div class="container">
            <div class="d-flex justify-content-between margin-t-15 p-0">
              <div class="d-flex gap-10">
                <div style="position:relative">
                  <!-- <span class=" padding-l-10 padding-r-10 padding-t-5 padding-b-5 text-white" v-if="chkstatus_detail.pics.length > 0" style="font-size:10px !important;position:absolute; background-color: #00BF9D !important; right: -10px !important;top:-10px !important;border-radius: 50%;" v-text="chkstatus_detail.pics.length"></span> -->
                  <!-- <span class="d-flex" v-if="chkstatus_detail.pics.length > 0" :style="{ position: 'absolute', left: isImg ? '10px' : '35px', bottom: isImg ? '10px' : '25px', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '4px', padding: '4px'}"> -->
                  <span class="d-flex" v-if="chkstatus_detail.pics.length > 0" :style="{ position: 'absolute', left: '10px', bottom: '10px', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '4px', padding: '4px'}">
                    <img class="margin-r-5" :src="`${baseUrl}Content/Images/Icon SVG/small-img.svg`" width="12" />
                    <p class="text-white" style="margin: 0px; font-size: 12px;">( {{chkstatus_detail.pics.filter(pic => pic.item_type !== 'T').length}} )</p>
                  </span>
                  <!-- <img class="w-100 h-100 border-radius-10 cursor" :src="chkstatus_detail.pics[0].src" @click="viewImage(chkstatus_detail.pics)"> -->
                  <img v-if="chkstatus_detail.pics && chkstatus_detail.pics[0] && chkstatus_detail.pics[0].src && ['png','jpeg','jpg'].includes(getFileExt(chkstatus_detail.pics[0].filename))" class="w-100 h-100 border-radius-10 cursor" :src="chkstatus_detail.pics[0].src" @click="viewImage(chkstatus_detail.pics.filter(pic => pic.item_type !== 'T'))"></img>
                  <i v-else="chkstatus_detail.pics && chkstatus_detail.pics[0] && chkstatus_detail.pics[0].src && !['png','jpeg','jpg'].includes(getFileExt(chkstatus_detail.pics[0].filename))" class="fas fa-file fa-5x w-100 h-100 border-radius-10 cursor" style="text-align: end;" @click="viewImage(chkstatus_detail.pics.filter(pic => pic.item_type !== 'T'))"></i>
                  <!-- <img class="w-100 h-100 border-radius-10 cursor" :src="`${baseUrl}Content/Images/PNG/test-Image.png`" @click="viewImage(x.pics)" style="object-fit: cover;"></img> -->

                </div>
                <div class="hidden-xs">
                  <span class="fs-5 text-wrap">{{ chkstatus_detail.subject }}</span>
                  <div class="margin-b-10" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="`${chkstatus_detail.main_pre_des || ''} | ${chkstatus_detail.pre_des || ''}`">
                    <span v-if="chkstatus_detail.main_pre_des" class="bg-success-v2-10 text-success-v2 border-radius-5 padding-x-10 padding-y-3">{{ chkstatus_detail.main_pre_des }}</span>
                    <span class="margin-x-10 text-secondary-v2" v-if="chkstatus_detail.main_pre_des && chkstatus_detail.pre_des">|</span>
                    <span v-if="chkstatus_detail.pre_des" class="bg-secondary-v2 text-dark border-radius-5 padding-x-10 padding-y-3">{{ chkstatus_detail.pre_des }}</span>
                  </div>
                  <p class="fs-5 text-secondary-v2 text-wrap">{{ chkstatus_detail.description }}</p>
                </div>
              </div>
              <div class="d-flex justify-content-end align-items-start">
                <span class="padding-t-5 px-10px text-nowrap border-radius-10 text-nowrap" :class="[ status_text == 'N' && chkstatus_detail.job_no == null ? 'text-warning-v2 bg-warning-v2' : status_text == 'N'&& chkstatus_detail.job_no != null? 'text-primary-v2 bg-primary-v2' : status_text == 'P' ? 'text-primary-v2 bg-primary-v2' : status_text == 'Y' ? 'text-success-v3 bg-success-10' : status_text == 'R' ? 'bg-danger-v2 text-red' : status_text == 'HW' ? 'text-primary-v2 bg-primary-v2' : '']">
                  {{ status_text == 'N' && chkstatus_detail.job_no == null ? ui.csm_v2_status_submitted: status_text == 'N'&& chkstatus_detail.job_no != null? ui.csm_v2_status_accepted : status_text == 'P' ? ui.csm_v2_status_in_progress : status_text == 'Y' ? ui.csm_v2_status_complete : status_text == 'R' ? ui.csm_v2_status_reject : status_text == 'HW' ? ui.csm_v2_status_pending : ''}}
                </span>
              </div>
            </div>
            <div class="visible-xs margin-t-15">
              <p class="fs-5">{{ chkstatus_detail.subject }}</p>
              <div class="margin-b-10" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="`${chkstatus_detail.main_pre_des || ''} | ${chkstatus_detail.pre_des || ''}`">
                <span v-if="chkstatus_detail.main_pre_des" class="bg-success-v2-10 text-success-v2 border-radius-5 padding-x-10 padding-y-3">{{ chkstatus_detail.main_pre_des }}</span>
                <span class="margin-x-10 text-secondary-v2" v-if="chkstatus_detail.main_pre_des && chkstatus_detail.pre_des">|</span>
                <span v-if="chkstatus_detail.pre_des" class="bg-secondary-v2 text-dark border-radius-5 padding-x-10 padding-y-3">{{ chkstatus_detail.pre_des }}</span>
              </div>
              <p class="fs-5 text-secondary-v2 text-wrap">{{  chkstatus_detail.description }}</p>
            </div>
            <hr>
            <div class="row margin-t-15">
              <div class="col-xs-12 col-sm-12 col-md-6 col-md-6 col-lg-6 margin-b-15">
                <div class="d-flex align-items-end">
                  <img :src="`${baseUrl}Content/Images/Icon SVG/document-gray.svg`" width="22" />
                  <span>{{is_mango === 'Y' ? ui.csm_v2_request_form_info_mango : ui.csm_v2_request_form_info}}</span>
                </div>
                <div class="d-flex flex-column margin-t-5 margin-l-25">
                  <span>{{ chkstatus_detail.unit_number}}</span>
                  <span>{{ chkstatus_detail.contract_user}}</span>
                  <span>{{ chkstatus_detail.contract_tel }}</span>
                </div>
              </div>
              <div class="col-xs-12 col-sm-12 col-md-6 col-md-6 col-lg-6">
                <div class="d-flex align-items-end">
                  <img :src="`${baseUrl}Content/Images/Icon SVG/calendar-outlinenone.svg`" width="22" />
                  <span>{{ ui.csm_v2_appointment_date }}</span>
                </div>
                <div class="d-flex flex-column margin-t-5 margin-l-25">
                  <span>{{ chkstatus_detail.date_convenient1 }} {{ chkstatus_detail.st1_time | date('HH:mm:ss')}} - {{ chkstatus_detail.end1_time | date('HH:mm:ss')}}</span>
                  <span>{{ chkstatus_detail.date_convenient2 }} {{ chkstatus_detail.st2_time | date('HH:mm:ss')}} - {{ chkstatus_detail.end2_time | date('HH:mm:ss')}} {{ ui.csm_v2_alternative_date }}</span>
                </div>
              </div>
            </div>
            <hr v-if="!['N', 'R'].includes(status_text)">
            <div v-if="!['N', 'R'].includes(status_text)" class="row margin-t-15">
              <div class="col-xs-12 margin-b-15">
                <div class="d-flex flex-column margin-t-5 margin-l-25">
                  <span>{{ chkstatus_detail.job_no }}</span>
                  <span>Request by: {{ chkstatus_detail.request_empno_name }}</span>
                  <span>Worker: {{ chkstatus_detail.assign_empno_name }}</span>
                </div>
              </div>
            </div>
            <hr v-if="status_text !== 'N'">
            <div class="margin-t-15" v-show="status_text == 'Y'">
              <div class="">
                <button class="form-control border-radius-10 hidden-xs" :class="[chkstatus_detail.total_ans == 0 ? 'bg-success-v2-10 text-success-v2' : 'bg-secondary-v3']" @click="Score_Read('web',chkstatus_detail)">
                  <img :src="`${baseUrl}Content/Images/Icon SVG/engineering_material-symbols-${chkstatus_detail.total_ans != 0 ? `grey` : `green`}.svg`" width="22" />
                  <span class="margin-l-5" v-text="chkstatus_detail.total_ans == 0 ? ui.csm_v2_worker_evaluation : ui.csm_v2_evaluated"></span>
                </button>

                <button class="form-control border-radius-10 visible-xs" :class="[chkstatus_detail.total_ans == 0 ? 'bg-success-v2-10 text-success-v2' : 'bg-secondary-v3']" @click="Score_Read('mobile', chkstatus_detail)">
                  <img :src="`${baseUrl}Content/Images/Icon SVG/engineering_material-symbols-${chkstatus_detail.total_ans != 0 ? `grey` : `green`}.svg`" width="22" />
                  <span class="margin-l-5" v-text="chkstatus_detail.total_ans == 0 ? ui.csm_v2_worker_evaluation : ui.csm_v2_evaluated"></span>
                </button>
              </div>
            </div>
            <div class="margin-t-15 padding-l-15 d-flex align-items-end">
              <img :src="`${baseUrl}Content/Images/Icon SVG/wrench-gray.svg`" width="22" />
              <span>{{ ui.csm_v2_status }}</span>
            </div>
            <div class="padding-l-15">
              <ul class="progress-vartical-step">
                <li class="progress__item " v-bind:class="{'progress__item--active': ['N', 'HW', 'P', 'Y'].includes(status_text)}">
                  <p class="progress__title text-success-v2">{{ ui.csm_v2_submission_date }}</p>
                  <p class="progress__info text-secondary-v2" v-if="chkstatus_detail.add_dt">{{ ui.csm_v2_date }} {{ chkstatus_detail.add_dt | date('DD/MM/YYYY HH:mm') }}</p>
                </li>
                <li class="progress__item" v-bind:class="{'progress__item--active': ['HW', 'P', 'Y'].includes(status_text)}">
                  <p class="progress__title text-success-v2">{{ ui.csm_v2_status_pending }} <img v-if="['HW', 'P', 'Y'].includes(status_text)" class="svg-icon" :src="`${baseUrl}Content/Images/Icon SVG/image-search.svg`" width="20" @click="viewImage(chkstatus_detail.pics.filter(pic => pic.item_type === 'B'))" /></p>
                  <p class="progress__info text-secondary-v2" v-if="['HW', 'P', 'Y'].includes(status_text)">{{ chkstatus_detail.response_date | date('DD/MM/YYYY HH:mm') }}</p>
                  <p class="progress__info text-secondary-v2" v-if="['HW', 'P', 'Y'].includes(status_text)">{{ ui.csm_v2_due_date }} <span class="text-success-v2">{{chkstatus_detail.due_date | date('DD/MM/YYYY')}}</span></p>
                </li>
                <li class="progress__item" v-bind:class="{'progress__item--active': ['P', 'Y'].includes(status_text)}">
                  <p class="progress__title text-success-v2">{{ ui.csm_v2_status_in_progress }} <img v-if="['P', 'Y'].includes(status_text)" class="svg-icon" :src="`${baseUrl}Content/Images/Icon SVG/image-search.svg`" width="20" @click="viewImage(chkstatus_detail.pics.filter(pic => pic.item_type === 'A'))" /></p>
                  <p class="progress__info text-secondary-v2" v-if="['P', 'Y'].includes(status_text)">{{ chkstatus_detail.worker_start_date | date('DD/MM/YYYY HH:mm') }}</p>
                  <p class="progress__info text-secondary-v2" v-if="['P', 'Y'].includes(status_text)">{{ ui.csm_v2_due_date }} <span class="text-success-v2">{{chkstatus_detail.worker_end_date | date('DD/MM/YYYY')}}</span></p>
                </li>
                <li class="progress__item" :class="{'progress__item--active': status_text === 'Y'}">
                  <p class="progress__title text-success-v2" style="display: inline-flex; align-items: center; gap: 6px;">
                    {{ ui.csm_v2_status_finished }}
                    <img v-if="['P', 'Y'].includes(status_text)" class="svg-icon" :src="`${baseUrl}Content/Images/Icon SVG/image-search.svg`" width="20" style="vertical-align: middle; cursor: pointer;" @click="viewImage(chkstatus_detail.pics.filter(pic => ['S1', 'Y'].includes(pic.item_type)))" />
                    <i v-if="['Y'].includes(status_text) && is_mango === 'Y'" class="far fa-file text-black" style="font-size: 17px; cursor: pointer;" @click="viewImage(chkstatus_detail.pics.filter(pic => ['T'].includes(pic.item_type)))"></i>
                  </p>
                  <p class="progress__info text-secondary-v2" v-if="status_text == 'Y'">{{ ui.csm_v2_status_done }} <span class="text-success-v2">{{chkstatus_detail.complete_date | date('DD/MM/YYYY')}}</span></p>
                </li>

              </ul>
            </div>
            <div v-if="['HW', 'P', 'Y'].includes(status_text)">
              <hr>
              <div class="padding-l-15 ">
                <span>Comment</span>
                <div style="height: 300px; overflow-y: auto; padding: 15px 0;">
                  <comment_external :showCommentExtLength="showCommentExtLength"
                                    :showCommentExt="showCommentExt"
                                    :chkstatus_detail="chkstatus_detail"
                                    :data_comment="data_comment" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="container-fluid" v-else>
          <div class="container-fluid margin-t-15">
            <div class="margin-t-15" v-for="x,idx in score">
              <span class="text-dark text-bold">{{idx+1}}. {{ x.itemname }}</span>
              <div class="d-flex flex-column gap-15 margin-t-15">
                <div class="d-flex justify-content-center">
                  <img v-if="x.score_hover > 0"
                       id="default-image"
                       :src="`${baseUrl}Content/Images/Icon PNG/rating_score${x.score_hover > 5 ? 5 : x.score_hover }.png`"
                       width="100"
                       height="100">
                  <img v-else
                       id="default-image"
                       :src="`${baseUrl}Content/Images/Icon PNG/rating_score${x.score_ans > 5 ? 5 : x.score_ans}.png`"
                       width="100"
                       height="100">
                </div>

                <div class="d-flex gap-10 justify-content-center">
                  <i class="fa-star star-list"
                     v-for="xx in x.max_score"
                     :class="[ x.score_ans >= xx ? 'fas' : 'far', x.score_hover >= xx ? 'fas' : 'far' ]"
                     style="color:#FFC93E;font-size: 24px;"
                     @click="addScore('score', idx, xx)"
                     @mouseover="addScore('over', idx, xx)"
                     @mouseleave="addScore('over', idx, 0)"></i>
                </div>

                <span class="fs-4 text-center text-secondary-v2" v-if="x.score_hover > 0">
                  {{ x.score_hover == 0 ? ui.csm_v2_evaluation : x.score_hover == 1 ? ui.csm_v2_rating_very_poor : x.score_hover == 2 ? ui.csm_v2_rating_poor : x.score_hover == 3 ? ui.csm_v2_rating_fair : x.score_hover == 4 ? ui.csm_v2_rating_good : ui.csm_v2_rating_excellent }}
                </span>
                <span class="fs-4 text-center text-secondary-v2" v-else>
                  {{ x.score_ans == 0 ? ui.csm_v2_evaluation : x.score_ans == 1 ? ui.csm_v2_rating_very_poor : x.score_ans == 2 ? ui.csm_v2_rating_poor : x.score_ans == 3 ? ui.csm_v2_rating_fair : x.score_ans == 4 ? ui.csm_v2_rating_good : ui.csm_v2_rating_excellent }}
                </span>
              </div>
              <hr>
            </div>

            <!-- textarea อยู่ก่อนปุ่ม -->
            <div class="form-group">
              <label for="">{{ ui.csm_v2_remark }}</label>
              <textarea class="form-control fixed-x"
                        v-model="score_remark"
                        :disabled="score_ans > 0"></textarea>
            </div>

            <!-- ปุ่มอยู่หลัง textarea -->
            <div class="d-flex justify-content-between gap-10">
              <button class="form-control bg-secondary-cc text-dark border-radius-10 w-100p margin-t-30 margin-b-30"
                      @click="onReset('cancel_vote')">
                {{ ui.csm_v2_status_reject }}
              </button>

              <button class="form-control border-radius-10 w-100p margin-t-30 margin-b-30"
                      :class="[ score_ans > 0 ? 'bg-secondary-v2 text-white' : 'bg-success-v2 text-white']"
                      :disabled="score_ans > 0"
                      @click="SaveScore()">
                {{ ui.csm_v2_save }}
              </button>
            </div>
          </div>
        </div>

      </div>
      <div v-if="selectedTabs.id == 'Header_tab4' " class="Header_tab4">
        <div class="text-document w-100p text-center">
          <p class="fs-1">{{ ui.csm_v2_document_no }}</p>
          <span class="fs-2">DRAFT&nbsp; {{ req_no }}&nbsp; <a @click="CopyClipboard('Copy_docno')" style="color:#00BF9D;cursor: pointer;">{{ ui.csm_v2_copy }}</a></span>
          <div class="container-fluid d-flex flex-column align-items-center gap-30">
            <button class="btn btn-green-submit w-90p p-15 margin-t-15 margin-b-30 border-radius-10" @click="TabChangeReset('tab3')">{{ ui.csm_v2_status_follow_up }}</button>
            <a class="text-success-v2 pointer " @click="TabChangeReset('tab2_detail')">{{is_mango === 'Y' ? ui.csm_v2_request_again_mango : ui.csm_v2_request_again}}</a>
          </div>
        </div>
      </div>
      <div v-if="selectedTabs.id == 'Header_tab5'">
        <div class="container-fluid" style="padding-top: 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <!-- Warranty Section -->
            <div style="background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
              <div class="d-flex justify-content-between align-items-center" style="background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%); padding: 15px 20px; border-bottom: 1px solid #eee;">
                <div class="d-flex align-items-center gap-10">
                  <i class="fas fa-shield-alt" style="color: #00BF9D; font-size: 18px;"></i>
                  <span class="text-bold" style="color: #333; font-size: 15px;">{{ ui.csm_v2_warranty }}</span>
                </div>
                <span class="text-secondary-v2" style="font-size: 13px;">{{ ui.csm_v2_warranty_balance }}</span>
              </div>
              <div style="padding: 30px 20px; text-align: center;">
                <i class="fas fa-clipboard-list" style="font-size: 40px; color: #ddd; margin-bottom: 10px;"></i>
                <p style="color: #999; font-size: 14px;">{{ ui.csm_v2_no_warranty }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="selectedTabs.id == 'Header_tab6'" class="Header_tab6">
        <div class="container-fluid" style="padding-top: 30px; padding-bottom: 30px;">
          <div class="container" style="max-width: 600px;">
            <!-- Address Card -->
            <div style="background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 30px; margin-bottom: 20px; text-align: center;">
              <div class="d-flex justify-content-center" style="margin-bottom: 15px;">
                <div class="d-flex justify-content-center align-items-center" style="width: 70px; height: 70px; background: linear-gradient(135deg, #e6fff9 0%, #d4f7ed 100%); border-radius: 50%;">
                  <img :src="baseUrl + 'Content/Images/Icon SVG/location-building.svg'" width="36" height="36" alt="Location">
                </div>
              </div>
              <h3 class="text-bold" style="color: #00BF9D; margin-bottom: 15px;">{{ ui.csm_v2_address }}</h3>
              <p style="color: #555; line-height: 1.8; margin-bottom: 5px;">{{ ui.csm_v2_company_name }}</p>
              <p style="color: #555; line-height: 1.8; margin-bottom: 5px;">{{ ui.csm_v2_company_address1 }}</p>
              <p style="color: #555; line-height: 1.8; margin-bottom: 20px;">{{ ui.csm_v2_company_address2 }}</p>
              <button class="btn bg-success-v2 text-white border-radius-10" style="padding: 10px 30px; font-size: 14px;" @click="goTogoogle_map()">
                <i class="fas fa-directions margin-r-5"></i>{{ ui.csm_v2_show_direction }}
              </button>
            </div>

            <!-- Contact Card -->
            <div style="background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 30px; text-align: center;">
              <div class="d-flex justify-content-center" style="margin-bottom: 15px;">
                <div class="d-flex justify-content-center align-items-center" style="width: 70px; height: 70px; background: linear-gradient(135deg, #e6fff9 0%, #d4f7ed 100%); border-radius: 50%;">
                  <img :src="baseUrl + 'Content/Images/Icon SVG/info-outline.svg'" width="36" height="36" alt="Contact">
                </div>
              </div>
              <h3 class="text-bold" style="color: #00BF9D; margin-bottom: 20px;">{{ ui.csm_v2_contact_us }}</h3>
              <div class="d-flex flex-column gap-15">
                <div class="d-flex align-items-center justify-content-center gap-10">
                  <i class="fas fa-phone-alt" style="color: #00BF9D; font-size: 16px;"></i>
                  <span style="color: #333; font-size: 16px;">Call Center : 02-123-3900</span>
                </div>
                <div class="d-flex align-items-center justify-content-center gap-10">
                  <i class="fas fa-clock" style="color: #00BF9D; font-size: 16px;"></i>
                  <span style="color: #555; font-size: 14px;">{{ ui.csm_v2_office_hours }}</span>
                </div>
                <div>
                  <span style="color: #999; font-size: 13px;">{{ ui.csm_v2_office_closed }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="selectedTabs.id == 'Header_tab7'">
        <div v-if="!selectedTabs.isEdit">
          <div class="container padding-t-30">
            <div class="row">
              <div class="col-sm-6 col-md-4 my-10" v-for="x in project">
                <div class="card" :style="`background-image: linear-gradient(0deg, rgba(2,0,36,1) 0%, rgba(0,0,0,0.5) 1%, rgba(255,255,255,0) 100%), url(${showPictures(x.path_hex)}) !important;`">
                  <div class="btn-container-left">
                    <span class="text-white text-bold">{{ x.pre_des }}</span>
                  </div>
                  <div class="btn-container-right">
                    <button type="button" class="btn btn-sm btn-wrench" @click="SwitchContent('tab7_form', x)"><i class="fas fa-plus " style="padding-right:0px !important;"></i><span> {{ ui.csm_v2_add_member }}</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="selectedTabs.isEdit">
          <div class="container-fluid">
            <div class="container p-0 pt-60px">
              <div class="panel border-radius-15">
                <div class="panel-heading bg-transparent" style="border-bottom: 1px solid #f3f3f3;">
                  <div class="d-flex justify-content-between">
                    <div>
                      <h4>{{ ui.csm_v2_member_list }}</h4>
                    </div>
                    <div class="d-flex justify-content-center align-items-center">
                      <button type="button" class="btn btn-sm border-radius-25 bg-success-v2 text-white" @click="Openmodal_addMember()"><i class="fas fa-plus" style="padding-right:0px !important;"></i></button>
                    </div>
                  </div>
                </div>
                <div class="panel-body">
                  <div v-for="x, idx in member">
                    <div class="d-flex justify-content-between padding-l-5 padding-t-5 padding-b-5 padding-r-0">
                      <div class="flex-container" style="gap:0px 15px !important">
                        <img :src="`${baseUrl}Content/Images/Logo/logo_mango_dark_default.png`" class="img-responsive border-radius-25 h-50 w-50 align-self-center" style="object-fit: scale-down;" alt="Image not found!">
                        <div class="d-flex flex-column">
                          <span class="text-bold">{{ ui.csm_v2_contact_name }} : {{ x.name_th }}</span>
                          <span class="text-bold">Username : {{ x.userid }}</span>
                          <span class="text-secondary-v2">{{ ui.csm_v2_tel }} : {{ x.telephone }}</span>
                          <span class="text-secondary-v2">{{ ui.csm_v2_email }} : {{ x.mail }}</span>
                        </div>
                      </div>
                      <div class="d-flex align-self-start" style="column-gap: 10px">
                        <button type="button" class="btn btn-sm border-radius-25 bg-secondary-v2" @click="Openmodal_updateMember(x)"><i class="fas fa-user-edit" style="padding-right:0px !important;"></i></button>
                        <button type="button" class="btn btn-sm border-radius-25 bg-danger-v2" @click="Openmodal_deleteMember(x)"><i class="far fa-trash-alt trash text-white" style="padding-right:0px !important;"></i></button>
                      </div>
                    </div>
                    <hr class="tab6">
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <div v-if="selectedTabs.id == 'Header_tab8'">
        <div class="container-fluid">
          <div class="row padding-t-30">
            <div class="col-xs 12 col-sm-6 col-md-4" v-for="x, idx in member_req">
              <div class="panel border-radius-20 bg-white">
                <div class="panel-body padding-15">
                  <div class="d-flex flex-column">
                    <div class="d-flex justify-content-between">
                      <div class="flex-container" style="gap:0px 15px !important">
                        <img :src="`${baseUrl}Content/Images/Logo/logo_mango_dark.png`" class="img-responsive border-radius-25 h-50 w-50 align-self-center" style="object-fit: scale-down;" alt="Image not found!">
                        <div class="flex-container flex-column">
                          <h4 class="text-bold mt-0">{{ x.name_th }}</h4>
                          <h4 class="text-bold mt-0">{{ x.userid }}</h4>
                          <h4 class="text-bold mb-0 mt-0 text-secondary-v2">{{ x.telephone }}</h4>
                        </div>
                      </div>
                      <span class="text-secondary-v2">{{ compareDateTime(x.create_at) }}</span>
                    </div>
                    <div>
                      <h4 class="text-secondary-v2">{{ ui.csm_v2_phase }} : {{ x.pre_des }} </h4>
                    </div>
                  </div>
                </div>
                <div class="panel-footer bg-transparent">
                  <div class="d-flex justify-content-around gap-15">
                    <button class="btn btn-sm bg-success-v2 text-white w-100p border-radius-10" @click="AcceptMember(x)">{{ ui.csm_v2_accept }}</button>
                    <button class="btn btn-sm bg-white-f4 text-secondary-66 w-100p border-1-s-f4 border-radius-10" @click="Openmodal_deleteMember(x)">{{ ui.csm_v2_delete }}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Content Side-bar -->
    <div class="sidebar content-menu p-0">
      <div class="sidebar-content h-100p">
        <div class="v2-drawer">
          <div class="v2-drawer-head">
            <div class="v2-drawer-user">
              <div class="v2-drawer-avatar">{{ (customer.customer_name || '?').charAt(0).toUpperCase() }}</div>
              <div class="v2-drawer-id">
                <span class="v2-drawer-name">{{ customer.customer_name }}</span>
                <span class="v2-drawer-role">{{ customer.type == "ar_cust" ? ui.csm_v2_project_owner : customer.type == "line_member" ? ui.csm_v2_customer : '' }}</span>
              </div>
            </div>
            <button class="v2-drawer-close" @click.prevent="ToggleMenu('Close')">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="v2-drawer-nav">
            <span class="v2-drawer-label">{{ ui.csm_v2_menu }}</span>
            <a class="v2-menu-item" :class="{ 'is-active' : selectedTabs.id == 'Header_tab5' }" @click="TabChange(4)">
              <span class="v2-menu-icon">
                <img :src="baseUrl + `Content/Images/Icon SVG/user-line-${selectedTabs.id == 'Header_tab5' ? 'green' : 'gray'}.svg`" width="20" height="20" alt="">
              </span>
              <span class="v2-menu-text">{{ ui.csm_v2_profile }}</span>
            </a>
            <a class="v2-menu-item" :class="{ 'is-active' : selectedTabs.id == 'Header_tab2' }" @click="TabChange(1)">
              <span class="v2-menu-icon">
                <img :src="baseUrl + `Content/Images/Icon SVG/wrench-${selectedTabs.id == 'Header_tab2' ? 'green' : 'gray'}.svg`" width="20" height="20" alt="">
              </span>
              <span class="v2-menu-text">{{is_mango === 'Y' ? ui.csm_v2_create_request_mango : ui.csm_v2_create_request}}</span>
            </a>
            <a class="v2-menu-item" :class="{ 'is-active' : selectedTabs.id == 'Header_tab3' }" @click="TabChange(2)">
              <span class="v2-menu-icon">
                <img :src="baseUrl + `Content/Images/Icon SVG/document-${selectedTabs.id == 'Header_tab3' ? 'green' : 'gray'}.svg`" width="20" height="20" alt="">
              </span>
              <span class="v2-menu-text">{{ ui.csm_v2_status_follow_up }}</span>
            </a>
            <a class="v2-menu-item" :class="{ 'is-active' : selectedTabs.id == 'Header_tab7' }" v-if="customer.type == 'ar_cust'" @click="TabChange(6)">
              <span class="v2-menu-icon">
                <img :src="baseUrl + `Content/Images/Icon SVG/document-${selectedTabs.id == 'Header_tab7' ? 'green' : 'gray'}.svg`" width="20" height="20" alt="">
              </span>
              <span class="v2-menu-text">{{ ui.csm_v2_member }}</span>
            </a>
            <a class="v2-menu-item" :class="{ 'is-active' : selectedTabs.id == 'Header_tab8' }" v-if="customer.type == 'ar_cust'" @click="TabChange(7)">
              <span class="v2-menu-icon">
                <img :src="baseUrl + `Content/Images/Icon SVG/user-line-${selectedTabs.id == 'Header_tab8' ? 'green' : 'gray'}.svg`" width="20" height="20" alt="">
              </span>
              <span class="v2-menu-text">{{ ui.csm_v2_member_request }}</span>
              <span class="v2-menu-badge" v-if="tabs[7].total > 0">{{ tabs[7].total }}</span>
            </a>
            <a class="v2-menu-item" :class="{ 'is-active' : selectedTabs.id == 'Header_tab9' }" @click="TabChange(8)">
              <span class="v2-menu-icon">
                <img :src="baseUrl + `Content/Images/Icon SVG/user-line-${selectedTabs.id == 'Header_tab9' ? 'green' : 'gray'}.svg`" width="20" height="20" alt="">
              </span>
              <span class="v2-menu-text">{{ ui.csm_v2_parcel_tracking }}</span>
            </a>
            <a class="v2-menu-item" :class="{ 'is-active' : selectedTabs.id == 'Header_tab6' }" @click="TabChange(5)">
              <span class="v2-menu-icon">
                <img :src="baseUrl + `Content/Images/Icon SVG/building-${selectedTabs.id == 'Header_tab6' ? 'green' : 'gray'}.svg`" width="20" height="20" alt="">
              </span>
              <span class="v2-menu-text">{{ ui.csm_v2_ask_for_help }}</span>
            </a>

            <span class="v2-drawer-divider"></span>

            <a class="v2-menu-item" @click="$refs.changeLang.openModal()">
              <span class="v2-menu-icon"><i class="fas fa-globe"></i></span>
              <span class="v2-menu-text">{{ ui.select_language || 'เปลี่ยนภาษา' }}</span>
              <span class="v2-menu-lang">{{ user_lang.substring(0, 2) }}</span>
            </a>
          </div>

          <div class="v2-drawer-foot">
            <button class="v2-drawer-btn" @click="Openmodal_updatePasswordMember()">
              <i class="fas fa-key"></i>{{ ui.csm_v2_change_password }}
            </button>
            <button class="v2-drawer-btn is-danger" @click="doLogout">
              <i class="fas fa-sign-out-alt"></i>{{ ui.csm_v2_logout }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <modalv2 ref="modal_addList"
             :hideFooter="true"
             @close-function="onReset('cancel_addFile')">
      <template #header>
        <span class="fs-2">{{ isEditMode ? ui.csm_v2_edit_task : (is_mango === 'Y' ? ui.csm_v2_add_task_mango : ui.csm_v2_add_task) }}</span>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form.subject)}">
              <label class="text-danger">{{ ui.csm_v2_subject }}<sup>*</sup></label>
              <span class="input-group col-md-12">
                <input type="text" class="form-control input-sm border-x-0 border-t-0 border-radius-0" v-model="form.subject" maxlength="250" />
                <span class="input-group-btn">
                  <button class="btn bg-transparent border-0 p-0"
                          style="width: 16.2px; height: 16.2px;"
                          @click="openDescModal('subject')">
                    <i class="fa fa-search" style="color: #3c8dbc; font-size: 16.2px;"></i>
                  </button>
                </span>
              </span>
              <span class="text-danger" v-show="xt.isEmpty(form.subject)">field is not null</span>

            </div>
          </div>
          <div class="col-md-12">
            <div class="form-group">
              <label>{{ ui.csm_v2_remark }}</label>
              <a @click="openDescModal('description2')" style="font-size: larger;padding: 5px;"><i class="fa fa-search"></i></a>
              <textarea class="form-control input-sm" rows="5" maxlength="2000" style="resize: vertical;" v-model="form.description"></textarea>
            </div>
          </div>
          <div class="col-md-12 margin-t-15">
            <button class="btn btn-lg bg-secondary-v2 w-100p border-radius-10" @click="beforeaddFile('file')"><i class="fas fa-upload"></i> {{ ui.csm_v2_upload_file }}</button>
            <button class="btn btn-lg bg-success-v2-10 w-100p border-radius-10" @click="beforeaddFile('picture')"><i class="fas fa-upload"></i> {{ ui.csm_v2_upload_picture }}</button>
          </div>
          <div class="col-xs-12 col-sm-12 col-md-6 col-lg-4 margin-t-15 margin-b-15 " v-for="x,idx in form_beforepicsAttach">
            <div class="padding-5 card-list">
              <div class="d-flex">
                <div>
                  <img v-if="['png','jpeg','jpg'].includes(getFileExt(x.filename))" :src="showPictures(x.fileid)" class="w-100 h-100 border-radius-10" />
                  <p v-if="['mp4'].includes(getFileExt(x.filename))">
                    <a :href="createFilePath(x.fileid)" target="_blank"><i class="fas fa-file-video fa-5x"></i></a>
                  </p>
                  <p v-if="!['jpg','jpeg','png', 'mp4'].includes(getFileExt(x.filename))">
                    <i class="fas fa-file-word fa-5x" v-if="['doc','docx'].includes(getFileExt(x.filename))"></i>
                    <i class="fas fa-file-excel fa-5x" v-else-if="['xls','xlsx'].includes(getFileExt(x.filename))"></i>
                    <i class="fas fa-file-powerpoint fa-5x" v-else-if="['ppt','pptx'].includes(getFileExt(x.filename))"></i>
                    <i class="fas fa-file-pdf fa-5x" v-else-if="['pdf'].includes(getFileExt(x.filename))"></i>
                    <i class="fas fa-file fa-5x" v-else=""></i>
                  </p>
                </div>
                <div class="w-auto padding-l-5">
                  <div class="form-group w-100p">
                    <label>{{ ui.csm_v2_description }}</label>
                    <textarea class="form-control fixed-none overflow-y-auto h-100p " v-model="x.description"></textarea>
                  </div>
                </div>
                <div>
                  <button class="btn btn-sm btn-bg-trash border-radius-30 " @click="DeletePic('form_detail', idx)"><i class="far fa-trash-alt trash"></i></button>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 margin-t-15 p-0">
            <div class="row p-0" v-if="form_beforepicsAttach.length > 0">
              <div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <button class="btn btn-lg bg-success-v2 w-100p border-radius-10 mb-10" @click="isEditMode ? Confirm_editFile() : Confirm_addFile()">{{ isEditMode ? ui.csm_v2_save : ui.csm_v2_add }}</button>
              </div>
              <div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <button class="btn btn-lg bg-red-v2 w-100p border-radius-10" @click="DeletePic('form_detailAll')"><i class="far fa-trash-alt trash"></i> {{ ui.csm_v2_delete }}</button>
              </div>
            </div>
            <button v-else class="btn btn-lg bg-success-v2 w-100p border-radius-10 mb-10" @click="isEditMode ? Confirm_editFile() : Confirm_addFile()" :disabled="xt.isEmpty(form.subject)">{{ isEditMode ? ui.csm_v2_save : ui.csm_v2_add }}</button>
          </div>
        </div>
      </template>
    </modalv2>
    <modalv2 ref="modal_confirm" :hideHeaderclose="true" footerClass="d-flex justify-content-between gap-10" bodyClass="overflow-y-hidden">
      <template #header>

      </template>
      <template #body>
        <div class="container-fluid">
          <div class="container">
            <div class="d-flex justify-content-center">
              <img :src="`${baseUrl}Content/Images/Icon PNG/document-sending.png`" class="img-responsive" />
            </div>
            <div class="text-center visible-xs">
              <p class="fs-1">{{ ui.csm_v2_confirm_send }}</p>
              <p class="fs-5">{{ ui.csm_v2_send_warning }}</p>
            </div>
            <div class="text-center hidden-xs">
              <p class="fs-2">{{ ui.csm_v2_confirm_send }}</p>
              <p class="fs-3">{{ ui.csm_v2_send_warning }}</p>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-md bg-transparent border-radius-10 w-100p border-1-cc" @click="$refs.modal_confirm.closeModal()">{{ ui.csm_v2_status_reject }}</button>
        <button class="btn btn-md bg-success-v2 text-white border-radius-10 w-100p" @click="beforeOnSave()">{{ ui.csm_v2_submit }}</button>
      </template>
    </modalv2>
    <modalv3 ref="modal_vote" @close-function="onReset('cancel_vote')" footerClass="d-flex justify-content-between gap-10" bodyClass="modal-vote-body">
      <template #header>
        <div class="d-flex">
          <span class="fs-2 padding-b-5">{{ ui.csm_v2_rating }}</span>
        </div>
      </template>
      <template #body>
        <div class="container-fluid">
          <div class="margin-t-15" v-for="x,idx in score">
            <span class="fs-3 text-dark text-bold">{{idx+1}}. {{ x.itemname }}</span>
            <div class="d-flex flex-column gap-15  margin-t-15">
              <div class="d-flex justify-content-center">
                <img v-if="x.score_hover > 0" id="default-image" :src="`${baseUrl}Content/Images/Icon PNG/rating_score${x.score_hover > 5 ? 5 : x.score_hover }.png`" width="100" height="100">
                <img v-else id="default-image" :src="`${baseUrl}Content/Images/Icon PNG/rating_score${x.score_ans > 5 ? 5 : x.score_ans}.png`" width="100" height="100">
              </div>
              <div class="d-flex gap-10 justify-content-center">
                <i class="fa-star star-list" v-for="xx in x.max_score" :class="[ x.score_ans >= xx ? 'fas' : 'far', x.score_hover >= xx ? 'fas' : 'far' ]" style="color:#FFC93E" @click="addScore('score', idx, xx)" @mouseover="addScore('over', idx, xx)" @mouseleave="addScore('over', idx, 0)" :disabled="score_ans > 0"></i>
              </div>
              <span class="fs-4 text-center text-secondary-v2" v-if="x.score_hover > 0">{{ x.score_hover == 0 ? ui.csm_v2_evaluation : x.score_hover == 1 ? ui.csm_v2_rating_very_poor : x.score_hover == 2 ? ui.csm_v2_rating_poor : x.score_hover == 3 ? ui.csm_v2_rating_fair : x.score_hover == 4 ? ui.csm_v2_rating_good : ui.csm_v2_rating_excellent  }}</span>
              <span class="fs-4 text-center text-secondary-v2" v-else>{{ x.score_ans == 0 ? ui.csm_v2_evaluation : x.score_ans == 1 ? ui.csm_v2_rating_very_poor : x.score_ans == 2 ? ui.csm_v2_rating_poor : x.score_ans == 3 ? ui.csm_v2_rating_fair : x.score_ans == 4 ? ui.csm_v2_rating_good : ui.csm_v2_rating_excellent  }}</span>
            </div>
            <hr class="hr-list-member" style="border-top : 1px solid #f3f3f3">
          </div>
          <div class="form-group">
            <label for="">{{ ui.csm_v2_remark }}</label>
            <textarea class="form-control fixed-x" v-model="score_remark" :disabled="score_ans > 0"></textarea>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="form-control bg-secondary-cc text-dark border-radius-10 w-100p" @click="onReset('cancel_vote')">{{ ui.csm_v2_status_reject }}</button>
        <button class="form-control border-radius-10 w-100p" :class="[ score_ans > 0 ? 'bg-secondary-v2 text-dark' : 'bg-success-v2 text-white']" :disabled="score_ans > 0" @click="SaveScore()">{{ ui.csm_v2_save }}</button>
      </template>
    </modalv3>
    <modalv3 ref="modal_addMember" @close-function="Closemodal_addMember()">
      <template #header>
        <div class="d-flex align-items-center gap-10">
          <i class="fas fa-user-plus" style="color: #00BF9D; font-size: 20px;"></i>
          <span class="fs-2 padding-b-5">{{ ui.csm_v2_add_member }}</span>
        </div>
      </template>
      <template #body>
        <div class="container-fluid p-0">
          <!-- Icon Section -->
          <div class="d-flex flex-column align-items-center padding-t-15 padding-b-20" style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 12px; margin-bottom: 20px;">
            <div class="d-flex justify-content-center align-items-center" style="width: 64px; height: 64px; background-color: #00BF9D; border-radius: 50%; margin-bottom: 10px;">
              <i class="fas fa-user-plus text-white" style="font-size: 24px;"></i>
            </div>
            <span class="text-bold fs-4" style="color: #333;">{{ ui.csm_v2_add_member_hint }}</span>
          </div>

          <!-- Form Section -->
          <div style="background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; padding: 20px;">
            <h5 class="text-bold margin-b-20" style="color: #00BF9D; border-bottom: 2px solid #00BF9D; padding-bottom: 8px; display: inline-block;">{{ ui.csm_v2_personal_info }}</h5>

            <div class="d-flex flex-column gap-15">
              <!-- เฟส -->
              <div class="form-group" :class="{ 'has-error' : xt.isObjectEmpty(form_member_proj)}" style="margin-bottom: 0;">
                <label class="text-secondary-v2 d-flex align-items-center gap-5" style="font-size: 13px;">
                  <i class="fas fa-map-marker-alt" style="width: 16px; color: #00BF9D;"></i>
                  {{ ui.csm_v2_phase }}
                </label>
                <select class="form-control input-sm" style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 8px 12px;" v-model="form_member_proj">
                  <option v-for="x in detail" v-bind:value="x" v-text="x.pre_des"></option>
                </select>
                <span class="text-danger" style="font-size: 12px;" v-show="xt.isObjectEmpty(form_member_proj)">{{ ui.csm_v2_valid_select_required }}</span>
              </div>

              <!-- Username -->
              <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form_member.userid)}" style="margin-bottom: 0;">
                <label class="text-secondary-v2 d-flex align-items-center gap-5" style="font-size: 13px;">
                  <i class="fas fa-id-badge" style="width: 16px; color: #00BF9D;"></i>
                  <span class="text-danger">Username<sup>*</sup></span>
                </label>
                <div class="d-flex justify-content-between" style="margin-bottom: 4px;">
                  <span></span>
                  <span class="text-secondary-v2" style="font-size: 11px;">{{ xt.textLength(form_member.userid, 20) }}</span>
                </div>
                <input type="text" class="form-control input-sm" style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 8px 12px;" maxlength="20" v-model.trim="form_member.userid" :placeholder="ui.csm_v2_username" @input="filterInput($event, 'add_member')">
                <span class="text-danger" style="font-size: 12px;" v-show="xt.isEmpty(form_member.userid)">{{ ui.csm_v2_valid_required }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-sm border-radius-10 bg-success-v2 text-white" style="padding: 8px 20px;" @click="LineOA_Before_CreateMember()"><i class="fas fa-user-check margin-r-5"></i>{{ ui.csm_v2_register }}</button>
        <button class="btn btn-sm bg-secondary-cc text-dark border-radius-10" style="padding: 8px 20px;" @click="$refs.modal_addMember.closeModal()">{{ ui.csm_v2_status_reject }}</button>
      </template>
    </modalv3>
    <modalv2 ref="modal_deleteMember" :hideHeaderclose="true" footerClass="d-flex justify-content-between gap-10">
      <template #body>
        <div class="d-flex flex-column justify-content-center gap-30">
          <button class="btn btn-sm align-self-center bg-danger-v2" style="border-radius:60px;padding:20px !important;"><i class="far fa-trash-alt trash" style="font-size: 55px"></i></button>
          <div class="d-flex flex-column ">
            <h3 class="align-self-center">{{ ui.csm_v2_delete_confirmation }}</h3>
            <h5 class="align-self-center">{{ ui.csm_v2_delete_warning }}</h5>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="d-flex justify-content-around gap-15 w-100p">
          <button class="btn btn-md bg-transparent border-radius-10 w-100p border-1-cc" @click="$refs.modal_deleteMember.closeModal()">{{ ui.csm_v2_status_reject }}</button>
          <button class="btn btn-md bg-danger-v3 text-white border-radius-10 w-100p" @click="Delete_member()">{{ ui.csm_v2_delete }}</button>
        </div>

      </template>
    </modalv2>
    <modalv3 ref="modal_updateMember" @close-function="Closemodal_updateMember()">
      <template #header>
        <div class="d-flex align-items-center gap-10">
          <img :src="`${baseUrl}Content/Images/Icon SVG/user-line-green.svg`" width="24" height="24" />
          <span class="fs-2 padding-b-5">{{ ui.csm_v2_member_info }}</span>
        </div>
      </template>
      <template #body>
        <div class="container-fluid p-0">
          <!-- Profile Card -->
          <div class="d-flex flex-column align-items-center padding-t-15 padding-b-20" style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 12px; margin-bottom: 20px;">
            <div class="d-flex justify-content-center align-items-center" style="width: 64px; height: 64px; background-color: #00BF9D; border-radius: 50%; margin-bottom: 10px;">
              <span class="text-white text-bold" style="font-size: 24px;">{{ (form_member.name_th || '?').charAt(0).toUpperCase() }}</span>
            </div>
            <span class="text-bold fs-3">{{ form_member.name_th || '-' }}</span>
            <span class="text-secondary-v2 fs-5">{{ form_member.userid || '-' }}</span>
          </div>

          <!-- ข้อมูลส่วนตัว -->
          <div style="background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
            <h5 class="text-bold margin-b-15" style="color: #00BF9D; border-bottom: 2px solid #00BF9D; padding-bottom: 8px; display: inline-block;">{{ ui.csm_v2_personal_info }}</h5>
            <div class="d-flex flex-column gap-15">
              <div class="d-flex align-items-start gap-10">
                <i class="fas fa-map-marker-alt text-secondary-v2" style="width: 20px; margin-top: 3px;"></i>
                <div class="d-flex flex-column">
                  <span class="text-secondary-v2" style="font-size: 12px;">{{ ui.csm_v2_phase }}</span>
                  <span class="text-bold">{{ form_member.pre_des || '-' }}</span>
                </div>
              </div>
              <div class="d-flex align-items-start gap-10">
                <i class="fas fa-user text-secondary-v2" style="width: 20px; margin-top: 3px;"></i>
                <div class="d-flex flex-column">
                  <span class="text-secondary-v2" style="font-size: 12px;">{{ ui.csm_v2_contact_name }}</span>
                  <span class="text-bold">{{ form_member.name_th || '-' }}</span>
                </div>
              </div>
              <div class="d-flex align-items-start gap-10">
                <i class="fas fa-phone text-secondary-v2" style="width: 20px; margin-top: 3px;"></i>
                <div class="d-flex flex-column">
                  <span class="text-secondary-v2" style="font-size: 12px;">{{ ui.csm_v2_tel }}</span>
                  <span class="text-bold">{{ form_member.telephone || '-' }}</span>
                </div>
              </div>
              <div class="d-flex align-items-start gap-10">
                <i class="fas fa-envelope text-secondary-v2" style="width: 20px; margin-top: 3px;"></i>
                <div class="d-flex flex-column">
                  <span class="text-secondary-v2" style="font-size: 12px;">{{ ui.csm_v2_email }}</span>
                  <span class="text-bold">{{ form_member.mail || '-' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ข้อมูลเข้าสู่ระบบ -->
          <div style="background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; padding: 20px;">
            <h5 class="text-bold margin-b-15" style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; display: inline-block;">{{ ui.csm_v2_login_info }}</h5>
            <div class="d-flex flex-column gap-15">
              <div class="d-flex align-items-start gap-10">
                <i class="fas fa-id-badge text-secondary-v2" style="width: 20px; margin-top: 3px;"></i>
                <div class="d-flex flex-column">
                  <span class="text-secondary-v2" style="font-size: 12px;">Username</span>
                  <span class="text-bold">{{ form_member.userid || '-' }}</span>
                </div>
              </div>
              <div class="d-flex align-items-start gap-10" v-if="form_member.update_status == 'N'">
                <i class="fas fa-key text-secondary-v2" style="width: 20px; margin-top: 3px;"></i>
                <div class="d-flex flex-column">
                  <span class="text-secondary-v2" style="font-size: 12px;">Password</span>
                  <span class="text-bold" style="letter-spacing: 2px;">{{ form_member.userpass || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-sm text-warning bg-white border-radius-10" style="border: 1px solid #e6a817;" @click="LineOA_Before_ResetPasswordMember()"><i class="fas fa-key margin-r-5"></i>{{ ui.csm_v2_admin_reset_password }}</button>
        <button class="btn btn-sm bg-navy text-white border-radius-10" v-if="form_member.update_status == 'N'" @click="CopyClipboard_Member()"><i class="fas fa-copy margin-r-5"></i>{{ ui.csm_v2_copy_user }}</button>
        <button class="btn btn-sm bg-success-v2 text-white border-radius-10" @click="$refs.modal_updateMember.closeModal()">{{ ui.csm_v2_ok }}</button>
      </template>
    </modalv3>
    <modalv3 ref="modal_updatePasswordMember" @close-function="Closemodal_updatePasswordMember()">
      <template #header>
        <div class="d-flex align-items-center gap-10">
          <i class="fas fa-key" style="color: #e6a817; font-size: 20px;"></i>
          <span class="fs-2 padding-b-5">{{ ui.csm_v2_change_password }} {{customer.type=='ar_cust' ? '(Customer)' : '(Member)'}}</span>
        </div>
      </template>
      <template #body>
        <div class="container-fluid p-0">
          <!-- Warning Banner -->
          <div class="d-flex align-items-center gap-10 padding-t-10 padding-b-10 padding-l-15 padding-r-15" style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 10px; margin-bottom: 20px;">
            <i class="fas fa-exclamation-triangle" style="color: #e6a817; font-size: 18px;"></i>
            <span class="text-bold" style="color: #856404; font-size: 13px;">{{ ui.csm_v2_change_password_warning }}</span>
          </div>

          <!-- Password Form -->
          <div style="background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; padding: 20px;">
            <h5 class="text-bold margin-b-20" style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; display: inline-block;">{{ ui.csm_v2_password_info }}</h5>

            <div class="d-flex flex-column gap-15">
              <!-- Old Password -->
              <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form_member.userpass_old)}" style="margin-bottom: 0;">
                <label class="d-flex align-items-center gap-5" style="font-size: 13px;">
                  <i class="fas fa-lock" style="width: 16px; color: #e6a817;"></i>
                  <span class="text-danger">{{ui.csm_v2_old_password ||'Old Password' }}<sup>*</sup></span>
                  <span class="text-secondary-v2 pull-right" style="margin-left: auto; font-size: 11px;">{{ xt.textLength(form_member.userpass_old, 10) }}</span>
                </label>
                <input type="password" class="form-control input-sm" style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 8px 12px;" maxlength="10" v-model.trim="form_member.userpass_old" :placeholder="ui.csm_v2_old_password">
                <span class="text-danger" style="font-size: 11px;" v-if="!validatePassword('userpass_old')">{{ ui.csm_v2_valid_password_rule }}</span>
              </div>

              <!-- New Password -->
              <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form_member.userpass)}" style="margin-bottom: 0;">
                <label class="d-flex align-items-center gap-5" style="font-size: 13px;">
                  <i class="fas fa-key" style="width: 16px; color: #00BF9D;"></i>
                  <span class="text-danger">{{ui.csm_v2_new_password||'New Password'}}<sup>*</sup></span>
                  <span class="text-secondary-v2 pull-right" style="margin-left: auto; font-size: 11px;">{{ xt.textLength(form_member.userpass, 10) }}</span>
                </label>
                <input type="password" class="form-control input-sm" style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 8px 12px;" maxlength="10" v-model.trim="form_member.userpass" :placeholder="ui.csm_v2_new_password">
                <span class="text-danger" style="font-size: 11px;" v-if="!validatePassword('userpass')">{{ ui.csm_v2_valid_password_rule }}</span>
              </div>

              <!-- Confirm Password -->
              <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form_member.userpass_cf)}" style="margin-bottom: 0;">
                <label class="d-flex align-items-center gap-5" style="font-size: 13px;">
                  <i class="fas fa-check-double" style="width: 16px; color: #00BF9D;"></i>
                  <span class="text-danger">{{ui.csm_v2_confirm_new_password||'Confirm Password'}}<sup>*</sup></span>
                  <span class="text-secondary-v2 pull-right" style="margin-left: auto; font-size: 11px;">{{ xt.textLength(form_member.userpass_cf, 10) }}</span>
                </label>
                <input type="password" class="form-control input-sm" style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 8px 12px;" maxlength="10" v-model.trim="form_member.userpass_cf" :placeholder="ui.csm_v2_confirm_new_password">
                <span class="text-danger" style="font-size: 11px;" v-if="!validatePassword('userpass_match')">{{ ui.csm_v2_valid_password_match }}</span>
              </div>
            </div>
          </div>

          <!-- Password Rules -->
          <div style="background: #f8f9fa; border-radius: 10px; padding: 12px 15px; margin-top: 15px;">
            <span class="text-secondary-v2" style="font-size: 12px;">
              <i class="fas fa-info-circle" style="color: #00BF9D; margin-right: 5px;"></i>
              {{ ui.csm_v2_password_rule }}
            </span>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-sm border-radius-10 bg-success-v2 text-white" style="padding: 8px 20px;" @click="LineOA_Before_UpdatePasswordMember()"><i class="fas fa-save margin-r-5"></i>{{ ui.csm_v2_confirm_transaction }}</button>
        <button class="btn btn-sm bg-secondary-cc text-dark border-radius-10" style="padding: 8px 20px;" @click="$refs.modal_updatePasswordMember.closeModal()">{{ ui.csm_v2_status_reject }}</button>
      </template>
    </modalv3>
    <!-- devtae -->
    <modalv3 ref="modal_firstLogin" :hideHeaderclose="true">
      <template #header>
        <div class="d-flex">
          <span class="fs-2 text-dark padding-b-5">{{ ui.csm_v2_member_info }}</span>
        </div>
      </template>
      <template #body>
        <input type="text" name="email" style="display:none">
        <input type="password" name="password" style="display:none">
        <div class="row" v-show="customer.type == 'line_member'">
          <div class="col-md-12">
            <h5 class="fw-bold">{{ ui.csm_v2_personal_info }}</h5>
          </div>
          <div class="col-md-12 margin-b-20">
            <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form_member.name_th)}">
              <label for="name" class="text-secondary-v2 text-danger">{{ ui.csm_v2_contact_name }}<sup>*</sup></label>
              <input type="text" class="form-control input-sm border-x-0 border-t-0 border-radius-0" maxlength="2000" v-model="form_member.name_th" :placeholder="ui.csm_v2_input_name" id="name">
              <span class="text-danger" v-show="xt.isEmpty(form_member.name_th)">{{ ui.csm_v2_valid_required }}</span>
            </div>
          </div>
          <div class="col-md-12 margin-b-20">
            <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form_member.telephone)}">
              <label for="tel" class="text-secondary-v2 text-danger">{{ ui.csm_v2_tel }}<sup>*</sup></label>
              <input type="tel" class="form-control input-sm border-x-0 border-t-0 border-radius-0" maxlength="10" v-model="form_member.telephone" @keyup="onlyPressNumber2($event)" :placeholder="ui.csm_v2_input_tel" id="tel">
              <span class="text-danger" v-show="xt.isEmpty(form_member.telephone)">{{ ui.csm_v2_valid_required }}</span>
            </div>
          </div>
          <div class="col-md-12 margin-b-30">
            <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form_member.mail)}">
              <label for="email" class="text-secondary-v2 text-danger">{{ ui.csm_v2_email }}<sup>*</sup></label>
              <input type="email" name="email" style="display:none">
              <input type="email" class="form-control input-sm border-x-0 border-t-0 border-radius-0" maxlength="200" v-model="form_member.mail" :placeholder="ui.csm_v2_input_email" id="email" autocomplete="off">
              <span class="text-danger" v-show="xt.isEmpty(form_member.mail)">{{ ui.csm_v2_valid_required }}</span>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <h5 class="fw-bold">{{ ui.csm_v2_login_info }}</h5>
          </div>
          <div class="col-md-12 margin-b-20">
            <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form_member.userpass)}">
              <label for="password" class="text-secondary-v2 text-danger">Password<sup>*</sup></label><label class="pull-right text-secondary-v2">{{ xt.textLength(form_member.userpass, 10) }}</label>
              <div class="input-group">
                <input :type="showPassword ? 'text' : 'password'" class="form-control input-sm border-x-0 border-t-0 border-radius-0" maxlength="10" v-model.trim="form_member.userpass" placeholder="Userpass" id="password">
                <span class="input-group-btn" @click="showPassword = !showPassword">
                  <a class="btn btn-sm bg-navy"><i class="far text-white" :class="[ !showPassword ? 'fa-eye' : 'fa-eye-slash' ]"></i></a>
                </span>
              </div>
              <span class="text-danger" v-if="!validatePassword('userpass')">{{ ui.csm_v2_valid_password_rule }}</span>
            </div>
            <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form_member.userpass_cf)}">
              <label for="password" class="text-secondary-v2 text-danger">Confirm Password<sup>*</sup></label><label class="pull-right text-secondary-v2">{{ xt.textLength(form_member.userpass_cf, 10) }}</label>
              <div class="input-group">
                <input :type="showPassword_cf ? 'text' : 'password'" class="form-control input-sm border-x-0 border-t-0 border-radius-0" maxlength="10" v-model.trim="form_member.userpass_cf" placeholder="Userpass" id="password_cf">
                <span class="input-group-btn" @click="showPassword_cf = !showPassword_cf">
                  <a class="btn btn-sm bg-navy"><i class="far text-white" :class="[ !showPassword_cf ? 'fa-eye' : 'fa-eye-slash' ]"></i></a>
                </span>

              </div>
              <span class="text-danger" v-if="!validatePassword('userpass_match')">{{ ui.csm_v2_valid_password_match }}</span>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-sm border-radius-10 bg-secondary-v2" style="border:20px" @click="doLogout">{{ ui.csm_v2_logout }}</button>
        <button class="btn btn-sm border-radius-10 bg-success-v2 text-white" style="border:20px" @click="LineOA_Before_UpdateUser()">{{ ui.csm_v2_confirm_transaction }}</button>
      </template>
    </modalv3>

    <modalv3 ref="modal_copyLink" :hideHeaderclose="true">
      <template #header>
        <div class="d-flex">
          <h5 class="fs-2 padding-a-5 margin-l-5">Copy Link</h5>
        </div>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group">
              <label for="register" class="text-secondary-v2">Register {{ ui.csm_v2_register }}</label>
              <div class="d-flex">
                <input type="text" class="form-control input-sm border-b-0 border-radius-t-l-2 border-radius-b-l-2" readonly v-model="regUrl" id="register"
                       style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; border-top-right-radius: 0px; border-bottom-right-radius: 0px; border: 0px;">
                <span class="d-flex align-items-center" style="padding-right: 4px; background-color: #f2f2f2; border-top-right-radius: 4px; border-bottom-right-radius: 4px;">
                  <button @click="copyUrl('reg')" class="text-secondary-v2 bg-white" style="border: none; box-shadow: 0 2px 2px -2px #000000; font-size: 12px; white-space: nowrap; margin: 4px; border-radius: 4px;">
                    Copy Link
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div class="col-md-12 margin-b-10">
            <div class="form-group">
              <label for="login" class="text-secondary-v2">Login {{ ui.csm_v2_login }}</label>
              <div class="d-flex">
                <input type="text" class="form-control input-sm border-b-0 border-radius-t-l-2 border-radius-b-l-2" readonly v-model="loginUrl" id="login"
                       style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; border-top-right-radius: 0px; border-bottom-right-radius: 0px; border: 0px;">
                <span style="padding-right: 4px; background-color: #f2f2f2; border-top-right-radius: 4px; border-bottom-right-radius: 4px; display: inline-block;">
                  <button @click="copyUrl('login')" class="text-secondary-v2 bg-white" style="border: none; box-shadow: 0 2px 2px -2px #000000; font-size: 12px; white-space: nowrap; margin: 4px; border-radius: 4px;">
                    Copy Link
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-sm bg-navy text-white border-radius-2" style="margin-right: 15px;" @click="$refs.modal_copyLink.closeModal()">OK</button>
      </template>
    </modalv3>

    <modalv3 ref="modal_copyLinkLogin" :hideHeaderclose="true">
      <template #header>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group">
              <span class="fs-2 text-warning"><i class="fas fa-exclamation-circle text-warning" style="margin-right: 4px;"></i>{{ ui.csm_v2_notification }}</span>
            </div>
          </div>

          <div class="col-md-12 margin-b-10">
            <div class="form-group">
              <span for="register" class="text-secondary-v2 margin-l-30">{{ ui.csm_v2_copy_user_success }}</span>
            </div>
          </div>
        </div>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group" id="copyDiv">
              <label for="register" class="text-secondary-v2">Login {{ ui.csm_v2_login }}</label>
              <div style="height: auto; background-color: #f2f2f2; padding: 8px; word-wrap: break-word; white-space: normal;">
                <p>{{ createUrlTemplate('url') }}</p>
                <p style="margin-bottom: 0;">{{ createUrlTemplate('user') }}</p>
                <p style="margin-bottom: 0;">{{ createUrlTemplate('pass') }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-sm bg-navy text-white border-radius-2" style="margin-right: 15px;" @click="$refs.modal_copyLinkLogin.closeModal()">OK</button>
      </template>
    </modalv3>

    <!-- preview map -->
    <modalv3 ref="modal_previewMap" @close-function="$refs.modal_previewMap.closeModal()">
      <template #header>
        <div class="d-flex">
          <span class="fs-2 padding-b-5">Map Preview</span>
        </div>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-12">
            <div class="text-center">
              <iframe :src="form.map_src" v-show="form.map_src" width="720" height="480"></iframe>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-sm bg-success-v2 text-white border-radius-10" @click="$refs.modal_previewMap.closeModal()">{{ ui.csm_v2_ok }}</button>
      </template>
    </modalv3>

    <input type="file" ref="myFile" name="myFile" accept="image/*" multiple v-show="false" hidden>
    <input type="file" ref="myFileNotPicture" accept=".mp4, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf, .txt" name="myFileNotPicture" multiple v-show="false" hidden>
    <loading-box ref="myLB"></loading-box>

    <description-modal-v2 ref="descriptionModal" @send-data="sendComponent($event, currentForm )"></description-modal-v2>

    <change-lang ref="changeLang"></change-lang>
  </div>

</template>

<script>
  import modalv2 from "./../Layout/modal_customize.vue"
  import modalv3 from "./../Layout/modal.vue"
  import loadingBox from "../../../Center/loading-box.vue"
  import paginationv2 from "./../Layout/pagination_v2.vue"

  import comment_external from "./../Components/comment_external.vue"
  import tracking from "../Components/tracking.vue"
  import ProjectFilterDropdown from './../Components/filter_project.vue'
  import changeLang from "./../Components/change_language.vue"

  import PhotoSwipe from 'photoswipe';
  import 'photoswipe/style.css';

  import { mapState } from 'vuex'

  import debounce from 'lodash.debounce';

  let loading = {}
  let paging = {};
  export default {
    components: {
      modalv2,
      modalv3,
      loadingBox,
      paginationv2,
      comment_external,
      tracking,
      ProjectFilterDropdown,
      changeLang
    },
    data() {
      return {
        showPassword: false,
        showPassword_cf: false,
        baseUrl,
        auth,
        baseRoute,
        queryString,
        ui: window.ui,
        user_lang: localStorage.getItem('user_lang') || 'TH',
        xt: $xt,
        company: window.baseCompany,
        customer: window.customer_auth,
        tabs: [
          { id: "Header_tab1", text: window.ui.csm_v2_home, text2: "", isEdit: false, status: "", showbutton: true, showTotal: false, total: 0 },
          { id: "Header_tab2", text: window.ui.csm_v2_create_request, text2: window.ui.csm_v2_request_form, isEdit: false, status: "", showbutton: true, showTotal: false, total: 0 },
          { id: "Header_tab3", text: window.ui.csm_v2_status_follow_up, text2: window.ui.csm_v2_request_form_details, isEdit: false, rating: false, status: "", showbutton: true, showTotal: false, total: 0 },
          { id: "Header_tab4", text: "", text2: "", isEdit: false, status: "", showbutton: false, showTotal: false, total: 0 },
          { id: "Header_tab5", text: window.ui.csm_v2_profile, text2: "", isEdit: false, status: "", showbutton: false, showTotal: false, total: 0 },
          { id: "Header_tab6", text: window.ui.csm_v2_ask_for_help, text2: "", isEdit: false, status: "", showbutton: false, showTotal: false, total: 0 },
          { id: "Header_tab7", text: window.ui.csm_v2_member, text2: "", isEdit: false, status: "", showbutton: true, showTotal: false, total: 0 },
          { id: "Header_tab8", text: window.ui.csm_v2_member_request, text2: "", isEdit: false, status: "", showbutton: true, showTotal: true, total: 0 },
          { id: "Header_tab9", text: window.ui.csm_v2_parcel_tracking, text2: "", isEdit: false, status: "", showbutton: true, showTotal: false, total: 0 },
        ],
        selectedTabs: {
          id: "Header_tab1",
          text: window.ui.csm_v2_home,
          text2: "",
          isEdit: false,
          status: "",
          showbutton: false
        },
        user: {
          userid: "",
          customer_code: ""
        },
        project: [],
        header: {},
        detail: [],
        form_h: {},
        form: {},
        form_beforepicsAttach: [],
        form_picsAttach: [],
        editIdx: null,
        isEditMode: false,
        chkstatus: [],
        chkstatus_detail: {},
        score: [],
        score_remark: '',
        member: [],
        member_obj: {},
        form_member: {},
        form_member_proj: {},
        member_req: [],
        url: "",
        url_create: "",
        pics_option: {
          bgOpacity: 0.5,
          shareEl: true,
          zoomEl: true,
          wheelToZoom: true,
          errorMsg: 'The photo cannot be loaded',
        },
        searchText: "",
        searchText_status: "",
        req_no: "",
        List_status: {
          N: 0,
          R: 0,
          P: 0,
          Y: 0,
          HW: 0
        },
        status_text: "N",
        score: 0,
        scorehover: 0,
        score_ans: 0,
        score_obj: {},
        path_hex: "",
        items: [],
        selectedData: {},
        isValidPassword: false,
        regUrl: "",
        loginUrl: "",
        copyUrl_login: "",
        isSmallScreen: true,
        isWrap: false,
        img_bg: [],
        storeMaincode: '',
        // status_no: 0
        currentForm: '',
        is_mango: '',
        pageNumber: 1,
        chkstatusDisplay: [],
        data_comment: [],
        rawSearchText: '',
        selectedMain: null,
        selectedPhases: [],
        isAllPhasesSelected: true,
        loadedPhases: {}
      }
    },
    methods: {
      viewImagex(x) {
        //  console.log(dataServer + 'Api/File/DownLoad?id=' + x)
        return dataServer + 'Api/File/DownLoad?id=' + x;
      },
      before_addedFile() {
        this.isEditMode = false
        this.$set(this.form, "subject", "")
        this.$set(this.form, "description", "")
        this.$set(this, "form_beforepicsAttach", [])
        this.$refs.modal_addList.openModal()
      },
      openEdit(idx) {
        this.isEditMode = true
        this.editIdx = idx
        this.$set(this.form, "subject", this.form_picsAttach[idx].subject)
        this.$set(this.form, "description", this.form_picsAttach[idx].description)
        this.$set(this, "form_beforepicsAttach", [...this.form_picsAttach[idx].picsAttach])
        this.$refs.modal_addList.openModal()
      },
      Confirm_editFile() {
        if ($xt.isEmpty(this.form.subject)) {
          return
        }
        if (this.form_beforepicsAttach.length <= 0) {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_v2_alert_add_picture, 'warning')
          return
        }
        this.form_beforepicsAttach.forEach(x => {
          if (!x.src) {
            x["src"] = !$xt.isEmpty(this.createFilePath(x.fileid)) ? this.createFilePath(x.fileid) : 'http://via.placeholder.com/64x64'
            x["thumbnail"] = !$xt.isEmpty(this.createFilePath(x.fileid)) ? this.createFilePath(x.fileid) : 'http://via.placeholder.com/64x64'
            x["w"] = 600
            x["h"] = 400
            x["alt"] = ''
          }
        })
        this.$set(this.form_picsAttach[this.editIdx], 'subject', this.form.subject)
        this.$set(this.form_picsAttach[this.editIdx], 'description', this.form.description)
        this.$set(this.form_picsAttach[this.editIdx], 'picsAttach', [...this.form_beforepicsAttach])
        this.isEditMode = false
        this.editIdx = null
        this.$set(this.form, "subject", "")
        this.$set(this.form, "description", "")
        this.$set(this, "form_beforepicsAttach", [])
        this.$refs.modal_addList.closeModal()
      },
      goTogoogle_map() {
        window.open('https://maps.app.goo.gl/PbBqQQtXfdG7Uf8SA')
      },
      async isLogin() {
        if ($xt.isObjectEmpty(this.customer)) {
          this.doLogout()
        }
      },
      doLogout() {
        localStorage.removeItem('customer_auth');
        localStorage.removeItem('customer_login');

        window.location = baseUrl + 'page/v2/authentication/login/';

      },
      async isMember() {

        if (this.customer.type == "line_member") {
          this.$set(this.tabs[6], "showbutton", false)
          this.$set(this.tabs[7], "showbutton", false)

        } else if (this.customer.type == "ar_cust") {
          await this.MemberRequest_Read()
        }
        if (this.customer.update_status == "N" || this.customer.update_status == null) {
          this.Openmodal_firstLogin()
        }

      },
      async onReadList() {
        try {
          loading.show()
          let action = `CSM/CustomerData/LineOA_ReadList?customer_code=${this.customer.customer_code}&text=${this.searchText}`
          if (this.customer.type == 'line_member') {
            action += `&userid=${this.customer.userid}`
          }
          let resp = await $xt.getCustomerServer(action);
          this.$set(this, 'project', resp.data);
        } catch (ex) {
          $msg.alert('Error', ex.toString(), 'danger')
        } finally {
          loading.hide()
        }
      },
      async Tracking_ReadList(keyword) {
        let action = ""
        let resp = []
        this.$set(this, "chkstatus", [])
        this.$set(this, "chkstatusDisplay", [])
        // this.pageNumber = 1;
        let totalItems = 0;

        switch (keyword) {
          case "N":
            loading.show()
            // this.status_text = 'N'
            this.$set(this, 'status_text', 'N')
            action += `CSM/CustomerData/CSMTracking_NR_ReadList?customer_code=${this.customer.customer_code}&status=N&text=${this.searchText_status}&baseUrl=${window.dataServer}`
            if (this.customer.type == 'line_member') {
              action += `&userid=${this.customer.userid}`
            }
            resp = await $xt.getCustomerServer(action);
            this.$set(this, "chkstatus", resp.data.data)
            this.$set(this.List_status, "N", resp.data.total.N)
            this.$set(this.List_status, "R", resp.data.total.R)
            this.$set(this.List_status, "P", resp.data.total.P)
            this.$set(this.List_status, "Y", resp.data.total.Y)
            this.$set(this.List_status, "HW", resp.data.total.HW)
            this.$set(this.List_status, "All", resp.data.total.All)
            //await this.viewImagex();

            // this.$set(this, "chkstatusDisplay", resp.data.data)
            totalItems = resp.data.total.N;

            loading.hide()

            break;
          case "R":
            loading.show()
            this.status_text = 'R'
            action += `CSM/CustomerData/CSMTracking_NR_ReadList?customer_code=${this.customer.customer_code}&status=R&text=${this.searchText_status}&baseUrl=${window.dataServer}`
            if (this.customer.type == 'line_member') {
              action += `&userid=${this.customer.userid}`
            }
            resp = await $xt.getCustomerServer(action);
            this.$set(this, "chkstatus", resp.data.data)
            this.$set(this.List_status, "N", resp.data.total.N)
            this.$set(this.List_status, "R", resp.data.total.R)
            this.$set(this.List_status, "P", resp.data.total.P)
            this.$set(this.List_status, "Y", resp.data.total.Y)
            this.$set(this.List_status, "HW", resp.data.total.HW)
            this.$set(this.List_status, "All", resp.data.total.All)

            totalItems = resp.data.total.R;

            loading.hide()
            break;
          case "P":
            loading.show()
            this.status_text = 'P'
            action += `CSM/CustomerData/CSMTracking_PY_ReadList?customer_code=${this.customer.customer_code}&status=P&text=${this.searchText_status}&baseUrl=${window.dataServer}`
            if (this.customer.type == 'line_member') {
              action += `&userid=${this.customer.userid}`
            }
            resp = await $xt.getCustomerServer(action);
            this.$set(this, "chkstatus", resp.data.data)
            this.$set(this.List_status, "N", resp.data.total.N)
            this.$set(this.List_status, "R", resp.data.total.R)
            this.$set(this.List_status, "P", resp.data.total.P)
            this.$set(this.List_status, "Y", resp.data.total.Y)
            this.$set(this.List_status, "HW", resp.data.total.HW)
            this.$set(this.List_status, "All", resp.data.total.All)

            totalItems = resp.data.total.P;

            loading.hide()
            break;
          case "Y":
            loading.show()
            this.status_text = 'Y'
            action += `CSM/CustomerData/CSMTracking_PY_ReadList?customer_code=${this.customer.customer_code}&status=Y&text=${this.searchText_status}&baseUrl=${window.dataServer}`
            if (this.customer.type == 'line_member') {
              action += `&userid=${this.customer.userid}`
            }
            resp = await $xt.getCustomerServer(action);
            this.$set(this, "chkstatus", resp.data.data)
            this.$set(this.List_status, "N", resp.data.total.N)
            this.$set(this.List_status, "R", resp.data.total.R)
            this.$set(this.List_status, "P", resp.data.total.P)
            this.$set(this.List_status, "Y", resp.data.total.Y)
            this.$set(this.List_status, "HW", resp.data.total.HW)
            this.$set(this.List_status, "All", resp.data.total.All)

            totalItems = resp.data.total.Y;

            loading.hide()
            break;
          case "HW":
            loading.show()
            this.status_text = 'HW'
            action += `CSM/CustomerData/CSMTracking_HW_ReadList?customer_code=${this.customer.customer_code}&status=Y&text=${this.searchText_status}&baseUrl=${window.dataServer}`
            if (this.customer.type == 'line_member') {
              action += `&userid=${this.customer.userid}`
            }
            resp = await $xt.getCustomerServer(action);
            this.$set(this, "chkstatus", resp.data.data)
            this.$set(this.List_status, "N", resp.data.total.N)
            this.$set(this.List_status, "R", resp.data.total.R)
            this.$set(this.List_status, "P", resp.data.total.P)
            this.$set(this.List_status, "Y", resp.data.total.Y)
            this.$set(this.List_status, "HW", resp.data.total.HW)

            totalItems = resp.data.total.HW;

            loading.hide()
            break;
          case "All":
            loading.show()
            this.status_text = 'All'
            let obj_tracking = {
              customer_code: this.customer.customer_code,
              status: 'All',
              text: this.searchText_status,
              baseUrl: window.dataServer,
              userid: this.customer.type == 'line_member' ? this.customer.userid : '',
              pre_event2: this.selectedMain,
              pre_event: !this.isAllPhasesSelected ? this.selectedPhases : []
            }
            let url_tracking = `CSM/CustomerData/CSMTracking_ReadList`
            resp = await $xt.postCustomerJson(url_tracking, obj_tracking);
            this.$set(this, "chkstatus", resp.data.data)
            this.$set(this.List_status, "N", resp.data.total.N)
            this.$set(this.List_status, "R", resp.data.total.R)
            this.$set(this.List_status, "P", resp.data.total.P)
            this.$set(this.List_status, "Y", resp.data.total.Y)
            this.$set(this.List_status, "HW", resp.data.total.HW)
            this.$set(this.List_status, "All", resp.data.total.All)

            totalItems = resp.data.total.All;

            loading.hide()
            break;
        }
        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        // paging.setItemsPerPage(2);
        paging.setItemsPerPage(40);
        paging.setTotalItems(totalItems);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();
        paging.currentPage = 1;
        await this.pageChange(1);
      },
      async onRead(obj) {
        let action = `CSM/CustomerData/LineOA_Read?maincode=${obj.maincode}&pre_event2=${obj.pre_event2}&pre_event=${obj.pre_event}&customer_code=${this.customer.customer_code}`
        if (this.customer.type == 'line_member') {
          action += `&userid=${this.customer.userid}`
        }
        let resp = await $xt.getCustomerServer(action);
        this.$set(this, 'detail', resp.data);

        let d = resp.data[0]
        if (resp.data.length > 0) {
          this.$set(this, "form_h", d)
          this.$set(this.form, "pre_event", d.pre_event)
          this.$set(this.form, "contract_tel", d.contract_tel)
          this.$set(this.form, "projrunno", d.projrunno)
          this.$set(this.form, "maincode", d.maincode)
          this.$set(this.form, "customer_code", d.customer_code)
          this.$set(this, "member_obj", d)
          this.$set(this.form, "map_url", d.map_url)
          this.$set(this.form, "map_gps", d.map_gps)
          this.$set(this.form, "map_desc", d.map_desc)

          this.previewLocation(this.form.map_gps)
          if (this.customer.type == 'ar_cust') {
            await this.onReadList_member()
          }
        }
      },
      async Description_Read(obj) {
        let action = `CSM/CustomerData/Description_Read?maincode=${obj.maincode}&reqno=${obj.reqno}&baseUrl=${window.dataServer}`
        if (this.customer.type == 'line_member') {
          action += `&userid=${this.customer.userid}`
        }
        let resp = await $xt.getCustomerServer(action);

        this.$set(resp.data.data, "date_convenient1", moment(resp.data.data.date_convenient1).isValid() ? moment(resp.data.data.date_convenient1).format('DD/MM/YYYY') : '')
        this.$set(resp.data.data, "date_convenient2", moment(resp.data.data.date_convenient2).isValid() ? moment(resp.data.data.date_convenient2).format('DD/MM/YYYY') : '')

        this.$set(this, 'chkstatus_detail', resp.data.data)
      },

      async Score_Read(text, obj) {
        let action = `CSM/CustomerData/Score_Read?maincode=${obj.maincode}&csmno=${obj.job_no}`
        let resp = await $xt.getCustomerServer(action);
        this.$set(this, "score_ans", $linq(resp.data.data).sum(x => x.score_ans))
        this.$set(this, "score", resp.data.data)
        this.$set(this, "score_remark", this.score[0]?.remark || '')
        this.$set(this, "score_obj", obj)

        if (text == "mobile") {
          this.selectedTabs.rating = true
        } else {
          // this.selectedTabs.rating = true
          this.$refs.modal_vote.openModal()
        }
      },
      async MemberRequest_Read() {
        loading.show()
        let c = this.customer
        let action = `CSM/CustomerData/LineOA_ReadMember_notActive?customer_code=${c.customer_code}&text=${this.searchText}`
        let resp = await $xt.getCustomerServer(action);
        this.$set(this, "member_req", resp.data)
        this.$set(this.tabs[7], "total", resp.total)
        loading.hide()
      },
      async readImg() {
        let act = `CSM/API/csm_img_bg`;
        let resp = await $xt.getServer(act);
        this.$set(this, 'img_bg', resp.data || []);

      },
      async TabChange(id) {
        let data = JSON.parse(JSON.stringify(this.tabs[id]))
        data.status = "form"
        this.selectedTabs = data

        if (this.customer.type == 'ar_cust') {
          this.MemberRequest_Read()
        }
        switch (data.id) {
          case "Header_tab1":
            this.setBackground()
            loading.show()
            this.onReset('all')
            loading.hide()

            break;
          case "Header_tab2":
            this.setBackground()

            loading.show()

            this.$set(this, "searchText", "")
            await this.onReadList()

            loading.hide()



            break;
          case "Header_tab3":
            await this.onReadList()
            this.Tracking_ReadList('N')
            this.setBackground()
            break;
          case "Header_tab4":
            this.$nextTick(() => {
              $('body').css({ 'width': '100%', 'background': 'url(' + this.baseUrl + 'Content/Images/PNG/success-submit.png), linear-gradient(to bottom, #00BF9D 0%, #00BF9D 53%, white 0%, white 100%)', 'background-repeat': 'no-repeat', 'background-position': 'center center' })
            })
            break;
          case "Header_tab5": case "Header_tab6":
            this.$nextTick(() => {
              $('body').css({ 'background-image': 'none', 'background-color': '#f3f3f3' })
              $('.content-header').css({ 'background-image': 'none', 'background-color': '#FFFC' })
            })

            break;
          case "Header_tab7":
            this.setBackground()
            loading.show()

            this.$set(this, "searchText", "")
            await this.onReadList()
            this.$set(this, "member", [])
            loading.hide()

            break;
          case "Header_tab8":
            this.setBackground()

            loading.show()

            this.$set(this, "searchText", "")
            if (this.customer.type == 'ar_cust') {
              await this.MemberRequest_Read()
            }
            loading.hide()

            break;
          case "Header_tab9":
            this.setBackground()
            loading.show()

            this.$set(this, "searchText", "")
            await this.onReadList()
            loading.hide()

            break;
        }
      },
      async SwitchContent(keyword, x) {
        switch (keyword) {
          case "tab2_form":
            loading.show()

            this.onReset("all")
            this.selectedTabs.isEdit = true
            this.selectedTabs.status = "form"
            this.$set(this.form, "contract", this.customer.customer_name)

            this.storeMaincode = x.maincode
            await this.$store.dispatch('findCodeConfig', this.storeMaincode)

            await this.onRead(x)
            loading.hide()

            break
          case "tab3_form":
            this.$nextTick(() => {
              $('body').css({ 'background-image': 'none', 'background-color': '#FFFC' })
              $('.content-header').css({ 'background-image': 'none', 'background-color': '#FFFC' })
            })
            loading.show()

            // ส่งเรื่องแล้ว = N
            // กำลังดำเนินการ 1 = HW
            // กำลังดำเนินการ 2 = P
            // ยกเลิก = R
            // เรียบร้อย = Y
            if (this.status_text === 'All') {
              this.status_text =
                ($xt.isEmpty(x.job_status) || x.job_status === 'H') ? 'N' :
                  (x.job_status === 'W') ? 'HW' :
                    (x.job_status === 'I') ? 'P' : 'Y';
            }


            this.onReset("all")
            await this.Description_Read(x)

            await this.showCommentExt(x.job_no, x.reqno)

            //    /await this.CSMSTracking_ReadList_PIC(x)
            this.selectedTabs.isEdit = true
            this.selectedTabs.status = "form"
            this.path_hex = x.path_hex
            loading.hide()

            break
          case "tab7_form":
            loading.show()
            this.onReset("all")
            this.selectedTabs.isEdit = true
            this.selectedTabs.status = "form"
            this.selectedTabs.text2 = x.pre_des
            await this.onRead(x)
            loading.hide()
            break

        }
      },
      async TabChangeReset(keyword) {
        switch (keyword) {
          case "tab2":
            this.onReset('all')
            await this.TabChange(1)
            break;
          case "tab2_detail":
            this.onReset('keep_detail')
            await this.TabChange(1)
            break;
          case "tab3":
            this.onReset('all')
            await this.TabChange(2)
            break;
        }
      },
      onReset(keyword) {
        switch (keyword) {
          case "all":
            this.$set(this, "form", {})
            this.$set(this, "form_h", {})
            this.$set(this, "form_picsAttach", [])
            this.$set(this, "detail", [])

            break;
          case "keep_detail":
            this.$set(this, "form", {})
            this.$set(this, "form_h", {})
            this.$set(this, "form_picsAttach", [])
            break
          case "cancel_addFile":
            this.isEditMode = false
            this.editIdx = null
            this.$set(this.form, "subject", "")
            this.$set(this.form, "description", "")
            this.$set(this, "form_beforepicsAttach", [])
            this.$refs.modal_addList.closeModal()
            break
          case "cancel_vote":
            this.$set(this.selectedTabs, "rating", false)
            this.$refs.modal_vote.closeModal()
            break
        }
      },
      changeheader() {
        this.$set(this.form, "pre_event", this.form_h.pre_event)
        this.$set(this.form, "contract_tel", this.form_h.contract_tel)
        this.$set(this.form, "projrunno", this.form_h.projrunno)
        this.$set(this.form, "maincode", this.form_h.maincode)
        this.$set(this.form, "address", this.form_h.address)
        this.$set(this.form, "customer_code", this.form_h.customer_code)
      },
      beforeaddFile(type) {
        if (type === 'picture') {
          $(this.$refs.myFile).click();
        } else {
          $(this.$refs.myFileNotPicture).click();
        }
      },
      Confirm_addFile() {
        if ($xt.isEmpty(this.form.subject)) {
          return
        }
        if (this.form_beforepicsAttach.length <= 0) {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_v2_alert_add_picture, 'warning');
        } else {

          this.form_beforepicsAttach.forEach(x => {

            x["src"] = !$xt.isEmpty(this.createFilePath(x.fileid)) ? this.createFilePath(x.fileid) : 'http://via.placeholder.com/64x64',
              x["thumbnail"] = !$xt.isEmpty(this.createFilePath(x.fileid)) ? this.createFilePath(x.fileid) : 'http://via.placeholder.com/64x64',
              x["w"] = 600,
              x["h"] = 400,
              x["alt"] = ''

          })


          this.form_picsAttach.push({
            subject: this.form.subject,
            description: this.form.description,
            picsAttach: this.form_beforepicsAttach
          })

          // this.form_beforepicsAttach.forEach( (x) => {
          // })
          this.$set(this.form, "subject", "")
          this.$set(this.form, "description", "")
          this.$set(this, "form_beforepicsAttach", [])

          this.$refs.modal_addList.closeModal()
        }

      },
      async fileUpload(file) {
        let f = new FormData();
        f.append("file", file);
        try {
          let act = `Api/File/AnywhereFileUploadToTemp`
          let rsp = await $xt.postCustomerJson(act, f)
          if (!rsp.success) {
            throw rsp.error
          }
          this.form_beforepicsAttach.push({
            fileid: rsp.id,
            filepath: rsp.true_path,
            filename: rsp.filename,
            filetype: rsp.ext,
            add_user: this.customer.userid,
            description: "",
            subject: "",
            new: true
          })
          $(this.$refs.myFile).val("");
          $(this.$refs.myFileNotPicture).val("");
        }
        catch (ex) {
          $msg.alert('', ex.toString(), 'danger');
        }
      },
      showPictures(pathto) {

        return window.dataServer + "/Api/File/DownLoad?id=" + pathto
      },
      async DeletePic(keyword, idx) {
        switch (keyword) {
          case "form_header":
            this.form_picsAttach.splice(idx, 1)
            break;
          case "form_detail":
            this.form_beforepicsAttach.splice(idx, 1)
            break;
          case "form_detailAll":
            if (!await $msg.confirm(this.ui.csm_v2_alert_delete_all_pictures)) {
              return;
            }
            this.$set(this, "form_beforepicsAttach", [])
            break;
          case "form_detailAll_CloseModal":
            this.$set(this, "form_beforepicsAttach", [])
            break;
        }
      },
      async beforeOnSave() {
        let valid_text = ""
        let item = []
        let pics = []
        if ($xt.isEmpty(this.form.pre_event)) {
          valid_text += `${this.ui.csm_v2_alert_select_project}<br>`
        }
        if ($xt.isEmpty(this.form.contract_tel)) {
          valid_text += `${this.ui.csm_v2_alert_input_tel}<br>`
        }
        if (this.form_picsAttach.length <= 0) {
          $msg.alert(`${this.ui.csm_v2_warning}!`, `${this.is_mango === "Y" ? this.ui.csm_v2_alert_add_task_mango : this.ui.csm_v2_alert_add_task} 1 ${this.ui.csm_v2_task}`, 'warning')
          return
        }
        if (valid_text.length > 0) {
          $msg.alert(`${this.ui.csm_v2_warning}!`, valid_text, 'warning')
          return
        }
        this.form_picsAttach.forEach((x, index) => {
          x.pre_event = this.form.pre_event
          x.contract_tel = this.form.contract_tel
          x.projrunno = this.form.projrunno
          x.maincode = this.form.maincode
          x.address = this.form.address
          x.customer_code = this.form.customer_code
          x.contract = this.form.contract
          x.date_convenient1 = this.form.date_convenient1
          x.stdate_convenient1 = this.form.stdate_convenient1
          x.enddate_convenient1 = this.form.enddate_convenient1
          x.date_convenient2 = this.form.date_convenient2
          x.stdate_convenient2 = this.form.stdate_convenient2
          x.enddate_convenient2 = this.form.enddate_convenient2
          x.note = this.form.note
          x.itemno_match = index + 1
          x.userid = this.customer.userid
          x.picsAttach.forEach(w => {
            w.itemno_match = index + 1
            pics.push(w)
          })
          x.map_url = this.form.map_url
          x.map_gps = this.form.map_gps
          x.map_desc = this.form.map_desc
          item.push(x)
        })
        this.onSave(item, pics)
        this.TabChange(3)
        this.$refs.modal_confirm.closeModal()
      },
      async onSave(req, pics) {

        try {
          loading.show()
          this.form.userid = this.customer.userid
          let form = {
            data: req,
            pics: pics
          }
          let action = `CSM/CustomerData/LineOA_Create`
          let resp = await $xt.postCustomerJson(action, form)
          if (!resp.success) {
            throw resp.error
          }
          await this.$set(this, "req_no", resp.data.reqno)
          $notify.success(this.ui.alert_save_success)
        }
        catch (ex) {
          $msg.alert('Error', ex.toString(), 'danger')
        } finally {
          loading.hide()
        }
      },
      addScore(keyword, idx, score) {
        switch (keyword) {
          case "score":
            this.$set(this.score[idx], "score_ans", score)

            break;
          case "over":
            this.$set(this.score[idx], "score_hover", score)
            break;
        }
      },
      async SaveScore() {
        if (!this.score || this.score.length === 0) {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_v2_no_evaluation_data, 'warning')
          return
        }
        let valid = ""
        this.score.forEach((item, index) => {
          if (item.score_ans == 0) {
            valid += `แบบประเมินหัวข้อที่ ${index + 1} ไม่สามารถเป็นค่าว่างได้<br>`
          }
          this.$set(item, "job_no", this.score_obj.job_no)
          this.$set(item, "adduser", this.customer.userid)
        })
        if (valid.length > 0) {
          $msg.alert(this.ui.csm_v2_warning, valid, 'warning')
          return
        }
        this.$set(this.score[0], "remark", this.score_remark || '')
        try {
          loading.show()
          let form = {
            data: this.score,
          }
          let action = `CSM/CustomerData/Score_Update`
          let resp = await $xt.postCustomerJson(action, form)
          if (!resp.success) {
            throw resp.error
          }
          $notify.success(this.ui.alert_save_success)
          this.onReset('cancel_vote')
          await this.Tracking_ReadList('Y')
        }
        catch (ex) {
          $msg.alert('Error', ex.toString(), 'danger')
        } finally {
          loading.hide()
        }
      },
      MovetoContent(keyword) {
        switch (keyword) {
          case "form":
            this.selectedTabs.status = "form"
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
          case "detail":
            this.selectedTabs.status = "detail"
            document.getElementById("detail").scrollIntoView({ behavior: "smooth" });
            break;
        }
      },
      CopyClipboard(keyword) {
        switch (keyword) {
          case "Copy_docno":
            // navigator.clipboard.writeText(this.req_no)
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = this.req_no;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            tempTextArea.setSelectionRange(0, 99999);

            document.execCommand('copy');
            document.body.removeChild(tempTextArea);
            $notify.success(this.ui.csm_v2_alert_copy_document.replace('...', this.req_no));

            break
          // case "Create_member":
          //   if ($xt.isEmpty(this.form_member.userpass)) {
          //     $notify.warning('ไม่พบรหัสผ่าน กรุณากรอกรหัสผ่านแล้วลองใหม่อีกครั้ง');
          //   } else {
          //     navigator.clipboard.writeText(this.form_member.userpass)
          //     $notify.success('คัดลอกรหัสผ่าน สำเร็จ');
          //   }
          //   break
        }
      },
      ToggleMenu(keyword) {
        switch (keyword) {
          case "Open":
            this.$nextTick(() => {
              $('.sidebar').addClass('active')
              $('.sidebar-content').removeClass('d-none').addClass('d-block')


            });
            break
          case "Close":
            this.$nextTick(() => {
              $('.sidebar').removeClass('active')
              $('.sidebar-content').removeClass('d-block').addClass('d-none')
            });
            break
        }
      },
      createFilePath(x) {
        return window.dataServer + 'Api/File/DownLoad?id=' + x
      },
      async CopyUrl_Addmember() {
        let m = this.member_obj
        this.regUrl = this.baseUrl + "page/v2/v_csm_line_register/" + m.maincode + "/" + m.pre_event2 + "/" + m.pre_event;
        this.loginUrl = this.baseUrl + "page/v2/authentication/login/";
        this.$refs.modal_copyLink.openModal()
        // let cm = this.customer
        // if(!$xt.isObjectEmpty(m)) {

        //   let url = `Register สมัครสมาชิก\n` + this.baseUrl + "page/v2/v_csm_line_register/" + m.maincode + "/" + m.pre_event2 + "/" + m.pre_event + `\n`
        //             + `Login เข้าสู่ระบบ\n`
        //             + this.baseUrl + `page/v2/authentication/login/`;
        //   let plainTextUrl = document.createElement('div');
        //   plainTextUrl.innerHTML = url;
        //   let plainText = plainTextUrl.textContent;

        //   this.$set(this, "url", plainText);
        //   navigator.clipboard.writeText(url);
        //   $notify.success('คัดลอกลิ้งสำเร็จ')
        // } else {
        //   $msg.alert('คำเตือน', `ไม่สามารถคัดลอกลิ้งได้ เนื่องจากไม่พบที่อยู่ กรุณาเลือกที่อยู่แล้วลองใหม่อีกครั้ง`, 'warning')
        // }
      },
      Openmodal_firstLogin() {
        this.form_member = {}
        this.$refs.modal_firstLogin.openModal()
      },
      Openmodal_addMember() {
        let proj = $linq(this.detail).firstOrDefault()
        // let proj2 = $linq(this.project).where(x => x.maincode == proj.maincode).toArray()
        
        // this.$set(this, 'form_member_proj', proj)
        this.$set(this, 'form_member_proj', this.member_obj)
        this.$set(this, 'form_member', {})
        this.generateRandomPassword()
        this.$refs.modal_addMember.openModal()
      },
      async Openmodal_updateMember(member) {
        this.$set(this, 'form_member', {})
        await this.onRead_member_detail(member)
        this.$refs.modal_updateMember.openModal()
      },
      async Openmodal_updatePasswordMember() {
        this.$set(this, 'form_member', {})
        await this.onRead_member(this.customer)
        this.$refs.modal_updatePasswordMember.openModal()
      },
      Closemodal_addMember() {
        this.$refs.modal_addMember.closeModal()
      },
      Closemodal_updateMember() {
        this.$refs.modal_updateMember.closeModal()
      },
      Closemodal_updatePasswordMember() {
        this.$refs.modal_updatePasswordMember.closeModal()
      },
      ToggleShowpassword() {
        let password = $('#password').attr("type")
        if (password === "password") {
          $('#password').attr("type", "text")
          $('#toggle_eye').addClass('fa-eye').removeClass('fa-eye-slash')
        } else {
          $('#password').attr("type", "password")
          $('#toggle_eye').addClass('fa-eye-slash').removeClass('fa-eye')
        }
      },
      async LineOA_Before_CreateMember() {
        let user = this.form_member
        let proj = this.form_member_proj

        if ($xt.isObjectEmpty(proj)) {
          $msg.alert('Error', this.ui.csm_v2_alert_phase_required, 'danger')
          return
        }
        if ($xt.isEmpty(user.userid)) {
          return
        }
        if ($xt.isEmpty(user.userpass)) {
          return
        }
        // if(!this.validatePassword('userpass')) {
        //   return
        // }
        this.LineOA_CreateMember()
      },
      async LineOA_Before_UpdateUser() {
        let user = this.form_member

        if (this.customer.type == 'line_member') {
          if ($xt.isEmpty(user.name_th) || $xt.isEmpty(user.telephone) || $xt.isEmpty(user.mail)) {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_v2_alert_incomplete, 'warning')
            return
          }
        }
        // if($xt.isEmpty(user.userid)) {
        //   return
        // }
        if ($xt.isEmpty(user.userpass)) {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_v2_alert_incomplete, 'warning')
          return
        }
        if (!this.validatePassword('userpass')) {
          return
        }
        if (!this.validatePassword('userpass_match')) {
          return
        }

        if (!await $msg.confirm(this.ui.csm_v2_alert_force_logout)) {
          return
        }
        this.LineOA_updateMember()
      },
      async LineOA_Before_UpdatePasswordMember() {
        let user = this.form_member
        if ($xt.isEmpty(user.name_th) && this.customer.type !== 'ar_cust') {
          $msg.alert('Warning', this.ui.csm_v2_alert_input_name, 'warning')
          return
        }
        if ($xt.isEmpty(user.telephone) && this.customer.type !== 'ar_cust') {
          $msg.alert('Warning', this.ui.csm_v2_alert_input_phone, 'warning')
          return
        }
        if ($xt.isEmpty(user.userid)) {
 
          return
        }
        if ($xt.isEmpty(user.userpass_old)) {
          $msg.alert('Warning', this.ui.csm_v2_alert_input_password, 'warning')
          return
        }
        if ($xt.isEmpty(user.userpass_cf)) {
          $msg.alert('Warning', this.ui.csm_v2_alert_input_password, 'warning')
          return
        }
        if ($xt.isEmpty(user.userpass)) {
          $msg.alert('Warning', this.ui.csm_v2_alert_input_password, 'warning')
          return
        }
        if (!this.validatePassword('userpass_old') && this.customer.type !== 'ar_cust') {
          $msg.alert('Warning', this.ui.csm_v2_alert_old_password_invalid, 'warning')
          return
        }
        if (!this.validatePassword('userpass')) {
          $msg.alert('Warning', this.ui.csm_v2_alert_new_password_rule, 'warning')
          
          return
        }

        if (!this.validatePassword('userpass_match')) {
          $msg.alert('Warning', this.ui.csm_v2_alert_password_mismatch, 'warning')
 
          return
        }

        this.LineOA_updatePasswordMember()
      },
      async LineOA_updatePasswordMember() {
        try {
          loading.show()
          let obj = {
            data: this.form_member,
            old_password: this.form_member.userpass_old,
            type: this.customer.type
          }
          let url = `CSM/CustomerData/LineOA_UpdatePasswordMember`
          let resp = await $xt.postCustomerJson(url, obj)
          if (!resp.success) {
            throw resp.error
          }
          $notify.success(this.ui.alert_save_success)
          this.$refs.modal_updatePasswordMember.closeModal()
          this.doLogout()
        } catch (error) {
          $msg.alert('Error', error.toString(), 'danger')
        } finally {
          loading.hide()
        }

      },
      async LineOA_updateMember() {
        this.form_member.maincode = this.customer.maincode
        this.form_member.userid = this.customer.userid
        this.form_member.customer_code = this.customer.customer_code
        try {
          loading.show()
          let obj = {
            data: this.form_member
          }
          let url = this.customer.type == 'line_member' ? `CSM/CustomerData/LineOA_UpdateMember` : `CSM/CustomerData/LineOA_UpdateOwner`
          let resp = await $xt.postCustomerJson(url, obj)
          if (!resp.success) {
            throw resp.error
          }
          $notify.success(this.ui.alert_save_success)
          this.$refs.modal_updatePasswordMember.closeModal()
          this.doLogout()

        } catch (error) {
          $msg.alert('Error', error.toString(), 'danger')

        } finally {
          loading.hide()
        }

      },
      async LineOA_CreateMember() {
        try {
          loading.show()
          this.form_member.maincode = this.form_member_proj.maincode
          this.form_member.pre_event = this.form_member_proj.pre_event
          this.form_member.pre_event2 = this.form_member_proj.pre_event2
          this.form_member.customer_code = this.customer.customer_code
          this.form_member.active = "Y"
          let obj = {
            data: this.form_member
          }
          let url = `AnywhereAPI/CSM/LineOA_RegisterUser`
          let resp = await $xt.postCustomerJson(url, obj)
          if (!resp.success) {
            throw resp.error
          }
          $notify.success(this.ui.alert_save_success)
          this.$refs.modal_addMember.closeModal()

          this.createUrlTemplate('copy')
          this.$refs.modal_copyLinkLogin.openModal()

          if (this.customer.type == 'ar_cust') {
            await this.onReadList_member()
          }
        } catch (error) {
          $msg.alert('Error', error.toString(), 'danger')
        } finally {
          loading.hide()
        }
      },
      createUrlTemplate(data) {
        switch (data) {
          case 'url':
            return this.baseUrl + 'page/v2/authentication/login/'
          case 'user':
            return 'Username : ' + this.form_member.userid
          case 'pass':
            return 'Password : ' + this.form_member.userpass
          case 'all':
            let loginMeg = `Login ${this.ui.csm_v2_login}\n`
              + this.baseUrl + `page/v2/authentication/login/\n`
              + `\n`
              + `Username : ${this.form_member.userid}\n`
              + `Password : ${this.form_member.userpass}`
            this.copyUrl_login = loginMeg
            break;
          // case 'copy':
          //   this.createUrlTemplate('all')
          //   let plainTextUrl = document.createElement('div');
          //   plainTextUrl.innerHTML = this.copyUrl_login;
          //   let plainText = plainTextUrl.textContent;
          //   this.$set(this, "url_create", plainText);
          //   // navigator.clipboard.writeText(this.copyUrl_login);
          //   break;
          case 'copy':
            this.createUrlTemplate('all');

            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = this.copyUrl_login;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            tempTextArea.setSelectionRange(0, 99999);

            document.execCommand('copy');
            document.body.removeChild(tempTextArea);
            this.$set(this, "url_create", this.copyUrl_login);
            break;

        }
      },
      async onReadList_member() {
        let action = `CSM/CustomerData/LineOA_ReadListMember?maincode=${this.member_obj.maincode}&pre_event2=${this.member_obj.pre_event2}&pre_event=${this.member_obj.pre_event}`
        let resp = await $xt.getCustomerServer(action);
        this.$set(this, 'member', resp.data);
      },
      async onRead_member(member) {
        let action = `CSM/CustomerData/LineOA_ReadMember?maincode=${member.maincode}&customer_code=${this.customer.customer_code}&userid=${member.userid}&type=${this.customer.type}`
        let resp = await $xt.getCustomerServer(action);
        this.$set(this, 'form_member', resp.data);
      },
      async onRead_member_detail(member) {
        let action = `CSM/CustomerData/LineOA_ReadMember_Detail?maincode=${member.maincode}&customer_code=${this.customer.customer_code}&userid=${member.userid}`
        let resp = await $xt.getCustomerServer(action);
        this.$set(this, 'form_member', resp.data);
      },
      Openmodal_deleteMember(x) {
        this.$refs.modal_deleteMember.openModal()
        this.$set(this, "selectedData", x)
      },
      async LineOA_Before_ResetPasswordMember() {
        let user = this.form_member
        if (!await $msg.confirm(this.ui.csm_v2_alert_admin_reset_password_confirm.replace('{0}', user.userid))) {
          return
        }
        this.LineOA_ResetPasswordMember()
      },
      async LineOA_ResetPasswordMember() {
        try {
          loading.show()
          this.generateRandomPassword()
          let obj = {
            data: {
              maincode: this.form_member.maincode,
              userid: this.form_member.userid,
              userpass: this.form_member.userpass,
              update_status: "N"
            }
          }
          let url = `CSM/CustomerData/LineOA_UpdateMember`
          let resp = await $xt.postCustomerJson(url, obj)
          if (!resp.success) {
            throw resp.error
          }
          $notify.success(this.ui.alert_save_success)
          this.$refs.modal_updateMember.closeModal()
          this.createUrlTemplate('copy')
          this.$refs.modal_copyLinkLogin.openModal()
        } catch (error) {
          $msg.alert('Error', error.toString(), 'danger')
        } finally {
          loading.hide()
        }
      },
      async Delete_member() {
        try {
          loading.show()
          let obj = {
            data: this.selectedData
          }
          let url = `CSM/CustomerData/LineOA_DeleteMember`
          let resp = await $xt.postCustomerJson(url, obj)
          if (!resp.success) {
            throw resp.error
          }
          $notify.success(this.ui.alert_save_success)
          if (this.selectedTabs.id == "Header_tab7") {
            if (this.customer.type == 'ar_cust') {
              this.onReadList_member()
            }
          }
          if (this.customer.type == 'ar_cust') {
            await this.MemberRequest_Read()
          }
          this.$refs.modal_deleteMember.closeModal()

        } catch (error) {
          $msg.alert('Error', error.toString(), 'danger')
        } finally {
          loading.hide()
        }
      },
      async AcceptMember(x) {
        try {
          loading.show()
          let obj = {
            data: x
          }
          let url = `CSM/CustomerData/LineOA_AcceptMember`
          let resp = await $xt.postCustomerJson(url, obj)
          if (!resp.success) {
            throw resp.error
          }
          $notify.success(this.ui.alert_save_success)
          if (this.customer.type == 'ar_cust') {
            await this.MemberRequest_Read()
          }
        } catch (error) {
          $msg.alert('Error', error.toString(), 'danger')
        } finally {
          loading.hide()
        }
      },
      validatePassword(keyword) {
        // const pattern = /^(?=.*[!@#$%^&*()-_=+[\]{};:'",.<>/?])[\w!@#$%^&*()-_=+[\]{};:'",.<>/?]{8,}$/;
        // const pattern = /^^(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\-]).{8,}$/;
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,10}$/;

        switch (keyword) {
          case "userpass":
            return pattern.test(this.form_member.userpass)
          case "userpass_old":
            return pattern.test(this.form_member.userpass_old)
          case "userpass_match":
            return pattern.test(this.form_member.userpass_cf) && this.form_member.userpass == this.form_member.userpass_cf
        }
      },
      generateRandomPassword() {
        // Define the character sets for each requirement in the regex
        const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
        const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const digits = '0123456789';
        const specialCharacters = '!@#$%^&*()_+{}[]:;<>,.?~-';

        // Combine all character sets
        const allCharacters = lowercaseLetters + uppercaseLetters + digits + specialCharacters;

        // Ensure at least one character from each set
        let password =
          this.getRandomChar(lowercaseLetters) +
          this.getRandomChar(uppercaseLetters) +
          this.getRandomChar(digits) +
          this.getRandomChar(specialCharacters);

        // Fill the remaining characters with random choices
        for (let i = 0; i < 4; i++) {
          password += this.getRandomChar(allCharacters);
        }

        // Shuffle the password to make it more random
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        this.$set(this.form_member, 'userpass', password)
      },
      getRandomChar(characters) {
        return characters[Math.floor(Math.random() * characters.length)];
      },
      compareDateTime(dateTimeString) {
        // Convert the input string to a Date object
        const targetDate = new Date(dateTimeString);

        // Get the current date and time
        const currentDate = new Date();

        // Calculate the time difference in milliseconds
        const timeDifference = currentDate - targetDate;

        // Calculate the time difference in various units
        const millisecondsInMinute = 60 * 1000;
        const millisecondsInHour = 60 * millisecondsInMinute;
        const millisecondsInDay = 24 * millisecondsInHour;
        const millisecondsInWeek = 7 * millisecondsInDay;
        const millisecondsInMonth = 30 * millisecondsInDay; // Approximate months as 30 days

        const monthsPassed = Math.floor(timeDifference / millisecondsInMonth);
        const weeksPassed = Math.floor(timeDifference / millisecondsInWeek);
        const daysPassed = Math.floor(timeDifference / millisecondsInDay);
        const hoursPassed = Math.floor(timeDifference / millisecondsInHour);
        const minutesPassed = Math.floor(timeDifference / millisecondsInMinute);

        // Compare and return the result
        if (monthsPassed >= 1) {
          return `${monthsPassed} ${this.ui.csm_v2_time_month}`;
        } else if (weeksPassed >= 1) {
          return `${weeksPassed} ${this.ui.csm_v2_time_week}`;
        } else if (daysPassed >= 1) {
          return `${daysPassed} ${this.ui.csm_v2_time_day}`;
        } else if (hoursPassed >= 1) {
          return `${hoursPassed} ${this.ui.csm_v2_time_hour}`;
        } else if (minutesPassed >= 1) {
          return `${minutesPassed} ${this.ui.csm_v2_time_minute}`;
        } else {
          return this.ui.csm_v2_time_just_now;
        }
      },
      projrunno_0() {
        return $linq(this.detail).select(x => x.main_pre_des).firstOrDefault() || ''
      },
      onlyPressNumber() {

        this.$set(this.form, "contract_tel", this.form.contract_tel.replace(/[^0-9]/g, ''))

      },
      onlyPressNumber2() {

        this.$set(this.form_member, "telephone", this.form_member.telephone.replace(/[^0-9]/g, ''))

      },
      disabledDate() {
        return moment().diff(moment(), 'days')
      },
      viewImage(source) {
        if (source.length == 0) {
          return;
        }

        const modifiedSource = source.map(file => {
          const ext = this.getFileExt(file.filename).toLowerCase();
          const fileTypes = {
            mp4: 'fa-file-video',
            doc: 'fa-file-word',
            docx: 'fa-file-word',
            xls: 'fa-file-excel',
            xlsx: 'fa-file-excel',
            ppt: 'fa-file-powerpoint',
            pptx: 'fa-file-powerpoint',
            pdf: 'fa-file-pdf'
          };

          const isImage = ['jpg', 'jpeg', 'png'].includes(ext);
          const isKnownDoc = Object.keys(fileTypes).includes(ext);

          // แบบพิเศษ: item_type === 'T' → แบ่งซ้ายขวา
          if (file.item_type === 'T') {
            let leftContent = '';

            if (isImage) {
              leftContent = `<img src="${file.src}" alt="${file.alt}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />`;
            } else if (isKnownDoc) {
              leftContent = `<i class="fas ${fileTypes[ext]} fa-7x" style="color: #666;"></i>`;
            } else {
              leftContent = `<i class="fa fa-file fa-7x" style="color: #999;"></i>`;
            }

            return {
              html: `
                <div style="display: flex; flex-direction: row; width: 80vw; height: 60vh; margin: auto; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 0 15px rgba(0,0,0,0.3);">
                  <div style="flex: 1; display: flex; justify-content: center; align-items: center; background: #f4f4f4;">
                    ${leftContent}
                  </div>
                  <div style="flex: 1; padding: 20px; overflow-y: auto; background: #fff; color: #333;">
                    <h4>${this.ui.csm_v2_description}</h4>
                    <p>${file.description || file.alt || this.ui.csm_v2_no_details}</p>
                  </div>
                </div>
              `,
              isIcon: false,
              alt: file.alt,
              src2: file.src
            };
          }

          // ปกติ: แสดงภาพ
          if (isImage) {
            return {
              html: `<img src="${file.src}" alt="${file.alt}" style="background-color: white; max-width: 600px; max-height: 400px; width: auto; height: auto; object-fit: contain; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);"/>`,
              isIcon: false,
              alt: file.alt,
              src2: file.src
            };
          }

          // ปกติ: ไฟล์ที่รู้จัก
          if (isKnownDoc) {
            return {
              html: `<i class="fas ${fileTypes[ext]} fa-5x" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white;"></i>`,
              isIcon: true,
              alt: file.alt,
              src2: file.src
            };
          }

          // ปกติ: อื่นๆ
          return {
            html: `<i class="fa fa-file fa-5x" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white;"></i>`,
            isIcon: true,
            alt: file.alt,
            src2: file.src
          };
        });


        const options = {
          dataSource: modifiedSource,
          showHideAnimationType: 'none'
        };

        //console.log('o:', options);
        //console.log('s:', source);

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

              pswp.on('change', () => {
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
                const currSrc = pswp.currSlide.data.src2;
                if (currSrc) {
                  el.href = currSrc;
                } else {
                  el.href = pswp.currSlide.data.src;
                }
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
      filterInput(event, keyword) {
        switch (keyword) {
          case "add_member":
            this.$set(this.form_member, "userid", event.target.value.replace(/[^a-z0-9]/gi, ''))
            break;

          default:
            break;
        }
      },
      CopyClipboard_Member() {
        const username = this.form_member.userid;
        const password = this.form_member.userpass;

        const textToCopy = `Username: ${username}\nPassword: ${password}`;

        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = textToCopy;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        tempTextarea.setSelectionRange(0, 99999); // สำหรับมือถือ

        document.execCommand('copy');
        document.body.removeChild(tempTextarea);

        $msg.alert(this.ui.csm_v2_notification, `${this.ui.csm_v2_alert_copy_userpass}<br>`, 'success')
      },
      copyUrl(type) {
        let typeText = type === 'reg' ? `Register ${this.ui.csm_v2_register}\n` : `Login ${this.ui.csm_v2_login}\n`;
        let value = '';

        if (type === 'reg') {
          value = $('#register').val();
        } else if (type === 'login') {
          value = $('#login').val();
        }

        let textToCopy = typeText + value;

        // สร้าง textarea ชั่วคราวเพื่อ copy
        const tempInput = document.createElement('textarea');
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        tempInput.setSelectionRange(0, 99999); // รองรับมือถือ

        try {
          const successful = document.execCommand('copy');
          if (successful) {
            let alertMsg = type === 'reg'
              ? `${this.ui.csm_v2_alert_copy_register_link}<br>`
              : `${this.ui.csm_v2_alert_copy_login_link}<br>`;
            $msg.alert(this.ui.csm_v2_notification, alertMsg, 'success');
          } else {
            throw new Error('Copy command unsuccessful');
          }
        } catch (err) {
          console.error('Copy failed:', err);
        }

        // ลบ textarea ชั่วคราว
        document.body.removeChild(tempInput);
      },
      openMapUrl(url) {
        if (url) {
          window.open(url, '_blank');
        } else {
          $msg.alert('Warning', 'Please enter a valid Google Maps URL.', 'warning');
        }
      },
      openModalLocation(data) {
        let gps = data || '';
        let key = this.$store.state.config.API_KEY_GOOGLE_remark1 || '';
        let src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${gps}`;
        this.$set(this.form, 'map_src', src);

        this.$refs.modal_previewMap.setSize('modal-xl')
        this.$refs.modal_previewMap.openModal()
      },
      previewLocation(data) {
        let gps = data || '';
        let key = this.$store.state.config.API_KEY_GOOGLE_remark1 || '';
        let src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${gps}`;
        this.$set(this.form, 'map_src', src);
      },
      checkScreenSize() {
        this.isSmallScreen = window.innerWidth < 1024
        this.isWrap = window.innerWidth >= 992 && window.innerWidth <= 1023;
      },
      getFileExt(f) {
        return f?.split('.').pop().toLowerCase()
      },
      openDescModal(from) {
        this.currentForm = from
        this.$refs.descriptionModal.openModal()
      },
      sendComponent(e, type) {
        switch (type) {
          case 'description':
            // this.$set(this.formData, 'descode', e.descode)
            this.$set(this.form, 'note', e.desname)
            // this.closeDescModal()
            break
          case 'description2':
            this.$set(this.form, 'description', e.desname)
            // this.closeDescModal()
            break
          case 'subject':
            this.$set(this.form, 'subject', e.desname)
            // this.closeDescModal()
            break
        }
      },
      async loadConfig() {
        let action = `CSM/API/GetConfig`
        let data = await $xt.getCustomerServer(action);
        this.$set(this, 'is_mango', data.config_value);
      },
      setBackground() {
        this.$nextTick(() => {
          if (this.img_bg.length > 0) {
            $('body').css({
              'background-image': `url(${dataServer + 'Api/File/DownLoad?id=' + this.img_bg[0].phi_path})`,
              'background-size': 'cover',
              'background-repeat': 'no-repeat',
              'background-position': 'center center',
            });
            // console.log('ccc mounted', `url(${dataServer + 'Api/File/DownLoad?id=' + this.img_bg[0].phi_path}) `)
          } else if (this.is_mango === "Y") {
            $('body').css({
              'background-image': `url(${this.baseUrl + 'Content/Images/PNG/v2_mangoBG.png'})`,
              'background-size': 'cover',
              'background-repeat': 'no-repeat',
              'background-position': 'center center',
            });
          }
          else if (this.is_mango === "N") {
            $('body').css({
              'background-image': `url(${this.baseUrl + 'Content/Images/PNG/v2_customerBG.png'})`,
              'background-size': 'cover',
              'background-repeat': 'no-repeat',
              'background-position': 'center center',
            });
          } else {
            $('body').css({
              'background-image': `url(${this.baseUrl + 'Content/Images/PNG/bg.jpg'})`,
              'background-size': 'cover',
              'background-repeat': 'no-repeat',
              'background-position': 'center center',
            });
          }
        })
      },
      pageChange(pn, pt) {
        pn = pn || 1;
        this.pageNumber = pn;
        paging.setCurrentPage(pn);
        this.$set(this, "chkstatusDisplay", $linq(this.chkstatus).skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray());
        paging.createPagesArray();
      },
      showCommentExtLength() {
        return this.data_comment
      },
      async showCommentExt(job_no, ref_docno) {
        if (!['HW', 'P', 'Y'].includes(this.status_text)) return
        try {
          let action = `CSM/CustomerData/read_comment_ext_cus?job_no=${job_no}&ref_docno=${ref_docno}&maincode=${this.customer.maincode}`;
          let resp = await $xt.getCustomerServer(action)
          this.$set(this, 'data_comment', resp.commentData)

        } catch (error) {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_v2_alert_comment_error, `warning`)
        }
      },
      async onFilterChange({ projectId, phaseIds, isAllSelected }) {
        const isNewProject = projectId !== this.selectedMain;
        this.selectedMain = projectId
        this.selectedPhases = phaseIds
        this.isAllPhasesSelected = isAllSelected // เก็บสถานะ Select All

        // ถ้าเป็นโครงการใหม่และยังไม่ได้โหลดเฟส (Lazy Load)
        if (isNewProject && projectId && !this.loadedPhases[projectId]) {
          await this.fetchSubProjects(projectId);
        }

        this.Tracking_ReadList(this.status_text)
      },
      async fetchSubProjects(projectId) {
        if (!projectId) return;
        try {
          // ค้นหา maincode จากรายการโครงการที่มี
          const proj = this.project.find(p => p.pre_event2 === projectId);
          if (!proj) return;

          let action = `CSM/CustomerData/LineOA_Read?maincode=${proj.maincode}&pre_event2=${projectId}&customer_code=${this.customer.customer_code}`
          if (this.customer.type == 'line_member') {
            action += `&userid=${this.customer.userid}`
          }
          let resp = await $xt.getCustomerServer(action);
          if (resp.data) {
            // แปลงข้อมูลหน่วย (Unit/Phase) ให้อยู่ในรูปแบบที่ Dropdown ต้องการ
            const phases = resp.data.map(d => ({
              id: d.pre_event,
              name: d.pre_des || d.pre_event
            }));
            this.$set(this.loadedPhases, projectId, phases);
          }
        } catch (error) {
          console.error("Failed to fetch sub-projects:", error);
        }
      }
    },
    created() {
      document.title = this.ui.csm_v2_page_title;
      document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
          $('#showpic').trigger('click')
        }
      });
    },
    computed: {
      ...mapState(['config']),
      isImg() {
        const pics = this.chkstatus_detail.pics;
        return pics && pics[0] && pics[0].src && ['png', 'jpeg', 'jpg'].includes(this.getFileExt(pics[0].filename));
      },
      projectList() {
        const groups = {};
        this.project.forEach(p => {
          const mainId = p.pre_event2; // Main ID เป็น pre_event2
          if (!groups[mainId]) {
            groups[mainId] = {
              id: mainId,
              name: p.main_pre_des || p.pre_des || mainId,
              phases: this.loadedPhases[mainId] || [] // ใช้ข้อมูลโครงการย่อยที่โหลดมาแบบ Dynamic
            };
          }
        });
        return Object.values(groups);
      }
    },
    async mounted() {
      await this.loadConfig()
      this.tabs[1].text = this.is_mango === "Y" ? this.ui.csm_v2_create_request_mango : this.ui.csm_v2_create_request;
      this.tabs[1].text2 = this.is_mango === "Y" ? this.ui.csm_v2_request_form_mango : this.ui.csm_v2_request_form;
      this.tabs[2].text2 = this.is_mango === "Y" ? this.ui.csm_v2_request_form_details_mango : this.ui.csm_v2_request_form_details;
      loading = this.$refs.myLB
      this.isMember()
      await this.readImg();
      await this.setBackground()
      this.$nextTick(() => {
        $(document).on('click', function (event) {
          // Check if the clicked element is not inside the sidebar
          const sidebar = $('.sidebar');
          if (!sidebar.is(event.target) && !$('.navbar-toggle').is(event.target) && !$('.navbar-toggle span').is(event.target) && !$('.sidebar-button').is(event.target) && !$('.sidebar-button-a').is(event.target) && !$('.sidebar-profile').is(event.target) && !sidebar.has(event.target).length) {
            $('.sidebar').removeClass('active')
            $('.sidebar-content').removeClass('d-block').addClass('d-none')
          }
        });

        $(this.$refs.myFile).on('change', (e) => {
          for (var i = 0; i < e.target.files.length; i++) {
            this.fileUpload(e.target.files[i]);
          }
        });

        $(this.$refs.myFileNotPicture).on('change', (e) => {
          for (var i = 0; i < e.target.files.length; i++) {
            this.fileUpload(e.target.files[i]);
          }
        });
      })
      this.checkScreenSize()
      window.addEventListener("resize", this.checkScreenSize);
      // paging = this.$refs.paging;
      // paging.setCurrentPage(1);
      // paging.setItemsPerPage(40);
    },
    beforeDestroy() {
      window.removeEventListener("resize", this.checkScreenSize);
    },
    watch: {
      'selectedTabs.isEdit'(newVal, oldVal) {
        if (this.selectedTabs.id == 'Header_tab3' && newVal) {
          this.$nextTick(() => {
            $('body').css({ 'background-image': 'none', 'background-color': '#fff' })
            $('.content-header').css({ 'background-image': '', 'background-color': '#fff' })
          })
        } else if (this.selectedTabs.id == 'Header_tab4') {
          this.$nextTick(() => {
            $('body').css({ 'width': '100%', 'background': 'url(' + this.baseUrl + 'Content/Images/PNG/success-submit.png), linear-gradient(to bottom, #00BF9D 0%, #00BF9D 53%, white 0%, white 100%)', 'background-repeat': 'no-repeat', 'background-position': 'center center' })
          })
        } else if (this.selectedTabs.id == 'Header_tab5') {
          this.$nextTick(() => {
            $('body').css({ 'background-image': 'none', 'background-color': '#f3f3f3' })
            $('.content-header').css({ 'background-image': 'none', 'background-color': '#FFFC' })
          })
        } else if (this.selectedTabs.id == 'Header_tab6') {
          this.$nextTick(() => {
            $('body').css({ 'background-image': 'none', 'background-color': '#f3f3f3' })
            $('.content-header').css({ 'background-image': 'none', 'background-color': '#FFFC' })
          })
        } else {
          this.$nextTick(() => {
            this.setBackground();
            $('.content-header').css({ 'background-image': '', 'background-color': 'transparent' });
          });
        }
      },
      'selectedTabs'(newVal) {
        if (this.selectedTabs.id == 'Header_tab5' && newVal) {
          this.$nextTick(() => {
            $('body').css({ 'background-image': 'none', 'background-color': '#f3f3f3' })
            $('.content-header').css({ 'background-image': 'none', 'background-color': '#FFFC' })
          })
        } else if (this.selectedTabs.id == 'Header_tab6' && newVal) {
          this.$nextTick(() => {
            $('body').css({ 'background-image': 'none', 'background-color': '#f3f3f3' })
            $('.content-header').css({ 'background-image': 'none', 'background-color': '#FFFC' })
          })
        } else if (this.selectedTabs.id == 'Header_tab4') {
          this.$nextTick(() => {
            $('body').css({ 'width': '100%', 'background': 'url(' + this.baseUrl + 'Content/Images/PNG/success-submit.png), linear-gradient(to bottom, #00BF9D 0%, #00BF9D 53%, white 0%, white 100%)', 'background-repeat': 'no-repeat', 'background-position': 'center center' })
          })
        } else {
          this.$nextTick(() => {
            this.setBackground();
            $('.content-header').css({ 'background-image': '', 'background-color': 'transparent' });
          });
        }
      },

      rawSearchText: debounce(function (val) {
        this.searchText = val
      }, 1000)

    }
  }
</script>

<style>
  @import './../CSS/Style.css';

  body, html {
    background-position: center !important;
    background-repeat: no-repeat !important;
  }

  .text-document {
    position: absolute !important;
    bottom: 5% !important;
  }

  .footer {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: #ffffff;
    color: #333;
    text-align: center;
    font-size: 14px;
    padding: 0px 12px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
    z-index: 999;
  }

  #tab-6-bottom {
    position: absolute;
    bottom: 10%;
    left: 0;
    width: 100%;
  }

  .vue-pic-75 figure.gallery-thumbnail img {
    width: 75px;
    height: 75px;
  }

  figure.gallery-thumbnail img {
    border-radius: 10px;
  }

  .pswp__bg {
    background-color: #2f2f2f;
  }

  .image-title {
    position: absolute;
    bottom: 20px;
    left: 20px;
    color: white;
    font-size: 16px;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 5px 10px;
    border-radius: 5px;
  }

  .gallery-thumbnail {
    display: block !important;
    margin: 5px;
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
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #fff;
    margin: 0 5px;
  }

  .pswp__bullet--active {
    background: #00BF9D;
  }

  .pswp__custom-caption {
    background: #00BF9D !important;
    font-size: 16px;
    color: #fff;
    width: calc(100% - 32px);
    max-width: 400px;
    padding: 2px 8px;
    border-radius: 4px;
    position: absolute;
    left: 50%;
    bottom: 80px;
    transform: translateX(-50%);
  }

    .pswp__custom-caption a {
      color: #fff;
      text-decoration: underline;
    }

  .hidden-caption-content {
    display: none;
  }

  .svg-icon {
    cursor: pointer;
    /* filter: brightness(0) saturate(100%) invert(48%) sepia(99%) saturate(1107%) hue-rotate(131deg) brightness(95%) contrast(101%); */
  }

  .pswp__img {
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    background-color: transparent !important;
  }

  .modal-vote-body {
    max-height: 60vh;
    overflow-y: auto;
  }
</style>
