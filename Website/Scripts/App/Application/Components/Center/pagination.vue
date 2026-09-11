<template>
  <div>
    <ul class="pagination pagination-sm" v-if="pageArray.length > 0">
      <li class="page-item"><a href="#" :class="{'disabled-menu': currentPage == 1}" @click.prevent="controlPage(pageArray[0].page_no)">{{ui.erp_first_page || 'First Page'}}</a></li>
      <li class="page-item"><a href="#" :class="{'disabled-menu': currentPage == 1}" @click.prevent="controlPage(currentPage - 1)"><i class="fas fa-angle-left"></i></a></li>
      <li class="page-item" v-for="x in pageArray" v-bind:class="{'active':x.active}"><a class="page-link" href="#" v-on:click.prevent="changePage(x.page_no)">{{x.page_no}}</a></li>
      <li class="page-item"><a href="#" :class="{'disabled-menu': getTotalPages() == currentPage}" @click.prevent="controlPage(currentPage + 1)"><i class="fas fa-angle-right"></i></a></li>
      <li class="page-item"><a href="#" :class="{'disabled-menu': getTotalPages() == currentPage}" @click.prevent="controlPage(pageArray[pageArray.length - 1].page_no)">{{ui.erp_last_page || 'Last Page'}}</a></li>
    </ul>
  </div>
</template>

<script>
  let cpn = {
    data() {
      return {
        ui: window.ui || {},
        page: new Pagination(),
        pageArray: [],
        currentPage: 1,
      }
    },
    methods: {
      setItemsPerPage(n) {
        this.page.setItemsPerPage(n)
      },
      getItemsPerPage() {
        return this.page.getItemsPerPage()
      },
      setTotalItems(x) {
        this.page.setTotalItems(x)
      },
      getTotalItems() {
        return this.page.getTotalItems()
      },
      setCurrentPage(x) {
        this.page.setCurrentPage(x)
      },
      getCurrentPage() {
        return this.page.getCurrentPage()
      },
      getTotalPages() {
        return this.page.getTotalPages()
      },
      skipItems() {
        return this.page.skipItems()
      },
      getItemNo(index) {
        return this.page.getItemNo(index)
      },
      createPagesArray() {
        this.$set(this, 'pageArray', this.page.createPagesArray())
      },
      changePage(pn) {
        this.currentPage = pn || 1
        this.$emit('page-change', { page: pn })
      },
      controlPage(pn) {
        this.currentPage = pn
        this.changePage(this.currentPage)
      },
    }
  }

  export default cpn
</script>
