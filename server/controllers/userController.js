const User = require("../models/User");
const WorkerProfile = require("../models/WorkerProfile");

const parseList = (value) => {
	if (Array.isArray(value)) {
		return value.map((item) => String(item).trim()).filter(Boolean);
	}

	if (typeof value === "string") {
		return value
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	}

	return [];
};

const getPublicWorkerProfile = async (req, res, next) => {
	try {
		const user = await User.findById(req.params.id).select("name avatar role createdAt").lean();

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const workerProfile = await WorkerProfile.findOne({ user: user._id }).lean();

		if (!["worker", "both"].includes(user.role) && !workerProfile) {
			return res.status(404).json({ message: "Worker profile not found" });
		}

		const profile = {
			user,
			bio: workerProfile?.bio || "",
			location: workerProfile?.location || "",
			skills: workerProfile?.skills || [],
			categories: workerProfile?.categories || [],
			hourlyRate: workerProfile?.hourlyRate || 0,
			availability: workerProfile?.availability !== false,
			completedJobs: workerProfile?.completedJobs || 0,
			rating: workerProfile?.rating || 0,
			totalReviews: workerProfile?.totalReviews || 0,
			portfolio: workerProfile?.portfolio || [],
			languages: workerProfile?.languages || [],
			createdAt: workerProfile?.createdAt || user.createdAt,
			updatedAt: workerProfile?.updatedAt || user.createdAt,
		};

		return res.status(200).json({ profile });
	} catch (error) {
		return next(error);
	}
};

const getMyProfile = async (req, res, next) => {
	try {
		const user = await User.findById(req.user._id).select("-password").lean();
		const workerProfile = await WorkerProfile.findOne({ user: req.user._id }).lean();

		return res.status(200).json({
			user,
			workerProfile,
		});
	} catch (error) {
		return next(error);
	}
};

const updateMyProfile = async (req, res, next) => {
	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const { name, avatar } = req.body;

		if (name !== undefined) {
			user.name = String(name).trim();
		}

		if (avatar !== undefined) {
			user.avatar = String(avatar).trim();
		}

		await user.save();

		let workerProfile = null;
		if (["worker", "both"].includes(user.role)) {
			workerProfile = await WorkerProfile.findOne({ user: user._id });
			if (!workerProfile) {
				workerProfile = await WorkerProfile.create({ user: user._id });
			}

			const {
				bio,
				location,
				skills,
				categories,
				hourlyRate,
				availability,
				languages,
				portfolio,
			} = req.body;

			if (bio !== undefined) workerProfile.bio = String(bio).trim();
			if (location !== undefined) workerProfile.location = String(location).trim();
			if (skills !== undefined) workerProfile.skills = parseList(skills);
			if (categories !== undefined) workerProfile.categories = parseList(categories);
			if (hourlyRate !== undefined && hourlyRate !== "") workerProfile.hourlyRate = Number(hourlyRate) || 0;
			if (availability !== undefined) {
				if (typeof availability === "string") {
					workerProfile.availability = availability.toLowerCase() === "true";
				} else {
					workerProfile.availability = Boolean(availability);
				}
			}
			if (languages !== undefined) workerProfile.languages = parseList(languages);

			if (Array.isArray(portfolio)) {
				workerProfile.portfolio = portfolio
					.map((item) => ({
						title: item?.title ? String(item.title).trim() : "",
						description: item?.description ? String(item.description).trim() : "",
						imageUrl: item?.imageUrl ? String(item.imageUrl).trim() : "",
					}))
					.filter((item) => item.title || item.description || item.imageUrl);
			}

			await workerProfile.save();
		}

		return res.status(200).json({
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				avatar: user.avatar,
			},
			workerProfile,
		});
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	getPublicWorkerProfile,
	getMyProfile,
	updateMyProfile,
};
