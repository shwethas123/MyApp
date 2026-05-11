"use strict";

export default {
  async up(queryInterface, Sequelize) {
    // Every image fetch is WHERE pet_id = ? ORDER BY display_order ASC
    await queryInterface.addIndex("pet_images", ["pet_id", "display_order"], {
      name: "idx_pet_images_pet_id_order",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "pet_images",
      "idx_pet_images_pet_id_order"
    );
  },
};