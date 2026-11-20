<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/finale.php';
api_method('POST');
api_guard(function():array{
    $team=require_team();$input=json_input();
    if (!isset($input['answers']) || !is_array($input['answers'])) api_fail('Provide an answers object.');
    return submit_finale((int)$team['id'],$input['answers']);
});
