<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <ag-table ref="agr"
                  :scale="120"
                  :footer="false"
                  :sorting="true"
                  @ready="initTable()"
                  @cell-clicked="cellClicked($event)">
        </ag-table>
      </div>
    </div>
    <button class="btn btn-sm" @click="downloadJson" :disabled="isDownload">Download JSON</button>
  </div>
</template>
<script>
  import { onMounted, ref } from 'vue';

  async function hashSHA256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const buffer = await crypto.subtle.digest("SHA-256", data);

    return [...new Uint8Array(buffer)]
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  export default {
    setup(props, { refs }) {

      const details = ref([]);

      const isDownload = ref(false);

      const goto = no => window.open(window.baseUrl + 'page/transaction/v_csm_trn_001?job_no=' + no, '_blank');

      const initTable = () => {
        let agr = refs.agr;
        if (!agr) { return }

        let fields = [
          ['job_no', 'CSR No.', 'text', {
            width: 140, pinned: 'left',
            cellRenderer: p => `<a style="color:#4f6ef7;font-weight:600;cursor:pointer;">${p.value || ''}</a>`
          }],
          ['job_date', 'Job Date', 'date', { width: 120, align: 'center' }, { useCellRenderer: true }],
          ['pre_event', 'Project/Dep', 'text', {
            width: 200,
            valueGetter: p => (p?.data?.pre_event || p?.data?.dpt_no || '')
          }],
          ['customer', 'Customer', 'text', { width: 240, tooltipField: 'customer' }],
          ['platform', 'Platform', 'text', { width: 140, align: 'center' }],
          ['module', 'Module', 'text', { width: 140 }],
          ['service_name', 'Service', 'text', { width: 180 }],
          ['due_date', 'Due Date', 'date', { width: 180, align: 'center' }, { useCellRenderer: true }],
          ['ref_revision', 'Revision (UAT)', 'text', { width: 180 , align: 'center'  }],
          ['revision_prod', 'Revision (PROD)', 'text', { width: 180, align: 'center'  }],
          ['request_name', 'Requester', 'text', { width: 170 }],
          ['worker_name', 'Worker', 'text', { width: 170 }],
          ['status_name', 'Status', 'text', { width: 170 }],
          ['complete_date', 'Complete Date', 'date', { width: 180, align: 'center' }, { useCellRenderer: true }],
          ['detail', 'Detail', 'text', { width: 400, tooltipField: 'detail' }],
        ];

        agr.setHeader(agr.createHeaderFromArray(fields));
      }

      const cellClicked = e => {
        if (e?.col !== 'job_no') { return }
        if (!e?.data?.job_no) { return }
        goto(e.data.job_no);
      }

      const createRandomFilename = async () => `${moment().format('YYYYMMDDHHmmss')}${await hashSHA256(crypto.randomUUID())}`.substring(0, 32);

      const downloadJson = async () => {
        if (isDownload.value) { return }

        isDownload.value = true;
        // 2. แปลงเป็น JSON string (format สวย ๆ ด้วย spacing 2 ช่อง)
        const jsonStr = JSON.stringify(details.value, null, 2);

        // 3. สร้าง Blob
        const blob = new Blob([jsonStr], { type: "application/json" });

        // 4. สร้าง URL สำหรับ Blob
        const url = URL.createObjectURL(blob);

        // 5. สร้าง <a> element สำหรับดาวน์โหลด
        const a = document.createElement("a");
        a.href = url;
        a.download = (await createRandomFilename()) + ".json"; // ตั้งชื่อไฟล์
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // 6. cleanup URL
        URL.revokeObjectURL(url);
        await $xt.sleep(3000)
        isDownload.value = false;

      }

      onMounted(async () => {
        details.value = $linq(JSON.parse(window.pass_data || '[]'))
          .orderBy(x => x.worker_name || '')
          .thenBy(x => x.flatform || '')
          .thenBy(x => x.module || '')
          .toArray();

        initTable();
        refs.agr?.setDisplay(details.value);
      })

      return {
        details,
        goto,
        initTable,
        cellClicked,
        downloadJson,
        isDownload
      }
    }
  }
</script>
