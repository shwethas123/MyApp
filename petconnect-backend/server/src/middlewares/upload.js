import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (!req.uploadFolder) {
      req.uploadFolder = `shelters/temp_${Date.now()}`;
    }
    return {
      folder: req.uploadFolder,
      public_id: `${Date.now()}_${file.fieldname}`,
      allowed_formats: ["jpg", "jpeg", "png", "pdf"],
      resource_type: file.mimetype === "application/pdf" ? "raw" : "image", // ← fix
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPEG, PNG files are allowed"));
    }
  },
});

const petStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // temp folder until pet is created and we have a real pet id
    if (!req.petUploadFolder) {
      req.petUploadFolder = `pets/temp_${Date.now()}`;
    }
    return {
      folder: req.petUploadFolder,
      // ✅ Fix
      public_id: `${Date.now()}_${Math.random().toString(36).slice(2)}_${file.originalname.split(".")[0]}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      resource_type: "image",
    };
  },
});

const petRecordStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (!req.petUploadFolder) {
      req.petUploadFolder = `pets/temp_${Date.now()}`;
    }
    return {
      folder: `${req.petUploadFolder}/records`,
      public_id: `${Date.now()}_${file.fieldname}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
      resource_type: "auto",
    };
  },
});

export const petRecordUpload = multer({
  storage: petRecordStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for PDFs
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPEG, PNG, WEBP images and PDFs are allowed"));
  },
});

export const petUpload = multer({
  storage: petStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB per image
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
  },
});
const homeVisitStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: "petconnect/home_visits",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png"],
  }),
});

export const uploadHomeVisitPhotos = multer({
  storage: homeVisitStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array("home_visit_photos", 3);

const combinedStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (!req.petUploadFolder) {
      req.petUploadFolder = `pets/temp_${Date.now()}`;
    }

    const isRecord = [
      "health_record",
      "vaccination_record",
      "sterilization_certificate",
    ].includes(file.fieldname);

    const isPdf = file.mimetype === "application/pdf";
    return {
      folder: isRecord ? `${req.petUploadFolder}/records` : req.petUploadFolder,
      public_id: `${Date.now()}_${Math.random().toString(36).slice(2)}_${file.originalname.split(".")[0]}`,
      allowed_formats: isRecord
        ? ["jpg", "jpeg", "png", "webp", "pdf"]
        : ["jpg", "jpeg", "png", "webp"],
      resource_type: isPdf ? "raw" : "image",
    };
  },
});

export const combinedPetUpload = multer({
  storage: combinedStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const imageFields = ["images"];
    const recordFields = [
      "health_record",
      "vaccination_record",
      "sterilization_certificate",
    ];

    if (imageFields.includes(file.fieldname)) {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      allowed.includes(file.mimetype)
        ? cb(null, true)
        : cb(new Error("Only JPEG, PNG, WEBP images allowed for pet photos"));
    } else if (recordFields.includes(file.fieldname)) {
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];
      allowed.includes(file.mimetype)
        ? cb(null, true)
        : cb(new Error("Only JPEG, PNG, WEBP and PDF allowed for records"));
    } else {
      cb(new Error("Unexpected field"));
    }
  },
}).fields([
  { name: "images", maxCount: 3 },
  { name: "health_record", maxCount: 1 },
  { name: "vaccination_record", maxCount: 1 },
  { name: "sterilization_certificate", maxCount: 1 },
]);
const profilePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req) => {
    const userId = req.params?.id || req.user?.id || "unknown";
    return {
      folder: `users/profile_photos`,
      public_id: `user_${userId}_${Date.now()}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      resource_type: "image",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    };
  },
});

export const profilePhotoUpload = multer({
  storage: profilePhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPEG, PNG, and WEBP images are allowed for profile photo",
        ),
      );
    }
  },
});
const shelterProfilePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req) => {
    const shelterId = req.shelter?.id || req.params?.shelterId || "unknown";
    return {
      folder: "shelters/profile_photos",
      public_id: `shelter_${shelterId}_${Date.now()}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      resource_type: "image",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "center" },
        { quality: "auto", fetch_format: "auto" },
      ],
    };
  },
});
 
export const shelterProfilePhotoUpload = multer({
  storage: shelterProfilePhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WEBP images are allowed for shelter profile photo"));
    }
  },
});
const adoptionDocStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `users/adoption_docs/user_${req.user?.id || "unknown"}`,
    public_id: `${file.fieldname}_${Date.now()}`,
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: file.mimetype === "application/pdf" ? "raw" : "image",
  }),
});

export const adoptionDocUpload = multer({
  storage: adoptionDocStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PDF, JPEG, PNG, WEBP files are allowed"));
  },
}).fields([
  { name: "aadhar_proof", maxCount: 1 },
  { name: "rental_agreement", maxCount: 1 },
]);

export const profileDocumentsUpload = multer({
  storage: adoptionDocStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PDF, JPEG, PNG, WEBP files are allowed"));
  },
}).fields([
  { name: "profile_photo",    maxCount: 1 },
  { name: "aadhar_proof",     maxCount: 1 },
  { name: "rental_agreement", maxCount: 1 },
]);

export default upload;
