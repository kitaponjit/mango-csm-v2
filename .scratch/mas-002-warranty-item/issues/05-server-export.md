# 05 — Server-generated Warranty Item export

**What to build:** An authorized user can download the full tenant Warranty Item catalog using the server export endpoint and existing shared file capability, with honest error handling for token, popup, and download failures.

**Blocked by:** 01 — Shell, access, and server-paged Warranty Item catalog

**Status:** ready-for-agent

- [ ] RED tests cover export request, token handling, access guard, popup/download failure, and false-success prevention before implementation.
- [ ] Export calls the verified server export endpoint and does not use the currently loaded page or client pagination to build the file.
- [ ] A valid server token is passed to the existing shared file capability with the download flag.
- [ ] Missing tokens, blocked popups, and download failures show an error and never show a false success message.
- [ ] The deferred legacy client-side export fallback, including `XLSX.writeFile`, is not added.
- [ ] Unauthorized/read-only users cannot trigger the protected export action.
- [ ] No backend, shared-infrastructure, or legacy-page change is made.
- [ ] Focused service and page tests plus relevant regression tests pass.
