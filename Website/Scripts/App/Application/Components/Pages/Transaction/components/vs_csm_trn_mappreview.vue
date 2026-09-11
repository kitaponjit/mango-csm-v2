<template>
  <modal-2 ref="prviewModal" sheet-class="ct-sheet" :hideFooter="true">
    <template #header>
      <h4><i class="fas fa-map-marked-alt"> {{ ui.erp_map_preview || 'Map Preview' }}</i></h4>
    </template>
    <template #body>
      <div class="row">
        <div class="col-md-12">
          <div class="text-center">
            <iframe :src="editDetailData['map_src']" v-show="editDetailData['map_src']" width="720" height="480"></iframe>
          </div>
        </div>
      </div>
    </template>
  </modal-2>
</template>

<script type="text/javascript">
  export default {
    props: {
      editDetailData: Object,
    },
    data() {
      return {
        ui: window.ui,
      }
    },
    methods: {
      openModal() {
        this.$refs.prviewModal.openModal()
      },
      closeModal() {
        this.$refs.prviewModal.closeModal()
      },
      setSize(size) {
        this.$refs.prviewModal.setSize(size)
      },
    },
  }
</script>
