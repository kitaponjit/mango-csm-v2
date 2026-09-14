<template>
    <div class="row">
        <div class="col-md-12 col-sm-12 col-xs-12">
            <ag-table ref="agr"
                      :scale="400"
                      :footer="false"
                      @ready="initTable()"
                      :saveColumns="'N'"
                      :doctype="'APPROVESTATUS'"
                      :page_name="'edit_approve_status'"></ag-table>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        approveTab: Function,
        formData: Object
    },
    data() {
        return {}
    },
    methods: {
        async initTable() {
            let agr = this.$refs.agr;
            if (!agr) return;

            let self = this;

            let fields = [
                ["empno", "Emp No.", "text", { width: 150, align: "center", sortable: true }],
                ["empname", "Emp Name", "text", { width: 240, align: "left", sortable: true }],
                ["fr_proj_type", "text", "text", {
                    width: 240,
                    align: "left",
                    sortable: true,
                    headerName: self.formData && self.formData['pre_event'] ? 'Project Position' : 'Department Position',
                }],
                ["levelapp", "Level App", "text", { width: 180, align: "center", sortable: true }],
                ["status", "Approve Status", "text", {
                    width: 200,
                    align: "center",
                    sortable: true,
                    cellRenderer: (params) => {
                        let value = params.value;
                        if (value == 'Y') return `<span class="label label-success" style="font-size:12px">อนุมัติเรียบร้อย</span>`;
                        if (value == 'C') return `<span class="label label-danger" style="font-size:12px">ไม่อนุมัติ</span>`;
                        if (value == 'N') return `<span class="label label-primary" style="font-size:12px">รอการอนุมัติ</span>`;
                        return '';
                    }
                }],
                ["appdatetime", "Approve Date", "datetime", { width: 180, align: "center", sortable: true }, { useCellRenderer: true }],
                ["remark_cancel", "Remark", "text", {
                    width: 320,
                    align: "left",
                    sortable: true,
                    cellRenderer: (params) => {
                        let x = params.data;
                        return x.status === 'C' ? (x.remark_cancel || '') : '';
                    }
                }],
            ];

            let header = agr.createHeaderFromArray(fields);
            agr.setHeader(header);

            // Load data from parent function
            let data = this.approveTab ? this.approveTab() : [];

            // Wait for next tick to ensure grid API is ready after header is set
            await this.$nextTick();
            try {
                agr.setDisplay(data || []);
            } catch (e) {
                // Grid API not ready yet, retry after short delay
                setTimeout(() => {
                    try { agr.setDisplay(data || []); } catch (ex) {}
                }, 200);
            }
        },
        refresh() {
            this.initTable();
        },
    },
    watch: {
        formData: {
            deep: true,
            handler() {
                this.$nextTick(() => {
                    this.initTable();
                });
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.initTable();
        });
    }
}
</script>
