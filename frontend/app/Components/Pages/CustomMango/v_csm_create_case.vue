<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="ic-page">
          <!-- Section: Header -->
          <header class="ic-masthead">
            <div class="ic-masthead-main">
              <span class="ic-eyebrow">CSM &middot; CASE INTAKE</span>
              <h2 class="ic-title">แจ้งปัญหาใหม่</h2>
              <p class="ic-subtitle">กรุณากรอกข้อมูลให้ครบถ้วน เพื่อให้ทีมงานตรวจสอบได้เร็วที่สุด</p>
            </div>
            <div class="ic-masthead-meta">
              <span class="ic-meta-label">สถานะ</span>
              <span class="ic-meta-value">ฉบับร่าง</span>
            </div>
          </header>

          <div class="ic-body">
            <div class="ic-stack">
              <!-- Section: เรื่อง + แผนก -->
              <section class="ic-block">
                <span class="ic-index">01</span>
                <h3 class="ic-block-title">หัวข้อเรื่อง</h3>
                <div class="ic-grid ic-grid-2">
                  <div class="ic-field">
                    <div class="ic-label-row">
                      <label class="ic-label">เรื่อง <span class="ic-req">*</span></label>
                      <span class="ic-hint">{{ xt.textLength(data['subject'], 250) }} ตัวอักษร</span>
                    </div>
                    <input type="text" class="ic-input" v-model="data.subject" placeholder="กรุณากรอกชื่อเรื่อง" maxlength="250" />
                  </div>
                  <div class="ic-field">
                    <div class="ic-label-row">
                      <label class="ic-label">แผนกรับเรื่อง <span class="ic-req">*</span></label>
                      <span v-if="xt.isEmpty(data.accept_position)" class="ic-must-pick">
                        <i class="fas fa-hand-pointer"></i> ต้องเลือก
                      </span>
                    </div>
                    <select class="ic-input ic-select"
                            :class="{ 'is-unset': xt.isEmpty(data.accept_position) }"
                            v-model="data.accept_position">
                      <option value="" disabled>-- กรุณาเลือกแผนก --</option>
                      <option value="D">Software Developer</option>
                      <option value="I">IT Operation Support</option>
                    </select>
                  </div>
                </div>
              </section>

              <!-- Section: รายละเอียด -->
              <section class="ic-block">
                <span class="ic-index">02</span>
                <h3 class="ic-block-title">รายละเอียดปัญหา</h3>
                <div class="ic-field">
                  <label class="ic-label">รายละเอียด <span class="ic-req">*</span></label>
                  <textarea class="ic-input ic-textarea" v-model="data.desc_remark" rows="5" placeholder="กรุณากรอกรายละเอียดปัญหาที่พบ..."></textarea>
                </div>
              </section>

              <!-- Section: Website URL && Customer Data -->
              <section class="ic-block">
                <span class="ic-index">03</span>
                <h3 class="ic-block-title">ข้อมูลอ้างอิง</h3>
                <div class="ic-grid ic-grid-2-equal">
                  <div class="ic-field">
                    <label class="ic-label">Website URL <span class="ic-req">*</span></label>
                    <div class="ic-input-icon-wrap">
                      <i class="fas fa-link ic-input-icon"></i>
                      <input type="text" class="ic-input ic-input-with-icon" v-model="data.website_url" placeholder="https://example.com หรือ '-' ถ้าไม่มี" />
                    </div>
                  </div>
                  <div class="ic-field">
                    <label class="ic-label">Customer <span class="ic-req">*</span></label>
                    <div class="ic-customer-row">
                      <input type="text" class="ic-input ic-customer-name" v-model="data['customer_name']" readonly placeholder="Customer Code" />
                      <input type="text" class="ic-input ic-customer-code" v-model="data['pre_event']" readonly placeholder="Project No." />
                      <button type="button" class="ic-btn-icon" title="ค้นหา" @click="openModalComponent()"><i class="fa fa-search"></i></button>
                      <button type="button" class="ic-btn-icon ic-btn-icon-clear" title="ล้างข้อมูล" @click="clearCustomer()"><i class="fa fa-times"></i></button>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Section: แนบไฟล์ -->
              <section class="ic-block">
                <span class="ic-index">04</span>
                <h3 class="ic-block-title">ไฟล์แนบ</h3>
                <div class="ic-field">
                  <label class="ic-label"><i class="fas fa-paperclip ic-label-icon"></i> แนบรูปภาพ / ไฟล์ / วิดีโอ</label>
                  <div class="ic-upload-area">
                    <file-attach-v2 ref="attchAddFile" @uploaded="setAttachFile($event)" document-type="CSM" :show-upload-file="true"></file-attach-v2>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <!-- Action -->
          <footer class="ic-action-bar">
            <div class="ic-progress">
              <span class="ic-progress-meter">
                <i v-for="n in requiredTotal" :key="n" class="ic-tick" :class="{ 'is-on': n <= requiredFilled }"></i>
              </span>
              <span class="ic-progress-text">
                <strong>{{ requiredFilled }}/{{ requiredTotal }}</strong> ช่องบังคับ
              </span>
            </div>
            <button type="button" class="ic-btn-submit" :class="{ 'is-ready': requiredFilled === requiredTotal }" @click="isValid">
              <span class="ic-btn-label"><i class="fas fa-paper-plane"></i> บันทึกข้อมูล</span>
            </button>
          </footer>
        </div>
      </template>
    </re-page>
    <modal ref="cus_data">
      <template #header>
        <h4><i class="fa fa-building-o"></i> Customer Data</h4>
      </template>
      <template #body>
        <div class="ic-scope">
          <div class="ic-modal-search">
            <label class="ic-label">ค้นหา</label>
            <div class="ic-search-row">
              <i class="fa fa-search ic-input-icon"></i>
              <input type="text" class="ic-input ic-input-with-icon" v-model.trim="cusSearch.search" placeholder="ชื่อลูกค้า" @keyup.enter="searchCustomer()" />
              <button type="button" class="ic-btn-search" @click="searchCustomer()">ค้นหา</button>
            </div>
          </div>
          <div class="ic-table-wrap">
            <table class="ic-table">
              <thead>
                <tr>
                  <th class="tf-3">CODE</th>
                  <th>CUSTOMER</th>
                  <th class="tf-3-5">PROJECT NO.</th>
                  <th>ADDRESS (1)</th>
                  <th>ADDRESS (2)</th>
                  <th>PHONE</th>
                  <th>TAX ID</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in cusDataList" :key="idx" @click="selectCustomer(item)">
                  <td class="ic-td-code">{{ item.customer_code }}</td>
                  <td class="ic-td-name">{{ item.customer_name }}</td>
                  <td>{{ item.pre_event }}</td>
                  <td>{{ item.address1 }}</td>
                  <td>{{ item.address2 }}</td>
                  <td>{{ item.phone }}</td>
                  <td>{{ item.tax_id }}</td>
                </tr>
                <tr v-if="cusDataList.length === 0">
                  <td colspan="7" class="ic-table-empty">ไม่พบข้อมูล</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <loading-box ref="cusLB"></loading-box>
      </template>
      <template #footer>
        <div class="pull-left">
          <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
        </div>
        <button type="button" class="btn btn-sm modal-close-btn" @click="closeModal()">
          <i class="fa fa-times"></i> ปิดหน้าต่าง
        </button>
      </template>
    </modal>
    <loading-box ref="myLB"></loading-box>
  </div>
