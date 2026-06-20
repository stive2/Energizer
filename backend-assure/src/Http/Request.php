<?php

class Http_Request
{
    public static function method(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }

    public static function path(): string
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        $script = dirname($_SERVER['SCRIPT_NAME'] ?? '');
        if ($script !== '/' && strpos($path, $script) === 0) {
            $path = substr($path, strlen($script)) ?: '/';
        }
        return rtrim($path, '/') ?: '/';
    }

  /** @return array<string, mixed> */
    public static function jsonBody(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || trim($raw) === '') {
            return $_POST ?: [];
        }
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : ($_POST ?: []);
    }

    public static function query(string $key, $default = null)
    {
        return $_GET[$key] ?? $default;
    }

    public static function bearerToken(): ?string
    {
        $headers = [];

        foreach (['HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION', 'HTTP_X_AUTHORIZATION'] as $key) {
            if (!empty($_SERVER[$key]) && is_string($_SERVER[$key])) {
                $headers[] = $_SERVER[$key];
            }
        }

        if (function_exists('apache_request_headers')) {
            $apache = apache_request_headers();
            if (is_array($apache)) {
                foreach (['Authorization', 'authorization', 'X-Authorization', 'x-authorization'] as $key) {
                    if (!empty($apache[$key]) && is_string($apache[$key])) {
                        $headers[] = $apache[$key];
                    }
                }
            }
        }

        if (function_exists('getallheaders')) {
            $all = getallheaders();
            if (is_array($all)) {
                foreach (['Authorization', 'authorization', 'X-Authorization', 'x-authorization'] as $key) {
                    if (!empty($all[$key]) && is_string($all[$key])) {
                        $headers[] = $all[$key];
                    }
                }
            }
        }

        foreach ($headers as $header) {
            if (preg_match('/Bearer\s+(\S+)/i', $header, $m)) {
                return $m[1];
            }
            $trimmed = trim($header);
            if ($trimmed !== '' && strpos($trimmed, ' ') === false) {
                return $trimmed;
            }
        }

        return null;
    }
}
