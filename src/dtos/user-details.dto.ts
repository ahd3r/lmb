import { User } from '../model/User';

export class UserDetailsDto {
  public id: number;
  public email: number;
  public password: number;
  public recoveryToken: number;
  public twofa: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.password = user.password;
    this.recoveryToken = user.recoveryToken;
    this.twofa = user.twofa;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
