const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.use(requireAdmin);

router.get('/menu', AdminController.listMenu);
router.post('/menu', AdminController.addMenuItem);
router.patch('/menu/:id', AdminController.updateMenuItem);
router.delete('/menu/:id', AdminController.deleteMenuItem);

router.get('/orders', AdminController.listOrders);
router.patch('/orders/:id/status', AdminController.updateOrderStatus);

module.exports = router;
