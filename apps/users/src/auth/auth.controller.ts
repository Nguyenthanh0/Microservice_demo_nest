import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService, JwtUser } from './auth.service';
import { Public } from 'libs/common/decorator/customizeGuard';
import { LocalAuthGuard } from 'libs/common/passport/local-auth.guard';
import { RegisterUserDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() regisDto: RegisterUserDto) {
    return await this.authService.regiter(regisDto);
  }

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async handleLogin(@Req() req: { user: JwtUser }) {
    return this.authService.login(req.user);
  }
}
