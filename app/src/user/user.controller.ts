import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './CreateUserDto';
import { UpdateUserDto } from './update-user.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CreateChildDto } from 'src/profile/dto/create-child.dto';
import { CreateParentDto } from 'src/profile/dto/create-parent.dto';
import { UpdateParentDto } from 'src/profile/dto/update-parent.dto';
import { UpdateChildDto } from 'src/profile/dto/update-child.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  //@UseGuards(AuthGuard('jwt'))
  @Get('parents/:id')
  getParentProfile(@Param('id') id: number) {
    return this.userService.getParentProfile(+id);
  }

  @Get('parents')
  findParentsWithChildren() {
    return this.userService.findAllParentsWithChildren();
  }

  @Get(':id')
  getById(@Param('id') id: number): Promise<User> {
    return this.userService.findById(+id);
  }

  // @UseGuards(AuthGuard('jwt')) // Temporairement désactivé pour les tests
  @Get('me/children')
  getMyChildren(@CurrentUser() user: User): Promise<User[]> {
    // Pour les tests, on utilise l'ID 3 (parent qui a des enfants)
    return this.userService.getChildren(user?.id || 3);
  }

  @Post()
  create(@Body() userDto: CreateUserDto): Promise<User> {
    return this.userService.create(userDto);
  }

  @Post('request-password-reset')
  async requestReset(@Body('email') email: string) {
    await this.userService.requestPasswordReset(email);
    return { message: 'Si ce mail existe, un lien a été envoyé' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    await this.userService.resetPassword(body.token, body.newPassword);
    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  @Post()
  createParent(@Body() dto: CreateParentDto): Promise<User> {
    return this.userService.createParent(dto);
  }

  @Post('children')
  createChild(@Body() body: CreateChildDto): Promise<User> {
    return this.userService.createChild(body);
  }

  @Get(':id/children')
  getChildren(@Param('id') parentId: number): Promise<User[]> {
    return this.userService.getChildren(parentId);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: number,
    @Body() data: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(+id, data);
  }

  @Patch('parents/:id')
  updateParent(
    @Param('id') id: number,
    @Body() dto: UpdateParentDto,
  ): Promise<User> {
    console.log('ID*********** ', id);
    console.log('dto*********** ', dto);
    return this.userService.updateParent(+id, dto);
  }

  @Patch('children/:id')
  updateChild(
    @Param('id') id: number,
    @Body() dto: UpdateChildDto,
  ): Promise<User> {
    return this.userService.updateChild(+id, dto);
  }

  @Delete('children/:id')
  deleteChild(@Param('id') id: number): Promise<void> {
    return this.userService.deleteChild(+id);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: number): Promise<void> {
    return this.userService.deleteUser(+id);
  }
}
