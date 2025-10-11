<?php

namespace App\Controllers;

use App\Utils\Response;

/**
 * Contrôleur de diagnostic pour débugger les erreurs
 */
class DiagnosticController {
    
    public function gdprTest() {
        // Activer l'affichage des erreurs pour le debug
        error_reporting(E_ALL);
        ini_set('display_errors', 1);
        
        $results = [];
        $errors = [];
        
        try {
            $results[] = "1. Test autoloader...";
            require_once __DIR__ . '/../../config/autoloader.php';
            $results[] = "   ✅ Autoloader OK";
            
            $results[] = "2. Test connexion DB...";
            $db = \DatabaseConfig::getInstance()->getConnection();
            $results[] = "   ✅ Connexion DB OK";
            
            $results[] = "3. Test service simple...";
            $service = new \App\Services\GdprConsentServiceSimple($db);
            $results[] = "   ✅ Service instancié";
            
            $results[] = "4. Test table user_gdpr_consents...";
            $stmt = $db->prepare("DESCRIBE user_gdpr_consents");
            $stmt->execute();
            $fields = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            $results[] = "   ✅ Table existe avec " . count($fields) . " champs";
            
            $results[] = "5. Détail des champs:";
            foreach ($fields as $field) {
                $results[] = "   - " . $field['Field'] . " (" . $field['Type'] . ")";
            }
            
            $results[] = "6. Test insertion...";
            $testResult = $service->saveUserConsent(14, [
                'analytics' => true,
                'functional' => true,
                'marketing' => false
            ], '127.0.0.1', 'Test-Agent');
            
            if ($testResult['success']) {
                $results[] = "   ✅ Insertion réussie: " . $testResult['message'];
            } else {
                $errors[] = "   ❌ Échec insertion: " . $testResult['message'];
            }
            
        } catch (Exception $e) {
            $errors[] = "Erreur: " . $e->getMessage();
            $errors[] = "Fichier: " . $e->getFile();
            $errors[] = "Ligne: " . $e->getLine();
            $errors[] = "Stack: " . $e->getTraceAsString();
        } catch (Error $e) {
            $errors[] = "Erreur fatale: " . $e->getMessage();
            $errors[] = "Fichier: " . $e->getFile();
            $errors[] = "Ligne: " . $e->getLine();
        }
        
        Response::json([
            'success' => empty($errors),
            'results' => $results,
            'errors' => $errors,
            'timestamp' => date('Y-m-d H:i:s')
        ], empty($errors) ? 200 : 500);
    }
}