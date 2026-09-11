<template>
    <div class="row">
        <div class="col-lg-8 col-md-10 col-sm-12">
            <div class="box box-solid box-default">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-tasks margin-r-5"></i>สถานะเอกสาร</h3>
                </div>
                <div class="box-body no-padding">
                    <table class="table table-bordered table-striped table-hover table-modern">
                        <thead>
                            <tr>
                            <th style="width:180px">Date/Time</th>
                            <th style="width:180px">Status</th>
                            <th style="width:180px">User</th>
                            <th>Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(x, idx) in statusData" :key="idx">
                            <td>{{x.add_dt|date('DD/MM/YYYY HH:mm:ss')}}</td>
                            <td>
                                {{statusName(x.job_status)}}
                            </td>
                            <td>{{x.add_user}}</td>
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
        // statusName: Function,
        formData: Object,
        // statusData:Array
        statusCodeData: Array,
        queryString: Object,
    },
    data() {
        return {
            statusData: [],
        }
    },
    computed: {
        statusCodeMap() {
            return new Map((this.statusCodeData || []).map(x => [x.id, x.name]))
        },
    },
    methods: {
        statusName(code) {
            return this.formData.job_status === 'I' && code === 'W' ? 'Queued' : this.statusCodeMap.get(code) || ''
        },
        async loadStatus() {
          let act = `csm/data/CSM_Read_Status?job_no=${encodeURIComponent(this.queryString.job_no || '')}`
          let rsp = await $xt.getServer(act)
          this.statusData = rsp.data
          // emit แค่ตัวแปร statusData
        this.$emit('statusDataLoaded', this.statusData)
        },
    },
    mounted() {
        this.loadStatus()
    }
}
</script>
