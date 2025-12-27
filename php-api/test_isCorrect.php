<?php
/**
 * Script de test pour vérifier que le champ isCorrect est bien sauvegardé
 */

require_once __DIR__ . '/config/database.php';

$db = \DatabaseConfig::getInstance()->getConnection();

// Vérifier si la colonne isCorrect existe
$checkColumn = $db->query("SHOW COLUMNS FROM evaluation_question_options LIKE 'isCorrect'");
$columnExists = $checkColumn->rowCount() > 0;

echo "=== Test du champ isCorrect ===\n\n";

if (!$columnExists) {
    echo "❌ ERREUR : La colonne 'isCorrect' n'existe pas dans la table 'evaluation_question_options'\n";
    echo "📝 Action requise : Exécutez la migration SQL :\n";
    echo "   php-api/migrations/add_correct_answer_to_evaluations.sql\n\n";
    exit(1);
}

echo "✅ La colonne 'isCorrect' existe bien\n\n";

// Vérifier les options existantes
$options = $db->query("SELECT id, questionId, text, isCorrect, `order` FROM evaluation_question_options ORDER BY questionId, `order` LIMIT 10");
$allOptions = $options->fetchAll();

echo "=== Options existantes (10 premières) ===\n";
foreach ($allOptions as $option) {
    $status = $option['isCorrect'] ? '✅ CORRECTE' : '❌ Incorrecte';
    echo sprintf(
        "ID: %d | Question: %d | Texte: %s | %s\n",
        $option['id'],
        $option['questionId'],
        substr($option['text'], 0, 30),
        $status
    );
}

echo "\n=== Test de conversion booléenne ===\n";

// Tester différentes valeurs
$testValues = [
    true => 'true (bool)',
    false => 'false (bool)',
    1 => '1 (int)',
    0 => '0 (int)',
    '1' => '"1" (string)',
    '0' => '"0" (string)',
    'true' => '"true" (string)',
    'false' => '"false" (string)',
];

foreach ($testValues as $value => $label) {
    $isCorrect = 0;
    if (isset($value)) {
        $isCorrectValue = $value;
        if ($isCorrectValue === true || $isCorrectValue === 1 || $isCorrectValue === '1' || $isCorrectValue === 'true') {
            $isCorrect = 1;
        }
    }
    $result = $isCorrect ? '✅ 1' : '❌ 0';
    echo sprintf("%-20s => %s\n", $label, $result);
}

echo "\n=== Instructions ===\n";
echo "1. Vérifiez que la colonne existe (devrait être ✅)\n";
echo "2. Vérifiez les options existantes\n";
echo "3. Si toutes les options sont à 0, c'est normal si elles ont été créées avant la migration\n";
echo "4. Modifiez une évaluation avec des bonnes réponses cochées\n";
echo "5. Vérifiez que les nouvelles options ont bien isCorrect = 1\n";

