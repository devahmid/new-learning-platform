import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Payment } from 'src/payment/payment.entity';
// import * as PDFDocument from 'pdfkit';
// import { PassThrough } from 'stream';
// import * as getBuffer from 'stream-to-buffer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: +process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    const resetUrl = `http://arrisala.fr/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"Support" <${process.env.MAIL_USER}>`,
      to,
      subject: 'Réinitialisation du mot de passe',
      html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: auto; padding: 24px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
            <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 16px;">🔐 Réinitialisation du mot de passe</h2>
            <p style="font-size: 14px; color: #374151;">Vous avez demandé une réinitialisation de votre mot de passe.</p>
            <p style="margin: 20px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; text-decoration: none;">Réinitialiser mon mot de passe</a>
            </p>
            <p style="font-size: 12px; color: #9ca3af;">Ce lien expire dans 15 minutes.</p>
          </div>
        `
      ,
    });
  }

  async sendPaymentTicket(to: string, payment: Payment): Promise<void> {
    await this.transporter.sendMail({
      from: `"Support" <${process.env.MAIL_USER}>`,
      to,
      subject: 'Confirmation de paiement',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: auto; padding: 24px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 16px;">💳 Confirmation de votre paiement</h2>
          <p style="font-size: 14px; color: #374151;">Bonjour,</p>
          <p style="font-size: 14px; color: #374151;">Nous avons bien reçu votre paiement. Voici les détails :</p>
          <ul style="font-size: 14px; color: #111827; margin: 16px 0;">
            <li><strong>Montant :</strong> ${payment.amount} €</li>
            <li><strong>Référence :</strong> ${payment.reference}</li>
            <li><strong>Statut :</strong> ${payment.status}</li>
            <li><strong>Fournisseur :</strong> ${payment.provider}</li>
          </ul>
          <p style="font-size: 14px; color: #6b7280;">Merci pour votre confiance !</p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">L’équipe Arrisala</p>
        </div>
      `,
    });
  }

  async sendPaymentReceipt(to: string, payment: Payment): Promise<void> {
    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: auto; padding: 24px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
        <img src="https://arrisala.fr/assets/logo.png" alt="Arrisala" style="height: 40px; margin-bottom: 24px;" />
        <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 16px;">🎫 Confirmation de paiement</h2>
        <p style="font-size: 14px; color: #374151;">Bonjour,</p>
        <p style="font-size: 14px; color: #374151;">Nous avons bien reçu votre paiement. Voici les détails :</p>
        <ul style="font-size: 14px; color: #111827; margin: 16px 0; padding-left: 20px;">
          <li><strong>Montant :</strong> ${payment.amount} €</li>
          <li><strong>Référence :</strong> ${payment.reference}</li>
          <li><strong>Statut :</strong> ${payment.status}</li>
          <li><strong>Fournisseur :</strong> ${payment.provider}</li>
        </ul>
        <p style="font-size: 14px; color: #6b7280;">Merci pour votre confiance !</p>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">L’équipe Arrisala</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"Support Arrisala" <${process.env.MAIL_USER}>`,
      to,
      subject: '🎫 Confirmation de paiement',
      html,
    });
  }




  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"Support" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
  }

  async sendRegistrationConfirmationEmail(parent: {
    email: string;
    fullName: string;
    wasRegisteredLastYear: boolean;
    children: {
      firstName: string;
      lastName: string;
      birthDate: string;
      arabicLevel: number;
      activityDetails: string;
      hasActivityOnWednesday: boolean;
      hasActivityOnSaturday: boolean;
      hasActivityOnSunday: boolean;
    }[];
  }): Promise<void> {
    const childrenHtml = parent.children.map((child, index) => `
    <div style="margin-bottom: 16px; padding: 12px; background-color: #fff; border: 1px solid #ddd; border-radius: 8px;">
      <h4 style="margin-bottom: 8px;">👶 Enfant ${index + 1}</h4>
      <p><strong>Nom :</strong> ${child.lastName}</p>
      <p><strong>Prénom :</strong> ${child.firstName}</p>
      <p><strong>Date de naissance :</strong> ${child.birthDate}</p>
      <p><strong>Niveau arabe :</strong> ${child.arabicLevel}</p>
      <p><strong>Activités :</strong> ${[
        child.hasActivityOnWednesday ? 'Mercredi' : '',
        child.hasActivityOnSaturday ? 'Samedi' : '',
        child.hasActivityOnSunday ? 'Dimanche' : '',
      ].filter(Boolean).join(', ') || 'Aucune'}</p>
      <p><strong>Détails :</strong> ${child.activityDetails}</p>
    </div>
  `).join('');

    const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: auto; padding: 24px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
      <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 16px;">🎉 Votre inscription a bien été enregistrée</h2>
      <p style="font-size: 14px; color: #374151;">Assalam ‘aleykum wa rahmatullâhi wa barakâtuh <strong>${parent.fullName}</strong>,</p>
      <p><strong>Était inscrit en 2024-2025 :</strong> ${parent.wasRegisteredLastYear ? 'Oui' : 'Non'}</p>
      <p style="font-size: 14px; color: #374151;">Merci pour votre inscription aux cours en ligne du Centre Culturel l'Olivier. Un membre de notre équipe vous contactera prochainement pour confirmer votre inscription.</p>
      <br/>
      <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px;">👨‍👩‍👧‍👦 Enfants inscrits</h3>
      ${childrenHtml}
      <p style="font-size: 14px; color: #6b7280;">Barak Allahou fikoum pour votre confiance.</p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">L’équipe du Centre Culturel l’Olivier</p>
    </div>
  `;

    await this.sendEmail(parent.email, '✔️ Confirmation de votre inscription', html);
    await this.sendEmail('centre.culturel.olivier@gmail.com', `📥 Nouvelle inscription de ${parent.fullName}`, html);
  }



}
