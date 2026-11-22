<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#08131f">
<meta name="description" content="Operation Lockdown 2.0 — interactive software testing and secure-coding workspace">
<title>Fix It — Employee Portal Recovery | Operation Lockdown 2.0</title>
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/app.css">
<link rel="stylesheet" href="/assets/css/system.css">
<link rel="stylesheet" href="/assets/css/polish.css">
<link rel="stylesheet" href="/assets/css/fix-it.css">
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

/* ===== Fix It · development & QA workspace (scoped .fx-*, .nh-* = fictional portal) ===== */
.fx-shell{--zone:#a996ff;max-width:1450px}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.tl-lead{color:#b4c8d7;line-height:1.7;max-width:680px;margin:0 0 .8rem}.tl-honest{font-size:.82rem;color:#9fb6c6;max-width:680px;line-height:1.55}
.tl-mono{font-family:ui-monospace,Consolas,monospace;font-size:.8rem;white-space:nowrap}
.tl-table{width:100%;border-collapse:collapse;font-size:.84rem}.tl-table th{text-align:left;font-family:ui-monospace,Consolas,monospace;font-size:.64rem;letter-spacing:.12em;color:#7f9cb1;padding:.5rem .55rem;border-bottom:1px solid #1d3547}.tl-table td{padding:.4rem .55rem;border-bottom:1px solid #15293a}
.tl-review{border-radius:10px;padding:.7rem .9rem;margin:10px 0;font-size:.88rem}.tl-review p{margin:.3rem 0 0}
.tl-review.good{background:#0f2a22;border:1px solid #2c6e57;color:#b5f5da}.tl-review.warn{background:#2a2313;border:1px solid #6e5a2c;color:#ffe3ac}
.tl-classify{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
.tl-runbar{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:0 0 12px}
.tl-footnote{margin-top:26px;font-size:.8rem;color:#8ea7b9;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.fx-hero{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(300px,.85fr);gap:24px;margin-bottom:18px}
.fx-title{font-size:clamp(2.2rem,4.6vw,4.2rem);line-height:1.02;letter-spacing:-.05em;margin:.3rem 0 .8rem;font-weight:850}.fx-title span{color:#b9a8ff}
.fx-ticketfeed{border:1px solid #3a3565;border-radius:16px;background:#100f24;padding:12px;font-size:.84rem}
.fx-tf-head{font-family:ui-monospace,Consolas,monospace;font-size:.7rem;color:#b5a7ff;margin-bottom:8px;font-weight:800}
.fx-tf{padding:.45rem .6rem;border-radius:8px;background:#17162f;margin-bottom:6px}.fx-tf b{color:#d7cfff;font-size:.8rem}.fx-tf time{float:right;color:#7d78a8;font-family:ui-monospace,Consolas,monospace;font-size:.72rem}.fx-tf p{margin:.2rem 0 0;color:#cfd2e8}
/* Browser frame + light-themed fictional portal */
.fx-testbed{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.8fr);gap:14px;align-items:start}
.fx-browser{border-radius:14px;overflow:hidden;border:1px solid #3a4a5e;background:#e9edf2;box-shadow:0 18px 50px #0006}
.fx-browser.is-staging{border-color:#b49cff;box-shadow:0 0 0 2px #8f74ff66,0 18px 50px #0006}
.fx-bar{display:flex;align-items:center;gap:6px;background:#d5dbe3;padding:8px 10px}
.fx-dots i{display:inline-block;width:10px;height:10px;border-radius:50%;background:#e5655d;margin-right:4px}.fx-dots i:nth-child(2){background:#e7b63f}.fx-dots i:nth-child(3){background:#5cbf5c}
.fx-host{font-family:ui-monospace,Consolas,monospace;font-size:.8rem;color:#4a5868;background:#fff;padding:.35rem .1rem .35rem .6rem;border-radius:7px 0 0 7px}
.fx-url{flex:1;min-width:80px;font-family:ui-monospace,Consolas,monospace;font-size:.8rem;border:0;background:#fff;color:#1a2532;padding:.35rem .5rem;border-radius:0 7px 7px 0;margin-left:-6px}
.fx-gobtn{border:0;background:#3c5ad6;color:#fff;border-radius:7px;padding:.35rem .8rem;font-weight:700;font-size:.8rem}
.fx-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:8px 10px;background:#1b2233;color:#cfd8e6;font-size:.78rem}
.fx-tool-label{font-family:ui-monospace,Consolas,monospace;font-size:.62rem;letter-spacing:.12em;color:#8b98b5}
.fx-user{border:1px solid #3a4763;background:#232c42;color:#d6def0;border-radius:7px;padding:.3rem .6rem;font-size:.78rem;font-weight:700;margin-right:4px}
.fx-user[aria-pressed="true"]{background:#5b46d6;border-color:#9b87ff;color:#fff}
.fx-outage{display:flex;gap:5px;align-items:center;margin-left:auto}
.fx-build{font-family:ui-monospace,Consolas,monospace;font-size:.62rem;letter-spacing:.08em;background:#30260f;color:#ffd780;border-radius:6px;padding:3px 7px}
.is-staging .fx-build{background:#2a2058;color:#d8ccff}
.fx-page{background:#f6f7f9;color:#1d2733;min-height:360px;font-size:.92rem}
.nh-head{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;background:#fff;border-bottom:1px solid #dfe4ea}
.nh-logo{display:flex;align-items:center;gap:8px;color:#1d2733}.nh-logo b{display:grid;place-items:center;width:28px;height:28px;border-radius:7px;background:#1f4fd1;color:#fff}
.nh-who{font-size:.78rem;color:#5c6b7b}
.nh-nav{display:flex;gap:2px;padding:0 14px;background:#fff;border-bottom:1px solid #dfe4ea}
.nh-nav a{color:#41506a;text-decoration:none;padding:.6rem .7rem;font-size:.84rem;border-bottom:2px solid transparent}.nh-nav a.on,.nh-nav a:hover{color:#1f4fd1;border-color:#1f4fd1}
.nh-body{padding:16px 20px 22px}.nh-body h2{margin:.2rem 0 .6rem;font-size:1.3rem;color:#152033}
.nh-muted{color:#66748a}.nh-small{font-size:.8rem}
.nh-notice{background:#fff7e0;border:1px solid #f0d58a;border-radius:8px;padding:.6rem .8rem;color:#5d4810;margin:.4rem 0 .8rem}
.nh-list{list-style:none;padding:0;margin:0;display:grid;gap:6px}.nh-list li{background:#fff;border:1px solid #e1e6ec;border-radius:8px;padding:.6rem .8rem;display:flex;justify-content:space-between;gap:10px}
.nh-list a{color:#1f4fd1;font-weight:700}.nh-list span{color:#66748a;font-size:.84rem}
.nh-private{background:#fff0f1;border:1px solid #f2b8bf;border-radius:10px;padding:.7rem 1rem;margin-top:10px}.nh-private h3{margin:0 0 .4rem;font-size:.95rem;color:#8a1f2d}
.nh-private dl{display:grid;grid-template-columns:150px 1fr;gap:4px 12px;margin:0;font-size:.86rem}.nh-private dt{color:#7a4a50;font-weight:700}.nh-private dd{margin:0}
.nh-locked{background:#eef2f7;border:1px dashed #b9c4d2;border-radius:10px;padding:.7rem 1rem;color:#4d5d72}
.nh-label{display:block;font-weight:700;font-size:.84rem;margin:.6rem 0 .3rem}
.nh-row{display:flex;gap:8px;flex-wrap:wrap}.nh-row input{flex:1;min-width:150px;border:1px solid #c3ccd8;border-radius:7px;padding:.5rem .6rem;background:#fff;color:#152033}
.nh-btn{border:0;background:#1f4fd1;color:#fff;border-radius:7px;padding:.5rem 1rem;font-weight:700}
.nh-ok{color:#14683f;background:#e6f6ec;border-radius:7px;padding:.5rem .7rem}.nh-warn{color:#7a4b00;background:#fff4dc;border-radius:7px;padding:.5rem .7rem}
.nh-trace{background:#22141a;color:#ffb3bf;border-radius:8px;padding:.7rem .8rem;font-size:.76rem;white-space:pre-wrap;overflow:auto;border-left:4px solid #e0485e}
.fx-side h3{font-size:.95rem;margin:.6rem 0 .4rem}
.fx-steps{margin:0;padding-left:1.1rem;font-size:.8rem;color:#c3d4df;line-height:1.5}
/* Bug report form */
.fx-form{display:flex;flex-direction:column;gap:9px}.fx-form label{display:flex;flex-direction:column;gap:4px;font-size:.8rem;font-weight:700;color:#bccfdc}
.fx-form input,.fx-form select{background:#071521;border:1px solid #2c4a5e;border-radius:8px;color:#e8f6ff;padding:.5rem .6rem;font-weight:500;font-size:.86rem;max-width:100%}
.fx-row2{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}.fx-row2>label{flex:1;min-width:160px}
.fx-roles{border:1px solid #23405a;border-radius:9px;padding:.4rem .7rem;display:flex;gap:14px;flex-wrap:wrap}.fx-roles legend{font-size:.8rem;font-weight:700;color:#bccfdc}
.fx-roles label{flex-direction:row;align-items:center;font-weight:600}
.fx-ticket{border:1px solid #2a4357;border-radius:11px;padding:.6rem .8rem;margin:0 0 8px;background:#0c1a27;display:flex;flex-direction:column;gap:3px;font-size:.84rem;text-align:left;color:#dbe8f0}
.fx-ticket.accepted{border-left:3px solid #4fe0a8}.fx-ticket.needs-info{border-left:3px solid #f2c56b}
.fx-ticket-head{display:flex;gap:6px;align-items:center}.fx-ticket small{color:#8fa8ba}.fx-ticket ul{margin:.3rem 0 0;padding-left:1.1rem;color:#ffe2a8}.fx-ok{color:#a6f3d2;margin:.2rem 0 0}
.fx-ticket-btn{width:100%;cursor:pointer}.fx-ticket-btn:hover{border-color:#a996ff}
/* IDE */
.fx-ide{display:grid;grid-template-columns:260px minmax(0,1fr);border:1px solid #2c2a50;border-radius:14px;overflow:hidden;background:#0d0c1d}
.fx-files{background:#121129;padding:12px;border-right:1px solid #2c2a50;font-size:.84rem}
.fx-tree{display:flex;flex-direction:column;gap:2px;margin-top:6px}.fx-dir{color:#8d86c2;font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
.fx-tree button{text-align:left;background:transparent;border:0;color:#c9c4f0;font-family:ui-monospace,Consolas,monospace;font-size:.8rem;padding:.35rem .5rem .35rem 1.1rem;border-radius:6px}
.fx-tree button[aria-pressed="true"]{background:#2b275a;color:#fff}.fx-tree button:hover{background:#211f45}
.fx-editor{min-width:0}.fx-editor-tab{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 12px;background:#17153a;font-family:ui-monospace,Consolas,monospace;font-size:.8rem;color:#e3deff;flex-wrap:wrap}
.fx-code{padding:10px 0;font-family:ui-monospace,Consolas,monospace;font-size:.84rem;overflow:auto}
.fx-line{display:flex;align-items:center;min-height:1.75em}.fx-ln{width:42px;text-align:right;padding-right:12px;color:#5d5890;flex:none;user-select:none}
.fx-line code{white-space:pre;color:#d9d6f5}
.fx-patchline{background:#2a2050;box-shadow:inset 3px 0 #a996ff}.fx-hot{background:#3a1f2a;box-shadow:inset 3px 0 #ff7f8f}
.fx-patch{font-family:ui-monospace,Consolas,monospace;font-size:.82rem;background:#110f27;color:#fff;border:1px solid #6a5bd6;border-radius:6px;padding:.25rem .4rem;max-width:min(720px,70vw)}
.fx-diffbox{border-top:1px solid #2c2a50;padding:10px 12px;background:#0f0e22}
.fx-diffitem{margin:6px 0}.fx-diffitem small{display:block;color:#8d86c2;font-size:.72rem}.fx-diffitem code{display:block;font-size:.78rem;white-space:pre-wrap;padding:2px 6px;border-radius:4px}
.fx-minus{background:#3a1820;color:#ffb3bf}.fx-plus{background:#14302a;color:#a6f3d2}
.fx-runner{background:linear-gradient(160deg,#120f27,#0b1826)}
.fx-results{display:flex;flex-direction:column;gap:4px;max-height:440px;overflow:auto}
.fx-tgroup{font-family:ui-monospace,Consolas,monospace;font-size:.64rem;letter-spacing:.14em;color:#a996ff;margin:8px 0 2px}
.fx-test{display:flex;gap:10px;align-items:flex-start;font-size:.84rem;padding:.4rem .6rem;border-radius:8px;background:#0e1b28;animation:fx-in .2s both}
.fx-test b{font-family:ui-monospace,Consolas,monospace;font-size:.72rem;border-radius:5px;padding:2px 6px;flex:none}
.fx-test.pass b{background:#15402f;color:#a6f3d2}.fx-test.fail b{background:#4a1a26;color:#ffb8c2}.fx-test.fail{background:#1f1219}
.fx-test small{display:block;color:#ffcf9a;margin-top:2px}.fx-test.extra{opacity:.85}
@keyframes fx-in{from{opacity:0;transform:translateX(-6px)}}
.fx-retest{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:4px;font-size:.82rem}
.fx-retest li{display:flex;gap:8px;padding:.35rem .5rem;border-radius:7px;background:#0d1b28}.fx-retest b{font-family:ui-monospace,Consolas,monospace;font-size:.7rem;width:36px}
.fx-retest li.pass b{color:#8ff2c9}.fx-retest li.fail b{color:#ff98a6}.fx-retest li.fail{background:#24121a}
.fx-incident{border:1px solid #6e2f3c;border-radius:16px;padding:16px;background:linear-gradient(160deg,#26121b,#0d1720)}.fx-incident p{line-height:1.55;color:#e1d6da}
@media (max-width:1100px){.fx-hero,.fx-testbed,.fx-ide{grid-template-columns:1fr}}
.fx-browser input[type=text],.fx-browser input[type=password],.fx-browser input:not([type]){background:#fff!important;color:#152033!important;border:1px solid #c3ccd8!important;border-radius:7px;padding:.45rem .6rem!important;margin:0!important;height:auto!important;box-shadow:none!important;font-size:.86rem}
.fx-browser .fx-url{border:0!important;border-radius:0 7px 7px 0}
.fx-page label,.fx-page .nh-label{color:#2a3a4e!important;font-weight:700}
.fx-toolbar label{color:#cfd8e6!important;margin:0}

</style>
</head>
<body class="fix-page">
<header class="site-header">
  <a class="brand" href="/" aria-label="Operation Lockdown mission hub"><span class="brand-mark"><img src="/assets/img/shield-mark.svg" alt="" width="42" height="42"></span><span class="brand-text"><strong>OPERATION <span>LOCKDOWN</span></strong><small>T-LEVEL EXPERIENCE <b class="brand-version">/ 2.0</b></small></span></a>
  <nav aria-label="Main navigation"><a href="/">Mission hub</a><a href="/leaderboard/">Live scores</a><span class="connection-indicator" data-connection-status="checking" role="status">Checking API</span></nav>
</header>
<main class="system fx-shell">
  <div class="topline"><span><span class="topline-dot"></span> NORTHSTAR SYSTEMS / INCIDENT NS-2611 / ZONE 02</span><span>DEVELOPMENT &amp; QA WORKSPACE · FIX IT</span></div>

  <section class="fx-hero" aria-labelledby="fx-title">
    <div>
      <p class="ol-kicker">ZONE 02 · EMPLOYEE PORTAL RECOVERY</p>
      <h1 id="fx-title" class="fx-title">Break it. Report it. <span>Fix it.</span></h1>
      <p class="tl-lead">Last night an emergency release added HR records to the Northstar Hub staff portal. Since then, staff have been reporting “weird things”. Nobody knows exactly what's broken. Find out, prove it, repair it, and retest before the portal goes back online.</p>
      <p class="tl-honest"><span class="ol-sim-tag">SAFE SIMULATION</span> The portal is a model running in your browser. Nothing is really hacked, and every person and record is fictional.</p>
    </div>
    <aside class="fx-ticketfeed" aria-label="Incoming messages">
      <div class="fx-tf-head">#engineering · 3 unread</div>
      <div class="fx-tf"><b>Marcus Bell</b><time>08:32</time><p>Portal v2.4.0 shipped at 23:10 last night without the usual review. Sorry all.</p></div>
      <div class="fx-tf"><b>helpdesk-bot</b><time>08:39</time><p>Ticket: “I could see someone's home address??” — anonymous</p></div>
      <div class="fx-tf"><b>Marcus Bell</b><time>08:45</time><p>Testers: reproduce everything and file proper bug reports. Developers: no blind fixes — tests first.</p></div>
    </aside>
  </section>

  <div id="fx-banner" class="ol-banner" role="status" aria-live="polite">Connecting to Mission Control…</div>
  <section class="ol-status-strip" aria-label="Group status">
    <div><small>GROUP</small><strong id="fx-group">—</strong><span id="fx-unit">Checking session</span></div>
    <div><small>YOUR ROLE</small><strong id="fx-station">—</strong><span id="fx-role">—</span></div>
    <div><small>OFFICIAL ZONE SCORE</small><strong id="fx-score" class="ol-official">0 / 100</strong><span>Server-validated sign-offs only</span></div>
    <div><small>RECOVERY KEY</small><strong id="fx-keytext">LOCKED</strong><span id="fx-progress">0 of 3 sign-offs passed</span></div>
  </section>

  <div id="fx-main">
  <div class="ol-tabs" role="tablist" aria-label="Fix It stations">
    <button class="ol-tab" role="tab" data-tab="a" aria-selected="true"><span>01</span><span>Test the portal<small>Workstation A · Tester</small></span><span class="ol-you" data-for="A" hidden>YOU</span><b id="fx-tab-a">open</b></button>
    <button class="ol-tab" role="tab" data-tab="b" aria-selected="false"><span>02</span><span>Patch &amp; test<small>Workstation B · Developer</small></span><span class="ol-you" data-for="B" hidden>YOU</span><b id="fx-tab-b">open</b></button>
    <button class="ol-tab" role="tab" data-tab="joint" aria-selected="false"><span>03</span><span>Retest &amp; release<small>Both workstations</small></span><b id="fx-tab-joint">open</b></button>
    <button class="ol-tab" role="tab" data-tab="bonus" aria-selected="false"><span>+</span><span>Regression<small>Optional · fast teams</small></span><b id="fx-tab-bonus">optional</b></button>
  </div>

  <!-- ===================== A: TESTER ===================== -->
  <section data-panel="a" role="tabpanel" aria-label="Workstation A: Software Tester">
    <div class="ol-step"><span>STEP 1–4</span><strong>Explore the portal as different users</strong><small>Normal actions first · then try to break it</small></div>
    <div class="fx-testbed">
      <div id="fx-portal-a">
        <div class="fx-browser" id="fx-browser">
          <div class="fx-bar">
            <span class="fx-dots" aria-hidden="true"><i></i><i></i><i></i></span>
            <label class="sr-only" for="fx-urlbox">Address</label>
            <span class="fx-host">hub.northstar.example</span><input id="fx-urlbox" class="fx-url" value="/" spellcheck="false" autocomplete="off"><button type="button" id="fx-go" class="fx-gobtn">Go</button>
            <span id="fx-url" class="sr-only"></span>
          </div>
          <div class="fx-toolbar">
            <span class="fx-tool-label">TEST AS</span>
            <div role="group" aria-label="Simulated user"><button type="button" class="fx-user" data-user="guest">Guest</button><button type="button" class="fx-user" data-user="employee">Sam Lee · Employee</button><button type="button" class="fx-user" data-user="admin">Ria Chen · HR Admin</button></div>
            <label class="fx-outage"><input type="checkbox" id="fx-fail"> Simulate database outage</label>
            <span class="fx-build" id="fx-build-label">LIVE BUILD</span>
          </div>
          <div class="fx-page" id="fx-page" aria-live="polite"></div>
        </div>
      </div>
      <aside class="ol-panel fx-side">
        <span class="ol-kicker">TESTER'S NOTEBOOK · AUTO-RECORDED</span>
        <h3>Recent steps</h3><ol id="fx-steps" class="fx-steps"></ol>
        <h3>Activity</h3><div id="fx-feed" class="ol-feed"></div>
        <div id="fx-hints-a"></div>
      </aside>
    </div>
    <div class="ol-step"><span>STEP 5–7</span><strong>File structured bug reports</strong><small><span id="fx-found">0 findings</span> · triaged by the engineering lead</small></div>
    <div class="ol-two">
      <form id="fx-report-form" class="ol-panel fx-form">
        <span class="ol-kicker">NEW BUG REPORT</span>
        <label>Issue title <input id="fx-r-title" maxlength="80" placeholder="e.g. Guests can see private HR records" autocomplete="off"></label>
        <div class="fx-row2">
          <label>Affected feature <select id="fx-r-feature"><option value="profiles">Staff profile pages</option><option value="contact">Contact details form</option><option value="login">Sign-in page</option><option value="directory">Staff directory</option></select></label>
          <label>Severity <select id="fx-r-sev"><option>Low</option><option selected>Medium</option><option>High</option><option>Critical</option></select></label>
        </div>
        <label>Observed behaviour (only things you triggered) <select id="fx-r-observed"></select></label>
        <fieldset class="fx-roles"><legend>Which users are affected?</legend>
          <label><input type="checkbox" name="fx-r-role" value="guest"> Guest</label><label><input type="checkbox" name="fx-r-role" value="employee"> Employee</label><label><input type="checkbox" name="fx-r-role" value="hr-admin"> HR admin</label></fieldset>
        <label>Expected behaviour <select id="fx-r-expected">
          <option value="hr-owner">Private HR details are visible only to that employee and to HR admins</option>
          <option value="hr-nobody">Remove HR details from the portal for everyone</option>
          <option value="hr-login">Anyone who is signed in can see HR details</option>
          <option value="safe-error">Invalid input is rejected with a helpful message, and failures show a safe message with no internal details</option>
          <option value="hide-form">Disable the contact form</option>
          <option value="same-login">Wrong username and wrong password give the same message</option>
          <option value="colour">Make the error message red so users notice it</option></select></label>
        <p class="ol-muted">Reproduction steps are attached automatically from your notebook.</p>
        <div class="fx-row2"><button type="submit" class="ol-btn ol-btn-primary">Submit to triage</button><span id="fx-r-msg" role="status" class="ol-muted"></span></div>
      </form>
      <div class="ol-panel"><span class="ol-kicker">ISSUE TRACKER</span><h3>Your tickets</h3><div id="fx-reports"></div></div>
    </div>
    <div id="fx-handoff-a" style="margin-top:12px"></div>
    <div class="ol-checkpoint" id="fx-check-a"></div>
  </section>

  <!-- ===================== B: DEVELOPER ===================== -->
  <section data-panel="b" role="tabpanel" aria-label="Workstation B: Software Developer" hidden>
    <div class="ol-step"><span>STEP 1–4</span><strong>Read the code, choose a repair</strong><small>Patch points are highlighted · nothing here executes on a real server</small></div>
    <div class="fx-ide">
      <aside class="fx-files">
        <span class="ol-kicker">EXPLORER</span>
        <div class="fx-tree" role="group" aria-label="Files"><span class="fx-dir">northstar-hub/</span>
          <button type="button" data-file="routes/profile.js">routes/profile.js</button><button type="button" data-file="forms/contact.js">forms/contact.js</button><button type="button" data-file="auth/login.js">auth/login.js</button></div>
        <span class="ol-kicker" style="margin-top:14px;display:block">TICKETS FROM TESTER</span>
        <div id="fx-ticket-entry"></div><div id="fx-tickets"></div>
      </aside>
      <div class="fx-editor">
        <div class="fx-editor-tab"><span id="fx-filename">routes/profile.js</span><span class="ol-chip">restricted edit · choose from tested snippets</span></div>
        <div id="fx-code" class="fx-code"></div>
        <div class="fx-diffbox"><span class="ol-kicker">PENDING CHANGES (DIFF vs LIVE)</span><div id="fx-diff"></div></div>
      </div>
    </div>
    <div class="ol-step"><span>STEP 5–8</span><strong>Apply, run the tests, correct, re-run</strong><small>The runner evaluates your exact patch choices</small></div>
    <div class="ol-two">
      <div class="ol-panel fx-runner">
        <div class="tl-runbar"><button type="button" id="fx-run" class="ol-btn ol-btn-primary">▶ Apply patch &amp; run tests</button><span id="fx-stale" class="ol-muted">No build tested yet</span></div>
        <div id="fx-results" class="fx-results"></div><div id="fx-summary"></div>
      </div>
      <div>
        <div class="ol-panel"><span class="ol-kicker">BUILD HISTORY</span><table class="tl-table tl-small"><thead><tr><th>Build</th><th>Required tests</th><th>All pass</th></tr></thead><tbody id="fx-history"></tbody></table><div id="fx-hints-b"></div></div>
        <div id="fx-handoff-b" style="margin-top:12px"></div>
      </div>
    </div>
    <div class="ol-checkpoint" id="fx-check-b"></div>
  </section>

  <!-- ===================== JOINT ===================== -->
  <section data-panel="joint" role="tabpanel" aria-label="Retest and release" hidden>
    <div class="ol-step"><span>JOINT · BOTH WORKSTATIONS</span><strong>Retest the original defects on the developer's build</strong><small>Tester drives · developer watches the results</small></div>
    <div class="fx-testbed">
      <div id="fx-portal-joint"></div>
      <aside class="ol-panel fx-side">
        <span class="ol-kicker">STAGING BUILD</span>
        <div id="fx-staging-entry"></div>
        <button type="button" id="fx-staging-toggle" class="ol-btn ol-btn-quiet" hidden>Switch</button>
        <h3 style="margin-top:12px">Retest checklist <span class="ol-muted">(ticks itself as you test)</span></h3>
        <ul id="fx-retest" class="fx-retest"></ul>
        <p id="fx-retest-sum" class="ol-muted"></p>
      </aside>
    </div>
    <div class="ol-panel" style="margin-top:14px"><span class="ol-kicker">RELEASE DECISION · SIMULATION</span><h3>Can the portal safely return to service?</h3><div id="fx-decision"></div></div>
    <div class="ol-checkpoint" id="fx-check-joint"></div>
    <div class="ol-key" id="fx-key"><div class="ol-key-glyph" id="fx-key-glyph" aria-hidden="true">◇</div><div><small>RECOVERY KEY</small><strong>PORTAL SECURED</strong><small id="fx-key-sub">Unlocks when the server confirms A, B and joint sign-offs.</small></div></div>
  </section>

  <!-- ===================== BONUS ===================== -->
  <section data-panel="bonus" role="tabpanel" aria-label="Bonus: regression" hidden>
    <div class="ol-step"><span>OPTIONAL · FAST TEAMS</span><strong>Build #025 broke something that used to work</strong><small>Investigate · correct · retest</small></div>
    <div class="ol-two">
      <div class="fx-incident"><span class="ol-kicker">ALERT · 09:58</span><h3>“HR can't open profiles any more”</h3>
        <p>To speed up profile pages, another developer added a permission cache and pushed it straight to the portal. Within minutes, HR reported they were blocked from records they need. Someone else says they saw a record they shouldn't have.</p>
        <p>Deploy the hotfix into your workspace, run the regression tests, find the line responsible and fix it <em>without</em> throwing away the performance improvement or deleting tests.</p>
        <button type="button" id="fx-hotfix" class="ol-btn ol-btn-primary">Deploy hotfix #025 into my workspace</button></div>
      <div class="ol-panel"><span class="ol-kicker">WHAT TESTERS CAN DO</span><p>The tester can load the developer's newest build code and try: open a profile as HR admin, then as guest — or the other way round. Order matters with a bad cache.</p></div>
    </div>
    <div class="ol-checkpoint" id="fx-check-bonus"></div>
  </section>
  </div>

  <p class="tl-footnote"><span class="ol-sim-tag">THIS COMPUTER ONLY</span> Findings, tickets and patches are saved in this browser tab. Only Mission Control sign-offs change your group's official score. <button type="button" id="fx-reset-sim" class="ol-btn ol-btn-quiet">Reset simulation on this computer</button></p>
  <footer class="site-footer"><span>OPERATION LOCKDOWN 2.0</span><span>FIX IT · SOFTWARE QUALITY &amp; SECURITY</span><span>ALL USERS AND DATA IN THIS EXERCISE ARE FICTIONAL</span></footer>
</main>
<script src="/assets/js/ui.js" defer></script>
<script type="module" src="/assets/js/fix-it.js"></script>
</body>
</html>
