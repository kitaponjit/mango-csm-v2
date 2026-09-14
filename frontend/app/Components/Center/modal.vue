<template>
  <div>
    <div class="modal fade" v-bind:class="[sheetClass]" data-backdrop="false" data-keyboard="false" ref="myModal">
      <div class="modal-dialog" v-bind:class="[modalSize]">
        <div class="modal-content">
          <!-- Modal Header -->
          <div class="modal-header modal-header-primary">
            <div class="modal-header-inner">
              <slot name="header"></slot>
            </div>
            <button type="button" class="close" data-dismiss="modal" @click="closeFunction" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <!-- Modal body -->
          <div class="modal-body">
            <slot name="body"></slot>
          </div>
          <!-- Modal footer -->
          <div class="modal-footer modal-footer-actions">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      sheetClass: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        modalSize: 'modal-md',
        ui: window.ui
      };
    },
    methods: {
      openModal() {
        $(this.$refs.myModal).modal('show');

        // จัดการ z-index เมื่อมี modal ซ้อนกันหลายตัว (ยกมาจาก modal-2.vue:105)
        // modal ตัวนี้ไม่มี logic นี้มาก่อน จึงค้างที่ z-index 1050 ตามค่าของ
        // bootstrap ขณะที่ modal-2 ยกตัวเองขึ้นทุกครั้งที่เปิด — lookup ที่ถูก
        // เปิดจากในชีตแก้ไขส่วนงานจึงอยู่ระดับเดียวกันหรือต่ำกว่าชีต
        // และถูกชีตที่กินเต็มจอครอบทับจนกดเลือกข้อมูลไม่ได้
        this.$nextTick(() => {
          let zIndex = 1040 + (10 * $('.modal:visible').length);
          $(this.$refs.myModal).css('z-index', zIndex);
          setTimeout(() => {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
          }, 0);
        });
      },
      closeModal() {
        $(this.$refs.myModal).modal('hide');
      },
      setSize(t) {
        this.modalSize = t;
      },
      closeFunction(){
        this.$emit('close-function')
      }
    },
    mounted() {
      if (this.$refs.myModal) {
        document.body.appendChild(this.$refs.myModal)
      }
    },
    beforeUnmount() {
      if (this.$refs.myModal && this.$refs.myModal.parentNode === document.body) {
        $(this.$refs.myModal).modal('hide')
        document.body.removeChild(this.$refs.myModal)
      }
    }
  };
</script>
