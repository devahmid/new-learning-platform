-- Migration: Ajouter la colonne color à la table classes
-- Date: 2024

-- Ajouter la colonne color à la table classes
ALTER TABLE classes ADD COLUMN color VARCHAR(7) DEFAULT '#6366F1' AFTER description;

-- Mettre à jour les classes existantes avec des couleurs par défaut
UPDATE classes SET color = '#3B82F6' WHERE id = 1; -- Blue
UPDATE classes SET color = '#10B981' WHERE id = 2; -- Emerald  
UPDATE classes SET color = '#F59E0B' WHERE id = 3; -- Amber
UPDATE classes SET color = '#EF4444' WHERE id = 4; -- Red
UPDATE classes SET color = '#8B5CF6' WHERE id = 5; -- Violet
UPDATE classes SET color = '#06B6D4' WHERE id = 6; -- Cyan
UPDATE classes SET color = '#84CC16' WHERE id = 7; -- Lime
UPDATE classes SET color = '#F97316' WHERE id = 8; -- Orange
