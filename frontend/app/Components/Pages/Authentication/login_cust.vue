<template>
  <div class="oval-gate">
    <span class="og-blob og-blob-a"></span>
    <span class="og-blob og-blob-b"></span>
    <span class="og-rail">MANGO CSM &nbsp;·&nbsp; CUSTOMER ACCESS &nbsp;·&nbsp; SERVICE DESK</span>

    <div class="og-stage">
      <span class="og-halo"></span>
      <span class="og-dash"></span>

      <!-- เส้นวงรี + แสงวิ่งรอบขอบ -->
      <svg class="og-ring" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="ogComet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#F5A524" stop-opacity="0" />
            <stop offset="0.45" stop-color="#F5A524" />
            <stop offset="1" stop-color="#2F8F5B" />
          </linearGradient>
        </defs>
        <ellipse class="og-ring-base" cx="100" cy="150" rx="99" ry="149"
                 fill="none" stroke="#E3D8C6" stroke-width="1" vector-effect="non-scaling-stroke" />
        <ellipse class="og-ring-comet" cx="100" cy="150" rx="99" ry="149" pathLength="1000"
                 fill="none" stroke="url(#ogComet)" stroke-width="2.4" stroke-linecap="round"
                 vector-effect="non-scaling-stroke" />
      </svg>

      <!-- การ์ดวงรี -->
      <div class="og-card">
        <img :src="logoImage" alt="Mango Consultant" class="og-logo" />
        <p class="og-eyebrow">Customer Service Portal</p>

        <h1 class="og-title">เข้าสู่ระบบ</h1>
        <p class="og-desc">ใส่ชื่อผู้ใช้และรหัสผ่าน<br />ที่ได้รับจากเจ้าหน้าที่</p>

        <div class="og-form">
          <div class="ofld" :class="{ 'is-on': focused === 'userid' }">
            <i class="fas fa-user ofld-ico"></i>
            <input
              type="text"
              name="username"
              class="ofld-in"
              placeholder="ชื่อผู้ใช้งาน"
              aria-label="Username"
              v-model="form['userid']"
              @focus="focused = 'userid'"
              @blur="focused = null"
              @keyup.enter="submit"
              autocomplete="username"
            />
          </div>

          <div class="ofld" :class="{ 'is-on': focused === 'userpass' }">
            <i class="fas fa-lock ofld-ico"></i>
            <input
              :type="showPassword ? 'text' : 'password'"
              name="password"
              class="ofld-in"
              placeholder="รหัสผ่าน"
              aria-label="Password"
              v-model="form['userpass']"
              @focus="focused = 'userpass'"
              @blur="focused = null"
              @keyup.enter="submit"
              autocomplete="current-password"
            />
            <button type="button" class="ofld-eye" @click="showPassword = !showPassword" tabindex="-1">
              <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
            </button>
          </div>

          <button type="button" class="og-btn" @click="submit" :disabled="isLoading">
            <span class="og-btn-spin" v-if="isLoading"></span>
            <span>{{ isLoading ? 'กำลังเข้าสู่ระบบ' : 'เข้าสู่ระบบ' }}</span>
            <i class="fas fa-arrow-right og-btn-arrow" v-if="!isLoading"></i>
          </button>
        </div>

        <p class="og-foot">
          <span class="og-live"><span class="og-live-dot"></span>ระบบพร้อมใช้งาน</span>
          <span class="og-copy">&copy; 2026 Mango Consultants Co., Ltd.</span>
        </p>
      </div>
    </div>
  </div>
</template>
<script>
  $("body").addClass("login-page");
  let doSubmit = false;
  export default {
    data() {
      return {
        form: {
          maincode: ''
        },
        isLoading: false,
        showPassword: false,
        focused: null,
        logoImage: baseUrl + 'Content/Images/Logo/logo_mango.png'
      };
    },
    methods: {
      submit() {
        if (doSubmit) return;

        (async () => {
          let f = this.form;
          if (!f.userid || !f.userpass) {
            await $msg.alert('', 'Please fill in all required fields.', 'danger');
            return;
          }
          let action = `CSM/AuthCustomer/Login`;
          try {
            doSubmit = true;
            this.isLoading = true;
            let d = await $xt.postServerJson(action, f)
            if (d.error) {
              await $msg.alert('', d.error, 'danger');
            } else {
              localStorage.setItem("customer_auth", d.data)
              window.location = baseUrl + 'page/external/v_csm_external';
            }
          }
          catch (err) {
            await $msg.alert('', err.toString(), 'danger');
          }
          doSubmit = false;
          this.isLoading = false;
        })();
      }
    },
    created() {
      document.title = `CSM : Customer Service Management`;
    },
    mounted() {

      let logincust = localStorage.getItem("X-Login-Customer");
      if (logincust != null || logincust != undefined) {
        let p = JSON.parse(logincust);
        this.form.userid = p.passcode;
        this.form.userpass = p.userpass;
        localStorage.removeItem('X-Login-Customer');
        this.submit();
      }
    }
  };
