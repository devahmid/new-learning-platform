-- Migration pour ajouter subcategoryId à la table lessons
ALTER TABLE lessons 
ADD COLUMN subcategoryId INT NULL AFTER courseId,
ADD FOREIGN KEY (subcategoryId) REFERENCES subcategories(id) ON DELETE SET NULL;
