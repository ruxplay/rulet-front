// migrations/20250109000001-create-withdrawals.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('withdrawals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      cedula: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      banco: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      processedBy: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Agregar índice para búsquedas por username
    await queryInterface.addIndex('withdrawals', ['username']);
    
    // Agregar índice para búsquedas por status
    await queryInterface.addIndex('withdrawals', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('withdrawals');
  }
};