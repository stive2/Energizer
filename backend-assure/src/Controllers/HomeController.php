<?php

/**
 * Tableau de bord espace assuré — inspiré ConsultCompte.php (accueil post-connexion).
 */
class HomeController
{
    public static function dashboard(): void
    {
        $numAssu = Auth_TokenService::requireNumAssu();
        if (strlen($numAssu) !== 13) {
            Http_Response::fail('Matricule assuré invalide.', 400);
        }

        try {
            $client = new Client($numAssu);
            $mat = $client->num_assu;
            $sql = "SELECT a.NOM_ASSU, a.PRENOM_ASSU, a.NUM_ASSU, a.CODE_CENTRE_ASSU, ce.LIB_CENTRE, "
                . "to_char(a.DATE_NAISS_ASSU, 'dd/mm/yyyy') as DATE_NAISS, "
                . "nvl(c.EMAIL_ASSU, a.EMAIL_ASSU) EMAIL_ASSU, nvl(c.TEL_ASSU, a.TEL_ASSU) TEL_ASSU, "
                . "c.FLG_VALIDITE, c.MOTIF_DESACTIVATION, c.DATE_DERN_CONN "
                . "FROM JASSURE a "
                . "LEFT JOIN JCENTRECNPS ce ON (a.CODE_CENTRE_ASSU = ce.CODE_CENTRE) "
                . "LEFT JOIN COMPTE_ASSU c ON c.MATASS = a.NUM_ASSU "
                . "WHERE a.NUM_ASSU = '{$mat}' AND a.date_deces_assu IS NULL";

            $res = $client->ExecuteReqOci($sql);
            if (!$res || !($row = oci_fetch_array($res, OCI_ASSOC + OCI_RETURN_NULLS))) {
                Http_Response::fail('Assuré introuvable.', 404);
            }

            $client->nom = (string) ($row['NOM_ASSU'] ?? '');
            $client->prenom = (string) ($row['PRENOM_ASSU'] ?? '');
            $client->email = (string) ($row['EMAIL_ASSU'] ?? '');
            $client->telephone = (string) ($row['TEL_ASSU'] ?? '');
            $client->code_centre = (string) ($row['CODE_CENTRE_ASSU'] ?? '');
            $client->transform($mat);

            $flgValidite = (string) ($row['FLG_VALIDITE'] ?? '');
            $hasCompte = $flgValidite !== '';
            $accountActive = $flgValidite === 'O';

            Http_Response::ok([
                'user' => array_merge($client->toArray(), [
                    'displayName' => trim($client->prenom . ' ' . $client->nom) ?: $mat,
                    'dateNaissance' => (string) ($row['DATE_NAISS'] ?? ''),
                    'lib_centre' => (string) ($row['LIB_CENTRE'] ?? ''),
                ]),
                'account' => [
                    'exists' => $hasCompte,
                    'active' => $accountActive,
                    'flg_validite' => $flgValidite,
                    'motif_desactivation' => (string) ($row['MOTIF_DESACTIVATION'] ?? ''),
                    'date_dern_conn' => (string) ($row['DATE_DERN_CONN'] ?? ''),
                ],
               
                'quickActions' => [
                    [
                        'id' => 'depot-pf',
                        'route' => 'assure-prestations-familiales',
                        'icon' => 'family_restroom',
                        'enabled' => $accountActive,
                    ],
                    [
                        'id' => 'depot-dossier',
                        'route' => 'depot-dossier',
                        'icon' => 'upload_file',
                        'enabled' => $accountActive,
                    ],
                    [
                        'id' => 'mon-compte',
                        'route' => 'assure-account',
                        'icon' => 'manage_accounts',
                        'enabled' => true,
                    ],
                ],
            ]);
        } catch (Throwable $e) {
            Http_Response::fail('Erreur serveur : ' . $e->getMessage(), 500);
        }
    }
}
