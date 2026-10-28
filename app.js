// Fixed SaaS Application JavaScript with Working Button Functionality

// Application state management
const AppState = {
  currentPage: 'home',
  isLoggedIn: false,
  currentUser: null,
  theme: 'light',
  isDashboardMode: false,
  charts: {},
  notifications: [],
  users: [],
  isInitialized: false
};

// Application data using the provided JSON data
const AppData = {
  sampleUsers: [
    {id: 1, name: "John Admin", email: "admin@example.com", role: "Admin", status: "Active", avatar: "👨‍💼", joinDate: "2024-01-15"},
    {id: 2, name: "Sarah Manager", email: "manager@example.com", role: "Manager", status: "Active", avatar: "👩‍💼", joinDate: "2024-02-20"},
    {id: 3, name: "Mike User", email: "user@example.com", role: "User", status: "Active", avatar: "👨‍💻", joinDate: "2024-03-10"}
  ],
  analyticsData: {
    revenue: [45000, 52000, 48000, 61000, 55000, 67000, 72000, 69000, 74000, 82000, 89000, 95000],
    users: [1200, 1350, 1420, 1580, 1650, 1720, 1850, 1920, 2100, 2250, 2400, 2650],
    engagement: {new: 35, returning: 45, inactive: 20}
  }
};

// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Enhanced error handling
const safeExecute = (fn, errorMsg = 'Operation failed') => {
  const handleError = (error) => {
    console.error(errorMsg, error);
    if (window.NotificationManager) {
      NotificationManager.showError(errorMsg);
    }
    return null;
  };

  try {
    const result = fn();
    if (result && typeof result.catch === 'function') {
      return result.catch(handleError);
    }
    return result;
  } catch (error) {
    return handleError(error);
  }
};

// Theme Management - Fixed
const ThemeManager = {
  init() {
    safeExecute(() => {
      const savedTheme = localStorage.getItem('saastudio_theme');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      this.setTheme(savedTheme || systemTheme);
      this.bindEvents();
      console.log('✓ Theme Manager initialized');
    }, 'Theme Manager initialization failed');
  },

  setTheme(theme) {
    safeExecute(() => {
      AppState.theme = theme;
      document.documentElement.setAttribute('data-color-scheme', theme);
      try {
        localStorage.setItem('saastudio_theme', theme);
      } catch (e) {
        console.warn('Unable to save theme to localStorage:', e);
      }

      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) {
        themeMeta.setAttribute('content', theme === 'dark' ? '#070a13' : '#f6f7fb');
      }

      this.updateThemeIcon();
      this.updateSettingsToggle();

      if (window.ChartManager) {
        ChartManager.refresh();
      }
    }, 'Theme setting failed');
  },

  updateThemeIcon() {
    safeExecute(() => {
      const themeIcon = $('.theme-icon');
      const themeToggle = $('#themeToggle');
      if (themeIcon) {
        themeIcon.textContent = AppState.theme === 'dark' ? '☀️' : '🌙';
      }
      if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', AppState.theme === 'dark' ? 'true' : 'false');
      }
    });
  },

  updateSettingsToggle() {
    safeExecute(() => {
      const settingsToggle = $('#settingsThemeToggle');
      if (settingsToggle) {
        const isDark = AppState.theme === 'dark';
        settingsToggle.classList.toggle('active', isDark);
        settingsToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      }
    });
  },

  toggle() {
    const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  },

  bindEvents() {
    const themeToggle = $('#themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      });
    }

    const settingsThemeToggle = $('#settingsThemeToggle');
    if (settingsThemeToggle) {
      settingsThemeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      });
    }
  }
};

