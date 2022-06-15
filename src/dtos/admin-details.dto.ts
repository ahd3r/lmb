import { Admin } from '../model/Admin';

export class AdminDetailsDto {
  public id: number;
  public email: number;
  public password: number;
  public recoveryToken: number;
  public twofa: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(admin: Admin) {
    this.id = admin.id;
    this.email = admin.email;
    this.password = admin.password;
    this.recoveryToken = admin.recoveryToken;
    this.twofa = admin.twofa;
    this.createdAt = admin.createdAt;
    this.updatedAt = admin.updatedAt;
  }
}
