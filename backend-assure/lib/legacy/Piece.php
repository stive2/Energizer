<?php
/**
 * Pièce d'identité assuré — GererCompte.php (espaceAssure_new_look).
 */
class Piece
{
    public $num_assu = '';
    public $num_piece = '';
    public $num_typepiece = '';
    public $debut_validite = '';
    public $fin_validite = '';
    public $nombre = 0;

    public function __construct($num_piece, $num_typepiece)
    {
        $this->num_typepiece = $num_typepiece;
        $this->num_piece = $num_piece;
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

    public function SelectElt($requete)
    {
        $resultat = $this->ExecuteReqOci($requete);
        $rows = [];
        if ($resultat) {
            while ($row = oci_fetch_array($resultat, OCI_ASSOC + OCI_RETURN_NULLS)) {
                $rows[] = $row;
            }
        }
        $this->nombre = count($rows);
        return $rows;
    }

    public function SelectPiece()
    {
        $ok = 0;
        $type = str_replace("'", "''", $this->num_typepiece);
        $piece = str_replace("'", "''", $this->num_piece);
        $mat = str_replace("'", "''", $this->num_assu);

        $requete = "SELECT c.matass, num_piece, date_dern_conn
            FROM PIECE_ASSU p JOIN COMPTE_ASSU c USING (num_piece)
            WHERE (code_typepiece='{$type}' AND num_piece='{$piece}')";
        $nb = $this->SelectElt($requete);

        if ($this->nombre > 0) {
            if ($nb[0]['MATASS'] === $this->num_assu && $nb[0]['DATE_DERN_CONN'] !== null) {
                $ok = 1;
            } else {
                $ok = 2;
            }
        } else {
            $requete = "SELECT matass, date_dern_conn FROM PIECE_ASSU p JOIN COMPTE_ASSU c USING (matass) WHERE matass='{$mat}'";
            $nb = $this->SelectElt($requete);
            if ($this->nombre > 0) {
                $ok = ($nb[0]['DATE_DERN_CONN'] === null) ? 2 : 3;
            }
        }
        return $ok;
    }

    public function InsertPiece()
    {
        if ($this->num_assu === '' || $this->num_piece === '') {
            return 0;
        }
        $mat = str_replace("'", "''", $this->num_assu);
        $debut = str_replace("'", "''", $this->debut_validite);
        $fin = str_replace("'", "''", $this->fin_validite);
        $piece = str_replace("'", "''", $this->num_piece);
        $type = str_replace("'", "''", $this->num_typepiece);

        $requete = "INSERT INTO PIECE_ASSU (matass, debut_validite, fin_validite, num_piece, code_typepiece, flg_validite) "
            . "VALUES ('{$mat}', to_date('{$debut}','dd-mm-yyyy'), to_date('{$fin}','dd-mm-yyyy'), '{$piece}', '{$type}', 'O')";

        $link = OciConnection::get();
        $s = oci_parse($link, $requete);
        if (!$s || !@oci_execute($s)) {
            $err = oci_error($s ?: $link);
            throw new RuntimeException($err['message'] ?? 'Insertion PIECE_ASSU impossible');
        }

        return $s;
    }

    public function ModifPiece($p)
    {
        if ($this->num_assu === '' || $this->num_piece === '') {
            return 0;
        }
        $mat = str_replace("'", "''", $this->num_assu);
        $debut = str_replace("'", "''", $this->debut_validite);
        $fin = str_replace("'", "''", $this->fin_validite);
        $piece = str_replace("'", "''", $this->num_piece);
        $type = str_replace("'", "''", $this->num_typepiece);

        if ($p == 1) {
            $requete = "UPDATE PIECE_ASSU SET debut_validite = '{$debut}', fin_validite = '{$fin}', num_piece = '{$piece}', code_typepiece = '{$type}' "
                . "WHERE matass = '{$mat}' and (flg_validite='O' or code_typepiece = '{$type}')";
        } else {
            $requete = "UPDATE PIECE_ASSU SET debut_validite = '{$debut}', fin_validite = '{$fin}', num_piece = '{$piece}', code_typepiece = '{$type}' "
                . "WHERE matass = '{$mat}'";
        }
        return $this->ExecuteReqOci($requete);
    }

    public function SuspendPiece()
    {
        if ($this->num_assu === '') {
            return 0;
        }
        $mat = str_replace("'", "''", $this->num_assu);
        return $this->ExecuteReqOci("UPDATE PIECE_ASSU SET flg_validite = 'N' WHERE matass = '{$mat}'");
    }
}
