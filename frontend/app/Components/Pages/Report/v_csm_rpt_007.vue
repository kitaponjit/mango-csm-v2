<template>
  <div>
    <report ref="rpt"
            :extra-cond2="extraCond"
            :use-print-template="true"
            :grid-header="grid_header"
            :printPDF="true"
            :raw-data="rawData"
            :raw-file-cache="raw_filename"
            raw-name="v_csm_rpt_007">

        <template #extra-cond>
          <div class="row">
            <div class="col-md-4">
              <div class="form-group">
                <label class="text-danger">โครงการหลัก</label>
                <span class="input-group">
                  <input type="text" class="form-control input-sm text-bold" v-model="headerData['pre_event']" readonly />
                  <span class="input-group-btn">
                    <button class="btn btn-sm bg-navy" @click="openProjectModal()"><i class="fa fa-search"></i></button>
                    <button class="btn btn-sm btn-danger" @click="resetData('project')"><i class="fa fa-close"></i></button>
                  </span>
                </span>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label>ชื่อโครงการ</label>
                <input type="text" class="form-control input-sm" v-model="headerData.pre_des" readonly />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4">
              <div class="form-group">
                <label class="text-danger">โครงการย่อย (Unit / Phase)</label>
                <span class="input-group">
                  <input type="text" class="form-control input-sm text-bold" v-model="headerData['pre_event_unit']" readonly />
                  <span class="input-group-btn">
                    <button class="btn btn-sm bg-navy" @click="$refs.ct_project_unit.openModal()" :disabled="xt.isEmpty(headerData.pre_event)"><i class="fa fa-search"></i></button>
                    <button class="btn btn-sm btn-danger" :disabled="xt.isEmpty(headerData.pre_event)" @click="resetData('phase')"><i class="fa fa-close"></i></button>
                  </span>
                </span>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label>ชื่อโครงการย่อย</label>
                <input type="text" class="form-control input-sm" v-model="headerData.pre_des_unit" readonly />
              </div>
            </div>
          </div>
        </template>

        <template #display>
          <div class="margin-b-15">
            <span style="font-weight: 600; font-size: 14px;">
              <i class="fas fa-building margin-r-5"></i>Project: {{ !xt.isEmpty(headerData.pre_event2) || !xt.isEmpty(headerData.pre_event) ? headerData.project_name || 'ไม่ได้เลือกโครงการ' : 'ALL'}}
            </span>
          </div>

          <!-- Summary Cards -->
          <div class="row margin-b-15">
            <div class="col-md-4 col-sm-6 col-xs-12">
              <div class="info-box" style="cursor: pointer; border-radius: 8px;" @click="showParcelsByStatus('all')" :class="{'active-box-xx1' : activeStatus === 'all'}">
                <span class="info-box-icon" style="background-color: #add8e6; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; color: #fff; margin-top: 8px; margin-left: 8px;">
                  <i class="fas fa-cube"></i>
                </span>
                <div class="info-box-content">
                  <span class="info-box-text">พัสดุทั้งหมด</span>
                  <span class="info-box-number">{{parcelsData.length}} รายการ</span>
                </div>
              </div>
            </div>

            <div class="col-md-4 col-sm-6 col-xs-12">
              <div class="info-box" style="cursor: pointer; border-radius: 8px;" @click="showParcelsByStatus('pending')" :class="{'active-box-xx2' : activeStatus === 'pending'}">
                <span class="info-box-icon" style="background-color: #ffa500; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; color: #fff; margin-top: 8px; margin-left: 8px;">
                  <i class="fas fa-clock"></i>
                </span>
                <div class="info-box-content">
                  <span class="info-box-text">พัสดุรอดำเนินการ</span>
                  <span class="info-box-number">{{pendingParcelsCount}} รายการ</span>
                </div>
              </div>
            </div>

            <div class="col-md-4 col-sm-6 col-xs-12">
              <div class="info-box" style="cursor: pointer; border-radius: 8px;" @click="showParcelsByStatus('completed')" :class="{'active-box' : activeStatus === 'completed'}">
                <span class="info-box-icon" style="background-color: #28a745; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; color: #fff; margin-top: 8px; margin-left: 8px;">
                  <i class="fas fa-check"></i>
                </span>
                <div class="info-box-content">
                  <span class="info-box-text">พัสดุเสร็จสิ้น</span>
                  <span class="info-box-number">{{completedParcelsCount}} รายการ</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Search -->
          <div class="row margin-b-15">
            <div class="col-lg-4 col-md-6">
              <div class="form-group">
                <label><i class="fas fa-search margin-r-5"></i>ค้นหาเลขพัสดุ</label>
                <span class="input-group">
                  <input type="text" class="form-control input-sm" v-model="searchArea.search_text" @keyup.enter="doSearch()" placeholder="พิมพ์เลขพัสดุ..." />
                  <span class="input-group-btn">
                    <button class="btn btn-sm bg-navy" @click.prevent="doSearch()"><i class="fa fa-search"></i></button>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <!-- Table -->
          <ag-table ref="agr" :data="dataParcelDisplay" :footer="false"></ag-table>
        </template>

        <template #export>
        </template>
      </report>

      <!-- Modal : Center -->
      <vue-project-list ref="ct_project" @send-data="sendComponent($event, 'project')"></vue-project-list>
      <vue-project-unit-list ref="ct_project_unit" :pre_event2="headerData['pre_event2']" @send-data="sendComponent($event, 'project_unit')"></vue-project-unit-list>
