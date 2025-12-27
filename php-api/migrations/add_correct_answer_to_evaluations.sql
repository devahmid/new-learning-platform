-- =====================================================
-- AJOUT DU CHAMP "isCorrect" POUR LES OPTIONS D'ÉVALUATION
-- =====================================================

-- Ajouter le champ isCorrect à la table evaluation_question_options
ALTER TABLE evaluation_question_options 
ADD COLUMN isCorrect BOOLEAN DEFAULT FALSE AFTER `text`;

-- Ajouter un index pour améliorer les performances lors de la recherche des bonnes réponses
CREATE INDEX idx_correct ON evaluation_question_options(questionId, isCorrect);

-- Mettre à jour les options existantes (par défaut, aucune n'est correcte)
-- Vous devrez manuellement marquer les bonnes réponses dans l'interface admin

