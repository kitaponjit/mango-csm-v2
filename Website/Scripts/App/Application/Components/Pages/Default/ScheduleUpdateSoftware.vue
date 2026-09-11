<template>
    <div>
        <re-page ref="page">
            <template #body>
                <section class="content">
                    <div class="box box-solid">
                        <div class="box-body">
                            <div class="row margin-t-10" v-if="controlPanelRight">
                                <div class="col-md-3 pull-right">
                                    <button class="btn btn-sm btn-tumblr pull-right" @click="addSchedule()">
                                        <i class="fas fa-plus"></i> Add Schedule</button>
                                </div>
                            </div>
                            <div class="row margin-t-20 margin-b-20 margin-l-10 margin-r-10">
                                <div class="row">
                                    <div class="col-md-12">
                                        <ag-table ref="agr" :scale="370" :footer="false"
                                            @ready="initTable()"></ag-table>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </template>
        </re-page>
        <modal ref="AddScheduleModal" size="xl" @close-function="onClose">
            <template #header>
                <h4><i class="fas fa-plus"></i>{{ modalMode === 'add' ? 'Add Schedule' : 'Edit Schedule' }}</h4>
            </template>
            <template #body>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-9">
                            <div class="form-group">
                                <label>Software Version</label>
                                <div class="version-dropdown-container" style="position: relative;">
                                    <!-- Custom dropdown button -->
                                    <div class="form-control input-sm dropdown-toggle"
                                        @click="modalMode === 'add' && toggleVersionDropdown()"
                                        :style="{ pointerEvents: modalMode === 'edit' ? 'none' : 'auto', background: modalMode === 'edit' ? '#eee' : '' }">
                                        <span>{{ selectVersion || '--- Select Version ---' }}</span>
                                        <i class="fa fa-caret-down"></i>
                                    </div>

                                    <!-- Custom dropdown content -->
                                    <div v-if="showVersionDropdown" class="dropdown-content"
                                        style="position: absolute; top: 100%; left: 0; right: 0; z-index: 1000; background: white; border: 1px solid #ccc; border-top: none; max-height: 400px; overflow: hidden;">
                                        <!-- Search input -->
                                        <div style="padding: 10px; border-bottom: 1px solid #eee;">
                                            <input type="text" class="form-control input-sm"
                                                placeholder="Search versions..." v-model="versionSearchText"
                                                @input="filterVersions" style="margin: 0;">
                                        </div>
                                        <!-- Version list -->
                                        <div style="max-height: 300px; overflow-y: auto;">
                                            <div v-for="version in paginatedVersions" :key="version"
                                                @click="selectVersionItem(version)"
                                                style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f5f5f5;"
                                                :style="{ backgroundColor: selectVersion === version ? '#e3f2fd' : 'transparent' }"
                                                @mouseover="$event.target.style.backgroundColor = '#f5f5f5'"
                                                @mouseout="$event.target.style.backgroundColor = selectVersion === version ? '#e3f2fd' : 'transparent'">
                                                {{ version }}
                                            </div>

                                            <!-- No results message -->
                                            <div v-if="filteredVersions.length === 0"
                                                style="padding: 20px; text-align: center; color: #999;">
                                                No versions found
                                            </div>
                                        </div>

                                        <!-- Pagination for dropdown -->
                                        <div v-if="filteredVersions.length > itemsPerPage"
                                            style="padding: 10px; border-top: 1px solid #eee;">
                                            <pagination-2 ref="dropdownPagingVersion"
                                                @page-change="pageChangeDropdownVersion($event.page)"></pagination-2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-9">
                            <div class="form-group">
                                <label>Customer</label>
                                <div class="customer-dropdown-container" style="position: relative;">
                                    <!-- Custom dropdown button -->
                                    <div class="form-control input-sm dropdown-toggle"
                                        @click="modalMode === 'add' && toggleCustomerDropdown()"
                                        :style="{ pointerEvents: modalMode === 'edit' ? 'none' : 'auto', background: modalMode === 'edit' ? '#eee' : '' }">
                                        <span>{{ selectCustomerName || '--- Select Customer ---' }}</span>
                                        <i class="fa fa-caret-down"></i>
                                    </div>

                                    <!-- Custom dropdown content -->
                                    <div v-if="showCustomerDropdown" class="dropdown-content"
                                        style="position: absolute; top: 100%; left: 0; right: 0; z-index: 1000; background: white; border: 1px solid #ccc; border-top: none; max-height: 400px; overflow: hidden;">
                                        <!-- Search input -->
                                        <div style="padding: 10px; border-bottom: 1px solid #eee;">
                                            <input type="text" class="form-control input-sm"
                                                placeholder="Search customers..." v-model="customerSearchText"
                                                @input="filterCustomers" style="margin: 0;">
                                        </div>
                                        <!-- Customer list -->
                                        <div style="max-height: 300px; overflow-y: auto;">
                                            <div v-for="customer in paginatedCustomers" :key="customer.customer_code"
                                                @click="selectCustomerItem(customer)"
                                                style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f5f5f5;"
                                                :style="{ backgroundColor: selectCustomerName === customer.customer_name ? '#e3f2fd' : 'transparent' }"
                                                @mouseover="$event.target.style.backgroundColor = '#f5f5f5'"
                                                @mouseout="$event.target.style.backgroundColor = selectCustomerName === customer.customer_name ? '#e3f2fd' : 'transparent'">
                                                {{ customer.customer_name }}
                                            </div>

                                            <!-- No results message -->
                                            <div v-if="filteredCustomers.length === 0"
                                                style="padding: 20px; text-align: center; color: #999;">
                                                No Customer found
                                            </div>
                                        </div>

                                        <!-- Pagination for dropdown -->
                                        <div v-if="filteredCustomers.length > itemsPerPage"
                                            style="padding: 10px; border-top: 1px solid #eee;">
                                            <pagination-2 ref="dropdownPagingCustomer"
                                                @page-change="pageChangeDropdownCustomer($event.page)"></pagination-2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Target Site</label>
                                <select class="form-control input-sm" v-model="targetSiteSelect"
                                    :disabled="modalMode === 'edit' || selectCustomerName === '' || selectCustomerCode === ''">
                                    <option value="null" disabled>-- Select Target Site --</option>
                                    <option v-for="x in targetSiteData" :key="x.value" :value="x"> {{ x.text }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Schedule Date/Time</label>
                                <template>
                                    <input id="schedule-datetime" class="form-control" type="text" />
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="modal-footer">
                    <button v-if="modalMode === 'add'" class="btn btn-success btn-sm" @click="setUpSchedule">
                        Add Schedule
                    </button>

                    <button v-if="modalMode === 'edit'" class="btn btn-warning btn-sm" @click="updateSchedule">
                        Update Schedule
                    </button>

                    <button v-if="modalMode === 'edit'" class="btn btn-danger btn-sm" @click="deleteSchedule">
                        Cancel Task
                    </button>
                </div>

            </template>
        </modal>
    </div>
</template>
<script type="text/javascript">
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
let page = {}
export default {
    name: "ScheduleUpdateSoftware",
    data() {
        return {
            page: page,
            // version dropdown
            selectVersion: "",
            showVersionDropdown: false,
            versionSearchText: "",
            filteredVersions: [],
            paginatedVersions: [],
            currentPageVersions: 1,
            // customer dropdown
            selectCustomerName: "",
            selectCustomerCode: "",
            selectCustomerPreEvent: "",
            showCustomerDropdown: false,
            customerSearchText: "",
            filteredCustomers: [],
            paginatedCustomers: [],
            currentPageCustomers: 1,
            // target site
            targetSiteData: [],
            targetSiteSelect: {
                value: "", // url
                text: "" // type
            },
            // pagination
            itemsPerPage: 10,
            customerData: [],
            servicePath: "",
            fpSchedule: null,
            scheduleDate: '',
            sort_key: '',
            sort_type: 'desc',
            dataTable: [],
            modalMode: 'add', // add | edit
            selectedRow: null,
            controlPanelRight: false,
        }
    },
    methods: {
        validateBeforeSubmit() {
            // 1. Software Version
            if (!this.selectVersion) {
                $msg.alert(`Warning`, "Please select Software Version", `danger`)
                return false;
            }

            // 2. Customer
            if (!this.selectCustomerName || !this.selectCustomerCode) {
                $msg.alert(`Warning`, "Please select Customer", `danger`)
                return false;
            }

            // 3. Target Site
            if (
                !this.targetSiteSelect ||
                !this.targetSiteSelect.value ||
                !this.targetSiteSelect.text
            ) {
                $msg.alert(`Warning`, "Please select Target Site", `danger`)
                return false;
            }

            // 4. Schedule Date/Time
            if (!this.getScheduleDatetime()) {
                $msg.alert(`Warning`, "Please select Schedule Date/Time", `danger`)
                return false;
            }

            return true;
        },
        async setUpSchedule() {
            if (!this.validateBeforeSubmit()) {
                return;
            }
            let appBuild = this.selectVersion.split('/')[1]
            // let url = `Anywhere/Management/ExcuteUpdateProgramHuawei?version=${appBuild}`

            let data = {
                // send for set get token from destination service (ใช้วิธีเดียวกับ function onLoginGateway สำหรับดึง token)
                customer_name: this.selectCustomerName,
                customer_code: this.selectCustomerCode,

                serviceType: this.targetSiteSelect.text,
                servicePath: this.targetSiteSelect.value,
                Query: { is_api: "N" },

                // send for setup parameter update program (ใช้สำหรับตั้งเวลาจริง) -> servicePath, version และ scheduleDate
                version: appBuild,
                scheduleDate: this.scheduleDate,
            };

            console.log(data, "DATA");

            let payloadLog = {
                type: "ScheduleUpdateSoftware",
                schedule_detail: {
                    version: appBuild,
                    scheduleDate: this.getScheduleDatetime(),
                }
            }

            let dataSchedule = {
                index_no: this.dataTable.length + 1,
                job_no: "",
                software_version: this.selectVersion,
                customer_name: this.selectCustomerName,
                customer_code: this.selectCustomerCode,
                target_type: this.targetSiteSelect.text,
                target_path: this.targetSiteSelect.value,
                schedule_date: this.getScheduleDatetime(),
                add_date: new Date().toISOString(),
                edit_date: null,
                status_name: "Pending",
            };
            this.dataTable = [...this.dataTable, dataSchedule];

            console.log(dataSchedule, "dataSchedule");

            let agr = this.$refs.agr;
            agr.setDisplay(this.dataTable);

            // แนะนำเอาไว้เรียกใช้ตอนถึงเวลา อัพเดตจริง
            // const payload = {
            //     form:
            //     {
            //         ServicePath: this.servicePath ?? "",
            //         ServiceEvent: "ScheduleUpdate",
            //         ServiceName: "update_structure",
            //         MangoToken: this.MangoToken, // ใช้ token ที่ได้จากการ login gateway
            //         payload: data,
            //         Log: payloadLog,
            //         maincode: this.maincode,
            //         mainname: this.mainname || "",
            //         typeKey: this.typeKey,
            //         ref_cus_code: this.ref_cus_code,
            //     },
            // };

            // let url = "CSM/Gateway/Dispath";
            // let rspNew = await $xt.postServerJson(url, formData);

            this.$refs.AddScheduleModal.closeModal();
            this.clearModalData();
        },
        updateSchedule() {
            console.log(this.selectedRow, "this.selectedRow");

            if (!this.selectedRow) return;

            const newDate = this.getScheduleDatetime();

            // update data ใน row ที่เลือก
            this.selectedRow.schedule_date = newDate;
            this.selectedRow.edit_date = new Date().toISOString();

            // refresh grid ด้วย dataTable
            this.$refs.agr.setDisplay(this.dataTable);

            this.$refs.AddScheduleModal.closeModal();
        },
        deleteSchedule() {
            if (!this.selectedRow) return;

            this.dataTable = this.dataTable.filter(
                row => row !== this.selectedRow
            );

            this.$refs.agr.setDisplay(this.dataTable);

            this.selectedRow = null;
            this.$refs.AddScheduleModal.closeModal();
        },
        async initTable() {
            let agr = this.$refs.agr;
            let bold_underline = { "font-weight": "bold" };
            let bold_style = (p) => (p?.data?.job_code == 'W' ? bold_underline : p?.data?.task_queued_count > 0 && this.is_mango() ? { "color": "#fd7e14" } : {});

            let fields = [
                ["index_no", "No.", "number", { width: 80, align: "center", sortable: false, cellStyle: bold_style }],
                ["job_no", "CSM No.", "text", {
                    width: 150,
                    align: "left",
                    sortable: true,
                    cellRenderer: (params) => {
                        if (params.value) {
                            // const jobNo = params.value;
                            // const isWaiting = params.data.job_code === 'W';
                            // const displayValue = isWaiting ? `<b>${jobNo}</b>` : jobNo;
                            return "CSM-XXXXXX";
                            // return `<a href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${jobNo}"
                            //         style="cursor: pointer; text-decoration: none; color: #3c8dbc;"
                            //         target="_blank">${displayValue}</a>`;
                        }
                        return "";
                    },
                }],
                ["software_version", "Software Version", "text", {
                    width: 300, align: "left", sortable: true, cellStyle: bold_style
                }, { useCellRenderer: true }],
                ["customer_name", "Customer Name", "text", {
                    flex: 1, minWidth: 200, align: "left", sortable: true, cellStyle: bold_style
                }, { useCellRenderer: true }],
                ["target_type", "Target Path", "text", { width: 150, align: "left", sortable: true, cellStyle: bold_style }, { useCellRenderer: true }],
                ["schedule_date", "Schedule Date", "datetime", { width: 200, align: "center", sortable: true, cellStyle: bold_style }, { useCellRenderer: true }],
                ["add_date", "Add Date", "datetime", { width: 200, align: "center", sortable: true, cellStyle: bold_style }, { useCellRenderer: true }],
                ["edit_date", "Edit Date", "datetime", { width: 200, align: "center", sortable: true, cellStyle: bold_style }, { useCellRenderer: true }],
                ["status_name", "Job Status", "text", {
                    width: 100,
                    align: "center", cellStyle: bold_style,
                    cellRenderer: (params) => {
                        // return `<div class='${class_job}'>${text}</div>`;
                        return "Status"
                    },
                }],
                {
                    headerName: "",
                    field: "action",
                    width: 50,
                    align: "center",
                    sortable: false,
                    hide: !this.controlPanelRight, // 👈 เช็คตรงนี้
                    cellRenderer: (params) => {
                        return `<button class="btn btn-primary btn-sm">Edit</button>`;
                    },
                    onCellClicked: (params) => {
                        this.openEditModal(params.data);
                    }
                }
            ]

            let header = agr.createHeaderFromArray(fields);
            agr.setHeader(header);

            this.grid_header = header;
        },
        async addSchedule() {
            this.modalMode = 'add';
            this.selectedRow = null;

            this.clearModalData();
            this.$refs.AddScheduleModal.openModal();

            this.initFlatpickr();

            await this.loadCustomer();
            await this.loadFolderListVersion();
        },
        async openEditModal(row) {
            this.modalMode = 'edit';
            this.selectedRow = row;

            // set ค่าเข้า form
            this.selectVersion = row.software_version;
            this.selectCustomerName = row.customer_name;
            this.selectCustomerCode = row.customer_code;

            // wait load target site
            await this.loadTargetSite();

            this.targetSiteSelect = this.targetSiteData.find(
                x => x.value === row.target_path
            ) || null;

            console.log(this.targetSiteSelect, "targetSiteSelect");


            this.$refs.AddScheduleModal.openModal();

            this.initFlatpickr(row.schedule_date);
        },
        // load customer data
        async loadCustomer() {

            let url = `CSM/Data/CustomerDataReadList?sort=${this.sort_key}&sort_type=${this.sort_type}&skip=0&take=1000`
            let rsp = await $xt.getServer(url)

            this.customerData = rsp.data;
            this.filteredCustomers = rsp.data;

            this.currentPageCustomers = 1;
        },
        filterCustomers() {
            const searchText = this.customerSearchText.toLowerCase();
            this.filteredCustomers = this.customerData.filter(customer => customer.customer_name.toLowerCase().includes(searchText));
            this.currentPageCustomers = 1;

            console.log('Filtering customers:', {
                searchText,
                totalCustomers: this.customerData.length,
                filteredCustomers: this.filteredCustomers.length
            });

            // Initialize pagination after filtering
            this.$nextTick(() => {
                this.initializePaginationCustomer();
            });
        },
        updatePaginatedCustomers() {
            console.log(this.filteredCustomers, "this.filteredCustomers");

            const startIndex = (this.currentPageCustomers - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            this.paginatedCustomers = this.filteredCustomers.slice(startIndex, endIndex);
        },
        pageChangeDropdownCustomer(pn) {
            pn = pn || 1;
            this.currentPageCustomers = pn;
            this.updatePaginatedCustomers();
        },
        async selectCustomerItem(customer) {
            this.selectCustomerName = customer.customer_name;
            this.selectCustomerCode = customer.customer_code;
            this.selectCustomerPreEvent = customer.pre_event;
            this.showCustomerDropdown = false;
            // this.customerSearchText = '';

            console.log(this.selectCustomerCode, "selectCustomerCode");
            await this.loadTargetSite();

        },
        initializePaginationCustomer() {
            if (this.filteredCustomers.length > 0) {
                this.updatePaginatedCustomers();
                // Initialize dropdown pagination
                this.$nextTick(() => {
                    if (this.$refs.dropdownPagingCustomer) {
                        this.$refs.dropdownPagingCustomer.setTotalItems(this.filteredCustomers.length);
                        this.$refs.dropdownPagingCustomer.setItemsPerPage(this.itemsPerPage);
                        this.$refs.dropdownPagingCustomer.setCurrentPage(1);
                    }
                });
            }
        },
        toggleCustomerDropdown() {
            this.showCustomerDropdown = !this.showCustomerDropdown;
            // Initialize pagination when dropdown is shown
            if (this.showCustomerDropdown) {
                this.$nextTick(() => {
                    this.initializePaginationCustomer();
                });
            }
        },

        // load version data
        async loadFolderListVersion() {
            try {
                let url = `Anywhere/Management/GetListUpdateProgramHuawei`
                let { folder } = await $xt.getServer(url)
                this.$set(this, 'namesList', folder)

                // Initialize filtered versions
                this.filteredVersions = [...folder];
                this.currentPageVersions = 1;

                // Initialize pagination after data is loaded
                this.$nextTick(() => {
                    this.initializePaginationVersion();
                });
            }
            catch (ex) {
                $msg.alert(`Warning`, ex.toString(), `danger`)
            }
        },
        filterVersions() {
            const searchText = this.versionSearchText.toLowerCase();
            this.filteredVersions = this.namesList.filter(version => version.toLowerCase().includes(searchText));
            this.currentPageVersions = 1;

            console.log('Filtering versions:', {
                searchText,
                totalVersions: this.namesList.length,
                filteredVersions: this.filteredVersions.length
            });

            // Initialize pagination after filtering
            this.$nextTick(() => {
                this.initializePaginationVersion();
            });
        },
        updatePaginatedVersions() {
            const startIndex = (this.currentPageVersions - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            this.paginatedVersions = this.filteredVersions.slice(startIndex, endIndex);
        },
        pageChangeDropdownVersion(pn) {
            pn = pn || 1;
            this.currentPageVersions = pn;
            this.updatePaginatedVersions();
        },
        async selectVersionItem(version) {
            this.selectVersion = version;
            this.showVersionDropdown = false;
            // this.versionSearchText = '';
        },
        initializePaginationVersion() {
            if (this.filteredVersions.length > 0) {
                this.updatePaginatedVersions();
                // Initialize dropdown pagination
                this.$nextTick(() => {
                    if (this.$refs.dropdownPagingVersion) {
                        this.$refs.dropdownPagingVersion.setTotalItems(this.filteredVersions.length);
                        this.$refs.dropdownPagingVersion.setItemsPerPage(this.itemsPerPage);
                        this.$refs.dropdownPagingVersion.setCurrentPage(1);
                    }
                });
            }
        },
        toggleVersionDropdown() {
            this.showVersionDropdown = !this.showVersionDropdown;
            // Initialize pagination when dropdown is shown
            if (this.showVersionDropdown) {
                this.$nextTick(() => {
                    this.initializePaginationVersion();
                });
            }
        },

        // load target site data
        async loadTargetSite() {
            this.targetSiteData = [];
            this.targetSiteSelect =
            {
                value: "",
                text: ""
            };

            let url = `CSM/Data/CustomerDataViewRead?customer_code=${this.selectCustomerCode}&pre_event=${this.selectCustomerPreEvent}`;
            let rsp = await $xt.getServer(url);

            if (rsp.data) {
                const pickKeys = {
                    app_path_prod: 'Production',
                    app_path_demo: 'Demo'
                };

                const targetSiteData = Object.entries(pickKeys)
                    .filter(([key]) => rsp.data[key])
                    .map(([key, label]) => ({
                        value: rsp.data[key],
                        text: label
                    }));

                this.$set(this, 'targetSiteData', targetSiteData);
            }
        },

        // clear modal data
        clearModalData() {
            this.selectVersion = "";
            this.versionSearchText = "";
            this.filteredVersions = [];
            this.paginatedVersions = [];
            this.currentPageVersions = 1;

            this.selectCustomerName = "";
            this.selectCustomerCode = "";
            this.selectCustomerPreEvent = "";
            this.customerSearchText = "";
            this.filteredCustomers = [];
            this.paginatedCustomers = [];
            this.currentPageCustomers = 1;

            this.targetSiteData = [];
            this.targetSiteSelect = "";

            this.scheduleDate = '';
            this.fpSchedule = null;
            flatpickr("#schedule-datetime").clear();
        },
        onClose() {
            this.$refs.AddScheduleModal.closeModal();
            this.clearModalData();
        },

        initFlatpickr(defaultDate = null) {
            this.$nextTick(() => {
                if (this.fpSchedule) {
                    // ถ้ามีอยู่แล้ว → set ค่าใหม่
                    this.fpSchedule.setDate(defaultDate || null, true);
                    return;
                }

                this.fpSchedule = flatpickr('#schedule-datetime', {
                    enableTime: true,
                    time_24hr: true,
                    dateFormat: 'Y-m-d H:i',
                    defaultDate: defaultDate,
                    allowInput: true,
                    onChange: (selectedDates, dateStr) => {
                        this.scheduleDate = dateStr;
                    }
                });
            });
        },
        getScheduleDatetime() {
            return this.fpSchedule
                ? this.fpSchedule.input.value
                : '';
        }
    },
    async mounted() {
        this.controlPanelRight = $linq(window.userRight).any(x => x.module == "CSM" && x.menu_name == "CSM_WEB" && x.menu_id == "60000")

        page = this.$refs.page
        page.pageTitle = "ERP : Schedule Update Software"
        document.title = page.pageTitle
        window.page = page

        // await this.loadCustomer();
        // await this.loadFolderListVersion();
    }
}

</script>
<style>
.dropdown-content {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 0 0 4px 4px;
}

.dropdown-content input[type="text"] {
    border: none;
    border-bottom: 1px solid #eee;
    border-radius: 0;
}

.dropdown-content input[type="text"]:focus {
    outline: none;
    border-bottom-color: #007bff;
    box-shadow: none;
}

/* .overflow-visible {
    overflow: visible !important;
    overflow-y: visible !important;
} */
.modal-body {
    overflow: visible !important;
    overflow-y: visible !important;
}
</style>