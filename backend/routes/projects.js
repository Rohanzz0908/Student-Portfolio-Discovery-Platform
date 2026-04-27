const express = require('express');
const router = express.Router();
const {
  getMyProjects,
  addProject,
  updateProject,
  deleteProject,
  fetchGitHubRepo,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMyProjects);
router.post('/', protect, addProject);
router.get('/github/:owner/:repo', protect, fetchGitHubRepo);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;
