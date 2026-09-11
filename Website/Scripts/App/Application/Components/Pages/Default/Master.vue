<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="row">
          <div class="col-md-12 col-sm-12 col-xs-12">
            <div class="nav-tabs-custom">
              <ul class="nav nav-tabs">
                <li :class="{active:tabActive===0}"><a href="#" @click.prevent="changeTab(0, 'Application')">Application ({{retrieveData.length || 0}})</a></li>
                <li :class="{active:tabActive===1}"><a href="#" @click.prevent="changeTab(1, 'Application')">Email Setup</a></li>
              </ul>
              <div class="tab-content">
                <div class="tab-pane" v-bind:class="{active:tabActive===0}">
                  <div class="row" style="margin-bottom:12px;">
                    <div class="col-md-4">
                      <div class="form-group" style="margin-bottom:0;">
                        <label>Search</label>
                        <div class="input-group">
                          <input type="text" class="form-control input-sm"
                                 v-model="retrieveSearch.text"
                                 @keyup.enter="doSearch()" />
                          <span class="input-group-btn">
                            <button class="btn btn-sm bg-navy" @click.prevent="doSearch()">
                              <i class="fas fa-search"></i>
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-8 text-right" style="padding-top:24px;">
                      <span style="color:#7f8c8d;font-size:13px;margin-right:12px;">
                        จำนวนทั้งหมด {{ retrieveTotal || 0 }} รายการ
                      </span>
                      <button class="btn btn-sm btn-github" @click="addType()">
                        <i class="fas fa-plus-circle"></i> เพิ่มรายการ
                      </button>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm-12">
                      <ag-table ref="agr"
                        :footer="false"
                        @ready="initTable()"
                        :saveColumns="'Y'"
                        :doctype="'VIEW'"
                        :page_name="'master_application'">
                      </ag-table>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-12" style="margin-top:10px;">
                      <pagination class="pull-left" ref="paging"
                        @page-change="pageChange($event.page)">
                      </pagination>
                    </div>
                  </div>
                </div>
                <div class="tab-pane" v-bind:class="{active:tabActive===1}">
                  <div class="row">
                    <div class="col-md-12 col-sm-12 col-xs-12">
                      <div class="nav-tabs-custom">
                        <ul class="nav nav-tabs">
                          <li :class="{active:detailActive===0}"><a href="#" @click.prevent="changeTab(0, 'Email')">SMTP</a></li>
                          <li :class="{active:detailActive===1}"><a href="#" @click.prevent="changeTab(1, 'Email')">Email Template</a></li>
                        </ul>
                        <div class="tab-content">
                          <div class="tab-pane" v-bind:class="{active:detailActive===0}">
                            <div class="row">
                              <div class="col-md-12">
                                <div class="callout callout-info">
                                  การเปลี่ยนแปลงข้อมูลนี้จะถูกนำไปบันทึกแทนค่าใน Company Setup โปรดระมัดระวังในการตั้งค่านี้
                                </div>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label>SMTP Server</label>
                                  <input type="text" class="form-control input-sm" v-model.trim="emailData['email_smtp']" />
                                </div>
                              </div>
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label>Port</label>
                                  <input type="text" class="form-control input-sm" v-model.trim="emailData['email_port']" />
                                </div>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label>Email Address</label>
                                  <input type="text" class="form-control input-sm" placeholder="mail@yourmail.com" v-model.trim="emailData['email']" />
                                </div>
                              </div>
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label>Email Password</label>
                                  <input type="text" class="form-control input-sm" v-model.trim="emailData['passemail']" />
                                </div>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-md-6">
                                <div class="form-group">
                                  <label>TLS/SSL</label>
                                  <select class="form-control input-sm" v-model.trim="emailData['email_smtp_tls']">
                                    <option value="Y">Yes</option>
                                    <option value="N">No</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-12 col-md-12">
                                <div class="form-group">
                                  <button class="btn btn-sm bg-navy"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
                                  <button class="btn btn-sm btn-default"><i class="fas fa-send"></i> Test Sending Email</button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="tab-pane" v-bind:class="{active:detailActive===1}">
                            <div class="row">
                              <div class="col-lg-12">
                                <div class="form-group">
                                  <label class="text-danger">Message Subject</label>
                                  <input type="text" class="form-control input-sm" v-model.trim="formEmailTmp['message_subject']">
                                </div>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-12">
                                <div class="form-group">
                                  <label>Message Body</label>
                                  <textarea id="text_area" class="form-control input-sm"></textarea>
                                </div>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-12 col-md-12">
                                <div class="form-group">
                                  <button class="btn btn-sm bg-navy"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
                                  <button class="btn btn-sm btn-default"><i class="fas fa-file"></i> Preview</button>
                                </div>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-12">
                                <h4>Dictionary</h4>
                                <table class="table table-bordered table-striped">
                                  <tbody>
                                    <tr v-for="x in dic">
                                      <td class="text-nowrap nowrap" nowrap style="width:1px">{{'{' + x.code + '}'}}</td>
                                      <td>{{x.desc}}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </re-page>
    <!-- Modal : Application Type -->
    <div class="modal fade" ref="addTypeModal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-md" role="document">
        <div class="modal-content app-modal-content">

          <!-- Header -->
          <div class="app-modal-header">
            <div class="app-modal-header-icon">
              <i :class="isEdit ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
            </div>
            <div>
              <div class="app-modal-title">{{ isEdit ? 'แก้ไข Application' : 'เพิ่ม Application' }}</div>
              <div class="app-modal-subtitle">กำหนดข้อมูล Application Type สำหรับระบบ</div>
            </div>
            <button type="button" class="app-modal-close" data-dismiss="modal" title="ปิด">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body" style="padding:0;">
            <div style="background:#f8f9fa;padding:18px;">

              <!-- Section: ข้อมูลหลัก -->
              <div class="app-modal-section">
                <div class="app-modal-section-header">
                  <i class="fas fa-cube"></i> ข้อมูล Application
                </div>
                <div class="app-modal-section-body">
                  <div class="row">
                    <div class="col-md-5">
                      <div class="form-group">
                        <label class="app-field-label app-field-required">Application Type</label>
                        <input type="text" class="form-control input-sm"
                               v-model.trim="formData['app_type']"
                               :disabled="isEdit"
                               placeholder="เช่น WEB, MOB, WIN" />
                      </div>
                    </div>
                    <div class="col-md-7">
                      <div class="form-group">
                        <label class="app-field-label app-field-required">Application Name</label>
                        <input type="text" class="form-control input-sm"
                               v-model.trim="formData['app_name']"
                               placeholder="ชื่อ Application" />
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-12">
                      <div class="form-group" style="margin-bottom:0;">
                        <label class="app-field-label">Application Path</label>
                        <input type="text" class="form-control input-sm"
                               v-model.trim="formData['path_app']"
                               placeholder="https://..." />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section: ตั้งค่า -->
              <div class="app-modal-section" style="margin-bottom:0;">
                <div class="app-modal-section-header">
                  <i class="fas fa-sliders-h"></i> ตั้งค่า
                </div>
                <div class="app-modal-section-body">
                  <div class="app-active-toggle">
                    <label class="app-toggle-switch">
                      <input type="checkbox" v-model="formData['Active']" true-value="Y" false-value="N" />
                      <span class="app-toggle-slider"></span>
                    </label>
                    <div class="app-toggle-text">
                      <span class="app-toggle-label">Active</span>
                      <span class="app-toggle-hint">{{ formData['Active'] === 'Y' ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer app-modal-footer">
            <button type="button" class="btn btn-sm btn-success" @click="saveType()">
              <i class="fas fa-save"></i> บันทึกข้อมูล
            </button>
            <button type="button" class="btn btn-sm btn-default" data-dismiss="modal">
              <i class="fas fa-times"></i> ปิดหน้าต่าง
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  let page = {}
  let paging = {}
  let cpn = {
    data() {
      return {
        auth,
        ui: window.ui,
        baseUrl,
        xt: $xt,
        tabActive: 0,
        detailActive: 0,
        retrieveSearch: { text: '' },
        retrieveData: [],      // ข้อมูลทั้งหมด
        retrieveTotal: 0,
        emailData: {},
        formEmailTmp: {},
        formData: {},
        dic: [],
        isEdit: false,
      }
    },
    methods: {
      /* ─── Tab ────────────────────────────────────────────── */
      changeTab(t, keyword) {
        switch (keyword) {
          case 'Application':
            this.tabActive = t
            if (t === 0) this.readApplication()
            if (t === 1) this.changeTab(0, 'Email')
            break
          case 'Email':
            this.detailActive = t
            if (t === 0) this.readEmail()
            if (t === 1) this.readTemplateEmail()
            break
        }
      },

      /* ─── AG Table ──────────────────────────────────────── */
      initTable() {
        let agr = this.$refs.agr
        if (!agr) return

        let self = this

        let fields = [
          ['', 'Action', 'text', {
            width: 140,
            align: 'center',
            pinned: 'left',
            sortable: false,
            child: [
              ['', 'Edit', 'text', {
                width: 100,
                align: 'center',
                pinned: 'left',
                cellRenderer: (params) => {
                  return `<a href="#" class="text-black ag-app-edit" data-idx="${params.rowIndex}" title="แก้ไข"><i class="fas fa-edit"></i></a>`
                }
              }],
              ['', 'Delete', 'text', {
                width: 100,
                align: 'center',
                pinned: 'left',
                cellRenderer: (params) => {
                  return `<a href="#" class="text-danger ag-app-delete" data-idx="${params.rowIndex}" title="ลบ"><i class="fas fa-trash-alt"></i></a>`
                }
              }]
            ]
          }],
          ['itemno', 'No.', 'number', { width: 70, align: 'center', pinned: 'left' }],
          ['app_type', 'Application Type', 'text', { width: 250, sortable: true, pinned: 'left' }],
          ['app_name', 'Application Name', 'text', { width: 350, sortable: true }],
          ['path_app', 'Application Path', 'text', { width: 350, sortable: true }],
          ['Active', 'Active', 'text', {
            width: 120,
            align: 'center',
            sortable: true,
            cellRenderer: (params) => params.value === 'Y'
              ? `<span style="color:#00a65a;font-size:15px;"><i class="fas fa-check-circle"></i></span>`
              : `<span style="color:#ccc;font-size:15px;"><i class="fas fa-times-circle"></i></span>`
          }],
        ]

        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)

        this.$nextTick(() => {
          agr.$el.addEventListener('click', (e) => {
            let editBtn   = e.target.closest('.ag-app-edit')
            let deleteBtn = e.target.closest('.ag-app-delete')

            if (editBtn) {
              e.preventDefault()
              let idx = parseInt(editBtn.getAttribute('data-idx'))
              let skip = paging.skipItems()
              let row = self.retrieveData[skip + idx]
              if (row) self.editType(row)
            }
            if (deleteBtn) {
              e.preventDefault()
              // ยังไม่มี delete API — placeholder
            }
          })
        })
      },

      /* ─── Pagination (server-side) ──────────────────────── */
      async pageChange(pn) {
        pn = pn || 1
        paging.setCurrentPage(pn)
        await this.readApplication()
      },

      doSearch() {
        paging.setCurrentPage(1)
        this.readApplication()
      },

      /* ─── Data ──────────────────────────────────────────── */
      async readApplication() {
        let search = encodeURIComponent(this.retrieveSearch.text || '')
        let act = `CSM/Config/ApplicationTypeReadList?search=${search}&skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`
        let rsp = await $xt.getServer(act)

        this.retrieveData  = rsp.data
        this.retrieveTotal = rsp.total || rsp.data.length

        paging.setTotalItems(this.retrieveTotal)
        if (!paging.getItemsPerPage()) paging.setCurrentPage(1)
        paging.createPagesArray()

        this.$nextTick(() => {
          let agr = this.$refs.agr
          if (agr) {
            agr.setDisplay(this.retrieveData)
            this.initTable()
          }
        })
      },

      async readEmail() {
        let act = `CSM/Config/ReadSmtp`
        let rsp = await $xt.getServer(act)
        this.$set(this, 'emailData', rsp.data || { email_smtp_tls: 'Y' })
      },

      async readTemplateEmail() {
        let act = `CSM/Config/TemplateEmailRead`
        let rsp = await $xt.getServer(act)
        if (rsp.data != null) {
          this.$set(this, 'formEmailTmp', rsp.data)
          if (tinymce && tinymce.get('text_area')) {
            tinymce.get('text_area').setContent((rsp.data || {}).message_body || '')
            tinymce.get('text_area').undoManager.clear()
          }
        }
      },

      resetFormEmailTmp() {
        if (tinymce && tinymce.get('text_area')) {
          tinymce.get('text_area').setContent('')
          tinymce.get('text_area').undoManager.clear()
        }
      },

      addType() {
        $(this.$refs.addTypeModal).modal('show')
        this.isEdit = false
        this.formData = { Active: 'Y' }
      },

      editType(x) {
        $(this.$refs.addTypeModal).modal('show')
        this.isEdit = true
        this.$set(this, 'formData', JSON.parse(JSON.stringify(x)))
      },

      async saveType() {
        try {
          let has_error = false
          let error_message = '<ul>'
          if ($xt.isEmpty(this.formData.app_type)) { error_message += '<li>Application Type</li>'; has_error = true }
          if ($xt.isEmpty(this.formData.app_name))  { error_message += '<li>Application Name</li>';  has_error = true }
          error_message += '</ul>'
          if (has_error) { $msg.alert(`These fields are required`, error_message, `warning`); return }

          let f = { form: this.formData }
          let act = `CSM/Config/ApplicationTypeCreateAndUpdate`
          let rsp = await $xt.postServerJson(act, f)
          if (!rsp.success) throw rsp.error

          $(this.$refs.addTypeModal).modal('hide')
          await this.readApplication()
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        }
      },
    },

    mounted() {
      page = this.$refs.page
      page.pageTitle = 'CSM : View Master'
      document.title = page.pageTitle

      paging = this.$refs.paging
      paging.setCurrentPage(1)
      paging.setItemsPerPage(20)

      this.changeTab(0, 'Application')
      this.resetFormEmailTmp()

      tinymce.init({
        selector: '#text_area',
        theme: 'modern',
        height: 300,
        plugins: [
          'advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker',
          'searchreplace wordcount visualblocks visualchars code insertdatetime media nonbreaking',
          'save table contextmenu directionality emoticons template paste textcolor'
        ],
        toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | forecolor backcolor'
      })

      let dic = this.dic
      dic.push({ code: 'customer_name', desc: 'ชื่อลูกค้า' })
      dic.push({ code: 'job_no',        desc: 'CRM No.' })
      dic.push({ code: 'message_date',  desc: 'วันที่ข้อความ' })
      dic.push({ code: 'subject',       desc: 'Subject' })
      dic = $linq(dic).orderBy(x => x.code).toArray()
    }
  }
  export default cpn
</script>

<style scoped>
/* ─── Modal shell ────────────────────────────────────── */
.app-modal-content {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}

/* ─── Header ─────────────────────────────────────────── */
.app-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #1e2a3a 0%, #2c3e50 100%);
  position: relative;
}

