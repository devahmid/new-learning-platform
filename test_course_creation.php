<?php
/**
 * Script de test pour vérifier la création de cours avec des leçons
 */

// Configuration
$apiUrl = 'https://centre-culturel-olivier.fr/api/admin/courses';
$token = 'YOUR_JWT_TOKEN_HERE'; // Remplacez par un vrai token JWT

// Données de test
$courseData = [
    'title' => 'Test Course avec URLs',
    'description' => 'Cours de test pour vérifier les URLs des leçons',
    'categoryId' => 1,
    'subcategoryId' => 1,
    'levelId' => 1,
    'videoUrl' => 'https://example.com/course-video.mp4',
    'pdfUrl' => 'https://example.com/course-document.pdf',
    'lessons' => [
        [
            'title' => 'Leçon 1 avec vidéo',
            'content' => 'Contenu de la première leçon',
            'videoUrl' => 'https://www.youtube.com/watch?v=shgp3CdTz7U',
            'fileUrl' => 'https://example.com/lesson1-document.pdf',
            'duration' => 30,
            'order' => 1
        ],
        [
            'title' => 'Leçon 2 avec fichier',
            'content' => 'Contenu de la deuxième leçon',
            'videoUrl' => null,
            'fileUrl' => 'https://example.com/lesson2-document.pdf',
            'duration' => 45,
            'order' => 2
        ]
    ],
    'quizzes' => [],
    'exercises' => []
];

// Envoi de la requête
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($courseData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: " . $httpCode . "\n";
echo "Response: " . $response . "\n";

// Vérifier si les URLs sont bien sauvegardées
$responseData = json_decode($response, true);
if (isset($responseData['data']['lessons'])) {
    echo "\n=== VÉRIFICATION DES LEÇONS ===\n";
    foreach ($responseData['data']['lessons'] as $index => $lesson) {
        echo "Leçon " . ($index + 1) . ":\n";
        echo "  - Titre: " . $lesson['title'] . "\n";
        echo "  - videoUrl: " . ($lesson['videoUrl'] ?? 'NULL') . "\n";
        echo "  - fileUrl: " . ($lesson['fileUrl'] ?? 'NULL') . "\n";
        echo "  - duration: " . ($lesson['duration'] ?? 'NULL') . "\n";
        echo "\n";
    }
}
?>
