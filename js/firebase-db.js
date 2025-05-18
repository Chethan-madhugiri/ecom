// Global variables
let currentUser = null;
let cart = [];

// Firebase database reference
const db = firebase.firestore();
const auth = firebase.auth();

// Mock products data for initial setup
// These will be used to populate Firestore if needed
const initialProducts = [
    {
        id: 1,
        name: 'Smartphone',
        price: 699.99,
        image: 'https://via.placeholder.com/300x300?text=Smartphone'
    },
    {
        id: 2,
        name: 'Laptop',
        price: 1299.99,
        image: 'https://via.placeholder.com/300x300?text=Laptop'
    },
    {
        id: 3,
        name: 'Headphones',
        price: 199.99,
        image: 'https://via.placeholder.com/300x300?text=Headphones'
    },
    {
        id: 4,
        name: 'Smartwatch',
        price: 299.99,
        image: 'https://via.placeholder.com/300x300?text=Smartwatch'
    },
    {
        id: 5,
        name: 'Tablet',
        price: 499.99,
        image: 'https://via.placeholder.com/300x300?text=Tablet'
    },
    {
        id: 6,
        name: 'Camera',
        price: 799.99,
        image: 'https://via.placeholder.com/300x300?text=Camera'
    }
];

// Firebase API wrapper
const api = {
    // Login function
    login: function(email, password) {
        return auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Get user data from Firestore
                return db.collection('users').doc(userCredential.user.uid).get()
                    .then((doc) => {
                        if (doc.exists) {
                            return { id: userCredential.user.uid, email, ...doc.data() };
                        } else {
                            return { id: userCredential.user.uid, email };
                        }
                    });
            });
    },
    
    // Signup function
    signup: function(email, name, password) {
        return auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Store additional user data in Firestore
                const userData = {
                    email,
                    name,
                    cart: []
                };
                
                return db.collection('users').doc(userCredential.user.uid).set(userData)
                    .then(() => {
                        return { id: userCredential.user.uid, ...userData };
                    });
            });
    },
    
    // Get products
    getProducts: function() {
        return db.collection('products').get()
            .then((snapshot) => {
                if (snapshot.empty) {
                    // If no products exist, seed with initial data
                    console.log('No products found, adding sample products');
                    return this.seedProducts().then(() => this.getProducts());
                }
                
                const products = [];
                snapshot.forEach((doc) => {
                    products.push({ 
                        id: doc.id, 
                        ...doc.data() 
                    });
                });
                return products;
            });
    },
    
    // Seed products collection with initial data
    seedProducts: function() {
        const batch = db.batch();
        
        initialProducts.forEach((product) => {
            const docRef = db.collection('products').doc();
            batch.set(docRef, {
                name: product.name,
                price: product.price,
                image: product.image
            });
        });
        
        return batch.commit();
    },
    
    // Get user cart
    getUserCart: function(userId) {
        return db.collection('users').doc(userId).get()
            .then((doc) => {
                if (doc.exists && doc.data().cart) {
                    return doc.data().cart;
                }
                return [];
            });
    },
    
    // Update user cart
    updateCart: function(userId, cartItems) {
        // Make sure we have a valid cart
        if (!cartItems || !Array.isArray(cartItems)) {
            return Promise.reject(new Error('Invalid cart data'));
        }
        
        // Filter out any invalid items and ensure no undefined values
        const validCartItems = cartItems.filter(item => 
            item && 
            item.productId && 
            typeof item.quantity === 'number'
        ).map(item => ({
            productId: item.productId,
            name: item.name || 'Unknown Product',
            price: typeof item.price === 'number' ? item.price : 0,
            image: item.image || 'https://via.placeholder.com/300x300?text=Product',
            quantity: item.quantity
        }));
        
        console.log('Updating cart with sanitized data:', validCartItems);
        
        return db.collection('users').doc(userId).update({
            cart: validCartItems
        });
    },
    
    // Place order (mock)
    placeOrder: function(userId, items) {
        // Ensure we have valid items
        const validItems = items && Array.isArray(items) ? 
            items.filter(item => item && item.productId && typeof item.quantity === 'number') : [];
            
        const orderData = {
            userId,
            items: validItems,
            total: validItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0),
            status: 'placed',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Create order document
        return db.collection('orders').add(orderData)
            .then((docRef) => {
                // Clear user's cart
                return db.collection('users').doc(userId).update({
                    cart: []
                }).then(() => {
                    return { success: true, orderId: docRef.id };
                });
            });
    }
};

// Listen for authentication state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    currentUser = { id: user.uid, email: user.email, ...doc.data() };
                    
                    // Get user's cart
                    if (doc.data().cart) {
                        cart = doc.data().cart;
                    } else {
                        cart = [];
                    }
                    
                    if (app && typeof app.showPage === 'function') {
                        app.showPage('products');
                    }
                }
            })
            .catch((error) => {
                console.error("Error fetching user data:", error);
            });
    } else {
        // User is signed out
        currentUser = null;
        cart = [];
        
        if (app && typeof app.showPage === 'function') {
            app.showPage('login');
        }
    }
}); 