// 3D Hero Animation - Fixed
const Hero3D = {
  scene: null,
  camera: null,
  renderer: null,
  objects: [],
  mouse: { x: 0, y: 0 },
  isAnimating: false,
  animationId: null,
  eventHandlers: {},

  init() {
    const container = $('#hero3d');
    if (!container || !window.THREE) {
      console.warn('Three.js not loaded or container not found');
      return;
    }

    this.destroy();

    safeExecute(() => {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setClearColor(0x000000, 0);
      container.appendChild(this.renderer.domElement);

      this.camera.position.z = 5;
      this.createObjects();
      
      this.isAnimating = true;
      this.animate();
      this.bindEvents();
      
      console.log('✓ 3D Hero animation initialized');
    }, '3D Hero initialization failed');
  },

  createObjects() {
    try {
      const geometries = [
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.SphereGeometry(0.3, 32, 32),
        new THREE.TorusGeometry(0.3, 0.1, 16, 100),
        new THREE.ConeGeometry(0.3, 0.6, 8),
        new THREE.OctahedronGeometry(0.4)
      ];

      const colors = [0x1FB8CD, 0xFFC185, 0xB4413C, 0x5D878F, 0xDB4545];

      for (let i = 0; i < 8; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = new THREE.MeshPhongMaterial({ 
          color: colors[Math.floor(Math.random() * colors.length)],
          transparent: true,
          opacity: 0.8
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.x = (Math.random() - 0.5) * 8;
        mesh.position.y = (Math.random() - 0.5) * 6;
        mesh.position.z = (Math.random() - 0.5) * 4;
        
        mesh.rotation.x = Math.random() * Math.PI * 2;
        mesh.rotation.y = Math.random() * Math.PI * 2;
        
        mesh.userData = {
          initialX: mesh.position.x,
          initialY: mesh.position.y,
          initialZ: mesh.position.z,
          rotationSpeedX: (Math.random() - 0.5) * 0.02,
          rotationSpeedY: (Math.random() - 0.5) * 0.02,
          floatSpeed: Math.random() * 0.02 + 0.01
        };
        
        this.scene.add(mesh);
        this.objects.push(mesh);
      }

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      this.scene.add(directionalLight);
    } catch (error) {
      console.warn('Failed to create 3D objects:', error);
    }
  },

  animate() {
    if (!this.isAnimating || !this.renderer || !this.scene || !this.camera) return;

    try {
      const time = Date.now() * 0.001;

      this.objects.forEach((object, index) => {
        if (!object.userData) return;
        
        const userData = object.userData;
        
        object.rotation.x += userData.rotationSpeedX;
        object.rotation.y += userData.rotationSpeedY;
        
        object.position.y = userData.initialY + Math.sin(time * userData.floatSpeed + index) * 0.5;
        
        const mouseInfluence = 0.0005;
        object.position.x = userData.initialX + this.mouse.x * mouseInfluence * (index + 1);
        object.position.z = userData.initialZ + this.mouse.y * mouseInfluence * (index + 1);
      });

      this.renderer.render(this.scene, this.camera);
      this.animationId = requestAnimationFrame(() => this.animate());
    } catch (error) {
      console.warn('Animation error:', error);
      this.isAnimating = false;
    }
  },

  bindEvents() {
    this.eventHandlers.mouseMove = (event) => {
      this.mouse.x = (event.clientX - window.innerWidth / 2);
      this.mouse.y = (event.clientY - window.innerHeight / 2);
    };

    this.eventHandlers.resize = debounce(() => {
      const container = $('#hero3d');
      if (!container || !this.renderer || !this.camera) return;

      try {
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
      } catch (error) {
        console.warn('Resize error:', error);
      }
    }, 250);

    document.addEventListener('mousemove', this.eventHandlers.mouseMove);
    window.addEventListener('resize', this.eventHandlers.resize);
  },

  destroy() {
    this.isAnimating = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Remove event listeners
    if (this.eventHandlers.mouseMove) {
      document.removeEventListener('mousemove', this.eventHandlers.mouseMove);
    }
    if (this.eventHandlers.resize) {
      window.removeEventListener('resize', this.eventHandlers.resize);
    }

    if (this.renderer && this.renderer.domElement) {
      const container = $('#hero3d');
      if (container && container.contains(this.renderer.domElement)) {
        container.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
      this.renderer = null;
    }
    
    if (this.scene) {
      this.scene.clear();
      this.scene = null;
    }
    
    this.objects = [];
    this.camera = null;
    this.eventHandlers = {};
  }
};

// Chart Management System - Fixed
const ChartManager = {
  colors: ['#635bff', '#22d3ee', '#f43f5e', '#f59e0b', '#10b981', '#a855f7', '#38bdf8'],

  getThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    return {
      text: styles.getPropertyValue('--text-2').trim() || '#4b536a',
      grid: styles.getPropertyValue('--border').trim() || 'rgba(15, 23, 42, 0.09)'
    };
  },

  init() {
    this.initializeCharts();
  },

  refresh() {
    if (!window.Chart) return;
    this.destroyCharts();
    this.initializeCharts();
  },

  initializeCharts() {
    safeExecute(() => {
      if (AppState.currentPage === 'dashboard') {
        this.initDashboardCharts();
      } else if (AppState.currentPage === 'analytics') {
        this.initAnalyticsCharts();
      }
    }, 'Chart initialization failed');
  },

  initDashboardCharts() {
    setTimeout(() => {
      safeExecute(() => {
        this.createRevenueChart();
        this.createUserGrowthChart();
        console.log('✓ Dashboard charts created');
      }, 'Dashboard charts creation failed');
    }, 100);
  },

  initAnalyticsCharts() {
    setTimeout(() => {
      safeExecute(() => {
        this.createMonthlyRevenueChart();
        this.createEngagementChart();
        console.log('✓ Analytics charts created');
      }, 'Analytics charts creation failed');
    }, 100);
  },

  createRevenueChart() {
    const canvas = $('#revenueChart');
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    const themed = this.getThemeColors();
    
    if (AppState.charts.revenue) {
      AppState.charts.revenue.destroy();
    }

    AppState.charts.revenue = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue',
          data: AppData.analyticsData.revenue,
          borderColor: this.colors[0],
          backgroundColor: this.colors[0] + '20',
          pointBackgroundColor: this.colors[0],
          pointBorderColor: this.colors[0],
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: themed.grid },
            ticks: {
              color: themed.text,
              callback: function(value) {
                return '₹' + (value / 1000) + 'k';
              }
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: themed.text }
          }
        }
      }
    });
  },

  createUserGrowthChart() {
    const canvas = $('#userGrowthChart');
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    const themed = this.getThemeColors();

    if (AppState.charts.userGrowth) {
      AppState.charts.userGrowth.destroy();
    }

    AppState.charts.userGrowth = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Users',
          data: AppData.analyticsData.users,
          backgroundColor: this.colors[1] + 'cc',
          borderColor: this.colors[1],
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 24
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: themed.grid },
            ticks: { color: themed.text }
          },
          x: {
            grid: { display: false },
            ticks: { color: themed.text }
          }
        }
      }
    });
  },

  createMonthlyRevenueChart() {
    const canvas = $('#monthlyRevenueChart');
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    const themed = this.getThemeColors();

    if (AppState.charts.monthlyRevenue) {
      AppState.charts.monthlyRevenue.destroy();
    }

    AppState.charts.monthlyRevenue = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Monthly Revenue',
          data: AppData.analyticsData.revenue,
          borderColor: this.colors[0],
          backgroundColor: this.colors[0] + '20',
          pointBackgroundColor: this.colors[0],
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: themed.text, usePointStyle: true, boxWidth: 8 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: themed.grid },
            ticks: {
              color: themed.text,
              callback: function(value) {
                return '₹' + (value / 1000) + 'k';
              }
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: themed.text }
          }
        }
      }
    });
  },

  createEngagementChart() {
    const canvas = $('#engagementChart');
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    const themed = this.getThemeColors();

    if (AppState.charts.engagement) {
      AppState.charts.engagement.destroy();
    }

    AppState.charts.engagement = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['New Users', 'Returning Users', 'Inactive Users'],
        datasets: [{
          data: [AppData.analyticsData.engagement.new, AppData.analyticsData.engagement.returning, AppData.analyticsData.engagement.inactive],
          backgroundColor: [this.colors[0], this.colors[1], this.colors[2]],
          borderColor: 'transparent',
          hoverOffset: 4,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { color: themed.text, usePointStyle: true, boxWidth: 8, padding: 16 }
          }
        }
      }
    });
  },

  destroyCharts() {
    safeExecute(() => {
      Object.values(AppState.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
      AppState.charts = {};
    }, 'Chart destruction failed');
  }
};

