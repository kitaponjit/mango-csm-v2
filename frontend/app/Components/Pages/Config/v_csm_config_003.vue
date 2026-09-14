<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="config-container">
          <!-- Modern Header -->
          <div class="config-header">
            <div class="config-header-content">
              <div class="config-header-icon">
                <i class="fas fa-cog"></i>
              </div>
              <div>
                <h1 class="config-title">Program Configuration</h1>
                <p class="config-subtitle">จัดการการตั้งค่าระบบและการแสดงผล</p>
              </div>
            </div>
          </div>

          <!-- Modern Tabs -->
          <div class="config-tabs-wrapper">
                 <div class="config-tabs">
              <button 
                v-for="(tab, index) in availableTabs" 
                :key="index"
                :class="['config-tab', { active: tabActive === index }]"
                @click="onTabChange(index)">
                <i :class="tab.icon"></i>
                <span>{{ tab.label }}</span>
              </button>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="config-body">
            <div class="tab-content">
                <!-- Tab 1: Program Settings -->
                <div class="tab-pane" v-bind:class="{active:tabActive===0}">
                  <div class="config-card">
                    <div class="config-card-header">
                      <i class="fas fa-sliders-h"></i>
                      <span>Program Settings</span>
                    </div>
                    <div class="config-card-body">
                      <div class="config-list">
                        <div 
                          v-for="x in initial" 
                          :key="x.config_id"
                          v-if="auth.is_admin && (isAdminMG() || !adminMGOnlyItems.includes(x.config_id))"
                          class="config-item">
                          <div class="config-item-label">
                            <i class="fas fa-circle config-item-dot"></i>
                            <span>{{ x.description }}</span>
                          </div>
                          <div class="config-item-control">
                            <template v-if="x.type == 'checkbox'">
                              <label class="modern-switch">
                                <input type="checkbox" true-value="Y" false-value="N" v-model="x.config_value" />
                                <span class="modern-switch-slider"></span>
                              </label>
                            </template>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="config-card-footer">
                      <button class="config-btn config-btn-save" @click.prevent="saveClick()">
                        <i class="fas fa-save"></i>
                        <span>{{ ui.save || 'Save' }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Tab 2: Background Settings -->
                <div class="tab-pane" v-bind:class="{active: tabActive === 1}">
                  <div class="config-card">
                    <div class="config-card-header">
                      <i class="fas fa-image"></i>
                      <span>CSM Background Setting</span>
                    </div>
                    <div class="config-card-body">
                      <div v-if="attachFileTab().length === 0" class="empty-bg-state">
                        <i class="fas fa-image empty-bg-icon"></i>
                        <p>ยังไม่มีรูปพื้นหลัง</p>
                        <button class="config-btn config-btn-upload" @click="addFile()">
                          <i class="fas fa-upload"></i>
                          <span>อัปโหลดรูปพื้นหลัง</span>
                        </button>
                      </div>

                      <div v-else class="bg-preview-grid">
                        <div v-for="x in attachFileTab()" :key="x.config_id" class="bg-preview-card">
                          <div class="bg-preview-header">
                            <span class="bg-preview-id">{{ x.config_id }}</span>
                            <button 
                              v-if="img_bg.length===0" 
                              class="bg-delete-btn" 
                              @click.prevent="delFile(x.itemno, x.maincode)">
                              <i class="fas fa-times"></i>
                            </button>
                          </div>
                          
                          <div class="bg-preview-image">
                            <template v-if="img_bg.length===0">
                              <a v-if="['png','jpeg','jpg'].includes(getFileExt(x.filename))" 
                                 :href="createFilePath(x.filepath)" 
                                 target="_blank">
                                <img :src="createFilePath(x.filepath)" alt="Background" />
                              </a>
                              <a v-else-if="['mp4'].includes(getFileExt(x.filename))" 
                                 :href="createFilePath(x.filepath)" 
                                 target="_blank" 
                                 class="bg-file-icon">
                                <i class="fas fa-file-video"></i>
                                <span>Video File</span>
                              </a>
                              <div v-else class="bg-file-icon">
                                <i class="fas fa-file-word" v-if="['doc','docx'].includes(getFileExt(x.filename))"></i>
                                <i class="fas fa-file-excel" v-else-if="['xls','xlsx'].includes(getFileExt(x.filename))"></i>
                                <i class="fas fa-file-powerpoint" v-else-if="['ppt','pptx'].includes(getFileExt(x.filename))"></i>
                                <i class="fas fa-file-pdf" v-else-if="['pdf'].includes(getFileExt(x.filename))"></i>
                                <i class="fas fa-file" v-else></i>
                                <span>{{ getFileExt(x.filename).toUpperCase() }}</span>
                              </div>
                            </template>
                            <template v-else>
                              <img :src="createFilePath(x.phi_path)" alt="Background" />
                            </template>
                          </div>

                          <div class="bg-preview-desc">
                            <textarea 
                              class="bg-desc-input" 
                              rows="3" 
                              v-model.trim="x.description" 
                              :placeholder="ui.erp_description||'รายละเอียดรูปพื้นหลัง'"></textarea>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="config-card-footer" v-if="attachFileTab().length > 0">
                      <button 
                        v-if="attachmentData.length === 1 && img_bg.length === 0" 
                        class="config-btn config-btn-save" 
                        @click.prevent="insertImp()">
                        <i class="fas fa-save"></i>
                        <span>{{ ui.save || 'Save' }}</span>
                      </button>
                      <button 
                        v-if="img_bg.length > 0" 
                        class="config-btn config-btn-delete" 
                        @click.prevent="del_img()">
                        <i class="fas fa-trash"></i>
                        <span>{{ ui.delete || 'Delete' }}</span>
                      </button>
                    </div>
                  </div>
                  <input type="file" ref="myFile" name="myFile" accept=".jpg,.jpeg,.png,.gif,.raw,image/jpeg,image/png,image/gif" v-show="false" hidden>
                </div>

                <!-- Tab 3: Active Config -->
                <div class="tab-pane" v-bind:class="{active:tabActive===2}">
                  <div class="config-card">
                    <div class="config-card-header">
                      <i class="fas fa-toggle-on"></i>
                      <span>Active Configuration</span>
                    </div>
                    <div class="config-card-body">
                      <div class="ac2-overview" v-if="auth.is_admin">
                        <span>{{ activeConfigTotalOn }}/{{ activeConfigTotalCount }} เปิดใช้งาน</span>
                        <span class="ac2-overview__bar"><span :style="{ width: activeConfigTotalPercent + '%' }"></span></span>
                      </div>
                      <div v-for="section in activeConfigSections"
                           :key="section.header.config_id"
                           v-if="auth.is_admin && ((!adminMGOnlyItems.includes(section.header.config_id)) || (isAdminMG() && adminMGOnlyItems.includes(section.header.config_id)))"
                           class="ac2-section">
                        <div class="ac2-band">
                          <div class="ac2-band__icon">
                            <i class="fas fa-layer-group"></i>
                          </div>
                          <div class="ac2-band__text">
                            <div class="ac2-band__title">{{ section.header.description }}</div>
                            <div class="ac2-band__code">{{ section.header.config_id }}</div>
                          </div>
                          <span class="ac2-band__count">{{ section.onCount }}/{{ section.total }} เปิดใช้งาน</span>
                          <label class="ac2-master">
                            <span class="ac2-master__caption">เปิดทั้งหมด</span>
                            <span class="ac2-switch" :class="{ 'ac2-switch--partial': section.header.config_value !== 'Y' && section.onCount > 0 }">
                              <input
                                type="checkbox"
                                true-value="Y"
                                false-value="N"
                                v-model="section.header.config_value"
                                @change="SelectAll(section.header.id_section, section.header.config_value)" />
                              <span class="ac2-switch__track"></span>
                            </span>
                          </label>
                        </div>
                        <div class="ac2-field-grid">
                          <label v-for="item in section.items"
                                 :key="item.config_id"
                                 v-if="auth.is_admin && ((!adminMGOnlyItems.includes(item.config_id)) || (isAdminMG() && adminMGOnlyItems.includes(item.config_id)))"
                                 class="ac2-field"
                                 :class="{ 'ac2-field--on': item.config_value === 'Y' }">
                            <span class="ac2-field__main">
                              <span class="ac2-field__dot"></span>
                              <span class="ac2-field__label">{{ item.description }}</span>
                            </span>
                            <span class="ac2-field__code">{{ item.config_id }}</span>
                            <span class="ac2-switch ac2-switch--sm">
                              <input
                                type="checkbox"
                                true-value="Y"
                                false-value="N"
                                v-model="item.config_value"
                                @change="SelectItem()" />
                              <span class="ac2-switch__track"></span>
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div class="config-card-footer">
                      <button class="config-btn config-btn-save" @click.prevent="saveClick2()">
                        <i class="fas fa-save"></i>
                        <span>{{ ui.save || 'Save' }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Tab 4: Other Config -->
                <div class="tab-pane" v-bind:class="{active:tabActive===3}">
                  <div class="config-card">
                    <div class="config-card-header">
                      <i class="fas fa-ellipsis-h"></i>
                      <span>Other Configuration</span>
                    </div>
                    <div class="config-card-body">
                      <div class="config-list">
                        <div 
                          v-for="x in initial3" 
                          :key="x.config_id"
                          v-if="auth.is_admin && (isAdminMG() || !adminMGOnlyItems.includes(x.config_id))"
                          :class="['config-item', { 
                            'config-item-header': x.config_id === 'HTRN001C',
                            'config-item-child': x.config_id !== 'HTRN001C'
                          }]">
                          <div class="config-item-label">
                            <i v-if="x.config_id === 'HTRN001C'" 
                               class="fas fa-layer-group config-item-icon"></i>
                            <i v-else class="fas fa-circle config-item-dot"></i>
                            <span>{{ x.description }}</span>
                          </div>
                          <div class="config-item-control">
                            <template v-if="x.type == 'checkbox'">
                              <label class="modern-switch">
                                <input 
                                  type="checkbox" 
                                  true-value="Y" 
                                  false-value="N" 
                                  v-model="x.config_value"
                                  @change="SelectItem()" />
                                <span class="modern-switch-slider"></span>
                              </label>
                            </template>
                            <template v-if="x.type == 'checkbox3'">
                              <label class="modern-switch">
                                <input 
                                  type="checkbox" 
                                  true-value="Y" 
                                  false-value="N" 
                                  v-model="x.config_value" 
                                  @change="SelectAll(x.id_section, x.config_value)" />
                                <span class="modern-switch-slider"></span>
                              </label>
                            </template>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="config-card-footer">
                      <button class="config-btn config-btn-save" @click.prevent="saveClick2()">
                        <i class="fas fa-save"></i>
                        <span>{{ ui.save || 'Save' }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- ============================================ -->
                <!-- Tab 5: Background CSM -->
                <!-- Background CSM Setting (config_id: TRN9999) -->
                <!-- API: csm_insert_bg_csm, CSM_Read_img_csm, DeleteImg_bg_csm -->
                <!-- ============================================ -->
                <div class="tab-pane" v-bind:class="{active: tabActive === 4}" v-if="['mg1', 'mgc','mgx','MG1','MGC','MGX'].includes(auth.maincode)">
                  <div class="config-card">
                    <div class="config-card-header">
                      <i class="fas fa-image"></i>
                      <span>Background CSM Setting</span>
                    </div>
                    <div class="config-card-body">
                      <div v-if="attachFileTabCSM().length === 0" class="empty-bg-state">
                        <i class="fas fa-image empty-bg-icon"></i>
                        <p>ยังไม่มีรูปพื้นหลัง CSM</p>
                        <button class="config-btn config-btn-upload" @click="addFileCSM()">
                          <i class="fas fa-upload"></i>
                          <span>อัปโหลดรูปพื้นหลัง CSM</span>
                        </button>
                      </div>

                      <div v-else class="bg-preview-grid">
                        <div v-for="x in attachFileTabCSM()" :key="x.config_id" class="bg-preview-card">
                          <div class="bg-preview-header">
                            <span class="bg-preview-id">{{ x.config_id }}</span>
                            <button 
                              v-if="img_bg_csm.length===0" 
                              class="bg-delete-btn" 
                              @click.prevent="delFileCSM(x.itemno, x.maincode)">
                              <i class="fas fa-times"></i>
                            </button>
                          </div>
                          
                          <div class="bg-preview-image">
                            <template v-if="img_bg_csm.length===0">
                              <a v-if="['png','jpeg','jpg'].includes(getFileExt(x.filename))" 
                                 :href="createFilePath(x.filepath)" 
                                 target="_blank">
                                <img :src="createFilePath(x.filepath)" alt="Background CSM" />
                              </a>
                              <a v-else-if="['mp4'].includes(getFileExt(x.filename))" 
                                 :href="createFilePath(x.filepath)" 
                                 target="_blank" 
                                 class="bg-file-icon">
                                <i class="fas fa-file-video"></i>
                                <span>Video File</span>
                              </a>
                              <div v-else class="bg-file-icon">
                                <i class="fas fa-file-word" v-if="['doc','docx'].includes(getFileExt(x.filename))"></i>
                                <i class="fas fa-file-excel" v-else-if="['xls','xlsx'].includes(getFileExt(x.filename))"></i>
                                <i class="fas fa-file-powerpoint" v-else-if="['ppt','pptx'].includes(getFileExt(x.filename))"></i>
                                <i class="fas fa-file-pdf" v-else-if="['pdf'].includes(getFileExt(x.filename))"></i>
                                <i class="fas fa-file" v-else></i>
                                <span>{{ getFileExt(x.filename).toUpperCase() }}</span>
                              </div>
                            </template>
                            <template v-else>
                              <img :src="createFilePath(x.phi_path)" alt="Background CSM" />
                            </template>
                          </div>

                          <div class="bg-preview-desc">
                            <textarea 
                              class="bg-desc-input" 
                              rows="3" 
                              v-model.trim="x.description" 
                              :placeholder="ui.erp_description||'รายละเอียดรูปพื้นหลัง CSM'"></textarea>
                          </div>
                        </div>
                      </div>
                    </div>

                  <div class="config-card-footer" v-if="attachFileTabCSM().length > 0">
                      <button 
                        v-if="attachmentDataCSM.length === 1 && img_bg_csm.length === 0" 
                        class="config-btn config-btn-save" 
                        @click.prevent="insertImpCSM()">
                        <i class="fas fa-save"></i>
                        <span>{{ ui.save || 'Save' }}</span>
                      </button>
                      <button 
                        v-if="img_bg_csm.length > 0" 
                        class="config-btn config-btn-delete" 
                        @click.prevent="del_img_csm()">
                        <i class="fas fa-trash"></i>
                        <span>{{ ui.delete || 'Delete' }}</span>
                      </button>
                   </div>
                
                  </div>
                  <input type="file" ref="myFileCSM" name="myFileCSM" accept=".jpg,.jpeg,.png,.gif,.raw,image/jpeg,image/png,image/gif" v-show="false" hidden>
                </div>


              </div>
            </div>
          </div>
     
      </template>
    </re-page>
  </div>
</template>
<script>
  let page = {};

  let initial = [];
  initial.push(
    { config_id: 'TRN0001', description: "โปรแกรมใช้สำหรับ Mango เท่านั้น (Program for Mango Only)", config_value: null, type: "checkbox", status_config_p: "Y", status_config_a:"N"},
    { config_id: 'TRN000X', description: "เปิดสิทธิ์การโอนย้าย Req.By", config_value: null, type: "checkbox", status_config_p: "Y", status_config_a: "N" }
  );
  let initial2 = [];
  initial2.push(
    { config_id: 'HTRN001A', description: "ส่วนที่ 1 : รายละเอียดเอกสาร", config_value: "N", type: "checkbox2", id_section: "1"},
    { config_id: 'TRN001A', description: "ชื่อผู้ติดต่อ", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "1"},
    { config_id: 'TRN001B', description: "ตำเเหน่งผู้ติดต่อ", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "1" },
    { config_id: 'TRN001C', description: "เบอร์โทร", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "1"},
    { config_id: 'TRN001D', description: "อีเมล", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "1"},
    { config_id: 'TRN001E', description: "ช่องทางการติดต่อ", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "1"},
    { config_id: 'TRN001F', description: "รายละเอียดการติดต่อ", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "1"},
    { config_id: 'HTRN001B', description: "ส่วนที่ 3 : รายละเอียดส่วนงาน", config_value: "N", type: "checkbox2", id_section: "3"},
    // { config_id: 'TRN001G', description: "ประเภทการบริการ", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" },
    { config_id: 'TRN001H', description: "พื้นที่ / Module", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3"},
    { config_id: 'TRN001I', description: "แผนกส่งเรื่อง", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3"},
    { config_id: 'TRN001J', description: "หมวดงาน / Platform", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3"},
    { config_id: 'TRN001K', description: "ประเภทงาน", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3"},
    { config_id: 'TRN001L', description: "เรื่อง", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3"},
    { config_id: 'TRN001M', description: "รายละเอียด", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3"},
    { config_id: 'TRN001N', description: "Requested Date", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3"},
    { config_id: 'TRN001O', description: "วันที่ติดต่อกลับ", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3"},
    // { config_id: 'TRN001P', description: "วันที่ครบกำหนด", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3"},
    { config_id: 'TRN001Q', description: "Alert Before Date", config_value: null, type: "", type: "checkbox", status_config_p: "N", status_config_a: "Y"  , id_section: "3"},
    { config_id: 'TRN001R', description: "Item(รายการสินค้า)", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3"},
    { config_id: 'TRN001S', description: "Google Map URL", config_value: null, type: "", type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3"},
    { config_id: 'TRN001T', description: "GPS Coordinates DD. (Latitude, Longitude)", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3"},
    { config_id: 'TRN001U', description: "Description", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3" },

    { config_id: 'TRN001V', description: "เพิ่มไฟล์ Requestor", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3" },
    { config_id: 'TRN001W', description: "เพิ่มไฟล์ Worker", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3" },
    { config_id: 'TRN001X', description: "เพิ่มไฟล์ Checker (After)", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "3" }
  );

  let initial3 = [];
  initial3.push(
    { config_id: 'HTRN001C', description: "Mango Post", config_value: "N", type: "checkbox3", id_section: "4"},
    { config_id: 'POST001', description: "ติดตามพัสดุ (Admin)", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "4" },
    { config_id: 'POST002', description: "การสร้างพัสดุ", config_value: null, type: "checkbox", status_config_p: "N", status_config_a: "Y" , id_section: "4" }
  );
  /*initial2 = initial2.filter(item => item.config_id.trim() !== '');*/

  // รายการที่แสดงเฉพาะ AdminMG เท่านั้น
  const adminMGOnlyItems = ['POST001', 'TRN0001'];

  // นามสกุลไฟล์รูปภาพที่อนุญาตให้อัปโหลดเป็น Background
  const allowedImageExt = ['jpg', 'jpeg', 'png', 'gif', 'raw'];

  let cpn = {
    data() {
      return {
        auth,
        baseUrl,
        ui: window.ui,
        xt: $xt,
        tabActive: 0,
        initial,
        initial2,
        initial3,
        attachmentData: [],
        img_bg: [],
        allowedImageExt,
        // Background CSM - Tab 5
        attachmentDataCSM: [],
        img_bg_csm: [],
        adminMGOnlyItems,
        tabs: [
          { label: 'Program Settings', icon: 'fas fa-sliders-h', id: 1 },
          { label: 'Background Setting', icon: 'fas fa-image', id: 2 },
          { label: 'Active Config', icon: 'fas fa-toggle-on', id: 3 },
          { label: 'Other Config', icon: 'fas fa-ellipsis-h', id: 5 },
          { label: 'Background CSM', icon: 'fas fa-image', id: 4 },
        ]
      };
    },
    methods: {
      async onTabChange(t) {
        this.tabActive = t;
      },
      async loadConfig() {
        let act = `CSM/Config/Config_ReadList`;
        let rsp = await $xt.getServer(act);
        if (rsp.data.length > 0) {
          $linq(this.initial).foreach(x => {
            x.config_value = $linq(rsp.data).where(z => z.config_id === x.config_id).select(x => x.config_value).firstOrDefault();
          });
          $linq(this.initial2).foreach(x => {
            x.config_value = $linq(rsp.data).where(z => z.config_id === x.config_id).select(x => x.config_value).firstOrDefault();
          });
          $linq(this.initial3).foreach(x => {
            x.config_value = $linq(rsp.data).where(z => z.config_id === x.config_id).select(x => x.config_value).firstOrDefault();
          });
        }
        await this.readImg();
        await this.readImgCSM(); // Background CSM
      },

      async saveClick() {
        try {
          let f = {
            config: this.initial
          };
          let act = `CSM/Config/Config_Create`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          $notify.success(this.ui.alert_save_success);
          await this.loadConfig();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
    async saveClick2() {
      try {
        let f = {
          config: [...this.initial2, ...this.initial3]
        };
        let act = `CSM/Config/Config_Create2`;
        page.loadingBox.show();
        let rsp = await $xt.postServerJson(act, f);
        // console.log("kk",rsp.data)
        if (!rsp.success) {
          throw rsp.error;
        }
        $notify.success(this.ui.alert_save_success);
        await this.loadConfig();
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
        page.loadingBox.hide();
      }
    },
      // ============================================
      // Background Setting Methods (Tab 2)
      // ============================================
      addFile() {
        $(this.$refs.myFile).click()
      },
      async delFile(itemno, maincode) {
        if (!await $msg.confirm(`คุณกำลังจะลบไฟล์แนบ โปรดยืนยัน`)) {
          return
        }
        this.attachmentData = $linq(this.attachmentData).where(x => !(x.itemno == itemno && x.maincode == maincode)).toArray()
      },
      attachFileTab() {
        let d = []
        if (this.img_bg.length === 0) {
          d = $linq(this.attachmentData).where(x => x.maincode == this.auth.maincode).toArray() || [];
          return d
        }
        else {
          d = $linq(this.img_bg).where(x => x.config_id != 'TRN0001').toArray() || [];
          return d
        }
      },
      async fileUpload(file) {
        if (!file) return
        if (!this.allowedImageExt.includes(this.getFileExt(file.name))) {
          $msg.alert('', 'กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, JPEG, PNG, GIF, RAW)', 'warning')
          $(this.$refs.myFile).val('')
          return
        }
        let f = new FormData()
        f.append('file', file)
        try {
          let r = await $xt.postServerForm('Data/CSM_FileUploadToTemp', f)
          if (!r.success) {
            throw r.error
          }
          let itemno = (this.attachmentData.length == 0 ? 0 : ($linq(this.attachmentData).max(x => x.itemno) || 0)) + 1
          this.attachmentData.push({
            itemno: itemno,
            config_id: 'TRN0002',
            filename: r.filename || '',
            config_value: r.id || '',
            maincode: this.auth.maincode,
            description: r.description || '',
            filepath: r.id || '',
          })
          $(this.$refs.myFile).val('')

        }
        catch (ex) {
          $msg.alert('', ex.toString(), 'danger')
        }
      },
      async insertImp() {
        try {
          let k = {
            attach: this.attachmentData,
          }
          page.loadingBox.show()
          let act = `CSM/Data/csm_conF_bg`
          let rsp = await $xt.postServerJson(act, k)
          if (!rsp.success) {
            throw rsp.error
          }
          $notify.success(this.ui.alert_save_success)
          await this.loadConfig();
        }
        catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          page.loadingBox.hide()
        }
      },
      async readImg() {
        try {
          let act = `CSM/Data/CSM_Read_img`;
          let resp = await $xt.getServer(act);
          this.img_bg = resp.data.img || [];
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        }
      },
      async del_img() {
        try {
          let k = {
            attach: this.img_bg,
          }
          page.loadingBox.show()
          let act = `CSM/Data/DeleteImg_bg`
          let rsp = await $xt.postServerJson(act, k)
          if (!rsp.success) {
            throw rsp.error
          }
          $notify.success(this.ui.alert_delete_success)
          await this.loadConfig();
        }
        catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          page.loadingBox.hide()
        }
      },

      // ============================================
      // Background CSM Methods (Tab 5)
      // ============================================
      addFileCSM() {
        $(this.$refs.myFileCSM).click()
      },
      async delFileCSM(itemno, maincode) {
        if (!await $msg.confirm(`คุณกำลังจะลบไฟล์แนบ โปรดยืนยัน`)) {
          return
        }
        this.attachmentDataCSM = $linq(this.attachmentDataCSM).where(x => !(x.itemno == itemno && x.maincode == maincode)).toArray()
      },
      attachFileTabCSM() {
        let d = []
        if (this.img_bg_csm.length === 0) {
          d = $linq(this.attachmentDataCSM).where(x => x.maincode == this.auth.maincode).toArray() || [];
          return d
        }
        else {
          d = $linq(this.img_bg_csm).where(x => x.config_id == 'TRN9999').toArray() || [];
          return d
        }
      },
      async fileUploadCSM(file) {
        if (!file) return
        if (!this.allowedImageExt.includes(this.getFileExt(file.name))) {
          $msg.alert('', 'กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, JPEG, PNG, GIF, RAW)', 'warning')
          $(this.$refs.myFileCSM).val('')
          return
        }
        let f = new FormData()
        f.append('file', file)
        try {
          let r = await $xt.postServerForm('Data/CSM_FileUploadToTemp', f)
          if (!r.success) {
            throw r.error
          }
          let itemno = (this.attachmentDataCSM.length == 0 ? 0 : ($linq(this.attachmentDataCSM).max(x => x.itemno) || 0)) + 1
          this.attachmentDataCSM.push({
            itemno: itemno,
            config_id: 'TRN9999', // Background CSM config_id
            filename: r.filename || '',
            config_value: r.id || '',
            maincode: this.auth.maincode||'MG1',
            description: r.description || '',
            filepath: r.id || '',
          })
          $(this.$refs.myFileCSM).val('')

        }
        catch (ex) {
          $msg.alert('', ex.toString(), 'danger')
        }
      },
      async insertImpCSM() {
        try {
          let k = {
            attach: this.attachmentDataCSM,
          }
          page.loadingBox.show()
          // Background CSM API
          let act = `CSM/Data/csm_insert_bg_csm`
          let rsp = await $xt.postServerJson(act, k)
          if (!rsp.success) {
            throw rsp.error
          }
          $notify.success(this.ui.alert_save_success)
          await this.loadConfig();
        }
        catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          page.loadingBox.hide()
        }
      },
      async readImgCSM() {
        try {
          // Background CSM Read API
          let act = `CSM/Data/CSM_Read_img_csm`;
          let resp = await $xt.getServer(act);
          this.img_bg_csm = resp.data.img || [];
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        }
      },
      // ============================================
      // Utility Methods
      // ============================================
      createFilePath(x) {
        // console.log(dataServer + 'Api/File/DownLoad?id=' + x)
        return dataServer + 'Api/File/DownLoad?id=' + x
      },
      getFileExt(f) {
        return f?.split('.').pop().toLowerCase()
      },
      showPictures(pathto) {
        // console.log('gggg', pathto)
        return window.dataServer + "/Api/File/DownLoad?id=" + pathto
      },
      async del_img_csm() {
        try {
          let k = {
            attach: this.img_bg_csm,
          }
          page.loadingBox.show()
          let act = `CSM/Data/DeleteImg_bgCSM`
          let rsp = await $xt.postServerJson(act, k)
          if (!rsp.success) {
            throw rsp.error
          }
          $notify.success(this.ui.alert_delete_success)
          await this.loadConfig();
        }
        catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          page.loadingBox.hide()
        }
      },
      SelectAll(id, value) {
        if (id == 1) {
          //log all initial2 where id_section = 1
          let all = $linq(this.initial2).where(x => x.id_section == 1 && x.config_id != 'HTRN001A').toArray();
          $linq(all).foreach(x => x.config_value = value);
        } else if (id == 3) {
          //log all initial2 where id_section = 3
          let all = $linq(this.initial2).where(x => x.id_section == 3 && x.config_id != 'HTRN001B').toArray();
          $linq(all).foreach(x => x.config_value = value);
        } else if (id == 4) {
          //log all initial3 where id_section = 4
          let all = $linq(this.initial3).where(x => x.id_section == 4 && x.config_id != 'HTRN001C').toArray();
          // ถ้าไม่ใช่ AdminMG ให้ข้าม POST001
          if (!this.isAdminMG()) {
            all = all.filter(x => x.config_id !== 'POST001');
          }
          $linq(all).foreach(x => x.config_value = value);
        }
      },
      getChildItems(sectionId) {
        return $linq(this.initial2).where(x => x.id_section == sectionId && !['HTRN001A', 'HTRN001B', 'HTRN001C'].includes(x.config_id)).toArray();
      },
      SelectItem() {
        const updateTarget = (sectionId, targetId, dataArray) => {
            let all = $linq(dataArray).where(x => x.id_section == sectionId && x.config_id != targetId).toArray();
            // ถ้าเป็น section 4 และไม่ใช่ AdminMG ให้ข้าม POST001 ในการคำนวณ
            if (sectionId == 4 && !this.isAdminMG()) {
              all = all.filter(x => x.config_id !== 'POST001');
            }
            let target = dataArray.find(x => x.config_id === targetId);
            if (target) {
              target.config_value = all.every(x => x.config_value === 'Y') ? 'Y' : 'N';
            }
        };
        updateTarget(1, 'HTRN001A', this.initial2);
        updateTarget(3, 'HTRN001B', this.initial2);
        updateTarget(4, 'HTRN001C', this.initial3);
      },
      isAdminMG() {
        let department = this.auth.empcode.substring(0, 11)
     //   console.log('fdfd', department)
        return ['ITMANGO', 'MG', 'EX0001', '99988778899'].includes(department)
      },
    },
    computed: {
    availableTabs() {
        return this.tabs.filter(tab => {
          // ถ้าเป็น tab Background CSM (label หรือ id ที่ระบุ)
          // ให้เช็คเงื่อนไข auth.maincode
          if (tab.id === 4) {
            return ['mg1', 'mgc','mgx','MG1','MGC','MGX'].includes(this.auth.maincode);
          }
          // Tab อื่นๆ ให้แสดงตามปกติ
          return true;
        });
  },
    activeConfigSections() {
      const headers = this.initial2.filter(x => x.type === 'checkbox2');
      return headers.map(h => {
        const items = this.initial2.filter(x => x.id_section === h.id_section && x.type !== 'checkbox2');
        const onCount = items.filter(x => x.config_value === 'Y').length;
        return { header: h, items, onCount, total: items.length };
      });
    },
    activeConfigTotalOn() {
      return this.activeConfigSections.reduce((sum, s) => sum + s.onCount, 0);
    },
    activeConfigTotalCount() {
      return this.activeConfigSections.reduce((sum, s) => sum + s.total, 0);
    },
    activeConfigTotalPercent() {
      return this.activeConfigTotalCount ? Math.round((this.activeConfigTotalOn / this.activeConfigTotalCount) * 100) : 0;
    }
    },
    async mounted() {
      page = this.$refs.page;
      page.pageTitle = 'Program Config : Settings';
      document.title = page.pageTitle;
      await this.loadConfig();
      await this.readImg();

      this.$nextTick(() => {
        // Background Setting file input
        $(this.$refs.myFile).on('change', (e) => {
          this.fileUpload(e.target.files[0])
        })
        // Background CSM file input
        $(this.$refs.myFileCSM).on('change', (e) => {
          this.fileUploadCSM(e.target.files[0])
        })
      })
      

    }
  };
  export default cpn;
</script>
<style scoped>
  /* ════════════════════════════════════════
     Modern Config Page Design
  ════════════════════════════════════════ */

  .config-container {
    height: calc(100vh - 60px);
    background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
    padding: 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Header */
  .config-header {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border-radius: 5px;
    padding: 28px 32px;
    margin-bottom: 24px;
    box-shadow: 0 8px 24px rgba(30, 58, 138, 0.25);
    flex-shrink: 0;
  }

  .config-header-content {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .config-header-icon {
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #fff;
    flex-shrink: 0;
  }

  .config-title {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .config-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
    margin: 4px 0 0;
  }

  /* Tabs */
  .config-tabs-wrapper {
    background: #fff;
    border-radius: 5px;
    padding: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
  }

  .config-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .config-tab {
    flex: 1;
    min-width: 180px;
    padding: 14px 20px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .config-tab i {
    font-size: 16px;
  }

  .config-tab:hover {
    background: #f1f5f9;
    color: #475569;
  }

  .config-tab.active {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
  }

  /* Body */
  .config-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .config-body > .tab-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .config-body > .tab-content > .tab-pane {
    display: none;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  .config-body > .tab-content > .tab-pane.active {
    display: flex;
  }

  /* Card */
  .config-card {
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .config-card-header {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 20px 24px;
    border-bottom: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    flex-shrink: 0;
  }

  .config-card-header i {
    font-size: 20px;
    color: #1e40af;
  }

  .config-card-body {
    padding: 24px;
    flex: 1;
    overflow-y: auto;
  }

  .config-card-body::-webkit-scrollbar {
    width: 8px;
  }

  .config-card-body::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  .config-card-body::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .config-card-body::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .config-card-footer {
    padding: 20px 24px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-shrink: 0;
  }

  /* Config List */
  .config-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .config-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: #fff;
    border-radius: 6px;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .config-item:hover {
    background: #f8fafc;
    border-color: #e2e8f0;
  }

  .config-item-header {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border: 1px solid #93c5fd;
    font-weight: 700;
    padding: 18px 20px;
  }

  .config-item-header:hover {
    background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  }

  .config-item-child {
    padding-left: 48px;
  }

  .config-item-label {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: #334155;
    flex: 1;
  }

  .config-item-header .config-item-label {
    color: #1e40af;
    font-size: 15px;
  }

  .config-item-icon {
    font-size: 18px;
    color: #2563eb;
  }

  .config-item-dot {
    font-size: 6px;
    color: #cbd5e1;
  }

  .config-item-control {
    flex-shrink: 0;
  }

  /* Modern Switch */
  .modern-switch {
    position: relative;
    display: inline-block;
    width: 52px;
    height: 28px;
    cursor: pointer;
  }

  .modern-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .modern-switch-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #cbd5e1;
    border-radius: 28px;
    transition: all 0.3s;
  }

  .modern-switch-slider:before {
    content: "";
    position: absolute;
    height: 22px;
    width: 22px;
    left: 3px;
    bottom: 3px;
    background: #fff;
    border-radius: 50%;
    transition: all 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .modern-switch input:checked + .modern-switch-slider {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  }

  .modern-switch input:checked + .modern-switch-slider:before {
    transform: translateX(24px);
  }

  /* Buttons */
  .config-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .config-btn i {
    font-size: 14px;
  }

  .config-btn-save {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .config-btn-save:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  }

  .config-btn-upload {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .config-btn-upload:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }

  .config-btn-delete {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  .config-btn-delete:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
  }

  /* Background Preview */
  .empty-bg-state {
    text-align: center;
    padding: 60px 20px;
  }

  .empty-bg-icon {
    font-size: 64px;
    color: #cbd5e1;
    margin-bottom: 16px;
  }

  .empty-bg-state p {
    font-size: 16px;
    color: #64748b;
    margin-bottom: 24px;
  }

  .bg-preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  .bg-preview-card {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s;
  }

  .bg-preview-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .bg-preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #e2e8f0;
  }

  .bg-preview-id {
    font-size: 12px;
    font-weight: 700;
    color: #1e40af;
    background: #dbeafe;
    padding: 4px 12px;
    border-radius: 6px;
  }

  .bg-delete-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: #fee2e2;
    color: #ef4444;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .bg-delete-btn:hover {
    background: #ef4444;
    color: #fff;
  }

  .bg-preview-image {
    height: 200px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .bg-preview-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .bg-preview-image a {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bg-file-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #64748b;
    text-decoration: none;
  }

  .bg-file-icon i {
    font-size: 48px;
  }

  .bg-file-icon span {
    font-size: 12px;
    font-weight: 600;
  }

  .bg-preview-desc {
    padding: 16px;
  }

  .bg-desc-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 13px;
    color: #334155;
    resize: vertical;
    font-family: inherit;
    transition: all 0.2s;
  }

  .bg-desc-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .bg-desc-input::placeholder {
    color: #94a3b8;
  }

  /* ════════════════════════════════════════
     Active Config — grouped sections (initial2)
  ════════════════════════════════════════ */

  .ac2-overview {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    font-size: 12.5px;
    font-weight: 600;
    color: #64748b;
  }

  .ac2-overview__bar {
    width: 140px;
    height: 6px;
    border-radius: 999px;
    background: #e2e8f0;
    overflow: hidden;
  }

  .ac2-overview__bar > span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    border-radius: 999px;
    transition: width 0.25s ease;
  }

  .ac2-section + .ac2-section {
    margin-top: 20px;
  }

  .ac2-band {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: linear-gradient(135deg, #eef1fc 0%, #e4e9fa 100%);
    border: 1px solid #dbe1f7;
    border-radius: 10px 10px 0 0;
    flex-wrap: wrap;
  }

  .ac2-band__icon {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    background: #fff;
    color: #1e40af;
    font-size: 15px;
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
  }

  .ac2-band__text {
    flex: 1;
    min-width: 180px;
  }

  .ac2-band__title {
    font-size: 14.5px;
    font-weight: 700;
    color: #1e293b;
  }

  .ac2-band__code {
    font-size: 11px;
    color: #94a3b8;
    font-family: monospace;
    margin-top: 1px;
  }

  .ac2-band__count {
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    background: #fff;
    border: 1px solid #e2e8f0;
    padding: 5px 10px;
    border-radius: 999px;
    white-space: nowrap;
  }

  .ac2-master {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .ac2-master__caption {
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    white-space: nowrap;
  }

  .ac2-field-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(258px, 1fr));
    gap: 1px;
    background: #e2e8f0;
    border: 1px solid #e2e8f0;
    border-top: none;
    border-radius: 0 0 10px 10px;
    overflow: hidden;
  }

  .ac2-field {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    background: #fff;
    cursor: pointer;
    transition: background 0.15s;
  }

  .ac2-field:hover {
    background: #f8fafc;
  }

  .ac2-field__main {
    display: flex;
    align-items: center;
    gap: 9px;
    flex: 1;
    min-width: 0;
  }

  .ac2-field__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #cbd5e1;
    flex-shrink: 0;
    transition: background 0.15s;
  }

  .ac2-field--on .ac2-field__dot {
    background: #10b981;
  }

  .ac2-field__label {
    font-size: 13.5px;
    font-weight: 600;
    color: #1e293b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ac2-field__code {
    font-size: 10.5px;
    color: #94a3b8;
    font-family: monospace;
    flex-shrink: 0;
  }

  /* Toggle switch (Active Config only) */
  .ac2-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .ac2-switch input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .ac2-switch__track {
    position: relative;
    width: 36px;
    height: 20px;
    background: #cbd5e1;
    border-radius: 20px;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .ac2-switch__track:before {
    content: "";
    position: absolute;
    width: 14px;
    height: 14px;
    left: 3px;
    top: 3px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    transition: transform 0.2s;
  }

  .ac2-switch input:checked + .ac2-switch__track {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  .ac2-switch input:checked + .ac2-switch__track:before {
    transform: translateX(16px);
  }

  .ac2-switch--partial .ac2-switch__track {
    background: repeating-linear-gradient(135deg, #3457d5 0 6px, #1e40af 6px 12px);
  }

  .ac2-switch--partial .ac2-switch__track:before {
    transform: translateX(8px);
  }

  .ac2-switch--sm .ac2-switch__track {
    width: 32px;
    height: 18px;
  }

  .ac2-switch--sm .ac2-switch__track:before {
    width: 12px;
    height: 12px;
  }

  .ac2-switch--sm input:checked + .ac2-switch__track:before {
    transform: translateX(14px);
  }

  /* Dark Mode */
  body.dark-mode .config-container {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  body.dark-mode .config-header {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  }

  body.dark-mode .config-tabs-wrapper {
    background: #1e293b;
  }

  body.dark-mode .config-tab {
    color: #94a3b8;
  }

  body.dark-mode .config-tab:hover {
    background: #334155;
    color: #cbd5e1;
  }

  body.dark-mode .config-tab.active {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  }

  body.dark-mode .config-card {
    background: #1e293b;
  }

  body.dark-mode .config-card-header {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    border-bottom-color: #334155;
    color: #e2e8f0;
  }

  body.dark-mode .config-card-footer {
    background: #0f172a;
    border-top-color: #334155;
  }

  body.dark-mode .config-item {
    background: #1e293b;
  }

  body.dark-mode .config-item:hover {
    background: #334155;
    border-color: #475569;
  }

  body.dark-mode .config-item-header {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border-color: #3b82f6;
  }

  body.dark-mode .config-item-label {
    color: #cbd5e1;
  }

  body.dark-mode .config-item-header .config-item-label {
    color: #93c5fd;
  }

  body.dark-mode .modern-switch-slider {
    background: #475569;
  }

  body.dark-mode .bg-preview-card {
    background: #0f172a;
    border-color: #334155;
  }

  body.dark-mode .bg-preview-header {
    background: #1e293b;
    border-bottom-color: #334155;
  }

  body.dark-mode .bg-preview-image {
    background: #0f172a;
  }

  body.dark-mode .bg-desc-input {
    background: #0f172a;
    border-color: #334155;
    color: #e2e8f0;
  }

  body.dark-mode .bg-desc-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  body.dark-mode .empty-bg-icon {
    color: #475569;
  }

  body.dark-mode .empty-bg-state p {
    color: #94a3b8;
  }

  body.dark-mode .ac2-overview {
    color: #94a3b8;
  }

  body.dark-mode .ac2-overview__bar {
    background: #334155;
  }

  body.dark-mode .ac2-band {
    background: linear-gradient(135deg, #1e293b 0%, #263449 100%);
    border-color: #334155;
  }

  body.dark-mode .ac2-band__icon {
    background: #0f172a;
    color: #93c5fd;
  }

  body.dark-mode .ac2-band__title {
    color: #e2e8f0;
  }

  body.dark-mode .ac2-band__count {
    background: #0f172a;
    border-color: #334155;
    color: #cbd5e1;
  }

  body.dark-mode .ac2-master__caption {
    color: #cbd5e1;
  }

  body.dark-mode .ac2-field-grid {
    background: #334155;
    border-color: #334155;
  }

  body.dark-mode .ac2-field {
    background: #1e293b;
  }

  body.dark-mode .ac2-field:hover {
    background: #263449;
  }

  body.dark-mode .ac2-field__label {
    color: #e2e8f0;
  }

  body.dark-mode .ac2-switch__track {
    background: #475569;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .config-container {
      padding: 16px;
    }

    .config-header {
      padding: 20px;
    }

    .config-title {
      font-size: 22px;
    }

    .config-tabs {
      flex-direction: column;
    }

    .config-tab {
      min-width: 100%;
    }

    .bg-preview-grid {
      grid-template-columns: 1fr;
    }

    .config-item-child {
      padding-left: 32px;
    }
  }
</style>

<style>
  .content-body {
    overflow-y: hidden !important;
  }
</style>
