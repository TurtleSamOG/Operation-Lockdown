<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/task-catalog.php';

function group_state(int $groupId, ?string $unitCode = null): array
{
    $db = lockdown_db();
    $s = $db->prepare('SELECT id, slug, display_name FROM `groups` WHERE id=?');
    $s->execute([$groupId]);
    $group = $s->fetch();
    if (!$group) throw new RuntimeException('Group not found.');
    $s = $db->prepare('SELECT t.task_id, t.zone, t.required, r.best_score, r.passed, (SELECT COUNT(*) FROM task_attempts a WHERE a.group_id=r.group_id AND a.task_ref=r.task_ref) attempts FROM task_results r JOIN tasks t ON t.id=r.task_ref WHERE r.group_id=?');
    $s->execute([$groupId]);
    $results = []; $completed = [];
    foreach ($s->fetchAll() as $r) {
        $results[$r['task_id']] = [
            'score'=>(int)$r['best_score'], 'passed'=>(bool)$r['passed'],
            'attempts'=>(int)$r['attempts'], 'zone'=>$r['zone'],
        ];
        if ((bool)$r['passed']) $completed[] = $r['task_id'];
    }
    $keysStmt = $db->prepare('SELECT zone,key_code FROM recovery_keys WHERE group_id=?');
    $keysStmt->execute([$groupId]);
    $keys=[]; $zoneKeys=[];
    foreach ($keysStmt->fetchAll() as $k) { $keys[]=$k['key_code']; $zoneKeys[$k['zone']]=$k['key_code']; }
    $scores = ['train'=>0,'fix'=>0,'defend'=>0]; $status=[];
    $catalog = lockdown_catalog();
    foreach ($scores as $zone => $_) {
        $zoneTasks = array_filter($catalog, static fn($t) => $t['zone']===$zone && $t['required']);
        $total = count($zoneTasks);
        $sum=0; $done=0;
        foreach ($zoneTasks as $taskId => $task) {
            $sum += $results[$taskId]['score'] ?? 0;
            if ($results[$taskId]['passed'] ?? false) $done++;
        }
        $scores[$zone] = $total ? (int)round($sum/$total) : 0;
        $status[$zone] = ['completed'=>$done,'total'=>$total,'keyEarned'=>isset($zoneKeys[$zone]), 'finished'=>$done===$total && $total>0];
    }
    $s=$db->prepare('SELECT best_score,completed,attempts FROM finale_results WHERE group_id=?');
    $s->execute([$groupId]); $finaleResult=$s->fetch();
    $finale=['bestScore'=>(int)($finaleResult['best_score']??0),
        'completed'=>(bool)($finaleResult['completed']??false),
        'attempts'=>(int)($finaleResult['attempts']??0)];
    return [
        'ok'=>true, 'finale'=>$finale, 'team'=>$group['slug'], 'group'=>$group['slug'], 'groupName'=>$group['display_name'],
        'workingUnit'=>$unitCode, 'scores'=>$scores, 'totalScore'=>array_sum($scores),
        'keys'=>$keys, 'zoneKeys'=>$zoneKeys,
        'completedTasks'=>$completed, 'taskResults'=>$results, 'zones'=>$status,
        'finaleReady'=>count($keys)===3,
    ];
}

function leaderboard_data(): array
{
    $db=lockdown_db();
    $groups=$db->query('SELECT id, slug, display_name FROM `groups` WHERE active=1 ORDER BY id')->fetchAll();
    $result=[];
    foreach ($groups as $g) {
        $state=group_state((int)$g['id']);
        $result[]=[
            'team'=>$state['team'], 'name'=>$state['groupName'],
            'scores'=>$state['scores'], 'totalScore'=>$state['totalScore'], 'finale'=>$state['finale'],
            'keys'=>$state['keys'], 'keyCount'=>count($state['keys']),
            'zones'=>$state['zones'], 'finaleReady'=>$state['finaleReady'],
        ];
    }
    usort($result, static fn($a,$b) => ($b['totalScore']<=>$a['totalScore']) ?: ($b['finale']['bestScore']<=>$a['finale']['bestScore']) ?: ($b['keyCount']<=>$a['keyCount']) ?: strcmp($a['name'],$b['name']));
    foreach ($result as $i => &$row) $row['rank']=$i+1;
    unset($row);
    return ['ok'=>true, 'teams'=>$result, 'settings'=>event_settings()];
}

function event_settings(): array
{
    $values = ['round_minutes'=>30,'active_round'=>1,'timer_status'=>'paused','timer_elapsed'=>0,'timer_started_at'=>''];
    foreach (lockdown_db()->query('SELECT setting_key,setting_value FROM event_settings') as $row) {
        $values[$row['setting_key']]=$row['setting_value'];
    }
    $duration = max(1,(int)$values['round_minutes'])*60;
    $elapsed = max(0,(int)$values['timer_elapsed']);
    if ($values['timer_status']==='running' && $values['timer_started_at']!=='') {
        $elapsed += max(0,time()-(int)$values['timer_started_at']);
    }
    return ['roundMinutes'=>(int)$values['round_minutes'], 'activeRound'=>(int)$values['active_round'],
        'timerRunning'=>$values['timer_status']==='running',
        'secondsRemaining'=>max(0,$duration-$elapsed)];
}

function complete_zone_for_group(int $groupId, string $zone, bool $facilitatorOverride=false): array
{
    $keys = zone_keys();
    if (!isset($keys[$zone])) api_fail('Unknown zone.');
    $db=lockdown_db();
    $state=group_state($groupId);
    if (!$facilitatorOverride && !$state['zones'][$zone]['finished']) {
        api_fail('Complete the required A, B and joint tasks before collecting this key.', 409);
    }
    $s=$db->prepare('INSERT IGNORE INTO recovery_keys (group_id,zone,key_code,granted_by) VALUES (?,?,?,?)');
    $s->execute([$groupId,$zone,$keys[$zone],$facilitatorOverride?'facilitator':'system']);
    return group_state($groupId);
}
