import { Sequelize } from 'sequelize-typescript';
import { Umzug, SequelizeStorage } from 'umzug';

import { dbHost, dbPort, dbUser, dbPass, dbName } from './config';

export const handler = async () => {
  let sequelize = new Sequelize({
    dialect: 'postgres',
    host: dbHost,
    port: dbPort,
    username: dbUser,
    password: dbPass
  });

  try {
    await sequelize.authenticate();
    sequelize.connectionManager.initPools();
    if (sequelize.connectionManager.hasOwnProperty('getConnection')) {
      delete sequelize.connectionManager.getConnection;
    }

    await sequelize.query('SELECT table_name FROM information_schema.columns');
    try {
      await sequelize.query(`CREATE DATABASE ${dbName}`);
      console.log('Database created');
    } catch (e) {
      console.log('Database has already been created');
    }

    await sequelize.close();

    sequelize = new Sequelize({
      dialect: 'postgres',
      host: dbHost,
      port: dbPort,
      username: dbUser,
      password: dbPass,
      database: dbName
    });

    await sequelize.authenticate();
    sequelize.connectionManager.initPools();
    if (sequelize.connectionManager.hasOwnProperty('getConnection')) {
      delete sequelize.connectionManager.getConnection;
    }

    let counter = 0;

    const umzug = new Umzug({
      migrations: {
        glob: './*-migration.js',
        resolve: ({ name, path, context }) => {
          const migration = require(path);
          return {
            name,
            up: async () => {
              console.log(++counter);
              console.log(migration.up);
              return migration.up(context, Sequelize);
            },
            down: async () => {
              return migration.down(context, Sequelize);
            }
          };
        }
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger: console
    });
    await umzug.up();
  } catch (e) {
    console.log('An error occurred');
    console.log(e);
  } finally {
    await sequelize.close();
  }
};
