const bundleLangCode = { TH: 'TH', EN_MASTER: 'EN' }

let langBundle = null
const getLangBundle = async () => {
  if (langBundle) return langBundle
  try {
    let resp = await fetch(`${window.baseUrl}vendor/Scripts/Others/lang_bundle.json`, { cache: 'no-cache' })
    langBundle = await resp.json()
  }
  catch (err) {
    console.error(err)
    langBundle = {}
  }
  window.langBundle = langBundle
  return langBundle
}

let fallbackUi = null
const getFallbackUi = async () => {
  if (fallbackUi) return fallbackUi
  try {
    let resp = await $xt.getServer(`api/public/LanguageSelector?lang_code=EN_MASTER`)
    fallbackUi = resp.data.uiLang || {}
  }
  catch (err) {
    console.error(err)
    fallbackUi = {}
  }
  return fallbackUi
}

const goExternal = (url) => navigateTo(url, { external: true, replace: true })

const isUnauthorized = (err) => {
  let status = err && err.response && err.response.status
  return status === 401 || status === 419
}

/* An expired `mango_auth` makes the backend answer 401 "Session expired or
   invalid" on every call, including the otherwise-public LanguageSelector.
   Clearing localStorage alone is not enough: xtools.js copies the token into
   the axios defaults once, at script load, so the dead token would keep being
   sent for the rest of the page session. */
const clearExpiredSession = () => {
  try {
    localStorage.removeItem('mango_auth')
    localStorage.removeItem('customer_auth')
    localStorage.removeItem('customer_login')
  } catch (err) { /* storage unavailable — nothing to clear */ }
  try { axioscustom2.defaults.headers.common['X-Mango-Auth'] = '' } catch (err) { /* vendor global absent */ }
  try { axioscustom3.defaults.headers.common['X-Customer-Auth'] = '' } catch (err) { /* vendor global absent */ }
}

/* Retry once anonymously so an expired session still renders the login page
   instead of failing the navigation — an uncaught throw in Nuxt middleware
   becomes a 500 error page. */
const getServerAllowingExpiry = async (url) => {
  try {
    return await $xt.getServer(url)
  }
  catch (err) {
    if (!isUnauthorized(err)) throw err
    clearExpiredSession()
    return await $xt.getServer(url)
  }
}

/* Same treatment for the customer session — an expired `customer_auth` must
   land on the customer login page, not the Nuxt error page. */
