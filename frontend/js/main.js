/**
 * ============================================================================
 * GRILL THRILL FOOD ORDERING PLATFORM — CORE ENGINE (js/main.js)
 * Brand: Grill Thrill | Tagline: "Big Cravings. Fresh Bites."
 * Palette: Forest Green (#173F35), Warm Cream (#FFF7E9), Coral Orange (#F4774B), Charcoal (#252824)
 * Currency: Indian Rupees (₹ INR)
 * Features:
 *   - Universal REST API client (Node.js + Express + MySQL)
 *   - Seamless synchronized local fallback database for zero-config browser runs
 *   - Responsive slide-over Grill Thrill Bag drawer
 *   - Live ₹399 Free Delivery tracker & promo discount engine
 *   - Clean toast notifications and modal utilities
 * ============================================================================
 */

(function () {
  const STORAGE_KEYS = {
    DB: 'grillthrill_db_v1_inr',
    CART: 'grillthrill_cart_v1_inr',
    SESSION: 'grillthrill_session_v1_inr',
    PROMO: 'grillthrill_promo_v1_inr'
  };

  // Seed Catalog — Signature Grill Thrill items with ₹ INR pricing & Veg/Non-Veg flags
  const INITIAL_SEED = {
    users: [
      {
        id: 1,
        name: 'Grill Thrill Operations Lead',
        email: 'admin@burgerking.edu',
        password: 'Admin@123',
        role: 'admin',
        created_at: '2026-10-01T09:00:00.000Z'
      },
      {
        id: 2,
        name: 'Aarav Sharma',
        email: 'customer@burgerking.edu',
        password: 'Customer@123',
        role: 'customer',
        created_at: '2026-10-02T11:30:00.000Z'
      }
    ],
    categories: [
      { id: 1, name: 'Signature Burgers', icon: '🍔' },
      { id: 2, name: 'Crispy Sides', icon: '🍟' },
      { id: 3, name: 'Cool Drinks', icon: '🥤' },
      { id: 4, name: 'Desserts', icon: '🍫' },
      { id: 5, name: 'Meal Combos', icon: '⚡' }
    ],
    menu_items: [
      {
        id: 1,
        category_id: 1,
        category_name: 'Signature Burgers',
        name: 'Grill Thrill Classic Brioche Burger',
        description: 'Handcrafted flame-grilled patty layered with ripe farm tomatoes, fresh crisp greens, house herb sauce, dill pickles, and melted cheddar on a warm toasted sesame brioche.',
        price: 199.00,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        badge: 'Bestseller',
        calories: 650,
        is_veg: false,
        is_available: true
      },
      {
        id: 2,
        category_id: 1,
        category_name: 'Signature Burgers',
        name: 'Smoked Truffle Cheddar Stack',
        description: 'Double grilled patties layered with smoked aged cheddar, caramelized shallots, savory truffle emulsion, and crisp romaine on butter-toasted brioche.',
        price: 289.00,
        image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
        badge: 'Chef Special',
        calories: 1080,
        is_veg: false,
        is_available: true
      },
      {
        id: 3,
        category_id: 1,
        category_name: 'Signature Burgers',
        name: 'Crispy Golden Herb Chicken Burger',
        description: 'Crisp herb-crusted tender chicken breast fillet, house garlic cream, crunchy slaw, and pickled cucumber coins on a toasted potato bun.',
        price: 179.00,
        image_url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80',
        badge: 'Popular',
        calories: 610,
        is_veg: false,
        is_available: true
      },
      {
        id: 4,
        category_id: 1,
        category_name: 'Signature Burgers',
        name: 'Spicy Chipotle Paneer Crunch',
        description: 'Crispy seasoned cottage cheese steak smothered with smoked chipotle sauce, melted Monterey jack, and crisp bell peppers on a toasted bun.',
        price: 169.00,
        image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80',
        badge: 'Spicy',
        calories: 690,
        is_veg: true,
        is_available: true
      },
      {
        id: 5,
        category_id: 1,
        category_name: 'Signature Burgers',
        name: 'Garden Harvest Green Patty',
        description: '100% savory edamame, corn, and herb patty topped with fresh avocado relish, garden tomatoes, and vegan green goddess dressing on seeded multigrain.',
        price: 179.00,
        image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
        badge: 'Plant-Based',
        calories: 590,
        is_veg: true,
        is_available: true
      },
      {
        id: 6,
        category_id: 1,
        category_name: 'Signature Burgers',
        name: 'Slow-Roasted BBQ Mushroom Melt',
        description: 'Sautéed portobello and king oyster mushrooms glazed in tangy Hickory BBQ sauce with melted smoked provolone on buttered sourdough.',
        price: 219.00,
        image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
        badge: 'Limited Edition',
        calories: 780,
        is_veg: true,
        is_available: false
      },
      {
        id: 7,
        category_id: 2,
        category_name: 'Crispy Sides',
        name: 'Rustic Sea-Salt Crinkle Fries',
        description: 'Golden crinkle-cut potatoes fried to an irresistible crunch, tossed in flaky sea salt and cracked Sarawak black pepper.',
        price: 99.00,
        image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
        badge: 'Fan Favorite',
        calories: 360,
        is_veg: true,
        is_available: true
      },
      {
        id: 8,
        category_id: 2,
        category_name: 'Crispy Sides',
        name: 'Golden Herbed Sweet Onion Rings',
        description: 'Thick-cut sweet white onions dipped in thyme-infused tempura batter, fried crisp and served with smoked paprika dip.',
        price: 119.00,
        image_url: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80',
        badge: 'Crispy',
        calories: 410,
        is_veg: true,
        is_available: true
      },
      {
        id: 9,
        category_id: 2,
        category_name: 'Crispy Sides',
        name: 'Spiced Crispy Tender Strips',
        description: 'Buttermilk-brined whole chicken tenderloin strips coated in 11 secret herbs, served piping hot with tangy house honey mustard.',
        price: 149.00,
        image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
        badge: 'High Protein',
        calories: 380,
        is_veg: false,
        is_available: true
      },
      {
        id: 10,
        category_id: 2,
        category_name: 'Crispy Sides',
        name: 'Loaded Jalapeño Cheese Bites',
        description: 'Crispy golden potato crowns stuffed with molten cheddar cheese and diced spicy pickled jalapeño peppers.',
        price: 139.00,
        image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
        badge: 'Cheesy',
        calories: 480,
        is_veg: true,
        is_available: true
      },
      {
        id: 11,
        category_id: 3,
        category_name: 'Cool Drinks',
        name: 'Chilled Mint Lime Fizz Cooler',
        description: 'Crushed garden spearmint muddled with freshly squeezed lime juice, organic raw cane syrup, and sparkling soda over ice.',
        price: 89.00,
        image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
        badge: 'Refreshing',
        calories: 140,
        is_veg: true,
        is_available: true
      },
      {
        id: 12,
        category_id: 3,
        category_name: 'Cool Drinks',
        name: 'Velvet Belgian Chocolate Hand-Spun Shake',
        description: 'Artisanal vanilla cream slow-spun with Belgian 70% dark chocolate ganache, whipped dairy cream, and shaved chocolate crisps.',
        price: 159.00,
        image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
        badge: 'Bestseller',
        calories: 620,
        is_veg: true,
        is_available: true
      },
      {
        id: 13,
        category_id: 3,
        category_name: 'Cool Drinks',
        name: 'Fresh Wild Berry Lemon Spritz',
        description: 'Crushed blackberries and raspberries shaken with freshly pressed lemon juice, lavender botanicals, and chilled spring water.',
        price: 99.00,
        image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        badge: 'Chilled',
        calories: 170,
        is_veg: true,
        is_available: true
      },
      {
        id: 14,
        category_id: 4,
        category_name: 'Desserts',
        name: 'Warm Molten Dark Chocolate Tart',
        description: 'Flaky cocoa tart shell filled with gooey liquid chocolate fudge, served warm and lightly dusted with vanilla sugar.',
        price: 129.00,
        image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        badge: 'Must Try',
        calories: 430,
        is_veg: true,
        is_available: true
      },
      {
        id: 15,
        category_id: 4,
        category_name: 'Desserts',
        name: 'Salted Caramel Brownie Parfait',
        description: 'Fudgy Dutch cocoa brownie cubes layered with slow-cooked salted butter caramel and whipped mascarpone cream.',
        price: 119.00,
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        badge: 'Classic',
        calories: 390,
        is_veg: true,
        is_available: true
      },
      {
        id: 16,
        category_id: 5,
        category_name: 'Meal Combos',
        name: 'Grill Thrill Solo Power Combo',
        description: 'Includes 1 Grill Thrill Classic Brioche Burger, 1 portion of Rustic Sea-Salt Crinkle Fries, and 1 Chilled Mint Lime Fizz Cooler.',
        price: 349.00,
        image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80',
        badge: 'Best Value',
        calories: 1150,
        is_veg: false,
        is_available: true
      },
      {
        id: 17,
        category_id: 5,
        category_name: 'Meal Combos',
        name: 'Grill Thrill Grand Friends Feast Box',
        description: '2 Grill Thrill Classic Brioche Burgers, 2 Crispy Herb Chicken Burgers, 2 Large Crinkle Fries, Loaded Cheese Bites, and 4 Cool Drinks.',
        price: 799.00,
        image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80',
        badge: 'Save 25%',
        calories: 3100,
        is_veg: false,
        is_available: true
      },
      {
        id: 18,
        category_id: 5,
        category_name: 'Meal Combos',
        name: 'Double Stack Gourmet Meal Box',
        description: 'Smoked Truffle Cheddar Stack paired with Herbed Onion Rings, a Hand-Spun Belgian Shake, and house dipping sauce.',
        price: 449.00,
        image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
        badge: 'Chef Choice',
        calories: 1880,
        is_veg: false,
        is_available: true
      }
    ],
    orders: [
      {
        id: 1001,
        user_id: 2,
        customer_name: 'Aarav Sharma',
        customer_email: 'customer@burgerking.edu',
        total_amount: 517.00,
        delivery_address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103',
        payment_method: 'UPI',
        payment_status: 'Paid',
        status: 'Delivered',
        created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
      },
      {
        id: 1002,
        user_id: 2,
        customer_name: 'Aarav Sharma',
        customer_email: 'customer@burgerking.edu',
        total_amount: 508.00,
        delivery_address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103',
        payment_method: 'COD',
        payment_status: 'Pending (Pay on Delivery)',
        status: 'Preparing',
        created_at: new Date(Date.now() - 22 * 60 * 1000).toISOString()
      }
    ],
    order_items: [
      { id: 1, order_id: 1001, menu_item_id: 1, quantity: 2, unit_price: 199.00 },
      { id: 2, order_id: 1001, menu_item_id: 8, quantity: 1, unit_price: 119.00 },
      { id: 3, order_id: 1002, menu_item_id: 16, quantity: 1, unit_price: 349.00 },
      { id: 4, order_id: 1002, menu_item_id: 12, quantity: 1, unit_price: 159.00 }
    ]
  };

  // ==========================================================================
  // LOCAL STORAGE & HYBRID DB INITIALIZATION
  // ==========================================================================

  function getLocalDB() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DB);
      if (!stored) {
        // Fallback: check older storage keys if migrating
        const legacy = localStorage.getItem('bunora_db_v1_inr') || localStorage.getItem('biterush_db_v1_inr');
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy);
            saveLocalDB(parsed);
            return parsed;
          } catch (_) {}
        }
        saveLocalDB(INITIAL_SEED);
        return INITIAL_SEED;
      }
      return JSON.parse(stored);
    } catch (_) {
      return INITIAL_SEED;
    }
  }

  function saveLocalDB(data) {
    try {
      localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(data));
    } catch (_) {}
  }

  function resetDemoCatalog() {
    saveLocalDB(INITIAL_SEED);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.PROMO);
    showToast('Grill Thrill demo catalog successfully reset!', 'info');
    setTimeout(() => window.location.reload(), 450);
  }

  // ==========================================================================
  // FORMATTING UTILITIES (INR ₹)
  // ==========================================================================

  function formatCurrency(amount) {
    const num = Number(amount) || 0;
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    })}`;
  }

  // ==========================================================================
  // SESSION & AUTH STATE
  // ==========================================================================

  function getCurrentUser() {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.SESSION) || localStorage.getItem('bunora_session_v1_inr');
      return s ? JSON.parse(s) : null;
    } catch (_) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem('bunora_session_v1_inr');
    }
    renderGlobalHeader();
  }

  // ==========================================================================
  // CART & PROMO LOGIC
  // ==========================================================================

  function getCart() {
    try {
      const c = localStorage.getItem(STORAGE_KEYS.CART) || localStorage.getItem('bunora_cart_v1_inr');
      return c ? JSON.parse(c) : [];
    } catch (_) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      localStorage.setItem('bunora_cart_v1_inr', JSON.stringify(cart));
    } catch (_) {}
    window.dispatchEvent(new CustomEvent('grillthrill:cart-updated', { detail: { cart } }));
    window.dispatchEvent(new CustomEvent('bunora:cart-updated', { detail: { cart } }));
    renderGlobalHeader();
    renderSlideOverDrawer();
  }

  function getAppliedPromo() {
    try {
      return localStorage.getItem(STORAGE_KEYS.PROMO) || localStorage.getItem('bunora_promo_v1_inr') || '';
    } catch (_) {
      return '';
    }
  }

  function setAppliedPromo(code) {
    if (code) {
      const norm = String(code).trim().toUpperCase();
      localStorage.setItem(STORAGE_KEYS.PROMO, norm);
      localStorage.setItem('bunora_promo_v1_inr', norm);
    } else {
      localStorage.removeItem(STORAGE_KEYS.PROMO);
      localStorage.removeItem('bunora_promo_v1_inr');
    }
    window.dispatchEvent(new CustomEvent('grillthrill:cart-updated'));
    window.dispatchEvent(new CustomEvent('bunora:cart-updated'));
  }

  function getItemQtyInCart(itemId) {
    const cart = getCart();
    const found = cart.find((i) => Number(i.id) === Number(itemId));
    return found ? found.quantity : 0;
  }

  function addToCart(item, quantity = 1) {
    const cart = getCart();
    const id = Number(item.id);
    const existing = cart.find((i) => Number(i.id) === id);

    if (existing) {
      existing.quantity = Math.min(50, existing.quantity + quantity);
    } else {
      cart.push({
        id: id,
        name: item.name,
        price: Number(item.price),
        image_url: item.image_url || '',
        category_name: item.category_name || '',
        is_veg: item.is_veg !== undefined ? Boolean(item.is_veg) : true,
        quantity: Math.min(50, Math.max(1, quantity))
      });
    }

    saveCart(cart);
    showToast(`Added ${item.name} to Grill Thrill Bag!`, 'success');
  }

  function updateCartQty(itemId, newQty) {
    let cart = getCart();
    const id = Number(itemId);
    const target = cart.find((i) => Number(i.id) === id);

    if (!target) return;

    if (newQty <= 0) {
      cart = cart.filter((i) => Number(i.id) !== id);
      showToast(`Removed from Grill Thrill Bag`, 'info');
    } else {
      target.quantity = Math.min(50, newQty);
    }

    saveCart(cart);
  }

  function calculateCartSummary() {
    const cart = getCart();
    const db = getLocalDB();
    const promo = getAppliedPromo();

    let subtotal = 0;
    let totalItems = 0;

    const enrichedItems = cart.map((ci) => {
      const dbItem = db.menu_items.find((m) => Number(m.id) === Number(ci.id)) || ci;
      const price = Number(dbItem.price);
      const lineTotal = price * ci.quantity;
      subtotal += lineTotal;
      totalItems += ci.quantity;

      return {
        ...ci,
        price,
        lineTotal,
        image_url: dbItem.image_url || ci.image_url,
        is_available: dbItem.is_available !== false,
        is_veg: dbItem.is_veg !== undefined ? Boolean(dbItem.is_veg) : ci.is_veg
      };
    });

    let discount = 0;
    let promoDescription = '';

    if (promo) {
      if (promo === 'GRILL20' || promo === 'BUNORA20' || promo === 'RUSH20' || promo === 'KING20') {
        discount = Number((subtotal * 0.20).toFixed(2));
        promoDescription = '20% Special Discount Applied';
      } else if (promo === 'FRESH50' || promo === 'BITE50' || promo === 'WHOPPER50') {
        if (subtotal >= 299) {
          discount = Math.min(50.00, subtotal);
          promoDescription = 'Flat ₹50 Discount Applied';
        } else {
          promoDescription = 'Promo requires ₹299 min order';
        }
      } else if (promo === 'FREEDEL') {
        promoDescription = 'Free Delivery Unlocked';
      }
    }

    const freeDeliveryThreshold = 399.0;
    const deliveryFee =
      subtotal === 0
        ? 0
        : subtotal >= freeDeliveryThreshold || promo === 'FREEDEL'
        ? 0
        : 49.0;

    const total = Number(Math.max(0, subtotal - discount + deliveryFee).toFixed(2));
    const amountForFreeDelivery = Number(Math.max(0, freeDeliveryThreshold - subtotal).toFixed(2));

    return {
      items: enrichedItems,
      totalItems,
      subtotal,
      discount,
      promo,
      promoDescription,
      deliveryFee,
      total,
      freeDeliveryThreshold,
      amountForFreeDelivery
    };
  }

  // ==========================================================================
  // HYBRID API CLIENT (NODE + EXPRESS + MYSQL WITH LOCALSTORE FALLBACK)
  // ==========================================================================

  async function tryBackendFetch(endpoint, options = {}) {
    const urlsToTry = [];
    if (window.location.protocol.startsWith('http')) {
      urlsToTry.push(`/api${endpoint}`);
    }
    urlsToTry.push(`http://localhost:5000/api${endpoint}`);

    for (const url of urlsToTry) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1400);
        const res = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
          },
          credentials: 'include',
          signal: controller.signal
        });
        clearTimeout(timer);
        const data = await res.json();
        return { ok: res.ok, status: res.status, data, fromBackend: true };
      } catch (_) {}
    }
    return null;
  }

  const API = {
    async getCategories() {
      const live = await tryBackendFetch('/categories');
      if (live && live.ok) return live.data.categories;
      return getLocalDB().categories;
    },

    async getMenu(categoryId = null) {
      const query = categoryId ? `?category_id=${encodeURIComponent(categoryId)}` : '';
      const live = await tryBackendFetch(`/menu${query}`);
      if (live && live.ok) {
        const db = getLocalDB();
        db.menu_items = live.data.items;
        saveLocalDB(db);
        return live.data.items;
      }
      const db = getLocalDB();
      const catMap = new Map(db.categories.map((c) => [c.id, c.name]));
      return db.menu_items
        .filter((m) => (!categoryId ? true : Number(m.category_id) === Number(categoryId)))
        .map((m) => ({
          ...m,
          category_name: m.category_name || catMap.get(Number(m.category_id)) || 'Menu'
        }));
    },

    async login(email, password) {
      const live = await tryBackendFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (live) {
        if (!live.ok) throw new Error(live.data.message || 'Invalid credentials');
        setCurrentUser(live.data.user);
        return live.data;
      }

      const db = getLocalDB();
      const normalized = String(email || '').trim().toLowerCase();
      const user = db.users.find((u) => u.email.toLowerCase() === normalized);
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password. Use demo buttons for quick access.');
      }
      const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
      setCurrentUser(safeUser);
      return { success: true, user: safeUser };
    },

    async register(name, email, password) {
      const live = await tryBackendFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      if (live) {
        if (!live.ok) throw new Error(live.data.message || 'Registration failed');
        setCurrentUser(live.data.user);
        return live.data;
      }

      const db = getLocalDB();
      const normalized = String(email || '').trim().toLowerCase();
      if (db.users.some((u) => u.email.toLowerCase() === normalized)) {
        throw new Error('An account with this email already exists.');
      }

      const newUser = {
        id: db.users.length + 1,
        name: String(name).trim(),
        email: normalized,
        password: String(password),
        role: 'customer',
        created_at: new Date().toISOString()
      };
      db.users.push(newUser);
      saveLocalDB(db);

      const safeUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
      setCurrentUser(safeUser);
      return { success: true, user: safeUser };
    },

    async logout() {
      await tryBackendFetch('/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      showToast('You have signed out.', 'info');
      setTimeout(() => {
        if (window.location.pathname.includes('admin') || window.location.pathname.includes('orders')) {
          window.location.href = 'index.html';
        }
      }, 400);
    },

    async createOrder(deliveryAddress, paymentMethod = 'COD') {
      const user = getCurrentUser();
      const summary = calculateCartSummary();
      if (!summary.items.length) {
        throw new Error('Your Grill Thrill Bag is empty.');
      }

      const orderPayload = {
        delivery_address: deliveryAddress,
        items: summary.items.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
        promo_code: summary.promo,
        payment_method: paymentMethod
      };

      const live = await tryBackendFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });
      if (live && live.ok) {
        localStorage.removeItem(STORAGE_KEYS.CART);
        localStorage.removeItem(STORAGE_KEYS.PROMO);
        window.dispatchEvent(new CustomEvent('grillthrill:cart-updated'));
        window.dispatchEvent(new CustomEvent('bunora:cart-updated'));
        return live.data.order;
      }

      // Local fallback simulation
      const db = getLocalDB();
      const nextId = db.orders.reduce((max, o) => Math.max(max, o.id), 1000) + 1;
      const payMethod = paymentMethod ? String(paymentMethod).trim().toUpperCase() : 'COD';
      const payStatus = payMethod === 'UPI' ? 'Paid' : 'Pending (Pay on Delivery)';
      const newOrder = {
        id: nextId,
        user_id: user ? user.id : 2,
        customer_name: user ? user.name : 'Valued Food Lover',
        customer_email: user ? user.email : 'guest@grillthrill.kitchen',
        total_amount: summary.total,
        delivery_address: deliveryAddress,
        payment_method: payMethod,
        payment_status: payStatus,
        status: 'Pending',
        created_at: new Date().toISOString(),
        items: summary.items.map((i) => ({
          menu_item_id: i.id,
          name: i.name,
          quantity: i.quantity,
          unit_price: i.price,
          image_url: i.image_url
        }))
      };

      db.orders.unshift(newOrder);
      saveLocalDB(db);

      localStorage.removeItem(STORAGE_KEYS.CART);
      localStorage.removeItem(STORAGE_KEYS.PROMO);
      window.dispatchEvent(new CustomEvent('grillthrill:cart-updated'));
      window.dispatchEvent(new CustomEvent('bunora:cart-updated'));
      return newOrder;
    },

    async getMyOrders() {
      const live = await tryBackendFetch('/orders');
      if (live && live.ok) {
        return (live.data.orders || []).map((o) => ({
          ...o,
          payment_method: o.payment_method || 'COD',
          payment_status: o.payment_status || (o.status === 'Delivered' ? 'Paid' : (o.payment_method === 'UPI' ? 'Paid' : 'Pending (Pay on Delivery)'))
        }));
      }

      const user = getCurrentUser();
      const db = getLocalDB();
      const targetUserId = user ? user.id : 2;
      return db.orders
        .filter((o) => Number(o.user_id) === Number(targetUserId))
        .map((o) => ({
          ...o,
          payment_method: o.payment_method || 'COD',
          payment_status: o.payment_status || (o.status === 'Delivered' ? 'Paid' : (o.payment_method === 'UPI' ? 'Paid' : 'Pending (Pay on Delivery)'))
        }));
    },

    async getOrderDetails(orderId) {
      const live = await tryBackendFetch(`/orders/${orderId}`);
      if (live && live.ok) return live.data.order;

      const user = getCurrentUser();
      const db = getLocalDB();
      const numId = Number(orderId);
      const order = db.orders.find((o) => Number(o.id) === numId);
      if (!order) throw new Error(`Order #${orderId} not found.`);

      // Strict security check: Customers may only view their own orders
      if (user && user.role !== 'admin' && Number(order.user_id) !== Number(user.id)) {
        throw new Error('Access denied. You can only view your own orders.');
      }

      // Populate items with details from menu items if needed
      const orderItems = (order.items && order.items.length)
        ? order.items
        : (db.order_items || [])
            .filter((oi) => oi.order_id === numId)
            .map((oi) => {
              const m = (db.menu_items || []).find((item) => Number(item.id) === Number(oi.menu_item_id));
              return {
                ...oi,
                name: m ? m.name : `Item #${oi.menu_item_id}`,
                image_url: m ? m.image_url : null,
                unit_price: Number(oi.unit_price)
              };
            });

      const payMethod = order.payment_method || 'COD';
      const payStatus = order.payment_status || (order.status === 'Delivered' ? 'Paid' : (payMethod === 'UPI' ? 'Paid' : 'Pending (Pay on Delivery)'));

      return {
        ...order,
        payment_method: payMethod,
        payment_status: payStatus,
        items: orderItems
      };
    },

    async getAdminDashboard() {
      const live = await tryBackendFetch('/admin/dashboard');
      if (live && live.ok) return live.data;

      const db = getLocalDB();
      const totalRevenue = db.orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const activeOrders = db.orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status)).length;
      const totalItems = db.menu_items.length;
      const soldOutItems = db.menu_items.filter((m) => !m.is_available).length;

      return {
        metrics: {
          total_revenue: totalRevenue,
          active_orders: activeOrders,
          total_items: totalItems,
          sold_out_items: soldOutItems
        },
        orders: db.orders,
        menu: db.menu_items
      };
    },

    async adminUpdateOrderStatus(orderId, status) {
      const live = await tryBackendFetch(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (live && live.ok) return live.data.order;

      const db = getLocalDB();
      const order = db.orders.find((o) => Number(o.id) === Number(orderId));
      if (order) {
        order.status = status;
        saveLocalDB(db);
        return order;
      }
      throw new Error('Order not found');
    },

    async adminCreateMenuItem(itemData) {
      const live = await tryBackendFetch('/admin/menu', {
        method: 'POST',
        body: JSON.stringify(itemData)
      });
      if (live && live.ok) return live.data.item;

      const db = getLocalDB();
      const nextId = db.menu_items.reduce((max, m) => Math.max(max, m.id), 0) + 1;
      const cat = db.categories.find((c) => Number(c.id) === Number(itemData.category_id));
      const newItem = {
        id: nextId,
        category_id: Number(itemData.category_id),
        category_name: cat ? cat.name : 'Signature Burgers',
        name: itemData.name,
        description: itemData.description,
        price: Number(Number(itemData.price).toFixed(2)),
        image_url: itemData.image_url || null,
        badge: itemData.badge || null,
        calories: itemData.calories ? Number(itemData.calories) : null,
        is_veg: itemData.is_veg !== undefined ? Boolean(itemData.is_veg) : true,
        is_available: true,
        created_at: new Date().toISOString()
      };
      db.menu_items.push(newItem);
      saveLocalDB(db);
      return newItem;
    },

    async adminUpdateMenuItem(id, updates) {
      const live = await tryBackendFetch(`/admin/menu/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      if (live && live.ok) return live.data.item;

      const db = getLocalDB();
      const index = db.menu_items.findIndex((m) => Number(m.id) === Number(id));
      if (index === -1) throw new Error(`Menu item #${id} not found.`);

      const current = db.menu_items[index];
      const nextCatId = updates.category_id !== undefined ? Number(updates.category_id) : current.category_id;
      const cat = db.categories.find((c) => Number(c.id) === nextCatId);

      db.menu_items[index] = {
        ...current,
        ...updates,
        category_id: nextCatId,
        category_name: cat ? cat.name : current.category_name,
        price: updates.price !== undefined ? Number(Number(updates.price).toFixed(2)) : current.price,
        is_available: updates.is_available !== undefined ? Boolean(updates.is_available) : current.is_available,
        is_veg: updates.is_veg !== undefined ? Boolean(updates.is_veg) : current.is_veg
      };
      saveLocalDB(db);
      return db.menu_items[index];
    },

    async adminDeleteMenuItem(id) {
      const live = await tryBackendFetch(`/admin/menu/${id}`, {
        method: 'DELETE'
      });
      if (live && live.ok) return true;

      const db = getLocalDB();
      const index = db.menu_items.findIndex((m) => Number(m.id) === Number(id));
      if (index === -1) throw new Error(`Menu item #${id} not found.`);
      db.menu_items.splice(index, 1);
      saveLocalDB(db);
      return true;
    }
  };

  // ==========================================================================
  // UI HELPERS: TOASTS, IMAGE FALLBACK, HEADER, & SLIDE-OVER DRAWER
  // ==========================================================================

  function showToast(message, type = 'success') {
    let container = document.getElementById('grillThrillToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'grillThrillToastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `bunora-toast ${type === 'error' ? 'error' : ''}`;
    const icon = type === 'error' ? '⚠️' : type === 'info' ? '⚡' : '🔥';
    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function fallbackImage(title = 'Grill Thrill Kitchen') {
    const label = encodeURIComponent(String(title).slice(0, 26));
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><rect width="600" height="420" fill="%23173F35"/><circle cx="300" cy="180" r="95" fill="%23FFF7E9" opacity="0.12"/><path d="M220 170C220 135 255 110 300 110C345 110 380 135 380 170H220Z" fill="%23F4774B"/><circle cx="260" cy="138" r="4" fill="%23FFF7E9"/><circle cx="300" cy="130" r="4" fill="%23FFF7E9"/><circle cx="340" cy="138" r="4" fill="%23FFF7E9"/><rect x="210" y="180" width="180" height="18" rx="6" fill="%23FFF7E9"/><path d="M220 208H380C380 230 350 245 300 245C250 245 220 230 220 208Z" fill="%23F4774B"/><text x="300" y="315" font-family="sans-serif" font-weight="900" font-size="22" text-anchor="middle" fill="%23FFF7E9">${label}</text><text x="300" y="345" font-family="sans-serif" font-weight="700" font-size="13" letter-spacing="3" text-anchor="middle" fill="%2357A693">GRILL THRILL KITCHEN</text></svg>`;
  }

  // Grill Thrill Custom Flame & Burger SVG Logo Emblem
  const GRILL_THRILL_LOGO_SVG = `
    <svg class="brand-emblem-svg" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Bun Top with flame-grilled curvature -->
      <path d="M5 13C5 7.5 9 4 14 4C19 4 23 7.5 23 13H5Z" fill="#F4774B"/>
      <!-- Sizzling grill marks on bun -->
      <path d="M10 6.5L9.5 9" stroke="#FFF7E9" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M14 5.5L13.8 8.5" stroke="#FFF7E9" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M18 6.5L17.5 9" stroke="#FFF7E9" stroke-width="1.2" stroke-linecap="round"/>
      <!-- Sizzling grill / fresh greens layer -->
      <rect x="3.5" y="14.5" width="21" height="2.5" rx="1.25" fill="#57A693"/>
      <!-- Bun Bottom -->
      <path d="M5.5 18.5H22.5C22.5 21.5 19.5 23.5 14 23.5C8.5 23.5 5.5 21.5 5.5 18.5Z" fill="#F4774B"/>
    </svg>
  `;

  function renderGlobalHeader() {
    const headerMount = document.getElementById('globalHeader');
    if (!headerMount) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isAdminPage = currentPage.includes('admin-dashboard') || !!document.getElementById('adminDashboardMount');
    const user = getCurrentUser();
    const summary = calculateCartSummary();

    headerMount.innerHTML = `
      ${
        !isAdminPage
          ? `
            <div class="top-promo-bar">
              <span class="promo-pill">SPECIAL OFFER</span>
              <span>⚡ Use code <strong>GRILL20</strong> for 20% OFF • <strong>FREE Delivery</strong> on orders over ₹399!</span>
            </div>
          `
          : ''
      }
      <header class="site-header">
        <div class="container navbar">
          <!-- Grill Thrill Brand Logo -->
          <a href="index.html" class="brand-logo" aria-label="Grill Thrill Home">
            <div class="brand-emblem" aria-hidden="true">
              ${GRILL_THRILL_LOGO_SVG}
            </div>
            <div class="brand-text-wrap">
              <span class="brand-title">Grill Thrill<span class="brand-dot">.</span></span>
              <span class="brand-tagline">Big Cravings. Fresh Bites.</span>
            </div>
          </a>

          <!-- Navigation Links -->
          <ul class="nav-links" id="mainNavLinks">
            <li><a href="index.html" class="nav-link ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}">Home</a></li>
            <li><a href="menu.html" class="nav-link ${currentPage === 'menu.html' ? 'active' : ''}">Explore Menu</a></li>
            <li><a href="index.html#our-story" class="nav-link">Our Story</a></li>
            <li><a href="index.html#contact" class="nav-link">Contact</a></li>
            ${
              user && user.role !== 'admin'
                ? `
                  <li><a href="order-history.html" class="nav-link ${currentPage === 'order-history.html' ? 'active' : ''}">Order History</a></li>
                  <li><a href="my-orders.html" class="nav-link ${currentPage === 'my-orders.html' ? 'active' : ''}">Tracker</a></li>
                `
                : ''
            }
            ${
              user && user.role === 'admin'
                ? `<li><a href="admin-dashboard.html" class="nav-link ${currentPage === 'admin-dashboard.html' ? 'active' : ''}">Operations</a></li>`
                : `<li><a href="admin-dashboard.html" class="nav-link ${currentPage === 'admin-dashboard.html' ? 'active' : ''}">Admin</a></li>`
            }
          </ul>

          <!-- Nav Actions -->
          <div class="nav-actions">
            ${
              !isAdminPage
                ? `
                  <!-- Search Icon (Storefront Only) -->
                  <a href="menu.html" class="nav-search-btn" title="Search Menu" aria-label="Search Menu">
                    🔍
                  </a>

                  <!-- Live Cart Icon Button (Storefront Only) -->
                  <button type="button" class="cart-trigger-btn" id="openCartDrawerBtn" aria-label="Open Grill Thrill Bag">
                    <span>🛍️</span>
                    <span id="headerCartTotal">${formatCurrency(summary.subtotal)}</span>
                    <span class="cart-count-badge" id="headerCartCount">${summary.totalItems}</span>
                  </button>

                  <!-- Distinctive Start Your Order Button (Guest CTA) -->
                  ${
                    !user
                      ? `
                        <a href="menu.html" class="btn-start-order">
                          Start Your Order →
                        </a>
                      `
                      : ''
                  }
                `
                : ''
            }

            ${
              user
                ? `
                  <div class="user-menu-wrap" id="userMenuWrap">
                    <button type="button" class="user-pill-btn" id="userMenuBtn" aria-haspopup="true" aria-expanded="false" title="Account Menu">
                      <span>👤 ${user.role === 'admin' ? 'Operations' : escapeHtml(user.name.split(' ')[0])}</span>
                      <span class="role-tag ${user.role === 'admin' ? 'admin' : ''}">${escapeHtml(user.role)}</span>
                      <span style="font-size:0.62rem;opacity:0.75;margin-left:2px;">▼</span>
                    </button>
                    <div class="user-dropdown-menu" id="userDropdownMenu">
                      <div class="user-dropdown-header">
                        <strong>${escapeHtml(user.name)}</strong>
                        <span>${escapeHtml(user.email)}</span>
                      </div>
                      <div class="user-dropdown-divider"></div>
                      ${
                        user.role === 'admin'
                          ? `
                            <a href="admin-dashboard.html" class="user-dropdown-item">⚡ Operations Dashboard</a>
                            <a href="menu.html" class="user-dropdown-item">🍔 Customer Menu</a>
                          `
                          : `
                            <a href="order-history.html" class="user-dropdown-item">📜 Order History</a>
                            <a href="my-orders.html" class="user-dropdown-item">📍 Live Order Tracker</a>
                            <a href="cart.html" class="user-dropdown-item">🛍️ My Food Bag</a>
                          `
                      }
                      <div class="user-dropdown-divider"></div>
                      <button type="button" class="user-dropdown-item logout-item" id="headerLogoutBtn">✕ Sign Out</button>
                    </div>
                  </div>
                `
                : `
                  <a href="login.html" class="btn btn-ghost btn-sm">Sign In</a>
                `
            }

            <!-- Mobile Hamburger Menu Button -->
            <button type="button" class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle Navigation">☰</button>
          </div>
        </div>
      </header>
    `;

    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('mainNavLinks');
    if (mobileBtn && navLinks) {
      mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('mobile-open');
        mobileBtn.setAttribute('aria-expanded', String(isOpen));
      });

      navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('mobile-open');
          mobileBtn.setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !mobileBtn.contains(e.target)) {
          navLinks.classList.remove('mobile-open');
          mobileBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    if (userMenuBtn && userDropdownMenu) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = userDropdownMenu.classList.toggle('active');
        userMenuBtn.setAttribute('aria-expanded', String(isOpen));
      });

      document.addEventListener('click', (e) => {
        if (!userDropdownMenu.contains(e.target) && !userMenuBtn.contains(e.target)) {
          userDropdownMenu.classList.remove('active');
          userMenuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    const logoutBtn = document.getElementById('headerLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await API.logout();
      });
    }

    const cartBtn = document.getElementById('openCartDrawerBtn');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => {
        openSlideOverDrawer();
      });
    }
  }

  // ==========================================================================
  // SLIDE-OVER GRILL THRILL BAG DRAWER
  // ==========================================================================

  function renderSlideOverDrawer() {
    let backdrop = document.getElementById('grillThrillDrawerBackdrop');
    let drawer = document.getElementById('grillThrillDrawerPanel');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'grillThrillDrawerBackdrop';
      backdrop.className = 'cart-drawer-backdrop';
      document.body.appendChild(backdrop);

      backdrop.addEventListener('click', closeSlideOverDrawer);
    }

    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'grillThrillDrawerPanel';
      drawer.className = 'cart-drawer';
      document.body.appendChild(drawer);
    }

    const summary = calculateCartSummary();
    const pct = Math.min(100, Math.round((summary.subtotal / summary.freeDeliveryThreshold) * 100));

    drawer.innerHTML = `
      <div class="cart-drawer-header">
        <h3>🛍️ Your Grill Thrill Bag <span style="font-size:0.85rem;color:var(--bunora-charcoal-muted);font-weight:700;">(${summary.totalItems})</span></h3>
        <button type="button" class="cart-drawer-close" id="closeDrawerBtn" aria-label="Close Bag">✕</button>
      </div>

      <div class="free-del-progress-card">
        <div class="progress-label-row">
          <span>${
            summary.subtotal >= summary.freeDeliveryThreshold
              ? '🎉 Free Express Delivery Unlocked!'
              : `Add ${formatCurrency(summary.amountForFreeDelivery)} more for Free Delivery`
          }</span>
          <strong>${pct}%</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%;"></div>
        </div>
      </div>

      <div class="cart-drawer-items" id="drawerItemsList">
        ${
          !summary.items.length
            ? `
              <div style="text-align:center;padding:3rem 1rem;color:var(--bunora-charcoal-muted);">
                <div style="font-size:3rem;margin-bottom:0.75rem;">🍔</div>
                <h4 style="color:var(--bunora-forest-900);font-size:1.15rem;margin-bottom:0.4rem;">Your Grill Thrill Bag is empty</h4>
                <p style="font-size:0.88rem;margin-bottom:1.25rem;">Explore our signature flame brioche burgers and crispy sides.</p>
                <a href="menu.html" class="btn btn-primary btn-sm" onclick="closeSlideOverDrawer()">Explore Menu →</a>
              </div>
            `
            : summary.items
                .map(
                  (item) => `
                    <div class="cart-line-item">
                      <img
                        src="${escapeHtml(item.image_url || '')}"
                        alt="${escapeHtml(item.name)}"
                        class="cart-item-thumb"
                        onerror="this.onerror=null;this.src='${fallbackImage(item.name)}';"
                      />
                      <div class="cart-item-info">
                        <h4>${escapeHtml(item.name)}</h4>
                        <div class="cart-item-price">${formatCurrency(item.price)} × ${item.quantity} = <strong>${formatCurrency(item.lineTotal)}</strong></div>
                      </div>
                      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.35rem;">
                        <div class="qty-stepper">
                          <button type="button" class="stepper-btn" data-drawer-dec="${item.id}">−</button>
                          <span class="stepper-val">${item.quantity}</span>
                          <button type="button" class="stepper-btn" data-drawer-inc="${item.id}">+</button>
                        </div>
                        <button type="button" data-drawer-remove="${item.id}" style="background:none;border:none;color:var(--bunora-coral-600);font-size:0.76rem;cursor:pointer;font-weight:700;">Remove</button>
                      </div>
                    </div>
                  `
                )
                .join('')
        }
      </div>

      ${
        summary.items.length
          ? `
            <div class="cart-drawer-footer">
              <div class="summary-row">
                <span>Subtotal (${summary.totalItems} items)</span>
                <strong>${formatCurrency(summary.subtotal)}</strong>
              </div>
              ${
                summary.discount > 0
                  ? `
                    <div class="summary-row" style="color:var(--bunora-forest-600);font-weight:700;">
                      <span>Discount (${summary.promo})</span>
                      <span>−${formatCurrency(summary.discount)}</span>
                    </div>
                  `
                  : ''
              }
              <div class="summary-row">
                <span>Express Delivery</span>
                <strong>${summary.deliveryFee === 0 ? '<span style="color:var(--bunora-forest-600);">FREE</span>' : formatCurrency(summary.deliveryFee)}</strong>
              </div>
              <div class="summary-row total-row">
                <span>Total Amount</span>
                <span>${formatCurrency(summary.total)}</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1.25fr;gap:0.75rem;">
                <a href="cart.html" class="btn btn-secondary btn-sm" onclick="closeSlideOverDrawer()">View Bag</a>
                <a href="checkout.html" class="btn btn-primary btn-sm" onclick="closeSlideOverDrawer()">Checkout →</a>
              </div>
            </div>
          `
          : ''
      }
    `;

    const closeBtn = document.getElementById('closeDrawerBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeSlideOverDrawer);

    drawer.querySelectorAll('[data-drawer-inc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-drawer-inc'));
        updateCartQty(id, getItemQtyInCart(id) + 1);
      });
    });

    drawer.querySelectorAll('[data-drawer-dec]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-drawer-dec'));
        updateCartQty(id, getItemQtyInCart(id) - 1);
      });
    });

    drawer.querySelectorAll('[data-drawer-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-drawer-remove'));
        updateCartQty(id, 0);
      });
    });
  }

  function openSlideOverDrawer() {
    renderSlideOverDrawer();
    const backdrop = document.getElementById('grillThrillDrawerBackdrop');
    const drawer = document.getElementById('grillThrillDrawerPanel');
    if (backdrop && drawer) {
      backdrop.classList.add('active');
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeSlideOverDrawer() {
    const backdrop = document.getElementById('grillThrillDrawerBackdrop');
    const drawer = document.getElementById('grillThrillDrawerPanel');
    if (backdrop && drawer) {
      backdrop.classList.remove('active');
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // ==========================================================================
  // FOOTER RENDERING
  // ==========================================================================

  function renderGlobalFooter() {
    const footerMount = document.getElementById('globalFooter');
    if (!footerMount) return;

    footerMount.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <!-- Brand Column -->
            <div class="footer-col">
              <div class="brand-logo" style="margin-bottom:1.15rem;">
                <div class="brand-emblem">
                  ${GRILL_THRILL_LOGO_SVG}
                </div>
                <div class="brand-text-wrap">
                  <span class="brand-title" style="color:var(--bunora-cream-base);">Grill Thrill<span class="brand-dot">.</span></span>
                  <span class="brand-tagline" style="color:var(--bunora-forest-300);">Big Cravings. Fresh Bites.</span>
                </div>
              </div>
              <p style="font-size:0.9rem;color:rgba(255,247,233,0.78);margin-bottom:1.25rem;line-height:1.65;">
                Crafted for food lovers with honest ingredients, slow-roasted toppings, house-baked brioche, and flame-grilled kitchen craft. Rushed hot to your doorstep.
              </p>
              <div class="footer-social-row">
                <a href="#social" class="social-icon-btn" aria-label="Instagram">📸</a>
                <a href="#social" class="social-icon-btn" aria-label="X Twitter">🐦</a>
                <a href="#social" class="social-icon-btn" aria-label="LinkedIn">💼</a>
                <a href="#social" class="social-icon-btn" aria-label="YouTube">▶️</a>
              </div>
              <div style="margin-top:1.5rem;">
                <button type="button" id="resetDemoDataBtn" class="btn btn-ghost btn-sm" style="color:var(--bunora-forest-300);border-color:rgba(87,166,147,0.35);font-size:0.8rem;">
                  ↻ Reset Grill Thrill Demo Catalog (₹)
                </button>
              </div>
            </div>

            <!-- Categories -->
            <div class="footer-col">
              <h4>Explore Flavors</h4>
              <ul class="footer-links">
                <li><a href="menu.html?cat=1">Signature Burgers</a></li>
                <li><a href="menu.html?cat=2">Crispy Sides & Fries</a></li>
                <li><a href="menu.html?cat=3">Cool Hand-Spun Drinks</a></li>
                <li><a href="menu.html?cat=4">Artisanal Desserts</a></li>
                <li><a href="menu.html?cat=5">Meal Combos & Feast Boxes</a></li>
              </ul>
            </div>

            <!-- Quick Links -->
            <div class="footer-col">
              <h4>Quick Links</h4>
              <ul class="footer-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="menu.html">Explore Menu</a></li>
                <li><a href="index.html#our-story">Our Story</a></li>
                <li><a href="index.html#contact">Contact & Kitchens</a></li>
                <li><a href="cart.html">View Grill Thrill Bag</a></li>
                <li><a href="order-history.html">Order History</a></li>
                <li><a href="my-orders.html">Live Order Tracker</a></li>
                <li><a href="admin-dashboard.html">Operations Portal</a></li>
              </ul>
            </div>

            <!-- Kitchen Contact -->
            <div class="footer-col">
              <h4>Kitchen & Support</h4>
              <p style="font-size:0.88rem;color:rgba(255,247,233,0.78);line-height:1.6;margin-bottom:0.75rem;">
                📍Morabadi, Ranchi,Jharkhand, 834008
              </p>
              <p style="font-size:0.88rem;color:rgba(255,247,233,0.78);line-height:1.6;margin-bottom:0.75rem;">
                📞 +91 7481970115<br />
                ✉️ hello@grillthrill.kitchen
              </p>
              <p style="font-size:0.84rem;color:var(--bunora-forest-300);font-weight:700;">
                🕒 Kitchen Hours: 11:00 AM – 11:30 PM (Daily)
              </p>
            </div>
          </div>

          <!-- Bottom Disclaimer Bar -->
          <div class="footer-bottom-bar">
            <div class="footer-disclaimer-note">
              <strong>🎓 Student Project Disclaimer:</strong> Grill Thrill is an educational student project created for UI/UX design and full-stack software demonstration. It is not an active commercial food establishment.
            </div>
            <div>
              &copy; 2026 Grill Thrill Kitchen. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    `;

    const resetBtn = document.getElementById('resetDemoDataBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset Grill Thrill catalog to original seed data with ₹ INR pricing?')) {
          resetDemoCatalog();
        }
      });
    }
  }

  // ==========================================================================
  // INITIALIZATION ON DOM READY
  // ==========================================================================

  document.addEventListener('DOMContentLoaded', () => {
    // Ensure fallback local storage exists
    getLocalDB();
    renderGlobalHeader();
    renderGlobalFooter();
    renderSlideOverDrawer();
  });

  // Export public Grill Thrill API to global window object (with Bunora alias for backwards compatibility)
  const GrillThrillEngine = {
    API,
    getLocalDB,
    saveLocalDB,
    resetDemoCatalog,
    getCurrentUser,
    setCurrentUser,
    getCart,
    saveCart,
    addToCart,
    updateCartQty,
    getItemQtyInCart,
    getAppliedPromo,
    setAppliedPromo,
    calculateCartSummary,
    formatCurrency,
    showToast,
    escapeHtml,
    fallbackImage,
    openSlideOverDrawer,
    closeSlideOverDrawer,
    renderGlobalHeader,
    renderGlobalFooter,
    getMyOrders: API.getMyOrders,
    getOrderDetails: API.getOrderDetails
  };

  window.GrillThrill = GrillThrillEngine;
  window.Bunora = GrillThrillEngine; // Backwards compatibility alias
})();
