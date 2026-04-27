const express = require('express');
const router = express.Router();
const {
  getMyCertifications,
  addCertification,
  updateCertification,
  deleteCertification,
} = require('../controllers/certificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMyCertifications);
router.post('/', protect, addCertification);
router.put('/:id', protect, updateCertification);
router.delete('/:id', protect, deleteCertification);

module.exports = router;
