<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/scoring.php';
api_method('GET');
api_guard(function (): array {
    $team=require_team();
    $state=group_state((int)$team['id'],$team['unit_code']);
    $state['workstation']=$team['workstation'];
    return $state;
});
