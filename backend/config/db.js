const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT) || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
let dbName = process.env.DB_NAME || 'grillthrill_db';

let pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

let isMySQLConnected = false;

// In-memory fallback dataset in Indian Rupees (₹ INR)
const fallbackStore = {
  users: [
    {
      id: 1,
      name: 'Crown Administrator',
      email: 'admin@burgerking.edu',
      password_hash: bcrypt.hashSync('Admin@123', 10),
      role: 'admin',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Aarav Sharma',
      email: 'customer@burgerking.edu',
      password_hash: bcrypt.hashSync('Customer@123', 10),
      role: 'customer',
      created_at: new Date().toISOString()
    }
  ],
  categories: [
    { id: 1, name: 'Burgers' },
    { id: 2, name: 'Fries and Sides' },
    { id: 3, name: 'Beverages' },
    { id: 4, name: 'Desserts' },
    { id: 5, name: 'Combos' }
  ],
  menu_items: [
    {
      id: 1,
      category_id: 1,
      name: 'Flame-Grilled Whopper',
      description: 'A quarter-pound of savory flame-grilled patty topped with juicy tomatoes, fresh lettuce, creamy mayo, ketchup, crunchy pickles, and sliced onions on a toasted sesame seed bun.',
      price: 199.00,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      badge: 'Bestseller',
      calories: 670,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      category_id: 1,
      name: 'Double Bacon King',
      description: 'Two signature flame-grilled patties topped with thick-cut smoked bacon, melted cheese slices, ketchup, and creamy mayo on a soft toasted sesame bun.',
      price: 289.00,
      image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
      badge: 'Chef Special',
      calories: 1150,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      category_id: 1,
      name: 'Crispy Royal Chicken Sandwich',
      description: 'Crispy spiced chicken breast filet topped with savory royal sauce, crunchy pickles, and fresh shredded iceberg lettuce on a toasted potato bun.',
      price: 169.00,
      image_url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80',
      badge: 'Popular',
      calories: 610,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      category_id: 1,
      name: 'Fiery Jalapeño Melt Burger',
      description: 'Flame-grilled patty layered with pepper jack cheese, crispy jalapeño slices, smoky chipotle aioli, and fresh lettuce on a toasted artisan bun.',
      price: 189.00,
      image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80',
      badge: 'Spicy',
      calories: 720,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      category_id: 1,
      name: 'Plant-Based Impossible Veg Whopper',
      description: '100% Whopper taste with a flame-grilled plant-based patty topped with juicy tomatoes, fresh lettuce, eggless mayo, ketchup, pickles, and sliced onions on a sesame bun.',
      price: 179.00,
      image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
      badge: 'Plant-Based',
      calories: 630,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      category_id: 1,
      name: 'Smokehouse BBQ Brisket Burger',
      description: 'Flame-grilled patty topped with slow-smoked pulled meat, crispy fried onion strings, aged cheddar cheese, and tangy Hickory BBQ sauce.',
      price: 299.00,
      image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
      badge: 'Limited Time',
      calories: 940,
      is_available: false,
      created_at: new Date().toISOString()
    },
    {
      id: 7,
      category_id: 2,
      name: 'Classic Salted King Fries',
      description: 'Piping hot, thick-cut golden French fries, crispy on the outside and fluffy on the inside, lightly dusted with sea salt.',
      price: 99.00,
      image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
      badge: 'Fan Favorite',
      calories: 380,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 8,
      category_id: 2,
      name: 'Golden Crunchy Onion Rings',
      description: 'Freshly battered whole-cut sweet onion rings fried to golden perfection and served with signature zesty dipping sauce.',
      price: 119.00,
      image_url: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80',
      badge: null,
      calories: 410,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 9,
      category_id: 2,
      name: '8 Pc. Crispy Chicken Fries',
      description: 'Tender white meat chicken strips shaped like fries, coated in a crispy herb-seasoned breading with dipping sauce.',
      price: 149.00,
      image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
      badge: 'Kids Love It',
      calories: 290,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 10,
      category_id: 2,
      name: 'Loaded Cheesy Bacon Tots',
      description: 'Bite-sized crispy potato crowns drizzled with warm nacho cheddar cheese sauce and seasoned savory toppings.',
      price: 139.00,
      image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
      badge: 'New',
      calories: 490,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 11,
      category_id: 3,
      name: 'Frozen Coca-Cola Slushie',
      description: 'Ice-cold, refreshing carbonated Coca-Cola slushie blended to frosty perfection for the ultimate flame-grilled pairing.',
      price: 89.00,
      image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      badge: 'Chilled',
      calories: 180,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 12,
      category_id: 3,
      name: 'Artisan Oreo Hand-Spun Shake',
      description: 'Velvety vanilla soft serve hand-spun with crunchy crushed Oreo cookies, rich chocolate sauce, and whipped topping.',
      price: 159.00,
      image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
      badge: 'Bestseller',
      calories: 650,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 13,
      category_id: 3,
      name: 'Fresh Strawberry Lemonade',
      description: 'Real strawberry puree muddled with freshly squeezed lemon juice and mint over crushed ice.',
      price: 99.00,
      image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      badge: 'Refreshing',
      calories: 210,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 14,
      category_id: 4,
      name: "HERSHEY'S Sundae Pie",
      description: "Crunchy chocolate crust filled with velvety chocolate crème filling, topped with whipped topping and real Hershey's chocolate shavings.",
      price: 119.00,
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      badge: 'Classic',
      calories: 310,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 15,
      category_id: 4,
      name: 'Warm Molten Chocolate Lava Cake',
      description: 'Rich dark chocolate cake with a warm, gooey fudge center, lightly dusted with powdered sugar.',
      price: 129.00,
      image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      badge: 'Must Try',
      calories: 440,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 16,
      category_id: 5,
      name: 'Ultimate Whopper Meal Combo',
      description: 'Includes 1 Flame-Grilled Whopper, 1 Large Classic Salted King Fries, and 1 Chilled Beverage of your choice.',
      price: 349.00,
      image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80',
      badge: 'Best Value',
      calories: 1190,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 17,
      category_id: 5,
      name: 'Royal Family Feast Box (For 4)',
      description: '2 Flame-Grilled Whoppers, 2 Crispy Royal Chicken Sandwiches, 8 Pc. Chicken Fries, 2 Large King Fries, and 4 Chilled Drinks.',
      price: 799.00,
      image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80',
      badge: 'Save 25%',
      calories: 3240,
      is_available: true,
      created_at: new Date().toISOString()
    },
    {
      id: 18,
      category_id: 5,
      name: 'Double Bacon King Power Meal',
      description: 'Double Bacon King burger paired with Golden Crunchy Onion Rings, an Artisan Oreo Shake, and spicy dipping sauce.',
      price: 449.00,
      image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      badge: 'King Size',
      calories: 1920,
      is_available: true,
      created_at: new Date().toISOString()
    }
  ],
  orders: [
    {
      id: 1001,
      user_id: 2,
      total_amount: 517.00,
      delivery_address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103',
      payment_method: 'UPI',
      payment_status: 'Paid',
      status: 'Delivered',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 1002,
      user_id: 2,
      total_amount: 508.00,
      delivery_address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103',
      payment_method: 'COD',
      payment_status: 'Pending (Pay on Delivery)',
      status: 'Preparing',
      created_at: new Date(Date.now() - 1500000).toISOString()
    }
  ],
  order_items: [
    { id: 1, order_id: 1001, menu_item_id: 1, quantity: 2, unit_price: 199.00 },
    { id: 2, order_id: 1001, menu_item_id: 8, quantity: 1, unit_price: 119.00 },
    { id: 3, order_id: 1002, menu_item_id: 16, quantity: 1, unit_price: 349.00 },
    { id: 4, order_id: 1002, menu_item_id: 12, quantity: 1, unit_price: 159.00 }
  ]
};

