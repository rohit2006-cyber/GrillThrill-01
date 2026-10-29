-- ============================================================================
-- Grill Thrill Food Ordering System - Database Schema & Seed Data (INR Pricing)
-- Database: grillthrill_db
-- Compatible with MySQL 8.0+ / MariaDB 10.5+ (MySQL Workbench)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS grillthrill_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE grillthrill_db;

-- Drop existing tables in reverse dependency order for clean re-runs
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- 8.1 users
-- ============================================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================================
-- 8.2 categories
-- ============================================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ============================================================================
-- 8.3 menu_items (Prices in Indian Rupees - ₹ INR)
-- ============================================================================
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url VARCHAR(500) DEFAULT NULL,
    badge VARCHAR(50) DEFAULT NULL,
    calories INT DEFAULT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- 8.4 orders (Amounts in Indian Rupees - ₹ INR)
-- ============================================================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    delivery_address TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'COD',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 8.5 order_items (Unit prices in Indian Rupees - ₹ INR)
-- ============================================================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_menu_item
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Indexes for fast filtering and lookups
CREATE INDEX idx_menu_category ON menu_items(category_id);
CREATE INDEX idx_menu_available ON menu_items(is_available);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================================
-- Seed Data: Users
-- Demo Passwords (bcrypt 10 rounds):
--   Admin:    admin@burgerking.edu    / Admin@123
--   Customer: customer@burgerking.edu / Customer@123
-- ============================================================================
INSERT INTO users (name, email, password_hash, role) VALUES
('Crown Administrator', 'admin@burgerking.edu', '$2b$10$wI7H9/B3j4x0z1A5y8L2u.5Q8r3K7m9N2p4V6x8Z0b2D4f6H8j0L2', 'admin'),
('Aarav Sharma', 'customer@burgerking.edu', '$2b$10$kL9M1/C4k5y1A2B6z9M3v.6R9s4L8n0O3q5W7y9A1c3E5g7I9k1M4', 'customer');

-- ============================================================================
-- Seed Data: Categories
-- ============================================================================
INSERT INTO categories (id, name) VALUES
(1, 'Burgers'),
(2, 'Fries and Sides'),
(3, 'Beverages'),
(4, 'Desserts'),
(5, 'Combos');

