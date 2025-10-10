'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('deposits', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      full_name: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      reference: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      bank: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      receipt_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      receipt_public_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      receipt_format: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      receipt_bytes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      processed_by: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex('deposits', ['username']);
    await queryInterface.addIndex('deposits', ['status']);
    await queryInterface.addIndex('deposits', ['created_at']);
    // Opcional: índice único por (username, reference)
    // await queryInterface.addConstraint('deposits', {
    //   fields: ['username', 'reference'],
    //   type: 'unique',
    //   name: 'unique_deposit_reference_per_user'
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('deposits');
  }
};


