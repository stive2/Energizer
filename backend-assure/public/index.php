<?php
/**
 * Routeur API Espace Assuré — point d'entrée public.
 *
 * Déploiement Laragon2 : voir deploy/laragon/GUIDE-BACKEND-ASSURE.md
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

Http_Cors::apply();

$method = Http_Request::method();
$path = Http_Request::path();

try {
    if ($path === '/health' && $method === 'GET') {
        if (Http_Request::query('oracle') === '1') {
            HealthController::oracle();
        }
        HealthController::ping();
    }
    if ($path === '/health/oracle' && $method === 'GET') {
        HealthController::oracle();
    }

    if ($path === '/dev/assures-sample' && $method === 'GET') {
        AssureSampleController::list();
    }

    if ($path === '/auth/login' && $method === 'POST') {
        AuthController::login();
    }
    if ($path === '/auth/logout' && $method === 'POST') {
        AuthController::logout();
    }
    if ($path === '/auth/me' && $method === 'GET') {
        AuthController::me();
    }
    if ($path === '/auth/reactivate' && $method === 'POST') {
        AuthController::reactivate();
    }

    if ($path === '/account/types-piece' && $method === 'GET') {
        AccountController::typesPiece();
    }
    if ($path === '/account/register' && $method === 'POST') {
        AccountController::registerOrUpdate();
    }
    if ($path === '/account/password' && $method === 'POST') {
        AccountController::changePassword();
    }

    if (preg_match('#^/account/([0-9\-]+)/profile$#', $path, $m) && $method === 'GET') {
        AccountController::lookup($m[1]);
    }

    if ($path === '/assure/home' && $method === 'GET') {
        HomeController::dashboard();
    }

    Http_Response::fail('Route introuvable : ' . $path, 404);
} catch (Throwable $e) {
    Http_Response::fail('Erreur interne : ' . $e->getMessage(), 500);
}
