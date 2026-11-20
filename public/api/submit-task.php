<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/scoring.php';
api_method('POST');
api_guard(function (): array {
    $team=require_team();
    $input=json_input();
    $zone=(string)($input['zone']??''); $taskId=(string)($input['taskId']??'');
    $result=$input['result']??null;
    if (!is_array($result) || !isset($result['answers']) || !is_array($result['answers'])) {
        api_fail('Submit a result.answers object containing your selected answers.');
    }
    if (count($result['answers'])>30) api_fail('Too many answers.');
    $catalog=lockdown_catalog();
    if (!isset($catalog[$taskId]) || $catalog[$taskId]['zone']!==$zone) api_fail('Unknown task for this zone.',404);
    $station=$catalog[$taskId]['station'];
    if (in_array($station,['A','B'],true) && $team['workstation']!==$station) {
        api_fail('This task must be completed on workstation '.$station.'.',403);
    }
    $grade=grade_task($catalog[$taskId],$result['answers']);
    $db=lockdown_db(); $groupId=(int)$team['id'];
    $db->beginTransaction();
    try {
        // Lock group row so two computers cannot race the scored-attempt limit.
        $lock=$db->prepare('SELECT id FROM `groups` WHERE id=? FOR UPDATE'); $lock->execute([$groupId]);
        $s=$db->prepare('SELECT id,max_scored_attempts FROM tasks WHERE task_id=? AND zone=?');
        $s->execute([$taskId,$zone]); $task=$s->fetch();
        if (!$task) throw new RuntimeException('Tasks not yet seeded. Run php database/seed.php.');
        $s=$db->prepare('SELECT COUNT(*) FROM task_attempts WHERE group_id=? AND unit_id=? AND task_ref=?');
        $s->execute([$groupId,(int)$team['unit_id'],$task['id']]); $previous=(int)$s->fetchColumn();
        $scored=$previous < (int)$task['max_scored_attempts'];
        $s=$db->prepare('INSERT INTO task_attempts(group_id,unit_id,task_ref,answers_json,score,passed,scored) VALUES(?,?,?,?,?,?,?)');
        $s->execute([$groupId,(int)$team['unit_id'],$task['id'],json_encode($result['answers']),$grade['score'],$grade['passed']?1:0,$scored?1:0]);
        $s=$db->prepare('INSERT INTO task_results (group_id,task_ref,best_score,passed,last_unit_id) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE best_score=GREATEST(best_score,VALUES(best_score)),passed=GREATEST(passed,VALUES(passed)),last_unit_id=VALUES(last_unit_id)');
        $s->execute([$groupId,$task['id'],$scored?$grade['score']:0,$grade['passed']?1:0,(int)$team['unit_id']]);
        $db->commit();
    } catch (Throwable $e) { $db->rollBack(); throw $e; }
    return [
        'ok'=>true,'taskId'=>$taskId,'score'=>$grade['score'],'correct'=>$grade['correct'],
        'total'=>$grade['total'],'passed'=>$grade['passed'],
        'scored'=>$scored,'scoredAttemptsRemaining'=>max(0,(int)$task['max_scored_attempts']-$previous-1),
        'message'=>$scored ? ($grade['passed']?'Task passed.':'Review feedback and try again.') : 'Practice attempt: no additional points, but you can still complete the task.',
        'teamState'=>group_state($groupId,$team['unit_code']),
    ];
});
