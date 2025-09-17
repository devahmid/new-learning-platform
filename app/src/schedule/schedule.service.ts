import { InjectRepository } from "@nestjs/typeorm";
import { Schedule } from "./schedule.entity";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

// schedule.service.ts
@Injectable()
export class ScheduleService {
  constructor(@InjectRepository(Schedule) private repo: Repository<Schedule>) {}

  create(data: Partial<Schedule>) {
    const schedule = this.repo.create(data);
    return this.repo.save(schedule);
  }
  update(id: number, data: Partial<Schedule>) {
  return this.repo.update(id, data);
}


  delete(id: number) {
    return this.repo.delete(id);
  }
}
