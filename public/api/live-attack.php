<?php
declare(strict_types=1);
/**
 * OPTIONAL ADD-ON (Operation Lockdown 2.0): facilitator-triggered "live attacks".
 *
 * - New file only. No existing endpoint, library, table or migration is changed.
 * - Uses the existing key/value table `event_settings`:
 *     live_attack                 JSON {seq, type, startedAt, endsAt, used:[types]}
 *     live_a_<group>_<seq>_<item> JSON the group's locked answer to one question (first click wins)
 *     live_r_<group>_<seq>        JSON the group's tallied result (written once every question is answered,
 *                                 or when the attack window ends with some answers)
 * - Every answer is graded HERE; the browser never receives the answer key while an attack is running.
 * - Explanations are only released after the attack window closes, so early groups can't shout answers across the room.
 * - Live points are a separate bonus. Zone scores and keys are untouched.
 *
 * GET  ?view=summary      public  -> active attack, live points per group, debrief of the last finished attack
 * GET                     team    -> current attack, this group's locked answers and result
 * GET  ?view=staff        staff   -> current attack + every group's progress
 * POST {action:answer, seq, item, value}                         team  (CSRF) — one question, locked instantly
 * POST {action:trigger,type} | {action:end} | {action:reset}     staff (CSRF)
 */
require_once __DIR__.'/../../main-system/lib/scoring.php';

const LIVE_WINDOW = 300;          // seconds to respond
const LIVE_FULL_SPEED = 60;       // full speed bonus if everything is answered within this many seconds
const LIVE_SPEED_MAX = 20;
const LIVE_DEBRIEF_SECONDS = 120; // how long the public debrief stays available after an attack ends

/** type => [title, points per correct item, items: id => [correct, explanation, allowed options]] */
function live_attacks(): array
{
    return [
        'ransomware' => ['Ransomware outbreak', 10, [
            'd1' => ['isolate', 'Disconnect infected machines from the network first, so the ransomware cannot spread.', ['reboot', 'isolate', 'email']],
            'd2' => ['refuse', 'Don’t pay: there’s no guarantee you get files back, and it funds criminals. Report it to the police / NCSC.', ['pay', 'negotiate', 'refuse']],
            'd3' => ['tested', 'Restore from the newest backup that passed a test restore, once the network is clean.', ['newest', 'tested', 'wait']],
        ]],
        'phishing' => ['Phishing wave', 6, [
            'e1' => ['phish', '“Password expires today” from a look-alike Microsoft domain: classic credential phishing.', ['phish', 'legit']],
            'e2' => ['legit', 'Internal fire-drill reminder from the real domain, no links or attachments.', ['phish', 'legit']],
            'e3' => ['phish', 'A zipped “invoice” from an unknown supplier: a very common way to deliver malware.', ['phish', 'legit']],
            'e4' => ['legit', 'Payslip notice telling you to log in through the usual portal yourself, with no link.', ['phish', 'legit']],
            'e5' => ['phish', '“Buy gift cards urgently, keep it quiet” from a personal address: urgency + secrecy = fraud.', ['phish', 'legit']],
        ]],
        'ddos' => ['DDoS flood on the staff portal', 10, [
            'd1' => ['protect', '9,000 addresses means a botnet: blocking one IP won’t help. Switch on the provider’s DDoS protection.', ['block', 'protect', 'shutdown']],
            'd2' => ['status', 'Tell people what is happening and when the next update is: silence creates panic and fake “help” scams.', ['silent', 'status', 'blame']],
            'd3' => ['investigate', 'A DDoS is often a smokescreen. An unexpected admin login during the chaos must be investigated now.', ['later', 'investigate', 'resetall']],
        ]],
        'usb' => ['USB sticks found in the car park', 10, [
            'd1' => ['handin', 'Never plug in unknown USB sticks — attackers drop them on purpose. Hand them, unplugged, to IT security.', ['plugin', 'handin', 'bin']],
            'd2' => ['sandbox', 'IT examines them on an isolated “sandbox” machine that is not connected to anything important.', ['ownlaptop', 'sandbox', 'server']],
            'd3' => ['isolate', 'Someone already plugged one in: disconnect that PC from the network and report it, so it can be checked.', ['ignore', 'isolate', 'reformat']],
        ]],
        'vishing' => ['Phone call from “IT support”', 10, [
            'd1' => ['verify', 'Never read out an MFA code. Hang up and call IT back on the number you already know.', ['givecode', 'verify', 'halfcode']],
            'd2' => ['pressure', '“Your account will be locked in 5 minutes” is pressure. Urgency is a social-engineering trick, not a reason to comply.', ['comply', 'pressure', 'argue']],
            'd3' => ['report', 'Report it to IT security straight away — the same caller is probably phoning your colleagues.', ['report', 'nobody', 'social']],
        ]],
        'dataleak' => ['Customer data posted online', 10, [
            'd1' => ['verify', 'First confirm whether the data is real by checking a few records against your systems — calmly, without panic emails.', ['verify', 'emailall', 'ignore']],
            'd2' => ['ico', 'A personal-data breach likely to affect people must be reported to the ICO within 72 hours of becoming aware of it.', ['ico', 'wait', 'ceoonly']],
            'd3' => ['source', 'Find and close the source — like the huge customer export from an account on leave this morning — or it will happen again.', ['source', 'resetsilent', 'takedown']],
        ]],
        'insider' => ['Leaver still has access', 10, [
            'd1' => ['disable', 'Disable the account immediately. Ask questions afterwards — access first.', ['disable', 'emailthem', 'waithr']],
            'd2' => ['audit', 'Check the logs for everything that account accessed since they left, and keep the logs as evidence.', ['audit', 'deletelogs', 'nothing']],
            'd3' => ['process', 'Fix the cause: a leaver checklist that removes every account and badge on the last day.', ['process', 'everyoneadmin', 'banusb']],
        ]],
        'supplychain' => ['Poisoned software update', 10, [
            'd1' => ['pause', 'Stop the rollout so no more machines install the poisoned update.', ['finish', 'pause', 'disableav']],
            'd2' => ['inventory', 'Work out exactly which machines already installed it — you can’t clean what you can’t find.', ['assumenone', 'inventory', 'reinstallall']],
            'd3' => ['vendor', 'Contact the vendor and follow their security advisory for the clean-up and a safe version.', ['vendor', 'review', 'ignore']],
        ]],
        'deepfake' => ['Deepfake CEO voice note', 10, [
            'd1' => ['callback', 'Call the CEO back on her known number. Replying to the message just talks to the attacker.', ['pay', 'callback', 'reply']],
            'd2' => ['flags', 'Unusual channel + urgency + secrecy + money = red flags, however real the voice sounds. Voices can be cloned from a few seconds of audio.', ['soundsreal', 'flags', 'cantfake']],
            'd3' => ['twoperson', 'Two-person approval for payments means one fooled person can’t send the money alone.', ['twoperson', 'payfaster', 'whatsapp']],
        ]],
    ];
}

