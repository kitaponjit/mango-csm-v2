<template>
  <div>
    <re-page ref="page">
      <template slot="body">

        <div class="mdl-sticky-header">
        <div class="mdl-page-header">
          <div>
            <div class="mdl-page-title">ตั้งค่าโมดูลระบบ</div>
            <div class="mdl-page-subtitle">จัดการการเปิด/ปิดการใช้งานโมดูลต่างๆ</div>
          </div>
          <div class="mdl-page-actions">
            <button class="btn btn-sm btn-default" @click="setDefault()">
              <i class="fas fa-undo"></i> Set Default
            </button>
            <button class="btn btn-sm btn-info" @click="addDetail()">
              <i class="fas fa-plus"></i> Add Detail
            </button>
            <button class="btn btn-sm btn-success" @click="saveModules()">
              <i class="fas fa-save"></i> Save Document
            </button>
          </div>
        </div>

        <div class="mdl-summary-bar">
          <div class="mdl-summary-item">
            <span class="mdl-summary-count">{{ retrieveData.length }}</span>
            <span class="mdl-summary-label">โมดูลทั้งหมด</span>
          </div>
          <div class="mdl-summary-item mdl-summary-item--active">
            <span class="mdl-summary-count text-success">{{ activeCount }}</span>
            <span class="mdl-summary-label text-success">เปิดใช้งาน</span>
          </div>
          <div class="mdl-summary-item mdl-summary-item--last">
            <span class="mdl-summary-count text-danger">{{ inactiveCount }}</span>
            <span class="mdl-summary-label text-danger">ปิดใช้งาน</span>
          </div>
        </div>
        </div>

        <div class="row" style="margin-left:-5px;margin-right:-5px;margin-top:12px">
          <div
            class="col-md-2 col-sm-4 col-xs-6"
            style="padding:5px"
            v-for="(x, idx) in retrieveData"
            :key="idx"
          >
            <div class="mdl-card">
              <div class="mdl-card-header">
                <span class="mdl-card-num">{{ idx + 1 }}</span>
                <span class="mdl-card-status" :class="x.active === 'Y' ? 'mdl-card-status--on' : 'mdl-card-status--off'">
                  <i class="fas fa-circle" style="font-size:7px;margin-right:2px"></i>{{ x.active === 'Y' ? 'Active' : 'Inactive' }}
                </span>
                <span style="flex:1"></span>
                <a href="#" @click.prevent="removeItem(idx)" class="mdl-card-del">
                  <i class="fas fa-trash-alt"></i>
                </a>
              </div>

              <div class="mdl-card-body">
                <div class="mdl-field-label">MODULE CODE</div>
                <input
                  type="text"
                  class="mdl-field-input"
                  v-model="x.module_code"
                  @input="x.module_code = (x.module_code || '').toUpperCase()"
                />
                <div class="mdl-field-label" style="margin-top:5px">MODULE NAME</div>
                <input type="text" class="mdl-field-input" v-model="x.module_name" />
              </div>

              <div class="mdl-card-toggle">
                <span class="mdl-toggle-label">ปิด</span>
                <label class="app-toggle-switch" style="margin:0">
                  <input type="checkbox" v-model="x.active" true-value="Y" false-value="N" />
                  <span class="app-toggle-slider"></span>
                </label>
                <span class="mdl-toggle-label">เปิด</span>
              </div>

              <div class="mdl-card-footer">
                <i class="fas fa-user"></i> {{ x.adduser || '-' }}
                <span class="mdl-footer-date">{{ x.add_dt | date('DD/MM/YY HH:mm') }}</span>
              </div>
            </div>
          </div>
        </div>

      </template>
    </re-page>
  </div>
</template>

