<#
.SYNOPSIS
  Deploys the Nuxt frontend to a test site on the local (full) IIS, checks it,
  and removes it again.

.DESCRIPTION
  Follows "Deploy - IIS" in frontend/README.md: copies frontend/.output/public
  into a site folder, puts deploy/iis/web.config next to it, serves it from an
  application pool with No Managed Code, then requests the URLs that matter and
  reports PASS / FAIL.

  Frontend only. It does not install, start or configure the .NET 8 backend, so
  pages still need the backend to get past the first screen.

  1. Build first, in a normal (non-admin) terminal, from frontend/:
       npm run sync:vendor
       npm run generate

  2. Then, in PowerShell run as Administrator, from the repository root:
       powershell -ExecutionPolicy Bypass -File frontend\deploy\iis\Test-IisDeploy.ps1
       powershell -ExecutionPolicy Bypass -File frontend\deploy\iis\Test-IisDeploy.ps1 -Remove

  -TestOnly runs just the checks against a site that is already running and
  needs no admin rights.

  Everything is also written to %TEMP%\mango-csm-iis-test.log.

.PARAMETER Port
  HTTP port for the test site. Default 8081 (Docker uses 8080).

.PARAMETER SiteName
  Name of the IIS site and of its application pool. Default MangoCsmIisTest.

.PARAMETER SitePath
  Folder the build is copied to. Created by this script and marked as its own;
  an existing folder that this script did not create is never overwritten or
  deleted. Default C:\inetpub\mango-csm-iis-test.

.PARAMETER DataServer
  Optional. Sets window.dataServer in the deployed copy of config.js (the repo
  file is not changed): a path on the same site such as /service/, or a full URL
  such as http://server:5075/service/. Empty keeps config.js as built.

.PARAMETER Remove
  Deletes the test site, its application pool and its folder.

