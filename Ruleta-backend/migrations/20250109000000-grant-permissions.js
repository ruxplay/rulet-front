// migrations/20250109000000-grant-permissions.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Aplicar permisos GRANT
    await queryInterface.sequelize.query(`
      GRANT ALL PRIVILEGES ON SCHEMA public TO ruleta_user;
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ruleta_user;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ruleta_user;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ruleta_user;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ruleta_user;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revocar permisos si es necesario
    await queryInterface.sequelize.query(`
      REVOKE ALL PRIVILEGES ON SCHEMA public FROM ruleta_user;
      REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM ruleta_user;
      REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM ruleta_user;
    `);
  }
};