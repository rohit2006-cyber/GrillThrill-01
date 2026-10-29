const MenuModel = require('../models/menuModel');

const MenuController = {
  async getMenu(req, res) {
    try {
      const categoryId = req.query.category_id || null;
      const items = await MenuModel.getAllMenuItems({
        categoryId,
        onlyAvailable: false // Return all items so frontend can clearly display "Unavailable" badge per Section 6.2
      });
      return res.json({
        success: true,
        count: items.length,
        items
      });
    } catch (error) {
      console.error('getMenu error:', error);
      return res.status(500).json({
        success: false,
        message: 'Unable to load menu items.'
      });
    }
  },

  async getCategories(req, res) {
    try {
      const categories = await MenuModel.getAllCategories();
      return res.json({
        success: true,
        categories
      });
    } catch (error) {
      console.error('getCategories error:', error);
      return res.status(500).json({
        success: false,
        message: 'Unable to load categories.'
      });
    }
  }
};

module.exports = MenuController;
