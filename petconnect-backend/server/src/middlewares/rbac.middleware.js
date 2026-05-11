  import ROLES from "./roles.js";

  export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Please login first.",
        });
      }

      // No roles passed → allow any authenticated user
      if (allowedRoles.length === 0) return next();

      const { role } = req.user;

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: '${role}' accounts cannot access this resource.`,
          requiredRoles: allowedRoles,
        });
      }

      next();
    };
  };

  export const authorizeShelterOwner = () => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Please login first.",
        });
      }

      const { role, shelter } = req.user;

      // Admin bypasses shelter ownership check
      if (role === ROLES.ADMIN) return next();

      if (role !== ROLES.SHELTER) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Only shelter accounts can access this resource.",
        });
      }

      // req.user.shelter is set by authMiddleware when role === "shelter"
      if (!shelter) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: No shelter profile linked to your account.",
        });
      }

      const requestedShelterId = req.params.shelterId || req.params.id;

      if (String(shelter.id) !== String(requestedShelterId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only manage your own shelter.",
        });
      }

      next();
    };
  };

  /**
   * authorizeOwnerOrAdmin
   *
   * Allows access if user owns the resource OR is admin.
   * Default extracts :id from params — matches your route PUT /:id/profile
   *
   * router.put("/:id/profile", authMiddleware, authorizeOwnerOrAdmin(), updateProfile)
   *
   * Custom extractor:
   * router.put("/:userId/...", authMiddleware,
   *   authorizeOwnerOrAdmin((req) => req.params.userId), handler)
   */
  export const authorizeOwnerOrAdmin = (
    ownerIdExtractor = (req) => req.params.id,
  ) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Please login first.",
        });
      }

      const isAdmin = req.user.role === ROLES.ADMIN;
      const ownerId = ownerIdExtractor(req);
      const isOwner = String(req.user.id) === String(ownerId);

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only access your own resources.",
        });
      }

      next();
    };
  };
