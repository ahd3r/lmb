import { IsEmail, IsString } from 'class-validator';

export class AdminRecoveryRequestDto {
  @IsString()
  @IsEmail()
  public email: string;
}
