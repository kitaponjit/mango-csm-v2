<template>
  <div class="app-container">

    <!-- Header Bar -->
    <div class="app-header-bar">
      <div class="app-header-left">
        <div class="app-header-emblem">
          <i class="fas fa-cubes"></i>
        </div>
        <div class="app-header-text">
          <h4 class="app-title">Application Registry</h4>
          <span class="app-subtitle">— Production & Demo Path Management —</span>
        </div>
        <span class="app-badge-danger" v-if="formDatax && formDatax.service_inactive === 'Y'">
          <i class="fa fa-pause-circle"></i> หยุดการใช้งานชั่วคราว
        </span>
      </div>
      <div class="app-header-right">
        <div class="app-search">
          <i class="fas fa-search app-search-icon"></i>
          <input type="text" class="app-search-input" placeholder="ค้นหา Application..." />
        </div>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="app-grid">

      <!-- Master Card (itemno 99999) -->
      <div class="app-card app-card-master">
        <div class="app-card-corner app-card-corner-tl"></div>
        <div class="app-card-corner app-card-corner-tr"></div>
        <div class="app-card-corner app-card-corner-bl"></div>
        <div class="app-card-corner app-card-corner-br"></div>

        <div class="app-card-header">
          <div class="app-card-seal">
            <i class="fas fa-star"></i>
          </div>
          <div class="app-card-meta">
            <div class="app-card-no">
              <span class="app-card-no-prefix">Reg. No.</span>
              <strong>99999</strong>
            </div>
            <span class="app-card-type-label">✦ Multi App ✦</span>
          </div>
          <div class="app-card-stamp">MASTER</div>
        </div>

        <div class="app-card-body">
          <!-- Production Path -->
          <div class="app-field-group">
            <div class="app-field-header">
              <span class="app-field-icon prod"><i class="fas fa-rocket"></i></span>
              <label class="app-label">Production Path</label>
            </div>
            <div class="app-input-row">
              <div class="app-input-wrap">
                <input type="text" class="app-input" v-model="formData.app_path_prod" placeholder="https://..." />
              </div>
              <button class="app-btn" :disabled="!formData.app_path_prod" @click="openNewTap(formData.app_path_prod)" title="Open">
                <i class="fa fa-external-link-alt"></i>
              </button>
              <button class="app-btn" v-if="controlPanelRight" :disabled="!formData.app_path_prod"
                @click.prevent="$refs.CustomerConfig.openModal({ source: 'production', formData: formData })" title="Config">
                <i class="fa fa-gear"></i>
              </button>
            </div>
          </div>

          <!-- Gateway Token Prod -->
          <div class="app-token-group" v-if="controlPanelRight">
            <label class="app-label app-label-sm"><i class="fas fa-key"></i> Gateway Token (Production)</label>
            <div class="app-input-row">
              <div class="app-input-wrap app-input-wrap-mono">
                <input type="text" class="app-input app-input-mono" disabled v-model="formData.gateway_token_prod" placeholder="— not generated —" />
              </div>
              <button class="app-btn app-btn-action" :disabled="!formData.app_path_prod" @click="generateGatewayToken('prod')">
                <i class="fas fa-sync-alt"></i> Generate
              </button>
              <button class="app-btn" :disabled="!formData.gateway_token_prod" @click="copyToClipboard(formData.gateway_token_prod)" title="Copy">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>

          <div class="app-ornament-divider">
            <span class="app-ornament">❧</span>
          </div>

          <!-- Demo Path -->
          <div class="app-field-group">
            <div class="app-field-header">
              <span class="app-field-icon demo"><i class="fas fa-flask"></i></span>
              <label class="app-label">Demo Path</label>
            </div>
            <div class="app-input-row">
              <div class="app-input-wrap">
                <input type="text" class="app-input" v-model="formData.app_path_demo" placeholder="https://..." />
              </div>
              <button class="app-btn" :disabled="!formData.app_path_demo" @click="openNewTap(formData.app_path_demo)" title="Open">
                <i class="fa fa-external-link-alt"></i>
              </button>
              <button class="app-btn" v-if="controlPanelRight" :disabled="!formData.app_path_demo"
                @click.prevent="$refs.CustomerConfig.openModal({ source: 'demo', formData: formData })" title="Config">
                <i class="fa fa-gear"></i>
              </button>
            </div>
          </div>

          <!-- Gateway Token Demo -->
          <div class="app-token-group" v-if="controlPanelRight">
            <label class="app-label app-label-sm"><i class="fas fa-key"></i> Gateway Token (Demo)</label>
            <div class="app-input-row">
              <div class="app-input-wrap app-input-wrap-mono">
                <input type="text" class="app-input app-input-mono" disabled v-model="formData.gateway_token_demo" placeholder="— not generated —" />
              </div>
              <button class="app-btn app-btn-action" :disabled="!formData.app_path_demo" @click="generateGatewayToken('demo')">
                <i class="fas fa-sync-alt"></i> Generate
              </button>
              <button class="app-btn" :disabled="!formData.gateway_token_demo" @click="copyToClipboard(formData.gateway_token_demo)" title="Copy">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>

          <div class="app-ornament-divider">
            <span class="app-ornament">❧</span>
          </div>

          <!-- Domains Section -->
          <div class="app-domains-section">
            <div class="app-domains-header">
              <i class="fas fa-globe-americas"></i>
              <span>Backup Domains</span>
              <span class="app-domains-badge">{{ domainCount(formData) }} / 6</span>
            </div>
            <div class="app-domain-grid">
              <div class="app-domain-item" v-for="n in 6" :key="'master-domain-' + n">
                <span class="app-domain-tag" :class="'dt-' + n">{{ n }}</span>
                <div class="app-input-wrap app-input-wrap-domain">
                  <input type="text" class="app-input" v-model="formData['app_path_domain' + n]" :placeholder="'Domain ' + n" />
                </div>
                <button class="app-btn app-btn-sm" :disabled="!formData['app_path_domain' + n]" @click="openNewTap(formData['app_path_domain' + n])" title="Open">
                  <i class="fa fa-external-link-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="app-card-footer">
          <span class="app-card-footer-text">✦ Est. Registry ✦</span>
        </div>
      </div>

      <!-- Dynamic App Cards -->
      <div class="app-card" :class="cardColorClass(idx)" v-for="(x, idx) in showAppList()" :key="idx">
        <div class="app-card-corner app-card-corner-tl"></div>
        <div class="app-card-corner app-card-corner-tr"></div>
        <div class="app-card-corner app-card-corner-bl"></div>
        <div class="app-card-corner app-card-corner-br"></div>

        <div class="app-card-header">
          <div class="app-card-seal" :class="badgeColorClass(idx)">
            <i class="fas fa-cube"></i>
          </div>
          <div class="app-card-meta">
            <div class="app-card-no">
              <span class="app-card-no-prefix">Reg. No.</span>
              <strong>{{ x.itemno }}</strong>
            </div>
            <select class="app-type-select" v-model.trim="x.app_type">
              <option value="">-- App Type --</option>
              <option v-for="t in appTypeData" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <button class="app-delete-btn" @click="removeAppList(x)" title="Remove">
            <i class="fa fa-trash"></i>
          </button>
        </div>

        <div class="app-card-body">
          <!-- Production Path -->
          <div class="app-field-group">
            <div class="app-field-header">
              <span class="app-field-icon prod"><i class="fas fa-rocket"></i></span>
              <label class="app-label">Production Path</label>
            </div>
            <div class="app-input-row">
              <div class="app-input-wrap">
                <input type="text" class="app-input" v-model="x.app_path_prod" placeholder="https://..." />
              </div>
              <button class="app-btn" :disabled="!x.app_path_prod" @click="openNewTap(x.app_path_prod)" title="Open">
                <i class="fa fa-external-link-alt"></i>
              </button>
            </div>
          </div>

          <div class="app-ornament-divider">
            <span class="app-ornament">❧</span>
          </div>

          <!-- Demo Path -->
          <div class="app-field-group">
            <div class="app-field-header">
              <span class="app-field-icon demo"><i class="fas fa-flask"></i></span>
              <label class="app-label">Demo Path</label>
            </div>
            <div class="app-input-row">
              <div class="app-input-wrap">
                <input type="text" class="app-input" v-model="x.app_path_demo" placeholder="https://..." />
              </div>
              <button class="app-btn" :disabled="!x.app_path_demo" @click="openNewTap(x.app_path_demo)" title="Open">
                <i class="fa fa-external-link-alt"></i>
              </button>
            </div>
          </div>

          <div class="app-ornament-divider">
            <span class="app-ornament">❧</span>
          </div>

          <!-- Domains Section -->
          <div class="app-domains-section">
            <div class="app-domains-header">
              <i class="fas fa-globe-americas"></i>
              <span>Backup Domains</span>
              <span class="app-domains-badge">{{ domainCount(x) }} / 6</span>
            </div>
            <div class="app-domain-grid">
              <div class="app-domain-item" v-for="n in 6" :key="'sub-domain-' + idx + '-' + n">
                <span class="app-domain-tag" :class="'dt-' + n">{{ n }}</span>
                <div class="app-input-wrap app-input-wrap-domain">
                  <input type="text" class="app-input" v-model="x['app_path_domain' + n]" :placeholder="'Domain ' + n" />
                </div>
                <button class="app-btn app-btn-sm" :disabled="!x['app_path_domain' + n]" @click="openNewTap(x['app_path_domain' + n])" title="Open">
                  <i class="fa fa-external-link-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="app-card-footer">
          <span class="app-card-footer-text">✦ Sub Registry ✦</span>
        </div>
      </div>

    </div>

    <vue-customer-config ref="CustomerConfig"></vue-customer-config>
  </div>
