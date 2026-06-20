<?php
/**
 * Fonctions utilitaires legacy — extrait de espaceAssure_new_look/backend/divers_fonctions.php
 */

function treatPwd($yourPwd)
{
    $pass = urlencode($yourPwd);
    return hash('sha256', md5($pass, strlen($pass)));
}

function compareCryptPwd($yourCyptPwd, $otherPwd)
{
    $pass_crypt = treatPwd($otherPwd);
    return $pass_crypt === $yourCyptPwd ? 1 : 0;
}

function envoiMail($destinataire, $objet, $message)
{
    $headers = 'From: "CNPS CAMEROUN" <cnps.cameroun@cnps.cm>' . "\r\n";
    $headers .= 'Content-Type: text/plain; charset="iso-8859-1"' . "\r\n";
    $headers .= 'Content-Transfer-Encoding: 8bit';
    return mail($destinataire, $objet, $message, $headers) ? 1 : 0;
}

function sanitize_matass($value)
{
    return preg_replace('/[^0-9\-]/', '', (string) $value);
}

/** @return int 100 si format valide, 5 sinon (legacy CompteAssure) */
function controle_email(string $email): int
{
    $syntaxe = '#^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,6}$#';
    return preg_match($syntaxe, $email) ? 100 : 5;
}
