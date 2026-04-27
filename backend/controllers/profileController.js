const Profile = require('../models/Profile');
const Project = require('../models/Project');
const Certification = require('../models/Certification');

// @desc  Get my profile
// @route GET /api/profiles/me
const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id }).populate(
      'userId',
      'username email role'
    );
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update my profile
// @route PUT /api/profiles/me
const updateMyProfile = async (req, res) => {
  try {
    const updates = req.body;
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    ).populate('userId', 'username email role');
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Publish/Unpublish profile
// @route PUT /api/profiles/publish
const togglePublish = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.publishedStatus = !profile.publishedStatus;
    await profile.save();
    res.json({ publishedStatus: profile.publishedStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all published profiles (with search & filter)
// @route GET /api/profiles/discover
const discoverProfiles = async (req, res) => {
  try {
    const { skills, search, page = 1, limit = 9 } = req.query;
    const query = { publishedStatus: true };

    if (skills) {
      const skillArray = skills.split(',').map((s) => s.trim());
      query.skills = { $in: skillArray.map((s) => new RegExp(s, 'i')) };
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
        { skills: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Profile.countDocuments(query);
    const profiles = await Profile.find(query)
      .populate('userId', 'username email role')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 });

    res.json({ profiles, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get a public profile by userId
// @route GET /api/profiles/:userId
const getPublicProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      userId: req.params.userId,
      publishedStatus: true,
    }).populate('userId', 'username email role');
    if (!profile) return res.status(404).json({ message: 'Profile not found or not published' });

    const projects = await Project.find({ userId: req.params.userId });
    const certifications = await Certification.find({ userId: req.params.userId });

    res.json({ profile, projects, certifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  togglePublish,
  discoverProfiles,
  getPublicProfile,
};