</template>

<script>
export default {
  props: {
    appTypeData:  { type: Array,  default: () => [] },
    appListData:  { type: Array,  default: () => [] },
    formDatax:    { type: Object, default: () => ({}) },
  },
  data() {
    return {
      formData: {},
      controlPanelRight: false,
    };
  },
  methods: {
    openNewTap(url) { window.open(url); },
    generateGatewayToken(token) {
      if (token === 'prod') this.$set(this.formData, 'gateway_token_prod', $xt.generateRandomString(100));
      else if (token === 'demo') this.$set(this.formData, 'gateway_token_demo', $xt.generateRandomString(100));
    },
    domainCount(obj) {
      let count = 0;
      for (let i = 1; i <= 6; i++) {
        if (obj['app_path_domain' + i]) count++;
      }
      return count;
    },
    getAppList() {
      let array = [{
        itemno: 99999,
        app_type: "",
        app_path_prod: this.formData.app_path_prod,
        app_path_domain1: this.formData.app_path_domain1,
        app_path_domain2: this.formData.app_path_domain2,
        app_path_domain3: this.formData.app_path_domain3,
        app_path_domain4: this.formData.app_path_domain4,
        app_path_domain5: this.formData.app_path_domain5,
        app_path_domain6: this.formData.app_path_domain6,
        app_path_demo: this.formData.app_path_demo,
        gateway_token_prod: this.formData.gateway_token_prod,
        gateway_token_demo: this.formData.gateway_token_demo,
      }];
      this.appListData.forEach(x => array.push(x));
      return $linq(array).toArray();
    },
    addAppList() {
      let q = $linq(this.appListData).orderBy(x => x.itemno);
      let max = q.count() === 0 ? 0 : q.max(x => x.itemno);
      this.appListData.push({
        itemno: max + 1,
        app_type: "", app_path_prod: "", app_path_demo: "",
        sitecode: "", db_name_show: "", db_name: "", db_expire_date: "",
      });
    },
    showAppList() {
      return $linq(this.appListData).toArray();
    },
    async removeAppList(x) {
      if (!await $msg.confirm(`คุณกำลังจะลบ Path App นี้ โปรดยืนยัน`)) return;
      this.appListData.splice(this.appListData.indexOf(x), 1);
    },
    copyToClipboard(value) {
      if ($xt.isEmpty(value)) { $notify.warning('ไม่พบ Token'); return; }
      navigator.clipboard.writeText(value);
      $notify.success('คัดลอก Token สำเร็จ');
    },
    cardColorClass(idx) {
      const colors = ['app-card-wine', 'app-card-navy', 'app-card-forest', 'app-card-rust', 'app-card-plum'];
      return colors[idx % colors.length];
    },
    badgeColorClass(idx) {
      const colors = ['seal-wine', 'seal-navy', 'seal-forest', 'seal-rust', 'seal-plum'];
      return colors[idx % colors.length];
    },
  },
  mounted() {
    this.controlPanelRight = $linq(window.userRight).any(
      x => x.module === 'CSM' && x.menu_name === 'CSM_WEB' && x.menu_id === '60000'
    );
    if (this.formDatax) this.formData = { ...this.formDatax };
  },
  watch: {
    formDatax: {
      handler(v) { if (v) this.formData = { ...v }; },
      immediate: true, deep: true,
    },
    formData: {
      handler(v) { this.$emit('update:formDatax', { ...v }); },
      deep: true,
    },
  },
};
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════════
   APPLICATION REGISTRY — Vintage / Art Deco UI
   Inspired by old certificates, stamps, and classic typography
   ══════════════════════════════════════════════════════════════ */

