import { IsString, Length } from 'class-validator';

export class ChangeAdminPasswordRequestDto {
  @IsString()
  @Length(8)
  public password: string;
}
