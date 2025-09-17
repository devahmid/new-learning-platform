-- Migration pour ajouter les champs manquants
-- Ajouter le champ description à la table lessons
ALTER TABLE lessons ADD COLUMN description TEXT AFTER title;

-- Ajouter le champ pdfUrl à la table courses
ALTER TABLE courses ADD COLUMN pdfUrl VARCHAR(500) AFTER videoUrl;
