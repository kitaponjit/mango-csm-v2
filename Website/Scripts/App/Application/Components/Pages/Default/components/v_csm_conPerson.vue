<template>
  <div class="">
    <div class="tab-pane">
      <div class="padding-detail">
        <div class="row">
          <div class="col-md-12">
            <table-stick-2 ref="contactPersonStick" :cellpad="14" :scale="470">
              <table class="table table-bordered table-striped table-hover">
                <thead>
                  <tr>
                    <th class="tf-2">{{ui.erp_action || 'Action'}}</th>
                    <th class="tf-2-5">{{ui.erp_no || 'No.'}}</th>
                    <th class="tf-2-5">{{ui.erp_active || 'Active'}}</th>
                    <th class="tf-4-5">{{ui.erp_contact || 'Contact'}}</th>
                    <th class="tf-4">{{ui.erp_position || 'Position'}}</th>
                    <th class="tf-3-5">{{ui.erp_telephone || 'Phone'}}</th>
                    <th class="tf-3-5">{{ui.erp_email || 'E-mail'}}</th>
                    <th class="tf-3-5">{{ui.erp_line || 'Line'}}</th>
                    <th class="tf-4-5">{{ui.erp_}}{{ui.erp_remark || 'Remark'}}</th>
                    <th class="tf-3-5">{{'Add By'}}</th>
                    <th class="tf-3-5">{{'Add Date'}}</th>
                    <th class="tf-3-5">{{'Edit User'}}</th>
                    <th class="tf-3-5">{{'Edit Date'}}</th>
                    <th class="tf-2">{{ui.erp_line_no || 'Line No.'}}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(x,idx) in contact_person" >
                    <td align="center" class="td-action text-nowrap">
                      <a v-if="x.mastype === 'CSM'" class="text-danger" @click.prevent="onDel(x)"><v-icon name="trash-2" class="v-icon-width"></v-icon></a>
                    </td>
                    <td align="center" class="extra-bold">{{x.itemno}}.</td>
                    <td align="center" class="extra-bold">
                      <div class="form-check form-switch form-check-custom form-check-solid form-check-sm d-flex justify-content-center">
                        <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="x.active"  @change="onRowEdit(x)" />
                      </div>
                    </td>
                    <td>
                      <input type="text" class="form-control table text-dark-blue" v-model="x.person_name"  @input="onRowEdit(x)" />
                    </td>
                    <td><input type="text" class="form-control table" v-model="x.position"  @input="onRowEdit(x)" /></td>
                    <td><input type="text" class="form-control table" v-model="x.phone"  @input="onRowEdit(x)" /></td>
                    <td><input type="text" class="form-control table" v-model="x.email"  @input="onRowEdit(x)" /></td>
                    <td><input type="text" class="form-control table" v-model="x.lineid"  @input="onRowEdit(x)" /></td>
                    <td><input type="text" class="form-control table" v-model="x.remark"  @input="onRowEdit(x)" /></td>
                    <td align="center" class="extra-bold">{{x.adduser}}</td>
                    <td align="center" class="extra-bold">{{x.adddate | date('DD/MM/YYYY HH:mm:ss')}}</td>
                    <td align="center" class="extra-bold">{{x.edituser}}</td>
                    <td align="center" class="extra-bold">{{x.editdate | date('DD/MM/YYYY HH:mm:ss')}}</td>
                    <td align="center" class="text-secondary">{{x.mg_lineno}}</td>
                  </tr>
                </tbody>
              </table>
            </table-stick-2>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
let contact_paging = {};
export default {
  props : {
    customer_code : {
      type : String,
      default : ""
    },
    pre_event : {
      type : String,
      default : ""
    }
  },
  data() {
    return {
      ui: window.ui,
      contact_person: [],
    }
  },
  methods: {
    onRowEdit(x) {
      if (x.addnew) return
      x.edituser = auth.userid
      x.editdate = new Date()
    },
    removeContact(x) {
      if ($linq(this.contact).any(a => a.contact_person == x.mg_lineno.toString())) {
        $msg.alert('Warning', 'ข้อมูลนี้ไม่สามารถลบได้ เนื่องจากถูกนำไปใช้งานที่ Contact แล้ว.', 'warning')
        return
      }

      this.contact_person = $linq(this.contact_person).where(w => !(w.itemno == x.itemno)).toArray()
      let itemno = 1
      for (var f of this.contact_person) {
        f.itemno = itemno++
      }
    },
    async appendContact() {
      let itemno = this.contact_person.length == 0 ? 1 : $linq(this.contact_person).max(m => m.itemno) + 1
      let mg_lineno = this.contact_person.length == 0 ? 1 : $linq(this.contact_person).max(m => m.mg_lineno) + 1
      let item = {
        // projno: null,
        itemno: itemno,
        mg_lineno: mg_lineno,
        person_name: null,
        phone: null,
        email: null,
        lineid: null,
        position: null,
        remark: null,
        adduser: auth.userid,
        adddate: new Date,
        addnew: true,
        mastype: 'CSM',
        active: 'Y',
      }
      this.contact_person.push(item)
    },
    async loadConPerson() {
      let act = `csm/data/CustConPerson_Read?customer_code=${this.customer_code}&pre_event=${this.pre_event}`;
      let rsp = await $xt.getServer(act);

      this.contact_person = rsp.data.data;
    },
    async saveData() {
      const isEmptyName = this.contact_person.some(x => $xt.isEmpty(x.person_name))

      if (isEmptyName) {
        $msg.alert('Warning', 'กรุณาระบุชื่อผู้ติดต่อ', 'warning')
        return
      }
      
      try {
        let form = {
          detail : this.contact_person,
          pre_event : this.pre_event,
        }

        // console.log('This Form:', form);
        // return;

        let url = `csm/data/CustConPerson_Create`;
        let rsp = await $xt.postServerJson(url, form );
        if (!rsp.success) {
          throw rsp.error;
        }
        this.loadConPerson(this.customer_code);
        $notify.success(this.ui.alert_save_success);
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
        // process = false;
        // this.$refs.page.loadingBox.hide()
      }
    },
    async onDel(x) {
        if (!await $msg.confirm(`ต้องการลบข้อมูลรายการที่ ${x.itemno} ใช่หรือไม่`)) {
          return;
        }

        if (x.addnew) {
          this.removeContact(x);
          return;
        }
        
        try {
          let f = {
            pre_event: this.pre_event,
            itemno: x.itemno,
            mg_lineno: x.mg_lineno
          };
          let act = `CSM/Data/CustProjectData_Delete`;
          // this.$emit('loading' , 'show');
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          // await this.loadConPerson();
          $notify.success(this.ui.alert_save_success);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          // this.$emit('loading' , 'hide');
          // this.removeContact(x);
          await this.loadConPerson();
        }
      },
    pageChange(pn ){
      pn = pn || 1;
      contact_paging.setCurrentPage(pn);
      this.loadConPerson();
    },
  },
  mounted() {
    this.loadConPerson();
  },
}
</script>
<style scoped>
.form-control.table {
  margin: 0px !important;
}
.table td {
  padding: 0px !important;
}
.row-readonly {
  background-color: #f5f5f5 !important;
  opacity: 0.7;
}
.row-readonly input:disabled {
  background-color: transparent;
  cursor: not-allowed;
}
</style>
