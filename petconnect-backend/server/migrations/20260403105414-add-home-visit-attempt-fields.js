"use strict";

export default {
  async up(queryInterface, Sequelize) {
    // ── AdoptionApplications ─────────────────────────────────────────────
    await queryInterface.addColumn('AdoptionApplications', 'home_visit_attempt', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });

    await queryInterface.addColumn('AdoptionApplications', 'home_visit_status', {
      type: Sequelize.ENUM('pending', 'passed', 'failed'),
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('AdoptionApplications', 'home_visit_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('AdoptionApplications', 'home_visit_warning_sent', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    // ── users ────────────────────────────────────────────────────────────
    await queryInterface.addColumn('users', 'home_visit_warning_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('AdoptionApplications', 'home_visit_attempt');
    await queryInterface.removeColumn('AdoptionApplications', 'home_visit_status');
    await queryInterface.removeColumn('AdoptionApplications', 'home_visit_notes');
    await queryInterface.removeColumn('AdoptionApplications', 'home_visit_warning_sent');
    await queryInterface.removeColumn('users', 'home_visit_warning_count');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_AdoptionApplications_home_visit_status";'
    );
  },
};