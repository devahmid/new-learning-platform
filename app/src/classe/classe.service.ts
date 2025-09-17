import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classe } from './classe.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class ClasseService {
  constructor(
    @InjectRepository(Classe) private repo: Repository<Classe>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,) { }

  findAll(): Promise<Classe[]> {
    return this.repo.find({ relations: ['students', 'schedule', 'teacher'] });
  }
  
  findById(id: number): Promise<Classe> {
    return this.repo.findOne({
      where: { id },
      relations: ['students', 'schedule', 'teacher'],
    });
  }


  create(data: Partial<Classe>): Promise<Classe> {
    const newClasse = this.repo.create(data);
    return this.repo.save(newClasse);
  }

  update(id: number, data: Partial<Classe>) {
    return this.repo.update(id, data);
  }

  async delete(id: number) {
    // 1. Détacher tous les élèves de la classe
    await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set({ classe: null })
      .where('classeId = :id', { id })
      .execute();

    // 2. Détacher le prof
    await this.repo
      .createQueryBuilder()
      .update(Classe)
      .set({ teacher: null })
      .where('id = :id', { id })
      .execute();

    // 3. Supprimer la classe
    return this.repo.delete(id);
  }

  // classe.service.ts
  async addStudents(classeId: number, studentIds: number[]) {
    const classe = await this.repo.findOne({ where: { id: classeId }, relations: ['students'] });
    if (!classe) throw new Error('Classe not found');

    // Supposons que tu as accès au repo User
    const users = await this.userRepo.findByIds(studentIds);
    users.forEach(u => (u.classe = classe));
    await this.userRepo.save(users);

    return { message: 'Students added to class' };
  }

}
