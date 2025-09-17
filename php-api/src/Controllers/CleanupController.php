<?php

namespace App\Controllers;

use App\Utils\Response;
use App\Utils\JWT;

/**
 * Contrôleur pour nettoyer et reconstruire la base de données
 */
class CleanupController {
    
    /**
     * Nettoie complètement la base de données et la reconstruit
     */
    public function cleanAndRebuild() {
        // Vérifier l'authentification admin
        JWT::requireRole(['admin']);
        
        try {
            $db = \DatabaseConfig::getInstance()->getConnection();
            
            // Désactiver les contraintes de clé étrangère temporairement
            $db->exec("SET FOREIGN_KEY_CHECKS = 0");
            
            // Supprimer toutes les tables dans l'ordre inverse des dépendances
            $tables = [
                'exercises',
                'quizzes',
                'lessons',
                'courses',
                'subcategories',
                'categories',
                'levels'
            ];
            
            foreach ($tables as $table) {
                try {
                    $db->exec("TRUNCATE TABLE `$table`");
                    echo "Table $table nettoyée\n";
                } catch (\Exception $e) {
                    echo "Table $table n'existe pas ou erreur: " . $e->getMessage() . "\n";
                }
            }
            
            // Réactiver les contraintes de clé étrangère
            $db->exec("SET FOREIGN_KEY_CHECKS = 1");
            
            // Reconstruire les données de base
            $this->createLevels($db);
            $this->createCategories($db);
            $this->createSubcategories($db);
            $this->createUsers($db);
            $this->createCourses($db);
            
            Response::success(['message' => 'Base de données nettoyée et reconstruite avec succès'], 'Nettoyage terminé');
            
        } catch (\Exception $e) {
            Response::error('Erreur lors du nettoyage: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Crée les niveaux
     */
    private function createLevels($db) {
        $levels = [
            ['name' => 'Débutant', 'description' => 'Niveau adapté aux débutants', 'order' => 1],
            ['name' => 'Intermédiaire', 'description' => 'Niveau pour ceux qui ont des bases', 'order' => 2],
            ['name' => 'Avancé', 'description' => 'Niveau pour les étudiants avancés', 'order' => 3]
        ];
        
        foreach ($levels as $level) {
            $stmt = $db->prepare("INSERT INTO levels (name, description, `order`, isActive, createdAt, updatedAt) VALUES (?, ?, ?, 1, NOW(), NOW())");
            $stmt->execute([$level['name'], $level['description'], $level['order']]);
        }
        
        echo "Niveaux créés\n";
    }
    
    /**
     * Crée les catégories
     */
    private function createCategories($db) {
        $categories = [
            ['name' => 'Langue Arabe', 'description' => 'Cours de langue arabe', 'order' => 1],
            ['name' => 'Croyance', 'description' => 'Cours de croyance islamique', 'order' => 2],
            ['name' => 'At-Tafsir', 'description' => 'Exégèse du Coran', 'order' => 3],
            ['name' => 'Fiqh', 'description' => 'Jurisprudence islamique', 'order' => 4],
            ['name' => 'Hadith', 'description' => 'Sciences du hadith', 'order' => 5],
            ['name' => 'As-Sirah', 'description' => 'Biographie du Prophète', 'order' => 6],
            ['name' => 'Sirat as-sahabah', 'description' => 'Biographie des compagnons', 'order' => 7],
            ['name' => 'Invocations', 'description' => 'Les invocations du musulman', 'order' => 8]
        ];
        
        foreach ($categories as $category) {
            $stmt = $db->prepare("INSERT INTO categories (name, description, `order`, isActive, createdAt, updatedAt) VALUES (?, ?, ?, 1, NOW(), NOW())");
            $stmt->execute([$category['name'], $category['description'], $category['order']]);
        }
        
        echo "Catégories créées\n";
    }
    
    /**
     * Crée les sous-catégories
     */
    private function createSubcategories($db) {
        $subcategories = [
            // Langue Arabe
            ['name' => 'Vocabulaire', 'description' => 'Apprentissage du vocabulaire', 'categoryId' => 1, 'order' => 1],
            ['name' => 'Grammaire', 'description' => 'Grammaire arabe', 'categoryId' => 1, 'order' => 2],
            ['name' => 'Lecture', 'description' => 'Lecture et prononciation', 'categoryId' => 1, 'order' => 3],
            
            // Croyance
            ['name' => 'Les 6 piliers de la foi', 'description' => 'Les fondements de la foi', 'categoryId' => 2, 'order' => 1],
            ['name' => 'L\'unicité d\'Allah', 'description' => 'Tawhid et ses branches', 'categoryId' => 2, 'order' => 2],
            
            // At-Tafsir
            ['name' => 'Tafsir des sourates courtes', 'description' => 'Exégèse des sourates courtes', 'categoryId' => 3, 'order' => 1],
            ['name' => 'Tafsir des sourates longues', 'description' => 'Exégèse des sourates longues', 'categoryId' => 3, 'order' => 2],
            
            // Fiqh
            ['name' => 'Prière', 'description' => 'Les règles de la prière', 'categoryId' => 4, 'order' => 1],
            ['name' => 'Jeûne', 'description' => 'Les règles du jeûne', 'categoryId' => 4, 'order' => 2],
            ['name' => 'Zakat', 'description' => 'L\'aumône légale', 'categoryId' => 4, 'order' => 3],
            
            // Hadith
            ['name' => 'Les 40 hadiths', 'description' => 'Les 40 hadiths de Nawawi', 'categoryId' => 5, 'order' => 1],
            ['name' => 'Sahih Bukhari', 'description' => 'Extraits du Sahih Bukhari', 'categoryId' => 5, 'order' => 2],
            
            // As-Sirah
            ['name' => 'Enfance du Prophète', 'description' => 'La jeunesse du Prophète', 'categoryId' => 6, 'order' => 1],
            ['name' => 'Révélation', 'description' => 'Le début de la révélation', 'categoryId' => 6, 'order' => 2],
            ['name' => 'Hégire', 'description' => 'L\'émigration à Médine', 'categoryId' => 6, 'order' => 3],
            
            // Sirat as-sahabah
            ['name' => 'Les 10 promis au Paradis', 'description' => 'Biographie des 10 compagnons', 'categoryId' => 7, 'order' => 1],
            ['name' => 'Les femmes compagnons', 'description' => 'Biographie des femmes compagnons', 'categoryId' => 7, 'order' => 2],
            
            // Invocations
            ['name' => 'Invocations du matin et du soir', 'description' => 'Les adhkar quotidiens', 'categoryId' => 8, 'order' => 1],
            ['name' => 'Invocations de la prière', 'description' => 'Les invocations pendant la prière', 'categoryId' => 8, 'order' => 2]
        ];
        
        foreach ($subcategories as $subcategory) {
            $stmt = $db->prepare("INSERT INTO subcategories (name, description, categoryId, `order`, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, NOW(), NOW())");
            $stmt->execute([$subcategory['name'], $subcategory['description'], $subcategory['categoryId'], $subcategory['order']]);
        }
        
        echo "Sous-catégories créées\n";
    }
    
    /**
     * Crée les utilisateurs de base
     */
    private function createUsers($db) {
        $users = [
            [
                'email' => 'admin@example.com',
                'password' => password_hash('admin123', PASSWORD_DEFAULT),
                'firstName' => 'Admin',
                'lastName' => 'User',
                'type' => 'parent',
                'role' => 'admin'
            ],
            [
                'email' => 'instructor@example.com',
                'password' => password_hash('instructor123', PASSWORD_DEFAULT),
                'firstName' => 'Instructeur',
                'lastName' => 'Test',
                'type' => 'parent',
                'role' => 'instructor'
            ]
        ];
        
        foreach ($users as $user) {
            // Vérifier si l'utilisateur existe déjà
            $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$user['email']]);
            
            if (!$stmt->fetch()) {
                $stmt = $db->prepare("INSERT INTO users (email, password, firstName, lastName, type, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())");
                $stmt->execute([$user['email'], $user['password'], $user['firstName'], $user['lastName'], $user['type'], $user['role']]);
                echo "Utilisateur {$user['email']} créé\n";
            } else {
                echo "Utilisateur {$user['email']} existe déjà\n";
            }
        }
        
        echo "Utilisateurs traités\n";
    }
    
    /**
     * Crée des cours complets pour chaque catégorie
     */
    private function createCourses($db) {
        $courses = [
            // Langue Arabe - Débutant
            [
                'title' => 'Les salutations en arabe',
                'description' => 'Apprenez les salutations de base en arabe',
                'categoryId' => 1,
                'subcategoryId' => 1, // Vocabulaire
                'levelId' => 1,
                'instructorId' => 2,
                'difficulty' => 'débutant',
                'lessons' => [
                    [
                        'title' => 'Assalamu alaykum',
                        'content' => 'Apprenez la salutation islamique de base',
                        'order' => 1,
                        'videoUrl' => 'https://example.com/video1.mp4'
                    ],
                    [
                        'title' => 'Réponses aux salutations',
                        'content' => 'Comment répondre aux salutations',
                        'order' => 2,
                        'videoUrl' => 'https://example.com/video2.mp4'
                    ]
                ],
                'quizzes' => [
                    [
                        'title' => 'Quiz sur les salutations',
                        'description' => 'Testez vos connaissances sur les salutations',
                        'order' => 1,
                        'questions' => [
                            [
                                'text' => 'Que signifie "Assalamu alaykum" ?',
                                'answers' => [
                                    ['text' => 'Paix sur vous', 'isCorrect' => true],
                                    ['text' => 'Bonjour', 'isCorrect' => false],
                                    ['text' => 'Au revoir', 'isCorrect' => false]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            
            // Langue Arabe - Grammaire
            [
                'title' => 'Les lettres de l\'alphabet arabe',
                'description' => 'Apprenez l\'alphabet arabe et sa prononciation',
                'categoryId' => 1,
                'subcategoryId' => 2, // Grammaire
                'levelId' => 1,
                'instructorId' => 2,
                'difficulty' => 'débutant',
                'lessons' => [
                    [
                        'title' => 'Les 28 lettres',
                        'content' => 'Découvrez les 28 lettres de l\'alphabet arabe',
                        'order' => 1
                    ],
                    [
                        'title' => 'Prononciation',
                        'content' => 'Apprenez à prononcer chaque lettre',
                        'order' => 2
                    ]
                ],
                'quizzes' => [
                    [
                        'title' => 'Quiz alphabet',
                        'description' => 'Testez votre connaissance de l\'alphabet',
                        'order' => 1
                    ]
                ]
            ],
            
            // Croyance - Débutant
            [
                'title' => 'Les 6 piliers de la foi',
                'description' => 'Découvrez les fondements de la foi islamique',
                'categoryId' => 2,
                'subcategoryId' => 4, // Les 6 piliers de la foi
                'levelId' => 1,
                'instructorId' => 2,
                'difficulty' => 'débutant',
                'lessons' => [
                    [
                        'title' => 'Introduction aux piliers',
                        'content' => 'Présentation des 6 piliers de la foi',
                        'order' => 1
                    ],
                    [
                        'title' => 'La foi en Allah',
                        'content' => 'Le premier pilier : croire en Allah',
                        'order' => 2
                    ]
                ],
                'quizzes' => [
                    [
                        'title' => 'Quiz sur la foi',
                        'description' => 'Testez vos connaissances sur la foi',
                        'order' => 1
                    ]
                ]
            ],
            
            // At-Tafsir - Débutant
            [
                'title' => 'Tafsir de la sourate Al-Fatiha',
                'description' => 'Exégèse de la sourate d\'ouverture',
                'categoryId' => 3,
                'subcategoryId' => 6, // Tafsir des sourates courtes
                'levelId' => 1,
                'instructorId' => 2,
                'difficulty' => 'débutant',
                'lessons' => [
                    [
                        'title' => 'Introduction à Al-Fatiha',
                        'content' => 'Présentation de la sourate Al-Fatiha',
                        'order' => 1
                    ],
                    [
                        'title' => 'Verset par verset',
                        'content' => 'Explication détaillée de chaque verset',
                        'order' => 2
                    ]
                ],
                'quizzes' => [
                    [
                        'title' => 'Quiz Al-Fatiha',
                        'description' => 'Testez votre compréhension d\'Al-Fatiha',
                        'order' => 1
                    ]
                ]
            ],
            
            // Fiqh - Débutant
            [
                'title' => 'Les ablutions (Wudu)',
                'description' => 'Apprenez les règles des ablutions',
                'categoryId' => 4,
                'subcategoryId' => 9, // Prière
                'levelId' => 1,
                'instructorId' => 2,
                'difficulty' => 'débutant',
                'lessons' => [
                    [
                        'title' => 'Introduction aux ablutions',
                        'content' => 'Qu\'est-ce que les ablutions ?',
                        'order' => 1
                    ],
                    [
                        'title' => 'Les étapes des ablutions',
                        'content' => 'Comment faire les ablutions correctement',
                        'order' => 2
                    ]
                ],
                'quizzes' => [
                    [
                        'title' => 'Quiz ablutions',
                        'description' => 'Testez vos connaissances sur les ablutions',
                        'order' => 1
                    ]
                ]
            ],
            
            // Hadith - Débutant
            [
                'title' => 'Les 40 hadiths de Nawawi - Partie 1',
                'description' => 'Étude des premiers hadiths de Nawawi',
                'categoryId' => 5,
                'subcategoryId' => 11, // Les 40 hadiths
                'levelId' => 1,
                'instructorId' => 2,
                'difficulty' => 'débutant',
                'lessons' => [
                    [
                        'title' => 'Introduction aux 40 hadiths',
                        'content' => 'Présentation de la collection de Nawawi',
                        'order' => 1
                    ],
                    [
                        'title' => 'Le premier hadith',
                        'content' => 'Étude du premier hadith sur les intentions',
                        'order' => 2
                    ]
                ],
                'quizzes' => [
                    [
                        'title' => 'Quiz hadiths',
                        'description' => 'Testez votre compréhension des hadiths',
                        'order' => 1
                    ]
                ]
            ],
            
            // As-Sirah - Débutant
            [
                'title' => 'La naissance du Prophète',
                'description' => 'Découvrez les circonstances de la naissance du Prophète',
                'categoryId' => 6,
                'subcategoryId' => 13, // Enfance du Prophète
                'levelId' => 1,
                'instructorId' => 2,
                'difficulty' => 'débutant',
                'lessons' => [
                    [
                        'title' => 'La famille du Prophète',
                        'content' => 'Découvrez la famille du Prophète Muhammad',
                        'order' => 1
                    ],
                    [
                        'title' => 'Les signes de la prophétie',
                        'content' => 'Les signes annonciateurs de la prophétie',
                        'order' => 2
                    ]
                ],
                'quizzes' => [
                    [
                        'title' => 'Quiz naissance',
                        'description' => 'Testez vos connaissances sur la naissance du Prophète',
                        'order' => 1
                    ]
                ]
            ],
            
            // Sirat as-sahabah - Débutant
            [
                'title' => 'Abu Bakr As-Siddiq',
                'description' => 'Biographie du premier calife de l\'islam',
                'categoryId' => 7,
                'subcategoryId' => 15, // Les 10 promis au Paradis
                'levelId' => 1,
                'instructorId' => 2,
                'difficulty' => 'débutant',
                'lessons' => [
                    [
                        'title' => 'Sa conversion à l\'islam',
                        'content' => 'Comment Abu Bakr est devenu musulman',
                        'order' => 1
                    ],
                    [
                        'title' => 'Son rôle dans l\'islam',
                        'content' => 'Les contributions d\'Abu Bakr à l\'islam',
                        'order' => 2
                    ]
                ],
                'quizzes' => [
                    [
                        'title' => 'Quiz Abu Bakr',
                        'description' => 'Testez vos connaissances sur Abu Bakr',
                        'order' => 1
                    ]
                ]
            ],
            
            // Invocations - Débutant
            [
                'title' => 'Invocations du matin',
                'description' => 'Apprenez les invocations à réciter le matin',
                'categoryId' => 8,
                'subcategoryId' => 17, // Invocations du matin et du soir
                'levelId' => 1,
                'instructorId' => 2,
                'difficulty' => 'débutant',
                'lessons' => [
                    [
                        'title' => 'Introduction aux invocations',
                        'content' => 'L\'importance des invocations matinales',
                        'order' => 1
                    ],
                    [
                        'title' => 'Les invocations essentielles',
                        'content' => 'Les invocations à réciter chaque matin',
                        'order' => 2
                    ]
                ],
                'quizzes' => [
                    [
                        'title' => 'Quiz invocations',
                        'description' => 'Testez votre connaissance des invocations',
                        'order' => 1
                    ]
                ]
            ]
        ];
        
        foreach ($courses as $courseData) {
            // Créer le cours
            $stmt = $db->prepare("INSERT INTO courses (title, description, categoryId, subcategoryId, levelId, instructorId, difficulty, price, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, '0.00', 1, NOW(), NOW())");
            $stmt->execute([
                $courseData['title'],
                $courseData['description'],
                $courseData['categoryId'],
                $courseData['subcategoryId'],
                $courseData['levelId'],
                $courseData['instructorId'],
                $courseData['difficulty']
            ]);
            
            $courseId = $db->lastInsertId();
            
            // Créer les leçons
            if (isset($courseData['lessons'])) {
                foreach ($courseData['lessons'] as $lessonData) {
                    $stmt = $db->prepare("INSERT INTO lessons (title, content, courseId, `order`, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, NOW(), NOW())");
                    $stmt->execute([
                        $lessonData['title'],
                        $lessonData['content'],
                        $courseId,
                        $lessonData['order']
                    ]);
                }
            }
            
            // Créer les quiz
            if (isset($courseData['quizzes'])) {
                foreach ($courseData['quizzes'] as $quizData) {
                    $stmt = $db->prepare("INSERT INTO quizzes (title, description, courseId, `order`, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, NOW(), NOW())");
                    $stmt->execute([
                        $quizData['title'],
                        $quizData['description'],
                        $courseId,
                        $quizData['order']
                    ]);
                }
            }
        }
        
        echo "Cours créés avec succès\n";
    }
}
