import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ParentRegistration } from "./parent-registration.entity";

@Entity()
export class Child {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date' })
  birthDate: string;

  @Column()
  arabicLevel: number;

  @Column()
  hasActivityOnWednesday: boolean;

  @Column()
  hasActivityOnSaturday: boolean;

  @Column()
  hasActivityOnSunday: boolean;

  @Column({ type: 'text' })
  activityDetails: string;

  @ManyToOne(() => ParentRegistration, parent => parent.children, { onDelete: 'CASCADE' })
  parent: ParentRegistration;
}
