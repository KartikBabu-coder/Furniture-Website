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
            <div class="price">${product.price.toLocaleString()} <span>${product.originalPrice.toLocaleString()}</span></div>
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
    showToast('Redirecting to checkout... (integrate payment gateway)');
    // Here you would integrate with a payment gateway like Razorpay, Stripe, etc.
}

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
