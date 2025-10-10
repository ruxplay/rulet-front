'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('deposits', 'payment_method', {
      type: Sequelize.ENUM('bank_transfer', 'usdt'),
      allowNull: false,
      defaultValue: 'bank_transfer',
    });

    await queryInterface.addColumn('deposits', 'usdt_amount', {
      type: Sequelize.DECIMAL(18, 8),
      allowNull: true,
    });

    await queryInterface.addColumn('deposits', 'exchange_rate', {
      type: Sequelize.DECIMAL(18, 4),
      allowNull: true,
    });

    await queryInterface.addColumn('deposits', 'wallet_address', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.addColumn('deposits', 'transaction_hash', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('deposits', 'payment_method');
    await queryInterface.removeColumn('deposits', 'usdt_amount');
    await queryInterface.removeColumn('deposits', 'exchange_rate');
    await queryInterface.removeColumn('deposits', 'wallet_address');
    await queryInterface.removeColumn('deposits', 'transaction_hash');
  }
};
