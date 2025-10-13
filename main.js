// Menu Data - All items stored in JavaScript
const menuData = [
    {
        id: 1,
        name: "Double Cheese Burger",
        price: 200,
        image: "assets/burger.png",
        category: "burger",
        description: "Juicy beef patty with double cheese and fresh veggies"
    },
    {
        id: 2,
        name: "Pepperoni Pizza",
        price: 350,
        image: "assets/pizza.png",
        category: "pizza",
        description: "Classic pizza with pepperoni and mozzarella cheese"
    },
    {
        id: 3,
        name: "Crispy Fries",
        price: 120,
        image: "assets/fries.png",
        category: "snacks",
        description: "Golden crispy fries with special seasoning"
    },
    {
        id: 4,
        name: "Creamy Pasta",
        price: 180,
        image: "assets/pasta.png",
        category: "pasta",
        description: "Creamy Alfredo pasta with mushrooms and herbs"
    },
    {
        id: 5,
        name: "Fresh Salad",
        price: 150,
        image: "assets/salad.png",
        category: "salad",
        description: "Fresh garden salad with olive oil dressing"
    },
    {
        id: 6,
        name: "Fruit Smoothie",
        price: 90,
        image: "assets/smoothie.png",
        category: "drinks",
        description: "Refreshing mixed fruit smoothie"
    },
    {
        id: 7,
        name: "Chicken Biryani",
        price: 280,
        image: "assets/biryani.png",
        category: "rice",
        description: "Aromatic basmati rice with tender chicken pieces"
    },
    {
        id: 8,
        name: "Chocolate Brownie",
        price: 110,
        image: "assets/brownie.png",
        category: "dessert",
        description: "Rich chocolate brownie with walnut pieces"
    },
    {
        id: 9,
        name: "Grilled Sandwich",
        price: 160,
        image: "assets/sandwich.png",
        category: "sandwich",
        description: "Grilled sandwich with vegetables and cheese"
    },
    {
        id: 10,
        name: "Ice Cream Sundae",
        price: 130,
        image: "assets/icecream.png",
        category: "dessert",
        description: "Vanilla ice cream with chocolate sauce and nuts"
    },
    {
        id: 11,
        name: "Veggie Wrap",
        price: 140,
        image: "assets/wrap.png",
        category: "wrap",
        description: "Fresh vegetable wrap with hummus spread"
    },
    {
        id: 12,
        name: "Cold Coffee",
        price: 80,
        image: "assets/coffee.png",
        category: "drinks",
        description: "Chilled coffee with cream and ice"
    }
];

