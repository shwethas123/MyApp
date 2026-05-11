const generateCertificateHTML = (pet, adopter, application) => {
  const petImage = pet.images?.[0]?.file_url || null;
  const petSubtitle = [
    pet.breed,
    pet.age ? `${pet.age} Year${pet.age > 1 ? "s" : ""} Old` : null,
    pet.gender,
  ]
    .filter(Boolean)
    .join("  •  ");

  const adoptionDate = new Date(application.updatedAt).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "long", year: "numeric" },
  );

  const generatedOn = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Helvetica, Arial, sans-serif;
      background: #f5faff;
      width: 210mm;
      height: 297mm;
    }
    .page {
      width: 210mm;
      height: 297mm;
      padding: 7mm;
      background: #f5faff;
    }
    .card {
      width: 100%;
      height: 100%;
      border: 2.5px solid #2563eb;
      display: flex;
      flex-direction: column;
      background: white;
    }
    .card-inner {
      margin: 3px;
      border: 0.5px solid #93c5fd;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ── HEADER ── */
    .header {
      background: #2563eb;
      color: white;
      text-align: center;
      padding: 18px 0 16px;
      flex-shrink: 0;
    }
    .header h1 {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .header .sub {
      font-size: 14px;
      margin-top: 5px;
      font-weight: 500;
      letter-spacing: 0.3px;
    }
    .header .desc {
      font-size: 10px;
      color: #bad6fe;
      margin-top: 5px;
      letter-spacing: 0.2px;
    }

    /* ── CERT NO ── */
    .cert-no {
      text-align: center;
      color: #94a3b8;
      font-size: 9.5px;
      padding: 7px 0 5px;
      flex-shrink: 0;
    }

    /* ── PET SECTION ── */
    .pet-section {
      display: flex;
      align-items: center;
      gap: 18px;
      margin: 0 16px 10px;
      padding: 14px 16px;
      background: #f8fbff;
      border-radius: 8px;
      border: 1px solid #dbeafe;
      flex-shrink: 0;
    }
    .pet-image {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid #dbeafe;
      flex-shrink: 0;
    }
    .pet-image-placeholder {
      width: 100px;
      height: 100px;
      background: #eff6ff;
      border-radius: 8px;
      border: 2px solid #dbeafe;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      flex-shrink: 0;
    }
    .pet-details { flex: 1; }
    .pet-name {
      font-size: 28px;
      font-weight: bold;
      color: #0f172a;
      letter-spacing: 0.3px;
    }
    .pet-sub {
      font-size: 12px;
      color: #64748b;
      font-style: italic;
      margin-top: 5px;
    }
    .pet-badges {
      display: flex;
      gap: 7px;
      margin-top: 10px;
      flex-wrap: wrap;
    }
    .badge {
      font-size: 9.5px;
      font-weight: bold;
      padding: 3px 11px;
      border-radius: 20px;
      background: #eff6ff;
      color: #2563eb;
      border: 0.5px solid #bfdbfe;
    }

    /* ── DIVIDER ── */
    .divider {
      border: none;
      border-top: 1px solid #dbeafe;
      margin: 2px 18mm 10px;
      flex-shrink: 0;
    }

    /* ── SECTIONS ── */
    .sections {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 0 16px;
      flex: 1;
    }

    .section-title {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #2563eb;
      font-size: 11px;
      font-weight: bold;
      padding: 6px 12px;
      border-radius: 4px;
      margin-bottom: 5px;
      letter-spacing: 0.8px;
    }

    /* single column rows */
    .row {
      display: flex;
      align-items: flex-start;
      padding: 7px 10px;
      font-size: 11.5px;
      border-radius: 3px;
    }
    .row:nth-child(even) { background: #f8fbff; }
    .row .lbl {
      color: #6b7280;
      width: 35%;
      flex-shrink: 0;
      font-size: 11px;
    }
    .row .val {
      color: #111827;
      font-weight: bold;
      width: 65%;
      word-break: break-word;
      font-size: 11.5px;
    }

    /* ── CONGRATS ── */
    .congrats {
      margin: 12px 16px 12px;
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 6px;
      padding: 12px 14px;
      text-align: center;
      font-size: 13px;
      font-weight: bold;
      color: #15803d;
      flex-shrink: 0;
    }

    /* ── FOOTER ── */
    .footer {
      background: #2563eb;
      color: white;
      text-align: center;
      padding: 10px;
      flex-shrink: 0;
    }
    .footer .fmain {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.3px;
    }
    .footer .fsub {
      color: #bad6fe;
      font-size: 9px;
      margin-top: 3px;
    }
  </style>
</head>
<body>
<div class="page">
  <div class="card">
    <div class="card-inner">

      <!-- HEADER -->
      <div class="header">
        <h1>PetConnect</h1>
        <div class="sub">Official Pet Adoption Certificate</div>
        <div class="desc">This certificate confirms the successful completion of a pet adoption</div>
      </div>

      <!-- CERT NO -->
      <div class="cert-no">Certificate No: PC-${String(application.id).padStart(6, "0")}</div>

      <!-- PET -->
      <div class="pet-section">
        ${
          petImage
            ? `<img class="pet-image" src="${petImage}" />`
            : `<div class="pet-image-placeholder">🐾</div>`
        }
        <div class="pet-details">
          <div class="pet-name">${pet.name || "-"}</div>
          <div class="pet-sub">${petSubtitle}</div>
          <div class="pet-badges">
            ${
              pet.vaccinated
                ? `<span class="badge">✓ Vaccinated</span>`
                : `<span class="badge">✗ Not Vaccinated</span>`
            }
            ${
              pet.sterilized && pet.sterilized !== "not_sterilized"
                ? `<span class="badge">✓ ${pet.sterilized.charAt(0).toUpperCase() + pet.sterilized.slice(1)}</span>`
                : `<span class="badge">Not Sterilized</span>`
            }
            ${pet.species ? `<span class="badge">${pet.species}</span>` : ""}
          </div>
        </div>
      </div>

      <hr class="divider" />

      <!-- SECTIONS -->
      <div class="sections">

        <!-- ADOPTER -->
        <div>
          <div class="section-title">ADOPTER INFORMATION</div>
          <div class="row"><span class="lbl">Full Name</span><span class="val">${adopter.fullName}</span></div>
          <div class="row"><span class="lbl">Email</span><span class="val">${adopter.email}</span></div>
          <div class="row"><span class="lbl">Phone</span><span class="val">${adopter.phone}</span></div>
          <div class="row"><span class="lbl">Occupation</span><span class="val">${adopter.occupation}</span></div>
          <div class="row"><span class="lbl">Address</span><span class="val">${adopter.address}</span></div>
        </div>

        <!-- SHELTER -->
        <div>
          <div class="section-title">SHELTER INFORMATION</div>
          <div class="row"><span class="lbl">Shelter Name</span><span class="val">${application.shelterName}</span></div>
          <div class="row"><span class="lbl">Location</span><span class="val">${application.shelterLocation}</span></div>
          <div class="row"><span class="lbl">Contact Email</span><span class="val">${application.shelterEmail}</span></div>
        </div>

        <!-- ADOPTION DETAILS -->
        <div>
          <div class="section-title">ADOPTION DETAILS</div>
          <div class="row"><span class="lbl">Application ID</span><span class="val">#${application.id}</span></div>
          <div class="row"><span class="lbl">Submitted On</span><span class="val">${application.submittedOn}</span></div>
          <div class="row"><span class="lbl">Completed On</span><span class="val">${adoptionDate}</span></div>
          
        </div>

      </div>

      <!-- CONGRATS -->
      <div class="congrats">
        Congratulations! ${adopter.firstName} is now the proud owner of ${pet.name}!
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div class="fmain">PetConnect &nbsp;|&nbsp; Connecting Loving Owners with Their Perfect Companions &nbsp;|&nbsp; petconnect.com</div>
        <div class="fsub">Generated on ${generatedOn}</div>
      </div>

    </div>
  </div>
</div>
</body>
</html>`;
};

export default generateCertificateHTML;
