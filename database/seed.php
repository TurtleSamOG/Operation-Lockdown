<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit("Run this script in the terminal only.\n");
require_once __DIR__.'/../main-system/lib/scoring.php';
$db=lockdown_db();
$db->beginTransaction();
try {
    foreach (['alpha'=>'Group Alpha','bravo'=>'Group Bravo','charlie'=>'Group Charlie'] as $slug=>$name) {
        $s=$db->prepare('SELECT id FROM `groups` WHERE slug=?'); $s->execute([$slug]);
        $row=$s->fetch();
        if ($row) { $groupId=(int)$row['id']; echo "$name already exists; PIN not changed.\n"; }
        else {
            $pin=strtoupper(bin2hex(random_bytes(6)));
            $s=$db->prepare('INSERT INTO `groups` (slug,display_name,pin_hash) VALUES (?,?,?)');
            $s->execute([$slug,$name,password_hash($pin,PASSWORD_DEFAULT)]);
            $groupId=(int)$db->lastInsertId();
            echo "$name access code: $pin (SAVE THIS NOW; it is not stored in plaintext)\n";
        }
        foreach (['1','2','3'] as $unit) {
            $s=$db->prepare('INSERT IGNORE INTO working_units (group_id,unit_code) VALUES (?,?)');
            $s->execute([$groupId,$unit]);
        }
    }
    foreach (lockdown_catalog() as $taskId=>$spec) {
        $s=$db->prepare('INSERT INTO tasks (task_id,zone,station,title,pass_percent,required,max_scored_attempts) VALUES (?,?,?,?,?,?,3) ON DUPLICATE KEY UPDATE zone=VALUES(zone),station=VALUES(station),title=VALUES(title),pass_percent=VALUES(pass_percent),required=VALUES(required)');
        $s->execute([$taskId,$spec['zone'],$spec['station'],$spec['title'],$spec['pass'],$spec['required']?1:0]);
    }
    $defaults=['round_minutes'=>'30','active_round'=>'1','timer_status'=>'paused','timer_elapsed'=>'0','timer_started_at'=>''];
    foreach ($defaults as $key=>$value) {
        $s=$db->prepare('INSERT IGNORE INTO event_settings(setting_key,setting_value) VALUES (?,?)'); $s->execute([$key,$value]);
    }
    $db->commit();
    echo "Database seed complete.\n";
} catch (Throwable $e) { $db->rollBack(); throw $e; }
