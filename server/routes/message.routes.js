const express = require("express");
const { body } = require("express-validator");
const {
  sendMessage,
  getConversation,
  getConversationList,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const sendMessageValidation = [
  body("receiverId").isMongoId().withMessage("Valid receiverId is required"),
  body("content")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message text must be between 1 and 2000 characters"),
  body("text")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message text must be between 1 and 2000 characters"),
  body().custom((value) => {
    const messageText = value?.content || value?.text;
    if (!messageText || !String(messageText).trim()) {
      throw new Error("Message content is required");
    }
    return true;
  }),
];

router.post("/", protect, sendMessageValidation, validateRequest, sendMessage);
router.get("/conversations", protect, getConversationList);
router.get("/conversation/:otherUserId", protect, getConversation);
router.get("/:otherUserId", protect, getConversation);

module.exports = router;
