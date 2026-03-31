// ============================================================
// Dynamic Content Loader - Fetches JSON and renders content
// ============================================================

let navbar = document.querySelector('.header .navbar');
let menuBtn = document.querySelector('#menu-btn');

menuBtn.onclick = () => {
    menuBtn.classList.toggle('fa-times');
    navbar.classList.toggle('active');
};

window.onscroll = () => {
    menuBtn.classList.remove('fa-times');
    navbar.classList.remove('active');
}

let shoppingcart = document.querySelector('.cart-items-container');

document.querySelector('#cart-btn').onclick = () => {
    shoppingcart.classList.add('active');
};

document.querySelector('#close').onclick = () => {
    shoppingcart.classList.remove('active');
};

// account form

let accountform = document.querySelector('.account-form');

document.querySelector('#account-btn').onclick = () => {
    accountform.classList.add('active');
};

document.querySelector('#close-form').onclick = () => {
    accountform.classList.remove('active');
};

let registerbtn = document.querySelector('.account-form .register-btn');
let loginbtn = document.querySelector('.account-form .login-btn');

registerbtn.onclick = () => {
    registerbtn.classList.add('active');
    loginbtn.classList.remove('active');
    document.querySelector('.account-form .login-form').classList.remove('active');
    document.querySelector('.account-form .register-form').classList.add('active');
};

loginbtn.onclick = () => {
    registerbtn.classList.remove('active');
    loginbtn.classList.add('active');
    document.querySelector('.account-form .login-form').classList.add('active');
    document.querySelector('.account-form .register-form').classList.remove('active');
};

// ============================================================
// Dynamic Content Loading
// ============================================================

async function loadJSON(path) {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        console.warn(`Failed to load ${path}:`, e.message);
        return null;
    }
}

function renderStars(rating) {
    let stars = '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
    if (half) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i = full + (half ? 1 : 0); i < 5; i++) stars += '<i class="fas fa-star" style="color:#ccc"></i>';
    return `<div class="stars">${stars}</div>`;
}

// Render Navigation
async function renderNavigation() {
    const data = await loadJSON('data/navigation.json');
    if (!data) return;
    const nav = document.getElementById('navbar');
    if (!nav) return;
    nav.innerHTML = data.navigation.map(item =>
        `<a href="${item.href}">${item.label}</a>`
    ).join('');
}

// Render Home Sliders
async function renderSliders() {
    const data = await loadJSON('data/sliders.json');
    if (!data) return;
    const wrapper = document.getElementById('slider-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = data.sliders.map(slide => `
        <div class="swiper-slide slide" style="background: url(${slide.image}) no-repeat;">
            <div class="content">
                <h3>${slide.heading}</h3>
                <span style="color: yellow;">${slide.tagline}</span>
            </div>
        </div>
    `).join('');

    if (typeof Swiper !== 'undefined') {
        initSwipers();
    }
}

// Render About Section
let aboutData = null;

async function renderAbout() {
    const data = await loadJSON('data/footer.json');
    if (!data) return;
    aboutData = data;
    const el = document.getElementById('about-content');
    if (!el) return;
    el.innerHTML = `
        <span>${data.about.tagline}</span>
        <h3>${data.about.heading}</h3>
        <p>${data.about.description}</p>
        <a href="#" class="btn" onclick="openAboutModal(); return false;">read more</a>
    `;
}

// About Us Detail Modal
function openAboutModal() {
    if (!aboutData || !aboutData.about) return;

    const about = aboutData.about;
    const modal = document.getElementById('about-modal');
    const modalContent = document.getElementById('about-modal-content');

    const statsHTML = about.stats ? about.stats.map(stat => `
        <div class="about-stat">
            <span class="stat-number">${stat.number}</span>
            <span class="stat-label">${stat.label}</span>
        </div>
    `).join('') : '';

    const whyChooseHTML = about.whyChooseUs ? about.whyChooseUs.map(item => `
        <div class="about-why-item">
            <div class="about-why-icon">
                <i class="fas ${item.icon}"></i>
            </div>
            <h4>${item.title}</h4>
            <p>${item.description}</p>
        </div>
    `).join('') : '';

    const paragraphs = (about.fullContent || about.description).split('\n').map(p => `<p>${p}</p>`).join('');

    modalContent.innerHTML = `
        <div class="modal-header about-modal-header">
            <div>
                <h2>About <span style="color:var(--primary-color)">Us</span></h2>
                <p style="color:rgba(255,255,255,0.8);font-size:1.3rem;margin-top:0.3rem;">${about.tagline}</p>
            </div>
            <span class="modal-close" onclick="closeAboutModal()">&times;</span>
        </div>
        <div class="modal-body about-modal-body">
            <img src="${about.image}" alt="About Ananya House of Furniture" class="about-modal-img">
            <div class="about-modal-content">${paragraphs}</div>

            ${statsHTML ? `<div class="about-stats">${statsHTML}</div>` : ''}

            ${whyChooseHTML ? `
                <div class="about-why">
                    <h3>Why Choose <span style="color:var(--primary-color)">Us</span></h3>
                    <div class="about-why-grid">${whyChooseHTML}</div>
                </div>
            ` : ''}
        </div>
        <div class="modal-footer">
            <a href="#contact" class="btn" onclick="closeAboutModal()">Contact Us</a>
            <a href="#product" class="btn btn-outline" onclick="closeAboutModal()">View Products</a>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAboutModal() {
    const modal = document.getElementById('about-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close about modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('about-modal');
    if (modal && modal.classList.contains('active') && e.target === modal) {
        closeAboutModal();
    }
});

// Close about modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAboutModal();
});

