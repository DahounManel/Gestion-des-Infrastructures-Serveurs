const express = require('express');
const router = express.Router();
const rackController = require('../controllers/rack.controller');
const requireRole = require('../middleware/role');

router.get('/', rackController.getAll);
router.get('/:id', rackController.getById);

router.post('/', requireRole('superior'), rackController.create);
router.put('/:id', requireRole('superior'), rackController.update);
router.delete('/:id', requireRole('superior'), rackController.remove);

module.exports = router;