// Page Navigation System - FIXED
const PageNavigator = {
  init() {
    safeExecute(() => {
      this.bindEvents();
      this.showPage(AppState.currentPage);
      console.log('✓ Page Navigator initialized');
    }, 'Page Navigator initialization failed');
  },

  bindEvents() {
    // Handle all navigation clicks with a single event listener
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-page]');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        const page = link.getAttribute('data-page');
        console.log('Navigation clicked:', page);
        this.showPage(page);
      }
    });
  },

  showPage(pageId) {
    safeExecute(() => {
      console.log('Navigating to page:', pageId);
      
      AppState.currentPage = pageId;

      // Determine if this is a dashboard page
      const dashboardPages = ['dashboard', 'analytics', 'users', 'settings'];
      const isDashboardPage = dashboardPages.includes(pageId);

      // Update UI mode
      this.updateUIMode(isDashboardPage);

      // Hide all pages
      const allPages = $$('.page');
      allPages.forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('active');
      });

      // Show target page
      const targetPage = $(`#${pageId}Page`);
      if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
        console.log('Page shown:', pageId);
      } else {
        console.warn('Page not found:', pageId);
      }

      // Update navigation active state
      this.updateActiveNavigation(pageId);

      // Handle page-specific initialization
      this.handlePageInit(pageId);

      // Close mobile navigation surfaces if open
      if (window.MobileMenu) {
        MobileMenu.close();
        MobileMenu.closeDashboardSidebar();
      }

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, `Navigation to ${pageId} failed`);
  },

  updateUIMode(isDashboardMode) {
    safeExecute(() => {
      AppState.isDashboardMode = isDashboardMode;
      
      const marketingNav = $('.marketing-nav');
      const dashboardNav = $('.dashboard-nav');
      const dashboardSidebar = $('#dashboardSidebar');
      const mainContent = $('#mainContent');
      const footer = $('.footer');

      if (isDashboardMode && AppState.isLoggedIn) {
        // Show dashboard UI
        if (marketingNav) marketingNav.classList.add('hidden');
        if (dashboardNav) dashboardNav.classList.remove('hidden');
        if (dashboardSidebar) dashboardSidebar.classList.remove('hidden');
        if (mainContent) mainContent.classList.add('dashboard-mode');
        if (footer) footer.classList.add('hidden');
      } else {
        // Show marketing UI
        if (marketingNav) marketingNav.classList.remove('hidden');
        if (dashboardNav) dashboardNav.classList.add('hidden');
        if (dashboardSidebar) dashboardSidebar.classList.add('hidden');
        if (mainContent) mainContent.classList.remove('dashboard-mode');
        if (footer) footer.classList.remove('hidden');
      }
    }, 'UI mode update failed');
  },

  updateActiveNavigation(pageId) {
    safeExecute(() => {
      // Clear all active states
      const allNavLinks = $$('.nav-link, .mobile-menu-link, .sidebar-link');
      allNavLinks.forEach(link => link.classList.remove('active'));

      // Set active state for current page
      const activeLinks = $$(`[data-page="${pageId}"]`);
      activeLinks.forEach(link => link.classList.add('active'));
    }, 'Navigation update failed');
  },

  handlePageInit(pageId) {
    safeExecute(() => {
      switch (pageId) {
        case 'home':
          setTimeout(() => Hero3D.init(), 200);
          break;
        case 'dashboard':
          ChartManager.destroyCharts();
          ChartManager.initDashboardCharts();
          this.updateKPIValues();
          break;
        case 'analytics':
          ChartManager.destroyCharts();
          ChartManager.initAnalyticsCharts();
          break;
        case 'users':
          if (window.UserManager) {
            UserManager.renderUsersTable();
          }
          break;
        default:
          Hero3D.destroy();
          ChartManager.destroyCharts();
          break;
      }
    }, `Page initialization for ${pageId} failed`);
  },

  updateKPIValues() {
    safeExecute(() => {
      const kpiUsers = $('#kpiUsers');
      const kpiRevenue = $('#kpiRevenue');
      const kpiConversion = $('#kpiConversion');
      const kpiChurn = $('#kpiChurn');

      if (kpiUsers) kpiUsers.textContent = AppData.analyticsData.users[AppData.analyticsData.users.length - 1].toLocaleString();
      if (kpiRevenue) kpiRevenue.textContent = formatCurrency(AppData.analyticsData.revenue[AppData.analyticsData.revenue.length - 1]);
      if (kpiConversion) kpiConversion.textContent = '3.2%';
      if (kpiChurn) kpiChurn.textContent = '2.1%';
    }, 'KPI update failed');
  }
};

