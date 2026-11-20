<?php
declare(strict_types=1);
if (PHP_SAPI!=='cli') exit("Run in terminal only.\n");
require_once __DIR__.'/../main-system/lib/database.php';
$slug=$argv[1]??'';
if (!in_array($slug,['alpha','bravo','charlie'],true)) exit("Usage: php database/reset-group-pin.php alpha|bravo|charlie\n");
$pin=strtoupper(bin2hex(random_bytes(6)));
$s=lockdown_db()->prepare('UPDATE `groups` SET pin_hash=? WHERE slug=?');
$s->execute([password_hash($pin,PASSWORD_DEFAULT),$slug]);
if ($s->rowCount()===0) exit("Unknown group; run seed.php first.\n");
echo "NEW $slug PIN: $pin — save securely and give only to that group.\n";
