<template>
  <div>
    <modal ref="centerModal" sheet-class="ct-sheet">
      <template #header>
        <h4><i class="fa fa-building-o"></i> ข้อมูลลูกค้า (AP)</h4>
      </template>
      <template #body>
        <div class="modal-search-bar">
          <div class="row">
            <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
              <div class="form-group">
                <label><i class="fa fa-search" style="margin-right:4px;"></i>{{ ui.search || 'Search' }}</label>
                <div class="input-group">
                  <input type="text" class="form-control input-sm" v-model.trim="retrieveSearch['search_text']" @keyup.enter="loadData" />
                  <span class="input-group-btn"><a class="btn btn-sm bg-navy" @click="loadData"><i class="fa fa-search"></i></a></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="view-toolbar">
          <div class="view-toggle">
            <button type="button" class="view-btn" :class="{'view-btn--active': viewMode === 'table'}" @click="viewMode = 'table'" title="Table View">
              <i class="fas fa-th-list"></i> <span>{{ ui.erp_table || 'Table' }}</span>
            </button>
            <button type="button" class="view-btn" :class="{'view-btn--active': viewMode === 'card'}" @click="viewMode = 'card'" title="Card View">
              <i class="fas fa-th-large"></i> <span>Card</span>
            </button>
          </div>
        </div>
        <div class="row" v-show="viewMode === 'table'">
          <div class="col-md-12">
            <ag-table ref="agr"
                      :footer="false"
                      @ready="initTable()"
                      @cell-clicked="sendData($event.data)"
                      @on-sort-changed="onGridSortChanged($event)"></ag-table>
          </div>
        </div>
        <div class="card-grid" v-show="viewMode === 'card'">
          <div class="item-card" v-for="x in displayData" :key="x.customer_code" @click="sendData(x)">
            <div class="item-card-avatar"><i class="fas fa-building"></i></div>
            <div class="item-card-body">
              <div class="item-card-top">
                <span class="item-card-code">{{x.customer_code}}</span>
              </div>
              <div class="item-card-sub" :title="x.name_th">{{x.name_th}}</div>
            </div>
          </div>
          <div v-if="!displayData || displayData.length === 0" class="card-empty">
            <i class="fas fa-inbox"></i>
            <span>{{ ui.erp_data_not_found || 'ไม่พบข้อมูล' }}</span>
          </div>
        </div>
        <loading-box ref="myLB"></loading-box>
      </template>
      <template #footer>
        <div class="pull-left">
          <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
        </div>
        <button type="button" class="btn btn-sm modal-close-btn" @click="closeModal()">
          <i class="fa fa-times"></i> {{ ui.csm_v2_close_window || 'ปิดหน้าต่าง' }}
        </button>
      </template>
    </modal>
  </div>
</template>

