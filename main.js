// Authentication System
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.adminCredentials = {
            username: 'apandey9046',
            password: 'Admin@232422'
        };
    }

    // User Registration
    register(userData) {
        // Check if user already exists
        const existingUser = this.users.find(user => user.email === userData.email);
        if (existingUser) {
            return { success: false, message: 'User already exists with this email' };
        }

        // Validate password match
        if (userData.password !== userData.confirmPassword) {
            return { success: false, message: 'Passwords do not match' };
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password, // In real app, hash this password
            address: userData.address,
            phone: userData.phone,
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));

        return { success: true, message: 'Registration successful!' };
    }

    // User Login
    login(email, password) {
        // Check admin login
        if (email === this.adminCredentials.username && password === this.adminCredentials.password) {
            const adminUser = {
                id: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                email: email,
                role: 'admin'
            };
            this.currentUser = adminUser;
            localStorage.setItem('currentUser', JSON.stringify(adminUser));
            return { success: true, message: 'Admin login successful!', user: adminUser };
        }

        // Check regular user login
        const user = this.users.find(user => user.email === email && user.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, message: 'Login successful!', user: user };
        }

        return { success: false, message: 'Invalid email or password' };
    }

    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        return { success: true, message: 'Logout successful!' };
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Update user profile
    updateProfile(userData) {
        if (!this.currentUser) return { success: false, message: 'Not logged in' };

        const userIndex = this.users.findIndex(user => user.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...userData };
            this.currentUser = { ...this.currentUser, ...userData };
            localStorage.setItem('users', JSON.stringify(this.users));
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return { success: true, message: 'Profile updated successfully!' };
        }

        return { success: false, message: 'User not found' };
    }
}

// Initialize Auth System
const auth = new AuthSystem();

// Food Menu Data - This will be controlled by admin
let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [
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

// Cart Data
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize Swiper
var swiper = new Swiper(".mySwiper", {
    loop: true,
    navigation: {
        nextEl: "#next",
        prevEl: "#prev",
    },
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    slidesPerView: 1,
    spaceBetween: 20,
});

// DOM Elements
const menuContainer = document.getElementById('menuContainer');
const cartIcon = document.getElementById('cartIcon');
const cartModal = document.getElementById('cartModal');
const checkoutModal = document.getElementById('checkoutModal');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeButtons = document.querySelectorAll('.close');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const backToCartBtn = document.getElementById('backToCart');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutItemsContainer = document.getElementById('checkoutItems');
const checkoutTotalElement = document.getElementById('checkoutTotal');

// Auth DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userMenu = document.getElementById('userMenu');
const userName = document.getElementById('userName');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');

// Mobile Auth Elements
const mobileLoginBtn = document.getElementById('mobileLoginBtn');
const mobileSignupBtn = document.getElementById('mobileSignupBtn');
const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
const mobileUserName = document.getElementById('mobileUserName');
const authMobile = document.querySelector('.auth-mobile');
const userMobile = document.querySelector('.user-mobile');

// Initialize the application
function init() {
    loadMenuItems();
    updateCartCount();
    setupEventListeners();
    updateAuthUI();
}

// Update Authentication UI
function updateAuthUI() {
    const user = auth.getCurrentUser();

    if (user) {
        // User is logged in
        document.querySelector('.auth-buttons').style.display = 'none';
        userMenu.style.display = 'flex';
        userName.textContent = `${user.firstName} ${user.lastName}`;

        // Mobile
        authMobile.style.display = 'none';
        userMobile.style.display = 'flex';
        mobileUserName.textContent = `${user.firstName} ${user.lastName}`;
    } else {
        // User is not logged in
        document.querySelector('.auth-buttons').style.display = 'flex';
        userMenu.style.display = 'none';

        // Mobile
        authMobile.style.display = 'flex';
        userMobile.style.display = 'none';
    }
}

// Load menu items from data
function loadMenuItems() {
    menuContainer.innerHTML = '';

    menuItems.forEach(item => {
        const menuCard = document.createElement('div');
        menuCard.className = `order-card ${!item.inStock ? 'out-of-stock' : ''}`;
        menuCard.innerHTML = `
            ${item.inStock && item.stock < 5 ? `<div class="stock-badge">Only ${item.stock} left!</div>` : ''}
            <div class="card-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <h4>${item.name}</h4>
            <h4 class="price">$${item.price}</h4>
            <button class="btn add-to-cart-btn" data-id="${item.id}" ${!item.inStock ? 'disabled' : ''}>
                ${!item.inStock ? 'Out of Stock' : 'Add To Cart'}
            </button>
        `;
        menuContainer.appendChild(menuCard);
    });

    // Add event listeners to add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            addToCart(itemId);
        });
    });
}

