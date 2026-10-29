/**
 * ============================================================================
 * GRILL THRILL CHECKOUT CONTROLLER (js/checkout.js)
 * Collects customer name, 10-digit mobile phone number, Indian delivery address,
 * simulated payment method (COD, UPI), validates required inputs,
 * and renders a transparent student-project confirmation modal.
 * ============================================================================
 */

(function () {
  let selectedPaymentMethod = 'COD';

  const PRESET_ADDRESSES = {
    'Ranchi1': 'Kanke Road, Ranchi, Jharkhand 834008',
    'Ranchi2': 'Harmu Road, Ranchi, Jharkhand 834001',
    'Ranchi3': 'Ratu Road, Ranchi, Jharkhand 834005'
  };

  function initCheckoutPage() {
    const checkoutMount = document.getElementById('checkoutPageMount');
    if (!checkoutMount) return;

    renderCheckout();
    window.addEventListener('grillthrill:cart-updated', renderCheckout);
    window.addEventListener('bunora:cart-updated', renderCheckout);
  }

  function renderCheckout() {
    const checkoutMount = document.getElementById('checkoutPageMount');
    if (!checkoutMount) return;

    const currentApp = window.GrillThrill || window.Bunora;
    const user = currentApp.getCurrentUser();
    const summary = currentApp.calculateCartSummary();

    if (summary.items.length === 0) {
      checkoutMount.innerHTML = `
        <div class="empty-state-box" style="margin:4rem auto;max-width:620px;">
          <div class="empty-state-icon">🛍️</div>
          <h2>Your Grill Thrill Bag is Empty</h2>
          <p>
            Add some handcrafted flame brioche burgers or power combos before proceeding to checkout.
          </p>
          <a href="menu.html" class="btn btn-primary btn-lg" style="margin-top:0.5rem;">
            Browse Grill Thrill Menu →
          </a>
        </div>
      `;
      return;
    }

    checkoutMount.innerHTML = `
      <div class="checkout-grid">
        <!-- Left Column: Checkout Details Form -->
        <div class="cart-card-surface">
          <h2 style="font-size:1.65rem;color:var(--bunora-forest-900);margin-bottom:0.5rem;">Delivery & Customer Information</h2>
          <p style="font-size:0.9rem;color:var(--bunora-charcoal-muted);margin-bottom:1.75rem;">
            Please enter your contact details and delivery location for simulated kitchen dispatch.
          </p>

          <form id="expressCheckoutForm" novalidate>
            <!-- Name & Phone Fields -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
              <div class="form-group">
                <label class="form-label" for="custNameInput">Full Name *</label>
                <input
                  type="text"
                  id="custNameInput"
                  class="form-control"
                  required
                  placeholder="e.g., Aarav Sharma"
                  value="${user ? currentApp.escapeHtml(user.name) : ''}"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="custPhoneInput">Mobile Phone (10 Digits) *</label>
                <input
                  type="tel"
                  id="custPhoneInput"
                  class="form-control"
                  required
                  pattern="[6-9][0-9]{9}"
                  maxlength="10"
                  placeholder="e.g., 9876543210"
                  value="9876543210"
                />
              </div>
            </div>

            <!-- Delivery Address with City Presets -->
            <div class="form-group">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                <label class="form-label" for="custAddressInput" style="margin-bottom:0;">Delivery Address *</label>
                <span style="font-size:0.78rem;font-weight:700;color:var(--bunora-forest-500);">Quick Presets:</span>
              </div>

              <div class="address-presets-row">
                <button type="button" class="preset-chip active" data-preset="Ranchi1">📍 Ranchi1</button>
                <button type="button" class="preset-chip" data-preset="Ranchi2">📍 Ranchi2</button>
                <button type="button" class="preset-chip" data-preset="Ranchi3">📍 Ranchi3</button>
              </div>

              <textarea
                id="custAddressInput"
                class="form-control"
                rows="3"
                required
                placeholder="Flat / House No., Building Name, Street, Landmark, City, Pincode"
              >${PRESET_ADDRESSES.Ranchi1}</textarea>
            </div>

            <!-- Simulated Payment Selection -->
            <div class="form-group" style="margin-top:2rem;">
              <label class="form-label">Payment Method (Simulated Demo)</label>
              <div class="payment-options-grid">
                <div class="payment-option-card active" data-pay="COD">
                  <span style="font-size:1.35rem;">💵</span>
                  <div>
                    <strong style="display:block;font-size:0.92rem;color:var(--bunora-forest-900);">Cash on Delivery</strong>
                    <span style="font-size:0.76rem;color:var(--bunora-charcoal-muted);">Pay upon arrival</span>
                  </div>
                </div>

                <div class="payment-option-card" data-pay="UPI">
                  <span style="font-size:1.35rem;">📱</span>
                  <div>
                    <strong style="display:block;font-size:0.92rem;color:var(--bunora-forest-900);">UPI / GPay / PhonePe</strong>
                    <span style="font-size:0.76rem;color:var(--bunora-charcoal-muted);">Instant simulated link</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error banner -->
            <div id="checkoutErrorBanner" style="display:none;background:#FEE2E2;border:1px solid #FCA5A5;color:#991B1B;padding:0.85rem 1.15rem;border-radius:12px;font-size:0.88rem;font-weight:700;margin-bottom:1.25rem;"></div>

            <button type="submit" class="btn btn-primary btn-block btn-lg" id="submitCheckoutBtn">
              Confirm & Dispatch Order (${currentApp.formatCurrency(summary.total)}) →
            </button>
          </form>
        </div>

        <!-- Right Column: Order Summary Review -->
        <div class="cart-card-surface" style="position:sticky;top:90px;">
          <h2 style="font-size:1.45rem;color:var(--bunora-forest-900);margin-bottom:1.15rem;">Review Your Bag</h2>

          <div style="display:flex;flex-direction:column;gap:0.85rem;max-height:280px;overflow-y:auto;padding-right:0.25rem;margin-bottom:1.25rem;">
            ${summary.items
              .map(
                (item) => `
                  <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.9rem;">
                    <div>
                      <strong style="color:var(--bunora-forest-900);display:block;line-height:1.2;">${currentApp.escapeHtml(item.name)}</strong>
                      <span style="font-size:0.78rem;color:var(--bunora-charcoal-muted);">${currentApp.formatCurrency(item.price)} × ${item.quantity}</span>
                    </div>
                    <span style="font-weight:800;color:var(--bunora-forest-900);">${currentApp.formatCurrency(item.lineTotal)}</span>
                  </div>
                `
              )
              .join('')}
          </div>

          <div style="border-top:1px solid var(--bunora-cream-border);padding-top:1rem;display:flex;flex-direction:column;gap:0.55rem;">
            <div class="summary-row">
              <span>Subtotal</span>
              <strong>${currentApp.formatCurrency(summary.subtotal)}</strong>
            </div>

            ${
              summary.discount > 0
                ? `
                  <div class="summary-row" style="color:var(--bunora-forest-600);font-weight:800;">
                    <span>Promo (${summary.promo})</span>
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
              <span>Total Payable</span>
              <span>${currentApp.formatCurrency(summary.total)}</span>
            </div>
          </div>

          <div style="background:var(--bunora-cream-surface);border:1px solid var(--bunora-cream-border);border-radius:12px;padding:1rem;margin-top:1.25rem;font-size:0.82rem;color:var(--bunora-charcoal-muted);line-height:1.5;">
            🛡️ <strong>Student Demo Simulation:</strong> This order generates a real database/session record for demonstration. No real currency is debited.
          </div>
        </div>
      </div>
    `;

    // Bind Address presets
    checkoutMount.querySelectorAll('[data-preset]').forEach((chip) => {
      chip.addEventListener('click', () => {
        checkoutMount.querySelectorAll('[data-preset]').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        const key = chip.getAttribute('data-preset');
        const addrInput = document.getElementById('custAddressInput');
        if (addrInput && PRESET_ADDRESSES[key]) {
          addrInput.value = PRESET_ADDRESSES[key];
        }
      });
    });

    // Bind Payment methods
    checkoutMount.querySelectorAll('[data-pay]').forEach((card) => {
      card.addEventListener('click', () => {
        checkoutMount.querySelectorAll('[data-pay]').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        selectedPaymentMethod = card.getAttribute('data-pay');
      });
    });

    // Bind Form Submission
    const form = document.getElementById('expressCheckoutForm');
    if (form) {
      form.addEventListener('submit', handleCheckoutSubmit);
    }
  }

  async function handleCheckoutSubmit(e) {
    e.preventDefault();

    const currentApp = window.GrillThrill || window.Bunora;
    const nameInput = document.getElementById('custNameInput');
    const phoneInput = document.getElementById('custPhoneInput');
    const addressInput = document.getElementById('custAddressInput');
    const errorBanner = document.getElementById('checkoutErrorBanner');
    const submitBtn = document.getElementById('submitCheckoutBtn');

    if (errorBanner) errorBanner.style.display = 'none';

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const address = addressInput ? addressInput.value.trim() : '';

    if (!name || name.length < 2) {
      showError('Please enter a valid full name (minimum 2 characters).');
      if (nameInput) nameInput.focus();
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      showError('Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).');
      if (phoneInput) phoneInput.focus();
      return;
    }

    if (!address || address.length < 10) {
      showError('Please enter a complete delivery address with city and pincode (minimum 10 characters).');
      if (addressInput) addressInput.focus();
      return;
    }

    const fullAddress = `${address} (Recipient: ${name}, Ph: +91 ${phone})`;

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '⚡ Dispatching to Grill Thrill Kitchen...';
      }

      const order = await currentApp.API.createOrder(fullAddress, selectedPaymentMethod);
      showOrderConfirmationModal(order, name, phone, address);
    } catch (err) {
      showError(err.message || 'Error creating order.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Confirm & Dispatch Order →';
      }
    }
  }

  function showError(msg) {
    const errorBanner = document.getElementById('checkoutErrorBanner');
    if (errorBanner) {
      errorBanner.textContent = msg;
      errorBanner.style.display = 'block';
      errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      (window.GrillThrill || window.Bunora).showToast(msg, 'error');
    }
  }

  function showOrderConfirmationModal(order, name, phone, address) {
    const currentApp = window.GrillThrill || window.Bunora;
    const backdrop = document.getElementById('orderConfirmBackdrop');
    const modal = document.getElementById('orderConfirmModal');
    if (!backdrop || !modal) return;

    modal.innerHTML = `
      <div style="text-align:center;">
        <span class="student-disclaimer-pill">🎓 STUDENT PROJECT SIMULATION</span>
        <div style="font-size:3.5rem;margin-bottom:0.75rem;">🎉</div>
        <h2 style="font-size:2rem;color:var(--bunora-forest-900);line-height:1.2;margin-bottom:0.35rem;">
          Order Dispatched!
        </h2>
        <p style="color:var(--bunora-charcoal-muted);font-size:0.95rem;margin-bottom:1.5rem;">
          Your order has been recorded and transmitted to the simulated kitchen dispatch line.
        </p>

        <!-- Order Summary Card inside Modal -->
        <div style="background:var(--bunora-cream-base);border:1px solid var(--bunora-cream-border);border-radius:18px;padding:1.35rem;text-align:left;font-size:0.88rem;margin-bottom:1.5rem;">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-weight:800;color:var(--bunora-forest-900);">
            <span>Order ID</span>
            <span>#GRILL-${order.id}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
            <span>Estimated Kitchen Arrival</span>
            <strong style="color:var(--bunora-coral-600);">~25 Minutes</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
            <span>Payment Method</span>
            <strong>${selectedPaymentMethod} (Simulated)</strong>
          </div>
          <div style="display:flex;justify-content:space-between;padding-top:0.5rem;border-top:1px solid var(--bunora-cream-border);font-weight:900;font-size:1.05rem;color:var(--bunora-forest-900);">
            <span>Total Amount</span>
            <span>${currentApp.formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        <div style="font-size:0.8rem;color:var(--bunora-charcoal-muted);margin-bottom:1.75rem;line-height:1.5;">
          Delivery to: <strong>${currentApp.escapeHtml(address)}</strong><br />
          Contact: <strong>${currentApp.escapeHtml(name)} (+91 ${currentApp.escapeHtml(phone)})</strong>
        </div>

        <div class="modal-actions-row" style="display:grid;grid-template-columns:1fr 1fr;gap:0.85rem;">
          <a href="my-orders.html" class="btn btn-forest">
            Track in Live Orders →
          </a>
          <a href="index.html" class="btn btn-secondary">
            Return to Home
          </a>
        </div>
      </div>
    `;

    backdrop.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  document.addEventListener('DOMContentLoaded', initCheckoutPage);
})();
