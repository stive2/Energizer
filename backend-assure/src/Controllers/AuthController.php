<?php

class AuthController
{
    public static function login(): void
    {
        $body = Http_Request::jsonBody();
        $numAssu = sanitize_matass($body['num_assu'] ?? $body['login'] ?? '');
        $password = (string) ($body['mot2passe'] ?? $body['password'] ?? '');

        if ($numAssu === '' || $password === '') {
            Http_Response::fail('Veuillez saisir votre numéro assuré et votre mot de passe.', 400);
        }
        if (strlen($numAssu) !== 13) {
            Http_Response::fail('Le matricule assuré doit comporter 13 caractères.', 400);
        }

        try {
            $client = new Client($numAssu);
            $client->transform($numAssu);
            $message = $client->SeConnecter($password);

            if ((int) $client->nombre !== 1) {
                Http_Response::fail(strip_tags($message), 401, ['code' => 'AUTH_FAILED']);
            }

            $token = Auth_TokenService::issue($client->num_assu);
            $profile = self::loadAssureProfile($client->num_assu);
            $user = array_merge($client->toArray(), $profile);

            Http_Response::ok([
                'token' => $token,
                'user' => $user,
                'displayName' => trim($client->prenom . ' ' . $client->nom) ?: $client->num_assu,
                'login' => $client->num_assu,
                'profile' => 'external',
            ], 'Bienvenue dans votre espace assuré.');
        } catch (Throwable $e) {
            Http_Response::fail('Erreur serveur : ' . $e->getMessage(), 500);
        }
    }

    public static function logout(): void
    {
        Http_Response::ok([], 'Déconnecté.');
    }

    public static function me(): void
    {
        $numAssu = Auth_TokenService::requireNumAssu();
        try {
            $client = new Client($numAssu);
            $mat = $client->num_assu;
            $sql = "SELECT a.NOM_ASSU, a.PRENOM_ASSU, c.MATASS NUM_ASSU, c.email_assu, c.tel_assu, a.CODE_CENTRE_ASSU "
                . "FROM JASSURE a LEFT JOIN COMPTE_ASSU c ON c.MATASS = a.NUM_ASSU WHERE a.NUM_ASSU = '{$mat}'";
            $res = $client->ExecuteReqOci($sql);
            if (!$res || !($row = oci_fetch_array($res, OCI_ASSOC + OCI_RETURN_NULLS))) {
                Http_Response::fail('Assuré introuvable.', 404);
            }
            $client->nom = (string) ($row['NOM_ASSU'] ?? '');
            $client->prenom = (string) ($row['PRENOM_ASSU'] ?? '');
            $client->email = (string) ($row['EMAIL_ASSU'] ?? '');
            $client->telephone = (string) ($row['TEL_ASSU'] ?? '');
            $client->code_centre = (string) ($row['CODE_CENTRE_ASSU'] ?? '');
            $client->transform($numAssu);

            Http_Response::ok([
                'user' => array_merge($client->toArray(), self::loadAssureProfile($numAssu)),
                'displayName' => trim($client->prenom . ' ' . $client->nom) ?: $client->num_assu,
            ]);
        } catch (Throwable $e) {
            Http_Response::fail('Erreur serveur : ' . $e->getMessage(), 500);
        }
    }

    /** POST /auth/reactivate — Reactivate.php (mot de passe oublié) */
    public static function reactivate(): void
    {
        $body = Http_Request::jsonBody();
        $numAssu = sanitize_matass($body['num_assu'] ?? $body['login'] ?? '');
        $email = trim((string) ($body['email'] ?? ''));
        $nom = trim((string) ($body['nom'] ?? ''));
        $dateNaiss = trim((string) ($body['date_naiss'] ?? ''));

        if ($numAssu === '' || $email === '' || $nom === '' || $dateNaiss === '') {
            Http_Response::fail('Champs obligatoires : num_assu, email, nom, date_naiss.', 400);
        }

        try {
            $client = new Client($numAssu);
            $client->email = $email;
            $client->nom = $nom;
            $client->date_naiss = $dateNaiss;
            $newPassword = $client->CarAleatoire(8);
            $result = $client->Reactiver($newPassword);

            if ($result === -1) {
                Http_Response::fail('Compte inexistant ou informations incorrectes.', 404);
            }
            if ($result !== 1) {
                Http_Response::fail('Échec de la réactivation du compte.', 500);
            }

            $objet = 'Réinitialisation de votre Compte !';
            $message = "Bienvenue\nVotre compte est réactivé.\n\nVotre nouveau mot de passe : {$newPassword}\n\n"
                . "Vous devrez modifier le mot de passe lors de votre prochaine connexion.";
            $mailOk = envoiMail($email, $objet, $message);

            $msg = $mailOk
                ? 'Votre compte a été réactivé. Un nouveau mot de passe a été envoyé par email.'
                : 'Compte réactivé, mais échec d\'envoi du mail. Contactez un centre CNPS.';

            Http_Response::ok(['mailSent' => (bool) $mailOk, 'assure' => $client->num_assu], $msg);
        } catch (Throwable $e) {
            Http_Response::fail('Erreur serveur : ' . $e->getMessage(), 500);
        }
    }

    /** @return array<string, string> */
    private static function loadAssureProfile(string $numAssu): array
    {
        $client = new Client($numAssu);
        $mat = $client->num_assu;
        $sql = "SELECT CASE WHEN a.SEXE_ASSU IN ('1','F') THEN 'F' "
            . "WHEN a.SEXE_ASSU IN ('2','M') THEN 'M' ELSE a.SEXE_ASSU END AS sexe, "
            . "to_char(a.DATE_NAISS_ASSU, 'dd/mm/yyyy') as dateNaissance, "
            . "a.ADRESSE_ASSU as adresse, nvl(c.TEL_ASSU, a.TEL_ASSU) as telephone "
            . "FROM JASSURE a LEFT JOIN COMPTE_ASSU c ON c.MATASS = a.NUM_ASSU "
            . "WHERE a.NUM_ASSU = '{$mat}' AND a.date_deces_assu IS NULL";
        $res = $client->ExecuteReqOci($sql);
        if (!$res || !($row = oci_fetch_array($res, OCI_ASSOC + OCI_RETURN_NULLS))) {
            return [];
        }

        return [
            'sexe' => (string) ($row['SEXE'] ?? ''),
            'dateNaissance' => (string) ($row['DATENAISSANCE'] ?? ''),
            'date_naissance' => (string) ($row['DATENAISSANCE'] ?? ''),
            'adresse' => (string) ($row['ADRESSE'] ?? ''),
            'telephone' => (string) ($row['TELEPHONE'] ?? ''),
            'numeroAssure' => $mat,
        ];
    }
}
