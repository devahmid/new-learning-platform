<?php

// Test de l'API de notifications par email
require_once 'config/autoloader.php';

// Configuration de test
$apiUrl = 'https://centre-culturel-olivier.com/api';
$testData = [
    'subject' => 'Test de notification - Centre Culturel',
    'content' => 'Bonjour {{first_name}},

Ceci est un test de notification par email depuis le Centre Culturel de l\'Olivier.

Nous testons notre nouveau système de communication pour vous tenir informé des dernières actualités.

Cordialement,
L\'équipe du Centre Culturel de l\'Olivier'
];

echo "🧪 Test de l'API de notifications par email\n";
echo "==========================================\n\n";

// Test 1: Récupérer les statistiques des utilisateurs
echo "1️⃣ Test des statistiques des utilisateurs...\n";
$statsUrl = $apiUrl . '/notifications/stats';
$statsResponse = file_get_contents($statsUrl);
$statsData = json_decode($statsResponse, true);

if ($statsData && $statsData['success']) {
    echo "✅ Statistiques récupérées avec succès:\n";
    echo "   - Total utilisateurs: " . $statsData['data']['total_users'] . "\n";
    echo "   - Utilisateurs actifs: " . $statsData['data']['active_users'] . "\n";
    echo "   - Parents: " . $statsData['data']['parents'] . "\n";
    echo "   - Professeurs: " . $statsData['data']['teachers'] . "\n\n";
} else {
    echo "❌ Erreur lors de la récupération des statistiques\n";
    echo "   Réponse: " . $statsResponse . "\n\n";
}

// Test 2: Récupérer l'historique des notifications
echo "2️⃣ Test de l'historique des notifications...\n";
$historyUrl = $apiUrl . '/notifications/history';
$historyResponse = file_get_contents($historyUrl);
$historyData = json_decode($historyResponse, true);

if ($historyData && $historyData['success']) {
    echo "✅ Historique récupéré avec succès:\n";
    echo "   - Nombre de notifications: " . count($historyData['data']) . "\n";
    if (count($historyData['data']) > 0) {
        $lastNotification = $historyData['data'][0];
        echo "   - Dernière notification: " . $lastNotification['subject'] . "\n";
        echo "   - Envoyée le: " . $lastNotification['sent_at'] . "\n";
    }
    echo "\n";
} else {
    echo "❌ Erreur lors de la récupération de l'historique\n";
    echo "   Réponse: " . $historyResponse . "\n\n";
}

// Test 3: Envoyer une notification de test (commenté pour éviter l'envoi réel)
echo "3️⃣ Test d'envoi de notification (SIMULATION)...\n";
echo "⚠️  L'envoi réel est désactivé pour éviter les emails de test\n";
echo "   Pour tester l'envoi réel, décommentez le code ci-dessous\n\n";

/*
// Décommentez cette section pour tester l'envoi réel
$sendUrl = $apiUrl . '/notifications/send';
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode($testData)
    ]
]);

$sendResponse = file_get_contents($sendUrl, false, $context);
$sendData = json_decode($sendResponse, true);

if ($sendData && $sendData['success']) {
    echo "✅ Notification envoyée avec succès:\n";
    echo "   - ID de notification: " . $sendData['data']['notification_id'] . "\n";
    echo "   - Total destinataires: " . $sendData['data']['total_recipients'] . "\n";
    echo "   - Envoyés avec succès: " . $sendData['data']['success_count'] . "\n";
    echo "   - Erreurs: " . $sendData['data']['error_count'] . "\n";
    if (!empty($sendData['data']['errors'])) {
        echo "   - Détails des erreurs:\n";
        foreach ($sendData['data']['errors'] as $error) {
            echo "     * " . $error . "\n";
        }
    }
} else {
    echo "❌ Erreur lors de l'envoi de la notification\n";
    echo "   Réponse: " . $sendResponse . "\n";
}
*/

echo "🎯 Test terminé!\n";
echo "Pour tester l'envoi réel, modifiez ce script et décommentez la section d'envoi.\n";
