<?php
/**
 * Test simple de l'API de contact avec une approche directe
 */

echo "=== Test simple de l'API de contact ===\n";

// Test 1: Vérifier que l'endpoint répond
echo "🔍 Test de l'endpoint /contact/info...\n";

$apiUrl = 'https://centre-culturel-olivier.fr/api';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl . '/contact/info');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "📊 Code HTTP: $httpCode\n";
echo "📄 Réponse: " . substr($response, 0, 200) . "...\n";

if ($error) {
    echo "❌ Erreur cURL: $error\n";
} else if ($httpCode === 200) {
    echo "✅ Endpoint /contact/info fonctionne\n";
} else {
    echo "❌ Endpoint /contact/info ne fonctionne pas (code: $httpCode)\n";
}

// Test 2: Test d'envoi de message
echo "\n🔍 Test d'envoi de message...\n";

$messageData = [
    'firstName' => 'Test',
    'lastName' => 'User',
    'email' => 'test@example.com',
    'subject' => 'Test API',
    'message' => 'Message de test pour vérifier l\'API'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl . '/contact/send');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($messageData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "📊 Code HTTP: $httpCode\n";
echo "📄 Réponse: " . substr($response, 0, 200) . "...\n";

if ($error) {
    echo "❌ Erreur cURL: $error\n";
} else if ($httpCode === 200) {
    echo "✅ Envoi de message fonctionne\n";
} else {
    echo "❌ Envoi de message ne fonctionne pas (code: $httpCode)\n";
}

echo "\n🎉 Tests terminés!\n";