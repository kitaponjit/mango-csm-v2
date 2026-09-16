/* Promotes the vendor scripts' globals onto `window`.

   The vendor scripts declare these with `const` / `let`, which land in the
   global *lexical* environment: reachable as a bare identifier, but never as
   `window.X`. Page/Default.aspx promoted them explicitly once the scripts had
   loaded (`window.$xt = $xt`, ... - lines 188-201).

   The Nuxt port copied the early placeholder assignments into config.js but not
   that promotion step, so `window.$xt`, `window.$msg`, `window.Pagination` and
   the code-data objects were left undefined - and components reaching for them
   through `window` threw.

   `window.signalR` is deliberately NOT promoted here: the realtime layer moved
   off the SignalR 2.x vendor stack to `plugins/signalr.client.js`, which speaks
   ASP.NET Core SignalR and assigns `window.signalR` itself.

   This file must stay a classic script (not a module) so the lexical bindings
   are visible, and must load after every vendor script. */
(function () {
  // Each binding needs its own try/catch: referencing a lexical name that was
  // never declared throws ReferenceError rather than yielding undefined.
  try { window.$linq = $linq } catch (e) { /* not loaded */ }
  try { window.$ = $ } catch (e) { /* not loaded */ }
  try { window.$xt = $xt } catch (e) { /* not loaded */ }
  try { window.$notify = $notify } catch (e) { /* not loaded */ }
  try { window.$msg = $msg } catch (e) { /* not loaded */ }
  try { window.queryString = $xt.queryString } catch (e) { /* not loaded */ }
  try { window.Pagination = Pagination } catch (e) { /* not loaded */ }
  try { window.platformCodeData = platformCodeData } catch (e) { /* not loaded */ }
  try { window.moduleCodeData = moduleCodeData } catch (e) { /* not loaded */ }
  try { window.statusCode = statusCode } catch (e) { /* not loaded */ }
  try { window.statusCodeData = statusCodeData } catch (e) { /* not loaded */ }
})()
