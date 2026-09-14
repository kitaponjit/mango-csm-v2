<template>
  <div>
    <div class="modal fade" data-backdrop="false" data-keyboard="false" ref="myModal" id="myModal">
      <div class="modal-dialog" v-bind:class="[modalSize]" ref="dialog">
        <div class="modal-content">
          <div class="modal-header bg-white h-100p padding-t-15" v-bind:class="[headerClass]">
            <div class="modal-title-v2">
              <slot name="header"></slot>
            </div>
            <button type="button" class="close close-v2"  v-if="!hideHeaderclose" @click="CloseModal_Clear()">&times;</button>
          </div>
          
          <div class="modal-body" v-bind:class="[bodyClass]" ref="modalBody">
            <slot name="body"></slot>
          </div>
          <div class="modal-footer" v-bind:class="[footerClass]" v-if="!hideFooter">
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
      hideHeaderclose : {
        type : Boolean,
        default : false
      },
      headerClass : {
        type : String,
        default : ""
      },
      bodyClass : {
        type : String,
        default : ""
      },
      footerClass : {
        type : String,
        default : ""
      }
    },
    data() {
      return {
        modalSize: '',
        ui: window.ui
      }
    },
    methods: {
      async openModal() {
        let vm = this
        return new Promise(resolve => {
          $(vm.$refs.myModal).modal('show')

          // this.$nextTick(() => {
          //   $(vm.$refs.modalBody).animate({ scrollTop: 0 }, 'fast')
          //   $(vm.$refs.dialog).draggable({
          //     cursor: 'move',
          //     handle: '.modal-header'
          //   })
          //   $(vm.$refs.dialog).css({ top: 0, left: 0 })
          // })
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
      CloseModal_Clear() {
        this.$emit('close-function')
      }
    },
    mounted() {
      this.$nextTick(() => {
        $(window).on('resize', () => this.adjustScreen())
        $(window).resize()
      })
    }
  }
</script>

<style scoped>
  .modal-header {
    border-bottom: 1px solid #f3f3f3 !important;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  .modal-title-v2 {
    color: white !important;
    flex-grow: 1 !important;
    text-align: left !important;
  }
  #myModal .modal-body {
    border-bottom: 1px solid #f3f3f3 !important;
    width: 100%;
  }
  #myModal .modal-footer {
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
  }
  #myModal button.close-v2 {
  padding: 8px !important;
  color: #CCC !important;
  font-size: 24px !important;
  font-weight: bold !important;
  text-shadow: unset;
  opacity: 1 !important;
}
</style>

