const express = require("express");
const Message = require("../models/message.model.js");
const router = express.Router();

router.post("/send", async (req, res) => {
  const { sender, receiver, content } = req.body;
  try {
    const message = new Message({ sender, receiver, content });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

router.get("/messages/:userId", async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.params.userId }).populate("sender", "username");
    res.json(messages);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
