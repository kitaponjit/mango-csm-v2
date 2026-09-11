import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// ---------------------------------------------------------------------------
// Helper: map array to select2-compatible format { id, text, active }
// ---------------------------------------------------------------------------
const setGetters = (data, id, text, active) =>
  data.map(x => ({ id: x[id], text: x[text] || '', active: x[active] }))

// ---------------------------------------------------------------------------
// Helper: group service data by serv_group_code, sorted by key
// ---------------------------------------------------------------------------
const setGettersGroup = (data) => {
  const groups = data.reduce((acc, item) => {
    const key = item.serv_group_code

    if (!acc[key]) {
      acc[key] = {
        key,
        text: key === 'other' ? 'other' : item.serv_group_name || '',
        children: [],
      }
    }

    acc[key].children.push({
      id: item.serv_code,
      text: item.serv_name,
      active: item.active,
      active_service_group: item.active_service_group || 'Y',
      list_sa: item.add_emp_sa_mg,
    })

    return acc
  }, {})

  return Object.values(groups).sort((a, b) =>
    a.key < b.key ? -1 : a.key > b.key ? 1 : 0
  )
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
const store = new Vuex.Store({
  state: {
    connectionCodeData: [],  // ประเภทการติดต่อ
    requestCodeData: [],     // ประเภทการร้องขอ
    priorityCodeData: [],    // ระดับความสำคัญ
    serviceCodeData: [],     // ประเภทบริการ
    configData: [],          // ค่า config หลัก (GetSettings)
    config: {},              // ค่า config จาก Anywhere (key-value)
    maincomp: {},            // ข้อมูลบริษัทหลัก
    activeconfig: [],        // Active config list
    configReadlist: {}, 
    send_test_bug:[],     
  },

  actions: {
    // ดึงประเภทการติดต่อ
    async findConnection({ commit }) {
      const resp = await $xt.getServer('CSM/Center/ContactType')
      commit('storeConnection', resp.data.data_rows)
    },

    // ดึงประเภทการร้องขอ
    async findRequest({ commit }) {
      const resp = await $xt.getServer('CSM/Center/RequestType')
      commit('storeRequest', resp.data.data_rows)
    },

    // ดึงระดับความสำคัญ
    async findPriority({ commit }) {
      const resp = await $xt.getServer('CSM/Center/Priority')
      commit('storePriority', resp.data.data_rows)
    },

    // ดึงประเภทบริการ
    async findService({ commit }) {
      const resp = await $xt.getServer('CSM/Center/ServiceType')
      commit('storeService', resp.data.data_rows)
    },
    // ดึงประเภทบริการ ที่มี การ send_test_bug
      async findServiceBug({ commit }) {
      const resp = await $xt.getServer('CSM/Center/ServiceType_Send_Bug')
      commit('storeBug', resp.data.data_rows)
    },

    // ดึง config หลักของระบบ
    async findConfig({ commit }) {
      const resp = await $xt.getServer('CSM/Center/GetSettings')
      commit('storeConfig', resp.data)
    },

    // ดึง config จาก Anywhere แล้วแปลงเป็น key-value object
    async findCodeConfig({ commit }, maincode) {
      try {
        const act = maincode
          ? `Anywhere/API/StoreConfig?maincode=${maincode}`
          : 'Anywhere/Center/Config'
        const resp = await $xt.getServer(act)

        const obj = resp.reduce((acc, item) => {
          acc[item.code] = item.active || 'N'
          acc[`${item.code}_value`] = item.value_data || null
          acc[`${item.code}_remark1`] = item.remark || null
          return acc
        }, {})

        commit('storeCodeConfig', obj)
      } catch (ex) {
        $msg.alert('Store Error', `(Config) ${ex}`, 'danger')
      }
    },

    // ดึงข้อมูลบริษัทหลักตาม maincode ของ user ที่ login
    async findCompany({ commit }) {
      try {
        const maincode = window.auth.maincode
        const resp = await $xt.getServer(`anywhere/center/Maincomp?maincode=${encodeURIComponent(maincode)}`)
        commit('storeCompany', resp.data)
      } catch (ex) {
        $msg.alert('Store Error', `(Company) ${ex}`, 'danger')
      }
    },

    // ดึง active config แล้ว merge เป็น object เดียว
    async findActiveConfig({ commit }) {
      try {
        const rsp = await $xt.getServer('CSM/Config/Active_Config_ReadList')
        commit('storeActiveConfig', Object.assign({}, ...rsp.data))
      } catch (ex) {
        $msg.alert('Store Error', ex, 'danger')
      }
    },

    // ดึง config readlist กรอง TRN000X (fallback เป็น N ถ้าไม่พบ)
    async findConfigReadList({ commit }) {
      try {
        const rsp = await $xt.getServer('CSM/Config/Config_ReadList')

        const filtered = rsp.data.filter(item => item.config_id === 'TRN000X')
        const source = filtered.length > 0
          ? filtered
          : [{ config_id: 'TRN000X', config_value: 'N' }]

        const configObject = source.reduce((obj, item) => {
          obj[item.config_id] = item
          return obj
        }, {})

        commit('storeConfigReadlist', configObject)
      } catch (ex) {
        $msg.alert('Store Error', ex, 'danger')
      }
    },
  },

  mutations: {
    storeConnection(state, data)   { state.connectionCodeData = data },
    storeRequest(state, data)      { state.requestCodeData = data },
    storePriority(state, data)     { state.priorityCodeData = data },
    storeService(state, data)      { state.serviceCodeData = data },
    storeConfig(state, data)       { state.configData = data },
    storeCodeConfig(state, data)   { state.config = data },
    storeCompany(state, data)      { state.maincomp = data },
    storeActiveConfig(state, data) { state.activeconfig = data },
    storeConfigReadlist(state, data) { state.configReadlist = data },
    storeBug(state, data) { state.send_test_bug = data },
  },

  getters: {
    service_select2:       state => setGetters(state.serviceCodeData, 'serv_code', 'serv_name', 'active'),
    request_select2:       state => setGetters(state.requestCodeData, 'req_code', 'req_des', 'active'),
    service_group_select2: state => setGettersGroup(state.serviceCodeData),
    config:                state => state.config,
  },
})

global.store = store
export default store
