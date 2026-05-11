import db from "../../models/index.js";
const { Notification } = db;

/*
  GET /api/notifications
  Returns all notifications for the logged-in user
  Most recent first, limit 20
*/
export const getMyNotifications = async (req, res) => {
  try {
    // ✅ ADD THESE 3 LINES
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // ✅ CHANGE findAll → findAndCountAll, ADD limit + offset
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { user_id: req.user.id },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const unreadCount = await Notification.count({
      where: { user_id: req.user.id, is_read: false },
    });

    // ✅ ADD hasMore to response
    res.json({
      data: notifications,
      unreadCount,
      hasMore: offset + notifications.length < count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
/*
  PATCH /api/notifications/:id/read
  Mark a single notification as read when user clicks it
*/
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.update({ is_read: true });

    res.json({ message: "Marked as read", data: notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*
  PATCH /api/notifications/read-all
  Mark all notifications as read — called when user opens the bell dropdown
*/


/*
  Helper function — called internally by other controllers
  to create a notification when an event happens.
  Not an API route — used inside shelter, adoption, message controllers
*/
export const createNotification = async ({
  user_id,
  message,
  reference_type,
  reference_id,
}) => {
  try {
     // Keep only latest 100 notifications per user
    const allUserNotifs = await Notification.findAll({
      where: { user_id },
      order: [["created_at", "DESC"]],
      attributes: ["id"],
    });
    if (allUserNotifs.length > 100) {
      const idsToDelete = allUserNotifs.slice(100).map((n) => n.id);
      await Notification.destroy({ where: { id: idsToDelete } });
    }
    const notification = await Notification.create({
      user_id,
      message,
      reference_type,
      reference_id,
    });
    return notification;
  } catch (err) {
    console.error("Failed to create notification:", err);
    return null;
  }
   
};