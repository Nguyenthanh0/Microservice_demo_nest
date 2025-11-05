import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from '../entity/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterUserDto } from './dto/register.dto';
import { comparePswHelper, hashPswHelper } from 'libs/ulti/helper';

export interface JwtUser {
  _id: string;
  identifier: string;
  email: string;
  name: string;
  role: UserRole;
  isTwoFAenabled: boolean;
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private readonly configSv: ConfigService,
  ) {}

  async regiter(regisDto: RegisterUserDto) {
    const existEmail = await this.userModel.findOne({ email: regisDto.email });
    if (existEmail) {
      throw new BadRequestException('This email has already existed');
    }
    const existName = await this.userModel.findOne({ name: regisDto.name });
    if (existName) {
      throw new BadRequestException('This username has already existed');
    }

    const hassPwd = await hashPswHelper(regisDto.password);
    const createUser = new this.userModel({
      ...regisDto,
      password: hassPwd,
    });
    const result = await createUser.save();
    return { message: 'register successfully', data: result.email };
  }

  async validateUser(identifier: string, password: string) {
    const isEmail = /\S+@\S+\.\S+/.test(identifier);
    const user = isEmail
      ? await this.userModel.findOne({ email: identifier }).exec()
      : await this.userModel.findOne({ name: identifier }).exec();
    if (!user) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }
    const checkPasswd = await comparePswHelper(password, user.password);
    if (!checkPasswd) {
      throw new HttpException('Inavlid password', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async login(user: JwtUser) {
    if (!user) {
      throw new UnauthorizedException('Email or password invalid ');
    }

    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };

    return {
      message: 'Login successfully',
      access_token: this.jwtService.sign(payload),
    };
  }
}
