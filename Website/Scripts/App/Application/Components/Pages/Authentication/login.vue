<template>
  <div class="login-wrapper">
    <!-- Visual panel : Customer Service background -->
    <section class="visual-panel">
      <div class="bg-image" :style="{ backgroundImage: `url('${bgImage}')` }"></div>
      <div class="bg-overlay"></div>
      <div class="bg-grain"></div>

      <div class="visual-content">
        <div class="brand-area">
          <span class="brand-logo">
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="48" fill="url(#csmLogoLight)"/>
              <path d="M68 36a24 24 0 1 0 0 28" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
              <circle cx="72" cy="34" r="6" fill="#F5B301"/>
              <circle cx="72" cy="66" r="6" fill="#E8453C"/>
              <defs>
                <linearGradient id="csmLogoLight" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#126be0ff"/>
                  <stop offset="1" stop-color="#002a9cff"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span class="brand-name">Mango CSM</span>
        </div>

        <div class="visual-copy">
          <!-- <h2 class="visual-headline">ทุกงานบริการ<br /><em>รวมอยู่ที่เดียว</em></h2>
          <p class="visual-sub">ติดตามใบแจ้งงาน สถานะ SLA และงานหน้างาน ได้จากหน้าจอเดียว</p> -->
        </div>

        <div class="visual-footer">
          <div class="visual-tag">
            <span class="visual-tag-rule"></span>
            <span class="visual-eyebrow">Customer Service Management</span>
          </div>
          <ul class="visual-meta">
            <!-- <li>Service Desk</li>
            <li>SLA Tracking</li>
            <li>Field Work</li> -->
          </ul>
        </div>
      </div>
    </section>

    <!-- Form panel -->
    <section class="form-panel" ref="formPanel">
      <div class="form-inner">
        <div class="brand-area brand-area-compact">
          <span class="brand-logo">
            <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="48" fill="url(#csmLogoDark)"/>
              <path d="M68 36a24 24 0 1 0 0 28" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
              <circle cx="72" cy="34" r="6" fill="#F5B301"/>
              <circle cx="72" cy="66" r="6" fill="#E8453C"/>
              <defs>
                <linearGradient id="csmLogoDark" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#126be0"/>
                  <stop offset="1" stop-color="#002a9c"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span class="brand-name">Mango CSM</span>
        </div>

        <header class="form-head">
          <h1 class="login-title">Sign in</h1>
          <p class="login-desc">Use your Mango account to continue.</p>
        </header>

        <div class="form-area">
          <!-- Company -->
          <div class="field" ref="companyField" :class="{ 'is-focused': focused === 'company' || companyOpen }">
            <label class="field-label" for="login-company">Company</label>
            <div class="control-wrap">
              <i class="fas fa-city control-lead"></i>
              <button
                id="login-company"
                ref="companyTrigger"
                type="button"
                class="field-control field-trigger"
                :class="{ 'is-empty': !selectedCompany }"
                :aria-expanded="companyOpen ? 'true' : 'false'"
                @click="toggleCompany"
                @focus="focused = 'company'"
                @blur="focused = null"
                @keydown.down.prevent="openCompany"
              >
                <span class="trigger-code" v-if="selectedCompany" v-text="selectedCompany.maincode"></span>
                <span class="trigger-text" v-text="selectedCompany ? selectedCompany.mainname : '-- Select Company --'"></span>
              </button>
              <i class="fas fa-chevron-down control-caret" :class="{ 'is-open': companyOpen }"></i>

              <div class="opt-panel" v-if="companyOpen" :class="{ 'opt-panel-up': companyUp }" :style="{ maxHeight: companyMax + 'px' }">
                <div class="opt-search">
                  <i class="fas fa-search"></i>
                  <input
                    ref="companySearch"
                    type="text"
                    placeholder="Search code or company name"
                    v-model="companySearch"
                    @keydown.down.prevent="moveCompany(1)"
                    @keydown.up.prevent="moveCompany(-1)"
                    @keydown.enter.prevent="pickActiveCompany"
                    @keydown.esc.prevent="closeCompany(true)"
                    @keydown.tab="closeCompany()"
                  />
                  <span class="opt-count" v-text="filteredCompany.length"></span>
                </div>
                <ul class="opt-list" ref="companyList" role="listbox">
                  <li
                    v-for="(x, i) in filteredCompany"
                    :key="x.maincode"
                    class="opt-row"
                    role="option"
                    :class="{ 'is-active': i === companyActive, 'is-selected': x.maincode === form.maincode }"
                    :aria-selected="x.maincode === form.maincode ? 'true' : 'false'"
                    @click="pickCompany(x)"
                    @mousemove="companyActive = i"
                  >
                    <span class="opt-code" v-text="x.maincode"></span>
                    <span class="opt-name" :title="x.mainname" v-text="x.mainname"></span>
                    <i class="fas fa-check opt-check"></i>
                  </li>
                  <li class="opt-empty" v-if="!filteredCompany.length">
                    <i class="fas fa-inbox"></i>
                    <span>No company found</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Extension -->
          <div class="field" :class="{ 'is-focused': focused === 'extension' }" v-if="false">
            <label class="field-label" for="login-extension">Extension</label>
            <div class="control-wrap">
              <i class="fas fa-headset control-lead"></i>
              <select
                id="login-extension"
                class="field-control is-select"
                v-model="form['extension']"
                @focus="focused = 'extension'"
                @blur="focused = null"
              >
                <option value="">-- Select Extension --</option>
                <option v-for="x in extension" :key="x.extension" :value="x.extension" v-text="x.agent_name"></option>
              </select>
              <i class="fas fa-chevron-down control-caret"></i>
            </div>
          </div>

          <!-- Username -->
          <div class="field" :class="{ 'is-focused': focused === 'username' }">
            <label class="field-label" for="login-username">Username</label>
            <div class="control-wrap">
              <i class="fas fa-user control-lead"></i>
              <input
                id="login-username"
                type="text"
                name="username"
                class="field-control"
                placeholder="Your username"
                v-model="form['userid']"
                @focus="focused = 'username'"
                @blur="focused = null"
                @keyup.enter="submit"
                autocomplete="username"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="field" :class="{ 'is-focused': focused === 'password' }">
            <label class="field-label" for="login-password">Password</label>
            <div class="control-wrap">
              <i class="fas fa-lock control-lead"></i>
              <input
                id="login-password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                class="field-control has-action"
                placeholder="••••••••"
                v-model="form['userpass']"
                @focus="focused = 'password'"
                @blur="focused = null"
                @keyup.enter="submit"
                autocomplete="current-password"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword" tabindex="-1">
                <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button type="button" class="btn-login" @click="submit" :disabled="isLoading">
            <span class="btn-spinner" v-if="isLoading"></span>
            <span>{{ isLoading ? 'Signing in...' : 'Sign in' }}</span>
            <i class="fas fa-arrow-right btn-arrow" v-if="!isLoading"></i>
          </button>
        </div>

        <footer class="form-footer">
          <span class="footer-text">&copy; 2026 Mango Consultants Co., Ltd.</span>
        </footer>
      </div>
    </section>
  </div>
