<template>
  <div>
    <div class="modal fade" data-backdrop="static" data-keyboard="false" ref="myModal">
      <div class="modal-dialog" v-bind:class="[modalSize]" ref="dialog">
        <div class="modal-content">
          <div class="modal-header" style="cursor: move">
            <!-- <slot name="header"></slot> -->
            <h4><i class="fas fa-history"/> ประวัติเอกสาร {{ type }}</h4>
            <button ref="close_btn" type="button" class="close" v-if="closeButton">&times;</button>
          </div>
          <div class="modal-body" ref="modalBody">
            <!-- <slot name="body"></slot> -->
            <div class="row">
              <div class="col-md-12">
                <ag-table ref="agr" :footer="false" @ready="initTable()"></ag-table>
              </div>
            </div>
          </div>
          <!-- <div class="d-flex justify-content-between padding-t-15">
            <button class="btn btn-sm pull-left" @click="onTemplateExcel"><i class="fas fa-download"></i>ดาวน์โหลดเทมเพลต</button>
            <button class="btn btn-sm pull-rigth text-white margin-l-15 btn-primary" @click="importExcel"><i class="fas fa-file-import"></i>เริ่มนำเข้าข้อมูล</button>
          </div> -->
        </div>
      </div>
    </div>
    <!-- <loading-box ref="myLB"></loading-box> -->
  </div>
</template>

<script type="text/javascript">
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
      // type: {
      //   type: String
      // },
      dataList: {
        type: Array,
        default: () => []
      },
    },
    components: {
    },
    data() {
      return {
        baseUrl,
        modalSize: 'modal-md',
        ui: window.ui,
        xt: $xt,
        type: '',
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
        let vm = this
        return new Promise(resolve => {
          $(vm.$refs.myModal).modal('show')
          this.setRptData()

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
        this.$set(this, 'modalSize', t)
      },
      adjustScreen() {
        if (this.scale != 0) {
          $(this.$refs.modalBody).css('height', parseInt($(window).height() - (this.scale || 310)) + 'px')
        }
      },
      async setRptData(d, cond) {
        let agr = this.$refs.agr;

        // this.$set(this, "display", d.groupedData);
        // let grand = d.grand_total

        // this.$set(this, "rawData", d.raw_data);
        // this.$set(this, "raw_filename", d.raw_filename);

        const pendingList = this.dataList.filter(item => ['W','I','N'].includes(item.job_status))
        const completeList = this.dataList.filter(item => item.job_status === 'Y')
                
        this.initTable();

        /* Display : Header */
        agr.setDisplay(this.type === 'Pending' ? pendingList : completeList);
        
        // if(this.type == 'pending') {
        //  await agr.setDisplay(pendingList);
        // } else {
        //  await agr.setDisplay(completeList);
        // }
      },
      async initTable() {
      let agr = this.$refs.agr;

      let bold_underline = { "font-weight": "bold" };
      let bold_style = (p) => (p?.data?.bold ? bold_underline : {});
      let fields = [];
 
      fields = [
        ["job_no", "CSM No.", "text", { width: 320, align: "center", cellRenderer: (params) => {
              if (params.value) {
                const jobNo = params.value;
                const isWaiting = params.data.job_code === 'W';
                const displayValue = isWaiting ? `<b>${jobNo}</b>` : jobNo;
                return `<a href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${jobNo}"
                style="cursor: pointer; text-decoration: none; color: #3c8dbc;"
                target="_blank">${displayValue}</a>`;
              }
              return "";
            }, }],
        ["subject", "Subject", "text", { width: 380, align: "left" }],
        ["pre_des", "Project", "text", { width: 400, align: "left" }],
        ["jobname", "Job", "text", { width: 125, align: "center", cellStyle: bold_style }],
        ["customer_name", "Customer Name", "text", { width: 215, align: "left",}],
      ];
     

      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);

      this.grid_header = header;
    },
    },
    mounted() {
      // this.setRptData()
    }
  }
</script>

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


