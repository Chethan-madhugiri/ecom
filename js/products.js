// Products module
const productsModule = {
    // DOM elements
    elements: {
        productsGrid: document.getElementById('products-grid')
    },
    
    // Initialize products module
    init: function() {
        // We'll load products when the page is shown
    },
    
    // Load and render products
    loadProducts: async function() {
        try {
            const products = await api.getProducts();
            this.renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            alert('Failed to load products. Please try again.');
        }
    },
    
    // Render products to the grid
    renderProducts: function(products) {
        this.elements.productsGrid.innerHTML = '';
        
        if (products.length === 0) {
            this.elements.productsGrid.innerHTML = '<p>No products available.</p>';
            return;
        }
        
        products.forEach(product => {
            const cartItem = cart.find(item => item.productId === product.id);
            const quantity = cartItem ? cartItem.quantity : 0;
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <img src="${product.imageurl}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <div class="add-to-cart">
                        ${quantity === 0 ? 
                            `<button class="cart-btn" data-id="${product.id}">Add to Cart</button>` :
                            `<div class="quantity-control">
                                <button class="quantity-btn minus" data-id="${product.id}">-</button>
                                <span class="quantity">${quantity}</span>
                                <button class="quantity-btn plus" data-id="${product.id}">+</button>
                            </div>`
                        }
                    </div>
                </div>
            `;
            
            this.elements.productsGrid.appendChild(productCard);
        });
        
        // Add event listeners
        document.querySelectorAll('.cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.getAttribute('data-id');
                cartModule.addToCart(productId);
                this.renderProducts(products);
                cartModule.updateCartCount();
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.getAttribute('data-id');
                cartModule.increaseQuantity(productId);
                this.renderProducts(products);
                cartModule.updateCartCount();
            });
        });
        
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.getAttribute('data-id');
                cartModule.decreaseQuantity(productId);
                this.renderProducts(products);
                cartModule.updateCartCount();
            });
        });
    }
};