/* ── Container ── */
.app-container {
  padding: 16px;
  width: 100%;
  background: #faf6f0;
  background-image:
    radial-gradient(ellipse at top left, rgba(139, 90, 43, .03) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(89, 60, 30, .04) 0%, transparent 50%);
  border-radius: 4px;
  min-height: 100%;
}

/* ── Header Bar ── */
.app-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 28px;
  padding: 20px 28px;
  background: linear-gradient(135deg, #fffdf8, #f7f0e5);
  border: 2px solid #d4a853;
  border-radius: 4px;
  box-shadow:
    inset 0 0 0 1px rgba(212, 168, 83, .2),
    0 4px 16px rgba(139, 90, 43, .08);
  position: relative;
}
.app-header-bar::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid rgba(212, 168, 83, .25);
  border-radius: 2px;
  pointer-events: none;
}
.app-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.app-header-emblem {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(145deg, #d4a853, #b8860b);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  box-shadow:
    0 2px 8px rgba(184, 134, 11, .3),
    inset 0 1px 2px rgba(255, 255, 255, .3);
  border: 2px solid #c9952e;
}
.app-header-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #3d2b1f;
  letter-spacing: .5px;
  font-variant: small-caps;
}
.app-subtitle {
  font-size: 11px;
  color: #8b6f47;
  font-style: italic;
  letter-spacing: 1px;
}
.app-badge-danger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fdf2f2;
  color: #9b2c2c;
  border: 1.5px solid #c53030;
  border-radius: 3px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  font-variant: small-caps;
}

