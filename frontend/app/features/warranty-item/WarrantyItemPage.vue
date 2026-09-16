<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef, watch } from 'vue'

import { createWarrantyItemListService } from './list/warranty-item-list-service'
import {
  createWarrantyItemListController,
  createWarrantyItemListState,
  getWarrantyItemPageNumbers,
  type WarrantyItemListController,
} from './list/warranty-item-list-state'
import { getWarrantyItemPagePolicy } from './page-policy'
import { readWarrantyItemAccessSnapshot } from './runtime/access-snapshot'
import { createLegacyXtoolsTransport } from './runtime/legacy-xtools-transport'

const title = 'Master : รายการสินค้าประกัน'
const page = ref<{ pageTitle: string } | null>(null)
const access = getWarrantyItemPagePolicy(readWarrantyItemAccessSnapshot())
const state = reactive(createWarrantyItemListState())
const filters = reactive({
  field: state.query.field,
  text: state.query.text,
  active: state.query.active,
})
const controller = shallowRef<WarrantyItemListController | null>(null)
const busy = computed(() => state.status === 'initial-loading' || state.status === 'refreshing')
const displayedPage = ref(1)
const pageNumbers = computed(() => getWarrantyItemPageNumbers(state.maxPage))

// Retained rows still belong to the last successful page if a later request fails.
watch(() => state.status, status => {
  if (status === 'loaded') displayedPage.value = state.query.page
}, { flush: 'sync' })

function connectController(): void {
  if (!access.canReadList) return
  try {
    const service = createWarrantyItemListService(createLegacyXtoolsTransport())
    controller.value = createWarrantyItemListController(service, state)
  } catch (reason: unknown) {
    state.status = 'error'
    state.error = reason instanceof Error ? reason : new Error('Warranty Item service is unavailable.')
  }
}

connectController()

function retry(): void {
  if (!controller.value) connectController()
  void controller.value?.retry()
}

onMounted(() => {
  if (page.value) page.value.pageTitle = title
  document.title = title
  void controller.value?.loadInitial()
})
</script>

<template>
  <re-page ref="page">
    <template #body>
      <section class="box box-widget warranty-item-page" aria-labelledby="warranty-item-title">
        <div class="box-header with-border">
          <h1 id="warranty-item-title" class="box-title">Warranty Item</h1>
          <p class="access-label">{{ access.label }}</p>
        </div>
        <div class="box-body">
          <p v-if="access.status === 'unavailable'" role="alert">
            Warranty Item access could not be verified. Reload the page to try again.
          </p>
          <p v-else-if="access.status === 'denied'" role="alert">
            You do not have permission to view Warranty Items.
          </p>
          <template v-else-if="access.canReadList">
            <form class="warranty-item-filters" @submit.prevent="controller?.updateFilters(filters)">
              <div class="form-group">
                <label for="warranty-item-field">Search by</label>
                <select id="warranty-item-field" v-model="filters.field" class="form-control input-sm">
                  <option value="war_code">Warranty Code</option>
                  <option value="war_des">Warranty Name</option>
                </select>
              </div>
              <div class="form-group">
                <label for="warranty-item-text">Search</label>
                <input id="warranty-item-text" v-model="filters.text" type="search" class="form-control input-sm">
              </div>
              <div class="form-group">
                <label for="warranty-item-active">Status</label>
                <select id="warranty-item-active" v-model="filters.active" class="form-control input-sm">
                  <option value="Y">Active only</option>
                  <option value="N">All statuses</option>
                </select>
              </div>
              <button type="submit" class="btn btn-sm bg-navy" :disabled="busy || !controller">Search</button>
            </form>

            <p v-if="state.status === 'initial-loading'" role="status">Loading Warranty Items…</p>
            <p v-else-if="state.status === 'refreshing'" role="status">Refreshing Warranty Items… Previous results remain visible.</p>
            <div v-else-if="state.status === 'error'" class="alert alert-danger" role="alert">
              <p>{{ state.error?.message || 'Unable to load Warranty Items.' }}</p>
              <p v-if="state.items.length">Showing previous results from page {{ displayedPage }}.</p>
              <button type="button" class="btn btn-sm btn-default" @click="retry">Retry</button>
            </div>
            <p v-else-if="state.status === 'loaded' && !state.items.length" role="status">No Warranty Items found.</p>

            <div v-if="state.items.length" class="table-responsive" :aria-busy="busy">
              <table class="table table-bordered table-striped">
                <caption>Warranty Items — page {{ displayedPage }}, {{ state.total }} total rows</caption>
                <thead>
                  <tr>
                    <th scope="col">No.</th>
                    <th scope="col">Code</th>
                    <th scope="col">Name</th>
                    <th scope="col">Group</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Lifetime</th>
                    <th scope="col">Active</th>
                    <th scope="col">Added by</th>
                    <th scope="col">Added at</th>
                    <th scope="col">Edited by</th>
                    <th scope="col">Edited at</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in state.items" :key="item.code">
                    <td>{{ (displayedPage - 1) * state.query.pageSize + index + 1 }}</td>
                    <td>{{ item.code }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.groupName }}</td>
                    <td>{{ item.durationLabel }}</td>
                    <td>{{ item.lifetime ? 'Yes' : 'No' }}</td>
                    <td>{{ item.active ? 'Yes' : 'No' }}</td>
                    <td>{{ item.addedBy ?? '—' }}</td>
                    <td>{{ item.addedAt ?? '—' }}</td>
                    <td>{{ item.editedBy ?? '—' }}</td>
                    <td>{{ item.editedAt ?? '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <nav class="warranty-item-paging" aria-label="Warranty Item pages">
              <button
                type="button"
                class="btn btn-sm btn-default"
                :disabled="busy || !controller || state.query.page <= 1"
                aria-label="First page"
                @click="controller?.goToPage(1)"
              >First</button>
              <button
                type="button"
                class="btn btn-sm btn-default"
                :disabled="busy || !controller || state.query.page <= 1"
                aria-label="Previous page"
                @click="controller?.goToPage(state.query.page - 1)"
              >Previous</button>
              <button
                v-for="pageNumber in pageNumbers"
                :key="pageNumber"
                type="button"
                class="btn btn-sm btn-default"
                :disabled="busy || !controller || pageNumber === state.query.page"
                :aria-current="pageNumber === state.query.page ? 'page' : undefined"
                :aria-label="`Page ${pageNumber}`"
                @click="controller?.goToPage(pageNumber)"
              >{{ pageNumber }}</button>
              <span>Page {{ state.query.page }} of {{ state.maxPage }} · {{ state.total }} total rows</span>
              <button
                type="button"
                class="btn btn-sm btn-default"
                :disabled="busy || !controller || state.query.page >= state.maxPage"
                aria-label="Next page"
                @click="controller?.goToPage(state.query.page + 1)"
              >Next</button>
              <button
                type="button"
                class="btn btn-sm btn-default"
                :disabled="busy || !controller || state.query.page >= state.maxPage"
                aria-label="Last page"
                @click="controller?.goToPage(state.maxPage)"
              >Last</button>
            </nav>
          </template>
        </div>
      </section>
    </template>
  </re-page>
</template>

<style scoped>
.access-label { margin: 8px 0 0; }
.warranty-item-filters { display: flex; flex-wrap: wrap; align-items: end; gap: 12px; margin-bottom: 16px; }
.warranty-item-filters .form-group { margin-bottom: 0; }
.warranty-item-paging { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 16px; }
</style>
