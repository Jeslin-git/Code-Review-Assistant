import { IsEmail, IsString } from 'class-validator';
//check if valus are email and string for login function
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}