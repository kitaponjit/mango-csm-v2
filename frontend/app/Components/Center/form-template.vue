<template>
  <div>
    <slot name="form-trn-ReadList">
    </slot>
    <slot name="form-field">
    </slot>
    <div class="row" v-if="allBtnShow">
      <div class="col-lg-12 col-md-12">
        <div class="form-group form-toolbar">
          <button class="btn btn-sm btn-primary" v-bind:disabled="btnRetrieve.disabled" v-if="btnRetrieve.show" v-on:click="btnRetrieveClick"><i class="fa fa-list"></i><span>{{ui.retrieve == null ? "Retrieve" : ui.retrieve}}</span></button>
          <button class="btn btn-sm btn-info" v-bind:disabled="btnNew.disabled || menuRights.IsReadOnly" v-if="btnNew.show" v-on:click="btnNewClick"><i class="fa fa-plus"></i><span>{{ui.new == null ? "New" : ui.new }}</span></button>
          <button class="btn btn-sm btn-success" v-bind:disabled="btnSave.disabled || menuRights.IsReadOnly" v-if="btnSave.show" v-on:click="btnSaveClick"><i class="fa fa-save"></i><span>{{ui.save == null ? "Save" : ui.save}}</span></button>
          <button class="btn btn-sm btn-danger" v-bind:disabled="btnDelete.disabled || menuRights.IsReadOnly" v-if="btnDelete.show" v-on:click="btnDeleteClick"><i class="fa fa-trash"></i><span>{{ui.delete == null ? "Delete" : ui.delete}}</span></button>
          <button class="btn btn-sm btn-default" v-bind:disabled="btnPrint.disabled || menuRights.IsNotPrint" v-if="btnPrint.show" v-on:click="btnPrintClick"><i class="fa fa-print"></i><span>{{ui.print == null ? "Print" : ui.print}}</span></button>
          <button class="btn btn-sm btn-default" v-bind:disabled="btnBack.disabled" v-if="btnBack.show" v-on:click="btnBackClick"><i class="fa fa-reply"></i><span>{{ui.back == null ? "Back" : ui.back }}</span></button>
          <button class="btn btn-sm btn-warning" v-bind:disabled="btnSaveAs.disabled || menuRights.IsNotSaveAs" v-if="btnSaveAs.show" v-on:click="btnSaveAsClick"><i class="fa fa-file-export"></i><span>{{ui.saveas == null ? "Export As" : ui.saveas}}</span></button>
          <button class="btn btn-sm btn-primary" v-bind:disabled="btnRefresh.disabled" v-if="btnRefresh.show" v-on:click="btnRefreshClick"><i class="fa fa-sync"></i><span>Refresh</span></button>
          <button class="btn btn-sm btn-tumblr" v-bind:disabled="btnAddRow.disabled" v-if="btnAddRow.show" v-on:click="btnAddrowClick"><i class="fas fa-plus"></i><span>เพิ่มรายการ</span></button>
          <slot name="extraBtn"></slot>
        </div>
      </div>
    </div>
    <slot name="form-detail">
    </slot>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        btnRetrieve: {
          show: true,
          disabled: false,
          click() { }
        },
        btnNew: {
          show: true,
          disabled: false,
          click() { }
        },
        btnSave: {
          show: true,
          disabled: false,
          click() { }
        },
        btnSaveAs: {
          show: false,
          disabled: false,
          click() { }
        },
        btnDelete: {
          show: true,
          disabled: false,
          click() { }
        },
        btnPrint: {
          show: true,
          disabled: false,
          click() { }
        },
        btnBack: {
          show: true,
          disabled: false,
          click() { }
        },
        btnRefresh: {
          show: false,
          disabled: false,
          click() { }
        },
        btnAddRow: {
          show: true,
          disabled: false,
          click() { }
        },
        ui: window.ui,
        allBtnShow: true,
        footer_show: false,
        panel_func: false,
        menuRights: {}
      };
    },
    methods: {
      btnRetrieveClick() {
        this.btnRetrieve.click();
      },
      btnNewClick() {
        this.btnNew.click();
      },
      btnSaveClick() {
        this.btnSave.click();
      },
      btnSaveAsClick() {
        this.btnSaveAs.click();
      },
      btnDeleteClick() {
        this.btnDelete.click();
      },
      btnPrintClick() {
        this.btnPrint.click();
      },
      btnBackClick() {
        this.btnBack.click();
      },
      btnRefreshClick() {
        this.btnRefresh.click();
      },
      btnAddrowClick() {
        this.btnAddRow.click();
      },

    },
    mounted() {

    }
  }
