<template>
  <div>
    <div class="modal fade" ref="CMCustomerModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h4><i class="fas fa-box-open"></i> Job Details</h4>
          </div>
          <div class="modal-body">
            <div class="modal-search-bar">
              <div class="row">
                <div class="col-lg-3 col-md-2 col-sm-2">
                  <div class="form-group">
                    <label><i class="fa fa-search" style="margin-right:4px;"></i>Search</label>
                    <div class="input-group">
                      <input type="text" class="form-control input-sm" v-model.trim="retrieveSearch['search_text']" @keyup.enter="doSearch()" />
                      <span class="input-group-btn"><a class="btn btn-sm bg-navy" @click="doSearch()"><i class="fa fa-search"></i></a></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <ag-table ref="agr"
                          :footer="false"
                          @ready="initTable()"
                          @cell-clicked="sendData($event.data)"
                          @on-sort-changed="onGridSortChanged($event)"></ag-table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
            <button type="button" class="btn btn-sm btn-danger" data-dismiss="modal"><i class="fa fa-remove"></i> ปิดหน้าต่าง</button>
          </div>
        </div>
      </div>
    </div>
    <loading-box ref="myLB"></loading-box>
  </div>
</template>

<script type="text/javascript">
import loadingBox from "../../../../../../Center/loading-box.vue";

  let paging = {}
  let loading = {}
  export default {
    props: {
      preEvent: {
        type: String,
        default: ''
      },
      checkRight: {
        type: String,
        default: null
      },
    },
    data() {
      return {
        baseUrl,
        xt: $xt,
        baseRoute,
        queryString,
        ui,
        retrieveSearch: {
          search_text: "",
          field: '',
          text:''
        },
        respData: [],
        page_number: 1,
        sort_key: '',
        sort_type: 'asc',
        jobarr: [],
      };
    },
    components: {
      loadingBox,
    },
    methods: {
      openModal() {
        (async () => {
          if (this.$refs.CMCustomerModal) {
            document.body.appendChild(this.$refs.CMCustomerModal)
          }
          $(this.$refs.CMCustomerModal).modal('show');
          // await this.loadData();
          await this.loadProjectToJob(this.preEvent);
        })();
      },
      closeModal() {
        $(this.$refs.CMCustomerModal).modal('hide');
      },
      async pageChange(pn) {
        pn = pn || 1;
        this.page_number = pn;
        paging.setCurrentPage(pn);

        // ใช้ respData ทั้งหมดถ้ายังไม่ได้ค้นหา
        let dataSource = this.retrieveSearch['search_text']
          ? $linq(this.respData)
              .where(w =>
                (w.jobcode && w.jobcode.toLowerCase().includes(this.retrieveSearch['search_text'].toLowerCase())) ||
                (w.jobname && w.jobname.toLowerCase().includes(this.retrieveSearch['search_text'].toLowerCase()))
              )
              .toArray()
          : this.respData;

        this.jobarr = $linq(dataSource).skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray();

        paging.setTotalItems(dataSource.length || 1);
        paging.createPagesArray();
        this.refreshGrid();
      },
      async loadProjectToJob(pre_event, jobcode = '') {
        await $xt.sleep(200)
        let url = ''
        if (!$xt.isEmpty(pre_event)) {
          url = `Anywhere/Center/ProjectToJob?pre_event=${pre_event}`
        }
        else {
          url = `Anywhere/Center/JobList?field=${this.retrieveSearch.field || ''}&text=${encodeURIComponent(this.retrieveSearch.text || '')}`
          for (var key in this.retrieveSearch) {
            url += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`
          }
          url += `&type=${this.checkRight || 1}`
        }
        let rsp = await $xt.getServer(url)

        rsp.data.forEach(f => {
          f.job = f.jobcode
          f.jobname = f.jobname_s || f.jobname
        })
        this.respData = rsp.data;
        this.jobarr = this.respData

        this.pageChange(1)
        paging.setTotalItems(rsp.data.length || 1);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();
      },
      sendData(x) {
        this.$emit("select-job", x);
        this.$emit("send-data", x);
        this.closeModal();
      },
      async updateSort(key) {
        await this.fnSorting(this.respData, key);
      },

      getSortIcon(column) {
        if (this.sort_key !== column) {
          return 'fas fa-sort'; // ไอคอนเริ่มต้น
        }
        return this.sort_type === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
      },

      fnSorting(arr, key) {
        if (this.sort_key !== key) {
          this.sort_type = 'asc'; // เริ่มจากน้อย → มาก
        } else {
          this.sort_type = this.sort_type === 'asc' ? 'desc' : 'asc';
        }
        this.sort_key = key;

        // 🔽 เรียงข้อมูล
        const sorted = [...arr].sort(this.jobSort(key));

        // เก็บไว้ใน respData เพื่อให้ใช้ร่วมกับ search/pageChange
        this.respData = sorted;

        // แสดงผลเฉพาะหน้าปัจจุบัน
        this.jobarr = sorted.slice(paging.skipItems(), paging.skipItems() + paging.getItemsPerPage());

        paging.setTotalItems(sorted.length || 1);

        let item = 1;
        this.jobarr.forEach(f => {
          f.itemno = item++;
        });

        this.refreshGrid();
      },

      fnDefaultSort(arr, key) {
        const sorted = [...arr].sort((x, y) => {
          const aValue = x[key] ?? '';
          const bValue = y[key] ?? '';

          const getSortPriority = (str) => {
            const char = str?.toString().trim().charAt(0) || '';
            if (/^[!-/:-@[-`{-~]/.test(char)) return 1; // อักขระพิเศษ
            if (/^\d/.test(char)) return 2;             // ตัวเลข
            if (/^[A-Za-z]/.test(char)) return 3;       // ภาษาอังกฤษ
            if (/^[ก-ฮ]/.test(char)) return 4;          // ภาษาไทย
            return 5;
          };

          const aPriority = getSortPriority(aValue);
          const bPriority = getSortPriority(bValue);

          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }

          return aValue.toString().localeCompare(bValue.toString(), 'th');
        });

        this.respData = sorted;
        this.jobarr = sorted.slice(paging.skipItems(), paging.skipItems() + paging.getItemsPerPage());
        paging.setTotalItems(sorted.length || 1);

        let item = 1;
        this.jobarr.forEach(f => {
          f.itemno = item++;
        });
      },

      jobSort(key) {
        const getSortPriority = (str) => {
          const char = str?.toString().trim().charAt(0) || '';
          if (/^[!-/:-@[-`{-~]/.test(char)) return 1; // อักขระพิเศษ
          if (/^\d/.test(char)) return 2;             // ตัวเลข
          if (/^[A-Za-z]/.test(char)) return 3;       // ภาษาอังกฤษ
          if (/^[ก-ฮ]/.test(char)) return 4;          // ภาษาไทย
          return 5;
        };

        return (x, y) => {
          const aValue = x[key] ?? '';
          const bValue = y[key] ?? '';

          const aPriority = getSortPriority(aValue);
          const bPriority = getSortPriority(bValue);

          if (aPriority !== bPriority) {
            return this.sort_type === 'asc'
              ? aPriority - bPriority
              : bPriority - aPriority;
          }

          return this.sort_type === 'asc'
            ? aValue.toString().localeCompare(bValue.toString(), 'th')
            : bValue.toString().localeCompare(aValue.toString(), 'th');
        };
      },

      doSearch() {
        let searchText = this.retrieveSearch['search_text']?.trim().toLowerCase() || '';

        if (searchText === '') {
          // ถ้าไม่ได้กรอกอะไร ให้คืนค่าเป็นข้อมูลทั้งหมด
          this.jobarr = $linq(this.respData)
            .skip(paging.skipItems())
            .take(paging.getItemsPerPage())
            .toArray();
          paging.setTotalItems(this.respData.length || 1);
        } else {
          // กรองข้อมูลจาก respData
          let filtered = $linq(this.respData)
            .where(w =>
              (w.jobcode.toLowerCase().includes(searchText)) ||
              (w.jobname.toLowerCase().includes(searchText))
            )
            .toArray();

          this.jobarr = filtered.slice(0, paging.getItemsPerPage()); // ให้หน้าแรกเริ่มจากผลลัพธ์
          paging.setTotalItems(filtered.length || 1);
        }

        // รีเซ็ตให้กลับไปหน้าแรก
        this.pageChange(1);
      },

      onGridSortChanged(e) {
        let model = (e.model || [])[0]
        if (model) {
          this.updateSort(model.colId)
        }
      },
      refreshGrid() {
        this.$nextTick(() => {
          let agr = this.$refs.agr
          if (agr) agr.setDisplay(this.jobarr)
        })
      },
      initTable() {
        let agr = this.$refs.agr
        if (!agr) return

        let fields = [
          ['jobcode', 'Job Code', 'text', { width: 200, sortable: true, pinned: 'left' }],
          ['jobname', 'Job Name', 'text', { width: 420, sortable: true }],
        ]

        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)
        this.refreshGrid()
      },

    },
    mounted() {
      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(15);
      loading = this.$refs.myLB;
    },
    beforeDestroy() {
      if (this.$refs.CMCustomerModal && this.$refs.CMCustomerModal.parentNode === document.body) {
        $(this.$refs.CMCustomerModal).modal('hide')
        document.body.removeChild(this.$refs.CMCustomerModal)
      }
    }
  };
</script>
