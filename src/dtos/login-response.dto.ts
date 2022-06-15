export class LoginResponseDto {
  public token: string;

  constructor(token: string) {
    this.token = token;
  }
}
