<template>
  <div class="stickcontainer" ref="mySticky" :style="{'width':(width || '100%')}">
    <slot></slot>
  </div>
</template>
<script>
  export default {
    props: [
      'width',
      'height'
    ],
    methods: {
      updateSticky() {
        let tableHeaderTop = $(this.$refs.mySticky).find('thead').offset().top;
        let ths = $(this.$refs.mySticky).find('thead th');
        $.each(ths, (i, element) => {
          $(element).css("top", ($(element).offset().top - tableHeaderTop) + 'px');
        })
        $(this.$refs.mySticky).css('max-height', (this.height || 500) + 'px');
      },
      reCreateSticky() {
        this.$nextTick(() => {
          $(this.$refs.mySticky).css('max-height', '');
          this.updateSticky();
        });
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.updateSticky();
      });
    }
  };
</script>
<style scoped>
  div.stickcontainer {
    overflow: scroll;
    margin: 0px !important;
    padding: 0px !important;
  }

  table {
    margin: 0px !important;
    padding: 0px !important;
  }

  thead th {
    position: -webkit-sticky; /* for Safari */
    position: sticky;
    top: 0;
    z-index: 0;
  }
</style>
