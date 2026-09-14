<template>
  <div class="table-responsive overflow-scroll" ref="stick_container">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    props: ['cellpad', 'topoffset', 'leftoffset', 'scale'],
    data() {
      return {
        fixed: 0,
        fixedFooter: 0,
        ready: true
      }
    },
    methods: {
      setFixed(body = 0, footer = 0) {
        this.fixed = body
        this.fixedFooter = footer
      },
      adjustScreen() {
        $(this.$refs.stick_container).css('max-height', parseInt($(window).height() - (this.scale || 310)) + 'px')
      },
      createStick(doScrollReset = true) {
        const promise = new Promise((resolve) => {
          let h = (this.topoffset || 0)
          let footer = 0
          let arr = []

          /* Table : Header */
          $(this.$refs.stick_container).find('thead').each((i, o) => {
            let tr = 1
            $(o).find('tr').each(async (i2, o2) => {
              let rowHeight = $(o2).height()
              let rowS = $(o2)
              let thS = rowS.find('th')
              let w = this.leftoffset || 0
              let ii = 0

              thS.css({ 'top': h + 'px', 'z-index': 0 })

              $.each(thS, (i3, o3) => {
                let rowLeft = (ii < this.fixed ? true : false)
                if (tr == 1) {
                  $(o3).css({ 'left': (ii < this.fixed ? `${w}px` : ''), 'z-index': (ii < this.fixed && h == 0 && rowLeft ? '10' : h > 0 && rowLeft ? '0' : '4') })
                }
                else {
                  $(o3).css({ 'z-index': 4 })
                }

                if (ii < (this.fixed - 1)) {
                  $(o3).css({ 'pointer-events': 'none', 'cursor': 'default' })
                }

                arr.push(w)
                w += parseInt($(o3).width()) + (this.cellpad || 0)
                ii++
              })
              h += rowHeight
              tr++
            })
          })

          /* Table : Body */
          if (this.fixed > 0) {
            $(this.$refs.stick_container).find('tbody').each((i, o) => {
              $(o).find('tr').each((i2, o2) => {
                let ii = 0
                $(o2).find('td').each((i3, o3) => {
                  $(o3).css({ 'left': (ii < this.fixed ? `${arr[ii]}px` : ''), 'z-index': (ii < this.fixed ? '9' : '0') })
                  if (ii < this.fixed) $(o3).addClass('td_stick')
                  ii++
                })
              })
            })
          }

          /* Table : Footer */
          $(this.$refs.stick_container).find('tfoot').each((i, o) => {
            footer = $(o).find('tr').length
            let item = 1
            let count = (footer - 1)
            $(o).find('tr').each((i3, o3) => {
              let width = 0
              let col = $(o3).find('td')
              let height = 31 * count
              col.css({ 'bottom': `${height}px`, 'z-index': 10 })
              if (this.fixedFooter > 0) {
                let i_td = 0
                $.each(col, (i4, o4) => {
                  $(o4).css({ 'left': (i_td < this.fixedFooter ? `${i_td == 0 ? 0 : width}px` : ``), 'z-index': (i_td < this.fixedFooter ? '11' : '10') })
                  if (i_td < this.fixedFooter) $(o4).addClass('td_stick')
                  width += parseInt($(o4).width()) + (this.cellpad || 0)
                  i_td++
                });
              }
              item += 1
              count -= 1
            })
          })

          resolve(true)
        })

        promise.then(async (value) => {
          if (value) {
            if (doScrollReset) {
              await this.scrollReset()
            }
          }
        })
      },
      async scrollReset() {
        await $xt.sleep(50)
        $(this.$refs.stick_container).scrollTop(0)
        $(this.$refs.stick_container).scrollLeft(0)
      },
      async scrollBottom() {
        await $xt.sleep(50)
        $(this.$refs.stick_container).scrollTop($(this.$refs.stick_container)[0].scrollHeight)
      }
    },
    async mounted() {
      this.$nextTick(() => {
        $(window).on('resize', () => this.adjustScreen())
        $(window).resize()
        this.createStick()
      })
    }
  }
</script>

<style scoped>
  div {
    position: relative;
    max-width: 100%;
    max-height: 20em;
  }

  table {
    position: relative;
    border-collapse: collapse;
    border-top: 0 !important
  }

  th {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 4
  }

  tfoot > tr > td {
    position: -webkit-sticky;
    position: sticky;
    font-weight: 600;
    background: #fff;
    z-index: 4
  }

  .table-responsive {
    border-top: 0px !important
  }

  .td_stick {
    position: -webkit-sticky;
    position: sticky
  }

  .not-col-resize {
    cursor: default !important;
    pointer-events: none !important
  }

  .overflow-scroll {
    overflow-x: scroll
  }
</style>
