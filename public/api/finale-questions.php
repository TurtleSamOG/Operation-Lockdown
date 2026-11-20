<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/finale.php';
api_method('GET');
api_guard(function():array{
    $team=require_team();$state=group_state((int)$team['id']);
    return ['ok'=>true,'ready'=>$state['finaleReady'],'questions'=>$state['finaleReady']?public_finale_questions():[],
        'scores'=>$state['scores'],'keys'=>$state['keys']];
});