// Add item to cart
function addToCart(itemId) {
    if (!auth.isLoggedIn()) {
        showMessage('Please login to add items to cart', 'error');
        loginModal.style.display = 'block';
        return;
    }

    const item = menuItems.find(menuItem => menuItem.id === itemId);

    if (!item || !item.inStock) {
        showMessage('This item is out of stock!', 'error');
        return;
    }

    const existingItem = cart.find(cartItem => cartItem.id === itemId);

    if (existingItem) {
        if (existingItem.quantity >= item.stock) {
            showMessage(`Only ${item.stock} items available in stock!`, 'error');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }

    updateCart();
    showNotification(`${item.name} added to cart!`);
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
}

// Update item quantity in cart
function updateQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    const menuItem = menuItems.find(menuItem => menuItem.id === itemId);

    if (item) {
        const newQuantity = item.quantity + change;

        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }

        if (newQuantity > menuItem.stock) {
            showMessage(`Only ${menuItem.stock} items available in stock!`, 'error');
            return;
        }

        item.quantity = newQuantity;
        updateCart();
    }
}

// Update cart display and localStorage
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
    updateCartTotal();
}

// Update cart count in header
function updateCartCount() {
    const cartValue = document.querySelector('.cart-value');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartValue.textContent = totalItems;
}

