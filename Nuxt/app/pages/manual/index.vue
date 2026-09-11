<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TargetDialog from '~/components/ui/TargetDialog.vue'
import TargetState from '~/components/ui/TargetState.vue'
import {
  buildModuleTabs,
  createDefaultDateRange,
  filterManualRows,
  formatDisplayDate,
  formatLegacyApiDate,
  isPreviewableImage,
  nextTabIndex,
  type ManualAttachment,
  type ManualModule,
  type ManualRow,
  type ManualTab,
  type RevisionCondition,
} from '~/features/manual/manual-model'
import { createManualService } from '~/features/manual/manual-service'

type SearchMode = 'date' | 'revision'
type ViewStatus = 'idle' | 'loading' | 'ready' | 'error'

const api = useApiClient()
const files = useFileCapability()
const localization = useLocalizationAdapter()
const session = useSessionAdapter()
const manual = createManualService(api)
const { startDate: initialStartDate, endDate: initialEndDate } = createDefaultDateRange(new Date())
const t = localization.t

useHead({ title: t('manual.title') })

const mode = ref<SearchMode>('date')
const startDate = ref(initialStartDate)
const endDate = ref(initialEndDate)
const startRevision = ref('')
const endRevision = ref('')
const condition = ref<RevisionCondition>('between')
const rows = ref<ManualRow[]>([])
const tabs = ref<ManualTab[]>(buildModuleTabs([]))
const activeModule = ref<ManualModule>('ALL')
const listStatus = ref<ViewStatus>('idle')
const listError = ref('')
const selectedRow = ref<ManualRow | null>(null)
const attachments = ref<ManualAttachment[]>([])
const attachmentStatus = ref<ViewStatus>('idle')
const attachmentError = ref('')

const visibleRows = computed(() => filterManualRows(rows.value, activeModule.value))
const dialogTitle = computed(() => selectedRow.value
  ? `${t('manual.attachments')}: ${selectedRow.value.subject}`
  : t('manual.attachments'))

async function search() {
  listStatus.value = 'loading'
  listError.value = ''

  const result = mode.value === 'date'
    ? await manual.readByDate(formatLegacyApiDate(startDate.value), formatLegacyApiDate(endDate.value))
    : await manual.readByRevision(startRevision.value, endRevision.value, condition.value)

  if (!result.ok) {
    listStatus.value = 'error'
    listError.value = result.error.message
    return
  }

  rows.value = Array.isArray(result.data.data) ? result.data.data : []
  tabs.value = buildModuleTabs(Array.isArray(result.data.total) ? result.data.total : [])
  activeModule.value = 'ALL'
  listStatus.value = 'ready'
}

function selectTab(module: ManualModule) {
  activeModule.value = module
}

function onTabKeydown(event: KeyboardEvent, index: number) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    return
  }

  event.preventDefault()
  const targetIndex = nextTabIndex(index, event.key, tabs.value.length)
  activeModule.value = tabs.value[targetIndex]?.id || 'ALL'
  const buttons = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
  buttons?.[targetIndex]?.focus()
}

async function openAttachments(row: ManualRow) {
  selectedRow.value = row
  attachments.value = []
  attachmentStatus.value = 'loading'
  attachmentError.value = ''

  const result = await manual.readAttachments(row.job_no, row.module, row.revision)
  if (!result.ok) {
    attachmentStatus.value = 'error'
    attachmentError.value = result.error.message
    return
  }

  attachments.value = Array.isArray(result.data) ? result.data : []
  attachmentStatus.value = 'ready'
}

function closeAttachments() {
  selectedRow.value = null
  attachments.value = []
  attachmentStatus.value = 'idle'
}

onMounted(() => {
  if (!session.getContext().isAuthenticated) {
    session.redirectToLogin()
    return
  }

  void search()
})
</script>

