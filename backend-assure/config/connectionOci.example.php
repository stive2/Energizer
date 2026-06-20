<?php
/**
 * @deprecated Préférer config.php['oracle'] — conservé pour compatibilité legacy.
 * Copier vers connectionOci.php si un script externe l’exige encore.
 */
$cfg = require __DIR__ . '/config.php';
$oracle = $cfg['oracle'];

$hostname_oci = $oracle['host'];
$database_oci = $oracle['service'];
$username_oci = $oracle['user'];
$password_oci = $oracle['password'];

$link = @oci_connect($username_oci, $password_oci, $hostname_oci . '/' . $database_oci);
