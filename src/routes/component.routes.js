const express = require('express');
const router = express.Router();
const componentController = require('../controllers/component.controller');
const requireRole = require('../middleware/role');

router.get('/', componentController.getAll);
router.get('/:id', componentController.getById);
router.get('/:id/pdf', componentController.getPdf);

router.post('/', requireRole('superior'), componentController.create);
router.put('/:id', requireRole('superior'), componentController.update);
router.delete('/:id', requireRole('superior'), componentController.remove);

module.exports = router;
