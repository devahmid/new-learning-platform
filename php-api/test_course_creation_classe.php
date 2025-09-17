<?php
/**
 * Test de création de cours avec classeId
 */

// Configuration
$apiUrl = 'https://centre-culturel-olivier.fr/api/admin/courses';
$token = 'YOUR_JWT_TOKEN_HERE'; // Remplacez par un vrai token JWT

// Données de test
$courseData = [
    'title' => 'Test Cours avec Classe',
    'description' => 'Description du cours de test avec classeId',
    'classeId' => 1, // Utiliser classeId au lieu de levelId
    'categoryId' => 1,
    'subcategoryId' => null,
    'instructorId' => 1,
    'price' => '0.00',
    'isActive' => true,
    'videoUrl' => null,
    'pdfUrl' => null,
    'difficulty' => 'débutant'
];

// Configuration de la requête
$options = [
    'http' => [
        'header' => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token
        ],
        'method' => 'POST',
        'content' => json_encode($courseData)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($apiUrl, false, $context);

if ($result === FALSE) {
    echo "Erreur lors de l'appel API\n";
    print_r($http_response_header);
} else {
    echo "Réponse de l'API :\n";
    echo $result . "\n";
    
    $response = json_decode($result, true);
    if (isset($response['success']) && $response['success']) {
        echo "✅ Cours créé avec succès !\n";
        echo "ID du cours : " . $response['data']['id'] . "\n";
    } else {
        echo "❌ Erreur lors de la création :\n";
        print_r($response);
    }
}
?>
