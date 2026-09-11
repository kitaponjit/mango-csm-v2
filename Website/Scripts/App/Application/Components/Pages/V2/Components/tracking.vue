<template>
  <div>
    <div class="row">
      <!-- Project List -->
      <div v-if="!selectedParcel">
        <div v-if="filteredProjects.length === 0" class="col-xs-12">
          <div class="empty-state">
            <i class="fas fa-box-open"></i>
            <p>{{ ui.csm_v2_no_project_data }}</p>
          </div>
        </div>
        <div v-for="x in filteredProjects" class="col-sm-6 col-md-4 my-10">
          <div class="project-card" @click="selectParcel(x)">
            <div class="project-card-img" :style="`background-image: url(${showPictures(x.img_proj)});`"></div>
            <div class="project-card-overlay"></div>
            <div class="project-card-content">
              <span class="project-card-title">{{ x.house_no }}</span>
              <button type="button" class="btn btn-sm project-card-btn">
                <i class="fas fa-truck margin-r-5"></i>{{ ui.csm_v2_parcel_tracking }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Parcel Detail -->
      <div v-else class="col-sm-12 col-md-12 my-10">
        <div class="hidden-xs" style="position: absolute; margin-top: -110px; left: 0;">
          <a class="btn" @click="goBack">
            <img :src="`${baseUrl}Content/Images/Icon SVG/left_arrow_bordered.svg`" />
          </a>
        </div>

        <div class="tracking-container">
          <!-- Tab Header -->
          <div class="tracking-tabs">
            <button v-for="tab in tabs_tracking" :key="tab.id"
                    class="tracking-tab-btn"
                    :class="{ active: activeTab === tab.id }"
                    @click="activeTab = tab.id; changeTab()">
              <i :class="tab.id === 'Header_tab1' ? 'fas fa-clock' : 'fas fa-check-circle'" class="margin-r-5"></i>
              {{ tab.text }}
              <span class="tracking-tab-badge" v-if="tab.id === 'Header_tab1' && pendingParcels.length > 0">{{ pendingParcels.length }}</span>
              <span class="tracking-tab-badge completed" v-if="tab.id === 'Header_tab2' && completedParcels.length > 0">{{ completedParcels.length }}</span>
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tracking-content">
            <!-- Tab1 พัสดุรอดำเนินการ -->
            <div v-show="activeTab === 'Header_tab1'">
              <div v-if="pendingParcels.length === 0" class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>{{ ui.csm_v2_no_parcel_pending }}</p>
              </div>
              <div v-else class="parcel-list">
                <div v-for="(item, index) in pendingParcels" :key="item.postid" class="parcel-card">
                  <div class="parcel-card-img" @click="viewImage(getParcelImages(item))">
                    <template v-if="getParcelImages(item).length > 0">
                      <img :src="showPictures(getParcelImages(item)[0].pathto)" />
                      <span class="parcel-img-count" v-if="getParcelImages(item).length > 1">+{{ getParcelImages(item).length - 1 }}</span>
                    </template>
                    <template v-else>
                      <i class="fas fa-box" style="font-size: 24px; color: #ccc;"></i>
                    </template>
                  </div>
                  <div class="parcel-card-info">
                    <span class="parcel-postid">{{ item.postid }}</span>
                    <span class="parcel-date"><i class="far fa-clock margin-r-5"></i>{{ item.add_dt|date('DD/MM/YYYY HH:mm') }}</span>
                  </div>
                  <div class="parcel-card-status pending">
                    <i class="fas fa-hourglass-half"></i>
                    <span>{{ ui.csm_v2_status_pending }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab2 พัสดุเสร็จสิ้น -->
            <div v-show="activeTab === 'Header_tab2'">
              <div v-if="completedParcels.length === 0" class="empty-state">
                <i class="fas fa-clipboard-check"></i>
                <p>{{ ui.csm_v2_no_parcel_done }}</p>
              </div>
              <div v-else class="parcel-list">
                <div v-for="(item, index) in completedParcels" :key="item.postid" class="parcel-card">
                  <div class="parcel-card-img" @click="viewImage(getParcelImages(item))">
                    <template v-if="getParcelImages(item).length > 0">
                      <img :src="showPictures(getParcelImages(item)[0].pathto)" />
                      <span class="parcel-img-count" v-if="getParcelImages(item).length > 1">+{{ getParcelImages(item).length - 1 }}</span>
                    </template>
                    <template v-else>
                      <i class="fas fa-box" style="font-size: 24px; color: #ccc;"></i>
                    </template>
                  </div>
                  <div class="parcel-card-info">
                    <span class="parcel-postid">{{ item.postid }}</span>
                    <span class="parcel-date"><i class="far fa-clock margin-r-5"></i>{{ item.add_dt|date('DD/MM/YYYY HH:mm') }}</span>
                    <span class="parcel-date text-success-v2"><i class="fas fa-check margin-r-5"></i>{{ ui.csm_v2_received_at }} {{ item.rec_dt|date('DD/MM/YYYY HH:mm') }}</span>
                  </div>
                  <div class="parcel-card-actions">
                    <div class="parcel-card-status completed">
                      <i class="fas fa-check-circle"></i>
                      <span>{{ ui.csm_v2_status_finished }}</span>
                    </div>
                    <div class="parcel-signature" v-if="getSignatureImages(item).length > 0" @click="viewImage(getSignatureImages(item))">
                      <img :src="showPictures(getSignatureImages(item)[0].pathto)" />
                      <span>{{ ui.csm_v2_signature }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <loading-box ref="loadingBox"></loading-box>
  </div>
</template>

<script>
  import PhotoSwipe from 'photoswipe';
  import 'photoswipe/style.css';

  import loadingBox from "../../../Center/loading-box.vue";

  let loading = {};

  export default {
    name: "ProjectCard",
    props: {
      searchText: {
        type: String,
        default: ''
      },
    },
    components: {
      loadingBox,
    },
    data() {
      return {
        ui: window.ui,
        xt: $xt,
        customer: window.customer_auth,
        tabs_tracking: [
          { id: "Header_tab1", text: window.ui.csm_v2_parcel_pending, text2: "", isEdit: false, status: "", showbutton: true, showTotal: false, total: 0 },
          { id: "Header_tab2", text: window.ui.csm_v2_parcel_done, text2: "", isEdit: false, status: "", showbutton: true, showTotal: false, total: 0 },
        ],
        selectedParcel: null,
        activeTab: "Header_tab1",
        baseUrl,
        data: [],
        data_tracking: [],
      };
    },
    methods: {
      changeTab() {
        this.$emit('clearSearch', '');
      },
      selectParcel(parcel) {
        this.$emit('clearSearch', '');
        this.selectedParcel = parcel;
        this.load_data_readlist(parcel.pre_event);
      },
      goBack() {
        this.selectedParcel = null;
        this.activeTab = "Header_tab1"; // รีเซ็ต tab ด้วยถ้าต้องการ
      },
      showPictures(pathto) {
        return window.dataServer + "Api/File/DownLoad?id=" + encodeURIComponent(pathto)
      },
      getFileExt(f) {
        if (!f || typeof f !== 'string') return '';
        const parts = f.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
      },
      viewImage(source) {
        if (!Array.isArray(source) || source.length === 0) {
          return;
        }

        const modifiedSource = source.map(file => {
          const ext = this.getFileExt(file.pathfrom).toLowerCase();
          const fileTypes = {
            mp4: 'fa-file-video',
            doc: 'fa-file-word',
            docx: 'fa-file-word',
            xls: 'fa-file-excel',
            xlsx: 'fa-file-excel',
            ppt: 'fa-file-powerpoint',
            pptx: 'fa-file-powerpoint',
            pdf: 'fa-file-pdf'
          };

          const isImage = ['jpg', 'jpeg', 'png'].includes(ext);
          const isKnownDoc = Object.keys(fileTypes).includes(ext)

          const imageSrc = this.showPictures(file.pathto);

          // แบบพิเศษ: item_type === 'T' → แบ่งซ้ายขวา
          if (file.item_type === 'T') {
            let leftContent = '';
            if (isImage) {
              leftContent = `<img src="${imageSrc}" alt="${file.pathfrom}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />`;
            } else if (isKnownDoc) {
              leftContent = `<i class="fas ${fileTypes[ext]} fa-7x" style="color: #666;"></i>`;
            } else {
              leftContent = `<i class="fa fa-file fa-7x" style="color: #999;"></i>`;
            }

            return {
              html: `
              <div style="display: flex; flex-direction: row; width: 80vw; height: 60vh; margin: auto; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 0 15px rgba(0,0,0,0.3);">
                <div style="flex: 1; display: flex; justify-content: center; align-items: center; background: #f4f4f4;">
                  ${leftContent}
                </div>
                <div style="flex: 1; padding: 20px; overflow-y: auto; background: #fff; color: #333;">
                  <h4>${this.ui.csm_v2_description}</h4>
                  <p>${file.pathfrom || this.ui.csm_v2_no_details}</p>
                </div>
              </div>
            `,
              isIcon: false,
              alt: file.pathfrom,
              src2: imageSrc
            };
          }
          // ปกติ: แสดงภาพ
          if (isImage) {
            return {
              html: `<img src="${imageSrc}" alt="${file.pathfrom}" style="background-color: white; max-width: 600px; max-height: 400px; width: auto; height: auto; object-fit: contain; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);"/>`,
              isIcon: false,
              alt: file.pathfrom,
              src2: imageSrc
            };
          }
          // ปกติ: ไฟล์ที่รู้จัก
          if (isKnownDoc) {
            return {
              html: `<i class="fas ${fileTypes[ext]} fa-5x" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white;"></i>`,
              isIcon: true,
              alt: file.pathfrom,
              src2: imageSrc
            };
          }
          // ปกติ: อื่นๆ
          return {
            html: `<i class="fa fa-file fa-5x" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white;"></i>`,
            isIcon: true,
            alt: file.pathfrom,
            src2: imageSrc
          };
        });

        const options = {
          dataSource: modifiedSource,
          showHideAnimationType: 'none'
        }

        // console.log('o:', options);
        // console.log('s:', source);

        const pswp = new PhotoSwipe(options)
        pswp.on('uiRegister', function () {
          pswp.ui.registerElement({
            name: 'bulletsIndicator',
            className: 'pswp__bullets-indicator',
            appendTo: 'wrapper',
            onInit: (el, pswp) => {
              const bullets = [];
              let bullet;
              let prevIndex = -1;

              for (let i = 0; i < pswp.getNumItems(); i++) {
                bullet = document.createElement('div');
                bullet.className = 'pswp__bullet';
                bullet.onclick = (e) => {
                  pswp.goTo(bullets.indexOf(e.target));
                };
                el.appendChild(bullet);
                bullets.push(bullet);
              }

              pswp.on('change', () => {
                if (prevIndex >= 0) {
                  bullets[prevIndex].classList.remove('pswp__bullet--active');
                }
                bullets[pswp.currIndex].classList.add('pswp__bullet--active');
                prevIndex = pswp.currIndex;
              });
            }
          });

          pswp.ui.registerElement({
            name: 'download-button',
            order: 8,
            isButton: true,
            tagName: 'a',
            html: {
              isCustomSVG: true,
              inner: '<path d="M20.5 14.3 17.1 18V10h-2.2v7.9l-3.4-3.6L10 16l6 6.1 6-6.1ZM23 23H9v2h14Z" id="pswp__icn-download"/>',
              outlineID: 'pswp__icn-download'
            },
            onInit: (el, pswp) => {
              el.setAttribute('download', '');
              el.setAttribute('target', '_blank');
              el.setAttribute('rel', 'noopener');

              pswp.on('change', () => {
                const currSrc = pswp.currSlide.data.src2;
                if (currSrc) {
                  el.href = currSrc;
                } else {
                  el.href = pswp.currSlide.data.src;
                }
              });
            }
          });
          pswp.ui.registerElement({
            name: 'custom-caption',
            order: 9,
            isButton: false,
            appendTo: 'root',
            html: 'Caption text',
            onInit: (el, pswp) => {
              pswp.on('change', () => {
                const currSlideElement = pswp.currSlide.data.alt;
                el.innerHTML = currSlideElement || '';
              });
            }
          });
        });
        pswp.init();
      },
      async load_data_read() {
        try {
          let action = `CSM/CustomerData/CSM_MangoPost_Read?maincode=${this.customer.maincode}&userid=${this.customer.userid}`;
          let res = await $xt.getCustomerServer(action);
          this.$set(this, 'data', res.data.q);
        } catch (error) {
          $msg.alert('Error', `Failed to load tracking data: ${error.message}`, 'error');
        }
      },
      async load_data_readlist(pre_event) {
        try {
          let action = `CSM/CustomerData/CSM_MangoPost_Readlist?maincode=${this.customer.maincode}&pre_event=${pre_event}`;
          let res = await $xt.getCustomerServer(action);
          this.$set(this, 'data_tracking', res.data.q);
        } catch (error) {
          $msg.alert('Error', `Failed to load tracking data: ${error.message}`, 'error');
        }
      },
      getFilesPath(item) {
        if (!item.files_path) return [];
        try {
          return JSON.parse(item.files_path);
        } catch (error) {
          console.error('Error parsing files_path:', error);
          return [];
        }
      },
      getParcelImages(item) {
        const files = this.getFilesPath(item);
        return files.filter(file => file.select_pic === 'P');
      },
      getSignatureImages(item) {
        const files = this.getFilesPath(item);
        return files.filter(file => file.select_pic === 'S');
      },
    },
    computed: {
      filteredProjects() {
        let list = this.data;
        if (this.searchText.trim()) {
          const search = this.searchText.toLowerCase();
          list = list.filter(project => project.house_no.toLowerCase().includes(search) || (project.postid && project.postid.toLowerCase().includes(search)));
        }
        const uniqueHouseMap = new Map();
        list.forEach(item => {
          if (!uniqueHouseMap.has(item.house_no)) {
            uniqueHouseMap.set(item.house_no, item);
          }
        });
        return Array.from(uniqueHouseMap.values());
      },
      pendingParcels() {
        // พัสดุที่ยังไม่มีลายเซ็นผู้รับ
        let parcels = this.data_tracking.filter(item => item.post_status !== 'C');
        if (this.selectedParcel && this.searchText.trim()) {
          const search = this.searchText.toLowerCase();
          parcels = parcels.filter(item =>
            (item.postid && item.postid.toLowerCase().includes(search))
          );
        }
        return parcels;
      },
      completedParcels() {
        // พัสดุที่มีลายเซ็นผู้รับแล้ว
        let parcels = this.data_tracking.filter(item => item.post_status === 'C');
        if (this.selectedParcel && this.searchText.trim()) {
          const search = this.searchText.toLowerCase();
          parcels = parcels.filter(item =>
            (item.postid && item.postid.toLowerCase().includes(search))
          );
        }
        return parcels;
      },
    },
    async mounted() {
      loading = this.$refs.loadingBox;

      loading.show();

      await this.load_data_read();

      loading.hide();
    },
  };
</script>

<style scoped>
  /* Project Cards */
  .project-card {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    height: 180px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .project-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .project-card-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
  }

  .project-card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, transparent 30%, rgba(0, 0, 0, 0.7) 100%);
  }

  .project-card-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .project-card-title {
    color: #fff;
    font-weight: bold;
    font-size: 16px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  .project-card-btn {
    background: #00BF9D;
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 12px;
    white-space: nowrap;
  }

  .project-card-btn:hover {
    background: #00a88a;
    color: #fff;
  }

  /* Tracking Container */
  .tracking-container {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .tracking-tabs {
    display: flex;
    border-bottom: 1px solid #f0f0f0;
    padding: 0;
  }

  .tracking-tab-btn {
    flex: 1;
    padding: 14px 20px;
    border: none;
    background: transparent;
    font-size: 14px;
    color: #999;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  .tracking-tab-btn.active {
    color: #00BF9D;
    font-weight: bold;
  }

  .tracking-tab-btn.active::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 20%;
    width: 60%;
    height: 3px;
    background: #00BF9D;
    border-radius: 3px 3px 0 0;
  }

  .tracking-tab-badge {
    background: #ff6b6b;
    color: #fff;
    font-size: 11px;
    padding: 2px 7px;
    border-radius: 10px;
    font-weight: bold;
  }

  .tracking-tab-badge.completed {
    background: #00BF9D;
  }

  .tracking-content {
    padding: 20px;
  }

  /* Parcel List */
  .parcel-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .parcel-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  .parcel-card:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    border-color: #e0e0e0;
  }

  .parcel-card-img {
    width: 56px;
    height: 56px;
    border-radius: 10px;
    overflow: hidden;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    position: relative;
  }

  .parcel-card-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .parcel-img-count {
    position: absolute;
    bottom: 2px;
    right: 2px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 8px;
  }

  .parcel-card-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .parcel-postid {
    font-weight: bold;
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .parcel-date {
    font-size: 12px;
    color: #999;
  }

  .parcel-card-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    flex-shrink: 0;
  }

  .parcel-card-status {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 20px;
    white-space: nowrap;
  }

  .parcel-card-status.pending {
    background: #fff3cd;
    color: #856404;
  }

  .parcel-card-status.completed {
    background: #d4edda;
    color: #155724;
  }

  .parcel-signature {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    font-size: 11px;
    color: #666;
  }

  .parcel-signature img {
    width: 30px;
    height: 30px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #eee;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 50px 20px;
    color: #ccc;
  }

  .empty-state i {
    font-size: 48px;
    margin-bottom: 15px;
    color: #ddd;
  }

  .empty-state p {
    font-size: 14px;
    color: #999;
    margin: 0;
  }

  /* PhotoSwipe */
  .pswp__bullets-indicator {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translate(-50%, 0);
  }

  .pswp__bullet {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #fff;
    margin: 0 5px;
  }

  .pswp__bullet--active {
    background: #00BF9D;
  }

  .pswp__custom-caption {
    background: #00BF9D !important;
    font-size: 16px;
    color: #fff;
    width: calc(100% - 32px);
    max-width: 400px;
    padding: 2px 8px;
    border-radius: 4px;
    position: absolute;
    left: 50%;
    bottom: 80px;
    transform: translateX(-50%);
  }

  .pswp__custom-caption a {
    color: #fff;
    text-decoration: underline;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .project-card {
      height: 150px;
    }

    .tracking-tab-btn {
      padding: 12px 10px;
      font-size: 13px;
    }

    .tracking-content {
      padding: 15px;
    }

    .parcel-card {
      padding: 10px;
      gap: 10px;
    }

    .parcel-card-img {
      width: 48px;
      height: 48px;
    }

    .parcel-postid {
      font-size: 13px;
    }

    .parcel-card-status {
      font-size: 11px;
      padding: 3px 8px;
    }
  }
</style>
