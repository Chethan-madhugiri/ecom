// Main application module
const app = {
    // DOM elements
    elements: {
        pages: {
            login: document.getElementById('login-page'),
            signup: document.getElementById('signup-page'),
            products: document.getElementById('products-page'),
            cart: document.getElementById('cart-page')
        },
        goToSignup: document.getElementById('go-to-signup'),
        goToLogin: document.getElementById('go-to-login'),
        goToCart: document.getElementById('go-to-cart'),
        backToProducts: document.getElementById('back-to-products'),
        checkoutBtn: document.getElementById('checkout-btn')
    },
    
    // Initialize application
    init: function() {
        // Initialize modules
        authModule.init();
        productsModule.init();
        cartModule.init();
        
        // Set up navigation
        this.setupNavigation();
        
        // Firebase Auth state change listener will handle initial page show
    },
    
    // Set up navigation between pages
    setupNavigation: function() {
        // Auth navigation
        this.elements.goToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('signup');
        });
        
        this.elements.goToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('login');
        });
        
        // Product/cart navigation
        this.elements.goToCart.addEventListener('click', () => {
            this.showPage('cart');
        });
        
        this.elements.backToProducts.addEventListener('click', () => {
            this.showPage('products');
        });
        
        this.elements.checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                this.showPage('cart');
            } else {
                alert('Your cart is empty!');
            }
        });
    },
    
    // Show page and handle special page logic
    showPage: function(pageId) {
        // Hide all pages
        Object.values(this.elements.pages).forEach(page => page.classList.remove('active'));
        
        // Show selected page
        this.elements.pages[pageId].classList.add('active');
        
        // Special handling for products page
        if (pageId === 'products') {
            productsModule.loadProducts();
            cartModule.updateCartCount();
        }
        
        // Special handling for cart page
        if (pageId === 'cart') {
            cartModule.renderCart();
        }
    }
};

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});