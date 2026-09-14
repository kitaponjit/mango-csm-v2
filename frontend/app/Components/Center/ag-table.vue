<template>
  <div>
    <vue-element-loading :active="state.loading" spinner="spinner" color="#02234e" text="ระบบกำลังทำรายการของท่าน กรุณารอสักครู่.." />
    <div class="content-body" ref="ag_grid_content">
      <div class="ag-flex">
        <ag-grid-vue class="ag-theme-alpine"
                     :gridOptions="topGridOptions"
                     :columnDefs="columnDefs"
                     :rowData="display"
                     :rowSelection="state.rowSelection"
                     :suppressRowClickSelection="state.checkbox"
                     :isRowSelectable="isRowSelecCustom"
                     :getMainMenuItems="getMainMenuItems"
                     @row-selected="onRowSelected"
                     @selection-changed="onSelectionChanged"
                     @cell-clicked="onCellClicked"
                     @cell-double-clicked="onCellDoubleClicked"
                     @sortChanged="onSortChanged"
                     style="height: 100%; width:100%; flex: 1 1 auto;">
        </ag-grid-vue>
        <ag-grid-vue v-if="showFooter" class="ag-theme-alpine"
                     :gridOptions="bottomGridOptions"
                     :columnDefs="bottomDefs"
                     :headerHeight="0"
                     :rowData="bottomData"
                     :rowStyle="{ fontWeight: 'bold', backgroundColor: '#ffffff' }"
                     v-bind:style="{'height': state.footer_height + 'px', 'flex': 'none'}">
        </ag-grid-vue>
      </div>
    </div>
  </div>
</template>

