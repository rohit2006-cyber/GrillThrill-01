/**
 * ============================================================================
 * GRILL THRILL CART PAGE CONTROLLER (js/cart.js)
 * Manages item list, quantity adjustment, promo validation,
 * free delivery progress meter, and responsive order summaries.
 * ============================================================================
 */

(function () {
  const app = window.GrillThrill || window.Bunora;

  function initCartPage() {
    const cartMount = document.getElementById('cartPageMount');
    if (!cartMount) return;

    renderCartPage();
    window.addEventListener('grillthrill:cart-updated', renderCartPage);
    window.addEventListener('bunora:cart-updated', renderCartPage);
  }

  function renderCartPage() {
    const cartMount = document.getElementById('cartPageMount');
    if (!cartMount) return;

    const currentApp = window.GrillThrill || window.Bunora;
    const summary = currentApp.calculateCartSummary();

    if (summary.items.length === 0) {
      cartMount.innerHTML = `
        <div class="empty-state-box" style="margin:4rem auto;max-width:620px;">
          <div class="empty-state-icon">🛍️</div>
          <h2>Your Grill Thrill Bag is Empty</h2>
          <p>
            You haven't added any dishes yet. Explore our handcrafted brioche burgers, crispy crinkle sides, and hand-spun coolers to get started!
          </p>
          <a href="menu.html" class="btn btn-primary btn-lg" style="margin-top:0.5rem;">
            Explore the Menu →
          </a>
        </div>
      `;
      return;
    }

    const progressPct = Math.min(100, Math.round((summary.subtotal / summary.freeDeliveryThreshold) * 100));

    cartMount.innerHTML = `
      <div class="cart-page-grid">
        <!-- Left Column: Bag Items List -->
        <div class="cart-card-surface">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.75rem;flex-wrap:wrap;gap:0.75rem;">
            <h2 style="font-size:1.65rem;color:var(--bunora-forest-900);">Bag Items (${summary.totalItems})</h2>
            <button type="button" class="btn btn-ghost btn-sm" id="clearEntireCartBtn" style="color:var(--bunora-coral-600);border-color:rgba(222,94,48,0.25);">
              🗑 Clear Entire Bag
            </button>
          </div>

          <!-- Free Delivery Progress Meter -->
          <div class="free-del-progress-card" style="border-radius:var(--radius-md);margin-bottom:1.75rem;border:1px solid var(--bunora-cream-border);">
            <div class="progress-label-row">
              <span>${
                summary.amountForFreeDelivery === 0
                  ? '🎉 You unlocked <strong>FREE Express Delivery!</strong>'
                  : `Add <strong>${currentApp.formatCurrency(summary.amountForFreeDelivery)}</strong> more for <strong>FREE Delivery</strong> (₹399 threshold)`
              }</span>
              <span>${progressPct}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${progressPct}%"></div>
            </div>
          </div>

          <!-- Item Rows -->
          <div style="display:flex;flex-direction:column;gap:1.25rem;">
            ${summary.items
              .map(
                (item) => `
                  <div class="cart-line-item" style="padding-bottom:1.25rem;border-bottom:1px solid var(--border-subtle);">
                    <img
                      src="${currentApp.escapeHtml(item.image_url || '')}"
                      alt="${currentApp.escapeHtml(item.name)}"
                      class="cart-item-thumb"
                      style="width:72px;height:72px;border-radius:16px;"
                      onerror="this.onerror=null;this.src='${currentApp.fallbackImage(item.name)}';"
                    />

                    <div class="cart-item-info">
                      <div style="display:flex;align-items:center;gap:0.45rem;">
                        <span style="font-size:0.72rem;font-weight:700;color:var(--bunora-forest-500);text-transform:uppercase;">${currentApp.escapeHtml(item.category_name || '')}</span>
                      </div>
                      <h3 style="font-size:1.05rem;font-weight:800;color:var(--bunora-forest-900);line-height:1.25;">${currentApp.escapeHtml(item.name)}</h3>
                      <div class="cart-item-price" style="font-size:0.92rem;margin-top:0.25rem;">
                        ${currentApp.formatCurrency(item.price)} each • Line total: <strong>${currentApp.formatCurrency(item.lineTotal)}</strong>
                      </div>
                    </div>

                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem;">
                      <div class="qty-stepper">
                        <button type="button" class="stepper-btn" data-cart-dec="${item.id}" aria-label="Decrease quantity">−</button>
                        <span class="stepper-val">${item.quantity}</span>
                        <button type="button" class="stepper-btn" data-cart-inc="${item.id}" aria-label="Increase quantity">+</button>
                      </div>
                      <button type="button" data-cart-remove="${item.id}" style="background:none;border:none;color:var(--bunora-coral-600);font-size:0.8rem;cursor:pointer;font-weight:800;">
                        Remove
                      </button>
                    </div>
                  </div>
                `
              )
              .join('')}
          </div>

          <div style="margin-top:2rem;">
            <a href="menu.html" class="btn btn-secondary btn-sm">
              ← Add More Items from Menu
            </a>
          </div>
        </div>

        <!-- Right Column: Summary Card -->
        <div class="cart-card-surface" style="position:sticky;top:90px;">
          <h2 style="font-size:1.45rem;color:var(--bunora-forest-900);margin-bottom:1.25rem;">Order Summary</h2>

          <!-- Promo Code Input -->
          <div style="margin-bottom:1.5rem;">
            <label class="form-label" for="promoCodeInput">Promo Voucher</label>
            <div style="display:flex;gap:0.5rem;">
              <input
                type="text"
                id="promoCodeInput"
                class="form-control"
                placeholder="Try GRILL20 or FRESH50"
                value="${currentApp.escapeHtml(summary.promo || '')}"
                style="text-transform:uppercase;font-weight:800;letter-spacing:0.04em;"
              />
              <button type="button" class="btn btn-forest btn-sm" id="applyPromoBtn">
                Apply
              </button>
            </div>
            ${
              summary.promo
                ? `
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.45rem;font-size:0.82rem;color:var(--bunora-forest-600);font-weight:700;">
                    <span>✓ ${currentApp.escapeHtml(summary.promoDescription)}</span>
                    <button type="button" id="removePromoBtn" style="background:none;border:none;color:var(--bunora-coral-600);cursor:pointer;text-decoration:underline;font-weight:700;">Remove</button>
                  </div>
                `
                : `
                  <div style="font-size:0.78rem;color:var(--bunora-charcoal-subtle);margin-top:0.45rem;">
                    💡 Available: <strong>GRILL20</strong> (20% off) or <strong>FRESH50</strong> (₹50 off ₹299+)
                  </div>
                `
            }
          </div>

          <!-- Breakdown Lines -->
          <div style="border-top:1px solid var(--bunora-cream-border);padding-top:1.15rem;display:flex;flex-direction:column;gap:0.65rem;">
            <div class="summary-row">
              <span>Items Subtotal (${summary.totalItems} items)</span>
              <strong>${currentApp.formatCurrency(summary.subtotal)}</strong>
            </div>

            ${
              summary.discount > 0
                ? `
                  <div class="summary-row" style="color:var(--bunora-forest-600);font-weight:800;">
                    <span>Promo Savings (${summary.promo})</span>
                    <span>−${currentApp.formatCurrency(summary.discount)}</span>
                  </div>
                `
                : ''
            }

            <div class="summary-row">
              <span>Express Kitchen Delivery</span>
              <strong>${summary.deliveryFee === 0 ? '<span style="color:var(--bunora-forest-600);">FREE</span>' : currentApp.formatCurrency(summary.deliveryFee)}</strong>
            </div>

            <div class="summary-row total-row">
              <span>Grand Total</span>
              <span style="color:var(--bunora-forest-900);">${currentApp.formatCurrency(summary.total)}</span>
            </div>
          </div>

          <a href="checkout.html" class="btn btn-primary btn-block btn-lg" style="margin-top:1.5rem;">
            Proceed to Checkout →
          </a>

          <div style="text-align:center;margin-top:1rem;font-size:0.78rem;color:var(--bunora-charcoal-subtle);">
            🔒 Simulated College Checkout • Prices in ₹ INR
          </div>
        </div>
      </div>
    `;

    // Bind event handlers
    const clearBtn = document.getElementById('clearEntireCartBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your Grill Thrill Bag?')) {
          currentApp.saveCart([]);
        }
      });
    }

    cartMount.querySelectorAll('[data-cart-inc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-cart-inc'));
        currentApp.updateCartQty(id, currentApp.getItemQtyInCart(id) + 1);
      });
    });

    cartMount.querySelectorAll('[data-cart-dec]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-cart-dec'));
        currentApp.updateCartQty(id, currentApp.getItemQtyInCart(id) - 1);
      });
    });

    cartMount.querySelectorAll('[data-cart-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-cart-remove'));
        currentApp.updateCartQty(id, 0);
      });
    });

    const applyPromoBtn = document.getElementById('applyPromoBtn');
    const promoInput = document.getElementById('promoCodeInput');
    if (applyPromoBtn && promoInput) {
      applyPromoBtn.addEventListener('click', () => {
        const val = promoInput.value.trim().toUpperCase();
        if (!val) {
          currentApp.showToast('Please enter a coupon code', 'info');
          return;
        }
        currentApp.setAppliedPromo(val);
        currentApp.showToast(`Applied coupon ${val}!`, 'success');
      });
    }

    const removePromoBtn = document.getElementById('removePromoBtn');
    if (removePromoBtn) {
      removePromoBtn.addEventListener('click', () => {
        currentApp.setAppliedPromo('');
        currentApp.showToast('Coupon removed', 'info');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initCartPage);
})();
