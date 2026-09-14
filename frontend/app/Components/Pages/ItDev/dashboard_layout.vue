<template>
  <div class="opd">
    <!-- Navigation Bar -->
    <nav class="navbar navbar-default opd-nav">
      <div class="container-fluid">
        <!-- Brand and toggle -->
        <div class="navbar-header">
          <a class="navbar-brand" href="#" @click.prevent="">Operation Dashboard</a>
        </div>

        <!-- Menu -->
        <ul class="nav navbar-nav">
          <li><a href="#" @click.prevent="navigate(``)"><i class="fa fa-home"></i> CSM Home</a></li>
          <li><a href="#" @click.prevent="navigate(`page/i_dashboard/operation_dashboard_001`)"><i class="fa fa-users"></i> Team Dashboard</a></li>
          <li><a href="#" @click.prevent="navigate(`page/i_dashboard/operation_dashboard_002`)"><i class="fa fa-bar-chart"></i> Statistic</a></li>
        </ul>
      </div>
    </nav>

    <!-- Content Slot -->
    <div class="container-fluid">
      <!-- content slot -->
      <div id="app-content">
        <!-- ใส่เนื้อหาที่นี่ -->
        <slot name="maincontent"></slot>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    setup() {

      const navigate = (url) => {
        window.location.href =  baseUrl + url
      }

      return {
        baseUrl: window.baseUrl,
        navigate
      }
    }
  }
</script>

