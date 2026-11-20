<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';

function lockdown_db(): PDO
{
    static $db = null;
    if ($db instanceof PDO) return $db;
    $host = env_value('DB_HOST', '127.0.0.1');
    $port = (int)env_value('DB_PORT', '3306');
    $name = env_value('DB_NAME', 'operation_lockdown_dev');
    $user = env_value('DB_USER');
    $password = env_value('DB_PASSWORD');
    if (!$user || $password === null) {
        throw new RuntimeException('Configure DB_USER and DB_PASSWORD in your local .env file.');
    }
    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
    $db = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $db;
}
