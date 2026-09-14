<template>
  <modal-2 ref="AlertSW" sheet-class="ct-sheet" :hideFooter="true">
    <template #header>
      <h4>WARNING !!!! </h4>
    </template>
    <template #body>
      <div class="row">
        <div class="col-md-10">
          <h4>{{ ui.erp_customer || 'ลูกค้า' }} : {{formData.customer_name || ''}} </h4>
        </div>
      </div>
      <div class="row">
        <div class="col-md-10">
          <label>
            สามารถใช้ระบบ Software Auto Update ได้ <br />
            ทาง Requestor สามารถ Update ได้เอง   <br />
            หรือ ให้ทางผู้ใช้บริการ ดำเนินการนัดหมายภายในองค์กรของลูกค้า  <br />
            และดำเนินการ Update ได้ครับ
          </label>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <div class="table-responsive">
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th style="width:5px;"></th>
                  <th style="width:400px;">{{ ui.erp_file || 'File' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td align="center">
                    <label>คู่มือการดำเนินการ</label>
                  </td>
                  <td align="center">
                    <p>
                      <a :href="showPDf" target="_blank">
                        <i class="fas fa-file-pdf fa-5x" style="color: black;"></i>
                      </a>
                      <br />
                      <a :href="showPDf" target="_blank" style="margin-top:10px;"><i class="fas fa-download"></i> UpdateSoftwareManual.pdf</a>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>
      <!--<div class="row pull-right ">
        <div class="col-md-12 ">
          <button type="button" class="btn btn-sm btn-primary" @click.prevent="UpdateRefWork()" v-bind:disabled="!canEdit">
            <i class="fa fa-check"></i> OK
          </button>
        </div>
      </div>-->
    </template>
  </modal-2>
</template>

<script type="text/javascript">
  export default {
    props: {
      formData: Object,
      showPDf: String,
    },
    data() {
      return {
        ui: window.ui,
      }
    },
    methods: {
      openModal() {
        this.$refs.AlertSW.openModal()
      },
      closeModal() {
        this.$refs.AlertSW.closeModal()
      },
      setSize(size) {
        this.$refs.AlertSW.setSize(size)
      },
    },
  }
</script>