/* ── Search ── */
.app-header-right { display: flex; align-items: center; }
.app-search { position: relative; display: flex; align-items: center; }
.app-search-icon {
  position: absolute;
  left: 12px;
  color: #b8860b;
  font-size: 12px;
}
.app-search-input {
  padding: 9px 14px 9px 34px;
  border: 1.5px solid #d4a853;
  border-radius: 3px;
  font-size: 13px;
  outline: none;
  width: 230px;
  background: #fffef9;
  color: #3d2b1f;
  font-style: italic;
  transition: all .25s;
}
.app-search-input::placeholder { color: #c9a96e; font-style: italic; }
.app-search-input:focus {
  border-color: #b8860b;
  box-shadow: 0 0 0 3px rgba(184, 134, 11, .12);
}

/* ── Grid ── */
.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(540px, 1fr));
  gap: 28px;
}

/* ── Card ── */
.app-card {
  position: relative;
  background: #fffdf8;
  border: 2px solid #c9a96e;
  border-radius: 4px;
  overflow: visible;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 3px 12px rgba(139, 90, 43, .08),
    inset 0 0 0 1px rgba(212, 168, 83, .15);
  transition: all .3s ease;
}
.app-card:hover {
  box-shadow:
    0 8px 30px rgba(139, 90, 43, .12),
    inset 0 0 0 1px rgba(212, 168, 83, .25);
  transform: translateY(-2px);
}
.app-card-master {
  border-color: #b8860b;
  border-width: 2.5px;
  box-shadow:
    0 4px 20px rgba(184, 134, 11, .12),
    inset 0 0 0 1px rgba(184, 134, 11, .2);
}

