<?php
declare(strict_types=1);
/**
 * OPTIONAL ADD-ON (Operation Lockdown 2.0 projector sync).
 * Lets one facilitator start the opening briefing / change slides / set the survey link
 * on every projector that is signed in as a facilitator, in any room.
 *
 * - New file only: no existing endpoint, library, table or migration is changed.
 * - Stores two rows in the existing key/value table `event_settings`:
 *     projector_cue    JSON {seq, action, slide, startsAt}
 *     projector_survey survey URL (max 255 chars)
 * - Facilitator session required for GET and POST; POST also requires the CSRF token.
 * - If this file is not deployed, the projector pages fall back to single-machine mode.
 */
require_once __DIR__.'/../../main-system/lib/scoring.php';

function projector_setting(PDO $db, string $key): string
{
    $s = $db->prepare('SELECT setting_value FROM event_settings WHERE setting_key=?');
    $s->execute([$key]);
    $value = $s->fetchColumn();
    return $value === false ? '' : (string)$value;
}

function projector_save(PDO $db, string $key, string $value): void
{
    $s = $db->prepare('INSERT INTO event_settings(setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)');
    $s->execute([$key, $value]);
}

function projector_cue(PDO $db): array
{
    $cue = json_decode(projector_setting($db, 'projector_cue'), true);
    return is_array($cue) ? $cue : ['seq' => 0, 'action' => 'none', 'slide' => 0, 'startsAt' => 0];
}

$method = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST' ? 'POST' : 'GET';
api_method($method); // rejects other methods; verifies CSRF for POST

api_guard(function () use ($method): array {
    $facilitator = require_facilitator();
    $db = lockdown_db();
    if ($method === 'POST') {
        $data = json_input();
        $action = (string)($data['action'] ?? '');
        if ($action === 'survey') {
            $url = trim((string)($data['url'] ?? ''));
            if ($url !== '' && (strlen($url) > 255 || !preg_match('~^https?://\S+$~i', $url))) {
                api_fail('Survey link must start with http(s):// and be at most 255 characters.');
            }
            projector_save($db, 'projector_survey', $url);
        } elseif (in_array($action, ['briefing', 'slide', 'stop'], true)) {
            $previous = projector_cue($db);
            $cue = [
                'seq' => (int)($previous['seq'] ?? 0) + 1,
                'action' => $action,
                'slide' => max(0, min(2, (int)($data['slide'] ?? 0))),
                'startsAt' => $action === 'briefing' ? time() + 5 : time(), // 5 s lead so every room starts together
            ];
            projector_save($db, 'projector_cue', (string)json_encode($cue));
        } else {
            api_fail('Unknown projector action.');
        }
        $s = $db->prepare('INSERT INTO facilitator_audit(facilitator_id,action_name,details_json) VALUES (?,?,?)');
        $s->execute([(int)$facilitator['id'], 'projector_' . $action, json_encode($data)]);
    }
    return ['ok' => true, 'cue' => projector_cue($db), 'survey' => projector_setting($db, 'projector_survey'), 'serverTime' => time()];
});
