<?php declare(strict_types=1); ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#08131f">
  <meta name="description" content="Operation Lockdown 2.0 — interactive office incident response simulator">
  <title>Defend It | Office Under Pressure — Operation Lockdown 2.0</title>
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/app.css"><link rel="stylesheet" href="/assets/css/system.css">
  <link rel="stylesheet" href="/assets/css/polish.css"><link rel="stylesheet" href="/assets/css/defend.css">
</head>
<body class="page-defend">
<header class="site-header">
  <a class="brand" href="/" aria-label="Operation Lockdown home"><span class="brand-mark"><img src="/assets/img/shield-mark.svg" alt="" width="42" height="42"></span><span class="brand-text"><strong>OPERATION <span>LOCKDOWN</span></strong><small>T-LEVEL EXPERIENCE <b class="brand-version">/ 2.0</b></small></span></a>
  <nav aria-label="Main navigation"><a href="/">Mission hub</a><a href="/leaderboard/">Live scores</a><a href="/facilitator/">Staff control</a><span class="connection-indicator" data-connection-status="checking" role="status">Checking API</span></nav>
</header>
<main class="system defend-shell">
  <div class="topline"><span><span class="topline-dot"></span> OPERATION LOCKDOWN / INCIDENT CONTROL</span><span>03 · DEFEND IT / RESPONSE SIMULATOR</span></div>
  <section class="defend-hero">
    <div>
      <div class="def-kicker"><span class="def-red-led"></span> INCIDENT STATUS: ACTIVE <span class="def-grey-text">/ OFFICE DISTRICT 04</span></div>
      <h1 class="hero def-title">The office is <span class="def-emphasis">under pressure.</span></h1>
      <p class="subtitle">A power failure has disrupted the company. Suspicious visitors, compromised computers and social engineering attempts are happening at the same time. Investigate the town, enter the building, and coordinate a safe response.</p>
      <div class="def-hero-chips"><span>INTERACTIVE CITY</span><span>2 OFFICE FLOORS</span><span>LIVE GROUP PROGRESS</span></div>
    </div>
    <div class="def-hero-status" aria-label="Active incident summary"><span class="def-small-label">PRIORITY ONE / LIVE INCIDENT</span><div class="def-hazard-icon">!</div><strong>Multiple systems affected</strong><span>Security and operations teams requested</span><div class="def-hazard-footer"><b>POWER FAILURE</b><b>ACCESS ALERT</b><b>IT INCIDENT</b></div></div>
  </section>
  <div id="def-alert" class="def-alert def-pending" role="status" aria-live="polite">Connecting to mission control…</div>
  <section class="def-metrics" aria-label="Current group progress">
    <div><small>ACTIVE GROUP</small><strong id="def-group">Checking…</strong><span id="def-unit">Loading session</span></div>
    <div><small>YOUR WORKSTATION</small><strong id="def-station">—</strong><span>Separate A / B objectives</span></div>
    <div><small>OFFICIAL DEFEND SCORE</small><strong id="def-score">0 <em>/100</em></strong><span id="def-completed">0 / 3 required challenges</span></div>
    <div><small>RECOVERY KEY</small><strong id="def-key">LOCKED</strong><span>THREAT CONTAINED</span></div>
  </section>
  <div class="def-main-grid">
    <aside class="def-sidebar">
      <div class="def-panel def-sidepanel"><div class="def-panel-kicker">YOUR MISSIONS</div><h2>Response operations</h2><p>Each workstation has its own part of the investigation. Both contribute to one group result.</p>
        <nav class="def-stage-nav" aria-label="Defend It missions">
          <button data-stage="a" type="button" class="def-stage is-selected"><span class="def-stage-index">01</span><span><strong>Town investigation</strong><small>Workstation A · Exterior alerts</small></span><b id="def-nav-a">—</b></button>
          <button data-stage="b" type="button" class="def-stage"><span class="def-stage-index">02</span><span><strong>Office response</strong><small>Workstation B · Interior systems</small></span><b id="def-nav-b">—</b></button>
          <button data-stage="joint" type="button" class="def-stage"><span class="def-stage-index">03</span><span><strong>Joint incident review</strong><small>Both stations · Recovery</small></span><b id="def-nav-joint">—</b></button>
          <button data-stage="bonus" type="button" class="def-stage"><span class="def-stage-index">+</span><span><strong>Extra emergency</strong><small>Optional · Fast groups</small></span><b id="def-nav-bonus">—</b></button>
        </nav><div class="def-sync"><span class="def-pulse"></span><span id="def-sync-text">Waiting for updates</span></div>
      </div>
      <div class="def-panel def-sidepanel"><div class="def-panel-kicker">SHARED STATUS</div><h3>Operations board</h3><div class="def-gate-row"><span>Exterior report</span><b id="def-gate-a">WAITING</b></div><div class="def-gate-row"><span>Interior response</span><b id="def-gate-b">WAITING</b></div><div class="def-gate-row"><span>Joint verification</span><b id="def-gate-joint">LOCKED</b></div><p class="def-side-note">Results are shared with your rotation group. Your local map discoveries are practice; official submissions are checked and scored by the server.</p></div>
      <div class="def-panel def-sidepanel"><div class="def-panel-kicker">ACTIVITY LOG</div><div class="def-activity" id="def-log" aria-live="polite"><span>Waiting for the first investigation…</span></div></div>
    </aside>
    <div class="def-content">
      <section class="def-panel def-stage-panel" data-stage-panel="a">
        <div class="def-panel-heading"><div><div class="def-panel-kicker">STATION A / EXTERIOR INTELLIGENCE</div><h2>Town situation map</h2><p>Investigate the active markers and build an incident report for the response team. Try the marked power cabinet, entrance and car park.</p></div><span class="def-role">FIELD ANALYST</span></div>
        <div class="def-map-head"><span><i class="def-live-dot"></i> TOWN CENTRE · DISTRICT 04</span><span>MAP LAYER / EXTERIOR</span></div>
        <div class="def-map-wrap">
          <svg class="def-city-svg" viewBox="0 0 900 510" role="img" aria-label="Interactive town map showing an office, damaged utility box, parking and reception entrance" xmlns="http://www.w3.org/2000/svg">
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
            <g class="def-map-hotspot" tabindex="0" role="button" aria-label="Inspect power cabinet damage" data-site="power"><rect x="89" y="177" width="71" height="61" rx="7" fill="#243e49" stroke="#fba16f" stroke-width="2"/><path d="M124 187L111 214H135z" fill="#ffae7a"/><text x="124" y="208" font-size="16" text-anchor="middle" fill="#2c2c38" font-weight="900">!</text><text x="125" y="252" fill="#f9bf9c" text-anchor="middle" font-size="11" font-weight="800">POWER FAULT</text></g>
            <g class="def-map-hotspot" tabindex="0" role="button" aria-label="Inspect office entrance and access alert" data-site="entrance"><rect x="469" y="289" width="53" height="34" rx="4" fill="#294e5d" stroke="#ff9a8b" stroke-width="2"/><path d="M495 265L476 289H514z" fill="#ed716d"/><text x="495" y="284" text-anchor="middle" font-weight="900" fill="white" font-size="16">!</text><text x="497" y="337" fill="#ffb7a8" font-size="11" font-weight="800" text-anchor="middle">ACCESS ALERT</text></g>
            <g class="def-map-hotspot" tabindex="0" role="button" aria-label="Inspect car park security report" data-site="parking"><rect x="481" y="446" width="53" height="37" rx="5" fill="#38535e" stroke="#f5c379" stroke-width="2"/><path d="M508 417L492 439H524z" fill="#e4b466"/><text x="508" y="436" text-anchor="middle" fill="#2d2a2a" font-size="14" font-weight="900">!</text><text x="507" y="410" text-anchor="middle" fill="#f4d0a1" font-size="10" font-weight="800">PARKING</text><rect x="479" y="400" width="58" height="85" fill="transparent" stroke="none"/></g>
            <g class="def-map-hotspot" tabindex="0" role="button" aria-label="Inspect vehicle collision and surrounding road" data-site="collision"><rect x="178" y="360" width="60" height="26" rx="10" fill="#b76f61" stroke="#e7a493" stroke-width="2"/><rect x="191" y="355" width="29" height="8" rx="4" fill="#243943"/><path d="M242 368l11 -10 14 15" stroke="#f4be94" fill="none" stroke-width="2"/><text x="208" y="405" text-anchor="middle" fill="#f4d3b9" font-size="10">VEHICLE COLLISION</text></g>
            <g class="def-map-hotspot" tabindex="0" role="button" aria-label="Inspect office building" data-site="office"><rect x="277" y="258" width="126" height="39" rx="5" fill="#0d2935" stroke="#5ed9cb" stroke-width="1.5"/><text x="340" y="274" fill="#a4fff0" text-anchor="middle" font-size="11" font-weight="900">ENTER BUILDING</text><text x="340" y="287" fill="#75c8ce" text-anchor="middle" font-size="9">INTERIOR MAP</text></g>
            <g fill="#82a3ad" font-family="monospace" font-size="9" letter-spacing="2"><text x="24" y="88">NORTH STREET</text><text x="24" y="365">RIVERSIDE ROAD</text><text transform="translate(710,182) rotate(90)">CENTRAL AVENUE</text><text x="20" y="22">SECTOR 04  /  LIVE MAP</text></g>
          </svg>
          <div class="def-map-corner">● CLICK HIGHLIGHTED LOCATIONS TO INVESTIGATE</div>
        </div>
        <div class="def-explorer"><div class="def-evidence-box"><div class="def-panel-kicker">EVIDENCE INSPECTOR</div><h3 id="def-evidence-title">Select an alert on the map</h3><p id="def-evidence-body">Start with the damaged electrical cabinet, the office entrance or the car park. Each location reveals clues for your team's report.</p><div id="def-evidence-details" class="def-evidence-details"></div><button type="button" id="def-record" class="def-btn def-btn-primary" disabled>Record observation</button></div><div class="def-checklist-box"><div class="def-panel-kicker">FIELD NOTES</div><strong id="def-evidence-count">0 / 3 required clues</strong><div class="def-evidence-list"><span data-clue="power">Power cabinet report</span><span data-clue="entrance">Access-control report</span><span data-clue="parking">Car-park report</span></div><p>These discoveries are practice evidence. Your official answers are submitted separately to Mission Control.</p></div></div>
        <div class="def-step-bar"><span>STATION A · FINAL STEP</span><strong>Submit your exterior incident assessment</strong></div><div id="def-task-a" class="def-assessment"></div><div id="def-result-a" class="def-result" aria-live="polite"></div>
      </section>
      <section class="def-panel def-stage-panel" data-stage-panel="b" hidden>
        <div class="def-panel-heading"><div><div class="def-panel-kicker">STATION B / INTERIOR RESPONSE</div><h2>Office operations map</h2><p>Explore affected rooms on both floors. Identify the systems at risk and practise choosing protective actions.</p></div><span class="def-role">INCIDENT COMMANDER</span></div>
        <div class="def-floor-toolbar"><span>OFFICE / INTERIOR</span><div role="group" aria-label="Choose floor"><button type="button" data-floor="ground" class="is-current">Ground floor</button><button type="button" data-floor="first">First floor</button></div></div>
        <div class="def-floor-plan"><div class="def-corridor">MAIN ACCESS CORRIDOR / OFFICE HQ</div><div id="def-rooms" class="def-rooms"></div></div>
        <div class="def-explorer"><div class="def-evidence-box"><div class="def-panel-kicker">ROOM INSPECTOR</div><h3 id="def-room-title">Select a room</h3><p id="def-room-body">Visit the server room, IT support area and employee workspace to uncover threats.</p><div id="def-room-details" class="def-evidence-details"></div><button type="button" id="def-room-record" class="def-btn def-btn-primary" disabled>Log room inspection</button></div><div class="def-checklist-box"><div class="def-panel-kicker">INTERIOR EVIDENCE</div><strong id="def-room-count">0 / 3 required rooms</strong><div class="def-evidence-list"><span data-room-needed="server">Server room</span><span data-room-needed="it">IT support</span><span data-room-needed="workers">Employee workspace</span></div><p>The exterior team can continue independently while you examine the building.</p></div></div>
        <div class="def-step-bar"><span>RESPONSE SIMULATION</span><strong>Choose your incident priorities</strong></div><p class="def-muted">These local choices show simulated effects. Only the official assessment below changes the shared leaderboard.</p><div id="def-responses" class="def-response-list"></div><div class="def-sim-meters"><div><span>SIMULATED SAFETY</span><strong id="def-safety">65%</strong><meter id="def-safety-meter" min="0" max="100" value="65"></meter></div><div><span>SIMULATED SECURITY</span><strong id="def-security">55%</strong><meter id="def-security-meter" min="0" max="100" value="55"></meter></div><div><span>SIMULATED OPERATIONS</span><strong id="def-operations">42%</strong><meter id="def-operations-meter" min="0" max="100" value="42"></meter></div></div>
        <div class="def-step-bar"><span>STATION B · FINAL STEP</span><strong>Submit your response assessment</strong></div><div id="def-task-b" class="def-assessment"></div><div id="def-result-b" class="def-result" aria-live="polite"></div>
      </section>
      <section class="def-panel def-stage-panel" data-stage-panel="joint" hidden>
        <div class="def-panel-heading"><div><div class="def-panel-kicker">SHARED MISSION / BOTH WORKSTATIONS</div><h2>Recover the organisation</h2><p>Combine exterior evidence and interior response decisions. Both A and B must pass their official reports before the team can complete its joint assessment.</p></div><span class="def-role">JOINT COMMAND</span></div>
        <div id="def-joint-gate" class="def-gate-notice">Waiting for your teammates…</div>
        <div class="def-step-bar"><span>COLLABORATIVE EXERCISE</span><strong>Reconstruct the emergency response timeline</strong></div>
        <p class="def-muted">Choose the order of three important actions. This is a practice exercise; the official joint question is graded by the server.</p>
        <div class="def-timeline-options" id="def-timeline-options"><button type="button" data-step="record">Document evidence and confirm recovery</button><button type="button" data-step="protect">Protect people and assess immediate hazards</button><button type="button" data-step="contain">Contain affected systems and preserve critical services</button></div>
        <div id="def-timeline-preview" class="def-timeline-preview">Select the first response step…</div><div class="def-inline-buttons"><button type="button" id="def-timeline-check" class="def-btn def-btn-primary">Check sequence</button><button type="button" id="def-timeline-clear" class="def-btn def-btn-muted">Reset sequence</button></div>
        <div id="def-timeline-feedback" class="def-result" aria-live="polite"></div><div class="def-step-bar"><span>FINAL VERIFICATION</span><strong>Complete the joint incident review</strong></div><div id="def-task-joint" class="def-assessment"></div><div id="def-result-joint" class="def-result" aria-live="polite"></div>
        <div id="def-key-award" class="def-reward" hidden><span class="def-reward-icon">◇</span><div><small>RECOVERY KEY AWARDED</small><strong>THREAT CONTAINED</strong><p>One step closer to restoring company operations. Your team progress is saved.</p></div></div>
      </section>
      <section class="def-panel def-stage-panel" data-stage-panel="bonus" hidden>
        <div class="def-panel-heading"><div><div class="def-panel-kicker">OPTIONAL EMERGENCY / ADVANCED TEAM</div><h2>The backup didn't restore.</h2><p>A secondary incident strikes while the response team is recovering systems. Can you make the right escalation decision?</p></div><span class="def-role def-role-warn">EXTRA CHALLENGE</span></div>
        <div class="def-bonus-brief"><span>NEW ALERT 04:52</span><h3>Backup verification failed</h3><p>The backup console reports a completed copy, but a recovery test cannot open the data. Staff are asking whether operations can safely resume.</p><ul><li>One recent backup is unverified.</li><li>An older recovery point has passed testing.</li><li>The company needs a documented recovery decision.</li></ul></div>
        <div id="def-task-bonus" class="def-assessment"></div><div id="def-result-bonus" class="def-result" aria-live="polite"></div>
      </section>
    </div>
  </div>
  <footer class="site-footer"><span>OPERATION LOCKDOWN 2.0</span><span>DEFEND IT / INTERACTIVE INCIDENT RESPONSE</span><span>ALL DATA IS FICTIONAL</span></footer>
</main>
<script src="/assets/js/ui.js" defer></script><script type="module" src="/assets/js/defend.js"></script>
</body></html>
