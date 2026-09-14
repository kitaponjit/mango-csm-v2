<template>
  <div class="vid-root">

    <!-- ══════════════════════════════════════════
         ROW 1 : Status pills + Customer info
    ══════════════════════════════════════════ -->
    <div class="vid-row-top">

      <!-- Customer Info Card -->
      <div class="vid-card vid-card-customer">
        <div class="vid-card-head">
          <i class="fas fa-building"></i> ข้อมูลลูกค้า
        </div>
        <div class="vid-card-body">

          <!-- ── ข้อมูลพื้นฐาน ── -->
          <div class="vid-field-row">
            <div class="vid-field" style="flex:0 0 160px">
              <label>รหัสลูกค้า</label>
              <input type="text" class="vid-input vid-input-readonly" v-model.trim="formData.ref_cus_code" readonly>
            </div>
            <div class="vid-field" style="flex:1">
              <label>ชื่อลูกค้า</label>
              <input type="text" class="vid-input vid-input-readonly" v-model.trim="formData.cus_name" readonly>
            </div>
            <div class="vid-field" style="flex:0 0 180px">
              <label>Tax ID</label>
              <input type="text" class="vid-input vid-input-readonly" v-model.trim="formData.tax_id" readonly>
            </div>
            <div class="vid-field" style="flex:0 0 180px">
              <label>ID Card</label>
              <input type="text" class="vid-input vid-input-readonly" v-model.trim="formData.card_id" readonly>
            </div>
          </div>

          <div class="vid-field-row vid-mt-8">
            <div class="vid-field" style="flex:0 0 180px">
              <label>Project No</label>
              <div class="vid-input-btn">
                <input type="text" class="vid-input vid-input-readonly" v-model.trim="formData['ref_pre_event']" readonly>
                <button class="vid-icon-btn" @click.prevent="$refs.Project.openModal()" v-tooltip="'ค้นหา Project'"><i class="fas fa-search"></i></button>
              </div>
            </div>
            <div class="vid-field" style="flex:1">
              <label>Project Name</label>
              <input type="text" class="vid-input vid-input-readonly" v-model.trim="formData['pre_des']" readonly>
            </div>
          </div>

          <!-- ── ที่อยู่ลูกค้า ── -->
          <div class="vid-section-label">
            <i class="fas fa-map-marker-alt"></i> ที่อยู่ลูกค้า
          </div>
          <div class="vid-field-row">
            <div class="vid-field" style="flex:1">
              <label>Address (1)</label>
              <textarea class="vid-textarea vm-input-readonly" rows="3" v-model.trim="formData.address1" readonly></textarea>
            </div>
            <div class="vid-field" style="flex:1">
              <label>Address (2)</label>
              <textarea class="vid-textarea vm-input-readonly" rows="3" v-model.trim="formData.address2" readonly></textarea>
            </div>
            <div class="vid-field" style="flex:1">
              <label>Address (3)</label>
              <textarea class="vid-textarea vm-input-readonly" rows="3" v-model.trim="formData.address3" readonly></textarea>
            </div>
          </div>

          <!-- ── ผู้ติดต่อและผู้ดูแล ── -->
          <div class="vid-section-label">
            <i class="fas fa-users"></i> ผู้ติดต่อและผู้ดูแล
          </div>
          <div class="vid-field-row">
            <div class="vid-field" style="flex:1">
              <label>Contact Person</label>
              <input type="text" class="vid-input vid-input-readonly" v-model.trim="formData.contact" readonly>
            </div>
            <div class="vid-field" style="flex:1">
              <label>Sale Name</label>
              <input type="text" class="vid-input vid-input-readonly" v-model.trim="formData.salename" readonly>
            </div>
          </div>

        </div>
      </div>

      <!-- Status Card -->
      <div class="vid-card vid-card-status">
        <div class="vid-card-head">
          <i class="fas fa-toggle-on"></i> สถานะ
        </div>
        <div class="vid-card-body vid-status-panel">
          <label class="vid-status-item" :class="{ 'is-on': formData.go_live === 'Y' }">
            <input type="checkbox" class="vid-status-cb" true-value="Y" false-value="N" v-model="formData.go_live">
            <div class="vid-status-icon"><i class="fas fa-rocket"></i></div>
            <div class="vid-status-info">
              <div class="vid-status-title">Go Live</div>
              <div class="vid-status-desc">ระบบเปิดใช้งานจริง</div>
            </div>
          </label>
          <label class="vid-status-item" :class="{ 'is-on': formData.cus_active === 'Y' }">
            <input type="checkbox" class="vid-status-cb" true-value="Y" false-value="N" v-model="formData.cus_active">
            <div class="vid-status-icon"><i class="fas fa-check-circle"></i></div>
            <div class="vid-status-info">
              <div class="vid-status-title">Active</div>
              <div class="vid-status-desc">สถานะลูกค้าปกติ</div>
            </div>
          </label>
          <label class="vid-status-item is-disabled" :class="{ 'is-on': formData.cus_ma === 'Y' }">
            <input type="checkbox" class="vid-status-cb" true-value="Y" false-value="N" v-model="formData.cus_ma" disabled>
            <div class="vid-status-icon"><i class="fas fa-tools"></i></div>
            <div class="vid-status-info">
              <div class="vid-status-title">Maintenance</div>
              <div class="vid-status-desc">อยู่ระหว่างการบำรุงรักษา</div>
            </div>
          </label>
          <label class="vid-status-item is-danger" :class="{ 'is-on': formData.service_inactive === 'Y', 'is-disabled': !isDeveloper() }">
            <input type="checkbox" class="vid-status-cb" true-value="Y" false-value="N" v-model="formData.service_inactive" :disabled="!isDeveloper()">
            <div class="vid-status-icon"><i class="fas fa-pause-circle"></i></div>
            <div class="vid-status-info">
              <div class="vid-status-title">Deactivate</div>
              <div class="vid-status-desc">ระงับการให้บริการ</div>
            </div>
          </label>
        </div>
      </div>

    </div>

    <!-- ══════════════════════════════════════════
         ROW 2 : Contract Dates + License/Package
    ══════════════════════════════════════════ -->
    <div class="vid-row-mid">

      <!-- Contract Dates -->
      <div class="vid-card">
        <div class="vid-card-head">
          <i class="fas fa-calendar-alt"></i> วันที่สัญญา
        </div>
        <div class="vid-card-body">
          <div class="vid-date-grid">
            <div class="vid-date-group">
              <div class="vid-date-label"><i class="fas fa-shield-alt"></i> Warranty</div>
              <div class="vid-field-row">
                <div class="vid-field">
                  <label>Start Date</label>
                  <datepicker input-class="form-control" v-model="formData.warranty_start_dt" :disabled="!isDeveloper()"></datepicker>
                </div>
                <div class="vid-field">
                  <label>End Date</label>
                  <datepicker input-class="form-control" v-model="formData.warranty_end_dt" :disabled="!isDeveloper()"></datepicker>
                </div>
              </div>
            </div>
            <div class="vid-date-divider"></div>
            <div class="vid-date-group">
              <div class="vid-date-label"><i class="fas fa-handshake"></i> MA</div>
              <div class="vid-field-row">
                <div class="vid-field">
                  <label>Start Date</label>
                  <datepicker input-class="form-control" v-model="formData.ma_start_dt" :disabled="!isDeveloper()"></datepicker>
                </div>
                <div class="vid-field">
                  <label>End Date</label>
                  <datepicker input-class="form-control" v-model="formData.ma_end_dt" :disabled="!isDeveloper()"></datepicker>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- License & Package -->
      <div class="vid-card">
        <div class="vid-card-head">
          <i class="fas fa-layer-group"></i> License &amp; Package
        </div>
        <div class="vid-card-body">
          <div class="vid-field-row">
            <div class="vid-field" style="flex:1">
              <label>Package</label>
              <select class="vid-select" v-model="formData.package_code" @change="sendBack()()">
                <option value="" disabled>-- Please select --</option>
                <option :value="x.package_code" v-for="(x,idx) in formPackageData" :key="idx">{{x.package_name}}</option>
              </select>
            </div>
            <div class="vid-field" style="flex:0 0 130px">
              <label>Tenant</label>
              <select class="vid-select" v-model="formData.tenant" v-bind:disabled="xt.isEmpty(formData.cus_code)" @change="sendBack()">
                <option value="" disabled>-- Select --</option>
                <option value="N">Rent</option>
                <option value="Y">Purchased</option>
              </select>
            </div>
            <div class="vid-field" style="flex:0 0 130px" v-if="formData['tenant'] == 'N'">
              <label>Cloud</label>
              <select class="vid-select" v-model="formData.cloud_rent" v-bind:disabled="xt.isEmpty(formData.cus_code)" @change="sendBack()">
                <option value="" disabled>-- Select --</option>
                <option value="UIH">UIH</option>
                <option value="INET">INET</option>
                <option value="HUAWEI">HUAWEI</option>
                <option value="AWS">AWS</option>
              </select>
            </div>
          </div>
          <div class="vid-field-row vid-mt-8">
            <div class="vid-field" style="flex:0 0 140px">
              <label>Total License</label>
              <div class="vid-input-btn">
                <input type="text" class="vid-input" v-model="form.total" disabled>
                <button class="vid-icon-btn" @click="addNew('op_license')" v-tooltip="'เพิ่ม License'"><i class="fas fa-plus"></i></button>
              </div>
            </div>
            <div class="vid-field" style="flex:0 0 140px">
              <label>Multicompany</label>
              <div class="vid-input-btn">
                <input type="text" class="vid-input" v-model="formData.multi_comp" disabled>
                <button class="vid-icon-btn" @click="addNew('company')" v-tooltip="'เพิ่ม Company'"><i class="fas fa-plus"></i></button>
              </div>
            </div>
            <div class="vid-field" style="flex:0 0 140px">
              <label>Database</label>
              <div class="vid-input-btn">
                <input type="text" class="vid-input" v-model="formData.database_total" disabled>
                <button class="vid-icon-btn" @click="addNew('company')" v-tooltip="'เพิ่ม Database'"><i class="fas fa-plus"></i></button>
              </div>
            </div>
            <div class="vid-field" style="flex:0 0 120px">
              <label>DB Type</label>
              <select class="vid-select" v-model="formData.db_type" @change="sendBack()" v-bind:disabled="formData.isDb == 'N'">
                <option value="" disabled>-- Select --</option>
                <option value="Q">SQL</option>
                <option value="S">Sybase</option>
              </select>
            </div>
            <div class="vid-field vid-field-center">
              <label>&nbsp;</label>
              <div class="vid-check-group">
                <label class="vid-check-pill" v-bind:class="{ active: formData.unlimit_license === 'Y' }">
                  <input type="checkbox" true-value="Y" false-value="N" @change="sendBack()" v-model="formData.unlimit_license">
                  <i class="fas fa-infinity"></i> Unlimit
                </label>
                <label class="vid-check-pill" v-bind:class="{ active: formData.branch === 'Y' }">
                  <input type="checkbox" true-value="Y" false-value="N" @change="sendBack()" v-model="formData.branch">
                  <i class="fas fa-sitemap"></i> Branch
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ══════════════════════════════════════════
         ROW 3 : Modules + Passcode
    ══════════════════════════════════════════ -->
    <div class="vid-row-bot">

      <!-- Modules -->
      <div class="vid-card">
        <div class="vid-card-head">
          <i class="fas fa-cubes"></i> Modules
        </div>
        <div class="vid-card-body">
          <div class="vid-module-section">
            <div class="vid-module-label">
              <i class="fas fa-check-square"></i> Standard
            </div>
            <div class="vid-chips">
              <span class="vid-chip vid-chip-std" v-for="x in standard_module" :key="x.module_code">{{x.module_code}}</span>
              <span class="vid-chip-empty" v-if="!standard_module || standard_module.length === 0">— ไม่มี —</span>
            </div>
          </div>
          <div class="vid-module-divider"></div>
          <div class="vid-module-section">
            <div class="vid-module-label">
              <i class="fas fa-puzzle-piece"></i> Optional
            </div>
            <div class="vid-chips">
              <span class="vid-chip vid-chip-opt" v-for="x in optional_module" :key="x.module_code">{{x.module_code}}</span>
              <button class="vid-chip-add" @click="addNew('module')"><i class="fas fa-plus"></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Passcode -->
      <div class="vid-card vid-card-passcode">
        <div class="vid-card-head">
          <i class="fas fa-mobile-alt"></i> Mobile Application (Passcode)
        </div>
        <div class="vid-card-body">
          <div class="vid-field-row">
            <div class="vid-field" style="flex:0 0 180px">
              <label>รหัสเข้าใช้งาน</label>
              <div class="vid-input-btn">
                <input type="text" class="vid-input" v-model="formData.cus_code" id="cus_code">
                <button class="vid-icon-btn vid-icon-copy" v-tooltip="'คัดลอก'"><i class="fas fa-copy"></i></button>
              </div>
            </div>
            <div class="vid-field" style="flex:1" v-show="isDeveloper()">
              <label>รหัสผ่าน</label>
              <div class="vid-input-btn">
                <input type="text" class="vid-input" id="user_pass" v-model="formData.user_pass" readonly>
                <button class="vid-btn-gen" v-on:click="createPassword"><i class="fas fa-sync-alt"></i> สร้างรหัสผ่าน</button>
                <button class="vid-icon-btn vid-icon-copy" @click="copyText('user_pass')" v-tooltip="'คัดลอก'"><i class="fas fa-copy"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- External Program Credentials -->
      <div class="vid-card vid-card-extcred">
        <div class="vid-card-head">
          <i class="fas fa-key"></i> Credentials For CSM V2
        </div>
        <div class="vid-card-body">
          <div class="vid-extcred-note">
            <i class="fas fa-info-circle"></i> Username / Password For CSM V2
          </div>
          <div class="vid-field-row vid-mt-8">
            <div class="vid-field" style="flex:1">
              <label>User</label>
              <div class="vid-input-btn">
                <input type="text" class="vid-input vid-input-readonly" v-model="formData.userid" id="userid" readonly>
                <button class="vid-icon-btn vid-icon-copy" @click="copyText('userid')" v-tooltip="'คัดลอก'"><i class="fas fa-copy"></i></button>
              </div>
            </div>
            <div class="vid-field" style="flex:1">
              <label>Password</label>
              <div class="vid-input-btn">
                <input type="text" class="vid-input vid-input-readonly"  v-model="formData.userpass" id="userpass" readonly>
                <button class="vid-icon-btn vid-icon-copy" @click="copyText('userpass')" v-tooltip="'คัดลอก'"><i class="fas fa-copy"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ══════════════════════════════════════════
         ROW 4 : Remarks Table
    ══════════════════════════════════════════ -->
    <div class="vid-card vid-card-remark">
      <div class="vid-card-head">
        <span><i class="fas fa-comment-alt"></i> รายละเอียดลูกค้า</span>
        <button class="vid-head-btn" @click="addNew('remark')"><i class="fas fa-plus text-white"></i> {{ ui.new || 'New' }}</button>
      </div>
      <div class="vid-card-body vid-card-body-table">
        <table-stick>
          <table class="table table-hover table-bordered vid-table">
            <thead>
              <tr>
                <th class="tf-2 text-center">No.</th>
                <th class="tf-2 text-center">Action</th>
                <th class="tf-5">Subject</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(x, idx) in remarkData" :key="idx" @dblclick="addNew('view_remark',x)" style="cursor:pointer;">
                <td align="center">{{x.item || idx+1}}</td>
                <td align="center">
                  <a class="text-black" href="#" @click.prevent="setEdit(x, 'remark')"><v-icon name="edit" class="v-icon-width"></v-icon></a>
                  <a class="text-danger" href="#" @click.prevent="onDelRemark(x)"><v-icon name="trash-2" class="v-icon-width"></v-icon></a>
                </td>
                <td>{{x.subject}}</td>
                <td>{{x.remark}}</td>
              </tr>
            </tbody>
          </table>
        </table-stick>
        <div class="vid-paging">
          <pagination ref="remark_paging" @page-change="pageChange($event.page,'remark')"></pagination>
        </div>
      </div>
    </div>
  <!-- Input Attach File -->
    <input type="file" ref="myFile" name="myFile" accept=".doc, .docx, .xls, .xlsx, .txt, .ppt, .pptx, .pdf, .zip, .rar, .mp4, image/*" style="display:none;">
    <!-- ══ Modal: Add / Edit Remark ══ -->
    <modal-2 ref="RemarkModal">
      <template #header>
        <div class="vm-header">
          <i class="fas fa-comment-alt vm-header-icon vm-icon-blue"></i>
          <span>{{ editMode ? 'แก้ไข Remark' : 'เพิ่ม Remark' }}</span>
        </div>
      </template>
      <template #body>
        <div class="vm-body">
          <div class="vm-field">
            <label class="vm-label">เรื่อง <span class="vm-required">*</span></label>
            <select class="vm-select" v-model.trim="form['subject_code']">
              <option v-for="x in subjectData" :key="x.subject_code" :value="x.subject_code">{{x.subject}}</option>
            </select>
          </div>
          <div class="vm-field vm-mt">
            <label class="vm-label">รายละเอียด</label>
            <textarea class="vm-textarea" rows="5" v-model.trim="form['remark']" maxlength="1000" placeholder="กรอกรายละเอียด..."></textarea>
            <span class="vm-hint">{{ (form['remark'] || '').length }} / 1000</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="vm-footer">
          <button class="vm-btn-save" @click="onSaveRemark()"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
        </div>
      </template>
    </modal-2>

    <!-- ══ Modal: View Remark ══ -->
    <modal-2 ref="ViewRemark">
      <template #header>
        <div class="vm-header">
          <i class="fas fa-eye vm-header-icon vm-icon-gray"></i>
          <span>{{ form['subject'] || 'รายละเอียด' }}</span>
        </div>
      </template>
      <template #body>
        <div class="vm-body">
          <div class="vm-field">
            <label class="vm-label">รายละเอียด</label>
            <textarea class="vm-textarea vm-textarea-readonly" rows="8" v-model.trim="form['remark']" maxlength="1000" disabled></textarea>
          </div>
        </div>
      </template>
      <template #footer><div></div></template>
    </modal-2>

    <!-- ══ Modal: Add License ══ -->
    <modal-2 ref="LicenseModal" @close-function="resetLicenseModal()">
      <template #header>
        <div class="vm-header">
          <i class="fas fa-id-card vm-header-icon vm-icon-green"></i>
          <span>จัดการ License</span>
        </div>
      </template>
      <template #body>
        <div class="vm-body vm-body--modal-scroll">
          <!-- Summary Bar -->
          <div class="vm-summary-bar">
            <div class="vm-summary-item">
              <span class="vm-summary-label">Total License</span>
              <span class="vm-summary-value">{{ form.total || 0 }}</span>
            </div>
            <div class="vm-summary-item">
              <span class="vm-summary-label">PO License</span>
              <span class="vm-summary-value vm-val-blue">{{ form.add_license || 0 }}</span>
            </div>
            <div class="vm-summary-item">
              <span class="vm-summary-label">Free License</span>
              <span class="vm-summary-value vm-val-green">{{ form.license || 0 }}</span>
            </div>
            <div class="vm-summary-item">
              <span class="vm-summary-label">Trial License</span>
              <span class="vm-summary-value vm-val-orange">{{ form.tot_license || 0 }}</span>
            </div>
            <button class="vm-btn-add vm-ml-auto" @click="addNew('license')"><i class="fas fa-plus"></i> เพิ่มแถว</button>
          </div>
          <!-- Table -->
          <div class="vm-table-wrap vm-table-wrap--scroll">
            <table class="vm-table">
              <thead>
                <tr>
                  <th style="width:46px">ลบ</th>
                  <th class="text-center" style="width:46px">No.</th>
                  <th class="text-right">PO License</th>
                  <th class="text-right">Free License</th>
                  <th class="text-right">Trial License</th>
                  <th style="width:150px">Trial Start Date</th>
                  <th style="width:150px">Trial End Date</th>
                  <th>Remark</th>
                  <th>Add User</th>
                  <th>Add Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(x,idx) in displayData" :key="idx" :class="{ 'vm-row-disabled': x.is_edit === false }">
                  <td class="text-center">
                    <a class="vm-del-btn" href="#" @click.prevent="onDelLicense(x, x.is_new ? 'DelLicense2' : 'DelLicense')">
                      <v-icon name="trash-2" class="v-icon-width"></v-icon>
                    </a>
                  </td>
                  <td class="text-center">{{x.item}}</td>
                  <td><number class="vm-input text-right" v-model="x.add_license" :disabled="x.is_edit == false"></number></td>
                  <td><number class="vm-input text-right" v-model="x.license" :disabled="x.is_edit == false"></number></td>
                  <td><number class="vm-input text-right" v-model="x.tot_license" :disabled="x.is_edit == false"></number></td>
                  <td><datepicker input-class="form-control" v-model="x.start_dt" :disabled="x.is_edit == false"></datepicker></td>
                  <td><datepicker input-class="form-control" v-model="x.end_dt" :disabled="x.is_edit == false"></datepicker></td>
                  <td><input type="text" class="vm-input" v-model="x.remark"></td>
                  <td class="text-center vm-td-meta">{{x.adduser}}</td>
                  <td class="text-center vm-td-meta">{{$date(x.add_dt, 'DD/MM/YYYY HH:mm')}}</td>
                </tr>
                <tr v-if="LicenseData.length === 0">
                  <td class="vm-empty" colspan="10"><i class="fas fa-inbox"></i> ไม่มีข้อมูล</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="vm-footer vm-footer-spread">
          <pagination ref="license_paging" @page-change="pageChange($event.page,'license')"></pagination>
          <button class="vm-btn-save" @click="onSaveLicense()"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
        </div>
      </template>
    </modal-2>

    <!-- ══ Modal: Multicompany / Database ══ -->
    <modal-2 ref="CompanyModal">
      <template #header>
        <div class="vm-header">
          <i class="fas fa-database vm-header-icon vm-icon-purple"></i>
          <span>จัดการ Multicompany &amp; Database</span>
        </div>
      </template>
      <template #body>
        <div class="vm-body vm-body--modal-scroll">
          <!-- Input Group -->
          <div class="vm-input-section">
            <!-- Multicompany row -->
            <div class="vm-section-title"><i class="fas fa-building"></i> Multicompany</div>
            <div class="vm-field-row">
              <div class="vm-field">
                <label class="vm-label">Company (ปัจจุบัน)</label>
                <number class="vm-input" v-model.number="form.comp_qty" disabled></number>
              </div>
              <div class="vm-field">
                <label class="vm-label">เพิ่ม <span class="vm-required">*</span></label>
                <number class="vm-input vm-input-active" v-model.number="form.add_comp" @keyup="CalTotal('company')"></number>
              </div>
              <div class="vm-field">
                <label class="vm-label">รวม</label>
                <number class="vm-input vm-input-total" v-model.number="form.tot_comp" disabled></number>
              </div>
            </div>
            <!-- Database row -->
            <div class="vm-section-title vm-mt"><i class="fas fa-server"></i> Database</div>
            <div class="vm-field-row">
              <div class="vm-field">
                <label class="vm-label">Database (ปัจจุบัน)</label>
                <number class="vm-input" v-model="form.db_qty" disabled></number>
              </div>
              <div class="vm-field">
                <label class="vm-label">เพิ่ม <span class="vm-required">*</span></label>
                <number class="vm-input vm-input-active" v-model="form.add_db" @input="CalTotal('company')"></number>
              </div>
              <div class="vm-field">
                <label class="vm-label">รวม</label>
                <number class="vm-input vm-input-total" v-model="form.tot_db" disabled></number>
              </div>
              <div class="vm-field vm-field-grow">
                <label class="vm-label">แนบไฟล์</label>
                <div class="vm-file-wrap">
                  <input type="text" class="vm-input" v-model.trim="form.filename" disabled placeholder="ยังไม่ได้เลือกไฟล์">
                  <button class="vm-file-btn" @click="addFile()"><i class="fas fa-upload"></i> เลือกไฟล์</button>
                </div>
              </div>
            </div>
          </div>
          <!-- History Table -->
          <div class="vm-table-wrap vm-table-wrap--scroll vm-mt">
            <table class="vm-table">
              <thead>
                <tr>
                  <th class="text-center">No.</th>
                  <th class="text-right">DB</th>
                  <th class="text-right">+DB</th>
                  <th class="text-right">Total DB</th>
                  <th class="text-right">Company</th>
                  <th class="text-right">+Company</th>
                  <th class="text-right">Total Company</th>
                  <th>Attach File</th>
                  <th>Add User</th>
                  <th>Add Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(x,idx) in databaseData" :key="idx">
                  <td class="text-center">{{x.item}}</td>
                  <td class="text-right">{{x.db_qty}}</td>
                  <td class="text-right">{{x.add_db}}</td>
                  <td class="text-right">{{x.tot_db}}</td>
                  <td class="text-right">{{x.comp_qty}}</td>
                  <td class="text-right">{{x.add_comp}}</td>
                  <td class="text-right">{{x.tot_comp}}</td>
                  <td>
                    <template v-if="x.filepath">
                      <a :href="['png','jpeg','jpg','mp4'].includes(getFileExt(x.filename)) ? createFilePath(x.filepath) : downLoadFile(x)" target="_blank" class="vm-file-link">
                        <i :class="{'fas fa-file-word':['doc','docx'].includes(getFileExt(x.filename)), 'fas fa-file-excel':['xls','xlsx'].includes(getFileExt(x.filename)), 'fas fa-file-pdf':['pdf'].includes(getFileExt(x.filename)), 'fas fa-file-image':['png','jpg','jpeg'].includes(getFileExt(x.filename)), 'fas fa-file':true}"></i>
                        {{ x.filename }}
                      </a>
                    </template>
                  </td>
                  <td class="vm-td-meta text-center">{{x.adduser}}</td>
                  <td class="vm-td-meta text-center">{{$date(x.add_dt, 'DD/MM/YYYY HH:mm')}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="vm-footer vm-footer-spread">
          <pagination ref="multi_paging" @page-change="pageChange($event.page,'multicompany')"></pagination>
          <button class="vm-btn-save" @click="onSaveCompany()"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
        </div>
      </template>
    </modal-2>

    <!-- ══ Modal: Module ══ -->
    <modal-2 ref="ModuleModal">
      <template #header>
        <div class="vm-header">
          <i class="fas fa-cubes vm-header-icon vm-icon-indigo"></i>
          <span>{{ editMode ? 'แก้ไข Module' : 'จัดการ Module' }}</span>
        </div>
      </template>
      <template #body>
        <div class="vm-body vm-body--modal-scroll">
          <div class="vm-table-wrap vm-table-wrap--scroll-lg">
            <table class="vm-table vm-table--fixed">
              <thead>
                <tr>
                  <th class="text-center" style="width:56px">No.</th>
                  <th style="width:130px">Module</th>
                  <th class="text-center" style="width:100px">Type</th>
                  <th class="text-center" style="width:70px">Active</th>
                  <th style="min-width:180px">Remark</th>
                  <th class="text-center" style="width:110px">Add By</th>
                  <th class="text-center" style="width:140px">Add Date</th>
                  <th class="text-center" style="width:110px">Edit User</th>
                  <th class="text-center" style="width:140px">Edit Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(x,idx) in allmodule" :key="idx">
                  <td class="text-center">{{idx+1}}</td>
                  <td><span class="vm-module-badge" :class="x.module_type==='S' ? 'vm-badge-std' : 'vm-badge-opt'">{{x.module_code}}</span></td>
                  <td class="text-center">
                    <span class="vm-type-tag" :class="x.module_type==='S' ? 'vm-tag-std' : 'vm-tag-opt'">
                      {{ x.module_type === 'S' ? 'Standard' : 'Optional' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <label class="vm-toggle" :class="{ 'vm-toggle-on': x.active==='Y', 'vm-toggle-disabled': x.module_type==='S' }">
                      <input type="checkbox" true-value="Y" false-value="N" v-model="x.active" :disabled="x.module_type==='S'">
                    </label>
                  </td>
                  <td><input type="text" class="vm-input" v-model.trim="x.remark" maxlength="500" placeholder="หมายเหตุ..."></td>
                  <td class="vm-td-meta text-center">{{x.adduser}}</td>
                  <td class="vm-td-meta text-center">{{$date(x.add_dt, 'DD/MM/YYYY HH:mm')}}</td>
                  <td class="vm-td-meta text-center">{{x.edituser}}</td>
                  <td class="vm-td-meta text-center">{{$date(x.edit_dt, 'DD/MM/YYYY HH:mm')}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="vm-footer">
          <button class="vm-btn-save" @click="onSaveModule()"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
        </div>
      </template>
    </modal-2>

    <!-- ══ Modal: Warranty Date ══ -->
    <modal-2 ref="WarrantyModal">
      <template #header>
        <div class="vm-header">
          <i class="fas fa-shield-alt vm-header-icon vm-icon-blue"></i>
          <span>Add Warranty Date</span>
          <button class="vm-btn-save vm-ml-auto" @click="onSaveHistory('warranty')"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
        </div>
      </template>
      <template #body>
        <div class="vm-body">
          <div class="vm-field-row">
            <div class="vm-field">
              <label class="vm-label">Warranty Start Date <span class="vm-required">*</span></label>
              <datepicker input-class="form-control" v-model="form.start_dt" @change="setEndDate()"></datepicker>
            </div>
            <div class="vm-field">
              <label class="vm-label">Warranty End Date</label>
              <datepicker input-class="form-control vm-input-readonly" v-model="form.end_dt" :disabled="true"></datepicker>
            </div>
          </div>
          <div class="vm-table-wrap vm-mt">
            <table class="vm-table">
              <thead>
                <tr>
                  <th class="text-center">No.</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th class="text-center">คงเหลือ</th>
                  <th>Attach File</th>
                  <th>Add User</th>
                  <th>Add Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(x,idx) in warrantyData" :key="idx">
                  <td class="text-center">{{idx+1}}</td>
                  <td>{{$date(x.start_dt)}}</td>
                  <td>{{$date(x.end_dt)}}</td>
                  <td class="text-center">{{x.overdue}}</td>
                  <td>
                    <a v-if="x.filepath" :href="['png','jpeg','jpg','mp4'].includes(getFileExt(x.filename)) ? createFilePath(x.filepath) : downLoadFile(x)" target="_blank" class="vm-file-link">
                      <i class="fas fa-download"></i> {{x.filename}}
                    </a>
                  </td>
                  <td class="vm-td-meta text-center">{{x.adduser}}</td>
                  <td class="vm-td-meta text-center">{{$date(x.add_dt, 'DD/MM/YYYY HH:mm')}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
      <template #footer><div></div></template>
    </modal-2>

    <!-- ══ Modal: MA Date ══ -->
    <modal-2 ref="MaModal">
      <template #header>
        <div class="vm-header">
          <i class="fas fa-handshake vm-header-icon vm-icon-teal"></i>
          <span>{{ editMode ? 'แก้ไข MA Date' : 'Add MA Date' }}</span>
          <button class="vm-btn-save vm-ml-auto" @click="onSaveHistory('ma')"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
        </div>
      </template>
      <template #body>
        <div class="vm-body">
          <div class="vm-field-row">
            <div class="vm-field">
              <label class="vm-label">MA Start Date <span class="vm-required">*</span></label>
              <datepicker input-class="form-control" v-model="form.start_dt" @change="setEndDate()"></datepicker>
            </div>
            <div class="vm-field">
              <label class="vm-label">MA End Date</label>
              <datepicker input-class="form-control vm-input-readonly" v-model="form.end_dt" :disabled="true"></datepicker>
            </div>
          </div>
          <div class="vm-table-wrap vm-mt">
            <table class="vm-table">
              <thead>
                <tr>
                  <th class="text-center">No.</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th class="text-center">คงเหลือ</th>
                  <th>Attach File</th>
                  <th>Add User</th>
                  <th>Add Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(x,idx) in maData" :key="idx">
                  <td class="text-center">{{idx+1}}</td>
                  <td>{{$date(x.start_dt)}}</td>
                  <td>{{$date(x.end_dt)}}</td>
                  <td class="text-center">{{x.overdue}}</td>
                  <td>
                    <a v-if="x.filepath" :href="['png','jpeg','jpg','mp4'].includes(getFileExt(x.filename)) ? createFilePath(x.filepath) : downLoadFile(x)" target="_blank" class="vm-file-link">
                      <i class="fas fa-download"></i> {{x.filename}}
                    </a>
                  </td>
                  <td class="vm-td-meta text-center">{{x.adduser}}</td>
                  <td class="vm-td-meta text-center">{{$date(x.add_dt, 'DD/MM/YYYY HH:mm')}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
      <template #footer><div></div></template>
    </modal-2>

    <vue-project-list ref="Project" @send-data="setProject($event)"></vue-project-list>
  </div>
</template>
<script>
  import Modal from '../../../Center/modal.vue';
  let remark_paging = {};
  let license_paging = {};
  let multi_paging = {};
  export default {
    props: {
      pre_event : {
        type : String,
        default : ""
      },
      customer_code : {
        type : String,
        default : ""
      },
      formData : {
      type: Object,
      default:{}
    }
    },
    data() {
      return {
        ui: window.ui,
        queryString,
        baseUrl,
        xt: $xt,
        allmodule: {},
        data: [],
        datalist: [],
        databaseData: [],
        displayData: [],
        editMode : false,
        form : {},
        form_remark: {},
        formtype: "",
        formPackageData : [],
        LicenseData: [],
        LicenseData2: [],
        maData: [],
        optional_module: {},
        old_password: "",
        pageNumber: 1,
        remarkData : [],
        subjectData : [],
        standard_module : [],
        tabInfo_isEdit: false,
        total_datalist:0,
        warrantyData: [],
        warrantyStatus: 'N',
      }
    },
    methods: {
      async loadSubjectData() {
        let act = `csm/Master/CSMSubject_ReadList?active=Y`;
        let rsp = await $xt.getServer(act);

        this.subjectData = rsp.data.data;
      },
      async loadRemarkData() {
        let act = `csm/Data/CustomerRemark_ReadList?skip=${remark_paging.skipItems()}&take=${remark_paging.getItemsPerPage()}&customer_code=${this.customer_code}`;
        let rsp = await $xt.getServer(act);

        this.remarkData = rsp.data;
        let i = remark_paging.skipItems() == 0 ? 0 : remark_paging.skipItems();
        this.remarkData.forEach(x => {
          this.$set(x ,'item', ++i);
        })
        remark_paging.setTotalItems(rsp.total || 1);
        if (!remark_paging.getItemsPerPage()) {
          remark_paging.setCurrentPage(1);
        }
        remark_paging.createPagesArray();
      },
      async loadModuleData() {
        let act = `csm/Data/CustomerModule_ReadList?skip=0&take=999&customer_code=${this.customer_code}`;
        // let act = `csm/Data/CustomerModule_ReadList?skip=0&take=999&customer_code=CUS0001137`;
        let rsp = await $xt.getServer(act);

        this.allmodule = rsp.data;
        this.standard_module = $linq(rsp.data).where(x => x.module_type == "S").toArray();
        this.optional_module = $linq(rsp.data).where(x => x.module_type == "O" && x.active == "Y").toArray();
      },
      async loadFormPackage() {
        let act = `csm/master/FormPackage_ReadList?search_text=${encodeURIComponent('')}&type=H`;
        let rsp = await $xt.getServer(act);
        this.formPackageData = rsp.data.data_rows;
      },
      async loadLicenseData() {
        // let act = `csm/Data/License_ReadList?skip=${license_paging.skipItems() || 0}&take=${license_paging.getItemsPerPage() || 10}&customer_code=${this.customer_code}`;
        let act = `csm/Data/License_ReadList?customer_code=${this.customer_code}`;
        let rsp = await $xt.getServer(act);

        this.LicenseData = [...rsp.data, ...this.LicenseData2];

        let i = 0;
        $linq(rsp.data).foreach(x => {
          this.$set(x, "item", ++i);
          if(x.maincode){
            this.$set(x, "is_new", false)
          }
        });

        this.pageChange(this.pageNumber, 'license');

        license_paging.setTotalItems(this.LicenseData.length || 1);

        if (!license_paging.getItemsPerPage()) {

          license_paging.setCurrentPage(1);
        }
        license_paging.createPagesArray();

        this.form = rsp.grand || {
          license: 0,
          add_license: 0,
          tot_license: 0,
          total: 0
        }
      },
      async loadCompanyData() {
        let act = `csm/Data/Company_ReadList?skip=${multi_paging.skipItems()}&take=${multi_paging.getItemsPerPage()}&customer_code=${this.customer_code}`;
        let rsp = await $xt.getServer(act);

        this.databaseData = rsp.data;

        let i = multi_paging.skipItems() == 0 ? 0 : multi_paging.skipItems()
        this.databaseData.forEach((x) => {
          this.$set(x , 'item', ++i)
        })

        multi_paging.setTotalItems(rsp.total || 1);
        if (!multi_paging.getItemsPerPage()) {
          multi_paging.setCurrentPage(1);
        }
        multi_paging.createPagesArray();
        // this.form = rsp.grand || {
        //   db_qty : 0,
        //   tot_db : 0,
        //   comp_qty : 0,
        // }
        let q = $linq(this.appListData).orderBy(x => x.itemno);
        this.form.comp_qty = $linq(this.databaseData).sum(x => x.add_comp) ?? 0;
        this.form.add_comp = 0;
        this.form.db_qty = $linq(this.databaseData).sum(x => x.add_db) ?? 0;
        this.form.add_db = 0;
        await this.CalTotal('company');
      },
      async loadHistoryData() {
        let act = `csm/Data/History_ReadList?skip=0&take=10&customer_code=${this.customer_code}`;
        let rsp = await $xt.getServer(act);

        this.warrantyData = $linq(rsp.data).where(x => x.type == "W").toArray();
        this.maData = $linq(rsp.data).where(x => x.type == "M").toArray();
      },
      async onSaveRemark() {
        this.$set(this.form, "customer_code", this.customer_code)
        try {
          let f = {
            data: this.form
          };
          let act = `CSM/Data/CustomerRemark_Create`;
          if (this.editMode) {
            act = `CSM/Data/CustomerRemark_Update`;
          }
          this.$emit('loading', 'show')
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          this.$refs.RemarkModal.closeModal();
          await this.loadRemarkData();
          $msg.alert(``, `Success`, `success`);
          this.reset();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          this.$emit('loading', 'hide')
        }
      },
      async onSaveCompany() {
        if (this.form.add_comp < 1 && this.form.add_db < 1) {
          await $msg.alert(``, 'ต้องใส่ Add Company หรือ Add DB อย่างน้อย 1 ', 'warning')
          return;
        }
        try {
          let f = {
            data: this.form
          };
          let act = `CSM/Data/Company_Create`;
          if (this.editMode) {
            act = `CSM/Data/Company_Update`;
          }
          this.$emit('loading', 'show')
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          await this.loadCompanyData();
          $msg.alert(``, `Success`, `success`);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          this.$emit('loading', 'hide')
        }
      },
      async onSaveLicense() {
        let Arr = $linq(this.LicenseData).where(x=> x.is_edit == true).toArray()
        let ck = $linq(Arr).any(x => (x.add_license || 0) == 0 && (x.license || 0) == 0 && (x.tot_license || 0) == 0) || false

        if (ck) {
          await $msg.alert(``, 'ต้องใส่ License อย่างน้อย 1 ', 'warning')
          return;
        }

        try {
          let f = {
            data: this.LicenseData
          };

          let act = `CSM/Data/License_CreateAndUpdate`;

          this.$emit( 'loading' , 'show');

          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          this.LicenseData2 = []
          await this.loadLicenseData();
          $msg.alert(``, `Success`, `success`);
          this.$refs.LicenseModal.closeModal()
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          this.$emit( 'loading' , 'hide');
        }
      },
      async onSaveHistory(type) {
        switch (type) {
          case "warranty":
            this.form.type = "W";
            break;
          case "ma":
            this.form.type = "M";
            break;
        }
        try {
          let f = {
            data: this.form
          };
          let act = `CSM/Data/History_Create`;
          if (this.editMode) {
            act = `CSM/Data/History_Update`;
          }
          this.$emit("loading" , "show");
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          $(this.$refs.WarrantyModal).modal('hide');
          await this.loadHistoryData();
          $msg.alert(``, `Success`, `success`);
          this.reset();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          // page.loadingBox.hide();
          this.$emit("loading" , "hide");
        }
      },
      async onDelRemark(x) {
        if (!await $msg.confirm(`ต้องการลบข้อมูลรายการที่ ${x.itemno} ใช่หรือไม่`)) {
          return;
        }
        try {
          let f = {
            customer_code: this.customer_code,
            itemno: x.itemno
          };
          let act = `CSM/Data/CustomerRemark_Delete`;
          this.$emit('loading', 'show')
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }

          await this.reset();
          await this.loadRemarkData();
          $msg.alert(``, `Success`, `success`);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          this.$emit('loading', 'hide')
        }
      },
      async onDelLicense(x,type){
        let d = {
          customer_code : this.customer_code,
          itemno : x.itemno
        }
        switch (type) {
          case "DelLicense":
            try {
              if (!await $msg.confirm(`ต้องการลบข้อมูลรายการที่ ${x.item || ""} ใช่หรือไม่`)) {
              return;
              }

              let act = `CSM/Data/License_Delete`
              this.$emit('loading' , 'show')
              let rsp = await $xt.postServerJson(act, d);

              if(rsp.success){
                await this.loadLicenseData()
              }else{
                throw rsp.error
              }
              if(this.LicenseData.length % 10 == 1){
                if(this.pageNumber != 1 ){
                  this.$set(this , "pageNumber", this.pageNumber-1)
                }
              }
              $msg.alert(``, `Success`, `success`);

            }catch(ex){
              $msg.alert(``, ex.toString(), `danger`);
            }finally {
              this.$emit('loading' , 'hide');
            }
            break
          case "DelLicense2":
            // this.LicenseData2 = this.LicenseData2.filter(item => item.itemno != x.itemno);
            this.LicenseData2.splice(x, 1);

            if(this.LicenseData.length % 10 == 1){
              if(this.pageNumber != 1 ){
                  this.$set(this , "pageNumber", this.pageNumber-1)
                }
              }
            await this.loadLicenseData()

            break;
        }
      },
      resetLicenseModal(){
        this.LicenseData2 = []
      },
      reset () {
        this.form = {
          subject_code :"",
          remark : ""
        }
      },
      setProject(e) {
        this.$set(this.formData, "ref_pre_event", e.pre_event);
        this.$set(this.formData, "pre_des", e.pre_des);
      },
      setEdit(x, type) {
        this.editMode = true;
        this.$set(this, 'form', JSON.parse(JSON.stringify(x)));
        console.log("setEdit" + type)
        switch (type) {
          case "remark":
            this.$refs.RemarkModal.openModal()
            break;
        }
      },
      setEndDate() {
        var todayDate = this.form.start_dt ?? new Date();
        todayDate = moment(todayDate).add(1, 'years');
        todayDate = moment(todayDate).add(-1, 'days');
        this.$set(this.form, "end_dt", todayDate);
      },
      async createPassword() {
        let url = `CSM/Data/RandomKey?length=16`;
        let rsp = await $xt.getServer(url);
        this.$set(this.formData, 'user_pass', rsp);
      },
      async addNew(type,info) {
        if ($xt.isEmpty(this.formData['cus_code'])) {
          $msg.alert('คำเตือน', 'ลูกค้ายังไม่มี Passcode <br/> ติดต่อทาง IT Support', 'warning');
          return
        }

        this.editMode = false;
        this.form = {
          customer_code: this.customer_code,
          pre_event: this.pre_event,
          license: this.form.license || 0,
          add_license: this.form.add_license || 0,
          tot_license: this.form.tot_license || 0,
          total: this.form.total || 0,
        };
        switch (type) {
          case "op_license":
            this.$set(this , "pageNumber" , 1)
            await this.loadLicenseData();
            this.$refs.LicenseModal.setSize("modal-xl")
            this.$refs.LicenseModal.openModal()

            break;
          case "license":
            if(this.LicenseData.length == 0){
              var max = 0
            }else{
              var max = $linq(this.LicenseData).select(x => x.itemno).max()
            }

            let d = {
              itemno : ++max,
              start_dt: new Date(),
              is_new: true,
              end_dt: new Date(),
              customer_code: this.customer_code,
              is_edit: true
            }

            this.LicenseData.push(d)
            this.LicenseData2.push(d)

            // let pn = Math.ceil(this.LicenseData.length / 10)

            license_paging.setTotalItems(this.LicenseData.length || 1);
            let totalpage = license_paging.getTotalPages()
            license_paging.setCurrentPage(totalpage);
            this.pageChange(totalpage, 'license');
            // this.$set(this, "displayData", $linq(this.LicenseData).skip(license_paging.skipItems()).take(license_paging.getItemsPerPage()).toArray());
            license_paging.createPagesArray();

            break;
          case "company":
            this.$set(this , 'pageNumber' , 1)
            this.pageChange(this.pageNumber,'multicompany')
            this.loadCompanyData();
            this.$refs.CompanyModal.setSize("modal-xl")
            this.$refs.CompanyModal.openModal('show')
            break;
          case "database":
            this.loadCompanyData();
            this.$refs.CompanyModal.setSize("modal-xl")
            this.$refs.CompanyModal.openModal('show')
            break;
          case "module":
            this.loadModuleData();
            this.$refs.ModuleModal.setSize("modal-xl")
            this.$refs.ModuleModal.openModal('show')
            break;
          case "workflow":
            $(this.$refs.WorkFlowModal).modal('show');
            break;
          case "warranty":
            this.loadHistoryData();
            $(this.$refs.WarrantyModal).modal('show');
            break;
          case "ma":
            this.loadHistoryData();
            $(this.$refs.MaModal).modal('show');
            break;
          case "remark":
            //this.loadRemarkData();
            this.reset()
            this.form['subject_code'] = $linq(this.subjectData).select(x => x.subject_code).firstOrDefault() ?? "";
            this.$refs.RemarkModal.openModal()
            break;
          case "view_remark":
            this.form['subject'] = info.subject;
            this.form['remark'] = info.remark;
            this.$refs.ViewRemark.openModal();
            break;
        }
      },
      pageChange(pn, keyword) {
        switch(keyword){
          case "remark":
            pn = pn || 1;
            remark_paging.setCurrentPage(pn);
            this.loadRemarkData();
            break;
          case "license":
            pn = pn || 1;
            this.pageNumber = pn;
            license_paging.setCurrentPage(pn);
            this.$set(this, "displayData", $linq(this.LicenseData).skip(license_paging.skipItems()).take(license_paging.getItemsPerPage()).toArray());
            license_paging.createPagesArray();
            break;
          case "multicompany":
            pn = pn || 1;
            multi_paging.setCurrentPage(pn);
            this.loadCompanyData();
            break;
        }

      },
      checkWarranty() {
        this.formData['cus_active'] = this.warrantyStatus;
        this.formData['cus_ma'] = this.warrantyStatus;

        //if (this.warrantyStatus = "N") {
        //  $msg.alert(`คำเตือน`,
        //    "Customer Code " + e.customer_code + '</br>' +
        //    "Customer Name " + e.customer_name + '</br></br>' +

        //    "ไม่ได้ต่อ MA กับทาง " + this.auth.mainname + '</br>'
        //    , `warning`)
        //}
      },
      copyText(field) {
        var copyText = document.getElementById(field);
        copyText.select();
        document.execCommand("copy");
        var nameMap = { cus_code: 'Passcode', user_pass: 'Password', userid: 'Username', userpass: 'Password', line_token: 'Line Token' };
        var name = nameMap[field] || field;
        $notify.success(`คัดลอก ${name} ไปยังคลิปบอร์ดแล้ว`);
      },
      /*AttachFile*/
      addFile(type) {
        this.formtype = type != null ? type : "";
        $(this.$refs.myFile).click();
      },
      async fileUpload(file) {

        let f = new FormData();
        f.append("file", file);
        try {
          let r = await $xt.postServerForm('Data/CSM_FileUploadToTemp', f);
          if (!r.success) {
            throw r.error;
          }
          /* หากสำเร็จจะทำการ Push Data ลงใน Form */
          this.$set(this.form, `filepath${this.formtype}`, r.id || "");
          this.$set(this.form, `filename${this.formtype}`, r.filename || "");
        }
        catch (ex) {
          $msg.alert('', ex.toString(), 'danger');
        }
      },
      createFilePath(x) {
        return dataServer + "Api/File/DownLoad?id=" + x
      },
      downLoadFile(x, i) {
        i = i || '';
        let path = x['filepath' + i] || '';
        let name = x['filename' + i] || '';

        return dataServer + `API/File/DownLoad?id=${path}&download=true&filename=${name}`;
      },
      getFileExt(f) {
        if (!$xt.isEmpty(f)) {
          return f.split('.').pop().toLowerCase();
        }
      },
      async getCustomerWarranty() {
        let act = `CSM/Data/CustomerWarrantyDate?customer_code=${this.customer_code || ''}&war=Y`;
        let res = await $xt.getServer(act);
        let d = res.data ?? {};
        this.warrantyStatus = (res.status == "Y" && $xt.isEmpty(d.cnno)) ? "Y" : "N";

        //console.log(`Start ${res.start_date} End ${res.end_date} Invno ${res.invno}`);
      },
      async onSaveModule() {
        try {
          let f = {
            data: this.allmodule
          };
          let act = `CSM/Data/CustomerModule_CreateAndUpdate`;

          this.$emit('loading', 'show')
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          $(this.$refs.ConfigModal).modal('hide');
          await this.loadModuleData();
          $msg.alert(``, `Success`, `success`);
          this.reset();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          this.$emit('loading', 'hide')
        }
      },
      isDeveloper() {
        let department = auth.empcode.substring(0, 2);
        return department == 'IT' ||
          [
            'AD001',
            'AD002',
            'AD003',
            'AD004',
            'IMP003',
            'IMP004',
            'IT001',
            'PS007',
            'X0007',
            'AD011',
            'IMP016',
            'EX0001',
            'MG',
          ].includes(auth.empcode) || auth.emppos == 'P013';
      },
      /*Calculate*/
      CalTotal(type) {
        switch (type) {
          case "license":
            let tot_li = ((this.form.license || 0) + (this.form.add_license || 0)) || 0;
            this.$set(this.form, 'tot_license', tot_li);
            break;
          case "company":
            let tot_comp = $xt.int((this.form.add_comp || 0) + (this.form.comp_qty || 0));
            this.$set(this.form, 'tot_comp', tot_comp);
            let tot_db = $xt.int((this.form.add_db || 0) + (this.form.db_qty || 0));
            this.$set(this.form, 'tot_db', tot_db);
            break;
        }
      },
      // Send Data
      sendBack() {
        try {
          this.$emit('send-data',this.formData)
        }catch{
          this.$emit('send-data','Error')
        }
      },
    },

    mounted () {
      remark_paging = this.$refs.remark_paging;
      remark_paging.setCurrentPage(1);
      remark_paging.setItemsPerPage(500);

      license_paging = this.$refs.license_paging;
      license_paging.setCurrentPage(1);
      license_paging.setItemsPerPage(10);

      multi_paging = this.$refs.multi_paging;
      multi_paging.setCurrentPage(1);
      multi_paging.setItemsPerPage(10);

      this.loadModuleData();
      this.loadRemarkData();
      this.loadLicenseData();
      this.loadSubjectData()
      this.loadFormPackage();
      this.pageChange();

      this.isDeveloper();
      this.$nextTick(() => {
        $(this.$refs.myFile).on('change', (e) => {
          this.fileUpload(e.target.files[0]);
        });
      });
    },
  }
</script>

<style scoped>
/* ── Root ── */
.vid-root {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Rows ── */
.vid-row-top,
.vid-row-mid,
.vid-row-bot {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.vid-row-top > .vid-card-customer { flex: 1; min-width: 260px; }
.vid-row-top > .vid-card-status   { flex: 0 0 280px; align-self: stretch; display: flex; flex-direction: column; }
.vid-row-mid > .vid-card          { flex: 1; min-width: 280px; }
.vid-row-bot > .vid-card          { flex: 1; min-width: 260px; }
.vid-card-remark                  { width: 100%; }

/* ── Card ── */
.vid-card {
  background: #fff;
  border: 1px solid #e4e9f2;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,.05);
}
.vid-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: #f7f9fc;
  border-bottom: 1px solid #e4e9f2;
  padding: 11px 18px;
  font-size: 13px;
  font-weight: 700;
  color: #3b5080;
  text-transform: uppercase;
  letter-spacing: .4px;
}
.vid-card-head i { color: #6b8cc9; }
.vid-card-body {
  padding: 16px 20px;
}
.vid-card-body-table {
  padding: 0;
}
.vid-head-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .15s;
}
.vid-head-btn:hover { opacity: .85; }

/* ── Status Toggle Panel ── */
.vid-card-status .vid-card-body { flex: 1; display: flex; flex-direction: column; padding: 16px; }
.vid-status-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}
.vid-status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid #e4e9f2;
  background: #f8fafc;
  cursor: pointer;
  transition: all .2s ease;
  margin: 0;
  flex: 1;
}
.vid-status-item:hover:not(.is-disabled) {
  border-color: #bfdbfe;
  background: #eff6ff;
  box-shadow: 0 2px 8px rgba(59,130,246,.08);
}
.vid-status-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #fff;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  transition: all .2s;
  flex-shrink: 0;
}
.vid-status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.vid-status-title {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  line-height: 1.2;
}
.vid-status-desc {
  font-size: 11px;
  color: #64748b;
  margin-top: 3px;
  line-height: 1.2;
}
.vid-status-cb { display: none; }
.vid-status-item.is-on { background: #ecfdf5; border-color: #6ee7b7; }
.vid-status-item.is-on .vid-status-icon { color: #059669; background: #d1fae5; }
.vid-status-item.is-danger.is-on { background: #fff1f2; border-color: #fca5a5; }
.vid-status-item.is-danger.is-on .vid-status-icon { color: #dc2626; background: #fee2e2; }
.vid-status-item.is-disabled { opacity: 0.6; cursor: not-allowed; background: #f1f5f9; }

/* ── Fields ── */
.vid-field-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
}
.vid-mt-8 { margin-top: 8px; }
.vid-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vid-field label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .4px;
  margin: 0;
}
.vid-input {
  height: 36px;
  border: 1.5px solid #dde3ee;
  border-radius: 7px;
  padding: 0 12px;
  font-size: 14px;
  color: #334155;
  background: #f8fafc;
  outline: none;
  width: 100%;
  transition: border-color .15s;
}
.vid-input:focus {
  border-color: #3b82f6;
  background: #fff;
}
.vid-input-readonly {
  background: #f1f5f9 !important;
  color: #64748b;
  cursor: default;
}
.vid-select {
  height: 36px;
  border: 1.5px solid #dde3ee;
  border-radius: 7px;
  padding: 0 10px;
  font-size: 14px;
  color: #334155;
  background: #f8fafc;
  outline: none;
  width: 100%;
  cursor: pointer;
  transition: border-color .15s;
}
.vid-select:focus { border-color: #3b82f6; background: #fff; }
.vid-select:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }

/* Input + Button combo */
.vid-input-btn {
  display: flex;
  align-items: stretch;
}
.vid-input-btn .vid-input {
  border-radius: 7px 0 0 7px;
  border-right: none;
}
.vid-icon-btn {
  width: 36px;
  height: 36px;
  border: 1.5px solid #dde3ee;
  border-left: none;
  border-radius: 0 7px 7px 0;
  background: #f0f4ff;
  color: #3b5080;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s, color .15s;
  flex-shrink: 0;
}
.vid-icon-btn:hover { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.vid-icon-copy { background: #f0fdf4; color: #16a34a; }
.vid-icon-copy:hover { background: #16a34a; color: #fff; border-color: #16a34a; }

.vid-btn-gen {
  height: 36px;
  padding: 0 14px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity .15s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
}
.vid-btn-gen:hover { opacity: .85; }

/* Checkboxes as pills */
.vid-field-center { justify-content: flex-end; }
.vid-check-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
  height: 36px;
}
.vid-check-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  border: 1.5px solid #dde3ee;
  background: #f4f6fb;
  color: #7a89a8;
  cursor: pointer;
  transition: all .15s;
  user-select: none;
  margin: 0;
}
.vid-check-pill input { display: none; }
.vid-check-pill:hover { border-color: #93c5fd; background: #eff6ff; color: #2563eb; }
.vid-check-pill.active { background: #eff6ff; border-color: #3b82f6; color: #1d4ed8; }

/* ── Date Groups ── */
.vid-date-grid {
  display: flex;
  gap: 0;
  flex-wrap: wrap;
}
.vid-date-group { flex: 1; min-width: 220px; }
.vid-date-divider {
  width: 1px;
  background: #e4e9f2;
  margin: 0 16px;
  align-self: stretch;
}
.vid-date-label {
  font-size: 11px;
  font-weight: 700;
  color: #6b8cc9;
  text-transform: uppercase;
  letter-spacing: .4px;
  margin-bottom: 8px;
}

/* ── Modules ── */
.vid-module-section {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.vid-module-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 10px 0;
}
.vid-module-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
  padding-top: 4px;
  min-width: 80px;
}
.vid-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}
.vid-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .2px;
}
.vid-chip-std {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}
.vid-chip-opt {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.vid-chip-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  border: none;
  font-size: 11px;
  cursor: pointer;
  transition: background .15s;
}
.vid-chip-add:hover { background: #1d4ed8; }
.vid-chip-empty { font-size: 13px; color: #cbd5e1; }

/* ── Section Label (divider within card) ── */
.vid-section-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 700;
  color: #2c4a7a;
  text-transform: uppercase;
  letter-spacing: .5px;
  margin: 14px 0 10px;
  padding-left: 10px;
  border-left: 3px solid #4a90d9;
}
.vid-section-label i { color: #4a90d9; font-size: 12px; }

/* ── Textarea ── */
.vid-textarea {
  border: 1.5px solid #dde3ee;
  border-radius: 7px;
  padding: 8px 12px;
  font-size: 14px;
  color: #334155;
  background: #f8fafc;
  outline: none;
  width: 100%;
  resize: vertical;
  min-height: 72px;
  line-height: 1.6;
  transition: border-color .15s;
  font-family: inherit;
}
.vid-textarea:focus { border-color: #3b82f6; background: #fff; }

/* ── External Credentials Card ── */
.vid-card-extcred { flex: 1; min-width: 260px; }
.vid-extcred-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fefce8;
  color: #92400e;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
}

/* ── Passcode Card ── */

/* ── Table ── */
.vid-table { margin: 0 !important; border: none !important; }
.vid-table thead tr th {
  background: #f7f9fc;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .4px;
  border-bottom: 2px solid #e4e9f2 !important;
  border-top: none !important;
  padding: 11px 14px;
}
.vid-table tbody td {
  font-size: 14px;
  color: #334155;
  padding: 11px 14px;
  vertical-align: middle;
  border-color: #f1f5f9 !important;
}
.vid-table tbody tr:hover { background: #f0f7ff !important; }
.vid-paging {
  padding: 10px 14px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
}

/* ════════════════════════════════
   Modal Styles (vm-*)
════════════════════════════════ */
.vm-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  width: 100%;
}
.vm-header-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.vm-icon-blue   { background: rgba(255,255,255,.18); color: #fff; }
.vm-icon-green  { background: rgba(255,255,255,.18); color: #fff; }
.vm-icon-purple { background: rgba(255,255,255,.18); color: #fff; }
.vm-icon-indigo { background: rgba(255,255,255,.18); color: #fff; }
.vm-icon-teal   { background: rgba(255,255,255,.18); color: #fff; }
.vm-icon-gray   { background: rgba(255,255,255,.18); color: #fff; }
.vm-ml-auto { margin-left: auto; }

/* Body */
.vm-body { padding: 20px 22px; }
.vm-body--modal-scroll { padding: 20px 22px; max-height: 65vh; overflow-y: auto; }
.vm-mt   { margin-top: 16px; }

/* Field */
.vm-field-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: flex-start;
}
.vm-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 140px;
}
.vm-field-grow { flex: 1; }
.vm-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .4px;
  margin: 0;
}
.vm-required { color: #ef4444; }
.vm-hint { font-size: 11px; color: #94a3b8; text-align: right; }

/* Inputs */
.vm-input {
  height: 36px;
  border: 1.5px solid #dde3ee;
  border-radius: 7px;
  padding: 0 11px;
  font-size: 13px;
  color: #334155;
  background: #f8fafc;
  outline: none;
  width: 100%;
  transition: border-color .15s, box-shadow .15s;
  box-sizing: border-box;
}
.vm-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); background: #fff; }
.vm-input:disabled, .vm-input-readonly { background: #f1f5f9 !important; color: #94a3b8; cursor: default; }
.vm-input-active { background: #fff !important; border-color: #3b82f6; }
.vm-input-total  { background: #f0fdf4 !important; color: #15803d; font-weight: 700; }

.vm-select {
  height: 36px;
  border: 1.5px solid #dde3ee;
  border-radius: 7px;
  padding: 0 10px;
  font-size: 13px;
  color: #334155;
  background: #f8fafc;
  outline: none;
  width: 100%;
  cursor: pointer;
}
.vm-select:focus { border-color: #3b82f6; }

.vm-textarea {
  border: 1.5px solid #dde3ee;
  border-radius: 7px;
  padding: 10px 12px;
  font-size: 13px;
  color: #334155;
  background: #f8fafc;
  outline: none;
  width: 100%;
  resize: vertical;
  line-height: 1.6;
  transition: border-color .15s;
}
.vm-textarea:focus { border-color: #3b82f6; background: #fff; }
.vm-textarea-readonly { background: #f1f5f9 !important; color: #64748b; }

/* File */
.vm-file-wrap {
  display: flex;
  gap: 0;
}
.vm-file-wrap .vm-input {
  border-radius: 7px 0 0 7px;
  border-right: none;
  flex: 1;
}
.vm-file-btn {
  height: 36px;
  padding: 0 14px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 0 7px 7px 0;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background .15s;
}
.vm-file-btn:hover { background: #1d4ed8; }
.vm-file-link { font-size: 12px; color: #2563eb; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
.vm-file-link:hover { text-decoration: underline; }

/* Section title inside modal */
.vm-input-section { background: #f8fafc; border: 1px solid #e4e9f2; border-radius: 10px; padding: 14px 16px; }
.vm-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #3b5080;
  text-transform: uppercase;
  letter-spacing: .4px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Summary bar */
.vm-summary-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  background: #f8fafc;
  border: 1px solid #e4e9f2;
  border-radius: 10px;
  padding: 12px 18px;
  margin-bottom: 14px;
}
.vm-summary-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.vm-summary-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
.vm-summary-value { font-size: 20px; font-weight: 700; color: #334155; line-height: 1.1; }
.vm-val-blue   { color: #2563eb; }
.vm-val-green  { color: #059669; }
.vm-val-orange { color: #d97706; }

/* Table */
.vm-table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid #e4e9f2; }
.vm-table-wrap--scroll { max-height: 400px; overflow-y: auto; }
.vm-table-wrap--scroll-lg { max-height: 55vh; overflow-y: auto; }
.vm-table-wrap--scroll thead,
.vm-table-wrap--scroll-lg thead { position: sticky; top: 0; z-index: 2; }
.vm-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 0; }
.vm-table--fixed { table-layout: fixed; }
.vm-table thead tr th {
  background: #f7f9fc;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .4px;
  padding: 10px 12px;
  border-bottom: 2px solid #e4e9f2;
  white-space: nowrap;
}
.vm-table tbody tr td {
  padding: 8px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}
.vm-table tbody tr:last-child td { border-bottom: none; }
.vm-table tbody tr:hover { background: #f8fbff; }
.vm-row-disabled td { opacity: .55; }
.vm-td-meta { font-size: 12px; color: #94a3b8 !important; }
.vm-empty { text-align: center; padding: 24px; color: #94a3b8; font-size: 13px; }
.vm-del-btn { color: #ef4444; font-size: 14px; }
.vm-del-btn:hover { color: #b91c1c; }

/* Module badges */
.vm-module-badge { display: inline-block; padding: 2px 9px; border-radius: 10px; font-size: 12px; font-weight: 700; }
.vm-badge-std { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.vm-badge-opt { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.vm-type-tag { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
.vm-tag-std { background: #eff6ff; color: #3b82f6; }
.vm-tag-opt { background: #fdf4ff; color: #9333ea; }

/* Toggle */
.vm-toggle {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #d1d9e6;
  border-radius: 5px;
  background: #f8fafc;
  cursor: pointer;
  position: relative;
  transition: all .15s;
}
.vm-toggle input { display: none; }
.vm-toggle.vm-toggle-on { background: #3b82f6; border-color: #3b82f6; }
.vm-toggle.vm-toggle-on::after { content: '✓'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700; }
.vm-toggle.vm-toggle-disabled { cursor: not-allowed; opacity: .6; }

/* Add row button */
.vm-btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ecfdf5;
  color: #059669;
  border: 1.5px solid #6ee7b7;
  border-radius: 7px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
  white-space: nowrap;
}
.vm-btn-add:hover { background: #d1fae5; }

/* Footer */
.vm-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 16px;
  gap: 10px;
  border-top: 1px solid #e4e9f2;
  background: #fafbfc;
}
.vm-footer-spread { justify-content: space-between; gap:24px; }
.vm-btn-save {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(16,185,129,.25);
  transition: opacity .15s;
  white-space: nowrap;
}
.vm-btn-save:hover { opacity: .88; }

</style>

<style>
/* ── datepicker (vue2-datepicker) ใน License modal ── */
.vm-table .mx-datepicker { width: 100%; }
.vm-table .mx-input-wrapper { width: 100%; }
.vm-table .mx-input {
  height: 36px !important;
  border: 1.5px solid #dde3ee !important;
  border-radius: 7px !important;
  padding: 0 32px 0 11px !important;
  font-size: 13px !important;
  color: #334155 !important;
  background: #f8fafc !important;
  box-shadow: none !important;
  transition: border-color .15s, box-shadow .15s !important;
}
.vm-table .mx-input:hover { border-color: #b0bcd4 !important; }
.vm-table .mx-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,.1) !important; background: #fff !important; }
.vm-table .mx-input:disabled { background: #f1f5f9 !important; color: #94a3b8 !important; cursor: default !important; }
.vm-table .mx-icon-calendar, .vm-table .mx-icon-clear { color: #94a3b8; font-size: 14px; }
</style>
