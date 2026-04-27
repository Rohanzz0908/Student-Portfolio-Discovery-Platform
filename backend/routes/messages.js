const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getChats } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect); // All message routes are protected

router.post('/', sendMessage);
router.get('/chats', getChats);
router.get('/:userId', getConversation);

module.exports = router;