<template>
  <main class="target-page manual-page">
    <header class="target-page__header">
      <div>
        <p class="target-eyebrow">Mango CSM</p>
        <h1 class="target-page__title">{{ t('manual.title') }}</h1>
        <p class="target-page__description">{{ t('manual.description') }}</p>
      </div>
    </header>

    <section class="target-panel" aria-labelledby="manual-filters-title">
      <form class="target-panel__section" @submit.prevent="search">
        <h2 id="manual-filters-title" class="target-section-title">{{ t('manual.filters') }}</h2>
        <fieldset class="manual-mode">
          <legend class="manual-visually-hidden">{{ t('manual.filters') }}</legend>
          <label class="manual-choice">
            <input v-model="mode" type="radio" value="date">
            {{ t('manual.dateMode') }}
          </label>
          <label class="manual-choice">
            <input v-model="mode" type="radio" value="revision">
            {{ t('manual.revisionMode') }}
          </label>
        </fieldset>

        <div v-if="mode === 'date'" class="target-form-grid">
          <label class="target-field">
            <span class="target-field__label">{{ t('manual.startDate') }}</span>
            <input v-model="startDate" class="target-control" type="date" required>
          </label>
          <label class="target-field">
            <span class="target-field__label">{{ t('manual.endDate') }}</span>
            <input v-model="endDate" class="target-control" type="date" required>
          </label>
        </div>

        <div v-else class="target-form-grid">
          <label class="target-field">
            <span class="target-field__label">{{ t('manual.startRevision') }}</span>
            <input v-model="startRevision" class="target-control" type="text">
          </label>
          <label class="target-field">
            <span class="target-field__label">{{ t('manual.endRevision') }}</span>
            <input v-model="endRevision" class="target-control" type="text">
          </label>
          <label class="target-field target-field--wide">
            <span class="target-field__label">{{ t('manual.condition') }}</span>
            <select v-model="condition" class="target-control">
              <option value="between">{{ t('manual.between') }}</option>
              <option value="more_than">{{ t('manual.moreThan') }}</option>
              <option value="less_than">{{ t('manual.lessThan') }}</option>
              <option value="equal">{{ t('manual.equal') }}</option>
            </select>
          </label>
        </div>

        <div class="manual-search-actions">
          <button class="target-button" type="submit" :disabled="listStatus === 'loading'">
            {{ t('manual.search') }}
          </button>
        </div>
      </form>

      <div class="target-panel__section manual-results">
        <TargetState v-if="listStatus === 'loading' || listStatus === 'idle'" kind="loading" :title="t('manual.loading')" />
        <TargetState v-else-if="listStatus === 'error'" kind="error" :title="t('manual.error')" :message="listError">
          <button type="button" class="target-button target-button--secondary manual-retry" @click="search">
            {{ t('manual.retry') }}
          </button>
        </TargetState>
        <template v-else>
          <div class="target-tabs" role="tablist" :aria-label="t('manual.title')">
            <button
              v-for="(tab, index) in tabs"
              :id="`manual-tab-${tab.id}`"
              :key="tab.id"
              class="target-tab"
              type="button"
              role="tab"
              :aria-selected="activeModule === tab.id"
              :tabindex="activeModule === tab.id ? 0 : -1"
              :aria-controls="`manual-panel-${tab.id}`"
              @click="selectTab(tab.id)"
              @keydown="onTabKeydown($event, index)"
            >
              {{ tab.text }} <span class="target-tab__count">{{ tab.total }}</span>
            </button>
          </div>

          <div
            :id="`manual-panel-${activeModule}`"
            role="tabpanel"
            :aria-labelledby="`manual-tab-${activeModule}`"
          >
            <TargetState v-if="visibleRows.length === 0" kind="empty" :title="t('manual.empty')" />
            <div v-else class="target-table-wrap">
              <table class="target-table">
                <thead>
                  <tr>
                    <th class="target-table__number" scope="col">{{ t('manual.number') }}</th>
                    <th scope="col">{{ t('manual.revision') }}</th>
                    <th scope="col">{{ t('manual.subject') }}</th>
                    <th scope="col">{{ t('manual.date') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in visibleRows" :key="`${row.job_no}-${row.module}-${row.revision}-${index}`">
                    <td class="target-table__number">{{ index + 1 }}</td>
                    <td>{{ row.revision }}</td>
                    <td>
                      <button type="button" class="manual-subject" @click="openAttachments(row)">
                        {{ row.subject }}
                      </button>
                    </td>
                    <td>{{ formatDisplayDate(row.add_dt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </div>
    </section>

    <TargetDialog
      :open="selectedRow !== null"
      :title="dialogTitle"
      :close-label="t('manual.close')"
      @close="closeAttachments"
    >
      <TargetState v-if="attachmentStatus === 'loading'" kind="loading" :title="t('manual.attachmentLoading')" />
      <TargetState v-else-if="attachmentStatus === 'error'" kind="error" :title="t('manual.attachmentError')" :message="attachmentError" />
      <TargetState v-else-if="attachments.length === 0" kind="empty" :title="t('manual.attachmentEmpty')" />
      <ul v-else class="manual-attachments">
        <li v-for="attachment in attachments" :key="attachment.filepath" class="manual-attachment">
          <img
            v-if="isPreviewableImage(attachment.filepath)"
            class="manual-attachment__preview"
            :src="files.openUrl(attachment.filepath)"
            :alt="attachment.description || selectedRow?.subject || ''"
          >
          <div class="manual-attachment__body">
            <p class="manual-attachment__name">{{ attachment.description || attachment.filepath }}</p>
            <div class="manual-attachment__actions">
              <a class="target-file-action" :href="files.openUrl(attachment.filepath)" target="_blank" rel="noopener">
                {{ t('manual.open') }}
              </a>
              <a class="target-file-action" :href="files.openUrl(attachment.filepath, { download: true })">
                {{ t('manual.download') }}
              </a>
            </div>
          </div>
        </li>
      </ul>
    </TargetDialog>
  </main>
</template>

<style scoped>
.manual-mode {
  display: flex;
  padding: 0;
  margin: 0 0 var(--target-space-md);
  border: 0;
  gap: var(--target-space-lg);
}

.manual-choice {
  display: inline-flex;
  align-items: center;
  gap: var(--target-space-sm);
  color: var(--target-color-brand);
  cursor: pointer;
  font-weight: 650;
}

.manual-choice input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--target-color-action);
}

.manual-search-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--target-space-md);
}

.manual-results {
  padding: 0;
  overflow: hidden;
}

.manual-subject {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--target-color-action);
  cursor: pointer;
  font: inherit;
  font-weight: 650;
  text-align: left;
  text-decoration: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.18em;
}

.manual-subject:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--target-color-focus) 42%, transparent);
  outline-offset: 3px;
}

.manual-retry {
  width: auto;
  margin-top: var(--target-space-md);
}

.manual-attachments {
  display: grid;
  padding: 0;
  margin: 0;
  gap: var(--target-space-md);
  list-style: none;
}

.manual-attachment {
  display: grid;
  grid-template-columns: minmax(8rem, 14rem) minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--target-color-border);
  border-radius: var(--target-radius-md);
}

.manual-attachment__preview {
  width: 100%;
  height: 10rem;
  object-fit: contain;
  background: var(--target-color-surface-muted);
}

.manual-attachment__body {
  display: grid;
  padding: var(--target-space-md);
  align-content: center;
  gap: var(--target-space-sm);
}

.manual-attachment__name {
  overflow-wrap: anywhere;
  margin: 0;
  font-weight: 650;
}

.manual-attachment__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--target-space-md);
}

.manual-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  border: 0;
  margin: -1px;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 48rem) {
  .manual-mode,
  .manual-search-actions {
    display: grid;
  }

  .manual-attachment {
    grid-template-columns: 1fr;
  }
}
</style>