// User Management System - Fixed
const UserManager = {
  init() {
    safeExecute(() => {
      this.bindEvents();
      AppState.users = [...AppData.sampleUsers];
      console.log('✓ User Manager initialized');
    }, 'User Manager initialization failed');
  },

  bindEvents() {
    // Add user button
    const addUserBtn = $('#addUserBtn');
    if (addUserBtn) {
      addUserBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showAddUserModal();
      });
    }

    // Add user modal close
    const addUserModalClose = $('#addUserModalClose');
    if (addUserModalClose) {
      addUserModalClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hideAddUserModal();
      });
    }

    // Add user form
    const addUserForm = $('#addUserForm');
    if (addUserForm) {
      addUserForm.addEventListener('submit', (e) => this.handleAddUser(e));
    }

    // Search and filters
    const userSearch = $('#userSearch');
    if (userSearch) {
      userSearch.addEventListener('input', debounce(() => this.filterUsers(), 300));
    }

    const roleFilter = $('#roleFilter');
    const statusFilter = $('#statusFilter');
    
    if (roleFilter) {
      roleFilter.addEventListener('change', () => this.filterUsers());
    }
    
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.filterUsers());
    }

    // Modal backdrop click
    const addUserModal = $('#addUserModal');
    if (addUserModal) {
      addUserModal.addEventListener('click', (e) => {
        if (e.target === addUserModal || e.target.classList.contains('modal-backdrop')) {
          this.hideAddUserModal();
        }
      });
    }
  },

  renderUsersTable() {
    safeExecute(() => {
      const tbody = $('#usersTableBody');
      if (!tbody) return;

      const users = AppState.users;
      
      tbody.innerHTML = users.map(user => `
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-cell-avatar">
                ${user.avatar}
              </div>
              <div class="user-cell-info">
                <div class="user-cell-name">${user.name}</div>
              </div>
            </div>
          </td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td><span class="status status--${user.status.toLowerCase() === 'active' ? 'success' : 'error'}">${user.status}</span></td>
          <td>${formatDate(user.joinDate)}</td>
          <td>
            <div class="table-actions">
              <button type="button" class="btn btn--sm btn--outline" onclick="UserManager.editUser(${user.id})">Edit</button>
              <button type="button" class="btn btn--sm btn-danger" onclick="UserManager.deleteUser(${user.id})">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    }, 'Users table rendering failed');
  },

  showAddUserModal() {
    safeExecute(() => {
      const modal = $('#addUserModal');
      if (modal) {
        modal.classList.remove('hidden');
      }
    }, 'Show add user modal failed');
  },

  hideAddUserModal() {
    safeExecute(() => {
      const modal = $('#addUserModal');
      if (modal) {
        modal.classList.add('hidden');
      }
    }, 'Hide add user modal failed');
  },

  handleAddUser(e) {
    e.preventDefault();
    safeExecute(() => {
      const form = e.target;
      const inputs = form.querySelectorAll('input, select');
      
      const userData = {
        name: inputs[0].value,
        email: inputs[1].value,
        role: inputs[2].value,
        status: inputs[3].value
      };

      // Validate
      if (!userData.name || !userData.email || !userData.role) {
        NotificationManager.showError('Please fill in all required fields');
        return;
      }

      // Check if email already exists
      if (AppState.users.find(user => user.email === userData.email)) {
        NotificationManager.showError('A user with this email already exists');
        return;
      }

      // Add user
      const newUser = {
        id: Date.now(),
        ...userData,
        joinDate: new Date().toISOString().split('T')[0],
        avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase()
      };

      AppState.users.push(newUser);
      NotificationManager.showSuccess('User added successfully!');
      this.hideAddUserModal();
      this.renderUsersTable();
      form.reset();
    }, 'Add user failed');
  },

  editUser(id) {
    safeExecute(() => {
      const user = AppState.users.find(user => user.id === id);
      if (user) {
        NotificationManager.showSuccess(`Edit user feature coming soon! User: ${user.name}`);
      }
    }, 'Edit user failed');
  },

  deleteUser(id) {
    safeExecute(() => {
      const user = AppState.users.find(user => user.id === id);
      if (user && confirm(`Are you sure you want to delete ${user.name}?`)) {
        AppState.users = AppState.users.filter(user => user.id !== id);
        NotificationManager.showSuccess('User deleted successfully!');
        this.renderUsersTable();
      }
    }, 'Delete user failed');
  },

  filterUsers() {
    safeExecute(() => {
      const searchTerm = $('#userSearch')?.value.toLowerCase() || '';
      const roleFilter = $('#roleFilter')?.value || '';
      const statusFilter = $('#statusFilter')?.value || '';

      const users = AppState.users;
      const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                             user.email.toLowerCase().includes(searchTerm);
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.status === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
      });

      const tbody = $('#usersTableBody');
      if (!tbody) return;

      tbody.innerHTML = filteredUsers.map(user => `
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-cell-avatar">
                ${user.avatar}
              </div>
              <div class="user-cell-info">
                <div class="user-cell-name">${user.name}</div>
              </div>
            </div>
          </td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td><span class="status status--${user.status.toLowerCase() === 'active' ? 'success' : 'error'}">${user.status}</span></td>
          <td>${formatDate(user.joinDate)}</td>
          <td>
            <div class="table-actions">
              <button type="button" class="btn btn--sm btn--outline" onclick="UserManager.editUser(${user.id})">Edit</button>
              <button type="button" class="btn btn--sm btn-danger" onclick="UserManager.deleteUser(${user.id})">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');

      // Update pagination info
      const paginationInfo = $('#usersPagination .pagination-info');
      if (paginationInfo) {
        paginationInfo.textContent = `Showing 1-${filteredUsers.length} of ${filteredUsers.length} users`;
      }
    }, 'User filtering failed');
  }
};

