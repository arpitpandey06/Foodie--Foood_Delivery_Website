// Admin Panel JavaScript with Authentication
class AdminPanel {
    constructor() {
        // Default 6 products
        this.defaultMenuItems = [
            {
                id: 1,
                name: "Double Cheese Burger",
                price: 200,
                image: "assets/burger.png",
                inStock: true,
                stock: 10
            },
            {
                id: 2,
                name: "Pepperoni Pizza",
                price: 350,
                image: "assets/pizza.png",
                inStock: true,
                stock: 8
            },
            {
                id: 3,
                name: "Crispy Fries",
                price: 120,
                image: "assets/fries.png",
                inStock: true,
                stock: 15
            },
            {
                id: 4,
                name: "Chicken Wings",
                price: 280,
                image: "assets/wings.png",
                inStock: true,
                stock: 12
            },
            {
                id: 5,
                name: "Caesar Salad",
                price: 180,
                image: "assets/salad.png",
                inStock: false,
                stock: 0
            },
            {
                id: 6,
                name: "Chocolate Shake",
                price: 150,
                image: "assets/shake.png",
                inStock: true,
                stock: 20
            }
        ];

        // Load menu items from localStorage or use default
        let storedItems = JSON.parse(localStorage.getItem('menuItems'));
        if (!storedItems || storedItems.length === 0) {
            // If no items in localStorage, use default items
            this.menuItems = [...this.defaultMenuItems];
            localStorage.setItem('menuItems', JSON.stringify(this.menuItems));
        } else {
            this.menuItems = storedItems;
        }

        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentEditingItem = null;
        this.adminCredentials = {
            username: 'apandey9046',
            password: 'Admin@232422'
        };

        this.init();
    }

    init() {
        this.checkAdminAuth();
    }