.app-modal-header-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  flex-shrink: 0;
}

.app-modal-title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.app-modal-subtitle {
  font-size: 11px;
  color: rgba(255,255,255,0.65);
  margin-top: 2px;
}

.app-modal-close {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s;
  padding: 0;
}
.app-modal-close:hover { background: rgba(255,255,255,0.25); }

/* ─── Section cards ──────────────────────────────────── */
.app-modal-section {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ec;
  margin-bottom: 12px;
  overflow: hidden;
}

.app-modal-section-header {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #2471a3, #1a6fa8);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.app-modal-section-body {
  padding: 14px 16px 6px;
}

/* ─── Field labels ───────────────────────────────────── */
.app-field-label {
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 4px;
  display: block;
}

.app-field-required::after {
  content: ' *';
  color: #e53e3e;
}

/* ─── Active toggle ──────────────────────────────────── */
.app-active-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0 8px;
}

.app-toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  margin: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.app-toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.app-toggle-slider {
  position: absolute;
  inset: 0;
  background: #cbd5e0;
  border-radius: 22px;
  transition: 0.25s;
}

.app-toggle-slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.25s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.app-toggle-switch input:checked + .app-toggle-slider {
  background: #48bb78;
}

.app-toggle-switch input:checked + .app-toggle-slider::before {
  transform: translateX(18px);
}

.app-toggle-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.app-toggle-label {
  font-size: 13px;
  font-weight: 600;
  color: #2d3748;
}

.app-toggle-hint {
  font-size: 11px;
  color: #718096;
}

/* ─── Footer ─────────────────────────────────────────── */
.app-modal-footer {
  background: #f8f9fa;
  border-top: 1px solid #e4e7ec;
  padding: 10px 16px;
}
</style>
