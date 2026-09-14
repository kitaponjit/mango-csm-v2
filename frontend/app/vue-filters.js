let formatNumberFilter = function (x, n) {
  return $xt.formatNumber(x, n);
}
let formatDateFilter = function (d, f) {
  return $xt.formatDate(d, f);
}

export { formatNumberFilter, formatDateFilter }
