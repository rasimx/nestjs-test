import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(emailOrPhone: string, assumedPassword: string) {
    const user = await this.userService.findOneByEmailOrPhone(emailOrPhone);
    if (!user) {
      return null;
    }
    if (!(await this.isValidPassword(assumedPassword, user.password))) {
      return null;
    }

    const { password, ...userData } = user['dataValues'];
    return userData;
  }

  async login(user: User) {
    const payload = { username: user.name, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async isValidPassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  }

  public async create(user: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await this.userService.create({
      ...user,
      password: hashedPassword,
    });

    const data = { userName: newUser.name, id: newUser.id };

    const access_token = await this.jwtService.signAsync(data);

    return { access_token };
  }
}
