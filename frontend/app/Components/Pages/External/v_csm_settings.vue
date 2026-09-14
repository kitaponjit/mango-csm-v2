<template>
    <div class="cx-page">
        <customer-page ref="page">
            <template slot="body">
                <div class="cx-hero">
                    <span class="cx-hero__icon"><i class="fas fa-user-cog"></i></span>
                    <div class="cx-hero__body">
                        <h2 class="cx-hero__title">Setting</h2>
                        <p class="cx-hero__sub">ตั้งค่าอีเมลสำหรับรับการแจ้งเตือนสถานะงานบริการ</p>
                    </div>
                    <span class="cx-chip"><i class="fas fa-envelope"></i> {{displayData.length}} / 2 อีเมล</span>
                </div>
                <!--Tab Data-->
                <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12">
                        <div class="box box-solid">
                            <div class="box-body">
                                <div class="nav-tabs-custom">
                                    <ul class="nav nav-tabs">
                                        <li :class="{active: x.id===tabActive}" v-for="x in tabField" v-if="x.show">
                                            <a href="#" @click.prevent="onTabChange(x.id)"><i class="fas" :class="xt.isEmpty(x.icon) ? 'fa-circle' : x.icon"></i> <span v-text="x.text"></span></a>
                                        </li>
                                    </ul>
                                    <div class="tab-content">
                                        <div class="tab-pane" :class="{active: tabActive===0}">
                                            <div class="cx-head">
                                                <div class="cx-head__title">
                                                    <i class="fas fa-bell"></i>
                                                    <span>อีเมลรับการแจ้งเตือน</span>
                                                </div>
                                                <button class="cx-btn cx-btn--primary" v-on:click="addEmail">
                                                    <i class="fa fa-plus"></i> Add
                                                </button>
                                            </div>

                                            <div class="cx-table-wrap">
                                                <div class="table-responsive">
                                                    <table class="table cx-table">
                                                        <thead>
                                                            <tr>
                                                                <th class="tf-2 text-center">No.</th>
                                                                <th>Email</th>
                                                                <th class="tf-2-5 text-center">Active</th>
                                                                <th class="tf-2-5 text-center">Manage</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr v-for="x,idx in displayData ">
                                                                <td align="center">{{idx+1}}</td>
                                                                <td align="left" class="cx-subject">{{x.email}}</td>
                                                                <td align="center">
                                                                    <span class="cx-yes" v-show="x.active=='Y'">Yes</span>
                                                                    <span class="cx-no" v-show="x.active=='N'|| x.active==Null">No</span>
                                                                </td>
                                                                <td align="center">
                                                                    <button class="cx-icon-btn cx-icon-btn--edit" v-on:click="editEmail(x)" title="แก้ไข"><i class="fas fa-edit"></i></button>
                                                                    <button class="cx-icon-btn cx-icon-btn--del" v-on:click="delEmail(x)" title="ลบ"><i class="fas fa-trash-alt"></i></button>
                                                                </td>
                                                            </tr>
                                                            <tr v-if="!displayData.length">
                                                                <td colspan="4" class="cx-empty"><i class="fas fa-envelope-open"></i> ยังไม่ได้ตั้งค่าอีเมล</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div class="cx-note">
                                                <i class="fas fa-info-circle"></i>
                                                <div>
                                                    <p><b>หมายเหตุ:</b> การตั้งค่า Email นี้เป็นการตั้งค่าเพื่อเปิดการใช้งานการแจ้งเตือนผ่าน Email ในกรณีที่ท่านได้แจ้งปัญหาเกี่ยวกับการใช้งาน MangoAnywhere และทางเราได้รับเรื่องและบันทึกเข้าในระบบ</p>
                                                    <p>เมื่อปัญหานั้นได้ถูกแก้ไขเรียบร้อยแล้ว ทางระบบจะแจ้งเตือนรายละเอียดเพิ่มเติมไปยัง Email ที่ท่านได้ระบุไว้ข้างต้น</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </customer-page>
        <div class="modal fade" id="addEmailModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-envelope"></i> {{isEdit ? 'Edit Email' : 'Add Email'}}</h5>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label for="">Email</label>
                                    <input type="email" class="form-control" v-model.trim="formData['email']" placeholder="Enter your email">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label for="">Active</label>
                                    <div>
                                        <input type="checkbox" v-model.trim="formData['active']" true-value="Y" false-value="N">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" v-on:click="saveEmail()">Save Email</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script type="text/javascript">

    let page = {};
    let cpn = {
        data() {
            return {
                baseUrl,
                baseRoute,
                queryString,
                ui: window.ui,
                xt: $xt,
                displayData: [],
                displayPage: 0,
                formData: {},
                total: 0,
                /* Start Example Tab */
                tabField: [
                    { id: 0, icon: '', text: 'Email', show: true, icon: "fa fa-envelope" },
                ],
                tabActive: 0,

            };
        },
        methods: {
            onTabChange(t) {
                this.tabActive = t;
            },
            async loadDisplay() {
                let act = `CSM/CustomerData/EmailReadList`;
                let rsp = await $xt.getCustomerServer(act);
                this.displayData = rsp.data;
            },
            addEmail() {
                if (this.displayData.length >= 2) {
                    $alert('คำเตือน', 'ท่านได้เพิ่ม Email ครบจำนวน 2 Email แล้ว หากต้องการเปลี่ยนแปลง Email กรุณาเลือก Edit รายการ Email ที่ต้องการแก้ไข', 'danger')
                    return;
                }
                $('#addEmailModal').modal('show');
                this.formData = {};
            },
            editEmail(x) {
                $('#addEmailModal').modal('show');
                this.isEdit = true;
                this.formData = JSON.parse(JSON.stringify(x));
            },
            async saveEmail() {
                try {
                    let f = {
                        data: this.formData
                    };
                    let url = `CSM/CustomerData/EmailCreate`;

                    let rsp = await $xt.postCustomerJson(url, f);
                    if (!rsp.success) {
                        throw rsp.error;
                    }
                    $msg.alert(``, `Success`, `success`);
                    $('#addEmailModal').modal('hide');
                    await this.loadDisplay();
                } catch (ex) {
                    $msg.alert(``, ex.toString(), `danger`);
                } finally {
                    
                }
                //console.log(this.formData);
            },
            async readEmail(x) {
                let act = `CSM/CustomerData/EmailRead?itemno=${encodeURIComponent(x.itemno || '')}`;
                let rsp = await $xt.getServer(act);
                this.formData = rsp.data;
            },
            async delEmail(x) {
                this.formData = JSON.parse(JSON.stringify(x));
                if (!await $msg.confirm(`ต้องการลบข้อมูลใช่หรือไม่`)) {
                    return;
                }
                try {
                    let f = {
                        data: this.formData
                    };
                    let act = `CSM/CustomerData/Email_Delete`;
                    let rsp = await $xt.postCustomerJson(act, f);
                    if (!rsp.success) {
                        throw rsp.error;
                    }
                    $msg.alert(``, `Success`, `success`);
                    await this.loadDisplay();
                } catch (ex) {
                    $msg.alert(``, ex.toString(), `danger`);
                } finally {
                }
            },
        },
        mounted() {
            page = this.$refs.page;
            page.pageTitle = 'Settings';
            document.title = page.pageTitle;

            this.loadDisplay();

        }
    };
    export default cpn;
</script>
