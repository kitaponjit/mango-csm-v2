<template>
  <div class="track-page">
    <re-page ref="page">
      <template slot="body">
        <div class="track-container">
          <!-- Fixed Header -->
          <div class="track-header">
            <div class="track-header__left">
              <div class="track-header__icon">
                <i class="fas fa-shipping-fast"></i>
              </div>
              <div>
                <h1 class="track-header__title">Track And Trace</h1>
                <p class="track-header__subtitle">ติดตามพัสดุ — ค้นหาและจัดการข้อมูลพัสดุทั้งหมด</p>
              </div>
            </div>
          </div>

          <!-- Fixed Toolbar -->
          <div class="track-toolbar">
            <div class="track-toolbar__row">
              <!-- โครงการหลัก -->
              <div class="track-field">
                <label class="track-label track-label--required">โครงการหลัก</label>
                <div class="track-input-group">
                  <input type="text" class="track-input" v-model="headerData['pre_event']" readonly placeholder="เลือกโครงการ..." />
                  <button class="track-btn-icon track-btn-icon--primary" @click="$refs.ct_project.openModal()"><i class="fa fa-search"></i></button>
                  <button class="track-btn-icon track-btn-icon--danger" @click="resetData('project')"><i class="fa fa-times"></i></button>
                </div>
              </div>
              <!-- ชื่อโครงการ -->
              <div class="track-field track-field--wide">
                <label class="track-label">ชื่อโครงการ</label>
                <input type="text" class="track-input track-input--readonly" v-model="headerData.pre_des" readonly />
              </div>
              <!-- โครงการย่อย -->
              <div class="track-field">
                <label class="track-label">โครงการย่อย</label>
                <div class="track-input-group">
                  <input type="text" class="track-input" v-model="headerData['pre_event_unit']" readonly placeholder="เลือก Unit/Phase..." />
                  <button class="track-btn-icon track-btn-icon--primary" @click="$refs.ct_project_unit.openModal()" :disabled="xt.isEmpty(headerData.pre_event)"><i class="fa fa-search"></i></button>
                  <button class="track-btn-icon track-btn-icon--danger" :disabled="xt.isEmpty(headerData.pre_event)" @click="resetData('phase')"><i class="fa fa-times"></i></button>
                </div>
              </div>
              <!-- ชื่อโครงการย่อย -->
              <div class="track-field track-field--wide">
                <label class="track-label">ชื่อย่อย</label>
                <input type="text" class="track-input track-input--readonly" v-model="headerData['pre_des_unit']" readonly />
              </div>
            </div>
            <div class="track-toolbar__row">
              <!-- ค้นหา -->
              <div class="track-field track-field--search">
                <label class="track-label">ค้นหาเลขพัสดุ</label>
                <div class="track-input-group">
                  <input type="text" class="track-input" v-model="searchArea.search_text" @keyup.enter="doSearch()" placeholder="พิมพ์เลขพัสดุ..." />
                  <button class="track-btn-icon track-btn-icon--primary" @click.prevent="doSearch()"><i class="fa fa-search"></i></button>
                </div>
              </div>
              <!-- ปุ่มลายเซ็น -->
              <div class="track-field track-field--action" v-if="selectedItems.length > 0 && is_showCol()">
                <button class="track-btn track-btn--navy" @click.prevent="Update_rec()">
                  <i class="fas fa-signature"></i> ลายเซ็นรับของ ({{ selectedItems.length }})
                </button>
              </div>
            </div>
            <!-- Tabs -->
            <div class="track-tabs">
              <button class="track-tab" :class="{ 'track-tab--active': tabActive === 0 }" @click="onChangeTab(0)">
                <img :src="baseUrl + 'Content/Images/Icon SVG/box-on-load.svg'" width="18" height="18" />
                <span>พัสดุรอดำเนินการ</span>
              </button>
              <button class="track-tab" :class="{ 'track-tab--active': tabActive === 1 }" @click="onChangeTab(1)">
                <img :src="baseUrl + 'Content/Images/Icon SVG/box-check.svg'" width="18" height="18" />
                <span>พัสดุเสร็จสิ้น</span>
              </button>
            </div>
          </div>

          <!-- Scrollable Body -->
          <div class="track-body">
            <!-- Tab: พัสดุรอดำเนินการ -->
            <div v-show="tabActive === 0">
              <ag-table ref="agr"
                        :footer="false"
                        :checkbox="is_showCol() ? 'true' : 'false'"
                        :sorting="false"
                        :scale="500"
                        @on-selected="selectPost($event)"
                        @cell-clicked="onCellClicked">
              </ag-table>
              <div class="track-pagination" v-show="!xt.isEmpty(headerData['pre_event'])">
                <pagination class="pull-left" ref="pagingPending" @page-change="pageChange($event.page, 'pending')"></pagination>
              </div>
            </div>

            <!-- Tab: พัสดุเสร็จสิ้น -->
            <div v-show="tabActive === 1">
              <ag-table ref="agr2"
                        :footer="false"
                        :scale="500"
                        @cell-clicked="onCellClicked">
              </ag-table>
              <div class="track-pagination" v-show="!xt.isEmpty(headerData['pre_event'])">
                <pagination class="pull-left" ref="pagingComplete" @page-change="pageChange($event.page, 'complete')"></pagination>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div class="track-loading" v-if="isLoading">
            <div class="track-loading__spinner">
              <i class="fa fa-circle-notch fa-spin"></i>
              <span>กำลังโหลด...</span>
            </div>
          </div>
        </div>
      </template>
    </re-page>


    <!-- Modal: Edit -->
    <modal-2 ref="editModal">
      <template #header>
        <h4><i class="fas fa-edit margin-r-10"></i>แก้ไขข้อมูลพัสดุ</h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-lg-6 col-md-6">
            <div class="form-group">
              <label>โครงการย่อย (Unit/Phase)</label>
              <div class="input-group">
                <input type="text" class="form-control input-sm" v-model="modalData.pre_event_unit" @keyup.enter="$refs.ct_project_unit_edit.openModal()" />
                <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click.prevent="$refs.ct_project_unit_edit.openModal()"><i class="fas fa-search"></i></button></span>
              </div>
            </div>
          </div>
          <div class="col-lg-6 col-md-6">
            <div class="form-group">
              <label>Tracking No</label>
              <input type="text" class="form-control input-sm" v-model="modalData.postid" readonly />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-6 col-md-6">
            <div class="form-group">
              <label>Date</label>
              <input type="text" class="form-control input-sm" v-model="modalData.add_date" readonly />
            </div>
          </div>
          <div class="col-lg-6 col-md-6">
            <div class="form-group">
              <label>House No</label>
              <input type="text" class="form-control input-sm" v-model="modalData.house_no" readonly />
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-sm btn-success" :disabled="isEditMo==='N'" @click="updateProject">
          <i class="fas fa-check margin-r-5"></i>ยืนยันข้อมูล
        </button>
      </template>
    </modal-2>

    <!-- Modal: Image -->
    <modal-2 ref="imageModal">
      <template #header>
        <h4><i class="fas fa-image margin-r-10"></i>รูปภาพพัสดุ</h4>
      </template>
      <template #body>
        <div class="text-center">
          <img v-if="selectedImage"
               :src="showPicture(selectedImage)"
               class="img-responsive"
               style="max-width: 100%; margin: 0 auto;"
               @error="handleImageError" />
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-sm" style="background-color: #f0f0f0; color: #555;" @click="$refs.imageModal.closeModal()">
          <i class="fas fa-times margin-r-5"></i>ปิด
        </button>
      </template>
    </modal-2>

    <!-- Modal: Signature -->
    <modal-2 ref="signatureModal">
      <template #header>
        <h4><i class="fas fa-signature margin-r-10"></i>รูปภาพลายเซ็น</h4>
      </template>
      <template #body>
        <div class="text-center">
          <img v-if="selectedSignature"
               :src="showSignaturePicture(selectedSignature)"
               class="img-responsive"
               style="max-width: 100%; margin: 0 auto;"
               @error="handleImageError" />
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-sm" style="background-color: #f0f0f0; color: #555;" @click="$refs.signatureModal.closeModal()">
          <i class="fas fa-times margin-r-5"></i>ปิด
        </button>
      </template>
    </modal-2>

    <!-- Modal: Update Status -->
    <modal-2 ref="editModalSt">
      <template #header>
        <h4><i class="fas fa-exchange-alt margin-r-10"></i>เปลี่ยนสถานะ</h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group">
              <label>Status</label>
              <select class="form-control input-sm" v-model="status_">
                <option value="Y">Active</option>
                <option value="C">Complete</option>
                <option value="N">Not Active</option>
                <option value="B">Send Back</option>
              </select>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-sm btn-success" @click="updateSts">
          <i class="fas fa-check margin-r-5"></i>ยืนยัน
        </button>
      </template>
    </modal-2>

    <!-- Modal: Add Signature -->
    <modal-2 ref="editModalRec">
      <template #header>
        <h4><i class="fas fa-signature margin-r-10"></i>เพิ่มลายเซ็นรับของ</h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group">
              <label><i class="fas fa-pen margin-r-5"></i>ลายเซ็น</label>
              <file-attach ref="attachAddadd_signFile"
                           document-type="CSM"
                           :show-upload-file="true"
                           :max-files="1">
              </file-attach>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-sm btn-success" @click="sign()">
          <i class="fas fa-check margin-r-5"></i>ยืนยัน
        </button>
      </template>
    </modal-2>




    <vue-project-list ref="ct_project" @send-data="sendComponent($event, 'project')"></vue-project-list>
    <vue-project-unit-list ref="ct_project_unit" :pre_event2="headerData['pre_event2']" :chk_code="chk_code" @send-data="sendComponent($event, 'project_unit')"></vue-project-unit-list>
    <vue-project-unit-list ref="ct_project_unit_edit" :pre_event2="headerData['pre_event2']" :chk_code="chk_code" @send-data="sendComponent($event, 'ct_project_unit_edit')"></vue-project-unit-list>
  </div>
