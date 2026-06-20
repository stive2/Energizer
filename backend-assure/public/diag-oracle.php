<?php
/**
 * Diagnostic Oracle ponctuel — à supprimer après résolution.
 * Ouvrir sur le serveur Laragon (172.17.15.121) :
 *   http://127.0.0.1:83/diag-oracle.php
 * Tester un autre service (nom exact fourni par le DBA) :
 *   http://127.0.0.1:83/diag-oracle.php?service=PDB6.CNPS.CM
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$remote = $_SERVER['REMOTE_ADDR'] ?? '';
if ($remote !== '127.0.0.1' && $remote !== '::1') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès local uniquement.']);
    exit;
}

if (!function_exists('oci_connect')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Extension PHP oci8 absente.']);
    exit;
}

$configFile = dirname(__DIR__) . '/config/config.php';
if (!is_file($configFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'config.php introuvable.', 'path' => $configFile]);
    exit;
}

$cfg = require $configFile;
$oracle = $cfg['oracle'] ?? [];

$host = trim((string) ($_GET['host'] ?? $oracle['host'] ?? ''));
$service = trim((string) ($_GET['service'] ?? $oracle['service'] ?? ''));
$user = trim((string) ($oracle['user'] ?? ''));
$password = trim((string) ($oracle['password'] ?? ''));

$hostOnly = preg_replace('/:\d+$/', '', $host);
$port = preg_match('/:(\d+)$/', $host, $m) ? $m[1] : '1521';

$tcpOk = false;
$tcpError = null;
$socket = @fsockopen($hostOnly, (int) $port, $errno, $errstr, 5);
if ($socket) {
    $tcpOk = true;
    fclose($socket);
} else {
    $tcpError = $errstr ?: "errno $errno";
}

function oracle_try_connect(string $user, string $password, string $descriptor): array
{
    $link = @oci_connect($user, $password, $descriptor);
    if ($link) {
        oci_close($link);
        return ['ok' => true, 'descriptor' => $descriptor, 'error' => null];
    }
    $err = oci_error();
    return ['ok' => false, 'descriptor' => $descriptor, 'error' => $err['message'] ?? 'Échec'];
}

$attempts = [];
$easy = $host && $service ? $host . '/' . $service : '';
if ($easy !== '') {
    $attempts[] = oracle_try_connect($user, $password, $easy);
}

if ($hostOnly && $service) {
    $tnsService = sprintf(
        '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=%s)(PORT=%s))(CONNECT_DATA=(SERVICE_NAME=%s)))',
        $hostOnly,
        $port,
        $service
    );
    $attempts[] = oracle_try_connect($user, $password, $tnsService);

    $tnsSid = sprintf(
        '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=%s)(PORT=%s))(CONNECT_DATA=(SID=%s)))',
        $hostOnly,
        $port,
        $service
    );
    $attempts[] = oracle_try_connect($user, $password, $tnsSid);
}

$winner = null;
foreach ($attempts as $a) {
    if ($a['ok']) {
        $winner = $a;
        break;
    }
}

$out = [
    'server' => gethostname() ?: php_uname('n'),
    'config_file' => $configFile,
    'host' => $host,
    'service' => $service,
    'user' => $user,
    'password_set' => $password !== '',
    'tcp_port_open' => $tcpOk,
    'tcp_error' => $tcpError,
    'tns_admin' => getenv('TNS_ADMIN') ?: null,
    'php_version' => PHP_VERSION,
    'oci8_loaded' => extension_loaded('oci8'),
    'attempts' => $attempts,
    'hint' => 'ORA-12514 depuis ce serveur = le listener sur ' . $hostOnly . ':' . $port
        . ' ne publie pas le service « ' . $service . ' ». Demander au DBA : lsnrctl services (sur 201)'
        . ' et retester avec ?service=NOM_EXACT',
];

if ($winner) {
    echo json_encode([
        'success' => true,
        'message' => 'Connexion Oracle OK.',
        'descriptor_used' => $winner['descriptor'],
        'oracle' => $out,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(500);
echo json_encode([
    'success' => false,
    'message' => 'Échec connexion Oracle — problème infrastructure (listener / nom de service), pas l’API PHP.',
    'oracle' => $out,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