</template>

<script type="text/javascript">

  import loadingBox from "../../Center/loading-box.vue"

  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let loading = {};

  export default {
    components: {
      loadingBox
    },
    data() {
      return {
        auth,
        ui: window.ui,
        xt: $xt,
        data: {},
        newAttachFile: [],
        attachFile: [],
        refreshInterval: null,
        cusSearch: { field: 'customer_name', search: '' },
        cusDataList: [],
        cusTotal: 0,
        cusCurrentPage: 1,
        cusItemsPerPage: 500,
      };
    },
    computed: {
      requiredTotal() {
        return 4;
      },
      requiredFilled() {
        return ['subject', 'desc_remark', 'website_url', 'accept_position']
          .filter(f => !$xt.isEmpty(this.data[f])).length;
      },
      cusTotalPages() {
        return this.cusTotal ? Math.ceil(this.cusTotal / this.cusItemsPerPage) : 1;
      },
      cusPageFrom() {
        return this.cusTotal ? (this.cusCurrentPage - 1) * this.cusItemsPerPage + 1 : 0;
      },
      cusPageTo() {
        return this.cusTotal ? Math.min(this.cusCurrentPage * this.cusItemsPerPage, this.cusTotal) : 0;
      },
    },
    methods: {
      async isValid() {
        if ($xt.isEmpty(this.data.subject)) {
          $msg.alert('Warning', 'กรุณากรอกชื่อเรื่อง', 'warning');
          return;
        }

        if ($xt.isEmpty(this.data.desc_remark)) {
          $msg.alert('Warning', 'กรุณากรอกรายละเอียด', 'warning');
          return;
        }

        if ($xt.isEmpty(this.data.website_url)) {
          $msg.alert('Warning', 'กรุณากรอก Website URL (ถ้าไม่มีให้ใส่ "-" )', 'warning');
          return;
        }
        if ($xt.isEmpty(this.data.accept_position)) {
          $msg.alert('Warning', 'กรุณาเลือกแผนกรับเรื่อง', 'warning');
          return;
        }

        const maxFilenameLength = 200;
        const invalidFiles = this.attachFile.filter(file => file.docfilename && file.docfilename.length > maxFilenameLength);

        if (invalidFiles.length > 0) {
          $msg.alert('Warning', `พบไฟล์ที่มีชื่อยาวเกิน ${maxFilenameLength} ตัวอักษร กรุณาเปลี่ยนชื่อไฟล์ให้สั้นลงก่อนอัปโหลด`, 'warning');
          return;
        }

        this.newAttachFile = this.attachFile.map(file => {
          let extension = file.docfilename.split('.').pop();
          return {
            itemno: file.itemno,
            filepath: file.pathto,
            filename: file.docfilename,
            adduser: file.adduser,
            adddate: file.add_dt,
            ext_file: extension
          };
        });

        await this.save();
      },
      reset() {
        this.data = {};
        this.$refs.attchAddFile.clearFile();
        this.newAttachFile = [];
        this.attachFile = [];
      },
      async save() {
        try {
          loading.show();

          let f = {
            form: this.data,
            attach: this.newAttachFile
          }

          let action = `CSM/Data/CSM_PreCase_Create`;
          let rsp = await $xt.postServerJson(action, f);

          if (!rsp.success) {
            throw rsp.error
          }

          let docno = (rsp.data && rsp.data.header && rsp.data.header.docno) || '';

          localStorage.setItem('CSM_CASE_CREATED', Date.now().toString());

          this.reset()
          $msg.alert('บันทึกสำเร็จ', `เลขที่เอกสาร : ${docno}`, 'success');
        } catch (ex) {
          $msg.alert('Error', ex.toString(), 'danger');
        } finally {
          loading.hide();
        }
      },
      setAttachFile(e) {
        this.attachFile = e
      },
      openModalComponent() {
        this.$refs.cus_data.setSize('modal-xl');
        this.$refs.cus_data.openModal();
        this.$nextTick(() => {
          this.searchCustomer();
        });
      },
      async searchCustomer() {
        let paging = this.$refs.paging;
        if (!paging) return;

        let url = `CSM/Data/CustomerDataReadList?sort=${this.cusSearch.field}&sort_type=asc&skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;
        url += `&field=${encodeURIComponent(this.cusSearch.field)}`;
        url += `&search=${encodeURIComponent(this.cusSearch.search || '')}`;
        url += `&field_type=s`;

        let rsp = await $xt.getServer(url);
        let rawData = rsp.data || [];

        this.cusDataList = rawData.filter(gf => !$xt.isEmpty(gf.pre_event));
        this.cusTotal = this.cusDataList.length;
        paging.setTotalItems(this.cusTotal);
        paging.createPagesArray();
      },
      async pageChange(pn) {
        pn = pn || 1;
        this.cusCurrentPage = pn;
        let paging = this.$refs.paging;
        paging.setCurrentPage(pn);
        await this.searchCustomer();
      },
      selectCustomer(item) {
        this.data.customer_name = item.customer_name;
        this.data.customer_code = item.customer_code;
        this.data.pre_event = item.pre_event;
        this.$refs.cus_data.closeModal();
        this.cusDataList = [];

      },
      closeModal() {
            this.cusDataList = [];
        this.$refs.cus_data.closeModal();
      },
      clearCustomer() {
        this.data.customer_name = '';
        this.data.customer_code = '';
         this.data.pre_event = '';
      },
    },
    mounted() {
      page = this.$refs.page
      page.pageTitle = 'Create Case'
      document.title = page.pageTitle
      loading = this.$refs.myLB

      this.$nextTick(() => {
        let paging = this.$refs.paging;
        if (paging) {
          paging.setCurrentPage(1);
          paging.setItemsPerPage(500);
        }
      });
    },
    beforeUnmount() {
    }
  };

</script>

<style scoped>
  /* ═══════════════════════════════════════
     Tokens — bone paper + signal amber
  ═══════════════════════════════════════ */
  .ic-page,
  .ic-scope {
    --ic-ground: #e9eef5;
    --ic-surface: #ffffff;
    --ic-ink: #0c2340;
    --ic-ink-soft: #5a6d87;
    --ic-ink-faint: #94a3b8;
    --ic-rule: #c9d5e4;
    --ic-rule-soft: #e1e8f1;
    --ic-accent: #2563eb;
    --ic-accent-bright: #7fb2e8;
    --ic-accent-wash: rgba(37, 99, 235, 0.10);
    --ic-on-ink: #f5f9ff;
    --ic-grid: rgba(37, 99, 235, 0.06);
    --r-xs: 4px;
    --r-sm: 7px;
    --r-md: 10px;
    --r-lg: 14px;
    --ic-font-display: 'Prompt', 'Sarabun', sans-serif;
    --ic-font-body: 'Sarabun', sans-serif;
    --ic-font-mono: Consolas, 'Courier New', monospace;
  }

  /* ═══════════════════════════════════════
     Page shell — header / body / footer
  ═══════════════════════════════════════ */
  .ic-page {
    height: calc(100vh - 120px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 18px 22px;
    gap: 14px;
    background-color: var(--ic-ground);
    background-image:
      linear-gradient(var(--ic-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--ic-grid) 1px, transparent 1px);
    background-size: 26px 26px;
    font-family: var(--ic-font-body);
    color: var(--ic-ink);
  }

  /* ═══════════════════════════════════════
     Masthead — fixed header
  ═══════════════════════════════════════ */
  .ic-masthead {
    flex: 0 0 auto;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    padding: 20px 24px;
    background: linear-gradient(105deg, #0f2242 0%, #16325c 58%, #1d4ed8 170%);
    border-radius: var(--r-lg);
    animation: ic-rise 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) both;
  }

  .ic-masthead::after {
    content: '';
    position: absolute;
    top: -60%;
    right: -80px;
    width: 320px;
    height: 220%;
    background: radial-gradient(closest-side, rgba(127, 178, 232, 0.2), transparent);
    pointer-events: none;
  }

  .ic-masthead-main {
    position: relative;
    z-index: 1;
  }

  .ic-eyebrow {
    display: block;
    font-family: var(--ic-font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.22em;
    color: var(--ic-accent-bright);
    margin-bottom: 6px;
  }

  .ic-title {
    font-family: var(--ic-font-display);
    font-size: 25px;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.01em;
    color: var(--ic-on-ink);
    margin: 0;
  }

  .ic-subtitle {
    font-size: 13px;
    line-height: 1.5;
    color: rgba(245, 249, 255, 0.58);
    margin: 5px 0 0;
  }

  .ic-masthead-meta {
    position: relative;
    z-index: 1;
    text-align: right;
    flex-shrink: 0;
    padding-left: 20px;
    border-left: 1px solid rgba(245, 249, 255, 0.16);
  }

  .ic-meta-label {
    display: block;
    font-family: var(--ic-font-mono);
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(245, 249, 255, 0.45);
  }

  .ic-meta-value {
    display: block;
    font-family: var(--ic-font-display);
    font-size: 14px;
    font-weight: 500;
    color: var(--ic-accent-bright);
    margin-top: 3px;
  }

  /* ═══════════════════════════════════════
     Body — the only scroll region
  ═══════════════════════════════════════ */
  .ic-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 8px;
  }

  .ic-body::-webkit-scrollbar { width: 7px; }
  .ic-body::-webkit-scrollbar-track { background: transparent; }
  .ic-body::-webkit-scrollbar-thumb { background: var(--ic-rule); border-radius: 0; }
  .ic-body::-webkit-scrollbar-thumb:hover { background: var(--ic-ink-faint); }

  /* Index rail threading every block together */
  .ic-stack {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .ic-stack::before {
    content: '';
    position: absolute;
    left: 13px;
    top: 14px;
    bottom: 14px;
    width: 1px;
    background: repeating-linear-gradient(
      to bottom,
      var(--ic-rule) 0 4px,
      transparent 4px 8px
    );
  }

  /* ═══════════════════════════════════════
     Block — one record entry
  ═══════════════════════════════════════ */
  .ic-block {
    position: relative;
    padding: 16px 20px 18px 44px;
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule-soft);
    border-left: 3px solid var(--st);
    border-radius: var(--r-md);
    animation: ic-rise 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) both;
  }

  .ic-block:nth-child(1) { --st: #2563eb; --st-wash: rgba(37, 99, 235, 0.10); animation-delay: 0.05s; }
  .ic-block:nth-child(2) { --st: #0891b2; --st-wash: rgba(8, 145, 178, 0.10); animation-delay: 0.11s; }
  .ic-block:nth-child(3) { --st: #7c3aed; --st-wash: rgba(124, 58, 237, 0.10); animation-delay: 0.17s; }
  .ic-block:nth-child(4) { --st: #059669; --st-wash: rgba(5, 150, 105, 0.10); animation-delay: 0.23s; }

  .ic-index {
    position: absolute;
    left: -1px;
    top: 16px;
    width: 28px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--ic-font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: #fff;
    background: var(--st);
    border-radius: 0 var(--r-sm) var(--r-sm) 0;
    box-shadow: 2px 2px 8px var(--st-wash);
  }

  .ic-block-title {
    font-family: var(--ic-font-display);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--st);
    margin: 0 0 14px;
    padding-bottom: 9px;
    border-bottom: 1px solid var(--ic-rule-soft);
  }

  /* ═══════════════════════════════════════
     Grid
  ═══════════════════════════════════════ */
  .ic-grid {
    display: grid;
    gap: 18px;
  }

  .ic-grid-2 {
    grid-template-columns: 1fr 250px;
  }

  .ic-grid-2-equal {
    grid-template-columns: 1fr 1fr;
  }

  /* ═══════════════════════════════════════
     Field
  ═══════════════════════════════════════ */
  .ic-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .ic-label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
  }

  .ic-label {
    font-family: var(--ic-font-display);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--ic-ink-soft);
    margin: 0;
  }

  .ic-label-icon {
    margin-right: 5px;
    opacity: 0.55;
  }

  .ic-req {
    color: var(--ic-accent);
    font-weight: 700;
  }

  .ic-hint {
    font-family: var(--ic-font-mono);
    font-size: 10px;
    letter-spacing: 0.05em;
    color: var(--ic-ink-faint);
  }

  /* ═══════════════════════════════════════
     Inputs — flat slot with amber focus rule
  ═══════════════════════════════════════ */
  .ic-input {
    width: 100%;
    padding: 9px 12px;
    font-family: var(--ic-font-body);
    font-size: 14px;
    color: var(--ic-ink);
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule);
    border-bottom-width: 2px;
    border-radius: var(--r-sm);
    outline: none;
    transition: border-color 0.18s ease, background 0.18s ease;
  }

  .ic-input:focus {
    border-color: var(--ic-rule);
    border-bottom-color: var(--ic-accent);
    background: var(--ic-accent-wash);
  }

  .ic-input::placeholder {
    color: var(--ic-ink-faint);
  }

  .ic-input[readonly] {
    background: var(--ic-ground);
    color: var(--ic-ink-soft);
  }

  /* ยังไม่ได้เลือก = ขอบส้มพร้อมวงกระเพื่อม ให้สังเกตเห็นก่อนกดบันทึก */
  .ic-must-pick {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 1px 7px;
    font-family: var(--ic-font-display);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: #b45309;
    background: rgba(245, 158, 11, 0.18);
    border-radius: var(--r-xs);
  }

  .ic-must-pick i { font-size: 9px; }

  .ic-select.is-unset {
    border-color: #fb7185;
    border-bottom-color: #e11d48;
    background-color: rgba(251, 113, 133, 0.10);
    animation: ic-pick 2.2s ease-in-out infinite;
  }

  .ic-select.is-unset:focus {
    border-color: #fb7185;
    border-bottom-color: #e11d48;
    background-color: rgba(251, 113, 133, 0.16);
  }

  @keyframes ic-pick {
    0%, 100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.32); }
    50%      { box-shadow: 0 0 0 5px rgba(244, 63, 94, 0); }
  }

  .ic-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%235a6d87' d='M5 7 0 0h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
    cursor: pointer;
  }

  .ic-textarea {
    resize: vertical;
    min-height: 118px;
    line-height: 1.65;
  }

  .ic-input-icon-wrap {
    position: relative;
  }

  .ic-input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: var(--ic-ink-faint);
    pointer-events: none;
    z-index: 1;
  }

  .ic-input-with-icon {
    padding-left: 33px;
  }

  /* Upload */
  .ic-upload-area {
    padding: 16px;
    background: repeating-linear-gradient(
      45deg,
      transparent 0 10px,
      rgba(12, 35, 64, 0.025) 10px 20px
    );
    border: 1px dashed var(--ic-rule);
    border-radius: var(--r-md);
  }

  /* Customer row */
  .ic-customer-row {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .ic-customer-name,
  .ic-customer-code {
    flex: 1;
    min-width: 0;
  }

  .ic-btn-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--ic-ink);
    background: transparent;
    border: 1px solid var(--ic-rule);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease;
  }

  .ic-btn-icon:hover {
    color: var(--ic-on-ink);
    background: var(--ic-ink);
    border-color: var(--ic-ink);
  }

  .ic-btn-icon-clear:hover {
    background: var(--ic-accent);
    border-color: var(--ic-accent);
  }

  /* ═══════════════════════════════════════
     Action bar — fixed footer
  ═══════════════════════════════════════ */
  .ic-action-bar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 20px;
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule-soft);
    border-top: 2px solid var(--ic-ink);
    border-radius: var(--r-lg);
    animation: ic-rise 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) 0.28s both;
  }

  .ic-progress {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
  }

  .ic-progress-meter {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .ic-tick {
    width: 16px;
    height: 3px;
    background: var(--ic-rule);
    transition: background 0.25s ease;
  }

  .ic-tick.is-on {
    background: var(--ic-accent);
  }

  .ic-progress-text {
    font-size: 12px;
    color: var(--ic-ink-soft);
    white-space: nowrap;
  }

  .ic-progress-text strong {
    font-family: var(--ic-font-mono);
    font-weight: 700;
    color: var(--ic-ink);
  }

  .ic-btn-submit {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 10px 26px;
    font-family: var(--ic-font-display);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--ic-on-ink);
    background: var(--ic-ink);
    border: none;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: color 0.2s ease, background 0.2s ease;
  }

  .ic-btn-submit::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--ic-accent);
    transform: translateX(-101%);
    transition: transform 0.32s cubic-bezier(0.2, 0.7, 0.3, 1);
  }

  .ic-btn-submit:hover::before {
    transform: translateX(0);
  }

  .ic-btn-label {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 9px;
  }

  .ic-btn-submit.is-ready {
    background: var(--ic-accent);
  }

  .ic-btn-submit.is-ready::before {
    background: var(--ic-ink);
  }

  .ic-btn-submit:active {
    transform: translateY(1px);
  }

  @keyframes ic-rise {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: none; }
  }

  /* ═══════════════════════════════════════
     Customer modal
  ═══════════════════════════════════════ */
  .ic-scope {
    font-family: var(--ic-font-body);
    color: var(--ic-ink);
  }

  .ic-modal-search {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 14px;
    max-width: 460px;
  }

  .ic-search-row {
    position: relative;
    display: flex;
    gap: 7px;
  }

  .ic-btn-search {
    flex-shrink: 0;
    padding: 0 18px;
    font-family: var(--ic-font-display);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--ic-on-ink);
    background: var(--ic-ink);
    border: none;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: background 0.18s ease;
  }

  .ic-btn-search:hover {
    background: var(--ic-accent);
  }

  .ic-table-wrap {
    max-height: 55vh;
    overflow: auto;
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-sm);
  }

  .ic-table-wrap::-webkit-scrollbar { width: 7px; height: 7px; }
  .ic-table-wrap::-webkit-scrollbar-track { background: transparent; }
  .ic-table-wrap::-webkit-scrollbar-thumb { background: var(--ic-rule); }

  .ic-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .ic-table th {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 9px 12px;
    text-align: left;
    white-space: nowrap;
    font-family: var(--ic-font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: rgba(245, 249, 255, 0.72);
    background: var(--ic-ink);
  }

  .ic-table td {
    padding: 9px 12px;
    border-top: 1px solid var(--ic-rule-soft);
    color: var(--ic-ink-soft);
  }

  .ic-table tbody tr {
    cursor: pointer;
    transition: background 0.14s ease;
  }

  .ic-table tbody tr:hover {
    background: var(--ic-accent-wash);
  }

  .ic-table tbody tr:hover .ic-td-name {
    color: var(--ic-accent);
  }

  .ic-td-code {
    font-family: var(--ic-font-mono);
    font-size: 12px;
    color: var(--ic-ink);
    white-space: nowrap;
  }

  .ic-td-name {
    font-weight: 600;
    color: var(--ic-ink);
  }

  .ic-table-empty {
    text-align: center;
    padding: 34px;
    color: var(--ic-ink-faint);
  }

  /* ═══════════════════════════════════════
     Responsive
  ═══════════════════════════════════════ */
  @media (max-width: 768px) {
    .ic-page {
      padding: 12px;
      gap: 10px;
    }

    .ic-masthead {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 18px;
    }

    .ic-masthead-meta {
      padding-left: 0;
      border-left: none;
      text-align: left;
    }

    .ic-title {
      font-size: 21px;
    }

    .ic-stack::before {
      display: none;
    }

    .ic-block {
      padding: 34px 14px 16px;
    }

    .ic-index {
      left: -1px;
      top: -1px;
    }

    .ic-grid-2,
    .ic-grid-2-equal {
      grid-template-columns: 1fr;
    }

    .ic-action-bar {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }

    .ic-btn-submit {
      justify-content: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ic-masthead,
    .ic-block,
    .ic-action-bar {
      animation: none;
    }

    .ic-select.is-unset {
      animation: none;
      box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.28);
    }

    .ic-btn-submit::before {
      transition: none;
    }
  }

  /* ═══════════════════════════════════════
     Dark Mode
  ═══════════════════════════════════════ */
  body.dark-mode .ic-page,
  body.dark-mode .ic-scope {
    --ic-ground: #071120;
    --ic-surface: #0f1e33;
    --ic-ink: #e3ecf7;
    --ic-ink-soft: #8b9db5;
    --ic-ink-faint: #5c6f89;
    --ic-rule: #294057;
    --ic-rule-soft: #1e3049;
    --ic-accent: #5b9bd5;
    --ic-accent-bright: #7fb2e8;
    --ic-accent-wash: rgba(91, 155, 213, 0.1);
    --ic-on-ink: #f5f9ff;
    --ic-grid: rgba(227, 236, 247, 0.035);
  }

  body.dark-mode .ic-masthead {
    background: #050d18;
  }

  body.dark-mode .ic-block:nth-child(1) { --st: #60a5fa; --st-wash: rgba(96, 165, 250, 0.16); }
  body.dark-mode .ic-block:nth-child(2) { --st: #22d3ee; --st-wash: rgba(34, 211, 238, 0.16); }
  body.dark-mode .ic-block:nth-child(3) { --st: #a78bfa; --st-wash: rgba(167, 139, 250, 0.16); }
  body.dark-mode .ic-block:nth-child(4) { --st: #34d399; --st-wash: rgba(52, 211, 153, 0.16); }

  body.dark-mode .ic-index {
    color: #071120;
  }

  body.dark-mode .ic-input {
    background: #0b1727;
  }

  body.dark-mode .ic-input[readonly] {
    background: #091320;
  }

  body.dark-mode .ic-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%238b9db5' d='M5 7 0 0h10z'/%3E%3C/svg%3E");
  }

  body.dark-mode .ic-upload-area {
    background: repeating-linear-gradient(
      45deg,
      transparent 0 10px,
      rgba(227, 236, 247, 0.025) 10px 20px
    );
  }

  body.dark-mode .ic-btn-icon:hover {
    color: var(--ic-ground);
    background: var(--ic-accent);
    border-color: var(--ic-accent);
  }

  body.dark-mode .ic-action-bar {
    border-top-color: var(--ic-accent);
  }

  body.dark-mode .ic-btn-submit {
    color: var(--ic-ground);
    background: var(--ic-accent);
  }

  body.dark-mode .ic-btn-submit::before {
    background: var(--ic-ink);
  }

  body.dark-mode .ic-btn-submit.is-ready {
    background: var(--ic-ink);
  }

  body.dark-mode .ic-btn-submit.is-ready::before {
    background: var(--ic-accent);
  }

  body.dark-mode .ic-btn-search {
    color: var(--ic-ground);
    background: var(--ic-accent);
  }

  body.dark-mode .ic-btn-search:hover {
    background: var(--ic-ink);
  }

  body.dark-mode .ic-table th {
    color: var(--ic-ink-soft);
    background: #050d18;
  }
</style>
