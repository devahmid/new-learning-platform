import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Child } from "./child.entity";

@Entity()
export class ParentRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  acceptedConditions: boolean;

  @OneToMany(() => Child, child => child.parent, { cascade: true, eager: true })
  children: Child[];

  @Column({ default: false })
  wasRegisteredLastYear: boolean;

}
