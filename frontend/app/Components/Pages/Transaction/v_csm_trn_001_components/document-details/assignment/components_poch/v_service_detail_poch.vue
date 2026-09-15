<template>
  <div>
    <div class="modal fade" data-backdrop="static" data-keyboard="false" ref="myModal">
      <div class="full-modal-dialog" v-bind:class="[modalSize]" ref="dialog">
        <div class="full-modal-content" style="background-color: white;">
          <div class="modal-header" style="cursor: move">
            <!-- <slot name="header"></slot> -->
            <h4><i class="fas fa-file-alt"/> รายละเอียดสัญญาบริการ</h4>
            <button ref="close_btn" type="button" class="close" v-if="closeButton">&times;</button>
          </div>
          <div class="modal-body" style="overflow-y: hidden !important; min-height: 85vh;" ref="modalBody">
            <app-form-2 ref="appForm" exportSelect="B" :exportUrl= "exportUrl">
                <template #form-detail>
                  <!-- <slot name="body"></slot> -->
                  <!-- <div class="box box-widget">
                    <div class="box-body"> -->
                      <div class="row d-flex">
                        <!-- <div class="col-md-3">
                          <div class="form-group">
                            <label v-text="'ประเภทสัญญา'"></label>
                            <select class="form-control input-sm" v-model="searchData.type">
                              <option value="All">All</option>
                              <option value="PM">PM</option>
                              <option value="BM">BM</option>
                            </select>
                          </div>
                        </div> -->
                        <div class="col-md-3">
                          <div class="form-group">
                            <label v-text="ui.search_by || 'Search By'"></label>
                            <select class="form-control input-sm" v-model="searchData.field">
                              <option value="pre_event">Project No.</option>
                              <option value="refcode">Ref. Code</option>
                              <option value="pre_des">Project Name</option>
                              <option value="salename">Sale Name</option>
                              <option value="customer_code">Customer Code</option>
                              <option value="pre_thi">Customer Name</option>
                              <option value="csm_docno">CSM No.</option>
                            </select>
                          </div>
                        </div>
                        <div class="col-lg-6 col-md-6">
                          <div class="form-group">
                            <label v-text="ui.search || 'Search'"></label>
                            <div class="input-group">
                              <input type="text" class="form-control input-sm" v-model="searchData.text" @keyup.enter="doSearch()"/>
                              <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click.prevent="doSearch()"><i class="fas fa-search"></i></button></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12">
                          <ag-table ref="agr"
                          :footer="false" 
                          :checkbox="true" 
                          @cell-clicked="onCellClicked"
                          @ready="initTable()"></ag-table>
                        </div>
                      </div>
                    <!-- </div>
                  </div> -->
                </template>
            </app-form-2>
          </div>
        </div>
      </div>
    </div>
    <!-- <loading-box ref="myLB"></loading-box> -->
     <modal-2 ref="customerModal" :hideFooter="true">
      <template #header>
        <h4><i class="far fa-id-badge"> Customer Detail</i></h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-12">
           <ag-table ref="agr2"
           :footer="false" 
           @ready="initTable2()"></ag-table>
          </div>
        </div>
      </template>
    </modal-2>
  </div>
</template>

<script>


// no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first


let page = { loadingBox: { show() {}, hide() {} } }
let appForm = {};

