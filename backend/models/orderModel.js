const { pool, isMySQL, fallbackStore } = require('../config/db');

const VALID_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const OrderModel = {
  VALID_STATUSES,

  /**
   * Creates an order inside a transaction after validating availability
   * and recalculating the total in Indian Rupees (₹) from trusted database prices.
   */
  async createOrder({ userId, items, deliveryAddress, promoCode = null, paymentMethod = 'COD' }) {
    if (!Array.isArray(items) || items.length === 0) {
      const err = new Error('Your cart is empty. Please add at least one item.');
      err.statusCode = 400;
      throw err;
    }

    if (!deliveryAddress || String(deliveryAddress).trim().length < 5) {
      const err = new Error('Please provide a valid delivery address (at least 5 characters).');
      err.statusCode = 400;
      throw err;
    }

    const payMethod = paymentMethod ? String(paymentMethod).trim().toUpperCase() : 'COD';
    const payStatus = payMethod === 'UPI' ? 'Paid' : 'Pending (Pay on Delivery)';

    if (isMySQL()) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        let subtotal = 0;
        const verifiedItems = [];

        for (const entry of items) {
          const menuItemId = Number(entry.menu_item_id || entry.id);
          const quantity = Number(entry.quantity);

          if (!Number.isInteger(menuItemId) || menuItemId <= 0 || !Number.isInteger(quantity) || quantity <= 0 || quantity > 50) {
            const err = new Error('Invalid product ID or quantity in order.');
            err.statusCode = 400;
            throw err;
          }

          const [rows] = await conn.execute(
            'SELECT id, name, price, is_available FROM menu_items WHERE id = ? FOR UPDATE',
            [menuItemId]
          );
          const dbItem = rows[0];
          if (!dbItem) {
            const err = new Error(`Menu item #${menuItemId} does not exist.`);
            err.statusCode = 400;
            throw err;
          }
          if (!dbItem.is_available) {
            const err = new Error(`"${dbItem.name}" is currently unavailable and cannot be ordered.`);
            err.statusCode = 400;
            throw err;
          }

          const unitPrice = Number(dbItem.price);
          subtotal += unitPrice * quantity;
          verifiedItems.push({
            menu_item_id: dbItem.id,
            name: dbItem.name,
            quantity,
            unit_price: unitPrice
          });
        }

        // Apply server-trusted delivery fee and promo logic (in INR ₹)
        let discount = 0;
        const normalizedPromo = promoCode ? String(promoCode).trim().toUpperCase() : '';
        if (normalizedPromo === 'GRILL20' || normalizedPromo === 'BUNORA20' || normalizedPromo === 'RUSH20' || normalizedPromo === 'KING20') {
          discount = Number((subtotal * 0.20).toFixed(2));
        } else if (normalizedPromo === 'FRESH50' || normalizedPromo === 'BITE50' || normalizedPromo === 'WHOPPER50' || normalizedPromo === 'WHOPPER3') {
          discount = Math.min(50.00, subtotal);
        }
        const freeDeliveryThreshold = 399.00;
        const deliveryFee = (subtotal >= freeDeliveryThreshold || normalizedPromo === 'FREEDEL') ? 0 : 49.00;
        const totalAmount = Number(Math.max(0, subtotal - discount + deliveryFee).toFixed(2));

        let orderResult;
        try {
          [orderResult] = await conn.execute(
            'INSERT INTO orders (user_id, total_amount, delivery_address, status, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?)',
            [Number(userId), totalAmount, String(deliveryAddress).trim(), 'Pending', payMethod, payStatus]
          );
        } catch (_) {
          [orderResult] = await conn.execute(
            'INSERT INTO orders (user_id, total_amount, delivery_address, status) VALUES (?, ?, ?, ?)',
            [Number(userId), totalAmount, String(deliveryAddress).trim(), 'Pending']
          );
        }

        const orderId = orderResult.insertId;

        for (const vi of verifiedItems) {
          await conn.execute(
            'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
            [orderId, vi.menu_item_id, vi.quantity, vi.unit_price]
          );
        }

        await conn.commit();
        return this.getOrderById(orderId);
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    }

    // Fallback in-memory transaction (INR ₹)
    let subtotal = 0;
    const verifiedItems = [];

    for (const entry of items) {
      const menuItemId = Number(entry.menu_item_id || entry.id);
      const quantity = Number(entry.quantity);

      if (!Number.isInteger(menuItemId) || menuItemId <= 0 || !Number.isInteger(quantity) || quantity <= 0 || quantity > 50) {
        const err = new Error('Invalid product ID or quantity in order.');
        err.statusCode = 400;
        throw err;
      }

      const dbItem = fallbackStore.menu_items.find((m) => m.id === menuItemId);
      if (!dbItem) {
        const err = new Error(`Menu item #${menuItemId} does not exist.`);
        err.statusCode = 400;
        throw err;
      }
      if (!dbItem.is_available) {
        const err = new Error(`"${dbItem.name}" is currently unavailable and cannot be ordered.`);
        err.statusCode = 400;
        throw err;
      }

      const unitPrice = Number(dbItem.price);
      subtotal += unitPrice * quantity;
      verifiedItems.push({
        menu_item_id: dbItem.id,
        name: dbItem.name,
        quantity,
        unit_price: unitPrice
      });
    }

    let discount = 0;
    const normalizedPromo = promoCode ? String(promoCode).trim().toUpperCase() : '';
    if (normalizedPromo === 'GRILL20' || normalizedPromo === 'BUNORA20' || normalizedPromo === 'RUSH20' || normalizedPromo === 'KING20') {
      discount = Number((subtotal * 0.20).toFixed(2));
    } else if (normalizedPromo === 'FRESH50' || normalizedPromo === 'BITE50' || normalizedPromo === 'WHOPPER50' || normalizedPromo === 'WHOPPER3') {
      discount = Math.min(50.00, subtotal);
    }
    const freeDeliveryThreshold = 399.00;
    const deliveryFee = (subtotal >= freeDeliveryThreshold || normalizedPromo === 'FREEDEL') ? 0 : 49.00;
    const totalAmount = Number(Math.max(0, subtotal - discount + deliveryFee).toFixed(2));

    const newOrderId = fallbackStore.orders.reduce((max, o) => Math.max(max, o.id), 1000) + 1;
    const newOrder = {
      id: newOrderId,
      user_id: Number(userId),
      total_amount: totalAmount,
      delivery_address: String(deliveryAddress).trim(),
      payment_method: payMethod,
      payment_status: payStatus,
      status: 'Pending',
      created_at: new Date().toISOString()
    };
    fallbackStore.orders.unshift(newOrder);

    let nextItemId = fallbackStore.order_items.reduce((max, oi) => Math.max(max, oi.id), 0) + 1;
    for (const vi of verifiedItems) {
      fallbackStore.order_items.push({
        id: nextItemId++,
        order_id: newOrderId,
        menu_item_id: vi.menu_item_id,
        quantity: vi.quantity,
        unit_price: vi.unit_price
      });
    }

    return this.getOrderById(newOrderId);
  },

  async getOrderById(orderId) {
    const numId = Number(orderId);
    if (isMySQL()) {
      let orders;
      try {
        [orders] = await pool.execute(
          `SELECT o.id, o.user_id, u.name AS customer_name, u.email AS customer_email,
                  o.total_amount, o.delivery_address, o.status,
                  COALESCE(o.payment_method, 'COD') AS payment_method,
                  COALESCE(o.payment_status, IF(o.status = 'Delivered', 'Paid', 'Pending (Pay on Delivery)')) AS payment_status,
                  o.created_at
           FROM orders o
           JOIN users u ON o.user_id = u.id
           WHERE o.id = ? LIMIT 1`,
          [numId]
        );
      } catch (_) {
        [orders] = await pool.execute(
          `SELECT o.id, o.user_id, u.name AS customer_name, u.email AS customer_email,
                  o.total_amount, o.delivery_address, o.status, o.created_at
           FROM orders o
           JOIN users u ON o.user_id = u.id
           WHERE o.id = ? LIMIT 1`,
          [numId]
        );
      }
      if (!orders[0]) return null;

      const [items] = await pool.execute(
        `SELECT oi.id, oi.order_id, oi.menu_item_id, m.name, m.image_url,
                oi.quantity, oi.unit_price
         FROM order_items oi
         JOIN menu_items m ON oi.menu_item_id = m.id
         WHERE oi.order_id = ?`,
        [numId]
      );

      const payMethod = orders[0].payment_method || 'COD';
      const payStatus = orders[0].payment_status || (orders[0].status === 'Delivered' ? 'Paid' : (payMethod === 'UPI' ? 'Paid' : 'Pending (Pay on Delivery)'));

      return {
        ...orders[0],
        total_amount: Number(orders[0].total_amount),
        payment_method: payMethod,
        payment_status: payStatus,
        items: items.map((i) => ({
          ...i,
          unit_price: Number(i.unit_price)
        }))
      };
    }

    const order = fallbackStore.orders.find((o) => o.id === numId);
    if (!order) return null;
    const user = fallbackStore.users.find((u) => u.id === order.user_id);
    const items = fallbackStore.order_items
      .filter((oi) => oi.order_id === numId)
      .map((oi) => {
        const menu = fallbackStore.menu_items.find((m) => m.id === oi.menu_item_id);
        return {
          ...oi,
          name: menu ? menu.name : `Item #${oi.menu_item_id}`,
          image_url: menu ? menu.image_url : null,
          unit_price: Number(oi.unit_price)
        };
      });

    const fallbackPayMethod = order.payment_method || 'COD';
    const fallbackPayStatus = order.payment_status || (order.status === 'Delivered' ? 'Paid' : (fallbackPayMethod === 'UPI' ? 'Paid' : 'Pending (Pay on Delivery)'));

    return {
      ...order,
      customer_name: user ? user.name : 'Customer',
      customer_email: user ? user.email : '',
      total_amount: Number(order.total_amount),
      payment_method: fallbackPayMethod,
      payment_status: fallbackPayStatus,
      items
    };
  },

  async getOrdersByUser(userId) {
    const numUser = Number(userId);
    if (isMySQL()) {
      const [orders] = await pool.execute(
        `SELECT id FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
        [numUser]
      );
      const detailed = [];
      for (const row of orders) {
        const full = await this.getOrderById(row.id);
        if (full) detailed.push(full);
      }
      return detailed;
    }

    const userOrders = fallbackStore.orders
      .filter((o) => o.user_id === numUser)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const detailed = [];
    for (const o of userOrders) {
      detailed.push(await this.getOrderById(o.id));
    }
    return detailed;
  },

  async getAllOrders() {
    if (isMySQL()) {
      const [orders] = await pool.execute('SELECT id FROM orders ORDER BY created_at DESC');
      const detailed = [];
      for (const row of orders) {
        const full = await this.getOrderById(row.id);
        if (full) detailed.push(full);
      }
      return detailed;
    }

    const sorted = [...fallbackStore.orders].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    const detailed = [];
    for (const o of sorted) {
      detailed.push(await this.getOrderById(o.id));
    }
    return detailed;
  },

  async updateStatus(orderId, newStatus) {
    if (!VALID_STATUSES.includes(newStatus)) {
      const err = new Error(`Invalid order status "${newStatus}". Allowed values: ${VALID_STATUSES.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const numId = Number(orderId);
    if (isMySQL()) {
      let result;
      try {
        if (newStatus === 'Delivered') {
          [result] = await pool.execute(
            "UPDATE orders SET status = ?, payment_status = 'Paid' WHERE id = ?",
            [newStatus, numId]
          );
        } else if (newStatus === 'Cancelled') {
          [result] = await pool.execute(
            "UPDATE orders SET status = ?, payment_status = 'Cancelled' WHERE id = ?",
            [newStatus, numId]
          );
        } else {
          [result] = await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [newStatus, numId]
          );
        }
      } catch (_) {
        [result] = await pool.execute(
          'UPDATE orders SET status = ? WHERE id = ?',
          [newStatus, numId]
        );
      }
      if (result.affectedRows === 0) return null;
      return this.getOrderById(numId);
    }

    const order = fallbackStore.orders.find((o) => o.id === numId);
    if (!order) return null;
    order.status = newStatus;
    if (newStatus === 'Delivered') {
      order.payment_status = 'Paid';
    } else if (newStatus === 'Cancelled') {
      order.payment_status = 'Cancelled';
    }
    return this.getOrderById(numId);
  }
};

module.exports = OrderModel;