<script type="text/javascript">
import loadingBox from "../../Center/loading-box.vue";

  let paging = {}
  let loading = {}
  export default {
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui,
        retrieveSearch: {
          search_text: "",
        },
        respData: [],
        displayData: [],
        page_number: 1,
        sort_key: '',
        sort_type: 'asc',
        viewMode: 'table',
      };
    },
    components: {
      loadingBox,
    },
    methods: {
      openModal() {
        this.$refs.centerModal.openModal();
        this.loadData();
      },
      closeModal() {
        this.$refs.centerModal.closeModal();
      },
      async pageChange(pn) {
        pn = pn || 1;
        this.page_number = pn;
        paging.setCurrentPage(pn);
        this.displayData = $linq(this.respData).skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray();
        paging.createPagesArray();
        this.refreshGrid();
      },
      loadData() {
        (async () => {
          try {
            loading.show();

            let url = `CSM/Center/CM_Customer_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;

            for (var key in this.retrieveSearch) {
              url += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`;
            }

            let resp = await $xt.getServer(url);
            this.respData = resp.data.data_rows;
            this.displayData = this.respData;

            // Default เรียงข้อมูลจาก customer_code จากน้อยไปมาก
            this.fnDefaultSort(this.respData, 'customer_code');

            // รีเซ็ต sort_key เพื่อให้ไอคอนกลับเป็นเริ่มต้น
            this.sort_key = '';
            this.sort_type = 'asc';

            paging.setTotalItems(resp.data.total);
            if (!paging.getItemsPerPage()) {
              paging.setCurrentPage(1);
            }
            paging.createPagesArray();

            await this.$nextTick();
            await this.initTable();
            this.refreshGrid();

          } catch (ex) {
            $msg.alert(``, ex.toString(), `danger`);
          } finally {
            loading.hide();
          }
        })();
      },
      sendData(x) {
        this.$emit("send-data", x);
        this.closeModal();
      },
      onGridSortChanged(e) {
        let model = (e.model || [])[0]
        if (model) {
          this.updateSort(model.colId)
        }
      },
      updateSort(key) {
        this.fnSorting(this.respData, key);
      },
      fnSorting(arr, key) {
        if (this.sort_key != key) {
          this.sort_type = 'desc'  // เปลี่ยนจาก 'asc' เป็น 'desc' เพื่อให้เรียงจากมากไปน้อยก่อน
        } else {
          this.sort_type = this.sort_type == 'asc' ? 'desc' : 'asc'
        }
        this.sort_key = key

        const sorted = [...arr].sort(this.customSort(key));

        // ✅ เก็บไว้ใน respData ด้วย เพื่อใช้กับ pageChange()
        this.respData = sorted;

        // ✅ update displayData เฉพาะหน้าปัจจุบัน
        const paging_ = sorted.slice(paging.skipItems(), paging.skipItems() + paging.getItemsPerPage());
        this.displayData = paging_;

        paging.setTotalItems(arr.length || 1);

        let item = 1;
        this.displayData.forEach(f => {
          f.itemno = item++;
        });

        this.refreshGrid();
      },
      fnDefaultSort(arr, key) {
        // บังคับให้เรียงจากน้อยไปมากเสมอ
        const sorted = [...arr].sort((x, y) => {
          const aValue = x[key] ?? '';
          const bValue = y[key] ?? '';

          const getSortPriority = (str) => {
            const char = str?.toString().trim().charAt(0) || '';
            if (/^[!-/:-@[-`{-~]/.test(char)) return 1; // อักขระพิเศษ
            if (/^\d/.test(char)) return 2;             // ตัวเลข
            if (/^[A-Za-z]/.test(char)) return 3;        // ภาษาอังกฤษ
            if (/^[ก-ฮ]/.test(char)) return 4;           // ภาษาไทย
            return 5;                                    // อื่นๆ
          };

          const aPriority = getSortPriority(aValue);
          const bPriority = getSortPriority(bValue);

          if (aPriority !== bPriority) {
            return aPriority - bPriority; // น้อยไปมากเสมอ
          }

          return aValue.toString().localeCompare(bValue.toString(), 'th');
        });

        // ✅ เก็บไว้ใน respData ด้วย เพื่อใช้กับ pageChange()
        this.respData = sorted;

        // ✅ update displayData เฉพาะหน้าปัจจุบัน
        const paging_ = sorted.slice(paging.skipItems(), paging.skipItems() + paging.getItemsPerPage());
        this.displayData = paging_;

        paging.setTotalItems(arr.length || 1);

        let item = 1;
        this.displayData.forEach(f => {
          f.itemno = item++;
        });
      },
      customSort(a) {
        const getSortPriority = (str) => {
          const char = str?.toString().trim().charAt(0) || '';
          if (/^[!-/:-@[-`{-~]/.test(char)) return 1; // อักขระพิเศษ
          if (/^\d/.test(char)) return 2;             // ตัวเลข
          if (/^[A-Za-z]/.test(char)) return 3;        // ภาษาอังกฤษ
          if (/^[ก-ฮ]/.test(char)) return 4;           // ภาษาไทย
          return 5;                                    // อื่นๆ
        };

        return (x, y) => {
          // จัดการกรณี null, undefined
          const aValue = x[a] ?? '';
          const bValue = y[a] ?? '';

          const aPriority = getSortPriority(aValue);
          const bPriority = getSortPriority(bValue);

          if (aPriority !== bPriority) {
            // น้อยไปมาก: อักขระพิเศษ → 0-9 → A-Z → ก-ฮ
            // มากไปน้อย: ก-ฮ → A-Z → 0-9 → อักขระพิเศษ
            if (this.sort_type === 'asc') {
              return aPriority - bPriority;
            } else {
              return bPriority - aPriority;
            }
          }

          // ถ้าอยู่กลุ่มเดียวกัน ใช้ localeCompare
          if (this.sort_type === 'asc') {
            return aValue.toString().localeCompare(bValue.toString(), 'th');
          } else {
            return bValue.toString().localeCompare(aValue.toString(), 'th');
          }
        };
      },
      refreshGrid() {
        this.$nextTick(() => {
          let agr = this.$refs.agr
          if (agr) agr.setDisplay(this.displayData)
        })
      },
      initTable() {
        let agr = this.$refs.agr;
        if (!agr) return;

        let fields = [
          ['customer_code', this.ui.erp_code || 'Code', 'text', { width: 300, sortable: true, pinned: 'left' }],
          ['name_th', this.ui.erp_customer || 'Customer', 'text', { width: 550, sortable: true }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
      },

    },
    mounted() {
      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(15);
      loading = this.$refs.myLB;

      this.$refs.centerModal.setSize('modal-lg');
    }
  };
</script>

<style scoped>
  .view-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
  }

  .view-toggle {
    display: flex;
    align-items: center;
    background: #e8ecf2;
    border-radius: 8px;
    padding: 3px;
    gap: 2px;
  }

  .view-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    font-size: 11.5px;
    font-weight: 500;
    color: #6b7a90;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(.4,0,.2,1);
    outline: none;
    white-space: nowrap;
  }

  .view-btn i {
    font-size: 12px;
  }

  .view-btn:hover {
    color: #3d4a5c;
    background: rgba(255,255,255,.5);
  }

  .view-btn--active {
    color: #1e3a5f;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,.08);
    font-weight: 600;
  }

  .view-btn--active:hover {
    background: #fff;
    color: #1e3a5f;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 8px;
    padding: 2px 0;
    max-height: 420px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #d0d5dd transparent;
  }

  .card-grid::-webkit-scrollbar {
    width: 5px;
  }

  .card-grid::-webkit-scrollbar-thumb {
    background: #d0d5dd;
    border-radius: 3px;
  }

  .card-grid::-webkit-scrollbar-track {
    background: transparent;
  }

  .item-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid #edf0f5;
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
  }

  .item-card:hover {
    border-color: #b8d4f0;
    background: #f6faff;
    box-shadow: 0 2px 12px rgba(60,141,188,.1);
    transform: translateY(-1px);
  }

  .item-card-avatar {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #1e3a5f 0%, #02234e 100%);
    color: #fff;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .item-card-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .item-card-top {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .item-card-code {
    font-size: 12.5px;
    font-weight: 700;
    color: #1f2937;
  }

  .item-card-sub {
    font-size: 12px;
    color: #3d4a5c;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 20px;
    color: #b0bcc8;
    font-size: 13px;
    grid-column: 1 / -1;
  }

  .card-empty i {
    font-size: 28px;
    opacity: 0.35;
  }
</style>
