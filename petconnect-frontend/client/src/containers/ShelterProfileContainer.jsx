// src/containers/ShelterProfileContainer.jsx
import { useState, useEffect } from "react";
import ShelterProfileView from "../components/ShelterProfileView";
import ApiService from "../services/Apiservices";

const ShelterProfileContainer = () => {
  const [shelter, setShelter]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [isEditing, setIsEditing]     = useState(false);
  const [isSaving, setIsSaving]       = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError]             = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Document state
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [uploadingDoc, setUploadingDoc]     = useState(false);
  const [docError, setDocError]             = useState(null);

  // ── profile photo state ───────────────────────────────────────────────────
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // ── NEW: snapshot of form when edit mode starts ───────────────────────────
  const [initialForm, setInitialForm] = useState(null);

  const [form, setForm] = useState({
    name: "", contact_email: "", contact_phone: "",
    city: "", state: "", country: "", zipcode: "", description: "", upi_id: "",
  });

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await ApiService.get("/shelters/my-profile");
      const s = res.data.data;
      console.log("shelter data", s);
      setShelter(s);
      setForm({
        name:          s.name          || "",
        contact_email: s.contact_email || "",
        contact_phone: s.contact_phone || "",
        city:          s.city          || "",
        state:         s.state         || "",
        country:       s.country       || "",
        zipcode:       s.zipcode ? String(s.zipcode) : "",
        description:   s.description   || "",
        upi_id:        s.upi_id        || "",
      });
    } catch (err) {
      console.error("Failed to fetch shelter profile:", err);
      setError("Failed to load shelter profile. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!form.name?.trim())          errors.name          = "Shelter name is required";
    if (!form.contact_email?.trim()) errors.contact_email = "Contact email is required";
    if (!form.contact_phone?.trim()) errors.contact_phone = "Contact phone is required";
    if (!form.city?.trim())          errors.city          = "City is required";
    if (!form.state?.trim())         errors.state         = "State is required";
    return errors;
  };

  // ── Profile handlers ──────────────────────────────────────────────────────
  const handleEdit = () => {
    setSaveSuccess(false);
    setError(null);
    setFieldErrors({});
    setInitialForm({ ...form }); // ── NEW: snapshot current form on edit click
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm({
      name:          shelter?.name          || "",
      contact_email: shelter?.contact_email || "",
      contact_phone: shelter?.contact_phone || "",
      city:          shelter?.city          || "",
      state:         shelter?.state         || "",
      country:       shelter?.country       || "",
      zipcode:       shelter?.zipcode ? String(shelter.zipcode) : "",
      description:   shelter?.description   || "",
      upi_id:        shelter?.upi_id        || "",
    });
    setError(null);
    setFieldErrors({});
    setIsEditing(false);
    setInitialForm(null); // ── NEW: clear snapshot on cancel
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSave = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setIsSaving(true); setError(null); setFieldErrors({});
    try {
      const res = await ApiService.put("/shelters/my-profile", form);
      setShelter((prev) => ({ ...prev, ...res.data.data }));
      setSaveSuccess(true);
      setIsEditing(false);
      setInitialForm(null); // ── NEW: clear snapshot after successful save
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Document handlers ─────────────────────────────────────────────────────
  const handleDeleteDocument = async (fileId) => {
    if (!window.confirm("Remove this document?")) return;
    setDeletingFileId(fileId);
    setDocError(null);
    try {
      await ApiService.del(`/shelters/documents/${fileId}`);
      setShelter((prev) => ({
        ...prev,
        files: prev.files.filter((f) => f.id !== fileId),
      }));
    } catch (err) {
      setDocError(err.response?.data?.message || "Failed to delete document.");
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleUploadDocument = async (file, fileType) => {
    setUploadingDoc(true);
    setDocError(null);
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("file_type", fileType);
      const res = await ApiService.post("/shelters/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newFile = res.data.data;
      setShelter((prev) => ({
        ...prev,
        files: [...(prev.files || []), newFile],
      }));
    } catch (err) {
      setDocError(err.response?.data?.message || "Failed to upload document.");
    } finally {
      setUploadingDoc(false);
    }
  };

  // ── profile photo upload handler ──────────────────────────────────────────
  const handlePhotoUpload = async (file) => {
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("profile_photo", file);
      const res = await ApiService.post("/shelters/my-profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShelter((prev) => ({
        ...prev,
        profile_photo_url: res.data.data.profile_photo_url,
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload profile photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // ── NEW: true only when at least one field differs from the snapshot ───────
  const hasChanges = initialForm
    ? Object.keys(form).some((key) => form[key] !== initialForm[key])
    : false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
        <div className="text-center">
          <div style={{ width: "36px", height: "36px", border: "3px solid #E5E7EB", borderTopColor: "#3182CE", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.7s linear infinite" }} />
          <p className="text-sm text-gray-400">Loading shelter profile...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <ShelterProfileView
      shelter={shelter}
      form={form}
      isEditing={isEditing}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
      error={error}
      fieldErrors={fieldErrors}
      onEdit={handleEdit}
      onCancel={handleCancel}
      onSave={handleSave}
      onFormChange={handleFormChange}
      // Document props
      deletingFileId={deletingFileId}
      uploadingDoc={uploadingDoc}
      docError={docError}
      onDeleteDocument={handleDeleteDocument}
      onUploadDocument={handleUploadDocument}
      // photo props
      isUploadingPhoto={isUploadingPhoto}
      onPhotoUpload={handlePhotoUpload}
      // ── NEW: change detection ──
      hasChanges={hasChanges}
    />
  );
};

export default ShelterProfileContainer;