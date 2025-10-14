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
            password: userData.password,
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
}

// Initialize Auth System
const auth = new AuthSystem();

// Food Menu Data - Default 6 products
const defaultMenuItems = [
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
let menuItems = JSON.parse(localStorage.getItem('menuItems'));
if (!menuItems || menuItems.length === 0) {
    menuItems = [...defaultMenuItems];
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
}

// Cart Data
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize Swiper
let swiper;
function initSwiper() {
    if (document.querySelector('.mySwiper')) {
        swiper = new Swiper(".mySwiper", {
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
    }
}

// Initialize the application
function init() {
    console.log('Initializing application...');

    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeApp();
        });
    } else {
        initializeApp();
    }
}

function initializeApp() {
    console.log('DOM fully loaded, initializing app components...');

    // First update auth UI to show correct buttons
    updateAuthUI();

    // Then load menu items
    loadMenuItems();

    // Then setup other components
    updateCartCount();
    setupEventListeners();
    initSwiper();
}

// Update Authentication UI
function updateAuthUI() {
    const user = auth.getCurrentUser();

    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.getElementById('userMenu');
    const authMobile = document.querySelector('.auth-mobile');
    const userMobile = document.querySelector('.user-mobile');

    if (user) {
        // User is logged in
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            const userName = document.getElementById('userName');
            if (userName) userName.textContent = `${user.firstName} ${user.lastName}`;
        }

        // Mobile
        if (authMobile) authMobile.style.display = 'none';
        if (userMobile) {
            userMobile.style.display = 'flex';
            const mobileUserName = document.getElementById('mobileUserName');
            if (mobileUserName) mobileUserName.textContent = `${user.firstName} ${user.lastName}`;
        }
    } else {
        // User is not logged in
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';

        // Mobile
        if (authMobile) authMobile.style.display = 'flex';
        if (userMobile) userMobile.style.display = 'none';
    }
}

