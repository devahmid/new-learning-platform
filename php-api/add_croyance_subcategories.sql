-- =====================================================
-- SCRIPT SQL : Ajout des sous-catégories pour la Croyance
-- Catégorie ID 2 (Croyance)
-- =====================================================

-- Vérifier que la catégorie Croyance existe
-- Si elle n'existe pas, la créer
INSERT IGNORE INTO categories (id, name, description, `order`, isActive) VALUES
(2, 'Croyance', 'Cours sur la croyance musulmane (Aqida)', 2, TRUE);

-- Ajouter les sous-catégories pour la Croyance
INSERT INTO subcategories (name, description, categoryId, `order`, isActive) VALUES
-- Les 3 fondements
('Les 3 fondements', 'Les trois fondements essentiels de la croyance musulmane', 2, 1, TRUE),

-- Connaître mon seigneur Allah
('Connaître mon seigneur Allah ﷻ', 'Apprendre à connaître Allah, Ses noms et attributs', 2, 2, TRUE),

-- Connaître ma religion, l'islam
('Connaître ma religion, l''islam', 'Comprendre les bases de la religion islamique', 2, 3, TRUE),

-- Connaître mon prophète
('Connaître mon prophète ﷺ', 'Découvrir la vie et les enseignements du Prophète Muhammad', 2, 4, TRUE),

-- Les piliers de la foi
('Les piliers de la foi', 'Les six piliers de la foi islamique (Iman)', 2, 5, TRUE),

-- Le Poème Lamiyyah d'Ibn Taymiyyah
('Le Poème Lamiyyah d''Ibn Taymiyyah', 'Étude du célèbre poème de croyance d''Ibn Taymiyyah', 2, 6, TRUE),

-- Introduction à la croyance musulmane
('Introduction à la croyance musulmane', 'Introduction générale aux principes de la croyance', 2, 7, TRUE),

-- Les spécificités de la croyance musulmane
('Les spécificités de la croyance musulmane', 'Les particularités et spécificités de la croyance islamique', 2, 8, TRUE),

-- La foi en Allah
('La foi en Allah', 'Croire en Allah, Ses noms, attributs et actions', 2, 9, TRUE),

-- La foi aux anges
('La foi aux anges', 'Croire aux anges et à leur rôle dans l''univers', 2, 10, TRUE),

-- La foi au jour dernier
('La foi au jour dernier', 'Croire au jour de la résurrection et du jugement', 2, 11, TRUE),

-- La foi aux livres
('La foi aux livres', 'Croire aux livres révélés par Allah', 2, 12, TRUE),

-- La foi aux messagers
('La foi aux messagers', 'Croire aux prophètes et messagers d''Allah', 2, 13, TRUE),

-- La foi au destin
('La foi au destin', 'Croire au destin et à la prédestination (Qadar)', 2, 14, TRUE);

-- Vérifier les sous-catégories ajoutées
SELECT 
    s.id,
    s.name,
    s.description,
    s.categoryId,
    c.name as categoryName,
    s.`order`,
    s.isActive
FROM subcategories s
JOIN categories c ON s.categoryId = c.id
WHERE c.name = 'Croyance'
ORDER BY s.`order`;

-- Afficher le nombre de sous-catégories ajoutées
SELECT 
    COUNT(*) as total_subcategories,
    'Croyance' as category_name
FROM subcategories s
JOIN categories c ON s.categoryId = c.id
WHERE c.name = 'Croyance';