// ============================================================
// CART SYSTEM
// ============================================================

let allProducts = [];

// Get cart from localStorage
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('ananya_cart')) || [];
    } catch {
        return [];
    }
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('ananya_cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Add item to cart
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    let cart = getCart();
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            quantity: 1
        });
    }

    saveCart(cart);
    showToast(`${product.name} added to cart!`);
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
}

// Update item quantity
function updateCartQuantity(productId, change) {
    let cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }

    saveCart(cart);
}

// Update cart count badge
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Show toast notification
function showToast(message) {
    // Remove existing toast
    const existing = document.querySelector('.cart-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i>${message}`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Render Products with Add to Cart
async function renderProducts() {
    const data = await loadJSON('data/products.json');
    if (!data) return;
    allProducts = data.products;
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = data.products.map(product => `
        <div class="box">
            <a href="#" class="fas fa-heart wishlist-btn" onclick="toggleWishlist(this); return false;"></a>
            <a href="#" class="fas fa-eye"></a>
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            ${renderStars(product.rating)}
            <div class="price">Rs.${product.price.toLocaleString()} <span>Rs.${product.originalPrice.toLocaleString()}</span></div>
            <div class="product-actions">
                <button class="btn add-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i> add to cart
                </button>
            </div>
        </div>
    `).join('');
}

// Wishlist toggle
function toggleWishlist(icon) {
    icon.classList.toggle('active');
    if (icon.classList.contains('active')) {
        icon.style.color = '#e74c3c';
        showToast('Added to wishlist!');
    } else {
        icon.style.color = '';
        showToast('Removed from wishlist');
    }
}

// Render Cart
async function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-items');
    if (!container) return;

    const closeBtn = '<div id="close" class="fas fa-times"></div>';

    if (cart.length === 0) {
        container.innerHTML = `
            ${closeBtn}
            <div class="cart-empty">
                <i class="fas fa-shopping-cart" style="font-size:5rem;color:#ccc;margin-bottom:1rem;"></i>
                <p style="font-size:1.6rem;color:var(--light-black);">Your cart is empty</p>
                <p style="font-size:1.3rem;color:#999;margin-top:0.5rem;">Add products to get started</p>
            </div>
            <a href="#product" class="btn" onclick="closeCartPanel()" style="margin-top:1rem;">Browse Products</a>
        `;
        document.getElementById('close').onclick = () => shoppingcart.classList.remove('active');
        updateCartTotal();
        return;
    }

    const items = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="content">
                <h3>${item.name}</h3>
                <div class="price-cart-row">
                    <span class="cart-item-price">Rs.${item.price.toLocaleString()}</span>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <span class="cart-item-total">Rs.${(item.price * item.quantity).toLocaleString()}</span>
            </div>
            <span class="cart-remove fas fa-times" onclick="removeFromCart(${item.id})"></span>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = cart.reduce((sum, item) => {
        const product = allProducts.find(p => p.id === item.id);
        return sum + ((product ? product.originalPrice - product.price : 0) * item.quantity);
    }, 0);

    container.innerHTML = `
        ${closeBtn}
        <div class="cart-items-list">${items}</div>
        <div class="cart-summary">
            <div class="cart-summary-row">
                <span>Subtotal (${cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>Rs.${subtotal.toLocaleString()}</span>
            </div>
            <div class="cart-summary-row discount">
                <span>You Save</span>
                <span>-Rs.${discount.toLocaleString()}</span>
            </div>
            <div class="cart-summary-row total">
                <span>Total</span>
                <span>Rs.${subtotal.toLocaleString()}</span>
            </div>
        </div>
        <a href="#" class="btn checkout-btn" onclick="handleCheckout(); return false;">
            <i class="fas fa-lock"></i> Proceed to Checkout
        </a>
    `;

    document.getElementById('close').onclick = () => shoppingcart.classList.remove('active');
    updateCartTotal();
}

function closeCartPanel() {
    shoppingcart.classList.remove('active');
}

function updateCartTotal() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalEl = document.getElementById('cart-total-display');
    if (totalEl) {
        totalEl.textContent = `Rs.${subtotal.toLocaleString()}`;
    }
}

function handleCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    openPaymentModal();
}

// ============================================================
// PAYMENT MODAL
// ============================================================

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function openPaymentModal() {
    const modal = document.getElementById('payment-modal');
    const content = document.getElementById('payment-modal-content');
    const total = getCartTotal();

    content.innerHTML = `
        <div class="payment-header">
            <h2><i class="fas fa-lock"></i> Secure Checkout</h2>
            <span class="modal-close" onclick="closePaymentModal()">&times;</span>
        </div>
        <div class="payment-body">
            <!-- Step 1: Delivery Info -->
            <div class="payment-step active" id="payment-step-1">
                <h3>Step 1: Delivery Information</h3>
                <div class="payment-form">
                    <div class="form-group">
                        <label>Full Name *</label>
                        <input type="text" id="pay-name" placeholder="Enter your full name" required>
                    </div>
                    <div class="form-group">
                        <label>Phone Number *</label>
                        <input type="tel" id="pay-phone" placeholder="Enter phone number" maxlength="10" inputmode="numeric" pattern="[0-9]{10}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="pay-email" placeholder="Enter email address">
                    </div>
                    <div class="form-group full-width">
                        <label>Delivery Address *</label>
                        <textarea id="pay-address" placeholder="Enter complete delivery address" rows="3" required></textarea>
                    </div>
                    <div class="form-group full-width">
                        <label>Order Notes (Optional)</label>
                        <textarea id="pay-notes" placeholder="Any special instructions..." rows="2"></textarea>
                    </div>
                </div>
                <button class="btn payment-next-btn" onclick="goToPaymentStep2()">
                    Continue to Payment <i class="fas fa-arrow-right"></i>
                </button>
            </div>

            <!-- Step 2: Payment Method -->
            <div class="payment-step" id="payment-step-2">
                <h3>Step 2: Select Payment Method</h3>
                <div class="payment-summary">
                    <span>Total Amount:</span>
                    <strong id="payment-total-display">Rs.${total.toLocaleString()}</strong>
                </div>

                <div class="payment-methods">
                    <label class="payment-method" onclick="selectPaymentMethod('gpay')">
                        <input type="radio" name="payment-method" value="gpay">
                        <div class="method-content">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/120px-UPI-Logo-vector.svg.png" alt="GPay" class="payment-icon-img">
                            <div class="method-info">
                                <span class="method-name">Google Pay (UPI)</span>
                                <span class="method-desc">Pay instantly with GPay</span>
                            </div>
                            <div class="method-check"><i class="fas fa-check"></i></div>
                        </div>
                    </label>

                    <label class="payment-method" onclick="selectPaymentMethod('phonepe')">
                        <input type="radio" name="payment-method" value="phonepe">
                        <div class="method-content">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/PhonePe_Logo.svg/120px-PhonePe_Logo.svg.png" alt="PhonePe" class="payment-icon-img">
                            <div class="method-info">
                                <span class="method-name">PhonePe (UPI)</span>
                                <span class="method-desc">Fast & secure with PhonePe</span>
                            </div>
                            <div class="method-check"><i class="fas fa-check"></i></div>
                        </div>
                    </label>

                    <label class="payment-method" onclick="selectPaymentMethod('paytm')">
                        <input type="radio" name="payment-method" value="paytm">
                        <div class="method-content">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/120px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" class="payment-icon-img">
                            <div class="method-info">
                                <span class="method-name">Paytm (UPI/Wallet)</span>
                                <span class="method-desc">Pay with Paytm wallet or UPI</span>
                            </div>
                            <div class="method-check"><i class="fas fa-check"></i></div>
                        </div>
                    </label>

                    <label class="payment-method" onclick="selectPaymentMethod('upi')">
                        <input type="radio" name="payment-method" value="upi">
                        <div class="method-content">
                            <div class="payment-icon"><i class="fas fa-mobile-alt"></i></div>
                            <div class="method-info">
                                <span class="method-name">Other UPI Apps</span>
                                <span class="method-desc">Any UPI app (BHIM, etc.)</span>
                            </div>
                            <div class="method-check"><i class="fas fa-check"></i></div>
                        </div>
                    </label>

                    <label class="payment-method" onclick="selectPaymentMethod('card')">
                        <input type="radio" name="payment-method" value="card">
                        <div class="method-content">
                            <div class="payment-icon"><i class="fas fa-credit-card"></i></div>
                            <div class="method-info">
                                <span class="method-name">Credit / Debit Card</span>
                                <span class="method-desc">Visa, Mastercard, RuPay</span>
                            </div>
                            <div class="method-check"><i class="fas fa-check"></i></div>
                        </div>
                    </label>

                    <label class="payment-method" onclick="selectPaymentMethod('cod')">
                        <input type="radio" name="payment-method" value="cod">
                        <div class="method-content">
                            <div class="payment-icon"><i class="fas fa-money-bill-wave"></i></div>
                            <div class="method-info">
                                <span class="method-name">Cash on Delivery</span>
                                <span class="method-desc">Pay when you receive</span>
                            </div>
                            <div class="method-check"><i class="fas fa-check"></i></div>
                        </div>
                    </label>
                </div>

                <!-- Card Details (hidden by default) -->
                <div class="card-details" id="card-details" style="display:none;">
                    <div class="form-group">
                        <label>Card Number</label>
                        <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Expiry Date</label>
                            <input type="text" id="card-expiry" placeholder="MM/YY" maxlength="5">
                        </div>
                        <div class="form-group">
                            <label>CVV</label>
                            <input type="password" id="card-cvv" placeholder="***" maxlength="3">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Cardholder Name</label>
                        <input type="text" id="card-name" placeholder="Name on card">
                    </div>
                </div>

                <div class="payment-actions">
                    <button class="btn btn-back" onclick="goToPaymentStep1()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <button class="btn payment-next-btn" onclick="processPayment()">
                        <i class="fas fa-lock"></i> Pay Rs.${total.toLocaleString()}
                    </button>
                </div>
            </div>

            <!-- Step 3: Payment Processing -->
            <div class="payment-step" id="payment-step-3">
                <div class="payment-processing">
                    <div class="spinner"></div>
                    <h3>Processing Payment...</h3>
                    <p id="payment-status-text">Please wait while we process your payment</p>
                </div>
            </div>

            <!-- Step 4: Success -->
            <div class="payment-step" id="payment-step-4">
                <div class="payment-success">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Order Placed Successfully!</h3>
                    <p class="order-id">Order ID: <strong id="order-id-display">ANF-${Date.now().toString().slice(-8)}</strong></p>
                    <p class="success-message">
                        Thank you for your order! We have received your request and will contact you shortly to confirm delivery details.
                    </p>
                    <div class="success-details">
                        <p><i class="fas fa-phone"></i> We will call you within 24 hours</p>
                        <p><i class="fas fa-truck"></i> Estimated delivery: 5-7 working days</p>
                    </div>
                    <button class="btn" onclick="closePaymentModal(); location.reload();">
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

let selectedPaymentMethod = '';
let customerInfo = {};

function goToPaymentStep1() {
    document.getElementById('payment-step-1').classList.add('active');
    document.getElementById('payment-step-2').classList.remove('active');
}

function goToPaymentStep2() {
    const name = document.getElementById('pay-name').value.trim();
    const phone = document.getElementById('pay-phone').value.trim();
    const address = document.getElementById('pay-address').value.trim();

    if (!name || !phone || !address) {
        showToast('Please fill in all required fields');
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        showToast('Please enter a valid 10-digit phone number');
        return;
    }

    customerInfo = {
        name: name,
        phone: phone,
        email: document.getElementById('pay-email').value.trim(),
        address: address,
        notes: document.getElementById('pay-notes').value.trim()
    };

    document.getElementById('payment-step-1').classList.remove('active');
    document.getElementById('payment-step-2').classList.add('active');
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;

    // Update radio buttons
    const radios = document.querySelectorAll('input[name="payment-method"]');
    radios.forEach(r => r.checked = r.value === method);

    // Show/hide card details
    const cardDetails = document.getElementById('card-details');
    if (method === 'card') {
        cardDetails.style.display = 'block';
    } else {
        cardDetails.style.display = 'none';
    }

    // Update visual selection
    document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
    const selected = document.querySelector(`input[value="${method}"]`).closest('.payment-method');
    if (selected) selected.classList.add('selected');
}

function processPayment() {
    if (!selectedPaymentMethod) {
        showToast('Please select a payment method');
        return;
    }

    if (selectedPaymentMethod === 'card') {
        const cardNumber = document.getElementById('card-number').value.trim();
        const expiry = document.getElementById('card-expiry').value.trim();
        const cvv = document.getElementById('card-cvv').value.trim();
        const cardName = document.getElementById('card-name').value.trim();

        if (!cardNumber || !expiry || !cvv || !cardName) {
            showToast('Please fill in all card details');
            return;
        }
    }

    // Show processing step
    document.getElementById('payment-step-2').classList.remove('active');
    document.getElementById('payment-step-3').classList.add('active');

    const total = getCartTotal();
    const cart = getCart();

    // Simulate UPI payment process
    if (['gpay', 'phonepe', 'paytm', 'upi'].includes(selectedPaymentMethod)) {
        const upiIds = {
            gpay: 'rameshkumar1567@axl',
            phonepe: 'rameshkumar1567@axl',
            paytm: 'rameshkumar1567@axl',
            upi: 'rameshkumar1567@axl'
        };

        const appNames = {
            gpay: 'Google Pay',
            phonepe: 'PhonePe',
            paytm: 'Paytm',
            upi: 'UPI'
        };

        document.getElementById('payment-status-text').textContent =
            `Opening ${appNames[selectedPaymentMethod]}... Please complete payment on your phone`;

        // Create UPI payment link
        const upiId = upiIds[selectedPaymentMethod];
        const amount = total;
        const orderId = `ANF${Date.now().toString().slice(-8)}`;
        const name = encodeURIComponent(customerInfo.name);

        // UPI deep link
        const upiLink = `upi://pay?pa=${upiId}&pn=Ananya%20Furniture&am=${amount}&cu=INR&tn=Order-${orderId}&mam=${amount}`;

        // Try to open UPI app
        setTimeout(() => {
            const now = Date.now();
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = upiLink;
            document.body.appendChild(iframe);

            // If iframe doesn't work, try location change
            setTimeout(() => {
                location.href = upiLink;
            }, 500);

            // Show QR fallback after 2 seconds
            setTimeout(() => {
                showUPIPayment(amount, upiId, orderId);
            }, 2000);
        }, 1500);

    } else if (selectedPaymentMethod === 'card') {
        // Simulate card processing
        setTimeout(() => {
            completePaymentFlow(cart, total);
        }, 3000);

    } else if (selectedPaymentMethod === 'cod') {
        // Cash on delivery
        document.getElementById('payment-status-text').textContent = 'Confirming your order...';
        setTimeout(() => {
            completePaymentFlow(cart, total);
        }, 2000);
    }
}

