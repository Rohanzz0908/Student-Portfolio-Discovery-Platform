const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: { type: String, default: '' },
    technologies: [{ type: String }],
    githubLink: { type: String, default: '' },
    repoOwner: { type: String, default: '' },
    liveLink: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    images: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);
