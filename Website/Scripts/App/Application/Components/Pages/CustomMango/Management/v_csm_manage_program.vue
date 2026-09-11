<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="d-flex justify-content-end mb-2">
          <button class="btn btn-sm bg-success" @click.prevent="saveActivityHistory()">
            <i class="fa fa-save"></i> บันทึกข้อมูล
          </button>
        </div>
        <div class="box box-widget">
          <div class="box-body">
            <div class="row">
              <div class="col-lg-2 col-md-6">
                <div class="form-group">
                  <label> ค้นหา</label>
                  <span class="input-group">
                    <input type="text" class="form-control input-sm text-bold" v-model="searchData.search_text"
                           @keyup.enter="doSearch()" />
                    <span class="input-group-btn">
                      <button class="btn btn-sm bg-navy" @click.prevent="doSearch()">
                        <i class="fa fa-search"></i>
                      </button>
                    </span>
                    <span class="input-group-btn">
                      <button class="btn btn-sm bg-danger" @click.prevent="resetData()">
                        <i class="fa fa-close"></i>
                      </button>
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-lg-12 col-md-12">
                <ag-table ref="agrData" :footer="false" :checkbox="true" @cell-clicked="onCellClicked"></ag-table>
              </div>
            </div>

            <!--Pagination-->
            <div class="row">
              <div class="col-lg-12 col-md-12">
                <pagination class="pull-left" ref="" @page-change=""></pagination>
              </div>
            </div>
            <!-- Loading (remove the following to stop the loading)-->
            <div class="overlay" v-if="isLoading">
              <i class="fa fa-refresh fa-spin"></i>
            </div>
            <!-- end loading -->
          </div>
        </div>
      </template>
    </re-page>

    <!-- Modal -->
    <modal-2 ref="modalHistory" :header-name="headerNameModal" :show-footer="false">
      <template #header>
        <h4><i class="fa fa-file-alt"> View History</i></h4>
      </template>
      <template #body>
        <ag-table ref="agrModal" :footer="false" @cell-clicked="onCellClicked"></ag-table>
      </template>
    </modal-2>
  </div>
