const router = require('express').Router();
const ctrl = require('../controllers/membershipTypeController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', ctrl.listMembershipTypes);
router.post('/', authorizeRoles('admin'), ctrl.createMembershipType);
router.put('/:id', authorizeRoles('admin'), ctrl.updateMembershipType);
router.delete('/:id', authorizeRoles('admin'), ctrl.deleteMembershipType);

module.exports = router;
