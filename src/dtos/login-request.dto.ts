import { IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  public email: string;

  @IsString()
  @Length(8)
  public password: string;

  @IsString()
  @IsIn(['admin', 'user'])
  public type: 'admin' | 'user';

  @IsString()
  @IsOptional()
  @Length(6, 6)
  public code: string;
}
