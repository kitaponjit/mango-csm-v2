<template>
  <div>
    <div class="modal fade" v-bind:class="[sheetClass]" data-backdrop="static" data-keyboard="false" ref="myModal" >
      <div class="modal-dialog modal-dialog-centered" v-bind:class="[modalSize]" ref="dialog" >

        <div class="modal-content">

          <div class="modal-header modal-header-primary" style="cursor: move">
            <div class="modal-header-inner">
              <slot name="header"></slot>
            </div>
            <button ref="close_btn" type="button" class="close" v-if="closeButton" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div class="modal-body" ref="modalBody" style="overflow-y: auto;">
            <slot name="body"></slot>
          </div>

          <div class="modal-footer modal-footer-actions" v-show="!hideFooter">
            <slot name="footer"></slot>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  export default {
    props: {
      useCloseFunction: {
        type: Boolean,
        default: false
      },
      closeFunction: {
        type: Function
      },
      closeButton: {
        type: Boolean,
        default: true
      },
      notEsc: {
        type: Boolean,
        default: true
      },
      scale: {
        type: Number,
        default: 0
      },
      hideFooter: {
        type: Boolean,
        default: false
      },
      sheetClass: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        // *** ปรับแก้จุดเดียว: เปลี่ยนจาก modal-md เป็น modal-xl เพื่อให้กว้างพอสำหรับ Sidebar ***
        modalSize: 'modal-xl',
        ui: window.ui
      }
    },
    created() {
      document.addEventListener('keyup', (evt) => {
        if (evt.keyCode === 27) {
          this.callback()
        }
      })
    },
    methods: {
      async openModal() {
        let vm = this
        return new Promise(resolve => {
          $(vm.$refs.myModal).modal('show')

          this.$nextTick(() => {
            // Logic เดิม
            $(vm.$refs.modalBody).animate({ scrollTop: 0 }, 'fast')
            $(vm.$refs.dialog).draggable({
              cursor: 'move',
              handle: '.modal-header'
            })
            $(vm.$refs.dialog).css({ top: 0, left: 0 })
          })

          $(this.$refs.close_btn).on('click', () => {
            this.callback()
            resolve(true)
          })
        })
      },
      async closeModal() {
        await $(this.$refs.myModal).modal('hide')
      },
      callback() {
        if (this.useCloseFunction) {
          this.$emit('close-function')
        }
        else {
          this.closeModal()
        }
      },
      setSize(t) {
        this.modalSize = t
      },
      adjustScreen() {
        if (this.scale != 0) {
          $(this.$refs.modalBody).css('height', parseInt($(window).height() - (this.scale || 310)) + 'px')
        }
      },
    },
    mounted() {
      if (this.$refs.myModal) {
        document.body.appendChild(this.$refs.myModal)
      }
      this.$nextTick(() => {
        $(window).on('resize', () => this.adjustScreen())
        $(window).resize()
      })
    },
    beforeUnmount() {
      if (this.$refs.myModal && this.$refs.myModal.parentNode === document.body) {
        $(this.$refs.myModal).modal('hide')
        document.body.removeChild(this.$refs.myModal)
      }
    }
  }
</script>

