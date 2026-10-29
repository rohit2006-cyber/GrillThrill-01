const { pool, isMySQL, fallbackStore } = require('../config/db');

const UserModel = {
  async findByEmail(email) {
    const normalized = String(email).trim().toLowerCase();
    if (isMySQL()) {
      const [rows] = await pool.execute(
        'SELECT id, name, email, password_hash, role, created_at FROM users WHERE LOWER(email) = ? LIMIT 1',
        [normalized]
      );
      return rows[0] || null;
    }
    return fallbackStore.users.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  async findById(id) {
    const numId = Number(id);
    if (isMySQL()) {
      const [rows] = await pool.execute(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
        [numId]
      );
      return rows[0] || null;
    }
    const user = fallbackStore.users.find((u) => u.id === numId);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async create({ name, email, passwordHash, role = 'customer' }) {
    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const validRole = role === 'admin' ? 'admin' : 'customer';

    if (isMySQL()) {
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [cleanName, cleanEmail, passwordHash, validRole]
      );
      return {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        role: validRole,
        created_at: new Date().toISOString()
      };
    }

    const newId = fallbackStore.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    const newUser = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      password_hash: passwordHash,
      role: validRole,
      created_at: new Date().toISOString()
    };
    fallbackStore.users.push(newUser);
    const { password_hash, ...safeUser } = newUser;
    return safeUser;
  }
};

module.exports = UserModel;
