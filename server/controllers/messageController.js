const Message = require("../models/Message");
const User = require("../models/User");

const buildConversationId = (userA, userB) => [userA.toString(), userB.toString()].sort().join("_");

const sendMessage = async (req, res, next) => {
	try {
		const { receiverId } = req.body;
		const content = req.body.content || req.body.text;

		if (!receiverId || !content) {
			return res.status(400).json({ message: "receiverId and content are required" });
		}

		if (receiverId.toString() === req.user._id.toString()) {
			return res.status(400).json({ message: "Cannot message yourself" });
		}

		const receiver = await User.findById(receiverId).select("_id");
		if (!receiver) {
			return res.status(404).json({ message: "Receiver not found" });
		}

		const conversationId = buildConversationId(req.user._id, receiverId);

		const message = await Message.create({
			sender: req.user._id,
			receiver: receiverId,
			content,
			conversationId,
		});

		return res.status(201).json(message);
	} catch (error) {
		return next(error);
	}
};

const getConversation = async (req, res, next) => {
	try {
		const { otherUserId } = req.params;
		const conversationId = buildConversationId(req.user._id, otherUserId);

		const messages = await Message.find({ conversationId })
			.sort({ createdAt: 1 })
			.populate("sender", "name avatar")
			.populate("receiver", "name avatar");

		await Message.updateMany(
			{
				conversationId,
				sender: otherUserId,
				receiver: req.user._id,
				isRead: false,
			},
			{ isRead: true }
		);

		return res.status(200).json(messages);
	} catch (error) {
		return next(error);
	}
};

const getConversationList = async (req, res, next) => {
	try {
		const userId = req.user._id.toString();

		const messages = await Message.find({
			$or: [{ sender: req.user._id }, { receiver: req.user._id }],
		})
			.sort({ createdAt: -1 })
			.lean();

		const latestByConversation = new Map();
		for (const message of messages) {
			if (!latestByConversation.has(message.conversationId)) {
				latestByConversation.set(message.conversationId, message);
			}
		}

		const latestMessages = Array.from(latestByConversation.values());
		const otherUserIds = latestMessages.map((message) => {
			const senderId = message.sender.toString();
			return senderId === userId ? message.receiver.toString() : senderId;
		});

		const users = await User.find({ _id: { $in: otherUserIds } }).select("name avatar").lean();
		const userMap = new Map(users.map((user) => [user._id.toString(), user]));

		const conversationList = latestMessages
			.map((message) => {
				const senderId = message.sender.toString();
				const otherUserId = senderId === userId ? message.receiver.toString() : senderId;
				const otherUser = userMap.get(otherUserId);

				return {
					conversationId: message.conversationId,
					otherUser: {
						_id: otherUserId,
						name: otherUser?.name || "Unknown User",
						avatar: otherUser?.avatar || "",
					},
					latestMessage: {
						content: message.content,
						createdAt: message.createdAt,
					},
				};
			})
			.sort((a, b) => new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt));

		return res.status(200).json(conversationList);
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	sendMessage,
	getConversation,
	getConversationList,
};
