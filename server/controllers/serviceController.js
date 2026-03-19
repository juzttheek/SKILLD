const ServiceListing = require("../models/ServiceListing");
const WorkerProfile = require("../models/WorkerProfile");

const withWorkerRating = async (services) => {
	const workerIds = services.map((service) => service.worker?._id).filter(Boolean);
	const profiles = await WorkerProfile.find({ user: { $in: workerIds } }).select("user rating");
	const ratingMap = new Map(profiles.map((profile) => [profile.user.toString(), profile.rating]));

	return services.map((service) => {
		const plain = service.toObject();
		if (plain.worker && plain.worker._id) {
			plain.worker.rating = ratingMap.get(plain.worker._id.toString()) || 0;
		}
		return plain;
	});
};

const createService = async (req, res, next) => {
	try {
		if (!req.user || !["worker", "both"].includes(req.user.role)) {
			return res.status(403).json({ message: "Only worker or both-role users can create services" });
		}

		const {
			title,
			description,
			category,
			subcategory,
			price,
			pricingType,
			deliveryTime,
			tags,
		} = req.body;

		if (!title || !description || !category || price === undefined) {
			return res.status(400).json({ message: "title, description, category, and price are required" });
		}

		const parsedTags = Array.isArray(tags)
			? tags
			: typeof tags === "string" && tags.trim()
				? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
				: [];

		const images = (req.files || []).slice(0, 5).map((file) => file.originalname || file.filename || "");

		const service = await ServiceListing.create({
			worker: req.user._id,
			title,
			description,
			category,
			subcategory,
			price,
			pricingType,
			deliveryTime,
			tags: parsedTags,
			images,
		});

		return res.status(201).json(service);
	} catch (error) {
		return next(error);
	}
};

const getAllServices = async (req, res, next) => {
	try {
		const {
			category,
			minPrice,
			maxPrice,
			search,
			page = 1,
			limit = 10,
		} = req.query;

		const filter = { isActive: true };

		if (category) {
			filter.category = category;
		}

		if (minPrice || maxPrice) {
			filter.price = {};
			if (minPrice) filter.price.$gte = Number(minPrice);
			if (maxPrice) filter.price.$lte = Number(maxPrice);
		}

		if (search) {
			const regex = new RegExp(search, "i");
			filter.$or = [{ title: regex }, { tags: regex }];
		}

		const pageNumber = Math.max(Number(page) || 1, 1);
		const limitNumber = Math.max(Number(limit) || 10, 1);
		const skip = (pageNumber - 1) * limitNumber;

		const [services, totalCount] = await Promise.all([
			ServiceListing.find(filter)
				.populate("worker", "name avatar")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limitNumber),
			ServiceListing.countDocuments(filter),
		]);

		const enrichedServices = await withWorkerRating(services);

		return res.status(200).json({
			data: enrichedServices,
			totalCount,
			page: pageNumber,
			limit: limitNumber,
			totalPages: Math.ceil(totalCount / limitNumber),
		});
	} catch (error) {
		return next(error);
	}
};

const getServiceById = async (req, res, next) => {
	try {
		const service = await ServiceListing.findById(req.params.id).populate("worker", "name avatar");

		if (!service) {
			return res.status(404).json({ message: "Service not found" });
		}

		const [enriched] = await withWorkerRating([service]);
		return res.status(200).json(enriched);
	} catch (error) {
		return next(error);
	}
};

const updateService = async (req, res, next) => {
	try {
		const service = await ServiceListing.findById(req.params.id);

		if (!service) {
			return res.status(404).json({ message: "Service not found" });
		}

		if (service.worker.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Forbidden: Not service owner" });
		}

		const allowedFields = [
			"title",
			"description",
			"category",
			"subcategory",
			"price",
			"pricingType",
			"deliveryTime",
			"tags",
			"isActive",
		];

		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				service[field] = req.body[field];
			}
		}

		if (req.body.tags && typeof req.body.tags === "string") {
			service.tags = req.body.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
		}

		if (req.files && req.files.length > 0) {
			service.images = req.files.slice(0, 5).map((file) => file.originalname || file.filename || "");
		}

		const updatedService = await service.save();
		return res.status(200).json(updatedService);
	} catch (error) {
		return next(error);
	}
};

const deleteService = async (req, res, next) => {
	try {
		const service = await ServiceListing.findById(req.params.id);

		if (!service) {
			return res.status(404).json({ message: "Service not found" });
		}

		if (service.worker.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Forbidden: Not service owner" });
		}

		await service.deleteOne();
		return res.status(200).json({ message: "Service deleted successfully" });
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	createService,
	getAllServices,
	getServiceById,
	updateService,
	deleteService,
};
