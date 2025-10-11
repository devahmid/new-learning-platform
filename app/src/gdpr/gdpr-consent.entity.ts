import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('user_gdpr_consents')
export class GdprConsent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'boolean', default: true })
  analyticsConsent: boolean;

  @Column({ type: 'boolean', default: true })
  functionalConsent: boolean;

  @Column({ type: 'boolean', default: false })
  marketingConsent: boolean;

  @Column({ type: 'boolean', default: true })
  essentialConsent: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  consentTimestamp: Date;

  @Column({ type: 'varchar', length: 50, default: '1.0' })
  consentVersion: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 100, default: 'user_consent_update' })
  reason: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


