<template>
  <div></div>
</template>
<script>
  export default {
    data() {
      return {
        ui: window.ui
      }
    },
    methods: {
      openModal() {
        $.confirm({
          title: window.ui.log_out,
          content: window.ui.log_out_message,
          theme: 'material',
          animation: 'opacity',
          closeAnimation: 'opacity',
          animateFromElement: false,
          buttons: {
            btn1: {
              text: window.ui.this_device,
              btnClass: 'btn-warning',
              action: function () {
                //window.location.href = window.baseUrl + 'api/public/logout?all=false'

                (async () => {
                  let rs = await $xt.getServer('api/public/logout?all=false&is_api=N')
                  if (rs.success) {
                    try {
                      localStorage.removeItem('mango_auth');
                      localStorage.removeItem('viewStatus');
                    } catch (ex) { }
                  }
                  window.location.href = window.baseUrl
                })();
              }
            },
            btn2: {
              text: window.ui.all_devices,
              btnClass: 'btn-danger',
              action: function () {
                //window.location.href = window.baseUrl + 'api/public/logout?all=true'
                (async () => {
                  let rs = await $xt.getServer('api/public/logout?all=true&is_api=N')
                  if (rs.success) {
                    try {
                      localStorage.removeItem('mango_auth');
                      localStorage.removeItem('viewStatus');
                    } catch (ex) { }
                  }
                  window.location.href = window.baseUrl
                })();
              }
            },
            btn3: {
              text: window.ui.cancel,
              btnClass: 'btn-default',
              action: function () {
                //do nothing
              }
            }
          }
        });
      }
    }
  };
</script>
