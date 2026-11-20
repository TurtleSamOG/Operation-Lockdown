<?php
declare(strict_types=1);
// IMPORTANT: This file is SERVER-SIDE ONLY. Replace demo questions/answers with real zone content.
// Do not put the correct answers in public/*.js or in the GET /api/tasks.php response.
function lockdown_catalog(): array
{
    return [
        'train-labels' => [
            'zone'=>'train','station'=>'A','title'=>'Identify suspicious logins','pass'=>67,'required'=>true,
            'questions'=>[
                ['id'=>'t1','text'=>'A login at 02:30 from an unfamiliar country after twelve failures.','options'=>['suspicious'=>'Investigate','normal'=>'Normal activity'],'correct'=>'suspicious'],
                ['id'=>'t2','text'=>'An employee signs in from their usual laptop during their normal shift.','options'=>['suspicious'=>'Investigate','normal'=>'Normal activity'],'correct'=>'normal'],
                ['id'=>'t3','text'=>'Twenty failed passwords followed by a successful login on a new device.','options'=>['suspicious'=>'Investigate','normal'=>'Normal activity'],'correct'=>'suspicious'],
            ]],
        'train-rules' => [
            'zone'=>'train','station'=>'B','title'=>'Improve detector rules','pass'=>67,'required'=>true,
            'questions'=>[
                ['id'=>'r1','text'=>'What helps reduce missed unusual login attempts?','options'=>['ignore'=>'Ignore failed attempts','threshold'=>'Monitor repeated failures','disable'=>'Turn off alerts'],'correct'=>'threshold'],
                ['id'=>'r2','text'=>'A traveller logs in while abroad. What should the detector do?','options'=>['ban'=>'Always permanently ban','review'=>'Flag for verification, not automatically assume guilt','ignore'=>'Ignore all travel activity'],'correct'=>'review'],
                ['id'=>'r3','text'=>'Why are false positives important?','options'=>['cost'=>'They can disrupt legitimate staff','proof'=>'They always prove a threat','irrelevant'=>'They do not matter'],'correct'=>'cost'],
            ]],
        'train-joint' => [
            'zone'=>'train','station'=>'joint','title'=>'Joint detector assessment','pass'=>100,'required'=>true,
            'questions'=>[
                ['id'=>'j1','text'=>'The detector flagged a login but evidence is inconclusive. Best next step?','options'=>['investigate'=>'Review additional evidence','delete'=>'Delete the account immediately','ignore'=>'Disable monitoring'],'correct'=>'investigate'],
            ]],
        'train-bonus' => [
            'zone'=>'train','station'=>'bonus','title'=>'Bonus: detector trade-offs','pass'=>100,'required'=>false,
            'questions'=>[['id'=>'b1','text'=>'What trade-off arises from lowering every alert threshold?','options'=>['noise'=>'More false alarms','none'=>'No trade-off'],'correct'=>'noise']]],
        'fix-investigate' => [
            'zone'=>'fix','station'=>'A','title'=>'Identify portal weaknesses','pass'=>67,'required'=>true,
            'questions'=>[
                ['id'=>'f1','text'=>'A guest can view private staff profiles. What is missing?','options'=>['permission'=>'Access checks','css'=>'A different colour'],'correct'=>'permission'],
                ['id'=>'f2','text'=>'A form prints a full internal error message. What should users see?','options'=>['safe'=>'A safe error message','stack'=>'A detailed stack trace'],'correct'=>'safe'],
                ['id'=>'f3','text'=>'An unknown visitor accesses a staff-only page. How should this be recorded?','options'=>['report'=>'Report and reproduce the issue','ignore'=>'Ignore it'],'correct'=>'report'],
            ]],
        'fix-patch' => [
            'zone'=>'fix','station'=>'B','title'=>'Choose and test secure fixes','pass'=>67,'required'=>true,
            'questions'=>[
                ['id'=>'p1','text'=>'Which check protects a private profile?','options'=>['both'=>'Logged in AND permitted','name'=>'Name field is not blank'],'correct'=>'both'],
                ['id'=>'p2','text'=>'How should passwords be stored?','options'=>['hash'=>'Using a suitable password hash','plain'=>'Plain text'],'correct'=>'hash'],
                ['id'=>'p3','text'=>'Which test is most important after an access fix?','options'=>['guest'=>'Guest must be denied; permitted employee allowed','colour'=>'Check background colour only'],'correct'=>'guest'],
            ]],
        'fix-joint' => [
            'zone'=>'fix','station'=>'joint','title'=>'Joint website retest','pass'=>100,'required'=>true,
            'questions'=>[['id'=>'fj','text'=>'A fix blocks visitors but also every legitimate employee. Is it complete?','options'=>['no'=>'No: both access cases must work','yes'=>'Yes'],'correct'=>'no']]],
        'fix-bonus' => [
            'zone'=>'fix','station'=>'bonus','title'=>'Bonus: regression testing','pass'=>100,'required'=>false,
            'questions'=>[['id'=>'fb','text'=>'A new patch breaks a normal feature. Next step?','options'=>['test'=>'Fix the regression and retest','ignore'=>'Ignore it'],'correct'=>'test']]],
        'defend-investigate' => [
            'zone'=>'defend','station'=>'A','title'=>'Investigate the town alert','pass'=>67,'required'=>true,
            'questions'=>[
                ['id'=>'d1','text'=>'A car damages the office power supply. What is the initial priority?','options'=>['safety'=>'Staff safety and emergency assessment','printer'=>'Print office reports'],'correct'=>'safety'],
                ['id'=>'d2','text'=>'The office loses power. Where should you check business continuity?','options'=>['server'=>'Server room and backup power','canteen'=>'Canteen menu'],'correct'=>'server'],
                ['id'=>'d3','text'=>'How should a suspicious visitor report be handled?','options'=>['verify'=>'Verify via building security','ignore'=>'Ignore it'],'correct'=>'verify'],
            ]],
        'defend-response' => [
            'zone'=>'defend','station'=>'B','title'=>'Coordinate safe responses','pass'=>67,'required'=>true,
            'questions'=>[
                ['id'=>'a1','text'=>'UPS power is limited. Best action?','options'=>['prioritise'=>'Prioritise critical systems and plan shutdown','everything'=>'Keep everything running indefinitely'],'correct'=>'prioritise'],
                ['id'=>'a2','text'=>'A caller asks staff for their password. Best response?','options'=>['refuse'=>'Refuse and verify through official IT channels','share'=>'Share it'],'correct'=>'refuse'],
                ['id'=>'a3','text'=>'A workstation shows malware warnings. Best initial control?','options'=>['isolate'=>'Isolate and notify IT','reboot'=>'Ignore warnings'],'correct'=>'isolate'],
            ]],
        'defend-joint' => [
            'zone'=>'defend','station'=>'joint','title'=>'Joint incident review','pass'=>100,'required'=>true,
            'questions'=>[['id'=>'dj','text'=>'After containment, what should the team record?','options'=>['timeline'=>'Actions, evidence and recovery status','nothing'=>'Nothing'],'correct'=>'timeline']]],
        'defend-bonus' => [
            'zone'=>'defend','station'=>'bonus','title'=>'Bonus: secondary incident','pass'=>100,'required'=>false,
            'questions'=>[['id'=>'db','text'=>'A backup fails its restore test. Best response?','options'=>['escalate'=>'Escalate and use verified recovery plan','assume'=>'Assume the backup works'],'correct'=>'escalate']]],
    ];
}

function public_task(string $taskId, array $spec): array
{
    return [
        'taskId'=>$taskId, 'zone'=>$spec['zone'], 'station'=>$spec['station'],
        'title'=>$spec['title'], 'required'=>$spec['required'], 'passPercent'=>$spec['pass'],
        'questions'=>array_map(static fn(array $q) => [
            'id'=>$q['id'], 'text'=>$q['text'], 'options'=>$q['options'],
        ], $spec['questions']),
    ];
}

function grade_task(array $spec, array $answers): array
{
    $total = count($spec['questions']);
    $correct = 0;
    foreach ($spec['questions'] as $q) {
        $selection = $answers[$q['id']] ?? null;
        if (is_string($selection) && hash_equals($q['correct'], $selection)) $correct++;
    }
    $score = $total > 0 ? (int)round(100 * $correct / $total) : 0;
    return ['score'=>$score,'correct'=>$correct,'total'=>$total,'passed'=>$score >= $spec['pass']];
}

function zone_keys(): array
{
    return ['train'=>'AI_DEFENCE_ACTIVATED','fix'=>'PORTAL_SECURED','defend'=>'THREAT_CONTAINED'];
}
