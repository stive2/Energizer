<?php

class Auth_TokenService
{
    public static function issue(string $numAssu): string
    {
        $payload = [
            'sub' => $numAssu,
            'exp' => time() + (int) assure_config('token_ttl', 28800),
            'iat' => time(),
        ];
        $body = self::b64(json_encode($payload, JSON_UNESCAPED_UNICODE));
        $sig = hash_hmac('sha256', $body, (string) assure_config('token_secret', ''));
        return $body . '.' . $sig;
    }

    /** @return array{sub:string,exp:int}|null */
    public static function verify(?string $token): ?array
    {
        if (!$token || strpos($token, '.') === false) {
            return null;
        }
        [$body, $sig] = explode('.', $token, 2);
        $expected = hash_hmac('sha256', $body, (string) assure_config('token_secret', ''));
        if (!hash_equals($expected, $sig)) {
            return null;
        }
        $json = json_decode(self::ub64($body), true);
        if (!is_array($json) || empty($json['sub']) || empty($json['exp'])) {
            return null;
        }
        if ((int) $json['exp'] < time()) {
            return null;
        }
        return ['sub' => (string) $json['sub'], 'exp' => (int) $json['exp']];
    }

    public static function requireNumAssu(): string
    {
        $claims = self::verify(Http_Request::bearerToken());
        if (!$claims) {
            Http_Response::fail('Session expirée ou jeton invalide.', 401, ['code' => 'UNAUTHORIZED']);
        }
        return sanitize_matass($claims['sub']);
    }

    private static function b64(string $s): string
    {
        return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
    }

    private static function ub64(string $s): string
    {
        $pad = strlen($s) % 4;
        if ($pad) {
            $s .= str_repeat('=', 4 - $pad);
        }
        return base64_decode(strtr($s, '-_', '+/')) ?: '';
    }
}