// Load menu items from data
function loadMenuItems() {
    const menuContainer = document.getElementById('menuContainer');
    if (!menuContainer) {
        console.error('Menu container not found');
        return;
    }

    menuContainer.innerHTML = '';

    console.log('Loading menu items:', menuItems);

    if (menuItems.length === 0) {
        menuContainer.innerHTML = `
            <div class="empty-menu">
                <i class="fas fa-utensils"></i>
                <p>No menu items available</p>
                <p>Please check back later</p>
            </div>
        `;
        return;
    }

    menuItems.forEach(item => {
        const menuCard = document.createElement('div');
        menuCard.className = `order-card ${!item.inStock ? 'out-of-stock' : ''}`;
        menuCard.innerHTML = `
            ${item.inStock && item.stock < 5 ? `<div class="stock-badge">Only ${item.stock} left!</div>` : ''}
            <div class="card-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/220x180?text=Food+Image'">
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
            if (isNaN(itemId)) {
                console.error('Invalid item ID');
                return;
            }
            addToCart(itemId);
        });
    });
}

// Add item to cart
function addToCart(itemId) {
    if (!auth.isLoggedIn()) {
        showMessage('Please login to add items to cart', 'error');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'block';
        return;
    }

    const item = menuItems.find(menuItem => menuItem.id === itemId);

    if (!item) {
        showMessage('Item not found!', 'error');
        return;
    }

    if (!item.inStock) {
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

    if (!item) {
        console.error('Item not found in cart');
        return;
    }

    const newQuantity = item.quantity + change;

    if (newQuantity < 1) {
        removeFromCart(itemId);
        return;
    }

    if (!menuItem) {
        showMessage('Menu item not found', 'error');
        return;
    }

    if (newQuantity > menuItem.stock) {
        showMessage(`Only ${menuItem.stock} items available in stock!`, 'error');
        return;
    }

    item.quantity = newQuantity;
    updateCart();
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
    if (cartValue) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartValue.textContent = totalItems;
    }
}

// Render cart items in modal
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="#menu" class="btn">Browse Menu</a>
            </div>
        `;
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/80x80?text=Food'">
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
    const cartTotalElement = document.getElementById('cartTotal');
    if (cartTotalElement) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.textContent = total.toFixed(2);
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Cart icon click
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            renderCartItems(); // Refresh cart items before showing modal
            const cartModal = document.getElementById('cartModal');
            if (cartModal) cartModal.style.display = 'block';
        });
    }

    // Close buttons
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', () => {
            const cartModal = document.getElementById('cartModal');
            const checkoutModal = document.getElementById('checkoutModal');
            const loginModal = document.getElementById('loginModal');
            const signupModal = document.getElementById('signupModal');

            if (cartModal) cartModal.style.display = 'none';
            if (checkoutModal) checkoutModal.style.display = 'none';
            if (loginModal) loginModal.style.display = 'none';
            if (signupModal) signupModal.style.display = 'none';
        });
    });

    // Clear cart button
    const clearCartBtn = document.getElementById('clearCart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                if (confirm('Are you sure you want to clear your cart?')) {
                    cart = [];
                    updateCart();
                }
            }
        });
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showMessage('Your cart is empty!', 'error');
                return;
            }
            const cartModal = document.getElementById('cartModal');
            if (cartModal) cartModal.style.display = 'none';
            showCheckoutModal();
        });
    }

    // Back to cart button
    const backToCartBtn = document.getElementById('backToCart');
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', () => {
            const checkoutModal = document.getElementById('checkoutModal');
            const cartModal = document.getElementById('cartModal');
            if (checkoutModal) checkoutModal.style.display = 'none';
            if (cartModal) cartModal.style.display = 'block';
        });
    }

    // Checkout form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            processCheckout();
        });
    }

    // Auth event listeners
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const signupModal = document.getElementById('signupModal');
            if (signupModal) signupModal.style.display = 'block';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Mobile auth
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileSignupBtn = document.getElementById('mobileSignupBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    if (mobileSignupBtn) {
        mobileSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const signupModal = document.getElementById('signupModal');
            if (signupModal) signupModal.style.display = 'block';
        });
    }

    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Auth form submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSignup();
        });
    }

    // Switch between login and signup
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');

    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            const loginModal = document.getElementById('loginModal');
            const signupModal = document.getElementById('signupModal');
            if (loginModal) loginModal.style.display = 'none';
            if (signupModal) signupModal.style.display = 'block';
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            const signupModal = document.getElementById('signupModal');
            const loginModal = document.getElementById('loginModal');
            if (signupModal) signupModal.style.display = 'none';
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const cartModal = document.getElementById('cartModal');
        const checkoutModal = document.getElementById('checkoutModal');
        const loginModal = document.getElementById('loginModal');
        const signupModal = document.getElementById('signupModal');

        if (e.target === cartModal && cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === checkoutModal && checkoutModal) {
            checkoutModal.style.display = 'none';
        }
        if (e.target === loginModal && loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === signupModal && signupModal) {
            signupModal.style.display = 'none';
        }
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (hamburger && mobileMenu) {
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
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when clicking on a link
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('mobile-menu-active');
                const icon = hamburger.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // Newsletter forms
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = this.querySelector('.newsletter-input');
            const email = emailInput.value.trim();
            if (email) {
                showMessage('Thank you for subscribing to our newsletter!', 'success');
                emailInput.value = '';
            }
        });
    }

    const footerNewsletterForm = document.querySelector('.footer-newsletter-form');
    if (footerNewsletterForm) {
        footerNewsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            if (email) {
                showMessage('Thank you for subscribing to our newsletter!', 'success');
                emailInput.value = '';
            }
        });
    }

    // Smooth scrolling
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
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'transparent';
                header.style.boxShadow = 'none';
            }
        }
    });
}

// Handle login
function handleLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');

    const result = auth.login(email, password);

    if (result.success) {
        showMessage(result.message, 'success');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        loginForm.reset();
        updateAuthUI();

        // If admin, redirect to admin panel
        if (auth.isAdmin()) {
            setTimeout(() => {
                window.location.href = 'admin_pannel/admin.html';
            }, 1000);
        }
    } else {
        showMessage(result.message, 'error');
    }
}

