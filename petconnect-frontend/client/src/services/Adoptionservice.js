import Apiservices from "./Apiservices";

const AdoptionService = {
  // GET /api/adoption/prefill
  getPrefillData: () => {
    return Apiservices.get("/adoption/prefill");
  },

  // POST /api/adoption/apply/:petId
  submitApplication: (petId, formData) => {
    return Apiservices.post(`/adoption/apply/${petId}`, formData);
  },

  // GET /api/adoption/my-applications
  getMyApplications: () => {
    return Apiservices.get("/adoption/my-applications");
  },

  // GET /api/adoption/:applicationId  — for ApplicationDetailsPage
  getApplicationById: (applicationId) => {
    return Apiservices.get(`/adoption/${applicationId}`);
  },

  // PATCH /api/adoption/:applicationId/payment — mark as completed after payment
  completePayment: (applicationId, method) => {
    return Apiservices.patch(`/adoption/${applicationId}/payment`, {
      payment_method: method,
    });
  },

  // GET /api/adoption/shelter/:shelterId
  getApplicationsForShelter: (shelterId) => {
    return Apiservices.get(`/adoption/shelter/${shelterId}`);
  },

  // PATCH /api/adoption/:applicationId/status
  updateApplicationStatus: (applicationId, status, rejectionReason) => {
    return Apiservices.patch(`/adoption/${applicationId}/status`, {
      status,
      ...(rejectionReason && { rejection_reason: rejectionReason }),
    });
  },
  // Add this method
  getShelterApplicationById: (shelterId, applicationId) => {
    return Apiservices.get(
      `/adoption/shelter/${shelterId}/application/${applicationId}`,
    );
  },
  submitHomeVisit: (applicationId, formData) => {
    return Apiservices.patch(
      `/adoption/${applicationId}/home-visit`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },

downloadCertificate: (applicationId) => {
    return Apiservices.get(`/adoption/${applicationId}/certificate`, {
      responseType: "blob",
    });
  },

  submitHomeVisitOutcome: (applicationId, { outcome, notes }) => {
    return Apiservices.patch(`/adoption/${applicationId}/home-visit-outcome`, {
      outcome,
      notes,
    });
  },
  scheduleHomeVisit: (applicationId, data) => {
    return Apiservices.patch(`/adoption/${applicationId}/schedule-home-visit`, data);
  },

};

export default AdoptionService;
