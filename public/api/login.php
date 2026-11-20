<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/auth.php';
api_method('POST');
api_guard(function (): array {
    $data=json_input();
    $pin=strtoupper(trim((string)($data['teamCode']??'')));
    $unit=(string)($data['unitCode']??'1');
    $workstation=strtoupper((string)($data['workstation']??'A'));
    $selected=(string)($data['team']??'');
    if (!preg_match('/^[A-Z0-9]{8,16}$/',$pin) || !in_array($unit,['1','2','3'],true) || !in_array($workstation,['A','B'],true)) api_fail('Invalid team code or working unit.',401);
    lockdown_session();
    $attempts=(int)($_SESSION['login_failures']??0);
    if ($attempts>=10) api_fail('Too many attempts. Ask a facilitator for assistance.',429);
    $groups=lockdown_db()->query('SELECT id,slug,display_name,pin_hash FROM `groups` WHERE active=1')->fetchAll();
    $matched=null;
    foreach ($groups as $candidate) {
        if (password_verify($pin,$candidate['pin_hash'])) { $matched=$candidate; break; }
    }
    if (!$matched || ($selected!=='' && $selected!==$matched['slug'])) {
        $_SESSION['login_failures']=$attempts+1;
        api_fail('Team code not recognised for that group.',401);
    }
    $s=lockdown_db()->prepare('SELECT id,unit_code FROM working_units WHERE group_id=? AND unit_code=?');
    $s->execute([$matched['id'],$unit]); $workingUnit=$s->fetch();
    if (!$workingUnit) api_fail('Working unit is not available.',401);
    group_session_login($matched,$workingUnit,$workstation);
    $_SESSION['login_failures']=0;
    return ['ok'=>true,'team'=>$matched['slug'],'groupName'=>$matched['display_name'], 'workingUnit'=>$unit,'workstation'=>$workstation,'csrfToken'=>csrf_token()];
});