<style>
  .ag-group-child-count {
    display: none !important;
  }

  .ag-theme-alpine .ag-row .ag-cell {
    display: flex !important;
    align-items: center;
    line-height: 45px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ag-theme-alpine .ag-row .ag-cell.text-center {
    justify-content: center;
  }

  .ag-theme-alpine .ag-row .ag-cell.text-right {
    justify-content: flex-end;
  }

  .ag-theme-alpine .ag-row .ag-cell.text-left {
    justify-content: flex-start;
  }

  .ag-theme-alpine .ag-row .ag-cell p {
    margin: 0;
    padding: 0;
    line-height: 45px;
  }


  .ag-theme-alpine .ag-cell.ag-cell-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ag-theme-alpine .ag-header-cell-label {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .ag-theme-alpine .ag-cell-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .ag-theme-alpine .ag-selection-checkbox {
    display: flex;
    align-items: center;
  }

  .ag-table-badge-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .ag-table-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 66px;
    padding: 4px 10px;
    border-radius: 999px;
    background: #edf3f8;
    color: #42617d;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
  }

  .ag-table-badge--success {
    background: #e8f8ef;
    color: #237a4b;
  }

  .ag-table-badge--warning {
    background: #fff2df;
    color: #9d5f07;
  }

  .ag-table-badge--danger {
    background: #fdeaea;
    color: #b93d39;
  }

  .ag-table-badge--info {
    background: #e8f0fe;
    color: #315fbd;
  }
</style>

<script>
  import { reactive, computed, onBeforeMount, onMounted, ref } from 'vue'

  import "ag-grid-community/styles/ag-grid.css"
  import "ag-grid-community/styles/ag-theme-alpine.css"
  import { AgGridVue } from 'ag-grid-vue3'


  export default {
    components: {
      AgGridVue
    },
    props: ['scale', 'footer', 'sorting', 'footerHeight', 'checkbox', 'notScrollReset', 'saveColumns', 'doctype', 'page_name'],
    setup(props, ctx) {
      /* -------------------------------------------------- */

      var state = reactive({
        footer_height: 60,
        scale: 330,
        checkbox: false,
        rowSelection: 'single',
        loading: false,
        saveColumns: 'N',
        doctype: null,
        page_name: null
      })

      state.footer_height = (props.footerHeight || 60)
      state.scale = (props.scale || 330)
      state.checkbox = (props.checkbox || false)
      state.rowSelection = state.checkbox ? 'multiple' : 'single'

      state.saveColumns = (props.saveColumns || 'N')
      state.doctype = (props.doctype || null)
      state.page_name = (props.page_name || null)

      /* -------------------------------------------------- */

      const { emit } = ctx

      const columnDefs = ref([])
      const bottomDefs = ref([])
      const topGridOptions = ref({})
      const bottomGridOptions = ref({})
      const display = ref([])
      const bottomData = ref([])
      const showFoolter = ref(false)
      const ag_grid_content = ref({})
      const isRowSelecCustom = ref(null)

      const showFooter = computed(() => props.footer || false)
      const sorting = computed(() => props.sorting || false)
      const notScrollReset = computed(() => props.notScrollReset || false)


      let header = []

      /* -------------------------------------------------- */

      /* ── Dark Mode Helper: แปลงสีดำเป็นสีขาวอัตโนมัติ ──
      รองรับ cellStyle ทั้งแบบ object และ function
      สีดำ (#000, #000000, black, rgb(0,0,0)) → #c9d1d9
      สีอื่นๆ (แดง เขียว น้ำเงิน ฯลฯ) คงเดิม */
      const _isBlackColor = (c) => {
        if (!c) return false
        c = c.toString().trim().toLowerCase()
        return c === '#000' || c === '#000000' || c === 'black' || c === 'rgb(0, 0, 0)' || c === 'rgb(0,0,0)'
      }
      const _darkStyleColor = '#c9d1d9'
      const _patchDarkColor = (styleObj) => {
        if (!document.body.classList.contains('dark-mode')) return styleObj
        let patched = Object.assign({}, styleObj)
        if (_isBlackColor(patched.color)) {
          patched.color = _darkStyleColor
        } else if (!patched.color) {
          patched.color = _darkStyleColor
        }
        return patched
      }

      const ahd = (field, headerName, format, props, extend) => {
        props = props || {}
        extend = extend || {}

        let {
          width,
          sortable,
          rowGroup,
          hide,
          lockVisible,
          align,
          pinned,
          bold,
          underline,
          headerClass,
          cellStyle,
          cellRenderer,
          child,
          zero_null,
          headerCheckboxSelection,
          checkboxSelection,
          rowSpan
        } = props

        let {
          useCellRenderer,
          typeCellRenderer,
          digitCellRenderer
        } = extend

        typeCellRenderer = typeCellRenderer || format
        digitCellRenderer = format.substring(0, 1) == 'n' ? $xt.int(format.substring(1, 2)) : null

        format = format?.toString()
        width = (width || 160) + (sorting && !checkboxSelection ? 15 : 0)
        sortable = (sortable != null || sortable != undefined) ? sortable : sorting
        rowGroup = rowGroup || false
        hide = rowGroup || false
        lockVisible = lockVisible || false
        pinned = pinned || ''
        headerClass = headerClass || {}
        cellStyle = cellStyle || {}
        cellRenderer = (useCellRenderer ? p => textCellRenderer(p?.data[field], typeCellRenderer, digitCellRenderer) : (cellRenderer || null))
        child = child || {}
        zero_null = zero_null || false
        headerCheckboxSelection = headerCheckboxSelection || false
        checkboxSelection = checkboxSelection || false
        rowSpan = rowSpan || null

        let suppressMovable = format == 'checkbox' || rowGroup
        let suppressColumnsToolPanel = format == 'checkbox' || rowGroup
        let suppressMenu = format == 'checkbox' || rowGroup

        if (!['left', 'right', 'center'].includes(align)) {
          if (['date', 'datetime', 'text'].includes(format) || format.match(/^n[0-9]+$/ig)) {
            if (format == 'date' || format == 'datetime' || format == 'checkbox') {
              align = 'center'
            }
            else if (format.indexOf('n') === 0) {
              align = 'right'
            } else {
              align = 'left'
            }
          } else {
            align = 'left'
          }
        }

        if (['date', 'datetime', 'text', 'checkbox'].includes(format) || format.match(/^n[0-9]+$/ig)) {

        }
        else {
          format = 'text'
        }

        align = align || 'left'

        let cellClassx = []
        switch (align) {
          case 'center':
            cellClassx.push('text-center')
            break
          case 'right':
            cellClassx.push('text-right')
            break
          default:
            cellClassx.push('text-left')
            break
        }

        if (format == 'checkbox') {
          cellClassx.push('ag-cell-checkbox')
        }

        if (bold) {
          cellStyle['font-weight'] = 'bold'
        }

        if (underline) {
          cellStyle['text-decoration'] = 'underline'
        }

        if (!cellStyle['font-weight']) {
          cellStyle['font-weight'] = p => p?.data?.bold ? 'bold' : 'normal'
        }

        if (!cellStyle['text-decoration']) {
          cellStyle['text-decoration'] = p => p?.data?.underline ? 'underline' : 'none'
        }

        let cellClass = cellClassx.join(' ')

        /* Dark Mode: wrap cellStyle เพื่อแปลงสีดำ → สีขาว
        รองรับทั้ง cellStyle แบบ object และ function */
        let _origCellStyle = cellStyle
        if (typeof _origCellStyle === 'function') {
          cellStyle = (p) => {
            let result = _origCellStyle(p) || {}
            return _patchDarkColor(result)
          }
        } else {
          /* cellStyle เป็น object — แก้ color property โดยตรง */
          let _origColor = cellStyle['color']
          cellStyle['color'] = (p) => {
            let isDark = document.body.classList.contains('dark-mode')
            if (!isDark) return (typeof _origColor === 'function' ? _origColor(p) : _origColor) || ''
            let c = typeof _origColor === 'function' ? _origColor(p) : _origColor
            if (!c || _isBlackColor(c)) return _darkStyleColor
            return c
          }
        }

        let hx = {
          field,
          headerName,
          width,
          pinned,
          cellClass,
          cellStyle,
          rowGroup,
          hide,
          lockVisible,
          headerCheckboxSelection,
          checkboxSelection,
          suppressColumnsToolPanel,
          suppressMenu,
          suppressMovable,
          unSortIcon: sorting && format != 'checkbox',
          rowSpan,

          /* Other : AG Grid */
          align,
          xformat: format,
          xdecimals: format.substring(0, 1) == 'n' ? $xt.int(format.substring(1, 2)) : null,
          xzero_null: zero_null
        }

        if (cellRenderer) {
          hx.cellRenderer = cellRenderer
        }

        Object.keys(props).forEach(x => {
          hx[x] = hx[x] || props[x]
        })

        if (child.length > 0) {
          hx.children = []
          child.forEach(x => {
            hx.children.push(ahd(x[0] || '', x[1] || '', x[2] || 'text', x[3] || {}, x[4] || {}))
          })
        }

        return hx
      }

      const dataFormatter = (data) => {
        let newData = []

        let reformat = (z, y) => {
          if (z.xformat) {
            let xformat2 = z.xformat.substring(0, 1) == 'n' ? 'n' : z.xformat
            switch (xformat2) {
              case 'date':
                y[z.field] = y[z.field] ? moment(y[z.field]).format('DD/MM/YYYY') : ''
                break
              case 'datetime':
                y[z.field] = y[z.field] ? moment(y[z.field]).format('DD/MM/YYYY HH:mm') : ''
                break
              case 'n':
                let dec = $xt.int(z.xformat.split('n').filter(f => f)[0] || 0) || 0
                if (y[z.field] != null) {
                  y[z.field] = $xt.formatNumber($xt.dec(y[z.field]) || 0, dec)
                }
                break
              default:
                y[z.field] = y[z.field]?.toString()
                break
            }
          }
        }

        data.map(x => {
          let y = JSON.parse(JSON.stringify(x))
          header.map(z => {
            if (z.children) {
              z.children.map(c => {
                reformat(c, y)
              })
            }
            else {
              reformat(z, y)
            }
          })
          newData.push(y)
        })

        return newData
      }

      const setHeader = (data) => {
        header = data
        columnDefs.value = header

        let summaryDefs = []
        data.forEach(f => {
          if (!f.children) {
            summaryDefs.push(f)
          }
          else {
            f.children.forEach(z => { summaryDefs.push(z) })
          }
        })
        bottomDefs.value = summaryDefs

        state.loading = false
      }

      const getHeader = () => {
        return header
      }

      const setDisplay = (data) => {
        topGridOptions.value.api.setRowData(data)
      }

      const setBottomData = (data) => {
        bottomGridOptions.value.api.setRowData(data)
      }

      const createHeaderFromArray = (arr) => {
        if (state.saveColumns == 'N') {
          let h = []
          arr.forEach(x => {
            h.push(ahd(x[0] || '', x[1] || '', x[2] || 'text', x[3] || {}, x[4] || {}))
          })
          return h
        }
        else {
          let h = []

          let act = window.dataServer + `api/public/GetHidesColumnsTable/?maincode=${window.auth.maincode}&doctype=${state?.doctype}&page_name=${state?.page_name}&empno=${window.auth.empno}&empcode=${window.auth.empcode}`
          $.ajax({
            url: act,
            async: false,
            success: function (data) {
              let items = data.data.hides

              state.movesData = data.data.moves?.sort_column_json

              function processColumns(dataArray) {
                for (var x of dataArray) {
                  if (!x[3]) {
                    x[3] = {}
                  }

                  const isHidden = $linq(items)
                    .where(w => w.column_name == x[0])
                    .select(s => s.hides)
                    .firstOrDefault() === 'Y'

                  x[3].hide = isHidden || (x[3].hide || false)

                  if (x[3].child && Array.isArray(x[3].child)) {
                    processColumns(x[3].child)
                  }
                }
              }

              processColumns(arr)

              arr.forEach(x => {
                h.push(ahd(x[0] || '', x[1] || '', x[2] || 'text', x[3] || {}, x[4] || {}))
              })
            }
          })

          return h
        }
      }

      const createPdfData = () => {
        let show = topGridOptions.value?.columnApi.getAllDisplayedColumns()
        let groupHeader = topGridOptions.value?.columnApi.getAllDisplayedColumnGroups()

        let headerRows = 1;
        let show0 = [];

        if (groupHeader[0] && groupHeader[0]?.originalColumnGroup && groupHeader[0]?.displayedChildren && groupHeader[0]?.displayedChildren[0]?.colDef) {
          headerRows = 2
          show0 = groupHeader.map(x => ({ label: x.originalColumnGroup?.colGroupDef?.headerName || '', colspan: x.displayedChildren?.length || 1 }));
        }

        let header = [show.map(x => ({ label: x.colDef?.headerName || '', colspan: 1 }))]
        if (headerRows === 2) {
          header.push(show0)
          header.reverse();
        }

        let col_width = show.map(x => x.actualWidth)
        let newData = []
        topGridOptions.value?.api?.forEachNode((rowNode, index) => {
          if (rowNode.group) {
            newData.push([{ data: rowNode.key, props: { bold: true, colspan: show.length } }])
          }
          else {
            let rw = show.map(x => x.colDef).map(x => ({
              data: rowNode?.data[x.field] || '', props: {
                align: x.align,
                bold: rowNode?.data?.bold || false,
                underline: rowNode?.data?.underline || false,
                colspan: 1,
                xdecimals: $linq(bottomDefs.value).where(w => w.field == x.field).select(s => s.xdecimals || null).firstOrDefault(),
                xformat: x?.xformat || null
              }
            }))
            newData.push(rw)
          }
        })

        if (showFooter) {
          bottomGridOptions.value?.api?.forEachNode((rowNode, index) => {
            let rw = show.map(x => x.colDef).map(x => ({ data: rowNode.data[x.field] || '', props: { align: x.align, bold: rowNode?.data?.bold || false, underline: rowNode?.data?.underline || false, colspan: 1 } }))
            newData.push(rw)
          })
        }

        return {
          title: '',
          data: newData,
          header,
          col_width,
          cond_text: []
        }
      }

      const onCellClicked = (params) => {
        emit('cell-clicked', { col: params?.colDef?.field, data: params?.data, params })
      }

      const onCellDoubleClicked = (params) => {
        emit('double-cell-clicked', { col: params?.colDef?.field, data: params?.data, params })
      }

      const getMainMenuItems = (params) => {
        const menuItems = params.defaultItems.slice()
        if (state.saveColumns == 'Y') {
          menuItems.push({
            name: 'Save Columns',
            action: async () => await saveHeaderColumns()
          })
          menuItems.push({
            name: 'Delete Columns',
            action: async () => await deleteHeaderColumns()
          })
        }
        return menuItems
      }

      const getHiddenColumns = () => {
        const allColumns = topGridOptions.value?.columnApi.getAllColumns()
        const hiddenColumns = allColumns.filter(col => !col.isVisible())

        const hiddenData = hiddenColumns.map(col => ({
          header: topGridOptions.value?.columnApi.getDisplayNameForColumn(col, 'header'),
          field: col.getColId()
        }))

        return hiddenData
      }

      const getGridState = () => {
        var colState = topGridOptions.value?.columnApi.getColumnState()
        var stateJson = JSON.stringify(colState)
        return stateJson
      }


      const saveHeaderColumns = async () => {
        try {
          let column_hides = getHiddenColumns()
          let f = []
          for (var x of column_hides) {
            f.push({
              maincode: window.auth.maincode,
              doctype: state.doctype,
              page_name: state.page_name,
              empno: window.auth.empno,
              empcode: window.auth.empcode,
              column_name: x?.field,
              hides: 'Y'
            })
          }

          let form = {
            data: f,
            maincode: window.auth.maincode,
            doctype: state.doctype,
            empno: window.auth.empno,
            empcode: window.auth.empcode,
            page_name: state.page_name
          }

          let url = 'api/public/SaveHidesColumnsTable/'
          let rsp = await $xt.postServerJson(url, form)
          if (!rsp.success) {
            throw rsp.error
          }

          $msg.alert('Success', 'The system has successfully saved the column headers.', 'success')
        }
        catch (ex) {
          $msg.alert('System Error', ex.toString(), 'danger')
        }
      }
      const deleteHeaderColumns = async () => {
        try {
          let form = {
            maincode: window.auth.maincode,
            doctype: state.doctype,
            empno: window.auth.empno,
            empcode: window.auth.empcode,
            page_name: state.page_name
          }

          let url = 'api/public/DeleteHidesColumnsTable/'
          let rsp = await $xt.postServerJson(url, form)
          if (!rsp.success) {
            throw rsp.error
          }

          $msg.alert('Success', 'The system has successfully deleted the column headers.', 'success')
        }
        catch (ex) {
          $msg.alert('System Error', ex.toString(), 'danger')
        }
      }


      const onRowSelected = (e) => {
        let selected = e.node.selected
        let items = e.node.data
        let data = $linq(getAllRows()).where(w => w.selected).select(s => s.data).toArray()

        emit('on-selected', { selected, items, data, node : e.node })
      }

      const onSortChanged = (e) => {
        console.log(e.api.getSortModel())

        const sortedData = []
        const rowCount = e.api.getDisplayedRowCount()

        for (let i = 0; i < rowCount; i++) {
          const rowNode = e.api.getDisplayedRowAtIndex(i)
          sortedData.push(rowNode.data)
        }

        emit('on-sort-changed', { data: sortedData, model: e.api.getSortModel() })
      }

      const applySelectRow = (e) => {
        console.log(e, "in function");
      }

      const onSelectionChanged = (e) => {
        const data = e.api.getSelectedNodes()
      }

      const getAllRows = () => {
        let rowData = []
        topGridOptions?.value?.api.forEachNode(node => rowData.push(node))
        return rowData
      }

      const exportExcel = async (file_name = '') => {
        state.loading = true
        try {
          let form = createPdfData()
          form.title = ''
          form.cond_text = [window.auth?.mainname]
          form.file_name = file_name

          let resp = await $xt.postServerJson('api/public/CreateExcel/', form, true)
          window.open(window.hostServer + resp.data)
        }
        catch (ex) {
          $msg.alert('System Error', ex, 'danger')
        }
        finally {
          state.loading = false
        }
      }

      const printPDF = async () => {
        state.loading = true
        try {
          let form = createPdfData()
          form.title = ''
          form.cond_text = [window.auth?.mainname]
          form.print_setup = {
            page_layout: '1',
            default_font: 14,
            header_font: 24,
            condition_font: 22
          }

          let resp = await $xt.postServerJson('api/public/CreatePrintPdf/', form, true)
          window.open(window.hostServer + resp.data)
        }
        catch (ex) {
          $msg.alert('System Error', ex, 'danger')
        }
        finally {
          state.loading = false
        }
      }

      const textCellRenderer = (data, format, digit) => {
        format = format.substring(0, 1) == 'n' ? 'n' : format
        digit = digit || 2

        switch (format) {
          case 'date':
            return $xt.formatDate(data, 'DD/MM/YYYY')
            break
          case 'datetime':
            return $xt.formatDate(data, 'DD/MM/YYYY HH:mm:ss')
            break
          case 'time':
            return $xt.formatDate(data, 'HH:mm:ss')
            break
          case 'n':
            return $xt.formatNumber((data || 0), digit)
            break
          case 'badge':
            let field = params?.colDef?.field || ''
            let badgeMap = params?.colDef?.xbadgeMap || {}
            let badgeConfig = badgeMap?.[data] || null
            let badgeText = badgeConfig?.text || data || ''
            let badgeClass = badgeConfig?.className || params?.data?.[`${field}_badge_class`] || params?.data?.badge_class || ''
            let badgeStyle = badgeConfig?.style || params?.data?.[`${field}_badge_style`] || null

            let wrapper = document.createElement('div')
            wrapper.className = 'ag-table-badge-wrap'

            let badge = document.createElement('span')
            badge.className = `ag-table-badge ${badgeClass || ''}`.trim()
            badge.textContent = badgeText

            if (badgeStyle && typeof badgeStyle === 'object') {
              Object.keys(badgeStyle).forEach(key => {
                badge.style[key] = badgeStyle[key]
              })
            }

            wrapper.appendChild(badge)
            return wrapper
            break
          default:
            return data
            break
        }
      }

      /* -------------------------------------------------- */

      onBeforeMount(() => {
        topGridOptions.value = {
          alignedGrids: [],
          defaultColDef: {
            editable: false,
            sortable: sorting,
            resizable: true,
            filter: false,
            minWidth: 50
          },
          groupDisplayType: 'groupRows',
          animateRows: true,
          groupDefaultExpanded: 10,
          headerHeight: 35,
          rowHeight: 45,
          suppressHorizontalScroll: showFooter,
          suppressScrollOnNewData: notScrollReset,
          suppressCopyRowsToClipboard: true
        }

        if (showFooter) {
          bottomGridOptions.value = {
            alignedGrids: [],
            defaultColDef: {
              editable: false,
              sortable: false,
              resizable: true,
              filter: false,
              minWidth: 50
            },
            groupDisplayType: 'groupRows',
            animateRows: true,
            groupDefaultExpanded: 10,
            headerHeight: 0,
            rowHeight: 40
          }

          topGridOptions.value.alignedGrids.push(bottomGridOptions.value)
          bottomGridOptions.value.alignedGrids.push(topGridOptions.value)

          try {
            function refreshRowIndices() {
              topGridOptions.api.refreshCells({
                columns: ['Index'],
                force: true
              })
            }

            topGridOptions.onSortChanged = refreshRowIndices
            topGridOptions.onFilterChanged = refreshRowIndices
          } catch { }
        }
      })

      onMounted(() => {
        $(window).resize(() => {
          $(ag_grid_content.value).css({
            'max-height': ($(window).height() - state.scale) + 'px',
            'height': ($(window).height() - state.scale) + 'px'
          })
        })
        $(window).trigger('resize')

        emit('ready')
      })

      return {
        state,
        columnDefs,
        bottomDefs,
        topGridOptions,
        bottomGridOptions,
        display,
        bottomData,
        showFoolter,
        dataFormatter,
        setHeader,
        getHeader,
        setDisplay,
        setBottomData,
        createHeaderFromArray,
        createPdfData,
        ag_grid_content,
        showFooter,
        onCellClicked,
        onCellDoubleClicked,
        exportExcel,
        printPDF,
        onRowSelected,
        applySelectRow,
        isRowSelecCustom,
        onSelectionChanged,
        onSortChanged,
        getMainMenuItems
      }
    }
  }
</script>
