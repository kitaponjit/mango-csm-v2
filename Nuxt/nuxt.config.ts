export default defineNuxtConfig({
  ssr: false,

  app: {
    baseURL: '/csm-next/',
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBaseUrl: '',
      fileHost: '',
      loginPath: '/page/authentication/login/',
    },
  },

  devtools: {
    enabled: false,
  },
})
