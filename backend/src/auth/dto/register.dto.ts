import { IsEmail, IsString, MinLength } from 'class-validator';
//check if values are email and string for register function, also check password length
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  name!: string;
}