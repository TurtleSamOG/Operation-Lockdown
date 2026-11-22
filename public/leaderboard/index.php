<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#08131f">
<meta name="description" content="Operation Lockdown 2.0 — live mission control leaderboard">
<title>Live Scores | Operation Lockdown 2.0</title>
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

.lb-shell{max-width:1500px}
.lb-top{display:grid;grid-template-columns:minmax(0,1.3fr) auto minmax(220px,.5fr);gap:24px;align-items:center;margin-bottom:22px}
.lb-title{font-size:clamp(2.4rem,4.6vw,4.6rem);line-height:1;letter-spacing:-.05em;margin:.3rem 0;font-weight:850}.lb-title span{color:#74eadc}
.lb-clock{text-align:center;border:1px solid #24405a;border-radius:18px;padding:14px 28px;background:#0a1724}
.lb-timer{font-family:ui-monospace,Consolas,monospace;font-size:clamp(3rem,6vw,5.4rem);font-weight:800;letter-spacing:.04em;color:#e8fbff;line-height:1.05}
.lb-timer.lb-low{color:#ffb083;animation:lb-blink 1s infinite}@keyframes lb-blink{50%{opacity:.55}}
.lb-clock .message{margin:.3rem 0 0;font-size:.8rem}
.lb-totals{display:flex;flex-direction:column;gap:8px}.lb-totals>div{border:1px solid #213a4d;border-radius:12px;padding:.6rem .9rem;background:#0d1b2a}
.lb-totals small{display:block;font-family:ui-monospace,Consolas,monospace;font-size:.62rem;letter-spacing:.14em;color:#7c9bb0}.lb-totals strong{font-size:1.6rem}
.lb-head{display:grid;grid-template-columns:80px minmax(220px,1fr) minmax(0,1.6fr) 150px;gap:16px;padding:0 18px 8px;font-family:ui-monospace,Consolas,monospace;font-size:.64rem;letter-spacing:.16em;color:#7c9bb0}
.lb-row{display:grid;grid-template-columns:80px minmax(220px,1fr) minmax(0,1.6fr) 150px;gap:16px;align-items:center;border:1px solid #22405a;border-radius:20px;padding:18px;margin-bottom:12px;background:linear-gradient(150deg,#112538,#0a1622);transition:border-color .4s}
.lb-row.is-leader{border-color:#5ff0dc;box-shadow:0 0 0 1px #5ff0dc44,0 20px 60px #0008}
.lb-row.is-restored{background:linear-gradient(150deg,#123a30,#0a1622)}
.lb-row.lb-gain{animation:lb-flash 1.4s ease-out}@keyframes lb-flash{0%{box-shadow:0 0 0 3px #5ff0dc}100%{box-shadow:none}}
.lb-rank{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-size:2rem;font-weight:900;background:#16293b;color:#cfe3ef}
.is-leader .lb-rank{background:#5ff0dc;color:#05242c}
.lb-name{font-size:clamp(1.4rem,2.4vw,2.1rem);font-weight:850;letter-spacing:-.03em}
.lb-finale{display:inline-block;margin:.35rem 0 .55rem;font-size:.76rem;font-weight:800;border-radius:99px;padding:.25rem .7rem;background:#18293a;color:#9fb8c8}
.lb-finale.ready{background:#13314a;color:#bfe8ff}.lb-finale.done{background:#5ff0c4;color:#04241c}
.lb-bar{height:8px;border-radius:99px;background:#16283a;overflow:hidden}.lb-bar span{display:block;height:100%;background:linear-gradient(90deg,#2bd8c4,#6ff0b7);transition:width .8s ease}
.lb-zones{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.lb-zone{border:1px dashed #33506a;border-radius:12px;padding:.55rem .75rem;display:flex;flex-direction:column}
.lb-zone-name{font-family:ui-monospace,Consolas,monospace;font-size:.62rem;letter-spacing:.12em;color:#7c9bb0}
.lb-zone strong{font-size:1.5rem}.lb-zone-key{font-size:.74rem;color:#9fb8c8}
.lb-zone.mid{border-style:solid;border-color:#6a5728}.lb-zone.on{border-style:solid;border-color:#43d6a6;background:#0f2a22}.lb-zone.on .lb-zone-key{color:#a6f3d2;font-weight:800}
.lb-score{text-align:right;font-size:clamp(2.4rem,4vw,3.6rem);font-weight:900;letter-spacing:-.04em}.lb-score small{display:block;font-size:.8rem;color:#7c9bb0;letter-spacing:0;font-weight:600}
@media (max-width:1100px){.lb-top,.lb-row,.lb-head{grid-template-columns:1fr}.lb-head{display:none}.lb-score{text-align:left}}
/* slides */
.lb-slide{min-height:60vh}
.lj-lead{font-size:clamp(1.05rem,1.6vw,1.35rem);color:#bcd0dd;max-width:900px;line-height:1.6;margin:.4rem 0 34px}
.lj-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.lj-card{border:1px solid #24405a;border-radius:22px;padding:28px;background:linear-gradient(165deg,#112538,#0a1622);display:flex;flex-direction:column;gap:10px}
.lj-train{--c:#5ff0dc}.lj-fix{--c:#a996ff}.lj-defend{--c:#ffb083}.lj-card{border-top:4px solid var(--c)}
.lj-zone{font-family:ui-monospace,Consolas,monospace;font-size:.8rem;letter-spacing:.14em;color:var(--c);font-weight:800}
.lj-card h2{font-size:clamp(1.5rem,2.3vw,2.1rem);letter-spacing:-.03em;margin:.2rem 0 0;line-height:1.1}
.lj-also{margin:0;color:#8ea7b9;font-size:.95rem}
.lj-card p{font-size:clamp(.95rem,1.25vw,1.12rem);line-height:1.6;color:#d4e3ec;margin:.2rem 0}.lj-card p b{color:var(--c)}
.lj-routes{margin-top:auto;padding-top:14px;display:flex;flex-direction:column;gap:6px}
.lj-routes span{font-size:.88rem;border:1px solid #2a4559;border-radius:9px;padding:.45rem .7rem;color:#c8dbe6;background:#0c1b28}
.lb-survey{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:48px;align-items:center}
.lb-qr{background:#fff;border-radius:24px;padding:18px;aspect-ratio:1;display:grid;place-items:center;max-width:520px;width:100%;justify-self:center;box-shadow:0 0 0 10px #5ff0dc22,0 30px 80px #0008}
.lb-qr svg{width:100%;height:100%}
.lb-qr-missing{color:#33495a;text-align:center;font-weight:700;font-size:1.2rem}.lb-qr-missing small{font-weight:500;color:#667b8a}
.lb-survey-url{font-family:ui-monospace,Consolas,monospace;color:#7fa6ba;font-size:.95rem;word-break:break-all}
/* staff nav */
.lb-nav{position:fixed;right:22px;bottom:22px;z-index:50;display:flex;gap:8px;align-items:center;background:#0a1724ee;border:1px solid #2a4559;border-radius:14px;padding:8px 10px;opacity:.35;transition:opacity .2s}
.lb-nav:hover,.lb-nav:focus-within{opacity:1}
.lb-nav span{font-family:ui-monospace,Consolas,monospace;color:#a9c3d3;font-size:.85rem;min-width:48px;text-align:center}
/* briefing */
.lb-brief{position:fixed;inset:0;z-index:100;background:radial-gradient(ellipse at 50% 30%,#10263a,#03080f 75%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6vh 6vw}
.br-stage{text-align:center;max-width:1300px;width:100%}
.br-stage.br-in{animation:br-in .7s ease-out both}@keyframes br-in{from{opacity:0;transform:translateY(14px)}}
.br-kicker{font-family:ui-monospace,Consolas,monospace;letter-spacing:.24em;color:#6fd9cf;font-size:clamp(.85rem,1.4vw,1.2rem);font-weight:800}
.br-big{font-size:clamp(2.6rem,7vw,6.4rem);line-height:1.02;letter-spacing:-.05em;margin:.3em 0;font-weight:900}.br-big span{color:#ff9a86}
.br-sub{font-size:clamp(1.1rem,2vw,1.7rem);color:#bcd0dd}
.br-mode-alarm .br-kicker{color:#ff7d8d;font-size:clamp(1.2rem,2.4vw,2rem)}
.br-alarm{width:min(30vw,220px);aspect-ratio:1;margin:0 auto 20px;border-radius:50%;display:grid;place-items:center;font-size:clamp(4rem,10vw,7rem);color:#2a0c10;background:#ff6d7d;animation:br-pulse 1s infinite}
@keyframes br-pulse{0%,100%{box-shadow:0 0 0 0 #ff6d7d88}50%{box-shadow:0 0 0 50px #ff6d7d00}}
.br-feed{max-width:1100px;margin:20px auto 0}
.br-msg{text-align:left;font-size:clamp(1.4rem,3vw,2.6rem);line-height:1.3;border-left:6px solid #e2b552;background:#0d1d2ccc;border-radius:0 18px 18px 0;padding:24px 30px}
.br-msg.bad{border-color:#ff6d7d}.br-msg time{display:block;font-family:ui-monospace,Consolas,monospace;font-size:.5em;color:#8eb0c3;letter-spacing:.1em;margin-bottom:6px}
.br-zones,.br-how{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:28px;text-align:left}
.br-z,.br-how>div{border:1px solid #2a4559;border-radius:20px;padding:26px;background:#0c1b28;animation:br-in .6s both}
.br-z:nth-child(2),.br-how>div:nth-child(2){animation-delay:.6s}.br-z:nth-child(3),.br-how>div:nth-child(3){animation-delay:1.2s}
.br-z b{display:block;font-family:ui-monospace,Consolas,monospace;font-size:clamp(1rem,1.8vw,1.5rem);letter-spacing:.1em;margin-bottom:10px}
.br-z span,.br-how span{font-size:clamp(1.05rem,1.8vw,1.6rem);line-height:1.4;color:#d6e5ee}
.br-z.train b{color:#5ff0dc}.br-z.fix b{color:#b9a8ff}.br-z.defend b{color:#ffb083}
.br-how b{display:block;font-size:clamp(2rem,4vw,3.4rem);color:#74eadc;margin-bottom:6px}
.br-count{font-size:clamp(8rem,22vw,18rem);font-weight:900;color:#74eadc;line-height:1;font-family:ui-monospace,Consolas,monospace}
.br-startbtn{margin-top:30px;font-size:1.2rem;padding:1rem 2rem}
.br-controls{position:absolute;bottom:26px;right:26px;display:flex;gap:8px;opacity:.3;transition:opacity .2s}.br-controls:hover,.br-controls:focus-within{opacity:1}
.br-bar{position:absolute;left:0;right:0;bottom:0;height:5px;background:#0f2232}.br-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#2bd8c4,#ff9a86);transition:width .6s}
@media (max-width:1100px){.lj-grid,.lb-survey,.br-zones,.br-how{grid-template-columns:1fr}}

</style>
</head>
<body class="page-leaderboard"><header class="site-header"><a class="brand" href="/" aria-label="Operation Lockdown — home"><span class="brand-mark"><img src="/assets/img/shield-mark.svg" alt="" width="42" height="42"></span><span class="brand-text"><strong>OPERATION <span>LOCKDOWN</span></strong><small>T-LEVEL EXPERIENCE <b class="brand-version">/ 2.0</b></small></span></a><nav aria-label="Main navigation"><a href="/">Mission hub</a><a href="/leaderboard/" aria-current="page">Live scores</a><a href="/facilitator/">Staff control</a><span class="connection-indicator" data-connection-status="checking" data-status="checking" role="status">Checking API</span></nav></header>
<main class="system lb-shell"><div class="topline"><span><span class="topline-dot"></span> MISSION CONTROL · LIVE BROADCAST</span><span>NORTHSTAR SYSTEMS RECOVERY · AUTO-REFRESH 5s</span></div>
<section data-slide="board" class="lb-slide">
<section class="lb-top">
  <div><p class="ol-kicker">INCIDENT NS-2611 · RESPONSE TEAMS</p><h1 class="lb-title">Who will restore <span>Northstar?</span></h1></div>
  <div class="lb-clock"><span class="ol-kicker" id="round">Rotation —</span><div class="lb-timer" id="timer">--:--</div><p id="status" class="message info" role="status" aria-live="polite">Connecting to the scoreboard…</p></div>
  <div class="lb-totals"><div><small>KEYS RECOVERED</small><strong id="lb-keys">—</strong></div><div><small>SYSTEMS RESTORED</small><strong id="lb-restored">—</strong></div><span class="tiny muted" id="lastUpdated">Awaiting first update</span></div>
</section>
<div class="lb-head"><span>RANK</span><span>GROUP</span><span>ZONE SCORES &amp; RECOVERY KEYS</span><span>TOTAL</span></div>
<section id="board" aria-live="polite"><div class="empty-state">Loading validated team results…</div></section>
</section>
<section data-slide="jobs" class="lb-slide" hidden>
  <p class="ol-kicker">AFTER THE MISSION</p>
  <h1 class="lb-title">Is this a real job? <span>Yes.</span></h1>
  <p class="lj-lead">Everything you did today is a simplified version of what people do every day in these careers.</p>
  <div class="lj-grid">
    <article class="lj-card lj-train"><span class="lj-zone">◎ TRAIN IT</span>
      <h2>Security Operations Analyst</h2><p class="lj-also">also: Detection Engineer</p>
      <p><b>Today you</b> investigated suspicious logins and tuned a detector so it caught attackers without locking out innocent staff.</p>
      <p><b>In the job</b> analysts watch alerts from a company's systems, decide what's real, and keep improving the rules that raise those alerts.</p>
      <div class="lj-routes"><span>T Level · Digital Support Services</span><span>Apprenticeship · Cyber Security Technician (L3)</span><span>Degree · Cyber Security / Computer Science</span></div></article>
    <article class="lj-card lj-fix"><span class="lj-zone">{ } FIX IT</span>
      <h2>Software Tester &amp; Developer</h2><p class="lj-also">also: QA Engineer</p>
      <p><b>Today you</b> broke a website on purpose, wrote bug reports, patched the code and proved the fix with automated tests.</p>
      <p><b>In the job</b> testers find problems before customers do; developers fix them — and nothing ships until the tests pass.</p>
      <div class="lj-routes"><span>T Level · Digital Production, Design &amp; Development</span><span>Apprenticeship · Software Developer / Tester (L4)</span><span>Degree · Software Engineering / Computer Science</span></div></article>
    <article class="lj-card lj-defend"><span class="lj-zone">⬡ DEFEND IT</span>
      <h2>Incident Responder</h2><p class="lj-also">also: IT Infrastructure Technician</p>
      <p><b>Today you</b> gathered evidence, kept critical systems running on backup power and stopped an intruder using the chaos.</p>
      <p><b>In the job</b> responders take charge when things go wrong: protect people, contain the threat, restore services, learn from it.</p>
      <div class="lj-routes"><span>T Level · Digital Support Services</span><span>Apprenticeship · Infrastructure Technician (L3)</span><span>Degree · Cyber Security / Networking</span></div></article>
  </div>
</section>
<section data-slide="survey" class="lb-slide lb-survey" hidden>
  <div><p class="ol-kicker">BEFORE YOU GO</p><h1 class="lb-title">How did <span>we do?</span></h1>
  <p class="lj-lead">Scan the code with your phone camera and answer a few quick questions. It's anonymous and takes about a minute.</p>
  <p class="lb-survey-url" id="lb-survey-url"></p></div>
  <div class="lb-qr" id="lb-qr"></div>
</section>
<p class="projection-tip">Rankings use server-validated results only. Press <strong>F11</strong> for full screen. This screen does not change student progress.</p>
<nav class="lb-nav" id="lb-nav" hidden aria-label="Projector controls (staff only)">
  <button type="button" id="lb-play-brief" class="ol-btn">▶ Opening briefing</button>
  <button type="button" id="lb-prev" class="ol-btn" aria-label="Previous slide">←</button><span id="lb-slide-count">1 / 3</span><button type="button" id="lb-next" class="ol-btn" aria-label="Next slide">→</button>
</nav>
<div class="lb-brief" id="lb-brief" hidden role="dialog" aria-label="Opening briefing">
  <div class="br-stage" id="br-stage" aria-live="polite"></div>
  <button type="button" id="br-start" class="ol-btn ol-btn-primary br-startbtn">▶ Start briefing</button>
  <div class="br-controls" id="br-controls" hidden><button type="button" id="br-pause" class="ol-btn ol-btn-quiet">❚❚ Pause</button><button type="button" id="br-skip" class="ol-btn ol-btn-quiet">Skip to deploy →</button><button type="button" id="br-cancel" class="ol-btn ol-btn-quiet">Close (no timer)</button></div>
  <div class="br-bar"><i id="br-progress"></i></div>
</div>
<footer class="site-footer"><span>OPERATION LOCKDOWN 2.0</span><span>TRAIN / FIX / DEFEND</span><span>LIVE MISSION CONTROL</span></footer></main><script src="/assets/js/ui.js" defer></script><script type="module" src="/assets/js/leaderboard.js"></script></body></html>
