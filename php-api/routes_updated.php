<?php
/**
 * Routes API mises à jour pour la structure Classe → Matière → Cours
 */

// =====================================================
// ROUTES POUR LES COURS (CourseController)
// =====================================================

// Anciennes routes (à remplacer)
// GET /courses/level/{levelId} → GET /courses/classe/{classeId}
// GET /courses/category/{categoryId}/level/{levelId} → GET /courses/classe/{classeId}/category/{categoryId}

// Nouvelles routes
$routes = [
    // Routes de base pour les cours
    'GET /courses' => 'CourseController@findAll',
    'GET /courses/{id}' => 'CourseController@findById',
    'POST /courses' => 'CourseController@create',
    'PUT /courses/{id}' => 'CourseController@update',
    'DELETE /courses/{id}' => 'CourseController@delete',
    
    // Nouvelles routes basées sur les classes
    'GET /courses/classe/{classeId}' => 'CourseController@findByClasse',
    'GET /courses/classe/{classeId}/category/{categoryId}' => 'CourseController@findByClasseAndCategory',
    'GET /courses/classe/{classeId}/categories' => 'CourseController@getCategoriesForClasse',
    
    // =====================================================
    // ROUTES POUR LES CLASSES (ClassController)
    // =====================================================
    
    'GET /classes' => 'ClassController@findAll',
    'GET /classes/{id}' => 'ClassController@findById',
    'POST /classes' => 'ClassController@create',
    'PUT /classes/{id}' => 'ClassController@update',
    'DELETE /classes/{id}' => 'ClassController@delete',
    
    // Nouvelles routes pour la gestion des classes
    'GET /classes/{classeId}/categories' => 'ClassController@getCategories',
    'GET /classes/{classeId}/courses' => 'ClassController@getCourses',
    'GET /classes/{classeId}/courses/category/{categoryId}' => 'ClassController@getCoursesByCategory',
    'POST /classes/{classeId}/categories' => 'ClassController@addCategory',
    'DELETE /classes/{classeId}/categories/{categoryId}' => 'ClassController@removeCategory',
    
    // =====================================================
    // ROUTES POUR LES CATÉGORIES (CategoryController)
    // =====================================================
    
    'GET /categories' => 'CategoryController@findAll',
    'GET /categories/{id}' => 'CategoryController@findById',
    'POST /categories' => 'CategoryController@create',
    'PUT /categories/{id}' => 'CategoryController@update',
    'DELETE /categories/{id}' => 'CategoryController@delete',
    
    // =====================================================
    // ROUTES POUR LES UTILISATEURS (UserController)
    // =====================================================
    
    'GET /users' => 'UserController@findAll',
    'GET /users/{id}' => 'UserController@findById',
    'POST /users' => 'UserController@create',
    'PUT /users/{id}' => 'UserController@update',
    'DELETE /users/{id}' => 'UserController@delete',
    
    // Routes spécifiques pour les élèves
    'GET /users/classe/{classeId}' => 'UserController@findByClasse',
    'POST /users/{userId}/assign-classe' => 'UserController@assignToClasse',
    'DELETE /users/{userId}/remove-classe' => 'UserController@removeFromClasse',
];

// =====================================================
// EXEMPLE D'UTILISATION DES NOUVELLES ROUTES
// =====================================================

/*
Exemples d'utilisation :

1. Récupérer tous les cours d'une classe :
   GET /courses/classe/1

2. Récupérer les cours d'une classe pour une matière spécifique :
   GET /courses/classe/1/category/2

3. Récupérer toutes les matières disponibles pour une classe :
   GET /courses/classe/1/categories

4. Récupérer toutes les matières associées à une classe :
   GET /classes/1/categories

5. Récupérer tous les cours d'une classe :
   GET /classes/1/courses

6. Récupérer les cours d'une classe par matière :
   GET /classes/1/courses/category/2

7. Ajouter une matière à une classe :
   POST /classes/1/categories
   Body: {"categoryId": 2, "order": 1}

8. Supprimer une matière d'une classe :
   DELETE /classes/1/categories/2

9. Assigner un élève à une classe :
   POST /users/123/assign-classe
   Body: {"classeId": 1}

10. Récupérer tous les élèves d'une classe :
    GET /users/classe/1
*/

return $routes;
