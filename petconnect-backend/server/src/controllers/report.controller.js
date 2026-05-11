import db from '../../models/index.js';
import { sendReportNotificationEmail } from '../../utils/mailer.js';
import { createNotification } from "./notification.controller.js";
import { getIO } from "../socket.js";
const { Report, User } = db;

export const createReport = async (req, res) => {
  try {
    const reporter_id = req.user.id;
    const { conversation_id, reported_user_id, reason, details } = req.body;

    if (!conversation_id || !reported_user_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'conversation_id, reported_user_id and reason are required',
      });
    }

    const report = await Report.create({
      conversation_id,
      reporter_id,
      reported_user_id,
      reason,
      details: details || null,
    });
    // Fetch reporter and reported user for emails
    const reporter = await User.findByPk(reporter_id, { attributes: ['first_name', 'last_name'] });
    const reportedUser = await User.findByPk(reported_user_id, { attributes: ['first_name', 'last_name', 'email'] });

    if (reporter && reportedUser) {
      await sendReportNotificationEmail({
        reportedUserEmail: reportedUser.email,
        reportedUserName: `${reportedUser.first_name} ${reportedUser.last_name}`,
        reporterName: `${reporter.first_name} ${reporter.last_name}`,
        reason,
        details,
        reportId: report.id,
      }).catch((err) => console.error('Report email error:', err));
    }

    // Notify all admins about new report
    try {
      const admins = await User.findAll({
        include: [{ model: db.Role, as: "roleDetails", where: { name: "admin" } }],
        attributes: ["id"],
      });
      const io = getIO();
      const adminMsg = `🚨 New abuse report submitted by ${reporter?.first_name} ${reporter?.last_name} (Report #${report.id}).`;

      for (const admin of admins) {
        await createNotification({
          user_id: admin.id,
          message: adminMsg,
          reference_type: "report",
          reference_id: report.id,
        });
        io.to(`user_${admin.id}`).emit("new_notification", {
          message: adminMsg,
          reference_type: "report",
          reference_id: report.id,
          created_at: new Date(),
          is_read: false,
        });
      }
    } catch (err) {
      console.error("Admin report notification failed:", err.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report,
    });
  } catch (err) {
    console.error('Create report error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};