</template>

<script>
  $("body").addClass("login-page");
  let doSubmit = false;
  export default {
    data() {
      return {
        form: { maincode: '', extension: '', oauth2: 'N' },
        company: [],
        extension: [],
        isLoading: false,
        showPassword: false,
        focused: null,
        companyOpen: false,
        companySearch: '',
        companyActive: -1,
        companyUp: false,
        companyMax: 300,
        contentImage: baseUrl + '/Content/Images/Logo/logo_mangocsm.png',
        bgImage: baseUrl + 'Content/Images/Image/login_bg.jpg',
        defaultBgImage: baseUrl + 'Content/Images/Image/login_bg.jpg',
      };
    },
    computed: {
      selectedCompany() {
        return this.company.find(x => x.maincode === this.form.maincode) || null;
      },
      filteredCompany() {
        let kw = this.companySearch.trim().toLowerCase();
        if (!kw) return this.company;
        return this.company.filter(x => `${x.maincode} ${x.mainname}`.toLowerCase().indexOf(kw) > -1);
      }
    },
    watch: {
      companySearch() {
        this.companyActive = this.filteredCompany.length ? 0 : -1;
      }
    },
    methods: {
      toggleCompany() {
        if (this.companyOpen) this.closeCompany();
        else this.openCompany();
      },
      openCompany() {
        this.companySearch = '';
        this.companyOpen = true;
        this.focused = 'company';
        this.$nextTick(() => {
          this.companyActive = Math.max(0, this.company.findIndex(x => x.maincode === this.form.maincode));
          this.measureCompanyPanel();
          if (this.$refs.companySearch) this.$refs.companySearch.focus();
          this.scrollCompanyActive();
        });
      },
      closeCompany(restoreFocus) {
        this.companyOpen = false;
        this.focused = null;
        if (restoreFocus) {
          this.$nextTick(() => {
            if (this.$refs.companyTrigger) this.$refs.companyTrigger.focus();
          });
        }
      },
      pickCompany(x) {
        this.$set(this.form, 'maincode', x.maincode);
        this.closeCompany(true);
      },
      pickActiveCompany() {
        let x = this.filteredCompany[this.companyActive];
        if (x) this.pickCompany(x);
      },
      moveCompany(step) {
        let n = this.filteredCompany.length;
        if (!n) return;
        this.companyActive = (this.companyActive + step + n) % n;
        this.scrollCompanyActive();
      },
      scrollCompanyActive() {
        this.$nextTick(() => {
          let list = this.$refs.companyList;
          if (!list) return;
          let row = list.children[this.companyActive];
          if (row) row.scrollIntoView({ block: 'nearest' });
        });
      },
      measureCompanyPanel() {
        let host = this.$refs.formPanel, field = this.$refs.companyField;
        if (!host || !field) return;
        let h = host.getBoundingClientRect(), f = field.getBoundingClientRect();
        let below = h.bottom - f.bottom - 24, above = f.top - h.top - 24;
        this.companyUp = below < 200 && above > below;
        this.companyMax = Math.round(Math.max(180, Math.min(320, this.companyUp ? above : below)));
      },
      onDocumentDown(e) {
        if (!this.companyOpen) return;
        if (this.$refs.companyField && !this.$refs.companyField.contains(e.target)) this.closeCompany();
      },
      loadCompany() {
        (async () => {
          let resp = await $xt.getServer(`api/public/LoginCompanies`);
          this.$set(this, 'company', resp.data);
          this.$set(this.form, 'maincode', $linq(resp.data).select(x => x.maincode).firstOrDefault() || '');
        })();
      },
      loadExtension() {
        (async () => {
          let resp = await $xt.getServer(`api/public/Extension_ForCallCenter`);
          this.$set(this, 'extension', resp.data);
        })();
      },
      async loadBackgroundCSM() {
        try {
          // Load Background CSM from config (TRN9999)
          let resp = await $xt.getServer(`CSM/API/CSM_Read_img_csm`);
          if (resp.data && resp.data.length > 0) {
            // Get the first image with config_id TRN9999
            let bgCSM = resp.data.find(x => x.config_id === 'TRN9999');
            if (bgCSM && bgCSM.phi_path) {
              // Use the uploaded background image
              this.$set(this, 'bgImage', window.dataServer + 'Api/File/DownLoad?id=' + bgCSM.phi_path);
            } else {
              // No CSM background found, use default
              this.$set(this, 'bgImage', this.defaultBgImage);
            }
          } else {
            // No images found, use default
            this.$set(this, 'bgImage', this.defaultBgImage);
          }
        } catch (ex) {
          // Error loading, use default background
          console.warn('Failed to load Background CSM, using default:', ex);
          this.$set(this, 'bgImage', this.defaultBgImage);
        }
      },
      submit() {
        if (doSubmit) return;
        (async () => {
          let f = this.form;
          if (!f.maincode || !f.userid || !f.userpass) {
            await $msg.alert('', 'Please fill in all required fields.', 'danger');
            return;
          }
          try {
            doSubmit = true;
            this.isLoading = true;
            let d = await $xt.postServerJson(`api/public/Login?is_api=N&app_name=CSM`, f);
            if (d.error) {
              await $msg.alert('', d.error, 'danger');
            } else {
              localStorage.setItem("mango_auth", d.data);
              window.location = baseUrl + 'page/';
            }
          } catch (err) {
            await $msg.alert('', err.toString(), 'danger');
          }
          doSubmit = false;
          this.isLoading = false;
        })();
      }
    },
    created() {
      document.title = `CSM : Customer Service Management`;
      this.loadCompany();
      this.loadExtension();
      this.loadBackgroundCSM();
    },
    mounted() {
      document.addEventListener('mousedown', this.onDocumentDown);
    },
    beforeDestroy() {
      document.removeEventListener('mousedown', this.onDocumentDown);
    }
  };
