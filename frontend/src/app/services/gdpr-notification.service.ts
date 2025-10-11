import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GdprNotificationRequest {
    userId?: number;
    email?: string;
    fullName?: string;
    notificationType: 'initial_notice' | 'reminder' | 'final_notice';
}

@Injectable({
    providedIn: 'root'
})
export class GdprNotificationService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    /**
     * Envoie une notification RGPD à un utilisateur spécifique
     */
    sendGdprNotification(request: GdprNotificationRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/gdpr/notification`, {
            userId: request.userId,
            notificationType: request.notificationType,
            emailSubject: `Notification RGPD - ${request.notificationType}`,
            templateVersion: '1.0'
        });
    }

    /**
     * Envoie des notifications RGPD à tous les utilisateurs non conformes
     */
    sendBulkGdprNotifications(notificationType: 'initial_notice' | 'reminder' | 'final_notice'): Observable<any> {
        return this.http.post(`${this.apiUrl}/gdpr/send-bulk-notifications`, {
            notificationType
        });
    }

    /**
     * Récupère la liste des utilisateurs non conformes RGPD
     */
    getNonCompliantUsers(page: number = 1, limit: number = 50): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/gdpr/non-compliant-users?page=${page}&limit=${limit}`);
    }

    /**
     * Récupère les statistiques de conformité RGPD
     */
    getComplianceStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/gdpr/compliance-stats`);
    }

    /**
     * Génère le template d'email pour la notification RGPD
     */
    generateEmailTemplate(userInfo: any, notificationType: string): string {
        const baseUrl = window.location.origin;

        const templates = {
            initial_notice: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e40af; margin: 0;">🛡️ Mise à jour importante</h1>
              <p style="color: #6b7280; font-size: 16px;">Protection de vos données personnelles</p>
            </div>

            <!-- Greeting -->
            <p style="font-size: 16px; color: #374151;">Bonjour ${userInfo.fullName || 'Cher utilisateur'},</p>
            
            <!-- Main content -->
            <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0;">Nouvelle réglementation RGPD</h2>
              <p style="color: #1e40af; margin-bottom: 0;">
                Nous devons mettre à jour nos pratiques de protection des données pour être conforme au 
                <strong>Règlement Général sur la Protection des Données (RGPD)</strong>.
              </p>
            </div>

            <p style="color: #374151; line-height: 1.6;">
              En tant qu'utilisateur existant de notre plateforme d'apprentissage, nous devons obtenir votre 
              <strong>consentement explicite</strong> pour certains traitements de vos données personnelles.
            </p>

            <!-- What's changing -->
            <h3 style="color: #1f2937;">🔄 Ce qui change pour vous</h3>
            <ul style="color: #374151; line-height: 1.6;">
              <li><strong>Vos données sont déjà protégées</strong> - Rien ne change dans la sécurité</li>
              <li><strong>Plus de transparence</strong> - Vous savez exactement comment nous utilisons vos données</li>
              <li><strong>Plus de contrôle</strong> - Vous choisissez quelles données partager</li>
              <li><strong>Mêmes services</strong> - Votre accès aux cours reste inchangé</li>
            </ul>

            <!-- Action required -->
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">⚡ Action requise</h3>
              <p style="color: #92400e; margin-bottom: 15px;">
                Vous devez valider vos préférences de confidentialité lors de votre prochaine connexion.
              </p>
              <div style="text-align: center;">
                <a href="${baseUrl}/gdpr-compliance" 
                   style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  ✅ Valider mes préférences
                </a>
              </div>
            </div>

            <!-- Rights information -->
            <h3 style="color: #1f2937;">⚖️ Vos nouveaux droits</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
              <div style="text-align: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px;">
                <div style="font-size: 24px;">👁️</div>
                <strong>Droit d'accès</strong>
                <div style="font-size: 12px; color: #6b7280;">Voir vos données</div>
              </div>
              <div style="text-align: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px;">
                <div style="font-size: 24px;">✏️</div>
                <strong>Droit de rectification</strong>
                <div style="font-size: 12px; color: #6b7280;">Corriger vos infos</div>
              </div>
              <div style="text-align: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px;">
                <div style="font-size: 24px;">🗑️</div>
                <strong>Droit à l'effacement</strong>
                <div style="font-size: 12px; color: #6b7280;">Supprimer vos données</div>
              </div>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
                Pour toute question, contactez notre Délégué à la Protection des Données
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                📧 <a href="mailto:dpo@centre-culturel-olivier.com" style="color: #2563eb;">dpo@centre-culturel-olivier.com</a> | 
                📞 +33 (0)X XX XX XX XX
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
                Centre Culturel Olivier - Protection des données personnelles<br>
                Cet email est envoyé pour respecter nos obligations légales RGPD.
              </p>
            </div>
          </div>
        </div>
      `,

            reminder: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fef3c7; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 8px; border: 2px solid #f59e0b;">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #92400e; margin: 0;">⏰ Rappel important</h1>
              <p style="color: #92400e; font-size: 16px;">Action requise - Conformité RGPD</p>
            </div>

            <p style="font-size: 16px; color: #374151;">Bonjour ${userInfo.fullName || 'Cher utilisateur'},</p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0;">
                <strong>Nous n'avons pas encore reçu votre validation</strong> pour la mise à jour de nos politiques de confidentialité.
              </p>
            </div>

            <p style="color: #374151; line-height: 1.6;">
              Pour continuer à utiliser notre plateforme d'apprentissage en toute conformité avec le RGPD, 
              vous devez valider vos préférences de confidentialité.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/gdpr-compliance" 
                 style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                🚨 Valider maintenant
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Sans validation, l'accès à certaines fonctionnalités pourrait être limité.
            </p>
          </div>
        </div>
      `,

            final_notice: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fee2e2; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 8px; border: 2px solid #dc2626;">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0;">🚨 Dernier rappel</h1>
              <p style="color: #dc2626; font-size: 16px;">Action urgente requise</p>
            </div>

            <p style="font-size: 16px; color: #374151;">Bonjour ${userInfo.fullName || 'Cher utilisateur'},</p>
            
            <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
              <p style="color: #dc2626; margin: 0;">
                <strong>Votre compte nécessite une validation RGPD urgente.</strong> 
                Sans action de votre part dans les 7 jours, certaines fonctionnalités seront suspendues.
              </p>
            </div>

            <p style="color: #374151; line-height: 1.6;">
              Nous sommes tenus par la loi de nous assurer que tous nos utilisateurs ont donné leur consentement 
              explicite pour le traitement de leurs données personnelles.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/gdpr-compliance" 
                 style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                ⚡ VALIDER IMMÉDIATEMENT
              </a>
            </div>

            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #374151; margin-top: 0;">📋 Ce que vous devez faire :</h4>
              <ol style="color: #374151; margin-bottom: 0;">
                <li>Cliquer sur le bouton ci-dessus</li>
                <li>Lire nos politiques mises à jour</li>
                <li>Choisir vos préférences de confidentialité</li>
                <li>Confirmer vos choix</li>
              </ol>
            </div>

            <p style="color: #dc2626; font-weight: bold; text-align: center;">
              ⏰ Date limite : ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      `
        };

        return templates[notificationType as keyof typeof templates] || templates.initial_notice;
    }
}