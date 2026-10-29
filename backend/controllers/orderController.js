const OrderModel = require('../models/orderModel');

const OrderController = {
  async placeOrder(req, res) {
    try {
      const userId = req.user.id;
      const { items, delivery_address, promo_code, payment_method } = req.body;

      const order = await OrderModel.createOrder({
        userId,
        items,
        deliveryAddress: delivery_address,
        promoCode: promo_code,
        paymentMethod: payment_method || 'COD'
      });

      return res.status(201).json({
        success: true,
        message: `Order #${order.id} placed successfully!`,
        order
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to place order.'
      });
    }
  },

  async getMyOrders(req, res) {
    try {
      const userId = req.user.id;
      const orders = await OrderModel.getOrdersByUser(userId);
      return res.json({
        success: true,
        count: orders.length,
        orders
      });
    } catch (error) {
      console.error('getMyOrders error:', error);
      return res.status(500).json({
        success: false,
        message: 'Unable to fetch your order history.'
      });
    }
  },

  async getOrderDetails(req, res) {
    try {
      const userId = req.user.id;
      const orderId = Number(req.params.id);
      if (!orderId || isNaN(orderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID.'
        });
      }

      const order = await OrderModel.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: `Order #${orderId} not found.`
        });
      }

      // Security check: Only the customer who placed the order or an administrator may view it
      if (req.user.role !== 'admin' && Number(order.user_id) !== Number(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own orders.'
        });
      }

      return res.json({
        success: true,
        order
      });
    } catch (error) {
      console.error('getOrderDetails error:', error);
      return res.status(500).json({
        success: false,
        message: 'Unable to fetch order details.'
      });
    }
  }
};

module.exports = OrderController;
