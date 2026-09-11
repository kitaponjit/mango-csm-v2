<template>
  <div>
    <modal ref="langModal">
      <template slot="header">
        <div class="lang-header">
          <i class="fas fa-globe"></i>
          <span>{{ ui.select_language }}</span>
        </div>
      </template>
      <template slot="body">
        <div class="lang-grid">
          <div
            v-for="x in langList"
            :key="x.lang_code"
            class="lang-tile"
            :class="{ 'lang-tile--active': user_lang === x.lang_code }"
            @click="user_lang = x.lang_code"
          >
            <i class="fas fa-check-circle lang-tile-check" v-if="user_lang === x.lang_code"></i>
            <div class="lang-tile-badge">{{ x.lang_code.substring(0, 2).toUpperCase() }}</div>
            <div class="lang-tile-name">{{ x.display_text }}</div>
            <div class="lang-tile-code">{{ x.lang_code }}</div>
          </div>
        </div>
      </template>
      <template slot="footer">
        <button
          class="lang-btn"
          :disabled="!user_lang"
          @click="changeLang"
        >
          <i class="fas fa-check"></i> {{ ui.confirm }}
        </button>
      </template>
    </modal>
  </div>
</template>

<script>
/* ภาษาที่มีคำแปลใน lang_bundle.json แต่ยังไม่มีแถวใน sm_ui_language_code */
const extraLangCode = ['CN']

export default {
  data() {
    return {
      langList: [],
      ui: window.ui,
      user_lang: localStorage.getItem('user_lang') || ''
    };
  },
  methods: {
    readLangList() {
      let list = ((window.langList || {}).langList || []).slice();
      let languages = (window.langBundle || {}).languages || {};

      extraLangCode.forEach(x => {
        if (languages[x] && !list.some(z => z.lang_code === x)) {
          list.push({ lang_code: x, display_text: languages[x] });
        }
      });

      return list;
    },
    openModal() {
      (async () => {
        if (await $msg.confirm(ui.alert_leave_page)) {
          this.langList = this.readLangList();
          this.$refs.langModal.openModal();
        }
      })();
    },
    changeLang() {
      if (!this.user_lang) return;
      localStorage.setItem('user_lang', this.user_lang || 'TH');
      window.location.href = window.location.href;
    }
  },
  mounted() {
    this.$refs.langModal.setSize('lang-modal-size');
  }
};
</script>

<style>
.lang-modal-size {
  width: 680px !important;
  max-width: 90vw;
}

.lang-modal-size .modal-header {
  background: #1e2a4a !important;
  border-bottom: none !important;
  padding: 14px 20px !important;
}

.lang-modal-size .modal-header .close {
  color: #fff !important;
  opacity: 1;
  font-size: 20px;
}

.lang-modal-size .modal-body {
  padding: 24px 20px !important;
}

.lang-modal-size .modal-footer {
  border-top: none !important;
  padding: 0 20px 20px !important;
}
</style>

<style scoped>
.lang-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
}

.lang-header i {
  font-size: 16px;
}

.lang-grid {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.lang-tile {
  position: relative;
  flex: 1;
  min-width: 140px;
  padding: 20px 16px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
}

.lang-tile:hover {
  border-color: #93a3c0;
  background: #f8fafc;
}

.lang-tile--active {
  border-color: #1e2a4a;
  background: #f0f4fa;
}

.lang-tile-check {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 18px;
  color: #1e2a4a;
}

.lang-tile-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #e8ecf2;
  color: #1e2a4a;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
}

.lang-tile--active .lang-tile-badge {
  background: #d0daea;
}

.lang-tile-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e2a4a;
  margin-bottom: 2px;
}

.lang-tile-code {
  font-size: 11px;
  color: #8896ab;
  font-weight: 400;
}

.lang-btn {
  display: block;
  width: 100%;
  padding: 10px 0;
  border: none;
  border-radius: 8px;
  background: #1e2a4a;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.lang-btn:hover {
  background: #2c3e6a;
}

.lang-btn:disabled {
  background: #8896ab;
  cursor: not-allowed;
}

.lang-btn i {
  margin-right: 6px;
}
</style>
