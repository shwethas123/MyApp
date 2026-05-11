import db from "../../models/index.js";

const { Wishlist, Pet, PetImage, Shelter } = db;

// POST /api/wishlist/toggle/:petId
// WHY toggle pattern: one endpoint handles both add and remove.
// Frontend doesn't need to track state before calling — just call and read response.
export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const petId = parseInt(req.params.petId);

    const existing = await Wishlist.findOne({
      where: { user_id: userId, pet_id: petId },
    });

    if (existing) {
      await existing.destroy();
      return res.status(200).json({
        success: true,
        wishlisted: false,
        message: "Removed from wishlist",
      });
    }

    await Wishlist.create({ user_id: userId, pet_id: petId });
    return res.status(201).json({
      success: true,
      wishlisted: true,
      message: "Added to wishlist",
    });
  } catch (err) {
    console.error("toggleWishlist error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/wishlist/status/:petId
// WHY separate: PetDetailPage needs to know on load whether heart is filled or empty.
export const getWishlistStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const petId = parseInt(req.params.petId);

    const existing = await Wishlist.findOne({
      where: { user_id: userId, pet_id: petId },
    });

    return res.status(200).json({
      success: true,
      wishlisted: !!existing,
    });
  } catch (err) {
    console.error("getWishlistStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMyWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlists = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Pet,
          as: "pet",
          include: [
            {
              model: PetImage,
              as: "images",
              attributes: ["id", "file_url", "public_id", "display_order"],
            },
            {
              model: Shelter,
              as: "shelter",
              attributes: ["id", "name", "city", "state"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: wishlists,
    });
  } catch (err) {
    console.error("getMyWishlist error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};