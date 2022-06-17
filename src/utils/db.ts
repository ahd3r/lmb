import { Sequelize } from 'sequelize-typescript';
import { Admin } from '../model/Admin';
import { User } from '../model/User';
import { dbHost, dbName, dbPass, dbPort, dbUser } from './config';

export class DB {
  private static sequelize: Sequelize;

  public static async getDb() {
    if (!DB.sequelize) {
      DB.sequelize = new Sequelize({
        dialect: 'postgres',
        host: dbHost,
        port: dbPort,
        username: dbUser,
        password: dbPass,
        database: dbName,
        models: [Admin, User]
      });
      await DB.sequelize.authenticate();
    }
    DB.sequelize.connectionManager.initPools();
    if (DB.sequelize.connectionManager.hasOwnProperty('getConnection')) {
      delete DB.sequelize.connectionManager.getConnection;
    }
    return DB.sequelize;
  }
}
