const router = require('express').Router();
const { getMetrics } = require('../controllers/dashboardController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.get('/metrics', verifyToken, authorizeRoles('admin'), getMetrics);

module.exports = router;
