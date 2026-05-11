import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PetService from "../services/PetService";
import AdoptionService from "../services/Adoptionservice.js";
import AdoptionApplicationForm from "../components/pets/ApplicationAdoptionForm";
import WishlistService from "../services/WishListService.js";

const AdoptionApplicationContainer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [loadingPet, setLoadingPet] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [adoptionCount, setAdoptionCount] = useState(0);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    past_pet_experience: 0,
    aadhar_proof_url: null,
    rental_agreement_url: null,
    current_occupation: "",
    address: "",
    living_situation: "",
    family_agreement: "",
    is_rented: "",
    pets_allowed: "",
    landlord_permission: "",
    vacation_care: "",
    landlord_no_reason: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const petRes = await PetService.getPetById(id);
        setPet(petRes.data);

        const prefillRes = await AdoptionService.getPrefillData();
        const user = prefillRes.data.data;

        if (user) {
          setForm((prev) => ({
            ...prev,
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            phone: user.phone || "",
            email: user.email || "",
            past_pet_experience: user.pet_experience_years ?? 0,
            aadhar_saved_url: user.aadhar_proof_url || "",
            rental_saved_url: user.rental_agreement_url || "",
          }));
        }

        const myAppsRes = await AdoptionService.getMyApplications();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const completedCount = myAppsRes.data.data.filter(
          (app) =>
            app.status === "completed" &&
            new Date(app.updatedAt) >= oneYearAgo
        ).length;
        setAdoptionCount(completedCount);

      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error("Fetch error:", err);
      } finally {
        setLoadingPet(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFieldChange = (field, value) =>
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "is_rented" || field === "pets_allowed") {
        const isRented = field === "is_rented" ? value : prev.is_rented;
        const petsAllowed = field === "pets_allowed" ? value : prev.pets_allowed;

        if (isRented === "No" && petsAllowed === "Yes") {
          updated.landlord_permission = "I am the owner";
          updated.rental_saved_url = "";
          updated.rental_agreement_file = null;
        } else if (isRented === "No" && petsAllowed === "No") {
          updated.landlord_permission = "No";
        } else if (isRented === "Yes" && petsAllowed === "Yes") {
          updated.landlord_permission = "Yes";
        } else if (isRented === "Yes" && petsAllowed === "No") {
          updated.landlord_permission = "No";
        } else {
          updated.landlord_permission = "";
        }

        if (field === "is_rented") {
          updated.pets_allowed = "";
          updated.landlord_permission = "";
        }
      }

      return updated;
    });

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const shelterId = pet?.shelterId || pet?.shelter_id || pet?.shelter?.id;

      const formData = new FormData();
      formData.append("shelterId",          shelterId);
      formData.append("currentOccupation",  form.current_occupation);
      formData.append("address",            form.address);
      formData.append("livingArrangement",  form.living_situation);
      formData.append("familyAgreement",    form.family_agreement || "N/A");
      formData.append("landlordAllowsPets", form.landlord_permission);
      formData.append("petCareWhenAway",    form.vacation_care);

      if (form.landlord_permission === "No" && form.landlord_no_reason) {
        formData.append("landlordNoReason", form.landlord_no_reason);
      }

      if (form.aadhar_file instanceof File) {
        formData.append("aadhar_proof", form.aadhar_file);
      }
      if (form.rental_agreement_file instanceof File) {
        formData.append("rental_agreement", form.rental_agreement_file);
      }

      await AdoptionService.submitApplication(id, formData);

      try {
        await WishlistService.toggle(id);
      } catch {
        // silent
      }
      setSubmitted(true);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(message);
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdoptionApplicationForm
      pet={pet}
      loading={loadingPet}
      submitting={submitting}
      submitted={submitted}
      error={error}
      step={step}
      form={form}
      onFieldChange={handleFieldChange}
      onStepChange={setStep}
      onSubmit={handleSubmit}
      onBack={() => navigate(`/pets/${id}`)}
      onViewApplications={() => navigate("/my-applications")}
      onBackToBrowse={() => navigate("/browse")}
      adoptionCount={adoptionCount}
    />
  );
};

export default AdoptionApplicationContainer;
