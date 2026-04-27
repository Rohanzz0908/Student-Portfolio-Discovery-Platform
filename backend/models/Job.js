const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, default: 'Remote' },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Freelance'], default: 'Full-time' },
    salary: { type: String, default: 'Competitive' },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    applicants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { 
          type: String, 
          enum: ['Applied', 'Shortlisted', 'Rejected', 'Hired'], 
          default: 'Applied' 
        },
        appliedAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', JobSchema);
