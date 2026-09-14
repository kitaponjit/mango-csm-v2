<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import TargetState from '~/components/ui/TargetState.vue'
import type { LoginCompany } from '~/services/authentication/authentication-service'

const authentication = useAuthenticationService()
const localization = useLocalizationAdapter()
const router = useRouter()
const t = localization.t

const form = reactive({
  maincode: '',
  userid: '',
  userpass: '',
})
const submitting = ref(false)
const error = ref('')
const companies = ref<LoginCompany[]>([])
const companiesLoading = ref(true)
const companyError = ref('')

useHead({ title: t('auth.title') })

async function loadCompanies() {
  companiesLoading.value = true
  companyError.value = ''
  const result = await authentication.listCompanies()
  companiesLoading.value = false

  if (!result.ok) {
    companyError.value = result.error
    return
  }

  companies.value = result.data
  const defaultCompany = result.data.find(company => company.defaultLogin) ?? result.data[0]
  if (!form.maincode && defaultCompany) form.maincode = defaultCompany.maincode
}

onMounted(loadCompanies)

async function submit() {
  error.value = ''
  if (!form.maincode.trim() || !form.userid.trim() || !form.userpass) {
    error.value = t('auth.required')
    return
  }

  submitting.value = true
  const result = await authentication.login({
    maincode: form.maincode.trim(),
    userid: form.userid.trim(),
    userpass: form.userpass,
  })
  submitting.value = false

  if (!result.ok) {
    error.value = result.error
    return
  }

  await router.replace('/manual')
}
</script>

<template>
  <main class="target-page authentication-page">
    <header class="target-page__header">
      <div>
        <p class="target-eyebrow">Mango CSM</p>
        <h1 class="target-page__title">{{ t('auth.title') }}</h1>
        <p class="target-page__description">{{ t('auth.description') }}</p>
      </div>
    </header>

    <section class="target-panel authentication-card" aria-labelledby="authentication-title">
      <form class="target-panel__section authentication-form" @submit.prevent="submit">
        <h2 id="authentication-title" class="target-section-title">{{ t('auth.formTitle') }}</h2>

        <label class="target-field">
          <span class="target-field__label">{{ t('auth.company') }}</span>
          <select
            v-if="companies.length || companiesLoading"
            v-model="form.maincode"
            class="target-control"
            :disabled="companiesLoading"
            required
          >
            <option value="" disabled>
              {{ companiesLoading ? t('auth.companyLoading') : t('auth.companySelect') }}
            </option>
            <option
              v-for="company in companies"
              :key="company.maincode"
              :value="company.maincode"
            >
              {{ company.mainname }} ({{ company.maincode }})
            </option>
          </select>
          <input
            v-else
            v-model="form.maincode"
            class="target-control"
            type="text"
            autocomplete="organization"
            required
          >
        </label>

        <div v-if="companyError" class="company-query-error">
          <span>{{ t('auth.companyLoadFailed') }}</span>
          <button type="button" class="company-query-retry" @click="loadCompanies">
            {{ t('auth.companyRetry') }}
          </button>
        </div>

        <label class="target-field">
          <span class="target-field__label">{{ t('auth.user') }}</span>
          <input
            v-model="form.userid"
            class="target-control"
            type="text"
            autocomplete="username"
            required
          >
        </label>

        <label class="target-field">
          <span class="target-field__label">{{ t('auth.password') }}</span>
          <input
            v-model="form.userpass"
            class="target-control"
            type="password"
            autocomplete="current-password"
            required
          >
        </label>

        <TargetState
          v-if="error"
          kind="error"
          :title="t('auth.failed')"
          :message="error"
        />

        <button class="target-button authentication-submit" type="submit" :disabled="submitting">
          {{ submitting ? t('auth.submitting') : t('auth.submit') }}
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.authentication-page {
  max-width: 56rem;
}

.authentication-card {
  max-width: 34rem;
  margin: 0 auto;
}

.authentication-form {
  display: grid;
  gap: var(--target-space-md);
}

.authentication-submit {
  width: 100%;
  margin-top: var(--target-space-sm);
}

.company-query-error {
  display: flex;
  flex-wrap: wrap;
  gap: var(--target-space-sm);
  color: var(--target-color-danger, #b42318);
  font-size: 0.875rem;
}

.company-query-retry {
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}
</style>