function showUPIPayment(amount, upiId, orderId) {
    document.getElementById('payment-status-text').textContent = 'Or scan QR code below to pay:';

    const step3 = document.getElementById('payment-step-3');
    const processing = step3.querySelector('.payment-processing');

    processing.innerHTML = `
        <div class="upi-qr-section">
            <h3>Scan to Pay</h3>
            <div class="qr-container">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}&pn=Ananya%20Furniture&am=${amount}&cu=INR&tn=Order-${orderId}" alt="Scan QR to Pay" class="qr-code">
            </div>
            <div class="upi-details">
                <p><strong>Pay Amount:</strong> <span style="color:var(--primary-color);font-size:2rem;">Rs.${amount.toLocaleString()}</span></p>
                <p><strong>UPI ID:</strong> <code>${upiId}</code></p>
                <p><strong>Order ID:</strong> <code>${orderId}</code></p>
            </div>
            <div class="upi-actions">
                <p style="font-size:1.3rem;color:var(--light-black);margin-bottom:1rem;">Payment will be verified automatically after you complete it</p>
                <button class="btn" onclick="confirmUPIPayment('${orderId}')">
                    <i class="fas fa-check"></i> I've Completed Payment
                </button>
                <button class="btn btn-back" onclick="goToPaymentStep2()">
                    <i class="fas fa-arrow-left"></i> Change Payment Method
                </button>
            </div>
        </div>
    `;
}

