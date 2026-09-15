/* Per-deployment configuration. Edit this file on the server; it is never bundled.
   Replaces the values Page/Default.aspx used to inject from Web.config AppSettings.

   `dataServer` is the MangoServiceNetCore (.NET 8) origin *including its path
   base*. That backend mounts every area under `/service` by default — see
   `app.UsePathBase(...)` in Mango.Web/Program.cs, overridable with the
   MANGO_PATH_BASE environment variable — so the trailing `/service/` is
   required, and the value must match Website/Web.config's `dataServer` key.

   The backend must allow this page's origin: `cors_allowed_origins` in its
   `.env` / appsettings (it already lists http://localhost:3000). Auth travels
   as the `X-Mango-Auth` header from localStorage, not as a cookie, so no
   credentialed-CORS setup is needed. */
(function () {
  var origin = window.location.origin

  window.baseUrl = origin + '/'
  // xtools.js reads `window.baseURL` (capital URL) for its same-origin axios
  // instance; define both spellings so it is not left undefined.
  window.baseURL = window.baseUrl
  window.basePath = '/application/'
  window.baseRoute = origin + '/application/'

  window.dataServer = 'http://localhost:5075/service/'
  window.printServer = window.dataServer + 'PrintApi/Document/Create/'
  window.hostServer = window.dataServer

  window.baseCompany = 'MG'
  window.viewVersion = ''
  window.mangoSocketUrl = 'https://itdeveloper.mangoanywhere.com/socket.io.service'

  window.ui = {}
  window.auth = {}
  window.menu = []
  window.menuRight = {}
  window.page_addspec = null
})()