    checkAdminAuth() {
        const adminLoginModal = document.getElementById('adminLoginModal');
        const adminPanel = document.getElementById('adminPanel');

        // Check if admin is already logged in (from main site)
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.role === 'admin') {
            // Admin is logged in, show admin panel
            adminLoginModal.style.display = 'none';
            adminPanel.style.display = 'flex';
            this.setupEventListeners();
            this.loadDashboard();
            this.loadMenuItems();
            this.loadOrders();
            this.loadCustomers();
        } else {
            // Show admin login modal
            adminLoginModal.style.display = 'block';
            adminPanel.style.display = 'none';
            this.setupAuthEventListeners();
        }
    }

    setupAuthEventListeners() {
        const adminLoginForm = document.getElementById('adminLoginForm');

        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdminLogin();
        });
    }

    handleAdminLogin() {
        const formData = new FormData(document.getElementById('adminLoginForm'));
        const username = formData.get('username');
        const password = formData.get('password');

        if (username === this.adminCredentials.username && password === this.adminCredentials.password) {
            // Successful admin login
            const adminUser = {
                id: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                email: username,
                role: 'admin'
            };
            localStorage.setItem('currentUser', JSON.stringify(adminUser));

            document.getElementById('adminLoginModal').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'flex';

            this.setupEventListeners();
            this.loadDashboard();
            this.loadMenuItems();
            this.loadOrders();
            this.loadCustomers();

            this.showMessage('Admin login successful!', 'success');
        } else {
            this.showMessage('Invalid admin credentials!', 'error');
        }
    }

    handleAdminLogout() {
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.id !== 'adminLogoutBtn') {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchTab(item.getAttribute('data-tab'));
                });
            }
        });

        // Admin logout
        document.getElementById('adminLogoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleAdminLogout();
        });

        // Add item button
        document.getElementById('addItemBtn').addEventListener('click', () => {
            this.openItemModal();
        });

        // Modal controls
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeItemModal();
        });

        document.getElementById('saveItemBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.saveItem();
        });

        document.getElementById('closeOrderBtn').addEventListener('click', () => {
            this.closeOrderModal();
        });

        // Close modals when clicking X
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Order filter
        document.getElementById('orderFilter').addEventListener('change', (e) => {
            this.filterOrders(e.target.value);
        });
    }

    switchTab(tabName) {
        // Update active tab in sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Update page title
        document.getElementById('pageTitle').textContent = this.getTabTitle(tabName);
    }

    getTabTitle(tabName) {
        const titles = {
            'dashboard': 'Dashboard',
            'menu-management': 'Menu Management',
            'orders': 'Order Management',
            'customers': 'Customer Management'
        };
        return titles[tabName] || 'Dashboard';
    }

    loadDashboard() {
        // Update stats in real-time
        this.updateDashboardStats();

        // Load recent activity
        this.loadRecentActivity();

        // Load charts data
        this.loadChartsData();
    }

    updateDashboardStats() {
        // Update stats with real-time data
        document.getElementById('totalItems').textContent = this.menuItems.length;
        document.getElementById('totalOrders').textContent = this.orders.length;

        // Calculate total customers (unique user emails from orders + registered users)
        const customerEmails = new Set();
        this.orders.forEach(order => {
            if (order.customer.email) {
                customerEmails.add(order.customer.email);
            }
        });
        this.users.forEach(user => {
            customerEmails.add(user.email);
        });
        document.getElementById('totalCustomers').textContent = customerEmails.size;

        // Calculate total revenue from completed orders
        const totalRevenue = this.orders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);
        document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2);
    }

    loadRecentActivity() {
        const activityList = document.getElementById('recentActivity');
        const recentOrders = this.orders.slice(-5).reverse();

        activityList.innerHTML = '';

        if (recentOrders.length === 0) {
            activityList.innerHTML = '<div class="activity-item"><p>No recent activity</p></div>';
            return;
        }

        recentOrders.forEach(order => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="activity-content">
                    <p><strong>New order</strong> from ${order.customer.name}</p>
                    <p>Order ID: ${order.orderId} - Total: $${order.total.toFixed(2)}</p>
                    <div class="activity-time">${this.formatDate(order.date)}</div>
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    }

    loadChartsData() {
        // Recent Orders Chart
        const recentOrdersChart = document.getElementById('recentOrdersChart');
        const recentOrders = this.orders.slice(-10).reverse();

        if (recentOrders.length > 0) {
            recentOrdersChart.innerHTML = `
                <div class="simple-chart">
                    ${recentOrders.map(order => `
                        <div class="chart-bar">
                            <div class="bar-label">${order.orderId}</div>
                            <div class="bar-value" style="width: ${(order.total / 500) * 100}%">
                                $${order.total.toFixed(2)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Stock Chart
        const stockChart = document.getElementById('stockChart');
        const lowStockItems = this.menuItems.filter(item => item.stock < 5 && item.inStock);
        const outOfStockItems = this.menuItems.filter(item => !item.inStock);
        const inStockItems = this.menuItems.filter(item => item.inStock && item.stock >= 5);

        stockChart.innerHTML = `
            <div class="stock-status">
                <div class="status-item in-stock">
                    <span class="status-dot"></span>
                    <span>In Stock: ${inStockItems.length}</span>
                </div>
                <div class="status-item low-stock">
                    <span class="status-dot"></span>
                    <span>Low Stock: ${lowStockItems.length}</span>
                </div>
                <div class="status-item out-of-stock">
                    <span class="status-dot"></span>
                    <span>Out of Stock: ${outOfStockItems.length}</span>
                </div>
            </div>
        `;
    }

    loadMenuItems() {
        const menuContainer = document.getElementById('adminMenuItems');
        if (!menuContainer) {
            console.error('Admin menu container not found');
            return;
        }
        
        menuContainer.innerHTML = '';

        console.log('Loading menu items:', this.menuItems);

        if (this.menuItems.length === 0) {
            menuContainer.innerHTML = '<p>No menu items found. Add some items to get started.</p>';
            return;
        }

        this.menuItems.forEach(item => {
            const menuCard = document.createElement('div');
            menuCard.className = 'menu-item-card';

            const stockStatus = item.inStock ?
                (item.stock < 5 ? 'stock-low' : 'stock-in') :
                'stock-out';

            const stockText = item.inStock ?
                (item.stock < 5 ? 'Low Stock' : 'In Stock') :
                'Out of Stock';

            menuCard.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="menu-item-image" onerror="this.src='https://via.placeholder.com/300x200?text=Food+Image'">
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <div class="menu-item-name">${item.name}</div>
                        <div class="menu-item-price">$${item.price}</div>
                    </div>
                    <div class="menu-item-stock">
                        <span class="stock-badge ${stockStatus}">${stockText}</span>
                        <span>Stock: ${item.stock}</span>
                    </div>
                    <div class="menu-item-actions">
                        <button class="btn btn-primary edit-item" data-id="${item.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn ${item.inStock ? 'btn-warning' : 'btn-success'} toggle-stock" data-id="${item.id}">
                            <i class="fas ${item.inStock ? 'fa-times' : 'fa-check'}"></i> 
                            ${item.inStock ? 'Out of Stock' : 'In Stock'}
                        </button>
                        <button class="btn btn-danger delete-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;

            menuContainer.appendChild(menuCard);
        });

        // Add event listeners to action buttons
        this.attachMenuItemEventListeners();
    }

    attachMenuItemEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.edit-item').getAttribute('data-id'));
                this.editItem(itemId);
            });
        });

        // Toggle stock buttons
        document.querySelectorAll('.toggle-stock').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.toggle-stock').getAttribute('data-id'));
                this.toggleStock(itemId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.delete-item').getAttribute('data-id'));
                this.deleteItem(itemId);
            });
        });
    }

    openItemModal(item = null) {
        const modal = document.getElementById('itemModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('itemForm');

        if (item) {
            // Edit mode
            title.textContent = 'Edit Item';
            this.currentEditingItem = item;

            document.getElementById('itemId').value = item.id;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemStock').value = item.stock;
            document.getElementById('itemImage').value = item.image;
            document.getElementById('itemStatus').value = item.inStock.toString();
        } else {
            // Add mode
            title.textContent = 'Add New Item';
            this.currentEditingItem = null;
            form.reset();
        }

        modal.style.display = 'block';
    }

    closeItemModal() {
        document.getElementById('itemModal').style.display = 'none';
        this.currentEditingItem = null;
    }

    saveItem() {
        const form = document.getElementById('itemForm');

        const itemData = {
            id: this.currentEditingItem ? this.currentEditingItem.id : Date.now(),
            name: document.getElementById('itemName').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            stock: parseInt(document.getElementById('itemStock').value),
            image: document.getElementById('itemImage').value,
            inStock: document.getElementById('itemStatus').value === 'true'
        };

        if (this.currentEditingItem) {
            // Update existing item
            const index = this.menuItems.findIndex(item => item.id === this.currentEditingItem.id);
            if (index !== -1) {
                this.menuItems[index] = { ...this.menuItems[index], ...itemData };
            }
        } else {
            // Add new item
            this.menuItems.push(itemData);
        }

        // Save to localStorage
        localStorage.setItem('menuItems', JSON.stringify(this.menuItems));

        // Reload menu items and dashboard
        this.loadMenuItems();
        this.loadDashboard();

        // Close modal
        this.closeItemModal();

        // Show success message
        this.showMessage(`Item ${this.currentEditingItem ? 'updated' : 'added'} successfully!`, 'success');
    }

    editItem(itemId) {
        const item = this.menuItems.find(item => item.id === itemId);
        if (item) {
            this.openItemModal(item);
        }
    }

    toggleStock(itemId) {
        const item = this.menuItems.find(item => item.id === itemId);
        if (item) {
            item.inStock = !item.inStock;
            if (item.inStock && item.stock === 0) {
                item.stock = 10; // Default stock when enabling
            }

            localStorage.setItem('menuItems', JSON.stringify(this.menuItems));
            this.loadMenuItems();
            this.loadDashboard();

            this.showMessage(`Item ${item.inStock ? 'enabled' : 'disabled'} successfully!`, 'success');
        }
    }

    deleteItem(itemId) {
        if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            this.menuItems = this.menuItems.filter(item => item.id !== itemId);
            localStorage.setItem('menuItems', JSON.stringify(this.menuItems));
            this.loadMenuItems();
            this.loadDashboard();
            this.showMessage('Item deleted successfully!', 'success');
        }
    }

    loadOrders() {
        const tableBody = document.getElementById('ordersTableBody');
        tableBody.innerHTML = '';

        if (this.orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <p>No orders found</p>
                    </td>
                </tr>
            `;
            return;
        }

        this.orders.reverse().forEach(order => {
            const row = document.createElement('tr');
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const status = order.status || 'pending';

            row.innerHTML = `
                <td>${order.orderId}</td>
                <td>${order.customer.name}</td>
                <td>${itemCount} items</td>
                <td>$${order.total.toFixed(2)}</td>
                <td><span class="status-badge status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                <td>${this.formatDate(order.date)}</td>
                <td class="table-actions">
                    <button class="btn btn-primary view-order" data-orderid="${order.orderId}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-success complete-order" data-orderid="${order.orderId}">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-danger cancel-order" data-orderid="${order.orderId}">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Add event listeners to order action buttons
        this.attachOrderEventListeners();
    }

    attachOrderEventListeners() {
        // View order buttons
        document.querySelectorAll('.view-order').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('.view-order').getAttribute('data-orderid');
                this.viewOrder(orderId);
            });
        });

        // Complete order buttons
        document.querySelectorAll('.complete-order').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('.complete-order').getAttribute('data-orderid');
                this.updateOrderStatus(orderId, 'completed');
            });
        });

        // Cancel order buttons
        document.querySelectorAll('.cancel-order').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('.cancel-order').getAttribute('data-orderid');
                this.updateOrderStatus(orderId, 'cancelled');
            });
        });
    }

    viewOrder(orderId) {
        const order = this.orders.find(order => order.orderId === orderId);
        if (!order) return;

        const modal = document.getElementById('orderModal');
        const orderDetails = document.getElementById('orderDetails');
        const orderActions = document.getElementById('orderActions');

        orderDetails.innerHTML = `
            <div class="order-details-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${order.customer.name}</p>
                <p><strong>Email:</strong> ${order.customer.email}</p>
                <p><strong>Phone:</strong> ${order.customer.phone}</p>
                <p><strong>Address:</strong> ${order.customer.address}</p>
            </div>
            
            <div class="order-details-section">
                <h3>Order Items</h3>
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-details-section">
                <h3>Order Summary</h3>
                <div class="order-summary">
                    <p><strong>Order ID:</strong> ${order.orderId}</p>
                    <p><strong>Date:</strong> ${this.formatDate(order.date)}</p>
                    <p><strong>Payment Method:</strong> ${order.payment}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${order.status || 'pending'}">${(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}</span></p>
                    <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
                </div>
            </div>
        `;

        // Set up action buttons based on current status
        const status = order.status || 'pending';
        orderActions.innerHTML = '';

        if (status === 'pending') {
            orderActions.innerHTML = `
                <button class="btn btn-success" onclick="adminPanel.updateOrderStatus('${orderId}', 'completed')">
                    <i class="fas fa-check"></i> Mark as Completed
                </button>
                <button class="btn btn-danger" onclick="adminPanel.updateOrderStatus('${orderId}', 'cancelled')">
                    <i class="fas fa-times"></i> Cancel Order
                </button>
            `;
        } else if (status === 'completed') {
            orderActions.innerHTML = `
                <span class="status-badge status-completed">Order Completed</span>
            `;
        } else if (status === 'cancelled') {
            orderActions.innerHTML = `
                <span class="status-badge status-cancelled">Order Cancelled</span>
            `;
        }

        modal.style.display = 'block';
    }

    closeOrderModal() {
        document.getElementById('orderModal').style.display = 'none';
    }

    updateOrderStatus(orderId, status) {
        const order = this.orders.find(order => order.orderId === orderId);
        if (order) {
            order.status = status;
            localStorage.setItem('orders', JSON.stringify(this.orders));
            this.loadOrders();
            this.loadDashboard();

            if (status === 'cancelled') {
                // Restore stock for cancelled orders
                order.items.forEach(orderItem => {
                    const menuItem = this.menuItems.find(item => item.id === orderItem.id);
                    if (menuItem) {
                        menuItem.stock += orderItem.quantity;
                        if (menuItem.stock > 0 && !menuItem.inStock) {
                            menuItem.inStock = true;
                        }
                    }
                });
                localStorage.setItem('menuItems', JSON.stringify(this.menuItems));
                this.loadMenuItems();
            }

            this.showMessage(`Order ${orderId} has been ${status}!`, 'success');
            this.closeOrderModal();
        }
    }

    filterOrders(status) {
        const tableBody = document.getElementById('ordersTableBody');
        const rows = tableBody.querySelectorAll('tr');

        rows.forEach(row => {
            if (status === 'all') {
                row.style.display = '';
            } else {
                const statusCell = row.querySelector('.status-badge');
                if (statusCell && statusCell.classList.contains(`status-${status}`)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        });
    }

    loadCustomers() {
        const tableBody = document.getElementById('customersTableBody');
        tableBody.innerHTML = '';

        // Group orders by customer email and combine with registered users
        const customerMap = new Map();

        // Add registered users
        this.users.forEach(user => {
            customerMap.set(user.email, {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                phone: user.phone,
                orders: [],
                totalSpent: 0,
                lastOrder: null
            });
        });

        // Add order customers and update stats
        this.orders.forEach(order => {
            const email = order.customer.email;
            if (!customerMap.has(email)) {
                customerMap.set(email, {
                    name: order.customer.name,
                    email: order.customer.email,
                    phone: order.customer.phone,
                    orders: [],
                    totalSpent: 0,
                    lastOrder: order.date
                });
            }

            const customer = customerMap.get(email);
            customer.orders.push(order);
            customer.totalSpent += order.total;

            if (!customer.lastOrder || new Date(order.date) > new Date(customer.lastOrder)) {
                customer.lastOrder = order.date;
            }
        });

        if (customerMap.size === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem;">
                        <p>No customers found</p>
                    </td>
                </tr>
            `;
            return;
        }

        customerMap.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${customer.orders.length}</td>
                <td>$${customer.totalSpent.toFixed(2)}</td>
                <td>${customer.lastOrder ? this.formatDate(customer.lastOrder) : 'No orders'}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    closeAllModals() {
        document.getElementById('itemModal').style.display = 'none';
        document.getElementById('orderModal').style.display = 'none';
        this.currentEditingItem = null;
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.admin-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `admin-message message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: bold;
            ${type === 'success' ? 'background: #28a745;' : 'background: #dc3545;'}
        `;

        document.body.appendChild(messageDiv);

        // Remove message after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// Add CSS for simple charts
const style = document.createElement('style');
style.textContent = `
    .simple-chart {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .chart-bar {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .bar-label {
        min-width: 80px;
        font-size: 0.8rem;
    }
    
    .bar-value {
        background: var(--primary-color);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        color: var(--secondary-color);
        font-weight: bold;
        font-size: 0.8rem;
        transition: width 0.3s ease;
    }
    
    .stock-status {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .status-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }
    
    .in-stock .status-dot { background: #28a745; }
    .low-stock .status-dot { background: #ffc107; }
    .out-of-stock .status-dot { background: #dc3545; }
`;
document.head.appendChild(style);

// Make adminPanel globally available
window.adminPanel = null;

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});