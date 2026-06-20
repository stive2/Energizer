<?php

class AccountController
{
    public static function lookup(string $numAssu): void
    {
        $numAssu = sanitize_matass($numAssu);
        if (strlen($numAssu) !== 13) {
            Http_Response::fail('Matricule assuré invalide.', 400);
        }

        try {
            $client = new Client($numAssu);
            $mat = $client->num_assu;
            $sql = "SELECT NOM_ASSU, PRENOM_ASSU, NOM_PERE_ASSU||' '||PRENOM_PERE_ASSU as NOM_PERE_PERS, "
                . "NOM_MERE_ASSU||' '||PRENOM_MERE_ASSU as NOM_MERE_PERS, to_char(date_naiss_assu, 'dd-mm-yyyy') as DATE_NAISS, "
                . "nvl(C.TEL_ASSU,A.TEL_ASSU) TELASSU, nvl(C.EMAIL_ASSU, A.EMAIL_ASSU) EMAILASSU, CODE_CENTRE_ASSU, LIB_CENTRE, "
                . "C.MATASS AS NUM_ASSU, P.CODE_TYPEPIECE TYPE_PIECE, T.LIBELLE_TYPEPIECE, P.NUM_PIECE, "
                . "to_char(P.DEBUT_VALIDITE, 'dd-mm-yyyy') as DEBUT_VALIDITE, to_char(P.FIN_VALIDITE, 'dd-mm-yyyy') as FIN_VALIDITE, "
                . "T.duree_validite, C.motif_desactivation "
                . "FROM JASSURE a JOIN JCENTRECNPS ce on (a.CODE_CENTRE_ASSU =ce.CODE_CENTRE) "
                . "LEFT JOIN COMPTE_ASSU C ON (C.MATASS=a.NUM_ASSU) "
                . "LEFT join PIECE_ASSU P ON (C.MATASS=P.MATASS AND P.FLG_VALIDITE='O') "
                . "left JOIN TYPEPIECE T ON (T.CODE_TYPEPIECE = P.CODE_TYPEPIECE) "
                . "WHERE NUM_ASSU='{$mat}' AND date_deces_assu IS NULL";

            $res = $client->ExecuteReqOci($sql);
            if (!$res || !($row = oci_fetch_array($res, OCI_ASSOC + OCI_RETURN_NULLS))) {
                Http_Response::fail('Aucun assuré trouvé.', 404);
            }

            Http_Response::ok(['assure' => $row], 'Assuré trouvé.');
        } catch (Throwable $e) {
            Http_Response::fail('Erreur serveur : ' . $e->getMessage(), 500);
        }
    }

    public static function typesPiece(): void
    {
        try {
            $client = new Client('000-0000000-0');
            $res = $client->ExecuteReqOci('SELECT * FROM TYPEPIECE ORDER BY LIBELLE_TYPEPIECE');
            $pieces = [];
            if ($res) {
                while ($row = oci_fetch_array($res, OCI_ASSOC + OCI_RETURN_NULLS)) {
                    $pieces[] = $row;
                }
            }
            Http_Response::ok(['pieces' => $pieces]);
        } catch (Throwable $e) {
            Http_Response::fail('Erreur serveur : ' . $e->getMessage(), 500);
        }
    }

