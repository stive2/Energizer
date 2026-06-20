<?php

/**
 * Connexion Oracle — descripteurs Easy Connect + TNS, aligné sur connectionOci.php.
 */
class OracleConnect
{
    /** @return array{user:string,password:string,descriptors:string[],charset:?string} */
    public static function config(): array
    {
        $oracle = assure_config('oracle', []);
        $user = trim((string) ($oracle['user'] ?? ''));
        $password = trim((string) ($oracle['password'] ?? ''));
        $charset = isset($oracle['charset']) ? trim((string) $oracle['charset']) : null;
        if ($charset === '') {
            $charset = null;
        }

        $descriptors = [];
        $connect = trim((string) ($oracle['connect'] ?? ''));
        if ($connect !== '') {
            $descriptors[] = $connect;
        }

        $host = trim((string) ($oracle['host'] ?? ''));
        $service = trim((string) ($oracle['service'] ?? ''));
        $port = trim((string) ($oracle['port'] ?? '1521'));

        if ($host !== '' && $service !== '') {
            $hostWithPort = $host;
            if (!preg_match('/:\d+$/', $hostWithPort) && $port !== '') {
                $hostWithPort .= ':' . $port;
            }

            $easy = $hostWithPort . '/' . $service;
            $descriptors[] = $easy;
            if (strpos($easy, '//') !== 0) {
                $descriptors[] = '//' . $easy;
            }

            $hostOnly = preg_replace('/:\d+$/', '', $hostWithPort);
            $portNum = preg_match('/:(\d+)$/', $hostWithPort, $m) ? $m[1] : $port;
            $descriptors[] = sprintf(
                '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=%s)(PORT=%s))(CONNECT_DATA=(SERVICE_NAME=%s)))',
                $hostOnly,
                $portNum,
                $service
            );
        }

        return [
            'user' => $user,
            'password' => $password,
            'descriptors' => array_values(array_unique($descriptors)),
            'charset' => $charset,
        ];
    }

    /**
     * @return array{user:string,password_set:bool,descriptors:string[],charset:?string,tns_admin:?string}
     */
    public static function diagnosticInfo(): array
    {
        $cfg = self::config();
        $tnsAdmin = getenv('TNS_ADMIN');
        if ($tnsAdmin === false || $tnsAdmin === '') {
            $tnsAdmin = null;
        }

        return [
            'user' => $cfg['user'],
            'password_set' => $cfg['password'] !== '' && $cfg['password'] !== 'VOTRE_MOT_DE_PASSE_ORACLE',
            'descriptors' => $cfg['descriptors'],
            'charset' => $cfg['charset'],
            'tns_admin' => $tnsAdmin,
            'config_file' => is_file(BACKEND_ASSURE_ROOT . '/config/config.php')
                ? BACKEND_ASSURE_ROOT . '/config/config.php'
                : 'missing',
        ];
    }

    /**
     * @return array{ok:bool,descriptor:?string,attempts:array<int,array{descriptor:string,error:?string}>,link?:resource}
     */
    public static function tryConnect(): array
    {
        $cfg = self::config();
        $attempts = [];

        if ($cfg['user'] === '' || $cfg['password'] === '') {
            return [
                'ok' => false,
                'descriptor' => null,
                'attempts' => [[
                    'descriptor' => '',
                    'error' => 'Configuration Oracle incomplète (user/password).',
                ]],
            ];
        }

        if ($cfg['descriptors'] === []) {
            return [
                'ok' => false,
                'descriptor' => null,
                'attempts' => [[
                    'descriptor' => '',
                    'error' => 'Configuration Oracle incomplète (host/service ou connect).',
                ]],
            ];
        }

        foreach ($cfg['descriptors'] as $descriptor) {
            $link = $cfg['charset']
                ? @oci_connect($cfg['user'], $cfg['password'], $descriptor, $cfg['charset'])
                : @oci_connect($cfg['user'], $cfg['password'], $descriptor);

            if ($link) {
                return [
                    'ok' => true,
                    'descriptor' => $descriptor,
                    'attempts' => $attempts,
                    'link' => $link,
                ];
            }

            $err = oci_error();
            $attempts[] = [
                'descriptor' => $descriptor,
                'error' => $err['message'] ?? 'Connexion Oracle impossible',
            ];
        }

        return [
            'ok' => false,
            'descriptor' => null,
            'attempts' => $attempts,
        ];
    }

    /** @return resource */
    public static function connect()
    {
        $result = self::tryConnect();
        if ($result['ok'] && isset($result['link'])) {
            return $result['link'];
        }

        $last = end($result['attempts']);
        throw new RuntimeException($last['error'] ?? 'Connexion Oracle impossible');
    }
}
