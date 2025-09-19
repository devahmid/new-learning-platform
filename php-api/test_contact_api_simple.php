<?php
/**
 * Test de l'API de contact avec la version simplifiée
 */

echo "=== Test de l'API de contact (version simplifiée) ===\n";

$apiUrl = 'https://centre-culturel-olivier.fr/api';

// Test 1: Test de getContactInfo
echo "🔍 Test de getContactInfo...\n";

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
    echo "✅ getContactInfo fonctionne\n";
} else {
    echo "❌ getContactInfo ne fonctionne pas (code: $httpCode)\n";
}

// Test 2: Test de sendMessage
echo "\n🔍 Test de sendMessage...\n";

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
    echo "✅ sendMessage fonctionne\n";
} else {
    echo "❌ sendMessage ne fonctionne pas (code: $httpCode)\n";
}

echo "\n🎉 Tests terminés!\n";
