<?php
/** Read-only team and workstation identity for the Defend It screen. */
declare(strict_types=1);
require_once __DIR__ . '/../../main-system/lib/auth.php';
api_method('GET');
api_guard(static function (): array {
    $team = require_team();
    return [
        'ok'=>true,
        'group'=>(string)$team['slug'],
        'groupName'=>(string)$team['display_name'],
        'workingUnit'=>(string)$team['unit_code'],
        'workstation'=>(string)$team['workstation'],
    ];
});
