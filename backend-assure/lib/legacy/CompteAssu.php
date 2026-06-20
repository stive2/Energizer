<?php
/**
 * Compte assuré — GererCompte.php (espaceAssure_new_look).
 */
class CompteAssu
{
    public $num_assu = '';
    public $mot_de_passe = 'cnps';
    public $login_agent = '';
    public $debut_validite = '';
    public $fin_validite = '';
    public $num_piece = '';
    public $num_typepiece = '';
    public $code_centre = '';
    public $email = '';
    public $telephone = '';
    public $nombre = 0;

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

    public function InsertCompte()
    {
        if ($this->num_assu === '' || $this->mot_de_passe === '') {
            return 0;
        }
        $mat = $this->num_assu;
        $mdp = treatPwd($this->mot_de_passe);
        $debut = str_replace("'", "''", $this->debut_validite);
        $fin = str_replace("'", "''", $this->fin_validite);
        $piece = str_replace("'", "''", $this->num_piece);
        $type = str_replace("'", "''", $this->num_typepiece);
        $tel = str_replace("'", "''", $this->telephone);
        $email = str_replace("'", "''", $this->email);
        $centre = str_replace("'", "''", $this->code_centre);

        $requete = "INSERT INTO COMPTE_ASSU (MATASS, mdp_assu, date_crea, debut_validite, fin_validite, flg_validite, num_piece, num_typepiece, tel_assu, email_assu, CODE_CENTRE) "
            . "VALUES ('{$mat}', '{$mdp}', sysdate, to_date('{$debut}','dd-mm-yyyy'), to_date('{$fin}','dd-mm-yyyy'), 'O', '{$piece}', '{$type}', '{$tel}', '{$email}', '{$centre}')";

        $link = OciConnection::get();
        $s = oci_parse($link, $requete);
        if (!$s || !@oci_execute($s)) {
            $err = oci_error($s ?: $link);
            throw new RuntimeException($err['message'] ?? 'Insertion COMPTE_ASSU impossible');
        }

        $res = $this->ExecuteReqOci("SELECT count(*) AS CNT FROM COMPTE_ASSU WHERE MATASS='{$mat}'");
        if ($res && ($row = oci_fetch_array($res, OCI_ASSOC + OCI_RETURN_NULLS))) {
            return ((int) ($row['CNT'] ?? 0)) > 0 ? 1 : 0;
        }
        return 0;
    }

    public function ModifierCompte($p)
    {
        if ($this->num_assu === '') {
            return 0;
        }
        $mat = $this->num_assu;
        $r = 0;

        if ($p == 1) {
            $requete = "INSERT INTO HIST_COMPTE_ASSU (MATASS, MDP_ASSU,DATE_CREA,DATE_DERN_CONN,DATE_DERN_MODIF,DEBUT_VALIDITE,FIN_VALIDITE,FLG_VALIDITE,
                LOGIN_AGENT,NUM_PIECE, NUM_TYPEPIECE, CODE_CENTRE, DATE_ACTIVATION_CNPS, EMAIL_ASSU, TEL_ASSU, DATE_DESACTIVATION, AGENT_DESACTIVATION,
                MOTIF_DESACTIVATION, USER_DERN_MODIF, CODE_CENTRE_ACTIVATION) (SELECT * FROM COMPTE_ASSU WHERE MATASS = '{$mat}')";
            $this->ExecuteReqOci($requete);
        }

        $email = str_replace("'", "''", $this->email);
        $tel = str_replace("'", "''", $this->telephone);
        $requete = "UPDATE COMPTE_ASSU set email_assu='{$email}', tel_assu='{$tel}', user_dern_modif = '{$mat}', date_dern_modif = sysdate "
            . "WHERE MATASS = '{$mat}' AND (email_assu<>'{$email}' OR tel_assu <>'{$tel}')";
        $this->ExecuteReqOci($requete);
        $r += $this->nombre;

        $fin = str_replace("'", "''", $this->fin_validite);
        $piece = str_replace("'", "''", $this->num_piece);
        $type = str_replace("'", "''", $this->num_typepiece);
        $requete = "UPDATE COMPTE_ASSU set flg_validite ='O', debut_validite = sysdate, fin_validite = to_date('{$fin}','dd-mm-yyyy'), num_piece = '{$piece}', num_typepiece = '{$type}' "
            . "WHERE MATASS = '{$mat}' and (num_piece <> '{$piece}' or  num_typepiece <> '{$type}')";
        $this->ExecuteReqOci($requete);
        $r += $this->nombre;
        $this->nombre = $r;
        return 1;
    }
}
