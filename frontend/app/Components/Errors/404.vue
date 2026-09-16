<template>
  <div class="wrapper error" :style="{'background-image':'url('+ contentImage +')'}">
    <div class="row" style="margin-top:120px;margin-left:120px;">
      <div class="col-md-6">
        <div class="box box-solid1">
          <div class="box-body">
            <div class="row">
              <div class="col-lg-12 col-md-12 col-sm-12">
                <div class="text-center">
                  <a class="text-warning">
                    <i class="fa fa-exclamation-triangle" style="font-size:80px;margin-top:15px"></i>
                  </a>
                  <h1 class="font-bold text-danger" style="font-size:70px">404</h1>
                  <h1>ไม่พบหน้าเว็บเพจนี้</h1>
                  <p style="font-size:15px;">ขออภัยไม่พบหน้าเว็บที่คุณกำลังค้นหาอยู่ กรุณาตรวจสอบข้อผิดพลาดของ URL อีกครั้ง</p>
                </div>
              </div>
            </div>
            <br />
            <div class="row" style="margin-bottom:10px;">
              <div class="col-md-12 col-sm-12 col-xs-12">
                <div class="text-center">
                  <action-link :link="baseUrl+'page/'">
                    <button class="btn btn-sm bg-navy">
                      <i class="fa fa-home"></i>
                      <span>กลับหน้าหลัก</span>
                    </button>
                  </action-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        ui: window.ui,
        baseUrl,
        contentImage: baseUrl + "vendor/Content/Images/Image/mango1.jpg"
      };
    },

    mounted() {
      document.title = `Error : Content Not Found.`;
    }
  };
</script>
<style scoped>
  .box-solid1 {
    border-bottom-color: white;
    border-top-color: white;
    border-left-color: white;
    border-right-color: white;
    box-shadow: none;
  }

  .wrapper {
    position: absolute;
    top: 0%;
    left: 0;
    width: 100%;
    height: 100%;
    margin-top: 0px;
    overflow: hidden;
  }
</style>