    public static function registerOrUpdate(): void
    {
        $body = Http_Request::jsonBody();
        $numAssu = sanitize_matass($body['num_assu'] ?? '');
        $operation = (string) ($body['operation'] ?? 'Enregistrer');

        if ($numAssu === '') {
            Http_Response::fail('Matricule assuré requis.', 400);
        }

        $required = ['numtelephone', 'email', 'numtypepiece', 'numpiece', 'debut_validite', 'fin_validite'];
        foreach ($required as $key) {
            if (empty($body[$key])) {
                Http_Response::fail("Champ obligatoire manquant : {$key}", 400);
            }
        }

        try {
            $client = new Client($numAssu);
            $mat = $client->num_assu;
            $sql = "SELECT NOM_ASSU, PRENOM_ASSU, CODE_CENTRE_ASSU FROM JASSURE a WHERE NUM_ASSU='{$mat}' AND date_deces_assu IS NULL";
            $res = $client->ExecuteReqOci($sql);
            if (!$res || !($donnees = oci_fetch_array($res, OCI_ASSOC + OCI_RETURN_NULLS))) {
                Http_Response::fail('Aucun assuré trouvé.', 404);
            }

            $client->telephone = (string) $body['numtelephone'];
            $client->email = (string) $body['email'];
            $client->code_centre = (string) $donnees['CODE_CENTRE_ASSU'];

            if (controle_email($client->email) !== 100) {
                Http_Response::fail("Mauvais format de l'email : saisissez une adresse mail valide.", 400);
            }

            $compte = new CompteAssu($numAssu);
            $compte->num_typepiece = (string) $body['numtypepiece'];
            $compte->num_piece = (string) $body['numpiece'];
            $compte->fin_validite = (string) $body['fin_validite'];
            $compte->debut_validite = (string) $body['debut_validite'];
            $compte->telephone = $client->telephone;
            $compte->email = $client->email;
            $compte->code_centre = $client->code_centre;

            $piece = new Piece($compte->num_piece, $compte->num_typepiece);
            $piece->num_assu = $numAssu;
            $piece->debut_validite = $compte->debut_validite;
            $piece->fin_validite = $compte->fin_validite;
            $findPiece = $piece->SelectPiece();
            $modif = 1;
            $userSetPassword = false;

            if ($operation === 'Enregistrer') {
                $mot2passe = trim((string) ($body['mot2passe'] ?? ''));
                if ($mot2passe !== '') {
                    if (strlen($mot2passe) <= 5) {
                        Http_Response::fail('Le mot de passe doit avoir au moins 6 caractères.', 400);
                    }
                    $compte->mot_de_passe = $mot2passe;
                    $userSetPassword = true;
                } else {
                    $compte->mot_de_passe = $client->CarAleatoire(8);
                }
                if ($findPiece === 0) {
                    $piece->InsertPiece();
                    if ($compte->InsertCompte() !== 1) {
                        Http_Response::fail('Échec de création du compte en base. Vérifiez les dates (jj-mm-aaaa).', 500);
                    }
                    $client->MAJNewClient();

                    if ($userSetPassword) {
                        Http_Response::ok(
                            ['mailSent' => false, 'accountCreated' => true],
                            'Compte créé avec succès. Connectez-vous avec le mot de passe que vous avez choisi.',
                        );
                    }

                    $destinataire = $client->email;
                    $objet = 'Creation de votre Compte !';
                    $message = "Bienvenue\nCREATION DU COMPTE REUSSIE,\nCOMPTE CREE ET ACTIVE.\n\nVotre mot de passe est : {$compte->mot_de_passe}";
                    $mailOk = envoiMail($destinataire, $objet, $message);
                    $msg = $mailOk
                        ? 'Opération réussie. Consultez votre messagerie pour le mot de passe.'
                        : "Opération réussie, mais échec d'envoi du mail.";
                    Http_Response::ok(['mailSent' => (bool) $mailOk, 'accountCreated' => true], $msg);
                }
                if ($findPiece === 1) {
                    Http_Response::fail("Pièce d'identité déjà enregistrée dans le système.", 409);
                }
                if ($findPiece === 2) {
                    Http_Response::fail(
                        "Pièce d'identité déjà associée à un compte. Utilisez « Modifier » ou rendez-vous en centre CNPS.",
                        409,
                    );
                }
                if ($findPiece === 3) {
                    Http_Response::fail('Compte déjà créé dans le système.', 409);
                }
            }

            if ($operation === 'Modifier') {
                $exists = $client->ExecuteReqOci("SELECT MATASS FROM COMPTE_ASSU WHERE MATASS='{$mat}'");
                if (!$exists || !oci_fetch_array($exists, OCI_ASSOC + OCI_RETURN_NULLS)) {
                    Http_Response::fail(
                        'Aucun compte en ligne pour ce matricule. Choisissez « Enregistrer » pour créer un compte.',
                        404,
                    );
                }

                $compte->ModifierCompte($modif);
                if ($findPiece === 0 && $compte->nombre === 2) {
                    $piece->SuspendPiece();
                    $piece->InsertPiece();
                } elseif ($compte->nombre === 2) {
                    $piece->ModifPiece(2);
                }

                $message = '';
                if ($compte->nombre === 2) {
                    $message = "Bonjour,\nVotre compte est mis à jour.\nBonne continuation sur notre site.";
                } elseif ($compte->nombre === 1) {
                    $message = "Bonjour,\nVotre compte est correctement mis à jour.\nVotre mot de passe n'a pas été modifié.";
                }
                if ($message !== '') {
                    $mailOk = envoiMail($client->email, 'Mise à jour de votre Compte !', $message);
                    $msg = $mailOk
                        ? 'Opération réussie. Consultez votre messagerie.'
                        : "Opération réussie, mais échec d'envoi du mail.";
                    Http_Response::ok(['mailSent' => (bool) $mailOk], $msg);
                }
                Http_Response::ok([], 'Aucune modification effectuée.');
            }

            Http_Response::fail('Opération non reconnue.', 400);
        } catch (Throwable $e) {
            Http_Response::fail('Erreur serveur : ' . $e->getMessage(), 500);
        }
    }

