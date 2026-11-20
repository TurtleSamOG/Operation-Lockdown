<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/bootstrap.php';
api_method('POST');
lockdown_session();
$_SESSION=[];
session_regenerate_id(true);
$_SESSION['csrf']=bin2hex(random_bytes(32));
api_json(['ok'=>true,'csrfToken'=>csrf_token()]);
