<template>
  <div>
    <customer-page ref="page">
      <template #body>
        <div class="row p-3">
          <div class="col-12 mb-2">
            <div class="btn-group shadow-sm" style="margin-left: 15px;">
              <button @click="switchMode('demo')" :class="['btn', currentMode === 'demo' ? 'btn-primary' : 'btn-outline-primary']"> Demo Mode</button>
              <button @click="switchMode('production')" :class="['btn', currentMode === 'production' ? 'btn-danger' : 'btn-outline-danger']"> Production Mode</button>
            </div>
          </div>

          <div class="col-12 position-relative">
            <iframe v-if="iframeUrl"
                    ref="mangoIframe"
                    :src="iframeUrl"
                    @load="sendAuthData"
                    style="width: 98%; height: 85vh; border: 1px solid #ddd; border-radius: 8px; margin-left: 15px;">
            </iframe>
            <div v-if="isWaitingForChild" class="iframe-loader">
              <div class="spinner-border text-primary"></div>
              <p class="mt-2">Connecting to Mango Add Spec ({{ currentMode }})...</p>
            </div>
          </div>
        </div>
      </template>
    </customer-page>
  </div>
</template>

<script type="text/javascript">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  let page = null
  export default {
    setup(props) {
      // Vue 3's setup context has no `refs` (Vue 2's composition-api plugin had
      // one), so every `refs.x` below threw "Cannot read properties of undefined".
      // The template refs are declared here and returned under their template
      // names; `refs` reads them, so the code below is unchanged.
      const mangoIframe = ref(null)
      const pageRef = ref(null)
      const refs = {
        get page() { return pageRef.value },
        get mangoIframe() { return mangoIframe.value }
      }

      const iframeUrl = ref('')
      const currentMode = ref('demo')
      const isWaitingForChild = ref(true)
      let mangoOrigin = null
      const auth = window.customer_auth
      //addSpec_page
      let ENV = {}

      const sendAuthData = () => {
        const iframeWin = refs.mangoIframe.contentWindow;
        const payload = {
          type: currentMode.value,
          passcode: auth.userid,
          typeMode: currentMode.value,
          customerAuth: auth
        };
        const targetOrigin = mangoOrigin;

        iframeWin.postMessage(payload, targetOrigin);

        console.log('Parent: [Sent Payload]', payload, 'to', targetOrigin);
      };

      const buildUrl = async () => {
        const config = ENV[currentMode.value]
        const url = new URL(config.baseUrl)
        url.searchParams.append('type', currentMode.value)
        url.searchParams.append('passcode', auth.userid)
        console.log('url', url.toString())
        iframeUrl.value = url.toString()
        isWaitingForChild.value = false
      }

      const handleMessage = (event) => {
        if (event.origin !== mangoOrigin) return

        const { type } = event.data || {}
        console.log('Parent: [Received]', type)

        isWaitingForChild.value = false
      }

      const switchMode = (mode) => {
        currentMode.value = mode
        buildUrl()
      }

      onMounted(async () => {
        page = refs.page
        page.pageTitle = 'CSM : Data View (Add Spec)'
        document.title = page.pageTitle
        await $xt.sleep(500)
        mangoOrigin = window.page_addspec
        ENV = {
          demo: {
            baseUrl: `${mangoOrigin}/page/embed/chartdb`,
            passcode: auth.userid
          },
          production: {
            baseUrl: `${mangoOrigin}/page/embed/chartdb`,
            passcode: auth.userid
          }
        }
        console.log(' window.page_addspec', window.page_addspec)
        window.addEventListener('message', handleMessage)
    
        buildUrl()
      })

      onBeforeUnmount(async () => {

        window.removeEventListener('message', handleMessage)
        
      })

      return {
        page: pageRef,
        mangoIframe,
        iframeUrl,
        currentMode,
        isWaitingForChild,
        switchMode,
        sendAuthData
      }
    }
  }
</script>

<style scoped>
  .iframe-loader {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255,255,255,0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
</style>
