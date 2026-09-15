<template>
    <div class="cx-page">
        <customer-page ref="page">
            <template #body>
                <!-- Header -->
                <div class="cx-toolbar">
                    <div class="cx-toolbar__title">
                        <i class="fas fa-comment-dots"></i>
                        <span>ข้อเสนอแนะการใช้งาน</span>
                    </div>
                    <div class="cx-toolbar__right">
                        <span class="cx-chip cx-chip--hint"><i class="fas fa-lightbulb"></i> เลือกโมดูล แล้วเลือกเมนูที่ต้องการเสนอแนะ</span>
                        <div class="cx-field cx-field--inline">
                            <label>โมดูล</label>
                            <select class="form-control" v-model="form.module" @change="onChangeModule()">
                                <option v-for="x in moduleCodeData" v-text="x"></option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Menu list -->
                <div class="box box-solid">
                    <div class="box-body">
                        <div class="nav-tabs-custom">
                            <ul class="nav nav-tabs">
                                <li :class="{active: x.id===tabActive}" v-for="x in tabField" v-if="x.show">
                                    <a href="#" @click.prevent="onTabChange(x.id) "><i class="fas" :class="xt.isEmpty(x.icon) ? 'fa-circle' : x.icon"></i><span v-text="x.text"></span></a>
                                </li>
                            </ul>
                            <div class="tab-content">
                                <div class="tab-pane active">
                                    <div class="cx-table-wrap">
                                        <div class="cx-tblscroll">
                                            <table class="table cx-table cx-table--sticky">
                                                <thead>
                                                    <tr>
                                                        <th class="tf-3 text-center">รหัสเมนู</th>
                                                        <th>ชื่อเมนู</th>
                                                        <th class="tf-3 text-center">ความคิดเห็น</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="x,idx in menuData">
                                                        <td align="center"><span class="cx-docno">{{x.menu_id}}</span></td>
                                                        <td align="left" class="cx-subject">{{x.display}}</td>
                                                        <td align="center">
                                                            <button class="cx-btn cx-btn--soft" @click.prevent="openComment(x)"><i class="far fa-comments"></i> ความคิดเห็น</button>
                                                        </td>
                                                    </tr>
                                                    <tr v-if="!menuData.length">
                                                        <td colspan="3" class="cx-empty"><i class="fas fa-inbox"></i> ไม่พบรายการเมนูในโมดูลนี้</td>
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
            </template>
        </customer-page>

        <!-- Modal : comment -->
        <modal ref="cmtModal">
            <template #header>
                <h4 class="modal-title"><i class="far fa-comments"></i> ความคิดเห็นต่อเมนู</h4>
            </template>
            <template #body>
                <div class="cx-modal">
                    <div class="cx-cmt-head">
                        <span class="cx-cmt-head__code">{{cmtRow.menu_id}}</span>
                        <div class="cx-cmt-head__body">
                            <span class="cx-cmt-head__name">{{cmtRow.display}}</span>
                            <span class="cx-cmt-head__sub">
                                <b>Module {{cmtRow.module}}</b>
                                <template v-if="cmtMenu.menu_text_e">&middot; {{cmtMenu.menu_text_e}}</template>
                            </span>
                        </div>
                    </div>

                    <div class="cx-cmt-box">
                        <textarea class="form-control" v-model="cmtText" placeholder="พิมพ์ความคิดเห็นหรือข้อเสนอแนะ.."></textarea>
                        <div class="cx-cmt-actions">
                            <button class="cx-btn cx-btn--primary" @click.prevent="sendComment()"><i class="fa fa-paper-plane"></i> ส่งความคิดเห็น</button>
                        </div>
                    </div>

                    <div class="cx-cmt-sub">
                        <i class="far fa-comments"></i> ความคิดเห็นทั้งหมด
                        <span class="cx-cmt-sub__n">{{cmtList.length}}</span>
                    </div>

                    <div class="cx-cmt-list">
                        <div class="cx-bubble" v-for="x in cmtList">
                            <div class="cx-bubble__head">
                                <span class="cx-bubble__who"><i class="fas fa-user-edit"></i> {{x.customer_name}}</span>
                                <span class="cx-bubble__time" v-if="x.add_dt"><i class="far fa-clock"></i> {{$date(x.add_dt, 'DD/MM/YYYY HH:mm')}}</span>
                            </div>
                            <span class="cx-bubble__text" v-if="!x.editMode">{{x.description}}</span>
                            <textarea v-if="x.editMode" class="form-control" rows="3" v-model.trim="x.description"></textarea>
                            <div class="cx-bubble__tools">
                                <a class="pointer" v-if="!x.editMode" @click.prevent="setEdit(x)"><i class="fas fa-pen"></i> แก้ไข</a>
                                <a class="pointer" v-if="x.editMode" @click.prevent="saveComment(x)"><i class="fas fa-check"></i> บันทึก</a>
                                <a class="pointer is-danger" @click.prevent="delComment(x)"><i class="fas fa-trash-alt"></i> ลบ</a>
                            </div>
                        </div>
                        <div class="cx-empty" v-if="!cmtList.length"><i class="far fa-comment-dots"></i> ยังไม่มีความคิดเห็นสำหรับเมนูนี้</div>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="cx-modal cx-modal-foot">
                    <button class="cx-btn cx-btn--ghost" @click.prevent="$refs.cmtModal.closeModal()"><i class="fas fa-times"></i> ปิดหน้าต่าง</button>
                </div>
            </template>
        </modal>
    </div>
