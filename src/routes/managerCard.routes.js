const express = require('express');
const router = express.Router();
const controller = require('../controllers/managerCard.controller');

router.post('/', controller.createManagerCard);
router.post('/:id/publish', controller.publishManagerCard);
router.delete('/:id', controller.deleteManagerCard);
router.get('/', controller.getAllManagerCards);
router.get('/user/:userId', controller.getUserManagerCards);

module.exports = router;
