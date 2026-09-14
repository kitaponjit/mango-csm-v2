<template>
  <div>
    <modal ref="centerModal" sheet-class="ct-sheet">
      <template #header>
        <h4><i class="fa fa-list-alt"></i>Sub Service</h4>
      </template>
      <template #body>
        <div class="modal-search-bar">
          <div class="row">
            <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
              <div class="form-group">
                <label><i class="fa fa-search" style="margin-right:4px;"></i>{{ ui.search || 'Search' }}</label>
                <div class="input-group">
                  <input type="text" class="form-control input-sm" v-model.trim="retrieveSearch.search_text" @keyup.enter="loadDataByTab" />
                  <span class="input-group-btn"><a class="btn btn-sm btn-default" @click="loadDataByTab"><i class="fa fa-search"></i></a></span>
                </div>
              </div>
            </div>
            <div class="col-lg-2 col-md-2 col-sm-4 col-xs-6">
              <div class="form-group">
                <label>&nbsp;</label>
                <div>
                  <label class="switch-toggle">
                    <input type="checkbox" true-value="Y" false-value="N" v-model="activeFilter" @change="loadData_H()" />
                    <span class="switch-slider"></span>
                    <span class="switch-label">{{ ui.erp_active || 'Active' }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="nav-tabs-custom" style="margin-bottom:0;">
          <div class="tabbable-line">
            <ul class="nav nav-tabs navbar">
              <li :class="{ active: tabActive === 0 }"><a href="#" @click.prevent="changeTab(0)">Sub Service Header</a></li>
              <li v-if="showDetailTab" :class="{ active: tabActive === 1 }" :style="{ cursor: 'default', pointerEvents: 'none' }"><a href="#" @click.prevent>Sub Service Detail<span v-if="selectedServCode && tabActive === 1"> ({{ selectedServCode }})</span></a></li>
            </ul>
          </div>
        </div>
        <div class="row" v-show="tabActive === 0">
          <div class="col-lg-12">
            <ag-table ref="agr_h"
                      :footer="false"
                      :sorting="true"
                      @ready="initTable_H()"
                      @cell-clicked="pickOnNarrow_H($event.data)"
                      @double-cell-clicked="holdData_H($event.data)">
            </ag-table>
          </div>
        </div>
        <div class="row" v-show="tabActive === 1">
          <div class="col-lg-12">
            <ag-table ref="agr_d"
                      :footer="false"
                      :sorting="true"
                      @ready="initTable_D()"
                      @cell-clicked="pickOnNarrow_D($event.data)"
                      @double-cell-clicked="sendData($event.data)">
            </ag-table>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="pull-left">
          <pagination ref="paging_h" v-show="tabActive === 0" @page-change="pageChange_H($event.page)"></pagination>
          <pagination ref="paging_d" v-show="tabActive === 1" @page-change="pageChange_D($event.page)"></pagination>
        </div>
        <button type="button" class="btn btn-sm modal-close-btn" @click="closeModal()">
          <i class="fa fa-times"></i> {{ ui.close }}
        </button>
      </template>
    </modal>
  </div>
</template>

<script type="text/javascript">
  let paging_h = {}
  let paging_d = {}

  export default {
    props: {
      type: { type: String, default: 'D' },
    },
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui,
        retrieveSearch: { search_text: '' },
        tabActive: 0,
        selectedServCode: null,
        activeFilter: 'Y',
        isSending: false,
        datalist_h: [],
        datalist_d: [],
      };
    },
    computed: {
      showDetailTab() {
        return this.type !== 'H';
      },
    },
    methods: {
      openModal() {
        this.$refs.centerModal.openModal();
        this.isSending = false;
        this.tabActive = 0;
        this.selectedServCode = null;
        this.retrieveSearch = { search_text: '' };
        this.activeFilter = 'Y';
        this.loadData_H();
      },
      closeModal() {
        this.$refs.centerModal.closeModal();
      },
      changeTab(idx) {
        this.tabActive = idx;
        if (idx === 1) this.loadData_D();
      },
      pickOnNarrow_H(x) {
        if (!window.matchMedia('(max-width: 939px)').matches) return;
        this.holdData_H(x);
      },
      pickOnNarrow_D(x) {
        if (!window.matchMedia('(max-width: 939px)').matches) return;
        this.sendData(x);
      },
      loadDataByTab() {
        if (this.tabActive === 0) this.loadData_H();
        else this.loadData_D();
      },
      async loadData_H() {
        let url = `CSM/Center/SubService_H?active=${this.activeFilter}`;
        if (this.retrieveSearch.search_text) {
          url += `&search_text=${encodeURIComponent(this.retrieveSearch.search_text)}`;
        }
        let rsp = await $xt.getServer(url);
        this.datalist_h = rsp.data.data || [];
        paging_h.setTotalItems(rsp.total || 0);
        paging_h.setCurrentPage(1);
        paging_h.createPagesArray();
        this.pageChange_H(1);
        await this.$nextTick();
        await this.initTable_H();
      },
      async loadData_D() {
        let url = `CSM/Center/SubService_D?active&serv_code=${encodeURIComponent(this.selectedServCode || '')}`;
        if (this.retrieveSearch.search_text) {
          url += `&search_text=${encodeURIComponent(this.retrieveSearch.search_text)}`;
        }
        let rsp = await $xt.getServer(url);
        this.datalist_d = rsp.data.data || [];
        paging_d.setTotalItems(rsp.total || 0);
        paging_d.setCurrentPage(1);
        paging_d.createPagesArray();
        this.pageChange_D(1);
        await this.$nextTick();
        await this.initTable_D();
      },
      pageChange_H(pn) {
        pn = pn || 1;
        paging_h.setCurrentPage(pn);
        let display = $linq(this.datalist_h).skip(paging_h.skipItems()).take(paging_h.getItemsPerPage()).toArray();
        paging_h.createPagesArray();
        this.$nextTick(() => {
          let agr = this.$refs.agr_h;
          if (agr) agr.setDisplay(display);
        });
      },
      pageChange_D(pn) {
        pn = pn || 1;
        paging_d.setCurrentPage(pn);
        let display = $linq(this.datalist_d).skip(paging_d.skipItems()).take(paging_d.getItemsPerPage()).toArray();
        paging_d.createPagesArray();
        this.$nextTick(() => {
          let agr = this.$refs.agr_d;
          if (agr) agr.setDisplay(display);
        });
      },
      holdData_H(x) {
        if (!this.showDetailTab) {
          this.sendData(x);
          return;
        }
        this.selectedServCode = x.serv_code;
        this.tabActive = 1;
        this.loadData_D();
      },
      async initTable_H() {
        let agr = this.$refs.agr_h;
        if (!agr) return;
        let self = this;

        let fields = [
          ['serv_code', this.ui.erp_code || 'Code', 'text', { width: 200 }],
          ['remark', this.ui.erp_name || 'Name', 'text', { width: 500 }],
        ];

      let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
      },
      async initTable_D() {
        let agr = this.$refs.agr_d;
        if (!agr) return;
        let self = this;

        let fields = [
          ['serv_code', this.ui.erp_c_code0 || 'Group Code', 'text', { width: 200 }],
          ['serv_code_d', this.ui.erp_code || 'Code', 'text', { width: 200 }],
          ['remark', this.ui.erp_name || 'Name', 'text', { width: 400 }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
      },
      sendData(x) {
        if (this.isSending) return;
        this.isSending = true;
        this.$emit('send-data', x);
        this.closeModal();
      },
    },
    mounted() {
      paging_h = this.$refs.paging_h;
      paging_h.setCurrentPage(1);
      paging_h.setItemsPerPage(500);

      paging_d = this.$refs.paging_d;
      paging_d.setCurrentPage(1);
      paging_d.setItemsPerPage(500);

      this.$refs.centerModal.setSize('modal-lg-2');
    },
  };
</script>

<style scoped>
  .switch-toggle {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    margin: 0;
    font-weight: normal;
  }
  .switch-toggle input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  .switch-slider {
    position: relative;
    display: inline-block;
    width: 46px;
    height: 24px;
    background-color: #ccc;
    border-radius: 24px;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
  }
  .switch-slider::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: #fff;
    border-radius: 50%;
    transition: transform 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
  .switch-toggle input:checked + .switch-slider {
    background-color: #1e9ff2;
  }
  .switch-toggle input:checked + .switch-slider::before {
    transform: translateX(22px);
  }
  .switch-label {
    margin-left: 8px;
    font-size: 14px;
    line-height: 24px;
  }
</style>
