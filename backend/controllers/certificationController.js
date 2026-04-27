const Certification = require('../models/Certification');
const Profile = require('../models/Profile');

// @desc  Get my certifications
// @route GET /api/certifications
const getMyCertifications = async (req, res) => {
  try {
    const certs = await Certification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Add certification
// @route POST /api/certifications
const addCertification = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const cert = await Certification.create({
      ...req.body,
      userId: req.user._id,
      profileId: profile._id,
    });
    res.status(201).json(cert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update certification
// @route PUT /api/certifications/:id
const updateCertification = async (req, res) => {
  try {
    const cert = await Certification.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cert) return res.status(404).json({ message: 'Certification not found' });

    Object.assign(cert, req.body);
    await cert.save();
    res.json(cert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete certification
// @route DELETE /api/certifications/:id
const deleteCertification = async (req, res) => {
  try {
    const cert = await Certification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!cert) return res.status(404).json({ message: 'Certification not found' });
    res.json({ message: 'Certification removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyCertifications, addCertification, updateCertification, deleteCertification };
