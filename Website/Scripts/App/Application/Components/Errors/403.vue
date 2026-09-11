<template>
  <div class="wrapper error" :style="{'background-image':'url('+ contentImage +')'}">
    <div class="row" style="margin-top:120px;margin-left:120px;">
      <div class="col-md-6">
        <div class="box box-solid1">
          <div class="box-body">
            <div class="row">
              <div class="col-md-12">
                <div class="text-center">
                  <a style="color:lightgray;">
                    <i class="fa fa-unlock-alt" style="font-size:80px; margin-top:15px"></i>
                  </a>
                  <h1 class="font-bold text-danger" style="font-size:70px">403</h1>
                  <h1 class="text-warning">Access Denied !</h1>
                  <p style="font-size:15px;">คุณไม่ได้รับอนุญาตให้เข้าถึงเอกสารหรือโปรแกรมที่คุณร้องขอในขณะนี้</p>
                </div>
              </div>
            </div>
            <br />
            <div class="row margin-b-10">
              <div class="col-md-12">
                <div class="text-center">
                  <action-link :link="baseUrl+'page/'" input-class="btn btn-sm btn-tumblr"><i class="fa fa-home"></i> <span>กลับหน้าหลัก</span></action-link>
                  <a href="javascript:window.open('','_self').close()" class="btn btn-sm bg-orange"><i class="fas fa-times-circle"></i> <span v-text="ui.re_close_v2 || 'Close'"></span></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  export default {
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        xt: $xt,
        contentImage: baseUrl + "/Content/Images/Image/mango1.jpg"
      };
    },
    methods: {
      closeWin() {
        window.close();
      }
    },
    mounted() {
      document.title = `Error : Access Denied`;
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


