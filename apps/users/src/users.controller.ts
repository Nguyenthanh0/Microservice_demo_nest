import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtUser } from './auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('user')
  getInfo(@Req() req: { user: JwtUser }) {
    return this.usersService.userGetInfo(req.user._id);
  }

  @Patch('user')
  update(@Req() req: { user: JwtUser }, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user._id, updateUserDto);
  }
}
