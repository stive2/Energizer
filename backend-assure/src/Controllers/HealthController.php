<?php

class HealthController
{
    public static function ping(): void
    {
        Http_Response::ok(['service' => 'backend-assure', 'version' => '1.0.0']);
    }

    /**
     * GET /health/oracle — teste la connexion Oracle (diagnostic navigateur).
     * N’expose pas le mot de passe.
     */
    public static function oracle(): void
    {
        $info = OracleConnect::diagnosticInfo();

        if ($info['descriptors'] === [] || $info['user'] === '') {
            Http_Response::fail(
                'Configuration Oracle incomplète dans config.php (host, service, user).',
                500,
                ['oracle' => $info],
            );
        }

        if (!$info['password_set']) {
            Http_Response::fail(
                'Mot de passe Oracle non configuré dans config.php.',
                500,
                ['oracle' => $info],
            );
        }

        $result = OracleConnect::tryConnect();
        $info['attempts'] = $result['attempts'];

        if (!$result['ok'] || !isset($result['link'])) {
            Http_Response::fail(
                $result['attempts'][count($result['attempts']) - 1]['error'] ?? 'Connexion Oracle impossible',
                500,
                ['oracle' => $info],
            );
        }

        oci_close($result['link']);
        $info['descriptor_used'] = $result['descriptor'];

        Http_Response::ok(
            ['oracle' => $info],
            'Connexion Oracle OK.',
        );
    }
}
