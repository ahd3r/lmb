import { Column, CreatedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'User', freezeTableName: true })
export class User extends Model {
  @Column({ allowNull: false, primaryKey: true, autoIncrement: true })
  public id: number;

  @Column({ allowNull: false })
  public email: number;

  @Column({ allowNull: false })
  public password: number;

  @Column({ allowNull: true })
  public recoveryToken: number;

  @Column({ allowNull: false, defaultValue: false })
  public twofa: boolean;

  @CreatedAt
  @Column({ allowNull: false })
  public createdAt: Date;

  @UpdatedAt
  @Column({ allowNull: true })
  public updatedAt: Date;
}
