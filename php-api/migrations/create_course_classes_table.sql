-- Migration: Créer la table de liaison course_classes pour relation many-to-many
-- Date: 2025-09-20
-- Description: Permet qu'un cours appartienne à plusieurs classes

-- 1. Créer la table de liaison course_classes
CREATE TABLE course_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    courseId INT NOT NULL,
    classeId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_course_classe (courseId, classeId),
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (classeId) REFERENCES classes(id) ON DELETE CASCADE
);

-- 2. Migrer les données existantes depuis courses.classeId
INSERT INTO course_classes (courseId, classeId)
SELECT id, classeId 
FROM courses 
WHERE classeId IS NOT NULL;

-- 3. Ajouter un index pour optimiser les requêtes
CREATE INDEX idx_course_classes_course ON course_classes(courseId);
CREATE INDEX idx_course_classes_classe ON course_classes(classeId);

-- 4. Garder temporairement la colonne classeId dans courses pour migration progressive
-- (sera supprimée dans une migration ultérieure)
-- ALTER TABLE courses DROP COLUMN classeId;