const getCustomerAllowingExpiry = async () => {
  try {
    return await $xt.getCustomerServer(`CSM/AuthCustomer/GetInitCustomerData`)
  }
  catch (err) {
    if (!isUnauthorized(err)) throw err
    clearExpiredSession()
    return { data: { cus_auth: { is_authen: false } } }
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.redirect) {
    return goExternal(to.meta.redirect)
  }

  let menu_name = ''
  let menu_id = ''
  let checkRight = false

  if (to.meta.mangoMenu && to.meta.mangoMenu.checkUserRight) {
    checkRight = true
    menu_name = to.meta.mangoMenu.menu_name || ''
    menu_id = to.meta.mangoMenu.menu_id || ''
  } else if (to.meta.mangoMenu && !to.meta.mangoMenu?.checkUserRight) {
    menu_name = to.meta.mangoMenu.menu_name || ''
    menu_id = to.meta.mangoMenu.menu_id || ''
  }

  let user_lang = localStorage.getItem('user_lang') || ''
  let resp_lang = await getServerAllowingExpiry(`api/public/LanguageSelector?lang_code=${user_lang}`)
  let bundle = await getLangBundle()
  let bundle_lang = bundleLangCode[user_lang] || user_lang || 'TH'

  let lang_data = (resp_lang.data || {}).lang || {}

  let uiLang = (resp_lang.data || {}).uiLang || {}
  Object.keys(uiLang).forEach(x => { if ($xt.isEmpty(uiLang[x])) delete uiLang[x] })

  let db_lang = (lang_data.langList || []).map(x => x.lang_code)
  let base = user_lang && db_lang.indexOf(user_lang) < 0 ? await getFallbackUi() : {}

  window.ui = Object.assign({}, base, bundle.translate?.[bundle_lang], uiLang)
  window.langList = lang_data

  if (to.name == 'login') {
    if (window.location.hostname === 'csr.mangoconsultant.com' && window.location.href.toLowerCase().indexOf('/login_cust/') < 0) {
      return goExternal('/page/authentication/login_cust/')
    }
  }

  if (to.meta.auth) {
    try {
      let resp_init = await $xt.getServer(`api/public/ViewUserAuthentication?menu_name=${encodeURIComponent(menu_name)}&lang_code=&menu_id=${encodeURIComponent(menu_id)}`)
      window.auth = resp_init.data.auth
      window.appinfo = resp_init.data.appinfo
      window.userRight = resp_init.data.menu_right || []
      window.projectRight = resp_init.data.project_right || []
    }
    catch (err) {
      if (!isUnauthorized(err)) throw err
      // Expired session: fall through as unauthenticated so the guard below
      // sends the user to login, rather than surfacing a 500.
      clearExpiredSession()
      window.auth = { is_authen: false }
      window.userRight = []
      window.projectRight = []
    }
  }

  if (to.meta.customer) {
    let rsp = await getCustomerAllowingExpiry()
    let customerAuth = rsp.data.cus_auth
    window.customer_auth = customerAuth
    if (to.meta.customer_auth && !customerAuth.is_authen) {
      return goExternal(window.baseUrl + 'page/authentication/login_cust/')
    }
  }

  if (to.meta.customer_v2) {
    let rsp = await getCustomerAllowingExpiry()
    let customerAuth = rsp.data.cus_auth
    window.customer_auth = customerAuth
    if (to.meta.customer_auth && !customerAuth.is_authen) {
      localStorage.removeItem('customer_auth')
      localStorage.removeItem('customer_login')
      return goExternal(window.baseUrl + 'page/v2/authentication/login/')
    }

    if (customerAuth.is_authen && !$xt.isEmpty(customerAuth.lang_web) && customerAuth.lang_web != (localStorage.getItem('user_lang') || '')) {
      localStorage.setItem('user_lang', customerAuth.lang_web)
      window.location.reload()
      return
    }
  }

  if (checkRight && to.name !== 'access_denied') {
    let isEnable = $linq(window.userRight).any(x => x.menu_id == menu_id && x.isenabled == 1)

    if (!isEnable) {
      return goExternal(window.baseUrl + `page/error/access_denied/`)
    }

    if (window.projectRight.length > 0) {
      let pre_event2 = $xt.queryString.pre_event2 || ''
      if ($xt.isEmpty(pre_event2) && !$xt.isEmpty($xt.queryString.pre_event)) {
        let pre_event = $xt.queryString.pre_event || ''
        pre_event2 = pre_event.substring(pre_event.length - 4, pre_event.length) + pre_event.substring(0, 3)
      }
      if (!$xt.isEmpty(pre_event2)) {
        if (!$linq(window.projectRight).any(x => x.pre_event2 === pre_event2)) {
          return goExternal(window.baseUrl + `page/error/access_denied/`)
        }
      }
    }
  }

  if (to.meta.isAdmin && !window.auth.is_admin) {
    return goExternal(window.baseUrl + `page/error/access_denied/`)
  }

  if (to.meta.userMango && window.auth.userid.toLowerCase() !== 'mango') {
    return goExternal(window.baseUrl + `page/error/access_denied/`)
  }

  if (to.name === 'login' && window.auth.is_authen) {
    return goExternal(window.baseUrl + 'page/')
  }

  if (to.meta.auth && !window.auth.is_authen) {
    return goExternal(window.baseUrl + 'page/authentication/login/')
  }

  $('#firstLoading').hide()
})