</div>
</template>

<script type="text/javascript">
  import report from "../../Center/report-condition.vue";

  let rpt = {};

  let condTemplate = [];
  let item_type = [];

  condTemplate.push({
    field_name: "date_add",
    display_name: "Date Import",
    field_type: "date",
    field_group: "search",
    operatorx_arr: ["=", ">", "<", ">=", "<=", "<>"],
    operatorx_default: "<=",
    value_arr: null,
    value_default: moment().format("DD/MM/YYYY"),
    multiple: true,
    multiple_type: "and",
    func_name: "",
  });

  condTemplate.push({
    field_name: "rec_dt",
    display_name: "Date Complete",
    field_type: "date",
    field_group: "search",
    operatorx_arr: ["=", ">", "<", ">=", "<=", "<>"],
    operatorx_default: "<=",
    value_arr: null,
    value_default: moment().format("DD/MM/YYYY"),
    multiple: true,
    multiple_type: "and",
    func_name: "",
  });

  export default {
    data() {
      return {
        xt: $xt,
        baseUrl,
        condTemplate,
        extraCond: {
          pre_event: {
              type: 'string',
              value: null
          },
          pre_event2: {
              type: 'string',
              value: null
          },
        },
        display: [],
        rawData: [],
        grid_header: [],
        raw_filename: "",
        dataParcelDisplay: [],
        parcelsData: [],
        pendingParcels: [],
        completedParcels: [],
        headerData: {
          pre_event: '',
          pre_event2: '',
          pre_event_unit: '',
          pre_des: '',
          pre_des_unit: '',
          house_no: '',
        },
        searchArea: {
          search_text: ''
        },
        activeStatus:'',
      };
    },
    components: {
      report,
    },
    computed: {
      pendingParcelsCount() {
        return this.pendingParcels.length;
      },
      completedParcelsCount() {
        return this.completedParcels.length;
      }
    },
    methods: {
      async setRptData(d, cond) {
        let agr = this.$refs.agr;

        this.display = d.result || [];
        this.rawData = d.raw_data || [];
        this.raw_filename = d.raw_filename || "";

        // Set parcel data for display
        this.parcelsData = d.result || [];
        
        // Process the data
        let o = 1;
        $linq(this.parcelsData).foreach((x) => {
          x.no = o++;
          // Format dates if needed
          if (x.add_dt) {
            x.add_dt = this.$date(x.add_dt, "DD/MM/YYYY HH:mm");
          }
          if (x.rec_dt) {
            x.rec_dt = this.$date(x.rec_dt, "DD/MM/YYYY HH:mm");
          }
        });

        // Filter data into categories
        this.filterParcels();
        
        // Initialize table with the data
        await this.initTable();
        if (agr && agr.setDisplay) {
          agr.setDisplay(this.dataParcelDisplay);
        }
        await this.showParcelsByStatus('all');
      },
      isMango() {
        return isMango == "Y" ? true : false;
      },
      async initTable() {
        let agr = this.$refs.agr;
        if (!agr) return;

        let bold_underline = { "font-weight": "bold" };
        let bold_style = (p) => (p?.data?.bold ? bold_underline : {});

        let fields = [
          ["no", "No.", "text", { width: 100, align: "center" }],
          ["pre_event2", "โครงการย่อย (Unit/Phase)", "text", { width: 400, align: "center", cellStyle: bold_style }],
          ["add_dt", "เวลาเพิ่ม", "text", { width: 200, align: "center" }],
          ["postid", "เลขพัสดุ", "text", { width: 200, align: "center", cellStyle: bold_style }],
          ["rec_dt", "เวลารับ", "text", { width: 200, align: "center" }],
          ["house_no", "เลขที่บ้าน", "text", { flex: 1, align: "center" }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);

        this.grid_header = header;
      },
      showParcelsByStatus(status) {
        this.activeStatus = status;
        switch(status) {
          case 'all':
            this.dataParcelDisplay = [...this.parcelsData];
            break;
          case 'pending':
            this.dataParcelDisplay = [...this.pendingParcels];
            break;
          case 'completed':
            this.dataParcelDisplay = [...this.completedParcels];
            break;
        }
        
        // Reset number sequence for the filtered data
        let o = 1;
        this.dataParcelDisplay.forEach((x) => {
          x.no = o++;
        });
        
        this.initTable();
        let agr = this.$refs.agr;
        if (agr && agr.setDisplay) {
          agr.setDisplay(this.dataParcelDisplay);
        }
      },

      async doSearch() {
        try {
          const searchText = this.searchArea.search_text.trim().toLowerCase();

          if (!searchText) {
            this.dataParcelDisplay = [...this.parcelsData];
          } else {
            this.dataParcelDisplay = this.parcelsData.filter(item =>
              (item.postid && item.postid.toLowerCase().includes(searchText)) ||
              (item.house_no && item.house_no.toLowerCase().includes(searchText)) ||
              (item.refcode && item.refcode.toLowerCase().includes(searchText))
            );
          }
          
          // Reset number sequence for the filtered data
          let o = 1;
          this.dataParcelDisplay.forEach((x) => {
            x.no = o++;
          });
          
          await this.initTable();
          let agr = this.$refs.agr;
          if (agr && agr.setDisplay) {
            agr.setDisplay(this.dataParcelDisplay);
          }
        } catch (ex) {
          $msg.alert('Error', ex.toString(), 'danger');
        }
      },

      filterParcels() {
        this.pendingParcels = this.parcelsData.filter(p => p.post_status === "Y" || p.post_status === "B");
        this.completedParcels = this.parcelsData.filter(p => p.post_status === "C");
        this.dataParcelDisplay = [...this.parcelsData];
      },

      sendComponent(e, keyword) {
        switch (keyword) {
          case 'project':
            this.headerData.pre_event = e.pre_event;
            this.headerData.pre_event2 = e.pre_event2;
            this.headerData.pre_des = e.pre_des;
            this.headerData.project_name = e.pre_des;
            this.headerData.pre_event_unit = null;
            this.headerData.pre_des_unit = null;
            this.extraCond.pre_event2.value = e.pre_event2;
            break;
          case 'project_unit':
            this.headerData.pre_event_unit = e.pre_event;
            this.headerData.pre_des_unit = e.pre_des;
            this.headerData.project_name = e.pre_des;
            this.extraCond.pre_event.value = e.pre_event;
            break;
        }
      },
      resetData(type) {
        switch (type) {
          case 'project':
            // ล้างข้อมูลโครงการหลัก
            this.headerData.pre_event = '';
            this.headerData.pre_event2 = '';
            this.headerData.pre_des = '';
            this.headerData.pre_event_unit = '';
            this.headerData.pre_des_unit = '';
            
            // ล้าง extraCond
            this.extraCond.pre_event.value = null;
            this.extraCond.pre_event2.value = null;
            break;
          case 'phase':
            // ล้างข้อมูลโครงการย่อย เท่านั้น
            this.headerData.pre_event_unit = '';
            this.headerData.pre_des_unit = '';
            // เซ็ต project_name เป็นชื่อโครงการหลัก
            this.headerData.project_name = this.headerData.pre_des;
            // ล้าง extraCond เฉพาะ pre_event (โครงการย่อย)
            this.extraCond.pre_event.value = null;
            this.extraCond.pre_event = {
              type: 'string',
              value: null
            };
            break;
        }
      },
      openProjectModal() {
        this.$refs.ct_project.openModal();
      },
      //createPdfData() {
      //  // Create headers for PDF export
      //  let headers = [
      //    [
      //      { name: "No.", width: 100 },
      //      { name: "Unit/Phase", width: 400 },
      //      { name: "Import Date", width: 200 },
      //      { name: "Parcel ID", width: 200 },
      //      { name: "Complete Date", width: 200 },
      //      { name: "House No.", width: 150 }
      //    ]
      //  ];

      //  // Format data for PDF export
      //  let pdfData = this.dataParcelDisplay.map(item => [
      //    item.no || '',
      //    item.pre_event2 || '',
      //    item.add_dt || '',
      //    item.postid || '',
      //    item.rec_dt || '',
      //    item.house_no || ''
      //  ]);

      //  return {
      //    title: this.title || "Post Office Report",
      //    header: headers,
      //    data: pdfData,
      //    col_width: [100, 400, 200, 200, 200, 150]
      //  };
      //},
      createPdfData() {
        return this.$refs.agr.createPdfData();
      },
    },
    async mounted() {
      rpt = this.$refs.rpt;
      rpt.setTitle("Report : Track And Trace");
      rpt.setTemplate(this.condTemplate);

      let defaultCond = [
        { field_name: "date_add", operatorx: "<=", value: new Date(), not_remove: false },
      ];
      rpt.setDefaultCond(defaultCond);

      // Initialize empty data to prevent undefined errors
      this.parcelsData = [];
      this.dataParcelDisplay = [];
      this.pendingParcels = [];
      this.completedParcels = [];

      await this.initTable();

      // Set the backend API URL - ใช้ pattern เดียวกับไฟล์ report อื่นๆ
      rpt.dataUrl = `CSM/Report/v_csm_rpt_007`;
    },
  };
</script>
<style scoped>
  .active-box {
    border: 2px solid #9af2c1;
    border-radius: 12px;
    background-color: rgba(0, 123, 255, 0.1);
    transition: 0.2s ease-in-out;
  }
  .active-box-xx1 {
    border: 2px solid #7dc7e3;
    border-radius: 12px;
    background-color: rgba(0, 123, 255, 0.1);
    transition: 0.2s ease-in-out;
  }
  .active-box-xx2 {
    border: 2px solid #ede385;
    border-radius: 12px;
    background-color: rgba(0, 123, 255, 0.1);
    transition: 0.2s ease-in-out;
  }


</style>