function confirmUPIPayment(orderId) {
    const cart = getCart();
    const total = getCartTotal();
    completePaymentFlow(cart, total);
}

function completePaymentFlow(cart, total) {
    const orderId = `ANF${Date.now().toString().slice(-8)}`;

    const order = {
        id: orderId,
        items: cart,
        total: total,
        customer: customerInfo,
        paymentMethod: selectedPaymentMethod,
        date: new Date().toISOString(),
        status: 'confirmed'
    };

    // Save to localStorage
    try {
        const orders = JSON.parse(localStorage.getItem('ananya_orders') || '[]');
        orders.unshift(order);
        localStorage.setItem('ananya_orders', JSON.stringify(orders.slice(0, 20)));
    } catch(e) {}

    // Send order to Google Sheets
    sendOrderToSheet(order);

    // Send SMS to customer
    sendCustomerSMS(order);

    // Clear cart
    localStorage.removeItem('ananya_cart');
    updateCartCount();

    // Show success
    document.getElementById('payment-step-3').classList.remove('active');
    document.getElementById('payment-step-4').classList.add('active');
    document.getElementById('order-id-display').textContent = orderId;
}

// Send SMS to customer
function sendCustomerSMS(order) {
    // Fast2SMS API - Replace with your API key
    const SMS_API_KEY = 'BMSFLbr8J7fu2kYRPZDyihOp1XUH3nG65jag9TvVCmAdIKcslQTJ1OdQzr7w2yboRkZEXFlKjpMaAiB6';

    if (!SMS_API_KEY || SMS_API_KEY === 'YOUR_FAST2SMS_API_KEY') {
        console.log('SMS not configured. Order:', order.id);
        return;
    }

    const phone = order.customer.phone;
    const name = order.customer.name.split(' ')[0]; // First name
    const amount = order.total.toLocaleString();
    const orderId = order.id;

    // Format phone number (ensure 10 digits)
    const formattedPhone = phone.replace(/[^0-9]/g, '').slice(-10);

    const message = `Dear ${name}, Thank you for your order! Order ID: ${orderId}. Total: Rs.${amount}. We will call you within 24 hours to confirm delivery. - Ananya House of Furniture`;

    // Send via Fast2SMS
    fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${SMS_API_KEY}&message=${encodeURIComponent(message)}&language=english&route=q&numbers=${formattedPhone}`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
    }).then(response => response.json())
      .then(data => {
          if (data.return) {
              console.log('SMS sent to customer:', phone);
          } else {
              console.log('SMS failed:', data);
          }
      })
      .catch(err => console.log('SMS error:', err));
}

// Alternative: Send SMS via Google Apps Script (FREE)
// This function sends SMS using your Google Apps Script with SMS gateway
function sendSMSViaGoogleScript(phone, name, orderId, amount) {
    // See data/SMS-SETUP.txt for Google Apps Script SMS setup
    // This is a free alternative using SMS gateways like Way2SMS
}

// Send order to Google Sheets
function sendOrderToSheet(order) {
    const itemsList = order.items.map(i => `${i.name} x${i.quantity} (Rs.${i.price})`).join(', ');

    const data = {
        orderId: order.id,
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        customerName: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email || 'N/A',
        address: order.customer.address,
        items: itemsList,
        total: 'Rs.' + order.total.toLocaleString(),
        paymentMethod: order.paymentMethod.toUpperCase(),
        status: 'New Order'
    };

    // Send to Google Apps Script - REPLACE with your deployed Apps Script URL
    // See data/apps-script.js for setup instructions
    const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).catch(() => {});
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Re-render cart (will show empty cart)
        setTimeout(() => renderCart(), 300);
    }
}

// Close payment modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('payment-modal');
    if (modal && modal.classList.contains('active') && e.target === modal) {
        // Don't close on outside click during payment processing
        if (!document.getElementById('payment-step-3').classList.contains('active')) {
            closePaymentModal();
        }
    }
});

// Close payment modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!document.getElementById('payment-step-3')?.classList.contains('active')) {
            closePaymentModal();
        }
    }
});

// Phone number input filter - only numbers, max 10 digits
// Using event delegation since modal is created dynamically
document.addEventListener('input', (e) => {
    if (e.target.id === 'pay-phone') {
        // Remove non-numeric characters
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        // Limit to 10 digits
        if (e.target.value.length > 10) {
            e.target.value = e.target.value.slice(0, 10);
        }
    }
});

// Service Detail Modal
let allServicesData = [];

async function renderServices() {
    const data = await loadJSON('data/services.json');
    if (!data) return;
    allServicesData = data.services;
    const container = document.getElementById('services-container');
    if (!container) return;
    container.innerHTML = data.services.map(service => `
        <div class="box">
            <img src="${service.image}" alt="${service.name}">
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <a href="#" class="btn" onclick="openServiceModal(${service.id}); return false;">${service.linkText}</a>
        </div>
    `).join('');
}

function openServiceModal(id) {
    const service = allServicesData.find(s => s.id === id);
    if (!service) return;

    const modal = document.getElementById('service-modal');
    const modalContent = document.getElementById('service-modal-content');

    const featuresHTML = service.features ? service.features.map(f =>
        `<li><i class="fas fa-check"></i>${f}</li>`
    ).join('') : '';

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${service.name}</h2>
            <span class="modal-close" onclick="closeServiceModal()">&times;</span>
        </div>
        <div class="modal-body">
            <img src="${service.image}" alt="${service.name}" class="modal-img">
            <p class="modal-full-desc">${service.fullDescription || service.description}</p>
            ${featuresHTML ? `<div class="modal-features"><h3>What We Offer:</h3><ul>${featuresHTML}</ul></div>` : ''}
        </div>
        <div class="modal-footer">
            <a href="#contact" class="btn" onclick="closeServiceModal()">Get Quote</a>
            <a href="#" class="btn btn-outline" onclick="closeServiceModal(); return false;">Close</a>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById('service-modal');
    if (modal && modal.classList.contains('active') && e.target === modal) {
        closeServiceModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeServiceModal();
});

// Render Team
async function renderTeam() {
    const data = await loadJSON('data/team.json');
    if (!data) return;
    const wrapper = document.getElementById('team-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = data.team.map(member => `
        <div class="swiper-slide slide">
            <div class="image">
                <img src="${member.image}" alt="${member.name}" class="border-size">
                <div class="share">
                    <a href="${member.social.facebook}" class="fab fa-facebook-f"></a>
                    <a href="${member.social.twitter}" class="fab fa-twitter"></a>
                    <a href="${member.social.instagram}" class="fab fa-instagram"></a>
                    <a href="${member.social.linkedin}" class="fab fa-linkedin"></a>
                </div>
            </div>
            <div class="content">
                <h3>${member.name}</h3>
                <span>${member.role}</span>
            </div>
        </div>
    `).join('');

    if (typeof Swiper !== 'undefined') {
        initTeamSwiper();
    }
}

// Render Blog
let allBlogPosts = [];

async function renderBlog() {
    const data = await loadJSON('data/blog.json');
    if (!data) return;
    allBlogPosts = data.posts;
    const container = document.getElementById('blog-container');
    if (!container) return;
    container.innerHTML = data.posts.map(post => `
        <div class="box">
            <div class="image">
                <img src="${post.image}" alt="${post.title}">
                <span class="blog-category">${post.category || ''}</span>
            </div>
            <div class="content">
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="#" class="btn" onclick="openBlogModal(${post.id}); return false;">read more</a>
                <div class="icons">
                    <a href="#"><i class="fas fa-calendar"></i>${post.date}</a>
                    <a href="#"><i class="fas fa-user"></i>${post.author}</a>
                    <a href="#"><i class="fas fa-clock"></i>${post.readTime || ''}</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Blog Detail Modal
function openBlogModal(id) {
    const post = allBlogPosts.find(p => p.id === id);
    if (!post) return;

    const modal = document.getElementById('blog-modal');
    const modalContent = document.getElementById('blog-modal-content');

    const tagsHTML = post.tags ? post.tags.map(tag =>
        `<span class="blog-tag">${tag}</span>`
    ).join('') : '';

    const paragraphs = (post.fullContent || post.excerpt).split('\n').map(p => `<p>${p}</p>`).join('');

    modalContent.innerHTML = `
        <div class="modal-header">
            <div class="blog-header-info">
                <span class="blog-modal-category">${post.category || 'Blog'}</span>
                <span class="blog-modal-date"><i class="fas fa-calendar"></i>${post.date}</span>
                <span class="blog-modal-readtime"><i class="fas fa-clock"></i>${post.readTime || ''}</span>
            </div>
            <span class="modal-close" onclick="closeBlogModal()">&times;</span>
        </div>
        <div class="modal-body blog-modal-body">
            <img src="${post.image}" alt="${post.title}" class="blog-modal-img">
            <h2 class="blog-modal-title">${post.title}</h2>
            <div class="blog-author">
                <img src="${post.authorImage || 'images/team-2.jpg'}" alt="${post.author}">
                <span>By ${post.author}</span>
            </div>
            <div class="blog-modal-content">${paragraphs}</div>
            ${tagsHTML ? `<div class="blog-modal-tags">${tagsHTML}</div>` : ''}
        </div>
        <div class="modal-footer blog-modal-footer">
            <a href="#contact" class="btn" onclick="closeBlogModal()">Get in Touch</a>
            <a href="#" class="btn btn-outline" onclick="closeBlogModal(); return false;">Close</a>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBlogModal() {
    const modal = document.getElementById('blog-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close blog modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('blog-modal');
    if (modal && modal.classList.contains('active') && e.target === modal) {
        closeBlogModal();
    }
});

// Close blog modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBlogModal();
});

// Render Footer Contact Info
async function renderFooter() {
    const data = await loadJSON('data/footer.json');
    if (!data) return;

    const contactEl = document.getElementById('footer-contact');
    const socialEl = document.getElementById('footer-social');
    const creditEl = document.getElementById('footer-credit');

    if (contactEl) {
        contactEl.innerHTML = `
            <h3>contact info</h3>
            <a href="tel:${data.footer.contactInfo.phone}"><i class="fas fa-phone"></i>${data.footer.contactInfo.phone}</a>
            <a href="mailto:${data.footer.contactInfo.email}"><i class="fas fa-envelope"></i>${data.footer.contactInfo.email}</a>
            <a href="${data.footer.contactInfo.addressLink}"><i class="fas fa-map"></i>${data.footer.contactInfo.address}</a>
        `;
    }

    if (socialEl) {
        socialEl.innerHTML = `
            <h3>follow us</h3>
            <a href="${data.footer.social.facebook}"><i class="fab fa-facebook-f"></i>facebook</a>
            <a href="${data.footer.social.twitter}"><i class="fab fa-twitter"></i>twitter</a>
            <a href="${data.footer.social.instagram}"><i class="fab fa-instagram"></i>instagram</a>
            <a href="${data.footer.social.linkedin}"><i class="fab fa-linkedin"></i>linkedin</a>
        `;
    }

    if (creditEl) {
        creditEl.innerHTML = `${data.footer.creditText} | all rights reserved`;
    }
}

// Render Project Types in Contact Form
async function renderProjectTypes() {
    const data = await loadJSON('data/footer.json');
    if (!data) return;
    const select = document.getElementById('project-type');
    if (!select) return;
    select.innerHTML = data.projectTypes.map(type =>
        `<option value="${type.toLowerCase().replace(/\s+/g, '-')}">${type}</option>`
    ).join('');
}

// Swiper initializations
function initSwipers() {
    new Swiper(".home-slider", {
        autoplay: { delay: 7500, disableOnInteraction: false },
        grabCursor: true,
        loop: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
}

function initTeamSwiper() {
    new Swiper(".team-slider", {
        autoplay: { delay: 7500, disableOnInteraction: false },
        grabCursor: true,
        loop: true,
        spaceBetween: 20,
        breakpoints: {
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            991: { slidesPerView: 3 },
        },
    });
}

// ============================================================
// Initialize all dynamic content on page load
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    const servicesData = await loadJSON('data/services.json');
    if (servicesData) allServicesData = servicesData.services;

    await Promise.all([
        renderNavigation(),
        renderSliders(),
        renderAbout(),
        renderServices(),
        renderProducts(),
        renderTeam(),
        renderBlog(),
        renderCart(),
        renderFooter(),
        renderProjectTypes(),
    ]);

    updateCartCount();
});