function live_get(PDO $db, string $key): ?string
{
    $s = $db->prepare('SELECT setting_value FROM event_settings WHERE setting_key=?');
    $s->execute([$key]);
    $v = $s->fetchColumn();
    return $v === false ? null : (string)$v;
}

function live_put(PDO $db, string $key, string $value): void
{
    $s = $db->prepare('INSERT INTO event_settings(setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)');
    $s->execute([$key, $value]);
}

/** Insert only if the key does not exist yet. Returns false if someone got there first. */
function live_insert_once(PDO $db, string $key, string $value): bool
{
    try {
        $s = $db->prepare('INSERT INTO event_settings(setting_key,setting_value) VALUES (?,?)');
        $s->execute([$key, $value]);
        return true;
    } catch (PDOException $e) {
        if (live_get($db, $key) !== null) return false;
        throw $e;
    }
}

function live_current(PDO $db): array
{
    $a = json_decode(live_get($db, 'live_attack') ?? '', true);
    $a = is_array($a) ? $a : [];
    return $a + ['seq' => 0, 'type' => '', 'startedAt' => 0, 'endsAt' => 0, 'used' => []];
}

function live_is_active(array $a): bool
{
    return (int)$a['seq'] > 0 && time() < (int)$a['endsAt'] && isset(live_attacks()[$a['type']]);
}

/** Public description of an attack: never includes answers. */
function live_public(array $a): ?array
{
    $def = live_attacks()[$a['type']] ?? null;
    if (!(int)$a['seq'] || !$def) return null;
    return ['seq' => (int)$a['seq'], 'type' => $a['type'], 'title' => $def[0], 'startedAt' => (int)$a['startedAt'], 'endsAt' => (int)$a['endsAt'],
        'active' => live_is_active($a), 'items' => array_keys($def[2]), 'maxPoints' => $def[1] * count($def[2]) + LIVE_SPEED_MAX];
}

