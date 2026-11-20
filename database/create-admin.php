<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit("Run in terminal only.\n");
require_once __DIR__.'/../main-system/lib/database.php';
$username=$argv[1] ?? 'facilitator';
if (!preg_match('/^[a-zA-Z0-9_-]{3,40}$/',$username)) exit("Invalid username.\n");
$pass=getenv('LOCKDOWN_NEW_ADMIN_PASSWORD');
if (!$pass) {
    echo "Facilitator password (visible while typing in some terminals): ";
    $pass=trim(fgets(STDIN)?:'');
}
if (strlen($pass)<12) exit("Use at least 12 characters.\n");
$s=lockdown_db()->prepare('INSERT INTO facilitators(username,password_hash) VALUES (?,?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)');
$s->execute([$username,password_hash($pass,PASSWORD_DEFAULT)]);
echo "Facilitator '$username' created/updated.\n";
