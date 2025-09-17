import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity()
export class ChildProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  gender: 'masculin' | 'féminin';

  @Column({ nullable: true })
  isAvailableWednesdayMorning: boolean;

  @Column({ nullable: true })
  hasExtracurricularActivity: boolean;

  @Column({ nullable: true })
  extracurricularDetails: string;

  @Column('simple-array', { nullable: true })
  preferredTimeSlots: string[];

  @Column({ nullable: true })
  priorArabicExperience: string;

  @Column({ nullable: true })
  arabicLevel: 'debutant' | 'lecture' | 'fluide' | 'ecriture';

  @Column({ nullable: true })
  hasLearningDisability: boolean;

  @Column('simple-array', { nullable: true })
  disabilities: string[];

  @Column({ nullable: true })
  supportDetails: string;

  @Column({ nullable: true })
  allowRecording: boolean;

  @Column({ nullable: true })
  extraNotes: string;

}
