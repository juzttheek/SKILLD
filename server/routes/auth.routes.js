const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const loginRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		message: "Too many login attempts. Please try again in 15 minutes.",
	},
});

const registerValidation = [
	body("name").trim().notEmpty().withMessage("Name is required"),
	body("email").trim().isEmail().withMessage("Valid email is required"),
	body("password")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters"),
	body("role")
		.trim()
		.notEmpty()
		.withMessage("Role is required")
		.isIn(["client", "worker", "both"])
		.withMessage("Role must be client, worker, or both"),
];

const loginValidation = [
	body("email").trim().isEmail().withMessage("Valid email is required"),
	body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginRateLimiter, loginValidation, validateRequest, login);
router.get("/me", protect, getMe);

module.exports = router;
