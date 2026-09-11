<template>
  <div>
    <div class="modal fade" data-backdrop="static" data-keyboard="false" ref="myModal" id="myModal_customize">
      <div class="modal-dialog" v-bind:class="[modalSize]" ref="dialog">
        <div class="modal-content">
          <div class="modal-header bg-white h-100p padding-t-15"  v-if="!hideHeaderclose">
            <div class="modal-title-v2">
              <slot name="header"></slot>
            </div>
            <button type="button" class="close close-v2 " @click="CloseModal_Clear()">&times;</button>
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
        this.$set(this, 'modalSize', t)
      },
      adjustScreen() {
        if (this.scale != 0) {
          $(this.$refs.modalBody).css('height', parseInt($(window).height() - (this.scale || 310)) + 'px')
        }
      },
      CloseModal_Clear() {
        console.log('-1');
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
  /* .modal {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;
  } */

  .modal-dialog {
    position: fixed;
    margin: 0 !important;
    width: 100%;
    bottom: 0;
    padding: 0;
  }

  .modal-content {
    /* position: absolute; */
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-top-left-radius: 35px ;
    border-top-right-radius: 35px ;
    box-shadow: none;
  }

  .modal-header {
    border-top-left-radius: 35px;
    border-top-right-radius: 35px;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  .modal-title-v2 {
    color: white !important;
    flex-grow: 1 !important;
    text-align: left !important;
  }

  button.close-v2 {
  padding: 8px !important;
  color: #CCC !important;
  font-size: 24px !important;
  font-weight: bold !important;
  text-shadow: unset;
  opacity: 1 !important;
}
</style>

