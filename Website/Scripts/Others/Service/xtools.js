const axioscustom = axios.create();
axioscustom.defaults.baseURL = window.baseURL;
axioscustom.defaults.headers.post['X-Post-Back-Token'] = $('base').first().attr('postback') || '';
//axioscustom.defaults.headers.common['X-Mango-Auth'] = localStorage.getItem('mango_auth') || '';

const axioscustom2 = axios.create();
axioscustom2.defaults.headers.common['X-Mango-Auth'] = localStorage.getItem('mango_auth') || '';
axioscustom2.defaults.baseURL = window.dataServer;

const axioscustom3 = axios.create();
axioscustom3.defaults.headers.common['X-Customer-Auth'] = localStorage.getItem('customer_auth') || '';
axioscustom3.defaults.baseURL = window.dataServer;

const axiosLog = axios.create();
axiosLog.defaults.headers.common['X-Mango-Auth'] = localStorage.getItem('mango_auth') || '';
axiosLog.defaults.baseURL = "http://localhost:5091/";

const $queryString = (a => {
  if (a == '') return {};
  let b = {};
  for (let i = 0; i < a.length; ++i) {
    let p = a[i].split('=', 2);
    b[p[0]] = (p.length == 1) ? '' : decodeURIComponent(p[1].replace(/\+/g, ' '));
  }
  return b;
})(window.location.search.substr(1).split('&'));
const $_cookies = {
  set: function (cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  },
  get: function (cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
}

const $xtools = {
  isEmpty: function (x) {
    return x === undefined || x === null || x === '';
  },
  isObjectEmpty(x) {
    return Object.keys(x).length === 0;
  },
  int(x) {
    return isNaN(parseInt(x)) ? 0 : parseInt(x);
  },
  dec(x, n) {
    if (isNaN(parseFloat(x))) return 0;
    n = isNaN(parseInt(n)) ? 6 : parseInt(n);
    let dc = new Decimal(x).toDP(n).toNumber();
    return dc;
  },
  async getLocal(url) {
    let error = null;
    let resp = await axioscustom.get(url);
    //console.log(resp)
    return resp.data;
  },
  replaceZeroStart(number, digit = 2) {
    return String(number).padStart(digit, '0')
  },
  async postLocalJson(url, data) {
    let error = null;
    let resp = null;
    resp = await axioscustom.post(url, data);
    //console.log(resp)
    return resp.data;
  },
  async postLocalForm(url, formdata) {
    let error = null;
    let resp = null;
    resp = await axioscustom.post(url, formdata, { headers: { 'Content-Type': 'multipart/form-data' } });
    //console.log(resp)
    return resp.data;
  },
  async getServer(url) {
    let error = null;
    let resp = await axioscustom2.get(url);
    //console.log(resp)
    return resp.data;
  },
  async getCustomerServer(url) {
    let error = null;
    let resp = await axioscustom3.get(url);
    //console.log(resp)
    return resp.data;
  },
  async postServerJson(url, data) {
    let error = null;
    let resp = null;
    resp = await axioscustom2.post(url, data);
    return resp.data;
  },
  async postCustomerJson(url, data) {
    let error = null;
    let resp = null;
    resp = await axioscustom3.post(url, data);
    //console.log(resp)
    return resp.data;
  },
  async postServerForm(url, formdata) {
    let error = null;
    let resp = null;
    resp = await axioscustom2.post(url, formdata, { headers: { 'Content-Type': 'multipart/form-data' } });
    //console.log(resp)
    return resp.data;
  },
  async postCustomerForm(url, formdata) {
    let error = null;
    let resp = null;
    resp = await axioscustom3.post(url, formdata, { headers: { 'Content-Type': 'multipart/form-data' } });
    //console.log(resp)
    return resp.data;
  },
  isSeleted(data, index) {
    let c = Object.assign([], data);
    let idx = 0;
    $linq(c).foreach(x => {
      x.checked = index === idx;
      idx++;
    });
  },
  showResult(d, success_text, minimize) {
    if (d.success) {
      if (!$xtools.isEmpty(success_text)) {
        if (minimize) {
          $notify.success(success_text);
        }
        else {
          $alert('', success_text, 'success');
        }
      }
    } else {
      throw d.error;
    }
  },
  showError(err, ui) {
    let msg = err.toString();
    if ($xt.strStartWith(msg, '[ui_code]')) {
      msg = ui[msg.split(':')[1]] || msg;
    }

    $alert('', msg, 'danger');
  },
  strStartWith(str, strCompare) {
    str = str || '';
    str = str.toLowerCase();

    strCompare = strCompare || '';
    strCompare = strCompare.toLowerCase();

    return str.indexOf(strCompare) === 0;
  },
  strContains(str, strCompare) {
    str = str || '';
    str = str.toLowerCase();

    strCompare = strCompare || '';
    strCompare = strCompare.toLowerCase();

    return str.indexOf(strCompare) > -1;
  },
  checkEmpty(obj, props) {
    return $linq(props).any(x => $xtools.isEmpty(obj[x]));
  },
  formatNumber(x, n) {
    try {
      if ($xtools.isEmpty(x) || isNaN(parseFloat(x) || new Decimal(x).isNaN())) { return ''; }
      n = $xtools.isEmpty(n) || isNaN(parseInt(n)) ? 0 : parseInt(n);
      let nString = new Decimal(x).toDP(n).toString();
      let sp = nString.split('.');
      let fm = parseInt(sp[0]).toLocaleString('en-US');
      if (sp.length > 1) {
        fm = fm + '.' + sp[1].toString();
      }

      return fm
    } catch (err) {
      return ''
    }
  },
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  formatDate(d, f) {
    if ($xt.isEmpty(d) || !moment(d).isValid()) { return ''; }
    f = $xt.isEmpty(f) ? 'DD/MM/YYYY' : f;
    return moment(d).format(f);
  },
  textLength(text, max) {
    return `${(text || '').length} / ${max || 0}`;
  },
  async findSelectFormPrint(module, docno, groupcode_arr, params = {}, path = false, maincode) {
    try {
      let url = `Anywhere/Center/SelectDocumentFormReadList`
      let { data, total, config_ar_not_copy } = await $xt.postServerJson(url, { groupcode: groupcode_arr })
      let config_not_copy = 'N'
      let option_list = ''
      if (data.length > 0) {
        for (var x of data) {
          option_list += `<option value='${x.doccode}'>(${x.doccode}) ${x.docname}</option>`
        }
      }
      else {
        return
      }

      let ls_path = []
      return new Promise((resolve) => {
        $.confirm({
          title: `<i class='fas fa-print'></i> Select Form Document`,
          content: `<select class='form-control input-sm' id='doccode'>
                    ${option_list}
                    </select>
                    `,
          theme: 'material',
          animation: 'opacity',
          closeAnimation: 'opacity',
          animateFromElement: false,
          closeIcon: function () {
            if (path) {
              resolve(null)
            }
            else {
              resolve(true)
            }
          },
          buttons: {
            submit: {
              text: 'Print Document',
              btnClass: 'btn-dropbox',
              action: async () => {
                let ls_doccode = $('#doccode').val()
                let docgroup = $linq(data).where(w => w.doccode == ls_doccode).select(s => s.groupcode).firstOrDefault()
                if (path) {
                  if (params.cc_trn == 'SELECT_FORM') {
                    let item_docno = 1
                    for (var item of params.docno_list) {
                      let reprint_ic = await $xtools.printServerPath(module, ls_doccode, item.docno, docgroup, { st_original_copy: 'Y' }, maincode)
                      ls_path.push(reprint_ic.path)
                      if (window.page) {
                        page.loadingBox.setText(`ระบบกำลังสร้างเอกสาร ${item_docno}/${params.docno_list.length} กรุณารอสักครู่`)
                        item_docno++
                      }
                    }
                  }
                  else if (params.cc_trn == 'csm_print_task') {
                    for (var xtem of params.cc_doc) {
                      let csmtask = await $xtools.printServerPath(module, ls_doccode, docno, docgroup, { itemno: xtem }, maincode)
                      ls_path.push(csmtask.path)
                    }
                  }
                  else if (params.cc_trn == 'csm_print_customer') {
                    let csmtask = await $xtools.printServerPath(module, ls_doccode, docno, docgroup, { cust_code: params.cust_code }, maincode)
                    ls_path.push(csmtask.path)
                  }
                  else {
                    let inv_oth = await $xtools.printServerPath(module, ls_doccode, docno, docgroup, { st_original_copy: 'Y' }, maincode)
                    ls_path.push(inv_oth.path)

                    if (config_not_copy == 'N') {
                      inv_oth = await $xtools.printServerPath(module, ls_doccode, docno, docgroup, { st_original_copy: 'N' }, maincode)
                      ls_path.push(inv_oth.path)
                    }
                  }

                  await $xtools.mergeDocumentPath(ls_path)
                  resolve(null)
                }
                else {
                  await $xtools.printServiceParams(module, ls_doccode, docno, docgroup, params)
                  resolve(true)
                }
              }
            }
          },
        })
      })
    }
    catch (ex) {
      $msg.alert('System Error', ex, 'danger')
    }
  },
  printServiceParams(module, doccode, docno, docgroup, params = {}) {
    let token = localStorage.getItem('mango_auth') || ''
    let url = `${window.printServer}?token=${token}&module=${module}&doccode=${encodeURIComponent(doccode)}&docno=${encodeURIComponent(docno || '')}&groupcode=${encodeURIComponent(docgroup || '')}&new_program=Y`
    if (!$xt.isObjectEmpty(params)) {
      for (var key in params) {
        url += `&${key}=${params[key]}`
      }
    }
    window.open(url, '_blank')
    //$xt.popupCenter({ url: url, title: 'Print Form', w: 1024, h: 768 })
  },
  async printServerPath(module, doccode, docno, docgroup, params = {}, maincode = '') {
    try {
      let local_token = localStorage.getItem('mango_auth')
      // console.log('local_token', local_token)
      let token = (!$xt.isEmpty(maincode) || $xt.isEmpty(local_token)) ? 'FAKE' : local_token

      let url = `${window.printServer}?token=${token}&module=${module}&doccode=${encodeURIComponent(doccode)}&docno=${encodeURIComponent(docno)}&groupcode=${encodeURIComponent(docgroup)}&return_type=path&new_program=Y&maincode=${encodeURIComponent(maincode || '')}`

      if (!$xt.isObjectEmpty(params)) {
        for (var key in params) {
          url += `&${key}=${encodeURIComponent(params[key])}`
        }
      }

      let resp = await $xt.getServer(url)
      return resp
    }
    catch (ex) {
      $msg.alert('System Error', ex, 'danger')
    }
  },
  async mergeDocumentPath(path = []) {
    try {
      if (path.length > 0) {
        let url = `PrintApi/Document/MergeDocumentWithPath`
        let resp = await $xt.postServerJson(url, { path: path })
        if (!resp.success) {
          throw resp.error
          return
        }
        let fileTarget = window.hostServer + 'Api/File/DownLoad?id=' + resp.id
        window.open(fileTarget, '_blank')
        //$xt.popupCenter({ url: fileTarget, title: 'Print Form', w: 1024, h: 768 })
      }
    }
    catch (ex) {
      $msg.alert('System Error', ex.toString(), 'danger')
    }
  },
  export_excel_json(filename, json) {
    try {
      let Excel = require('exceljs')
      let workbook = new Excel.Workbook()
      let worksheet = workbook.addWorksheet('Export Sheet', {
        views: [
          { state: 'frozen', ySplit: 1 }
        ]
      })

      let headers = []
      for (var key in json[0]) {
        let header = {
          header: key,
          key: key
        }
        headers.push(header)
      }
      worksheet.columns = headers

      for (var rows of json) {
        worksheet.addRow(rows)
      }

      workbook.xlsx.writeBuffer({
        base64: true
      })
        .then(function (xls64) {
          var a = document.createElement('a')
          var data = new Blob([xls64], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

          var url = URL.createObjectURL(data)
          a.href = url
          a.download = `Export ${filename}.xlsx`
          document.body.appendChild(a)
          a.click()

          setTimeout(function () {
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
          }, 0)
        })
        .catch(function (error) {
          console.log(error.message)
        })
    }
    catch (ex) {
      $msg.alert('System Error', ex, 'danger')
      console.error(ex)
    }
  },
  async downloadTemplateExcel(file_template) {
    let act = `csm/master/DownloadTemplateExcel?filename=${encodeURIComponent(file_template) || ''}`
    let resp = await $xt.getServer(act)
    window.open(window.dataServer + `API/File/DownLoad?download=true&id=${resp.path}`)
  },
  async export_rawdata_excel(data, filename, file_cache = '', protected_field = false, allow_column = [], fitcolumns = false) {
    try {
      let f = {
        data: data,
        raw_name: filename,
        file_cache: file_cache,
        protected_field: protected_field,
        allow_column: allow_column,
        fitcolumns: fitcolumns
      }

      let url = `Anywhere/Import/ExportReportRawData`
      let resp = await $xt.postServerJson(url, f)
      if (!resp.success) {
        throw resp.error
      }

      window.open(window.hostServer + 'api/file/download?download=true&id=' + resp.path)
    }
    catch (ex) {
      $msg.alert('System Error', ex, 'danger')
      console.error(ex)
    }
  },
  compareObject(oldObj, newObj) {
    var delta = window.jsondiffpatch.diff(oldObj, newObj);
    function extractNewValues(deltaNode) {
      const result = {};
      for (const key in deltaNode) {
        const d = deltaNode[key];
        if (Array.isArray(d)) {
          if (d.length == 1) {
            result[key] = d[0];
          } else if (d.length == 2) {
            result[key] = d[1];
          } else if (d.length == 3) {
            result[key] = d[0];
          }
        } else if (typeof d === "object" && d !== null) {
          const child = extractNewValues(d);
          if (Object.keys(child).length > 0) {
            result[key] = child;
          }
        }
      }
      return result;
    }

    const changesOnly = extractNewValues(delta);
    return changesOnly;
  },
  removeRow(arr, idx, keyItem = '') {
    arr.splice(idx, 1)
    if (!$xtools.isEmpty(keyItem)) {
      let i = 1
      arr.forEach(f => {
        f[keyItem] = i++
      })
    }
  },
  generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      result += characters.charAt(randomIndex)
    }

    return result
  },
  sumTotal(tbl, field, decimals = 2) {
    return $linq(tbl).sum(x => $xt.dec(x[field], decimals))
  },
  queryString: $queryString,
  cookie: $_cookies
};

const $xt = $xtools;
