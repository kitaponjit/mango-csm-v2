<template>
    <div>
        <re-page ref="page">
            <template #body>
                <app-form-2 ref="appForm" :exportData_header="onSetup_beforeExport('header')"
                    :exportData="onSetup_beforeExport('detail')" exportName="RequestType" exportSelect="B"
                    exportUrl="csm/master/QCItem_ExportExcel">
                    <template #form-detail>
                        <div class="box box-solid">
                            <div class="box-body with-border">
                                <div class="row">
                                    <div class="col margin-t-10 margin-r-20">
                                        <b class="pull-right" v-show="this.total">(จำนวนข้อมูลทั้งหมด &nbsp {{ this.total }} &nbsp รายการ)</b>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12 col-sm-12 col-xs-12">
                                        <span class="text-danger" style="font-size: 14px;"><b>* ดับเบิ้ลคลิกที่ช่อง Description หรือ ช่อง Remark เพื่อแก้ไขข้อมูล (* Double-click the Description or Remark field to edit the information.
)</b></span>
                                        <ag-table ref="agr"
                                                  :footer="false"
                                                  :sorting="true"
                                                  @cell-clicked="onCellClicked"
                                                  @ready="initTable()">
                                        </ag-table>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12 col-sm-12 col-xs-12">
                                        <pagination class="pull-left" ref="paging"
                                            @page-change="pageChange($event.page)">
                                        </pagination>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </app-form-2>
                <input type="file" ref="File" accept=".xls, .xlsx" v-show="false" />
            </template>
        </re-page>
    </div>
