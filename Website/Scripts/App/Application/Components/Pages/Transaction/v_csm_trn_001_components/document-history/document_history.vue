<template>
    <div class="row">
        <div class="col-lg-8 col-md-10 col-sm-12">
            <div class="box box-solid box-default">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-history margin-r-5"></i>ประวัติเอกสาร</h3>
                </div>
                <div class="box-body no-padding">
                    <table class="table table-bordered table-striped table-hover table-modern">
                        <thead>
                            <tr>
                            <th style="width:180px">Date/Time</th>
                            <th style="width:180px">Operation</th>
                            <th style="width:180px">User</th>
                            <th>Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(x, idx) in csmHistotyData" :key="idx">
                            <td>{{x.edit_dt|date('DD/MM/YYYY HH:mm:ss')}}</td>
                            <td>
                              <span v-if="x.edit_type=='H'">Hold</span>
                              <span v-if="x.edit_type=='C'">Open</span>
                              <span v-if="x.edit_type=='U'">Update</span>
                              <span v-if="x.edit_type=='D'">Delete</span>
                              <span v-if="x.edit_type=='A'">Approve</span>
                              <span v-if="x.edit_type=='X'">Change Requestor</span>
                            </td>
                            <td>{{x.edit_user}}</td>
                            <td>{{x.remark}}</td>
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
        // csmHistotyData:Array,
        queryString: Object,
    },
    data() {
        return {
            csmHistotyData: [],
        }
    },
    methods: {
        async loadCSMHistory() {
          let act = `csm/data/CSM_Read_History?job_no=${encodeURIComponent(this.queryString.job_no || '')}`
          let rsp = await $xt.getServer(act)
          this.csmHistotyData = rsp.data
          this.$emit('csmHistotyDataDataLoaded', this.csmHistotyData)
        },
    },
    mounted() {
        this.loadCSMHistory()
    },
}
</script>