<script type="text/javascript">
  let page = {}
  let cpn = {
    data() {
      return {
        auth,
        ui: window.ui,
        baseUrl,
        xt: $xt,
        retrieveData: [],
      }
    },
    computed: {
      activeCount() {
        return this.retrieveData.filter(x => x.active === 'Y').length
      },
      inactiveCount() {
        return this.retrieveData.filter(x => x.active !== 'Y').length
      },
    },
    methods: {
      async readModules() {
        let rsp = await $xt.getServer('Anywhere/Management/ModuleConfigReadList')
        this.retrieveData = rsp.data || []
      },
    
      async saveModules() {
        try {
          let f = { data: this.retrieveData }
          let rsp = await $xt.postServerJson('Anywhere/Management/CreateSetModule', f)
          if (!rsp.success) throw rsp.error
          $msg.alert('', 'บันทึกข้อมูลสำเร็จ', 'success')
          await this.readModules()
        } catch (ex) {
          $msg.alert('', ex.toString(), 'danger')
        }
      },
      async setDefault() {
        try {
          let rsp = await $xt.postServerJson('Anywhere/Management/DefaultModule', {})
          if (!rsp.success) throw rsp.error
          await this.readModules()
        } catch (ex) {
          $msg.alert('', ex.toString(), 'danger')
        }
      },
      addDetail() {
        this.retrieveData.push({
          module_code: '',
          module_name: '',
          menu_name: '',
          active: 'Y',
          adduser: auth.userid,
          edituser: auth.userid,
          add_dt: null,
          edit_dt: null,
        })
      },
      async removeItem(idx) {
        const x = this.retrieveData[idx]
        const hasData = !$xt.isEmpty(x.module_code) || !$xt.isEmpty(x.module_name)

        if (x.active === 'Y') {
          $msg.alert('', `ไม่สามารถลบได้ เนื่องจากโมดูล <b>${x.module_code || ''}</b> ยังเปิดใช้งานอยู่`, 'warning')
          return
        }

        if (hasData) {
          if (!await $msg.confirm(`ต้องการลบข้อมูล <b>${x.module_code || ''}</b> ${x.module_name || ''} ใช่หรือไม่`)) return
        }

        this.retrieveData.splice(idx, 1)
      },
    },
    mounted() {
      page = this.$refs.page
      page.pageTitle = 'ตั้งค่าโมดูลระบบ'
      document.title = page.pageTitle
      this.readModules()
    },
  }
  export default cpn
</script>

<style scoped>
.mdl-sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
}
.mdl-page-header {
  background: #2c3e50;
  border-radius: 6px 6px 0 0;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mdl-page-title {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
.mdl-page-subtitle {
  color: #95a5a6;
  font-size: 11px;
  margin-top: 1px;
}
.mdl-page-actions {
  display: flex;
  gap: 5px;
}

.mdl-summary-bar {
  display: flex;
  background: #fff;
  border: 1px solid #ddd;
  border-top: none;
  margin-bottom: 0;
}
.mdl-summary-item {
  flex: 1;
  text-align: center;
  padding: 7px 10px;
  border-right: 1px solid #ddd;
}
.mdl-summary-item--last {
  border-right: none;
}
.mdl-summary-count {
  font-size: 18px;
  font-weight: 700;
  margin-right: 5px;
}
.mdl-summary-label {
  font-size: 12px;
  color: #555;
}

.mdl-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  overflow: hidden;
}
.mdl-card-header {
  display: flex;
  align-items: center;
  padding: 5px 8px;
  border-bottom: 1px solid #f0f0f0;
}
.mdl-card-num {
  font-size: 11px;
  font-weight: 600;
  color: #7f8c8d;
  margin-right: 6px;
}
.mdl-card-status {
  font-size: 10px;
  font-weight: 500;
  padding: 1px 5px;
  border-radius: 8px;
}
.mdl-card-status--on {
  background: #e8f8f0;
  color: #27ae60;
}
.mdl-card-status--off {
  background: #fdf0f0;
  color: #e74c3c;
}
.mdl-card-del {
  color: #bdc3c7;
  font-size: 11px;
}
.mdl-card-del:hover {
  color: #e74c3c;
}

.mdl-card-body {
  padding: 6px 8px 5px;
}
.mdl-field-label {
  font-size: 9px;
  font-weight: 600;
  color: #95a5a6;
  letter-spacing: 0.4px;
  margin-bottom: 2px;
}
.mdl-field-input {
  width: 100%;
  border: none;
  background: #f5f7fa;
  border-radius: 3px;
  padding: 3px 6px;
  font-size: 12px;
  color: #2c3e50;
  outline: none;
}
.mdl-field-input:focus {
  background: #eaf3fb;
}

.mdl-card-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-top: 1px solid #f5f5f5;
}
.mdl-toggle-label {
  font-size: 11px;
  color: #7f8c8d;
}

.app-toggle-switch {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 17px;
  flex-shrink: 0;
}
.app-toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}
.app-toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #ccc;
  border-radius: 17px;
  transition: background .25s;
}
.app-toggle-slider:before {
  content: '';
  position: absolute;
  width: 11px;
  height: 11px;
  left: 3px;
  top: 3px;
  background: #fff;
  border-radius: 50%;
  transition: transform .25s;
}
.app-toggle-switch input:checked + .app-toggle-slider {
  background: #27ae60;
}
.app-toggle-switch input:checked + .app-toggle-slider:before {
  transform: translateX(15px);
}

.mdl-card-footer {
  padding: 4px 8px;
  border-top: 1px solid #f0f0f0;
  font-size: 10px;
  color: #95a5a6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mdl-card-footer i {
  margin-right: 3px;
}
.mdl-footer-date {
  color: #bdc3c7;
  margin-left: 3px;
}
</style>
