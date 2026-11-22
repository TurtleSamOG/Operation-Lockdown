<?php
declare(strict_types=1);
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#08131f">
<meta name="description" content="Operation Lockdown 2.0 — interactive office incident response simulator">
<title>Defend It | Office Under Pressure — Operation Lockdown 2.0</title>
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/app.css">
<link rel="stylesheet" href="/assets/css/system.css">
<link rel="stylesheet" href="/assets/css/polish.css">
<link rel="stylesheet" href="/assets/css/defend.css">
<style>
/* ===== Operation Lockdown 2.0 shared mission components (embedded per page; scoped to .ol-*) ===== */
[hidden]{display:none!important}
a.ol-btn{text-decoration:none}
.ol-btn{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;border:1px solid #2f5a6a;background:#12293a;color:#dff9ff;font-weight:750;font-size:.86rem;padding:.62rem 1rem;border-radius:10px;transition:background .15s,border-color .15s,transform .1s}
.ol-btn:hover:not(:disabled){background:#173a4f;border-color:#4fb8c0}.ol-btn:active:not(:disabled){transform:translateY(1px)}.ol-btn:disabled{opacity:.45;cursor:not-allowed}
.ol-btn-primary{background:linear-gradient(135deg,#2be0cb,#1793a6);border-color:#43e8d4;color:#04222b}.ol-btn-primary:hover:not(:disabled){background:linear-gradient(135deg,#4ff0dc,#1fa9bb)}
.ol-btn-quiet{background:transparent;border-color:#2b4459;color:#a9c7d6}.ol-btn-danger{border-color:#7b3b48;background:#2a1520;color:#ffc3cb}
.ol-btn.is-on,.ol-btn[aria-pressed="true"]{border-color:#5ff0dc;background:#14404a;color:#c8fff6;box-shadow:inset 0 0 0 1px #5ff0dc55}
.ol-kicker{font-family:ui-monospace,Consolas,monospace;font-size:.66rem;letter-spacing:.16em;font-weight:800;color:#6fd9cf;text-transform:uppercase}
.ol-muted{color:#93abbe;font-size:.88rem}
.ol-banner{border:1px solid #2c4c5c;background:#0f2230;border-radius:12px;padding:.8rem 1rem;font-size:.9rem;margin:0 0 16px;color:#cfe7f1}
.ol-banner[data-kind="good"]{border-color:#2f7a63;background:#0f2a24;color:#b6f7dc}.ol-banner[data-kind="bad"]{border-color:#81404c;background:#2a141b;color:#ffc6cf}.ol-banner[data-kind="warn"]{border-color:#7a6332;background:#2a2312;color:#ffe3a8}
.ol-status-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 18px}
.ol-status-strip>div{border:1px solid #213a4d;background:#0d1b2a;border-radius:12px;padding:.7rem .9rem;min-width:0}
.ol-status-strip small{display:block;font-family:ui-monospace,Consolas,monospace;font-size:.62rem;letter-spacing:.14em;color:#7c9bb0}
.ol-status-strip strong{display:block;font-size:1.05rem;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ol-status-strip span{font-size:.75rem;color:#8ea7b9}
.ol-official{color:#8ff5d8}.ol-sim-tag{display:inline-block;font-family:ui-monospace,Consolas,monospace;font-size:.6rem;letter-spacing:.12em;border:1px dashed #5d7d92;color:#a9c3d3;border-radius:6px;padding:2px 6px;vertical-align:middle}
/* Station tabs */
.ol-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
.ol-tab{display:flex;align-items:center;gap:.6rem;border:1px solid #24405a;background:#0d1c2b;color:#bcd3e2;border-radius:12px;padding:.65rem .95rem;font-weight:700;font-size:.88rem}
.ol-tab small{display:block;font-weight:600;color:#7f9cb1;font-size:.7rem}.ol-tab b{margin-left:.3rem;font-size:.72rem;border-radius:99px;padding:2px 8px;background:#1a2f42;color:#8aa6ba}
.ol-tab[aria-selected="true"]{border-color:var(--zone,#5ff0dc);background:#11283a;color:#fff;box-shadow:inset 0 -3px var(--zone,#5ff0dc)}
.ol-tab b.done{background:#164a3a;color:#9ff7d4}
.ol-tab .ol-you{font-size:.6rem;letter-spacing:.12em;color:#04222b;background:var(--zone,#5ff0dc);border-radius:5px;padding:1px 5px;margin-left:.2rem}
/* Panels */
.ol-panel{border:1px solid #213b50;background:linear-gradient(160deg,#0f2133,#0b1826);border-radius:16px;padding:clamp(14px,1.8vw,22px);min-width:0}
.ol-panel h3{margin:.25rem 0 .4rem;font-size:1.08rem;letter-spacing:-.01em}
.ol-step{display:flex;align-items:baseline;gap:.7rem;margin:22px 0 10px;padding-bottom:7px;border-bottom:1px solid #1d3446}
.ol-step span{font-family:ui-monospace,Consolas,monospace;font-size:.66rem;letter-spacing:.14em;color:var(--zone,#6fd9cf);font-weight:800}
.ol-step strong{font-size:1rem}.ol-step small{margin-left:auto;color:#7f9cb1;font-size:.74rem;text-align:right}
/* Hints */
.ol-hints{border:1px solid #2a4357;border-radius:12px;background:#0d1b28;padding:.55rem .85rem;margin:12px 0}
.ol-hints summary{cursor:pointer;font-weight:750;color:#bde4ee;font-size:.88rem}
.ol-hint-list{margin:.6rem 0 .5rem;padding-left:1.2rem;color:#c6d9e4;font-size:.86rem;line-height:1.55}.ol-hint-list li{margin:.3rem 0}
/* Handoff codes */
.ol-handoff{border:1px dashed #3f7c86;background:#0b2229;border-radius:14px;padding:14px 16px;margin:12px 0}
.ol-handoff h4{margin:0 0 .3rem;font-size:.95rem}.ol-handoff p{margin:.3rem 0;color:#bcd5df;font-size:.86rem;line-height:1.5}
.ol-code-display{display:flex;flex-direction:column;gap:2px;margin:.6rem 0}
.ol-code-caption{font-size:.7rem;font-family:ui-monospace,Consolas,monospace;letter-spacing:.12em;color:#7fc7c4}
.ol-code-value{font-family:ui-monospace,Consolas,monospace;font-size:clamp(1.6rem,3vw,2.3rem);letter-spacing:.18em;color:#8ffbe6;text-shadow:0 0 18px #2de0cb44}
.ol-code-entry{margin:.5rem 0}.ol-code-label{display:block;font-size:.8rem;font-weight:700;color:#bcd5df;margin-bottom:5px}
.ol-code-row{display:flex;gap:8px;flex-wrap:wrap}
.ol-code-input{font-family:ui-monospace,Consolas,monospace;font-size:1.1rem;letter-spacing:.15em;text-transform:uppercase;width:11ch;background:#061520;border:1px solid #2f5a6a;color:#e8fbff;border-radius:9px;padding:.5rem .7rem}
.ol-code-status{font-size:.8rem;margin:.35rem 0 0;min-height:1.1em}.ol-code-status[data-kind="bad"]{color:#ffb3bd}.ol-code-status[data-kind="good"]{color:#9df5d6}
/* Checkpoint */
.ol-checkpoint{border:1px solid #2a4c5c;background:linear-gradient(160deg,#0f2433,#0a1824);border-radius:16px;padding:16px 18px;margin-top:12px}
.ol-checkpoint.is-passed{border-color:#2f7a63;box-shadow:inset 3px 0 #4fe0a8}
.ol-check-head{display:flex;flex-direction:column;gap:3px;margin-bottom:8px}.ol-check-head strong{font-size:1.02rem}.ol-check-head small{color:#89a5b8;font-size:.76rem}
.ol-check-intro{color:#bcd2de;font-size:.88rem;margin:.2rem 0 .6rem;line-height:1.5}
.ol-check-lock{border-left:3px solid #f2c56b;background:#231e10;color:#ffe2a3;padding:.55rem .8rem;border-radius:6px;font-size:.85rem;margin:.4rem 0 .7rem}
.ol-check-form.is-locked .ol-check-q{opacity:.55}
.ol-check-q{border:1px solid #1f3a4c;border-radius:12px;padding:.7rem .85rem;margin:0 0 9px}
.ol-check-q legend{font-weight:700;font-size:.92rem;padding:0 .3rem;line-height:1.4}.ol-check-n{font-family:ui-monospace,Consolas,monospace;color:#6fd9cf;margin-right:.5rem;font-size:.78rem}
.ol-check-opt{display:flex;gap:.6rem;align-items:flex-start;padding:.45rem .55rem;border-radius:8px;cursor:pointer;font-size:.88rem;color:#d2e4ee}
.ol-check-opt:hover{background:#13293a}.ol-check-opt input{margin-top:.2rem;accent-color:#3fe0cc}
.ol-check-opt:has(input:checked){background:#123342;box-shadow:inset 0 0 0 1px #3fbfb5}
.ol-check-foot{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:8px}.ol-check-status{font-size:.78rem;color:#88a4b7;margin:0}
.ol-check-feedback{margin-top:10px;font-size:.88rem;line-height:1.5;border-radius:10px;padding:0}
.ol-check-feedback[data-kind]{padding:.65rem .85rem}.ol-check-feedback[data-kind="good"]{background:#0f2a22;color:#aef5d6;border:1px solid #2c6e57}
.ol-check-feedback[data-kind="warn"]{background:#2a2313;color:#ffe2a8;border:1px solid #6e5a2c}.ol-check-feedback[data-kind="bad"]{background:#2a141b;color:#ffc3cc;border:1px solid #6e2f3c}.ol-check-feedback[data-kind="info"]{background:#0f2230;color:#c8e3ef;border:1px solid #2c4c5c}
/* Key reward */
.ol-key{display:flex;align-items:center;gap:14px;border:1px solid #2b5a5d;border-radius:14px;padding:14px 16px;background:#0b1f26;margin-top:14px}
.ol-key-glyph{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;font-size:1.4rem;border:2px dashed #4b7680;color:#6a8f99;flex:none}
.ol-key strong{display:block;letter-spacing:.06em}.ol-key small{color:#8aa6b6}
.ol-key.is-earned{border-color:#43d6a6;background:linear-gradient(135deg,#0f2c26,#0b1f26);box-shadow:0 0 0 1px #43d6a633,0 0 40px #2de0b222}
.ol-key.is-earned .ol-key-glyph{border-style:solid;border-color:#5ff0c4;color:#04241c;background:#5ff0c4;animation:ol-pop .6s ease-out}
@keyframes ol-pop{0%{transform:scale(.6)}70%{transform:scale(1.12)}100%{transform:scale(1)}}
.ol-login-needed{border:1px solid #6e5a2c;background:#221d10;border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.ol-login-needed p{margin:0;color:#f1dfb4}
/* Generic chips and meters */
.ol-chip{display:inline-flex;align-items:center;gap:4px;font-size:.72rem;font-weight:700;border-radius:99px;padding:3px 9px;background:#162b3c;color:#b5cfde;border:1px solid #24435a}
.ol-chip.bad{background:#2c1720;color:#ffb8c2;border-color:#6a3040}.ol-chip.warn{background:#2b2414;color:#ffdf9e;border-color:#6a5728}.ol-chip.good{background:#11302a;color:#a3f4d3;border-color:#2b6b58}
.ol-meter{height:8px;border-radius:99px;background:#16283a;overflow:hidden}.ol-meter>i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#2bd8c4,#6ff0b7);transition:width .5s ease}
.ol-meter.warn>i{background:linear-gradient(90deg,#e7b44f,#f3d27a)}.ol-meter.bad>i{background:linear-gradient(90deg,#e05a6c,#f38b98)}
.ol-feed{display:flex;flex-direction:column;gap:6px;max-height:220px;overflow:auto;font-size:.8rem}
.ol-feed>div{border-left:2px solid #2d5a6a;padding:.3rem .6rem;color:#bcd3e0;background:#0c1b28;border-radius:0 6px 6px 0}
.ol-feed>div time{font-family:ui-monospace,Consolas,monospace;color:#6f93a8;margin-right:.5rem;font-size:.72rem}
.ol-feed>div.bad{border-color:#d0606f}.ol-feed>div.good{border-color:#3fd3a1}.ol-feed>div.warn{border-color:#e2b552}
.ol-two{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:16px;align-items:start}
.ol-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
@media (max-width:980px){.ol-two,.ol-grid2{grid-template-columns:1fr}.ol-status-strip{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
/* ===== Spacing & breathing room (v2) ===== */
.system{padding-top:34px}
.topline{margin-bottom:44px!important}
.ol-banner{margin:0 0 28px;padding:1rem 1.25rem;line-height:1.55}
.ol-status-strip{gap:16px;margin:0 0 36px}
.ol-status-strip>div{padding:1rem 1.2rem;border-radius:14px}
.ol-status-strip strong{margin-top:6px}
.ol-tabs{gap:12px;margin:0 0 12px}
.ol-tab{padding:.8rem 1.1rem}
.ol-step{margin:56px 0 20px;padding-bottom:12px}
.ol-step small{color:#6f8ba0}
[data-panel]>.ol-step:first-child{margin-top:36px}
.ol-panel{padding:clamp(22px,2.4vw,32px);border-radius:18px}
.ol-panel h3{margin:.4rem 0 .9rem}
.ol-panel p{line-height:1.65}
.ol-two{gap:28px}.ol-grid2{gap:22px}
[data-panel] [style*="margin-top:14px"],[data-panel] [style*="margin-top:12px"]{margin-top:28px!important}
.ol-checkpoint{margin-top:48px;padding:26px 28px;border-radius:18px}
.ol-check-head{margin-bottom:14px}
.ol-check-q{padding:1rem 1.15rem;margin:0 0 14px}
.ol-check-opt{padding:.55rem .65rem}
.ol-handoff{padding:22px 24px;margin:22px 0}
.ol-key{margin-top:32px;padding:20px 22px}
.ol-hints{margin:22px 0 0;padding:.75rem 1rem}
.ol-feed{gap:8px}
.tl-table td{padding:.65rem .7rem}
.tl-hero,.fx-hero,.dt-hero,.fn-hero,.hb-hero{margin-bottom:40px!important;gap:44px!important}
.tl-soc-grid,.tl-eng,.fx-testbed,.dt-mapgrid,.dt-office{gap:24px!important}
.tl-rule{margin:0 0 12px!important;padding:.85rem .95rem!important}
.tl-progressbar{margin-top:20px!important}
.tl-footnote{margin-top:56px!important}
.site-footer{margin-top:40px}
.ol-check-opt{margin:0 0 4px!important;font-weight:600}.ol-check-q legend{margin-bottom:8px}

/* ===== Defend It · incident operations (scoped .dt-*) ===== */
.dt-shell{--zone:#ffb083}
.tl-lead{color:#b4c8d7;line-height:1.7;max-width:720px;margin:0 0 .8rem}
.tl-mono{font-family:ui-monospace,Consolas,monospace;font-size:.8rem}
.tl-review{border-radius:10px;padding:.6rem .85rem;margin:8px 0;font-size:.86rem}.tl-review ul{margin:.2rem 0;padding-left:1.1rem}
.tl-review.good{background:#0f2a22;border:1px solid #2c6e57;color:#b5f5da}.tl-review.warn{background:#2a2313;border:1px solid #6e5a2c;color:#ffe3ac}
.tl-classify{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
.tl-footnote{margin-top:26px;font-size:.8rem;color:#8ea7b9;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.dt-hero{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(260px,.7fr);gap:24px;margin-bottom:18px}
.dt-title{font-size:clamp(2.2rem,4.6vw,4.2rem);line-height:1.02;letter-spacing:-.05em;margin:.3rem 0 .8rem;font-weight:850}.dt-title span{color:#ffb083}
.dt-status-card{border:1px solid #6b3a33;border-radius:16px;background:linear-gradient(160deg,#2a1512,#0f1a26);padding:16px;display:flex;flex-direction:column;gap:6px;justify-content:center}
.dt-hazard{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#ff7a5c;color:#2a0f08;font-size:1.8rem;font-weight:900;animation:dt-pulse 1.8s infinite}
@keyframes dt-pulse{0%,100%{box-shadow:0 0 0 0 #ff7a5c66}50%{box-shadow:0 0 0 12px #ff7a5c00}}
.dt-status-card span:last-child{color:#d9b9b0;font-size:.84rem}
.dt-mapgrid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(300px,.9fr);gap:14px;align-items:start}
.dt-mapwrap{position:relative;border:1px solid #2a485a;border-radius:16px;overflow:hidden;background:#102932}
.dt-map{display:block;width:100%;height:auto}
.dt-map-tip{position:absolute;left:12px;bottom:10px;font-family:ui-monospace,Consolas,monospace;font-size:.66rem;letter-spacing:.1em;color:#bfe3e8;background:#071421cc;padding:4px 8px;border-radius:6px}
.dt-hot{cursor:pointer;transition:opacity .15s}.dt-hot:hover,.dt-hot:focus{opacity:.85;outline:none}
.dt-hot:not(.is-done) > *:first-child{animation:dt-glow 2s infinite}
.dt-hot:focus > *:first-child,.dt-hot.is-active > *:first-child{stroke:#fff;stroke-width:3}
.dt-hot.is-done{opacity:.55}
@keyframes dt-glow{50%{filter:drop-shadow(0 0 6px #ffb083)}}
.dt-sitepanel h3{margin:.3rem 0 .7rem}
.dt-action{display:flex;justify-content:space-between;width:100%;text-align:left;margin:0 0 7px}.dt-action small{color:#9fc0d0;font-family:ui-monospace,Consolas,monospace;white-space:nowrap;margin-left:10px}
.dt-evidence{display:flex;gap:9px;border-left:3px solid #ffb083;background:#1f1912;border-radius:0 9px 9px 0;padding:.55rem .7rem;margin:0 0 7px;font-size:.86rem;line-height:1.45;animation:ol-pop .35s ease-out}
.dt-escalate{color:#ffcf9a;font-size:.84rem}
.dt-board{margin:0;padding-left:0;list-style:none;display:flex;flex-direction:column;gap:5px;font-size:.82rem;color:#d4e2ea}.dt-board li{display:flex;gap:8px;line-height:1.4}
.dt-report{border:1px solid #2a485a;border-radius:14px;padding:14px;background:#0c1a27;display:flex;flex-direction:column;gap:8px;font-size:.84rem}
.dt-report h4{margin:0;font-size:1rem}.dt-report label{display:flex;flex-direction:column;gap:4px;font-weight:700;color:#bccfdc}
.dt-report select{background:#071521;border:1px solid #2c4a5e;border-radius:8px;color:#e8f6ff;padding:.45rem .5rem;font-weight:500}
.dt-report fieldset{border:1px solid #1f3a4c;border-radius:9px;padding:.4rem .6rem;display:flex;flex-direction:column;gap:3px;max-height:220px;overflow:auto}
.dt-report legend{font-weight:700;color:#bccfdc;font-size:.8rem}
.dt-report .dt-check{flex-direction:row;align-items:flex-start;gap:7px;font-weight:500;color:#d4e2ea;font-size:.8rem}
.dt-row{display:flex;gap:10px}.dt-row>label{flex:1}
.dt-meters{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}
.dt-meters>div{border:1px solid #23405a;border-radius:12px;padding:.7rem .9rem;background:#0c1a27}.dt-meters small{font-family:ui-monospace,Consolas,monospace;font-size:.62rem;letter-spacing:.14em;color:#8aa6ba}.dt-meters strong{display:block;font-size:1.5rem;margin:.15rem 0 .35rem}
.dt-office{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(320px,1fr);gap:14px;align-items:start}
.dt-floorhead{display:flex;justify-content:space-between;margin-bottom:6px}
.dt-floor{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,140px);gap:6px;padding:10px;border:2px solid #3b5566;border-radius:14px;background:repeating-linear-gradient(45deg,#0b1724,#0b1724 8px,#0d1a28 8px,#0d1a28 16px)}
.dt-room{border:1px solid #33536a;border-radius:10px;background:#122638;color:#e4f1f8;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;padding:10px;text-align:left;position:relative;transition:background .15s,border-color .15s}
.dt-room:hover{background:#173149}.dt-room.is-active{border-color:#ffb083;background:#1f2a35;box-shadow:inset 0 0 0 1px #ffb083}
.dt-room-name{font-weight:800;font-size:.92rem}.dt-room-state{font-family:ui-monospace,Consolas,monospace;font-size:.7rem;color:#a9c6d6}
.dt-room.has-alert::after{content:"";position:absolute;top:10px;right:10px;width:11px;height:11px;border-radius:50%;background:#ff7a5c;animation:dt-pulse 1.6s infinite}
.dt-roompanel{position:sticky;top:12px}
.dt-room-alert{background:#2a1a14;border-left:3px solid #ff7a5c;padding:.5rem .7rem;border-radius:0 8px 8px 0;font-size:.86rem;line-height:1.45}
.dt-intel-note{background:#0f2730;border-left:3px solid #5ff0dc;padding:.45rem .7rem;border-radius:0 8px 8px 0;font-size:.82rem;color:#c3f3ec}
.dt-actions{display:flex;flex-direction:column;margin:8px 0}
.dt-power{border:1px solid #2a485a;border-radius:10px;padding:.6rem .8rem;margin:8px 0;font-size:.82rem;display:flex;flex-direction:column;gap:5px}
.dt-power-row{display:flex;justify-content:space-between}.dt-ok{color:#9ff2cf;margin:.2rem 0}.dt-bad{color:#ffb3bd;margin:.2rem 0}
.dt-loads{list-style:none;padding:0;margin:4px 0 0;display:flex;flex-direction:column;gap:2px}.dt-loads li{display:flex;justify-content:space-between;font-size:.78rem}.dt-loads li.off{color:#6f8799;text-decoration:line-through}
.dt-objectives{list-style:none;padding:0;margin:.4rem 0;display:flex;flex-direction:column;gap:5px;font-size:.86rem}.dt-objectives li{display:flex;gap:8px}.dt-objectives li.ok{color:#9ff2cf}
.dt-combined{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:5px;font-size:.82rem}.dt-combined li{display:flex;gap:8px;line-height:1.4}
.dt-combined b{font-family:ui-monospace,Consolas,monospace;font-size:.62rem;border-radius:5px;padding:2px 5px;height:fit-content}.from-A b{background:#33261a;color:#ffcf9a}.from-B b{background:#13303a;color:#9ff0e6}
.dt-orderpick{display:flex;flex-direction:column;gap:6px;margin:8px 0}.dt-orderbtn{text-align:left;justify-content:flex-start}
.dt-orderlist{list-style:none;padding:0;display:flex;flex-direction:column;gap:5px}.dt-orderlist li{display:flex;gap:10px;align-items:center;border:1px solid #2a485a;border-radius:9px;padding:.45rem .7rem;font-size:.86rem;background:#0c1a27}
.dt-orderlist b{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:#ffb083;color:#2a140b;font-size:.8rem;flex:none}
.dt-bonusbrief{border-color:#6b3a33}.dt-bstep{border:1px solid #2a485a;border-radius:14px;padding:14px;margin-top:12px;background:#0c1a27}.dt-bstep h4{margin:.3rem 0}
.dt-backups{list-style:none;padding:0;display:flex;flex-direction:column;gap:6px}.dt-backups li{display:grid;grid-template-columns:minmax(150px,1fr) minmax(150px,1fr) auto;gap:10px;align-items:center;font-size:.84rem;border-bottom:1px solid #18303f;padding:.4rem 0}
.dt-backups em{grid-column:1/-1;color:#c6e7ef;font-style:normal;font-size:.8rem}
@media (max-width:1100px){.dt-hero,.dt-mapgrid,.dt-office{grid-template-columns:1fr}.dt-roompanel{position:static}.dt-meters{grid-template-columns:1fr}}

</style>
</head>
<body class="page-defend">
<header class="site-header">
  <a class="brand" href="/" aria-label="Operation Lockdown home"><span class="brand-mark"><img src="/assets/img/shield-mark.svg" alt="" width="42" height="42"></span><span class="brand-text"><strong>OPERATION <span>LOCKDOWN</span></strong><small>T-LEVEL EXPERIENCE <b class="brand-version">/ 2.0</b></small></span></a>
  <nav aria-label="Main navigation"><a href="/">Mission hub</a><a href="/leaderboard/">Live scores</a><a href="/facilitator/">Staff control</a><span class="connection-indicator" data-connection-status="checking" role="status">Checking API</span></nav>
</header>
<main class="system defend-shell dt-shell">
  <div class="topline"><span><span class="topline-dot"></span> NORTHSTAR SYSTEMS / INCIDENT NS-2611 / ZONE 03</span><span>INCIDENT OPERATIONS · DEFEND IT</span></div>
  <section class="dt-hero" aria-labelledby="dt-title">
    <div>
      <p class="ol-kicker">ZONE 03 · OFFICE UNDER PRESSURE</p>
      <h1 id="dt-title" class="dt-title">Hold the line <span>until power returns.</span></h1>
      <p class="tl-lead">08:31 — a van hit the power cabinet outside Northstar HQ. The building is running on battery. Since then, things have got strange: a badge used by someone on holiday, an “engineer” nobody booked, a finance PC behaving oddly. Work out what's really going on — and keep people and systems safe while you do.</p>
    </div>
    <aside class="dt-status-card" aria-label="Incident status"><span class="ol-kicker">PRIORITY ONE · LIVE INCIDENT</span><div class="dt-hazard" aria-hidden="true">!</div><strong>Multiple linked alerts</strong><span>Power · access control · malware · phone scams</span></aside>
  </section>
  <div id="dt-banner" class="ol-banner" role="status" aria-live="polite">Connecting to Mission Control…</div>
  <section class="ol-status-strip" aria-label="Group status">
    <div><small>GROUP</small><strong id="dt-group">—</strong><span id="dt-unit">Checking session</span></div>
    <div><small>YOUR ROLE</small><strong id="dt-station">—</strong><span id="dt-role">—</span></div>
    <div><small>OFFICIAL ZONE SCORE</small><strong id="dt-score" class="ol-official">0 / 100</strong><span>Server-validated sign-offs only</span></div>
    <div><small>RECOVERY KEY</small><strong id="dt-keytext">LOCKED</strong><span id="dt-progress">0 of 3 sign-offs passed</span></div>
  </section>
  <div id="dt-main">
  <div class="ol-tabs" role="tablist" aria-label="Defend It stations">
    <button class="ol-tab" role="tab" data-tab="a" aria-selected="true"><span>01</span><span>Town investigation<small>Workstation A · Intelligence</small></span><span class="ol-you" data-for="A" hidden>YOU</span><b id="dt-tab-a">open</b></button>
    <button class="ol-tab" role="tab" data-tab="b" aria-selected="false"><span>02</span><span>Office response<small>Workstation B · Response</small></span><span class="ol-you" data-for="B" hidden>YOU</span><b id="dt-tab-b">open</b></button>
    <button class="ol-tab" role="tab" data-tab="joint" aria-selected="false"><span>03</span><span>Incident review<small>Both workstations</small></span><b id="dt-tab-joint">open</b></button>
    <button class="ol-tab" role="tab" data-tab="bonus" aria-selected="false"><span>+</span><span>Backup failure<small>Optional · fast teams</small></span><b id="dt-tab-bonus">optional</b></button>
  </div>

  <section data-panel="a" role="tabpanel" aria-label="Workstation A: Incident Intelligence">
    <div class="ol-step"><span>INVESTIGATE</span><strong>Explore the area around HQ</strong><small>Each action takes time · clock <b id="dt-a-clock" class="tl-mono">08:47</b></small></div>
    <div class="dt-mapgrid">
      <div class="dt-mapwrap"><svg class="dt-map" viewBox="0 0 900 510" role="img" aria-label="Interactive town map showing an office, damaged utility box, parking and reception entrance" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="road-dashes" width="55" height="4" patternUnits="userSpaceOnUse"><rect width="28" height="3" rx="1" fill="#819ca7" opacity=".55"/></pattern><pattern id="office-grid" width="33" height="29" patternUnits="userSpaceOnUse"><rect x="8" y="7" width="17" height="10" rx="2" fill="#478b9b" opacity=".33"/></pattern></defs>
            <rect width="900" height="510" fill="#102932"/>
            <path d="M0 0H900V65H0z" fill="#1b3740"/><path d="M0 62H900V127H0z" fill="#263b46"/>
            <path d="M0 338H900V427H0z" fill="#2b404a"/><path d="M637 0H738V510H637z" fill="#263b46"/>
            <path d="M0 98H900M0 382H900M685 0V510" stroke="#a5b4b8" stroke-dasharray="26 28" opacity=".4" stroke-width="3"/>
            <path d="M0 145H605V328H0z" fill="#17383b"/><path d="M753 145H896V328H753z" fill="#18383a"/><path d="M0 435H611V505H0z" fill="#17363c"/>
            <g fill="#25574e" opacity=".78"><circle cx="29" cy="160" r="20"/><circle cx="63" cy="165" r="16"/><circle cx="792" cy="285" r="21"/><circle cx="849" cy="288" r="17"/><circle cx="792" cy="460" r="23"/><circle cx="829" cy="479" r="16"/><circle cx="105" cy="463" r="19"/><circle cx="43" cy="466" r="15"/></g>
            <g fill="#357864" opacity=".4"><circle cx="29" cy="159" r="9"/><circle cx="792" cy="285" r="11"/><circle cx="105" cy="463" r="8"/></g>
            <g><rect x="257" y="154" width="297" height="171" rx="7" fill="#071923" opacity=".5"/><rect x="252" y="146" width="297" height="171" rx="6" fill="#204b5a" stroke="#5c8995" stroke-width="3"/><rect x="267" y="161" width="266" height="141" fill="#255466" stroke="#3f7782"/><rect x="267" y="161" width="266" height="141" fill="url(#office-grid)"/><path d="M399 161V301M267 236H533" stroke="#4c8390" stroke-width="3" opacity=".55"/><rect x="367" y="205" width="67" height="35" rx="5" fill="#112d3a" stroke="#609dad"/><text x="400" y="220" text-anchor="middle" fill="#c5f9ee" font-size="11" font-weight="800">OFFICE</text><text x="400" y="233" text-anchor="middle" fill="#97cada" font-size="9">HQ / 04</text><path d="M250 317H552" stroke="#77cad1" stroke-width="6" opacity=".4"/></g>
            <g><rect x="749" y="159" width="132" height="82" rx="6" fill="#315866" stroke="#5a8290" stroke-width="2"/><rect x="759" y="170" width="112" height="52" fill="#1a414e"/><text x="815" y="199" text-anchor="middle" font-size="12" fill="#a8d9e2" font-weight="800">HIGH STREET</text><rect x="760" y="441" width="114" height="45" rx="5" fill="#2c4c55" stroke="#597d87"/><text x="817" y="465" text-anchor="middle" font-size="11" fill="#a9cbd6">BUS STOP</text></g>
            <g><rect x="55" y="199" width="134" height="84" rx="5" fill="#2b4853" stroke="#628c93"/><path d="M75 218H171M75 229H171M75 240H171" stroke="#81aeae" opacity=".35"/><text x="122" y="268" text-anchor="middle" fill="#b4d9da" font-size="10">UTILITY AREA</text></g>
            <g><rect x="250" y="442" width="300" height="54" rx="4" fill="#253d49" stroke="#457281"/><path d="M265 448V487M312 448V487M359 448V487M406 448V487M453 448V487M500 448V487" stroke="#8aa1ad" opacity=".4"/><text x="394" y="502" text-anchor="middle" fill="#a7c5cf" font-size="10">STAFF CAR PARK</text><rect x="327" y="455" width="42" height="19" rx="6" fill="#4c8b99"/><rect x="427" y="455" width="42" height="19" rx="6" fill="#6f8fa1"/></g>
            <g class="dt-hot" tabindex="0" role="button" aria-label="Inspect power cabinet damage" data-site="power"><rect x="89" y="177" width="71" height="61" rx="7" fill="#243e49" stroke="#fba16f" stroke-width="2"/><path d="M124 187L111 214H135z" fill="#ffae7a"/><text x="124" y="208" font-size="16" text-anchor="middle" fill="#2c2c38" font-weight="900">!</text><text x="125" y="252" fill="#f9bf9c" text-anchor="middle" font-size="11" font-weight="800">POWER FAULT</text></g>
            <g class="dt-hot" tabindex="0" role="button" aria-label="Inspect office entrance and access alert" data-site="entrance"><rect x="469" y="289" width="53" height="34" rx="4" fill="#294e5d" stroke="#ff9a8b" stroke-width="2"/><path d="M495 265L476 289H514z" fill="#ed716d"/><text x="495" y="284" text-anchor="middle" font-weight="900" fill="white" font-size="16">!</text><text x="497" y="337" fill="#ffb7a8" font-size="11" font-weight="800" text-anchor="middle">ACCESS ALERT</text></g>
            <g class="dt-hot" tabindex="0" role="button" aria-label="Inspect car park security report" data-site="parking"><rect x="481" y="446" width="53" height="37" rx="5" fill="#38535e" stroke="#f5c379" stroke-width="2"/><path d="M508 417L492 439H524z" fill="#e4b466"/><text x="508" y="436" text-anchor="middle" fill="#2d2a2a" font-size="14" font-weight="900">!</text><text x="507" y="410" text-anchor="middle" fill="#f4d0a1" font-size="10" font-weight="800">PARKING</text><rect x="479" y="400" width="58" height="85" fill="transparent" stroke="none"/></g>
            <g class="dt-hot" tabindex="0" role="button" aria-label="Inspect vehicle collision and surrounding road" data-site="collision"><rect x="178" y="360" width="60" height="26" rx="10" fill="#b76f61" stroke="#e7a493" stroke-width="2"/><rect x="191" y="355" width="29" height="8" rx="4" fill="#243943"/><path d="M242 368l11 -10 14 15" stroke="#f4be94" fill="none" stroke-width="2"/><text x="208" y="405" text-anchor="middle" fill="#f4d3b9" font-size="10">VEHICLE COLLISION</text></g>
            <g class="dt-hot" tabindex="0" role="button" aria-label="Inspect office building" data-site="office"><rect x="277" y="258" width="126" height="39" rx="5" fill="#0d2935" stroke="#5ed9cb" stroke-width="1.5"/><text x="340" y="274" fill="#a4fff0" text-anchor="middle" font-size="11" font-weight="900">HQ RECEPTION</text><text x="340" y="287" fill="#75c8ce" text-anchor="middle" font-size="9">RADIO LINK</text></g>
            <g fill="#82a3ad" font-family="monospace" font-size="9" letter-spacing="2"><text x="24" y="88">NORTH STREET</text><text x="24" y="365">RIVERSIDE ROAD</text><text transform="translate(710,182) rotate(90)">CENTRAL AVENUE</text><text x="20" y="22">SECTOR 04  /  LIVE MAP</text></g>
          </svg><div class="dt-map-tip">● Click or Tab to a marker and press Enter</div></div>
      <aside class="ol-panel dt-sitepanel" aria-live="polite"><div id="dt-site"></div><p id="dt-a-alert" class="dt-escalate" role="status"></p></aside>
    </div>
    <div class="ol-two" style="margin-top:14px">
      <div class="ol-panel"><span class="ol-kicker">EVIDENCE BOARD · <span id="dt-a-count">0/9</span></span><h3>What you know</h3><ol id="dt-board" class="dt-board"></ol><div id="dt-hints-a"></div></div>
      <div id="dt-intel"></div>
    </div>
    <div class="ol-step"><span>REPORT</span><strong>Write the incident reports</strong><small>Checked by the duty manager</small></div>
    <div id="dt-reports" class="ol-grid2"></div>
    <div class="ol-checkpoint" id="dt-check-a"></div>
  </section>

  <section data-panel="b" role="tabpanel" aria-label="Workstation B: Incident Response" hidden>
    <div class="ol-step"><span>RESPOND</span><strong>Run the office through the incident</strong><small>Every action costs time · clock <b id="dt-b-clock" class="tl-mono">08:47</b></small></div>
    <div class="dt-meters">
      <div><small>STAFF SAFETY</small><strong id="dt-m-safety">—</strong><div class="ol-meter" id="dt-mb-safety"><i></i></div></div>
      <div><small>SYSTEM SECURITY</small><strong id="dt-m-security">—</strong><div class="ol-meter" id="dt-mb-security"><i></i></div></div>
      <div><small>BUSINESS OPERATIONS</small><strong id="dt-m-ops">—</strong><div class="ol-meter" id="dt-mb-ops"><i></i></div></div>
    </div>
    <div class="dt-office">
      <div>
        <div class="dt-floorhead"><span class="ol-kicker">NORTHSTAR HQ · GROUND FLOOR</span><span class="ol-sim-tag">SIMULATION</span></div>
        <div id="dt-floor" class="dt-floor"></div>
        <div class="ol-panel" style="margin-top:12px"><span class="ol-kicker">FIELD INTELLIGENCE FROM WORKSTATION A</span><div id="dt-intel-entry"></div></div>
      </div>
      <aside class="ol-panel dt-roompanel" aria-live="polite"><div id="dt-room"></div></aside>
    </div>
    <div class="ol-two" style="margin-top:14px">
      <div class="ol-panel"><span class="ol-kicker">OBJECTIVES</span><ul id="dt-objectives" class="dt-objectives"></ul><p id="dt-b-verdict" class="ol-banner"></p><button type="button" id="dt-restart" class="ol-btn ol-btn-quiet">Restart office simulation</button><div id="dt-hints-b"></div></div>
      <div class="ol-panel"><span class="ol-kicker">INCIDENT LOG</span><div id="dt-log" class="ol-feed"></div></div>
    </div>
    <div id="dt-response" style="margin-top:12px"></div>
    <div class="ol-checkpoint" id="dt-check-b"></div>
  </section>

  <section data-panel="joint" role="tabpanel" aria-label="Joint incident review" hidden>
    <div class="ol-step"><span>JOINT · BOTH WORKSTATIONS</span><strong>Put the whole picture together</strong><small>Swap codes · find gaps · agree recovery order</small></div>
    <div id="dt-joint-codes"></div>
    <div class="ol-two" style="margin-top:14px">
      <div class="ol-panel"><span class="ol-kicker">COMBINED TIMELINE</span><div id="dt-joint-timeline"></div></div>
      <div class="ol-panel"><span class="ol-kicker">GAPS TO DISCUSS</span><div id="dt-joint-gaps"></div></div>
    </div>
    <div class="ol-panel" style="margin-top:14px"><span class="ol-kicker">SAFE RECOVERY ORDER</span><h3>Agree the order together</h3>
      <div id="dt-order-pick" class="dt-orderpick"></div><ol id="dt-order-list" class="dt-orderlist"></ol>
      <p id="dt-order-fb" class="ol-check-feedback" role="status"></p><button type="button" id="dt-order-reset" class="ol-btn ol-btn-quiet">Reset order</button></div>
    <div class="ol-checkpoint" id="dt-check-joint"></div>
    <div class="ol-key" id="dt-key"><div class="ol-key-glyph" id="dt-key-glyph" aria-hidden="true">◇</div><div><small>RECOVERY KEY</small><strong>THREAT CONTAINED</strong><small id="dt-key-sub">Unlocks when the server confirms A, B and joint sign-offs.</small></div></div>
  </section>

  <section data-panel="bonus" role="tabpanel" aria-label="Bonus: backup failure" hidden>
    <div class="ol-step"><span>OPTIONAL · FAST TEAMS</span><strong>10:24 — the backup failed its restore test</strong><small>A secondary incident, three decisions</small></div>
    <div class="ol-panel dt-bonusbrief"><p>With power back, IT tries to restore the file server from last night's backup. The restore test fails. Staff are asking when they'll get their files back.</p></div>
    <div id="dt-bonus"></div>
    <div class="ol-checkpoint" id="dt-check-bonus"></div>
  </section>
  </div>
  <p class="tl-footnote"><span class="ol-sim-tag">THIS COMPUTER ONLY</span> Evidence, reports and the office simulation are saved in this browser tab. Only Mission Control sign-offs change your group's official score. <button type="button" id="dt-reset-sim" class="ol-btn ol-btn-quiet">Reset simulation on this computer</button></p>
  <footer class="site-footer"><span>OPERATION LOCKDOWN 2.0</span><span>DEFEND IT · INCIDENT RESPONSE</span><span>ALL DATA IS FICTIONAL</span></footer>
</main>
<script src="/assets/js/ui.js" defer></script>
<script type="module" src="/assets/js/defend.js"></script>
</body>
</html>
