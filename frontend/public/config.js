/* Per-deployment configuration. Edit this file on the server; it is never bundled.
   Replaces the values Page/Default.aspx used to inject from Web.config AppSettings. */
(function () {
  var origin = window.location.origin

  window.baseUrl = origin + '/'
  window.basePath = '/application/'
  window.baseRoute = origin + '/application/'

  window.dataServer = 'http://localhost/service/'
  window.printServer = window.dataServer + 'PrintApi/Document/Create/'
  window.hostServer = window.dataServer

  window.baseCompany = 'MG'
  window.viewVersion = ''
  window.mangoSocketUrl = 'https://itdeveloper.mangoanywhere.com/socket.io.service'

  window.signalR = {}
  window.ui = {}
  window.auth = {}
  window.menu = []
  window.menuRight = {}
  window.page_addspec = null
})()
