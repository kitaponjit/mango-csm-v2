import * as SignalR from '@microsoft/signalr'

/*
 * Realtime layer, ported from ASP.NET SignalR 2.x to ASP.NET Core SignalR.
 *
 * The backend (MangoServiceNetCore) maps a single hub at `<dataServer>signalr`
 * and speaks the Core protocol, which the bundled jquery.signalR-2.3.0.js
 * client cannot talk to — it also needs the generated `/SignalR/Hubs` proxy
 * script that Core does not serve. That whole vendor stack
 * (jquery.signalR, signalr-patch, iwc-all, iwc-signalr, MangoSignalR) is
 * therefore no longer loaded; this plugin replaces it.
 *
 * The public contract is unchanged, so no call site needed editing:
 *
 *   const xR = window.signalR(clientMethods, onStartedCallback)
 *   xR.reHub.server.sendNewComment(payload)   // camelCase server methods
 *   xR.hubProxy.isConnectionOwner()
 *
 * Two deliberate differences from the 2.x stack, both noted in MIGRATION.md:
 *  - The old IWC layer shared ONE connection across browser tabs and elected an
 *    owner. Core SignalR connections are cheap, so each tab now holds its own
 *    and `isConnectionOwner()` is true in every tab. The only consequence is
 *    that the 60-second `userOnlineCheck` runs per tab rather than once.
 *  - `userid` is sent on the query string when the session provides it. The hub
 *    reads it for presence (`UserOnline`/`UserOffline`); the 2.x frontend never
 *    sent it, so that tracking never actually worked.
 */

let connection = null
let startPromise = null
// Several screens call window.signalR() independently, each registering its own
// client methods, so handlers accumulate rather than replace.
const handlers = new Map()
const connectedCallbacks = []
// Server calls made before the connection is live are queued and flushed on
// connect — signalr-patch.js did the same thing for the 2.x client.
const queued = []
let isConnected = false

const defaultClientMethods = {
  displayMsg(msg) { console.log('Server message:', msg) },
  welcomeMessage(text) { console.log('SignalR Welcome:', text) },
  logout() { if (window.baseUrl) window.location = window.baseUrl },
  displaySessionOn() { /* user-online counter; screens override as needed */ }
}

function hubUrl() {
  const base = String(window.dataServer || '/').replace(/\/+$/, '') + '/'
  const qs = new URLSearchParams()
  // The hub reads these in OnConnectedAsync for group membership and presence.
  const userid = window.auth && (window.auth.empno ?? window.auth.userid)
  if (userid !== undefined && userid !== null && userid !== '') qs.set('userid', String(userid))
  const q = qs.toString()
  return base + 'signalr' + (q ? `?${q}` : '')
}

function attach(name, fn) {
  if (typeof fn !== 'function') return
  if (!handlers.has(name)) {
    handlers.set(name, new Set())
    // The JS client lowercases method names internally, so casing differences
    // between the hub's SendAsync name and the call site do not matter.
    connection.on(name, (...args) => {
      for (const h of handlers.get(name)) {
        try { h(...args) } catch (err) { console.error(`[SignalR] handler "${name}" failed`, err) }
      }
    })
  }
  handlers.get(name).add(fn)
}

function ensureConnection() {
  if (connection) return connection

  connection = new SignalR.HubConnectionBuilder()
    .withUrl(hubUrl(), {
      // Auth travels as a header on API calls, but SignalR's WebSocket handshake
      // cannot set custom headers; the hub identifies the caller from the token
      // passed to JoinUserChannel/UserOnlineCheck instead.
      withCredentials: false
    })
    .withAutomaticReconnect([0, 2000, 10000, 30000])
    .configureLogging(SignalR.LogLevel.Warning)
    .build()

  for (const [name, fn] of Object.entries(defaultClientMethods)) attach(name, fn)

  connection.onreconnected(() => { isConnected = true; flush(); fire() })
  connection.onreconnecting(() => { isConnected = false })
  connection.onclose(() => {
    isConnected = false
    // Clear the memoised promise, otherwise start() would hand back the
    // already-resolved one and never dial again after an explicit stop or a
    // reconnect that gave up — leaving queued calls stranded.
    startPromise = null
  })

  return connection
}

function flush() {
  while (queued.length) {
    const { method, args } = queued.shift()
    connection.invoke(method, ...args)
      .catch(err => console.error(`[SignalR] ${method} failed`, err))
  }
}

function fire() {
  for (const cb of connectedCallbacks.splice(0)) {
    try { cb() } catch (err) { console.error('[SignalR] onStarted callback failed', err) }
  }
}

function start() {
  if (startPromise) return startPromise
  startPromise = ensureConnection().start()
    .then(() => { isConnected = true; flush(); fire() })
    .catch(err => {
      console.warn('[SignalR] could not connect — realtime is unavailable.', err)
      startPromise = null
    })
  return startPromise
}

// `reHub.server.<camelCaseMethod>(...)` → invoke the hub's PascalCase method.
// Core SignalR matches hub methods case-insensitively, but the first letter is
// upper-cased anyway so the wire name matches the C# declaration exactly.
const server = new Proxy({}, {
  get(_t, prop) {
    if (typeof prop !== 'string') return undefined
    const method = prop.charAt(0).toUpperCase() + prop.slice(1)
    return (...args) => {
      ensureConnection()
      if (!isConnected) {
        queued.push({ method, args })
        start()
        return Promise.resolve()
      }
      return connection.invoke(method, ...args)
        .catch(err => console.error(`[SignalR] ${method} failed`, err))
    }
  }
})

const hubProxy = {
  // One connection per tab now, so every tab owns its own.
  isConnectionOwner: () => true,
  // 2.x state codes; only 4 (disconnected) was ever compared against.
  getState() {
    switch (connection && connection.state) {
      case SignalR.HubConnectionState.Connected: return 1
      case SignalR.HubConnectionState.Connecting: return 0
      case SignalR.HubConnectionState.Reconnecting: return 2
      default: return 4
    }
  },
  start,
  stop: () => (connection ? connection.stop() : Promise.resolve()),
  on(event, fn) {
    if (event === 'connected') {
      if (isConnected) { try { fn() } catch (e) { console.error(e) } }
      else connectedCallbacks.push(fn)
    } else if (event === 'disconnected' && connection) {
      connection.onclose(fn)
    }
  }
}

function mangoSignalR(clientMethods, onStartedCallback) {
  ensureConnection()
  for (const [name, fn] of Object.entries(clientMethods || {})) attach(name, fn)

  if (onStartedCallback) {
    if (isConnected) {
      try { onStartedCallback() } catch (err) { console.error('[SignalR] onStarted callback failed', err) }
    } else {
      connectedCallbacks.push(onStartedCallback)
    }
  }

  start()
  return { reHub: { server }, hubProxy }
}

export default defineNuxtPlugin(() => {
  window.signalR = mangoSignalR
})
