const $alert = function (title, message, alert_type, callback) {
  const ok_text = (window.ui && window.ui.csm_v2_ok) || 'OK'
  const title_text = `<span class="text-${alert_type}"><i class="fa fa-${alert_type == 'danger' ? 'times-circle' : alert_type == 'success' ? 'check-circle' : alert_type == 'info' ? 'info-circle' : alert_type == 'warning' ? 'exclamation-circle' : 'info-circle'}"></i> ${title}</span>`
  $.alert({
    title: title_text,
    content: `<span style="line-height:1.8">${message}</span>`,
    btnClass: 'btn-info',
    theme: 'material',
    animation: 'opacity',
    closeAnimation: 'opacity',
    animateFromElement: false,
    buttons: {
      ok: {
        text: ok_text,
        btnClass: 'bg-navy',
      }
    },
    onClose: function () {
      if (callback) {
        callback();
      }
    },
  });
};
const $confirm = function (text, ok_function, no_fuction) {
  const confirm_title = (window.ui && window.ui.erp_confirm_transaction) || 'ยืนยันการทำรายการ'
  const yes_text = (window.ui && window.ui.erp_yes) || 'Yes'
  const no_text = (window.ui && window.ui.erp_no_label) || 'No'
  $.confirm({
    title: `<i class="fa fa-question-circle"></i> ${confirm_title}`,
    content: `<span style="line-height:1.8">${text}</span>`,
    theme: 'material',
    animation: 'opacity',
    closeAnimation: 'opacity',
    animateFromElement: false,
    buttons: {
      yes: {
        text: yes_text,
        btnClass: 'bg-navy',
        action: function () {
          if (ok_function) {
            ok_function();
          }
        },
      },
      no: {
        text: no_text,
        btnClass: 'btn-danger',
        action: function () {
          if (no_fuction) {
            no_fuction();
          }
        }
      }
    }
  });
};
const $prompt = function (text, callback, cancelaction) {
  const ok_text = (window.ui && window.ui.csm_v2_ok) || 'OK'
  $.confirm({
    title: 'Prompt!',
    content: '<p>' + text + '</p>' +
      '<form action="" class="formName">' +
      '<div class="form-group">' +
      '<textarea type="text" placeholder="" class="name form-control" rows="3"></textarea>' +
      '</div>' +
      '</form>',
    theme: 'material',
    animation: 'opacity',
    closeAnimation: 'opacity',
    animateFromElement: false,
    buttons: {
      formSubmit: {
        text: ok_text,
        btnClass: 'bg-navy',
        action: function () {
          var name = this.$content.find('.name').val();
          callback(name);
        }
      },
      cancel: function () {
        if (cancelaction) {
          cancelaction();
        }
      },
    },
    onContentReady: function () {
      var jc = this;
      this.$content.find('form').on('submit', function (e) {
        e.preventDefault();
        jc.$$formSubmit.trigger('click');
      });
    }
  });
}

const $msg = {
  alert(title, message, alert_type) {
    return new Promise((resolve, reject) => {
      $alert(title, message, alert_type, () => {
        resolve(true);
      })
    });
  },
  confirm(text) {
    return new Promise((resolve, reject) => {
      $confirm(text, () => {
        resolve(true)
      }, () => {
        resolve(false)
      });
    });
  },
  prompt(text) {
    return new Promise((rs, rj) => {
      $prompt(text, (data) => {
        rs(data)
      }, () => {
        rs(null)
      });
    })
  }
};
