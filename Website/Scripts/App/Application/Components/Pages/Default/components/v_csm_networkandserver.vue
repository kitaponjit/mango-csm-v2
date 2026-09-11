<template>
  <div class="ns-root">

    <!-- ===== REMOTE IP SECTION ===== -->
    <div class="ns-card ns-card--green">
      <div class="ns-card__header">
        <div class="ns-card__icon"><i class="fa fa-server"></i></div>
        <div class="ns-card__title-group">
          <h4 class="ns-card__title">Remote IP</h4>
          <span class="ns-card__subtitle">Server connection settings</span>
        </div>
        <span class="ns-badge ns-badge--danger" v-if="formData.service_inactive === 'Y'">
          <i class="fa fa-pause-circle"></i> หยุดการใช้งานชั่วคราว
        </span>
      </div>
      <div class="ns-card__body">
        <div class="ns-grid ns-grid--3">
          <div class="ns-field">
            <label class="ns-field__label">IP Address</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--green"><i class="fa fa-laptop"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.server_ip" :readonly="!isDeveloper()" placeholder="e.g. 192.168.1.1">
            </div>
          </div>
          <div class="ns-field">
            <label class="ns-field__label">Domain</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--green"><i class="glyphicon glyphicon-globe"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.server_domain" :readonly="!isDeveloper()" placeholder="e.g. example.com">
            </div>
          </div>
          <div class="ns-field">
            <label class="ns-field__label">OBS / S3 Bucket</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--green"><i class="fa fa-cloud"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.cloud_bucket" :readonly="!isDeveloper()" placeholder="bucket-name">
            </div>
          </div>
          <div class="ns-field">
            <label class="ns-field__label">Username</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--green"><i class="glyphicon glyphicon-user"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.server_username" :readonly="!isDeveloper()" placeholder="Username" autocomplete="off">
            </div>
          </div>
          <div class="ns-field">
            <label class="ns-field__label">Password</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--green"><i class="fas fa-lock"></i></span>
              <input :type="showServerPassword ? 'text' : 'password'" class="ns-field__input" v-model.trim="formData.server_password" :readonly="!isDeveloper()" placeholder="••••••••" autocomplete="new-password">
              <button type="button" class="ns-field__eye" @click="showServerPassword = !showServerPassword">
                <i class="fas" :class="showServerPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
          </div>
          <div class="ns-field ns-field--valign">
            <div class="ns-toggle">
              <label class="ns-toggle__track">
                <input type="checkbox" true-value="Y" false-value="N" v-model="formData.auto_update">
                <span class="ns-toggle__slider"></span>
              </label>
              <span class="ns-toggle__label" v-tooltip="'Auto Update'">
                Auto Update <i class="fas fa-info-circle text-danger"></i>
              </span>
            </div>
          </div>
        </div>
        <div class="ns-field ns-field--full">
          <label class="ns-field__label">Server Remark</label>
          <textarea class="ns-field__textarea" rows="3" v-model="formData.remark_server" maxlength="1000" :readonly="!isDeveloper()" placeholder="Notes about this server..."></textarea>
        </div>
      </div>
    </div>

    <!-- ===== DATABASE SECTION ===== -->
    <div class="ns-card ns-card--red">
      <div class="ns-card__header">
        <div class="ns-card__icon"><i class="fas fa-database"></i></div>
        <div class="ns-card__title-group">
          <h4 class="ns-card__title">Database</h4>
          <span class="ns-card__subtitle">Backup &amp; database configuration</span>
        </div>
      </div>
      <div class="ns-card__body">
        <div class="ns-grid ns-grid--4">
          <div class="ns-field">
            <label class="ns-field__label">DB Type</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--red"><i class="fas fa-cog"></i></span>
              <select class="ns-field__input ns-field__input--select" v-model.trim="formData['db_type']" @change="isVaild()">
                <option value="" disabled>-- Please select --</option>
                <option value="Q">SQL</option>
                <option value="S">Sybase</option>
              </select>
            </div>
          </div>
          <div class="ns-field">
            <label class="ns-field__label">DB Name</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--red"><i class="fas fa-dice-d6"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.db_name" placeholder="Database name">
            </div>
          </div>
          <div class="ns-field">
            <label class="ns-field__label">Backup IP</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--red"><i class="fa fa-laptop"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.backup_ip" placeholder="e.g. 192.168.1.2">
            </div>
          </div>
          <div class="ns-field">
            <label class="ns-field__label">Backup Port</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--red"><i class="fa fa-plug"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.backup_port" placeholder="e.g. 5432">
            </div>
          </div>
        </div>

        <div class="ns-divider"></div>
        <h5 class="ns-sub-title"><i class="fas fa-clock"></i> Backup Schedule</h5>

        <div class="ns-grid ns-grid--2">
          <div class="ns-field">
            <label class="ns-field__label">Daily Backup Name</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--red"><i class="fa fa-file-text"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.daily_backup_name" placeholder="daily_backup.bak">
            </div>
          </div>
          <div class="ns-field">
            <label class="ns-field__label">Daily Backup Path</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--red"><i class="fas fa-folder-open"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.backup_path" placeholder="/backup/daily/">
            </div>
          </div>
          <div class="ns-field">
            <label class="ns-field__label">Hour Backup Name</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--red"><i class="fa fa-file-text"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.hour_backup_name" placeholder="hour_backup.bak">
            </div>
          </div>
          <div class="ns-field">
            <label class="ns-field__label">Hour Backup Path</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--red"><i class="fas fa-folder-open"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.backup_path2" placeholder="/backup/hourly/">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== VPN SECTION ===== -->
    <div class="ns-card ns-card--blue">
      <div class="ns-card__header">
        <div class="ns-card__icon"><i class="fas fa-shield-alt"></i></div>
        <div class="ns-card__title-group">
          <h4 class="ns-card__title">VPN</h4>
          <span class="ns-card__subtitle">Virtual private network settings</span>
        </div>
      </div>
      <div class="ns-card__body">
        <div class="ns-grid ns-grid--2">
          <div class="ns-field">
            <label class="ns-field__label">VPN IP</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--blue"><i class="fa fa-laptop"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.server_ip_vpn" placeholder="e.g. 10.0.0.1">
            </div>
          </div>
          <div class="ns-field">
            <label class="ns-field__label">VPN Port</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--blue"><i class="fa fa-wifi"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.server_domain_vpn" placeholder="e.g. 1194">
            </div>
          </div>
          <div class="ns-field">
            <label class="ns-field__label">VPN Username</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--blue"><i class="glyphicon glyphicon-user"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.server_username_vpn" placeholder="VPN username" autocomplete="off">
            </div>
          </div>
          <div class="ns-field">
            <label class="ns-field__label">VPN Password</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--blue"><i class="fas fa-unlock-alt"></i></span>
              <input :type="showVpnPassword ? 'text' : 'password'" class="ns-field__input" v-model.trim="formData.server_password_vpn" placeholder="••••••••" autocomplete="new-password">
              <button type="button" class="ns-field__eye" @click="showVpnPassword = !showVpnPassword">
                <i class="fas" :class="showVpnPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
          </div>
          <div class="ns-field ns-field--full">
            <label class="ns-field__label">VPN Remark</label>
            <div class="ns-field__input-group">
              <span class="ns-field__addon ns-field__addon--blue"><i class="fa fa-file-text"></i></span>
              <input type="text" class="ns-field__input" v-model.trim="formData.remark_vpn" placeholder="Notes about VPN...">
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    props: {
      customer_code: { type: String, default: "" },
      pre_event:     { type: String, default: "" },
      old_password:  { type: String, default: "" },
      formData:      { type: Object, default: () => ({}) },
    },
    data() {
      return {
        ui: window.ui,
        showServerPassword: false,
        showVpnPassword: false
      };
    },
    methods: {
      isDeveloper() {
        const dept = auth.empcode.substring(0, 2);
        return dept === 'IT' ||
          ['AD001','AD002','AD003','AD004','IMP003','IMP004','IT001',
           'PS007','X0007','AD011','IMP016','EX0001','MG'].includes(auth.empcode) ||
          auth.emppos === 'P013';
      },
    },
  };
