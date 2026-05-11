import cron from "node-cron";
import { Op } from "sequelize";
import db from "../../models/index.js";
import { createNotification } from "../controllers/notification.controller.js";
import { getIO } from "../socket.js";
import { sendStatusUpdateToApplicant } from "../../utils/mailer.js";

const { AdoptionApplication, Pet, User, Shelter } = db;

const EXPIRY_DAYS = 10;

/**
 * Core dissolution logic.
 * Exported so you can call it in tests or trigger it manually via an
 * admin endpoint without waiting for the scheduler.
 */
export const dissolveExpiredApplications = async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - EXPIRY_DAYS);

  const stale = await AdoptionApplication.findAll({
    where: {
      status: "pending",
      createdAt: { [Op.lte]: cutoff },
    },
    include: [
      {
        model: Pet,
        as: "pet",
        attributes: ["id", "name", "status"],
      },
      {
        model: Shelter,
        as: "shelter",
        attributes: ["id", "name", "owner_id"],
      },
    ],
  });

  if (stale.length === 0) {
    console.log(
      `[AdoptionExpiryCron] No stale applications found at ${new Date().toISOString()}`
    );
    return;
  }

  console.log(
    `[AdoptionExpiryCron] Dissolving ${stale.length} application(s)…`
  );

  for (const application of stale) {
    try {
      // 1. Mark application dissolved
      application.status = "dissolved";
      await application.save();
      // NOTE: "dissolved" must exist in the AdoptionApplications status ENUM.
      // Run the migration add-dissolved-status.js before deploying this cron.

      // 2. Release pet — only when still Reserved so we don't overwrite
      //    "Adopted" or "Available" set by other flows.
      if (application.pet && application.pet.status === "Reserved") {
        await Pet.update(
          { status: "Available" },
          { where: { id: application.petId } }
        );
      }

      // 3. In-app notification
      const petName = application.pet?.name || "your pet";
      const notifMsg = `⏰ Your adoption application for "${petName}" has been automatically cancelled because the shelter did not respond within ${EXPIRY_DAYS} days.`;

      try {
        await createNotification({
          user_id: application.userId,
          message: notifMsg,
          reference_type: "adoption",
          reference_id: application.id,
        });

        const io = getIO();
        io.to(`user_${application.userId}`).emit("new_notification", {
          message: notifMsg,
          reference_type: "adoption",
          reference_id: application.id,
          created_at: new Date(),
          is_read: false,
        });
    } catch (notifErr) {
        console.error(
          `[AdoptionExpiryCron] Notification failed for application ${application.id}:`,
          notifErr.message
        );
      }

      // 4. Notify all admins + flag shelter
      try {
        const adminRole = await db.Role.findOne({ where: { name: "admin" } });
        const admins = await User.findAll({
          where: { role_id: adminRole.id },
          attributes: ["id"],
        });
        const shelterName = application.shelter?.name || "Unknown shelter";
        const adminMsg = `⚠️ Shelter "${shelterName}" failed to review the adoption application #${application.id} for "${petName}" within ${EXPIRY_DAYS} days. Application auto-dissolved. Consider warning or banning this shelter.`;
        const io = getIO();
        for (const admin of admins) {
          await createNotification({
            user_id: admin.id,
            message: adminMsg,
            reference_type: "shelter",
            reference_id: application.shelterId,
          });
          io.to(`user_${admin.id}`).emit("new_notification", {
            message: adminMsg,
            reference_type: "shelter",
            reference_id: application.shelterId,
            created_at: new Date(),
            is_read: false,
          });
        }
      } catch (adminNotifErr) {
        console.error(
          `[AdoptionExpiryCron] Admin notification failed for application ${application.id}:`,
          adminNotifErr.message
        );
      }

      // 5. Courtesy email (non-blocking — failure must not abort the batch)

      // 4. Courtesy email (non-blocking — failure must not abort the batch)
      try {
        await sendStatusUpdateToApplicant({
          applicantEmail: application.email,
          applicantFirstName: application.first_name,
          petName,
          shelterName: null,
          status: "dissolved",
          applicationId: application.id,
        });
      } catch (mailErr) {
        console.error(
          `[AdoptionExpiryCron] Email failed for application ${application.id}:`,
          mailErr.message
        );
      }

      console.log(
        `[AdoptionExpiryCron] Dissolved application #${application.id} (pet: "${petName}")`
      );
    } catch (err) {
      // Per-application error — log and continue so one bad row doesn't
      // prevent the rest of the batch from being processed.
      console.error(
        `[AdoptionExpiryCron] Failed to dissolve application #${application.id}:`,
        err.message
      );
    }
  }
};

/**
 * Registers the cron schedule and starts it.
 * Default: every day at 02:00 AM server time.
 * Override with env var CRON_ADOPTION_EXPIRY (standard cron syntax).
 */
export const startAdoptionExpiryCron = () => {
  const schedule = process.env.CRON_ADOPTION_EXPIRY || "0 2 * * *";

  cron.schedule(schedule, async () => {
    console.log(
      `[AdoptionExpiryCron] Running at ${new Date().toISOString()} (schedule: "${schedule}")`
    );
    try {
      await dissolveExpiredApplications();
    } catch (err) {
      console.error("[AdoptionExpiryCron] Unhandled error:", err);
    }
  });

  console.log(
    `[AdoptionExpiryCron] Scheduled → "${schedule}" (dissolves pending apps after ${EXPIRY_DAYS} days)`
  );
};