</template>
<script type="text/javascript">

    // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
    let page = { loadingBox: { show() {}, hide() {} } };
    let paging = {};
    let cpn = {
        data() {
            return {
                baseUrl,
                baseRoute,
                queryString,
                ui: window.ui,
                xt: $xt,
                tabField: [
                    { id: 0, icon: '', text: ' การติดต่อทางธุรกิจ', show: true, icon: "fa fa-pencil-square-o" },
                    { id: 1, icon: '', text: ' มาสเตอร์', show: true, icon: "fa fa-address-book" },
                    { id: 2, icon: '', text: ' แบบบันทึกรายงาน', show: true, icon: "fa fa-file-text" },
                ],
                tabActive: 0,
           moduleCodeData: [
                        'ACL',
                        'AP',
                        'AR',
                        'BD',
                        'BI',
                        'CSM',
                        'DC',
                        'EMAIL',
                        'EVAL',
                        'FA',
                        'FIN',
                        'GL',
                        'HR',
                        'IC',
                        'MA',
                        'Master',
                        'MEMO',
                        'MRP',
                        'OF',
                        'OS',
                        'OTHER',
                        'PM',
                        'PN',
                        'PO',
                        'PS',
                        'QCC',
                        'RE',
                        'REAFS',
                        'REMEM',
                        'REPM',
                        'REWEB',
                        'RRE',
                        'RT',
                        'SCT',
                        'SE',
                        'TKB',
                        'TS',
                        ''
                    ],
                form: {},
                menuData: [],
                cmtRow: {},
                cmtMenu: {},
                cmtList: [],
                cmtText: '',
            };
        },
        methods: {
            onTabChange(t) {
                this.tabActive = t;
                this.loadMenu();
            },
            async loadMenu() {
                let trn = `CSM/CustomerData/ExternalMenuReadList?module=${this.form.module}&tabSelected=${this.tabActive}`;
                let rsp = await $xt.getCustomerServer(trn);
                this.menuData = rsp.data;
            },
            onChangeModule() {
                this.tabActive = 0;
                this.loadMenu();
            },
            async openComment(x) {
                this.cmtRow = x;
                this.cmtMenu = {};
                this.cmtList = [];
                this.cmtText = '';
                this.$refs.cmtModal.openModal();
                await this.loadComment();
            },
            async loadComment() {
                try {
                    let url = `CSM/CustomerData/ExternalModuleReadList?module=${this.cmtRow.module}&menu_id=${this.cmtRow.menu_id}`;
                    let rsp = await $xt.getCustomerServer(url);
                    $linq(rsp.data).foreach(x => {
                        x.editMode = false;
                    });
                    this.cmtList = rsp.data;
                    this.cmtMenu = rsp.menu || {};
                } catch (ex) {
                    $msg.alert(``, ex.toString(), `danger`);
                }
            },
            async sendComment() {
                if ($xt.isEmpty(this.cmtText)) {
                    $msg.alert(``, `กรุณากรอกความคิดเห็น`, `danger`);
                    return;
                }
                try {
                    let comment = {
                        module: this.cmtRow.module,
                        menu_id: this.cmtRow.menu_id,
                        itemno: null,
                        description: this.cmtText || '',
                    };
                    let f = {
                        comment: comment
                    };
                    let url = `CSM/CustomerData/ExternalModuleComment`;
                    let rsp = await $xt.postCustomerJson(url, f);
                    if (!rsp.success) {
                        throw rsp.error;
                    }
                    this.cmtText = '';
                    await this.loadComment();
                } catch (ex) {
                    $msg.alert(``, ex.toString(), `danger`);
                }
            },
            setEdit(x) {
                x.editMode = !x.editMode;
            },
            async saveComment(x) {
                try {
                    let comment = {
                        module: this.cmtRow.module,
                        menu_id: this.cmtRow.menu_id,
                        itemno: x.itemno,
                        description: x.description,
                    };
                    let f = {
                        comment: comment
                    };
                    let url = `CSM/CustomerData/ExternalModuleComment`;
                    let rsp = await $xt.postCustomerJson(url, f);
                    if (!rsp.success) {
                        throw rsp.error;
                    }
                    await this.loadComment();
                } catch (ex) {
                    $msg.alert(``, ex.toString(), `danger`);
                }
            },
            async delComment(x) {
                if (!await $msg.confirm(`คุณต้องการลบ Comment นี้ใช่หรือไม่ โปรดยืนยันข้อมูลก่อนทำรายการดังกล่าว`)) {
                    return;
                }
                try {
                    let f = {
                        comment: x
                    };
                    let act = `CSM/CustomerData/Ext_DeleteCommentCustomer`;
                    let rsp = await $xt.postCustomerJson(act, f);
                    if (!rsp.success) {
                        throw rsp.error;
                    }
                    $notify.success(this.ui.alert_delete_success);
                    await this.loadComment();
                } catch (ex) {
                    $msg.alert(``, ex.toString(), `danger`);
                }
            },
        },
        mounted() {
            page = this.$refs.page;
            page.pageTitle = 'Request';
            document.title = page.pageTitle;

            this.$refs.cmtModal.setSize("modal-lg");

            this.form.module = $linq(this.moduleCodeData).select(x => x).firstOrDefault();
            this.onTabChange(0);
        }
    };
    export default cpn;
</script>
