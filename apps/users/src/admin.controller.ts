import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'libs/common/decorator/roleGuard';
import { RolesGuard } from 'libs/common/passport/role.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminUpdateUserDto } from './dto/adminUpsteUser.dto';

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('users')
export class AdminController {
  constructor(private readonly userService: UsersService) {}

  @Post('admin')
  create(@Body() createUser: CreateUserDto) {
    return this.userService.create(createUser);
  }

  @Get('admin')
  getByName(@Query('name') name: string) {
    return this.userService.findByName(name);
  }

  @Put('admin/:id')
  update(@Param('id') id: string, @Body() updateUserDto: AdminUpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
