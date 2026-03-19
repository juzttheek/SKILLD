const Review = require("../models/Review");
const WorkerProfile = require("../models/WorkerProfile");
const User = require("../models/User");

const createReview = async (req, res, next) => {
	try {
		const revieweeId = req.body.revieweeId || req.body.reviewedUser;
		const rating = req.body.rating;
		const comment = req.body.comment;
		const jobId = req.body.jobId || req.body.job;
		const serviceId = req.body.serviceId || req.body.service;
		const type = req.body.type;

		if (!revieweeId || !rating || !type) {
			return res.status(400).json({ message: "revieweeId, rating, and type are required" });
		}

		const reviewee = await User.findById(revieweeId).select("_id");
		if (!reviewee) {
			return res.status(404).json({ message: "Reviewee not found" });
		}

		let duplicateFilter = null;
		if (jobId) {
			duplicateFilter = {
				reviewer: req.user._id,
				reviewee: revieweeId,
				job: jobId,
			};
		} else if (serviceId) {
			duplicateFilter = {
				reviewer: req.user._id,
				reviewee: revieweeId,
				service: serviceId,
			};
		}

		if (duplicateFilter) {
			const existingReview = await Review.findOne(duplicateFilter).select("_id");
			if (existingReview) {
				return res.status(400).json({ message: "Duplicate review is not allowed for the same job/service" });
			}
		}

		const review = await Review.create({
			reviewer: req.user._id,
			reviewee: revieweeId,
			job: jobId || null,
			service: serviceId || null,
			rating,
			comment,
			type,
		});

		const ratingStats = await Review.aggregate([
			{ $match: { reviewee: reviewee._id } },
			{
				$group: {
					_id: "$reviewee",
					avgRating: { $avg: "$rating" },
					totalReviews: { $sum: 1 },
				},
			},
		]);

		if (ratingStats.length > 0) {
			await WorkerProfile.findOneAndUpdate(
				{ user: reviewee._id },
				{
					rating: Number(ratingStats[0].avgRating.toFixed(2)),
					totalReviews: ratingStats[0].totalReviews,
				},
				{ new: true }
			);
		}

		return res.status(201).json(review);
	} catch (error) {
		return next(error);
	}
};

const getReviewsForUser = async (req, res, next) => {
	try {
		const { userId } = req.params;

		const reviews = await Review.find({ reviewee: userId })
			.populate("reviewer", "name avatar")
			.sort({ createdAt: -1 });

		return res.status(200).json(reviews);
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	createReview,
	getReviewsForUser,
};
