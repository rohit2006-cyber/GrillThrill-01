const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menuController');

router.get('/menu', MenuController.getMenu);
router.get('/categories', MenuController.getCategories);

module.exports = router;
