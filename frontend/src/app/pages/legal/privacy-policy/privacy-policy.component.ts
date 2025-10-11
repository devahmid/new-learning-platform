import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-privacy-policy',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-lg rounded-lg p-8">
          
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Politique de Confidentialité</h1>
            <p class="text-gray-600">Centre Culturel - Plateforme d'Apprentissage en Ligne</p>
            <p class="text-sm text-gray-500 mt-2">Dernière mise à jour : {{ lastUpdate }}</p>
          </div>

          <!-- Table des matières -->
          <div class="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 class="text-xl font-semibold mb-4">Table des matières</h2>
            <ul class="space-y-2">
              <li><a href="#introduction" class="text-blue-600 hover:underline">1. Introduction</a></li>
              <li><a href="#donnees-collectees" class="text-blue-600 hover:underline">2. Données collectées</a></li>
              <li><a href="#utilisation" class="text-blue-600 hover:underline">3. Utilisation des données</a></li>
              <li><a href="#partage" class="text-blue-600 hover:underline">4. Partage des données</a></li>
              <li><a href="#cookies" class="text-blue-600 hover:underline">5. Cookies et technologies similaires</a></li>
              <li><a href="#droits" class="text-blue-600 hover:underline">6. Vos droits</a></li>
              <li><a href="#securite" class="text-blue-600 hover:underline">7. Sécurité des données</a></li>
              <li><a href="#conservation" class="text-blue-600 hover:underline">8. Conservation des données</a></li>
              <li><a href="#modifications" class="text-blue-600 hover:underline">9. Modifications de cette politique</a></li>
              <li><a href="#contact" class="text-blue-600 hover:underline">10. Nous contacter</a></li>
            </ul>
          </div>

          <!-- Contenu principal -->
          <div class="prose max-w-none">
            
            <!-- Section 1 -->
            <section id="introduction" class="mb-8">
              <h2 class="text-2xl font-bold mb-4">1. Introduction</h2>
              <p class="mb-4">
                Le Centre Culturel (ci-après "nous", "notre" ou "le Centre") respecte votre vie privée et s'engage à protéger vos données personnelles. 
                Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons vos informations personnelles 
                lorsque vous utilisez notre plateforme d'apprentissage en ligne.
              </p>
              <p class="mb-4">
                Cette politique s'applique à tous les utilisateurs de notre plateforme, y compris les étudiants, parents et visiteurs.
              </p>
              <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p class="text-blue-800"><strong>Important :</strong> En utilisant notre plateforme, vous acceptez cette politique de confidentialité. 
                Si vous n'acceptez pas cette politique, veuillez ne pas utiliser nos services.</p>
              </div>
            </section>

            <!-- Section 2 -->
            <section id="donnees-collectees" class="mb-8">
              <h2 class="text-2xl font-bold mb-4">2. Données collectées</h2>
              
              <h3 class="text-lg font-semibold mb-2">2.1 Informations que vous nous fournissez directement</h3>
              <ul class="list-disc pl-6 mb-4">
                <li><strong>Informations de compte :</strong> Nom, prénom, adresse e-mail, mot de passe</li>
                <li><strong>Informations de profil :</strong> Date de naissance, niveau d'études, préférences d'apprentissage</li>
                <li><strong>Informations des enfants :</strong> Pour les comptes parents, informations des enfants (nom, âge, niveau)</li>
                <li><strong>Communications :</strong> Messages, commentaires, questions posées via notre plateforme</li>
                <li><strong>Informations de paiement :</strong> Données de facturation (traitées par nos partenaires sécurisés)</li>
              </ul>

              <h3 class="text-lg font-semibold mb-2">2.2 Données collectées automatiquement</h3>
              <ul class="list-disc pl-6 mb-4">
                <li><strong>Données d'utilisation :</strong> Pages visitées, temps passé, actions effectuées</li>
                <li><strong>Données techniques :</strong> Adresse IP, navigateur, système d'exploitation, résolution d'écran</li>
                <li><strong>Données d'apprentissage :</strong> Progression dans les cours, résultats de quiz, temps d'étude</li>
                <li><strong>Cookies et technologies similaires :</strong> Voir section dédiée</li>
              </ul>

              <h3 class="text-lg font-semibold mb-2">2.3 Données sensibles</h3>
              <p class="mb-4">
                Nous ne collectons délibérément aucune donnée sensible (origine ethnique, opinions politiques, croyances religieuses, 
                données biométriques, etc.) sauf si strictement nécessaire pour nos services éducatifs et avec votre consentement explicite.
              </p>
            </section>

            <!-- Section 3 -->
            <section id="utilisation" class="mb-8">
              <h2 class="text-2xl font-bold mb-4">3. Utilisation des données</h2>
              
              <p class="mb-4">Nous utilisons vos données personnelles pour :</p>
              
              <h3 class="text-lg font-semibold mb-2">3.1 Fourniture des services</h3>
              <ul class="list-disc pl-6 mb-4">
                <li>Créer et gérer votre compte</li>
                <li>Fournir l'accès aux cours et contenus éducatifs</li>
                <li>Suivre votre progression et personnaliser l'apprentissage</li>
                <li>Traiter les paiements et gérer les abonnements</li>
              </ul>

              <h3 class="text-lg font-semibold mb-2">3.2 Communication</h3>
              <ul class="list-disc pl-6 mb-4">
                <li>Envoyer des notifications importantes sur votre compte</li>
                <li>Répondre à vos questions et demandes de support</li>
                <li>Vous informer des nouveaux cours et fonctionnalités (avec votre consentement)</li>
              </ul>

              <h3 class="text-lg font-semibold mb-2">3.3 Amélioration des services</h3>
              <ul class="list-disc pl-6 mb-4">
                <li>Analyser l'utilisation de la plateforme pour l'améliorer</li>
                <li>Développer de nouveaux contenus et fonctionnalités</li>
                <li>Effectuer des recherches éducatives anonymisées</li>
              </ul>

              <h3 class="text-lg font-semibold mb-2">3.4 Obligations légales</h3>
              <ul class="list-disc pl-6 mb-4">
                <li>Respecter nos obligations légales et réglementaires</li>
                <li>Protéger nos droits et ceux de nos utilisateurs</li>
                <li>Prévenir la fraude et assurer la sécurité</li>
              </ul>
            </section>

            <!-- Section 4 -->
            <section id="partage" class="mb-8">
              <h2 class="text-2xl font-bold mb-4">4. Partage des données</h2>
              
              <p class="mb-4">Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :</p>
              
              <h3 class="text-lg font-semibold mb-2">4.1 Prestataires de services</h3>
              <ul class="list-disc pl-6 mb-4">
                <li><strong>Hébergement :</strong> Nos données sont hébergées de manière sécurisée</li>
                <li><strong>Paiements :</strong> Processeurs de paiement certifiés (PayPal, Stripe)</li>
                <li><strong>Analytics :</strong> Google Analytics (données anonymisées)</li>
                <li><strong>Support :</strong> Outils de communication et support client</li>
              </ul>

              <h3 class="text-lg font-semibold mb-2">4.2 Obligations légales</h3>
              <ul class="list-disc pl-6 mb-4">
                <li>Sur demande des autorités compétentes</li>
                <li>Pour protéger nos droits légaux</li>
                <li>En cas de fusion ou acquisition (avec notification préalable)</li>
              </ul>

              <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p class="text-green-800"><strong>Engagement :</strong> Tous nos partenaires sont tenus de respecter des normes strictes 
                de protection des données et ne peuvent utiliser vos informations que pour les services convenus.</p>
              </div>
            </section>

            <!-- Section 5 -->
            <section id="cookies" class="mb-8">
              <h2 class="text-2xl font-bold mb-4">5. Cookies et technologies similaires</h2>
              
              <p class="mb-4">Notre plateforme utilise différents types de cookies et technologies similaires :</p>
              
              <h3 class="text-lg font-semibold mb-2">5.1 Types de cookies</h3>
              <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-green-600">🔒 Cookies essentiels</h4>
                  <p class="text-sm">Nécessaires au fonctionnement de la plateforme. Toujours actifs.</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-blue-600">📊 Cookies analytics</h4>
                  <p class="text-sm">Mesure d'audience anonyme pour améliorer nos services.</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-purple-600">⚙️ Cookies fonctionnels</h4>
                  <p class="text-sm">Mémorisation de vos préférences et paramètres.</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-orange-600">🎯 Cookies marketing</h4>
                  <p class="text-sm">Personnalisation du contenu et des publicités.</p>
                </div>
              </div>

              <h3 class="text-lg font-semibold mb-2">5.2 Gestion des cookies</h3>
              <p class="mb-4">
                Vous pouvez gérer vos préférences de cookies à tout moment via :
              </p>
              <ul class="list-disc pl-6 mb-4">
                <li>Notre bannière de consentement lors de votre première visite</li>
                <li>Les paramètres de votre navigateur</li>
                <li>Le lien "Gérer les cookies" dans notre footer</li>
              </ul>

              <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p class="text-yellow-800"><strong>Note :</strong> Désactiver certains cookies peut affecter le fonctionnement de notre plateforme.</p>
              </div>
            </section>

            <!-- Section 6 -->
            <section id="droits" class="mb-8">
              <h2 class="text-2xl font-bold mb-4">6. Vos droits</h2>
              
              <p class="mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
              
              <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-blue-600">👁️ Droit d'accès</h4>
                  <p class="text-sm">Connaître quelles données nous détenons sur vous</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-green-600">✏️ Droit de rectification</h4>
                  <p class="text-sm">Corriger ou mettre à jour vos informations</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-red-600">🗑️ Droit à l'effacement</h4>
                  <p class="text-sm">Demander la suppression de vos données</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-purple-600">⏸️ Droit à la limitation</h4>
                  <p class="text-sm">Limiter le traitement de vos données</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-orange-600">📦 Droit à la portabilité</h4>
                  <p class="text-sm">Récupérer vos données dans un format lisible</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold text-gray-600">🚫 Droit d'opposition</h4>
                  <p class="text-sm">Vous opposer au traitement de vos données</p>
                </div>
              </div>

              <h3 class="text-lg font-semibold mb-2">6.1 Comment exercer vos droits</h3>
              <p class="mb-4">Pour exercer vos droits, contactez-nous :</p>
              <ul class="list-disc pl-6 mb-4">
                <li><strong>Email :</strong> privacy&#64;centre-culturel-olivier.com</li>
                <li><strong>Courrier :</strong> Centre Culturel - Service Protection des Données</li>
                <li><strong>Via votre compte :</strong> Section "Mes données personnelles"</li>
              </ul>

              <p class="mb-4">Nous vous répondrons dans les 30 jours suivant votre demande.</p>
            </section>

            <!-- Section 7 -->
            <section id="securite" class="mb-8">
              <h2 class="text-2xl font-bold mb-4">7. Sécurité des données</h2>
              
              <p class="mb-4">Nous mettons en place des mesures techniques et organisationnelles pour protéger vos données :</p>
              
              <h3 class="text-lg font-semibold mb-2">7.1 Mesures techniques</h3>
              <ul class="list-disc pl-6 mb-4">
                <li>Chiffrement des données en transit et au repos</li>
                <li>Serveurs sécurisés avec certificats SSL/TLS</li>
                <li>Sauvegardes régulières et redondantes</li>
                <li>Mise à jour régulière des systèmes de sécurité</li>
              </ul>

              <h3 class="text-lg font-semibold mb-2">7.2 Mesures organisationnelles</h3>
              <ul class="list-disc pl-6 mb-4">
                <li>Accès aux données limité au personnel autorisé</li>
                <li>Formation régulière du personnel sur la protection des données</li>
                <li>Procédures de gestion des incidents de sécurité</li>
                <li>Audits de sécurité réguliers</li>
              </ul>

              <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p class="text-red-800"><strong>Important :</strong> Malgré nos efforts, aucun système n'est 100% sécurisé. 
                En cas de violation de données, nous vous informerons dans les 72 heures.</p>
              </div>
            </section>

            <!-- Section 8 -->
            <section id="conservation" class="mb-8">
              <h2 class="text-2xl font-bold mb-4">8. Conservation des données</h2>
              
              <p class="mb-4">Nous conservons vos données personnelles uniquement le temps nécessaire aux finalités pour lesquelles elles ont été collectées :</p>
              
              <div class="space-y-4">
                <div class="border p-4 rounded">
                  <h4 class="font-semibold">👤 Données de compte actif</h4>
                  <p class="text-sm">Conservées pendant la durée de votre abonnement + 3 ans</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold">📚 Données d'apprentissage</h4>
                  <p class="text-sm">Conservées 5 ans après la fin de votre formation pour suivi pédagogique</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold">💳 Données de facturation</h4>
                  <p class="text-sm">Conservées 10 ans conformément aux obligations comptables</p>
                </div>
                <div class="border p-4 rounded">
                  <h4 class="font-semibold">📊 Données analytics</h4>
                  <p class="text-sm">Données anonymisées conservées 26 mois maximum</p>
                </div>
              </div>
            </section>

            <!-- Section 9 -->
            <section id="modifications" class="mb-8">
              <h2 class="text-2xl font-bold mb-4">9. Modifications de cette politique</h2>
              
              <p class="mb-4">
                Nous pouvons modifier cette politique de confidentialité pour refléter des changements dans nos pratiques, 
                nos services ou les exigences légales.
              </p>
              
              <p class="mb-4">En cas de modification importante :</p>
              <ul class="list-disc pl-6 mb-4">
                <li>Nous vous informerons par email 30 jours avant l'entrée en vigueur</li>
                <li>Nous afficherons un avis sur notre plateforme</li>
                <li>Nous vous demanderons votre consentement si nécessaire</li>
              </ul>

              <p class="mb-4">
                La date de dernière modification est indiquée en haut de cette page.
              </p>
            </section>

            <!-- Section 10 -->
            <section id="contact" class="mb-8">
              <h2 class="text-2xl font-bold mb-4">10. Nous contacter</h2>
              
              <p class="mb-4">Pour toute question concernant cette politique de confidentialité ou vos données personnelles :</p>
              
              <div class="bg-gray-50 p-6 rounded-lg">
                <h3 class="font-semibold mb-4">📧 Délégué à la Protection des Données (DPO)</h3>
                <div class="space-y-2">
                  <p><strong>Email :</strong> dpo&#64;centre-culturel-olivier.com</p>
                  <p><strong>Téléphone :</strong> +33 (0)X XX XX XX XX</p>
                  <p><strong>Adresse :</strong><br>
                    Centre Culturel Olivier<br>
                    Service Protection des Données<br>
                    [Adresse complète]<br>
                    [Code postal] [Ville]
                  </p>
                  <p><strong>Horaires :</strong> Lundi-Vendredi, 9h-17h</p>
                </div>
              </div>

              <div class="mt-6 bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-800 mb-2">🇪🇺 Autorité de contrôle</h4>
                <p class="text-blue-700 text-sm">
                  Si vous n'êtes pas satisfait de notre réponse, vous pouvez déposer une plainte auprès de la CNIL 
                  (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" class="underline">www.cnil.fr</a>
                </p>
              </div>
            </section>

          </div>

          <!-- Retour vers l'accueil -->
          <div class="text-center mt-8 pt-8 border-t">
            <button 
              (click)="goBack()" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Retour à la plateforme
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .prose h2 {
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }
    
    .prose h3 {
      color: #374151;
      margin-top: 1.5rem;
    }
    
    .prose a {
      color: #2563eb;
      text-decoration: underline;
    }
    
    .prose a:hover {
      color: #1d4ed8;
    }
  `]
})
export class PrivacyPolicyComponent {
    lastUpdate = '5 octobre 2025';

    goBack() {
        window.history.back();
    }
}