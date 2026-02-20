const express = require('express');
const router = express.Router();
const controller = require('../controllers/managerCard.controller');

router.get('/', controller.getAllManagerCards);
router.post('/', controller.createManagerCard);
router.patch('/:id/publish', controller.publishManagerCard);
router.delete('/:id', controller.deleteManagerCard);
router.get('/user/:userId', controller.getUserManagerCards);

module.exports = router;