// Initialize Swiper
let swiper;
function initSwiper() {
    swiper = new Swiper(".mySwiper", {
        loop: true,
        navigation: {
            nextEl: "#next",
            prevEl: "#prev",
        },
        autoplay: {
            delay: 5000,
        },
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    hamburger.addEventListener('click', function (e) {
        e.preventDefault();
        mobileMenu.classList.toggle('mobile-menu-active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.remove('mobile-menu-active');
        }
    });
}

// Shopping Cart Functionality
class ShoppingCart {
    constructor() {
        this.cart = [];
        this.cartSidebar = document.getElementById('cart-sidebar');
        this.cartOverlay = document.getElementById('cart-overlay');
        this.cartItemsContainer = document.querySelector('.cart-items');
        this.cartTotalPrice = document.getElementById('cart-total-price');
        this.cartValue = document.querySelector('.cart-value');
        this.checkoutBtn = document.getElementById('checkout-btn');
        this.menuContainer = document.getElementById('menu-container');
        this.loadMoreBtn = document.getElementById('load-more');
        
        this.itemsPerLoad = 4;
        this.currentItems = 0;
        
        this.init();
    }
    
    init() {
        // Load cart from localStorage
        this.loadCart();
        
        // Load initial menu items
        this.loadMenuItems();
        
        // Add event listeners
        document.getElementById('cart-toggle').addEventListener('click', (e) => {
            e.preventDefault();
            this.openCart();
        });
        
        document.getElementById('close-cart').addEventListener('click', () => {
            this.closeCart();
        });
        
        this.cartOverlay.addEventListener('click', () => {
            this.closeCart();
        });
        
        // Load more button
        this.loadMoreBtn.addEventListener('click', () => {
            this.loadMoreItems();
        });
        
        // Checkout button
        this.checkoutBtn.addEventListener('click', () => {
            this.checkout();
        });
        
        // Update cart display
        this.updateCartDisplay();
    }
    
    loadCart() {
        const savedCart = localStorage.getItem('foodieCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }
    
    saveCart() {
        localStorage.setItem('foodieCart', JSON.stringify(this.cart));
    }
    
    loadMenuItems() {
        // Clear existing items
        this.menuContainer.innerHTML = '';
        this.currentItems = 0;
        
        // Load initial items
        this.loadMoreItems();
    }
    
    loadMoreItems() {
        const startIndex = this.currentItems;
        const endIndex = Math.min(startIndex + this.itemsPerLoad, menuData.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const item = menuData[i];
            this.createMenuItem(item);
        }
        
        this.currentItems = endIndex;
        
        // Hide load more button if all items are loaded
        if (this.currentItems >= menuData.length) {
            this.loadMoreBtn.style.display = 'none';
        }
    }
    
    createMenuItem(item) {
        const menuItem = document.createElement('div');
        menuItem.className = 'order-card';
        menuItem.innerHTML = `
            <div class="card-image">
                <img src="${item.image}" alt="${item.name}" class="food-image">
            </div>
            <h4>${item.name}</h4>
            <p class="item-description">${item.description}</p>
            <h4 class="price">$${item.price}</h4>
            <button class="btn add-to-cart" data-id="${item.id}">Add To Cart</button>
        `;
        
        this.menuContainer.appendChild(menuItem);
        
        // Add event listener to the button
        const addButton = menuItem.querySelector('.add-to-cart');
        addButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.addItemToCart(item);
        });
        
        // Update button state if item is already in cart
        this.updateAddButtonState(addButton, item.id);
    }
    
    addItemToCart(item) {
        const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            this.showNotification(`${item.name} is already in your cart!`, 'error');
            return;
        }
        
        this.cart.push({
            ...item,
            quantity: 1
        });
        
        this.saveCart();
        this.updateCartDisplay();
        this.updateAllAddButtons();
        
        // Show success notification
        this.showNotification(`${item.name} added to cart!`, 'success');
        
        // Show success animation
        this.showAddToCartAnimation(item.id);
    }
    
    updateAddButtonState(button, itemId) {
        const existingItem = this.cart.find(item => item.id === itemId);
        if (existingItem) {
            button.textContent = 'Already in Cart';
            button.classList.add('already-in-cart');
            button.disabled = true;
        } else {
            button.textContent = 'Add To Cart';
            button.classList.remove('already-in-cart');
            button.disabled = false;
        }
    }
    
    updateAllAddButtons() {
        const addButtons = document.querySelectorAll('.add-to-cart');
        addButtons.forEach(button => {
            const itemId = parseInt(button.closest('.order-card').querySelector('.add-to-cart').getAttribute('data-id'));
            this.updateAddButtonState(button, itemId);
        });
    }
    
    removeItem(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartDisplay();
        this.updateAllAddButtons();
        
        // Show notification
        const removedItem = menuData.find(item => item.id === id);
        if (removedItem) {
            this.showNotification(`${removedItem.name} removed from cart`, 'error');
        }
    }
    
    updateQuantity(id, change) {
        const item = this.cart.find(item => item.id === id);
        
        if (item) {
            item.quantity += change;
            
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }
    
    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }
    
    getTotalPrice() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    updateCartDisplay() {
        // Update cart value badge
        this.cartValue.textContent = this.getTotalItems();
        
        // Update cart items in sidebar
        this.renderCartItems();
        
        // Update total price
        this.cartTotalPrice.textContent = this.getTotalPrice().toFixed(2);
        
        // Enable/disable checkout button
        this.checkoutBtn.disabled = this.cart.length === 0;
    }
    
    renderCartItems() {
        if (this.cart.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <p>Add some delicious items!</p>
                </div>
            `;
            return;
        }
        
        this.cartItemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to quantity buttons
        this.cartItemsContainer.querySelectorAll('.decrease').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.getAttribute('data-id'));
                this.updateQuantity(id, -1);
            });
        });
        
        this.cartItemsContainer.querySelectorAll('.increase').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.getAttribute('data-id'));
                this.updateQuantity(id, 1);
            });
        });
        
        this.cartItemsContainer.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.getAttribute('data-id'));
                this.removeItem(id);
            });
        });
    }
    
    openCart() {
        this.cartSidebar.classList.add('active');
        this.cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeCart() {
        this.cartSidebar.classList.remove('active');
        this.cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    checkout() {
        if (this.cart.length === 0) return;
        
        // In a real application, you would redirect to a checkout page
        // or show a checkout form
        
        // For demo purposes, we'll just show an alert
        const total = this.getTotalPrice().toFixed(2);
        const itemCount = this.getTotalItems();
        
        this.showNotification(`Order placed successfully! ${itemCount} items - Total: $${total}`, 'success');
        
        // Clear cart after checkout
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
        this.updateAllAddButtons();
        this.closeCart();
    }
    
    showAddToCartAnimation(itemId) {
        const button = document.querySelector(`.add-to-cart[data-id="${itemId}"]`);
        if (!button) return;
        
        // Create a flying cart animation
        const rect = button.getBoundingClientRect();
        const flyingItem = document.createElement('div');
        flyingItem.style.position = 'fixed';
        flyingItem.style.left = `${rect.left + rect.width / 2}px`;
        flyingItem.style.top = `${rect.top + rect.height / 2}px`;
        flyingItem.style.width = '20px';
        flyingItem.style.height = '20px';
        flyingItem.style.backgroundColor = 'var(--gold-color)';
        flyingItem.style.borderRadius = '50%';
        flyingItem.style.zIndex = '10000';
        flyingItem.style.pointerEvents = 'none';
        flyingItem.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        document.body.appendChild(flyingItem);
        
        // Get cart icon position
        const cartRect = document.querySelector('.cart-icon').getBoundingClientRect();
        
        // Animate to cart
        setTimeout(() => {
            flyingItem.style.left = `${cartRect.left + cartRect.width / 2}px`;
            flyingItem.style.top = `${cartRect.top + cartRect.height / 2}px`;
            flyingItem.style.transform = 'scale(0.1)';
            flyingItem.style.opacity = '0.5';
        }, 10);
        
        // Remove element after animation
        setTimeout(() => {
            if (document.body.contains(flyingItem)) {
                document.body.removeChild(flyingItem);
            }
        }, 800);
    }
    
    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        });
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Animate out after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initSwiper();
    initMobileMenu();
    new ShoppingCart();
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.querySelector('.mobile-menu');
                mobileMenu.classList.remove('mobile-menu-active');
            }
        });
    });
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('.newsletter-input');
            const email = emailInput.value.trim();
            
            if (email) {
                // Show success message
                const notification = document.createElement('div');
                notification.className = 'notification success';
                notification.textContent = 'Thank you for subscribing to our newsletter!';
                document.body.appendChild(notification);
                
                // Animate in
                setTimeout(() => {
                    notification.classList.add('show');
                }, 10);
                
                // Animate out after 3 seconds
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        if (document.body.contains(notification)) {
                            document.body.removeChild(notification);
                        }
                    }, 300);
                }, 3000);
                
                // Reset form
                emailInput.value = '';
            }
        });
    }
});