<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#08131f">
<meta name="description" content="Operation Lockdown 2.0 — an interactive T-Level computing experience">
<title>Mission Hub | Operation Lockdown 2.0</title>
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/app.css">
<link rel="stylesheet" href="/assets/css/system.css">
<link rel="stylesheet" href="/assets/css/polish.css">
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

/* ===== Mission hub (scoped .hb-*) ===== */
.hb-shell{max-width:1340px}
.hb-hero{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(320px,.85fr);gap:28px;align-items:stretch;margin-bottom:26px}
.hb-title{font-size:clamp(2.4rem,5vw,4.6rem);line-height:1.02;letter-spacing:-.055em;margin:.4rem 0 1rem;font-weight:850}.hb-title span{color:#ff9a86}
.hb-lead{color:#b4c8d7;line-height:1.75;max-width:690px;font-size:1.02rem}
.hb-roles{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.hb-roles span{border:1px solid #2a5260;background:#0f2632;border-radius:9px;padding:.45rem .7rem;font-size:.82rem;color:#c4e6e3}.hb-roles b{color:#74eadc;margin-right:4px}
.hb-feed{border:1px solid #4a2f38;border-radius:16px;background:linear-gradient(160deg,#1c1219,#0a1724);padding:14px;display:flex;flex-direction:column;gap:7px}
.hb-feed-head{font-family:ui-monospace,Consolas,monospace;font-size:.66rem;letter-spacing:.16em;color:#ffb3a6;font-weight:800}
.hb-led{display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff6d7d;margin-right:6px;animation:hb-blink 1.6s infinite}@keyframes hb-blink{50%{opacity:.3}}
.hb-msg{border-left:2px solid #3a6070;padding:.45rem .7rem;background:#0f1d2a;border-radius:0 8px 8px 0;font-size:.86rem;color:#d3e2ea;animation:hb-in .5s both}
.hb-msg:nth-child(3){animation-delay:.2s}.hb-msg:nth-child(4){animation-delay:.4s}.hb-msg:nth-child(5){animation-delay:.6s}
@keyframes hb-in{from{opacity:0;transform:translateY(6px)}}
.hb-msg.bad{border-color:#e0606f}.hb-msg.warn{border-color:#e2b552}.hb-msg time{font-family:ui-monospace,Consolas,monospace;color:#7f97a9;font-size:.72rem;margin-right:8px}
.hb-layout{display:grid;grid-template-columns:minmax(340px,.8fr) minmax(0,1.4fr);gap:20px;align-items:start}
.hb-h2{font-size:1.4rem;margin:.2rem 0 14px;letter-spacing:-.02em}
.hb-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.hb-card{position:relative;display:flex;flex-direction:column;gap:6px;text-decoration:none;color:#e8f6ff;border:1px solid #24405a;border-radius:18px;padding:16px;background:linear-gradient(165deg,#112538,#0a1622);transition:transform .15s,border-color .15s,box-shadow .15s;min-height:280px}
.hb-card:hover,.hb-card:focus-visible{transform:translateY(-3px);border-color:var(--c);box-shadow:0 14px 40px #0006,0 0 0 1px var(--c)}
.hb-train{--c:#5ff0dc}.hb-fix{--c:#a996ff}.hb-defend{--c:#ffb083}
.hb-card-n{font-family:ui-monospace,Consolas,monospace;font-size:.6rem;letter-spacing:.14em;color:var(--c)}
.hb-card-icon{font-size:1.6rem;color:var(--c);font-family:ui-monospace,Consolas,monospace;font-weight:800}
.hb-card strong{font-size:1.55rem;letter-spacing:-.03em}.hb-card-sub{color:#9fb8c8;font-size:.82rem;font-weight:700}
.hb-card p{color:#c1d3de;font-size:.88rem;line-height:1.5;margin:.2rem 0;flex:1}
.hb-card-roles{font-size:.74rem;color:#8ea7b9}
.hb-card-state{font-size:.76rem;font-weight:800;border-radius:8px;padding:.4rem .6rem;background:#132536;color:#a9c3d3;border:1px solid #24405a}
.hb-card-state.progress{color:#ffe0a2;border-color:#6a5728;background:#2a2414}
.hb-card-state.done{color:#062a20;background:var(--c);border-color:var(--c)}
.hb-finale{display:flex;align-items:center;gap:14px;margin-top:12px;border:1px dashed #3a5568;border-radius:16px;padding:14px 18px;text-decoration:none;color:#e8f6ff;background:#0b1724;transition:border-color .15s}
.hb-finale:hover{border-color:#8fd4ff}.hb-finale strong{display:block;margin:.15rem 0}.hb-finale small{color:#93abbe}
.hb-finale-icon{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:#1a2838;color:#7a95aa;font-size:1.3rem;flex:none}
.hb-finale-go{margin-left:auto;font-weight:800;color:#8fd4ff}
.hb-finale.is-ready{border-style:solid;border-color:#8fd4ff;background:linear-gradient(135deg,#0f2a3c,#0b1724);box-shadow:0 0 30px #3f9fe022}
.hb-finale.is-ready .hb-finale-icon{background:#8fd4ff;color:#06202e;animation:ol-pop .5s}
.hb-finale.is-done{border-style:solid;border-color:#43d6a6}.hb-finale.is-done .hb-finale-icon{background:#5ff0c4;color:#04241c}
.hb-keys{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.hb-key{display:flex;align-items:center;gap:7px;font-size:.78rem;font-weight:800;border:1px dashed #3a5568;border-radius:99px;padding:.35rem .75rem;color:#8ea7b9}
.hb-key.on{border-style:solid;border-color:#43d6a6;color:#a6f3d2;background:#0f2a22}
.hb-diag{margin-top:28px}.hb-diag summary{cursor:pointer;color:#8ea7b9;font-size:.85rem;font-weight:700;margin-bottom:10px}
@media (max-width:1100px){.hb-hero,.hb-layout{grid-template-columns:1fr}.hb-cards{grid-template-columns:1fr}.hb-card{min-height:0}}
.hb-card-state{flex:none;line-height:1.35}
.hb-title{font-size:clamp(2.3rem,4.2vw,3.9rem)}
.hb-feed{align-self:start}
.hb-layout{grid-template-columns:minmax(380px,.85fr) minmax(0,1.4fr)}
.hb-missions .section-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
.hb-missions .section-tag{font-family:ui-monospace,Consolas,monospace;font-size:.68rem;letter-spacing:.16em;color:#6fd9cf;font-weight:800}
.hb-missions .panel-step{font-family:ui-monospace,Consolas,monospace;font-size:.62rem;letter-spacing:.12em;color:#7f9cb1}
#teamCard .stat .muted.small{font-size:.66rem;letter-spacing:.08em}

</style>
</head>
<body class="page-hub">
<header class="site-header"><a class="brand" href="/" aria-label="Operation Lockdown — home"><span class="brand-mark"><img src="/assets/img/shield-mark.svg" alt="" width="42" height="42"></span><span class="brand-text"><strong>OPERATION <span>LOCKDOWN</span></strong><small>T-LEVEL EXPERIENCE <b class="brand-version">/ 2.0</b></small></span></a><nav aria-label="Main navigation"><a href="/" aria-current="page">Mission hub</a><a href="/leaderboard/">Live scores</a><a href="/facilitator/">Staff control</a><span class="connection-indicator" data-connection-status="checking" data-status="checking" role="status">Checking API</span></nav></header>
<main class="system hb-shell">
<div class="topline"><span><span class="topline-dot"></span> NORTHSTAR SYSTEMS / INCIDENT NS-2611 / ACTIVE</span><span>EMERGENCY TECHNOLOGY RESPONSE · MISSION HUB</span></div>

<section class="hb-hero">
  <div>
    <p class="ol-kicker">T-LEVEL TASTER DAY · OPERATION LOCKDOWN 2.0</p>
    <h1 class="hb-title">Northstar is <span>under attack.</span><br>You're the response team.</h1>
    <p class="hb-lead">Northstar Systems — a fictional logistics company — is having the worst morning in its history. Someone is breaking into staff accounts, last night's portal update is leaking private data, and a crash outside HQ has knocked out the power. Your group has been called in to investigate, repair and defend — then restore everything.</p>
    <div class="hb-roles"><span><b>A</b> investigates &amp; discovers</span><span><b>B</b> builds, tests &amp; responds</span><span><b>A + B</b> decide together</span></div>
  </div>
  <aside class="hb-feed" aria-label="Incident feed">
    <div class="hb-feed-head"><span class="hb-led"></span> INCIDENT FEED · NS-2611</div>
    <div class="hb-msg bad"><time>08:31</time>Vehicle collision outside HQ. Main power lost — building on battery.</div>
    <div class="hb-msg warn"><time>08:41</time>Spike in failed logins overnight. Login detector is switched off.</div>
    <div class="hb-msg warn"><time>08:39</time>Helpdesk: “I could see someone's home address on the portal??”</div>
    <div class="hb-msg"><time>08:47</time>Emergency response team requested. <b>That's you.</b></div>
  </aside>
</section>

<div class="hb-layout">
<section class="system-card login-panel" id="loginCard"><div class="section-head"><span class="section-tag">01 / JOIN THE RESPONSE TEAM</span><span class="panel-step">SECURE ACCESS</span></div><h2>Sign in this computer.</h2><p class="card-intro">Both computers in a working unit choose the same group and unit. One is Workstation A, the other Workstation B.</p>
<form id="loginForm"><div class="field-grid"><div><label for="group">Rotation group</label><select id="group" required><option value="alpha">Group Alpha</option><option value="bravo">Group Bravo</option><option value="charlie">Group Charlie</option></select></div><div><label for="unit">Working unit</label><select id="unit" required><option value="1">Unit 1</option><option value="2">Unit 2</option><option value="3">Unit 3</option></select></div></div>
<label for="workstation">Workstation role</label><select id="workstation" required><option value="A">Workstation A — investigate &amp; discover</option><option value="B">Workstation B — build, test &amp; respond</option></select>
<label for="pin">Group access code</label><div class="secret-field"><input id="pin" type="password" autocomplete="off" minlength="8" maxlength="16" required placeholder="Code from your facilitator"><button id="togglePin" type="button" class="secret-toggle" aria-label="Show access code">Show</button></div>
<div class="actions"><button type="submit" id="loginSubmit" class="action grow">Join the response team <span class="btn-arrow" aria-hidden="true">↗</span></button></div></form><p id="loginMessage" class="message" aria-live="polite" role="status"></p><p class="note login-note">If sign-in fails, the reason appears above. Check the group, access code and workstation.</p></section>

<section class="system-card team-panel hidden" id="teamCard"><div class="section-head"><span class="section-tag">01 / RESPONSE TEAM CONNECTED</span><span class="pill good">SESSION CONNECTED</span></div><div class="row"><h2 id="welcome">Group dashboard</h2><button id="logout" type="button" class="action small secondary">Switch group</button></div><p class="muted" id="unitLabel"></p>
<div class="grid3"><div class="stat"><div class="muted small">OFFICIAL GROUP SCORE</div><div id="totalScore" class="stat-number">0</div><div class="tiny muted">OUT OF 300 · SERVER-VALIDATED</div></div><div class="stat"><div class="muted small">RECOVERY KEYS</div><div id="keysCount" class="stat-number">0 / 3</div><div class="tiny muted">COLLECTED</div></div><div class="stat"><div class="muted small">FINAL MISSION</div><div id="finaleStatus" class="pill warn" style="margin-top:16px">Locked</div></div></div>
<div id="hb-keys" class="hb-keys" aria-label="Recovery keys"></div>
<div id="zoneProgress" style="margin-top:10px"></div><p id="teamMessage" class="message" role="status" aria-live="polite"></p></section>

<section class="hb-missions" id="zonesCard" aria-labelledby="hb-missions-title">
  <div class="section-head"><span class="section-tag">02 / CHOOSE YOUR MISSION</span><span class="panel-step">ANY ORDER · YOUR FACILITATOR WILL DIRECT YOU</span></div>
  <h2 id="hb-missions-title" class="hb-h2">Three crises. Three recovery keys.</h2>
  <div class="hb-cards">
    <a class="hb-card hb-train" href="/train/" data-zone="train"><span class="hb-card-n">ZONE 01 · ARTIFICIAL INTELLIGENCE</span><span class="hb-card-icon" aria-hidden="true">◎</span><strong>Train It</strong><span class="hb-card-sub">Security Analytics Lab</span><p>Investigate suspicious logins and rebuild the detector without locking out innocent staff.</p><span class="hb-card-roles">A · Analyst &nbsp;/&nbsp; B · Detection engineer</span><span class="hb-card-state" data-state="train">Key: AI Defence Activated</span></a>
    <a class="hb-card hb-fix" href="/fix/" data-zone="fix"><span class="hb-card-n">ZONE 02 · SOFTWARE</span><span class="hb-card-icon" aria-hidden="true">{ }</span><strong>Fix It</strong><span class="hb-card-sub">Employee Portal Recovery</span><p>Break the staff portal on purpose, report the bugs, patch the code and prove it with tests.</p><span class="hb-card-roles">A · Tester &nbsp;/&nbsp; B · Developer</span><span class="hb-card-state" data-state="fix">Key: Portal Secured</span></a>
    <a class="hb-card hb-defend" href="/defend/" data-zone="defend"><span class="hb-card-n">ZONE 03 · CYBER DEFENCE</span><span class="hb-card-icon" aria-hidden="true">⬡</span><strong>Defend It</strong><span class="hb-card-sub">Office Under Pressure</span><p>Investigate the town, run the office on battery power and stop an intruder who's using the chaos.</p><span class="hb-card-roles">A · Intelligence &nbsp;/&nbsp; B · Incident response</span><span class="hb-card-state" data-state="defend">Key: Threat Contained</span></a>
  </div>
  <a class="hb-finale" href="/finale/" id="hb-finale"><span class="hb-finale-icon" aria-hidden="true">⏻</span><span><span class="ol-kicker">FINAL RECOVERY MISSION</span><strong id="hb-finale-title">Locked until all three keys are recovered</strong><small id="hb-finale-sub">Your group's keys unlock the restoration console.</small></span><span class="hb-finale-go">Open →</span></a>
  <div class="actions zone-actions"><a class="action secondary" href="/leaderboard/">Live team scores ↗</a></div>
</section>
</div>

<details class="hb-diag">
<summary>Technician tools · connection check</summary>
<section class="system-card diagnostic-panel" id="diagnosticPanel"><div class="diagnostic-header"><div><span class="section-tag">SYSTEM DIAGNOSTICS</span><h2>Connection check</h2><p class="card-intro">Checks that PHP responds and the leaderboard can read the database. No scores are changed.</p></div><button class="action secondary" id="runDiagnostics" type="button">Run checks ↗</button></div>
<div class="diagnostic-grid"><div><span class="diagnostic-label">APPLICATION API</span><strong id="apiTestStatus" class="diagnostic-value pending">Not checked</strong></div><div><span class="diagnostic-label">DATABASE / LEADERBOARD</span><strong id="dbTestStatus" class="diagnostic-value pending">Not checked</strong></div><div><span class="diagnostic-label">BROWSER SESSION</span><strong id="sessionTestStatus" class="diagnostic-value pending">Not checked</strong></div></div><p id="diagnosticMessage" role="status" aria-live="polite" class="message"></p><div class="diagnostic-foot"><span id="diagnosticTime">Last checked: never</span></div></section>
</details>
<footer class="site-footer"><span>OPERATION LOCKDOWN 2.0</span><span>TRAIN IT / FIX IT / DEFEND IT</span><span>ALL COMPANIES, PEOPLE AND DATA ARE FICTIONAL</span></footer>
</main><script src="/assets/js/ui.js" defer></script><script type="module" src="/assets/js/hub.js"></script><script type="module" src="/assets/js/diagnostics.js"></script><script type="module" src="/assets/js/live-attack.js"></script>
</body></html>
