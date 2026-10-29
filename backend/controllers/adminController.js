const MenuModel = require('../models/menuModel');
const OrderModel = require('../models/orderModel');

const AdminController = {
  async listMenu(req, res) {
    try {
      const items = await MenuModel.getAllMenuItems({ onlyAvailable: false });
      return res.json({
        success: true,
        count: items.length,
        items
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Unable to fetch admin menu items.'
      });
    }
  },

  async addMenuItem(req, res) {
    try {
      const { category_id, name, description, price, image_url, badge, calories, is_available } = req.body;

      if (!category_id || !name || !description || price === undefined || Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Category, name, description, and a valid non-negative price are required.'
        });
      }

      const item = await MenuModel.create({
        category_id,
        name,
        description,
        price,
        image_url,
        badge,
        calories,
        is_available
      });

      return res.status(201).json({
        success: true,
        message: `"${item.name}" has been added to the menu.`,
        item
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Unable to add menu item.'
      });
    }
  },

  async updateMenuItem(req, res) {
    try {
      const { id } = req.params;
      const updated = await MenuModel.update(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Menu item #${id} not found.`
        });
      }

      return res.json({
        success: true,
        message: `"${updated.name}" updated successfully.`,
        item: updated
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Unable to update menu item.'
      });
    }
  },

  async deleteMenuItem(req, res) {
    try {
      const { id } = req.params;
      const deleted = await MenuModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Menu item #${id} not found.`
        });
      }

      return res.json({
        success: true,
        message: `Menu item #${id} removed from menu.`
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete this item because it is referenced by existing orders. Mark it as Unavailable instead.'
      });
    }
  },

  async listOrders(req, res) {
    try {
      const orders = await OrderModel.getAllOrders();
      return res.json({
        success: true,
        count: orders.length,
        orders
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Unable to load customer orders.'
      });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await OrderModel.updateStatus(id, status);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Order #${id} not found.`
        });
      }

      return res.json({
        success: true,
        message: `Order #${id} status updated to "${status}".`,
        order: updated
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Unable to update order status.'
      });
    }
  }
};

module.exports = AdminController;
