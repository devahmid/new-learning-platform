<?php
/**
 * Configuration de la base de données
 */

class DatabaseConfig {
    // Configuration par défaut (à adapter selon votre hébergement)
    const HOST = 'localhost';
    const DB_NAME = 'u281164575_centre';
    const USERNAME = 'u281164575_omar';
    const PASSWORD = 'Elodie14061990@';
    
    // Configuration pour hébergement mutualisé (décommentez et adaptez)
    // const HOST = 'votre-serveur-mysql.com';
    // const DB_NAME = 'votre_base_de_donnees';
    // const USERNAME = 'votre_utilisateur';
    // const PASSWORD = 'votre_mot_de_passe';
    
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $this->connection = new PDO(
                "mysql:host=" . self::HOST . ";dbname=" . self::DB_NAME . ";charset=utf8mb4",
                self::USERNAME,
                self::PASSWORD,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch(PDOException $e) {
            die("Erreur de connexion à la base de données: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function __clone() {}
    public function __wakeup() {}
}