.PARAMETER TestOnly
  Only runs the checks, against -Url (default http://localhost:<Port>/).
#>
[CmdletBinding()]
param(
  [int]$Port = 8081,
  [string]$SiteName = 'MangoCsmIisTest',
  [string]$SitePath = 'C:\inetpub\mango-csm-iis-test',
  [string]$DataServer = '',
  [switch]$Remove,
  [switch]$TestOnly,
  [string]$Url = ''
)

$ErrorActionPreference = 'Stop'

$inetsrv   = Join-Path $env:windir 'System32\inetsrv'
$appcmd    = Join-Path $inetsrv 'appcmd.exe'
$frontend  = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$buildDir  = Join-Path $frontend '.output\public'
$webConfig = Join-Path $PSScriptRoot 'web.config'
$marker    = '.mango-csm-iis-test'
$log       = Join-Path $env:TEMP 'mango-csm-iis-test.log'
if (-not $Url) { $Url = "http://localhost:$Port/" }
$Url = $Url.TrimEnd('/') + '/'

try { Start-Transcript -Path $log -Force | Out-Null } catch { }

function Write-Step([string]$text) { Write-Host ''; Write-Host "== $text" -ForegroundColor Cyan }
function Write-Note([string]$text) { Write-Host "   $text" }
function Write-Warn([string]$text) { Write-Host "   WARN  $text" -ForegroundColor Yellow }

function Stop-WithError([string]$text) {
  Write-Host ''
  Write-Host "ERROR: $text" -ForegroundColor Red
  try { Stop-Transcript | Out-Null } catch { }
  exit 1
}

function Test-Admin {
  $principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# appcmd output as one string; never throws. Windows PowerShell 5.1 turns a
# native command's stderr into a terminating error under
# $ErrorActionPreference = 'Stop', so these helpers relax it locally.
function Get-AppCmdOutput {
  $ErrorActionPreference = 'Continue'
  return ((& $appcmd @args 2>&1) | Out-String)
}

# appcmd that must succeed; it reports failure only through the exit code.
function Invoke-AppCmd {
  $ErrorActionPreference = 'Continue'
  $out = (& $appcmd @args 2>&1) | Out-String
  if ($LASTEXITCODE -ne 0) { throw "appcmd $($args -join ' ') failed (exit $LASTEXITCODE): $out" }
}

function Test-SiteExists { return ((Get-AppCmdOutput list site "/name:$SiteName") -match '(?m)^SITE ') }
function Test-PoolExists { return ((Get-AppCmdOutput list apppool "/name:$SiteName") -match '(?m)^APPPOOL ') }

# ---------------------------------------------------------------- checks

# Status and headers of one request. Redirects are not followed and nothing is
# decompressed, so Content-Encoding shows what IIS actually sent.
function Get-Head([string]$path, [switch]$Gzip) {
  $request = [Net.HttpWebRequest]::Create($Url.TrimEnd('/') + $path)
  $request.AllowAutoRedirect = $false
  $request.Timeout = 15000
  if ($Gzip) { $request.Headers.Add('Accept-Encoding', 'gzip') }
  try { $response = $request.GetResponse() }
  catch {
    # A 4xx/5xx arrives as a WebException (wrapped by PowerShell) that still
    # carries the response; no response at all means nothing answered.
    $ex = $_.Exception
    if ($ex -is [Management.Automation.MethodInvocationException] -and $ex.InnerException) { $ex = $ex.InnerException }
    $response = $null
    if ($ex -is [Net.WebException]) { $response = $ex.Response }
    if (-not $response) { return [pscustomobject]@{ Status = 0; Type = ''; Cache = ''; Encoding = ''; NoSniff = ''; Error = $ex.Message } }
  }
  $head = [pscustomobject]@{
    Status   = [int]$response.StatusCode
    Type     = (($response.ContentType -split ';')[0]).Trim()
    Cache    = [string]$response.Headers['Cache-Control']
    Encoding = [string]$response.Headers['Content-Encoding']
    NoSniff  = [string]$response.Headers['X-Content-Type-Options']
    Error    = ''
  }
  $response.Close()
  return $head
}

function Invoke-Checks {
  Write-Step "Checking $Url"

  $first = Get-Head '/'
  if ($first.Status -eq 0) { Stop-WithError "Nothing answered at $Url ($($first.Error))" }

  $client = New-Object Net.WebClient
  $client.Encoding = [Text.Encoding]::UTF8
  $index    = $client.DownloadString($Url)
  $jsAsset  = [regex]::Match($index, '/assets/[^"]+\.js').Value
  $cssAsset = [regex]::Match($index, '/assets/[^"]+\.css').Value
  $font   = Get-ChildItem (Join-Path $buildDir 'vendor') -Recurse -Filter *.woff2 -ErrorAction SilentlyContinue | Select-Object -First 1
  $fontPath = ''
  if ($font) { $fontPath = '/' + $font.FullName.Substring($buildDir.Length + 1).Replace('\', '/') }

  # Status, content type (prefix match) and a Cache-Control fragment, where they matter.
  $checks = @(
    @{ Name = 'Home page, never cached';                  Path = '/';                                  Status = 200; Type = 'text/html';              Cache = 'no-cache' },
    @{ Name = 'config.js, never cached';                  Path = '/config.js';                         Status = 200; Type = 'application/javascript'; Cache = 'no-cache' },
    @{ Name = 'Deep link falls back to the app';          Path = '/page/Tools/v_csm_log_web/';         Status = 200; Type = 'text/html';              Cache = 'no-cache' },
    @{ Name = 'Login route';                               Path = '/page/authentication/login/';        Status = 200; Type = 'text/html' },
    @{ Name = 'Build script, cached for a year';          Path = $jsAsset;                             Status = 200; Type = 'application/javascript'; Cache = 'immutable' },
    @{ Name = 'Build stylesheet, cached for a year';      Path = $cssAsset;                            Status = 200; Type = 'text/css';               Cache = 'immutable' },
    @{ Name = 'jQuery (vendor)';                           Path = '/vendor/Content/Library/bower_components/jquery/dist/jquery.min.js'; Status = 200; Type = 'application/javascript' },
    @{ Name = 'xtools.js (vendor)';                        Path = '/vendor/Scripts/Others/Service/xtools.js'; Status = 200; Type = 'application/javascript' },
    @{ Name = 'Stylesheet (vendor)';                       Path = '/vendor/Content/Font/Sarabun/Sarabun.css'; Status = 200; Type = 'text/css' },
    @{ Name = 'Web font';                                  Path = $fontPath;                            Status = 200; Type = 'font/woff2' },
    @{ Name = 'globals-bridge.js';                         Path = '/globals-bridge.js';                 Status = 200; Type = 'application/javascript' },
    @{ Name = 'Document store data';                       Path = '/data/log_web.json';                 Status = 200; Type = 'application/json' },
    @{ Name = 'Thai address database';                     Path = '/thai-address-db.json';              Status = 200; Type = 'application/json' },
    @{ Name = 'Missing data file falls back to the app';  Path = '/data/no_such_collection.json';      Status = 200; Type = 'text/html' },
    @{ Name = '/service/ is left for the backend';         Path = '/service/api/public/LanguageSelector'; Status = 404 },
    @{ Name = '/api/ is left for the backend';             Path = '/api/anything';                      Status = 404 },
    @{ Name = 'web.config is not downloadable';            Path = '/web.config';                        Status = 404 }
  )

  $failed = 0
  foreach ($c in $checks) {
    if (-not $c.Path) { Write-Host ("   FAIL  {0}: path not found in the build" -f $c.Name) -ForegroundColor Red; $failed++; continue }
    $h = Get-Head $c.Path
    $problems = @()
    if ($h.Status -ne $c.Status) { $problems += "status $($h.Status), expected $($c.Status)" }
    if ($c.Type -and -not $h.Type.StartsWith($c.Type)) { $problems += "type '$($h.Type)', expected '$($c.Type)'" }
    if ($c.Cache -and $h.Cache -notmatch [regex]::Escape($c.Cache)) { $problems += "Cache-Control '$($h.Cache)', expected '$($c.Cache)'" }
    if ($h.Status -eq 200 -and $h.NoSniff -ne 'nosniff') { $problems += 'no X-Content-Type-Options: nosniff' }
    $detail = "{0} {1}" -f $h.Status, $h.Type
    if ($problems.Count -eq 0) {
      Write-Host ("   PASS  {0,-42} {1}" -f $c.Name, $detail) -ForegroundColor Green
    } else {
      Write-Host ("   FAIL  {0,-42} {1}  ({2})" -f $c.Name, $detail, ($problems -join '; ')) -ForegroundColor Red
      $failed++
    }
  }

  # Compression is a performance matter, not a correctness one: reported, never failed.
  Write-Step 'Compression (information only)'
  foreach ($p in @('/vendor/Content/Library/bower_components/jquery/dist/jquery.min.js', '/thai-address-db.json')) {
    $h = Get-Head $p -Gzip
    if ($h.Encoding -eq 'gzip') { Write-Note "gzip       $p" }
    else { Write-Warn "not gzipped  $p" }
  }
  Write-Note 'IIS compresses only the MIME types listed in its server-level httpCompression'
  Write-Note 'section, which does not include application/json by default, and only when the'
  Write-Note '"Static Content Compression" feature is installed. Both are server settings.'

  $config = $client.DownloadString($Url + 'config.js')
  $dataServerLine = [string]($config -split "`n" | Where-Object { $_ -match 'window\.dataServer =' } | Select-Object -First 1)
  Write-Step 'Backend'
  Write-Note ("config.js: " + $dataServerLine.Trim())
  Write-Note 'Sign-in needs the backend. If it is on another host or port, its'
  Write-Note "cors_allowed_origins must include this site's origin, or every page shows a 500."

  Write-Host ''
  if ($failed -eq 0) { Write-Host "All $($checks.Count) checks passed." -ForegroundColor Green }
  else { Write-Host "$failed of $($checks.Count) checks failed." -ForegroundColor Red }
  return $failed
}

# ---------------------------------------------------------------- test only

if ($TestOnly) {
  $failed = Invoke-Checks
  try { Stop-Transcript | Out-Null } catch { }
  if ($failed -gt 0) { exit 1 } else { exit 0 }
}

# ---------------------------------------------------------------- preflight

Write-Step 'Preflight'
if (-not (Test-Admin)) { Stop-WithError 'Run this from PowerShell opened with "Run as administrator" (or use -TestOnly).' }
if (-not (Test-Path $appcmd)) { Stop-WithError "IIS is not installed ($appcmd not found)." }
$w3svc = Get-Service W3SVC -ErrorAction SilentlyContinue
if (-not $w3svc) { Stop-WithError 'The IIS service (W3SVC) is not installed.' }
if ($w3svc.Status -ne 'Running') { Stop-WithError "The IIS service (W3SVC) is $($w3svc.Status). Start it first: Start-Service W3SVC" }
Write-Note 'Administrator, IIS installed and running'

# ---------------------------------------------------------------- remove

if ($Remove) {
  Write-Step "Removing $SiteName"
  if (Test-SiteExists) { Invoke-AppCmd delete site "$SiteName"; Write-Note "deleted site $SiteName" }
  else { Write-Note "no site named $SiteName" }
  if (Test-PoolExists) { Invoke-AppCmd delete apppool "$SiteName"; Write-Note "deleted application pool $SiteName" }
  else { Write-Note "no application pool named $SiteName" }
  if (Test-Path $SitePath) {
    if (Test-Path (Join-Path $SitePath $marker)) { Remove-Item $SitePath -Recurse -Force; Write-Note "deleted $SitePath" }
    else { Write-Warn "$SitePath was not created by this script; left in place." }
  }
  Write-Host ''
  Write-Host 'Removed.' -ForegroundColor Green
  try { Stop-Transcript | Out-Null } catch { }
  exit 0
}

# ---------------------------------------------------------------- install

if (-not (Test-Path (Join-Path $inetsrv 'rewrite.dll'))) {
  Stop-WithError 'The IIS URL Rewrite module is not installed; web.config needs it for deep links. https://www.iis.net/downloads/microsoft/url-rewrite'
}
Write-Note 'URL Rewrite module installed'
if (-not (Test-Path (Join-Path $inetsrv 'compstat.dll'))) { Write-Warn 'Static Content Compression is not installed; files will be sent uncompressed.' }

if (-not (Test-Path (Join-Path $buildDir 'index.html')) -or
    -not (Test-Path (Join-Path $buildDir 'vendor\Content\Library\bower_components\jquery\dist\jquery.min.js'))) {
  Stop-WithError "No complete build in $buildDir. In a normal terminal, from frontend\: npm run sync:vendor, then npm run generate."
}
Write-Note ("build: $buildDir (" + (Get-Item (Join-Path $buildDir 'index.html')).LastWriteTime + ')')

if ($DataServer -and $DataServer -notmatch '^[A-Za-z0-9._~:/%+=@-]+$') {
  Stop-WithError "DataServer contains characters not allowed in a URL here: $DataServer"
}

$siteExists = Test-SiteExists
if (-not $siteExists) {
  # A port can be taken by another program or reserved by another IIS site that is stopped.
  if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
    Stop-WithError "Port $Port is already in use. Pick another with -Port."
  }
  if ((Get-AppCmdOutput list site /text:bindings) -match ":${Port}:") {
    Stop-WithError "Another IIS site is bound to port $Port. Pick another with -Port."
  }
}

if ((Test-Path $SitePath) -and (Get-ChildItem $SitePath -Force | Select-Object -First 1) -and
    -not (Test-Path (Join-Path $SitePath $marker))) {
  Stop-WithError "$SitePath already exists and was not created by this script. Pick another with -SitePath."
}

Write-Step "Copying the build to $SitePath"
New-Item -ItemType Directory -Force -Path $SitePath | Out-Null
# /MIR keeps the folder an exact copy of the build; the marker is excluded so it survives.
robocopy $buildDir $SitePath /MIR /XF $marker web.config /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { Stop-WithError "robocopy failed (exit $LASTEXITCODE)." }
Copy-Item $webConfig (Join-Path $SitePath 'web.config') -Force
Set-Content -Path (Join-Path $SitePath $marker) -Value 'Created by frontend\deploy\iis\Test-IisDeploy.ps1' -Encoding ASCII
Write-Note ('{0} files' -f (Get-ChildItem $SitePath -Recurse -File | Measure-Object).Count)

if ($DataServer) {
  $configPath = Join-Path $SitePath 'config.js'
  $text = [IO.File]::ReadAllText($configPath)
  $pattern = '(?m)^([ \t]*)window\.dataServer = [^\r\n]*'
  if ($text -notmatch $pattern) { Stop-WithError "No 'window.dataServer = ' line in $configPath." }
  $text = [regex]::Replace($text, $pattern, "`$1window.dataServer = new URL('$DataServer', origin).href")
  [IO.File]::WriteAllText($configPath, $text, (New-Object Text.UTF8Encoding($false)))
  Write-Note "config.js: window.dataServer = new URL('$DataServer', origin).href"
}

# The anonymous user (IUSR) and the pool identity are both members of IIS_IUSRS.
icacls $SitePath /grant 'IIS_IUSRS:(OI)(CI)RX' /Q | Out-Null
if ($LASTEXITCODE -ne 0) { Stop-WithError "icacls failed (exit $LASTEXITCODE)." }

Write-Step "Configuring IIS"
if (-not (Test-PoolExists)) {
  # An empty managedRuntimeVersion is "No Managed Code": the site is static files only.
  Invoke-AppCmd add apppool "/name:$SiteName" '/managedRuntimeVersion:' '/managedPipelineMode:Integrated'
  Write-Note "created application pool $SiteName (No Managed Code)"
}
$runtime = (Get-AppCmdOutput list apppool "/name:$SiteName" /text:managedRuntimeVersion).Trim()
if ($runtime) { Write-Warn "application pool runtime is '$runtime', expected No Managed Code" }

if (-not $siteExists) {
  Invoke-AppCmd add site "/name:$SiteName" "/bindings:http/*:${Port}:" "/physicalPath:$SitePath"
  Write-Note "created site $SiteName on port $Port"
} else {
  Invoke-AppCmd set vdir "$SiteName/" "/physicalPath:$SitePath"
  Write-Note "site $SiteName already existed; files refreshed"
}
Invoke-AppCmd set app "$SiteName/" "/applicationPool:$SiteName"

# "Already started" is not an error here.
Get-AppCmdOutput start site "/site.name:$SiteName" | Out-Null
Get-AppCmdOutput recycle apppool "/apppool.name:$SiteName" | Out-Null

$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  if ((Get-Head '/').Status -gt 0) { $ready = $true; break }
  Start-Sleep -Milliseconds 500
}
if (-not $ready) { Stop-WithError "The site did not answer at $Url." }
Write-Note "site answering at $Url"

$failed = Invoke-Checks

Write-Host ''
Write-Host "Open $Url in a browser. Remove everything with:"
Write-Host '   powershell -ExecutionPolicy Bypass -File frontend\deploy\iis\Test-IisDeploy.ps1 -Remove'
Write-Host "Log: $log"
try { Stop-Transcript | Out-Null } catch { }
if ($failed -gt 0) { exit 1 } else { exit 0 }