</script>

<style scoped>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .login-wrapper {
    --ink: #050E24;
    --navy-900: #002A9C;
    --navy-700: #0B4BA8;
    --navy-500: #126BE0;
    --sky: #9CC0FF;
    --text: #0D1B33;
    --muted: #5A6884;
    --line: #DCE3EF;
    --field: #F5F8FD;

    position: fixed;
    inset: 0;
    display: grid;
    grid-template-columns: 1fr clamp(430px, 38vw, 560px);
    background: var(--ink);
    color: var(--text);
    font-family: 'Manrope', 'Sarabun', sans-serif;
    overflow: hidden;
  }

  /* ── Visual panel ── */
  .visual-panel {
    position: relative;
    overflow: hidden;
  }
  .bg-image {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    animation: bgZoom 34s ease-in-out infinite alternate;
  }
  .bg-overlay {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(120% 90% at 12% 100%, rgba(18, 107, 224, 0.34) 0%, rgba(18, 107, 224, 0) 60%),
      linear-gradient(158deg, rgba(5, 14, 36, 0.72) 0%, rgba(7, 24, 62, 0.5) 45%, rgba(0, 42, 156, 0.36) 100%);
  }
  .bg-grain {
    position: absolute;
    inset: 0;
    opacity: 0.16;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  @keyframes bgZoom {
    from { transform: scale(1); }
    to   { transform: scale(1.09); }
  }

  .visual-content {
    position: relative;
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr auto;
    padding: clamp(40px, 5vw, 68px);
    color: #fff;
  }

  .visual-copy {
    align-self: center;
    max-width: 19em;
  }

  .visual-footer {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .visual-tag {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .visual-tag-rule {
    width: 34px;
    height: 2px;
    flex-shrink: 0;
    border-radius: 2px;
    background: linear-gradient(90deg, var(--sky) 0%, rgba(156, 192, 255, 0) 100%);
  }
  .visual-eyebrow {
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--sky);
    text-shadow: 0 1px 14px rgba(4, 12, 32, 0.55);
  }
  .visual-headline {
    font-family: 'Prompt', 'Sarabun', sans-serif;
    font-size: clamp(30px, 3.4vw, 46px);
    font-weight: 500;
    line-height: 1.24;
    letter-spacing: -0.01em;
  }
  .visual-headline em {
    font-style: normal;
    font-weight: 600;
    color: var(--sky);
  }
  .visual-sub {
    margin-top: 18px;
    font-size: 15px;
    line-height: 1.75;
    color: rgba(255, 255, 255, 0.72);
  }

  .visual-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 24px;
    list-style: none;
  }
  .visual-meta li {
    position: relative;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
    padding-left: 14px;
  }
  .visual-meta li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 5px;
    height: 5px;
    margin-top: -2px;
    border-radius: 50%;
    background: var(--sky);
  }

  /* ── Brand ── */
  .brand-area {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-logo {
    flex-shrink: 0;
    display: flex;
  }
  .brand-name {
    font-family: 'Prompt', 'Sarabun', sans-serif;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 0.01em;
    text-shadow: 0 1px 12px rgba(4, 12, 32, 0.45);
  }
  .brand-area-compact {
    display: none;
    color: var(--text);
    margin-bottom: 40px;
  }

  /* ── Form panel ── */
  .form-panel {
    position: relative;
    display: flex;
    overflow-y: auto;
    background:
      radial-gradient(90% 60% at 100% 0%, rgba(18, 107, 224, 0.07) 0%, rgba(18, 107, 224, 0) 70%),
      #fff;
  }
  .form-inner {
    width: 100%;
    max-width: 402px;
    margin: auto;
    padding: clamp(36px, 4vw, 56px) clamp(28px, 4vw, 54px);
  }

  .form-head {
    margin-bottom: 34px;
  }
  .login-title {
    font-family: 'Prompt', 'Sarabun', sans-serif;
    font-size: 32px;
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: -0.015em;
  }
  .login-desc {
    margin-top: 8px;
    font-size: 14.5px;
    color: var(--muted);
  }

  .form-area {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .form-area > * {
    opacity: 0;
    animation: riseIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .form-area > *:nth-child(1) { animation-delay: 0.06s; }
  .form-area > *:nth-child(2) { animation-delay: 0.12s; }
  .form-area > *:nth-child(3) { animation-delay: 0.18s; }
  .form-area > *:nth-child(4) { animation-delay: 0.24s; }
  .form-area > *:nth-child(5) { animation-delay: 0.3s; }
  @keyframes riseIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: none; }
  }

  /* ── Fields ── */
  .field {
    position: relative;
  }
  .field.is-focused {
    z-index: 40;
  }
  .field-label {
    display: block;
    margin-bottom: 7px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: var(--muted);
    transition: color 0.18s;
  }
  .is-focused .field-label {
    color: var(--navy-700);
  }

  .control-wrap {
    position: relative;
  }
  .field-control {
    width: 100%;
    height: 50px;
    padding: 0 16px 0 44px;
    border: 1.5px solid var(--line);
    border-radius: 12px;
    background: var(--field);
    font-family: inherit;
    font-size: 15px;
    color: var(--text);
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
  }
  .field-control::placeholder {
    color: #98A3BA;
  }
  .field-control::-ms-reveal,
  .field-control::-ms-clear {
    display: none;
  }
  .field-control.is-select {
    padding-right: 42px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
  }
  .field-control.has-action {
    padding-right: 46px;
  }
  .is-focused .field-control {
    border-color: var(--navy-500);
    background: #fff;
    box-shadow: 0 0 0 4px rgba(18, 107, 224, 0.14);
  }

  /* ── Company trigger ── */
  .field-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-right: 42px;
    text-align: left;
    cursor: pointer;
  }
  .trigger-code {
    flex-shrink: 0;
    padding: 3px 7px;
    border-radius: 6px;
    background: #EDF2FB;
    font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--navy-700);
  }
  .trigger-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .field-trigger.is-empty .trigger-text {
    color: #98A3BA;
  }

  /* ── Company dropdown ── */
  .opt-panel {
    position: absolute;
    z-index: 30;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 18px 44px rgba(4, 12, 32, 0.16), 0 2px 6px rgba(4, 12, 32, 0.06);
    animation: optIn 0.16s ease-out;
  }
  .opt-panel-up {
    top: auto;
    bottom: calc(100% + 8px);
    animation-name: optInUp;
  }
  @keyframes optIn {
    from { opacity: 0; transform: translateY(-5px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes optInUp {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: none; }
  }

  .opt-search {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    padding: 12px 14px;
    border-bottom: 1px solid var(--line);
  }
  .opt-search > i {
    font-size: 12px;
    color: #8A96AE;
  }
  .opt-search input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: none;
    font-family: inherit;
    font-size: 14px;
    color: var(--text);
  }
  .opt-search input::placeholder {
    color: #98A3BA;
  }
  .opt-count {
    flex-shrink: 0;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--field);
    font-size: 11px;
    font-weight: 700;
    color: var(--muted);
  }

  .opt-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 6px;
    list-style: none;
  }
  .opt-list::-webkit-scrollbar { width: 8px; }
  .opt-list::-webkit-scrollbar-track { background: transparent; }
  .opt-list::-webkit-scrollbar-thumb {
    border: 2px solid #fff;
    border-radius: 8px;
    background: #C7D3E8;
  }

  .opt-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.12s;
  }
  .opt-row.is-active {
    background: var(--field);
  }
  .opt-row.is-selected {
    background: rgba(18, 107, 224, 0.08);
  }
  .opt-code {
    flex-shrink: 0;
    min-width: 56px;
    padding: 3px 8px;
    border-radius: 6px;
    background: #EDF2FB;
    font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-align: center;
    color: var(--navy-700);
  }
  .opt-row.is-selected .opt-code {
    background: rgba(18, 107, 224, 0.16);
  }
  .opt-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13.5px;
    color: var(--text);
  }
  .opt-check {
    flex-shrink: 0;
    font-size: 11px;
    color: var(--navy-500);
    opacity: 0;
  }
  .opt-row.is-selected .opt-check {
    opacity: 1;
  }
  .opt-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 28px 12px;
    font-size: 13px;
    color: #98A3BA;
  }
  .opt-empty i {
    font-size: 20px;
    opacity: 0.6;
  }

  .control-lead,
  .control-caret {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: #8A96AE;
    pointer-events: none;
    transition: color 0.18s;
  }
  .control-lead {
    left: 17px;
    font-size: 14px;
  }
  .control-caret {
    right: 16px;
    font-size: 10px;
    transition: color 0.18s, transform 0.2s;
  }
  .control-caret.is-open {
    transform: translateY(-50%) rotate(180deg);
  }
  .is-focused .control-lead,
  .is-focused .control-caret {
    color: var(--navy-500);
  }

  .toggle-password {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    padding: 8px;
    border: none;
    border-radius: 50%;
    background: none;
    font-size: 14px;
    color: #8A96AE;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .toggle-password:hover {
    background: rgba(18, 107, 224, 0.1);
    color: var(--navy-700);
  }

  /* ── Button ── */
  .btn-login {
    width: 100%;
    height: 52px;
    margin-top: 8px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--navy-500) 0%, var(--navy-900) 100%);
    color: #fff;
    font-family: inherit;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.01em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0 6px 18px rgba(0, 42, 156, 0.24);
    transition: box-shadow 0.2s, transform 0.12s, filter 0.2s;
  }
  .btn-login:hover:not(:disabled) {
    filter: brightness(1.08);
    transform: translateY(-1px);
    box-shadow: 0 10px 26px rgba(0, 42, 156, 0.32);
  }
  .btn-login:active:not(:disabled) {
    transform: translateY(0);
  }
  .btn-login:disabled {
    opacity: 0.72;
    cursor: not-allowed;
  }
  .btn-arrow {
    font-size: 12px;
    transition: transform 0.2s;
  }
  .btn-login:hover:not(:disabled) .btn-arrow {
    transform: translateX(4px);
  }

  .btn-spinner {
    width: 17px;
    height: 17px;
    border: 2.5px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ── Footer ── */
  .form-footer {
    margin-top: 36px;
    padding-top: 20px;
    border-top: 1px solid var(--line);
  }
  .footer-text {
    font-size: 12px;
    color: #8D99B0;
    letter-spacing: 0.01em;
  }

  /* ── Responsive ── */
  @media (max-width: 1023px) {
    .login-wrapper {
      grid-template-columns: 1fr;
      align-items: center;
      justify-items: center;
      padding: 20px;
    }
    .visual-panel {
      position: absolute;
      inset: 0;
    }
    .visual-content {
      display: none;
    }
    .form-panel {
      position: relative;
      width: 100%;
      max-width: 452px;
      max-height: 100%;
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 26px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(22px) saturate(180%);
      -webkit-backdrop-filter: blur(22px) saturate(180%);
      box-shadow: 0 24px 70px rgba(4, 12, 32, 0.36);
      animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .brand-area-compact {
      display: flex;
    }
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(14px) scale(0.985); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 480px) {
    .login-wrapper { padding: 12px; }
    .form-inner { padding: 32px 24px; }
    .brand-area-compact { margin-bottom: 30px; }
    .login-title { font-size: 27px; }
    .form-head { margin-bottom: 28px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .bg-image,
    .form-area > *,
    .form-panel {
      animation: none;
    }
    .form-area > * { opacity: 1; }
  }
</style>
