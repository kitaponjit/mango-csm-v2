<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <section class="content">
        <!-- Control Button : Company -->
        <div class="row">
            <div class="col-md-12">
                <div class="pull-right">
                    <button class="btn btn-sm btn-facebook" @click.prevent="$refs.company.openModal({
                        servicePath: servicePath,
                    })"><i class="fas fa-list"></i> <span
                            v-text="ui.retrieve || 'Retrieve Document'"></span></button>
                </div>
            </div>
        </div>
          <div class="box box-solid margin-t-10">
            <div class="box-body">
              <div class="row">
                <div class="col-md-2">
                  <div class="form-group">
                    <select class="form-control input-sm" v-model="search.field">
                      <option value="formcode">Code</option>
                      <option value="formname">Form Name</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="form-group">
                    <div class="input-group">
                      <input type="text" class="form-control input-sm" placeholder="ค้นหา" v-model="search.text" @keyup.enter="searchDocument" />
                      <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click="searchDocument"><i class="fas fa-search"></i></button></span>
                    </div>
                  </div>
                </div>
                <div class="col-md-7">
                  <div class="pull-right">
                    <template v-if="auth.is_admin">
                      <button class="btn btn-sm btn-warning" @click.prevent="loadCompanyCopy()"><i class="fas fa-copy"></i> <span v-text="ui.erp_mas_doc_running_copy_to_company || 'Copy to Company'"></span></button>
                      <button class="btn btn-sm bg-navy" @click="addDocument" v-if="auth.is_super_admin || auth.is_admin"><i class="fas fa-plus"></i> <span v-text="ui.add_detail || 'Add Detail'"></span></button>
                      <button class="btn btn-sm bg-olive" @click.prevent="saveDocument"><i class="fas fa-save"></i> <span v-text="ui.save || 'Save'"></span></button>
                    </template>
                  </div>
                </div>
              </div>
              <p><span class="text-warning">หมายเหตุ : </span>หากเปลี่ยน Running Type กรุณากดบันทึกก่อนทำ Custom Form</p>
              <div class="row">
                <div class="col-md-12">
                  <table-stick-2 ref="stick" :cellpad="14" :scale="240">
                    <table class="table table-bordered table-striped table-hover">
                      <thead>
                        <tr>
                          <th class="tf-2">No.</th>
                          <th class="tf-2-5">Action</th>
                          <th class="tf-3">Code</th>
                          <th class="tf-5">Form Name</th>
                          <th class="tf-2-5">Run No.</th>
                          <th class="tf-4-5">Running Type</th>
                          <th class="tf-3">Head</th>
                          <th class="tf-3">Width</th>
                          <th class="tf-3-5">ISO Code</th>
                          <th class="tf-5">Remark ISO</th>
                          <th class="tf-4">Format Running No.</th>
                          <th class="tf-3">Add By</th>
                          <th class="tf-3-5">Add Date</th>
                          <th class="tf-3">Edit By</th>
                          <th class="tf-3-5">Edit Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(x, idx) in displayDocument">
                          <td align="center" class="text-bold">{{ idx + 1 }}.</td>
                          <td align="center" class="td-action">
                            <a href="#" class="text-black" @click.prevent="openFormatRunning(x)" v-show="x.isEdit && x.runtype2 == 'Z'"><v-icon name="edit" class="v-icon-width"></v-icon></a>
                            <a href="#" v-if="auth.is_admin" class="text-danger" @click.prevent="delDocument(idx)"><v-icon name="trash-2" class="v-icon-width"></v-icon></a>
                          </td>
                          <td><input type="text" class="form-control table" v-model="x.formcode" v-bind:readonly="x.isEdit" /></td>
                          <td><input type="text" class="form-control table" v-model="x.formname" @change="x.cc_select = 'Y'" /></td>
                          <td align="center">
                            <div class="form-check form-check-custom form-check-solid form-switch form-switch-sm form-swtich-center">
                              <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="x.runtype" @change="x.cc_select = 'Y'" />
                              <label class="form-check-label"></label>
                            </div>
                          </td>
                          <td>
                            <select class="form-control table" v-model="x.runtype2" @change="x.cc_select = 'Y'">
                              <option :value="null" disabled>-- Please Select Type --</option>
                              <option value="1">1. Mango Format</option>
                              <option value="2" disabled>2. Header. + Year + Month + No.</option>
                              <option value="3" disabled>3. Ref Code + Year(2) + Month + No.</option>
                              <option value="4" disabled>4. Project No. + Running No.</option>
                              <option value="5" disabled>5. Referent Project No. + Year(1) + Month + No.</option>
                              <option value="6" disabled>6. Proj. Year(2) + Proj. No(3) + Year(2) + Month(2) + No.</option>
                              <option value="7" disabled>7. Ref Project + Running No. / Year(2)</option>
                              <option value="8" disabled>8. Year(2) - No.(4)</option>
                              <option value="9" disabled>9. Ref Project - No.(4)</option>
                              <option value="A" disabled>10. Ref Project + '-' + Job(1) + Running(S)</option>
                              <option value="B" disabled>11. Mango (Type)</option>
                              <option value="Z">12. Format Custom</option>
                            </select>
                          </td>
                          <td><input type="text" class="form-control table text-center" v-model="x.runhead" @change="x.cc_select = 'Y'" /></td>
                          <td><input type="text" class="form-control table text-center" v-model="x.format_width" @change="x.cc_select = 'Y'" /></td>
                          <td><input type="text" class="form-control table" v-model="x.iso" @change="x.cc_select = 'Y'" /></td>
                          <td><input type="text" class="form-control table" v-model="x.remark_iso" @change="x.cc_select = 'Y'" /></td>
                          <td>{{ x.format_runno }}</td>
                          <td align="left" class="nowrap-text">{{ x.adduser }}</td>
                          <td align="center">{{ $date(x.add_dt, 'DD/MM/YYYY HH:mm:ss') }}</td>
                          <td align="left" class="nowrap-text">{{ x.edituser }}</td>
                          <td align="center">{{ $date(x.edit_dt, 'DD/MM/YYYY HH:mm:ss') }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </table-stick-2>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </re-page>

    <!-- Modal : Set Format Runno -->
    <modal ref="formatModal">
      <template #header>
        <h4><i class="fas fa-cog"></i> Setup Format Running</h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <h5 class="text-olive">{{ setTitleRunno() }}</h5>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <h5 class="text-navy pull-right">Format Width : {{ $num(widthRunno, 0) }} Digit</h5>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <table-stick-2 ref="stickTable" :scale="310">
              <table class="table table-bordered table-striped table-hover">
                <thead>
                  <tr>
                    <th class="tf-2">#</th>
                    <th class="tf-4-5">Format Specifications</th>
                    <th class="tf-4">Format Text/Dpt.</th>
                    <th class="tf-3">Justify</th>
                    <th class="tf-3">Width</th>
                    <th class="tf-3">Add By</th>
                    <th class="tf-3-5">Add Date</th>
                    <th class="tf-3">Edit By</th>
                    <th class="tf-3-5">Edit Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(x, idx) in formatRunno">
                    <td align="center" class="td-action">
                      <a href="#" class="text-danger" v-bind:class="{'disabled-menu': !auth.is_admin}" @click.prevent="delRunno(idx)"><v-icon name="trash-2" class="v-icon-width"></v-icon></a>
                    </td>
                    <td>
                      <select class="form-control table" v-model="x.format_ty" @change="setWidth(x)">
                        <option value="A">(A) Text</option>
                        <option value="B">(B) Date Document (YYYYMMDD)</option>
                        <option value="C">(C) Date Voucher (YYYYMMDD)</option>
                        <option value="D">(D) Year Document</option>
                        <option value="E">(E) Year GL</option>
                        <option value="F">(F) Month Document</option>
                        <option value="G">(G) Month GL</option>
                        <option value="H">(H) Project Ref. Code or Department</option>
                        <option value="I">(I) Project No. or Department</option>
                        <option value="J">(J) Project Contract No. or Department</option>
                        <option value="K">(K) No.</option>
                        <option value="L">(L) Job No.</option>
                        <option value="M">(M) Job Short Name</option>
                        <option value="N">(N) Book Account (GL)</option>
                        <option value="O">(O) Type of Other Income (AR)</option>
                        <option value="P">(P) Year Project or Document Date</option>
                        <option value="Q">(Q) Group (Project)</option>
                        <option value="R">(R) Zone by Data Type</option>
                        <option value="S">(S) Project No. (3) or HO</option>
                        <option value="T">(T) Document Type</option>
                        <option value="U">(U) Text PR (Project = PRS, Department = PRO)</option>
                        <option value="V">(V) Ref. Code (7) + Job(1) or Department (OFF) + Year (2)</option>
                        <option value="Z">(Z) {{rulename || 'Data Type'}}</option>

                      </select>
                    </td>
                    <td>
                      <input type="text" class="form-control table" v-model="x.text_a" @keyup="setText(x)" v-bind:disabled="!['A'].includes(x.format_ty)" maxlength="20" />
                    </td>
                    <td>
                      <select class="form-control table" v-model="x.format_pos" v-bind:disabled="['U'].includes(x.format_ty)">
                        <option value="F">Full</option>
                        <option value="R">Right</option>
                        <option value="L">Left</option>
                      </select>
                    </td>
                    <td>
                      <input type="text" class="form-control table text-center" v-model.number="x.format_len" v-bind:disabled="['U'].includes(x.format_ty)" />
                    </td>
                    <td align="center">{{ x.adduser }}&nbsp;</td>
                    <td align="center">{{ $date(x.add_dt, 'DD/MM/YYYY HH:mm:ss') }}&nbsp;</td>
                    <td align="center">{{ x.edituser }}&nbsp;</td>
                    <td align="center">{{ $date(x.edit_dt, 'DD/MM/YYYY HH:mm:ss') }}&nbsp;</td>
                  </tr>
                  <tr class="text-bold" v-if="formatRunno.length > 0">
                    <td colspan="4" align="right">Total</td>
                    <td align="center">{{ $num(xt.sumTotal(formatRunno, 'format_len'), 0) }}</td>
                    <td colspan="4"></td>
                  </tr>
                </tbody>
              </table>
            </table-stick-2>
          </div>
        </div>
      </template>
      <template #footer>
        <template v-if="auth.is_admin">
          <button class="btn btn-sm bg-navy" @click.prevent="addFormatRunno()"><i class="fas fa-plus"></i> <span v-text="ui.add_detail || 'Add Detail'"></span></button>
          <button class="btn btn-sm bg-olive" @click.prevent="vaildFormatRunning()"><i class="fas fa-save"></i> <span v-text="ui.save || 'Save'"></span></button>
        </template>
      </template>
    </modal>
    <!-- Modal : Copy to Company -->
    <modal ref="companyModal">
      <template #header>
        <h4>Select Company to Copy</h4>
      </template>
      <template #body>
        <table-stick-2 ref="company">
          <table class="table table-bordered table-striped table-hover">
            <thead>
              <tr>
                <th class="tf-2">Select</th>
                <th class="tf-2-5">No.</th>
                <th class="tf-3">Code</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(x,idx) in companyCopy" v-bind:class="{'table-selected': x.cc_select == 'Y'}">
                <td align="center">
                  <p-check class="p-icon p-curve p-smooth p-table" color="primary" true-value="Y" false-value="N" v-model="x.cc_select">
                    <i class="icon mdi mdi-check" slot="extra"></i>
                    <label slot="off-label"></label>
                  </p-check>
                </td>
                <td align="center">{{idx+1}}.</td>
                <td align="center">{{x.maincode}}</td>
                <td>{{x.mainname}}</td>
              </tr>
            </tbody>
          </table>
        </table-stick-2>
      </template>
      <template #footer>
        <button class="btn btn-sm bg-olive" @click.prevent="copyConfig()"><i class="fas fa-check"></i> <span v-text="ui.save || 'Save'"></span></button>
      </template>
    </modal>
    <!-- Modal : Center -->
    <vue-company-list ref="company" @send-data="addInfoComponent($event, 'company')"></vue-company-list>
  </div>
</template>

<script type="text/javascript">
  let page = {}
  export default {
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        xt: $xt,
        auth: window.auth,
        maincode: '',
        mainname: '',
        search: {
          text: '',
          field: 'formcode',
        },
        /* Variables : Document Running */
        displayDocument: [],
        document: [],
        formcode: null,
        formatRunno: [],
        widthRunno: 0,
        viewRun_h: {},
        viewRun: [],
        displayRunno: [],
        companyCopy: [],
        search_master: {
          field: 'menu_text',
          text: ''
        },
        masterRunning: [],
        masterDisplay: [],
        migrate_formcode: [],
        /* Variables : Other */
        editCompany: false,
        /* Variables : Center */
        maincomp: [],
        currency: [],
        rulename: window.appinfo.rule_name,
        /* Service Token */
        servicePath: "",
        MangoToken: "",
        typeKey: "",
        ref_cus_code: "",
        dumpData: {
          data: []
        },
        dumpDataRunning: {
          data: []
        }
      }
    },
    methods: {
      async loadDefault() {
        // Load Token from URL
        await this.onLoadToken()

        // Not Have maincode Open select company from modal
        this.$refs.company.openModal({
            servicePath: this.servicePath,
        });
      },
      async searchDocument() {
        let text = this.search.text.trim().toLowerCase()
        let field = this.search.field
        if (!$xt.isEmpty(text)) {
          this.displayDocument = $linq(this.document).where(w => !$xt.isEmpty(w[field]) && w[field].toLowerCase().includes(text)).toArray()
        } else {
          this.$set(this, 'displayDocument', this.document)
        }
      },
      // Load Token from URL   
      async onLoadToken() {
        const token = this.$route.query.token;
        if (!token || Array.isArray(token)) return;

        const typeKey = this.$route.query.type;
        if (!typeKey || Array.isArray(typeKey)) return;

        this.$set(this, "typeKey", typeKey);

        const ref_cus_code = this.$route.query.ref_cus_code;
        if (!ref_cus_code || Array.isArray(ref_cus_code)) return;
        this.$set(this, "ref_cus_code", ref_cus_code);

        const kLocal = `svc:${token}`;
        const kSession = `svc:${token}`;

        // 1) ถ้ามีใน sessionStorage อยู่แล้ว (เคยโหลดไปแล้ว/รีเฟรช) => ใช้ต่อได้เลย
        let raw = sessionStorage.getItem(kSession);
        if (!raw) {
            // 2) ยังไม่เคยโหลดในแท็บนี้: ลองอ่านจาก localStorage
            raw = localStorage.getItem(kLocal);
            if (raw) {
                try {
                    // const obj = JSON.parse(raw);
                    // const fresh = Date.now() - (obj.t || 0) <= (obj.ttl || 5 * 60 * 1000);
                    // if (!fresh) {
                    //     // หมดอายุ: ลบทิ้งทั้งสองที่แล้วจบ
                    //     localStorage.removeItem(kLocal);
                    //     sessionStorage.removeItem(kSession);
                    //     return;
                    // }

                    // 2.1 ย้ายเข้า sessionStorage (คงอยู่ขณะรีเฟรช, หายเมื่อปิดแท็บ)
                    sessionStorage.setItem(kSession, raw);
                    // 2.2 ลบจาก localStorage เพื่อไม่ให้แท็บอื่นมาใช้/ซ้ำ
                    localStorage.removeItem(kLocal);
                } catch (e) {
                    // JSON เพี้ยน: ลบเพื่อความสะอาด
                    localStorage.removeItem(kLocal);
                    return;
                }
            } else {
                // ไม่พบทั้ง session/local => ไม่มีค่าให้ใช้
                return;
            }
        }

        // 3) อ่านค่าจาก sessionStorage (หลังย้ายแล้วหรืออยู่เดิม)
        try {
            const obj2 = JSON.parse(sessionStorage.getItem(kSession));
            // const fresh2 = Date.now() - (obj2.t || 0) <= (obj2.ttl || 5 * 60 * 1000);
            // if (!fresh2) {
            //     sessionStorage.removeItem(kSession);
            //     return;
            // }
            
            // set ค่าให้ component (Vue 2 ใช้ this.$set)
            this.$set(this, "servicePath", obj2.ServicePath || "");
        } catch {
            sessionStorage.removeItem(kSession);
        }
      },
      // Method : Center
      async addInfoComponent(e, keyword) {
        switch (keyword) {
          case 'company':
            this.$set(this, 'maincode', e.maincode)
            this.$set(this, 'mainname', e.mainname)
            // load gateway
            await this.onLoginGateway()

            // load document running
            await this.loadDocument()
            await this.searchDocument()
            break

          case 'account':
            this.$set(this.onTable, 'datacode', e.ac_code)
            this.$set(this.onTable, 'dataname', e.ac_des)
            break
        }
      },
      // Method : Login Gateway
      async onLoginGateway() {
        const formData = {
            form:
            {
                ServicePath: this.servicePath ?? "",
                ServiceEvent: "Login",
                ServiceName: "LoginGateWay",
                Query: { is_api: "N" },
                maincode: this.maincode,
            },
        };

        let url = "CSM/Gateway/GateWayLogin";
        let respNew = await $xt.postServerJson(url, formData);

        let data = respNew?.data?.data || [];
        this.$set(this, 'MangoToken', data)
      },
      // Method : Company
      
      /* Method : Document Running */
      async loadDocument() {
        page.loadingBox.show()
        try {
          // new
          const formData = {
            form:
            {
                ServicePath: this.servicePath ?? "",
                ServiceEvent: "DocumentRunning",
                ServiceName: "DocumentReadList",
                Query: {maincode: this.maincode},//`?maincode=${this.maincode || ''}`,
                MangoToken: this.MangoToken,
                typeKey: this.typeKey,
                ref_cus_code: this.ref_cus_code,
            },
          };

          let url = "CSM/Gateway/Dispath";
          let resp = await $xt.postServerJson(url, formData);
          if (!resp.success) { 
            throw resp.error;
          }

          let data = resp?.data || [];
          $linq(data.data).foreach(x => {
            x.cc_select = 'N'
            x.isEdit = true
          });
          this.document = data.data || [];

          this.dumpData.data = JSON.parse(JSON.stringify(data.data))

          this.migrate_formcode = data.migrate_formcode || [];

          await $xt.sleep(100)
          this.$nextTick(() => {
            this.$refs.stick.createStick()
          })
        }
        catch (ex) {
          $msg.alert('System Error', ex, 'danger')
        }
        finally {
          page.loadingBox.hide()
        }
      },
      addDocument() {
        this.document.push({
          runtype: 'N',
          ct_reprint: 'N',
          cc_new: 'Y',
          cc_select: 'Y',
          isEdit: false
        })
        this.$refs.stick.scrollBottom()
      },
      async delDocument(idx) {
        if (!(await $msg.confirm('คุณต้องการลบข้อมูลใช่หรือไม่ หากลบแล้วกรุณากดปุ่มบันทึกด้วย'))) {
          return
        }
        this.document.splice(idx, 1)
      },
      async saveDocument() {
        try {
          page.loadingBox.show()
          // new 
          let f = {
            data: this.document
          }
          let changedData = $xt.compareObject(this.dumpData, f)
          let payload = {
            type: "Save",
            document_running: changedData
          }
          const formData = {
            form:
            {
                ServicePath: this.servicePath ?? "",
                ServiceEvent: "DocumentRunning",
                ServiceName: "CreateDocument",
                MangoToken: this.MangoToken,
                payload: f,
                Log: payload,
                maincode: this.maincode,
                mainname: this.mainname,
                typeKey: this.typeKey,
                ref_cus_code: this.ref_cus_code,
            },
          };
          let url = "CSM/Gateway/Dispath";
          let resp = await $xt.postServerJson(url, formData);

          if (!resp.success) {
            throw resp.error;
          }
          $notify.success(this.ui.alert_save_success)
          await this.loadDocument()
          await this.searchDocument()
        }
        catch (ex) {
          $msg.alert(`System Error`, ex, `danger`)
        }
        finally {
          page.loadingBox.hide()
        }
      },
      async openFormatRunning(x) {
        this.$set(this, 'viewRun_h', x)
        this.$set(this, 'formcode', x.formcode)
        this.$set(this, 'widthRunno', x.format_width)
        this.$refs.formatModal.openModal()
        await this.loadRunno()
      },
      async loadRunno() {
        const formData = {
            form:
            {
                ServicePath: this.servicePath ?? "",
                ServiceEvent: "DocumentRunning",
                ServiceName: "RunnoReadList",
                Query: {formcode: this.formcode || ''},
                MangoToken: this.MangoToken,
                typeKey: this.typeKey,
                ref_cus_code: this.ref_cus_code,
            },

          };

          let url = "CSM/Gateway/Dispath";
          let resp = await $xt.postServerJson(url, formData);
          if (!resp.success) { 
            throw resp.error;
          }

          let response = resp?.data || [];
          this.formatRunno = response.data || [];
          this.dumpDataRunning.data = JSON.parse(JSON.stringify(response.data))
      },
      addFormatRunno() {
        this.formatRunno.push({
          formcode: this.formcode,
          format_len: 0,
          format_pos: 'F'
        })
      },
      async delRunno(idx) {
        if (
          !(await $msg.confirm(
            'คุณต้องการลบข้อมูลใช่หรือไม่ หากลบแล้วกรุณากดปุ่มบันทึกด้วย'
          ))
        ) {
          return
        }
        this.formatRunno.splice(idx, 1)
      },
      vaildFormatRunning() {
        let total = $linq(this.formatRunno).sum(x => x.format_len)
        if (total > this.widthRunno) {
          $msg.alert(
            'คำเตือน',
            'ขนาด Running ไม่สามารถเกินที่กำหนดไว้ได้',
            'warning'
          )
          return
        }
        this.saveFormatRunning()
      },
      async saveFormatRunning() {
        try {
          page.loadingBox.show()
          let f = {
            data: this.formatRunno
          };
          let changedData = $xt.compareObject(this.dumpDataRunning, f)
          let payload = {
            type: "Save",
            format_running: changedData
          }
          const formData = {
            form:
            {
                ServicePath: this.servicePath ?? "",
                ServiceEvent: "DocumentRunning",
                ServiceName: "CreateRunning",
                MangoToken: this.MangoToken,
                payload: f,
                Log: payload,
                maincode: this.maincode,
                mainname: this.mainname,
                typeKey: this.typeKey,
                ref_cus_code: this.ref_cus_code,
            },
          };
          let url = "CSM/Gateway/Dispath";
          let rsp = await $xt.postServerJson(url, formData)
          if (!rsp.success) {
            throw rsp.error
          }
          $notify.success(this.ui.alert_save_success)
          await this.loadRunno()
          await this.loadDocument()
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          page.loadingBox.hide()
        }
      },
      setText(x) {
        this.$set(x, 'format_len', x.text_a.length)
      },
      setWidth(x) {
        let type = x.format_ty
        this.$set(
          x,
          'format_len',
          ['B', 'C'].includes(type) ? 8 : ['D', 'E'].includes(type)
            ? 4 : ['F', 'G', 'N'].includes(type)
              ? 2 : ['L'].includes(type)
                ? 1 : ['U'].includes(type)
                  ? 3 : x.format_len
        )
      },
      setTitleRunno() {
        let str = ''
        $linq(this.formatRunno).foreach(x => {
          if (x.format_ty == 'A') {
            str += x.text_a || ''
          }
          else {
            for (var i = 1; i <= x.format_len; i++) {
              str += x.format_ty
            }
          }
        })
        return str || ''
      },
      /* Method : Copy to Company */
      async loadCompanyCopy() {
        page.loadingBox.show()
        try {
          const formData = {
              form:
              {
                  ServicePath: this.servicePath ?? "",
                  ServiceEvent: "DocumentRunning",
                  ServiceName: "CompanyReadList",
                  MangoToken: this.MangoToken,
                  typeKey: this.typeKey,
                  ref_cus_code: this.ref_cus_code,
                  Query: {
                      skip: "0",
                      take: "100",
                  }
              },
          };
          
          let act =  `CSM/Gateway/Dispath`
          let resp = await $xt.postServerJson(act, formData)
          let response = resp.data
          if (!resp.success) {
              throw resp.error
          }
              
          let list = $linq(response.data).where(w => w.maincode != this.maincode).toArray()
          list.forEach(f => { f.cc_select = 'N' })
          this.$set(this, 'companyCopy', list)

          this.$refs.companyModal.openModal()
        }
        catch { }
        finally {
          page.loadingBox.hide()
        }
      },
      async copyConfig() {
        if (!await $msg.confirm('คำเตือน : การคัดลอกข้อมูลจะทำให้บริษัทที่ถูกคัดลอกโดนล้างข้อมูลก่อน ทำรายการคัดลอกข้อมูล โปรดยืนยันการทำรายการดังกล่าว.')) {
          return
        }

        page.loadingBox.show()
        try {
          let f = {
            company: $linq(this.companyCopy).where(w => w.cc_select == 'Y').toArray()
          }
          let document_copy = this.dumpData.data;
          let payload = {
            type: "Copy",
            document_from: this.maincode,
            document_to: f.company.map(m => m.maincode),
            document_copy: document_copy
          }
          const formData = {
            form:
            {
                ServicePath: this.servicePath ?? "",
                ServiceEvent: "DocumentRunning",
                ServiceName: "CopyRunnoToCompany",
                MangoToken: this.MangoToken,
                payload: f,
                Log: payload,
                maincode: this.maincode,
                mainname: this.mainname,
                typeKey: this.typeKey,
                ref_cus_code: this.ref_cus_code,
            },
          };
          let url = "CSM/Gateway/Dispath";
          let resp = await $xt.postServerJson(url, formData)
          if (!resp.success) {
            throw resp.error
          }

          await $msg.alert('ทำรายการเสร็จสิ้น', 'ระบบทำรายการคัดลอกข้อมูลของท่านเรียบร้อยแล้ว.', `success`)
          this.$refs.companyModal.closeModal()
        }
        catch (ex) {
          $msg.alert(`เกิดข้อผิดพลาด`, ex, `danger`)
        }
        finally {
          page.loadingBox.hide()
        }
      },
    },
    mounted() {
      page = this.$refs.page
      page.pageTitle = 'Master : Setup Document Running'
      document.title = page.pageTitle
      window.page = page

      this.$refs.formatModal.setSize('modal-lg')
      this.$refs.companyModal.setSize('modal-lg')

      this.loadDefault()
    }
  }
</script>

<style scoped>
  fieldset.scheduler-border {
    border: 1px groove #ddd !important;
    padding: 0 1.4em 1.4em 1.4em !important;
    margin: 0 0 1.5em 0 !important;
    -webkit-box-shadow: 0px 0px 0px 0px #000;
    box-shadow: 0px 0px 0px 0px #000;
  }

  legend.scheduler-border {
    font-size: 1.2em !important;
    font-weight: bold !important;
    text-align: left !important;
    width: auto;
    padding: 0 10px;
    border-bottom: none;
  }
</style>
