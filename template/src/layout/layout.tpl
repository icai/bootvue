<!DOCTYPE html>
<!--[if (gt IE 9)|!(IE)]><!-->
<html lang="en" class="" <% if(htmlWebpackPlugin.files.manifest) { %> manifest="<%= htmlWebpackPlugin.files.manifest %>"<% } %>> <!--<![endif]-->
<head>
  <meta charset="utf-8">
  <!--[if lte IE 9]>
      <script>window.location.href= '//' + location.host + '/static/ie.html?referrer='+location.href;</script>
  <![endif]-->
  <title><%= htmlWebpackPlugin.options.title || 'Webpack App'%></title>

<% if (htmlWebpackPlugin.options.templateChunks) { %>
  <% if (htmlWebpackPlugin.files.favicon) { %>
  <link rel="shortcut icon" href="<%= htmlWebpackPlugin.files.favicon%>">
  <% } %>
<% } %>
  <% if (htmlWebpackPlugin.options.mobile) { %>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <% } %>
<% if (htmlWebpackPlugin.options.templateChunks) { %>
 <% if (htmlWebpackPlugin.files.css) { %>
  <% for (var css in htmlWebpackPlugin.files.css) { %>
  <link href="<%= htmlWebpackPlugin.files.css[css] %>" rel="stylesheet">
  <% } %>
  <% } %>
<% } %>
</head>
<body>
<% if (htmlWebpackPlugin.options.unsupportedBrowser) { %>
<style>.unsupported-browser { display: none; }</style>
<div class="unsupported-browser">
  Sorry, your browser is not supported.  Please upgrade to
  the latest version or switch your browser to use this site.
  See <a href="http://outdatedbrowser.com/">outdatedbrowser.com</a>
  for options.
</div>
<% } %>
<% if (htmlWebpackPlugin.options.appMountId) { %>
<div id="<%= htmlWebpackPlugin.options.appMountId%>"></div>
<% } %>

<% if (htmlWebpackPlugin.options.appMountIds && htmlWebpackPlugin.options.appMountIds.length > 0) { %>
<% for (var index in htmlWebpackPlugin.options.appMountIds) { %>
<div id="<%= htmlWebpackPlugin.options.appMountIds[index]%>"></div>
<% } %>
<% } %>

<% if (htmlWebpackPlugin.options.window) { %>
<script>
  <% for (var varName in htmlWebpackPlugin.options.window) { %>
    window['<%=varName%>'] = <%= JSON.stringify(htmlWebpackPlugin.options.window[varName]) %>;
  <% } %>
</script>
<% } %>

<% if (htmlWebpackPlugin.options.templateChunks) { %>
  <% for (var chunk in htmlWebpackPlugin.files.chunks) { %>
  <script src="<%= htmlWebpackPlugin.files.chunks[chunk].entry %>"></script>
  <% } %>
<% } %>
<% if (htmlWebpackPlugin.options.devServer) { %>
<script src="<%= htmlWebpackPlugin.options.devServer%>/webpack-dev-server.js"></script>
<% } %>
<% if (htmlWebpackPlugin.options.googleAnalytics) { %>
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  <% if (htmlWebpackPlugin.options.googleAnalytics.trackingId) { %>
    ga('create', '<%= htmlWebpackPlugin.options.googleAnalytics.trackingId%>', 'auto');
    <% } else { throw new Error("html-webpack-template requires googleAnalytics.trackingId config"); }%>
  <% if (htmlWebpackPlugin.options.googleAnalytics.pageViewOnLoad) { %>
    ga('send', 'pageview');
  <% } %>
</script>
<% } %>
</body>
</html>