async function initDatabase() {
  try {
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.ping();
    } catch (poolErr) {
      // If database does not exist (ER_BAD_DB_ERROR), create it automatically!
      if (poolErr.code === 'ER_BAD_DB_ERROR') {
        console.log(`ℹ️ Database '${dbName}' not found. Attempting automatic creation...`);
        const serverConn = await mysql.createConnection({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
          multipleStatements: true
        });

        await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await serverConn.query(`USE \`${dbName}\`;`);

        // Load and execute schema.sql
        const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          let schemaSql = fs.readFileSync(schemaPath, 'utf8');
          schemaSql = schemaSql.replace(/CREATE DATABASE IF NOT EXISTS\s+`?\w+`?/gi, `CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
          schemaSql = schemaSql.replace(/USE\s+`?\w+`?;/gi, `USE \`${dbName}\`;`);
          await serverConn.query(schemaSql);
          console.log(`✅ Database '${dbName}' created and schema imported successfully.`);
        }
        await serverConn.end();

        // Reconnect pool
        conn = await pool.getConnection();
        await conn.ping();
      } else {
        throw poolErr;
      }
    }

    // Auto-migrate orders table to support payment_method and payment_status
    try {
      const [cols] = await conn.execute("SHOW COLUMNS FROM orders LIKE 'payment_method'");
      if (!cols.length) {
        await conn.execute("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) NOT NULL DEFAULT 'COD'");
      }
    } catch (_) {}
    try {
      const [cols2] = await conn.execute("SHOW COLUMNS FROM orders LIKE 'payment_status'");
      if (!cols2.length) {
        await conn.execute("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending'");
      }
    } catch (_) {}

    conn.release();
    isMySQLConnected = true;
    console.log(`✅ Connected to MySQL Database (${dbName})`);
  } catch (err) {
    isMySQLConnected = false;
    console.warn('⚠️  MySQL connection unavailable (' + (err.message || err.code) + ').');
    console.warn('⚡ Running with built-in In-Memory Database Store (INR ₹) so all API endpoints work seamlessly.');
  }
}

module.exports = {
  pool,
  initDatabase,
  isMySQL: () => isMySQLConnected,
  fallbackStore
};
