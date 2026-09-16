<template>
  <div class="parcel-create-page">
    <re-page ref="page">
      <template #body>
        <div class="parcel-container">
          <!-- Page Header -->
          <div class="parcel-header">
            <div class="parcel-header__icon">
              <i class="fas fa-box-open"></i>
            </div>
            <div class="parcel-header__text">
              <h1 class="parcel-header__title">สร้างข้อมูลพัสดุ</h1>
              <p class="parcel-header__subtitle">Create Parcel — กรอกข้อมูลพัสดุใหม่เข้าสู่ระบบ</p>
            </div>
          </div>

          <!-- Form Card - Scrollable Body -->
          <div class="parcel-form-card">
            <div class="parcel-form-body">
            <!-- Section 1: โครงการ -->
            <div class="parcel-section">
              <div class="parcel-section__header">
                <span class="parcel-section__badge">1</span>
                <span class="parcel-section__title"><i class="fas fa-building"></i> ข้อมูลโครงการ</span>
              </div>
              <div class="parcel-section__body">
                <div class="parcel-form-grid">
                  <!-- โครงการหลัก -->
                  <div class="parcel-field">
                    <label class="parcel-label parcel-label--required">โครงการหลัก</label>
                    <div class="parcel-input-group">
                      <input type="text" class="parcel-input" v-model="headerData['pre_event']" readonly placeholder="เลือกโครงการ..." />
                      <button class="parcel-btn-icon parcel-btn-icon--primary" @click="$refs.ct_project.openModal()"><i class="fa fa-search"></i></button>
                      <button class="parcel-btn-icon parcel-btn-icon--danger" @click="resetData('project')"><i class="fa fa-times"></i></button>
                    </div>
                  </div>
                  <!-- ชื่อโครงการ -->
                  <div class="parcel-field">
                    <label class="parcel-label">ชื่อโครงการ</label>
                    <input type="text" class="parcel-input parcel-input--readonly" v-model="headerData.pre_des" readonly />
                  </div>
                </div>

                <div class="parcel-form-grid parcel-form-grid--3col">
                  <!-- โครงการย่อย -->
                  <div class="parcel-field">
                    <label class="parcel-label parcel-label--required">โครงการย่อย (Unit / Phase)</label>
                    <div class="parcel-input-group">
                      <input type="text" class="parcel-input" v-model="headerData['pre_event_unit']" readonly placeholder="เลือกโครงการย่อย..." />
                      <button class="parcel-btn-icon parcel-btn-icon--primary" @click="$refs.ct_project_unit.openModal()" :disabled="xt.isEmpty(headerData.pre_event)"><i class="fa fa-search"></i></button>
                      <button class="parcel-btn-icon parcel-btn-icon--danger" :disabled="xt.isEmpty(headerData.pre_event)" @click="resetData('phase')"><i class="fa fa-times"></i></button>
                    </div>
                  </div>
                  <!-- ชื่อโครงการย่อย -->
                  <div class="parcel-field">
                    <label class="parcel-label">ชื่อโครงการย่อย</label>
                    <input type="text" class="parcel-input parcel-input--readonly" v-model="headerData['pre_des_unit']" readonly />
                  </div>
                  <!-- เลขที่บ้าน -->
                  <div class="parcel-field">
                    <label class="parcel-label">เลขที่บ้าน</label>
                    <input type="text" class="parcel-input parcel-input--readonly" v-model="headerData['house_number']" readonly />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: ข้อมูลพัสดุ -->
            <div class="parcel-section">
              <div class="parcel-section__header">
                <span class="parcel-section__badge">2</span>
                <span class="parcel-section__title"><i class="fas fa-barcode"></i> ข้อมูลพัสดุ</span>
              </div>
              <div class="parcel-section__body">
                <div class="parcel-form-grid">
                  <div class="parcel-field">
                    <label class="parcel-label parcel-label--required">เลขพัสดุ</label>
                    <input type="text" class="parcel-input" v-model="newParcelData.postid" placeholder="กรุณาระบุเลขพัสดุ" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 3: รูปภาพ -->
            <div class="parcel-section">
              <div class="parcel-section__header">
                <span class="parcel-section__badge">3</span>
                <span class="parcel-section__title"><i class="fas fa-image"></i> รูปภาพพัสดุ</span>
              </div>
              <div class="parcel-section__body">
                <file-attach ref="attachAddpathpicFile"
                             document-type="CSM"
                             :show-upload-file="true">
                </file-attach>
              </div>
            </div>
            </div><!-- end .parcel-form-body -->

            <!-- Submit - Fixed Footer -->
            <div class="parcel-submit">
              <button type="button" class="parcel-btn-submit" @click="createParcel">
                <i class="fas fa-save"></i> บันทึกข้อมูล
              </button>
            </div>
          </div>

          <!-- Loading Overlay -->
          <div class="parcel-loading" v-if="isLoading">
            <div class="parcel-loading__spinner">
              <i class="fa fa-circle-notch fa-spin"></i>
              <span>กำลังบันทึก...</span>
            </div>
          </div>
        </div>
      </template>
    </re-page>
    <vue-project-list ref="ct_project" @send-data="sendComponent($event, 'project')"></vue-project-list>
    <vue-project-unit-list ref="ct_project_unit" :pre_event2="headerData['pre_event2']" :chk_code="chk_code" @send-data="sendComponent($event, 'project_unit')"></vue-project-unit-list>
  </div>
