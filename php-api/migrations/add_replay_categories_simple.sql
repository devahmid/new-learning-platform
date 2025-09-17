-- Script simple pour ajouter les catégories Replay
-- À exécuter directement dans votre base de données

-- 1. Ajouter la catégorie principale "Replay"
INSERT INTO categories (name, description, `order`, isActive, createdAt, updatedAt) VALUES
('Replay', 'Cours enregistrés et sessions de replay', 9, 1, NOW(), NOW());

-- 2. Récupérer l'ID de la catégorie Replay (remplacer X par l'ID réel)
-- Vous pouvez vérifier avec: SELECT id FROM categories WHERE name = 'Replay';
-- Puis remplacer @replay_category_id par cet ID dans les requêtes suivantes

-- 3. Ajouter les sous-catégories Replay (remplacer X par l'ID de la catégorie Replay)
INSERT INTO subcategories (name, description, categoryId, `order`, isActive, createdAt, updatedAt) VALUES
-- Replay Langue Arabe
('Replay Langue Arabe', 'Replay des cours de langue arabe', (SELECT id FROM categories WHERE name = 'Replay'), 1, 1, NOW(), NOW()),
('Replay Vocabulaire', 'Replay des cours de vocabulaire arabe', (SELECT id FROM categories WHERE name = 'Replay'), 2, 1, NOW(), NOW()),
('Replay Grammaire', 'Replay des cours de grammaire arabe', (SELECT id FROM categories WHERE name = 'Replay'), 3, 1, NOW(), NOW()),
('Replay Lecture', 'Replay des cours de lecture et prononciation', (SELECT id FROM categories WHERE name = 'Replay'), 4, 1, NOW(), NOW()),

-- Replay Croyance
('Replay Croyance', 'Replay des cours de croyance islamique', (SELECT id FROM categories WHERE name = 'Replay'), 5, 1, NOW(), NOW()),
('Replay Les 6 piliers de la foi', 'Replay des cours sur les fondements de la foi', (SELECT id FROM categories WHERE name = 'Replay'), 6, 1, NOW(), NOW()),
('Replay L\'unicité d\'Allah', 'Replay des cours sur le Tawhid', (SELECT id FROM categories WHERE name = 'Replay'), 7, 1, NOW(), NOW()),

-- Replay At-Tafsir
('Replay At-Tafsir', 'Replay des cours d\'exégèse du Coran', (SELECT id FROM categories WHERE name = 'Replay'), 8, 1, NOW(), NOW()),
('Replay Tafsir des sourates courtes', 'Replay des cours d\'exégèse des sourates courtes', (SELECT id FROM categories WHERE name = 'Replay'), 9, 1, NOW(), NOW()),
('Replay Tafsir des sourates longues', 'Replay des cours d\'exégèse des sourates longues', (SELECT id FROM categories WHERE name = 'Replay'), 10, 1, NOW(), NOW()),

-- Replay Fiqh
('Replay Fiqh', 'Replay des cours de jurisprudence islamique', (SELECT id FROM categories WHERE name = 'Replay'), 11, 1, NOW(), NOW()),
('Replay Prière', 'Replay des cours sur les règles de la prière', (SELECT id FROM categories WHERE name = 'Replay'), 12, 1, NOW(), NOW()),
('Replay Jeûne', 'Replay des cours sur les règles du jeûne', (SELECT id FROM categories WHERE name = 'Replay'), 13, 1, NOW(), NOW()),
('Replay Zakat', 'Replay des cours sur l\'aumône légale', (SELECT id FROM categories WHERE name = 'Replay'), 14, 1, NOW(), NOW()),

-- Replay Hadith
('Replay Hadith', 'Replay des cours de sciences du hadith', (SELECT id FROM categories WHERE name = 'Replay'), 15, 1, NOW(), NOW()),
('Replay Les 40 hadiths', 'Replay des cours sur les 40 hadiths de Nawawi', (SELECT id FROM categories WHERE name = 'Replay'), 16, 1, NOW(), NOW()),
('Replay Sahih Bukhari', 'Replay des cours sur le Sahih Bukhari', (SELECT id FROM categories WHERE name = 'Replay'), 17, 1, NOW(), NOW()),

-- Replay As-Sirah
('Replay As-Sirah', 'Replay des cours de biographie du Prophète', (SELECT id FROM categories WHERE name = 'Replay'), 18, 1, NOW(), NOW()),
('Replay Enfance du Prophète', 'Replay des cours sur la jeunesse du Prophète', (SELECT id FROM categories WHERE name = 'Replay'), 19, 1, NOW(), NOW()),
('Replay Révélation', 'Replay des cours sur le début de la révélation', (SELECT id FROM categories WHERE name = 'Replay'), 20, 1, NOW(), NOW()),
('Replay Hégire', 'Replay des cours sur l\'émigration à Médine', (SELECT id FROM categories WHERE name = 'Replay'), 21, 1, NOW(), NOW()),

-- Replay Sirat as-sahabah
('Replay Sirat as-sahabah', 'Replay des cours de biographie des compagnons', (SELECT id FROM categories WHERE name = 'Replay'), 22, 1, NOW(), NOW()),
('Replay Les 10 promis au Paradis', 'Replay des cours sur les 10 compagnons', (SELECT id FROM categories WHERE name = 'Replay'), 23, 1, NOW(), NOW()),
('Replay Les femmes compagnons', 'Replay des cours sur les femmes compagnons', (SELECT id FROM categories WHERE name = 'Replay'), 24, 1, NOW(), NOW()),

-- Replay Invocations
('Replay Invocations', 'Replay des cours sur les invocations', (SELECT id FROM categories WHERE name = 'Replay'), 25, 1, NOW(), NOW()),
('Replay Invocations du matin et du soir', 'Replay des cours sur les adhkar quotidiens', (SELECT id FROM categories WHERE name = 'Replay'), 26, 1, NOW(), NOW()),
('Replay Invocations de la prière', 'Replay des cours sur les invocations pendant la prière', (SELECT id FROM categories WHERE name = 'Replay'), 27, 1, NOW(), NOW());

-- 4. Vérification
SELECT 'Catégories Replay créées avec succès!' as message;
SELECT c.name as category, COUNT(s.id) as subcategories_count 
FROM categories c 
LEFT JOIN subcategories s ON c.id = s.categoryId 
WHERE c.name = 'Replay' 
GROUP BY c.id, c.name;