</script>

<style scoped>
/* ══════════════════════════════════════
   Root
══════════════════════════════════════ */
.ns-root {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 0;
}

/* ══════════════════════════════════════
   Card
══════════════════════════════════════ */
.ns-card {
  background: #fff;
  border: 1px solid #e4e9f2;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, .04);
}
.ns-card--green { border-top: 3px solid #10b981; }
.ns-card--red   { border-top: 3px solid #ef4444; }
.ns-card--blue  { border-top: 3px solid #3b82f6; }

/* ── Card Header ── */
.ns-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e4e9f2;
}
.ns-card__icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #fff;
  flex-shrink: 0;
}
.ns-card--green .ns-card__icon { background: linear-gradient(135deg, #10b981, #059669); }
.ns-card--red .ns-card__icon   { background: linear-gradient(135deg, #ef4444, #dc2626); }
.ns-card--blue .ns-card__icon  { background: linear-gradient(135deg, #3b82f6, #2563eb); }

.ns-card__title-group { flex: 1; min-width: 0; }
.ns-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
}
.ns-card__subtitle {
  font-size: 12px;
  color: #94a3b8;
  letter-spacing: .2px;
}

/* ── Card Body ── */
.ns-card__body {
  padding: 22px 24px;
}

/* ══════════════════════════════════════
   Grid Layouts
══════════════════════════════════════ */
.ns-grid {
  display: grid;
  gap: 16px 20px;
}
.ns-grid--2 { grid-template-columns: repeat(2, 1fr); }
.ns-grid--3 { grid-template-columns: repeat(3, 1fr); }
.ns-grid--4 { grid-template-columns: repeat(4, 1fr); }

/* ══════════════════════════════════════
   Field
══════════════════════════════════════ */
.ns-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ns-field--full {
  grid-column: 1 / -1;
  margin-top: 6px;
}
.ns-field--valign {
  justify-content: center;
  padding-top: 20px;
}

.ns-field__label {
  font-size: 11.5px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .4px;
  margin: 0;
}

/* ── Input Group ── */
.ns-field__input-group {
  display: flex;
  align-items: stretch;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: border-color .2s, box-shadow .2s;
}
.ns-field__input-group:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .08);
}

.ns-field__addon {
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  flex-shrink: 0;
}
.ns-field__addon--green { background: #10b981; }
.ns-field__addon--red   { background: #ef4444; }
.ns-field__addon--blue  { background: #3b82f6; }

.ns-field__input {
  flex: 1;
  border: none;
  outline: none;
  padding: 9px 12px;
  font-size: 13px;
  color: #1e293b;
  background: transparent;
  min-width: 0;
}
.ns-field__input::placeholder { color: #cbd5e1; }
.ns-field__input[readonly] {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}
.ns-field__input--select {
  cursor: pointer;
  appearance: auto;
}

/* ── Eye toggle ── */
.ns-field__eye {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: color .15s;
}
.ns-field__eye:hover { color: #475569; }

/* ── Textarea ── */
.ns-field__textarea {
  width: 100%;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: #1e293b;
  background: #fff;
  resize: vertical;
  outline: none;
  line-height: 1.6;
  transition: border-color .2s, box-shadow .2s;
}
.ns-field__textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .08);
}
.ns-field__textarea[readonly] {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

/* ══════════════════════════════════════
   Toggle Switch
══════════════════════════════════════ */
.ns-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ns-toggle__track {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 22px;
  margin: 0;
  cursor: pointer;
}
.ns-toggle__track input { opacity: 0; width: 0; height: 0; position: absolute; }
.ns-toggle__slider {
  position: absolute;
  inset: 0;
  background: #cbd5e1;
  border-radius: 22px;
  transition: background .2s;
}
.ns-toggle__slider::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,.15);
  transition: transform .2s;
}
.ns-toggle__track input:checked + .ns-toggle__slider { background: #10b981; }
.ns-toggle__track input:checked + .ns-toggle__slider::before { transform: translateX(20px); }
.ns-toggle__label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

/* ══════════════════════════════════════
   Badge
══════════════════════════════════════ */
.ns-badge {
  margin-left: auto;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}
.ns-badge--danger {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* ══════════════════════════════════════
   Divider & Sub-title
══════════════════════════════════════ */
.ns-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 18px 0 14px;
}
.ns-sub-title {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .4px;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ns-sub-title i { color: #94a3b8; }

/* ══════════════════════════════════════
   Responsive
══════════════════════════════════════ */
@media (max-width: 1024px) {
  .ns-grid--4 { grid-template-columns: repeat(2, 1fr); }
  .ns-grid--3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .ns-grid--4,
  .ns-grid--3,
  .ns-grid--2 { grid-template-columns: 1fr; }
  .ns-card__body { padding: 16px; }
  .ns-card__header { padding: 14px 16px; }
}
</style>
