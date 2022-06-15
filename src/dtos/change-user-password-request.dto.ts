import { IsString, Length } from 'class-validator';

export class ChangeUserPasswordRequestDto {
  @IsString()
  @Length(8)
  public password: string;
}
