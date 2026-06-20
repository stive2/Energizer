<?php
/**
 * Client assuré — logique ConnFile.php / SeConnecter (espaceAssure_new_look).
 */
class Client
{
    public $num_assu = '';
    public $mot_de_passe = 'cnps';
    public $prenom = '';
    public $nom = '';
    public $nombre = 0;
    public $email = '';
    public $date_naiss = '';
    public $telephone = '';
    public $code_centre = '';
    public $forlink = '';
    public $maxEssai = 5;

    public function __construct($id)
    {
        $this->num_assu = sanitize_matass($id);
    }

    public function ExecuteReqOci($requete)
    {
        $link = OciConnection::get();
        $s = oci_parse($link, $requete);
        if (!$s) {
            $this->nombre = 0;
            return false;
        }
        oci_execute($s);
        $this->nombre = oci_num_rows($s);
        return $s;
    }

    public function SeConnecter($pwd)
    {
        $this->nombre = 0;
        $this->prenom = '';
        $this->nom = '';

        if ($this->num_assu === '' || $pwd === null || $pwd === '') {
            return 'Veuillez saisir vos parametres de connexion';
        }

        $mat = $this->num_assu;
        $requete = "SELECT NOM_ASSU, PRENOM_ASSU, c.MATASS NUM_ASSU, flg_validite, DATE_DERN_CONN, "
            . "trunc(c.fin_validite-sysdate) DIFFDATE, MDP_ASSU, trunc(sysdate - date_essai) DATE_ESSAI_DIFF, "
            . "nvl(NBRE_ESSAI, 0) NBRE_ESSAI, c.email_assu email_assu "
            . "FROM compte_assu c join JASSURE a ON (c.MATASS = '{$mat}' and c.MATASS=a.num_assu)";

        $resultat = $this->ExecuteReqOci($requete);
        if (!$resultat || !($donnees = oci_fetch_array($resultat, OCI_ASSOC + OCI_RETURN_NULLS))) {
            return 'Paramètres de compte inconnus. Vérifiez vos coordonnées ou rendez-vous dans un centre CNPS.';
        }

        $nbreTotalEssai = (int) $donnees['NBRE_ESSAI'];
        if (
            $donnees['DATE_ESSAI_DIFF'] !== null
            && $donnees['DATE_ESSAI_DIFF'] !== ''
            && (string) $donnees['DATE_ESSAI_DIFF'] === '0'
            && $this->maxEssai <= $nbreTotalEssai
        ) {
            return "Echec de connexion : vous avez dépassé le quota d'essais de la journée.";
        }

        if (compareCryptPwd($donnees['MDP_ASSU'], $pwd) !== 1) {
            $requete = '';
            if ($donnees['DATE_ESSAI_DIFF'] === null || $donnees['DATE_ESSAI_DIFF'] === '' || (string) $donnees['DATE_ESSAI_DIFF'] !== '0') {
                $requete = "UPDATE COMPTE_ASSU SET DATE_ESSAI = SYSDATE, NBRE_ESSAI=1 WHERE MATASS='{$mat}'";
            } elseif ($this->maxEssai >= $nbreTotalEssai) {
                $requete = "UPDATE COMPTE_ASSU SET NBRE_ESSAI= NBRE_ESSAI+1 WHERE MATASS='{$mat}'";
            }
            if ($requete !== '') {
                $this->ExecuteReqOci($requete);
            }
            $reste = max(0, $this->maxEssai - $nbreTotalEssai - 1);
            $this->nombre = 4;
            return "Echec de connexion. Paramètres incorrects. Il vous reste {$reste} essai(s) pour la journée.";
        }

        if ($donnees['FLG_VALIDITE'] !== 'O') {
            $this->nombre = 3;
            if ($donnees['DATE_DERN_CONN'] === null || $donnees['DATE_DERN_CONN'] === '') {
                return 'Compte inactif. Rendez-vous dans un centre CNPS pour activer votre compte.';
            }
            return 'Compte inactif. Modifiez votre compte et enregistrez une pièce d\'identité valide.';
        }

        $this->ExecuteReqOci("UPDATE compte_assu SET DATE_DERN_CONN = SYSDATE WHERE MATASS='{$mat}'");
        $this->nombre = 1;
        $this->nom = htmlentities((string) $donnees['NOM_ASSU'], ENT_QUOTES, 'UTF-8');
        $this->prenom = ($donnees['PRENOM_ASSU'] !== null && $donnees['PRENOM_ASSU'] !== 'null' && strlen((string) $donnees['PRENOM_ASSU']) > 0)
            ? (string) $donnees['PRENOM_ASSU'] : '';
        $this->email = ($donnees['EMAIL_ASSU'] !== null && $donnees['EMAIL_ASSU'] !== 'null' && strlen((string) $donnees['EMAIL_ASSU']) > 0)
            ? (string) $donnees['EMAIL_ASSU'] : '';

        return 'OK';
    }

