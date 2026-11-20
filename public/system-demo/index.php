<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/bootstrap.php';
if (env_value('APP_ENV', 'production') !== 'local') {
    http_response_code(404);exit('Not found');
}
?><!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Development: API Test Bench</title><link rel="stylesheet" href="/assets/css/app.css"><link rel="stylesheet" href="/assets/css/system.css"></head><body><header><strong>OPERATION LOCKDOWN · LOCAL TEST ONLY</strong><nav><a href="/">Home</a></nav></header><main class="system"><div class="eyebrow">Szymon — Main System</div><h1 class="hero">API Test Bench</h1><p class="subtitle">Use this local-only page to test task submissions and recovery keys before the zone developers connect their screens. It is inaccessible when APP_ENV is production.</p>
<div class="system-card"><p id="identity">Checking team login…</p><label for="zone">Zone</label><select id="zone"><option value="train">Train It</option><option value="fix">Fix It</option><option value="defend">Defend It</option></select><div class="actions"><button class="action" id="load">Load challenges</button><button class="action secondary" id="key">Collect completed zone key</button></div><p id="message" class="message" role="status"></p></div>
<div id="tasks"></div></main><script type="module" src="/assets/js/test-bench.js"></script></body></html>
