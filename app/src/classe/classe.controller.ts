import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ClasseService } from './classe.service';
import { Classe } from './classe.entity';

@Controller('classes')
export class ClasseController {
  constructor(private service: ClasseService) { }

  @Get(':id')
   findById(@Param('id', ParseIntPipe) id: number): Promise<Classe> {
    console.log('[**************ID]', id)
    return this.service.findById(id);
  }
  
  @Get()
  findAll(): Promise<Classe[]> {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: Partial<Classe>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: Partial<Classe>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }

  @Post(':id/students')
  addStudents(@Param('id') id: number, @Body('students') studentIds: number[]) {
    return this.service.addStudents(+id, studentIds);
  }

}
