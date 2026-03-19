const Job = require("../models/Job");
const Application = require("../models/Application");
const WorkerProfile = require("../models/WorkerProfile");

const createJob = async (req, res, next) => {
	try {
		if (!req.user || !["client", "both"].includes(req.user.role)) {
			return res.status(403).json({ message: "Only client or both-role users can create jobs" });
		}

		const {
			title,
			description,
			category,
			budget,
			budgetType,
			deadline,
			location,
			tags,
		} = req.body;

		if (!title || !description || !category) {
			return res.status(400).json({ message: "title, description, and category are required" });
		}

		const parsedTags = Array.isArray(tags)
			? tags
			: typeof tags === "string" && tags.trim()
				? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
				: [];

		const job = await Job.create({
			client: req.user._id,
			title,
			description,
			category,
			budget,
			budgetType,
			deadline,
			location,
			tags: parsedTags,
		});

		return res.status(201).json(job);
	} catch (error) {
		return next(error);
	}
};

const getAllJobs = async (req, res, next) => {
	try {
		const {
			category,
			minBudget,
			maxBudget,
			status,
			search,
			page = 1,
			limit = 10,
		} = req.query;

		const filter = { status: status || "open" };
		if (category) filter.category = category;

		if (minBudget || maxBudget) {
			filter.budget = {};
			if (minBudget) filter.budget.$gte = Number(minBudget);
			if (maxBudget) filter.budget.$lte = Number(maxBudget);
		}

		if (search) {
			const regex = new RegExp(search, "i");
			filter.$or = [{ title: regex }, { description: regex }, { tags: regex }];
		}

		const pageNumber = Math.max(Number(page) || 1, 1);
		const limitNumber = Math.max(Number(limit) || 10, 1);
		const skip = (pageNumber - 1) * limitNumber;

		const [jobs, totalCount] = await Promise.all([
			Job.find(filter)
				.populate("client", "name avatar email")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limitNumber),
			Job.countDocuments(filter),
		]);

		return res.status(200).json({
			data: jobs,
			totalCount,
			page: pageNumber,
			limit: limitNumber,
			totalPages: Math.ceil(totalCount / limitNumber),
		});
	} catch (error) {
		return next(error);
	}
};

const getJobById = async (req, res, next) => {
	try {
		const job = await Job.findById(req.params.id).populate("client", "name avatar email role");

		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		const response = job.toObject();

		if (req.user && ["worker", "both"].includes(req.user.role)) {
			const application = await Application.findOne({ job: job._id, worker: req.user._id }).select("status");
			response.workerApplicationStatus = application ? application.status : null;
		}

		return res.status(200).json(response);
	} catch (error) {
		return next(error);
	}
};

const updateJob = async (req, res, next) => {
	try {
		if (!req.user || !["client", "both"].includes(req.user.role)) {
			return res.status(403).json({ message: "Only client or both-role users can update jobs" });
		}

		const job = await Job.findById(req.params.id);

		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		if (job.client.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Forbidden: Not job owner" });
		}

		const allowedFields = [
			"title",
			"description",
			"category",
			"budget",
			"budgetType",
			"deadline",
			"status",
			"location",
			"tags",
			"hiredWorker",
		];

		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				job[field] = req.body[field];
			}
		}

		if (req.body.tags && typeof req.body.tags === "string") {
			job.tags = req.body.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
		}

		const updatedJob = await job.save();
		return res.status(200).json(updatedJob);
	} catch (error) {
		return next(error);
	}
};

const deleteJob = async (req, res, next) => {
	try {
		if (!req.user || !["client", "both"].includes(req.user.role)) {
			return res.status(403).json({ message: "Only client or both-role users can delete jobs" });
		}

		const job = await Job.findById(req.params.id);

		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		if (job.client.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Forbidden: Not job owner" });
		}

		await Application.deleteMany({ job: job._id });
		await job.deleteOne();
		return res.status(200).json({ message: "Job deleted successfully" });
	} catch (error) {
		return next(error);
	}
};

const applyToJob = async (req, res, next) => {
	try {
		if (!req.user || !["worker", "both"].includes(req.user.role)) {
			return res.status(403).json({ message: "Only worker or both-role users can apply to jobs" });
		}

		const { id: jobId } = req.params;
		const { coverLetter, proposedRate, estimatedTime } = req.body;

		if (!coverLetter) {
			return res.status(400).json({ message: "coverLetter is required" });
		}

		const job = await Job.findById(jobId);
		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		const existingApplication = await Application.findOne({ job: jobId, worker: req.user._id });
		if (existingApplication) {
			return res.status(400).json({ message: "You have already applied to this job" });
		}

		const application = await Application.create({
			job: jobId,
			worker: req.user._id,
			coverLetter,
			proposedRate,
			estimatedTime,
		});

		await Job.findByIdAndUpdate(jobId, {
			$addToSet: { applicants: req.user._id },
		});

		return res.status(201).json(application);
	} catch (error) {
		return next(error);
	}
};

const getApplicationsForJob = async (req, res, next) => {
	try {
		if (!req.user || !["client", "both"].includes(req.user.role)) {
			return res.status(403).json({ message: "Only client or both-role users can view job applications" });
		}

		const { id: jobId } = req.params;

		const job = await Job.findById(jobId);
		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		if (job.client.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Forbidden: Not job owner" });
		}

		const applications = await Application.find({ job: jobId })
			.populate("worker", "name avatar")
			.sort({ createdAt: -1 });

		const workerIds = applications.map((app) => app.worker?._id).filter(Boolean);
		const profiles = await WorkerProfile.find({ user: { $in: workerIds } }).select("user rating");
		const ratingMap = new Map(profiles.map((profile) => [profile.user.toString(), profile.rating]));

		const enrichedApplications = applications.map((application) => {
			const item = application.toObject();
			if (item.worker && item.worker._id) {
				item.worker.rating = ratingMap.get(item.worker._id.toString()) || 0;
			}
			return item;
		});

		return res.status(200).json(enrichedApplications);
	} catch (error) {
		return next(error);
	}
};

const acceptApplication = async (req, res, next) => {
	try {
		if (!req.user || !["client", "both"].includes(req.user.role)) {
			return res.status(403).json({ message: "Only client or both-role users can accept applications" });
		}

		const { jobId, applicationId } = req.params;

		const job = await Job.findById(jobId);
		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		if (job.client.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Forbidden: Not job owner" });
		}

		const selectedApplication = await Application.findOne({ _id: applicationId, job: jobId });
		if (!selectedApplication) {
			return res.status(404).json({ message: "Application not found for this job" });
		}

		await Application.updateMany({ job: jobId, _id: { $ne: applicationId } }, { status: "rejected" });
		selectedApplication.status = "accepted";
		await selectedApplication.save();

		job.hiredWorker = selectedApplication.worker;
		job.status = "in-progress";
		await job.save();

		return res.status(200).json({ message: "Application accepted", application: selectedApplication, job });
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	createJob,
	getAllJobs,
	getJobById,
	updateJob,
	deleteJob,
	applyToJob,
	getApplicationsForJob,
	acceptApplication,
};
