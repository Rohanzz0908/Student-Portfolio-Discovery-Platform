const express = require('express');
const router = express.Router();
const { getJobs, postJob, applyToJob, deleteJob, updateApplicantStatus } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getJobs);
router.post('/', protect, postJob);
router.post('/:id/apply', protect, applyToJob);
router.put('/:id/status', protect, updateApplicantStatus);
router.delete('/:id', protect, deleteJob);

module.exports = router;
