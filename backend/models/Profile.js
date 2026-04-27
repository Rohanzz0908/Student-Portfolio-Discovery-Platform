const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    location: { type: String, default: '' },
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        from: String,
        to: String,
      },
    ],
    skills: [{ type: String }],
    experience: [
      {
        title: String,
        company: String,
        from: String,
        to: String,
        description: String,
      },
    ],
    portfolioLink: { type: String, default: '' },
    githubLink: { type: String, default: '' },
    githubUsername: { type: String, default: '' },
    linkedinLink: { type: String, default: '' },
    publishedStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', ProfileSchema);
