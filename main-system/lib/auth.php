<?php
declare(strict_types=1);
require_once __DIR__ . '/database.php';

function require_team(): array
{
    lockdown_session();
    $groupId = (int)($_SESSION['group_id'] ?? 0);
    $unitId = (int)($_SESSION['unit_id'] ?? 0);
    if (!$groupId || !$unitId) api_fail('Please log in to your team first.', 401);
    $stmt = lockdown_db()->prepare('SELECT g.id, g.slug, g.display_name, u.id AS unit_id, u.unit_code FROM `groups` g JOIN working_units u ON u.group_id = g.id WHERE g.id=? AND u.id=? AND g.active=1');
    $stmt->execute([$groupId, $unitId]);
    $row = $stmt->fetch();
    if (!$row) api_fail('Team session expired. Please sign in again.', 401);
    $row['workstation'] = (string)($_SESSION['workstation'] ?? 'A');
    return $row;
}

function require_facilitator(): array
{
    lockdown_session();
    $id = (int)($_SESSION['facilitator_id'] ?? 0);
    if (!$id) api_fail('Facilitator login required.', 403);
    $stmt = lockdown_db()->prepare('SELECT id, username FROM facilitators WHERE id=?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) api_fail('Facilitator login required.', 403);
    return $row;
}

function group_session_login(array $group, array $unit, string $workstation): void
{
    lockdown_session();
    session_regenerate_id(true);
    $_SESSION['group_id'] = (int)$group['id'];
    $_SESSION['unit_id'] = (int)$unit['id'];
    $_SESSION['workstation'] = $workstation;
    unset($_SESSION['facilitator_id']);
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

function facilitator_session_login(int $id): void
{
    lockdown_session();
    session_regenerate_id(true);
    $_SESSION['facilitator_id'] = $id;
    unset($_SESSION['group_id'], $_SESSION['unit_id'], $_SESSION['workstation']);
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}
