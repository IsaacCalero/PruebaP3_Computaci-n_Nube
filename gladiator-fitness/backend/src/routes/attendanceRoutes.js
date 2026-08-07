const router = require('express').Router();
const ctrl = require('../controllers/attendanceController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.post('/checkin', authorizeRoles('admin'), ctrl.checkIn);
router.get('/', ctrl.listAttendances);

module.exports = router;
