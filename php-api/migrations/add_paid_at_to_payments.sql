-- Ajouter la colonne paidAt à la table payments
ALTER TABLE payments ADD COLUMN paidAt DATETIME NULL AFTER updatedAt;

-- Mettre à jour les paiements existants avec le statut 'completed' pour avoir une date de paiement
UPDATE payments 
SET paidAt = updatedAt 
WHERE status = 'completed' AND paidAt IS NULL;
