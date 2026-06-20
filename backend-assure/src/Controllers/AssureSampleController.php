<?php

/**
 * Échantillon d'assurés pour tests navigateur (dev uniquement).
 * Requête inspirée de AllInfoAssure.php + filtre sexe (infoassuretele.jsp).
 */
class AssureSampleController
{
    public static function list(): void
    {
        $perSexe = (int) Http_Request::query('limit', 5);
        $perSexe = max(1, min(20, $perSexe));

        try {
            $hommes = self::fetchBySexe('M', $perSexe);
            $femmes = self::fetchBySexe('F', $perSexe);
            $assures = array_merge($hommes, $femmes);

            Http_Response::ok([
                'count' => count($assures),
                'hommes' => count($hommes),
                'femmes' => count($femmes),
                'assures' => $assures,
                'sql_hommes' => self::sqlForSexe('M', $perSexe),
                'sql_femmes' => self::sqlForSexe('F', $perSexe),
            ], 'Échantillon assurés (vivants, JASSURE).');
        } catch (Throwable $e) {
            Http_Response::fail('Erreur serveur : ' . $e->getMessage(), 500);
        }
    }

    /** @return array<int, array<string, string>> */
    private static function fetchBySexe(string $sexe, int $limit): array
    {
        $sql = self::sqlForSexe($sexe, $limit);
        $link = OciConnection::get();
        $stmt = oci_parse($link, $sql);
        if (!$stmt) {
            $err = oci_error($link);
            throw new RuntimeException($err['message'] ?? 'oci_parse impossible');
        }
        if (!oci_execute($stmt)) {
            $err = oci_error($stmt);
            throw new RuntimeException($err['message'] ?? 'oci_execute impossible');
        }

        $rows = [];
        while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
            $rows[] = [
                'num_assu' => (string) ($row['NUM_ASSU'] ?? ''),
                'nom' => (string) ($row['NOM_ASSU'] ?? ''),
                'prenom' => (string) ($row['PRENOM_ASSU'] ?? ''),
                'sexe' => (string) ($row['SEXE'] ?? $sexe),
            ];
        }

        return $rows;
    }

    private static function sqlForSexe(string $sexe, int $limit): string
    {
        $sexeIn = $sexe === 'M' ? "('2','M')" : "('1','F')";

        return "SELECT * FROM ("
            . "SELECT a.NUM_ASSU, a.NOM_ASSU, a.PRENOM_ASSU, "
            . "CASE WHEN a.SEXE_ASSU IN ('1','F') THEN 'F' "
            . "WHEN a.SEXE_ASSU IN ('2','M') THEN 'M' ELSE a.SEXE_ASSU END AS SEXE "
            . "FROM JASSURE a "
            . "WHERE a.date_deces_assu IS NULL AND a.SEXE_ASSU IN {$sexeIn} "
            . "ORDER BY a.NOM_ASSU, a.PRENOM_ASSU"
            . ") WHERE ROWNUM <= {$limit}";
    }
}
