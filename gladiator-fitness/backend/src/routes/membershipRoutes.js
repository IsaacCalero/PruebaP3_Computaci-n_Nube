const router = require('express').Router();
const ctrl = require('../controllers/membershipController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', ctrl.listMemberships);
router.post('/', authorizeRoles('admin'), ctrl.createMembership);

module.exports = router;
