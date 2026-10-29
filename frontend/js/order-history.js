/**
 * ============================================================================
 * GRILL THRILL CUSTOMER ORDER HISTORY CONTROLLER (js/order-history.js)
 * Manages customer order records, status filtering, real-time search,
 * detailed receipt inspection modal, and 1-click reorder capability.
 * ============================================================================
 */

(function () {
  'use strict';

  let allOrders = [];
  let currentFilter = 'all'; // 'all' | 'active' | 'delivered' | 'cancelled'
  let searchQuery = '';
  let sortBy = 'newest'; // 'newest' | 'oldest' | 'amount-desc' | 'amount-asc'

  const ACTIVE_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery'];

  async function initOrderHistoryPage() {
    const mount = document.getElementById('orderHistoryMount');
    if (!mount) return;

    const currentApp = window.GrillThrill || window.Bunora;
    const user = currentApp.getCurrentUser();

    // 1. Enforce Customer Authentication
    if (!user) {
      mount.innerHTML = `
        <div class="empty-state-box" style="margin:3rem auto;max-width:620px;">
          <div class="empty-state-icon">🔒</div>
          <h2>Sign In to View Your Order History</h2>
          <p>
            Customer accounts protect your order history and enable 1-click reordering. Sign in or use the demo customer account below to view past receipts.
          </p>
          <div style="display:flex;gap:0.85rem;justify-content:center;flex-wrap:wrap;margin-top:0.75rem;">
            <button type="button" class="btn btn-primary" id="historyDemoCustomerBtn">
              ⚡ 1-Click Demo Customer Access
            </button>
            <a href="login.html?redirect=order-history.html" class="btn btn-secondary">
              Sign In
            </a>
          </div>
        </div>
      `;

      document.getElementById('historyDemoCustomerBtn')?.addEventListener('click', async () => {
        try {
          await currentApp.API.login('customer@burgerking.edu', 'Customer@123');
          currentApp.renderGlobalHeader();
          initOrderHistoryPage();
        } catch (err) {
          currentApp.showToast(err.message || 'Login failed', 'error');
        }
      });
      return;
    }

    // 2. Fetch authenticated customer's orders
    mount.innerHTML = `
      <div style="text-align:center;padding:4rem 1rem;color:var(--bunora-charcoal-muted);">
        <div style="font-size:2.5rem;margin-bottom:0.75rem;animation:pulse 1.5s infinite;">⏳</div>
        <p style="font-weight:700;">Retrieving your order history...</p>
      </div>
    `;

    try {
      allOrders = await currentApp.API.getMyOrders();
      renderOrderHistoryView(mount);
    } catch (err) {
      mount.innerHTML = `
        <div class="cart-card-surface" style="text-align:center;padding:3rem 1.5rem;max-width:600px;margin:2rem auto;">
          <div style="font-size:2.5rem;margin-bottom:0.75rem;">⚠️</div>
          <h3 style="color:var(--bunora-coral-600);margin-bottom:0.5rem;">Unable to Load Orders</h3>
          <p style="color:var(--bunora-charcoal-muted);">${currentApp.escapeHtml(err.message || 'Network error')}</p>
          <button type="button" class="btn btn-secondary btn-sm" id="retryFetchBtn" style="margin-top:1rem;">
            ↻ Retry
          </button>
        </div>
      `;
      document.getElementById('retryFetchBtn')?.addEventListener('click', initOrderHistoryPage);
    }
  }

  function getStatusClass(status) {
    const s = String(status || '').toLowerCase().replace(/\s+/g, '-');
    return `status-${s}`;
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'Delivered': return '✓';
      case 'Out for Delivery': return '🛵';
      case 'Preparing': return '🍳';
      case 'Confirmed': return '✓';
      case 'Cancelled': return '✕';
      default: return '⏳';
    }
  }

  function getPaymentStatusClass(payStatus) {
    const p = String(payStatus || '').toLowerCase();
    if (p === 'paid') return 'pay-paid';
    if (p === 'cancelled') return 'pay-cancelled';
    return 'pay-pending';
  }

  function formatPaymentMethod(method) {
    if (!method) return '💵 Cash on Delivery';
    const m = String(method).toLowerCase();
    if (m.includes('upi') || m.includes('online')) {
      return '📱 UPI / Online';
    }
    return '💵 Cash on Delivery (COD)';
  }

  function getItemImage(menuItemId, fallbackName) {
    const currentApp = window.GrillThrill || window.Bunora;
    const db = currentApp.getLocalDB();
    const match = (db.menu_items || []).find((m) => Number(m.id) === Number(menuItemId));
    if (match && match.image_url) {
      return match.image_url;
    }
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=120&q=80';
  }

  function computeFilterCounts(orders) {
    return {
      all: orders.length,
      active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
      delivered: orders.filter((o) => o.status === 'Delivered').length,
      cancelled: orders.filter((o) => o.status === 'Cancelled').length
    };
  }

  function getFilteredAndSortedOrders() {
    let list = [...allOrders];

    // Filter by Tab
    if (currentFilter === 'active') {
      list = list.filter((o) => ACTIVE_STATUSES.includes(o.status));
    } else if (currentFilter === 'delivered') {
      list = list.filter((o) => o.status === 'Delivered');
    } else if (currentFilter === 'cancelled') {
      list = list.filter((o) => o.status === 'Cancelled');
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((o) => {
        const orderIdMatch = String(o.id).toLowerCase().includes(q) || `grill-${o.id}`.includes(q);
        const addressMatch = (o.delivery_address || '').toLowerCase().includes(q);
        const itemMatch = (o.items || []).some((i) => (i.name || '').toLowerCase().includes(q));
        const paymentMatch = (o.payment_method || '').toLowerCase().includes(q);
        return orderIdMatch || addressMatch || itemMatch || paymentMatch;
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'amount-desc') {
        return Number(b.total_amount) - Number(a.total_amount);
      }
      if (sortBy === 'amount-asc') {
        return Number(a.total_amount) - Number(b.total_amount);
      }
      // default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }

  function renderOrderHistoryView(mount) {
    const currentApp = window.GrillThrill || window.Bunora;
    const user = currentApp.getCurrentUser();

    if (!allOrders || allOrders.length === 0) {
      mount.innerHTML = `
        <div class="empty-state-box" style="margin:2.5rem auto;max-width:620px;">
          <div class="empty-state-icon">📦</div>
          <h2>No Previous Orders Placed</h2>
          <p>
            You haven't placed any orders with Grill Thrill yet. Taste our artisanal flame brioche burgers and combos today!
          </p>
          <a href="menu.html" class="btn btn-primary btn-lg" style="margin-top:0.75rem;">
            Explore Menu &amp; Order →
          </a>
        </div>
      `;
      return;
    }

    const counts = computeFilterCounts(allOrders);
    const displayedOrders = getFilteredAndSortedOrders();

    mount.innerHTML = `
      <!-- Customer Greeting & Stats Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.75rem;">
        <div>
          <span style="font-size:0.78rem;font-weight:800;color:var(--bunora-coral-500);text-transform:uppercase;letter-spacing:0.08em;">
            Customer Portal
          </span>
          <h2 style="font-size:1.65rem;color:var(--bunora-forest-900);line-height:1.2;margin:2px 0 0 0;">
            Welcome back, ${currentApp.escapeHtml(user.name || 'Food Lover')}!
          </h2>
          <p style="font-size:0.86rem;color:var(--bunora-charcoal-muted);margin:0;">
            Showing your personal orders (${displayedOrders.length} of ${allOrders.length} total)
          </p>
        </div>

        <div style="display:flex;align-items:center;gap:0.75rem;">
          <a href="my-orders.html" class="btn btn-forest btn-sm">
            📍 Live Kitchen Tracker
          </a>
          <a href="menu.html" class="btn btn-primary btn-sm">
            + New Order
          </a>
        </div>
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="history-toolbar">
        <!-- Filter Tabs -->
        <div class="history-filter-tabs" role="tablist" aria-label="Filter Orders by Status">
          <button type="button" class="history-filter-tab ${currentFilter === 'all' ? 'active' : ''}" data-filter="all" role="tab">
            All Orders <span class="filter-count-badge">${counts.all}</span>
          </button>
          <button type="button" class="history-filter-tab ${currentFilter === 'active' ? 'active' : ''}" data-filter="active" role="tab">
            Active Orders <span class="filter-count-badge">${counts.active}</span>
          </button>
          <button type="button" class="history-filter-tab ${currentFilter === 'delivered' ? 'active' : ''}" data-filter="delivered" role="tab">
            Delivered <span class="filter-count-badge">${counts.delivered}</span>
          </button>
          <button type="button" class="history-filter-tab ${currentFilter === 'cancelled' ? 'active' : ''}" data-filter="cancelled" role="tab">
            Cancelled <span class="filter-count-badge">${counts.cancelled}</span>
          </button>
        </div>

        <!-- Search & Sort Row -->
        <div class="history-search-row">
          <div class="search-input-wrap" style="max-width:none;">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              id="historySearchInput"
              placeholder="Search by order #, item name, address..."
              value="${currentApp.escapeHtml(searchQuery)}"
              aria-label="Search Orders"
            />
          </div>

          <div style="min-width:160px;flex-shrink:0;">
            <select id="historySortSelect" class="form-control" style="padding:0.65rem 0.85rem;font-size:0.86rem;border-radius:var(--radius-pill);" aria-label="Sort Orders">
              <option value="newest" ${sortBy === 'newest' ? 'selected' : ''}>Newest First</option>
              <option value="oldest" ${sortBy === 'oldest' ? 'selected' : ''}>Oldest First</option>
              <option value="amount-desc" ${sortBy === 'amount-desc' ? 'selected' : ''}>Highest Amount</option>
              <option value="amount-asc" ${sortBy === 'amount-asc' ? 'selected' : ''}>Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Orders List Container -->
      <div id="historyOrdersList" style="display:flex;flex-direction:column;gap:1.5rem;">
        ${displayedOrders.length === 0 ? renderNoMatchState() : displayedOrders.map((order) => renderOrderCard(order)).join('')}
      </div>
    `;

    bindToolbarEvents(mount);
    bindCardActionEvents(mount);
  }

  function renderNoMatchState() {
    return `
      <div class="cart-card-surface" style="text-align:center;padding:3rem 1.5rem;margin:1rem 0;">
        <div style="font-size:2.5rem;margin-bottom:0.75rem;">🔍</div>
        <h3 style="color:var(--bunora-forest-900);margin-bottom:0.45rem;">No Orders Found</h3>
        <p style="color:var(--bunora-charcoal-muted);font-size:0.92rem;max-width:440px;margin:0 auto 1.25rem;">
          No orders match your selected filter or search keyword. Try clearing search or selecting a different tab.
        </p>
        <button type="button" class="btn btn-secondary btn-sm" id="resetHistoryFilterBtn">
          Clear Filters
        </button>
      </div>
    `;
  }

  function renderOrderCard(order) {
    const currentApp = window.GrillThrill || window.Bunora;
    const dateStr = new Date(order.created_at).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const isDelivered = order.status === 'Delivered';
    const isActive = ACTIVE_STATUSES.includes(order.status);
    const payStatus = order.payment_status || (isDelivered ? 'Paid' : 'Pending');
    const payMethod = order.payment_method || 'COD';
    const items = order.items || [];
    const totalItemQty = items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);

    return `
      <div class="history-order-card" id="historyCard-${order.id}">
        <!-- Card Header -->
        <div class="history-card-header">
          <div>
            <div style="display:flex;align-items:center;gap:0.65rem;flex-wrap:wrap;margin-bottom:0.25rem;">
              <span style="font-family:var(--font-display);font-size:1.35rem;font-weight:900;color:var(--bunora-forest-900);">
                Order #GRILL-${order.id}
              </span>
              <span class="status-pill ${getStatusClass(order.status)}">
                ${getStatusIcon(order.status)} ${currentApp.escapeHtml(order.status)}
              </span>
              <span class="pay-pill ${getPaymentStatusClass(payStatus)}">
                ${currentApp.escapeHtml(payStatus)}
              </span>
            </div>
            <div class="history-card-meta">
              <span class="history-meta-tag">
                📅 ${dateStr}
              </span>
              <span class="history-meta-tag">
                ${formatPaymentMethod(payMethod)}
              </span>
              <span class="history-meta-tag">
                📦 ${totalItemQty} ${totalItemQty === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          <!-- Total Amount display -->
          <div class="history-total-block" style="text-align:right;">
            <span class="history-total-label">Total Amount</span>
            <span class="history-total-val">${currentApp.formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        <!-- Food Items Preview Grid -->
        <div class="history-items-grid">
          ${items.slice(0, 4).map((i) => {
            const thumb = getItemImage(i.menu_item_id, i.name);
            return `
              <div class="history-item-row">
                <img
                  src="${thumb}"
                  alt="${currentApp.escapeHtml(i.name || 'Food item')}"
                  class="history-item-thumb"
                  loading="lazy"
                  onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=120&q=80'"
                />
                <div style="min-width:0;flex-grow:1;">
                  <div style="font-size:0.86rem;font-weight:700;color:var(--bunora-forest-900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${i.quantity} × ${currentApp.escapeHtml(i.name || `Item #${i.menu_item_id}`)}
                  </div>
                  <div style="font-size:0.78rem;color:var(--bunora-charcoal-muted);">
                    ${currentApp.formatCurrency(i.unit_price)} each
                  </div>
                </div>
              </div>
            `;
          }).join('')}
          ${items.length > 4 ? `
            <div style="display:flex;align-items:center;justify-content:center;font-size:0.84rem;font-weight:700;color:var(--bunora-coral-600);background:rgba(235,94,85,0.08);border-radius:10px;padding:0.75rem;">
              + ${items.length - 4} more items
            </div>
          ` : ''}
        </div>

        <!-- Delivery Address Snippet -->
        <div style="font-size:0.82rem;color:var(--bunora-charcoal-muted);margin-bottom:1rem;display:flex;align-items:center;gap:0.4rem;">
          <span>📍</span>
          <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            Delivery to: <strong style="color:var(--bunora-forest-800);">${currentApp.escapeHtml(order.delivery_address || 'Delivery Address')}</strong>
          </span>
        </div>

        <!-- Card Footer Actions -->
        <div class="history-card-footer">
          <div style="font-size:0.84rem;color:var(--bunora-charcoal-muted);">
            ${isActive ? `
              <span style="display:inline-flex;align-items:center;gap:0.4rem;color:var(--bunora-coral-600);font-weight:700;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--bunora-coral-500);animation:pulse 1.2s infinite;"></span>
                Order in kitchen pipeline
              </span>
            ` : isDelivered ? `
              <span style="color:#166534;font-weight:700;">✓ Delivered successfully to your doorstep</span>
            ` : `
              <span style="color:#991B1B;font-weight:700;">✕ Order was cancelled</span>
            `}
          </div>

          <div class="history-btn-group">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              data-view-details="${order.id}"
              aria-label="View receipt for Order #${order.id}"
            >
              👁️ View Details
            </button>

            ${isActive ? `
              <a href="my-orders.html" class="btn btn-forest btn-sm">
                📍 Track Live
              </a>
            ` : ''}

            ${isDelivered ? `
              <button
                type="button"
                class="btn btn-primary btn-sm"
                data-reorder="${order.id}"
                aria-label="Reorder items from Order #${order.id}"
              >
                ↻ Reorder
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function bindToolbarEvents(mount) {
    // 1. Filter tabs
    mount.querySelectorAll('.history-filter-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        currentFilter = tab.getAttribute('data-filter') || 'all';
        renderOrderHistoryView(mount);
      });
    });

    // 2. Search Input with instant debounce
    const searchInput = mount.querySelector('#historySearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        const displayed = getFilteredAndSortedOrders();
        const listContainer = mount.querySelector('#historyOrdersList');
        if (listContainer) {
          listContainer.innerHTML = displayed.length === 0
            ? renderNoMatchState()
            : displayed.map((order) => renderOrderCard(order)).join('');
          bindCardActionEvents(mount);
        }
      });
    }

    // 3. Sort Select
    const sortSelect = mount.querySelector('#historySortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        renderOrderHistoryView(mount);
      });
    }

    // 4. Reset Filter Button in no match state
    mount.querySelector('#resetHistoryFilterBtn')?.addEventListener('click', () => {
      currentFilter = 'all';
      searchQuery = '';
      renderOrderHistoryView(mount);
    });
  }

  function bindCardActionEvents(mount) {
    const currentApp = window.GrillThrill || window.Bunora;

    // View Details Button
    mount.querySelectorAll('[data-view-details]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const orderId = Number(btn.getAttribute('data-view-details'));
        openOrderDetailsModal(orderId);
      });
    });

    // Reorder Button (Requirement 6: Delivered orders)
    mount.querySelectorAll('[data-reorder]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const orderId = Number(btn.getAttribute('data-reorder'));
        executeReorder(orderId);
      });
    });
  }

  function executeReorder(orderId) {
    const currentApp = window.GrillThrill || window.Bunora;
    const targetOrder = allOrders.find((o) => Number(o.id) === Number(orderId));
    if (!targetOrder || !targetOrder.items || targetOrder.items.length === 0) {
      currentApp.showToast('No items found to reorder.', 'error');
      return;
    }

    const db = currentApp.getLocalDB();
    let addedCount = 0;

    for (const item of targetOrder.items) {
      // Find matching item in catalog
      const menuItem = (db.menu_items || []).find((m) => Number(m.id) === Number(item.menu_item_id));
      if (menuItem) {
        currentApp.addToCart(menuItem, Number(item.quantity) || 1);
        addedCount++;
      } else {
        // Fallback: construct lightweight item if catalog item ID changed
        currentApp.addToCart(
          {
            id: item.menu_item_id,
            name: item.name,
            price: item.unit_price,
            image_url: getItemImage(item.menu_item_id, item.name)
          },
          Number(item.quantity) || 1
        );
        addedCount++;
      }
    }

    currentApp.showToast(`Added ${addedCount} ${addedCount === 1 ? 'item' : 'items'} from Order #GRILL-${orderId} to your bag!`, 'success');
    currentApp.openSlideOverDrawer();
  }

  async function openOrderDetailsModal(orderId) {
    const currentApp = window.GrillThrill || window.Bunora;
    const backdrop = document.getElementById('historyModalBackdrop');
    const modal = document.getElementById('historyOrderModal');
    if (!backdrop || !modal) return;

    // Fetch details securely via API
    let order = allOrders.find((o) => Number(o.id) === Number(orderId));
    try {
      if (currentApp.API.getOrderDetails) {
        const fresh = await currentApp.API.getOrderDetails(orderId);
        if (fresh) order = fresh;
      }
    } catch (e) {
      // Use in-memory order if network call fails
    }

    if (!order) {
      currentApp.showToast('Could not load order details.', 'error');
      return;
    }

    const dateStr = new Date(order.created_at).toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const isDelivered = order.status === 'Delivered';
    const isActive = ACTIVE_STATUSES.includes(order.status);
    const payStatus = order.payment_status || (isDelivered ? 'Paid' : 'Pending');
    const payMethod = order.payment_method || 'COD';
    const items = order.items || [];
    const itemsSubtotal = items.reduce((sum, i) => sum + (Number(i.unit_price) * Number(i.quantity)), 0);

    modal.innerHTML = `
      <div style="position:relative;">
        <!-- Header -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding-bottom:1.25rem;border-bottom:1px solid var(--bunora-cream-border);">
          <div>
            <span style="font-size:0.75rem;font-weight:800;color:var(--bunora-coral-500);text-transform:uppercase;letter-spacing:0.08em;">
              OFFICIAL RECEIPT
            </span>
            <h2 style="font-size:1.75rem;color:var(--bunora-forest-900);line-height:1.2;margin:2px 0;">
              Order #GRILL-${order.id}
            </h2>
            <span style="font-size:0.84rem;color:var(--bunora-charcoal-muted);">${dateStr}</span>
          </div>

          <button
            type="button"
            id="closeHistoryModalBtn"
            class="modal-close-btn"
            aria-label="Close Receipt Modal"
            style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--bunora-charcoal-muted);line-height:1;"
          >
            ✕
          </button>
        </div>

        <!-- Meta Grid -->
        <div class="order-detail-meta-grid">
          <div class="order-detail-meta-item">
            <strong>Order Status</strong>
            <span class="status-pill ${getStatusClass(order.status)}" style="margin-top:4px;">
              ${getStatusIcon(order.status)} ${currentApp.escapeHtml(order.status)}
            </span>
          </div>
          <div class="order-detail-meta-item">
            <strong>Payment Status</strong>
            <span class="pay-pill ${getPaymentStatusClass(payStatus)}" style="margin-top:4px;">
              ${currentApp.escapeHtml(payStatus)}
            </span>
          </div>
          <div class="order-detail-meta-item">
            <strong>Payment Method</strong>
            <span>${formatPaymentMethod(payMethod)}</span>
          </div>
          <div class="order-detail-meta-item">
            <strong>Estimated Dispatch</strong>
            <span>${isDelivered ? 'Fulfilled' : '~25 Minutes'}</span>
          </div>
          <div class="order-detail-meta-item" style="grid-column:1 / -1;">
            <strong>Delivery Destination</strong>
            <span>${currentApp.escapeHtml(order.delivery_address || 'Customer Address')}</span>
          </div>
        </div>

        <!-- Food Items Table -->
        <div style="margin:1.5rem 0;">
          <h4 style="font-size:0.95rem;color:var(--bunora-forest-900);margin-bottom:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">
            Ordered Items Breakdown
          </h4>
          <div style="background:var(--bunora-cream-base);border-radius:12px;border:1px solid var(--bunora-cream-border);overflow:hidden;">
            <table style="width:100%;border-collapse:collapse;font-size:0.88rem;">
              <thead>
                <tr style="background:var(--bunora-cream-surface);border-bottom:1px solid var(--bunora-cream-border);color:var(--bunora-forest-900);text-align:left;">
                  <th style="padding:0.75rem 1rem;">Item</th>
                  <th style="padding:0.75rem 0.5rem;text-align:center;">Qty</th>
                  <th style="padding:0.75rem 0.5rem;text-align:right;">Price</th>
                  <th style="padding:0.75rem 1rem;text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((i) => {
                  const lineTotal = Number(i.unit_price) * Number(i.quantity);
                  const thumb = getItemImage(i.menu_item_id, i.name);
                  return `
                    <tr style="border-bottom:1px solid var(--bunora-cream-border);">
                      <td style="padding:0.75rem 1rem;">
                        <div style="display:flex;align-items:center;gap:0.75rem;">
                          <img
                            src="${thumb}"
                            alt="${currentApp.escapeHtml(i.name || '')}"
                            style="width:36px;height:36px;border-radius:6px;object-fit:cover;"
                            onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=120&q=80'"
                          />
                          <strong style="color:var(--bunora-forest-900);">${currentApp.escapeHtml(i.name || `Item #${i.menu_item_id}`)}</strong>
                        </div>
                      </td>
                      <td style="padding:0.75rem 0.5rem;text-align:center;font-weight:700;">
                        ${i.quantity}
                      </td>
                      <td style="padding:0.75rem 0.5rem;text-align:right;color:var(--bunora-charcoal-muted);">
                        ${currentApp.formatCurrency(i.unit_price)}
                      </td>
                      <td style="padding:0.75rem 1rem;text-align:right;font-weight:800;color:var(--bunora-forest-900);">
                        ${currentApp.formatCurrency(lineTotal)}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Receipt Financial Summary -->
        <div style="background:#FFFFFF;border:1px solid var(--bunora-cream-border);border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.75rem;font-size:0.88rem;">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.45rem;color:var(--bunora-charcoal-muted);">
            <span>Items Subtotal</span>
            <span>${currentApp.formatCurrency(itemsSubtotal || order.total_amount)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.45rem;color:var(--bunora-charcoal-muted);">
            <span>Standard Express Delivery</span>
            <span style="color:#166534;font-weight:700;">FREE</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding-top:0.65rem;border-top:1px dashed var(--bunora-cream-border);font-family:var(--font-display);font-size:1.25rem;font-weight:900;color:var(--bunora-forest-900);">
            <span>Grand Total</span>
            <span>${currentApp.formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        <!-- Modal Actions -->
        <div style="display:flex;align-items:center;justify-content:flex-end;gap:0.75rem;flex-wrap:wrap;">
          ${isActive ? `
            <a href="my-orders.html" class="btn btn-forest btn-sm">
              📍 Track in Live Orders →
            </a>
          ` : ''}

          ${isDelivered ? `
            <button type="button" class="btn btn-primary btn-sm" id="modalReorderBtn">
              ↻ Reorder This Meal
            </button>
          ` : ''}

          <button type="button" class="btn btn-secondary btn-sm" id="modalDismissBtn">
            Close Receipt
          </button>
        </div>
      </div>
    `;

    backdrop.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    function closeModal() {
      backdrop.classList.remove('active');
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    document.getElementById('closeHistoryModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('modalDismissBtn')?.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal, { once: true });

    document.getElementById('modalReorderBtn')?.addEventListener('click', () => {
      closeModal();
      executeReorder(order.id);
    });
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', initOrderHistoryPage);
})();
