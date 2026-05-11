"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {

    // 1. shelter_id — used in getAllPets, getAnalytics, and every shelter dashboard query
    await queryInterface.addIndex("pets", ["shelter_id"], {
      name: "idx_pets_shelter_id",
    });

    // 2. deleted_at — every single query checks WHERE deleted_at IS NULL
    await queryInterface.addIndex("pets", ["deleted_at"], {
      name: "idx_pets_deleted_at",
    });

    // 3. status — browsePets filters by status: "Available"
    await queryInterface.addIndex("pets", ["status"], {
      name: "idx_pets_status",
    });

    // 4. listed_at — every browse request sorts by this column
    await queryInterface.addIndex("pets", ["listed_at"], {
      name: "idx_pets_listed_at",
    });

    // 5. species — very common filter on browse page
    await queryInterface.addIndex("pets", ["species"], {
      name: "idx_pets_species",
    });

    // 6. gender — used as a filter
    await queryInterface.addIndex("pets", ["gender"], {
      name: "idx_pets_gender",
    });

    // 7. age — used for age_min / age_max range filter
    await queryInterface.addIndex("pets", ["age"], {
      name: "idx_pets_age",
    });

    // 8. Composite index — the most important one.
    //    This covers the most common browse query pattern:
    //    WHERE status = 'Available' AND deleted_at IS NULL ORDER BY listed_at DESC
    //    PostgreSQL can use this single index for filtering AND sorting together.
    await queryInterface.addIndex(
      "pets",
      ["status", "deleted_at", "listed_at"],
      { name: "idx_pets_browse_composite" }
    );

    // 9. shelter_id + deleted_at composite — covers getAllPets and getAnalytics
    //    WHERE shelter_id = ? AND deleted_at IS NULL
    await queryInterface.addIndex(
      "pets",
      ["shelter_id", "deleted_at"],
      { name: "idx_pets_shelter_active" }
    );
  },

  async down(queryInterface, Sequelize) {
    // Removes all indexes if you ever roll back — this is what makes it safe
    await queryInterface.removeIndex("pets", "idx_pets_shelter_id");
    await queryInterface.removeIndex("pets", "idx_pets_deleted_at");
    await queryInterface.removeIndex("pets", "idx_pets_status");
    await queryInterface.removeIndex("pets", "idx_pets_listed_at");
    await queryInterface.removeIndex("pets", "idx_pets_species");
    await queryInterface.removeIndex("pets", "idx_pets_gender");
    await queryInterface.removeIndex("pets", "idx_pets_age");
    await queryInterface.removeIndex("pets", "idx_pets_browse_composite");
    await queryInterface.removeIndex("pets", "idx_pets_shelter_active");
  },
};