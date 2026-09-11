<template>
  <div class="modal fade ct-sheet" data-backdrop="static" data-keyboard="false" :ref="modalRef" :id="modalRef">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h4><i class="fas fa-box-open"></i> {{ ui.csm_v2_description || 'Description' }}</h4>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-lg-4 col-md-2 col-sm-2">
              <div class="form-group">
                <label>{{ui.search || 'Search'}}</label>
                <div class="input-group">
                  <input type="text" class="form-control input-sm" v-model.trim="localDescText" @keyup.enter="loadDescriptionData" />
                  <span class="input-group-btn"><a class="btn btn-sm bg-navy" @click="loadDescriptionData"><i class="fa fa-search"></i></a></span>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ag-table ref="agr" :footer="false" @ready="initTable()" @cell-clicked="sendComponent($event.data, eventType)"></ag-table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <pagination class="pull-left" ref="descPaging" @page-change="onPageChange($event.page, 'description')"></pagination>
          <button class="btn btn-sm btn-danger" @click="closeModal()"><i class="fas fa-times"></i> {{ ui.csm_v2_close_window || 'ปิดหน้าต่าง' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  export default {
    props: {
      modalRef: {
        type: String,
        default: 'DescModal',
      },
      eventType: {
        type: String,
        default: 'description',
      },
      showExtraColumn: {
        type: Boolean,
        default: false,
      },
      descriptionData: Array,
      desc_text: String,
      loadDescriptionData: Function,
      sendComponent: Function,
      onPageChange: Function,
      closeModal: Function,
    },
    data() {
      return {
        ui: window.ui,
        localDescText: this.desc_text,
      }
    },
    watch: {
      desc_text(val) {
        this.localDescText = val
      },
      localDescText(val) {
        this.$emit('update:desc_text', val)
      },
      descriptionData() {
        this.refreshGrid()
      },
    },
    methods: {
      refreshGrid() {
        this.$nextTick(() => {
          let agr = this.$refs.agr
          if (agr) agr.setDisplay(this.descriptionData || [])
        })
      },
      initTable() {
        let agr = this.$refs.agr
        if (!agr) return

        let fields = [
          ['descode', this.ui.erp_code || 'Code', 'text', { width: 140, align: 'center', pinned: 'left' }],
          ['desname', this.ui.csm_v2_description || 'Description', 'text', { width: 360 }],
        ]

        if (this.showExtraColumn) {
          fields.push(['desname2', '', 'text', { width: 200 }])
        }

        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)
        this.refreshGrid()
      },
    },
  }
</script>