// Mobile Menu Management
const MobileMenu = {
  isOpen: false,
  isSidebarOpen: false,

  init() {
    safeExecute(() => {
      this.bindEvents();
      this.syncSidebarA11y();
      console.log('✓ Mobile Menu initialized');
    }, 'Mobile Menu initialization failed');
  },

  bindEvents() {
    const menuToggle = $('#mobileMenuToggle');
    const dashboardToggle = $('#dashboardMenuToggle');

    if (menuToggle) {
      menuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      });
    }

    if (dashboardToggle) {
      dashboardToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDashboardSidebar();
      });
    }

    document.addEventListener('click', (e) => {
      const mobileLink = e.target.closest('.mobile-menu-link');
      if (mobileLink) {
        this.close();
      }

      const sidebarLink = e.target.closest('.sidebar-link');
      if (sidebarLink) {
        this.closeDashboardSidebar();
      }

      const menu = $('#mobileMenu');
      const menuToggle = $('#mobileMenuToggle');
      if (this.isOpen && menu && !menu.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
        this.close();
      }

      const sidebar = $('#dashboardSidebar');
      const dashboardToggle = $('#dashboardMenuToggle');
      if (this.isSidebarOpen && sidebar && !sidebar.contains(e.target) &&
          dashboardToggle && !dashboardToggle.contains(e.target)) {
        this.closeDashboardSidebar();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;

      this.close();
      this.closeDashboardSidebar();

      const userDropdown = $('#userDropdown');
      if (userDropdown) userDropdown.classList.add('hidden');

      if (window.NotificationManager) {
        NotificationManager.hideNotifications();
      }
      if (window.AuthManager) {
        AuthManager.hideLoginModal();
        AuthManager.hideSignupModal();
      }
      if (window.UserManager) {
        UserManager.hideAddUserModal();
      }
    });

    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth > 1024) {
        this.close();
        this.closeDashboardSidebar();
      } else {
        this.syncSidebarA11y();
      }
    }, 150));
  },

  toggle() {
    this.isOpen ? this.close() : this.open();
  },

  open() {
    safeExecute(() => {
      const menu = $('#mobileMenu');
      const toggle = $('#mobileMenuToggle');

      this.closeDashboardSidebar();

      if (menu) {
        menu.classList.remove('hidden');
        menu.setAttribute('aria-hidden', 'false');
        this.isOpen = true;
        document.body.classList.add('no-scroll');
      }

      if (toggle) {
        toggle.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close navigation menu');
      }
    }, 'Mobile menu open failed');
  },

  close() {
    safeExecute(() => {
      const menu = $('#mobileMenu');
      const toggle = $('#mobileMenuToggle');

      if (menu) {
        menu.classList.add('hidden');
        menu.setAttribute('aria-hidden', 'true');
      }

      this.isOpen = false;
      document.body.classList.remove('no-scroll');

      if (toggle) {
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
      }
    }, 'Mobile menu close failed');
  },

  toggleDashboardSidebar() {
    this.isSidebarOpen ? this.closeDashboardSidebar() : this.openDashboardSidebar();
  },

  openDashboardSidebar() {
    safeExecute(() => {
      this.close();

      const sidebar = $('#dashboardSidebar');
      const toggle = $('#dashboardMenuToggle');

      if (sidebar) {
        sidebar.classList.add('mobile-open');
        this.isSidebarOpen = true;
        document.body.classList.add('sidebar-open');
      }

      if (toggle) {
        toggle.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close dashboard menu');
      }

      this.syncSidebarA11y();
    }, 'Dashboard menu open failed');
  },

  closeDashboardSidebar() {
    safeExecute(() => {
      const sidebar = $('#dashboardSidebar');
      const toggle = $('#dashboardMenuToggle');

      if (sidebar) {
        sidebar.classList.remove('mobile-open');
      }

      this.isSidebarOpen = false;
      document.body.classList.remove('sidebar-open');

      if (toggle) {
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open dashboard menu');
      }

      this.syncSidebarA11y();
    }, 'Dashboard menu close failed');
  },

  syncSidebarA11y() {
    const sidebar = $('#dashboardSidebar');
    if (!sidebar) return;

    const hiddenOnMobile = window.innerWidth <= 1024 && !this.isSidebarOpen;
    sidebar.setAttribute('aria-hidden', hiddenOnMobile ? 'true' : 'false');
    if ('inert' in sidebar) {
      sidebar.inert = hiddenOnMobile;
    }
  }
};

