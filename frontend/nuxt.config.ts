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
  'Scripts/Others/jquery.signalR-2.3.0.js',
  'Scripts/Others/iwc-all.js',
  'Scripts/Others/signalr-patch.js',
  'Scripts/Others/iwc-signalr.js',
  'Scripts/Others/MangoSignalR.js',
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

export default defineNuxtConfig({
  compatibilityDate: '2026-09-11',

  ssr: false,

  modules: ['@pinia/nuxt'],

  components: { dirs: [] },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    buildAssetsDir: 'assets/',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: 'vendor/Content/Images/Logo/mango_icon.ico' },
        ...vendorStyles.map(href => ({ rel: 'stylesheet', href: `vendor/${href}` }))
      ],
      script: [
        { src: 'config.js' },
        ...vendorScripts.map(src => ({ src: `vendor/${src}` })),
        { src: 'signalr-hubs.js' }
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
