<?php
/**
 * Copier vers config.php sur le serveur Laragon2 (172.17.15.121).
 */

return [
    /** Clé secrète pour signer les jetons (générer une valeur longue aléatoire). */
    'token_secret' => 'CHANGEZ-MOI-avec-une-cle-secrete-longue',

    /** Durée de validité du jeton (secondes) — 8 h */
    'token_ttl' => 28800,

    /** Origines CORS autorisées (frontend Quasar) */
    'cors_origins' => [
        'http://172.17.15.121:82',
        'http://127.0.0.1:82',
        'http://localhost:9000',
    ],

    /**
     * Oracle — reprendre host + service de assureOriginal/BBBBB/AAAAA/connectionOci.php
     * Format legacy : oci_connect(user, pass, host/service) → 172.17.15.201:1521/PDB2
     *
     * ORA-12514 = le listener ne connaît pas le service (vérifier le nom exact avec le DBA :
     * lsnrctl services sur 172.17.15.201 — ex. PDB2 et non PDB6).
     *
     * Optionnel : chaîne complète prioritaire (copier celle validée par le DBA) :
     * 'connect' => '172.17.15.201:1521/PDB2',
     */
    'oracle' => [
        'host' => '172.17.15.201:1521',
        'service' => 'PDB2',
        'user' => 'dsi',
        'password' => 'VOTRE_MOT_DE_PASSE_ORACLE',
    ],
];
