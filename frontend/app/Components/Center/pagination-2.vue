<template>
  <div style="display: flex; justify-content: flex-end;">

    <paginate v-model="pageNumber"
              :page-count="page.getTotalPages()"
              :margin-pages="2"
              :page-range="3"
              :click-handler="changePage"
              :container-class="'pagination pagination-sm mb-0'"
              :page-class="'page-item'"
              :page-link-class="'page-link'"
              :prev-text="'&#10094;'"
              :next-text="'&#10095;'"
              :first-last-button="true"
              :first-button-text="ui.erp_first_page || 'First Page'"
              :last-button-text="ui.erp_last_page || 'Last Page'">
    </paginate>

    <div class="input-group input-group-sm" style="width: 130px; margin-left: 10px;">
      <input type="number"
             class="form-control"
             v-model.number="inputPage"
             @keyup.enter="jumpToPage"
             placeholder="Page"
             style="height: 30px; font-size: 13.5px;">

      <span class="input-group-btn">
        <button class="btn bg-navy"
                type="button"
                @click="jumpToPage"
                style="height: 30px;">
          Go
        </button>
      </span>
    </div>

  </div>
</template>

<script type="text/javascript">
  import Paginate from 'vuejs-paginate-next'
  export default {
    components: {
      paginate: Paginate
    },
    data() {
      return {
        ui: window.ui || {},
        page: new Pagination(),
        pageNumber: 1,
        inputPage: ''
      };
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
        this.pageNumber = x
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
      changePage(page) {
        this.$emit('page-change', { page: page })
      },
      jumpToPage() {
        const target = parseInt(this.inputPage)
        const maxPage = this.page.getTotalPages()

        if (!target || target < 1) {
          this.pageNumber = 1
        } else if (target > maxPage) {
          this.pageNumber = maxPage
        } else {
          this.pageNumber = target
        }

        this.inputPage = ''

        this.changePage(this.pageNumber)
      }
    },
  }
</script>
