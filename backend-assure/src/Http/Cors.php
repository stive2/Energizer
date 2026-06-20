<?php

class Http_Cors
{
    public static function apply(): void
    {
        $origins = assure_config('cors_origins', []);
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin && in_array($origin, $origins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
        } elseif (!$origin && !empty($origins)) {
            header('Access-Control-Allow-Origin: ' . $origins[0]);
        }
        header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Authorization');
        header('Access-Control-Max-Age: 86400');

        if (Http_Request::method() === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
