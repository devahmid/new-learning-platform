-- Migration: Ajouter le champ status à la table courses
-- Date: 2025-09-20
-- Description: Ajoute un champ status pour gérer l'état des cours (draft, published, archived)

ALTER TABLE courses 
ADD COLUMN status ENUM('draft', 'published', 'archived') DEFAULT 'draft' 
AFTER isActive;

-- Mettre à jour les cours existants qui sont actifs en "published" et inactifs en "draft"
UPDATE courses 
SET status = CASE 
    WHEN isActive = 1 THEN 'published'
    ELSE 'draft'
END;

-- Ajouter un index pour optimiser les requêtes sur le statut
CREATE INDEX idx_courses_status ON courses(status);
