<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/scoring.php';
api_method('GET');
api_guard(function (): array {
    require_team();
    $zone=(string)($_GET['zone']??'');
    if (!in_array($zone,['train','fix','defend'],true)) api_fail('Unknown zone.');
    $tasks=[];
    foreach (lockdown_catalog() as $id=>$task) {
        if ($task['zone']===$zone) $tasks[]=public_task($id,$task);
    }
    return ['ok'=>true,'zone'=>$zone,'tasks'=>$tasks];
});