</template>

<script>
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let pagingArea = {};
  let pagingWarranty = {};
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
        },
        newParcelData: {
          pre_event_unit: null,
          postid: null,
          add_dt: null,
          pathpic: null,
          add_sign: null,
          house_no: null,
          remark: null,
          remark_status: null
        },
        POST_STATUS: {
          ACTIVE: 'Y',
          COMPLETE: 'C',
          NOT_ACTIVE: 'N',
          SEND_BACK: 'B'
        },
        area_code: [],
        baseUrl: [],
        chk_code: "Y",
      };
    },
    methods: {
      async sendComponent(e, type) {
        switch (type) {
          case "project":
            this.headerData.pre_event2 = e.pre_event2;
            this.headerData.pre_event = e.pre_event;
            this.headerData.pre_des = e.pre_des;

            this.dataArea = [];
            this.dataAreaDisplay = []
            this.areaPageNumber = 1
            this.headerData.pre_event_unit = null;
            this.headerData.pre_des_unit = null;

            break;
          case "project_unit":
            this.headerData.pre_event_unit = e.pre_event;
            this.headerData.pre_des_unit = e.pre_des;
            this.headerData.house_number = e.house_number;
           
            break;
        }
      },
      async resetData(type) {
        if (type === 'project') {
          let arr = ['pre_event', 'pre_des', 'pre_event_unit', 'pre_des_unit', 'house_number'];
          $linq(arr).foreach(f => this.headerData[f] = null);
        } else if (type === 'phase') {
          let arr = ['pre_event_unit', 'pre_des_unit', 'house_number'];
          $linq(arr).foreach(f => this.headerData[f] = null);
        }
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
      async createParcel() {
        try {
          if (!this.isValidPendingParcel) {
            $msg.alert('Warning', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
            return;
          }
          if ($xt.isEmpty(this.headerData.pre_event_unit)) {
            $msg.alert('Warning', 'กรุณากรอกเลือกโครงการย่อย', 'warning');
            return;
          }
          if ($xt.isEmpty(this.headerData.house_number)) {
            $msg.alert('Warning', 'กรุณาเลือกโครงการที่มีบ้านเลขที่', 'warning');
            return;
          }
          if (!this.isValidImageParcel) {
            $msg.alert('Warning', 'กรุณาใส่รูปภาพพัสดุ', 'warning');
            return;
          }

          this.isLoading = true;

          const pathpicFiles = this.$refs.attachAddpathpicFile.attachFile || [];

          const requestData = {
            header: {
              maincode: window.auth.maincode,
              pre_event: this.headerData.pre_event_unit,
              pre_event2: this.headerData.pre_event2,
              pre_event_unit: this.headerData.pre_event_unit || this.headerData.pre_event,
              postid: this.newParcelData.postid,
              status: 'P',
              add_dt: this.newParcelData.add_dt,
              pathpic: pathpicFiles.length > 0 ? pathpicFiles[0].pathto : null,
              add_sign: null,
              house_no: this.headerData.house_number,
              post_status: 'Y',
              remark: null,
              remark_status: null
            },
            file_path: [
              ...pathpicFiles.map(file => ({
                maincode: window.auth.maincode,
                pre_event: this.newParcelData.postid,
                pathto: file.pathto,
                doctype: "CSM",
                pathfrom: file.docfilename,
                select_pic: 'P'
              }))
            ]
          };

          let action = 'CSM/Data/Create_postid';
          const response = await $xt.postServerJson(action, requestData);

          if (response.success) {
            $msg.alert('Success', 'บันทึกข้อมูลสำเร็จ', 'success');
            this.resetForm();
          } else {
            $msg.alert('Warning', response.error, 'warning');
          }
        } catch (ex) {
          $msg.alert('Warning', ex.toString(), 'warning');
        } finally {
          this.isLoading = false;
        }
      },
      resetForm() {
        this.newParcelData = {
          pre_event_unit: null,
          postid: null,
          add_dt: null,
          pathpic: null,
          add_sign: null,
          house_number: '',
          remark: null,
          remark_status: null
        };
        this.$refs.attachAddpathpicFile.clearFile();
        this.resetData('project');
      }
    },
    computed: {
      isValidPendingParcel() {
        return this.headerData.pre_event &&
          this.newParcelData.postid;
      },
      isValidImageParcel() {
        const pathpicFiles = this.$refs.attachAddpathpicFile?.attachFile || [];
        return pathpicFiles.length > 0;
      },
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = `Create Parcel`;
      document.title = page.pageTitle;

      pagingArea = {
        currentPage: 1,
        itemsPerPage: 50,
        totalItems: 0,
        setCurrentPage(page) { this.currentPage = page; },
        setItemsPerPage(items) { this.itemsPerPage = items; },
        setTotalItems(total) { this.totalItems = total; },
        skipItems() { return (this.currentPage - 1) * this.itemsPerPage; },
        getItemsPerPage() { return this.itemsPerPage; },
        createPagesArray() {}
      };

      pagingWarranty = {
        currentPage: 1,
        itemsPerPage: 50,
        totalItems: 0,
        setCurrentPage(page) { this.currentPage = page; },
        setItemsPerPage(items) { this.itemsPerPage = items; },
        setTotalItems(total) { this.totalItems = total; },
        skipItems() { return (this.currentPage - 1) * this.itemsPerPage; },
        getItemsPerPage() { return this.itemsPerPage; },
        createPagesArray() {}
      };
    }
  };
  export default cpn;
</script>

<style scoped>
  .parcel-create-page {
    --p-primary: #2563eb;
    --p-primary-dark: #1d4ed8;
    --p-success: #059669;
    --p-danger: #dc2626;
    --p-gray-50: #f8fafc;
    --p-gray-100: #f1f5f9;
    --p-gray-200: #e2e8f0;
    --p-gray-300: #cbd5e1;
    --p-gray-400: #94a3b8;
    --p-gray-500: #64748b;
    --p-gray-700: #334155;
    --p-gray-800: #1e293b;
    --p-radius: 8px;
    --p-radius-lg: 12px;
    --p-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
    --p-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    --p-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .parcel-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  /* Header - Fixed at top */
  .parcel-header {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 18px 28px;
    flex-shrink: 0;
    background: #fff;
    border-bottom: 1px solid var(--p-gray-200);
  }

  .parcel-header__icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
    border-radius: var(--p-radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #fff;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
    flex-shrink: 0;
  }

  .parcel-header__title {
    font-size: 22px;
    font-weight: 700;
    color: var(--p-gray-800);
    margin: 0;
  }

  .parcel-header__subtitle {
    font-size: 13px;
    color: var(--p-gray-500);
    margin: 3px 0 0;
  }

  /* Form Card - Scrollable body */
  .parcel-form-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
  }

  .parcel-form-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .parcel-form-body::-webkit-scrollbar {
    width: 8px;
  }

  .parcel-form-body::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  .parcel-form-body::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .parcel-form-body::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Sections container - scrollable */
  .parcel-section {
    border-bottom: 1px solid var(--p-gray-100);
  }

  .parcel-section:last-of-type {
    border-bottom: none;
  }

  .parcel-section__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 28px;
    background: var(--p-gray-50);
    border-bottom: 1px solid var(--p-gray-100);
  }

  .parcel-section__badge {
    width: 26px;
    height: 26px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .parcel-section__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--p-gray-700);
  }

  .parcel-section__title i {
    margin-right: 6px;
    color: var(--p-primary);
  }

  .parcel-section__body {
    padding: 20px 28px;
  }

  /* Form Grid */
  .parcel-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 12px;
  }

  .parcel-form-grid:last-child {
    margin-bottom: 0;
  }

  .parcel-form-grid--3col {
    grid-template-columns: 1fr 1fr 1fr;
  }

  /* Field */
  .parcel-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .parcel-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--p-gray-500);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .parcel-label--required::after {
    content: ' *';
    color: var(--p-danger);
  }

  /* Input */
  .parcel-input {
    padding: 10px 14px;
    border: 1.5px solid var(--p-gray-200);
    border-radius: var(--p-radius);
    font-size: 14px;
    color: var(--p-gray-800);
    transition: var(--p-transition);
    background: #fff;
    width: 100%;
  }

  .parcel-input:focus {
    outline: none;
    border-color: var(--p-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .parcel-input::placeholder {
    color: var(--p-gray-400);
  }

  .parcel-input--readonly {
    background: var(--p-gray-50);
    color: var(--p-gray-500);
    cursor: default;
  }

  /* Input Group */
  .parcel-input-group {
    display: flex;
    gap: 6px;
  }

  .parcel-input-group .parcel-input {
    flex: 1;
  }

  .parcel-btn-icon {
    width: 38px;
    height: 38px;
    border: none;
    border-radius: var(--p-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--p-transition);
    flex-shrink: 0;
    font-size: 14px;
  }

  .parcel-btn-icon:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .parcel-btn-icon--primary {
    background: var(--p-primary);
    color: #fff;
  }

  .parcel-btn-icon--primary:hover:not(:disabled) {
    background: var(--p-primary-dark);
    box-shadow: var(--p-shadow-md);
  }

  .parcel-btn-icon--danger {
    background: #fee2e2;
    color: var(--p-danger);
  }

  .parcel-btn-icon--danger:hover:not(:disabled) {
    background: var(--p-danger);
    color: #fff;
  }

  /* Submit - Fixed at bottom */
  .parcel-submit {
    padding: 16px 28px;
    background: #fff;
    border-top: 1px solid var(--p-gray-200);
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .parcel-btn-submit {
    padding: 12px 28px;
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: #fff;
    border: none;
    border-radius: var(--p-radius);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--p-transition);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  }

  .parcel-btn-submit:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
  }

  .parcel-btn-submit:active {
    transform: translateY(0);
  }

  /* Loading */
  .parcel-loading {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  .parcel-loading__spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: var(--p-primary);
    font-size: 14px;
    font-weight: 500;
  }

  .parcel-loading__spinner i {
    font-size: 32px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .parcel-form-grid,
    .parcel-form-grid--3col {
      grid-template-columns: 1fr;
    }

    .parcel-header__title {
      font-size: 20px;
    }
  }
</style>

<style>
  .content-body { overflow-y: hidden !important; }
</style>
