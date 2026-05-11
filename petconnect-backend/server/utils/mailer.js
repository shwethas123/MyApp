import nodemailer from "nodemailer";

let transporter = null;

const createTransporter = async () => {
  if (transporter) return transporter;

  const useGmail = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (useGmail) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  return transporter;
};

export const sendOtpEmail = async (email, otp) => {
  try {
    const transport = await createTransporter();

    const info = await transport.sendMail({
      from: `"PetConnect" <${process.env.EMAIL_USER || "no-reply@petconnect.com"}>`,
      to: email,
      subject: "Your OTP Code - PetConnect",
      text: `Your PetConnect OTP is: ${otp}. Valid for 1 minute. Do not share it.`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #06b6d4;">🐾 PetConnect</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing: 8px; color: #06b6d4;">${otp}</h1>
          <p>Valid for <strong>1 minute</strong>. Do not share it with anyone.</p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("Preview URL:", previewUrl);
    } else {
      console.log("OTP email sent to:", email);
    }

    return previewUrl || false;
  } catch (error) {
    console.error("sendOtpEmail failed:", error.message);
    throw new Error("Failed to send OTP email. Please try again.");
  }
};

//ResetLink for Forgot password
export const sendResetEmail = async (toEmail, resetLink) => {
  const transport = await createTransporter();
  const mailOptions = {
    from: `"PetConnect" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset Your PetConnect Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 12px; border: 1px solid #E5E7EB;">
        <div style="text-align: center; margin-bottom: 24px;">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-blue-600">
            <ellipse cx="7" cy="6" rx="1.2" ry="1.6" />
            <ellipse cx="4.5" cy="7.5" rx="1" ry="1.4" />
            <ellipse cx="9.5" cy="7.5" rx="1" ry="1.4" />
            <path d="M7 10 C4 10 3 13 4.5 14.5 C5.5 15.5 8.5 15.5 9.5 14.5 C11 13 10 10 7 10Z" />
            <ellipse cx="17" cy="4" rx="1.2" ry="1.6" />
            <ellipse cx="14.5" cy="5.5" rx="1" ry="1.4" />
            <ellipse cx="19.5" cy="5.5" rx="1" ry="1.4" />
            <path d="M17 8 C14 8 13 11 14.5 12.5 C15.5 13.5 18.5 13.5 19.5 12.5 C21 11 20 8 17 8Z" />
          </svg>
        </div>
        <h3 style="color: #111827;">Reset Your Password</h3>
        <p style="color: #6B7280;">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}"
            style="background-color: #3B82F6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="color: #9CA3AF; font-size: 13px;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
        <hr style="border-color: #E5E7EB; margin: 24px 0;" />
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">© 2026 PetConnect Adoption Services. All rights reserved.</p>
      </div>
    `,
  };

  await transport.sendMail(mailOptions);
};

export const sendAdoptionRequestToShelter = async ({
  shelterEmail,
  shelterName,
  applicantFirstName,
  applicantLastName,
  applicantEmail,
  applicantPhone,
  petName,
  petSpecies,
  petBreed,
  currentOccupation,
  address,
  livingArrangement,
  familyAgreement,
  landlordAllowsPets,
  petCareWhenAway,
  petExperienceYears,
  applicationId,
}) => {
  const transport = await createTransporter();

  const info = await transport.sendMail({
    from: `"PetConnect" <${process.env.EMAIL_USER || "no-reply@petconnect.com"}>`,
    to: shelterEmail,
    subject: `🐾 New Adoption Application for ${petName} — ${applicantFirstName} ${applicantLastName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Adoption Application</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">

          <!-- Header -->
          <tr>
            <td style="background-color:#4A90D9;padding:24px;text-align:center;">
              <p style="margin:0;font-size:28px;">🐾</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:bold;">
                New Adoption Application
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px;">

              <p style="margin:0 0 8px;font-size:15px;color:#111827;">
                Hello <strong>${shelterName}</strong>,
              </p>
              <p style="margin:0 0 20px;font-size:14px;color:#4B5563;">
                You have received a new adoption application for
                <strong>${petName}</strong> (${petSpecies} — ${petBreed}).
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 20px;" />

              <!-- Applicant Details -->
<h2 style="margin:0 0 12px;font-size:15px;color:#4A90D9;">👤 Applicant Details</h2>
<table width="100%" cellpadding="0" cellspacing="0"
  style="border-collapse:collapse;font-size:13px;border-radius:8px;overflow:hidden;border:1px solid #f0f0f0;">
  <tr style="background-color:#f9fafb;">
    <td style="padding:10px 12px;font-weight:bold;color:#374151;width:45%;">Full Name</td>
    <td style="padding:10px 12px;color:#111827;">${applicantFirstName} ${applicantLastName}</td>
  </tr>
  <tr style="background-color:#ffffff;">
    <td style="padding:10px 12px;font-weight:bold;color:#374151;">Email</td>
    <td style="padding:10px 12px;color:#111827;">
      <a href="mailto:${applicantEmail}" style="color:#4A90D9;text-decoration:none;">${applicantEmail}</a>
    </td>
  </tr>
  <tr style="background-color:#f9fafb;">
    <td style="padding:10px 12px;font-weight:bold;color:#374151;">Phone</td>
    <td style="padding:10px 12px;color:#111827;">${applicantPhone}</td>
  </tr>
  <tr style="background-color:#ffffff;">
    <td style="padding:10px 12px;font-weight:bold;color:#374151;">Pet Experience</td>
    <td style="padding:10px 12px;color:#111827;">${petExperienceYears} year(s)</td>
  </tr>
  <tr style="background-color:#f9fafb;">
    <td style="padding:10px 12px;font-weight:bold;color:#374151;">Occupation</td>
    <td style="padding:10px 12px;color:#111827;">${currentOccupation}</td>
  </tr>
  <tr style="background-color:#ffffff;">
    <td style="padding:10px 12px;font-weight:bold;color:#374151;">Address</td>
    <td style="padding:10px 12px;color:#111827;">${address}</td>
  </tr>
</table>

<!-- Divider -->
<hr style="border:none;border-top:1px solid #f0f0f0;margin:20px 0;" />

<!-- Lifestyle Details -->
<h2 style="margin:0 0 12px;font-size:15px;color:#4A90D9;">🏠 Lifestyle Details</h2>
<table width="100%" cellpadding="0" cellspacing="0"
  style="border-collapse:collapse;font-size:13px;border-radius:8px;overflow:hidden;border:1px solid #f0f0f0;">
  <tr style="background-color:#f9fafb;">
    <td style="padding:10px 12px;font-weight:bold;color:#374151;width:45%;">Living Arrangement</td>
    <td style="padding:10px 12px;color:#111827;">${livingArrangement}</td>
  </tr>
  <tr style="background-color:#ffffff;">
    <td style="padding:10px 12px;font-weight:bold;color:#374151;">Family Agreement</td>
    <td style="padding:10px 12px;color:#111827;">${familyAgreement}</td>
  </tr>
  <tr style="background-color:#f9fafb;">
    <td style="padding:10px 12px;font-weight:bold;color:#374151;">Landlord Allows Pets</td>
    <td style="padding:10px 12px;color:#111827;">${landlordAllowsPets}</td>
  </tr>
  <tr style="background-color:#ffffff;">
    <td style="padding:10px 12px;font-weight:bold;color:#374151;">Pet Care When Away</td>
    <td style="padding:10px 12px;color:#111827;">${petCareWhenAway}</td>
  </tr>
</table>
              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:20px 0;" />

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 16px;">
                    <a href="${process.env.CLIENT_URL}/shelter/adoptions/${applicationId}"
                      style="display:inline-block;background-color:#4A90D9;color:#ffffff;
                        padding:12px 32px;border-radius:8px;text-decoration:none;
                        font-size:14px;font-weight:bold;">
                      View Application
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;">
                Application ID: #${applicationId}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:16px;text-align:center;
              border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                © 2026 PetConnect Adoption Services. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- End Card -->

      </td>
    </tr>
  </table>

</body>
</html>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log("Shelter email preview:", previewUrl);
};
// Send confirmation email to applicant
export const sendAdoptionConfirmationToApplicant = async ({
  applicantEmail,
  applicantFirstName,
  petName,
  shelterName,
  applicationId,
}) => {
  const transport = await createTransporter();

  const info = await transport.sendMail({
    from: `"PetConnect" <${process.env.EMAIL_USER || "no-reply@petconnect.com"}>`,
    to: applicantEmail,
    subject: `✅ Your Adoption Application for ${petName} has been received!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background-color: #4A90D9; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🐾 Application Received!</h1>
        </div>
        <div style="padding: 24px;">
          <p>Hi <strong>${applicantFirstName}</strong>,</p>
          <p>Your adoption application for <strong>${petName}</strong> has been successfully submitted to <strong>${shelterName}</strong>.</p>
          <p>The shelter will review your application and get back to you soon.</p>
 
          <div style="background-color: #f0f7ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Application ID:</strong> #${applicationId}</p>
            <p style="margin: 8px 0 0;"><strong>Status:</strong> Pending Review</p>
          </div>
 
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.CLIENT_URL}/my-applications/${applicationId}"
              style="background-color: #4A90D9; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">
              View My Applications
            </a>
          </div>
          <p style="color: #888; font-size: 12px; text-align: center;">This is an automated email from PetConnect.</p>
        </div>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log("Applicant email preview:", previewUrl);
};

export const sendStatusUpdateToApplicant = async ({
  applicantEmail,
  applicantFirstName,
  petName,
  shelterName,
  status,
  applicationId,
  homeVisitDate,   // ← new param: Date object, only set when status === "home_visit"
  homeVisitTimeSlot
}) => {
 
  // Format the tentative visit date into a readable string when provided
  const formattedVisitDate = homeVisitDate
    ? new Date(homeVisitDate).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
 
  // const formattedVisitTime = homeVisitDate
  // ? new Date(homeVisitDate).toLocaleTimeString("en-IN", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: true,
  //   })
  // : null;
  const formattedVisitTime = homeVisitTimeSlot || null;
 
  const statusConfig = {
    approved: {
      subject: `✅ Your adoption application for ${petName} has been approved!`,
      heading: "🎉 Application Approved!",
      message: `Great news! Your adoption application for <strong>${petName}</strong> has been approved by <strong>${shelterName}</strong>.`,
      statusLabel: "Approved",
      color: "#22c55e",
      extraHtml: formattedVisitDate
        ? `
        <div style="background-color:#faf5ff;border:1px solid #D8B4FE;border-radius:8px;
          padding:20px;margin:20px 0;">
          <p style="margin:0 0 12px;font-size:14px;font-weight:bold;color:#6d28d9;
            text-align:center;">Home Visit Schedule</p>
          <table width="100%" cellpadding="0" cellspacing="0"
            style="border-collapse:collapse;font-size:13px;border-radius:6px;
              overflow:hidden;border:1px solid #EDE9FE;">
            <tr style="background-color:#f5f3ff;">
              <td style="padding:10px 14px;font-weight:bold;color:#5b21b6;width:35%;">
                Date
              </td>
              <td style="padding:10px 14px;color:#1e1b4b;font-weight:600;">
                ${formattedVisitDate}
              </td>
            </tr>
            <tr style="background-color:#ffffff;">
              <td style="padding:10px 14px;font-weight:bold;color:#5b21b6;">
                Time
              </td>
              <td style="padding:10px 14px;color:#1e1b4b;font-weight:600;">
                ${formattedVisitTime}
              </td>
            </tr>
          </table>
        </div>`
        : "",
    },
 
    home_visit: {
      subject: `🏠 Home visit scheduled for your ${petName} application`,
      heading: "🏠 Home Visit Scheduled!",
      message: `The shelter <strong>${shelterName}</strong> would like to schedule a home visit for your <strong>${petName}</strong> application.`,
      statusLabel: "Home Visit",
      color: "#8b5cf6",
      extraHtml: formattedVisitDate
        ? `
        <div style="background-color:#faf5ff;border:1px solid #d8b4fe;border-radius:8px;
          padding:20px;margin:20px 0;">
          <p style="margin:0 0 12px;font-size:14px;font-weight:bold;color:#6d28d9;
            text-align:center;">📅 Home Visit Schedule</p>
          <table width="100%" cellpadding="0" cellspacing="0"
            style="border-collapse:collapse;font-size:13px;border-radius:6px;
              overflow:hidden;border:1px solid #ede9fe;">
            <tr style="background-color:#f5f3ff;">
              <td style="padding:10px 14px;font-weight:bold;color:#5b21b6;width:35%;">
                Date
              </td>
              <td style="padding:10px 14px;color:#1e1b4b;font-weight:600;">
                ${formattedVisitDate}
              </td>
            </tr>
            <tr style="background-color:#ffffff;">
              <td style="padding:10px 14px;font-weight:bold;color:#5b21b6;">
                Time
              </td>
              <td style="padding:10px 14px;color:#1e1b4b;font-weight:600;">
                ${formattedVisitTime}
              </td>
            </tr>
          </table>
        </div>`
        : "",
    },
 
    completed: {
      subject: `🎊 Adoption complete — Welcome to your new family member, ${petName}!`,
      heading: "🎊 Adoption Complete!",
      message: `Congratulations! Your adoption of <strong>${petName}</strong> from <strong>${shelterName}</strong> is now complete. Welcome to your new family member!`,
      statusLabel: "Completed",
      color: "#4A90D9",
      extraHtml: `
        <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
          padding:20px;margin:20px 0;text-align:center;">
          <p style="margin:0 0 6px;font-size:28px;">📜</p>
          <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#15803d;">
            Your Adoption Certificate is Ready!
          </p>
          <p style="margin:0 0 16px;font-size:13px;color:#166534;">
            Visit your application page to download your official PetConnect
            Adoption Certificate for <strong>${petName}</strong>.
          </p>
        </div>
      `,
    },
 
    rejected: {
      subject: `Update on your adoption application for ${petName}`,
      heading: "Application Update",
      message: `We regret to inform you that your adoption application for <strong>${petName}</strong> was not approved by <strong>${shelterName}</strong> at this time.`,
      statusLabel: "Not Approved",
      color: "#ef4444",
      extraHtml: "",
    },
    dissolved: {
      subject: `Your adoption application for ${petName} has been cancelled`,
      heading: "⏰ Application Cancelled",
      message: `Your adoption application for <strong>${petName}</strong> has been automatically cancelled because the shelter did not respond within 10 days.`,
      statusLabel: "Cancelled",
      color: "#6b7280",
      extraHtml: `
        <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;
          padding:16px;margin:20px 0;text-align:center;">
          <p style="margin:0 0 6px;font-size:14px;color:#374151;">
            Don't give up! There are many pets waiting for a loving home.
          </p>
          <a href="${process.env.CLIENT_URL}/browse"
            style="display:inline-block;margin-top:10px;background-color:#6b7280;
              color:white;padding:10px 24px;border-radius:6px;text-decoration:none;
              font-size:14px;font-weight:bold;">
            Browse Other Pets
          </a>
        </div>
      `,
    },
  };
 
  const config = statusConfig[status];
  if (!config) return; // don't send for "pending" or unrecognised statuses
 
  const transport = await createTransporter();
 
  const info = await transport.sendMail({
    from: `"PetConnect" <${process.env.EMAIL_USER || "no-reply@petconnect.com"}>`,
    to: applicantEmail,
    subject: config.subject,
    html: `
      <!-- ${applicationId}-${status}-${Date.now()} -->
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;
        padding:20px;border:1px solid #e0e0e0;border-radius:8px;">
 
        <div style="background-color:${config.color};padding:20px;
          border-radius:8px 8px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;">${config.heading}</h1>
        </div>
 
        <div style="padding:24px;">
          <p>Hi <strong>${applicantFirstName}</strong>,</p>
          <p>${config.message}</p>
 
          <div style="background-color:#f0f7ff;padding:16px;border-radius:8px;margin:20px 0;">
            <p style="margin:0;"><strong>Application ID:</strong> #${applicationId}</p>
            <p style="margin:8px 0 0;"><strong>Status:</strong> ${config.statusLabel}</p>
          </div>
 
          ${config.extraHtml}
 
          <div style="text-align:center;margin:24px 0;">
            <a href="${process.env.CLIENT_URL}/my-applications/${applicationId}"
              style="background-color:#4A90D9;color:white;padding:12px 32px;
                border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;">
              View My Applications
            </a>
          </div>
 
          <p style="color:#888;font-size:12px;text-align:center;">
            This is an automated email from PetConnect.
          </p>
        </div>
      </div>
    `,
  });
 
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log("Status update email preview:", previewUrl);
};


// ── Shelter Approved Email ─────────────────────────────────────────────────
export const sendShelterApprovedEmail = async ({
  shelterEmail,
  shelterName,
  ownerName,
}) => {
  const transport = await createTransporter();

  const info = await transport.sendMail({
    from: `"PetConnect" <${process.env.EMAIL_USER || "no-reply@petconnect.com"}>`,
    to: shelterEmail,
    subject: `✅ Your shelter "${shelterName}" has been verified — Welcome to PetConnect!`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0"
    style="background-color:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:600px;background-color:#ffffff;border-radius:12px;
            overflow:hidden;border:1px solid #e0e0e0;">

          <!-- Header -->
          <tr>
            <td style="background-color:#22c55e;padding:24px;text-align:center;">
              <p style="margin:0;font-size:28px;">🎉</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:bold;">
                Shelter Verified!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px;">

              <p style="margin:0 0 8px;font-size:15px;color:#111827;">
                Hi <strong>${ownerName}</strong>,
              </p>
              <p style="margin:0 0 16px;font-size:14px;color:#4B5563;">
                Great news! Your shelter <strong>${shelterName}</strong> has been 
                reviewed and approved by our admin team.
              </p>
              <p style="margin:0 0 20px;font-size:14px;color:#4B5563;">
                You can now log in to your PetConnect account and access your 
                shelter dashboard to start listing pets for adoption.
              </p>

              <!-- Status Card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background-color:#f0fdf4;border:1px solid #bbf7d0;
                  border-radius:8px;margin-bottom:20px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0;font-size:13px;color:#15803d;">
                      <strong>Shelter Name:</strong> ${shelterName}
                    </p>
                    <p style="margin:8px 0 0;font-size:13px;color:#15803d;">
                      <strong>Status:</strong> Verified ✅
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:14px;color:#4B5563;">
                Welcome to the PetConnect family. Together we can help more 
                animals find loving homes. 🐾
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 16px;">
                    <a href="${process.env.CLIENT_URL}/shelter/waiting-area"
                      style="display:inline-block;background-color:#22c55e;
                        color:#ffffff;padding:12px 32px;border-radius:8px;
                        text-decoration:none;font-size:14px;font-weight:bold;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:16px;text-align:center;
              border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                © 2026 PetConnect Adoption Services. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("Shelter approved email preview:", previewUrl);
  } else {
    console.log("Shelter approved email sent to:", shelterEmail);
  }
};

// ── Shelter Rejected Email ─────────────────────────────────────────────────
export const sendShelterRejectedEmail = async ({
  shelterEmail,
  shelterName,
  ownerName,
  reason,
}) => {
  const transport = await createTransporter();

  const info = await transport.sendMail({
    from: `"PetConnect" <${process.env.EMAIL_USER || "no-reply@petconnect.com"}>`,
    to: shelterEmail,
    subject: `Update on your shelter registration — ${shelterName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0"
    style="background-color:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:600px;background-color:#ffffff;border-radius:12px;
            overflow:hidden;border:1px solid #e0e0e0;">

          <!-- Header -->
          <tr>
            <td style="background-color:#ef4444;padding:24px;text-align:center;">
              <p style="margin:0;font-size:28px;">❌</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:bold;">
                Registration Update
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px;">

              <p style="margin:0 0 8px;font-size:15px;color:#111827;">
                Hi <strong>${ownerName}</strong>,
              </p>
              <p style="margin:0 0 20px;font-size:14px;color:#4B5563;">
                Thank you for registering <strong>${shelterName}</strong> on 
                PetConnect. After carefully reviewing your application, our admin 
                team was unable to approve it at this time.
              </p>

              <!-- Rejection Reason Card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background-color:#fef2f2;border:1px solid #fecaca;
                  border-radius:8px;margin-bottom:20px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0;font-size:13px;color:#991b1b;font-weight:bold;">
                      Reason for Rejection:
                    </p>
                    <p style="margin:8px 0 0;font-size:13px;color:#b91c1c;">
                      ${reason}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px;font-size:14px;color:#4B5563;">
                Please review the reason above, make the necessary corrections, 
                and reapply through your PetConnect account.
              </p>
              <p style="margin:0 0 20px;font-size:14px;color:#4B5563;">
                If you believe this decision was made in error, please reach out 
                to our support team by replying to this email.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 16px;">
                    <a href="${process.env.CLIENT_URL}/shelter/waiting-area"
                      style="display:inline-block;background-color:#3B82F6;
                        color:#ffffff;padding:12px 32px;border-radius:8px;
                        text-decoration:none;font-size:14px;font-weight:bold;">
                      View Rejection Details & Reapply
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:16px;text-align:center;
              border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                © 2026 PetConnect Adoption Services. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("Shelter rejected email preview:", previewUrl);
  } else {
    console.log("Shelter rejected email sent to:", shelterEmail);
  }
};

// ── Report Submitted — notify admin + reported user ────────────────────────
export const sendReportNotificationEmail = async ({
  reportedUserEmail,
  reportedUserName,
  reporterName,
  reason,
  details,
  reportId,
}) => {
  const transport = await createTransporter();

  // Email to reported user
  await transport.sendMail({
    from: `"PetConnect" <${process.env.EMAIL_USER || "no-reply@petconnect.com"}>`,
    to: reportedUserEmail,
    subject: ` A report has been filed against your PetConnect account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background-color: #F59E0B; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">⚠️ Report Filed Against Your Account</h1>
        </div>
        <div style="padding: 24px;">
          <p>Hi <strong>${reportedUserName}</strong>,</p>
          <p>A report has been filed against your PetConnect account and is currently under review by our admin team.</p>
          <div style="background-color: #fffbeb; border: 1px solid #fcd34d; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Report ID:</strong> #${reportId}</p>
            <p style="margin: 8px 0 0;"><strong>Reason:</strong> ${reason}</p>
            ${details ? `<p style="margin: 8px 0 0;"><strong>Details:</strong> ${details}</p>` : ""}
          </div>
          <p>Our team will review this report and take appropriate action. If you believe this report is incorrect, please contact our support team.</p>
          <hr style="border-color: #E5E7EB; margin: 24px 0;" />
          <p style="color: #9CA3AF; font-size: 12px; text-align: center;">© 2026 PetConnect Adoption Services. All rights reserved.</p>
        </div>
      </div>
    `,
  });

  // Email to admin
  await transport.sendMail({
    from: `"PetConnect" <${process.env.EMAIL_USER || "no-reply@petconnect.com"}>`,
    to: process.env.EMAIL_USER,
    subject: ` New Report #${reportId} filed on PetConnect`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background-color: #EF4444; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🚨 New User Report</h1>
        </div>
        <div style="padding: 24px;">
          <p>A new report has been submitted on PetConnect.</p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Report ID:</strong> #${reportId}</p>
            <p style="margin: 8px 0 0;"><strong>Reported By:</strong> ${reporterName}</p>
            <p style="margin: 8px 0 0;"><strong>Reported User:</strong> ${reportedUserName}</p>
            <p style="margin: 8px 0 0;"><strong>Reason:</strong> ${reason}</p>
            ${details ? `<p style="margin: 8px 0 0;"><strong>Details:</strong> ${details}</p>` : ""}
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.CLIENT_URL}/admin/reports"
              style="background-color: #EF4444; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">
              Review Report
            </a>
          </div>
        </div>
      </div>
    `,
  });
};

// ── Warning Email to reported user from admin action ──────────────────────
export const sendWarningEmail = async ({
  userEmail,
  userName,
  reason,
  reportId,
}) => {
  const transport = await createTransporter();
  await transport.sendMail({
    from: `"PetConnect" <${process.env.EMAIL_USER || "no-reply@petconnect.com"}>`,
    to: userEmail,
    subject: ` Official Warning — PetConnect Account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background-color: #EF4444; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">⚠️ Official Warning</h1>
        </div>
        <div style="padding: 24px;">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>After reviewing a report filed against your account, our admin team has issued an official warning.</p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Report ID:</strong> #${reportId}</p>
            <p style="margin: 8px 0 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          <p>Please ensure your activity on PetConnect complies with our community guidelines. Repeated violations may result in a permanent ban.</p>
          <hr style="border-color: #E5E7EB; margin: 24px 0;" />
          <p style="color: #9CA3AF; font-size: 12px; text-align: center;">© 2026 PetConnect Adoption Services. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};
// ── Home Visit Warning Email to Adopter ───────────────────────────────────
export const sendHomeVisitWarningEmail = async ({
  applicantEmail,
  applicantFirstName,
  petName,
  attemptNumber,
  notes,
  applicationId,
}) => {
  const transport = await createTransporter();
  const isFinal = attemptNumber >= 2;

  const info = await transport.sendMail({
    from: `"PetConnect" <${process.env.EMAIL_USER || "no-reply@petconnect.com"}>`,
    to: applicantEmail,
    subject: isFinal
      ? ` Home Visit Failed — Your adoption of ${petName} is under admin review`
      : ` Home Visit Warning — You have one more chance for ${petName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:24px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
        <tr>
          <td style="background-color:${isFinal ? "#ef4444" : "#f59e0b"};padding:24px;text-align:center;">
            <p style="margin:0;font-size:28px;">${isFinal ? "❌" : "⚠️"}</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:bold;">
              ${isFinal ? "Home Visit Failed — Final Warning" : "Home Visit Failed — 1st Attempt"}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 8px;font-size:15px;color:#111827;">Hi <strong>${applicantFirstName}</strong>,</p>
            <p style="margin:0 0 16px;font-size:14px;color:#4B5563;">
              ${isFinal
                ? `Your home visit for <strong>${petName}</strong> has failed for the second time. Your case has been escalated to our admin team for review. <strong>Your account may be restricted or banned</strong> based on the review.`
                : `Your home visit for <strong>${petName}</strong> did not pass. You have been given <strong>one more chance</strong>. Please address the issues noted below and prepare better for your next visit.`
              }
            </p>
            ${notes ? `
            <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 4px;font-size:12px;font-weight:bold;color:#991b1b;text-transform:uppercase;">Shelter Feedback</p>
              <p style="margin:0;font-size:14px;color:#b91c1c;">${notes}</p>
            </div>` : ""}
            ${!isFinal ? `
            <div style="background-color:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0;font-size:13px;color:#92400e;">
                ⚠️ <strong>Please note:</strong> If your second home visit also fails, your adoption application will be cancelled and your account will be flagged for admin review, which may result in a ban.
              </p>
            </div>` : ""}
            <div style="text-align:center;margin:24px 0;">
              <a href="${process.env.CLIENT_URL}/my-applications/${applicationId}"
                style="background-color:#4A90D9;color:white;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;">
                View My Application
              </a>
            </div>
            <p style="color:#888;font-size:12px;text-align:center;">This is an automated email from PetConnect.</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;">© 2026 PetConnect Adoption Services. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log("Home visit warning email preview:", previewUrl);
};
// ── Home Visit Scheduled — notify shelter ─────────────────────────────────
export const sendHomeVisitNotificationToShelter = async ({
  shelterEmail,
  shelterName,
  applicantFirstName,
  applicantLastName,
  applicantEmail,
  applicantPhone,
  petName,
  homeVisitDate,
  homeVisitTimeSlot,
  applicationId,
}) => {
  const formattedVisitDate = homeVisitDate
    ? new Date(homeVisitDate).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // const formattedVisitTime = homeVisitDate
  //   ? new Date(homeVisitDate).toLocaleTimeString("en-IN", {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //       hour12: true,
  //     })
  //   : null;
  const formattedVisitTime = homeVisitTimeSlot || null;

  const transport = await createTransporter();

  const info = await transport.sendMail({
    from: `"PetConnect" <${process.env.EMAIL_USER || "no-reply@petconnect.com"}>`,
    to: shelterEmail,
    subject: ` Home Visit Scheduled — ${applicantFirstName} ${applicantLastName} for ${petName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:24px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E0E0E0;">

        <!-- Header -->
        <tr>
          <td style="background-color:#8b5cf6;padding:24px;text-align:center;">
            <p style="margin:0;font-size:28px;">🏠</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:bold;">Home Visit Scheduled</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 8px;font-size:15px;color:#111827;">Hello <strong>${shelterName}</strong>,</p>
            <p style="margin:0 0 20px;font-size:14px;color:#4B5563;">
              A home visit has been scheduled for the adoption of <strong>${petName}</strong>.
              Please find the applicant details and visit schedule below.
            </p>

            <hr style="border:none;border-top:1px solid #F0F0F0;margin:0 0 20px;"/>

            <!-- Applicant Details -->
            <h2 style="margin:0 0 12px;font-size:15px;color:#8b5cf6;">Applicant Details</h2>
            <table width="100%" cellpadding="0" cellspacing="0"
              style="border-collapse:collapse;font-size:13px;border-radius:8px;overflow:hidden;border:1px solid #F0F0F0;">
              <tr style="background-color:#f9fafb;">
                <td style="padding:10px 12px;font-weight:bold;color:#374151;width:40%;">Full Name</td>
                <td style="padding:10px 12px;color:#111827;">${applicantFirstName} ${applicantLastName}</td>
              </tr>
              <tr style="background-color:#ffffff;">
                <td style="padding:10px 12px;font-weight:bold;color:#374151;">Email</td>
                <td style="padding:10px 12px;color:#111827;">
                  <a href="mailto:${applicantEmail}" style="color:#8b5cf6;text-decoration:none;">${applicantEmail}</a>
                </td>
              </tr>
              <tr style="background-color:#f9fafb;">
                <td style="padding:10px 12px;font-weight:bold;color:#374151;">Phone</td>
                <td style="padding:10px 12px;color:#111827;">${applicantPhone}</td>
              </tr>
            </table>

            <hr style="border:none;border-top:1px solid #F0F0F0;margin:20px 0;"/>

            <!-- Visit Schedule -->
            <h2 style="margin:0 0 12px;font-size:15px;color:#8b5cf6;"> Visit Schedule</h2>
            <div style="background-color:#faf5ff;border:1px solid #D8B4FE;border-radius:8px;padding:20px;margin-bottom:20px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border-collapse:collapse;font-size:13px;border-radius:6px;overflow:hidden;border:1px solid #EDE9FE;">
                <tr style="background-color:#f5f3ff;">
                  <td style="padding:10px 14px;font-weight:bold;color:#5b21b6;width:35%;">Date</td>
                  <td style="padding:10px 14px;color:#1e1b4b;font-weight:600;">${formattedVisitDate || "To be confirmed"}</td>
                </tr>
                <tr style="background-color:#ffffff;">
                  <td style="padding:10px 14px;font-weight:bold;color:#5b21b6;">Time</td>
                  <td style="padding:10px 14px;color:#1e1b4b;font-weight:600;">${formattedVisitTime || "To be confirmed"}</td>
                </tr>
              </table>
            </div>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 16px;">
                  <a href="${process.env.CLIENT_URL}/shelter/adoptions/${applicationId}"
                    style="display:inline-block;background-color:#8b5cf6;color:#ffffff;
                      padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;">
                    View Application
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;">Application ID: #${applicationId}</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f9fafb;padding:16px;text-align:center;border-top:1px solid #E5E7EB;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;">© 2026 PetConnect Adoption Services. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log("Home visit shelter email preview:", previewUrl);
};