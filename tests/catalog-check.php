<?php
declare(strict_types=1);
require_once __DIR__.'/../main-system/lib/task-catalog.php';
$catalog=lockdown_catalog();
assert(count($catalog)===12);
foreach (['train','fix','defend'] as $zone) {
    $required=array_filter($catalog,fn($t)=>$t['zone']===$zone && $t['required']);
    assert(count($required)===3);
    $stations=array_column($required,'station');sort($stations);
    assert($stations===['A','B','joint']);
    foreach ($required as $spec) {
        $answers=[];foreach ($spec['questions'] as $q) $answers[$q['id']]=$q['correct'];
        $result=grade_task($spec,$answers);
        assert($result['score']===100 && $result['passed']);
        $empty=grade_task($spec,[]);
        assert($empty['score']===0 && !$empty['passed']);
    }
}
echo "All 12 task definitions and grading rules pass basic validation.\n";
