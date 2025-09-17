import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Course } from '../course/course.entity';
import { Subcategory } from 'src/subcategory/entities/subcategory.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Subcategory, (sub) => sub.category)
  subcategories: Subcategory[];


  @OneToMany(() => Course, (course) => course.category)
  courses: Course[];
}
