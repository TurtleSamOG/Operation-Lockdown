<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/scoring.php';
api_method('GET');
api_guard(function (): array {
    $user=require_facilitator();
    $state=leaderboard_data();
    $state['facilitator']=$user['username'];
    return $state;
});
