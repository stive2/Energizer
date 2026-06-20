<?php

/**
 * Connexion Oracle — remplace ../connectionOci.php du legacy.
 */
class OciConnection
{
    /** @var resource|null */
    private static $link = null;

    /** @return resource */
    public static function get()
    {
        if (self::$link) {
            return self::$link;
        }

        self::$link = OracleConnect::connect();

        return self::$link;
    }

    public static function close(): void
    {
        if (self::$link) {
            oci_close(self::$link);
            self::$link = null;
        }
    }
}
