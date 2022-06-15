import { Length, IsEmail, IsString } from 'class-validator';

export class CreateAdminRequestDto {
  @IsString()
  @IsEmail()
  public email: string;

  @IsString()
  @Length(8)
  public password: string;
}
