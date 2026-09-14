<template>
  <div>
    <div class="content-body" ref="ag_grid_content">
      <div class="ag-flex">
        <ag-grid-vue class="ag-theme-alpine"
                     :gridOptions="topGridOptions"
                     :autoGroupColumnDef="autoGroupColumnDef"
                     :columnDefs="columnDefs"
                     :rowData="display"
                     :rowSelection="state.rowSelection"
                     :getMainMenuItems="getMainMenuItems"
                     @cell-clicked="onCellClicked"
                     @cell-double-clicked="onCellDoubleClicked"
                     style="height: 100%; width:100%; flex: 1 1 auto;">
        </ag-grid-vue>
        <ag-grid-vue v-show="showFooter" class="ag-theme-alpine"
                     :gridOptions="bottomGridOptions"
                     :autoGroupColumnDef="autoGroupColumnDef"
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
</style>

<script>
  import { computed, onBeforeMount, onMounted, reactive, ref } from 'vue'

  import 'ag-grid-community/styles/ag-grid.css'
  import 'ag-grid-community/styles/ag-theme-alpine.css'
  import { AgGridVue } from 'ag-grid-vue3'

  import axios from 'axios' //add 05022026

  export default {
    components: {
      AgGridVue
    },
    props: ['footer', 'sorting', 'footerHeight', 'grfooter', 'dptype', 'scale'],
    emits: ['filtered', 'ready'],
    setup(props, ctx) {
      const { emit } = ctx

      const columnDefs = ref([])
      const bottomDefs = ref([])
      const topGridOptions = ref({})
      const bottomGridOptions = ref({})
      const autoGroupColumnDef = ref({})
      const display = ref([])
      const bottomData = ref([])
      const showFoolter = ref(false)
      const ag_grid_content = ref({})

      const showFooter = computed(() => props.footer || false)
      const sorting = computed(() => props.sorting || false)

      const appinfo = window.appinfo //add 05022026

      var state = reactive({
        footer_height: 60,
        rowSelection: 'single',
        scale: 330
      })

      state.footer_height = (props.footerHeight || 60)
      state.scale = (props.scale || 330)

      let header = []
      let raw = []

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

      const ahd = (field, headerName, format, props) => {
        props = props || {}
        let { width, sortable, colSpan, rowGroup, hide, align, pinned, bold, underline, cellStyle, cellRenderer, child, zero_null, lockVisible } = props
        format = format?.toString()
        width = (width || 160) + (sorting ? 20 : 0)
        sortable = (sortable != null || sortable != undefined) ? sortable : sorting
        colSpan = colSpan || null
        rowGroup = rowGroup || false
        hide = rowGroup || false
        lockVisible = lockVisible || false
        pinned = pinned || ''
        cellStyle = cellStyle || {}
        child = child || {}
        zero_null = zero_null || false

        let suppressColumnsToolPanel = false
        suppressColumnsToolPanel = rowGroup

        if (!['left', 'right', 'center'].includes(align)) {
          if (['date', 'datetime', 'text'].includes(format) || format.match(/^n[0-9]+$/ig)) {
            if (format == 'date' || format == 'datetime') {
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

        if (['date', 'datetime', 'text'].includes(format) || format.match(/^n[0-9]+$/ig)) {

        } else {
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
          colSpan,
          cellClass,
          cellStyle,
          rowGroup,
          hide,
          lockVisible,
          suppressColumnsToolPanel,
          unSortIcon: sorting,

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
            hx.children.push(ahd(x[0] || '', x[1] || '', x[2] || 'text', x[3] || {}))
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
                if (!c.children) {
                  reformat(c, y)
                }
                else {
                  c.children.map(c1 => {
                    reformat(c1, y)
                  })
                }
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
      }

      const getHeader = () => {
        return header
      }

      const setRaw = (data) => {
        raw = data
      }

      const setDisplay = (data) => {
        topGridOptions.value.api.setRowData(data)
      }

      const setBottomData = (data) => {
        bottomGridOptions.value.api.setRowData(data)
      }

      const setGroupFooter = (vis) => {
        topGridOptions.value.groupIncludeFooter = vis
        topGridOptions.value.groupIncludeTotalFooter = vis

      }

      const createHeaderFromArray = (arr) => {
        let h = []

        let act = window.dataServer + `api/public/GetHidesColumnsTable/?maincode=${window.auth.maincode}&doctype=RP&page_name=${appinfo?.page_name}&empno=${window.auth.empno}&empcode=${window.auth.empcode}`
        $.ajax({
          url: act,
          async: false,
          success: function (data) {
            let items = data.data

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

            for (var x of arr) {
              h.push(ahd(x[0] || '', x[1] || '', x[2] || 'text', x[3] || {}))
            }
          }
        })

        return h
      }

      const getContext = () => {
        return topGridOptions.value
      }

      const createPdfData = () => {
        let show = topGridOptions.value?.columnApi.getAllDisplayedColumns()
        let groupHeader = topGridOptions.value?.columnApi.getAllDisplayedColumnGroups()

        const getMembers = (members, lv) => {
          let displayedChildren = []
          const flattenMembers = members.map(m => {
            if (m.displayedChildren && m.displayedChildren.length) {
              displayedChildren = [...displayedChildren, ...m.displayedChildren]
            }
            m.lv = lv
            return m
          })

          return flattenMembers.concat(displayedChildren.length ? getMembers(displayedChildren, lv + 1) : displayedChildren)
        }

        let hx = getMembers(groupHeader, 1)
        let maxLv = hx.reduce((o, i) => i.lv > o ? i.lv : o, 0)

        let hdx = hx.map(x => {
          let id, parent, name, colspan
          let lv = x.lv
          if (lv === maxLv) {
            id = x.colId || null
            parent = x.parent?.groupId || null
            name = x.colDef?.headerName || ''
            colspan = 1
          }
          else {
            id = x.originalColumnGroup?.groupId || null
            name = x.originalColumnGroup?.colGroupDef?.headerName || ''
            parent = x.parent?.groupId || null
            colspan = 0
          }

          return { lv, id, parent, name, colspan }
        })

        let findParent = (id, arr) => {
          let parent = hdx.filter(x => x.id === id)[0]
          if (parent) {
            findParent(parent.parent, arr)
            arr ||= []
            arr.push(id)
          }
        }

        for (let x of hdx) {
          x.parents = []
          findParent(x.parent, x.parents)
        }

        for (let x of hdx) {
          x.colspan = hdx.filter(y => y.parents.includes(x.id) && y.lv == maxLv).length || 1
        }

        let header = $linq(hdx)
          .groupBy(x => x.lv)
          .select(x => {
            return x.values.map(y => ({ label: y.name, colspan: y.colspan }))
          })
          .toArray()

        let col_width = show.map(x => x.actualWidth)
        let newData = []
        let total = {}
        topGridOptions.value?.api?.forEachNode((rowNode, index) => {
          if (index == 0) {
            if (rowNode.parent?.aggData) {
              total = rowNode.parent?.aggData
            }
          }
          if (index < 10) {

          }
          if (rowNode.group) {
            newData.push([{ data: rowNode?.key, props: { bold: true, colspan: show.length } }])
          }
          else {
            let rw = show.map(x => x.colDef).map(x => ({
              data: x.valueFormatter ? x.valueFormatter({ node: rowNode, value: rowNode?.data[x.field] }) : (rowNode?.data[x.field] || ''),
              props: {
                align: x.align,
                bold: x.bold || rowNode?.data?.bold || false,
                underline: x.underline || rowNode?.data?.underline || false,
                colspan: rowNode?.data['colspan_' + x.field] || 1,
                xdecimals: $linq(bottomDefs.value).where(w => w.field == x.field).select(s => s.xdecimals || null).firstOrDefault(),
                xformat: x?.xformat
              }
            }))
            newData.push(rw)
          }
        })

        if (showFooter) {
          bottomGridOptions.value?.api?.forEachNode((rowNode, index) => {
            let rw = show.map(x => x.colDef).map(x => ({ data: x.valueFormatter ? x.valueFormatter({ node: rowNode, value: rowNode?.data[x.field] }) : (rowNode?.data[x.field] || ''), props: { align: x.align, bold: rowNode?.data?.bold || false, underline: rowNode?.data?.underline || false, colspan: 1 } }))
            newData.push(rw)
          })
        }

        return {
          data: newData,
          header,
          col_width
        }
      }

      const onCellClicked = (params) => {
        emit('cell-clicked', { params })
      }

      const onCellDoubleClicked = (params) => {
        emit('double-cell-clicked', { params })
      }
      const getMainMenuItems = (params) => {
        const menuItems = params.defaultItems.slice()
        menuItems.push({
          name: 'Save Columns',
          action: async () => await saveHeaderColumns()
        })
        menuItems.push({
          name: 'Delete Columns',
          action: async () => await deleteHeaderColumns()
        })
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

      const saveHeaderColumns = async () => {
        window.page.loadingBox.show()
        try {
          let column_hides = getHiddenColumns()
          let f = []
          for (var x of column_hides) {
            f.push({
              maincode: window.auth.maincode,
              doctype: 'RP',
              page_name: appinfo?.page_name,
              empno: window.auth.empno,
              empcode: window.auth.empcode,
              column_name: x?.field,
              hides: 'Y'
            })
          }

          let form = {
            data: f,
            maincode: window.auth.maincode,
            doctype: 'RP',
            empno: window.auth.empno,
            empcode: window.auth.empcode,
            page_name: appinfo?.page_name
          }

          let url = 'api/public/SaveHidesColumnsTable/'
          let rsp = await $xt.postServerJson(url, form)
          if (!rsp.success) {
            throw rsp.error
          }

          $msg.alert('Success', 'The system has successfully saved the column headers.', 'success')

          window.page.loadingBox.hide()
        }
        catch (ex) {
          $msg.alert('System Error', ex.toString(), 'danger')

          window.page.loadingBox.hide()
        }
      }

      const deleteHeaderColumns = async () => {
        try {
          let form = {
            maincode: window.auth.maincode,
            doctype: 'RP',
            empno: window.auth.empno,
            empcode: window.auth.empcode,
            page_name: appinfo?.page_name
          }

          window.page.loadingBox.show()
          let url = 'api/public/DeleteHidesColumnsTable/'
          let rsp = await $xt.postServerJson(url, form)
          if (!rsp.success) {
            throw rsp.error
          }

          $msg.alert('Success', 'The system has successfully deleted the column headers.', 'success')

          window.page.loadingBox.hide()
        }
        catch (ex) {
          $msg.alert('System Error', ex.toString(), 'danger')

          window.page.loadingBox.hide()
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
          groupDefaultExpanded: 10,
          animateRows: true,
          headerHeight: 35,
          rowHeight: 35,
          suppressHorizontalScroll: showFooter,
          suppressAggFuncInHeader: true,
          suppressCopyRowsToClipboard: true,
          getRowStyle: (params) => {
            if (params.node.footer) {
              return { fontWeight: 'bold' }
            }
          },
          onSortChanged(e) {
            e.api.refreshCells()
          },
          onFilterChanged() {
            emit('filtered')
          }
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
            groupDefaultExpanded: 10,
            headerHeight: 0,
            rowHeight: 40,
            suppressAggFuncInHeader: true,
            suppressCopyRowsToClipboard: true
          }

          topGridOptions.value.alignedGrids.push(bottomGridOptions.value)
          bottomGridOptions.value.alignedGrids.push(topGridOptions.value)
          setGroupFooter(false)
        }
      })

      onMounted(() => {
        autoGroupColumnDef.value = {
          cellRendererParams: {
            suppressCount: true
          }
        }

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
        autoGroupColumnDef,
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
        setRaw,
        showFooter,
        onCellClicked,
        onCellDoubleClicked,
        setGroupFooter,
        getContext,
        getMainMenuItems
      }
    }
  }
</script>
