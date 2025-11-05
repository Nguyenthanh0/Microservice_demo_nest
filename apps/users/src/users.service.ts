import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entity/user.schema';
import { Model } from 'mongoose';
import { hashPswHelper } from 'libs/ulti/helper';
import { AdminUpdateUserDto } from './dto/adminUpsteUser.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  // User

  checkEmail = async (email: string) => {
    const existEmail = await this.userModel.exists({ email: email });
    if (existEmail) return true;
    return false;
  };

  async userGetInfo(_id: string) {
    const user = await this.userModel.findById(_id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(_id: string, updateUserDto: UpdateUserDto) {
    try {
      const existedUser = await this.userModel.findOne({
        name: updateUserDto.name,
      });

      if (existedUser) {
        throw new BadRequestException('This username has already existed');
      }
      const result = await this.userModel.findByIdAndUpdate(
        _id,
        updateUserDto,
        { new: true }, // trả về document sau khi update
      );
      if (!result) {
        throw new NotFoundException('User not found');
      }
      return { message: 'update user successfully', data: result.email };
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(error);
    }
  }

  // Admin
  async create(createUserDto: CreateUserDto) {
    const existEmail = await this.checkEmail(createUserDto.email);
    if (existEmail) {
      throw new BadRequestException('This email has already existed');
    }

    const hassPwd = await hashPswHelper(createUserDto.password);
    const createUser = new this.userModel({
      ...createUserDto,
      password: hassPwd,
    });
    const result = await createUser.save();
    return { message: 'create user successfully', data: result._id };
  }

  async findByName(name: string) {
    const user = await this.userModel.findOne({ name: name });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(_id: string, updateUserDto: AdminUpdateUserDto) {
    try {
      const existedEmail = await this.userModel.findOne({
        email: updateUserDto.email,
      });
      const existedUser = await this.userModel.findOne({
        name: updateUserDto.name,
      });

      if (existedUser || existedEmail) {
        throw new BadRequestException('Email or user name has already existed');
      }
      const user = await this.userModel.findById(_id);
      if (!user) throw new NotFoundException('User not found');

      const hashPassword = await hashPswHelper(updateUserDto.password);
      if (!hashPassword) throw new Error('');
      updateUserDto.password = hashPassword;

      await this.userModel.findByIdAndUpdate(user._id, updateUserDto, {
        new: true,
      });

      return { message: 'update user successfully', data: user.email };
    } catch (error) {
      console.log('error', error);
    }
  }

  async delete(_id: string) {
    await this.userModel.deleteOne({ _id });
    return 'delete this user successfully';
  }
}
