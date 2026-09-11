<template>
  <div>
    <modal ref="centerModal" sheet-class="ct-sheet">
      <template #header>
        <h4><i class="fa fa-gear"></i> Customer Config</h4>
      </template>
      <template #body>
        <div class="customer-config">
          <div class="row no-gutters">
            <div class="col-md-12">
              <div class="border rounded p-3 bg-white">
                <div class="icon-grid">
                  <div class="icon-card"
                      @click="onLinkTo({ type: 'application', context: modalContext })"
                      role="button" tabindex="0">
                    <i class="fa fa-gear fa-3x mb-2"></i>
                    <div class="h6 mb-0">Application Setting</div>
                  </div>
                  <div class="icon-card"
                      @click="onLinkTo({ type: 'company', context: modalContext })"
                      role="button" tabindex="0">
                    <i class="fa fa-gear fa-3x mb-2"></i>
                    <div class="h6 mb-0">Company Setting</div>
                  </div>
                  <div class="icon-card"
                      @click="onLinkTo({ type: 'document_running', context: modalContext })"
                      role="button" tabindex="0">
                    <i class="fa fa-gear fa-3x mb-2"></i>
                    <div class="h6 mb-0">Document Running Setting</div>
                  </div>
                  <!-- เพิ่มการ์ดอื่น ๆ ได้เรื่อย ๆ -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button type="button" class="btn btn-sm modal-close-btn" @click="closeModal()">
          <i class="fa fa-times"></i> {{ ui.close }}
        </button>
      </template>
    </modal>
  </div>
</template>

<script type="text/javascript">
export default {
  data() {
    return {
      baseUrl,
      baseRoute,
      queryString,
      ui,
      q: "",              // คำค้น
      modalContext: { source: null, formData: null }
    };
  },
  methods: {
    openModal(ctx) {
      this.modalContext = { ...(ctx || { source: null, formData: null }) };
      this.$refs.centerModal.openModal();
    },
    closeModal() {
      this.$refs.centerModal.closeModal();
    },
    onLinkTo(x) {
      const token = this.createToken(x.context?.source, x.context?.formData);

      const linkMap = {
        application: "SetupApplication/v_csm_setup_application",
        company: "SetupCompany/v_csm_setup_company",
        document_running: "SetupDocumentRunning/v_csm_setup_document_running",
      };

      const page = linkMap[x.type];

      if (!page) {
        console.warn("Unknown linkto type:", x);
        return;
      }

      const url =
        this.baseUrl +
        `page/CustomerConfigCenter/${page}` +
        `?token=${token}` +
        `&type=${x.context?.source}` +
        `&ref_cus_code=${x.context?.formData?.ref_cus_code}`;

      window.open(url, "_blank");
    },

    createToken(source, formData) {
      if (!formData) return null;
      let ServicePath = "";

      if (source === "production") {
        ServicePath = formData.app_path_prod.trim();
      } else {
        ServicePath = formData.app_path_demo.trim();
      }
      const token = (crypto.randomUUID?.() || Math.random().toString(36).slice(2));
      window.localStorage.setItem(`svc:${token}`, JSON.stringify({
        ServicePath,
      }));
      return token;
    },
  },
  mounted() {
    this.$refs.centerModal.setSize('modal-md');
  },
};
</script>

<style scoped>
.customer-config .icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
}

.customer-config .icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease;
  min-height: 120px;
  min-width: 120px;
  user-select: none;
  background-color: #164a8a;
  color: white;
}

.customer-config .icon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, .08);
}

.divider-left {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 5px;
}

.divider-left span {
  white-space: nowrap;
  font-weight: bold;
}

.divider-left .line {
  flex-grow: 1;
  border-top: 1px solid #ccc;
}
</style>
