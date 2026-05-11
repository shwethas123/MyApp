import { useState, useEffect } from "react";
import ProfileView from "../components/ProfileView";
import ApiService from "../services/Apiservices";
import useAuth from "../hooks/AuthContext";

// ── Fields that must be non-empty for profile_completed = true ────────────
// Mirror the server-side REQUIRED_FOR_COMPLETION list exactly.
const REQUIRED_FOR_COMPLETION = [
  "first_name",
  "last_name",
  "phone",
  "location",
  "living_situation",
  "preferred_species",
  "pet_experience_years",
];

const computeProfileCompleted = (fields) =>
  REQUIRED_FOR_COMPLETION.every((key) => {
    const val = fields[key];
    return val !== null && val !== undefined && String(val).trim() !== "";
  });

const ProfileContainer = () => {
  const { currentUser, setUser } = useAuth();

  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [isEditing, setIsEditing]       = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [saveSuccess, setSaveSuccess]   = useState(false);
  const [error, setError]               = useState(null);
  const [fieldErrors, setFieldErrors]   = useState({});

  // photoFile — the File object chosen by the user (not yet uploaded)
  // photoPreview — local blob URL for immediate preview before save
  const [photoFile, setPhotoFile]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [aadharFile, setAadharFile]       = useState(null);
  const [aadharPreview, setAadharPreview] = useState(null);
  const [rentalFile, setRentalFile]       = useState(null);
  const [rentalPreview, setRentalPreview] = useState(null);

  const [form, setForm] = useState({
    first_name:           "",
    last_name:            "",
    phone:                "",
    location:             "",
    living_situation:     "",
    preferred_species:    "",
    pet_experience_years: "",
  });

  // ── Fetch profile from DB on mount ────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await ApiService.get("/users/profile");
        const user = res.data.data;

        const profileData = {
          id:                       user.id,
          first_name:               user.first_name           || "",
          last_name:                user.last_name            || "",
          email:                    user.email                || "",
          phone:                    user.phone ? String(user.phone) : "",
          role:                     user.role                 || "adopter",
          location:                 user.location             || "",
          living_situation:         user.living_situation     || "",
          preferred_species:        user.preferred_species    || "",
          pet_experience_years:     user.pet_experience_years ?? null,
          profile_completed:        user.profile_completed    || false,
          profile_photo:            user.profile_photo        || null,
          profile_photo_public_id:  user.profile_photo_public_id || null,
          aadhar_proof_url:     user.aadhar_proof_url     || null,
          rental_agreement_url: user.rental_agreement_url || null,
        };

        setProfile(profileData);
        setForm({
          first_name:           profileData.first_name,
          last_name:            profileData.last_name,
          phone:                profileData.phone,
          location:             profileData.location,
          living_situation:     profileData.living_situation,
          preferred_species:    profileData.preferred_species,
          pet_experience_years: profileData.pet_experience_years ?? "",
        });
      } catch (err) {
        console.error("Failed to fetch profile from DB:", err);
        setError("Failed to load profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ── Cleanup blob URL on unmount / change ──────────────────────────────────
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      if (aadharPreview) URL.revokeObjectURL(aadharPreview);
      if (rentalPreview) URL.revokeObjectURL(rentalPreview);
    };
  }, [photoPreview]);

  const isDirty =
  photoFile !== null ||
  aadharFile !== null ||
  rentalFile !== null ||
  (profile &&
    REQUIRED_FOR_COMPLETION.concat(["last_name"]).some(
      (key) => String(form[key] ?? "") !== String(profile[key] ?? "")
    ));

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const errors = {};

    if (!form.first_name || !form.first_name.trim()) {
      errors.first_name = "First name is required";
    } else if (!/^[A-Za-z\s]+$/.test(form.first_name.trim())) {
      errors.first_name = "First name can only contain letters and spaces";
    }

    if (form.last_name && form.last_name.trim() !== "") {
      if (!/^[A-Za-z\s]+$/.test(form.last_name.trim())) {
        errors.last_name = "Last name can only contain letters and spaces";
      }
    }

    if (form.phone && form.phone.trim() !== "") {
      const digitsOnly = form.phone.trim().replace(/\s+/g, "");
      if (!/^\d{10}$/.test(digitsOnly)) {
        errors.phone = "Phone number must be exactly 10 digits";
      }
    }

    if (form.pet_experience_years !== "" && form.pet_experience_years !== null) {
      const val = String(form.pet_experience_years).trim();
      if (!/^\d+$/.test(val)) {
        errors.pet_experience_years = "Pet experience must be a whole number";
      } else if (Number(val) > 50) {
        errors.pet_experience_years = "Please enter a realistic value (0–50)";
      }
    }
    if(form.living_situation && form.living_situation.trim() !== "") {
      const val=String(form.living_situation).trim();
      if(val.length > 50) {
        errors.living_situation = "Living situation must be under 50 characters";
      }
      else if(!/^[A-Za-z\s,.-]+$/.test(val)) {
        errors.living_situation = "Living situation can only contain letters, spaces, commas, periods, and hyphens";
      }
    }

    return errors;  
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEdit = () => {
    setSaveSuccess(false);
    setError(null);
    setFieldErrors({});
    setPhotoFile(null);
    setPhotoPreview(null);
    setAadharFile(null);  setAadharPreview(null);
    setRentalFile(null);  setRentalPreview(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Discard unsaved photo selection
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (aadharPreview) URL.revokeObjectURL(aadharPreview);
if (rentalPreview) URL.revokeObjectURL(rentalPreview);
setAadharFile(null);  setAadharPreview(null);
setRentalFile(null);  setRentalPreview(null);

    setForm({
      first_name:           profile?.first_name           || "",
      last_name:            profile?.last_name            || "",
      phone:                profile?.phone                || "",
      location:             profile?.location             || "",
      living_situation:     profile?.living_situation     || "",
      preferred_species:    profile?.preferred_species    || "",
      pet_experience_years: profile?.pet_experience_years ?? "",
    });
    setError(null);
    setFieldErrors({});
    setIsEditing(false);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Called by ProfileView when user picks a photo file
  const handlePhotoChange = (file) => {
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleAadharChange = (file) => {
  if (!file) return;
  if (aadharPreview) URL.revokeObjectURL(aadharPreview);
  setAadharFile(file);
  setAadharPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
};
const handleAadharClear = () => {
  if (aadharPreview) URL.revokeObjectURL(aadharPreview);
  setAadharFile(null); setAadharPreview(null);
};
const handleRentalChange = (file) => {
  if (!file) return;
  if (rentalPreview) URL.revokeObjectURL(rentalPreview);
  setRentalFile(file);
  setRentalPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
};
const handleRentalClear = () => {
  if (rentalPreview) URL.revokeObjectURL(rentalPreview);
  setRentalFile(null); setRentalPreview(null);
};

  const handleSave = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      // ── Build FormData so we can include the photo file ──────────────────
      const formData = new FormData();

      formData.append("first_name",       form.first_name        || "");
      formData.append("last_name",        form.last_name         || "");
      formData.append("phone",            form.phone             || "");
      formData.append("location",         form.location          || "");
      formData.append("living_situation", form.living_situation  || "");
      formData.append("preferred_species",form.preferred_species || "");
      formData.append(
        "pet_experience_years",
        form.pet_experience_years !== "" && form.pet_experience_years !== null
          ? String(form.pet_experience_years)
          : "",
      );

      if (photoFile) {
        formData.append("profile_photo", photoFile);
      }
      if (aadharFile) formData.append("aadhar_proof",     aadharFile);
      if (rentalFile) formData.append("rental_agreement",  rentalFile);

      // Axios will auto-set Content-Type: multipart/form-data with boundary
      const res = await ApiService.put(`/users/${profile.id}/profile`, formData);

      const updated = res.data.data;

      // ── Recompute profile_completed locally to match server logic ────────
      const newProfileCompleted = computeProfileCompleted({
        first_name:           updated.first_name,
        last_name:            updated.last_name,
        phone:                updated.phone,
        location:             updated.location,
        living_situation:     updated.living_situation,
        preferred_species:    updated.preferred_species,
        pet_experience_years: updated.pet_experience_years,
      });

      const newProfile = {
        ...profile,
        ...updated,
        profile_completed: newProfileCompleted,
        // Use the fresh Cloudinary URL if a new photo was uploaded,
        // else keep the server value (which already holds the existing URL).
        profile_photo: updated.profile_photo || profile.profile_photo,
        aadhar_proof_url:     updated.aadhar_proof_url     || profile.aadhar_proof_url,
        rental_agreement_url: updated.rental_agreement_url || profile.rental_agreement_url,
      };

      setProfile(newProfile);

      // ── Sync localStorage & AuthContext for navbar name display ──────────
      setUser({ ...currentUser, first_name: updated.first_name, last_name: updated.last_name });

      // Clear the temporary preview; the real URL is now in profile.profile_photo
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoFile(null);
      setPhotoPreview(null);
      if (aadharPreview) URL.revokeObjectURL(aadharPreview);
      if (rentalPreview) URL.revokeObjectURL(rentalPreview);
      setAadharFile(null); setAadharPreview(null);
      setRentalFile(null); setRentalPreview(null);

      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      setError(
        err.response?.data?.message || "Failed to save changes. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3F4F6", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid #E5E7EB", borderTopColor: "#4F46E5", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.7s linear infinite" }} />
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Loading your profile...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <ProfileView
      profile={profile}
      form={form}
      isEditing={isEditing}
      isSaving={isSaving}
      isDirty={isDirty}
      saveSuccess={saveSuccess}
      error={error}
      fieldErrors={fieldErrors}
      photoPreview={photoPreview}         // ← blob URL for preview before save
      onEdit={handleEdit}
      onCancel={handleCancel}
      onSave={handleSave}
      onFormChange={handleFormChange}
      onPhotoChange={handlePhotoChange}   // ← new prop
      aadharFile={aadharFile}
      aadharPreview={aadharPreview}
      rentalFile={rentalFile}
      rentalPreview={rentalPreview}
      onAadharChange={handleAadharChange}
      onAadharClear={handleAadharClear}
      onRentalChange={handleRentalChange}
      onRentalClear={handleRentalClear}
    />
  );
};

export default ProfileContainer;