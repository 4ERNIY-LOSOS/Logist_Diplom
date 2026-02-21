import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { RequestUser } from '../auth/interfaces/request-user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@GetUser() user: RequestUser) {
    return this.userService.findMe(user.userId);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  updateProfile(@GetUser() user: RequestUser, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateMe(user.userId, updateUserDto);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleName.ADMIN) // Only ADMIN can create users via this endpoint
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleName.ADMIN) // Only ADMIN can list all users
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleName.ADMIN) // Only ADMIN can get any user by ID
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleName.ADMIN) // Only ADMIN can update user details
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleName.ADMIN) // Only ADMIN can remove users
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
