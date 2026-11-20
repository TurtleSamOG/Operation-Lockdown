<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/scoring.php';
api_method('POST');
api_guard(function (): array {
    $team=require_team(); $input=json_input();
    return complete_zone_for_group((int)$team['id'],(string)($input['zone']??''));
});
