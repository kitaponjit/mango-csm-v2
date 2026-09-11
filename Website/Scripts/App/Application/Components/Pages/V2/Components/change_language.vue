<template>
  <div class="lang-overlay" v-if="show" @click.self="closeModal">
    <div class="lang-card">
      <div class="lang-card-header">
        <span class="text-bold"><i class="fas fa-globe margin-r-5"></i> {{ ui.select_language || 'เปลี่ยนภาษา' }}</span>
        <button type="button" class="btn btn-sm lang-card-close" @click="closeModal"><i class="fas fa-times"></i></button>
      </div>
      <div class="lang-card-body">
        <a class="lang-item" v-for="x in langList" :key="x.lang_code" :class="{ 'lang-item-active' : user_lang == x.lang_code }" @click="user_lang = x.lang_code">
          <span class="lang-item-badge">{{ x.lang_code.substring(0, 2).toUpperCase() }}</span>
          <span class="lang-item-name">{{ x.display_text }}</span>
          <i class="fas fa-check-circle text-success-v2" v-if="user_lang == x.lang_code"></i>
        </a>
      </div>
      <div class="lang-card-footer">
        <button class="btn btn-sm bg-success-v2 text-white w-100p border-radius-10" :disabled="!user_lang || saving" @click="changeLang">{{ui.confirm ||'ยืนยัน'}}</button>
      </div>
    </div>
  </div>
</template>

<script>
  /* bundle ใช้ EN แต่ sm_ui_language_code ใช้ EN_MASTER */
  const dbLangCode = { EN: 'EN_MASTER' }

  export default {
    data() {
      return {
        ui: window.ui,
        show: false,
        saving: false,
        langList: [],
        user_lang: localStorage.getItem('user_lang') || ''
      }
    },
    methods: {
      readLangList() {
        let bundle = window.langBundle || {}
        let languages = bundle.languages || {}
        let translate = bundle.translate || {}

        /* เอาเฉพาะภาษาที่แปลหน้า V2 ไว้จริง ภาษาที่ยังไม่ได้แปลจะไม่ขึ้นให้เลือก */
        let list = Object.keys(languages)
          .filter(x => translate[x] && translate[x].csm_v2_page_title)
          .map(x => ({ lang_code: dbLangCode[x] || x, display_text: languages[x] }))

        return list.length > 0 ? list : ((window.langList || {}).langList || [])
      },
      async openModal() {
        if (!await $msg.confirm(this.ui.alert_leave_page)) return

        this.langList = this.readLangList()
        this.user_lang = localStorage.getItem('user_lang') || 'TH'
        this.show = true
      },
      closeModal() {
        this.show = false
      },
      async changeLang() {
        if (!this.user_lang || this.saving) return
        this.saving = true
        try {
          if (window.customer_auth && window.customer_auth.is_authen) {
            let resp = await $xt.getCustomerServer(`CSM/AuthCustomer/ChangeLanguage?lang_code=${this.user_lang}`)
            if (!resp.success) throw resp.error
          }
          localStorage.setItem('user_lang', this.user_lang)
          window.location.href = window.location.href
        }
        catch (err) {
          await $msg.alert('', err.toString(), 'danger')
          this.saving = false
        }
      }
    }
  }
</script>

<style scoped>
  .lang-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.45);
    z-index: 1060;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .lang-card {
    width: 100%;
    max-width: 340px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }

  .lang-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    border-bottom: 1px solid #f3f3f3;
    color: #333;
  }

  .lang-card-close {
    color: #ccc;
    padding: 0 5px;
  }

  .lang-card-body {
    padding: 15px 20px;
    max-height: 50vh;
    overflow-y: auto;
  }

  .lang-card-footer {
    padding: 0 20px 20px;
  }

  .lang-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid #e8e8e8;
    border-radius: 10px;
    cursor: pointer;
    margin-bottom: 10px;
  }

  .lang-item:last-child {
    margin-bottom: 0;
  }

  .lang-item-active {
    border-color: #00BF9D;
    background-color: #00BF9D1A;
  }

  .lang-item-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: #f4f4f4;
    color: #808080;
    font-size: 12px;
    font-weight: 700;
  }

  .lang-item-active .lang-item-badge {
    background: #00BF9D;
    color: #fff;
  }

  .lang-item-name {
    flex-grow: 1;
    font-size: 14px;
    color: #333;
  }
</style>
