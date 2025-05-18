// Auth module
const authModule = {
    // DOM elements
    elements: {
        loginForm: document.getElementById('login-form'),
        signupForm: document.getElementById('signup-form'),
        loginEmail: document.getElementById('login-email'),
        loginPassword: document.getElementById('login-password'),
        signupEmail: document.getElementById('signup-email'),
        signupName: document.getElementById('signup-name'),
        signupPassword: document.getElementById('signup-password'),
        logoutBtn: document.getElementById('logout-btn'),
        logoutBtnCart: document.getElementById('logout-btn-cart'),
        loginError: document.getElementById('login-error'),
        signupError: document.getElementById('signup-error')
    },
    
    // Initialize auth module
    init: function() {
        // Login form submit
        this.elements.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear previous error
            this.showError('login', '');
            
            const email = this.elements.loginEmail.value;
            const password = this.elements.loginPassword.value;
            
            // Validate form
            if (!this.validateLoginForm(email, password)) {
                return;
            }
            
            try {
                // Show loading indicator
                this.toggleLoading('login', true);
                
                await api.login(email, password);
                // Firebase Auth state change listener will handle the rest
                
                // Clear form
                this.elements.loginForm.reset();
            } catch (error) {
                this.showError('login', error.message);
                this.toggleLoading('login', false);
            }
        });
        
        // Signup form submit
        this.elements.signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear previous error
            this.showError('signup', '');
            
            const email = this.elements.signupEmail.value;
            const name = this.elements.signupName.value;
            const password = this.elements.signupPassword.value;
            
            // Validate form
            if (!this.validateSignupForm(email, name, password)) {
                return;
            }
            
            try {
                // Show loading indicator
                this.toggleLoading('signup', true);
                
                await api.signup(email, name, password);
                // Firebase Auth state change listener will handle the rest
                
                // Clear form
                this.elements.signupForm.reset();
            } catch (error) {
                this.showError('signup', error.message);
                this.toggleLoading('signup', false);
            }
        });
        
        // Logout buttons
        this.elements.logoutBtn.addEventListener('click', this.logout);
        this.elements.logoutBtnCart.addEventListener('click', this.logout);
    },
    
    // Validate login form
    validateLoginForm: function(email, password) {
        if (!email || !email.includes('@')) {
            this.showError('login', 'Please enter a valid email address');
            return false;
        }
        
        if (!password || password.length < 6) {
            this.showError('login', 'Password must be at least 6 characters');
            return false;
        }
        
        return true;
    },
    
    // Validate signup form
    validateSignupForm: function(email, name, password) {
        if (!email || !email.includes('@')) {
            this.showError('signup', 'Please enter a valid email address');
            return false;
        }
        
        if (!name || name.length < 2) {
            this.showError('signup', 'Name must be at least 2 characters');
            return false;
        }
        
        if (!password || password.length < 6) {
            this.showError('signup', 'Password must be at least 6 characters');
            return false;
        }
        
        return true;
    },
    
    // Show error message
    showError: function(form, message) {
        const errorElement = form === 'login' ? this.elements.loginError : this.elements.signupError;
        
        if (!errorElement) {
            // If error element doesn't exist, create it
            if (form === 'login') {
                const loginButton = this.elements.loginForm.querySelector('button[type="submit"]');
                const errorDiv = document.createElement('div');
                errorDiv.id = 'login-error';
                errorDiv.className = 'error-message';
                errorDiv.textContent = message;
                this.elements.loginForm.insertBefore(errorDiv, loginButton);
                this.elements.loginError = errorDiv;
            } else {
                const signupButton = this.elements.signupForm.querySelector('button[type="submit"]');
                const errorDiv = document.createElement('div');
                errorDiv.id = 'signup-error';
                errorDiv.className = 'error-message';
                errorDiv.textContent = message;
                this.elements.signupForm.insertBefore(errorDiv, signupButton);
                this.elements.signupError = errorDiv;
            }
        } else {
            errorElement.textContent = message;
            errorElement.style.display = message ? 'block' : 'none';
        }
    },
    
    // Toggle loading state
    toggleLoading: function(form, isLoading) {
        const button = form === 'login' 
            ? this.elements.loginForm.querySelector('button[type="submit"]')
            : this.elements.signupForm.querySelector('button[type="submit"]');
        
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = 'Loading...';
        } else {
            button.disabled = false;
            button.innerHTML = form === 'login' ? 'Login' : 'Sign Up';
        }
    },
    
    // Logout function
    logout: function() {
        firebase.auth().signOut().catch(error => {
            console.error('Error signing out:', error);
        });
        // Firebase Auth state change listener will handle the rest
    }
};