</script>
<style scoped>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .oval-gate {
    --paper: #F8F2E9;
    --paper-2: #F0E6D8;
    --card: #FFFFFF;
    --ink: #1A1512;
    --muted: #97897C;
    --line: #EBE1D2;
    --field: #F9F5EE;
    --mango: #F5A524;
    --mango-deep: #DE7C05;
    --leaf: #2F8F5B;
    --mono: ui-monospace, 'SFMono-Regular', Consolas, monospace;

    position: fixed;
    inset: 0;
    display: flex;
    padding: 24px 20px;
    overflow: auto;
    background-color: var(--paper);
    background-image:
      radial-gradient(circle at center, rgba(26, 21, 18, 0.055) 1px, rgba(0, 0, 0, 0) 1.6px),
      linear-gradient(165deg, #FCF8F2 0%, var(--paper) 52%, var(--paper-2) 100%);
    background-size: 24px 24px, auto;
    color: var(--ink);
    font-family: 'Manrope', 'Sarabun', sans-serif;
  }

  /* ── บรรยากาศพื้นหลัง ── */
  .og-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(12px);
    pointer-events: none;
  }
  .og-blob-a {
    width: 46vw; height: 46vw;
    max-width: 660px; max-height: 660px;
    top: -16vw; right: -12vw;
    background: radial-gradient(circle at 36% 32%, rgba(245, 165, 36, 0.28), rgba(245, 165, 36, 0) 66%);
    animation: ogDrift 26s ease-in-out infinite alternate;
  }
  .og-blob-b {
    width: 38vw; height: 38vw;
    max-width: 540px; max-height: 540px;
    bottom: -16vw; left: -10vw;
    background: radial-gradient(circle at 36% 32%, rgba(47, 143, 91, 0.17), rgba(47, 143, 91, 0) 66%);
    animation: ogDrift 33s ease-in-out infinite alternate-reverse;
  }
  @keyframes ogDrift {
    from { transform: translate3d(0, 0, 0) scale(1); }
    to   { transform: translate3d(-34px, 28px, 0) scale(1.12); }
  }

  .og-rail {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%) rotate(180deg);
    writing-mode: vertical-rl;
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 0.34em;
    text-transform: uppercase;
    color: rgba(26, 21, 18, 0.24);
    user-select: none;
    pointer-events: none;
  }

  /* ── เวทีวงรี ── */
  .og-stage {
    position: relative;
    width: clamp(370px, 34vw, 448px);
    height: clamp(596px, 88vh, 700px);
    margin: auto;
    flex: 0 0 auto;
    animation: ogIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes ogIn {
    from { opacity: 0; transform: translateY(18px) scale(0.965); }
    to   { opacity: 1; transform: none; }
  }

  .og-halo {
    position: absolute;
    inset: -13%;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(245, 165, 36, 0.22), rgba(245, 165, 36, 0.06) 62%, rgba(245, 165, 36, 0) 78%);
    filter: blur(6px);
    animation: ogBreathe 7s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes ogBreathe {
    0%, 100% { transform: scale(1); opacity: 0.85; }
    50% { transform: scale(1.045); opacity: 1; }
  }

  .og-dash {
    position: absolute;
    inset: -30px;
    border: 1px dashed rgba(26, 21, 18, 0.13);
    border-radius: 50%;
    animation: ogSpin 70s linear infinite;
    pointer-events: none;
  }
  @keyframes ogSpin {
    to { transform: rotate(360deg); }
  }

  .og-ring {
    position: absolute;
    inset: -9px;
    width: auto;
    height: auto;
    overflow: visible;
    pointer-events: none;
  }
  .og-ring-base { opacity: 0.9; }
  .og-ring-comet {
    stroke-dasharray: 130 870;
    filter: drop-shadow(0 0 5px rgba(245, 165, 36, 0.55));
    animation: ogComet 13s linear infinite;
  }
  @keyframes ogComet {
    to { stroke-dashoffset: -1000; }
  }

  /* ── การ์ดวงรี ── */
  .og-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--card);
    box-shadow:
      inset 0 0 0 1px rgba(26, 21, 18, 0.045),
      0 26px 60px -26px rgba(78, 55, 18, 0.34),
      0 60px 120px -60px rgba(78, 55, 18, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 clamp(46px, 5vw, 64px);
  }

  .og-logo {
    max-height: 34px;
    max-width: 156px;
  }
  .og-eyebrow {
    margin-top: 13px;
    font-family: var(--mono);
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .og-title {
    margin-top: 20px;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .og-desc {
    margin-top: 8px;
    font-size: 12.5px;
    line-height: 1.7;
    color: var(--muted);
  }

  .og-form {
    width: 100%;
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .og-form > * {
    opacity: 0;
    animation: ogRise 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .og-form > *:nth-child(1) { animation-delay: 0.22s; }
  .og-form > *:nth-child(2) { animation-delay: 0.3s; }
  .og-form > *:nth-child(3) { animation-delay: 0.38s; }
  @keyframes ogRise {
    from { opacity: 0; transform: translateY(9px); }
    to   { opacity: 1; transform: none; }
  }

  /* ── ช่องกรอกทรงแคปซูล ── */
  .ofld {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 50px;
    padding: 0 6px 0 18px;
    border: 1.5px solid var(--line);
    border-radius: 999px;
    background: var(--field);
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .ofld.is-on {
    border-color: var(--mango);
    background: #fff;
    box-shadow: 0 0 0 4px rgba(245, 165, 36, 0.16);
  }
  .ofld-ico {
    flex-shrink: 0;
    width: 15px;
    font-size: 13px;
    text-align: center;
    color: #C0B2A3;
    transition: color 0.2s;
  }
  .ofld.is-on .ofld-ico { color: var(--mango-deep); }
  .ofld-in {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: none;
    background: none;
    outline: none;
    font-family: inherit;
    font-size: 14.5px;
    font-weight: 600;
    color: var(--ink);
  }
  .ofld-in::placeholder {
    font-weight: 500;
    color: #C4B7A9;
  }
  .ofld-in::-ms-reveal,
  .ofld-in::-ms-clear { display: none; }
  .ofld-eye {
    flex-shrink: 0;
    width: 34px; height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: none;
    font-size: 13px;
    color: #C0B2A3;
    cursor: pointer;
    transition: background 0.16s, color 0.16s;
  }
  .ofld-eye:hover {
    background: rgba(245, 165, 36, 0.14);
    color: var(--mango-deep);
  }

  /* ── ปุ่ม ── */
  .og-btn {
    position: relative;
    width: 100%;
    height: 50px;
    margin-top: 6px;
    overflow: hidden;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #FFC257 0%, var(--mango) 46%, var(--mango-deep) 100%);
    font-family: inherit;
    font-size: 14.5px;
    font-weight: 800;
    color: #2A1B05;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    box-shadow: 0 10px 22px -8px rgba(222, 124, 5, 0.6);
    transition: transform 0.14s, box-shadow 0.22s, filter 0.22s;
  }
  .og-btn::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: linear-gradient(100deg, rgba(255, 255, 255, 0) 34%, rgba(255, 255, 255, 0.55) 50%, rgba(255, 255, 255, 0) 66%);
    transform: translateX(-101%);
  }
  .og-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.04);
    box-shadow: 0 16px 30px -10px rgba(222, 124, 5, 0.66);
  }
  .og-btn:hover:not(:disabled)::after { animation: ogShine 0.85s ease-out; }
  .og-btn:active:not(:disabled) { transform: translateY(0); }
  .og-btn:disabled { opacity: 0.72; cursor: not-allowed; }
  @keyframes ogShine {
    from { transform: translateX(-101%); }
    to   { transform: translateX(101%); }
  }
  .og-btn-arrow {
    font-size: 11px;
    transition: transform 0.2s;
  }
  .og-btn:hover:not(:disabled) .og-btn-arrow { transform: translateX(4px); }
  .og-btn-spin {
    width: 16px; height: 16px;
    border: 2.5px solid rgba(42, 27, 5, 0.25);
    border-top-color: #2A1B05;
    border-radius: 50%;
    animation: ogRotate 0.7s linear infinite;
  }
  @keyframes ogRotate { to { transform: rotate(360deg); } }

  /* ── ท้ายการ์ด ── */
  .og-foot {
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
  }
  .og-live {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 11px;
    border-radius: 999px;
    background: rgba(47, 143, 91, 0.1);
    font-size: 10.5px;
    font-weight: 700;
    color: var(--leaf);
  }
  .og-live-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--leaf);
    animation: ogBlip 2s ease-out infinite;
  }
  @keyframes ogBlip {
    0%, 100% { box-shadow: 0 0 0 0 rgba(47, 143, 91, 0.5); }
    70% { box-shadow: 0 0 0 6px rgba(47, 143, 91, 0); }
  }
  .og-copy {
    font-size: 10px;
    color: #A2958A;
  }

  /* ── จอเล็ก / จอเตี้ย : พับวงรีเป็นการ์ดมน ── */
  @media (max-width: 760px), (max-height: 620px) {
    .og-stage {
      width: 100%;
      max-width: 404px;
      height: auto;
      padding: 0;
    }
    .og-ring, .og-dash { display: none; }
    .og-halo { inset: -8%; }
    .og-card {
      height: auto;
      border-radius: 32px;
      padding: 36px 26px 30px;
    }
    .og-title { margin-top: 18px; font-size: 25px; }
    .og-form { margin-top: 20px; }
    .og-rail { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .og-blob, .og-halo, .og-dash, .og-ring-comet, .og-stage, .og-form > *, .og-live-dot {
      animation: none;
    }
    .og-form > * { opacity: 1; }
  }
</style>
