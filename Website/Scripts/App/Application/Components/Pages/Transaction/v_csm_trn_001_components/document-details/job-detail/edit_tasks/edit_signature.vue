<template>
    <div class="row">
        <div class="col-lg-9 col-md-12 col-sm-12">
            <table class="table table-hover">
            <thead>
                <tr>
                <th style="width:1px;">No.</th>
                <th style="width:300px;">File</th>
                <th>User</th>
                <th>Add Date</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="x,idx in attachFileTab()">
                <td>{{idx+1}}.</td>
                <td align="center">
                    <p v-if="['png','jpeg','jpg'].includes(getFileExt(x.filename))">
                    <a :href="createFilePath(x.filepath)" target="_blank"><img :src="createFilePath(x.filepath)" class="img-responsive" /></a>
                    </p>
                </td>
                <td>
                    <textarea class="form-control input-sm" rows="5" readonly>{{ getParsedDescription(x.description2) }}</textarea>
                </td>
                <td>{{x.add_dt | date('DD/MM/YYYY HH:mm')}}</td>
                </tr>
            </tbody>
            </table>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        attachFileTab:Function,
        createFilePath:Function,
        delFile:Function,
        getFileExt:Function,
        downLoadFile:Function,
        isView:Boolean,
        isAdmin:Boolean,
        formData:Object,
        editDetailData:Object,
        addFile:Function,
        getParsedDescription:Function
    },
    data() {
        return {
           
        }
    }
}
</script>