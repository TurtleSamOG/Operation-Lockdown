<?php
declare(strict_types=1);
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#08131f">
<meta name="description" content="Operation Lockdown 2.0 Train It — interactive AI security laboratory">
<title>Train It | AI Security Lab — Operation Lockdown 2.0</title>
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/app.css">
<link rel="stylesheet" href="/assets/css/system.css">
<link rel="stylesheet" href="/assets/css/polish.css">
<link rel="stylesheet" href="/assets/css/train.css">
</head>
<body class="page-train">
<header class="site-header">
  <a class="brand" href="/" aria-label="Operation Lockdown home"><span class="brand-mark"><img src="/assets/img/shield-mark.svg" width="42" height="42" alt=""></span><span class="brand-text"><strong>OPERATION <span>LOCKDOWN</span></strong><small>T-LEVEL EXPERIENCE <b class="brand-version">/ 2.0</b></small></span></a>
  <nav aria-label="Main navigation"><a href="/">Mission hub</a><a href="/leaderboard/">Live scores</a><a href="/facilitator/">Staff control</a><span class="connection-indicator" data-connection-status="checking" role="status">Checking API</span></nav>
</header>
<main class="system train-shell">
  <div class="topline"><span><span class="topline-dot"></span> OPERATION LOCKDOWN / LAB 01</span><span>AI SECURITY LABORATORY · TRAIN IT</span></div>
  <section class="train-hero">
    <div>
      <div class="train-eyebrow"><span class="train-led"></span> INCIDENT 001 / ACTIVE SECURITY THREAT <span class="train-eyebrow-label">RULE-BASED DETECTOR</span></div>
      <h1 class="hero train-title">Train the <span class="accent">defence.</span></h1>
      <p class="subtitle">A suspicious login campaign is targeting the company's accounts. Your job is to investigate the activity, calibrate a detection system and prove it can recognise threats without disrupting innocent staff.</p>
      <div class="train-hero-tags"><span>01 · INVESTIGATE</span><span>02 · CALIBRATE</span><span>03 · VERIFY</span></div>
    </div>
    <div class="train-radar" aria-hidden="true"><div class="train-radar-ring r1"></div><div class="train-radar-ring r2"></div><div class="train-radar-ring r3"></div><div class="train-radar-sweep"></div><div class="train-radar-centre">✳</div><span class="radar-mark m1"></span><span class="radar-mark m2"></span><span class="radar-mark m3"></span><div class="train-radar-caption">DETECTION MATRIX / ONLINE</div></div>
  </section>
  <div id="train-alert" class="train-alert train-alert-loading" role="status" aria-live="polite">Connecting to mission control…</div>
  <section class="train-metrics" aria-label="Team details">
    <div><span class="train-metric-label">ACTIVE GROUP</span><strong id="train-team">Loading…</strong><small id="train-unit">Checking session</small></div>
    <div><span class="train-metric-label">YOUR STATION</span><strong id="train-station">—</strong><small>A / B / Joint</small></div>
    <div><span class="train-metric-label">ZONE SCORE</span><strong id="train-score">0 <em>/ 100</em></strong><small>Server validated</small></div>
    <div><span class="train-metric-label">RECOVERY KEY</span><strong id="train-key">Locked</strong><small id="train-progress">0 of 3 required tasks</small></div>
  </section>
  <div class="train-layout">
    <aside class="train-sidebar">
      <div class="train-panel train-sidepanel">
        <div class="train-panel-kicker">MISSION PROGRESSION</div>
        <h2>Control room</h2>
        <p class="train-subtle">Each computer has a separate job. Your progress is shared with the rest of your group.</p>
        <div class="train-stage-nav" role="group" aria-label="Train It activities">
          <button type="button" data-view="a" class="train-stage is-active"><span class="train-stage-number">01</span><span><strong>Investigate</strong><small>Workstation A · Login evidence</small></span><b id="nav-a">—</b></button>
          <button type="button" data-view="b" class="train-stage"><span class="train-stage-number">02</span><span><strong>Calibrate</strong><small>Workstation B · Detection rules</small></span><b id="nav-b">—</b></button>
          <button type="button" data-view="joint" class="train-stage"><span class="train-stage-number">03</span><span><strong>Joint test</strong><small>Both workstations · Final check</small></span><b id="nav-joint">—</b></button>
          <button type="button" data-view="bonus" class="train-stage"><span class="train-stage-number">+</span><span><strong>Extra incident</strong><small>Optional · Fast teams</small></span><b id="nav-bonus">—</b></button>
        </div>
        <div class="train-side-foot"><span class="train-pulse"></span><span id="train-sync-label">Waiting for group state</span></div>
      </div>
      <div class="train-panel train-briefing">
        <div class="train-panel-kicker">OPERATOR BRIEFING</div>
        <h3>How it works</h3>
        <ol><li><b>Station A:</b> Review evidence and classify logins.</li><li><b>Station B:</b> Tune detector settings and test them.</li><li><b>Both:</b> Share findings and complete the final assessment.</li></ol>
        <p>The real score and recovery key are saved by the server. The practice simulator doesn't affect the leaderboard.</p>
      </div>
    </aside>
    <section class="train-content" aria-label="Challenge activity">
      <section data-panel="a" class="train-panel train-workspace">
        <div class="train-workspace-top"><div><div class="train-panel-kicker">WORKSTATION A / INVESTIGATION</div><h2>Security event inbox</h2><p class="train-subtle">Read the evidence before making a judgement. An alert is a reason to investigate, not proof of wrongdoing.</p></div><span class="train-role-tag">EVIDENCE ANALYST</span></div>
        <div class="train-module-step"><span>STEP 01</span><strong>Triage eight incoming login events</strong><small>Practice investigation · Discuss the clues with your partner</small></div>
        <div id="train-case-inbox" class="train-case-list"></div>
        <div class="train-practice-summary"><div><span class="train-metric-label">EVENTS REVIEWED</span><strong id="train-case-count">0 / 8</strong></div><div><span class="train-metric-label">SIMULATED ASSESSMENT</span><strong id="train-case-accuracy">—</strong></div><button id="train-reset-cases" class="train-mini-button" type="button">Reset practice</button></div>
        <div class="train-module-step"><span>STEP 02</span><strong>Submit your official investigation report</strong><small>Server-scored · Must be submitted from Workstation A</small></div>
        <div id="train-task-a" class="train-graded"></div>
      </section>
      <section data-panel="b" class="train-panel train-workspace" hidden>
        <div class="train-workspace-top"><div><div class="train-panel-kicker">WORKSTATION B / RULE DESIGN</div><h2>Detection rules engine</h2><p class="train-subtle">Change the rule thresholds, then test them against a new set of logins. A powerful detector must also avoid false alarms.</p></div><span class="train-role-tag">DETECTOR ENGINEER</span></div>
        <div class="train-module-step"><span>STEP 01</span><strong>Calibrate the detector</strong><small>Interactive rule simulation · No real AI model or real account data</small></div>
        <div class="train-controls">
          <div><label for="rule-fail">Alert after repeated failed attempts <strong id="rule-fail-value">5+</strong></label><input id="rule-fail" type="range" min="2" max="12" step="1" value="5"><small>Lower thresholds catch more activity, but create more alerts.</small></div>
          <div class="train-toggles"><label><input id="rule-geo" type="checkbox"> Flag unfamiliar country</label><label><input id="rule-device" type="checkbox"> Flag new device</label><label><input id="rule-time" type="checkbox"> Flag unusual login time</label></div>
        </div>
        <div class="train-sim-results"><div><span>THREATS DETECTED</span><strong id="sim-detected">—</strong></div><div><span>FALSE ALARMS</span><strong id="sim-false">—</strong></div><div><span>OVERALL ACCURACY</span><strong id="sim-accuracy">—</strong></div></div>
        <div class="train-rule-status" id="train-rule-status" aria-live="polite"></div>
        <div class="train-sample-bar"><strong>Test traffic</strong><span id="train-test-count">12 simulated events</span></div>
        <div class="train-table-wrap"><table class="train-sample-table"><thead><tr><th>Event</th><th>Failed logins</th><th>Signals</th><th>Detector</th></tr></thead><tbody id="train-samples"></tbody></table></div>
        <div class="train-module-step"><span>STEP 02</span><strong>Submit your official rules assessment</strong><small>Server-scored · Must be submitted from Workstation B</small></div>
        <div id="train-task-b" class="train-graded"></div>
      </section>
      <section data-panel="joint" class="train-panel train-workspace" hidden>
        <div class="train-workspace-top"><div><div class="train-panel-kicker">JOINT MISSION / EVIDENCE REVIEW</div><h2>Prove the detector works</h2><p class="train-subtle">Both sides of the group must combine their findings before approving the detector for the company.</p></div><span class="train-role-tag">JOINT OPERATION</span></div>
        <div id="train-joint-gate" class="train-alert">Waiting for Workstations A and B.</div>
        <div class="train-evidence-grid"><article><span>CASE FILE / 01</span><strong>Unfamiliar login</strong><p>12 failed passwords before access from a new location.</p></article><article><span>CASE FILE / 02</span><strong>Legitimate traveller</strong><p>Employee has travel approval and a known device.</p></article><article><span>CASE FILE / 03</span><strong>Overnight technician</strong><p>Late login matches a scheduled maintenance window.</p></article></div>
        <div class="train-module-step"><span>FINAL VERIFICATION</span><strong>Joint assessment</strong><small>Use the evidence, then agree on the safest response</small></div>
        <div id="train-task-joint" class="train-graded"></div>
        <div class="train-key-box"><div><span>RECOVERY ITEM</span><strong>AI DEFENCE ACTIVATED</strong><small>Unlocked automatically when all three required tasks pass</small></div><div class="train-key-icon" id="train-key-icon">◇</div></div>
      </section>
      <section data-panel="bonus" class="train-panel train-workspace" hidden>
        <div class="train-workspace-top"><div><div class="train-panel-kicker">OPTIONAL / ADAPTIVE CONTENT</div><h2>Unexpected incident</h2><p class="train-subtle">For fast teams: the detector is raising too many alerts. Explain the trade-off and show how you'd tune the system without ignoring genuine attacks.</p></div><span class="train-role-tag">EXTRA CHALLENGE</span></div>
        <div class="train-module-step"><span>BONUS DRILL</span><strong>Keep the office running</strong><small>Optional, scored separately only if the server assigns a bonus task</small></div>
        <div class="train-bonus-notes"><p><b>Question for the team:</b> Should a detector automatically block every account that signs in from an unfamiliar country?</p><p>Discuss the impact on travelling staff, then compare the live rule simulator and official bonus assessment below.</p></div>
        <div id="train-task-bonus" class="train-graded"></div>
      </section>
    </section>
  </div>
  <footer class="site-footer"><span>OPERATION LOCKDOWN 2.0</span><span>TRAIN IT · SECURITY DETECTOR LAB</span><span>RETURN TO <a href="/">MISSION HUB</a></span></footer>
</main>
<script src="/assets/js/ui.js" defer></script>
<script type="module" src="/assets/js/train.js"></script>
</body>
</html>
