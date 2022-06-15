import { IsEmail, IsString } from 'class-validator';

export class Recovery2faRequestDto {
  @IsString()
  @IsEmail()
  public email: string;
}
