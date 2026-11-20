<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Operation Lockdown | Mission Hub</title><link rel="stylesheet" href="/assets/css/app.css"><link rel="stylesheet" href="/assets/css/system.css"></head>
<body><header><strong>OPERATION LOCKDOWN 2.0</strong><nav><a href="/leaderboard/">Live scoreboard</a><a href="/facilitator/">Facilitators</a></nav></header>
<main class="system">
  <div class="eyebrow">T-Level Taster Day • Cyber Horizons</div>
  <h1 class="hero">Mission Control</h1>
  <p class="subtitle">Three rotating groups. Three connected challenges. One company to restore. Sign in using your group access code on both computers in your working unit.</p>
  <div class="layout">
    <section class="system-card" id="loginCard">
      <h2>Join your group</h2>
      <form id="loginForm">
        <label for="group">Rotation group</label><select id="group" required><option value="alpha">Group Alpha</option><option value="bravo">Group Bravo</option><option value="charlie">Group Charlie</option></select>
        <label for="unit">Working unit (use the same unit on both PCs)</label><select id="unit" required><option value="1">Unit 1</option><option value="2">Unit 2</option><option value="3">Unit 3</option></select>
        <label for="workstation">Which computer are you on?</label><select id="workstation" required><option value="A">Workstation A — investigation / training</option><option value="B">Workstation B — testing / response</option></select>
        <label for="pin">Group access code</label><input id="pin" type="password" autocomplete="off" required minlength="8" placeholder="Code from your facilitator">
        <div class="actions"><button type="submit" class="action">Join mission</button></div>
      </form>
      <p id="loginMessage" class="message" role="status"></p>
      <p class="note">Example: Alpha Unit 2 has two computers: one for activity A and one for activity B. Both sign in as Alpha / Unit 2.</p>
    </section>
    <section class="system-card hidden" id="teamCard">
      <div class="row"><h2 id="welcome">Group dashboard</h2><button id="logout" class="action small secondary">Switch group</button></div>
      <p class="muted" id="unitLabel"></p>
      <div class="grid3"><div class="stat"><div class="muted small">Overall score</div><div id="totalScore" class="stat-number">0</div><div class="tiny muted">Out of 300</div></div><div class="stat"><div class="muted small">Recovery keys</div><div id="keysCount" class="stat-number">0 / 3</div></div><div class="stat"><div class="muted small">Final mission</div><div id="finaleStatus" class="pill warn">Locked</div></div></div>
      <div id="zoneProgress" style="margin-top:1rem"></div>
    </section>
    <section class="system-card" id="zonesCard">
      <h2>Choose your current zone</h2><p class="muted">The facilitator will tell you which zone to visit during each rotation. Each zone has two linked workstation activities.</p>
      <div class="zone-list"><a class="zone-link" href="/train/"><strong>01 · Train It</strong>AI security lab</a><a class="zone-link" href="/fix/"><strong>02 · Fix It</strong>Employee portal</a><a class="zone-link" href="/defend/"><strong>03 · Defend It</strong>Office simulator</a></div>
      <div class="actions"><a class="action secondary" href="/finale/">Final recovery mission</a><a class="action secondary" href="/leaderboard/">Live leaderboard</a></div>
    </section>
  </div>
</main>
<script type="module" src="/assets/js/hub.js"></script></body></html>
