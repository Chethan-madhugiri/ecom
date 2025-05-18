// Global variables
let currentUser = null;
let cart = [];

// Mock users data
const users = [
    {
        id: 1,
        email: 'user@example.com',
        name: 'Demo User',
        password: 'password123'
    }
];

// Mock products data
const products = [
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

// Mock API
const api = {
    // Login function
    login: function(email, password) {
        return new Promise((resolve, reject) => {
            // Simulate API delay
            setTimeout(() => {
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    // Clone the user without the password
                    const { password, ...userWithoutPassword } = user;
                    resolve(userWithoutPassword);
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 500); // Simulate 500ms delay
        });
    },
    
    // Signup function
    signup: function(email, name, password) {
        return new Promise((resolve, reject) => {
            // Simulate API delay
            setTimeout(() => {
                // Check if user already exists
                const existingUser = users.find(u => u.email === email);
                
                if (existingUser) {
                    reject(new Error('Email already in use'));
                    return;
                }
                
                // Create new user
                const newUser = {
                    id: users.length + 1,
                    email,
                    name,
                    password
                };
                
                // Add to users array
                users.push(newUser);
                
                // Return user without password
                const { password: pass, ...userWithoutPassword } = newUser;
                resolve(userWithoutPassword);
            }, 500); // Simulate 500ms delay
        });
    },
    
    // Get products
    getProducts: function() {
        return new Promise((resolve) => {
            // Simulate API delay
            setTimeout(() => {
                resolve([...products]); // Return a copy of the products array
            }, 300); // Simulate 300ms delay
        });
    },
    
    // Place order (mock)
    placeOrder: function(items) {
        return new Promise((resolve) => {
            // Simulate API delay
            setTimeout(() => {
                console.log('Order placed:', items);
                resolve({ success: true, orderId: 'ORD-' + Date.now() });
            }, 800); // Simulate 800ms delay
        });
    }
};