<style>
  /* ===== Shell ===== */
  .opd {
    --opd-navy: #1d2b53;
    --opd-plum: #7e2553;
    --opd-red: #ff004d;

    --opd-canvas: #f4f6fa;
    --opd-surface: #ffffff;
    --opd-line: #e6eaf2;
    --opd-line-soft: #eef1f7;
    --opd-navy-soft: rgba(29, 43, 83, .045);

    --opd-ease: cubic-bezier(.22, .85, .3, 1);
    --opd-spring: cubic-bezier(.5, 1.35, .4, 1);

    min-height: 100vh;
    background-color: var(--opd-canvas);
    background-image: radial-gradient(circle, var(--opd-navy-soft) 1px, transparent 1px);
    background-size: 22px 22px;
  }

  /* ===== Command bar ===== */
  .opd .opd-nav {
    position: sticky;
    top: 0;
    z-index: 30;
    margin-bottom: 18px;
    border: 0;
    border-radius: 0;
    background: linear-gradient(135deg, #1d2b53 0%, #131d3b 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, .07),
                0 12px 28px -20px rgba(19, 29, 59, .95);
  }

  .opd .opd-nav::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    height: 2px;
    background: linear-gradient(90deg, var(--opd-navy) 0%, var(--opd-plum) 48%, var(--opd-red) 100%);
    opacity: .9;
  }

  .opd .opd-nav .navbar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 50px;
    padding: 0 15px;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .opd .opd-nav .navbar-brand::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 2px;
    background: var(--opd-red);
    animation: opd-pulse 2.6s ease-in-out infinite;
  }

  .opd .opd-nav .navbar-brand:hover,
  .opd .opd-nav .navbar-brand:focus {
    color: #fff;
    background: transparent;
  }

  .opd .opd-nav .navbar-nav > li > a {
    position: relative;
    display: flex;
    align-items: center;
    gap: 7px;
    height: 50px;
    padding: 0 16px;
    color: rgba(255, 255, 255, .62);
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: .02em;
    transition: color .16s ease, background-color .16s ease;
  }

  .opd .opd-nav .navbar-nav > li > a > i {
    font-size: 12px;
    opacity: .7;
    transition: opacity .16s ease;
  }

  .opd .opd-nav .navbar-nav > li > a::after {
    content: '';
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 0;
    z-index: 2;
    height: 3px;
    border-radius: 2px 2px 0 0;
    background: var(--opd-red);
    transform: scaleX(0);
    transition: transform .26s var(--opd-spring);
  }

  .opd .opd-nav .navbar-nav > li > a:hover,
  .opd .opd-nav .navbar-nav > li > a:focus {
    color: #fff;
    background: rgba(255, 255, 255, .06);
  }

  .opd .opd-nav .navbar-nav > li > a:hover > i {
    opacity: 1;
  }

  .opd .opd-nav .navbar-nav > li > a:hover::after,
  .opd .opd-nav .navbar-nav > li > a:focus::after {
    transform: scaleX(1);
  }

  /* ===== Content ===== */
  .opd #app-content {
    padding-bottom: 30px;
  }

  /* ===== Instrument cards ===== */
  .opd .box {
    position: relative;
    border: 1px solid var(--opd-line);
    border-top: 1px solid var(--opd-line);
    border-radius: 14px;
    background: var(--opd-surface);
    box-shadow: 0 1px 1px rgba(29, 43, 83, .03),
                0 4px 10px -6px rgba(29, 43, 83, .12),
                0 28px 48px -34px rgba(29, 43, 83, .6);
    overflow: hidden;
    transition: box-shadow .22s var(--opd-ease), border-color .22s var(--opd-ease);
    animation: opd-rise .5s var(--opd-ease) both;
  }

  .opd .box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--opd-navy) 0%, var(--opd-plum) 52%, var(--opd-red) 100%);
    opacity: .8;
    transition: opacity .22s ease;
  }

  .opd .box:hover {
    border-color: #dbe2ef;
    box-shadow: 0 1px 1px rgba(29, 43, 83, .03),
                0 8px 18px -8px rgba(29, 43, 83, .16),
                0 36px 60px -34px rgba(29, 43, 83, .75);
  }

  .opd .box:hover::before {
    opacity: 1;
  }

  .opd .box-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 18px 12px;
    border-bottom: 1px solid var(--opd-line-soft);
  }

  .opd .box-header::before {
    content: '';
    flex: 0 0 auto;
    width: 3px;
    height: 14px;
    border-radius: 2px;
    background: linear-gradient(180deg, var(--opd-navy) 0%, var(--opd-plum) 100%);
  }

  .opd .box-header .box-title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: var(--opd-navy);
  }

  .opd .box-body {
    padding: 12px 12px 8px;
  }

  .opd .row > [class*="col-"]:nth-child(1) .box { animation-delay: .02s; }
  .opd .row > [class*="col-"]:nth-child(2) .box { animation-delay: .06s; }
  .opd .row > [class*="col-"]:nth-child(3) .box { animation-delay: .1s; }
  .opd .row > [class*="col-"]:nth-child(4) .box { animation-delay: .14s; }
  .opd .row > [class*="col-"]:nth-child(n+5) .box { animation-delay: .18s; }

  /* ===== Motion ===== */
  @keyframes opd-rise {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: none; }
  }

  @keyframes opd-pulse {
    0%, 100% { box-shadow: 0 0 0 3px rgba(255, 0, 77, .24); }
    50% { box-shadow: 0 0 0 6px rgba(255, 0, 77, .04); }
  }

  /* ===== Responsive ===== */
  @media (max-width: 767px) {
    .opd .opd-nav {
      margin-bottom: 14px;
    }

    .opd .opd-nav .navbar-brand,
    .opd .opd-nav .navbar-nav > li > a {
      height: auto;
      padding: 12px 15px;
    }

    .opd .opd-nav .navbar-nav {
      margin: 0;
    }

    .opd .opd-nav .navbar-nav > li > a::after {
      left: 15px;
      right: 15px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .opd .box {
      animation: none;
    }

    .opd .opd-nav .navbar-brand::before {
      animation: none;
    }

    .opd .opd-nav .navbar-nav > li > a::after {
      transition: none;
    }
  }

  /* ===== Dark mode ===== */
  body.dark-mode .opd {
    --opd-canvas: #101a26;
    --opd-line: #2d4057;
    --opd-line-soft: #24374a;
    --opd-navy-soft: rgba(159, 208, 245, .05);
  }

  body.dark-mode .opd .box::before {
    opacity: .7;
  }
</style>
