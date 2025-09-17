# Création de la table schedules

## Instructions pour créer la table des créneaux horaires

### 1. Exécuter le script SQL

Exécutez le contenu du fichier `create_schedules_table.sql` dans votre base de données MySQL :

```sql
-- Création de la table schedules pour gérer les créneaux horaires
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day VARCHAR(20) NOT NULL COMMENT 'Jour de la semaine (Lundi, Mardi, etc.)',
    startHour TIME NOT NULL COMMENT 'Heure de début du créneau',
    endHour TIME NOT NULL COMMENT 'Heure de fin du créneau',
    classeId INT NOT NULL COMMENT 'ID de la classe associée',
    teacherId INT NULL COMMENT 'ID du professeur (optionnel)',
    description TEXT NULL COMMENT 'Description du créneau (optionnel)',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Contraintes
    FOREIGN KEY (classeId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Index pour améliorer les performances
    INDEX idx_classe_id (classeId),
    INDEX idx_teacher_id (teacherId),
    INDEX idx_day (day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table des créneaux horaires des classes';
```

### 2. Vérification

Après avoir créé la table, vous pouvez vérifier qu'elle existe :

```sql
DESCRIBE schedules;
```

### 3. Endpoints API disponibles

Une fois la table créée, les endpoints suivants seront disponibles :

- `GET /api/schedules` - Récupérer tous les créneaux
- `GET /api/schedules/{id}` - Récupérer un créneau par ID
- `GET /api/schedules/classe/{classeId}` - Récupérer les créneaux d'une classe
- `POST /api/schedules` - Créer un nouveau créneau
- `PATCH /api/schedules/{id}` - Mettre à jour un créneau
- `DELETE /api/schedules/{id}` - Supprimer un créneau

### 4. Structure des données

#### Création d'un créneau (POST /api/schedules)
```json
{
  "day": "Lundi",
  "startHour": "14:00",
  "endHour": "15:30",
  "classeId": 1,
  "teacherId": 5,
  "description": "Cours d'arabe niveau débutant"
}
```

#### Réponse
```json
{
  "id": 1,
  "day": "Lundi",
  "startHour": "14:00",
  "endHour": "15:30",
  "classeId": 1,
  "teacherId": 5,
  "description": "Cours d'arabe niveau débutant",
  "createdAt": "2024-01-15 10:30:00",
  "updatedAt": "2024-01-15 10:30:00",
  "classe": {
    "id": 1,
    "name": "Classe A1",
    "description": "Classe pour débutants"
  },
  "teacher": {
    "id": 5,
    "firstName": "Ahmed",
    "lastName": "Benali"
  }
}
```
