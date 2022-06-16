import { Column, CreatedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'Admin', freezeTableName: true })
export class Admin extends Model {
  @Column({ allowNull: false, primaryKey: true, autoIncrement: true })
  public id: number;

  @Column({ allowNull: false, unique: true })
  public email: number;

  @Column({ allowNull: false })
  public password: number;

  @Column({ allowNull: true })
  public recoveryToken: string;

  @Column({ allowNull: false, defaultValue: false })
  public twofa: boolean;

  @CreatedAt
  @Column({ allowNull: false })
  public createdAt: Date;

  @UpdatedAt
  @Column({ allowNull: true })
  public updatedAt: Date;
}
