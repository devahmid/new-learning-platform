<?php

require_once __DIR__ . '/config/database.php';

try {
    $db = \DatabaseConfig::getInstance()->getConnection();
    echo "✅ Connexion à la base de données réussie\n";

    $sql = "
    CREATE TABLE IF NOT EXISTS reinscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sourceUserId INT NULL,
        isGuest TINYINT(1) NOT NULL DEFAULT 0,
        schoolYear VARCHAR(20) NOT NULL,
        requestType ENUM('new', 'renewal') NOT NULL DEFAULT 'new',
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        acceptedConditions TINYINT(1) NOT NULL DEFAULT 0,
        notes TEXT NULL,
        status ENUM('pending', 'in_review', 'approved', 'rejected', 'archived') NOT NULL DEFAULT 'pending',
        childrenCount INT NOT NULL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_reinscriptions_email (email),
        INDEX idx_reinscriptions_status (status),
        INDEX idx_reinscriptions_school_year (schoolYear),
        INDEX idx_reinscriptions_request_type (requestType),
        INDEX idx_reinscriptions_source_user (sourceUserId)
    );

    CREATE TABLE IF NOT EXISTS reinscription_children (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reinscriptionId INT NOT NULL,
        sourceChildId INT NULL,
        schoolYear VARCHAR(20) NOT NULL,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        birthDate DATE NULL,
        arabicLevel TINYINT NOT NULL DEFAULT 1,
        hasActivityOnWednesday TINYINT(1) NOT NULL DEFAULT 0,
        hasActivityOnSaturday TINYINT(1) NOT NULL DEFAULT 0,
        hasActivityOnSunday TINYINT(1) NOT NULL DEFAULT 0,
        activityDetails TEXT NULL,
        status ENUM('pending', 'confirmed', 'updated') NOT NULL DEFAULT 'pending',
        sortOrder INT NOT NULL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_reinscription_children_parent (reinscriptionId),
        INDEX idx_reinscription_children_source_child (sourceChildId),
        INDEX idx_reinscription_children_school_year (schoolYear),
        INDEX idx_reinscription_children_status (status)
    );
    ";

    $db->exec($sql);

    echo "✅ Tables reinscriptions et reinscription_children créées avec succès\n";
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}
?>