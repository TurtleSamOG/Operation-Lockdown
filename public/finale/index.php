<?php declare(strict_types=1); ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#07131d">
  <meta name="description" content="Operation Lockdown 2.0 final recovery mission: combine three zone keys and restore a fictional organisation's systems.">
  <title>Final Mission — Restore the System | Operation Lockdown 2.0</title>
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">
  <link rel="stylesheet" href="/assets/css/app.css">
  <link rel="stylesheet" href="/assets/css/system.css">
  <link rel="stylesheet" href="/assets/css/polish.css">
  <link rel="stylesheet" href="/assets/css/finale.css">
</head>
<body class="finale-page">
<header class="site-header">
  <a class="brand" href="/" aria-label="Operation Lockdown mission hub"><span class="brand-mark"><img src="/assets/img/shield-mark.svg" alt="" width="42" height="42"></span><span class="brand-text"><strong>OPERATION <span>LOCKDOWN</span></strong><small>T-LEVEL EXPERIENCE <b class="brand-version">/ 2.0</b></small></span></a>
  <nav aria-label="Main navigation">
    <a href="/">Mission hub</a><a href="/leaderboard/">Live scores</a><a href="/facilitator/">Staff control</a>
    <span class="connection-indicator" data-connection-status="checking" role="status">Checking API</span>
  </nav>