</template>
<script>
  let page = {};
  let appForm = {};
  let cpn = {
    data() {
      return {
        xt: $xt,
        headerNameModal: "",
        auth,
        ui: window.ui,
        isLoading: false,
        headerData: {
          pre_event: null,
          pre_event2: null,
          pre_des: null,
          pre_event_unit: null,
          pre_des_unit: null,
          house_no: null
        },
        modalData: {
          pre_event_unit: null,
          postid: null,
          add_date: null,
        },
        baseUrl: [],
        searchData: {
          search_text: ""
        },
        displayData: [],
        setEdit: [],
        // ...existing code...
      };
    },
    methods: {
      async loadCustomerData() {
        try {
          this.isLoading = true;
          let action = `CSM/Data/CustomerDataViewReadManage`;
          let rsp = await $xt.getServer(action);

          const agrData = this.$refs.agrData;
          if (agrData) {
            const raw = rsp.data || [];

            agrData.setDisplay(raw);
            this.displayData = raw;
            this.initTable()
          }
          else {
            console.warn('No data or unsuccessful response:', rsp);
            this.displayData = [];
            agrData.setDisplay([]);
          }

        } catch (ex) {
          console.error('Error in loadCustomerData:', ex);
          $msg.alert('Error', ex.toString(), 'danger');
          if (this.$refs.agrData) {
            this.$refs.agrData.setDisplay([]);
          }
        } finally {
          this.isLoading = false;
        }
      },
      async resetData(type) {
        this.searchData.search_text = '';
        if (this.$refs.agrData) {
          this.$refs.agrData.setDisplay(this.displayData);
        }
        await this.initTable();
      },
      async doSearch() {
        try {
          this.isLoading = true;
          const searchText = this.searchData.search_text.trim().toLowerCase();

          const agrData = this.$refs.agrData;
          if (!agrData) return;

          if (!searchText) {
            agrData.setDisplay(this.displayData || []);
            return;
          }
          const displayData = (this.displayData || []).filter(item =>
            item.customer_name && item.customer_name.toLowerCase().includes(searchText)
          );
          agrData.setDisplay(displayData);

        } catch (ex) {
          $msg.alert('Error', ex.toString(), 'danger');
        } finally {
          this.isLoading = false;
        }
      },
      async onReadData(prioity_code) {
        try {
          page.loadingBox.show();
          let act = `csm/master/Priority_Read?prioity_code=${encodeURIComponent(prioity_code || '')}`;
          let rsp = await $xt.getServer(act);
          this.$set(this, "form", rsp.data);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async saveActivityHistory() {
        this.isLoading = true;
        try {
          // ส่งเฉพาะ row ที่มีการแก้ไข
          let changedRows = (this.displayData || []).filter(x => x.isEdit === 'Y');
          if (changedRows.length === 0) {
            $msg.alert('Info', 'ไม่มีข้อมูลที่เปลี่ยนแปลง', 'info');
            this.isLoading = false;
            return;
          }

          let act = `CSM/Data/CreateManageActiveHistory`;
          let rsp = await $xt.postServerJson(act, { model: changedRows });
          if (!rsp.success) {
            $msg.alert('Error', rsp.message, 'danger');
            this.isLoading = false;
            return;
          }
          $msg.alert('Success', 'บันทึกข้อมูลเรียบร้อย', 'success');
          await this.loadCustomerData();
        } catch (ex) {
          $msg.alert('Error', ex.toString(), 'danger');
        } finally {
          this.isLoading = false;
        }
      },
      async initTable() {
        //Grid for Data
        let agrData = this.$refs.agrData;

        const fieldsData = [
          ["no_", "NO", "text", { width: 100, align: "center" }],
          ["manage_cus_active", "Active", "text", {
            width: 120,
            align: "center",
            cellRenderer: (params) => {
              const checked = params.value === "Y";

              const container = document.createElement('span');
              container.className = 'form-check form-switch form-check-custom form-check-solid form-check-sm me-5 d-flex justify-content-center align-items-center';
              container.style.height = '100%';

              const input = document.createElement('input');
              input.type = 'checkbox';
              input.className = 'form-check-input h-20px w-30px';
              input.checked = checked;
              let previousValue = input.checked;

              input.addEventListener('click', (e) => {
                setTimeout(async () => {
                  const newChecked = e.target.checked;

                  if (!await $msg.confirm(`คุณต้องการเปลี่ยนสถานะ Active ของ ${params.data.customer_name} หรือไม่?`)) {
                    input.checked = previousValue;
                    params.data.manage_cus_active = 'Y' ? 'N' : 'N';
                    params.data.isEdit = 'N';
                  } else {
                    params.data.isEdit = 'Y';
                  }
                }, 0);
              });

              container.appendChild(input);
              return container;
            }
          }],

          ["customer_name", "Company Name", "text", { width: 600, align: "left" }],
          ["add_dt", "Last Update", "datetime", {
            width: 600, align: "left", sortable: true,
            cellRenderer: (params) => {
              const CustomerName = params.data.cus_name || '';
              const AddDate = params.data.add_dt || '' ? moment(params.data.add_dt).format('DD/MM/YYYY HH:mm:ss') : '';
              return `${CustomerName} ${AddDate}`;
            }
          }],
          ["history", "History", "text", { flex: 1, align: "center", cellRenderer: () => { return `<a class='text-blue'> <i class='fa fa-eye'> View</i> </a>`; } }],
        ];
        if (agrData && typeof agrData.setHeader === 'function') {
          let headerForData = agrData.createHeaderFromArray(fieldsData);
          agrData.setHeader(headerForData);
        }
      },
      async initTable1() {
        let agrData = this.$refs.agrModal;
        let fieldModal = [
          ["itemno", "No", "text", { width: 120, align: "center" }],
          ["cus_name", "Name", "text", { width: 300, align: "center" }],
          ["description", "Transaction", "text", { width: 500, align: "left" }],
          ["add_emp", "Add User", "text", { width: 150, align: "center" }],
          ["add_dt", "Add Date / Time", "datetime", { flex: 1, align: "center", sortable: true,
            cellRenderer: (params) => {
              const AddDate = params.data.add_dt || '' ? moment(params.data.add_dt).format('DD/MM/YYYY HH:mm:ss') : '';
              return `${AddDate}`;
            } }],
        ]
        let headerForData = agrData.createHeaderFromArray(fieldModal);
        agrData.setHeader(headerForData);
      },
      async onCellClicked(event) {
        let e = event.data
        if (event.col === 'history') {
          let action = `CSM/Data/ReadHistory?customercode=${e.cus_code}`;
          let rsp = await $xt.getServer(action);
          if (Array.isArray(rsp.data) && rsp.data.length > 0) {
            let agrData = this.$refs.agrModal;

            if (agrData) {
              let raw = rsp.data || [];

              agrData.setDisplay(raw);
              this.displayData = raw;
              this.initTable1()
            }
            this.$refs.modalHistory.setSize('modal-lg');
            this.$refs.modalHistory.openModal();
          } else {
            $msg.alert('Info', 'ไม่พบข้อมูลประวัติสำหรับ Modal', 'info');
          }
        }
        if (event.col === 'active') {
          event.data.isEdit = 'Y';
        }
      },
    },
    computed: {
      isValidPendingParcel() {
        return this.newParcelData.pre_event_unit &&
          this.newParcelData.parcel_no;
      }
    },
    mounted() {
      page = this.$refs.page;
      if (page) {
        page.pageTitle = `Management Program`;
        document.title = page.pageTitle;
      }

      //const pagingArea = this.$refs.pagingArea;
      //if (pagingArea) {
      //  pagingArea.setCurrentPage(1);
      //  pagingArea.setItemsPerPage(50);
      //}

      this.$nextTick(() => {
        this.initTable();
        this.loadCustomerData();
      });
    }
  };
  export default cpn;
</script>
