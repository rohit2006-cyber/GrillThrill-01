/**
 * ============================================================================
 * GRILL THRILL ORDERS & LIVE TRACKER CONTROLLER (js/orders.js)
 * Displays customer's orders with a 5-step kitchen dispatch stepper,
 * order receipts, and 1-click reorder functionality.
 * ============================================================================
 */

(function () {
  const STEPS = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

  async function initMyOrdersPage() {
    const mount = document.getElementById('myOrdersMount');
    if (!mount) return;

    const currentApp = window.GrillThrill || window.Bunora;
    const user = currentApp.getCurrentUser();
    if (!user) {
      mount.innerHTML = `
        <div class="empty-state-box" style="margin:3rem auto;max-width:620px;">
          <div class="empty-state-icon">🔒</div>
          <h2>Sign In to View Your Orders</h2>
          <p>
            Customer accounts protect your order history and allow live dispatch tracking. Sign in or click demo customer login below.
          </p>
          <div style="display:flex;gap:0.85rem;justify-content:center;flex-wrap:wrap;margin-top:0.5rem;">
            <button type="button" class="btn btn-primary" id="ordersDemoCustomerBtn">
              ⚡ 1-Click Demo Customer Access
            </button>
            <a href="login.html?redirect=my-orders.html" class="btn btn-secondary">
              Sign In
            </a>
          </div>
        </div>
      `;

      document.getElementById('ordersDemoCustomerBtn')?.addEventListener('click', async () => {
        await currentApp.API.login('customer@burgerking.edu', 'Customer@123');
        currentApp.renderGlobalHeader();
        initMyOrdersPage();
      });
      return;
    }

    try {
      const orders = await currentApp.API.getMyOrders();
      renderOrdersList(mount, orders);
    } catch (err) {
      mount.innerHTML = `
        <div class="cart-card-surface" style="text-align:center;padding:3rem 1.5rem;">
          <p style="color:var(--bunora-coral-600);font-weight:700;">${currentApp.escapeHtml(err.message)}</p>
        </div>
      `;
    }
  }

  function renderStepperHTML(currentStatus) {
    if (currentStatus === 'Cancelled') {
      return `
        <div style="background:#FEE2E2;color:#991B1B;padding:0.85rem 1.15rem;border-radius:14px;border:1px solid #FCA5A5;margin:1.25rem 0;font-weight:800;">
          ✕ This order was cancelled.
        </div>
      `;
    }

    const currentIdx = STEPS.indexOf(currentStatus);
    const progressPct = currentIdx >= 0 ? Math.round((currentIdx / (STEPS.length - 1)) * 100) : 0;

    return `
      <div class="stepper-wrapper" aria-label="Grill Thrill Dispatch Progress">
        <div class="stepper-progress-line" style="width: calc(${progressPct}% * 0.9);"></div>
        ${STEPS.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          const stateClass = isDone ? 'completed' : isActive ? 'active' : '';

          return `
            <div class="step-node ${stateClass}">
              <div class="step-circle">${isDone ? '✓' : idx + 1}</div>
              <span class="step-text">${step}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderOrdersList(mount, orders) {
    const currentApp = window.GrillThrill || window.Bunora;

    if (!orders || orders.length === 0) {
      mount.innerHTML = `
        <div class="empty-state-box" style="margin:3rem auto;max-width:620px;">
          <div class="empty-state-icon">📦</div>
          <h2>No Previous Orders Found</h2>
          <p>
            You haven't placed any orders with Grill Thrill yet. Order your first flame brioche burger or combo today!
          </p>
          <a href="menu.html" class="btn btn-primary btn-lg" style="margin-top:0.5rem;">
            Explore the Menu →
          </a>
        </div>
      `;
      return;
    }

    mount.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:2rem;">
        ${orders
          .map((order) => {
            const dateStr = new Date(order.created_at).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return `
              <div class="cart-card-surface" id="orderCard-${order.id}">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem;padding-bottom:1.25rem;border-bottom:1px solid var(--bunora-cream-border);">
                  <div>
                    <span style="font-size:0.75rem;font-weight:800;color:var(--bunora-coral-500);text-transform:uppercase;letter-spacing:0.08em;">
                      GRILL THRILL EXPRESS RECEIPT
                    </span>
                    <h2 style="font-size:1.55rem;color:var(--bunora-forest-900);line-height:1.2;">
                      Order #GRILL-${order.id}
                    </h2>
                    <span style="font-size:0.84rem;color:var(--bunora-charcoal-muted);">${dateStr}</span>
                  </div>

                  <div style="display:flex;align-items:center;gap:0.75rem;">
                    <span class="food-card-badge" style="position:static;font-size:0.8rem;">
                      ${currentApp.escapeHtml(order.status)}
                    </span>
                    <button type="button" class="btn btn-forest btn-sm" data-reorder="${order.id}">
                      ↻ Reorder Items
                    </button>
                  </div>
                </div>

                <!-- 5-Stage Live Dispatch Stepper -->
                ${renderStepperHTML(order.status)}

                <!-- Items Breakdown -->
                <div style="margin:1.5rem 0;background:var(--bunora-cream-base);border-radius:14px;padding:1.25rem;border:1px solid var(--bunora-cream-border);">
                  <strong style="display:block;font-size:0.86rem;color:var(--bunora-forest-800);margin-bottom:0.75rem;text-transform:uppercase;letter-spacing:0.06em;">
                    Items Dispatched
                  </strong>

                  <div style="display:flex;flex-direction:column;gap:0.65rem;">
                    ${(order.items || [])
                      .map(
                        (i) => `
                          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.9rem;">
                            <span>${i.quantity} × ${currentApp.escapeHtml(i.name || `Item #${i.menu_item_id}`)}</span>
                            <strong>${currentApp.formatCurrency(i.unit_price * i.quantity)}</strong>
                          </div>
                        `
                      )
                      .join('')}
                  </div>
                </div>

                <!-- Footer Summary Info -->
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;font-size:0.88rem;color:var(--bunora-charcoal-muted);">
                  <div>
                    📍 Destination: <strong>${currentApp.escapeHtml(order.delivery_address || 'Delivery Address')}</strong>
                  </div>
                  <div style="font-size:1.15rem;font-weight:900;color:var(--bunora-forest-900);">
                    Total Paid: ${currentApp.formatCurrency(order.total_amount)}
                  </div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;

    // Bind Reorder Buttons
    mount.querySelectorAll('[data-reorder]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const orderId = Number(btn.getAttribute('data-reorder'));
        const targetOrder = orders.find((o) => Number(o.id) === orderId);
        if (!targetOrder || !targetOrder.items) return;

        const db = currentApp.getLocalDB();
        for (const item of targetOrder.items) {
          const menuItem = db.menu_items.find((m) => Number(m.id) === Number(item.menu_item_id));
          if (menuItem) {
            currentApp.addToCart(menuItem, item.quantity);
          }
        }
        currentApp.showToast(`Added items from Order #GRILL-${orderId} to your bag!`, 'success');
        currentApp.openSlideOverDrawer();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initMyOrdersPage);
})();
