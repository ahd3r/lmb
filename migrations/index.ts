import { Sequelize } from 'sequelize-typescript';
import { Umzug, SequelizeStorage } from 'umzug';

import { dbHost, dbPort, dbUser, dbPass } from './config';

export const handler = async () => {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: dbHost,
    port: dbPort,
    username: dbUser,
    password: dbPass
  });

  const umzug = new Umzug({
    migrations: {
      glob: '.',
      resolve: ({ name, path, context }) => {
        const migration = require(path);
        return {
          name,
          up: async () => {
            return migration?.up(context, Sequelize);
          },
          down: async () => {
            return migration?.down(context, Sequelize);
          }
        };
      }
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console
  });
  await umzug.up();
};
