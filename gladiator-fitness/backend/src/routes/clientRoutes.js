const router = require('express').Router();
const ctrl = require('../controllers/clientController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken, authorizeRoles('admin'));

router.get('/', ctrl.listClients);
router.get('/:id', ctrl.getClient);
router.post('/', ctrl.createClient);
router.put('/:id', ctrl.updateClient);
router.patch('/:id/deactivate', ctrl.deactivateClient);
router.patch('/:id/activate', ctrl.activateClient);

module.exports = router;
