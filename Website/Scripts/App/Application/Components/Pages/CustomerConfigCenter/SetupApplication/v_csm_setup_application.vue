<template>
    <div>
        <re-page ref="page">
            <template #body>
                <section class="content">
                    <!-- Control Button : Company -->
                    <div class="row">
                        <div class="col-md-12">
                            <div class="pull-right">
                                <button class="btn btn-sm btn-facebook" @click.prevent="$refs.company.openModal({
                                    servicePath: servicePath,
                                })"><i class="fas fa-list"></i> <span
                                        v-text="ui.retrieve || 'Retrieve Document'"></span></button>
                            </div>
                        </div>
                    </div>
                    <div class="nav nav-tabs-custom margin-t-10">
                        <ul class="nav nav-tabs">
                            <li v-for="(x, idx) in headerTab" :key="`header-${idx}`"
                                :class="{ active: x.id == headerTabSelected }" v-show="x.show">
                                <a href="#" @click.prevent="clickTabSelected(x, 'header')">
                                    <i class="fas" v-bind:class="xt.isEmpty(x.icon) ? 'fa-circle' : x.icon"></i>
                                    {{ x.text }}
                                    <span v-if="x.total > 0">({{ x.total }})</span>
                                </a>
                            </li>
                        </ul>
                        <div class="tab-content">
                            <!-- Tab : ERP Config -->
                            <div class="tab-pane" v-bind:class="{ active: headerTabSelected == 'header_tab1' }">
                                <div class="padding-detail">
                                    <vue-element-loading :active="loading" spinner="spinner" color="#02234e"
                                        text="ระบบกำลังค้นหาข้อมูล ERP Config ของท่าน กรุณารอสักครู่..." />
                                    <div class="row">
                                        <div class="col-md-2">
                                            <div class="form-group">
                                                <select class="form-control input-sm" v-model="search.field">
                                                    <option value="code">Code</option>
                                                    <option value="remark">Remark (1)</option>
                                                    <option value="remark_return">Remark (2)</option>
                                                    <option value="remark3">Remark (3)</option>
                                                    <option value="remark_return2">Remark (4)</option>
                                                    <option value="remark2">Remark (5)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <div class="input-group">
                                                    <input type="text" class="form-control input-sm" placeholder="ค้นหา"
                                                        v-model="search.text" @keyup.enter="searchConfig" />
                                                    <span class="input-group-btn"><button class="btn btn-sm bg-navy"
                                                            @click="searchConfig"><i
                                                                class="fas fa-search"></i></button></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="pull-right">
                                                <button class="btn btn-sm btn-warning"
                                                    @click.prevent="loadCompanyCopy()" v-if="auth.is_admin"><i
                                                        class="fas fa-copy"></i> Copy to Company</button>
                                                <template v-if="auth.is_admin || auth.userid == 'MANGO'">
                                                    <button class="btn btn-sm bg-navy"
                                                        @click.prevent="appendRow('config')"><i class="fas fa-plus"></i>
                                                        <span v-text="ui.add_detail || 'เพิ่มข้อมูล'"></span></button>
                                                    <button class="btn btn-sm bg-olive" @click.prevent="saveConfig"><i
                                                            class="fas fa-save"></i> <span
                                                            v-text="ui.save || 'บันทึกข้อมูล'"></span></button>
                                                </template>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <table-stick-2 ref="stickTable" :cellpad="14" :scale="245">
                                                <table class="table table-bordered table-striped table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th class="tf-2">No.</th>
                                                            <th class="tf-2">Action</th>
                                                            <th class="tf-4">Code</th>
                                                            <th class="tf-2">Active</th>
                                                            <th class="tf-2-5">Value Data</th>
                                                            <th class="tf-5">Remark (1)</th>
                                                            <th class="tf-5">Remark (2)</th>
                                                            <th class="tf-5">Remark (3)</th>
                                                            <th class="tf-5">Remark (4)</th>
                                                            <th class="tf-5">Remark (5)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                         <tr v-for="(x, idx) in displayConfig"> 
                                                            <td align="center">{{ idx + 1 }}.</td>
                                                            <td align="center" class="td-action">
                                                                <a href="#" class="text-danger"
                                                                    @click.prevent="deleteRow(x, 'config', idx)"
                                                                    v-bind:class="{ 'disabled-click': !auth.is_admin }">
                                                                    <v-icon name="trash-2"
                                                                        class="v-icon-width"></v-icon>
                                                                </a>
                                                            </td>
                                                            <td><input class="form-control table text-uppercase mb-0"
                                                                    v-model="x.code" maxlength="30"
                                                                    v-bind:disabled="!x.editMode" /></td>
                                                            <td align="center">
                                                                <div
                                                                    class="form-check form-check-custom form-check-solid form-switch form-switch-sm form-swtich-center">
                                                                    <input class="form-check-input mb-0" type="checkbox"
                                                                        true-value="Y" false-value="N"
                                                                        v-model="x.active"
                                                                        v-bind:class="{ 'disabled-click': !auth.is_admin }" />
                                                                </div>
                                                            </td>
                                                            <td><input class="form-control table text-center mb-0"
                                                                    v-model="x.value_data" maxlength="10"
                                                                    v-bind:class="{ 'disabled-click': !auth.is_admin }" />
                                                            </td>
                                                            <td><input class="form-control table mb-0"
                                                                    v-model="x.remark" maxlength="300"
                                                                    v-bind:class="{ 'disabled-click': !auth.is_admin }" />
                                                            </td>
                                                            <td><input class="form-control table mb-0"
                                                                    v-model="x.remark_return" maxlength="4000"
                                                                    v-bind:class="{ 'disabled-click': !auth.is_admin }" />
                                                            </td>
                                                            <td><input class="form-control table mb-0"
                                                                    v-model="x.remark3" maxlength="4000"
                                                                    v-bind:class="{ 'disabled-click': !auth.is_admin }" />
                                                            </td>
                                                            <td><input class="form-control table mb-0"
                                                                    v-model="x.remark_return2" maxlength="4000"
                                                                    v-bind:class="{ 'disabled-click': !auth.is_admin }" />
                                                            </td>
                                                            <td><input class="form-control table mb-0"
                                                                    v-model="x.remark2" maxlength="4000"
                                                                    v-bind:class="{ 'disabled-click': !auth.is_admin }" />
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </table-stick-2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Tab : Module Config -->
                            <div class="tab-pane" v-bind:class="{ 'active': headerTabSelected == 'header_tab2' }">
                                <div class="padding-detail">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h5 class="text-dark-blue"><ins>ตั้งค่าเปิดใช้งานโปรแกรม</ins></h5>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="pull-right">
                                                <button class="btn btn-sm btn-tumblr" @click.prevent="defaultModule"><i
                                                        class="fas fa-clone"></i>
                                                    Set Menu Default</button>
                                                <button class="btn btn-sm bg-navy"
                                                    @click.prevent="appendRow('module')"><i class="fas fa-plus"></i>
                                                    <span v-text="ui.add_detail || 'เพิ่มข้อมูล'"></span></button>
                                                <button class="btn btn-sm bg-olive" @click.prevent="saveSetModule"><i
                                                        class="fas fa-save"></i> <span
                                                        v-text="ui.save || 'บันทึกข้อมูล'"></span></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <table-stick-2 :cellpad="14" :scale="245">
                                                <table class="table table-bordered table-striped table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th class="tf-2">No.</th>
                                                            <th class="tf-2">Action</th>
                                                            <th class="tf-3">Module Code</th>
                                                            <th class="tf-6">Module Name</th>
                                                            <th class="tf-2-5">Active</th>
                                                            <th class="tf-3">Add By</th>
                                                            <th class="tf-3-5">Add Date</th>
                                                            <th class="tf-3">Edit By</th>
                                                            <th class="tf-3-5">Edit Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-for="(x, idx) in module">
                                                            <td align="center" class="bg-content-table">{{ idx + 1 }}.
                                                            </td>
                                                            <td align="center" class="td-action">
                                                                <a href="#" class="text-danger"
                                                                    @click.prevent="deleteRow(x, 'module')"><v-icon
                                                                        name="trash-2"
                                                                        class="v-icon-width"></v-icon></a>
                                                            </td>
                                                            <td><input class="form-control table text-uppercase mb-0"
                                                                    v-model="x.module_code" maxlength="10"
                                                                    v-bind:readonly="!x.editMode" /></td>
                                                            <td><input class="form-control table mb-0"
                                                                    v-model="x.module_name" maxlength="100" />
                                                            </td>
                                                            <td align="center">
                                                                <div
                                                                    class="form-check form-check-custom form-check-solid form-switch form-switch-sm form-swtich-center">
                                                                    <input class="form-check-input mb-0" type="checkbox"
                                                                        true-value="Y" false-value="N"
                                                                        v-model="x.active" />
                                                                </div>
                                                            </td>
                                                            <td class="text-secondary">{{ x.adduser }}</td>
                                                            <td align="center" class="text-secondary">
                                                                {{ $date(x.add_dt, 'DD/MM/YYYY HH:mm:ss') }}</td>
                                                            <td class="text-secondary">{{ x.edituser }}</td>
                                                            <td align="center" class="text-secondary">
                                                                {{ $date(x.edit_dt, 'DD/MM/YYYY HH:mm:ss') }}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </table-stick-2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Tab : Application Policy -->
                            <div class="tab-pane" v-bind:class="{ 'active': headerTabSelected == 'header_tab3' }">
                                <div class="padding-detail">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h5 class="text-dark-blue"><ins>กำหนด Package Version ของโปรแกรม</ins></h5>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="pull-right">
                                                <button class="btn btn-sm bg-navy"
                                                    @click.prevent="appendRow('policy')"><i class="fas fa-plus"></i>
                                                    <span v-text="ui.add_detail || 'เพิ่มข้อมูล'"></span></button>
                                                <button class="btn btn-sm bg-olive" @click.prevent="vaildSavePolicy"><i
                                                        class="fas fa-save"></i>
                                                    <span v-text="ui.save || 'บันทึกข้อมูล'"></span></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row margin-t-10">
                                        <div class="col-md-12">
                                            <table-stick-2 :cellpad="14" :scale="245">
                                                <table class="table table-bordered table-striped table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th class="tf-2">No.</th>
                                                            <th class="tf-2">Action</th>
                                                            <th class="tf-3-5">Application Code</th>
                                                            <th class="tf-5">Application Name</th>
                                                            <th class="tf-3-5">Package Version</th>
                                                            <th class="tf-3-5">Expire Start Date</th>
                                                            <th class="tf-3-5">Expire End Date</th>
                                                            <th class="tf-3">Concurrent User</th>
                                                            <th class="tf-3">Add by</th>
                                                            <th class="tf-3">Add Date</th>
                                                            <th class="tf-3">Edit by</th>
                                                            <th class="tf-3">Edit Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-for="(x, idx) in policy">
                                                            <td align="center">{{ x.itemno }}.</td>
                                                            <td align="center" class="td-action">
                                                                <a href="#" class="text-danger"
                                                                    @click.prevent="deleteRow(x, 'policy')"><v-icon
                                                                        name="trash-2"
                                                                        class="v-icon-width"></v-icon></a>
                                                            </td>
                                                            <td>
                                                                <select class="form-control table mb-0"
                                                                    v-model="x.application_code"
                                                                    @change="changePolicyName(x)">
                                                                    <option :value="x.id" v-for="x in appType">
                                                                        {{ x.id }}
                                                                    </option>
                                                                </select>
                                                            </td>
                                                            <td><input class="form-control table mb-0"
                                                                    v-model="x.application_name" maxlength="100"
                                                                    @change="changeInfo(x)" /></td>
                                                            <td>
                                                                <select class="form-control table mb-0"
                                                                    v-model="x.package_version"
                                                                    @change="clearPackageVersion(x)">
                                                                    <option :value="x.id" v-for="x in packageVersion">
                                                                        {{ x.name }}</option>
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <div class="warp-table">
                                                                    <datepicker input-class="form-control table mb-0"
                                                                        v-model="x.expire_start_date"
                                                                        @change="changeInfo(x)"></datepicker>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="warp-table">
                                                                    <datepicker input-class="form-control table mb-0"
                                                                        v-model="x.expire_end_date"
                                                                        @change="changeInfo(x)"></datepicker>
                                                                </div>
                                                            </td>
                                                            <td align="center"><i-input
                                                                    input-class="form-control table text-center mb-0"
                                                                    :number-only="true" v-model="x.concurrent_user"
                                                                    @keyup="changeInfo(x)"></i-input></td>
                                                            <td align="center">{{ x.adduser }}</td>
                                                            <td align="center">{{ $date(x.add_dt, 'DD/MM/YYYY') }}</td>
                                                            <td align="center">{{ x.edituser }}</td>
                                                            <td align="center">{{ $date(x.edit_dt, 'DD/MM/YYYY') }}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </table-stick-2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </template>
        </re-page>
        <!-- Modal : Center -->
        <vue-company-list ref="company" @send-data="addInfoComponent($event, 'company')"></vue-company-list>
        
        <modal ref="companyModal">
            <template #header>
                <h4>Select Company to Copy</h4>
            </template>
            <template #body>
                <table-stick-2 ref="company-table">
                <table class="table table-bordered table-striped table-hover">
                    <thead>
                    <tr>
                        <th class="tf-2-5">Select</th>
                        <th class="tf-2-5">No.</th>
                        <th class="tf-3">Code</th>
                        <th>Company</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(x,idx) in companyCopy" v-bind:class="{'table-selected': x.cc_select == 'Y'}">
                        <td align="center">
                            <p-check class="p-icon p-curve p-smooth p-table" color="primary" true-value="Y" false-value="N" v-model="x.cc_select">
                                <i class="icon mdi mdi-check" slot="extra"></i>
                                <label slot="off-label"></label>
                            </p-check>
                        </td>
                        <td align="center">{{idx+1}}.</td>
                        <td align="center">{{x.maincode}}</td>
                        <td>{{x.mainname}}</td>
                    </tr>
                    </tbody>
                </table>
                </table-stick-2>
            </template>
            <template #footer>
                <button class="btn btn-sm bg-olive" @click.prevent="copyConfig()"><i class="fas fa-check"></i> <span v-text="ui.save || 'บันทึกข้อมูล'"></span></button>
            </template>
        </modal>
    </div>
    
