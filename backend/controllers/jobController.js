const Job = require('../models/Job');
const Profile = require('../models/Profile');

// @desc  Get all jobs
// @route GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'username email')
      .populate('applicants.user', 'username email')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Post a new job (Recruiters only)
// @route POST /api/jobs
const postJob = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can post jobs' });
    }

    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Apply for a job (Students only)
// @route POST /api/jobs/:id/apply
const applyToJob = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can apply for jobs' });
    }

    // Check if profile is published
    const profile = await Profile.findOne({ userId: req.user._id, publishedStatus: true });
    if (!profile) {
      return res.status(403).json({ message: 'You must publish your profile first to apply for jobs' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if already applied
    const alreadyApplied = job.applicants.find(a => a.user.toString() === req.user._id.toString());
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    job.applicants.push({ user: req.user._id });
    await job.save();

    res.json({ message: 'Applied successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a job
// @route DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update applicant status
// @route PUT /api/jobs/:id/status
const updateApplicantStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applicant = job.applicants.find(a => a.user.toString() === userId);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    applicant.status = status;
    await job.save();

    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getJobs, postJob, applyToJob, deleteJob, updateApplicantStatus };
