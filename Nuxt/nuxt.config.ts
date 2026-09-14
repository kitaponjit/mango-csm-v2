const isDevelopment = process.env.NODE_ENV !== 'production'
const localLoginPath = '/csm-next/authentication/login/'

export default defineNuxtConfig({
  ssr: false,

  app: {
    baseURL: '/csm-next/',
  },

  css: ['~/assets/css/main.css'],

  routeRules: isDevelopment
    ? {
        '/page/authentication/login': { redirect: localLoginPath },
        '/page/authentication/login/**': { redirect: localLoginPath },
      }
    : {},

  runtimeConfig: {
    public: {
      apiBaseUrl: '',
      fileHost: '',
      loginPath: isDevelopment ? localLoginPath : '/page/authentication/login/',
    },
  },

  devtools: {
    enabled: false,
  },
})