/* Corner ornaments */
.app-card-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: #d4a853;
  border-style: solid;
  z-index: 1;
}
.app-card-corner-tl { top: 6px; left: 6px; border-width: 2px 0 0 2px; }
.app-card-corner-tr { top: 6px; right: 6px; border-width: 2px 2px 0 0; }
.app-card-corner-bl { bottom: 6px; left: 6px; border-width: 0 0 2px 2px; }
.app-card-corner-br { bottom: 6px; right: 6px; border-width: 0 2px 2px 0; }

/* Sub card color variants */
.app-card-wine   { border-color: #8b3a3a; }
.app-card-wine .app-card-corner { border-color: #a04040; }
.app-card-navy   { border-color: #2c4a6e; }
.app-card-navy .app-card-corner { border-color: #3a5f8a; }
.app-card-forest { border-color: #2d5a3a; }
.app-card-forest .app-card-corner { border-color: #3a7048; }
.app-card-rust   { border-color: #8b4513; }
.app-card-rust .app-card-corner { border-color: #a0522d; }
.app-card-plum   { border-color: #5b3256; }
.app-card-plum .app-card-corner { border-color: #6d3d66; }

/* ── Card Header ── */
.app-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px 14px;
  border-bottom: 1px solid rgba(201, 169, 110, .3);
  background: linear-gradient(180deg, rgba(212, 168, 83, .06) 0%, transparent 100%);
}
.app-card-seal {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(145deg, #d4a853, #b8860b);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  border: 2.5px solid #a07820;
  box-shadow:
    0 2px 8px rgba(184, 134, 11, .25),
    inset 0 1px 3px rgba(255, 255, 255, .25);
}
/* Seal color variants */
.seal-wine   { background: linear-gradient(145deg, #a04040, #8b3a3a); border-color: #722f2f; }
.seal-navy   { background: linear-gradient(145deg, #3a5f8a, #2c4a6e); border-color: #1e3a55; }
.seal-forest { background: linear-gradient(145deg, #3a7048, #2d5a3a); border-color: #1f4028; }
.seal-rust   { background: linear-gradient(145deg, #a0522d, #8b4513); border-color: #6b340e; }
.seal-plum   { background: linear-gradient(145deg, #6d3d66, #5b3256); border-color: #3f2240; }

.app-card-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;
}
.app-card-no {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
  color: #6b5a3e;
}
.app-card-no-prefix {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #9c8560;
}
.app-card-no strong {
  color: #8b3a3a;
  font-weight: 800;
  font-size: 16px;
  font-family: 'Georgia', serif;
}
.app-card-type-label {
  font-size: 10px;
  font-weight: 700;
  color: #8b6f47;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.app-card-stamp {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #b8860b;
  border: 2px solid #b8860b;
  padding: 4px 12px;
  border-radius: 3px;
  transform: rotate(-3deg);
  opacity: .7;
}
.app-type-select {
  font-size: 12px;
  border: 1.5px solid #c9a96e;
  border-radius: 3px;
  padding: 4px 8px;
  outline: none;
  color: #3d2b1f;
  background: #fffef9;
  max-width: 170px;
  font-style: italic;
}
.app-type-select:focus { border-color: #b8860b; }
.app-delete-btn {
  background: none;
  border: 1.5px solid rgba(139, 58, 58, .3);
  cursor: pointer;
  color: #a04040;
  font-size: 13px;
  padding: 6px 8px;
  border-radius: 3px;
  transition: all .2s;
  margin-left: auto;
  flex-shrink: 0;
  opacity: .5;
}
.app-delete-btn:hover {
  opacity: 1;
  background: #fdf2f2;
  border-color: #c53030;
}

/* ── Card Body ── */
.app-card-body {
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Card Footer ── */
.app-card-footer {
  padding: 10px 24px;
  border-top: 1px solid rgba(201, 169, 110, .25);
  text-align: center;
}
.app-card-footer-text {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #c9a96e;
  font-weight: 600;
}

/* ── Field Group ── */
.app-field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.app-field-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.app-field-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
}
.app-field-icon.prod {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1.5px solid #a5d6a7;
}
.app-field-icon.demo {
  background: #fff3e0;
  color: #e65100;
  border: 1.5px solid #ffcc80;
}

/* ── Token Group ── */
.app-token-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-left: 34px;
  padding: 10px 14px;
  background: rgba(212, 168, 83, .04);
  border: 1px dashed rgba(201, 169, 110, .35);
  border-radius: 3px;
}

/* ── Labels ── */
.app-label {
  font-size: 11px;
  font-weight: 700;
  color: #5a4630;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-variant: small-caps;
}
.app-label-sm {
  font-size: 10px;
  color: #8b6f47;
  text-transform: none;
  letter-spacing: .3px;
  font-weight: 600;
  font-variant: normal;
}
.app-label-sm i {
  color: #b8860b;
  margin-right: 2px;
}

/* ── Input Row ── */
.app-input-row {
  display: flex;
  align-items: stretch;
  gap: 6px;
}
.app-input-wrap {
  flex: 1;
  border: 1.5px solid #c9a96e;
  border-radius: 3px;
  overflow: hidden;
  background: #fffef9;
  transition: all .25s;
  display: flex;
}
.app-input-wrap:focus-within {
  border-color: #b8860b;
  box-shadow: 0 0 0 3px rgba(184, 134, 11, .08);
}
.app-input-wrap-mono {
  background: #faf8f3;
}
.app-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 9px 12px;
  font-size: 12.5px;
  color: #3d2b1f;
  background: transparent;
  min-width: 0;
}
.app-input[disabled] {
  color: #a89070;
  cursor: not-allowed;
}
.app-input::placeholder {
  color: #c9b896;
  font-style: italic;
}
.app-input-mono {
  font-family: 'Courier New', 'Courier', monospace;
  font-size: 11px;
}

/* ── Buttons ── */
.app-btn {
  border: 1.5px solid #c9a96e;
  background: linear-gradient(180deg, #fffdf8, #f7f0e5);
  color: #6b5a3e;
  padding: 0 12px;
  cursor: pointer;
  font-size: 12px;
  border-radius: 3px;
  transition: all .2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.app-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #d4a853, #b8860b);
  color: #fff;
  border-color: #a07820;
  box-shadow: 0 2px 8px rgba(184, 134, 11, .2);
}
.app-btn:disabled {
  opacity: .35;
  cursor: not-allowed;
}
.app-btn-action {
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  padding: 0 14px;
  letter-spacing: .3px;
}
.app-btn-sm {
  padding: 0 8px;
  font-size: 11px;
}

/* ── Ornament Divider ── */
.app-ornament-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
}
.app-ornament {
  color: #d4a853;
  font-size: 16px;
  opacity: .6;
}

/* ── Domains Section ── */
.app-domains-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(212, 168, 83, .03);
  border: 1.5px solid rgba(201, 169, 110, .3);
  border-radius: 4px;
}
.app-domains-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #5a4630;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-variant: small-caps;
}
.app-domains-header i {
  color: #b8860b;
  font-size: 13px;
}
.app-domains-badge {
  margin-left: auto;
  background: linear-gradient(135deg, #d4a853, #b8860b);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 3px;
  letter-spacing: .5px;
}

/* ── Domain Grid ── */
.app-domain-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.app-domain-item {
  display: flex;
  align-items: stretch;
  gap: 0;
}
.app-domain-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  min-width: 28px;
  font-size: 11px;
  font-weight: 900;
  color: #fff;
  border-radius: 3px 0 0 3px;
  font-family: 'Georgia', serif;
}
/* Domain tag color variants — muted vintage palette */
.dt-1 { background: #6b5b73; }
.dt-2 { background: #5b6b73; }
.dt-3 { background: #73695b; }
.dt-4 { background: #5b7365; }
.dt-5 { background: #73605b; }
.dt-6 { background: #5b5b73; }

.app-input-wrap-domain {
  flex: 1;
  border-radius: 0;
  border-left: none;
}
.app-domain-item .app-btn-sm {
  border-radius: 0 3px 3px 0;
  border-left: none;
}
.app-domain-item .app-input {
  padding: 7px 10px;
  font-size: 11.5px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .app-grid { grid-template-columns: 1fr; }
  .app-search-input { width: 170px; }
  .app-domain-grid { grid-template-columns: 1fr; }
  .app-header-bar { padding: 14px 18px; }
  .app-card-body { padding: 16px 18px; }
}
@media (max-width: 1200px) {
  .app-grid { grid-template-columns: repeat(auto-fill, minmax(480px, 1fr)); }
}
</style>
