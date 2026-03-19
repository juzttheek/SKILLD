const express = require("express");
const { body, param } = require("express-validator");
const {
  getPublicWorkerProfile,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const updateValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters"),
  body("avatar")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Avatar URL is too long"),
  body("bio")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Bio must be at most 2000 characters"),
  body("hourlyRate")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Hourly rate must be a non-negative number"),
  body("categories")
    .optional()
    .custom((value) => {
      const validCategories = ["digital", "local", "professional"];

      if (Array.isArray(value)) {
        const allValid = value.every((item) => validCategories.includes(String(item).trim()));
        if (!allValid) {
          throw new Error("Categories can only include digital, local, or professional");
        }
      }

      return true;
    }),
];

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateValidation, validateRequest, updateMyProfile);
router.get(
  "/:id/profile",
  param("id").isMongoId().withMessage("Invalid user id"),
  validateRequest,
  getPublicWorkerProfile
);

module.exports = router;
