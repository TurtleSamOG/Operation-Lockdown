<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/bootstrap.php';
api_method('GET');
lockdown_session();
api_json(['ok'=>true,'csrfToken'=>csrf_token(),'loggedIn'=>!empty($_SESSION['group_id']), 'facilitator'=>!empty($_SESSION['facilitator_id'])]);
