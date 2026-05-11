"use strict";

/**
 * Migration: add 'dissolved' to AdoptionApplications.status ENUM
 *
 * WHY a migration and not just sync():
 * PostgreSQL won't let you alter an ENUM inline. You must use
 * ALTER TYPE ... ADD VALUE, which is what this migration does.
 * This is safe to run on a live DB — ADD VALUE never locks the table.
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    // Check first — ADD VALUE fails if the value already exists
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_enum
          WHERE enumlabel = 'dissolved'
            AND enumtypid = (
              SELECT oid FROM pg_type
              WHERE typname = 'enum_AdoptionApplications_status'
            )
        ) THEN
          ALTER TYPE "enum_AdoptionApplications_status" ADD VALUE 'dissolved';
        END IF;
      END
      $$;
    `);
  },

  async down() {
    // PostgreSQL does NOT support removing an ENUM value.
    // To truly revert, you'd need to recreate the type — not done here
    // because it's destructive. In practice, "dissolved" data would need
    // to be migrated away first.
    console.warn(
      "[Migration] Cannot remove ENUM value in PostgreSQL. Rollback is a no-op."
    );
  },
};