<?php
declare(strict_types=1);
require_once __DIR__.'/scoring.php';

// Vanessa can replace these prompts/choices together with Szymon.
// Answers stay server-side; only the public subset is returned to browsers.
function finale_questions(): array
{
    return [
        ['id'=>'network','text'=>'The AI detector flags an unusual login. What do you do first?',
            'options'=>['verify'=>'Investigate and verify before taking proportionate action','ignore'=>'Disable alerts','ban'=>'Ban every account automatically'],'correct'=>'verify'],
        ['id'=>'portal','text'=>'The employee portal is repaired. What must be checked before reopening?',
            'options'=>['regression'=>'Test both permitted and unauthorised access','colour'=>'Only its colour scheme','none'=>'No tests needed'],'correct'=>'regression'],
        ['id'=>'response','text'=>'The office has recovered from a power outage. How should the incident finish?',
            'options'=>['document'=>'Confirm services, document decisions and monitor','leave'=>'Leave without checking','forget'=>'Delete incident history'],'correct'=>'document'],
    ];
}

function public_finale_questions(): array
{
    return array_map(static fn($q)=>['id'=>$q['id'],'text'=>$q['text'],'options'=>$q['options']],finale_questions());
}

function submit_finale(int $groupId, array $answers): array
{
    $state=group_state($groupId);
    if (!$state['finaleReady']) api_fail('Collect all three recovery keys before attempting the finale.',409);
    $questions=finale_questions();$correct=0;
    foreach ($questions as $q) {
        if (isset($answers[$q['id']]) && is_string($answers[$q['id']]) && hash_equals($q['correct'],$answers[$q['id']])) $correct++;
    }
    $score=(int)round(100*$correct/count($questions));$passed=$correct===count($questions);
    $db=lockdown_db();$db->beginTransaction();
    try {
        $lock=$db->prepare('SELECT id FROM `groups` WHERE id=? FOR UPDATE');$lock->execute([$groupId]);
        $s=$db->prepare('SELECT attempts FROM finale_results WHERE group_id=?');$s->execute([$groupId]);
        $attempts=(int)($s->fetchColumn()?:0);$scored=$attempts<3;
        $s=$db->prepare('INSERT INTO finale_results(group_id,best_score,completed,attempts) VALUES (?,?,?,1) ON DUPLICATE KEY UPDATE best_score=GREATEST(best_score,VALUES(best_score)),completed=GREATEST(completed,VALUES(completed)),attempts=attempts+1');
        $s->execute([$groupId,$scored?$score:0,$passed?1:0]);
        $db->commit();
    } catch(Throwable $e){$db->rollBack();throw $e;}
    return ['ok'=>true,'score'=>$score,'correct'=>$correct,'total'=>count($questions),
        'completed'=>$passed,'scored'=>$scored,'best'=>group_state($groupId)['finale']];
}