// Authentication System - FIXED
const AuthManager = {
  init() {
    safeExecute(() => {
      this.bindEvents();
      this.checkStoredAuth();
      console.log('✓ Auth Manager initialized');
    }, 'Auth Manager initialization failed');
  },

  checkStoredAuth() {
    try {
      const savedUser = localStorage.getItem('saastudio_user');
      if (savedUser) {
        AppState.isLoggedIn = true;
        AppState.currentUser = JSON.parse(savedUser);
        this.updateAuthUI();
        this.updateUserDisplay();
      }
    } catch (error) {
      console.warn('Stored auth check failed:', error);
    }
  },

  bindEvents() {
    // Login buttons - improved targeting
    document.addEventListener('click', (e) => {
      const loginBtn = e.target.closest('#loginBtn, #mobileLoginBtn');
      if (loginBtn) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Login button clicked');
        if (AppState.isLoggedIn) {
          PageNavigator.showPage('dashboard');
        } else {
          this.showLoginModal();
        }
      }

      const signupBtn = e.target.closest('#signupBtn, #mobileSignupBtn');
      if (signupBtn) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Signup button clicked');
        if (AppState.isLoggedIn) {
          this.logout();
        } else {
          this.showSignupModal();
        }
      }

      // Hero CTA
      const heroCTA = e.target.closest('.hero-cta');
      if (heroCTA) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Hero CTA clicked');
        if (AppState.isLoggedIn) {
          PageNavigator.showPage('dashboard');
        } else {
          this.showSignupModal();
        }
      }
    });

    // Modal events
    this.bindModalEvents();
    
    // User menu
    this.bindUserMenuEvents();
  },

  bindModalEvents() {
    // Modal close buttons
    const loginClose = $('#loginModalClose');
    const signupClose = $('#signupModalClose');
    
    if (loginClose) {
      loginClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hideLoginModal();
      });
    }
    
    if (signupClose) {
      signupClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hideSignupModal();
      });
    }

    // Switch between modals
    const showSignupLink = $('#showSignup');
    const showLoginLink = $('#showLogin');
    
    if (showSignupLink) {
      showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hideLoginModal();
        this.showSignupModal();
      });
    }

    if (showLoginLink) {
      showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hideSignupModal();
        this.showLoginModal();
      });
    }

    // Form submissions
    const loginForm = $('#loginForm');
    const signupForm = $('#signupForm');
    
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
    
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    }

    // Password toggles
    const passwordToggles = $$('.password-toggle');
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const input = e.target.parentElement.querySelector('input');
        if (input) {
          const type = input.type === 'password' ? 'text' : 'password';
          input.type = type;
          toggle.textContent = type === 'password' ? '👁️' : '🙈';
        }
      });
    });

    // Close modals on backdrop click
    const loginModal = $('#loginModal');
    const signupModal = $('#signupModal');
    
    [loginModal, signupModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
            if (modal === loginModal) {
              this.hideLoginModal();
            } else {
              this.hideSignupModal();
            }
          }
        });
      }
    });
  },

  bindUserMenuEvents() {
    const userAvatar = $('#userAvatar');
    const userDropdown = $('#userDropdown');
    const logoutBtn = $('#logoutBtn');
    
    if (userAvatar) {
      userAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.NotificationManager) {
          NotificationManager.hideNotifications();
        }
        if (userDropdown) {
          userDropdown.classList.toggle('hidden');
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.logout();
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (userDropdown && 
          !userDropdown.contains(e.target) && 
          !userAvatar?.contains(e.target)) {
        userDropdown.classList.add('hidden');
      }
    });
  },

  showLoginModal() {
    safeExecute(() => {
      const modal = $('#loginModal');
      const form = $('#loginForm');

      if (window.MobileMenu) {
        MobileMenu.close();
        MobileMenu.closeDashboardSidebar();
      }

      if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('no-scroll');
      }
      if (form) form.reset();
    }, 'Show login modal failed');
  },

  hideLoginModal() {
    safeExecute(() => {
      const modal = $('#loginModal');
      if (modal) modal.classList.add('hidden');
      if ($('#signupModal')?.classList.contains('hidden')) {
        document.body.classList.remove('no-scroll');
      }
    }, 'Hide login modal failed');
  },

  showSignupModal() {
    safeExecute(() => {
      const modal = $('#signupModal');
      const form = $('#signupForm');

      if (window.MobileMenu) {
        MobileMenu.close();
        MobileMenu.closeDashboardSidebar();
      }

      if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('no-scroll');
      }
      if (form) form.reset();
    }, 'Show signup modal failed');
  },

  hideSignupModal() {
    safeExecute(() => {
      const modal = $('#signupModal');
      if (modal) modal.classList.add('hidden');
      if ($('#loginModal')?.classList.contains('hidden')) {
        document.body.classList.remove('no-scroll');
      }
    }, 'Hide signup modal failed');
  },

  async handleLogin(e) {
    e.preventDefault();
    
    await safeExecute(async () => {
      const form = e.target;
      const inputs = form.querySelectorAll('input');
      const email = inputs[0]?.value || '';
      const password = inputs[1]?.value || '';

      if (!this.validateEmail(email)) {
        NotificationManager.showError('Please enter a valid email address');
        return;
      }

      if (password.length < 6) {
        NotificationManager.showError('Password must be at least 6 characters');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      this.setLoading(submitBtn, true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const user = {
        email: email,
        name: email.split('@')[0],
        role: 'Admin',
        loginTime: new Date().toISOString()
      };

      AppState.isLoggedIn = true;
      AppState.currentUser = user;
      
      try {
        localStorage.setItem('saastudio_user', JSON.stringify(user));
      } catch (e) {
        console.warn('Unable to save user to localStorage:', e);
      }

      this.setLoading(submitBtn, false);
      this.hideLoginModal();
      this.updateAuthUI();
      this.updateUserDisplay();
      NotificationManager.showSuccess('Successfully logged in!');
      
      // Redirect to dashboard
      PageNavigator.showPage('dashboard');
    }, 'Login failed');
  },

  async handleSignup(e) {
    e.preventDefault();
    
    await safeExecute(async () => {
      const form = e.target;
      const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
      const checkbox = form.querySelector('input[type="checkbox"]');
      
      const name = inputs[0]?.value || '';
      const email = inputs[1]?.value || '';
      const password = inputs[2]?.value || '';
      const confirmPassword = inputs[3]?.value || '';
      const termsAccepted = checkbox?.checked || false;

      // Validation
      if (!name.trim()) {
        NotificationManager.showError('Please enter your full name');
        return;
      }

      if (!this.validateEmail(email)) {
        NotificationManager.showError('Please enter a valid email address');
        return;
      }

      if (password.length < 6) {
        NotificationManager.showError('Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        NotificationManager.showError('Passwords do not match');
        return;
      }

      if (!termsAccepted) {
        NotificationManager.showError('Please accept the Terms of Service');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      this.setLoading(submitBtn, true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const user = {
        email: email,
        name: name,
        role: 'User',
        signupTime: new Date().toISOString()
      };

      AppState.isLoggedIn = true;
      AppState.currentUser = user;
      
      try {
        localStorage.setItem('saastudio_user', JSON.stringify(user));
      } catch (e) {
        console.warn('Unable to save user to localStorage:', e);
      }

      this.setLoading(submitBtn, false);
      this.hideSignupModal();
      this.updateAuthUI();
      this.updateUserDisplay();
      NotificationManager.showSuccess('Account created successfully!');
      
      // Redirect to dashboard
      PageNavigator.showPage('dashboard');
    }, 'Signup failed');
  },

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  setLoading(button, isLoading) {
    if (!button) return;
    
    if (isLoading) {
      button.classList.add('loading');
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  },

  updateAuthUI() {
    safeExecute(() => {
      const loginBtns = $$('#loginBtn, #mobileLoginBtn');
      const signupBtns = $$('#signupBtn, #mobileSignupBtn');

      loginBtns.forEach(btn => {
        if (btn) {
          btn.textContent = AppState.isLoggedIn ? 'Dashboard' : 'Login';
        }
      });

      signupBtns.forEach(btn => {
        if (btn) {
          btn.textContent = AppState.isLoggedIn ? 'Logout' : 'Sign Up';
        }
      });
    }, 'Auth UI update failed');
  },

  updateUserDisplay() {
    safeExecute(() => {
      if (!AppState.currentUser) return;

      const userName = $('#userName');
      const userEmail = $('#userEmail');
      const userAvatar = $('#userAvatar');

      if (userName) userName.textContent = AppState.currentUser.name;
      if (userEmail) userEmail.textContent = AppState.currentUser.email;
      if (userAvatar) {
        const initials = AppState.currentUser.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase();
        userAvatar.textContent = initials;
      }
    }, 'User display update failed');
  },

  logout() {
    safeExecute(() => {
      AppState.isLoggedIn = false;
      AppState.currentUser = null;
      
      try {
        localStorage.removeItem('saastudio_user');
      } catch (e) {
        console.warn('Unable to remove user from localStorage:', e);
      }
      
      this.updateAuthUI();
      NotificationManager.showSuccess('Successfully logged out!');
      
      // Redirect to home
      PageNavigator.showPage('home');
    }, 'Logout failed');
  }
};

// Notification Management
const NotificationManager = {
  init() {
    safeExecute(() => {
      this.bindEvents();
      this.updateCount();
      console.log('✓ Notification Manager initialized');
    }, 'Notification Manager initialization failed');
  },

  bindEvents() {
    const notificationBell = $('#notificationBell');
    if (notificationBell) {
      notificationBell.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleNotifications();
      });
    }

    const markAllReadBtn = $('#markAllReadBtn');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.markAllRead();
      });
    }

    document.addEventListener('click', (e) => {
      const notificationsDropdown = $('#notificationsDropdown');
      if (notificationsDropdown &&
          !notificationsDropdown.contains(e.target) &&
          !notificationBell?.contains(e.target)) {
        this.hideNotifications();
      }
    });
  },

  toggleNotifications() {
    safeExecute(() => {
      const dropdown = $('#notificationsDropdown');
      const notificationBell = $('#notificationBell');
      const userDropdown = $('#userDropdown');

      if (userDropdown) {
        userDropdown.classList.add('hidden');
      }

      if (dropdown) {
        const isOpening = dropdown.classList.contains('hidden');
        dropdown.classList.toggle('hidden');
        if (notificationBell) {
          notificationBell.setAttribute('aria-expanded', isOpening ? 'true' : 'false');
        }
      }
    }, 'Toggle notifications failed');
  },

  hideNotifications() {
    safeExecute(() => {
      const dropdown = $('#notificationsDropdown');
      if (dropdown) {
        dropdown.classList.add('hidden');
      }
      const notificationBell = $('#notificationBell');
      if (notificationBell) {
        notificationBell.setAttribute('aria-expanded', 'false');
      }
    }, 'Hide notifications failed');
  },

  markAllRead() {
    safeExecute(() => {
      const items = $$('.notification-item');
      items.forEach(item => item.classList.add('read'));

      const count = $('#notificationCount');
      if (count) {
        count.textContent = '0';
        count.classList.add('hidden');
      }
    }, 'Mark all notifications read failed');
  },

  updateCount() {
    safeExecute(() => {
      const count = $('#notificationCount');
      const items = Array.from($$('.notification-item'));
      if (!count) return;

      const unread = items.filter(item => !item.classList.contains('read')).length;
      count.textContent = String(unread);
      count.classList.toggle('hidden', unread === 0);
    });
  },

  showSuccess(message) {
    this.showNotification(message, 'success');
  },

  showError(message) {
    this.showNotification(message, 'error');
  },

  showNotification(message, type) {
    safeExecute(() => {
      let stack = $('.toast-stack');
      if (!stack) {
        stack = document.createElement('div');
        stack.className = 'toast-stack';
        stack.setAttribute('aria-live', 'polite');
        stack.setAttribute('aria-atomic', 'false');
        document.body.appendChild(stack);
      }

      const notification = document.createElement('div');
      notification.className = `notification notification--${type}`;
      notification.setAttribute('role', type === 'error' ? 'alert' : 'status');

      const icon = document.createElement('span');
      icon.className = 'notification-icon-badge';
      icon.textContent = type === 'error' ? '⚠' : '✓';
      icon.setAttribute('aria-hidden', 'true');

      const text = document.createElement('span');
      text.className = 'notification-text';
      text.textContent = message;

      notification.append(icon, text);
      stack.appendChild(notification);

      requestAnimationFrame(() => notification.classList.add('show'));

      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 260);
      }, 3200);
    }, 'Show notification failed');
  }
};

