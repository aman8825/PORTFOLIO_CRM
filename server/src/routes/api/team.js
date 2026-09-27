const express = require('express');
const router = express.Router();
const { getTeam, inviteTeamMember, updateTeamMember, deleteTeamMember } = require('../../controllers/teamController');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);
router.use(authorize('superadmin'));

router.route('/')
  .get(getTeam)
  .post(inviteTeamMember);

router.route('/:id')
  .put(updateTeamMember)
  .delete(deleteTeamMember);

module.exports = router;
