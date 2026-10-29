# 🔥 Grill Thrill — "Big Cravings. Fresh Bites." (Artisanal Food Ordering System)

**Grill Thrill** is a modern, responsive, and original full-stack food-ordering web platform designed for a student project demonstration. It features an original visual identity built around **Deep Forest Green (`#173F35`)**, **Warm Artisanal Cream (`#FFF7E9`)**, **Coral-Orange (`#F4774B`)**, and **Charcoal (`#252824`)**.

Built with **HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, bcrypt, express-session, and MySQL**, with **Indian Rupee (₹ INR)** pricing and dual client-storage/REST API execution.

---

## 🎨 Brand Identity & Design System

- **Brand Name**: **Grill Thrill**
- **Tagline**: *“Big Cravings. Fresh Bites.”*
- **Distinctive Color Palette**:
  - **Primary**: Deep Forest Green (`#173F35`) — Headers, navigation, primary brand cards.
  - **Secondary**: Warm Artisanal Cream (`#FFF7E9`, `#FFFFFF`) — Canvas surfaces, card backgrounds.
  - **Accent**: Coral Orange (`#F4774B`, `#DE5E30`) — Call-to-action buttons, badges, promotional banners.
  - **Supporting**: Charcoal (`#252824`) — High-contrast typography and UI outlines.
- **Custom Logo**: Original flame & artisanal grill burger vector emblem with warm golden buns, grill patty, and fiery culinary crown.
- **Typography**: Google Fonts [`Outfit`](https://fonts.google.com/specimen/Outfit) for headings and [`Plus Jakarta Sans`](https://fonts.google.com/specimen/Plus+Jakarta+Sans) for body text and UI controls.
- **Design Elements**: Rounded cards (`border-radius: 20px–32px`), balanced spacing, subtle organic shadows, vegetarian & non-vegetarian dietary markers, and smooth transitions.

---

## ✨ Features & Indian Rupee (₹ INR) Stack

- **Split-Layout Modern Homepage (`index.html`)**:
  - Left: *“GOOD FOOD, GOOD ENERGY”* eyebrow, *“Your Next Favourite Bite Starts Here.”* heading, CTAs, and delivery statistics.
  - Right: Original balanced food photography composition featuring a fresh burger, crispy fries, and cooler with organic backdrop shapes.
  - **Feature Section**: Three highlight cards (*Freshly Prepared*, *Easy Ordering*, *Something for Every Craving*).
  - **Category Showcase**: Clickable categories (*Signature Burgers*, *Crispy Sides*, *Cool Drinks*, *Meal Combos*).
  - **Featured Picks**: *“Cravings Worth Exploring”* with live ₹ pricing, dietary veg/non-veg tags, and Add to Bag buttons.
  - **Promotional Offer**: *“Your Perfect Meal Is Waiting.”* with sample coupon `GRILL20`.
  - **How It Works**: 3-step walkthrough (*Explore*, *Build*, *Review*).
  - **Our Story & Kitchen Contact**: Storytelling section (*The Grill Thrill Story*) and contact cards (Bengaluru kitchen lab, phone, email, hours).
- **Interactive Menu Explorer (`menu.html`)**:
  - 18 chef-crafted signature recipes in Indian Rupees (₹ INR).
  - Category filter pills, dietary filters (**All**, **🌱 Veg**, **🍗 Non-Veg**), real-time search input, in-stock filter toggle, and sort dropdown (Price, Name, Calories).
  - Helpful empty-state UI with a 1-click filter reset.
- **Slide-Over & Dedicated Cart (`cart.html`)**:
  - Live **Grill Thrill Bag** slide-over drawer accessible from any page.
  - Free Delivery Progress Meter (Free delivery unlocked at **₹399+**).
  - Quantity steppers (`+` / `−`), line item removal, and coupon code discounts:
    - `GRILL20` — 20% off entire order
    - `FRESH50` — Flat ₹50 off on orders ₹299+
    - `FREEDEL` — Free delivery on any order
- **Express Checkout (`checkout.html`)**:
  - Customer Name, 10-digit Indian phone number collection, and delivery address with quick city presets (Bengaluru, Mumbai, Delhi-NCR).
  - Simulated payment methods: **Cash on Delivery (COD)** and **UPI (GPay / PhonePe / Paytm)**.
  - Demo Order Confirmation modal with student project disclaimer, 25-minute ETA countdown, and order ID.
- **Order Tracker (`my-orders.html`)**:
  - 5-stage live dispatch stepper: `Pending` → `Confirmed` → `Preparing` → `Out for Delivery` → `Delivered`.
  - 1-click **Reorder Items** functionality.
- **Operations Control Center (`admin-dashboard.html`)**:
  - 4 real-time KPI metric cards in ₹ INR (Gross Revenue, Active Orders, Menu Items, Sold Out).
  - Live kitchen queue with status transition dropdowns.
  - Menu item manager with Add / Edit modal, stock availability toggle, and price editor.
- **Customer & Administrator Authentication (`login.html`, `register.html`)**:
  - Secure bcrypt hashing, session cookies, and 1-Click Instant Demo login buttons.

---

## 🚀 How to Run the Project

### Option A: Instant Browser Preview (Zero Setup)
Simply open [`frontend/index.html`](frontend/index.html) directly in any modern browser!
- The frontend features a synchronized client-side database (`localStorage`) that mirrors all menu items, categories, auth sessions, orders, and admin functions in Indian Rupees (₹ INR). You can immediately test customer ordering, the slide-over drawer, and admin dashboard without installing Node.js or MySQL.

### Option B: Full-Stack Mode (Node.js + Express + MySQL)
1. **Set up MySQL (Optional — in-memory fallback is also automatic)**:
   - Run [`database/schema.sql`](database/schema.sql) in MySQL Workbench to initialize tables and seed data in ₹ INR.
2. **Configure Environment**:
   - Check [`backend/.env`](backend/.env) for database port and credentials.
3. **Start Server**:
   ```bash
   cd backend
   npm install
   npm start
   ```
4. **Access Application**:
   - Visit `http://localhost:5000`

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Operations Administrator** | `admin@burgerking.edu` | `Admin@123` |
| **Customer** | `customer@burgerking.edu` | `Customer@123` |

*(Pre-filled 1-Click Demo buttons are provided directly on the Sign In page for immediate testing!)*
