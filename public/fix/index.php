<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#08131f">
  <meta name="description" content="Operation Lockdown 2.0 — interactive software security workshop">
  <title>Fix It — Employee Portal Recovery | Operation Lockdown 2.0</title>
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/app.css">
  <link rel="stylesheet" href="/assets/css/system.css">
  <link rel="stylesheet" href="/assets/css/polish.css">
  <link rel="stylesheet" href="/assets/css/fix-it.css">
</head>
<body class="fix-page">
<header class="site-header">
  <a class="brand" href="/" aria-label="Operation Lockdown mission hub">
    <span class="brand-mark"><img src="/assets/img/shield-mark.svg" alt="" width="42" height="42"></span>
    <span class="brand-text"><strong>OPERATION <span>LOCKDOWN</span></strong><small>T-LEVEL EXPERIENCE <b class="brand-version">/ 2.0</b></small></span>
  </a>
  <nav aria-label="Main navigation"><a href="/">Mission hub</a><a href="/leaderboard/">Live scores</a><span class="connection-indicator" data-connection-status="checking" role="status">Checking API</span></nav>
</header>
<main class="fix-shell">
  <div class="fix-topline"><span><i class="fix-led"></i> MISSION 02 / SOFTWARE DEFENCE</span><span>EMPLOYEE PORTAL RECOVERY · ALBERT / FIX IT</span></div>

  <section class="fix-hero" aria-labelledby="fix-title">
    <div>
      <div class="fix-eyebrow">OPERATION LOCKDOWN / ZONE 02</div>
      <h1 id="fix-title">BREAK IT. <span>FIX IT.</span></h1>
      <p>The company's employee portal has security faults. Inspect the evidence on workstation A, repair the controls on workstation B, then prove the site is safe to reopen.</p>
      <div class="fix-hero-actions"><a class="fix-btn fix-btn-quiet" href="/">← Return to Mission Hub</a><span class="fix-duration">≈ 30 MIN CHALLENGE</span></div>
    </div>
    <div class="fix-hero-visual" aria-hidden="true">
      <div class="fix-visual-code"><span>01</span> if (visitor.<b>hasAccess</b>) {</div>
      <div class="fix-visual-code"><span>02</span> &nbsp;&nbsp;showPrivateData();</div>
      <div class="fix-visual-code"><span>03</span> }</div>
      <div class="fix-visual-warning"><span>!</span><strong>ACCESS CONTROL WARNING</strong><small>PORTAL-01 / AUDIT REQUIRED</small></div>
    </div>
  </section>

  <section class="fix-status" aria-label="Team status">
    <div class="fix-stat"><small>CONNECTED GROUP</small><strong id="fix-group">Checking…</strong><span id="fix-unit">Sign in from Mission Hub first</span></div>
    <div class="fix-stat"><small>YOUR WORKSTATION</small><strong id="fix-station">—</strong><span>Two computers, one shared mission</span></div>
    <div class="fix-stat"><small>PORTAL RECOVERY SCORE</small><strong id="fix-score">0 / 100</strong><span id="fix-completed">0 / 3 required tasks</span></div>
    <div class="fix-stat"><small>RECOVERY KEY</small><strong id="fix-key">LOCKED</strong><span>PORTAL SECURED</span></div>
  </section>

  <div class="fix-notice" id="fix-notice" role="status" aria-live="polite">Connecting to Mission Control…</div>
  <div class="fix-stagebar" aria-label="Task progress">
    <div class="fix-stage" id="fix-stage-a"><span>01 / STATION A</span><strong>Investigate</strong><small id="fix-progress-a">Waiting</small></div>
    <div class="fix-stage" id="fix-stage-b"><span>02 / STATION B</span><strong>Repair</strong><small id="fix-progress-b">Waiting</small></div>
    <div class="fix-stage" id="fix-stage-joint"><span>03 / JOINT MISSION</span><strong>Verify</strong><small id="fix-progress-joint">Locked</small></div>
  </div>

  <nav class="fix-tabs" aria-label="Activities">
    <button class="fix-tab active" type="button" data-screen="a" aria-pressed="true"><span>01</span> Investigate <b id="fix-nav-a">—</b></button>
    <button class="fix-tab" type="button" data-screen="b" aria-pressed="false"><span>02</span> Repair <b id="fix-nav-b">—</b></button>
    <button class="fix-tab" type="button" data-screen="joint" aria-pressed="false"><span>03</span> Joint verification <b id="fix-nav-joint">—</b></button>
    <button class="fix-tab" type="button" data-screen="bonus" aria-pressed="false"><span>+</span> Extra incident <b id="fix-nav-bonus">—</b></button>
  </nav>

  <section class="fix-screen" id="fix-screen-a" data-screen-panel="a" aria-labelledby="fix-a-title">
    <div class="fix-sectionhead"><div><span class="fix-kicker">STATION A / INVESTIGATION DESK</span><h2 id="fix-a-title">Find the security problems.</h2><p>Explore the simulated employee portal below. Compare what a visitor can see with what a staff member should see. Record evidence before filing your report.</p></div><span class="fix-role-tag">2–3 STUDENTS</span></div>
    <div class="fix-columns">
      <article class="fix-panel">
        <div class="fix-panel-label">FICTITIOUS EMPLOYEE PORTAL · SAFE SIMULATION</div>
        <div class="fix-browser"><div class="fix-browser-top"><span class="fix-browser-dots">● ● ●</span><span>intranet.example / employee-portal</span><strong>SIMULATION</strong></div>
          <div class="fix-browser-inner"><div class="fix-portal-head"><div><b class="fix-portal-symbol">N</b><span><strong>NORTHSTAR</strong><small>STAFF SERVICES PORTAL</small></span></div><span class="fix-portal-label" id="fix-visitor-status">GUEST SESSION</span></div>
            <div class="fix-role-switch" role="group" aria-label="Select simulated user role"><button type="button" class="active" data-role="guest" aria-pressed="true">Guest view</button><button type="button" data-role="employee" aria-pressed="false">Employee view</button></div>
            <div class="fix-portal-nav" role="group" aria-label="Choose a part of the portal"><button type="button" class="active" data-portal="profiles" aria-pressed="true">Staff profiles</button><button type="button" data-portal="errors" aria-pressed="false">Support form</button><button type="button" data-portal="access" aria-pressed="false">Staff dashboard</button></div>
            <div class="fix-portal-body" id="fix-portal-body" aria-live="polite"></div>
          </div>
        </div>
        <div class="fix-actions"><button type="button" class="fix-btn" id="fix-inspect">Record evidence from this screen</button><span id="fix-evidence-count" class="fix-muted">0 of 3 areas inspected</span></div>
        <div id="fix-evidence" class="fix-evidence" aria-live="polite"><p>Open each area and record what you observe. Your findings stay on this workstation; your assessment result is saved centrally.</p></div>
      </article>
      <article class="fix-panel">
        <div class="fix-panel-label">OFFICIAL REPORT / SERVER-SCORED</div>
        <h3>Security incident report</h3>
        <p class="fix-help">What should be changed? Use the evidence you found in the portal to decide. This report is graded by the existing main-system API.</p>
        <div id="fix-task-a"><p class="fix-muted">Loading assessment…</p></div>
        <div class="fix-message" id="fix-result-a" aria-live="polite"></div>
      </article>
    </div>
  </section>

  <section class="fix-screen" id="fix-screen-b" data-screen-panel="b" aria-labelledby="fix-b-title" hidden>
    <div class="fix-sectionhead"><div><span class="fix-kicker">STATION B / DEVELOPMENT DESK</span><h2 id="fix-b-title">Patch the portal. Run the tests.</h2><p>Choose the safer changes to a simplified codebase, then run simulated tests. Your code choices never execute on the real server.</p></div><span class="fix-role-tag">2–3 STUDENTS</span></div>
    <div class="fix-columns">
      <article class="fix-panel">
        <div class="fix-panel-label">SAFE REPAIR WORKSPACE · NO REAL VULNERABILITIES</div>
        <div class="fix-code-window"><div class="fix-code-bar"><span><i></i><i></i><i></i></span><strong>security-patch.js</strong><small>TRAINING SANDBOX</small></div><pre id="fix-code-preview" aria-live="polite">// Choose the patch controls to generate a preview.</pre></div>
        <div class="fix-report" id="fix-b-report"><strong>Waiting for investigator report</strong><p>Workstation A can investigate independently. Its completion will appear here automatically when saved.</p></div>
        <div class="fix-actions"><button type="button" class="fix-btn" id="fix-run-tests">▶ Run simulated security tests</button><span class="fix-muted">You can test and revise before submitting.</span></div>
        <div class="fix-test-results" id="fix-test-results" aria-live="polite"><p class="fix-muted">Choose your patch options, then run tests.</p></div>
      </article>
      <article class="fix-panel">
        <div class="fix-panel-label">OFFICIAL PATCH REVIEW / SERVER-SCORED</div>
        <h3>Choose the security fixes</h3><p class="fix-help">The options below update the mock code preview. Submit only when you are satisfied with the outcome of your tests.</p>
        <div id="fix-task-b"><p class="fix-muted">Loading patch review…</p></div>
        <div class="fix-message" id="fix-result-b" aria-live="polite"></div>
      </article>
    </div>
  </section>

  <section class="fix-screen" id="fix-screen-joint" data-screen-panel="joint" aria-labelledby="fix-joint-title" hidden>
    <div class="fix-sectionhead"><div><span class="fix-kicker">TEAM VERIFICATION / SHARED MISSION</span><h2 id="fix-joint-title">Prove the portal can reopen.</h2><p>Both workstations must pass their own assessments. Then combine the investigation and repair results to make a final release decision.</p></div><span class="fix-role-tag">BOTH WORKSTATIONS</span></div>
    <div class="fix-columns fix-columns-narrow"><article class="fix-panel"><div class="fix-panel-label">RELEASE READINESS</div><h3>Deployment gate</h3><div class="fix-gate-row"><span>Investigation report</span><b id="fix-gate-a">Waiting</b></div><div class="fix-gate-row"><span>Security patch</span><b id="fix-gate-b">Waiting</b></div><div class="fix-gate-row"><span>Joint verification</span><b id="fix-gate-joint">Locked</b></div><div class="fix-notice fix-notice-embedded" id="fix-joint-gate">Waiting for Workstations A and B.</div></article>
      <article class="fix-panel"><div class="fix-panel-label">RELEASE AUTHORISATION / SERVER-SCORED</div><h3>Final security assessment</h3><div id="fix-task-joint"><p class="fix-muted">Loading final assessment…</p></div><div id="fix-result-joint" class="fix-message" aria-live="polite"></div><div class="fix-reward" id="fix-reward" hidden><span class="fix-reward-icon">✓</span><div><strong>PORTAL SECURED</strong><small>Recovery key awarded to your group and recorded on the leaderboard</small></div></div></article>
    </div>
  </section>

  <section class="fix-screen" id="fix-screen-bonus" data-screen-panel="bonus" aria-labelledby="fix-bonus-title" hidden>
    <div class="fix-sectionhead"><div><span class="fix-kicker">OPTIONAL / FAST TEAM INCIDENT</span><h2 id="fix-bonus-title">Unexpected regression detected.</h2><p>The patch worked, but a normal feature stopped functioning afterwards. Investigate how to respond without undoing the security work.</p></div><span class="fix-role-tag">BONUS CHALLENGE</span></div>
    <div class="fix-columns fix-columns-narrow"><article class="fix-panel"><div class="fix-panel-label">AUTOMATED ALERT</div><div class="fix-incident"><strong>BUILD #024 FAILED</strong><p>Staff members can log in securely, but the profile update button now fails. Release engineers have flagged a potential regression.</p><div><span>AUTHENTICATION</span><b>PASS</b></div><div><span>PROFILE UPDATES</span><b class="fix-fail">FAIL</b></div><div><span>USER REPORTS</span><b>+7</b></div></div></article>
      <article class="fix-panel"><div class="fix-panel-label">OPTIONAL ASSESSMENT</div><h3>Choose the next action</h3><div id="fix-task-bonus"><p class="fix-muted">Loading challenge…</p></div><div id="fix-result-bonus" class="fix-message" aria-live="polite"></div></article></div>
  </section>

  <section class="fix-bottom"><div><strong>LIVE WORKSHOP COMMUNICATIONS</strong><p id="fix-sync">Waiting for the first database update…</p></div><div class="fix-log" id="fix-log" aria-live="polite"><span>Log in through the Mission Hub to begin.</span></div></section>
  <footer class="site-footer"><span>OPERATION LOCKDOWN 2.0</span><span>FIX IT / SOFTWARE SECURITY</span><span>ALL USERS AND DATA IN THIS EXERCISE ARE FICTIONAL</span></footer>
</main>
<script src="/assets/js/ui.js" defer></script>
<script type="module" src="/assets/js/fix-it.js"></script>
</body>
</html>
