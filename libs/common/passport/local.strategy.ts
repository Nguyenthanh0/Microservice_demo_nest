import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'apps/users/src/auth/auth.service';
import { User } from 'apps/users/src/entity/user.schema';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'identifier' });
  }

  async validate(identifier: string, password: string) {
    const user = (await this.authService.validateUser(
      identifier,
      password,
    )) as User;
    if (!user) {
      throw new UnauthorizedException('User or password incorrect');
    }
    return user;
  }
}
