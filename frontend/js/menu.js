/**
 * ============================================================================
 * GRILL THRILL MENU EXPLORER CONTROLLER (js/menu.js)
 * Handles live search, category pills, dietary filter (Veg/Non-Veg),
 * price/calorie sorting, stock toggles, and responsive card bindings.
 * ============================================================================
 */

(function () {
  const app = window.GrillThrill || window.Bunora;
  let allCategories = [];
  let allMenuItems = [];

  let state = {
    categoryId: 'all',
    dietFilter: 'all', // 'all', 'veg', 'non-veg'
    searchQuery: '',
    sortBy: 'featured',
    hideUnavailable: false
  };

  async function initMenuPage() {
    const gridEl = document.getElementById('menuGrid');
    if (!gridEl) return;

    // Check URL parameters for pre-selected category or search focus
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category') || urlParams.get('cat');
    if (catParam) {
      state.categoryId = String(catParam);
    }

    try {
      allCategories = await (window.GrillThrill || window.Bunora).API.getCategories();
      allMenuItems = await (window.GrillThrill || window.Bunora).API.getMenu();

      renderCategoryPills();
      bindToolbarEvents();
      renderFilteredMenu();

      if (urlParams.get('focusSearch')) {
        const searchInput = document.getElementById('menuSearchInput');
        if (searchInput) searchInput.focus();
      }
    } catch (err) {
      (window.GrillThrill || window.Bunora).showToast('Error loading menu items: ' + err.message, 'error');
    }

    window.addEventListener('grillthrill:cart-updated', () => {
      renderFilteredMenu();
    });
    window.addEventListener('bunora:cart-updated', () => {
      renderFilteredMenu();
    });
  }

  function renderCategoryPills() {
    const pillsMount = document.getElementById('categoryPillsContainer');
    if (!pillsMount) return;

    const totalCount = allMenuItems.length;
    const categoryIcons = {
      'Signature Burgers': '🍔',
      'Crispy Sides': '🍟',
      'Cool Drinks': '🥤',
      'Desserts': '🍫',
      'Meal Combos': '⚡',
      'Burgers': '🍔',
      'Fries and Sides': '🍟',
      'Beverages': '🥤',
      'Combos': '⚡'
    };

    const buttonsHTML = [
      `<button type="button" class="filter-pill ${state.categoryId === 'all' ? 'active' : ''}" data-cat="all">
        <span>✨ All Cravings</span>
        <span style="opacity:0.75;font-size:0.78rem;">(${totalCount})</span>
      </button>`
    ];

    for (const cat of allCategories) {
      const count = allMenuItems.filter((m) => Number(m.category_id) === Number(cat.id)).length;
      const icon = cat.icon || categoryIcons[cat.name] || '🍽️';
      const isActive = String(state.categoryId) === String(cat.id);
      buttonsHTML.push(`
        <button type="button" class="filter-pill ${isActive ? 'active' : ''}" data-cat="${cat.id}">
          <span>${icon} ${(window.GrillThrill || window.Bunora).escapeHtml(cat.name)}</span>
          <span style="opacity:0.75;font-size:0.78rem;">(${count})</span>
        </button>
      `);
    }

    pillsMount.innerHTML = buttonsHTML.join('');

    pillsMount.querySelectorAll('[data-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.categoryId = btn.getAttribute('data-cat');
        renderCategoryPills();
        renderFilteredMenu();
      });
    });
  }

  function bindToolbarEvents() {
    const searchInput = document.getElementById('menuSearchInput');
    const sortSelect = document.getElementById('menuSortSelect');
    const availCheck = document.getElementById('hideUnavailableCheck');

    const dietAllBtn = document.getElementById('dietAllBtn');
    const dietVegBtn = document.getElementById('dietVegBtn');
    const dietNonVegBtn = document.getElementById('dietNonVegBtn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        renderFilteredMenu();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderFilteredMenu();
      });
    }

    if (availCheck) {
      availCheck.addEventListener('change', (e) => {
        state.hideUnavailable = e.target.checked;
        renderFilteredMenu();
      });
    }

    // Dietary filter buttons
    function updateDietButtons(selected) {
      state.dietFilter = selected;
      [dietAllBtn, dietVegBtn, dietNonVegBtn].forEach((btn) => btn && btn.classList.remove('active'));
      if (selected === 'all' && dietAllBtn) dietAllBtn.classList.add('active');
      if (selected === 'veg' && dietVegBtn) dietVegBtn.classList.add('active');
      if (selected === 'non-veg' && dietNonVegBtn) dietNonVegBtn.classList.add('active');
      renderFilteredMenu();
    }

    if (dietAllBtn) dietAllBtn.addEventListener('click', () => updateDietButtons('all'));
    if (dietVegBtn) dietVegBtn.addEventListener('click', () => updateDietButtons('veg'));
    if (dietNonVegBtn) dietNonVegBtn.addEventListener('click', () => updateDietButtons('non-veg'));
  }

  function renderFilteredMenu() {
    const gridEl = document.getElementById('menuGrid');
    const countLabel = document.getElementById('menuResultsCount');
    if (!gridEl) return;

    const currentApp = window.GrillThrill || window.Bunora;
    let filtered = [...allMenuItems];

    // Filter by Category
    if (state.categoryId !== 'all') {
      filtered = filtered.filter((m) => String(m.category_id) === String(state.categoryId));
    }

    // Filter by Dietary preference
    if (state.dietFilter === 'veg') {
      filtered = filtered.filter((m) => m.is_veg === true);
    } else if (state.dietFilter === 'non-veg') {
      filtered = filtered.filter((m) => m.is_veg === false);
    }

    // Filter by Search Query
    if (state.searchQuery) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(state.searchQuery) ||
          m.description.toLowerCase().includes(state.searchQuery) ||
          (m.category_name && m.category_name.toLowerCase().includes(state.searchQuery))
      );
    }

    // Filter by Availability
    if (state.hideUnavailable) {
      filtered = filtered.filter((m) => m.is_available);
    }

    // Sort order
    if (state.sortBy === 'price-asc') {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (state.sortBy === 'price-desc') {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (state.sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (state.sortBy === 'calories-asc') {
      filtered.sort((a, b) => (a.calories || 999) - (b.calories || 999));
    }

    if (countLabel) {
      countLabel.textContent = `Showing ${filtered.length} of ${allMenuItems.length} Grill Thrill dishes`;
    }

    // Empty state UI
    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div class="empty-state-box" style="grid-column:1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <h3>No cravings found</h3>
          <p>
            We couldn't find any dishes matching "${currentApp.escapeHtml(state.searchQuery || state.dietFilter)}". Try adjusting your filters or search for 'brioche', 'crinkle', or 'shake'.
          </p>
          <button type="button" class="btn btn-primary btn-sm" id="resetMenuFiltersBtn">
            Reset Filters
          </button>
        </div>
      `;

      const resetBtn = document.getElementById('resetMenuFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          state = {
            categoryId: 'all',
            dietFilter: 'all',
            searchQuery: '',
            sortBy: 'featured',
            hideUnavailable: false
          };
          const searchInput = document.getElementById('menuSearchInput');
          if (searchInput) searchInput.value = '';
          const availCheck = document.getElementById('hideUnavailableCheck');
          if (availCheck) availCheck.checked = false;
          renderCategoryPills();
          renderFilteredMenu();
        });
      }
      return;
    }

    // Render cards
    gridEl.innerHTML = filtered
      .map((item) => {
        const inCartQty = currentApp.getItemQtyInCart(item.id);
        return `
          <div class="food-card ${!item.is_available ? 'unavailable' : ''}">
            <div class="food-card-media">
              <img
                src="${currentApp.escapeHtml(item.image_url || '')}"
                alt="${currentApp.escapeHtml(item.name)}"
                class="food-card-img"
                onerror="this.onerror=null;this.src='${currentApp.fallbackImage(item.name)}';"
              />
              ${item.badge ? `<span class="food-card-badge ${item.badge === 'Bestseller' ? 'accent' : ''}">${currentApp.escapeHtml(item.badge)}</span>` : ''}

              <!-- Dietary Veg / Non-Veg Indicator -->
              <div class="dietary-badge" title="${item.is_veg ? '100% Vegetarian' : 'Non-Vegetarian'}">
                <div class="${item.is_veg ? 'dietary-icon-veg' : 'dietary-icon-nonveg'}"></div>
              </div>

              ${!item.is_available ? '<div class="unavailable-stamp">Sold Out</div>' : ''}
            </div>

            <div class="food-card-content">
              <span class="food-card-category">${currentApp.escapeHtml(item.category_name || 'Signature')}</span>
              <h3 class="food-card-title">${currentApp.escapeHtml(item.name)}</h3>
              <p class="food-card-desc">${currentApp.escapeHtml(item.description)}</p>

              <div class="food-card-footer">
                <div class="food-card-price-wrap">
                  <span class="food-card-price-label">Price</span>
                  <span class="food-card-price">${currentApp.formatCurrency(item.price)}</span>
                </div>

                ${
                  item.is_available
                    ? `
                      <button type="button" class="btn-card-add" data-add-item="${item.id}">
                        ${inCartQty > 0 ? `<span>✓</span> In Bag (${inCartQty})` : `<span>+</span> Add to Bag`}
                      </button>
                    `
                    : `
                      <button type="button" class="btn-card-add" disabled style="opacity:0.5;cursor:not-allowed;">
                        Unavailable
                      </button>
                    `
                }
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    // Bind Add to Cart buttons
    gridEl.querySelectorAll('[data-add-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-add-item'));
        const target = allMenuItems.find((m) => Number(m.id) === id);
        if (target) {
          currentApp.addToCart(target, 1);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initMenuPage);
})();
