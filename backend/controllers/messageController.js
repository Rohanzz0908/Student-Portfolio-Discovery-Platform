const Message = require('../models/Message');
const User = require('../models/User');

// @desc  Send a message
// @route POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });
    if (!receiverId) return res.status(400).json({ message: 'Receiver ID is required' });

    // Check if receiver exists
    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) return res.status(404).json({ message: 'Receiver not found' });

    // Messaging Rules:
    // 1. Student to Student is BLOCKED.
    if (req.user.role === 'student' && receiverUser.role === 'student') {
      return res.status(403).json({ message: 'Students cannot message each other.' });
    }
    
    // 2. Recruiter to Recruiter is BLOCKED.
    if (req.user.role === 'recruiter' && receiverUser.role === 'recruiter') {
      return res.status(403).json({ message: 'Recruiters cannot message each other.' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'username email role')
      .populate('receiver', 'username email role');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId.toString()).emit('new_message', populated);
      // Also notify the sender on other devices/tabs
      io.to(req.user._id.toString()).emit('new_message', populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get conversation between two users
// @route GET /api/messages/:userId
const getConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username role')
    .populate('receiver', 'username role');

    // Mark as read
    await Message.updateMany(
      { sender: otherUserId, receiver: req.user._id, read: false },
      { $set: { read: true } }
    );

    // Fetch partner info in case messages array is empty
    const partner = await User.findById(otherUserId).select('username email role');

    res.json({ messages, partner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all conversations for current user
// @route GET /api/messages/chats
const getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find unique users current user has messaged or received from
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    const chatPartners = new Set();
    const latestMessages = [];

    messages.forEach(m => {
      const partnerId = m.sender.toString() === userId.toString() ? m.receiver.toString() : m.sender.toString();
      if (!chatPartners.has(partnerId)) {
        chatPartners.add(partnerId);
        latestMessages.push(m);
      }
    });

    // Populate user details for partners
    const populated = await Promise.all(latestMessages.map(async (m) => {
      const partnerId = m.sender.toString() === userId.toString() ? m.receiver : m.sender;
      const partner = await User.findById(partnerId).select('username email role');
      return {
        lastMessage: m,
        partner
      };
    }));

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getConversation, getChats };
