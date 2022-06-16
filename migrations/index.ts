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
        console.log({ name, path, context });
        const migration = require(path);
        console.log(migration);
        if (migration.up && migration.down) {
          console.log('inside');
          return {
            name,
            up: async () => {
              console.log('inside up');
              return migration.up(context, Sequelize);
            },
            down: async () => {
              console.log('inside down');
              return migration.down(context, Sequelize);
            }
          };
        }
      }
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console
  });
  await umzug.up();
};
