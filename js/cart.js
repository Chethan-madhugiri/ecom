// Cart module
const cartModule = {
    // DOM elements
    elements: {
        cartItems: document.getElementById('cart-items'),
        cartCount: document.querySelector('.cart-count'),
        cartTotalAmount: document.getElementById('cart-total-amount'),
        placeOrderBtn: document.getElementById('place-order-btn')
    },
    
    // Initialize cart module
    init: function() {
        // Place order button
        this.elements.placeOrderBtn.addEventListener('click', this.placeOrder.bind(this));
    },
    
    // Add product to cart
    addToCart: async function(productId) {
        if (!currentUser) {
            alert('Please log in to add items to cart');
            return;
        }
        
        const existingItemIndex = cart.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
            // If item is already in cart, increase quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Get product from Firestore
            try {
                const productDoc = await db.collection('products').doc(productId).get();
                
                if (productDoc.exists) {
                    const productData = productDoc.data();
                    
                    // Add new item to cart - ensure no undefined values
                    cart.push({
                        productId: productId,
                        name: productData.name || 'Unknown Product',
                        price: productData.price || 0,
                        image: productData.imageurl || 'https://via.placeholder.com/300x300?text=Product',
                        quantity: 1
                    });
                }
            } catch (error) {
                console.error('Error getting product:', error);
                alert('Failed to add product to cart');
                return;
            }
        }
        
        // Update cart in Firestore - ensure no undefined values
        try {
            // Simple deep clone to avoid undefined values
            const safeCart = JSON.parse(JSON.stringify(cart));
            await api.updateCart(currentUser.id, safeCart);
        } catch (error) {
            console.error('Error updating cart:', error);
            alert('Failed to update cart');
        }
    },
    
    // Increase item quantity
    increaseQuantity: async function(productId) {
        const item = cart.find(item => item.productId === productId);
        if (item) {
            item.quantity += 1;
            
            // Update cart in Firestore - ensure no undefined values
            try {
                const safeCart = JSON.parse(JSON.stringify(cart));
                await api.updateCart(currentUser.id, safeCart);
            } catch (error) {
                console.error('Error updating cart:', error);
                alert('Failed to update cart');
            }
        }
    },
    
    // Decrease item quantity or remove if quantity is 1
    decreaseQuantity: async function(productId) {
        const itemIndex = cart.findIndex(item => item.productId === productId);
        
        if (itemIndex >= 0) {
            if (cart[itemIndex].quantity > 1) {
                // Decrease quantity
                cart[itemIndex].quantity -= 1;
            } else {
                // Remove item from cart
                cart.splice(itemIndex, 1);
            }
            
            // Update cart in Firestore - ensure no undefined values
            try {
                const safeCart = JSON.parse(JSON.stringify(cart));
                await api.updateCart(currentUser.id, safeCart);
            } catch (error) {
                console.error('Error updating cart:', error);
                alert('Failed to update cart');
            }
        }
    },
    
    // Update cart count in header
    updateCartCount: function() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        this.elements.cartCount.textContent = totalItems;
    },
    
    // Calculate cart total
    calculateTotal: function() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    // Render cart items
    renderCart: function() {
        this.elements.cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            this.elements.cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            this.elements.cartTotalAmount.textContent = '$0.00';
            return;
        }
        
        cart.forEach(item => {
            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'cart-item';
            
            cartItemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.productId}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.productId}">+</button>
                </div>
                <div class="cart-item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
            `;
            
            this.elements.cartItems.appendChild(cartItemEl);
        });
        
        // Add event listeners for quantity buttons
        document.querySelectorAll('.cart-item .quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.getAttribute('data-id');
                this.increaseQuantity(productId);
                this.renderCart();
                this.updateCartCount();
            });
        });
        
        document.querySelectorAll('.cart-item .quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.getAttribute('data-id');
                this.decreaseQuantity(productId);
                this.renderCart();
                this.updateCartCount();
            });
        });
        
        // Update total
        const total = this.calculateTotal();
        this.elements.cartTotalAmount.textContent = `$${total.toFixed(2)}`;
    },
    
    // Place order
    placeOrder: async function() {
        if (!currentUser) {
            alert('Please log in to place an order');
            return;
        }
        
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }
        
        try {
            // Ensure no undefined values in cart
            const safeCart = JSON.parse(JSON.stringify(cart));
            const order = await api.placeOrder(currentUser.id, safeCart);
            alert(`Order placed successfully! Order ID: ${order.orderId}`);
            cart = [];
            this.renderCart();
            this.updateCartCount();
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        }
    }
};