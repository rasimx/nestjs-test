import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_REPOSITORY } from '../constants';
import { Op, UniqueConstraintError } from 'sequelize';
import { User } from './entities/user.entity';
import { SearchUserDto } from './dto/search-user.dto';

@Injectable()
export class UserService {
  constructor(@Inject(USER_REPOSITORY) private userRepository: typeof User) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = new this.userRepository(createUserDto);
      return await newUser.save();
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }
    }
  }

  public async findAll(params: SearchUserDto): Promise<{
    totalCount: number;
    page: number;
    limit: number;
    data: User[];
  }> {
    try {
      const { page = 1, limit = 10, search } = params;

      const skippedItems = (page - 1) * limit;

      const queryOptions = {
        offset: skippedItems,
        limit: limit,
      };

      if (search)
        Object.assign(queryOptions, {
          where: {
            [Op.or]: [
              { email: { [Op.like]: `%${search}%` } },
              { phone: { [Op.like]: `%${search}%` } },
              { name: { [Op.like]: `%${search}%` } },
            ],
          },
        });

      const { count: totalCount, rows } =
        await this.userRepository.findAndCountAll(queryOptions);
      return {
        totalCount,
        page: page,
        limit: limit,
        data: rows,
      };
    } catch (err) {
      throw err;
    }
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findOneByEmailOrPhone(emailOrPhone: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: {
        [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      user.update(updateUserDto);
      return user;
    } catch (err) {
      console.log(err);
      //  todo: Add exceptions?\
    }
  }

  async remove(id: number): Promise<string> {
    try {
      await this.userRepository.destroy({ where: { id } });
    } catch (err) {
      console.log(err);
      //  todo: if user not found?
    }
    // todo: or return json {success}?
    return `This action removes a #${id} user`;
  }
}