</header>
<main class="system finale-shell">
  <div class="finale-topline"><span><span class="finale-lamp"></span> MISSION CONTROL / EMERGENCY RESTORATION</span><span>FINAL PROTOCOL · OPERATION 04</span></div>

  <section class="finale-hero" aria-labelledby="finale-title">
    <div class="finale-hero-copy">
      <p class="finale-eyebrow">OPERATION LOCKDOWN 2.0 <span class="finale-slash">/</span> THE FINAL MISSION</p>
      <h1 id="finale-title">It's time to<br><span>restore the system.</span></h1>
      <p class="finale-lead">Three missions. Three recovery keys. One final decision. Bring the AI detector, employee portal and office response back online — without reopening the threat.</p>
      <div class="finale-hero-chips"><span>3 RECOVERY KEYS</span><span>3 RESTORATION DECISIONS</span><span>SERVER-VERIFIED RESULT</span></div>
    </div>
    <div class="finale-orbit" aria-label="System restoration status">
      <div class="finale-orbit-art" aria-hidden="true"><div class="finale-ring finale-ring-outer"></div><div class="finale-ring finale-ring-middle"></div><div class="finale-ring finale-ring-inner"></div><div class="finale-core"><span id="finale-core-icon">⏻</span><small id="finale-core-label">AWAITING<br>AUTHORISATION</small></div><div class="finale-orbit-dot one"></div><div class="finale-orbit-dot two"></div><div class="finale-orbit-dot three"></div></div>
      <div class="finale-orbit-footer"><span>COMPANY INFRASTRUCTURE</span><strong id="finale-system-indicator">OFFLINE</strong></div>
    </div>
  </section>

  <div id="finale-notice" class="finale-notice" role="status" aria-live="polite">Connecting to mission control…</div>

  <section class="finale-metrics" aria-label="Your group mission status">
    <div><small>ACTIVE GROUP</small><strong id="finale-group">Checking…</strong><span id="finale-unit">Sign in at the Mission Hub</span></div>
    <div><small>WORKSTATION</small><strong id="finale-workstation">—</strong><span>Discuss each decision as a team</span></div>
    <div><small>ZONE SCORE</small><strong id="finale-zone-score">0 <em>/ 300</em></strong><span>Train + Fix + Defend</span></div>
    <div><small>FINAL MISSION</small><strong id="finale-final-score">— <em>/ 100</em></strong><span id="finale-final-progress">Not yet attempted</span></div>
  </section>

  <section class="finale-keys-section" aria-labelledby="finale-keys-title">
    <div class="finale-section-heading"><div><div class="finale-section-kicker">01 / RECOVERY AUTHORISATION</div><h2 id="finale-keys-title">Three keys. One system.</h2><p>Keys are checked against your saved group progress, not entered manually.</p></div><span id="finale-key-count" class="finale-count">0 / 3 VERIFIED</span></div>
    <div class="finale-key-grid">
      <article class="finale-key-card" id="finale-key-train"><div class="finale-key-top"><span>01 / TRAIN IT</span><span class="finale-key-light" aria-hidden="true"></span></div><span class="finale-key-glyph" aria-hidden="true">◎</span><strong>AI Defence<br>Activated</strong><small id="finale-key-label-train">Awaiting key</small></article>
      <article class="finale-key-card" id="finale-key-fix"><div class="finale-key-top"><span>02 / FIX IT</span><span class="finale-key-light" aria-hidden="true"></span></div><span class="finale-key-glyph" aria-hidden="true">⌘</span><strong>Portal<br>Secured</strong><small id="finale-key-label-fix">Awaiting key</small></article>
      <article class="finale-key-card" id="finale-key-defend"><div class="finale-key-top"><span>03 / DEFEND IT</span><span class="finale-key-light" aria-hidden="true"></span></div><span class="finale-key-glyph" aria-hidden="true">⬡</span><strong>Threat<br>Contained</strong><small id="finale-key-label-defend">Awaiting key</small></article>
    </div>
  </section>

  <section id="finale-gate" class="finale-gate" aria-labelledby="finale-gate-title">
    <div class="finale-gate-icon" aria-hidden="true">⌁</div><div><div class="finale-section-kicker">LOCKED / CHECKING AUTHORISATION</div><h2 id="finale-gate-title">Restoration protocol sealed.</h2><p id="finale-gate-description">Complete Train It, Fix It and Defend It to recover all three keys. This console unlocks automatically when your group has them.</p><div class="finale-gate-links"><a href="/">Return to Mission Hub</a><button id="finale-refresh" class="finale-quiet-button" type="button">Check recovery keys ↻</button></div></div>
  </section>

  <section id="finale-command" class="finale-command" aria-labelledby="finale-command-title" hidden>
    <div class="finale-section-heading finale-command-heading"><div><div class="finale-section-kicker">02 / RESTORATION COMMAND CENTRE</div><h2 id="finale-command-title">Execute the recovery protocol.</h2><p>Review each subsystem's evidence, agree on the safest decision and submit one final response for your group.</p></div><span class="finale-ready-tag">ALL KEYS VERIFIED</span></div>
    <div class="finale-command-grid">
      <aside class="finale-aside">
        <div class="finale-aside-heading"><small>MISSION SEQUENCE</small><strong id="finale-decisions-count">0 / 3 decisions ready</strong></div>
        <div id="finale-steps" class="finale-steps" role="navigation" aria-label="Recovery decisions"></div>
        <div class="finale-aside-note"><span>OPERATOR NOTICE</span><p>Use both workstations to discuss the evidence. <strong>Only one workstation should submit the final answer</strong> for the group.</p></div>
        <div class="finale-aside-log"><small>RECOVERY SYSTEMS</small><div class="finale-service"><span>AI threat detection</span><b id="finale-service-ai">STANDBY</b></div><div class="finale-service"><span>Employee portal</span><b id="finale-service-portal">STANDBY</b></div><div class="finale-service"><span>Office continuity</span><b id="finale-service-response">STANDBY</b></div></div>
      </aside>
      <div class="finale-stage-area">
        <div class="finale-stage-banner"><span id="finale-stage-code">PHASE 01 / NETWORK DEFENCE</span><span id="finale-stage-counter">1 OF 3</span></div>
        <div class="finale-stage-body"><div class="finale-stage-icon" id="finale-stage-icon" aria-hidden="true">◎</div><h3 id="finale-stage-title">Loading mission briefing…</h3><p id="finale-stage-description" class="finale-stage-description">Awaiting verified recovery questions.</p>
          <div class="finale-evidence"><small>INTELLIGENCE REPORT</small><p id="finale-stage-evidence">Your previous workshop zones supply the evidence for this decision.</p></div>
          <form id="finale-stage-form"><fieldset><legend id="finale-stage-question">What is the next safe action?</legend><div id="finale-options" class="finale-options"></div></fieldset></form>
          <div class="finale-stage-controls"><button id="finale-prev" class="finale-quiet-button" type="button">← Previous</button><button id="finale-next" class="finale-primary-button" type="button">Next decision →</button></div>
        </div>
        <div class="finale-submit-bar"><div><small>FINAL AUTHORISATION</small><strong id="finale-submit-hint">Select an answer for every subsystem.</strong></div><button type="button" id="finale-submit" class="finale-execute-button" disabled><span aria-hidden="true">⏻</span> AUTHORISE RESTORATION</button></div>
      </div>
    </div>
  </section>

  <section id="finale-outcome" class="finale-outcome" aria-labelledby="finale-outcome-title" hidden>
    <div class="finale-outcome-art" aria-hidden="true"><div class="finale-outcome-rings"><span>✓</span></div></div>
    <div class="finale-section-kicker" id="finale-outcome-kicker">03 / SYSTEM RESTORED</div>
    <h2 id="finale-outcome-title">Company systems restored.</h2>
    <p id="finale-outcome-copy">Your team successfully verified the recovery protocol.</p>
    <div class="finale-outcome-stats"><div><small>ZONE SCORE</small><strong id="finale-outcome-zones">0/300</strong></div><div><small>FINALE SCORE</small><strong id="finale-outcome-score">100/100</strong></div><div><small>RECOVERY KEYS</small><strong>3/3</strong></div></div>
    <div id="finale-outcome-note" class="finale-outcome-note">The result has been saved to the server and will appear in the leaderboard.</div>
    <div class="finale-outcome-actions"><a class="finale-primary-button" href="/leaderboard/">View team rankings →</a><a class="finale-quiet-button" href="/">Return to mission hub</a></div>
  </section>

  <footer class="site-footer finale-footer"><span>OPERATION LOCKDOWN 2.0</span><span>THE FINAL MISSION / RESTORE THE COMPANY</span><span>FICTIONAL WORKSHOP ENVIRONMENT</span></footer>
</main>
<script src="/assets/js/ui.js" defer></script>
<script type="module" src="/assets/js/finale.js"></script>
</body>
</html>
