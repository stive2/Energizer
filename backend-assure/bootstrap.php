<?php
/**
 * Bootstrap API Espace Assuré — chargement config + autoload minimal.
 */

declare(strict_types=1);

define('BACKEND_ASSURE_ROOT', __DIR__);

$configFile = BACKEND_ASSURE_ROOT . '/config/config.php';
if (!is_file($configFile)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Configuration manquante : copiez config/config.example.php vers config/config.php',
    ]);
    exit;
}

$GLOBALS['ASSURE_CONFIG'] = require $configFile;

/** Apache / PHP-CGI (Laragon) : restaurer Authorization si absent de $_SERVER. */
if (empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $auth = (string) ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if ($auth === '' && function_exists('apache_request_headers')) {
        $apacheHeaders = apache_request_headers();
        if (is_array($apacheHeaders)) {
            $auth = (string) (
                $apacheHeaders['Authorization']
                ?? $apacheHeaders['authorization']
                ?? $apacheHeaders['X-Authorization']
                ?? $apacheHeaders['x-authorization']
                ?? ''
            );
        }
    }
    if ($auth !== '') {
        $_SERVER['HTTP_AUTHORIZATION'] = $auth;
    }
}

require_once BACKEND_ASSURE_ROOT . '/lib/legacy/divers_fonctions.php';
require_once BACKEND_ASSURE_ROOT . '/lib/legacy/OracleConnect.php';
require_once BACKEND_ASSURE_ROOT . '/lib/legacy/OciConnection.php';
require_once BACKEND_ASSURE_ROOT . '/lib/legacy/Client.php';
require_once BACKEND_ASSURE_ROOT . '/lib/legacy/CompteAssu.php';
require_once BACKEND_ASSURE_ROOT . '/lib/legacy/Piece.php';

require_once BACKEND_ASSURE_ROOT . '/src/Http/Request.php';
require_once BACKEND_ASSURE_ROOT . '/src/Http/Response.php';
require_once BACKEND_ASSURE_ROOT . '/src/Http/Cors.php';
require_once BACKEND_ASSURE_ROOT . '/src/Auth/TokenService.php';
require_once BACKEND_ASSURE_ROOT . '/src/Controllers/AuthController.php';
require_once BACKEND_ASSURE_ROOT . '/src/Controllers/AccountController.php';
require_once BACKEND_ASSURE_ROOT . '/src/Controllers/HomeController.php';
require_once BACKEND_ASSURE_ROOT . '/src/Controllers/HealthController.php';
require_once BACKEND_ASSURE_ROOT . '/src/Controllers/AssureSampleController.php';

function assure_config(string $key, $default = null)
{
    return $GLOBALS['ASSURE_CONFIG'][$key] ?? $default;
}
