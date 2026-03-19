const express = require("express");
const { body } = require("express-validator");
const { createReview, getReviewsForUser } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const createReviewValidation = [
	body().custom((value) => {
		const targetUser = value?.revieweeId || value?.reviewedUser;
		if (!targetUser) {
			throw new Error("Valid revieweeId is required");
		}
		return true;
	}),
	body("rating")
		.isInt({ min: 1, max: 5 })
		.withMessage("Rating must be between 1 and 5"),
	body("comment")
		.optional({ values: "falsy" })
		.trim()
		.isLength({ max: 1000 })
		.withMessage("Comment must be at most 1000 characters"),
	body().custom((value) => {
		const jobId = value?.jobId || value?.job;
		const serviceId = value?.serviceId || value?.service;

		if (jobId && !/^[a-f\d]{24}$/i.test(String(jobId))) {
			throw new Error("Job must be a valid id");
		}

		if (serviceId && !/^[a-f\d]{24}$/i.test(String(serviceId))) {
			throw new Error("Service must be a valid id");
		}

		return true;
	}),
	body("type")
		.trim()
		.isIn(["client-to-worker", "worker-to-client"])
		.withMessage("Type must be client-to-worker or worker-to-client"),
];

router.post("/", protect, createReviewValidation, validateRequest, createReview);
router.get("/user/:userId", getReviewsForUser);

module.exports = router;
