import { defineNuxtConfig } from 'nuxt/config'

const vendorScripts = [
  'Content/Library/bower_components/jquery/dist/jquery.min.js',
  'Content/Library/bower_components/jquery-ui/jquery-ui.min.js',
  'Content/Library/bower_components/bootstrap/dist/js/bootstrap.min.js',
  'Scripts/Others/select2/dist/js/select2.full.min.js',
  'Content/Library/bower_components/jquery-slimscroll/jquery.slimscroll.min.js',
  'Content/Library/bower_components/fastclick/lib/fastclick.js',
  'Content/Library/dist/js/adminlte.js',
  'Scripts/Others/JqueryConfirm/dist/jquery-confirm.min.js',
  'Scripts/Others/Notify/toastr.js',
  'Scripts/Others/lodash.core.js',
  'Scripts/Others/LinqJS/jslinq.min.js',
  'Scripts/Others/moment.min.js',
  'Scripts/Others/Service/axios.js',
  'Scripts/Others/Service/xtools.js',
  'Scripts/Others/decimal.js',
  'Scripts/Others/Pagination/Pagination.js',
  'Scripts/Others/Service/alert-service.js',
  'Scripts/Others/tinymce_4.7.13/tinymce/js/tinymce/tinymce.min.js',
  'Scripts/Others/data-center.js'
]

const vendorStyles = [
  'Content/Font/Inter/Inter.css',
  'Content/Font/Manrope/Manrope.css',
  'Content/Font/Sarabun/Sarabun.css',
  'Content/Font/Prompt/Prompt.css',
  'Content/Library/bower_components/bootstrap/dist/css/bootstrap.css',
  'Content/Other/font-awesome-5.9.0/css/all.min.css',
  'Content/Other/font-awesome-5.9.0/css/v4-shims.min.css',
  'Content/Library/bower_components/Ionicons/css/ionicons.min.css',
  'Scripts/Others/select2/dist/css/select2.min.css',
  'Scripts/Others/select2/dist/css/select2-bootstrap.min.css',
  'Content/Library/dist/css/AdminLTE.min.css',
  'Content/Site-Skin.css',
  'Content/Site.css',
  'Content/Helper.css',
  'Content/Other/hover-master/css/hover-min.css',
  'Scripts/Others/JqueryConfirm/dist/jquery-confirm.min.css',
  'Scripts/Others/Notify/toastr.css',
  'Content/Other/animate.css',
  'Content/icheck-material.min.css',
  'Content/DarkTheme.css'
]

// Vendor assets live in `public/`, so they are served from the site root. They
// must be referenced from the app's base URL rather than relatively: a relative
// `vendor/...` resolves against the *current route*, so on a nested route such
// as /page/authentication/login/ every script and stylesheet 404s and the
// jQuery-era globals ($, $xt, moment) are missing.
const baseURL = (process.env.NUXT_APP_BASE_URL || '/').replace(/\/*$/, '/')

export default defineNuxtConfig({
  compatibilityDate: '2026-09-11',

  ssr: false,

  modules: ['@pinia/nuxt'],

  components: { dirs: [] },

  app: {
    baseURL,
    buildAssetsDir: 'assets/',
    head: {
      charset: 'utf-8',
      // AdminLTE keys its whole layout off these body classes (.main-sidebar and
      // .content-wrapper positioning, the mini/collapsible sidebar, the skin).
      // Page/Default.aspx carried them on <body>; without them the sidebar renders
      // full-width in normal flow and the content area loses its offset.
      // login.vue adds 'login-page' on top of these, exactly as it did on the
      // legacy host page.
      bodyAttrs: { class: 'hold-transition skin-black fixed sidebar-mini sidebar-collapse' },
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: `${baseURL}vendor/Content/Images/Logo/mango_icon.ico` },
        ...vendorStyles.map(href => ({ rel: 'stylesheet', href: `${baseURL}vendor/${href}` }))
      ],
      script: [
        { src: `${baseURL}config.js` },
        ...vendorScripts.map(src => ({ src: `${baseURL}vendor/${src}` })),
        // Must run after every vendor script — see the file header.
        { src: `${baseURL}globals-bridge.js` },
      ]
    }
  },

  css: ['~/assets/css/app.css'],

  vite: {
    server: {
      allowedHosts: true
    }
  },

  nitro: {
    static: true
  },

  experimental: {
    payloadExtraction: false
  }
})
