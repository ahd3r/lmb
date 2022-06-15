import { IsEmail, IsString } from 'class-validator';

export class UserRecoveryRequestDto {
  @IsString()
  @IsEmail()
  public email: string;
}