function live_group_answers(PDO $db, int $groupId, int $seq): array
{
    $out = [];
    $s = $db->prepare('SELECT setting_key, setting_value FROM event_settings WHERE setting_key LIKE ?');
    $s->execute(['live\\_a\\_' . $groupId . '\\_' . $seq . '\\_%']);
    foreach ($s->fetchAll() as $row) {
        if (!preg_match('/^live_a_\d+_\d+_(\w+)$/', (string)$row['setting_key'], $m)) continue;
        $v = json_decode((string)$row['setting_value'], true);
        if (is_array($v)) $out[$m[1]] = $v;
    }
    return $out;
}

/** Tally a group's answers into a result. $complete = every item answered (speed bonus applies). */
function live_tally(array $attack, array $answers, bool $complete): array
{
    [, $per, $items] = live_attacks()[$attack['type']];
    $correct = 0;
    foreach ($items as $id => [$right]) if (($answers[$id]['v'] ?? '') === $right) $correct++;
    $finishedAt = $complete ? max(array_map(fn($x) => (int)($x['t'] ?? 0), $answers)) : (int)$attack['endsAt'];
    $seconds = max(0, $finishedAt - (int)$attack['startedAt']);
    $speed = !$complete ? 0 : ($seconds <= LIVE_FULL_SPEED ? LIVE_SPEED_MAX
        : (int)round(LIVE_SPEED_MAX * max(0, (LIVE_WINDOW - $seconds) / (LIVE_WINDOW - LIVE_FULL_SPEED))));
    return ['p' => $correct * $per + $speed, 'c' => $correct, 'n' => count($items), 'd' => $correct * $per, 'sp' => $speed, 's' => $seconds, 'complete' => $complete];
}

/** After an attack window closes, give partly-answered groups their (no speed bonus) result. */
function live_finalize_ended(PDO $db, array $attack): void
{
    if (!(int)$attack['seq'] || live_is_active($attack) || !isset(live_attacks()[$attack['type']])) return;
    foreach ($db->query('SELECT id FROM `groups`')->fetchAll() as $g) {
        $gid = (int)$g['id'];
        $rkey = 'live_r_' . $gid . '_' . (int)$attack['seq'];
        if (live_get($db, $rkey) !== null) continue;
        $answers = live_group_answers($db, $gid, (int)$attack['seq']);
        if ($answers) live_insert_once($db, $rkey, (string)json_encode(live_tally($attack, $answers, false)));
    }
}

function live_feedback(array $attack, array $answers): array
{
    $out = [];
    foreach (live_attacks()[$attack['type']][2] as $id => [$right, $why]) {
        $out[] = ['id' => $id, 'ok' => ($answers[$id]['v'] ?? '') === $right, 'answer' => $answers[$id]['v'] ?? null, 'correct' => $right, 'why' => $why];
    }
    return $out;
}

function live_results(PDO $db): array
{
    $out = [];
    foreach ($db->query("SELECT setting_key, setting_value FROM event_settings WHERE setting_key LIKE 'live\\_r\\_%'") as $row) {
        if (!preg_match('/^live_r_(\d+)_(\d+)$/', (string)$row['setting_key'], $m)) continue;
        $r = json_decode((string)$row['setting_value'], true);
        if (is_array($r)) $out[(int)$m[1]][(int)$m[2]] = $r;
    }
    return $out;
}

$method = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST' ? 'POST' : 'GET';
api_method($method); // rejects other methods; verifies CSRF for POST

