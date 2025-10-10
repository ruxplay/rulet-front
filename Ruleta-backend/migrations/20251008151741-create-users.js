'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      username: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(100), allowNull: false },
      full_name: { type: Sequelize.STRING(120), allowNull: false },
      phone: { type: Sequelize.STRING(30), allowNull: true },
      balance: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      wins: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      losses: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      role: { type: Sequelize.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },
      last_login: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    // Índices opcionales
    await queryInterface.addIndex('users', ['email'], { name: 'users_email_idx', unique: true });
    await queryInterface.addIndex('users', ['username'], { name: 'users_username_idx', unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'users_email_idx');
    await queryInterface.removeIndex('users', 'users_username_idx');
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  }
};