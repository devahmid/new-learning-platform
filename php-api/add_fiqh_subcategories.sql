-- =====================================================
-- SCRIPT SQL : Ajout des sous-catégories pour le Fiqh
-- Catégorie ID 4 (Fiqh)
-- =====================================================

-- Vérifier que la catégorie Fiqh existe
-- Si elle n'existe pas, la créer
INSERT IGNORE INTO categories (id, name, description, `order`, isActive) VALUES
(4, 'Fiqh', 'Jurisprudence islamique et règles de la religion', 4, TRUE);

-- Ajouter les sous-catégories pour le Fiqh
INSERT INTO subcategories (name, description, categoryId, `order`, isActive) VALUES
-- Les bonnes manières
('Les bonnes manières', 'Apprendre les bonnes manières et l''éthique islamique', 4, 1, TRUE),

-- Les eaux
('Les eaux', 'Classification et règles des différents types d''eau en Islam', 4, 2, TRUE),

-- Les ablutions
('Les ablutions', 'Apprendre les ablutions mineures (wudu) et majeures (ghusl)', 4, 3, TRUE),

-- La prière
('La prière', 'Règles et conditions de la prière obligatoire et surérogatoire', 4, 4, TRUE),

-- La Zakat
('La Zakat', 'Règles de l''aumône obligatoire et calcul de la Zakat', 4, 5, TRUE),

-- Le jeûne
('Le jeûne', 'Règles du jeûne du Ramadan et des jeûnes surérogatoires', 4, 6, TRUE),

-- Le pèlerinage
('Le pèlerinage', 'Règles du Hajj et de la Omra', 4, 7, TRUE),

-- Qu'est-ce que le Fiqh ?
('Qu''est-ce que le Fiqh ?', 'Introduction à la jurisprudence islamique', 4, 8, TRUE),

-- Les quatre imams
('Les quatre imams', 'Découvrir les quatre écoles juridiques sunnites', 4, 9, TRUE),

-- Les différentes eaux
('Les différentes eaux', 'Classification détaillée des types d''eau en jurisprudence', 4, 10, TRUE),

-- Les bonnes manières en faisant ses besoins
('Les bonnes manières en faisant ses besoins', 'Éthique et règles pour les besoins naturels', 4, 11, TRUE),

-- Les impuretés
('Les impuretés', 'Règles concernant les impuretés et leur purification', 4, 12, TRUE),

-- L'importance du Fiqh et des sciences religieuses
('L''importance du Fiqh et des sciences religieuses', 'Pourquoi étudier la jurisprudence islamique', 4, 13, TRUE),

-- La jurisprudence musulmane
('La jurisprudence musulmane', 'Introduction générale à la jurisprudence islamique', 4, 14, TRUE),

-- L'évolution de la jurisprudence
('L''évolution de la jurisprudence', 'Histoire et développement de la jurisprudence à travers les siècles', 4, 15, TRUE),

-- Les causes des divergences entre les savants
('Les causes des divergences entre les savants', 'Comprendre pourquoi les savants divergent sur certaines questions', 4, 16, TRUE),

-- Les spécificités de la jurisprudence musulmane
('Les spécificités de la jurisprudence musulmane', 'Les particularités et caractéristiques de la jurisprudence islamique', 4, 17, TRUE);

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
WHERE c.name = 'Fiqh'
ORDER BY s.`order`;

-- Afficher le nombre de sous-catégories ajoutées
SELECT 
    COUNT(*) as total_subcategories,
    'Fiqh' as category_name
FROM subcategories s
JOIN categories c ON s.categoryId = c.id
WHERE c.name = 'Fiqh';
