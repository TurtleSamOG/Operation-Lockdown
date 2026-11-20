<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/scoring.php';
api_method('POST');
api_guard(function (): array {
    $facilitator=require_facilitator();
    $data=json_input(); $action=(string)($data['action']??'');
    $db=lockdown_db();
    if (in_array($action,['reset_group','award_key'],true)) {
        $slug=(string)($data['team']??'');
        $s=$db->prepare('SELECT id FROM `groups` WHERE slug=?'); $s->execute([$slug]);
        $groupId=(int)$s->fetchColumn();
        if (!$groupId) api_fail('Unknown group.');
        if ($action==='reset_group') {
            if (($data['confirm']??'') !== 'RESET') api_fail('Confirm reset by sending confirm: RESET.');
            $db->beginTransaction();
            try {
                foreach (['task_attempts','task_results','recovery_keys','finale_results'] as $table) {
                    $s=$db->prepare("DELETE FROM `$table` WHERE group_id=?"); $s->execute([$groupId]);
                }
                $db->commit();
            } catch (Throwable $e) { $db->rollBack(); throw $e; }
        } else {
            $zone=(string)($data['zone']??'');
            $reason=trim((string)($data['reason']??''));
            if (strlen($reason)<5) api_fail('Provide a reason for overriding a key.');
            complete_zone_for_group($groupId,$zone,true);
        }
    } elseif (in_array($action,['start_timer','pause_timer','reset_timer','next_round','reset_rounds','set_minutes'],true)) {
        $settings=event_settings();
        $elapsed=$settings['roundMinutes']*60-$settings['secondsRemaining'];
        $updates=[];
        if ($action==='start_timer' && !$settings['timerRunning']) { $updates=['timer_status'=>'running','timer_started_at'=>(string)time()]; }
        if ($action==='pause_timer') { $updates=['timer_status'=>'paused','timer_elapsed'=>(string)$elapsed,'timer_started_at'=>'']; }
        if ($action==='reset_timer') { $updates=['timer_status'=>'paused','timer_elapsed'=>'0','timer_started_at'=>'']; }
        if ($action==='next_round') { $updates=['active_round'=>(string)min(3,$settings['activeRound']+1),'timer_status'=>'paused','timer_elapsed'=>'0','timer_started_at'=>'']; }
        if ($action==='reset_rounds') { $updates=['active_round'=>'1','timer_status'=>'paused','timer_elapsed'=>'0','timer_started_at'=>'']; }
        if ($action==='set_minutes') {
            $minutes=(int)($data['minutes']??0);
            if ($minutes<5 || $minutes>60) api_fail('Round duration must be between 5 and 60 minutes.');
            $updates=['round_minutes'=>(string)$minutes,'timer_status'=>'paused','timer_elapsed'=>'0','timer_started_at'=>''];
        }
        foreach ($updates as $key=>$value) {
            $s=$db->prepare('INSERT INTO event_settings(setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)');
            $s->execute([$key,$value]);
        }
    } else {
        api_fail('Unknown facilitator action.');
    }
    $s=$db->prepare('INSERT INTO facilitator_audit(facilitator_id,action_name,details_json) VALUES (?,?,?)');
    $s->execute([(int)$facilitator['id'],$action,json_encode($data)]);
    return ['ok'=>true,'leaderboard'=>leaderboard_data()];
});
