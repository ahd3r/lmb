import { Sequelize } from 'sequelize-typescript';
import { Admin } from '../model/Admin';
import { User } from '../model/User';
import { dbHost, dbName, dbPass, dbPort, dbUser } from './config';

export class DB {
  private static sequelize: Sequelize;

  private constructor() {
    DB.sequelize = new Sequelize({
      dialect: 'postgres',
      host: dbHost,
      port: dbPort,
      username: dbUser,
      password: dbPass,
      database: dbName,
      models: [Admin, User]
    });
  }

  public static getDb() {
    if (!DB.sequelize) {
      new DB();
    }
    return DB.sequelize;
  }
}