export default {
  props: {
    useCloseFunction: {
      type: Boolean,
      default: false
    },
    closeFunction: {
      type: Function
    },
    closeButton: {
      type: Boolean,
      default: true
    },
    notEsc: {
      type: Boolean,
      default: true
    },
    scale: {
      type: Number,
      default: 0
    },
    hideFooter: {
      type: Boolean,
      default: false
    },
    preEvent: {
      type: String,
    },
    jobType: {
      type : String
    }
  },
  component() {
  },
  data() {
    return {
      auth,
      baseUrl,
      baseRoute,
      ui: window.ui,
      xt: $xt,
      searchData:{
        type: '',
        field: 'refcode',
        text:''
      },
      selectList: [],
      modalSize: 'modal-md',
      exportUrl: ""
    }
  },
  created() {
    document.addEventListener('keyup', (evt) => {
      if (evt.keyCode === 27) {
        this.callback()
      }
    })
  },
  methods: {
    async openModal() {
      this.leftPos = 89
      this.topPos = 7

      let vm = this
      return new Promise(async resolve => {
        $(vm.$refs.myModal).modal('show')
        this.loadData()
        // this.setRptData()
        

        this.$nextTick(() => {
          $(vm.$refs.modalBody).animate({ scrollTop: 0 }, 'fast')
          $(vm.$refs.dialog).draggable({
            cursor: 'move',
            handle: '.modal-header'
          })
          $(vm.$refs.dialog).css({ top: 0, left: 0 })
        })

        $(this.$refs.close_btn).on('click', () => {
          this.callback()
          resolve(true)
        })
      })
    },
    async closeModal() {
      await $(this.$refs.myModal).modal('hide')
    },
    callback() {
      if (this.useCloseFunction) {
        this.$emit('close-function')
      }
      else {
        this.closeModal()
      }
    },
    setSize(t) {
      this.modalSize = t
    },
    adjustScreen() {
      if (this.scale != 0) {
        $(this.$refs.modalBody).css('height', parseInt($(window).height() - (this.scale || 310)) + 'px')
      }
    },
    doSearch() {
      // console.log('search', this.searchData);
      this.loadData()
    },
    async loadData() {
      this.searchData.type = this.jobType
      // console.log('searchData', this.searchData);
      
      let act = `csm/data/CSM_ContractDetail?pre_event=${this.preEvent}`
      for (var key in this.searchData) {
          act += `&${key}=${encodeURIComponent(this.searchData[key])}`
        }
      let rsp = await $xt.getServer(act)
      let agr = this.$refs.agr;
      console.log('rsp:', rsp);
      let detail = rsp.data.data_row

      agr.setDisplay(detail);
      this.initTable()
      this.exportUrl = `csm/data/CSM_ContractExport?pre_event=${this.preEvent || ''}&&job_code=${this.jobType || ''}`
      // await this.closeAuto() // auto complete มือ
    },
    async closeAuto() {
      // let act = `csm/data/CSM_ContractDetail?pre_event=${this.preEvent}`
      let act = `AnywhereAPI/CSM/AutoCloseCSM`

      let rsp = await $xt.getServer(act)
      console.log('rsp:', rsp);
      let detail = rsp.data.data_row
    },
    initTable(){
      let agr = this.$refs.agr;

      let bold_underline = { "font-weight": "bold"};
      let bold_style = (p) => (p?.data?.bold ? bold_underline : {});
      let fields = [];
      // log parameters
      let dateColorStyle = (p) => {
        if (p?.data?.job_end && $xt.isEmpty(p?.data?.csm_docno)) {
          let jobEndDate = moment(p.data.job_end).format('YYYY-MM-DD');
          let currentDate = moment().format('YYYY-MM-DD');
          if (jobEndDate < currentDate) {
            return { color: '#f1416c' };
          }
        }
        return bold_style(p);
      };

 
      fields = [
        // ['x1', 'Select', 'text', { width: 125, align: 'center', cellStyle: bold_style}],
        ['jobname_s', 'Type', 'text', { width: 110, align: 'left', cellStyle: dateColorStyle }],
        ['pre_event', 'Project No.', 'text', { width: 160, align: 'left', cellStyle: dateColorStyle }],
        ['refcode', 'Ref.Code', 'text', { width: 150, align: 'left', cellStyle: dateColorStyle }],
        ['pre_des', 'Project Name', 'text', { width: 250, align: 'left', cellStyle: dateColorStyle }],
        ['salename', 'Sale Name', 'text', { width: 250, align: 'left', cellStyle: dateColorStyle }],
        ['job_start', 'Job Start', 'date', { width: 140, align: 'center', cellStyle: dateColorStyle }, { useCellRenderer: true }],
        ['job_end', 'Job End', 'date', { width: 140, align: 'center', cellStyle: dateColorStyle }, { useCellRenderer: true }],
        ['customer_code', 'Customer Code', 'text', { width: 150, align: 'left', cellStyle: dateColorStyle }],
        ['pre_thi', 'Customer Name', 'text', { width: 250, align: 'left', cellStyle: dateColorStyle, cellRenderer: (params) => {
          const custName = params?.value ?? '';
          const jobEndDate = moment(params?.data?.job_end).format('YYYY-MM-DD');
          const currentDate = moment().format('YYYY-MM-DD');

          if (jobEndDate < currentDate && $xt.isEmpty(params?.data?.csm_docno)) {
            return `<div class='text-decoration-underline text-danger' style='cursor: pointer;'>${custName}</div>`;
          }

          return `<div class='text-decoration-underline' style='cursor: pointer; color:#3c8dbc'>${custName}</div>`;
        },}],
        ['inv_amount', 'INV รายได้รับล่วงหน้า', 'text', { width: 200, align: 'center', cellStyle: dateColorStyle }],
        ['itemno', 'จำนวน (ครั้ง)', 'text', { width: 150, align: 'center', cellStyle: dateColorStyle , 
        cellRenderer: (params) => {
          return `${params.data.itemno} / ${params.data.service_qty}`;
        }}],
        ['plan_date', 'Plan Date', 'date', { width: 150, align: 'center', cellStyle: dateColorStyle }, { useCellRenderer: true }],
        ['complet_date', 'Complete CSM', 'date', { width: 150, align: 'center', cellStyle: dateColorStyle }, { useCellRenderer: true }],
        ['revise_plan_date', 'Revise Plan', 'date', { width: 150, align: 'center', cellStyle: dateColorStyle }, { useCellRenderer: true }],
        ['csm_date', 'Document Date', 'date', { width: 150, align: 'center', cellStyle: dateColorStyle }, { useCellRenderer: true }],
        ['csm_docno', 'CSM No.', 'text', { width: 150, align: 'center', cellStyle: dateColorStyle }],
        
        ];
     

      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);

      this.grid_header = header;
    },
    initTable2(){
      let agr = this.$refs.agr2;

      let bold_underline = { "font-weight": "bold"};
      let bold_style = (p) => (p?.data?.bold ? bold_underline : {});
      let fields = [];
 
      fields = [
        ['customer_code', 'Customer Code', 'text', { width: 200, align: 'center', cellStyle: bold_style}],
        ['pre_thi', 'Customer Name', 'text', { width: 200, align: 'left', cellStyle: bold_style }],
        ['customer_type_name', 'ประเภทลูกค้า', 'text', { width: 250, align: 'center', cellStyle: bold_style }],
        ['phone', 'เบอร์โทร', 'text', { width: 250, align: 'center', cellStyle: bold_style }],
        ['contact', 'ผู้ติดต่อ', 'text', { width: 250, align: 'left', cellStyle: bold_style }],
        ['level', 'ระดับลูกค้า', 'text', { width: 150, align: 'center', cellStyle: bold_style }],
        ];
     

      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);

      this.grid_header = header;
    },
    async onCellClicked(event) {
      let detail = event.data
      // console.log('detail', detail);
      
      if (event.col === "pre_thi") {
        this.$refs.agr2.setDisplay([detail]);
        this.initTable2();
        this.openModalCus()
      }
      
    },
    openModalCus() {
      this.$refs.customerModal.setSize("modal-xl")
      this.$refs.customerModal.openModal()
    }
  },
  computed: {
  },
  mounted() {
    // page = this.$refs.page;
    // page.pageTitle = 'รายละเอียดของโครงการบริการ';
    // document.title = page.pageTitle;

    appForm = this.$refs.appForm
    appForm.btnDelete.show = false
    appForm.btnSave.show = false
    appForm.btnNew.show = false
    appForm.btnExport.show = true
    appForm.btnImport.show = false
    appForm.btnImport_center.show = false
    // this.loadData()
    // this.setRptData()
  },
}
</script>

<style scope>
.full-modal-dialog {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.full-modal-content {
  height: auto;
  min-height: 100%;
  border-radius: 0;
}

.tricky {
  transition: all 0.2s ease;
  z-index: 50;
}

.btn-container-trick{
  position: relative;
  height: 40px;
}
</style>

<style scoped>
  .modal-header {
    justify-content: flex-start !important;
  }
  .modal-header h4 {
    margin: 0 auto 0 0;
  }
  .modal-header button.close {
    margin-left: auto;
  }
</style>