api_guard(function () use ($method): array {
    $db = lockdown_db();
    $attack = live_current($db);
    live_finalize_ended($db, $attack);
    $pub = live_public($attack);

    if ($method === 'GET') {
        $view = (string)($_GET['view'] ?? '');
        if ($view === 'summary') {
            $results = live_results($db);
            $totals = [];
            foreach ($db->query('SELECT id, slug FROM `groups`')->fetchAll() as $g) {
                $totals[(string)$g['slug']] = array_sum(array_map(fn($r) => (int)($r['p'] ?? 0), $results[(int)$g['id']] ?? []));
            }
            $debrief = null;
            if ($pub && !$pub['active'] && time() - (int)$attack['endsAt'] <= LIVE_DEBRIEF_SECONDS) {
                $debrief = ['seq' => $pub['seq'], 'type' => $pub['type'], 'title' => $pub['title'], 'items' => array_map(fn($f) => ['id' => $f['id'], 'correct' => $f['correct'], 'why' => $f['why']], live_feedback($attack, []))];
            }
            return ['ok' => true, 'attack' => $pub && $pub['active'] ? $pub : null, 'totals' => $totals, 'debrief' => $debrief, 'serverTime' => time()];
        }
        if ($view === 'staff') {
            require_facilitator();
            $results = live_results($db);
            $rows = [];
            foreach ($db->query('SELECT id, slug, display_name FROM `groups` ORDER BY id')->fetchAll() as $g) {
                $gid = (int)$g['id'];
                $rows[] = ['team' => $g['slug'], 'name' => $g['display_name'], 'answered' => $pub ? count(live_group_answers($db, $gid, $pub['seq'])) : 0,
                    'current' => $pub ? ($results[$gid][$pub['seq']] ?? null) : null,
                    'total' => array_sum(array_map(fn($r) => (int)($r['p'] ?? 0), $results[$gid] ?? []))];
            }
            return ['ok' => true, 'attack' => $pub, 'used' => array_values((array)$attack['used']), 'groups' => $rows, 'serverTime' => time()];
        }
        $team = require_team();
        $answers = $pub ? live_group_answers($db, (int)$team['id'], $pub['seq']) : [];
        $result = $pub ? json_decode(live_get($db, 'live_r_' . (int)$team['id'] . '_' . $pub['seq']) ?? 'null', true) : null;
        return ['ok' => true, 'attack' => $pub, 'answers' => (object)$answers, 'result' => $result,
            'feedback' => $pub && !$pub['active'] && $result ? live_feedback($attack, $answers) : null, 'serverTime' => time()];
    }

    $data = json_input();
    $action = (string)($data['action'] ?? '');

    if ($action === 'answer') {
        $team = require_team();
        if (!$pub || !$pub['active'] || (int)($data['seq'] ?? 0) !== $pub['seq']) api_fail('This attack is already over.', 409);
        $items = live_attacks()[$attack['type']][2];
        $item = (string)($data['item'] ?? ''); $value = (string)($data['value'] ?? '');
        if (!isset($items[$item]) || !in_array($value, $items[$item][2], true)) api_fail('Unknown answer.');
        $gid = (int)$team['id'];
        $stored = live_insert_once($db, 'live_a_' . $gid . '_' . $pub['seq'] . '_' . $item,
            (string)json_encode(['v' => $value, 'w' => (string)$team['workstation'], 'u' => (string)$team['unit_code'], 't' => time()]));
        $answers = live_group_answers($db, $gid, $pub['seq']);
        $rkey = 'live_r_' . $gid . '_' . $pub['seq'];
        if (count($answers) === count($items) && live_get($db, $rkey) === null) {
            live_insert_once($db, $rkey, (string)json_encode(live_tally($attack, $answers, true)));
        }
        return ['ok' => true, 'locked' => $stored, 'answers' => (object)$answers,
            'result' => json_decode(live_get($db, $rkey) ?? 'null', true), 'serverTime' => time()];
    }

    $facilitator = require_facilitator();
    if ($action === 'trigger') {
        $type = (string)($data['type'] ?? '');
        if (!isset(live_attacks()[$type])) api_fail('Unknown attack type.');
        $now = time();
        $used = array_values(array_unique(array_merge((array)$attack['used'], [$type])));
        live_put($db, 'live_attack', (string)json_encode(['seq' => (int)$attack['seq'] + 1, 'type' => $type, 'startedAt' => $now, 'endsAt' => $now + LIVE_WINDOW, 'used' => $used]));
    } elseif ($action === 'end') {
        if (live_is_active($attack)) { $attack['endsAt'] = time(); live_put($db, 'live_attack', (string)json_encode($attack)); live_finalize_ended($db, $attack); }
    } elseif ($action === 'reset') {
        if (($data['confirm'] ?? '') !== 'RESET') api_fail('Confirm by sending confirm: RESET.');
        $db->exec("DELETE FROM event_settings WHERE setting_key LIKE 'live\\_r\\_%' OR setting_key LIKE 'live\\_a\\_%'");
        $attack['endsAt'] = min((int)$attack['endsAt'], time()); $attack['used'] = [];
        live_put($db, 'live_attack', (string)json_encode($attack));
    } else {
        api_fail('Unknown live attack action.');
    }
    $s = $db->prepare('INSERT INTO facilitator_audit(facilitator_id,action_name,details_json) VALUES (?,?,?)');
    $s->execute([(int)$facilitator['id'], 'live_' . $action, json_encode($data)]);
    return ['ok' => true, 'attack' => live_public(live_current($db)), 'serverTime' => time()];
});
