'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usdt_rates', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      rate: {
        type: Sequelize.DECIMAL(18, 4),
        allowNull: false,
      },
      source: {
        type: Sequelize.ENUM('binance', 'coingecko', 'manual'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('usdt_rates', ['status']);
    await queryInterface.addIndex('usdt_rates', ['created_at']);
    await queryInterface.addIndex('usdt_rates', ['source']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usdt_rates');
  }
};
