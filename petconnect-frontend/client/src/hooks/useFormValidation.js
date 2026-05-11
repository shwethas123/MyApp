// src/hooks/useFormValidation.js
export function validatePetForm(form, photos, docs, existingImages, existingDocs, isEdit = false) {
  const errors = {};

  // Photos — main photo required
  const hasMainPhoto = isEdit
    ? existingImages?.[0] !== null || photos?.[0] !== null
    : photos?.main !== null;
  if (!hasMainPhoto) errors.mainPhoto = "Main photo is required";

  // Basic Info
  if (!form.name?.trim()) errors.name = "Pet name is required";
  if (!form.species) errors.species = "Species is required";
  if (!form.breed?.trim()) errors.breed = "Breed is required";
  if (!form.age) errors.age = "Age is required";
  else if (Number(form.age) < 0) errors.age = "Age must be a positive number";
  if (!form.gender) errors.gender = "Gender is required";

  // Health
  if (!form.temperament?.trim()) errors.temperament = "Temperament is required";
  if (!form.adoption_fee && form.adoption_fee !== 0) errors.adoption_fee = "Adoption fee is required";
  else if (Number(form.adoption_fee) < 0) errors.adoption_fee = "Fee cannot be negative";

  if (form.vaccinated === "false" && !form.vaccination_notes?.trim())
    errors.vaccination_notes = "Please describe vaccination requirements";

  if ((form.sterilized === "neutered" || form.sterilized === "spayed")) {
    const hasCert = isEdit ? newSterilizationCert !== null || existingDocs?.sterilization !== null : docs?.sterilization !== null;
    if (!hasCert) errors.sterilization = "Sterilization certificate is required";
  }

  // Story & Docs
  if (!form.rescue_story?.trim()) errors.rescue_story = "Short description is required";

  const hasHealthDoc = isEdit
    ? existingDocs?.health !== null || docs?.health !== null
    : docs?.health !== null;
  if (!hasHealthDoc) errors.health_record = "Health record is required";

  return errors;
}