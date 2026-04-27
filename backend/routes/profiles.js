const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  togglePublish,
  discoverProfiles,
  getPublicProfile,
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.get('/discover', discoverProfiles);
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.put('/publish', protect, togglePublish);
router.get('/:userId', getPublicProfile);

module.exports = router;
