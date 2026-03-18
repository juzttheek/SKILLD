const express = require("express");
const {
  sendMessage,
  getConversation,
  getConversationList,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/conversations", protect, getConversationList);
router.get("/conversation/:otherUserId", protect, getConversation);
router.get("/:otherUserId", protect, getConversation);

module.exports = router;