// Handle signup
function handleSignup() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) {
        console.error('Signup form not found');
        return;
    }

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
        const signupModal = document.getElementById('signupModal');
        if (signupModal) signupModal.style.display = 'none';
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
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
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

// Show checkout modal
function showCheckoutModal() {
    if (!auth.isLoggedIn()) {
        showMessage('Please login to proceed with checkout', 'error');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'block';
        return;
    }

    const checkoutItemsContainer = document.getElementById('checkoutItems');
    const checkoutTotalElement = document.getElementById('checkoutTotal');
    const checkoutModal = document.getElementById('checkoutModal');

    if (checkoutItemsContainer) {
        checkoutItemsContainer.innerHTML = '';

        cart.forEach(item => {
            const checkoutItem = document.createElement('div');
            checkoutItem.className = 'checkout-item';
            checkoutItem.innerHTML = `
                <span class="checkout-item-name">${item.name}</span>
                <span class="checkout-item-quantity">x ${item.quantity}</span>
                <span class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            checkoutItemsContainer.appendChild(checkoutItem);
        });
    }

    if (checkoutTotalElement) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        checkoutTotalElement.textContent = total.toFixed(2);
    }

    // Pre-fill user details
    const user = auth.getCurrentUser();
    if (user && user.role !== 'admin') {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const addressInput = document.getElementById('address');

        if (nameInput) nameInput.value = `${user.firstName} ${user.lastName}`;
        if (emailInput) emailInput.value = user.email;
        if (phoneInput) phoneInput.value = user.phone;
        if (addressInput) addressInput.value = user.address;
    }

    if (checkoutModal) checkoutModal.style.display = 'block';
}

// Process checkout
function processCheckout() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm) {
        console.error('Checkout form not found');
        return;
    }

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
    const modalBody = document.querySelector('#checkoutModal .modal-body');
    const modalFooter = document.querySelector('#checkoutModal .modal-footer');

    if (modalBody) {
        modalBody.innerHTML = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <h3>Order Placed Successfully!</h3>
                <p>Thank you for your order, ${orderData.customer.name}!</p>
                <p>Your order ID is: <strong>${orderData.orderId}</strong></p>
                <p>We'll deliver your food within 30-45 minutes.</p>
            </div>
        `;
    }

    if (modalFooter) {
        modalFooter.innerHTML = `
            <button class="btn btn-primary" onclick="closeCheckoutAndReset()">Continue Shopping</button>
        `;
    }

    // Clear cart
    cart = [];
    updateCart();

    // Reload menu to reflect stock changes
    loadMenuItems();
}

// Close checkout and reset
function closeCheckoutAndReset() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) checkoutModal.style.display = 'none';

    // Reset checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) checkoutForm.reset();

    // Reset modal content
    const modalBody = document.querySelector('#checkoutModal .modal-body');
    const modalFooter = document.querySelector('#checkoutModal .modal-footer');

    if (modalBody) {
        modalBody.innerHTML = `
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
    }

    if (modalFooter) {
        modalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" id="backToCart">Back to Cart</button>
            <button type="submit" form="checkoutForm" class="btn btn-primary">Place Order</button>
        `;
    }

    // Reattach event listeners
    const backToCartBtn = document.getElementById('backToCart');
    const newCheckoutForm = document.getElementById('checkoutForm');

    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', () => {
            const checkoutModal = document.getElementById('checkoutModal');
            const cartModal = document.getElementById('cartModal');
            if (checkoutModal) checkoutModal.style.display = 'none';
            if (cartModal) cartModal.style.display = 'block';
        });
    }

    if (newCheckoutForm) {
        newCheckoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            processCheckout();
        });
    }
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
        font-weight: bold;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Make functions globally available
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.closeCheckoutAndReset = closeCheckoutAndReset;

// Initialize the app
init();