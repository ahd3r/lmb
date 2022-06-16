'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Admin', [
      {
        email: 'example@example.com',
        password: '$2a$10$EQC2oGv06oNd8mIORMQXr.mSG63TWnui1eZexbpeefs5ncxVIRC02', // adminadmin
        createdAt: new Date()
      }
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Admin', {});
  }
};
