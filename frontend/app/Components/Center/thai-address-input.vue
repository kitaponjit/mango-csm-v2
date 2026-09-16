<template>
  <div class="thai-address-input">
    <input ref="input"
           type="text"
           :class="inputClass"
           :placeholder="placeholder"
           :disabled="disabled"
           :required="required"
           :value="bound"
           @input="onType($event.target.value)"
           @focus="onFocus"
           @blur="onBlur"
           @keydown.up.prevent="cursorUp"
           @keydown.down.prevent="cursorDown"
           @keyup.enter="selectItem()">
    <div v-show="isFocus" class="suggestion-list">
      <div v-for="(item, index) in suggestions"
           :key="index"
           class="suggestion-list-item"
           :class="{ cursor: cursor === index }"
           @click="selectItem(item)">
        {{ suggestionText(item) }}
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  /*
   * Replacement for `vue-thai-address-input` (MIT, (c) 2018 tsctao), registered in
   * the legacy main.js as `Vue.use(VueThaiAddressInput)`. It is Vue 2 only and has
   * no successor, so the port left `<thai-address-input>` resolving to nothing and
   * the three Sub District / District / Province fields rendered as blanks.
   *
   * The decoder, `extractDataFromDb`, `query`, `search` and `suggestionText` below
   * are ported from that package's `dist/vue-thai-address-input.common.js` rather
   * than reimplemented, so the suggestions and their formatting are identical.
   * Its LICENSE is kept beside this file as thai-address-input.LICENSE.txt.
   *
   * ONE DELIBERATE DIFFERENCE. The upstream plugin defaults to fetching its
   * database over the network from the package author's GitHub Pages site,
   * https://tsctao.github.io/vue-thai-address-input/dist/db.json, and the legacy
   * `Vue.use(VueThaiAddressInput)` passed no options, so that is what the Vue 2 app
   * called on boot. The identical file ships inside the package (190 KB, ~56 KB
   * gzipped), so it is vendored to `public/thai-address-db.json` and served from
   * this app's own origin instead. Same data, same behaviour, no third-party
   * runtime dependency on an unaffiliated host.
   *
   * The fetch is also lazy — the legacy plugin built the index during `Vue.use`, so
   * every page load paid for it; here the first focus on one of these three inputs
   * does, and the result is shared by all of them.
   */

  // ── Ported verbatim from the upstream package ────────────────────────────────

  // The shipped database is compressed: repeated syllables live in `words`, whole
  // repeated names in `lookup`, and A-Z inside a name indexes into `words`.
  class Decoder {
    constructor(useLookup, lookup, words) {
      this.useLookup = useLookup
      this.lookup = lookup
      this.words = words
    }

    decode(text) {
      if (!this.useLookup) return text
      let newText = text
      if (typeof text === 'number') newText = this.lookup[text]
      return newText.replace(/[A-Z]/ig, (m) => {
        const ch = m.charCodeAt(0)
        return this.words[ch < 97 ? ch - 65 : (26 + ch) - 97]
      })
    }
  }

  class ThaiAddress {
    constructor(db) {
      this.data = ThaiAddress.extractDataFromDb(db)
    }

    static extractDataFromDb(db) {
      const useLookup = db.lookup && db.words
      const data = useLookup ? db.data : db

      // A non-encoded database is already a flat array of address objects.
      if (!data[0].length) return data

      const result = []
      const lookup = useLookup ? db.lookup.split('|') : []
      const words = useLookup ? db.words.split('|') : []
      const decoder = new Decoder(useLookup, lookup, words)

      data.forEach((province) => {
        // A province row carries geo codes when it has three columns.
        const hasGeoData = province.length === 3
        const index = hasGeoData ? 2 : 1

        province[index].forEach((district) => {
          district[index].forEach((subdistrict) => {
            const codes = Array.isArray(subdistrict[index]) ? subdistrict[index] : [subdistrict[index]]
            codes.forEach((postalCode) => {
              const item = {
                subdistrict: decoder.decode(subdistrict[0]),
                district: decoder.decode(district[0]),
                province: decoder.decode(province[0]),
                postalCode: `${postalCode}`
              }
              if (hasGeoData) {
                item.subdistrict_code = subdistrict[1] || false
                item.district_code = district[1] || false
                item.province_code = province[1] || false
              }
              result.push(item)
            })
          })
        })
      })

      return result
    }

    query(q) {
      return this.data.filter((item) => Object.keys(q).every((key) => item[key].indexOf(q[key]) === 0))
    }

    search(keyword, fields = ['postalCode', 'subdistrict', 'district', 'province']) {
      const matches = { province: [], district: [], subdistrict: [], postalCode: [] }

      this.data.forEach((item) => Object.keys(item).some((key) => {
        const isMatch = item[key].indexOf(keyword) === 0
        if (isMatch) matches[key].push(item)
        return isMatch
      }))

      return fields.reduce((result, field) => result.concat(matches[field]), [])
    }
  }

  // ── Lazily loaded, shared by every instance ──────────────────────────────────

  let indexPromise = null

  function loadIndex() {
    if (!indexPromise) {
      const base = (typeof window !== 'undefined' && window.baseUrl) || '/'
      indexPromise = fetch(`${base}thai-address-db.json`)
        .then((r) => {
          if (!r.ok) throw new Error(`thai-address-db.json: ${r.status}`)
          return r.json()
        })
        .then((db) => new ThaiAddress(db))
        .catch((err) => {
          // Leave the field usable as a plain text input rather than breaking the form.
          console.error('[thai-address-input] address database unavailable', err)
          indexPromise = null
          return null
        })
    }
    return indexPromise
  }

  export default {
    name: 'ThaiAddressInput',
    props: {
      type: { type: String, required: true },
      minLength: { type: Number, default: 2 },
      // Vue 3 v-model; `value` is kept for any `:value` call site, as in the
      // other Center wrappers.
      modelValue: { default: undefined },
      value: { default: undefined },
      placeholder: { type: String, default: undefined },
      disabled: { type: Boolean, default: false },
      inputClass: { type: String, default: undefined },
      required: { type: Boolean, default: false }
    },
    emits: ['update:modelValue', 'input', 'selected'],
    data() {
      return { suggestions: [], isFocus: false, cursor: 0, index: null }
    },
    computed: {
      bound() {
        const v = this.modelValue !== undefined ? this.modelValue : this.value
        return v === null || v === undefined ? '' : v
      }
    },
    methods: {
      async ensureIndex() {
        if (!this.index) this.index = await loadIndex()
        return this.index
      },
      async query() {
        this.cursor = 0
        if (this.bound.length < this.minLength) {
          this.suggestions = []
          return
        }
        const index = await this.ensureIndex()
        if (!index) return
        this.suggestions = this.type === 'search'
          ? index.search(this.bound)
          : index.query({ [this.type]: this.bound })
      },
      suggestionText(item) {
        // Bangkok uses แขวง/เขต where the rest of the country uses ตำบล/อำเภอ.
        const isBangkok = item.province && item.province.indexOf('กรุงเทพ') > -1
        const subdistrictPrefix = isBangkok ? 'แขวง' : 'ตำบล'
        const districtPrefix = isBangkok ? 'เขต' : 'อำเภอ'
        const result = []
        if (item.subdistrict) result.push(`${subdistrictPrefix}${item.subdistrict}`)
        if (item.district) result.push(`${districtPrefix}${item.district}`)
        if (item.province) result.push(item.province)
        if (item.postalCode) result.push(item.postalCode)
        return result.join(' » ')
      },
      changeValue(text) {
        this.$emit('update:modelValue', text)
        this.$emit('input', text)
      },
      selectItem(item = null) {
        if (!item) item = this.suggestions[this.cursor]
        if (!item) return
        if (item[this.type]) this.changeValue(item[this.type])
        this.isFocus = false
        this.$refs.input.blur()
        this.$emit('selected', item)
      },
      onType(value) {
        this.changeValue(value)
        this.$nextTick(() => this.query())
      },
      onFocus() {
        this.query()
        this.isFocus = true
      },
      onBlur() {
        // Delayed so a click on a suggestion lands before the list is hidden.
        setTimeout(() => { this.isFocus = false }, 200)
      },
      cursorUp() {
        if (this.cursor > 0) this.cursor -= 1
      },
      cursorDown() {
        if (this.cursor < this.suggestions.length - 1) this.cursor += 1
      }
    }
  }
</script>

<style>
/* Ported from vue-thai-address-input/dist/vue-thai-address-input.css. */
.thai-address-input {
  position: relative;
}

.thai-address-input .suggestion-list {
  position: absolute;
  z-index: 1000;
  width: 100%;
}

.thai-address-input .suggestion-list-item {
  border: solid 1px #ddd;
  border-top-style: none;
  background: #fff;
  padding: 10px 5px;
  cursor: pointer;
}

.thai-address-input .suggestion-list-item:first-child {
  border-top-style: solid;
}

.thai-address-input .suggestion-list-item.cursor,
.thai-address-input .suggestion-list-item:hover {
  background: #eee;
}
</style>