// Form Management - Fixed
const FormManager = {
  init() {
    safeExecute(() => {
      this.bindEvents();
      console.log('✓ Form Manager initialized');
    }, 'Form Manager initialization failed');
  },

  bindEvents() {
    // Contact form
    const contactForm = $('#contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
    }
    
    // Newsletter form
    const newsletterForm = $('#newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => this.handleNewsletterForm(e));
    }

    // Settings forms
    const settingsForms = $$('.settings-form');
    settingsForms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleSettingsUpdate(e));
    });

    // Toggle switches (the theme switch is owned by ThemeManager)
    const toggleSwitches = $$('.toggle-switch:not(#settingsThemeToggle)');
    toggleSwitches.forEach(toggle => {
      toggle.addEventListener('click', (e) => this.handleToggle(e));
    });
  },

  async handleContactForm(e) {
    e.preventDefault();
    
    await safeExecute(async () => {
      const form = e.target;
      
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = '#ef4444';
        } else {
          field.style.borderColor = '';
        }
      });

      if (!isValid) {
        NotificationManager.showError('Please fill in all required fields');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      AuthManager.setLoading(submitBtn, true);

      await new Promise(resolve => setTimeout(resolve, 1500));

      AuthManager.setLoading(submitBtn, false);
      NotificationManager.showSuccess('Message sent successfully! We\'ll get back to you soon.');
      form.reset();
    }, 'Contact form submission failed');
  },

  async handleNewsletterForm(e) {
    e.preventDefault();
    
    await safeExecute(async () => {
      const form = e.target;
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput?.value || '';

      if (!AuthManager.validateEmail(email)) {
        NotificationManager.showError('Please enter a valid email address');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      AuthManager.setLoading(submitBtn, true);

      await new Promise(resolve => setTimeout(resolve, 1000));

      AuthManager.setLoading(submitBtn, false);
      NotificationManager.showSuccess('Successfully subscribed to our newsletter!');
      form.reset();
    }, 'Newsletter subscription failed');
  },

  async handleSettingsUpdate(e) {
    e.preventDefault();
    
    await safeExecute(async () => {
      const submitBtn = e.target.querySelector('button[type="submit"]');
      AuthManager.setLoading(submitBtn, true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      AuthManager.setLoading(submitBtn, false);
      NotificationManager.showSuccess('Settings updated successfully!');
    }, 'Settings update failed');
  },

  handleToggle(e) {
    safeExecute(() => {
      const toggle = e.target.closest('.toggle-switch');
      if (!toggle) return;
      
      toggle.classList.toggle('active');
      NotificationManager.showSuccess('Preference updated!');
    }, 'Toggle handling failed');
  }
};

// Pricing Management - Fixed  
const PricingManager = {
  init() {
    safeExecute(() => {
      this.bindEvents();
      console.log('✓ Pricing Manager initialized');
    }, 'Pricing Manager initialization failed');
  },

  bindEvents() {
    // Use event delegation for plan buttons
    document.addEventListener('click', (e) => {
      const planBtn = e.target.closest('.plan-btn');
      if (planBtn) {
        e.preventDefault();
        e.stopPropagation();
        const planName = planBtn.textContent.replace('Choose ', '');
        this.selectPlan(planName);
      }
    });
  },

  selectPlan(planName) {
    safeExecute(() => {
      console.log('Plan selected:', planName);
      
      if (!AppState.isLoggedIn) {
        AuthManager.showSignupModal();
        NotificationManager.showSuccess('Please create an account to select a plan');
        return;
      }

      NotificationManager.showSuccess(`${planName} plan selected! Redirecting to checkout...`);
      
      setTimeout(() => {
        NotificationManager.showSuccess('Checkout feature coming soon!');
      }, 2000);
    }, 'Plan selection failed');
  }
};

// Main Application Class - Fixed
class SaaStudioApp {
  constructor() {
    this.initializeApp();
  }

  async initializeApp() {
    try {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    } catch (error) {
      console.error('App initialization failed:', error);
    }
  }

  start() {
    console.log('🚀 Initializing SaaStudio App...');
    
    try {
      // Initialize all modules with comprehensive error handling
      this.initializeModules();
      this.setCurrentYear();

      // Set app as initialized
      AppState.isInitialized = true;
      
      console.log('✅ SaaStudio App initialized successfully!');
      console.log('Current state:', AppState);
    } catch (error) {
      console.error('❌ Error starting SaaStudio App:', error);
      if (window.NotificationManager) {
        NotificationManager.showError('Application failed to start. Please refresh the page.');
      }
    }
  }

  initializeModules() {
    const modules = [
      { name: 'Theme Manager', instance: ThemeManager },
      { name: 'Page Navigator', instance: PageNavigator },
      { name: 'Mobile Menu', instance: MobileMenu },
      { name: 'Auth Manager', instance: AuthManager },
      { name: 'User Manager', instance: UserManager },
      { name: 'Notification Manager', instance: NotificationManager },
      { name: 'Form Manager', instance: FormManager },
      { name: 'Pricing Manager', instance: PricingManager }
    ];

    modules.forEach(module => {
      try {
        module.instance.init();
        console.log(`✓ ${module.name} initialized`);
      } catch (error) {
        console.error(`✗ ${module.name} failed to initialize:`, error);
      }
    });

    // Initialize 3D hero for home page with delay
    if (AppState.currentPage === 'home') {
      setTimeout(() => {
        try {
          Hero3D.init();
          console.log('✓ 3D Hero initialized');
        } catch (error) {
          console.error('✗ 3D Hero failed to initialize:', error);
        }
      }, 500);
    }

    // Make instances globally available
    window.ThemeManager = ThemeManager;
    window.PageNavigator = PageNavigator;
    window.MobileMenu = MobileMenu;
    window.AuthManager = AuthManager;
    window.UserManager = UserManager;
    window.NotificationManager = NotificationManager;
    window.FormManager = FormManager;
    window.PricingManager = PricingManager;
    window.ChartManager = ChartManager;
    window.Hero3D = Hero3D;
  }

  setCurrentYear() {
    const year = $('#currentYear');
    if (year) {
      year.textContent = new Date().getFullYear();
    }
  }

  // Public methods for debugging
  getState() {
    return AppState;
  }

  navigateTo(page) {
    PageNavigator.showPage(page);
  }

  toggleTheme() {
    ThemeManager.toggle();
  }
}

// Global error handlers
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  if (AppState.isInitialized && window.NotificationManager) {
    NotificationManager.showError('An unexpected error occurred.');
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  if (AppState.isInitialized && window.NotificationManager) {
    NotificationManager.showError('An unexpected error occurred.');
  }
  e.preventDefault();
});

// Performance monitoring
window.addEventListener('load', () => {
  try {
    if ('performance' in window) {
      const perf = performance.getEntriesByType('navigation')[0];
      if (perf) {
        console.log(`⚡ Page loaded in ${Math.round(perf.loadEventEnd - perf.fetchStart)}ms`);
      }
    }
  } catch (error) {
    console.warn('Performance monitoring failed:', error);
  }
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
  try {
    if (document.hidden && Hero3D.isAnimating) {
      Hero3D.isAnimating = false;
    } else if (!document.hidden && AppState.currentPage === 'home') {
      Hero3D.isAnimating = true;
      Hero3D.animate();
    }
  } catch (error) {
    console.warn('Visibility change handling failed:', error);
  }
});

// Initialize the application
let app;

try {
  app = new SaaStudioApp();
} catch (error) {
  console.error('Failed to create app instance:', error);
}

// Make app globally accessible for debugging
if (typeof window !== 'undefined') {
  window.SaaStudioApp = app;
  window.AppState = AppState;
  window.AppData = AppData;
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SaaStudioApp, AppState, AppData };
}