// Render cart items in modal
function renderCartItems() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <p>Add some delicious food to get started!</p>
            </div>
        `;
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${item.price}</div>
                </div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = total.toFixed(2);
}

// Setup event listeners
function setupEventListeners() {
    // Cart icon click
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        cartModal.style.display = 'block';
    });

    // Close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            cartModal.style.display = 'none';
            checkoutModal.style.display = 'none';
            loginModal.style.display = 'none';
            signupModal.style.display = 'none';
        });
    });

    // Clear cart button
    clearCartBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            if (confirm('Are you sure you want to clear your cart?')) {
                cart = [];
                updateCart();
            }
        }
    });

    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showMessage('Your cart is empty!', 'error');
            return;
        }
        cartModal.style.display = 'none';
        showCheckoutModal();
    });

    // Back to cart button
    backToCartBtn.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
        cartModal.style.display = 'block';
    });

    // Checkout form submission
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        processCheckout();
    });

    // Auth event listeners
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'block';
    });

    signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.style.display = 'block';
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });

    // Mobile auth
    mobileLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'block';
    });

    mobileSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.style.display = 'block';
    });

    mobileLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });

    // Auth form submissions
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup();
    });

    // Switch between login and signup
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        signupModal.style.display = 'block';
    });

    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === signupModal) {
            signupModal.style.display = 'none';
        }
    });
}

// Handle login
function handleLogin() {
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');

    const result = auth.login(email, password);

    if (result.success) {
        showMessage(result.message, 'success');
        loginModal.style.display = 'none';
        loginForm.reset();
        updateAuthUI();

        // If admin, redirect to admin panel
        if (auth.isAdmin()) {
            setTimeout(() => {
                window.location.href = 'admin-pannel/admin.html';
            }, 1000);
        }
    } else {
        showMessage(result.message, 'error');
    }
}

// Handle signup
function handleSignup() {
    const formData = new FormData(signupForm);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        address: formData.get('address'),
        phone: formData.get('phone')
    };

    const result = auth.register(userData);

    if (result.success) {
        showMessage(result.message, 'success');
        signupModal.style.display = 'none';
        signupForm.reset();

        // Auto login after registration
        auth.login(userData.email, userData.password);
        updateAuthUI();
    } else {
        showMessage(result.message, 'error');
    }
}

// Handle logout
function handleLogout() {
    const result = auth.logout();
    showMessage(result.message, 'success');
    updateAuthUI();

    // Clear cart on logout
    cart = [];
    updateCart();
}

// Show message
function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Insert message at the top of the body
    document.body.insertBefore(messageDiv, document.body.firstChild);

    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Show checkout modal
function showCheckoutModal() {
    if (!auth.isLoggedIn()) {
        showMessage('Please login to proceed with checkout', 'error');
        loginModal.style.display = 'block';
        return;
    }

    checkoutItemsContainer.innerHTML = '';

    cart.forEach(item => {
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        checkoutItem.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        checkoutItemsContainer.appendChild(checkoutItem);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotalElement.textContent = total.toFixed(2);

    // Pre-fill user details
    const user = auth.getCurrentUser();
    if (user && user.role !== 'admin') {
        document.getElementById('name').value = `${user.firstName} ${user.lastName}`;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone;
        document.getElementById('address').value = user.address;
    }

    checkoutModal.style.display = 'block';
}

// Process checkout
function processCheckout() {
    const formData = new FormData(checkoutForm);
    const user = auth.getCurrentUser();

    const orderData = {
        customer: {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            userId: user ? user.id : null
        },
        payment: formData.get('payment'),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderId: 'ORD' + Date.now(),
        date: new Date().toISOString(),
        status: 'pending'
    };

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Update stock
    cart.forEach(cartItem => {
        const menuItem = menuItems.find(item => item.id === cartItem.id);
        if (menuItem) {
            menuItem.stock -= cartItem.quantity;
            if (menuItem.stock <= 0) {
                menuItem.inStock = false;
                menuItem.stock = 0;
            }
        }
    });

    localStorage.setItem('menuItems', JSON.stringify(menuItems));

    // Show success message
    checkoutModal.querySelector('.modal-body').innerHTML = `
        <div class="success-message">
            <i class="fas fa-check-circle"></i>
            <h3>Order Placed Successfully!</h3>
            <p>Thank you for your order, ${orderData.customer.name}!</p>
            <p>Your order ID is: <strong>${orderData.orderId}</strong></p>
            <p>We'll deliver your food within 30-45 minutes.</p>
        </div>
    `;

    checkoutModal.querySelector('.modal-footer').innerHTML = `
        <button class="btn btn-primary" onclick="closeCheckoutAndReset()">Continue Shopping</button>
    `;

    // Clear cart
    cart = [];
    updateCart();

    // Reload menu to reflect stock changes
    loadMenuItems();
}

// Close checkout and reset
function closeCheckoutAndReset() {
    checkoutModal.style.display = 'none';
    checkoutForm.reset();
    checkoutModal.querySelector('.modal-body').innerHTML = `
        <form id="checkoutForm" class="checkout-form">
            <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="phone">Phone</label>
                <input type="tel" id="phone" name="phone" required>
            </div>
            <div class="form-group">
                <label for="address">Delivery Address</label>
                <textarea id="address" name="address" rows="3" required></textarea>
            </div>
            <div class="form-group">
                <label for="payment">Payment Method</label>
                <select id="payment" name="payment" required>
                    <option value="">Select Payment Method</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="cash">Cash on Delivery</option>
                    <option value="upi">UPI</option>
                </select>
            </div>
            <div class="order-summary">
                <h3>Order Summary</h3>
                <div id="checkoutItems"></div>
                <div class="order-total">
                    <strong>Total: $<span id="checkoutTotal">0</span></strong>
                </div>
            </div>
        </form>
    `;
    checkoutModal.querySelector('.modal-footer').innerHTML = `
        <button type="button" class="btn btn-secondary" id="backToCart">Back to Cart</button>
        <button type="submit" form="checkoutForm" class="btn btn-primary">Place Order</button>
    `;

    // Reattach event listeners
    document.getElementById('backToCart').addEventListener('click', () => {
        checkoutModal.style.display = 'none';
        cartModal.style.display = 'block';
    });
    document.getElementById('checkoutForm').addEventListener('submit', (e) => {
        e.preventDefault();
        processCheckout();
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check"></i>
            <span>${message}</span>
        </div>
    `;

    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--gold-color);
        color: var(--lead-color);
        padding: 1rem 1.5rem;
        border-radius: 1rem;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    hamburger.addEventListener('click', function (e) {
        e.preventDefault();
        mobileMenu.classList.toggle('mobile-menu-active');

        // Toggle hamburger icon
        const icon = this.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.remove('mobile-menu-active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking on a link
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function () {
            mobileMenu.classList.remove('mobile-menu-active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
});

// Newsletter form handling
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const emailInput = this.querySelector('.newsletter-input');
        const email = emailInput.value.trim();

        if (email) {
            // Here you can add form submission logic
            console.log('Newsletter subscription:', email);

            // Success message 
            showMessage('Thank you for subscribing to our newsletter!', 'success');
            emailInput.value = '';
        } else {
            showMessage('Please enter a valid email address.', 'error');
        }
    });
}

// Footer newsletter form handling
const footerNewsletterForm = document.querySelector('.footer-newsletter-form');
if (footerNewsletterForm) {
    footerNewsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        if (email) {
            console.log('Footer newsletter subscription:', email);
            showMessage('Thank you for subscribing to our newsletter!', 'success');
            emailInput.value = '';
        } else {
            showMessage('Please enter a valid email address.', 'error');
        }
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'transparent';
        header.style.boxShadow = 'none';
    }
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);