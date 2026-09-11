<template>
    <div class="row">
        <div class="col-lg-8 col-md-10 col-sm-12">
            <div class="box box-solid box-default">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-paper-plane-o margin-r-5"></i>ประวัติการส่งงาน</h3>
                </div>
                <div class="box-body no-padding">
                    <table class="table table-bordered table-striped table-hover table-modern">
                        <thead>
                            <tr>
                            <th style="width:180px">Date/Time</th>
                            <th style="width:100px">Ref. Item</th>
                            <th style="width:180px">From</th>
                            <th style="width:180px">To</th>
                            <th>By</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(x, idx) in assignmentData" :key="idx">
                            <td>{{x.add_dt|date('DD/MM/YYYY HH:mm:ss')}}</td>
                            <td>{{x.ref_itemno || 0}}</td>
                            <td>
                                {{x.req_emp_name}}
                            </td>
                            <td>{{x.assign_emp_name}}</td>
                            <td>{{x.add_user_name}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<script type="text/javascript">
export default{
    props:{
        // assignmentData:Array
        queryString: Object,
    },
    data() {
        return {
            assignmentData: [],
        }
    },
    methods: {
        async loadAssignment() {
          let act = `csm/data/CSM_Read_Assignment?job_no=${encodeURIComponent(this.queryString.job_no || '')}`
          let rsp = await $xt.getServer(act)
          this.assignmentData = rsp.data
          this.$emit('assignmentDataLoaded', this.assignmentData)
        },
    },
    mounted() {
        this.loadAssignment()
    }
}
</script>
