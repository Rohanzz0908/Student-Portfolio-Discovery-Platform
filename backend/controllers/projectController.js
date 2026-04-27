const Project = require('../models/Project');
const Profile = require('../models/Profile');
const axios = require('axios');

// @desc  Get all projects for logged-in user
// @route GET /api/projects
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Add a project
// @route POST /api/projects
const addProject = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const project = await Project.create({
      ...req.body,
      userId: req.user._id,
      profileId: profile._id,
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update a project
// @route PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    Object.assign(project, req.body);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a project
// @route DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Fetch GitHub repo info
// @route GET /api/projects/github/:owner/:repo
const fetchGitHubRepo = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
    
    const { name, description, stargazers_count, forks_count, language, html_url, owner: repoOwnerInfo } = response.data;
    
    res.json({
      title: name,
      description: description || '',
      stars: stargazers_count,
      forks: forks_count,
      language,
      url: html_url,
      owner: repoOwnerInfo.login
    });
  } catch (error) {
    res.status(500).json({ message: 'GitHub repository not found or API limit reached.' });
  }
};

module.exports = { getMyProjects, addProject, updateProject, deleteProject, fetchGitHubRepo };