    public static function changePassword(): void
    {
        $body = Http_Request::jsonBody();
        $numAssu = sanitize_matass($body['num_assu'] ?? '');
        $password = (string) ($body['mot2passe'] ?? $body['password'] ?? '');
        $confirm = (string) ($body['mot2passe2'] ?? $body['passwordConfirm'] ?? $password);
        $oldPassword = (string) ($body['mot2passeOld'] ?? $body['passwordOld'] ?? '');

        if ($numAssu === '' || $password === '') {
            Http_Response::fail('Matricule et mot de passe requis.', 400);
        }
        if ($password !== $confirm) {
            Http_Response::fail('Les mots de passe ne correspondent pas.', 400);
        }
        if (strlen($password) <= 5) {
            Http_Response::fail('Le mot de passe doit avoir au moins 6 caractères.', 400);
        }

        try {
            $client = new Client($numAssu);
            $mat = $client->num_assu;
            $res = $client->ExecuteReqOci("SELECT MATASS, MDP_ASSU FROM compte_assu WHERE MATASS='{$mat}'");
            $row = $res ? oci_fetch_array($res, OCI_ASSOC + OCI_RETURN_NULLS) : false;
            if (!$row) {
                Http_Response::fail('Compte inexistant. Réessayez ou rendez-vous dans un centre CNPS.', 404);
            }

            if ($oldPassword !== '') {
                if (compareCryptPwd($row['MDP_ASSU'], $oldPassword) !== 1) {
                    Http_Response::fail('Ancien mot de passe incorrect.', 401);
                }
                $mdp = treatPwd($password);
                $oldHash = treatPwd($oldPassword);
                $client->ExecuteReqOci(
                    "UPDATE COMPTE_ASSU SET MDP_ASSU='{$mdp}', FLG_VALIDITE='O' "
                    . "WHERE MATASS='{$mat}' AND MDP_ASSU='{$oldHash}'"
                );
            } else {
                $mdp = treatPwd($password);
                $client->ExecuteReqOci("UPDATE COMPTE_ASSU SET MDP_ASSU='{$mdp}', FLG_VALIDITE='O' WHERE MATASS='{$mat}'");
            }

            if ((int) $client->nombre === 1) {
                Http_Response::ok([], 'Mot de passe modifié. Veuillez vous connecter.');
            }
            Http_Response::fail('Erreur lors de la mise à jour du mot de passe.', 500);
        } catch (Throwable $e) {
            Http_Response::fail('Erreur serveur : ' . $e->getMessage(), 500);
        }
    }
}