</template>
<script>
import XLSX from 'xlsx';
let paging = {};
// no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
let page = { loadingBox: { show() {}, hide() {} } };
let appForm = {};
export default {
    data() {
        return {
            displayData: [],
            pageNumber: 1,
            main_data: [],
            total: "",
        }
    },
    methods: {
        initTable() {
            let agr = this.$refs.agr;
            let fields = [
                ["itemno", "No.", "text", { width: 100, align: "center" }],
                ["action", "Action", "text", { width: 120, align: "center", cellRenderer: () => `<a class="text-danger"><i class="far fa-trash-alt"></i></a>` }],
                ["itemname", "Description", "text", { flex: 2, editable: true }],
                ["remark", "Remark", "text", { flex: 1, editable: true }],
                ["adddate", "Add Date", "datetime", { width: 180, align: "center" }, { useCellRenderer: true }],
            ];
            let header = agr.createHeaderFromArray(fields);
            agr.setHeader(header);
            agr.setDisplay(this.displayData);

            // Sync edited cell value back to main_data
            agr.topGridOptions.onCellValueChanged = (params) => {
                let field = params.colDef.field;
                let newValue = params.newValue;
                let itemno = params.data.itemno;
                let item = $linq(this.main_data).where(x => x.itemno == itemno).firstOrDefault();
                if (item) {
                    item[field] = newValue;
                }
            };
        },
        async loadData() {
            let act = `CSM/Master/QCItem_ReadList`;
            let rsp = await $xt.getServer(act);
            this.main_data = rsp;
            this.total = this.main_data.length;

            let i = 0;
            $linq(this.main_data).foreach(x => {
                x.item = ++i;
            });

            paging.setTotalItems(this.total);
            this.pageChange(this.pageNumber);
            if (!paging.getItemsPerPage()) {
                paging.setCurrentPage(1);
            }
            paging.createPagesArray();
        },
        pageChange(pn) {
            pn = pn || 1;
            this.pageNumber = pn;
            paging.setCurrentPage(pn);
            this.displayData = $linq(this.main_data).skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray();
            paging.createPagesArray();
            if (this.$refs.agr) {
                this.$refs.agr.setDisplay(this.displayData);
            }
        },
        appendRow() {
            let itemno = this.main_data.length == 0 ? 1 : $linq(this.main_data).max(x => x.itemno) + 1;
            let line_number = this.main_data.length == 0 ? 1 : $linq(this.main_data).max(x => x.line_number) + 1;
            this.main_data.push({
                itemno: itemno,
                line_number: line_number,
                itemname: null,
                remark: null,
                adddate: new Date(),
            });
            paging.setTotalItems(this.main_data.length);
            this.pageChange(paging.getTotalPages());
        },
        async spliceRow(e) {
            if (e.itemname && !await $msg.confirm(`คุณต้องการลบข้อมูล : ${e.itemno} นี้ ใช่หรือไม่`)) {
                return;
            }

            this.main_data = $linq(this.main_data).where(x => !(x.itemno == e.itemno)).toArray();
            paging.setTotalItems(this.main_data.length);

            if (this.pageNumber > paging.getTotalPages()) {
                this.pageNumber = paging.getTotalPages();
            }
            this.pageChange(this.pageNumber);
        },
        onCellClicked(event) {
            if (event.col === 'action') {
                this.spliceRow(event.data);
            }
        },
        async saveClick() {
            try {
                for (let item of this.main_data) {
                    if (!item.remark || !item.itemname) {
                        $msg.alert(`Warning`, "Description is not Null", `warning`);
                        return;
                    }
                }
                let f = {
                    item: this.main_data
                };
                page.loadingBox.show();
                let act = `CSM/Master/QCItem_Create`;
                let rsp = await $xt.postServerJson(act, f);
                if (!rsp.success) {
                    throw rsp.error;
                }
                await this.loadData();
            } catch (ex) {
                $msg.alert(``, ex.toString(), `danger`);
            } finally {
                page.loadingBox.hide();
            }
        },
        onExport() {
            let inExcel = [];
            if (this.main_data.length > 0) {
                $linq(this.main_data).foreach(x => {
                    inExcel.push({
                        'itemno': x.itemno,
                        'itemname': x.itemname,
                        'remark': x.remark,
                    })
                });
            } else {
                inExcel.push({
                    'itemno': "",
                    'itemname': "",
                    'remark': "",
                })
            }
            var dataWS = XLSX.utils.json_to_sheet(inExcel);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, dataWS);
            XLSX.writeFile(wb, 'QCItem.xlsx');
        },
        onSetup_beforeExport(keyword) {
            switch (keyword) {
                case "header":
                    let header = [
                        { header: 'Itemno', key: 'itemno', fill: { type: 'pattern', pattern: 'none', fgColor: { argb: 'ffffffff' }, bgColor: { argb: '00000000' } } },
                        { header: 'Itemname', key: 'itemname', fill: { type: 'pattern', pattern: 'none', fgColor: { argb: 'ffffffff' }, bgColor: { argb: '00000000' } }, width: 100 },
                        { header: 'Remark', key: 'remark', fill: { type: 'pattern', pattern: 'none', fgColor: { argb: 'ffffffff' }, bgColor: { argb: '00000000' } } }
                    ];
                    return header
                case "detail":
                    let detail = []
                    this.main_data.forEach(x => {
                        detail.push({
                            'itemno': x.itemno,
                            'itemname': x.itemname,
                            'remark': x.remark,
                        })
                    })
                    return detail
            }
        },
    },
    mounted() {
        page = this.$refs.page;
        page.pageTitle = 'Setup : ตั้งค่าคำถามการประเมิน';
        document.title = page.pageTitle;

        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(10);

        this.loadData();

        appForm = this.$refs.appForm;
        appForm.btnDelete.show = false;
        appForm.btnSave.show = true;
        appForm.btnSave.click = this.saveClick;
        appForm.btnNew.click = this.appendRow;
        appForm.btnImport.show = false;
        appForm.btnImport_center.show = true;
        appForm.btnImport_center.click = this.loadData;
        appForm.btnImport_center.url = "CSM/Master/QCItem_Import";
    }
}
</script>
<style scoped></style>