-- ============================================================================
-- Seed Data: Menu Items (Prices in Indian Rupees - ₹ INR)
-- ============================================================================
INSERT INTO menu_items (category_id, name, description, price, image_url, badge, calories, is_available) VALUES
-- 1. Burgers
(1, 'Flame-Grilled Whopper', 'A quarter-pound of savory flame-grilled patty topped with juicy tomatoes, fresh lettuce, creamy mayo, ketchup, crunchy pickles, and sliced onions on a toasted sesame seed bun.', 199.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 'Bestseller', 670, TRUE),
(1, 'Double Bacon King', 'Two signature flame-grilled patties topped with thick-cut smoked bacon, melted cheese slices, ketchup, and creamy mayo on a soft toasted sesame bun.', 289.00, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80', 'Chef Special', 1150, TRUE),
(1, 'Crispy Royal Chicken Sandwich', 'Crispy spiced chicken breast filet topped with savory royal sauce, crunchy pickles, and fresh shredded iceberg lettuce on a toasted potato bun.', 169.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80', 'Popular', 610, TRUE),
(1, 'Fiery Jalapeño Melt Burger', 'Flame-grilled patty layered with pepper jack cheese, crispy jalapeño slices, smoky chipotle aioli, and fresh lettuce on a toasted artisan bun.', 189.00, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80', 'Spicy', 720, TRUE),
(1, 'Plant-Based Impossible Veg Whopper', '100% Whopper taste with a flame-grilled plant-based patty topped with juicy tomatoes, fresh lettuce, eggless mayo, ketchup, pickles, and sliced onions on a sesame bun.', 179.00, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80', 'Plant-Based', 630, TRUE),
(1, 'Smokehouse BBQ Brisket Burger', 'Flame-grilled patty topped with slow-smoked pulled meat, crispy fried onion strings, aged cheddar cheese, and tangy Hickory BBQ sauce.', 299.00, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80', 'Limited Time', 940, FALSE),

-- 2. Fries and Sides
(2, 'Classic Salted King Fries', 'Piping hot, thick-cut golden French fries, crispy on the outside and fluffy on the inside, lightly dusted with sea salt.', 99.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80', 'Fan Favorite', 380, TRUE),
(2, 'Golden Crunchy Onion Rings', 'Freshly battered whole-cut sweet onion rings fried to golden perfection and served with signature zesty dipping sauce.', 119.00, 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80', NULL, 410, TRUE),
(2, '8 Pc. Crispy Chicken Fries', 'Tender white meat chicken strips shaped like fries, coated in a crispy herb-seasoned breading with dipping sauce.', 149.00, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80', 'Kids Love It', 290, TRUE),
(2, 'Loaded Cheesy Bacon Tots', 'Bite-sized crispy potato crowns drizzled with warm nacho cheddar cheese sauce and seasoned savory toppings.', 139.00, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80', 'New', 490, TRUE),

-- 3. Beverages
(3, 'Frozen Coca-Cola Slushie', 'Ice-cold, refreshing carbonated Coca-Cola slushie blended to frosty perfection for the ultimate flame-grilled pairing.', 89.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', 'Chilled', 180, TRUE),
(3, 'Artisan Oreo Hand-Spun Shake', 'Velvety vanilla soft serve hand-spun with crunchy crushed Oreo cookies, rich chocolate sauce, and whipped topping.', 159.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80', 'Bestseller', 650, TRUE),
(3, 'Fresh Strawberry Lemonade', 'Real strawberry puree muddled with freshly squeezed lemon juice and mint over crushed ice.', 99.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', 'Refreshing', 210, TRUE),

-- 4. Desserts
(4, 'HERSHEY''S Sundae Pie', 'Crunchy chocolate crust filled with velvety chocolate crème filling, topped with whipped topping and real Hershey''s chocolate shavings.', 119.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', 'Classic', 310, TRUE),
(4, 'Warm Molten Chocolate Lava Cake', 'Rich dark chocolate cake with a warm, gooey fudge center, lightly dusted with powdered sugar.', 129.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', 'Must Try', 440, TRUE),

-- 5. Combos
(5, 'Ultimate Whopper Meal Combo', 'Includes 1 Flame-Grilled Whopper, 1 Large Classic Salted King Fries, and 1 Chilled Beverage of your choice.', 349.00, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80', 'Best Value', 1190, TRUE),
(5, 'Royal Family Feast Box (For 4)', '2 Flame-Grilled Whoppers, 2 Crispy Royal Chicken Sandwiches, 8 Pc. Chicken Fries, 2 Large King Fries, and 4 Chilled Drinks.', 799.00, 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80', 'Save 25%', 3240, TRUE),
(5, 'Double Bacon King Power Meal', 'Double Bacon King burger paired with Golden Crunchy Onion Rings, an Artisan Oreo Shake, and spicy dipping sauce.', 449.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80', 'King Size', 1920, TRUE);

-- ============================================================================
-- Seed Data: Sample Orders for Demo (Amounts in Indian Rupees - ₹ INR)
-- ============================================================================
INSERT INTO orders (id, user_id, total_amount, delivery_address, status, payment_method, payment_status, created_at) VALUES
(1001, 2, 517.00, 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103', 'Delivered', 'UPI', 'Paid', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1002, 2, 508.00, 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103', 'Preparing', 'COD', 'Pending (Pay on Delivery)', DATE_SUB(NOW(), INTERVAL 25 MINUTE));

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES
(1001, 1, 2, 199.00),
(1001, 8, 1, 119.00),
(1002, 16, 1, 349.00),
(1002, 12, 1, 159.00);
