<?php

class Http_Response
{
    public static function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function ok(array $data = [], string $message = 'OK'): void
    {
        self::json(['success' => true, 'message' => $message] + $data, 200);
    }

    public static function fail(string $message, int $status = 400, array $extra = []): void
    {
        self::json(['success' => false, 'message' => $message] + $extra, $status);
    }
}
