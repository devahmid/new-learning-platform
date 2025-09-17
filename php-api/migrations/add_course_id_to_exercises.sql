-- Migration: Ajouter la colonne courseId à la table exercises
-- Date: 2025-01-02

-- Ajouter la colonne courseId à la table exercises
ALTER TABLE exercises ADD COLUMN courseId INT(11) NULL AFTER id;

-- Ajouter une clé étrangère pour lier les exercices aux cours
ALTER TABLE exercises ADD CONSTRAINT fk_exercises_course 
FOREIGN KEY (courseId) REFERENCES courses(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Ajouter un index pour améliorer les performances
CREATE INDEX idx_exercises_course_id ON exercises(courseId);

-- Mettre à jour les exercices existants pour les associer au premier cours disponible
-- (Cette partie peut être adaptée selon vos besoins spécifiques)
UPDATE exercises 
SET courseId = (SELECT id FROM courses LIMIT 1) 
WHERE courseId IS NULL;
