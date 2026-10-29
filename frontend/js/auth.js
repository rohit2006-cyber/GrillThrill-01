/**
 * ============================================================================
 * GRILL THRILL AUTHENTICATION CONTROLLER (js/auth.js)
 * Handles login, registration, password validation, and 1-click demo access.
 * ============================================================================
 */

(function () {
  function initAuthPages() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    const urlParams = new URLSearchParams(window.location.search);
    const redirectTarget = urlParams.get('redirect') || '';

    // 1-Click Demo Login buttons
    document.getElementById('demoCustomerBtn')?.addEventListener('click', async () => {
      const emailEl = document.getElementById('loginEmail');
      const passEl = document.getElementById('loginPassword');
      if (emailEl) emailEl.value = 'customer@burgerking.edu';
      if (passEl) passEl.value = 'Customer@123';
      await performLogin('customer@burgerking.edu', 'Customer@123', redirectTarget);
    });

    document.getElementById('demoAdminBtn')?.addEventListener('click', async () => {
      const emailEl = document.getElementById('loginEmail');
      const passEl = document.getElementById('loginPassword');
      if (emailEl) emailEl.value = 'admin@burgerking.edu';
      if (passEl) passEl.value = 'Admin@123';
      await performLogin('admin@burgerking.edu', 'Admin@123', redirectTarget || 'admin-dashboard.html');
    });

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;
        await performLogin(email, password, redirectTarget);
      });
    }

    if (registerForm) {
      const passInput = document.getElementById('regPassword');
      const strengthBar = document.getElementById('passwordStrengthText');

      if (passInput && strengthBar) {
        passInput.addEventListener('input', () => {
          const val = passInput.value;
          if (!val) {
            strengthBar.textContent = '';
          } else if (val.length < 6) {
            strengthBar.textContent = '⚠️ Too short (minimum 6 characters)';
            strengthBar.style.color = 'var(--bunora-coral-600)';
          } else if (val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val)) {
            strengthBar.textContent = '✓ Strong secure password';
            strengthBar.style.color = 'var(--bunora-forest-500)';
          } else {
            strengthBar.textContent = '✓ Good password';
            strengthBar.style.color = 'var(--bunora-forest-700)';
          }
        });
      }

      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName')?.value.trim();
        const email = document.getElementById('regEmail')?.value.trim();
        const password = document.getElementById('regPassword')?.value;
        const confirmPassword = document.getElementById('regConfirmPassword')?.value;
        const errorBox = document.getElementById('authErrorAlert');

        if (errorBox) errorBox.style.display = 'none';

        if (password !== confirmPassword) {
          showAuthError(errorBox, 'Passwords do not match. Please verify your password.');
          return;
        }

        try {
          const api = (window.GrillThrill || window.Bunora).API;
          const res = await api.register(name, email, password);
          (window.GrillThrill || window.Bunora).showToast(res.message || 'Account created!', 'success');
          setTimeout(() => {
            window.location.href = redirectTarget || 'menu.html';
          }, 500);
        } catch (err) {
          showAuthError(errorBox, err.message);
        }
      });
    }
  }

  async function performLogin(email, password, redirectTarget) {
    const errorBox = document.getElementById('authErrorAlert');
    if (errorBox) errorBox.style.display = 'none';

    try {
      const api = (window.GrillThrill || window.Bunora).API;
      const res = await api.login(email, password);
      (window.GrillThrill || window.Bunora).showToast('Welcome to Grill Thrill!', 'success');
      setTimeout(() => {
        if (redirectTarget) {
          window.location.href = redirectTarget;
        } else if (res.user && res.user.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'menu.html';
        }
      }, 450);
    } catch (err) {
      showAuthError(errorBox, err.message);
    }
  }

  function showAuthError(errorBox, message) {
    (window.GrillThrill || window.Bunora).showToast(message, 'error');
    if (errorBox) {
      errorBox.textContent = '⚠️ ' + message;
      errorBox.style.display = 'block';
    }
  }

  document.addEventListener('DOMContentLoaded', initAuthPages);
})();
