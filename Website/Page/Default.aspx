<%@ Page Language="C#" ResponseEncoding="UTF-8" %>

<%@ Import Namespace="System.IO" %>
<!DOCTYPE html>
<script runat="server">
  public string host;
  public string baseUrl;
  public string baseRoute;
  public string basePath;
  public string dataServer;
  public FileInfo fi;
  string appJsHash;
  string noCacheTs;
  string baseCompany;
  string buildVersion;
  string printServer;
  string hostServer;
  string mangoSocketUrl;
  string viteDevServer;
  void Page_Load(object o, EventArgs e)
  {

    viteDevServer = (System.Configuration.ConfigurationManager.AppSettings["ViteDevServer"] ?? "").TrimEnd('/');

    host = Request.Url.Scheme + "://" + Request.Url.Authority;
    baseUrl = Request.Url.Scheme + "://" + Request.Url.Authority + Request.ApplicationPath.TrimEnd('/') + "/";
    basePath = Request.ApplicationPath.TrimEnd('/') + "/" + "application/";
    baseRoute = host.Remove(host.Length - 1) + basePath;
    dataServer = System.Configuration.ConfigurationManager.AppSettings["dataServer"];
    mangoSocketUrl = System.Configuration.ConfigurationManager.AppSettings["MangoSocketUrl"];
    if (System.Configuration.ConfigurationManager.AppSettings["dataServerSameAsVueServer"] == "1")
    {
      dataServer = host + "/" + dataServer;
    }
  var localServer = System.Configuration.ConfigurationManager.AppSettings["PrintLocalServer"];
  if (localServer == "true")
  {
    var localSiteServer = System.Configuration.ConfigurationManager.AppSettings["PrintLocalSiteServer"];
    if (string.IsNullOrEmpty(localSiteServer)) printServer = host;
    else printServer = host + localSiteServer + "/";

    hostServer = printServer;
  }
  else
  {
    var setPrintServer = System.Configuration.ConfigurationManager.AppSettings["printServer"];
    if (string.IsNullOrEmpty(setPrintServer)) printServer = dataServer;
    else printServer = setPrintServer;

    hostServer = dataServer;
  }

    fi = new FileInfo(Server.MapPath("~/Scripts/Bundle/Application.js"));

    Response.Cache.SetExpires(DateTime.UtcNow.AddDays(-1));
    Response.Cache.SetValidUntilExpires(false);
    Response.Cache.SetRevalidation(HttpCacheRevalidation.AllCaches);
    Response.Cache.SetCacheability(HttpCacheability.NoCache);
    Response.Cache.SetNoStore();

    appJsHash = Server.UrlEncode(fi.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss"));
    noCacheTs = DateTime.UtcNow.Ticks.ToString();

    baseCompany = System.Configuration.ConfigurationManager.AppSettings["Company"] ?? "MG";

    try
    {
      buildVersion = File.ReadAllText(Server.MapPath("~/BuildVersion.txt"));
    }
    catch { }
  }
</script>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="cache-control" content="max-age=0" />
  <meta http-equiv="cache-control" content="no-cache" />
  <meta http-equiv="expires" content="-1" />
  <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
  <meta http-equiv="pragma" content="no-cache" />
  <title></title>
  <script>
    window.baseUrl = `<%=baseUrl%>`;
    window.basePath = `<%=basePath%>`;
    window.baseRoute = `<%=baseRoute%>`;
    window.dataServer = `<%=dataServer%>`;
    window.baseCompany = `<%=baseCompany%>`;
    window.signalR = {};
    window.ui = {};
    window.auth = {};
    window.menu = [];
    window.menuRight = {};
    window.viewVersion = `<%=buildVersion%>`;
    window.hostServer = `<%=hostServer%>`;
    window.mangoSocketUrl = `<%=mangoSocketUrl%>`;
  </script>

  <!-- Tell the browser to be responsive to screen width -->
  <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">

  <!-- Google Fonts -->
  <link rel="stylesheet" href="<%=baseUrl%>Content/Font/Inter/Inter.css" />
  <link rel="stylesheet" href="<%=baseUrl%>Content/Font/Manrope/Manrope.css" />
  <link rel="stylesheet" href="<%=baseUrl%>Content/Font/Sarabun/Sarabun.css" />
  <link rel="stylesheet" href="<%=baseUrl%>Content/Font/Prompt/Prompt.css" />

  <link rel="icon" href="<%=baseUrl%>Content/Images/Logo/mango_icon.ico" type="image/x-icon">
  <link rel="shortcut icon" href="<%=baseUrl%>Content/Images/Logo/mango_icon.ico" type="image/x-icon">


  <!-- Bootstrap 3 (ของเดิม) -->
  <link href="<%=baseUrl%>Content/Library/bower_components/bootstrap/dist/css/bootstrap.css" rel="stylesheet" />
    <!-- Bootstrap 5 (เพิ่มเข้าไป) -->
    <%--<link href="<%=baseUrl%>Content/bootstrap5/css/bootstrap.min.css" rel="stylesheet" id="bs5-css" disabled>--%>
  <%-- Font Awesome 5 (รวม solid/regular/brands) + v4-shims สำหรับ class เก่า `fa fa-xxx` --%>
  <link href="<%=baseUrl%>Content/Other/font-awesome-5.9.0/css/all.min.css" rel="stylesheet" />
  <link href="<%=baseUrl%>Content/Other/font-awesome-5.9.0/css/v4-shims.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="<%=baseUrl%>Content/Library/bower_components/Ionicons/css/ionicons.min.css">
  <link rel="stylesheet" href="<%=baseUrl%>Scripts/Others/select2/dist/css/select2.min.css">
  <link rel="stylesheet" href="<%=baseUrl%>Scripts/Others/select2/dist/css/select2-bootstrap.min.css">
  <link rel="stylesheet" href="<%=baseUrl%>Content/Library/dist/css/AdminLTE.min.css">
  <link rel="stylesheet" href="<%=baseUrl%>Content/Site-Skin.css?v=<%=noCacheTs %>" />
  <link rel="stylesheet" href="<%=baseUrl%>Content/Site.css?v=<%=noCacheTs %>" />
  <link rel="stylesheet" href="<%=baseUrl%>Content/Helper.css?version_time=<%=Server.UrlEncode(appJsHash) %>" />
  <link rel="stylesheet" href="<%=baseUrl%>Content/Other/hover-master/css/hover-min.css" />
  <link rel="stylesheet" href="<%=baseUrl%>Scripts/Others/JqueryConfirm/dist/jquery-confirm.min.css" />
  <link rel="stylesheet" href="<%=baseUrl%>Scripts/Others/Notify/toastr.css" />
  <link rel="stylesheet" href="<%=baseUrl%>Content/Other/animate.css" />
  <link rel="stylesheet" href="<%=baseUrl%>Content/icheck-material.min.css" />
  <% if (string.IsNullOrEmpty(viteDevServer)) { %>
  <link rel="stylesheet" href="<%=baseUrl%>Scripts/Bundle/Application.css?version_time=<%=Server.UrlEncode(appJsHash) %>" />
  <% } %>

  <base href="<%=baseUrl %>" />
</head>

<body class="hold-transition skin-black fixed sidebar-mini sidebar-collapse">
  <div id="firstLoading">
    <div class="loading">
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
    </div>
  </div>
  <div id="app">
    <router-view></router-view>
  </div>

  <script src="<%=baseUrl%>Content/Library/bower_components/jquery/dist/jquery.min.js"></script>
  <script src="<%=baseUrl%>Content/Library/bower_components/jquery-ui/jquery-ui.min.js"></script>
  <script>$.widget.bridge('uibutton', $.ui.button);</script>

  <!-- Bootstrap 3 (ของเดิม) -->
  <script src="<%=baseUrl%>Content/Library/bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
      <!-- Bootstrap 5 (เพิ่มเข้าไป) -->
 <%--<script src="<%=baseUrl%>Content/bootstrap5/js/bootstrap.bundle.min.js" id="bs5-js" defer></script>--%>
  <script src="<%=baseUrl%>Scripts/Others/select2/dist/js/select2.full.min.js"></script>
  <script src="<%=baseUrl%>Content/Library/bower_components/jquery-slimscroll/jquery.slimscroll.min.js"></script>
  <script src="<%=baseUrl%>Content/Library/bower_components/fastclick/lib/fastclick.js"></script>
  <script src="<%=baseUrl%>Content/Library/dist/js/adminlte.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/JqueryConfirm/dist/jquery-confirm.min.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/Notify/toastr.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/lodash.core.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/LinqJS/jslinq.min.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/moment.min.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/Service/axios.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/Service/xtools.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/decimal.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/Pagination/Pagination.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/Service/alert-service.js?version_time=<%=Server.UrlEncode(appJsHash) %>"></script>
  <script src="<%=baseUrl%>Scripts/Others/tinymce_4.7.13/tinymce/js/tinymce/tinymce.min.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/jquery.signalR-2.3.0.js"></script>
  <script src="<%=dataServer %>SignalR/Hubs"></script>

  <script>$.connection.hub.url = window.dataServer + 'signalr'</script>
  <script src="<%=baseUrl%>Scripts/Others/iwc-all.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/signalr-patch.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/iwc-signalr.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/MangoSignalR.js"></script>
  <script src="<%=baseUrl%>Scripts/Others/data-center.js"></script>

  <script>
    window.Decimal = Decimal
    window.moment = moment
    window.$linq = $linq
    window.$ = $
    window.$xt = $xt
    window.$notify = $notify
    window.queryString = $xt.queryString
    window.$msg = $msg
    window.Pagination = Pagination
    window.signalR = signalR
    window.platformCodeData = platformCodeData
    window.moduleCodeData = moduleCodeData
    window.statusCode = statusCode
    window.statusCodeData = statusCodeData
    window.printServer = `<%=printServer%>PrintApi/Document/Create/`
    window.page_addspec = null
  </script>

  <!-- Application.js (Run App) -->
  <% if (string.IsNullOrEmpty(viteDevServer)) { %>
  <script type="module" src="<%=baseUrl%>Scripts/Bundle/Application.js?v=<%=noCacheTs %>"></script>
  <% } else { %>
  <script type="module" src="<%=viteDevServer%>/@vite/client"></script>
  <script type="module" src="<%=viteDevServer%>/Scripts/App/Application/main.js"></script>
  <% } %>
</body>
</html>
