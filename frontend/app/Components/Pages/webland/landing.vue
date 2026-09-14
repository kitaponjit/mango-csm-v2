<template>
  <div></div>
</template>

<script>
  export default {
    data() {
      return {
        state: {
          queryString, // กำหนดค่าเริ่มต้นให้ queryString เป็น object เปล่า
          notFound: true,
          arr: [] // ถ้าต้องการใช้ page ให้เพิ่ม array นี้
        }
      }
    },
    methods: {
      async redirect() {
        try {



          await localStorage.removeItem('mango_auth');
          await localStorage.setItem("mango_auth", this.state.queryString.session_id || '');
          await $xt.sleep(500);
          console.log('tesdst', this.state.queryString.session_id)
          window.location = baseUrl;


          /* Landing : Webpage */

        } catch (ex) {
          $msg.alert('System Error', ex, 'danger');
        }
      }
    },
    mounted() {
      document.title = 'ERP : Application Landing';
      this.redirect();
    }
  }
</script>