</template>
<script>
  import PhotoSwipe from 'photoswipe';
  import 'photoswipe/style.css';

  let page = {};
  let pagingPending = {};
  let pagingComplete = {};
  let appForm = {};
  let cpn = {
    data() {
      return {
        xt: $xt,
        headerNameModal: "",
        auth,
        tabActive: 0,
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
        searchArea: {
          search_text: ""
        },
        pendingData: [],
        pendingDataDisplay: [],
        completedData: [],
        completedDataDisplay: [],
        selectedImage: null,
        selectedSignature: null,
        currentImageIndex: 0,
        totalImages: 1,
        area_code: [],
        baseUrl: [],
        chk_code: "Y",
        isEditMo: 'N',
        status_: '',
        selectedItems: [],
        pagePendingNumber: 1,
        pageCompleteNumber: 1,
        selectAll: false,
        configData: [],
        temp_h :''
      };
    },
    methods: {
      async sendComponent(e, type) {
        switch (type) {
          case "project":
            this.headerData.pre_event = e.pre_event;
            this.headerData.pre_event2 = e.pre_event2;
            this.headerData.pre_des = e.pre_des;
            this.headerData.ty = 'N';
            e.ty = 'N';
            // ลองค้นหาด้วย pre_event หลักก่อน หากไม่พบข้อมูลแล้วค้นหาด้วย pre_event_unit
            await this.loadParcelData(e);
            break;

          case "ct_project_unit_edit":
            this.modalData.pre_event = e.pre_event;
            this.modalData.pre_event_unit = e.pre_event;
            this.modalData.pre_event2 = e.pre_event2;
            this.modalData.house_no = e.house_number;
            this.isEditMo = 'Y'
            break;

          case "project_unit":
            this.headerData.pre_event_unit = e.pre_event;
            this.headerData.pre_des_unit = e.pre_des;
            this.headerData.ty = 'Y';
            e.ty = 'Y';
            // โหลดข้อมูลใหม่เมื่อเลือกโครงการย่อย
            await this.loadParcelData(e);
            break;
        }
      },
      async loadParcelData(preEvent) {
        try {
          this.isLoading = true;
          // Reset selected items when loading new data
          this.selectedItems = [];
          
          let action = `CSM/Data/Readlist_post?pre_event2=${encodeURIComponent(preEvent.pre_event2)}&pre_event=${encodeURIComponent(preEvent.pre_event)}&ty=${encodeURIComponent(preEvent.ty)}`;
          let rsp = await $xt.getServer(action);

          if (rsp.success && rsp.data && rsp.data.q) {
            
            // Map pending items with pre_event_unit
            const pendingItem = (rsp.data.q || [])
              .filter(item => item.post_status === 'Y' || item.post_status === 'N')
              .map((item, idx) => ({
                no: idx + 1,
                edit_pre_event: item.pre_event,
                pathpic: item.pathpic,
                add_dt: item.add_dt,
                postid: item.postid,
                pre_event: item.pre_event,
                pre_event2: item.pre_event2,
                pre_event_unit: item.pre_event_unit || item.pre_event,
                rec_dt: item.rec_dt,
                add_sign: item.add_sign,
                house_no: item.house_no,
                files_path: JSON.parse(item.files_path),
                post_status: item.post_status
              }));

            // Map completed items with pre_event_unit
            const completedItems = (rsp.data.q || [])
              .filter(item => item.post_status === 'C' || item.post_status === 'B')
              .map((item, idx) => ({
                no: idx + 1,
                edit_pre_event: item.pre_event,
                pathpic: item.pathpic,
                add_dt: item.add_dt,
                postid: item.postid,
                pre_event: item.pre_event,
                pre_event2: item.pre_event2,
                pre_event_unit: item.pre_event_unit || item.pre_event,
                rec_dt: item.rec_dt,
                add_sign: item.add_sign,
                house_no: item.house_no,
                files_path: JSON.parse(item.files_path)
              }));

            this.pendingDataDisplay = pendingItem;
            this.pendingData = pendingItem
            this.completedDataDisplay = completedItems;
            this.completedData = completedItems;

            // อัพเดทข้อมูลทั้งสองตารางพร้อมกัน
            // await this.$nextTick();
            this.$refs.agr.setDisplay(this.pendingDataDisplay);
            this.$refs.agr2.setDisplay(this.completedDataDisplay);

          } else {
            this.pendingDataDisplay = [];
            this.pendingData = [];
            this.completedDataDisplay = [];
            this.completedData = [];
            this.$refs.agr.setDisplay([]);
            this.$refs.agr2.setDisplay([]);
            throw new Error(rsp.error || 'Failed to load data');
          }

          this.pageChange(this.pagePendingNumber, 'pending');
          pagingPending.setTotalItems(rsp.data.total_tab1);
          if (!pagingPending.getItemsPerPage()) {
            pagingPending.setCurrentPage(1);
          }
          pagingPending.createPagesArray();
          this.$refs.agr.setDisplay(this.pendingDataDisplay);

          // Setup pagination for complete tab
          this.pageChange(this.pageCompleteNumber, 'complete');
          pagingComplete.setTotalItems(rsp.data.total_tab2);
          if (!pagingComplete.getItemsPerPage()) {
            pagingComplete.setCurrentPage(1);
          }
          pagingComplete.createPagesArray();

        } catch (ex) {
          $msg.alert('Error', ex.toString(), 'danger');
          this.pendingDataDisplay = [];
          this.pendingData = [];
          this.completedDataDisplay = [];
          this.completedData = [];
          this.$refs.agr.setDisplay([]);
          this.$refs.agr2.setDisplay([]);
        } finally {
          this.isLoading = false;
        }
      },
      async loadConfig() {
        let act = `CSM/Config/Config_ReadList`;
        let rsp = await $xt.getServer(act);
        this.configData = rsp.data;
        this.refreshTable();
      },
      async resetData(type) {
        this.searchArea.search_text = '';
        if (type === 'project') {
          let arr = ['pre_event', 'pre_des', 'pre_event_unit', 'pre_des_unit'];
          $linq(arr).foreach(f => this.headerData[f] = null);
          this.pendingDataDisplay = [];
          this.pendingData = [];
          this.completedDataDisplay = [];
          this.temp_h = '';
          this.completedData = [];
          this.selectedItems = []; // Reset selected items
          this.$refs.agr.setDisplay([]);
          this.$refs.agr2.setDisplay([]);
        } else if (type === 'phase') {
          // Only reset sub-project related fields
          let arr = ['pre_event_unit', 'pre_des_unit'];
          $linq(arr).foreach(f => this.headerData[f] = null);

          // Load data for main project
          if (this.headerData.pre_event && this.headerData.pre_event2) {
            await this.loadParcelData({
              pre_event: this.headerData.pre_event,
              pre_event2: this.headerData.pre_event2
            });
          }
        } else if (type === 'tab') {
        }
      },
      handleImageError(e) {
        e.target.style.display = 'none';
        $msg.alert('Error', 'ไม่สามารถโหลดรูปภาพได้', 'error');
      },
      async doSearch() {
        try {
          this.isLoading = true;
          const searchText = this.searchArea.search_text.trim().toLowerCase();

          if (!searchText) {
            // ถ้าไม่มีการค้นหา ให้กลับไปใช้ pagination ปกติ
            if (this.tabActive === 0) {
              // Reset pagination และ total items กลับเป็นค่าเดิม
              pagingPending.setTotalItems(this.pendingData.length);
              this.pageChange(1, 'pending');
            } else {
              // Reset pagination และ total items กลับเป็นค่าเดิม
              pagingComplete.setTotalItems(this.completedData.length);
              this.pageChange(1, 'complete');
            }
            return;
          }

          // Clear selected items เมื่อค้นหาใหม่
          this.selectedItems = [];

          if (this.tabActive === 0) {
            // กรองข้อมูลจาก pendingData (ข้อมูลต้นฉบับ) แทน pendingDataDisplay
            let filteredPending = this.pendingData.filter(item =>
              item.postid && item.postid.toLowerCase().includes(searchText)
            );
            
            // เรียงลำดับ no ใหม่ แต่เก็บ original_no สำหรับอ้างอิง
            filteredPending = filteredPending.map((item, index) => ({
              ...item,
              original_no: item.no,
              no: index + 1
            }));

            this.pendingDataDisplay = filteredPending;

            // Reset pagination กลับไปหน้า 1 และ set total items ตามผลลัพธ์การค้นหา
            this.pagePendingNumber = 1;
            pagingPending.setCurrentPage(1);
            pagingPending.setTotalItems(filteredPending.length);
            pagingPending.createPagesArray();
            
            this.$refs.agr.setDisplay(filteredPending);
          } else {
            // กรองข้อมูลจาก completedData (ข้อมูลต้นฉบับ) แทน completedDataDisplay
            let filteredCompleted = this.completedData.filter(item =>
              item.postid && item.postid.toLowerCase().includes(searchText)
            );
            
            // เรียงลำดับ no ใหม่ แต่เก็บ original_no สำหรับอ้างอิง
            filteredCompleted = filteredCompleted.map((item, index) => ({
              ...item,
              original_no: item.no,
              no: index + 1
            }));

            // Reset pagination กลับไปหน้า 1 และ set total items ตามผลลัพธ์การค้นหา
            this.pageCompleteNumber = 1;
            pagingComplete.setCurrentPage(1);
            pagingComplete.setTotalItems(filteredCompleted.length);
            pagingComplete.createPagesArray();
            
            // แสดงผลทั้งหมดที่กรองแล้ว (ไม่ใช้ pagination ในการค้นหา)
            this.$refs.agr2.setDisplay(filteredCompleted);
          }
        } catch (ex) {
          $msg.alert('Error', ex.toString(), 'danger');
        } finally {
          this.isLoading = false;
        }
      },
      onChangeTab(t) {
        this.tabActive = t;
        this.doSearch();
        // if (t == 0) {
        //   this.resetData('tab')
        // }
      },
      async onReadData(prioity_code) {
        try {
          page.loadingBox.show();
          let act = `csm/master/Priority_Read?prioity_code=${encodeURIComponent(prioity_code || '')}`;
          let rsp = await $xt.getServer(act);
          this.form = rsp.data;
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async initTable() {

        //Grid for Waiting
        let agr = this.$refs.agr;

        let bold_underline = { "font-weight": "bold" };
        let bold_style = (p) => (p?.data?.bold ? bold_underline : {});

        let fieldsWaiting = [];
        
        // แสดง checkbox column ตาม is_showCol()
        if (this.is_showCol()) {
          fieldsWaiting.push(['cc_select', '', 'checkbox', { width: 50, headerCheckboxSelection: true, checkboxSelection: true, pinned: 'left' }]);
        }
        
        // เพิ่ม field อื่นๆ
        fieldsWaiting.push(
          ["no", "No.", "text", { width: 80, align: "center" }],
          ["edit_pre_event", "Action", "text", {
            width: 100, align: "center", cellRenderer: () => { return `<a class="text-black"> <i class="fa fa-edit"></i> </a>`; }
          }],
          ["pathpic", "รูปภาพ", "text", { width: 100, align: "center", cellRenderer: () => { return `<a class="text-red"> <i class="fa fa-image"></i> </a>`; } }]
        );
        
        // แสดง post_status column ตาม is_showCol()
        if (this.is_showCol()) {
          fieldsWaiting.push(["post_status", "status", "text", { width: 100, align: "center", 
            cellRenderer: (params) => {
                let code = params.data.post_status || "";
                let text = params.data.job_priority_text;
                let cls = this.statusName(code);
                return `<div class='text-primary text-decoration-underline' style='cursor: pointer;'>${cls}</div>`;
              },
             }]);
        }
        
        // เพิ่ม field ที่เหลือ
        fieldsWaiting.push(
          ["add_dt", "เวลา", "datetime", { width: 300, align: "center", sortable: true }],
          ["postid", "เลขพัสดุ", "text", { width: 400, align: "center" }],
          ["pre_event_unit", "โครงการย่อย ( Unit/Phase )", "text", { flex: 1, align: "center" }],
          ["house_no", "บ้านเลขที่", "text", { flex: 1, align: "center" }]
        );

        //Grid for Complete
        let agr2 = this.$refs.agr2;
        let fieldsCompleted = [
          ["no", "No.", "text", { width: 80, align: "center" }],
          ["edit_pre_event", "Action", "text", {
            width: 100,
            align: "center",
            cellRenderer: () => {
              return `<a class="text-black"><i class="fa fa-edit"></i></a>`;
            }
          }],
          ["pathpic", "รูปภาพ", "text", {
            width: 100,
            align: "center",
            cellRenderer: () => {
              return `<a class="text-red"><i class="fa fa-image"></i></a>`;
            }
          }],
          ["add_dt", "เวลาเพิ่ม", "text", { width: 200, align: "center", sortable: true }],
          ["postid", "เลขพัสดุ", "text", { width: 200, align: "center" }],
          ["rec_dt", "เวลารับ", "text", { width: 200, align: "center", sortable: true }],
          ["add_sign", "ลายเซ็น", "text", {
            width: 100,
            align: "center",
            cellRenderer: () => {
              return `<a class="text-black"><i class="fa fa-pen"></i></a>`;
            }
          }],
          ["pre_event_unit", "โครงการย่อย (Unit/Phase)", "text", { flex: 1, align: "center" }],
          ["house_no", "บ้านเลขที่", "text", { flex: 1, align: "center" }]
        ];

        let headerWaiting = agr.createHeaderFromArray(fieldsWaiting);
        let headerCompleted = agr2.createHeaderFromArray(fieldsCompleted);

        agr.setHeader(headerWaiting);
        agr2.setHeader(headerCompleted)

        agr.setDisplay(this.pendingDataDisplay);
        agr2.setDisplay(this.completedDataDisplay)

        //this.grid_header = header;
      },
      handleImageAttached(files) {
        if (files && files.length > 0) {
          // Assuming the file-attach component returns an array of files with URLs
          this.newParcelData.image = files[0].url || files[0].path;
        }
      },
      handleSignatureAttached(files) {
        if (files && files.length > 0) {
          this.newParcelData.signature = files[0].url || files[0].path;
        }
      },
      editData(data) {
        this.modalData = {
          pre_event_unit: data.pre_event,
          pre_event2: data.pre_event2,
          postid: data.postid,
          add_date: data.add_dt,
          house_no: data.house_no,
          originalPostid: data.postid
        };
        this.isEditMo = 'N'
        this.$refs.editModal.openModal()
      },
      showPicture(path) {
        if (!path) {
          return '';
        }
        return window.dataServer + "Api/File/DownLoad?id=" + encodeURIComponent(path);
      },
      showSignaturePicture(path) {
        if (!path) {
          return '';
        }
        return window.dataServer + "Api/File/DownLoad?id=" + encodeURIComponent(path);
      },
      onCellClicked(event) {
        switch (event.col) {
          case 'pathpic':
            if (event.data.files_path) {
              this.viewImage(event.data.files_path);
            } else {
              $msg.alert('Info', 'ไม่พบข้อมูลรูปภาพ', 'info');
            }
            break;

          case 'add_sign':
            if (event.data.files_path) {
              const signatureImages = event.data.files_path.filter(file => file.select_pic === 'S');

              if (signatureImages.length > 0) {
                this.viewImage(signatureImages);
              } else {
                const allImagesAsSignature = event.data.files_path.map(file => ({
                  ...file,
                  select_pic: 'S'
                }));
                this.viewImage(allImagesAsSignature);
              }
            } else {
              $msg.alert('Info', 'ไม่พบข้อมูลลายเซ็น', 'info');
            }
            break;

          case 'edit_pre_event':
            this.temp_h = event.data.house_no||'';
            this.editData(event.data);
            break;

          case 'post_status':
            this.temp_h = event.data.house_no || '';
            this.editDatastatus(event.data);
            break;
          default:
            // Optional: handle unknown columns if needed
            break;
        }
      },
      async updateProject() {
        try {

          this.isLoading = true;

          if (!this.modalData.pre_event_unit ||!this.modalData.postid) {
   
            await $msg.alert(`Warning`, `กรุณากรอกข้อมูลให้ครบถ้วน`, `warning`);
            return;
          }
          if (!this.modalData.house_no) {
            await $msg.alert(`Warning`, `กรุณาเลือกโครงการที่มีบ้านเลขที่`, `warning`);
            return;
          }
          if (this.modalData.house_no === this.temp_h) {
            await $msg.alert(`Warning`, `บ้านเลขที่ซ้ำ`, `warning`);
            return;
          }
          const requestData = {
            model: this.modalData,
            tmp_h: this.temp_h
          };
          let action = `CSM/Data/Update_Postid`;
          const response = await $xt.postServerJson(action, requestData);

          if (response.success) {
            $msg.alert('Success', 'เปลี่ยนแปลงเลขพัสดุสำเร็จ', 'success');

            if (!this.headerData.pre_event_unit && this.headerData.pre_event2) {

              await this.loadParcelData({
                pre_event: this.headerData.pre_event_unit,
                pre_event2: this.headerData.pre_event2,
                ty: 'N'
              })
            }
            else if (this.headerData.pre_event_unit && this.headerData.pre_event2) {

              await this.loadParcelData({
                pre_event: response.data.pre_event,
                pre_event2: this.headerData.pre_event2,
                ty: 'Y'
              })
            }
            this.$refs.editModal.closeModal()
          } else {
            
            await $msg.alert(`Warning`, response.error ||`Failed to update post id`, `warning`);
          }
        } catch (ex) {
          $msg.alert('Error', ex.toString(), 'danger');
        } finally {
          this.isLoading = false;
        }
      },
      viewImage(source) {
        if (!source || !Array.isArray(source) || source.length == 0) {
          $msg.alert('Info', 'ไม่พบข้อมูลรูปภาพ', 'info');
          return;
        }

        // Filter parcel and signature images based on select_pic
        // If source already contains filtered images (like signatures), use them directly
        let imagesToShow;
        if (source.every(file => file.select_pic === 'S')) {
          // All images are signatures, show them
          imagesToShow = source;
        } else {
          // Filter for parcel images (default behavior)
          imagesToShow = source.filter(file => !file.select_pic || file.select_pic === 'P');
        }

        if (imagesToShow.length === 0) {
          $msg.alert('Info', 'ไม่พบรูปภาพ', 'info');
          return;
        }

        const modifiedSource = imagesToShow.map(file => {
          const ext = this.getFileExt(file.pathto || '').toLowerCase();
          const fileTypes = {
            mp4: 'fa-file-video',
            doc: 'fa-file-word',
            docx: 'fa-file-word',
            xls: 'fa-file-excel',
            xlsx: 'fa-file-excel',
            ppt: 'fa-file-powerpoint',
            pptx: 'fa-file-powerpoint',
            pdf: 'fa-file-pdf'
          };

          const isImage = ['jpg', 'jpeg', 'png'].includes(ext);
          const isKnownDoc = Object.keys(fileTypes).includes(ext);


          // แบบพิเศษ: item_type === 'T' → แบ่งซ้ายขวา
          if (file.item_type === 'T') {
            let leftContent = '';

            if (isImage) {
              leftContent = `<img src="${file.src}" alt="${file.alt}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />`;
            } else if (isKnownDoc) {
              leftContent = `<i class="fas ${fileTypes[ext]} fa-7x" style="color: #666;"></i>`;
            } else {
              leftContent = `<i class="fa fa-file fa-7x" style="color: #999;"></i>`;
            }

            return {
              html: `
                <div style="display: flex; flex-direction: row; width: 80vw; height: 60vh; margin: auto; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 0 15px rgba(0,0,0,0.3);">
                  <div style="flex: 1; display: flex; justify-content: center; align-items: center; background: #f4f4f4;">
                    ${leftContent}
                  </div>
                  <div style="flex: 1; padding: 20px; overflow-y: auto; background: #fff; color: #333;">
                    <h4>รายละเอียด</h4>
                    <p>${file.description || file.alt || 'ไม่มีรายละเอียด'}</p>
                  </div>
                </div>
              `,
              isIcon: false,
              alt: file.alt,
              src2: file.src
            };
          }

          // ปกติ: แสดงภาพ
          //if (isImage) {
          return {
            html: `<img src="${window.dataServer}/Api/File/DownLoad?id=${file.pathto}" alt="${file.alt}" style="background-color: white; max-width: 600px; max-height: 400px; width: auto; height: auto; object-fit: contain; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);"/>`,
            isIcon: false,
            alt: file.alt,
            src2: file.src
          };

          //}
        });


        const options = {
          dataSource: modifiedSource,
          showHideAnimationType: 'none'
        };

        const pswp = new PhotoSwipe(options);

        pswp.on('uiRegister', function () {
          pswp.ui.registerElement({
            name: 'bulletsIndicator',
            className: 'pswp__bullets-indicator',
            appendTo: 'wrapper',
            onInit: (el, pswp) => {
              const bullets = [];
              let bullet;
              let prevIndex = -1;

              for (let i = 0; i < pswp.getNumItems(); i++) {
                bullet = document.createElement('div');
                bullet.className = 'pswp__bullet';
                bullet.onclick = (e) => {
                  pswp.goTo(bullets.indexOf(e.target));
                };
                el.appendChild(bullet);
                bullets.push(bullet);
              }

              pswp.on('change', () => {
                if (prevIndex >= 0) {
                  bullets[prevIndex].classList.remove('pswp__bullet--active');
                }
                bullets[pswp.currIndex].classList.add('pswp__bullet--active');
                prevIndex = pswp.currIndex;
              });
            }
          });

          pswp.ui.registerElement({
            name: 'download-button',
            order: 8,
            isButton: true,
            tagName: 'a',
            html: {
              isCustomSVG: true,
              inner: '<path d="M20.5 14.3 17.1 18V10h-2.2v7.9l-3.4-3.6L10 16l6 6.1 6-6.1ZM23 23H9v2h14Z" id="pswp__icn-download"/>',
              outlineID: 'pswp__icn-download'
            },
            onInit: (el, pswp) => {
              el.setAttribute('download', '');
              el.setAttribute('target', '_blank');
              el.setAttribute('rel', 'noopener');

              pswp.on('change', () => {
                const currSrc = pswp.currSlide.data.src2;
                if (currSrc) {
                  el.href = currSrc;
                } else {
                  el.href = pswp.currSlide.data.src;
                }
              });
            }
          });

          pswp.ui.registerElement({
            name: 'custom-caption',
            order: 9,
            isButton: false,
            appendTo: 'root',
            html: 'Caption text',
            onInit: (el, pswp) => {
              pswp.on('change', () => {
                const currSlideElement = pswp.currSlide.data.alt;
                el.innerHTML = currSlideElement || '';
              });
            }
          });
        });

        pswp.init();
      },
      getFileExt(f) {
        return f?.split('.').pop().toLowerCase()
      },
      editDatastatus(data) {
        this.modalData = {
          pre_event_unit: data.pre_event,
          pre_event: data.pre_event,
          pre_event2: data.pre_event2,
          postid: data.postid,
          add_date: data.add_dt,
          house_no: data.house_no,
          originalPostid: data.postid
        };
        this.$refs.editModalSt.openModal()
      },
      async updateSts() {
        try {

          this.isLoading = true;

          if (!this.modalData.pre_event_unit ||
            !this.modalData.postid) {
            throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
          }
          let requestData = {
            model: this.modalData,
            status_: this.status_
          };
          let action = `CSM/Data/Update_Status`;
          let response = await $xt.postServerJson(action, requestData);

          if (response.success) {
            $msg.alert('Success', 'เปลี่ยนแปลงเลขพัสดุสำเร็จ', 'success');

            if (this.headerData.pre_event && this.headerData.pre_event2) {
              await this.loadParcelData({
                pre_event: this.modalData.pre_event_unit,
                pre_event2: this.modalData.pre_event2,
                ty: 'Y'
              })
            }
            this.$refs.editModalSt.closeModal()
          } else {
            throw new Error(response.error || 'Failed to update post id');
          }
        } catch (ex) {
          $msg.alert('Error', ex.toString(), 'danger');
        } finally {
          this.isLoading = false;
          this.status_ = '';
          if (this.headerData.pre_event && this.headerData.pre_event2) {
            await this.loadParcelData({
              pre_event: this.headerData.pre_event,
              pre_event2: this.headerData.pre_event2
            });
          }
        }
      },
      selectProject(event) {
        let agr = this.$refs.agr

        var promise = new Promise(async (rs, rj) => {
          let e = event || []
          if (e.selected) {
            this.selectedItems.push(e.items)
          }
          else {
            this.selectedItems = $linq(this.selectedItems).where(w => !(w.pre_event == e.items.pre_event && w.postid == e.items.postid)).toArray() || []
          }

          rs(true)
        })

        promise.then((value) => {
          if (value) {
            let rows_data = []
            agr.topGridOptions.api.forEachNode((node) => {
              let found = $linq(this.selectedItems).any(a => a.pre_event == node.data.pre_event && a.postid == node.data.postid)
              node.selected = found
              node.setSelectedInitialValue(node.selected)

              rows_data.push(node.data)
            })
            agr.topGridOptions.api.applyTransaction({ update: rows_data })
          }
        })
      },
      async selectPost(e){
        let data = e.data;
        
        // ตรวจสอบว่าเป็นการเลือกทั้งหมด (Select All) หรือไม่
        let isHeaderCheckbox = e.isSelectAll || (data.length === this.pendingDataDisplay.length && this.pendingDataDisplay.length > 0);
        
        if (isHeaderCheckbox) {
          if (e.selected) {
            // เลือกทั้งหมด - ใช้ pendingDataDisplay (ผลการค้นหา) แทน pendingData
            this.pendingDataDisplay.forEach(displayItem => {
              // ใช้ postid + house_no หาข้อมูลต้นฉบับ (เพราะ postid อาจซ้ำได้)
              let originalItem = $linq(this.pendingData).where(w => 
                w.postid == displayItem.postid && w.house_no == displayItem.house_no
              ).firstOrDefault();
              
              if (originalItem) {
                // ตรวจสอบด้วย postid + house_no
                let exists = $linq(this.selectedItems).any(a => 
                  a.postid == originalItem.postid && a.house_no == originalItem.house_no
                );
                if (!exists) {
                  this.selectedItems.push({ 
                    add_dt: originalItem.add_dt,
                    add_sign: originalItem.add_sign,
                    edit_pre_event: originalItem.edit_pre_event,
                    files_path: originalItem.files_path,
                    house_no: originalItem.house_no,
                    no: originalItem.no,
                    pathpic: originalItem.pathpic,
                    postid: originalItem.postid,
                    pre_event: originalItem.pre_event,
                    pre_event2: originalItem.pre_event2,
                    pre_event_unit: originalItem.pre_event_unit,
                    rec_dt: originalItem.rec_dt,
                    post_status: originalItem.post_status
                  });
                }
              }
            });
            
          } else {
            this.selectedItems = [];
          }
        } else {
          // การเลือกแต่ละรายการ
          if (e.selected) {
            // เพิ่มรายการที่เลือก - ใช้ postid + house_no
            data.forEach(f => {
              let originalItem = $linq(this.pendingData).where(w => 
                w.postid == f.postid && w.house_no == f.house_no
              ).firstOrDefault();
              
              if (originalItem) {
                let exists = $linq(this.selectedItems).any(a => 
                  a.postid == originalItem.postid && a.house_no == originalItem.house_no
                );
                if (!exists) {
                  this.selectedItems.push({ 
                    add_dt: originalItem.add_dt,
                    add_sign: originalItem.add_sign,
                    edit_pre_event: originalItem.edit_pre_event,
                    files_path: originalItem.files_path,
                    house_no: originalItem.house_no,
                    no: originalItem.no,
                    pathpic: originalItem.pathpic,
                    postid: originalItem.postid,
                    pre_event: originalItem.pre_event,
                    pre_event2: originalItem.pre_event2,
                    pre_event_unit: originalItem.pre_event_unit,
                    rec_dt: originalItem.rec_dt,
                    post_status: originalItem.post_status
                  });
                }
              }
            });
          } else {
            // ลบรายการที่ยกเลิกการเลือก - ใช้ postid + house_no
            data.forEach(f => {
              this.selectedItems = $linq(this.selectedItems).where(w => 
                !(w.postid == f.postid && w.house_no == f.house_no)
              ).toArray() || [];
            });
          }
        }
        
        // ลบ duplicate items โดยใช้ postid + house_no
        this.selectedItems = $linq(this.selectedItems).distinctBy(d => d.postid + '|' + d.house_no).toArray();

        if (data.length == 0 && !isHeaderCheckbox) {
          this.selectedItems = []
        }
      },
      Update_rec() {
        this.$refs.editModalRec.openModal()
      },
      async sign() {
        let signFiles = this.$refs.attachAddadd_signFile.attachFile || [];
        if (signFiles.length === 0) {
          $msg.alert('คำเตือน', 'กรุณาแนบลายเซ็นก่อนทำรายการ', 'warning');
          return; 
        }
        let f = {
          header: this.selectedItems,
          signrec: signFiles.length > 0 ? signFiles[0].pathto : null,
          signDoc: signFiles.length > 0 ? signFiles : null,
        }
        try {
          // Call API
          let action = 'CSM/Data/Sign_Receipt';
          const response = await $xt.postServerJson(action, f);

          if (response.success) {
            $notify.success('success')
          } else {
            throw new Error(response.error || 'Failed to save parcel');
          }
        } catch (ex) {
          $msg.alert('Error', ex.toString(), 'danger');
        } finally {
          this.$refs.editModalRec.closeModal();
          this.selectedItems = [];
          // this.$refs.attachAddadd_signFile.clearFiles();
           if (this.headerData.pre_event && this.headerData.pre_event2) {
            await this.loadParcelData({
              pre_event: this.headerData.pre_event,
              pre_event2: this.headerData.pre_event2
            });
          }
        }
      },
      //// checkpoint
      pageChange(pn, pt) {
        switch (pt) {
          case 'pending':
            pn = pn || 1;
            this.pagePendingNumber = pn;
            pagingPending.setCurrentPage(pn);
            this.pendingDataDisplay = $linq(this.pendingData).skip(pagingPending.skipItems()).take(pagingPending.getItemsPerPage()).toArray();
            pagingPending.createPagesArray();
            this.$refs.agr.setDisplay(this.pendingDataDisplay);
            
            // อัพเดทสถานะ checkbox โดยใช้ postid + house_no
            this.$nextTick(() => {
              if (this.$refs.agr && this.$refs.agr.topGridOptions && this.$refs.agr.topGridOptions.api) {
                this.$refs.agr.topGridOptions.api.forEachNode((node) => {
                  let isSelected = $linq(this.selectedItems).any(a => 
                    a.postid == node.data.postid && a.house_no == node.data.house_no
                  );
                  node.setSelected(isSelected);
                });
              }
            });
            break;
          case 'complete':
            pn = pn || 1;
            this.pageCompleteNumber = pn;
            pagingComplete.setCurrentPage(pn);
            this.completedDataDisplay = $linq(this.completedData).skip(pagingComplete.skipItems()).take(pagingComplete.getItemsPerPage()).toArray();
            pagingComplete.createPagesArray();
            this.$refs.agr2.setDisplay(this.completedDataDisplay);
            break;
        }
      },
      is_showCol() {
        let isShow = $linq(this.configData).where(x => x.config_id == 'POST001').select(x => x.config_value).firstOrDefault()
        
        return isShow == 'Y' ? true : false
      },
      refreshTable() {
        // รีเฟรชการตั้งค่าตาราง
        this.initTable();
        
        // ถ้ามีข้อมูลอยู่แล้ว ให้แสดงผลใหม่
        if (this.pendingDataDisplay.length > 0) {
          this.$refs.agr.setDisplay(this.pendingDataDisplay);
        }
        if (this.completedDataDisplay.length > 0) {
          this.$refs.agr2.setDisplay(this.completedDataDisplay);
        }
      },
    },
    computed: {
      isValidPendingParcel() {
        return this.newParcelData.pre_event_unit &&
          this.newParcelData.parcel_no;
      },

      isValidCompletedParcel() {
        return this.newParcelData.pre_event_unit &&
          this.newParcelData.parcel_no &&
          this.newParcelData.recv_date;
      },
      statusName() {
        return (code) => {
          switch (code) {
            case 'Y':
              return 'Active'; 
            case 'C':
              return 'Complete'; 
            case 'N':
              return 'Not Active'; 
            case 'B':
              return 'Send Back'; 
          }
        };
      }
    },
    mounted() {
      page = this.$refs.page;
      if (page) {
        page.pageTitle = `Track And Trace : ติดตามพัสดุ`;
        document.title = page.pageTitle;
      }

      pagingPending = this.$refs.pagingPending;
      if (pagingPending) {
        pagingPending.setCurrentPage(1);
        pagingPending.setItemsPerPage(50);
      }

      pagingComplete = this.$refs.pagingComplete;
      if (pagingComplete) {
        pagingComplete.setCurrentPage(1);
        pagingComplete.setItemsPerPage(50);
      }

      this.loadConfig();
      // เรียกใช้ initTable หลังจาก loadConfig เสร็จ
      // initTable จะถูกเรียกอัตโนมัติใน refreshTable() ของ loadConfig()
      
    }
  }
  export default cpn;
</script>

<style scoped>
  .track-page {
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .track-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  /* Header */
  .track-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: linear-gradient(135deg, #0f2744 0%, #1e4078 50%, #2563eb 100%);
    flex-shrink: 0;
  }

  .track-header__left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .track-header__icon {
    width: 44px;
    height: 44px;
    background: rgba(255,255,255,0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #fff;
  }

  .track-header__title {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin: 0;
  }

  .track-header__subtitle {
    font-size: 12px;
    color: rgba(255,255,255,0.75);
    margin: 2px 0 0;
  }

  /* Toolbar */
  .track-toolbar {
    padding: 16px 24px 0;
    background: #fff;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
  }

  .track-toolbar__row {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .track-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 180px;
  }

  .track-field--search {
    min-width: 260px;
  }

  .track-field--wide {
    min-width: 280px;
    flex: 1;
  }

  .track-field--action {
    justify-content: flex-end;
  }

  .track-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .track-label--required::after {
    content: ' *';
    color: #dc2626;
  }

  .track-input {
    padding: 8px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    color: #1e293b;
    transition: all 0.2s;
    background: #fff;
    width: 100%;
  }

  .track-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }

  .track-input::placeholder { color: #94a3b8; }

  .track-input--readonly {
    background: #f8fafc;
    color: #64748b;
  }

  .track-input-group {
    display: flex;
    gap: 4px;
  }

  .track-input-group .track-input { flex: 1; }

  .track-btn-icon {
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    font-size: 13px;
  }

  .track-btn-icon:disabled { opacity: 0.4; cursor: not-allowed; }
  .track-btn-icon--primary { background: #2563eb; color: #fff; }
  .track-btn-icon--primary:hover:not(:disabled) { background: #1d4ed8; }
  .track-btn-icon--danger { background: #fee2e2; color: #dc2626; }
  .track-btn-icon--danger:hover:not(:disabled) { background: #dc2626; color: #fff; }

  .track-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .track-btn--navy {
    background: #1e3a5f;
    color: #fff;
  }

  .track-btn--navy:hover {
    background: #0f2744;
    box-shadow: 0 2px 8px rgba(15,39,68,0.3);
  }

  /* Tabs */
  .track-tabs {
    display: flex;
    gap: 4px;
    padding-top: 8px;
  }

  .track-tab {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border: none;
    background: transparent;
    color: #64748b;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 6px 6px 0 0;
    transition: all 0.2s;
    position: relative;
  }

  .track-tab:hover { color: #2563eb; background: #f1f5f9; }

  .track-tab--active {
    color: #2563eb;
    background: #fff;
    font-weight: 600;
  }

  .track-tab--active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background: #2563eb;
    border-radius: 3px 3px 0 0;
  }

  /* Body */
  .track-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px 24px;
    background: #fff;
  }

  .track-body::-webkit-scrollbar { width: 8px; }
  .track-body::-webkit-scrollbar-track { background: #f1f5f9; }
  .track-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  .track-body::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  .track-pagination {
    margin-top: 12px;
  }

  /* Loading */
  .track-loading {
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  .track-loading__spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: #2563eb;
    font-size: 14px;
    font-weight: 500;
  }

  .track-loading__spinner i { font-size: 32px; }

  /* PhotoSwipe */
  .pswp__bullets-indicator {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translate(-50%, 0);
  }

  .pswp__bullet {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
    margin: 0 4px;
  }

  .pswp__bullet--active { background: #2563eb; }

  .pswp__custom-caption {
    background: #2563eb !important;
    font-size: 14px;
    color: #fff;
    width: calc(100% - 32px);
    max-width: 400px;
    padding: 4px 12px;
    border-radius: 6px;
    position: absolute;
    left: 50%;
    bottom: 60px;
    transform: translateX(-50%);
  }

  .pswp__custom-caption a { color: #fff; text-decoration: underline; }

  @media (max-width: 992px) {
    .track-toolbar__row { flex-direction: column; align-items: stretch; }
    .track-field { min-width: 100%; }
  }
</style>

<style>
  .content-body { overflow-y: hidden !important; }
</style>
