import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  @Type(() => String)
  @IsString()
  readonly name: string;

  @ApiProperty()
  @ValidateIf((data: CreateUserDto) => !data.phone)
  @IsNotEmpty({
    message: 'Email or phone is required',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @ValidateIf((data: CreateUserDto) => !data.email)
  @IsNotEmpty({
    message: 'Email or phone is required',
  })
  @IsPhoneNumber('RU', { always: false })
  readonly phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}
