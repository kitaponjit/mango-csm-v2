#!/bin/sh
# Points window.dataServer in config.js at $DATA_SERVER, at container start.
#
# DATA_SERVER is either a path on this origin (/service/, to use nginx's proxy)
# or a full URL (http://api.example:5075/service/). It is resolved in the
# browser against window.location.origin, so a path follows whatever host and
# port the page was opened on. printServer and hostServer derive from
# dataServer in config.js and follow it.
#
# Unset or empty: config.js is left exactly as built. A mounted config.js (or a
# mounted html folder) is also left alone: mounting a file is the other way to
# configure, and editing it would change the file on the host.
set -eu

[ -n "${DATA_SERVER:-}" ] || exit 0

config=/usr/share/nginx/html/config.js
me=$(basename "$0")

case "$DATA_SERVER" in
  *[!A-Za-z0-9._~:/%+=@-]*)
    echo "$me: DATA_SERVER contains characters not allowed in a URL here: $DATA_SERVER" >&2
    exit 1 ;;
esac

if ! grep -q "^ *window\.dataServer = " "$config"; then
  echo "$me: no 'window.dataServer = ' line in $config; left unchanged" >&2
  exit 0
fi

# `test -w` cannot detect this: it is always true for root, even on a read-only
# mount, and `sed -i` then fails with "Resource busy" and stops the container.
# Field 5 of mountinfo is the mount point.
if awk -v f="$config" -v d="${config%/*}" '$5 == f || $5 == d { found = 1 } END { exit !found }' /proc/self/mountinfo; then
  echo "$me: $config is mounted; DATA_SERVER ignored" >&2
  exit 0
fi

sed -i "s|^\( *\)window\.dataServer = .*|\1window.dataServer = new URL('$DATA_SERVER', origin).href|" "$config"
echo "$me: window.dataServer = new URL('$DATA_SERVER', origin).href"
