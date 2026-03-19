const bcrypt = require("bcryptjs");
const User = require("../models/User");
const WorkerProfile = require("../models/WorkerProfile");
const generateToken = require("../utils/generateToken");

const register = async (req, res, next) => {
	try {
		const { name, email, password, role } = req.body;

		if (!name || !email || !password || !role) {
			return res.status(400).json({ message: "name, email, password, and role are required" });
		}

		if (!["client", "worker", "both"].includes(role)) {
			return res.status(400).json({ message: "Role must be client, worker, or both" });
		}

		const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
		if (existingUser) {
			return res.status(400).json({ message: "Email already in use" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await User.create({
			name,
			email: email.toLowerCase().trim(),
			password: hashedPassword,
			role,
		});

		if (["worker", "both"].includes(role)) {
			await WorkerProfile.create({ user: user._id });
		}

		return res.status(201).json({
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			token: generateToken(user._id),
		});
	} catch (error) {
		return next(error);
	}
};

const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email: (email || "").toLowerCase().trim() });
		const passwordMatches = user ? await bcrypt.compare(password || "", user.password) : false;

		if (!user || !passwordMatches) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		return res.status(200).json({
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			avatar: user.avatar,
			token: generateToken(user._id),
		});
	} catch (error) {
		return next(error);
	}
};

const getMe = async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "Not authorized" });
		}

		return res.status(200).json(req.user);
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	register,
	login,
	getMe,
};
