/**
 * ============================================================================
 * GRILL THRILL OPERATIONS COMMAND CONTROLLER (js/admin.js)
 * Manages live kitchen order dispatch queue, status transitions,
 * KPI summary metrics in ₹ INR, and complete menu item CRUD.
 * ============================================================================
 */

(function () {
  const STATUS_OPTIONS = [
    'Pending',
    'Confirmed',
    'Preparing',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  let categories = [];
  let menuItems = [];
  let orders = [];
  let activeTab = 'orders';
  let statusFilter = 'all';

  async function initAdminDashboard() {
    const mount = document.getElementById('adminDashboardMount');
    if (!mount) return;

    const currentApp = window.GrillThrill || window.Bunora;
    const user = currentApp.getCurrentUser();
    if (!user || user.role !== 'admin') {
      mount.innerHTML = `
        <div class="empty-state-box" style="margin:3rem auto;max-width:640px;">
          <div class="empty-state-icon">🔒</div>
          <h2>Administrator Access Required</h2>
          <p>
            ${
              user
                ? `You are signed in as <strong>${currentApp.escapeHtml(user.name)}</strong> (${currentApp.escapeHtml(user.role)}). Operations access requires Administrator credentials.`
                : 'Please sign in with the Grill Thrill Administrator account to manage live orders and menu catalog.'
            }
          </p>
          <div style="display:flex;gap:0.85rem;justify-content:center;flex-wrap:wrap;margin-top:0.75rem;">
            <button type="button" class="btn btn-primary" id="quickAdminDemoLoginBtn">
              ⚡ 1-Click Sign In as Operations Lead
            </button>
            <a href="login.html?redirect=admin-dashboard.html" class="btn btn-secondary">
              Go to Login Page
            </a>
          </div>
        </div>
      `;

      document.getElementById('quickAdminDemoLoginBtn')?.addEventListener('click', async () => {
        await currentApp.API.login('admin@burgerking.edu', 'Admin@123');
        currentApp.renderGlobalHeader();
        currentApp.showToast('Signed in as Grill Thrill Operations Lead!', 'success');
        initAdminDashboard();
      });
      return;
    }

    try {
      const data = await currentApp.API.getAdminDashboard();
      categories = await currentApp.API.getCategories();
      orders = data.orders || [];
      menuItems = data.menu || [];

      renderDashboardUI(mount, data.metrics);
    } catch (err) {
      mount.innerHTML = `
        <div class="cart-card-surface" style="text-align:center;padding:3rem 1.5rem;">
          <p style="color:var(--bunora-coral-600);font-weight:700;">${currentApp.escapeHtml(err.message)}</p>
        </div>
      `;
    }
  }

  function renderDashboardUI(mount, metrics) {
    const currentApp = window.GrillThrill || window.Bunora;
    const totalRev = Number(metrics.total_revenue) || 0;

    mount.innerHTML = `
      <!-- KPI Metric Summary Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-title">Total Revenue (Gross)</span>
          <span class="kpi-val">${currentApp.formatCurrency(totalRev)}</span>
          <span style="font-size:0.78rem;color:var(--bunora-forest-500);font-weight:700;">₹ INR Server-Calculated</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">Active Kitchen Orders</span>
          <span class="kpi-val" style="color:var(--bunora-coral-500);">${metrics.active_orders}</span>
          <span style="font-size:0.78rem;color:var(--bunora-charcoal-muted);font-weight:700;">Pending / Preparing / Dispatch</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">Catalog Menu Items</span>
          <span class="kpi-val">${metrics.total_items}</span>
          <span style="font-size:0.78rem;color:var(--bunora-forest-500);font-weight:700;">Across 5 Categories</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">Sold Out / Unavailable</span>
          <span class="kpi-val" style="color:${metrics.sold_out_items > 0 ? '#DC2626' : 'var(--bunora-forest-800)'};">${metrics.sold_out_items}</span>
          <span style="font-size:0.78rem;color:var(--bunora-charcoal-muted);font-weight:700;">Instant Stock Toggles</span>
        </div>
      </div>

      <!-- Navigation Tabs & Actions Row -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
        <div style="display:inline-flex;gap:0.45rem;background:#FFFFFF;border:1px solid var(--bunora-cream-border);padding:4px;border-radius:var(--radius-pill);">
          <button type="button" class="preset-chip ${activeTab === 'orders' ? 'active' : ''}" id="tabOrdersBtn" style="padding:0.5rem 1.25rem;">
            📋 Live Dispatch Queue (${orders.length})
          </button>
          <button type="button" class="preset-chip ${activeTab === 'menu' ? 'active' : ''}" id="tabMenuBtn" style="padding:0.5rem 1.25rem;">
            🍔 Menu Item Manager (${menuItems.length})
          </button>
        </div>

        ${
          activeTab === 'orders'
            ? `
              <div style="display:flex;align-items:center;gap:0.5rem;">
                <span style="font-size:0.85rem;font-weight:700;color:var(--bunora-charcoal-muted);">Filter Status:</span>
                <select id="adminStatusFilterSelect" class="select-control" style="padding:0.45rem 1rem;">
                  <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Orders (${orders.length})</option>
                  <option value="Active" ${statusFilter === 'Active' ? 'selected' : ''}>Active Orders Only</option>
                  ${STATUS_OPTIONS.map((st) => `<option value="${st}" ${statusFilter === st ? 'selected' : ''}>${st}</option>`).join('')}
                </select>
              </div>
            `
            : `
              <button type="button" class="btn btn-primary btn-sm" id="openAddItemModalBtn">
                + Add New Menu Item
              </button>
            `
        }
      </div>

      <!-- Tab Content Area -->
      <div id="adminTabContentMount">
        ${activeTab === 'orders' ? renderOrdersQueueHTML() : renderMenuManagerHTML()}
      </div>
    `;

    // Bind Tabs
    document.getElementById('tabOrdersBtn')?.addEventListener('click', () => {
      activeTab = 'orders';
      renderDashboardUI(mount, metrics);
    });

    document.getElementById('tabMenuBtn')?.addEventListener('click', () => {
      activeTab = 'menu';
      renderDashboardUI(mount, metrics);
    });

    // Bind Status Filter
    const filterSelect = document.getElementById('adminStatusFilterSelect');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        const container = document.getElementById('adminTabContentMount');
        if (container) container.innerHTML = renderOrdersQueueHTML();
        bindOrderQueueEvents();
      });
    }

    // Bind Add item button
    document.getElementById('openAddItemModalBtn')?.addEventListener('click', () => {
      openItemEditorModal();
    });

    if (activeTab === 'orders') {
      bindOrderQueueEvents();
    } else {
      bindMenuManagerEvents();
    }
  }

  function renderOrdersQueueHTML() {
    const currentApp = window.GrillThrill || window.Bunora;
    let displayOrders = [...orders];

    if (statusFilter === 'Active') {
      displayOrders = displayOrders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status));
    } else if (statusFilter !== 'all') {
      displayOrders = displayOrders.filter((o) => o.status === statusFilter);
    }

    if (displayOrders.length === 0) {
      return `
        <div class="empty-state-box">
          <div class="empty-state-icon">📋</div>
          <h3>No Orders Found</h3>
          <p>No customer orders currently match the selected filter status (${statusFilter}).</p>
        </div>
      `;
    }

    return `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        ${displayOrders
          .map((order) => {
            const dateStr = new Date(order.created_at).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });

            return `
              <div class="cart-card-surface" id="adminOrderRow-${order.id}">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1rem;">
                  <div>
                    <span style="font-size:0.75rem;font-weight:800;color:var(--bunora-coral-500);text-transform:uppercase;">
                      KITCHEN DISPATCH LINE
                    </span>
                    <h3 style="font-size:1.35rem;color:var(--bunora-forest-900);">Order #GRILL-${order.id}</h3>
                    <div style="font-size:0.86rem;color:var(--bunora-charcoal-muted);">
                      Placed by: <strong>${currentApp.escapeHtml(order.customer_name || 'Customer')}</strong> (${currentApp.escapeHtml(order.customer_email || '')}) • ${dateStr}
                    </div>
                  </div>

                  <div style="display:flex;align-items:center;gap:0.75rem;">
                    <label style="font-size:0.82rem;font-weight:700;color:var(--bunora-forest-900);">Transition Status:</label>
                    <select class="select-control admin-status-select" data-order-id="${order.id}">
                      ${STATUS_OPTIONS.map((st) => `<option value="${st}" ${order.status === st ? 'selected' : ''}>${st}</option>`).join('')}
                    </select>
                  </div>
                </div>

                <div style="background:var(--bunora-cream-base);border-radius:12px;padding:1rem;border:1px solid var(--bunora-cream-border);margin-bottom:1rem;font-size:0.88rem;">
                  <strong style="display:block;margin-bottom:0.35rem;color:var(--bunora-forest-800);font-size:0.8rem;text-transform:uppercase;">Items Ordered:</strong>
                  <div style="display:flex;flex-wrap:wrap;gap:0.85rem;">
                    ${(order.items || [])
                      .map((i) => `<span>• ${i.quantity} × ${currentApp.escapeHtml(i.name || `Item #${i.menu_item_id}`)} (${currentApp.formatCurrency(i.unit_price * i.quantity)})</span>`)
                      .join('')}
                  </div>
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.86rem;color:var(--bunora-charcoal-muted);flex-wrap:wrap;gap:0.5rem;">
                  <div>📍 <strong>Address:</strong> ${currentApp.escapeHtml(order.delivery_address)}</div>
                  <div style="font-size:1.15rem;font-weight:900;color:var(--bunora-forest-900);">
                    Total: ${currentApp.formatCurrency(order.total_amount)}
                  </div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  function bindOrderQueueEvents() {
    const currentApp = window.GrillThrill || window.Bunora;

    document.querySelectorAll('.admin-status-select').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const orderId = Number(sel.getAttribute('data-order-id'));
        const newStatus = sel.value;

        try {
          await currentApp.API.adminUpdateOrderStatus(orderId, newStatus);
          currentApp.showToast(`Order #GRILL-${orderId} status set to "${newStatus}"!`, 'success');
        } catch (err) {
          currentApp.showToast('Failed to update status: ' + err.message, 'error');
        }
      });
    });
  }

  function renderMenuManagerHTML() {
    const currentApp = window.GrillThrill || window.Bunora;

    return `
      <div class="admin-items-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(min(100%, 280px), 1fr));gap:1.5rem;">
        ${menuItems
          .map((item) => `
            <div class="cart-card-surface ${!item.is_available ? 'unavailable' : ''}" style="padding:1.35rem;display:flex;flex-direction:column;">
              <div style="display:flex;gap:1rem;margin-bottom:1rem;">
                <img
                  src="${currentApp.escapeHtml(item.image_url || '')}"
                  alt="${currentApp.escapeHtml(item.name)}"
                  style="width:70px;height:70px;border-radius:14px;object-fit:cover;background:var(--bunora-cream-surface);"
                  onerror="this.onerror=null;this.src='${currentApp.fallbackImage(item.name)}';"
                />
                <div style="flex-grow:1;">
                  <span style="font-size:0.74rem;font-weight:700;color:var(--bunora-forest-500);text-transform:uppercase;">${currentApp.escapeHtml(item.category_name || '')}</span>
                  <h4 style="font-size:1.05rem;color:var(--bunora-forest-900);line-height:1.2;margin-bottom:0.25rem;">${currentApp.escapeHtml(item.name)}</h4>
                  <strong style="color:var(--bunora-forest-800);">${currentApp.formatCurrency(item.price)}</strong>
                </div>
              </div>

              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:0.85rem;border-top:1px solid var(--bunora-cream-border);">
                <label style="display:inline-flex;align-items:center;gap:0.4rem;font-size:0.82rem;font-weight:700;cursor:pointer;">
                  <input type="checkbox" class="admin-avail-toggle" data-item-id="${item.id}" ${item.is_available ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--bunora-forest-800);" />
                  <span>${item.is_available ? 'In Stock' : 'Sold Out'}</span>
                </label>

                <div style="display:flex;gap:0.45rem;">
                  <button type="button" class="btn btn-secondary btn-sm" data-edit-item="${item.id}" style="padding:0.4rem 0.85rem;font-size:0.8rem;">
                    ✏️ Edit
                  </button>
                  <button type="button" class="btn btn-ghost btn-sm" data-delete-item="${item.id}" style="padding:0.4rem 0.85rem;font-size:0.8rem;color:#DC2626;border-color:#FCA5A5;">
                    🗑
                  </button>
                </div>
              </div>
            </div>
          `)
          .join('')}
      </div>
    `;
  }

  function bindMenuManagerEvents() {
    const currentApp = window.GrillThrill || window.Bunora;

    // Availability toggles
    document.querySelectorAll('.admin-avail-toggle').forEach((chk) => {
      chk.addEventListener('change', async () => {
        const id = Number(chk.getAttribute('data-item-id'));
        const nextState = chk.checked;
        try {
          await currentApp.API.adminUpdateMenuItem(id, { is_available: nextState });
          currentApp.showToast(`Updated stock availability for Item #${id}`, 'success');
        } catch (err) {
          currentApp.showToast(err.message, 'error');
        }
      });
    });

    // Edit item
    document.querySelectorAll('[data-edit-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-edit-item'));
        const item = menuItems.find((m) => Number(m.id) === id);
        if (item) openItemEditorModal(item);
      });
    });

    // Delete item
    document.querySelectorAll('[data-delete-item]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-delete-item'));
        if (confirm(`Are you sure you want to delete Menu Item #${id}?`)) {
          try {
            await currentApp.API.adminDeleteMenuItem(id);
            currentApp.showToast(`Deleted Item #${id}`, 'info');
            initAdminDashboard();
          } catch (err) {
            currentApp.showToast(err.message, 'error');
          }
        }
      });
    });
  }

  function openItemEditorModal(editingItem = null) {
    const currentApp = window.GrillThrill || window.Bunora;
    const backdrop = document.getElementById('adminModalBackdrop');
    const modal = document.getElementById('adminItemModal');
    if (!backdrop || !modal) return;

    modal.innerHTML = `
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
          <h2 style="font-size:1.6rem;color:var(--bunora-forest-900);">
            ${editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <button type="button" id="closeAdminModalBtn" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--bunora-charcoal-muted);">✕</button>
        </div>

        <form id="adminItemForm">
          <div class="form-group">
            <label class="form-label" for="itemNameField">Dish Name *</label>
            <input type="text" id="itemNameField" class="form-control" required value="${editingItem ? currentApp.escapeHtml(editingItem.name) : ''}" placeholder="e.g., Grill Thrill Truffle Stack" />
          </div>

          <div class="form-row-2col">
            <div class="form-group">
              <label class="form-label" for="itemCatField">Category *</label>
              <select id="itemCatField" class="form-control" required>
                ${categories.map((c) => `<option value="${c.id}" ${editingItem && Number(editingItem.category_id) === Number(c.id) ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="itemPriceField">Price (₹ INR) *</label>
              <input type="number" id="itemPriceField" class="form-control" step="1" min="1" required value="${editingItem ? editingItem.price : '199'}" />
            </div>
          </div>

          <div class="form-row-2col">
            <div class="form-group">
              <label class="form-label" for="itemCaloriesField">Calories (kcal)</label>
              <input type="number" id="itemCaloriesField" class="form-control" value="${editingItem ? editingItem.calories || '' : '650'}" />
            </div>

            <div class="form-group">
              <label class="form-label" for="itemDietField">Dietary Classification</label>
              <select id="itemDietField" class="form-control">
                <option value="veg" ${editingItem && editingItem.is_veg ? 'selected' : ''}>🌱 Vegetarian (Veg)</option>
                <option value="nonveg" ${editingItem && !editingItem.is_veg ? 'selected' : ''}>🍗 Non-Vegetarian</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="itemBadgeField">Promotional Badge</label>
            <input type="text" id="itemBadgeField" class="form-control" placeholder="Bestseller, Chef Special, Spicy, Plant-Based..." value="${editingItem ? currentApp.escapeHtml(editingItem.badge || '') : ''}" />
          </div>

          <div class="form-group">
            <label class="form-label" for="itemImageField">Image URL</label>
            <input type="url" id="itemImageField" class="form-control" placeholder="https://images.unsplash.com/..." value="${editingItem ? currentApp.escapeHtml(editingItem.image_url || '') : ''}" />
          </div>

          <div class="form-group">
            <label class="form-label" for="itemDescField">Description *</label>
            <textarea id="itemDescField" class="form-control" rows="3" required placeholder="Describe ingredients, artisanal toppings, and flavor profile...">${editingItem ? currentApp.escapeHtml(editingItem.description || '') : ''}</textarea>
          </div>

          <div style="display:flex;gap:0.85rem;margin-top:1.5rem;">
            <button type="submit" class="btn btn-primary" style="flex:1;">
              ${editingItem ? 'Save Changes' : 'Create Item'}
            </button>
            <button type="button" class="btn btn-secondary" id="cancelAdminModalBtn">
              Cancel
            </button>
          </div>
        </form>
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

    document.getElementById('closeAdminModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelAdminModalBtn')?.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal, { once: true });

    document.getElementById('adminItemForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const itemPayload = {
        name: document.getElementById('itemNameField').value.trim(),
        category_id: Number(document.getElementById('itemCatField').value),
        price: Number(document.getElementById('itemPriceField').value),
        calories: Number(document.getElementById('itemCaloriesField').value) || null,
        is_veg: document.getElementById('itemDietField').value === 'veg',
        badge: document.getElementById('itemBadgeField').value.trim() || null,
        image_url: document.getElementById('itemImageField').value.trim() || null,
        description: document.getElementById('itemDescField').value.trim()
      };

      try {
        if (editingItem) {
          await currentApp.API.adminUpdateMenuItem(editingItem.id, itemPayload);
          currentApp.showToast(`Updated "${itemPayload.name}"!`, 'success');
        } else {
          await currentApp.API.adminCreateMenuItem(itemPayload);
          currentApp.showToast(`Created new dish "${itemPayload.name}"!`, 'success');
        }
        closeModal();
        initAdminDashboard();
      } catch (err) {
        currentApp.showToast(err.message, 'error');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initAdminDashboard);
})();
