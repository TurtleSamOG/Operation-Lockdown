<?php
declare(strict_types=1);
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#08131f">
<meta name="description" content="Operation Lockdown 2.0 Train It — interactive security analytics and detector engineering lab">
<title>Train It | AI Security Lab — Operation Lockdown 2.0</title>
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/app.css">
<link rel="stylesheet" href="/assets/css/system.css">
<link rel="stylesheet" href="/assets/css/polish.css">
<link rel="stylesheet" href="/assets/css/train.css">
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
/* ===== v3 · guided steps, calmer layout, readability ===== */
.system{font-size:1.02rem}
.ol-panel p,.ol-check-intro,.ol-handoff p{font-size:.98rem;line-height:1.7}
/* compact zone heroes: the mission, not a wall of text */
.tl-hero,.fx-hero,.dt-hero{margin-bottom:28px!important;align-items:center!important}
.tl-title,.fx-title,.dt-title{font-size:clamp(2rem,3.6vw,3.1rem)!important;margin:.2rem 0 .6rem!important}
.tl-lead{font-size:1.02rem;line-height:1.75!important;max-width:62ch}
.tl-honest{font-size:.8rem!important;opacity:.85}
.tl-feed,.fx-ticketfeed{font-size:.82rem}
.ol-status-strip{margin-bottom:28px}
/* stepper */
.ol-stepper{position:sticky;top:0;z-index:5;background:linear-gradient(#08131fee 70%,#08131f00);padding:14px 0 18px;margin:8px 0 4px}
.ol-stepnav{list-style:none;margin:0;padding:0;display:flex;gap:10px;flex-wrap:wrap}
.ol-stepbtn{display:flex;align-items:center;gap:10px;border:1px solid #24405a;background:#0d1c2b;color:#9fb8c8;border-radius:99px;padding:.45rem 1rem .45rem .45rem;font-weight:750;font-size:.92rem;transition:all .15s}
.ol-stepbtn b{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#16293b;color:#cfe3ef;font-size:.85rem;flex:none}
.ol-stepbtn:hover{border-color:var(--zone,#5ff0dc);color:#e8f6ff}
.ol-stepbtn.is-current{border-color:var(--zone,#5ff0dc);background:#11283a;color:#fff;box-shadow:0 0 0 3px #5ff0dc1f}
.ol-stepbtn.is-current b{background:var(--zone,#5ff0dc);color:#05242c}
.ol-stepbtn.is-seen b{background:#1d3a4f}
.ol-stepbtn.is-done{color:#a6f3d2;border-color:#2c6e57}.ol-stepbtn.is-done b{background:#2f9e76;color:#03201a}
.ol-stepgroup{animation:ol-stepin .3s ease-out}
@keyframes ol-stepin{from{opacity:0;transform:translateY(8px)}}
.ol-stepgroup>.ol-step{display:block;margin:18px 0 26px!important;padding:0 0 22px;border-bottom:1px solid #1d3446}
.ol-stepgroup>.ol-step span{display:block;margin-bottom:8px;font-size:.72rem}
.ol-stepgroup>.ol-step strong{display:block;font-size:clamp(1.5rem,2.4vw,2rem);letter-spacing:-.025em;line-height:1.15}
.ol-stepgroup>.ol-step small{display:block;margin:12px 0 0!important;text-align:left;font-size:1.05rem;line-height:1.7;color:#c4d7e3!important;max-width:75ch}
.ol-stepgroup>.ol-checkpoint{margin-top:0}
.ol-stepfoot{display:flex;align-items:center;gap:14px;margin:40px 0 10px;padding:22px 0 0;border-top:1px solid #1d3446}
.ol-stepfoot .ol-next{margin-left:auto;font-size:1rem;padding:.8rem 1.4rem}
.ol-stepcount{color:#7f9cb1;font-size:.88rem;font-family:ui-monospace,Consolas,monospace}
/* locked / final decisions */
.ol-locked{display:inline-block;margin:.6rem 0 0;font-weight:750;font-size:.9rem;color:#ffe0a2;background:#2a2313;border:1px solid #6e5a2c;border-radius:9px;padding:.45rem .75rem}
.ol-check-final{border:1px solid #2c6e57;background:#0f2a22;border-radius:14px;padding:18px 20px}
.ol-check-final strong{font-size:1.15rem;color:#a6f3d2}.ol-check-final p{margin:.4rem 0 0;color:#cfeee2}
.ol-role-note{border-left:3px solid var(--zone,#5ff0dc);background:#0d1d2a;padding:.7rem 1rem;border-radius:0 10px 10px 0;font-size:.98rem;line-height:1.6}
.dt-outcome{border-color:#2c6e57!important}
@media (max-width:900px){.ol-stepbtn span{display:none}.ol-stepbtn{padding:.35rem}}
/* ===== Live attack takeover (.la-*) ===== */
body.la-locked{overflow:hidden}
.la-overlay{position:fixed;inset:0;z-index:200;background:radial-gradient(ellipse at 50% 0%,#3a0f18f2,#07080ef7 70%);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:4vh 3vw;animation:la-in .35s ease-out}
@keyframes la-in{from{opacity:0}}
.la-panel{width:min(980px,100%);background:#0d1520;border:2px solid #ff5d72;border-radius:22px;padding:clamp(20px,3vw,34px);box-shadow:0 0 0 8px #ff5d7222,0 40px 120px #000c}
.la-head{display:flex;gap:18px;align-items:center}
.la-pulse{width:66px;height:66px;border-radius:50%;display:grid;place-items:center;font-size:2rem;background:#ff5d72;flex:none;animation:la-pulse 1.1s infinite}
@keyframes la-pulse{0%,100%{box-shadow:0 0 0 0 #ff5d7288}50%{box-shadow:0 0 0 18px #ff5d7200}}
.la-kicker{font-family:ui-monospace,Consolas,monospace;font-size:.7rem;letter-spacing:.14em;color:#ff9fac;font-weight:800;margin:0}
.la-head h2,.la-done h2{margin:.2rem 0 0;font-size:clamp(1.6rem,3vw,2.4rem);letter-spacing:-.03em}
.la-clock{margin-left:auto;text-align:right}.la-clock strong{display:block;font-family:ui-monospace,Consolas,monospace;font-size:2.2rem;color:#ffd0d6}.la-clock small{color:#ffb3bd;font-size:.78rem}
.la-timebar{height:6px;background:#2a1820;border-radius:99px;margin:16px 0;overflow:hidden}.la-timebar i{display:block;height:100%;background:linear-gradient(90deg,#ff5d72,#ffb083);transition:width 1s linear}
.la-intro{font-size:1.05rem;line-height:1.65;color:#e5d9dd}
.la-ransom{background:#1b0004;border:1px solid #ff2f4b;border-radius:12px;padding:14px 18px;margin:10px 0;display:flex;flex-direction:column;gap:4px;font-family:ui-monospace,Consolas,monospace}
.la-ransom strong{color:#ff4d63;font-size:1.2rem;letter-spacing:.05em}.la-ransom span{color:#ffc2c9}
.la-graph{display:flex;align-items:flex-end;gap:4px;height:90px;background:#101b26;border-radius:12px;padding:10px;margin:10px 0}
.la-graph i{flex:1;background:linear-gradient(#ff5d72,#ffb083);border-radius:3px 3px 0 0;min-height:4px}
.la-items{display:flex;flex-direction:column;gap:12px;margin:16px 0}
.la-item{border:1px solid #3a2a33;border-radius:14px;padding:12px 14px;background:#121c28}
.la-item legend{font-weight:750;font-size:1rem;padding:0 6px;line-height:1.4}
.la-mail{display:flex;flex-direction:column;gap:2px}.la-mail small{color:#9fb8c8;font-weight:600}.la-mail span{color:#c8d6df;font-weight:500;font-size:.9rem}
.la-opts{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.la-opt{display:flex;gap:8px;align-items:center;border:1px solid #2f4456;border-radius:10px;padding:.55rem .8rem;cursor:pointer;font-size:.92rem;margin:0!important;color:#e5eef4;font-weight:600}
.la-opt:has(input:checked){border-color:#ffb083;background:#2a1e18}.la-opt input{accent-color:#ff8a5c}
.la-foot{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;border-top:1px solid #2a2a36;padding-top:16px;color:#c3b4ba;font-size:.88rem}
.la-submit{border:0;border-radius:12px;padding:.9rem 1.5rem;font-weight:900;font-size:1rem;background:linear-gradient(135deg,#ff8a5c,#ff5d72);color:#1a0508}
.la-submit:disabled{opacity:.4;cursor:not-allowed}
.la-err{color:#ffb3bd;min-height:1.2em;margin:.5rem 0 0}
.la-done{border-color:#43d6a6;box-shadow:0 0 0 8px #43d6a622,0 40px 120px #000c}.la-done h2{color:#a6f3d2}
.la-late{border-color:#e2b552}.la-late h2{color:#ffe0a2}
.la-feedback{list-style:none;padding:0;display:flex;flex-direction:column;gap:8px}
.la-feedback li{border-radius:10px;padding:.6rem .8rem;line-height:1.5;font-size:.92rem}.la-feedback li.ok{background:#0f2a22}.la-feedback li.no{background:#2a141b}
.la-feedback b{color:#a6f3d2}.la-feedback li.no b{color:#ff98a6}
button.la-opt{background:#0f1a25;text-align:left;font:inherit;font-weight:600}
button.la-opt:hover:not(:disabled){border-color:#ffb083;background:#1d2530}
button.la-opt:disabled{cursor:default;opacity:.45}
button.la-opt.is-chosen{opacity:1;border-color:#ffb083;background:#2a1e18;box-shadow:inset 0 0 0 1px #ffb083}
button.la-opt.is-wait{opacity:.7;cursor:progress}
.la-item.is-locked{border-color:#5a4a3a;background:#151a22}
.la-lock{margin:.5rem 0 0;font-size:.82rem;color:#ffcfa8;font-weight:700}
.la-rule{background:#2a1e18;border:1px solid #6a4a32;border-radius:10px;padding:.6rem .9rem;color:#ffd9bd;font-size:.9rem;margin:10px 0 0}
.la-count{font-family:ui-monospace,Consolas,monospace;color:#ffd0d6;font-size:1rem}
.la-note{border-color:#6a7f94;background:#101b26}.la-note strong{color:#ffd0a0;font-size:1.05rem}.la-note span{color:#d4e0e8}
.la-debrief{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:120;width:min(1100px,94vw);background:#0d1520f5;border:2px solid #43d6a6;border-radius:18px;padding:18px 24px;box-shadow:0 30px 90px #000b}
.la-debrief h3{margin:0 0 10px;color:#a6f3d2;font-size:1.3rem}
.la-debrief ol{margin:0;padding-left:1.2rem;display:flex;flex-direction:column;gap:8px}
.la-debrief li{line-height:1.45}.la-debrief li strong{color:#fff}.la-debrief li span{color:#c3d3dd;font-size:.92rem}
.la-debrief .la-best{color:#a6f3d2;font-weight:800}

/* ===== Train It · security analytics lab (scoped .tl-*) ===== */
.tl-shell{--zone:#5ff0dc}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.tl-hero{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(300px,.9fr);gap:24px;align-items:stretch;margin-bottom:18px}
.tl-title{font-size:clamp(2.2rem,4.6vw,4.2rem);line-height:1.02;letter-spacing:-.05em;margin:.3rem 0 .8rem;font-weight:850}.tl-title span{color:#74eadc}
.tl-lead{color:#b4c8d7;line-height:1.7;max-width:680px;margin:0 0 .8rem}
.tl-honest{font-size:.82rem;color:#9fb6c6;max-width:680px;line-height:1.55}
.tl-feed{border:1px solid #23455a;border-radius:16px;background:#0a1824;padding:14px;display:flex;flex-direction:column;gap:8px}
.tl-feed-head{font-family:ui-monospace,Consolas,monospace;font-size:.66rem;letter-spacing:.16em;color:#7fd8cf;font-weight:800}
.tl-led{display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff6d7d;margin-right:6px;box-shadow:0 0 0 4px #ff6d7d22;animation:tl-blink 1.6s infinite}
@keyframes tl-blink{50%{opacity:.35}}
.tl-msg{border-left:2px solid #2f6270;padding:.35rem .7rem;background:#0d1f2d;border-radius:0 8px 8px 0;font-size:.84rem;animation:tl-in .5s both}
.tl-msg:nth-child(3){animation-delay:.25s}.tl-msg:nth-child(4){animation-delay:.5s}
@keyframes tl-in{from{opacity:0;transform:translateY(6px)}}
.tl-msg time{font-family:ui-monospace,Consolas,monospace;color:#6f93a8;font-size:.72rem;margin-right:6px}.tl-msg b{font-size:.78rem;color:#bfe9ef}.tl-msg p{margin:.2rem 0 0;color:#c8dbe5}
.tl-msg-alert{border-color:#e0606f}.tl-msg-alert strong{color:#ff9fab}
/* SOC dashboard */
.tl-soc{padding-top:12px}
.tl-soc-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center}
.tl-legend{font-size:.72rem;color:#93abbe;display:flex;gap:10px;align-items:center}.tl-legend i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:3px}
.lg-n{background:#5fe3b0}.lg-s{background:#ff8a99}.lg-r{background:#f4c86d}.lg-u{background:#7aa7c2}
.tl-timeline{width:100%;height:auto;display:block;margin:6px 0 10px}
.tl-dot{cursor:pointer}.tl-dot:focus{outline:none}.tl-dot:focus circle,.tl-dot:hover circle{stroke:#fff}
.tl-soc-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(300px,1fr);gap:14px;align-items:start}
.tl-table-wrap{overflow:auto;border:1px solid #1d3547;border-radius:12px}
.tl-table{width:100%;border-collapse:collapse;font-size:.84rem}
.tl-table th{text-align:left;font-family:ui-monospace,Consolas,monospace;font-size:.64rem;letter-spacing:.12em;color:#7f9cb1;font-weight:800;padding:.55rem .6rem;border-bottom:1px solid #1d3547;background:#0b1825;position:sticky;top:0}
.tl-table td{padding:.5rem .6rem;border-bottom:1px solid #15293a;vertical-align:top}
.tl-table td small{display:block;color:#7f9cb1;font-size:.72rem}
.tl-small{font-size:.8rem}.tl-small td{padding:.38rem .55rem}
.tl-events-table tbody tr{cursor:pointer;transition:background .12s}
.tl-events-table tbody tr:hover,.tl-events-table tbody tr:focus{background:#122a3b;outline:none}
.tl-events-table tbody tr.is-selected{background:#14334a;box-shadow:inset 3px 0 #5ff0dc}
.tl-events-table tbody tr:not(.is-opened) td:first-child::after{content:" ●";color:#5ff0dc;font-size:.6rem}
.tl-flags{display:flex;flex-wrap:wrap;gap:4px}
.tl-mono{font-family:ui-monospace,Consolas,monospace;font-size:.8rem;white-space:nowrap}
.tl-dim{color:#7f97a9}
.tl-label{display:inline-block;font-size:.72rem;font-weight:800;border-radius:6px;padding:2px 7px;background:#18293a;color:#8aa6ba}
.tl-label-normal{background:#11302a;color:#8ff2c9}.tl-label-suspicious{background:#3a1822;color:#ffadb8}.tl-label-review{background:#33290f;color:#ffdc8e}
.tl-inspector{border:1px solid #23455a;border-radius:14px;background:#0a1a27;padding:14px;position:sticky;top:12px}
.tl-insp-head h3{margin:.2rem 0 0;font-family:ui-monospace,Consolas,monospace}.tl-insp-head small{color:#8aa6b6}
.tl-compare{width:100%;border-collapse:collapse;font-size:.8rem;margin:10px 0}
.tl-compare th,.tl-compare td{padding:.35rem .4rem;border-bottom:1px solid #16293a;text-align:left;vertical-align:top}
.tl-compare thead th{font-size:.64rem;letter-spacing:.1em;color:#7f9cb1;font-family:ui-monospace,Consolas,monospace}
.tl-compare tbody th{color:#9fb8c8;font-weight:700;white-space:nowrap}
.tl-notes p{margin:.3rem 0;font-size:.84rem;color:#d6e6ee;line-height:1.45}
.tl-classify{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 6px}
.tl-cls-normal[aria-pressed="true"]{border-color:#5fe3b0;background:#10372b;color:#b6ffe0}
.tl-cls-suspicious[aria-pressed="true"]{border-color:#ff8a99;background:#3d1823;color:#ffd0d6}
.tl-cls-review[aria-pressed="true"]{border-color:#f4c86d;background:#3a2d10;color:#ffe7b0}
.tl-debrief{border-radius:10px;padding:.6rem .8rem;margin-top:10px;font-size:.84rem}.tl-debrief p{margin:.25rem 0 0;line-height:1.5}
.tl-debrief.good{background:#0f2a22;border:1px solid #2c6e57}.tl-debrief.warn{background:#2a2313;border:1px solid #6e5a2c}
.tl-progressbar{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-top:12px;font-size:.84rem;color:#a8c0cf}
.tl-progressbar button{margin-left:auto}
.tl-review{border-radius:10px;padding:.7rem .9rem;margin:0 0 10px;font-size:.88rem}.tl-review p{margin:.3rem 0 0}
.tl-review.good{background:#0f2a22;border:1px solid #2c6e57;color:#b5f5da}.tl-review.warn{background:#2a2313;border:1px solid #6e5a2c;color:#ffe3ac}.tl-review.bad{background:#2a141b;border:1px solid #6e2f3c;color:#ffc6cf}
.tl-issue{display:flex;gap:10px;width:100%;text-align:left;border:1px solid #2a4357;background:#0d1c29;color:#d4e3ec;border-radius:10px;padding:.55rem .7rem;margin:0 0 6px;font-size:.84rem;line-height:1.45}
.tl-issue:hover{border-color:#5ff0dc}.tl-issue em{color:#9fd8de;font-style:normal}
.tl-issue-serious{border-left:3px solid #ff7f8f}.tl-issue-moderate{border-left:3px solid #f2c56b}.tl-issue-minor{border-left:3px solid #7aa7c2}
.tl-signals{display:flex;flex-direction:column;gap:6px}
.tl-signal{display:flex;gap:.6rem;align-items:flex-start;padding:.45rem .6rem;border:1px solid #1d3547;border-radius:9px;font-size:.86rem;cursor:pointer}
.tl-signal:has(input:checked){border-color:#3fbfb5;background:#11303a}.tl-signal input{margin-top:.2rem;accent-color:#3fe0cc}
/* Engineering */
.tl-eng{display:grid;grid-template-columns:minmax(330px,.9fr) minmax(0,1.3fr);gap:14px;align-items:start}
.tl-console{background:linear-gradient(160deg,#0c1d2b,#081520);font-size:.88rem}
.tl-console-head{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.tl-rule{border:1px solid #1d3547;border-radius:11px;padding:.6rem .7rem;margin:0 0 8px;background:#0a1823;display:flex;flex-direction:column;gap:7px}
.tl-rule-name b{font-size:.86rem}.tl-rule-name small{display:block;color:#7f9cb1;font-size:.74rem;margin-top:2px}
.tl-rule-alert{border-color:#2f5a6a;background:#0c2230}
.tl-weight{display:flex;gap:4px}
.tl-wbtn{flex:1;border:1px solid #24435a;background:#0f2232;color:#a9c3d3;border-radius:7px;padding:.35rem 0;font-weight:800;font-size:.78rem}
.tl-wbtn[aria-pressed="true"]{background:#1a4c55;border-color:#5ff0dc;color:#d9fff8}
.tl-wbtn:first-child[aria-pressed="true"]{background:#2a2030;border-color:#7d6a8a;color:#d8c8e4}
.tl-slider{display:flex;flex-direction:column;gap:4px;font-size:.8rem;color:#b9d0dd}.tl-slider input{accent-color:#3fe0cc;width:100%}
.tl-slider output{font-family:ui-monospace,Consolas,monospace;color:#8ffbe6;font-weight:800}
.tl-ctx{flex-direction:row;align-items:flex-start;gap:10px;cursor:pointer}.tl-ctx input{margin-top:.25rem;accent-color:#3fe0cc}.tl-ctx small{display:block;color:#7f9cb1}
.tl-inline{font-size:.78rem;color:#a9c3d3;display:flex;gap:6px;align-items:center}
.tl-runbar{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:4px 0 12px}
.tl-matrix{display:grid;grid-template-columns:110px 1fr 1fr;gap:6px;margin-bottom:10px}
.tl-mx-h{font-family:ui-monospace,Consolas,monospace;font-size:.64rem;letter-spacing:.1em;color:#7f9cb1;display:flex;align-items:flex-end}
.tl-mx-side{align-items:center}
.tl-mx{border-radius:10px;padding:.55rem .7rem;border:1px solid}.tl-mx b{font-size:1.6rem;display:block;font-family:ui-monospace,Consolas,monospace}.tl-mx small{font-size:.72rem}
.tl-mx.tp{background:#0f2c24;border-color:#2c6e57;color:#a6f3d2}.tl-mx.tn{background:#0f2230;border-color:#2c4c5c;color:#bfe0ee}
.tl-mx.fp{background:#2c2312;border-color:#6e5a2c;color:#ffe0a2}.tl-mx.fn{background:#2c141c;border-color:#6e2f3c;color:#ffbdc6}
.tl-mx b{animation:ol-pop .4s ease-out}
.tl-reqs p{margin:.3rem 0;font-size:.86rem}.tl-reqs .ok{color:#9ff2cf}.tl-reqs .no{color:#ffb7c0}
.tl-verdict{border-radius:9px;padding:.5rem .7rem;line-height:1.45}.tl-verdict.ok{background:#0f2a22}.tl-verdict.no{background:#2a1a1f;color:#ffd2d8}
.tl-results-wrap{max-height:320px;margin-top:10px}
.tl-results-wrap tr{animation:tl-in .25s both}
.tl-out-TP .tl-outcome{color:#8ff2c9}.tl-out-TN .tl-outcome{color:#9fc4d6}.tl-out-FP .tl-outcome{color:#ffd78a}.tl-out-FN .tl-outcome{color:#ff98a6}
.tl-out-FN{background:#2a141b55}.tl-out-FP{background:#2a231355}
#tl-history tr.ok td{color:#a6f3d2}
.tl-disagree{background:#2a231355}.tl-disagree td:last-child{color:#ffd78a;font-weight:800}
.tl-combined-sum{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:6px 0 12px}
.tl-combined-sum>div{border:1px solid #23455a;border-radius:10px;padding:.6rem .8rem;background:#0b1a27}
.tl-combined-sum small{display:block;font-family:ui-monospace,Consolas,monospace;font-size:.6rem;letter-spacing:.12em;color:#7f9cb1}.tl-combined-sum strong{display:block;margin:.2rem 0}.tl-combined-sum span{font-size:.76rem;color:#9fb8c8}
.tl-bonus-card{border:1px solid #6e5a2c;border-radius:14px;padding:14px;background:linear-gradient(160deg,#211c10,#0d1720)}.tl-bonus-card p{font-size:.88rem;line-height:1.5;color:#d8e2e8}
.tl-footnote{margin-top:26px;font-size:.8rem;color:#8ea7b9;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
@media (max-width:1100px){.tl-hero,.tl-soc-grid,.tl-eng{grid-template-columns:1fr}.tl-inspector{position:static}.tl-combined-sum{grid-template-columns:1fr}}
.tl-explain{border:1px solid #2a5260;background:#0c2229;border-radius:12px;padding:14px 16px;margin:0 0 14px;font-size:.92rem;line-height:1.6}
.tl-explain strong{font-size:1rem;color:#bff7ee}.tl-explain ol{margin:.4rem 0 .5rem;padding-left:1.2rem}.tl-explain p{margin:.3rem 0 .5rem;color:#c3d7e1}
.tl-examples{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px}
.tl-examples li{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid #1f3a4c;border-radius:9px;padding:.45rem .65rem;background:#091a24;font-size:.84rem}
.tl-examples li b{font-family:ui-monospace,Consolas,monospace;font-size:.78rem;color:#9fc4d6;white-space:nowrap}
.tl-examples li.is-alert{border-color:#6e5a2c}.tl-examples li.is-alert b{color:#ffd78a}
.tl-ex-sum{color:#8ea7b9;font-size:.78rem}
.tl-wgroup{display:flex;flex-direction:column;gap:5px}
.tl-wlabel{font-size:.78rem;color:#9fb8c8;font-weight:700}
.tl-cap{margin:2px 0 0;font-size:.8rem;line-height:1.45;color:#9fb8c8}
.tl-cap[data-kind="alone"]{color:#ffd78a}.tl-cap[data-kind="combo"]{color:#9ff0e6}.tl-cap[data-kind="off"]{color:#7d8fa0}
.tl-profiles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 14px}
.tl-profile{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;align-items:center;text-align:left;border:1px solid #24435a;background:#0b1a26;color:#cfe3ef;border-radius:12px;padding:.6rem .75rem}
.tl-profile b{display:block;font-size:.95rem}.tl-profile small{display:block;font-size:.74rem;color:#8ea7b9;line-height:1.35}
.tl-profile .ol-chip{grid-column:1/-1;justify-self:start}
.tl-profile-icon{font-size:1.4rem;grid-row:span 1}
.tl-profile.is-on{border-color:#5ff0dc;background:#11303a;box-shadow:0 0 0 3px #5ff0dc1f}
@media (max-width:1200px){.tl-profiles{grid-template-columns:1fr}}

</style>
</head>
<body class="page-train">
<header class="site-header">
  <a class="brand" href="/" aria-label="Operation Lockdown home"><span class="brand-mark"><img src="/assets/img/shield-mark.svg" width="42" height="42" alt=""></span><span class="brand-text"><strong>OPERATION <span>LOCKDOWN</span></strong><small>T-LEVEL EXPERIENCE <b class="brand-version">/ 2.0</b></small></span></a>
  <nav aria-label="Main navigation"><a href="/">Mission hub</a><a href="/leaderboard/">Live scores</a><a href="/facilitator/">Staff control</a><span class="connection-indicator" data-connection-status="checking" role="status">Checking API</span></nav>
</header>
<main class="system train-shell tl-shell">
  <div class="topline"><span><span class="topline-dot"></span> NORTHSTAR SYSTEMS / INCIDENT NS-2611 / ZONE 01</span><span>SECURITY ANALYTICS LAB · TRAIN IT</span></div>

  <section class="tl-hero" aria-labelledby="tl-title">
    <div>
      <p class="ol-kicker">ZONE 01 · AI SECURITY LAB</p>
      <h1 id="tl-title" class="tl-title">Rebuild the <span>login detector.</span></h1>
      <p class="tl-lead">Someone is trying to break into Northstar staff accounts. Last night the automated detector was switched off because it raised too many false alarms. Investigate the live login events, rebuild the rules and prove the detector is good enough to switch back on.</p>
      <p class="tl-honest"><span class="ol-sim-tag">HONEST LABEL</span> This is a transparent, rule-based risk-scoring system — the kind of logic that sits underneath many “AI” security tools. It is not a trained machine-learning model, and all data is fictional.</p>
    </div>
    <aside class="tl-feed" aria-label="Incident messages">
      <div class="tl-feed-head"><span class="tl-led"></span> SECURITY OPERATIONS · LIVE</div>
      <div class="tl-msg"><time>08:41</time><b>Priya Shah, Head of Security</b><p>Overnight we saw a spike in failed logins. The detector is off, so we're blind.</p></div>
      <div class="tl-msg"><time>08:44</time><b>Priya Shah</b><p>Analysts: tell me what's really happening. Engineers: build rules that catch it without locking out half the office again.</p></div>
      <div class="tl-msg tl-msg-alert"><time>08:46</time><b>SYSTEM</b><p>Detector status: <strong>DISABLED</strong> · 10 events awaiting triage</p></div>
    </aside>
  </section>

  <div id="tl-banner" class="ol-banner" role="status" aria-live="polite">Connecting to Mission Control…</div>

  <section class="ol-status-strip" aria-label="Group status">
    <div><small>GROUP</small><strong id="tl-group">—</strong><span id="tl-unit">Checking session</span></div>
    <div><small>YOUR ROLE</small><strong id="tl-station">—</strong><span id="tl-role">—</span></div>
    <div><small>OFFICIAL ZONE SCORE</small><strong id="tl-score" class="ol-official">0 / 100</strong><span>Server-validated sign-offs only</span></div>
    <div><small>RECOVERY KEY</small><strong id="tl-keytext">LOCKED</strong><span id="tl-progress">0 of 3 sign-offs passed</span></div>
  </section>

  <div id="tl-main">
  <div class="ol-tabs" role="tablist" aria-label="Train It stations">
    <button class="ol-tab" role="tab" data-tab="a" aria-selected="true"><span>01</span><span>Investigate<small>Workstation A · Analyst</small></span><span class="ol-you" data-for="A" hidden>YOU</span><b id="tl-tab-a">open</b></button>
    <button class="ol-tab" role="tab" data-tab="b" aria-selected="false"><span>02</span><span>Engineer<small>Workstation B · Detector</small></span><span class="ol-you" data-for="B" hidden>YOU</span><b id="tl-tab-b">open</b></button>
    <button class="ol-tab" role="tab" data-tab="joint" aria-selected="false"><span>03</span><span>Release review<small>Both workstations</small></span><b id="tl-tab-joint">open</b></button>
    <button class="ol-tab" role="tab" data-tab="bonus" aria-selected="false" hidden><span>+</span><span>New incidents<small>Optional · fast teams</small></span><b id="tl-tab-bonus">optional</b></button>
  </div>

  <!-- ===================== WORKSTATION A ===================== -->
  <section data-panel="a" role="tabpanel" aria-label="Workstation A: Security Data Analyst">
    <div class="ol-step"><span>STEP 1</span><strong>Investigate the logins</strong><small>Click each login in the table. Compare “This event” with “Normal for this user”, read the context, then choose Normal, Suspicious or Needs verification. When every event has a label, press “Request review” — and be ready: more events will arrive.</small></div>
    <div class="ol-panel tl-soc">
      <div class="tl-soc-head"><span class="ol-kicker">LOGIN ACTIVITY · LAST 24 HOURS · 10 FLAGGED EVENTS</span><span class="tl-legend"><i class="lg-n"></i>Normal <i class="lg-s"></i>Suspicious <i class="lg-r"></i>Needs verification <i class="lg-u"></i>Unclassified</span></div>
      <div id="tl-timeline"></div>
      <div class="tl-soc-grid">
        <div class="tl-table-wrap"><table class="tl-table tl-events-table"><caption class="sr-only">Login events</caption>
          <thead><tr><th>ID</th><th>Time</th><th>Account</th><th>Location</th><th>Signals</th><th>Your call</th></tr></thead><tbody id="tl-events"></tbody></table></div>
        <aside id="tl-inspector" class="tl-inspector" aria-live="polite"></aside>
      </div>
      <div class="tl-progressbar">
        <span>Opened <b id="tl-a-opened">0/10</b></span><span>Classified <b id="tl-a-classified">0/10</b></span><span>Reviews <b id="tl-a-reviews">0</b></span>
        <span id="tl-a-next" class="tl-dim"></span>
        <button id="tl-a-review" type="button" class="ol-btn ol-btn-primary" disabled>Request review from security lead</button>
      </div>
      <p id="tl-a-review-hint" class="ol-muted"></p>
    </div>
    <div class="ol-step"><span>STEP 2</span><strong>Review and reconsider</strong><small>Read the security lead’s feedback. A second wave of 6 trickier events arrives after your first review — go back to step 1, re-check anything flagged, classify the new events and ask for another review. Tick the signals that actually helped you.</small></div><div class="ol-two" style="margin-top:14px">
      <div class="ol-panel"><span class="ol-kicker">STEP 4–5 · REVIEW &amp; RECONSIDER</span><h3>Security lead's review</h3><div id="tl-a-feedback"><p class="ol-muted">Classify all ten events, then request a review. You'll be told which calls are risky — not the answers.</p></div><div id="tl-hints-a"></div></div>
      <div class="ol-panel"><span class="ol-kicker">SIGNAL NOTEBOOK</span><h3>Which signals actually helped?</h3><p class="ol-muted">Tick the signals that helped you decide. This goes into your handoff summary for the detection engineer.</p><div id="tl-signals" class="tl-signals"></div></div>
    </div>
    <div class="ol-step"><span>STEP 3</span><strong>Hand off to Workstation B</strong><small>Read your summary out loud to the detection engineer and give them your handoff code.</small></div>
    <div id="tl-findings"></div>
    <div class="ol-step"><span>STEP 4</span><strong>Sign off</strong><small>Answer Mission Control’s questions together. Once you pass, your answers are locked in.</small></div><div class="ol-checkpoint" id="tl-check-a"></div>
  </section>

  <!-- ===================== WORKSTATION B ===================== -->
  <section data-panel="b" role="tabpanel" aria-label="Workstation B: Detection Engineer" hidden>
    <div class="ol-step"><span>STEP 1</span><strong>Tune and test the detector</strong><small>Change one rule at a time, then press “Run evaluation”. Look at what was missed and what raised false alarms. Repeat until the requirements show two ticks. Then switch to the ☾ Night profile: the overnight crew is tiny, so it must have ZERO false alarms.</small></div>
    <div class="tl-eng">
      <div class="ol-panel tl-console">
        <div class="tl-console-head"><span class="ol-kicker">RULE CONSOLE · detector.rules</span><button type="button" id="tl-reset-rules" class="ol-btn ol-btn-quiet">Reset to last night's settings</button></div>
        
        <div id="tl-profiles" class="tl-profiles" role="group" aria-label="Which profile are you editing?"></div>
        <div id="tl-rules"></div>
        <div id="tl-hints-b"></div>
      </div>
      <div class="ol-panel tl-evalpanel">
        <div class="tl-console-head"><span class="ol-kicker">STEP 2–6 · EVALUATION BENCH</span>
          <label class="tl-inline"><input type="checkbox" id="tl-include-bonus"> include new incidents (bonus)</label></div>
        <div class="tl-runbar"><button id="tl-run" type="button" class="ol-btn ol-btn-primary">▶ Run evaluation</button><span id="tl-run-status" class="ol-muted">16 labelled historical logins · 7 attacks · 9 legitimate</span>
          <span id="tl-eval-stale" class="ol-chip warn" hidden>Rules changed — re-run to see the effect</span></div>
        <div id="tl-metrics"><p class="ol-muted">Run the evaluation to see how last night's rules perform.</p></div>
        <div class="tl-table-wrap tl-results-wrap"><table class="tl-table tl-small"><thead><tr><th>Case</th><th>Description</th><th>Signals scored</th><th>Score</th><th>Truth</th><th>Result</th></tr></thead><tbody id="tl-results"></tbody></table></div>
        <h3 style="margin-top:14px">Run history</h3>
        <table class="tl-table tl-small"><thead><tr><th>Run</th><th>Settings</th><th>Caught</th><th>False</th><th>Quality</th><th>Meets</th></tr></thead><tbody id="tl-history"></tbody></table>
      </div>
    </div>
    <div class="ol-step"><span>STEP 2</span><strong>Compare with the analyst</strong><small>Type in Workstation A’s code to see where your detector disagrees with them. Then read your release code to them.</small></div><div class="ol-two" style="margin-top:14px">
      <div class="ol-panel"><span class="ol-kicker">ANALYST CASES · FROM WORKSTATION A</span><h3>Does your detector agree with the analyst?</h3><div id="tl-analyst-entry"></div><div id="tl-analyst-cases"></div></div>
      <div class="ol-panel"><span class="ol-kicker">STEP 7 · RELEASE PROPOSAL</span><h3>Hand your detector to the analyst</h3><div id="tl-release"></div></div>
    </div>
    <div class="ol-step"><span>STEP 3</span><strong>Sign off</strong><small>Answer Mission Control’s questions. Once you pass, your answers are locked in.</small></div><div class="ol-checkpoint" id="tl-check-b"></div>
  </section>

  <!-- ===================== JOINT ===================== -->
  <section data-panel="joint" role="tabpanel" aria-label="Joint release review" hidden>
    <div class="ol-step"><span>STEP 1</span><strong>Swap codes</strong><small>Each computer types in the other’s code. Then look at the combined view together.</small></div>
    <div id="tl-joint-codes"></div>
    <div class="ol-panel" style="margin-top:14px"><span class="ol-kicker">COMBINED VIEW</span><h3>Detector decisions on today's live events</h3><div id="tl-joint-combined"></div></div>
    <div class="ol-step"><span>STEP 2</span><strong>Decide together</strong><small>Talk through every checklist point, then decide: release the detector or hold it. Your decision is final.</small></div><div class="ol-two" style="margin-top:14px">
      <div class="ol-panel"><span class="ol-kicker">RELEASE REVIEW CHECKLIST</span><h3>Talk it through</h3><div id="tl-checklist" class="tl-signals"></div></div>
      <div class="ol-panel"><span class="ol-kicker">RELEASE DECISION · SIMULATION</span><h3>Approve or hold?</h3><div id="tl-decision"></div></div>
    </div>
    <div class="ol-step"><span>STEP 3</span><strong>Final sign-off</strong><small>Agree every answer, send it, and collect your recovery key.</small></div><div class="ol-checkpoint" id="tl-check-joint"></div>
    <div class="ol-key" id="tl-key"><div class="ol-key-glyph" id="tl-key-glyph" aria-hidden="true">◇</div><div><small>RECOVERY KEY</small><strong>AI DEFENCE ACTIVATED</strong><small id="tl-key-sub">Unlocks when the server confirms A, B and joint sign-offs.</small></div></div>
  </section>

  <!-- ===================== BONUS ===================== -->
  <section data-panel="bonus" role="tabpanel" aria-label="Bonus: new incidents" hidden>
    <div class="ol-step"><span>STEP 1</span><strong>Two new incidents</strong><small>Read both incidents. Workstation B retunes the detector to catch the new attack without blocking the director.</small></div>
    <div id="tl-bonus-cases" class="ol-grid2"></div>
    <div class="ol-panel" style="margin-top:14px"><span class="ol-kicker">YOUR CHALLENGE</span><h3>Improve the detector — without disrupting legitimate staff</h3>
      <p>Your released rules probably miss the first incident, or flag the second. Add both to the test suite, retune and re-run. Requirement: catch at least 7 of 8 attacks with no more than 1 false alarm.</p>
      <p id="tl-bonus-role" class="ol-role-note"></p><div id="tl-bonus-status"></div>
      <button type="button" id="tl-bonus-open" class="ol-btn ol-btn-primary">Open the detector with the new incidents →</button>
    </div>
    <div class="ol-step"><span>STEP 2</span><strong>Bonus sign-off</strong><small>Explain the trade-off you just faced.</small></div><div class="ol-checkpoint" id="tl-check-bonus"></div>
  </section>
  </div>

  <p class="tl-footnote"><span class="ol-sim-tag">THIS COMPUTER ONLY</span> Classifications, rules and runs are saved in this browser tab so a refresh doesn't lose your work. Only Mission Control sign-offs change your group's official score. <button type="button" id="tl-reset-sim" class="ol-btn ol-btn-quiet">Staff: reset this computer</button></p>
  <footer class="site-footer"><span>OPERATION LOCKDOWN 2.0</span><span>TRAIN IT · SECURITY ANALYTICS LAB</span><span>RETURN TO <a href="/">MISSION HUB</a></span></footer>
</main>
<script src="/assets/js/ui.js" defer></script>
<script type="module" src="/assets/js/train.js"></script>
<script type="module" src="/assets/js/live-attack.js"></script>
</body>
</html>