</script>
<style>
  .form-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 9px 11px;
    border: 1px solid rgba(15, 23, 42, .07);
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(248, 250, 252, .92) 0%, rgba(241, 245, 249, .70) 100%);
    box-shadow: 0 1px 2px rgba(15, 23, 42, .03);
    backdrop-filter: blur(6px);
  }

  .form-toolbar .btn {
    --tb-h: 15, 23, 42;
    --tb-a: .05;
    --tb-ah: .10;
    --tb-ab: .10;
    --tb-abh: .16;
    --tb-gl: .30;
    --tb-fg: #3c4043;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 34px;
    margin: 0;
    padding: 0 14px;
    border: 1px solid var(--tb-bd, rgba(var(--tb-h), var(--tb-ab))) !important;
    border-radius: 10px;
    background: var(--tb-bg, rgba(var(--tb-h), var(--tb-a))) !important;
    color: var(--tb-fg) !important;
    box-shadow: var(--tb-shadow, none) !important;
    font-family: var(--bs-font-manrope);
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: .01em;
    line-height: 1.2;
    white-space: nowrap;
    transition: background-color .18s ease, border-color .18s ease, color .18s ease, box-shadow .24s ease, transform .18s cubic-bezier(.2, .8, .3, 1);
    animation: tbBtnIn .42s cubic-bezier(.2, .8, .25, 1) backwards;
  }

  @keyframes tbBtnIn {
    from {
      opacity: 0;
      transform: translateY(7px) scale(.96);
    }
  }

  .form-toolbar .btn:nth-child(1) { animation-delay: .02s }
  .form-toolbar .btn:nth-child(2) { animation-delay: .05s }
  .form-toolbar .btn:nth-child(3) { animation-delay: .08s }
  .form-toolbar .btn:nth-child(4) { animation-delay: .11s }
  .form-toolbar .btn:nth-child(5) { animation-delay: .14s }
  .form-toolbar .btn:nth-child(6) { animation-delay: .17s }
  .form-toolbar .btn:nth-child(7) { animation-delay: .20s }
  .form-toolbar .btn:nth-child(8) { animation-delay: .23s }
  .form-toolbar .btn:nth-child(9) { animation-delay: .26s }
  .form-toolbar .btn:nth-child(n+10) { animation-delay: .29s }

  .form-toolbar .btn > i {
    font-size: 12px;
    line-height: 1;
    opacity: .92;
    transition: transform .26s cubic-bezier(.2, .8, .3, 1);
  }

  .form-toolbar .btn:hover > i {
    transform: scale(1.12);
  }

  .form-toolbar .btn:hover {
    border-color: var(--tb-bd-h, var(--tb-bd, rgba(var(--tb-h), var(--tb-abh)))) !important;
    background: var(--tb-bg-h, rgba(var(--tb-h), var(--tb-ah))) !important;
    color: var(--tb-fg-h, var(--tb-fg)) !important;
    box-shadow: 0 6px 18px -10px rgba(var(--tb-h), var(--tb-gl)) !important;
    transform: translateY(-1px);
  }

  .form-toolbar .btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--tb-h), .24) !important;
  }

  .form-toolbar .btn:active,
  .form-toolbar .btn:active:hover,
  .form-toolbar .btn.active {
    box-shadow: 0 1px 2px rgba(15, 23, 42, .08) !important;
    transform: translateY(0) scale(.97);
  }

  .form-toolbar .btn.btn-primary,
  .form-toolbar .btn.bg-navy {
    --tb-h: 26, 115, 232;
    --tb-a: .10;
    --tb-ah: .17;
    --tb-ab: .20;
    --tb-abh: .32;
    --tb-gl: .55;
    --tb-fg: #1557b0;
  }

  .form-toolbar .btn.btn-info {
    --tb-h: 0, 151, 167;
    --tb-a: .11;
    --tb-ah: .18;
    --tb-ab: .22;
    --tb-abh: .34;
    --tb-gl: .55;
    --tb-fg: #00707c;
  }

  .form-toolbar .btn.btn-success {
    --tb-h: 30, 142, 62;
    --tb-bg: linear-gradient(135deg, #1e8e3e 0%, #34a853 100%);
    --tb-bg-h: linear-gradient(135deg, #177a34 0%, #2d9a4a 100%);
    --tb-bd: transparent;
    --tb-bd-h: transparent;
    --tb-fg: #fff;
    --tb-gl: .80;
    --tb-shadow: 0 1px 2px rgba(30, 142, 62, .30), 0 8px 18px -12px rgba(30, 142, 62, .80);
  }

  .form-toolbar .btn.btn-danger {
    --tb-h: 217, 48, 37;
    --tb-a: .10;
    --tb-ab: .22;
    --tb-bg-h: linear-gradient(135deg, #c5221f 0%, #e0362a 100%);
    --tb-bd-h: transparent;
    --tb-fg: #b3261e;
    --tb-fg-h: #fff;
    --tb-gl: .70;
  }

  .form-toolbar .btn.btn-warning,
  .form-toolbar .btn.bg-orange {
    --tb-h: 217, 138, 0;
    --tb-a: .14;
    --tb-ah: .22;
    --tb-ab: .30;
    --tb-abh: .44;
    --tb-gl: .55;
    --tb-fg: #8a5300;
  }

  .form-toolbar .btn.btn-tumblr {
    --tb-h: 66, 82, 178;
    --tb-a: .10;
    --tb-ah: .17;
    --tb-ab: .20;
    --tb-abh: .32;
    --tb-gl: .55;
    --tb-fg: #3a48a0;
  }

  .form-toolbar .btn.bg-olive {
    --tb-h: 15, 138, 106;
    --tb-a: .11;
    --tb-ah: .18;
    --tb-ab: .22;
    --tb-abh: .34;
    --tb-gl: .55;
    --tb-fg: #0b6e55;
  }

  .form-toolbar .btn.btn-instagram {
    --tb-h: 131, 58, 180;
    --tb-a: .10;
    --tb-ah: .17;
    --tb-ab: .21;
    --tb-abh: .33;
    --tb-gl: .55;
    --tb-fg: #7126a8;
  }

  .form-toolbar .btn[disabled],
  .form-toolbar .btn[disabled]:hover,
  .form-toolbar .btn[disabled]:focus,
  .form-toolbar .btn.disabled {
    border-color: rgba(15, 23, 42, .07) !important;
    background: rgba(15, 23, 42, .035) !important;
    color: rgba(60, 64, 67, .38) !important;
    box-shadow: none !important;
    transform: none !important;
    opacity: 1;
    cursor: not-allowed;
  }

  .form-toolbar .btn[disabled] > i {
    opacity: .5;
    transform: none;
  }

  body.dark-mode .form-toolbar {
    border-color: rgba(148, 163, 184, .14);
    background: linear-gradient(180deg, rgba(30, 41, 59, .70) 0%, rgba(23, 33, 48, .52) 100%);
    box-shadow: 0 1px 2px rgba(0, 0, 0, .22);
  }

  body.dark-mode .form-toolbar .btn {
    --tb-h: 148, 163, 184;
    --tb-a: .12;
    --tb-ah: .20;
    --tb-ab: .18;
    --tb-abh: .30;
    --tb-gl: .40;
    --tb-fg: #d7dee8;
  }

  body.dark-mode .form-toolbar .btn.btn-primary,
  body.dark-mode .form-toolbar .btn.bg-navy {
    --tb-h: 138, 180, 248;
    --tb-fg: #a8c7fa;
  }

  body.dark-mode .form-toolbar .btn.btn-info {
    --tb-h: 77, 208, 225;
    --tb-fg: #7fdbe6;
  }

  body.dark-mode .form-toolbar .btn.btn-success {
    --tb-h: 52, 168, 83;
    --tb-fg: #fff;
    --tb-gl: .85;
  }

  body.dark-mode .form-toolbar .btn.btn-danger {
    --tb-h: 242, 139, 130;
    --tb-fg: #f2b8b5;
  }

  body.dark-mode .form-toolbar .btn.btn-warning,
  body.dark-mode .form-toolbar .btn.bg-orange {
    --tb-h: 253, 190, 84;
    --tb-fg: #fbd38d;
  }

  body.dark-mode .form-toolbar .btn.btn-tumblr {
    --tb-h: 141, 154, 232;
    --tb-fg: #b3bdf5;
  }

  body.dark-mode .form-toolbar .btn.bg-olive {
    --tb-h: 77, 201, 165;
    --tb-fg: #8fdcc5;
  }

  body.dark-mode .form-toolbar .btn.btn-instagram {
    --tb-h: 197, 138, 232;
    --tb-fg: #d5aff0;
  }

  body.dark-mode .form-toolbar .btn[disabled],
  body.dark-mode .form-toolbar .btn[disabled]:hover,
  body.dark-mode .form-toolbar .btn[disabled]:focus,
  body.dark-mode .form-toolbar .btn.disabled {
    border-color: rgba(148, 163, 184, .12) !important;
    background: rgba(148, 163, 184, .07) !important;
    color: rgba(215, 222, 232, .36) !important;
  }

  @media (max-width: 575px) {
    .form-toolbar {
      gap: 6px;
      padding: 8px;
    }

    .form-toolbar .btn {
      flex: 1 1 auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .form-toolbar .btn,
    .form-toolbar .btn > i {
      animation: none;
      transition: none;
    }

    .form-toolbar .btn:hover,
    .form-toolbar .btn:active,
    .form-toolbar .btn:hover > i {
      transform: none;
    }
  }
</style>
