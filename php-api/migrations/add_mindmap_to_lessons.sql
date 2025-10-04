-- =====================================================
-- MIGRATION: Ajout du champ mindMapUrl aux leçons
-- =====================================================

-- Ajouter la colonne mindMapUrl à la table lessons
ALTER TABLE lessons 
ADD COLUMN mindMapUrl VARCHAR(500) NULL 
AFTER fileUrl;

-- Commentaire pour documenter la colonne
ALTER TABLE lessons 
MODIFY COLUMN mindMapUrl VARCHAR(500) NULL 
COMMENT 'URL de la carte mentale associée à la leçon';

-- Vérifier que la colonne a été ajoutée
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'lessons' 
AND COLUMN_NAME = 'mindMapUrl';
