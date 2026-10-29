const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/', requireAuth, OrderController.placeOrder);
router.get('/', requireAuth, OrderController.getMyOrders);
router.get('/my-orders', requireAuth, OrderController.getMyOrders);
router.get('/:id', requireAuth, OrderController.getOrderDetails);

module.exports = router;
