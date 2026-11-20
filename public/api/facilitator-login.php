<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/auth.php';
api_method('POST');
api_guard(function (): array {
    $data=json_input();
    $user=trim((string)($data['username']??''));
    $password=(string)($data['password']??'');
    lockdown_session();
    if ((int)($_SESSION['admin_failures']??0)>=8) api_fail('Too many attempts in this browser. Please ask another facilitator.',429);
    $s=lockdown_db()->prepare('SELECT id,password_hash FROM facilitators WHERE username=?');
    $s->execute([$user]); $row=$s->fetch();
    if (!$row || !password_verify($password,$row['password_hash'])) {
        $_SESSION['admin_failures']=(int)($_SESSION['admin_failures']??0)+1;
        api_fail('Invalid facilitator credentials.',401);
    }
    facilitator_session_login((int)$row['id']);
    return ['ok'=>true,'csrfToken'=>csrf_token()];
});
