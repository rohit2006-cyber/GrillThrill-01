const { pool, isMySQL, fallbackStore } = require('../config/db');

const MenuModel = {
  async getAllCategories() {
    if (isMySQL()) {
      const [rows] = await pool.execute('SELECT id, name FROM categories ORDER BY id ASC');
      return rows;
    }
    return [...fallbackStore.categories].sort((a, b) => a.id - b.id);
  },

  async getAllMenuItems({ categoryId = null, onlyAvailable = false } = {}) {
    if (isMySQL()) {
      let sql = `
        SELECT m.id, m.category_id, c.name AS category_name, m.name, m.description,
               m.price, m.image_url, m.badge, m.calories, m.is_available, m.created_at
        FROM menu_items m
        JOIN categories c ON m.category_id = c.id
        WHERE 1=1
      `;
      const params = [];
      if (categoryId) {
        sql += ' AND m.category_id = ?';
        params.push(Number(categoryId));
      }
      if (onlyAvailable) {
        sql += ' AND m.is_available = TRUE';
      }
      sql += ' ORDER BY m.category_id ASC, m.id ASC';
      const [rows] = await pool.execute(sql, params);
      return rows.map((r) => ({
        ...r,
        price: Number(r.price),
        is_available: Boolean(r.is_available)
      }));
    }

    const catMap = new Map(fallbackStore.categories.map((c) => [c.id, c.name]));
    return fallbackStore.menu_items
      .filter((item) => {
        if (categoryId && item.category_id !== Number(categoryId)) return false;
        if (onlyAvailable && !item.is_available) return false;
        return true;
      })
      .map((item) => ({
        ...item,
        price: Number(item.price),
        is_available: Boolean(item.is_available),
        category_name: catMap.get(item.category_id) || 'Menu'
      }));
  },

  async getById(id) {
    const numId = Number(id);
    if (isMySQL()) {
      const [rows] = await pool.execute(
        `SELECT m.id, m.category_id, c.name AS category_name, m.name, m.description,
                m.price, m.image_url, m.badge, m.calories, m.is_available, m.created_at
         FROM menu_items m
         JOIN categories c ON m.category_id = c.id
         WHERE m.id = ? LIMIT 1`,
        [numId]
      );
      if (!rows[0]) return null;
      return {
        ...rows[0],
        price: Number(rows[0].price),
        is_available: Boolean(rows[0].is_available)
      };
    }

    const item = fallbackStore.menu_items.find((m) => m.id === numId);
    if (!item) return null;
    const cat = fallbackStore.categories.find((c) => c.id === item.category_id);
    return {
      ...item,
      price: Number(item.price),
      is_available: Boolean(item.is_available),
      category_name: cat ? cat.name : 'Menu'
    };
  },

  async create(data) {
    const categoryId = Number(data.category_id);
    const name = String(data.name).trim();
    const description = String(data.description).trim();
    const price = Number(Number(data.price).toFixed(2));
    const imageUrl = data.image_url ? String(data.image_url).trim() : null;
    const badge = data.badge ? String(data.badge).trim() : null;
    const calories = data.calories ? Number(data.calories) : null;
    const isAvailable = data.is_available === undefined ? true : Boolean(data.is_available);

    if (isMySQL()) {
      const [result] = await pool.execute(
        `INSERT INTO menu_items (category_id, name, description, price, image_url, badge, calories, is_available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [categoryId, name, description, price, imageUrl, badge, calories, isAvailable]
      );
      return this.getById(result.insertId);
    }

    const newId = fallbackStore.menu_items.reduce((max, m) => Math.max(max, m.id), 0) + 1;
    const newItem = {
      id: newId,
      category_id: categoryId,
      name,
      description,
      price,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      badge,
      calories,
      is_available: isAvailable,
      created_at: new Date().toISOString()
    };
    fallbackStore.menu_items.push(newItem);
    return this.getById(newId);
  },

  async update(id, updates) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const categoryId = updates.category_id !== undefined ? Number(updates.category_id) : existing.category_id;
    const name = updates.name !== undefined ? String(updates.name).trim() : existing.name;
    const description = updates.description !== undefined ? String(updates.description).trim() : existing.description;
    const price = updates.price !== undefined ? Number(Number(updates.price).toFixed(2)) : existing.price;
    const imageUrl = updates.image_url !== undefined ? (updates.image_url ? String(updates.image_url).trim() : null) : existing.image_url;
    const badge = updates.badge !== undefined ? (updates.badge ? String(updates.badge).trim() : null) : existing.badge;
    const calories = updates.calories !== undefined ? (updates.calories ? Number(updates.calories) : null) : existing.calories;
    const isAvailable = updates.is_available !== undefined ? Boolean(updates.is_available) : existing.is_available;

    if (isMySQL()) {
      await pool.execute(
        `UPDATE menu_items
         SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?, badge = ?, calories = ?, is_available = ?
         WHERE id = ?`,
        [categoryId, name, description, price, imageUrl, badge, calories, isAvailable, Number(id)]
      );
      return this.getById(id);
    }

    const index = fallbackStore.menu_items.findIndex((m) => m.id === Number(id));
    if (index === -1) return null;
    fallbackStore.menu_items[index] = {
      ...fallbackStore.menu_items[index],
      category_id: categoryId,
      name,
      description,
      price,
      image_url: imageUrl,
      badge,
      calories,
      is_available: isAvailable
    };
    return this.getById(id);
  },

  async delete(id) {
    const numId = Number(id);
    if (isMySQL()) {
      const [result] = await pool.execute('DELETE FROM menu_items WHERE id = ?', [numId]);
      return result.affectedRows > 0;
    }

    const index = fallbackStore.menu_items.findIndex((m) => m.id === numId);
    if (index === -1) return false;
    fallbackStore.menu_items.splice(index, 1);
    return true;
  }
};

module.exports = MenuModel;
