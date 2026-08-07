const router = require('express').Router();
const { listPayments } = require('../controllers/paymentController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.get('/', verifyToken, authorizeRoles('admin', 'cliente'), listPayments);

module.exports = router;
