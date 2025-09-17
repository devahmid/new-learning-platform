# 🚀 Déploiement des Tables de Quiz

## ❌ **ERREUR ACTUELLE**
```
Table 'u281164575_centre.quiz_questions' doesn't exist
```

## 📋 **ÉTAPES DE DÉPLOIEMENT**

### 1. **Exécuter les migrations SQL**
```sql
-- Exécuter ce script sur votre base de données
-- Fichier: php-api/migrations/deploy_quiz_tables.sql
```

### 2. **Vérifier les tables créées**
```sql
-- Vérifier que les tables existent
SHOW TABLES LIKE 'quiz_%';
SHOW TABLES LIKE '%_progress';
```

### 3. **Tester la création de quiz**
```bash
# Exécuter le script de test
php php-api/test_quiz_creation.php
```

## 📁 **FICHIERS CRÉÉS**

### ✅ **Migrations SQL**
- `php-api/migrations/deploy_quiz_tables.sql` - Script complet de déploiement
- `php-api/migrations/add_quiz_fields.sql` - Ajout des colonnes timeLimit/passingScore
- `php-api/migrations/create_quiz_questions_table.sql` - Tables quiz_questions et quiz_question_options

### ✅ **Scripts de Test**
- `php-api/test_quiz_creation.php` - Test complet de création de quiz

## 🔧 **TABLES CRÉÉES**

### **quiz_questions**
```sql
CREATE TABLE quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quizId INT NOT NULL,
    text TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_quiz_id (quizId)
);
```

### **quiz_question_options**
```sql
CREATE TABLE quiz_question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    questionId INT NOT NULL,
    text VARCHAR(255) NOT NULL,
    isCorrect BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_question_id (questionId)
);
```

### **Colonnes ajoutées à quizzes**
```sql
ALTER TABLE quizzes ADD COLUMN timeLimit INT NULL DEFAULT NULL;
ALTER TABLE quizzes ADD COLUMN passingScore INT NULL DEFAULT 70;
```

## ✅ **APRÈS DÉPLOIEMENT**

1. **Tester la création de cours** avec quiz depuis le frontend
2. **Vérifier** que les questions et options sont sauvegardées
3. **Tester** l'affichage des quiz dans `lesson-detail`

## 🚨 **IMPORTANT**

- **Exécuter les migrations** dans l'ordre
- **Vérifier** que toutes les tables sont créées
- **Tester** avant de continuer avec le frontend

**Une fois les tables déployées, la création de quiz fonctionnera !** 🎯
