<script setup lang="ts">
const targetRuntime = useTargetRuntimeConfig()
</script>

<template>
  <main class="target-shell">
    <section class="target-card" aria-labelledby="shell-title">
      <p class="target-eyebrow">Nuxt 4 / Vite target shell</p>
      <h1 id="shell-title">Mango CSM target application</h1>
      <p class="target-copy">
        The target frontend boundary is ready for future route migration.
      </p>
      <dl class="target-contract">
        <div>
          <dt>Public base path</dt>
          <dd><code>{{ targetRuntime.publicBasePath }}</code></dd>
        </div>
        <div>
          <dt>Rendering</dt>
          <dd>Client-side SPA</dd>
        </div>
        <div>
          <dt>Legacy route space</dt>
          <dd><code>/page/**</code> remains unchanged</dd>
        </div>
      </dl>
    </section>
  </main>
</template>
