import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import { Schedule } from "./schedule.entity";

// schedule.controller.ts
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Post()
  create(@Body() data: Partial<Schedule>) {
    return this.service.create(data);
  }

  @Patch(':id')
update(@Param('id') id: number, @Body() data: Partial<Schedule>) {
  return this.service.update(id, data);
}

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