    public function MAJNewClient()
    {
        if ($this->num_assu === '') {
            return 0;
        }
        $mat = $this->num_assu;
        $tel = str_replace("'", "''", $this->telephone);
        $email = str_replace("'", "''", $this->email);
        $centre = str_replace("'", "''", $this->code_centre);
        $requete = "UPDATE COMPTE_ASSU SET TEL_ASSU= '{$tel}', EMAIL_ASSU= '{$email}', CODE_CENTRE= '{$centre}' WHERE MATASS='{$mat}'";
        return $this->ExecuteReqOci($requete);
    }

    public function transform($matricule)
    {
        $this->forlink = substr($matricule, 12) . substr($matricule, 4, 7) . substr($matricule, 0, 3);
        return $this->forlink;
    }

    public function CarAleatoire($taille)
    {
        $cars = 'azertyiopqsdfghjklmwxcvbn0123456789';
        $mdp = '';
        $long = strlen($cars);
        for ($i = 0; $i < $taille; $i++) {
            $mdp .= substr($cars, random_int(0, $long - 1), 1);
        }
        return $mdp;
    }

    /** Réactivation compte — Reactivate.php / RegFile legacy */
    public function Reactiver(string $newPassword): int
    {
        $this->nombre = 0;
        $res = explode(' ', $this->nom, 2);
        $mat = str_replace("'", "''", $this->num_assu);
        $nomSearch = str_replace("'", "''", implode('%', $res));
        $dateNaiss = str_replace("'", "''", $this->date_naiss);

        $requete = "SELECT NUM_ASSU, NOM_ASSU, PRENOM_ASSU, fin_validite-sysdate validite "
            . "FROM compte_assu c join JASSURE a on(MATASS=NUM_ASSU AND MATASS='{$mat}' "
            . "AND upper(NOM_ASSU||' '||PRENOM_ASSU) like upper('%{$nomSearch}%') "
            . "and DATE_NAISS_ASSU=to_date('{$dateNaiss}', 'dd-mm-yyyy')) ";

        $resultat = $this->ExecuteReqOci($requete);
        if (!$resultat || !oci_fetch_array($resultat)) {
            return -1;
        }

        $mdp = treatPwd($newPassword);
        $this->ExecuteReqOci(
            "UPDATE compte_assu SET MDP_ASSU= '{$mdp}', FLG_VALIDITE='O' WHERE MATASS='{$mat}'"
        );

        if ((int) $this->nombre >= 0) {
            $this->nombre = 1;
            return 1;
        }

        return -4;
    }

    public function toArray()
    {
        return [
            'num_assu' => $this->num_assu,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'email' => $this->email,
            'telephone' => $this->telephone,
            'code_centre' => $this->code_centre,
            'forlink' => $this->forlink,
            'maxEssai' => $this->maxEssai,
            'nombre' => $this->nombre,
        ];
    }
}
