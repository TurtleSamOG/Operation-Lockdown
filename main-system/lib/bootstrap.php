<?php
declare(strict_types=1);

const LOCKDOWN_ROOT = __DIR__ . '/../../';

function env_value(string $name, ?string $default = null): ?string
{
    static $values = null;
    if ($values === null) {
        $values = [];
        $path = LOCKDOWN_ROOT . '.env';
        if (is_file($path)) {
            foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
                [$key, $value] = explode('=', $line, 2);
                $value = trim($value);
                if (strlen($value) >= 2 && in_array($value[0], ['"', "'"], true) && substr($value, -1) === $value[0]) {
                    $value = substr($value, 1, -1);
                }
                $values[trim($key)] = $value;
            }
        }
    }
    $fromEnvironment = getenv($name);
    return $fromEnvironment !== false ? $fromEnvironment : ($values[$name] ?? $default);
}

function lockdown_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (int)($_SERVER['SERVER_PORT'] ?? 0) === 443;
    session_name('lockdown_session');
    session_set_cookie_params([
        'lifetime' => 0, 'path' => '/', 'secure' => $https,
        'httponly' => true, 'samesite' => 'Lax',
    ]);
    ini_set('session.use_strict_mode', '1');
    session_start();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

function csrf_token(): string
{
    lockdown_session();
    return (string)$_SESSION['csrf'];
}

function verify_csrf(): void
{
    lockdown_session();
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($token) || !hash_equals(csrf_token(), $token)) {
        api_fail('Invalid request token. Reload the page and try again.', 419);
    }
}

function api_json(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function api_fail(string $message, int $status = 400): never
{
    api_json(['ok' => false, 'error' => $message], $status);
}

function api_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== $method) {
        header('Allow: ' . $method);
        api_fail('Method not allowed.', 405);
    }
    if ($method !== 'GET') verify_csrf();
}

function json_input(): array
{
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 32768) api_fail('Request too large.', 413);
    $decoded = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($decoded) || array_is_list($decoded)) api_fail('Expected a JSON object.');
    return $decoded;
}

function api_guard(callable $callback): never
{
    try {
        $result = $callback();
        api_json(is_array($result) ? $result : ['ok' => true]);
    } catch (Throwable $e) {
        error_log('[Operation Lockdown] ' . $e->getMessage());
        if (env_value('APP_ENV', 'production') === 'local') {
            api_fail('Server error: ' . $e->getMessage(), 500);
        }
        api_fail('Unexpected server error. Please contact a facilitator.', 500);
    }
}