</template>

<script type="text/javascript">
import "@mdi/font/css/materialdesignicons.css";
let page = {}
let process = false
const applicationType = [
    { id: 'ANYWHERE', name: 'ERP Anywhere' },
    { id: 'PLANWEB', name: 'Project Planning' },
    { id: 'QCM', name: 'Quality Control Management' },
    { id: 'REWEB', name: 'Real Estate (Web)' },
    { id: 'EMAIL', name: 'Sending Email' },
    { id: 'CSM', name: 'Customer Service Management' }
];
const packageVersion = [
    { id: '0', name: 'Full Version' },
    { id: '1', name: 'Free Version' },
    { id: '2', name: 'Trial Version' }
];
export default {
    components: {
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
                { id: 'header_tab1', icon: 'fa-wrench', text: 'Settings Program (Config)', show: true, total: 0 },
                { id: 'header_tab2', icon: 'fa-edit', text: 'Settings Allow Module', show: true, total: 0 }, // window.appinfo.adminOnly
                { id: 'header_tab3', icon: 'fa-calendar-check', text: 'Settings Expire Program', show: true, total: 0 }, // window.appinfo.adminOnly
            ],
            headerTabSelected: "",
            /* Data : ERP Config */
            search: { text: '', field: 'code' },
            config: [],
            displayConfig: [],
            companyCopy: [],
            /* Data : Module Config */
            module: [],
            /* Data : Application Policy */
            policy: [],
            appType: applicationType,
            packageVersion: packageVersion,
            /* Data : Other */
            loading: false,
            /* Data : Center */
            dumpData: {
                dataERPConfig: [],
                dataModuleConfig: [],
                dataPolicy: []
            },
            servicePath: "",
            MangoToken: "",
            maincode: "",
            mainname: "",
            typeKey: "",
            ref_cus_code: "",
        }
    },
    methods: {
        /* Method : Main Function */
        async clickTabSelected(x, keyword) {
            switch (keyword) {
                case "header":
                    this.$set(this, 'headerTabSelected', x.id)
                    switch (this.headerTabSelected) {
                        case 'header_tab1':
                            this.$refs.stickTable.scrollReset()
                            break
                    }
                    break
            }
        },
        async loadDefault() {
            // Load Token from Query String
            await this.onLoadToken();

            // Not Have maincode Open select company from modal
            this.$refs.company.openModal({
                servicePath: this.servicePath,
            });
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
        appendRow(keyword) {
            switch (keyword) {
                case "config":
                    this.config.push({ active: "N", editMode: true })
                    this.$refs.stickTable.scrollBottom()
                    break
                case "module":
                    let itemno = this.module.length == 0 ? 1 : $linq(this.module).max(x => x.itemno) + 1
                    this.module.push({ itemno: itemno, active: "Y", editMode: true })
                    break
                case "policy":
                    let policy_itemno = this.policy.length == 0 ? 1 : $linq(this.policy).max(x => x.itemno) + 1
                    this.policy.push({ itemno: policy_itemno, cc_active: 'Y' })
                    break
            }
        },
        async deleteRow(x, keyword, idx) {
            switch (keyword) {
                case "config":
                    if (!await $msg.confirm(`คุณต้องการลบ Config : ${x.code} นี้ใช่หรือไม่ โปรดยืนยัน หลังจากลบกรุณากดบันทึกอีกครั้ง`)) {
                        return
                    }
                     this.config.splice(idx, 1)
                    break
                case "module":
                    this.module = $linq(this.module).where(w => !(w.itemno == x.itemno)).toArray()
                    break
                case "policy":
                    this.policy = $linq(this.policy).where(w => !(w.itemno == x.itemno)).toArray()
                    break
            }
        },
        async addInfoComponent(e, keyword) {
            switch (keyword) {
                case 'company':
                    this.$set(this, 'maincode', e.maincode)
                    this.$set(this, 'mainname', e.mainname)
                    // Login Gateway Service Path
                    await this.onLoginGateway();

                    this.clickTabSelected({ id: $linq(this.headerTab).where(w => w.show).select(x => x.id).firstOrDefault() }, "header")
                    await this.loadConfig();
                    await this.loadModuleConfig();
                    await this.loadPolicy();

                    break

                case 'account':
                    this.$set(this.onTable, 'datacode', e.ac_code)
                    this.$set(this.onTable, 'dataname', e.ac_des)
                    break
            }
        },
        /* Method : ERP Config */
        async loadConfig() {
            const formData = {
                form:
                {
                    ServicePath: this.servicePath ?? "",
                    ServiceEvent: "Application",
                    ServiceName: "ConfigReadList",
                    MangoToken: this.MangoToken,
                    typeKey: this.typeKey,
                    ref_cus_code: this.ref_cus_code,
                },

            };

            let url = "CSM/Gateway/Dispath";
            let respNew = await $xt.postServerJson(url, formData);

            let data = respNew?.data?.data || [];

            data.forEach(f => { f.editMode = false })
            this.$set(this, 'config', data)
            this.dumpData.dataERPConfig = JSON.parse(JSON.stringify(data)) // เก็บข้อมูลเดิมไว้เปรียบเทียบ
            this.searchConfig()
        },
        async searchConfig() {
            this.$set(this, 'loading', true)
            await $xt.sleep(500)

            let text = this.search.text.trim().toLowerCase()
            let field = this.search.field
            if (!$xt.isEmpty(text)) {
                this.displayConfig = $linq(this.config).where(w => !$xt.isEmpty(w[field]) && w[field].toLowerCase().indexOf(text) > -1).toArray()
            } else {
                 this.$set(this, 'displayConfig', this.config)
            }

            this.$set(this, 'loading', false)
        },
        async saveConfig() {
            page.loadingBox.show()
            try {
                let f = {
                    data: this.config
                }
                let changed = $xt.compareObject(this.dumpData.dataERPConfig, f.data);
                                        
                const playLoadChanged = {
                    type: "updated",
                    setup_application_config: changed
                }

                const formData = {
                    form:
                    {
                        ServicePath: this.servicePath ?? "",
                        ServiceEvent: "Application",
                        ServiceName: "CreateConfig",
                        MangoToken: this.MangoToken,
                        payload: f,
                        Log: playLoadChanged,
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
                this.$set(this.search, 'text', '')
                this.loadConfig()
            }
            catch (ex) {
                $msg.alert('System Error', ex, 'danger')
            }
            finally {
                process = false
                page.loadingBox.hide()
            }
        },
        async loadCompanyCopy() {
            page.loadingBox.show()
            try {
                const formData = {
                    form:
                    {
                        ServicePath: this.servicePath ?? "",
                        ServiceEvent: "Company",
                        ServiceName: "CompanyReadList",
                        MangoToken: this.MangoToken,
                        typeKey: this.typeKey,
                        ref_cus_code: this.ref_cus_code,
                        Query: {
                            skip: "0",
                            take: "100"
                        }
                    },
                };
                
                let act =  `CSM/Gateway/Dispath`
                let resp = await $xt.postServerJson(act, formData)
                let response = resp.data
                if (!resp.success) {
                    throw resp.error
                }
                
                let list = $linq(response.data).where(w => w.maincode != this.maincode).toArray()
                list.forEach(f => { f.cc_select = 'N' })
                this.$set(this, 'companyCopy', list)

                this.$refs.companyModal.openModal()
            }
            catch (ex) { 
                $msg.alert(`เกิดข้อผิดพลาด`, ex.toString(), `danger`)
            }
            finally {
                page.loadingBox.hide()
            }
        },
        async copyConfig() {
            page.loadingBox.show()
            try {

                var name = "config_from_"+ this.maincode
                var maincodes = $linq(this.companyCopy).where(w => w.cc_select == 'Y').select(s => s.maincode).toArray()
                
                const playLoadLog = {
                    type: "updated",
                    setup_application_module: {
                        [name]: this.displayConfig,
                        copy_to: maincodes
                    }
                }

                let f = {
                    maincodes: maincodes
                }
                const formData = {
                    form:
                    {
                        ServicePath: this.servicePath ?? "",
                        ServiceEvent: "Application",
                        ServiceName: "CopyConfig",
                        MangoToken: this.MangoToken,
                        typeKey: this.typeKey,
                        ref_cus_code: this.ref_cus_code,
                        maincode: this.maincode,
                        mainname: this.mainname,
                        Payload: f,
                        Log: playLoadLog
                    },
                };

                let url = `CSM/Gateway/Dispath`
                let rsp = await $xt.postServerJson(url, formData)
                if (!rsp.success) {
                    throw rsp.error
                }
                $notify.success(this.ui.alert_save_success)
                this.$refs.companyModal.closeModal()
            }
            catch (ex) {
                $msg.alert(`เกิดข้อผิดพลาด`, ex.toString(), `danger`)
            }
            finally {
                page.loadingBox.hide()
            }
        },
        /* Method : Module Config */
        async loadModuleConfig() {
            const formData = {
                form:
                {
                    ServicePath: this.servicePath ?? "",
                    ServiceEvent: "Application",
                    ServiceName: "ModuleConfigReadList",
                    MangoToken: this.MangoToken,
                    typeKey: this.typeKey,
                    ref_cus_code: this.ref_cus_code,
                },

            };

            let url = "CSM/Gateway/Dispath";
            let respNew = await $xt.postServerJson(url, formData);
            let data = respNew?.data?.data || [];

            let itemno = 1
            $linq(data).foreach(f => { f.itemno = itemno++, f.editMode = false })
            this.$set(this, 'module', data)
            this.dumpData.dataModuleConfig = JSON.parse(JSON.stringify(data)) // เก็บข้อมูลเดิมไว้เปรียบเทียบ
        },
        async defaultModule() {
            page.loadingBox.show()
            
            const formData = {
                form:
                {
                    ServicePath: this.servicePath ?? "",
                    ServiceEvent: "Application",
                    ServiceName: "DefaultModule",
                    MangoToken: this.MangoToken,
                    typeKey: this.typeKey,
                    ref_cus_code: this.ref_cus_code,
                },
            };
            let url = "CSM/Gateway/Dispath";
            let respNew = await $xt.postServerJson(url, formData);
            if (!respNew.success) {
                $msg.alert(`เกิดข้อผิดพลาด`, respNew.error, `danger`)
                page.loadingBox.hide()
                return
            }

            $notify.success(this.ui.alert_save_success)
            await this.loadModuleConfig()
            page.loadingBox.hide()
        },
        async saveSetModule() {
            page.loadingBox.show()
            try {
                let f = {
                    data: this.module
                }             
                let changed = $xt.compareObject(this.dumpData.dataModuleConfig, f.data);
                
                const playLoadChanged = {
                    type: "updated",
                    setup_application_module: changed
                }

                const formData = {
                    form:
                    {
                        ServicePath: this.servicePath ?? "",
                        ServiceEvent: "Application",
                        ServiceName: "CreateSetModule",
                        MangoToken: this.MangoToken,
                        payload: f,
                        Log: playLoadChanged,
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
                this.loadModuleConfig()
            }
            catch (ex) {
                $msg.alert(`เกิดข้อผิดพลาด`, ex.toString(), `danger`)
            }
            finally {
                process = false
                page.loadingBox.hide()
            }
        },
        /* Method : Application Policy */
        async loadPolicy() {
            const formData = {
                form:
                {
                    ServicePath: this.servicePath ?? "",
                    ServiceEvent: "Application",
                    ServiceName: "PolicyReadList",
                    MangoToken: this.MangoToken,
                    typeKey: this.typeKey,
                    ref_cus_code: this.ref_cus_code,
                },

            };

            let url = "CSM/Gateway/Dispath";
            let resp = await $xt.postServerJson(url, formData);
            let data = resp?.data?.data || [];

            this.$set(this, 'policy', data)
            this.dumpData.dataPolicy = JSON.parse(JSON.stringify(data)) // เก็บข้อมูลเดิมไว้เปรียบเทียบ
        },
        vaildSavePolicy() {
            let hasError = false
            let message_error = ""

            this.policy.forEach((f, idx) => {
                if (!hasError) {
                    let index = idx + 1
                    if ($xt.isEmpty(f.application_code)) {
                        message_error += `- กรุณาระบุ Application Code ก่อนทำการบันทึกข้อมูล ในแภวที่ ${index} </br>`
                        hasError = true
                    }
                    if ($xt.isEmpty(f.application_name)) {
                        message_error += `- กรุณาระบุ Application Name ก่อนทำการบันทึกข้อมูล ในแภวที่ ${index} </br>`
                        hasError = true
                    }
                    if ($xt.isEmpty(f.package_version)) {
                        message_error += `- กรุณาระบุ Package Version ก่อนทำการบันทึกข้อมูล ในแภวที่ ${index} </br>`
                        hasError = true
                    }
                    if (($xt.isEmpty(f.expire_start_date) || $xt.isEmpty(f.expire_end_date)) && f.package_version != '0') {
                        message_error += `- กรุณาระบุ Start Date และ End Date ก่อนทำการบันทึกข้อมูล ในแภวที่ ${index} </br>`
                        hasError = true
                    }
                }
            })

            if (hasError) {
                $msg.alert('คำเตือน', message_error, 'warning')
                return
            }

            this.savePolicy()
        },
        async savePolicy() {
            try {
                let f = {
                    data: this.policy
                }
                page.loadingBox.show()
                let changed = $xt.compareObject(this.dumpData.dataPolicy, f.data);

                const playLoadChanged = {
                    type: "updated",
                    setup_application_policy: changed
                }

                const formData = {
                    form:
                    {
                        ServicePath: this.servicePath ?? "",
                        ServiceEvent: "Application",
                        ServiceName: "CreatePolicy",
                        MangoToken: this.MangoToken,
                        payload: f,
                        Log: playLoadChanged,
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
                this.loadPolicy()
            } catch (ex) {
                $msg.alert(`เกิดข้อผิดพลาด`, ex.toString(), `danger`)
            } finally {
                process = false
                page.loadingBox.hide()
            }
        },
        changePolicyName(x) {
            let appName = $linq(this.appType).where(w => w.id == x.application_code).select(s => s.name).firstOrDefault()
            this.$set(x, 'application_name', appName)
            this.changeInfo(x)
        },
        clearPackageVersion(x) {
            if (["0"].includes(x.package_version)) {
                this.$set(x, 'expire_start_date', null)
                this.$set(x, 'expire_end_date', null)
            }
            this.changeInfo(x)
        },
        changeInfo(item) {
            this.$set(item, 'cc_active', 'Y')
        },
    },
    mounted() {
        page = this.$refs.page
        page.pageTitle = "Master : Setup Application"
        document.title = page.pageTitle

        this.loadDefault()

        this.$nextTick(() => {
            $(window).resize(() => {
                $(this.$refs.configPanel).css({ "max-height": $(window).height() - 260 + "px" })
            })
            $(window).trigger("resize")
        })
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

.form-group {
    margin-bottom: 10px !important;
}
</style>
