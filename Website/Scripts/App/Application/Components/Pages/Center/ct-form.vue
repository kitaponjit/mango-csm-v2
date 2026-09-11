<template>
  <div>
    <modal ref="centerModal" sheet-class="ct-sheet">
      <template #header>
        <h4><i class="fa fa-file-text-o"></i> ฟอร์มเอกสาร</h4>
      </template>
      <template #body>
        <div class="modal-search-bar">
          <div class="row">
            <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
              <div class="form-group">
                <label><i class="fa fa-search" style="margin-right:4px;"></i>{{ ui.search || 'ค้นหา' }}</label>
                <div class="input-group">
                  <input type="text" class="form-control input-sm" v-model.trim="retrieveSearch['text']" @keyup.enter="onSearch" />
                  <span class="input-group-btn"><a class="btn btn-sm btn-default" @click="onSearch"><i class="fa fa-search"></i></a></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row" v-if="typecode==='004'">
          <div class="col-md-12 col-sm-12 col-xs-12">
            <p class="text-success">*** จากเอกสารสัญญาสำหรับลูกค้าเช่า ข้อ 2.5 ลูกค้าสามารถแก้ไขแบบฟอร์มได้ 4 ขั้นตอนการทำงานตามที่กำหนด และแก้ไขได้เฉพาะรูปแบบ A4 เท่านั้น หากอยู่นอกเหนือจากที่ระบุ จะมีค่าใช้จ่ายทุกกรณี</p>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12 col-md-12 col-sm-12">
            <ag-table ref="agr"
                      :footer="false"
                      @ready="initTable()"
                      @cell-clicked="sendData($event.data)"></ag-table>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="pull-left">
          <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
        </div>
        <button type="button" class="btn btn-sm modal-close-btn" @click="closeModal()">
          <i class="fa fa-times"></i> {{ui.close}}
        </button>
      </template>
    </modal>
  </div>
</template>

<script type="text/javascript">
  export default {
    props: {
      pre_event: String,
      package_code: String,
      filter_code: {
        type: [Array, []]
      }
    },
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui,
        retrieveSearch: {},
        displayData: [],
        typecode: "",
        paging: null,
      };
    },
    methods: {
      async openModal() {
        await this.loadTypeCode();
        await this.loadData();
        this.$refs.centerModal.openModal();
      },
      closeModal() {
        this.$refs.centerModal.closeModal();
      },
      async pageChange(pn) {
        this.paging.setCurrentPage(pn);
        await this.loadData();
      },
      onSearch() {
        this.pageChange(1);
      },
      async loadTypeCode() {
        let url = `CSM/Center/GetTypeCode?pre_event=${this.pre_event || ''}`;
        let resp = await $xt.getServer(url);
        this.$set(this, "typecode", resp.typecode || "");
      },
      async loadData() {
        let url = `CSM/Center/FormReadList?pre_event=${this.pre_event || ''}&package_code=${this.package_code || ''}&skip=${this.paging.skipItems()}&take=${this.paging.getItemsPerPage()}`;
        for (var key in this.retrieveSearch) {
          url += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`;
        }

        let resp = await $xt.getServer(url);

        this.displayData = resp.data;
        let total = resp.total
        this.paging.setTotalItems(total);
        if (!this.paging.getItemsPerPage()) {
          this.paging.setCurrentPage(1);
        }
        this.paging.createPagesArray();

        await this.$nextTick();
        await this.initTable();
        this.$refs.agr.setDisplay(this.displayData);
      },
      sendData(x) {
        this.$emit("send-data", x);
        this.closeModal();
      },
      initTable() {
        let agr = this.$refs.agr;
        if (!agr) return;

        let fields = [
          ['formcode', this.ui.erp_form_code || 'Form Code', 'text', { width: 220, sortable: true, pinned: 'left', cellStyle: { 'font-weight': 'bold' } }],
          ['formname', this.ui.erp_form_name || 'Form Name', 'text', { width: 400, sortable: true }],
          ['formname_e', 'Form Name (ENG)', 'text', { width: 380, sortable: true }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
      },
    },
    mounted() {
      this.paging = this.$refs.paging;
      this.paging.setCurrentPage(1);
      this.paging.setItemsPerPage(15);
      this.$set(this.retrieveSearch, "text", "");

      this.$refs.centerModal.setSize('modal-lg-2');
    }
  };
</script>
