/* SignalR generated hub proxies live on the API server, so the URL is only known
   once config.js has run. Page/Default.aspx emitted this as <%=dataServer%>SignalR/Hubs. */
document.write('<script src="' + window.dataServer + 'SignalR/Hubs"><\/script>')
document.write('<script>$.connection.hub.url = window.dataServer + "signalr";<\/script>')
