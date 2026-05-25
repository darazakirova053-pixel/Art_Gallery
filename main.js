// ========== РАБОТА С ПОЛЬЗОВАТЕЛЯМИ ==========
let currentUser = null;

function loadUsers() {
    const data = localStorage.getItem('artUsers');
    if (data) return JSON.parse(data);
    
    const defaultUsers = [
        { id: 1, name: "Администратор", email: "admin@artgallery.ru", phone: "+7 (999) 999-99-99", password: "admin123", role: "admin", purchasedWorks: [], uploadedWorks: [], favorites: [], createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('artUsers', JSON.stringify(defaultUsers));
    return defaultUsers;
}

function saveUsers(users) {
    localStorage.setItem('artUsers', JSON.stringify(users));
}

function createTestUser() {
    const users = loadUsers();
    const hasRegularUser = users.some(u => u.role === 'user');
    
    if (!hasRegularUser) {
        const testUser = {
            id: Date.now(),
            name: "Тестовый Пользователь",
            email: "test@test.ru",
            phone: "+7 (999) 123-45-67",
            password: "123456",
            role: "user",
            purchasedWorks: [],
            uploadedWorks: [],
            favorites: [],
            createdAt: new Date().toISOString()
        };
        users.push(testUser);
        saveUsers(users);
        console.log("Тестовый пользователь создан: test@test.ru / 123456");
    }
}

window.registerUser = function(event) {
    event.preventDefault();
    
    const name = document.getElementById('regName')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim();
    const phone = document.getElementById('regPhone')?.value.trim();
    const password = document.getElementById('regPassword')?.value;
    const confirm = document.getElementById('regConfirmPassword')?.value;
    
    if (!name || !email || !phone || !password) {
        alert('Заполните все поля!');
        return;
    }
    
    if (password !== confirm) {
        alert('Пароли не совпадают!');
        return;
    }
    
    if (password.length < 6) {
        alert('Пароль должен быть минимум 6 символов!');
        return;
    }
    
    let users = loadUsers();
    
    if (users.find(u => u.email === email)) {
        alert('Пользователь с таким email уже существует!');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        role: 'user',
        purchasedWorks: [],
        uploadedWorks: [],
        favorites: []
    };
    
    users.push(newUser);
    saveUsers(users);
    
    currentUser = { ...newUser };
    delete currentUser.password;
    localStorage.setItem('artCurrentUser', JSON.stringify(currentUser));
    
    alert('Регистрация успешна!');
    closeAllModals();
    updateUI();
    
    document.getElementById('regForm')?.reset();
    
    if (window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
};

window.loginUser = function(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        alert('Введите email и пароль!');
        return;
    }
    
    let users = loadUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        alert('Неверный email или пароль!\n\nТестовые данные:\nАдмин: admin@artgallery.ru / admin123\nПользователь: test@test.ru / 123456');
        return;
    }
    
    currentUser = { ...user };
    delete currentUser.password;
    localStorage.setItem('artCurrentUser', JSON.stringify(currentUser));
    
    alert(`Добро пожаловать, ${user.name}!`);
    closeAllModals();
    updateUI();
    
    document.getElementById('loginForm')?.reset();
    
    if (currentUser.role === 'admin') {
        window.location.href = 'admin.html';
    } else if (window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
};

window.logoutUser = function() {
    currentUser = null;
    localStorage.removeItem('artCurrentUser');
    if (typeof showToast === 'function') {
        showToast('Вы вышли из аккаунта');
    } else {
        alert('Вы вышли из аккаунта');
    }
    closeAllModals();
    updateUI();
    
    if (!window.location.pathname.includes('login.html')) {
        if (window.location.pathname.includes('admin.html') || window.location.pathname.includes('profile.html')) {
            window.location.href = 'index.html';
        }
    }
};

window.goToProfile = function() {
    if (currentUser) {
        if (currentUser.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'profile.html';
        }
    } else {
        showLoginModal();
    }
};

function updateUI() {
    const authDivDesktop = document.querySelector('.auth-buttons');
    const userDivDesktop = document.querySelector('.user-info');
    const authMobileTop = document.querySelector('.auth-buttons-mobile-top');
    const userMobileTop = document.querySelector('.user-info-mobile-top');
    const userMobileBottom = document.querySelector('.user-info-mobile-bottom');
    
    if (currentUser) {
        if (authDivDesktop) authDivDesktop.style.display = 'none';
        if (userDivDesktop) {
            userDivDesktop.style.display = 'flex';
            const userName = userDivDesktop.querySelector('.user-name');
            if (userName) userName.textContent = currentUser.name;
        }
        
        if (authMobileTop) authMobileTop.style.display = 'none';
        if (userMobileTop) {
            userMobileTop.style.display = 'block';
            const userName = userMobileTop.querySelector('.user-name');
            if (userName) userName.textContent = currentUser.name;
        }
        
        if (userMobileBottom) userMobileBottom.style.display = 'block';
        
    } else {
        if (authDivDesktop) authDivDesktop.style.display = 'flex';
        if (userDivDesktop) userDivDesktop.style.display = 'none';
        
        if (authMobileTop) authMobileTop.style.display = 'flex';
        if (userMobileTop) userMobileTop.style.display = 'none';
        if (userMobileBottom) userMobileBottom.style.display = 'none';
    }
    
    updateCartBadge();
}

function showLoginModal() {
    const openOffcanvas = document.querySelector('.offcanvas.show');
    if (openOffcanvas && typeof bootstrap !== 'undefined') {
        const offcanvas = bootstrap.Offcanvas.getInstance(openOffcanvas);
        if (offcanvas) offcanvas.hide();
    }
    
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function showRegisterModal() {
    const openOffcanvas = document.querySelector('.offcanvas.show');
    if (openOffcanvas && typeof bootstrap !== 'undefined') {
        const offcanvas = bootstrap.Offcanvas.getInstance(openOffcanvas);
        if (offcanvas) offcanvas.hide();
    }
    
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.custom-modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('show');
    });
    document.body.style.overflow = '';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('custom-modal')) {
        closeModal(e.target.id);
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.custom-modal.show');
        openModals.forEach(modal => {
            closeModal(modal.id);
        });
    }
});

window.closeOffcanvasManual = function() {
    const offcanvasElement = document.getElementById('offcanvasNavbar');
    if (offcanvasElement) {
        const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
        if (offcanvas) offcanvas.hide();
    }
};

// ========== КОРЗИНА ==========
let cart = [];

function loadCart() {
    try {
        const saved = localStorage.getItem('artCartFull');
        cart = saved ? JSON.parse(saved) : [];
    } catch(e) {
        cart = [];
    }
}

function saveCart() {
    localStorage.setItem('artCartFull', JSON.stringify(cart));
}

function updateCartBadge() {
    let total = cart.reduce((sum, item) => sum + item.qty, 0);
    const desktopBadge = document.getElementById("cartBadgeDesktop");
    const mobileBadge = document.getElementById("cartBadgeMobile");
    if (desktopBadge) desktopBadge.innerText = total;
    if (mobileBadge) mobileBadge.innerText = total;
}

function renderCart() {
    loadCart();
    
    let total = 0;
    let html = "";
    
    if (cart.length === 0) {
        html = '<div class="cart-item"><i class="fas fa-shopping-cart me-2"></i>Корзина пуста</div>';
    } else {
        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];
            total += item.price * item.qty;
            html += `<div class="cart-item d-flex justify-content-between align-items-center">
                <div><strong>${item.name}</strong><br>${item.price.toLocaleString()} ₽ x ${item.qty}</div>
                <div>
                    <button class="btn-outline-custom btn-sm-custom" onclick="changeQty(${i}, -1)"><i class="fas fa-minus"></i></button>
                    <span class="mx-2">${item.qty}</span>
                    <button class="btn-outline-custom btn-sm-custom" onclick="changeQty(${i}, 1)"><i class="fas fa-plus"></i></button>
                    <button class="btn-outline-custom btn-sm-custom ms-2" onclick="removeCartItem(${i})"><i class="fas fa-trash-alt"></i> Удалить</button>
                </div>
            </div>`;
        }
    }
    
    const container = document.getElementById("cart-items-list");
    if (container) container.innerHTML = html;
    
    const totalEl = document.getElementById("cart-total");
    if (totalEl) totalEl.innerHTML = `<i class="fas fa- ruble-sign me-2"></i>Итого: ${total.toLocaleString()} ₽`;
    
    updateCartBadge();
}

window.changeQty = function(idx, delta) {
    loadCart();
    if (cart[idx]) {
        cart[idx].qty += delta;
        if (cart[idx].qty <= 0) {
            cart.splice(idx, 1);
        }
        saveCart();
        renderCart();
    }
};

window.removeCartItem = function(idx) {
    loadCart();
    cart.splice(idx, 1);
    saveCart();
    renderCart();
    showToast("Товар удалён");
};

window.addToCart = function(name, price) {
    if (!currentUser) {
        alert('Войдите в аккаунт, чтобы добавить товар в корзину');
        showLoginModal();
        return;
    }
    
    loadCart();
    
    let found = false;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].name === name) {
            cart[i].qty++;
            found = true;
            break;
        }
    }
    
    if (!found) {
        cart.push({ name: name, price: price, qty: 1 });
    }
    
    saveCart();
    if (typeof renderCart === 'function') renderCart();
    showToastWithButton(`"${name}" добавлена в корзину!`);
};

function showToastWithButton(message) {
    const old = document.querySelector('.cart-toast');
    if (old) old.remove();
    
    let toast = document.createElement("div");
    toast.className = "cart-toast";
    toast.innerHTML = `<span><i class="fas fa-check-circle me-2"></i>${message}</span><button onclick="window.location.href='cart.html'">Перейти <i class="fas fa-arrow-right ms-1"></i></button>`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 4000);
}

function showToast(msg) {
    let t = document.createElement("div");
    t.className = "cart-toast";
    t.innerHTML = `<span><i class="fas fa-info-circle me-2"></i>${msg}</span>`;
    t.style.background = "#642226";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
}

// ========== ДАННЫЕ КАРТИН ==========
const artworks = [
    { id: 1, name: "Городской пейзаж", author: "Анна Иванова", price: 15000, oldPrice: 18750, image: "img/1.jpg", size: "60x80 см", technique: "масло", material: "холст на подрамнике", year: 2024, style: "Импрессионизм", shortDesc: "Ночной город в огнях", desc: "Ночной город в огнях. Удивительная игра света и теней.", fullDesc: "Художница мастерски передала контраст между холодным синим небом и жёлтыми, оранжевыми оттенками городских огней.", category: "modern", rating: 4.8, reviews: ["Шедевр! Очень атмосферно", "Цвета живые"] },
    { id: 2, name: "Весеннее утро", author: "Михаил Петров", price: 22500, oldPrice: null, image: "img/8.jpg", size: "50x70 см", technique: "акрил", material: "холст на подрамнике", year: 2023, style: "Реализм", shortDesc: "Цветущие сады", desc: "Цветущие сады и свежесть весеннего утра.", fullDesc: "Михаил Петров — талантливый российский живописец.", category: "classic", rating: 4.9, reviews: ["Очень нежная работа", "Прекрасные оттенки"] },
    { id: 3, name: "Морской бриз", author: "Елена Соколова", price: 18900, oldPrice: 23625, image: "img/2.jpg", size: "70x90 см", technique: "масло", material: "холст на подрамнике", year: 2024, style: "Маринизм", shortDesc: "Свежий морской пейзаж", desc: "Морской пейзаж с легким бризом.", fullDesc: "Детали: масло, многослойное нанесение.", category: "modern", rating: 4.7, reviews: ["Как будто на море", "Очень реалистично"] },
    { id: 4, name: "Горный пейзаж", author: "Дмитрий Орлов", price: 27400, oldPrice: null, image: "img/7.jpg", size: "80x100 см", technique: "масло", material: "холст на подрамнике", year: 2023, style: "Реализм", shortDesc: "Величественные горы", desc: "Величественные горы, покрытые снегом.", fullDesc: "Величественные горы.", category: "classic", rating: 5.0, reviews: ["Великолепно!", "Лучшая картина"] },
    { id: 5, name: "Лунная ночь", author: "Вера Павлова", price: 32900, oldPrice: 41125, image: "img/6.jpg", size: "60x80 см", technique: "акрил", material: "холст на подрамнике", year: 2024, style: "Мистицизм", shortDesc: "Таинственная лунная ночь", desc: "Таинственная ночь с яркой луной.", fullDesc: "С люминесцентными красками — светится в темноте!", category: "modern", rating: 4.6, reviews: ["Очень атмосферно", "Магия ночи"] },
    { id: 6, name: "Золотая осень", author: "Константин Левин", price: 19800, oldPrice: null, image: "img/9.jpg", size: "65x85 см", technique: "масло", material: "холст на подрамнике", year: 2024, style: "Реализм", shortDesc: "Уютный осенний парк", desc: "Золотая листва, тёплые оттенки.", fullDesc: "Золотая осень — одна из самых любимых тем русских художников.", category: "classic", rating: 4.9, reviews: ["Потрясающая передача цвета!"] },
    { id: 7, name: "Абстрактный ритм", author: "Мария Ветрова", price: 12700, oldPrice: 15900, image: "img/10.jpg", size: "50x70 см", technique: "акрил", material: "холст на подрамнике", year: 2025, style: "Абстракционизм", shortDesc: "Яркая динамичная абстракция", desc: "Энергия, цвет и движение.", fullDesc: "Абстрактный ритм — взрыв эмоций.", category: "modern", rating: 4.7, reviews: ["Очень ярко и стильно"] },
    { id: 8, name: "Цветочный рай", author: "Мария Ветрова", price: 11700, oldPrice: null, image: "img/3.png", size: "50x70 см", technique: "живопись", material: "холст на подрамнике", year: 2025, style: "Абстракционизм", shortDesc: "Яркая динамичная абстракция", desc: "Энергия, цвет и движение.", fullDesc: "Абстрактный ритм — взрыв эмоций.", category: "modern", rating: 4.7, reviews: ["Очень ярко и стильно"] },
    { id: 9, name: "Дама с зонтиком", author: "Михаил Петров", price: 22500, oldPrice: null, image: "img/5.png", size: "50x70 см", technique: "акрил", material: "холст на подрамнике", year: 2023, style: "Реализм", shortDesc: "Цветущие сады", desc: "Цветущие сады и свежесть весеннего утра.", fullDesc: "Сюжет: цветущий сад ранним утром.", category: "classic", rating: 4.9, reviews: ["Очень нежная работа"] }
];

// ========== ФИЛЬТРЫ КАТАЛОГА ==========
let currentFilter = "all";
let currentSearch = "";
let currentSort = "default";

function renderCatalog() {
    const catalogList = document.getElementById("catalogList");
    if (!catalogList) return;

    let filtered = artworks.filter(p => currentFilter === "all" || p.category === currentFilter);
    
    if (currentSearch) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(currentSearch.toLowerCase()) || 
            p.author.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }
    
    if (currentSort === "price-asc") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === "price-desc") {
        filtered.sort((a, b) => b.price - a.price);
    } else {
        filtered.sort((a, b) => a.id - b.id);
    }

    let html = "";
    for (let art of filtered) {
        const stars = '<i class="fas fa-star"></i>'.repeat(Math.floor(art.rating));
        const oldPriceHtml = art.oldPrice ? `<span class="artwork-price-old">${art.oldPrice.toLocaleString()} ₽</span>` : "";
        html += `<div class="col-sm-6 col-lg-4"><div class="artwork-grid-card" onclick="showDetailPage(${JSON.stringify(art).replace(/"/g, '&quot;')})"><div class="artwork-image-area"><span class="artwork-badge">${art.category === "modern" ? '<i class="fas fa-palette me-1"></i>Совр.' : '<i class="fas fa-landmark me-1"></i>Классика'}</span><img src="${art.image}" alt="${art.name}" loading="lazy" onerror="this.src='https://placehold.co/400x300?text=Нет+изображения'"></div><div class="artwork-info-grid"><div class="artwork-title">${art.name}</div><div class="artwork-author"><i class="fas fa-user me-1"></i>${art.author}</div><div class="artwork-specs"><span><i class="fas fa-arrows-alt me-1"></i>${art.size}</span><span><i class="fas fa-paintbrush me-1"></i>${art.technique}</span></div><div class="artwork-desc-short">${art.shortDesc}</div><div class="artwork-rating">${stars} ${art.rating}</div><div class="artwork-price-row"><span class="artwork-price-new">${art.price.toLocaleString()} ₽ ${oldPriceHtml}</span><button class="btn-add-cart-grid" onclick="event.stopPropagation(); addToCart('${art.name}',${art.price})"><i class="fas fa-shopping-cart me-1"></i> В корзину</button></div></div></div></div>`;
    }
    catalogList.innerHTML = html;
}

window.backToCatalog = function() {
    const detailPage = document.getElementById("detail-page");
    const catalogPage = document.getElementById("catalog-page");
    if (detailPage) detailPage.classList.remove("active-page");
    if (catalogPage) catalogPage.classList.add("active-page");
    renderCatalog();
    window.scrollTo(0, 0);
};

window.showDetailPage = function(art) {
    const stars = '<i class="fas fa-star"></i>'.repeat(Math.floor(art.rating)) + '<i class="far fa-star"></i>'.repeat(5 - Math.floor(art.rating));
    const oldPriceHtml = art.oldPrice ? `<span class="old-price">${art.oldPrice.toLocaleString()} ₽</span>` : "";
    
    let reviewsHtml = "";
    for (let r of art.reviews) {
        reviewsHtml += `<div class="review-card"><div class="review-text"><i class="fas fa-quote-left me-2"></i>"${r}"</div></div>`;
    }

    const detailContent = document.getElementById("detailContent");
    if (detailContent) {
        detailContent.innerHTML = `
            <div class="bg-white p-4 rounded-4">
                <div class="row">
                    <div class="col-md-6 mb-3 mb-md-0">
                        <img src="${art.image}" alt="${art.name}" style="width:100%; border-radius:20px;" onerror="this.src='https://placehold.co/400x300?text=Нет+изображения'">
                    </div>
                    <div class="col-md-6">
                        <h2><i class="fas fa-painting me-2"></i>${art.name}</h2>
                        <p class="text-muted"><i class="fas fa-user me-1"></i>${art.author}</p>
                        <div class="rating-stars">${stars} ${art.rating}/5.0 (${art.reviews.length} отзыва)</div>
                        <div class="artwork-price-new" style="font-size:1.5rem; font-weight:800; margin:15px 0;">${art.price.toLocaleString()} ₽ ${oldPriceHtml}</div>
                        <ul class="specs-list">
                            <li><i class="fas fa-arrows-alt me-2"></i><strong>Размер:</strong> ${art.size}</li>
                            <li><i class="fas fa-palette me-2"></i><strong>Материал:</strong> ${art.material}</li>
                            <li><i class="fas fa-theater-masks me-2"></i><strong>Стиль:</strong> ${art.style}</li>
                            <li><i class="fas fa-paintbrush me-2"></i><strong>Техника:</strong> ${art.technique}</li>
                            <li><i class="fas fa-calendar me-2"></i><strong>Год:</strong> ${art.year}</li>
                        </ul>
                        <div class="desc-text"><strong>Краткое описание:</strong> ${art.desc}</div>
                        <details>
                            <summary><i class="fas fa-book-open me-2"></i>Читать полное описание...</summary>
                            <div>${art.fullDesc.replace(/\n/g, '<br>')}</div>
                        </details>
                        <button class="btn-primary-custom w-100 mt-3" onclick="addToCart('${art.name.replace(/'/g, "\\'")}',${art.price}); backToCatalog();"><i class="fas fa-shopping-cart me-2"></i>Купить сейчас</button>
                    </div>
                </div>
                <hr>
                <h5><i class="fas fa-star me-2"></i>Отзывы (${art.reviews.length})</h5>
                ${reviewsHtml}
                <div class="mt-3">
                    <textarea class="form-control" id="newReviewText" rows="2" placeholder="Напишите отзыв..."></textarea>
                    <button class="btn-outline-custom mt-2" onclick="addReviewToProduct(${art.id})"><i class="fas fa-paper-plane me-2"></i>Оставить отзыв</button>
                </div>
            </div>`;
    }

    const catalogPage = document.getElementById("catalog-page");
    const detailPage = document.getElementById("detail-page");
    if (catalogPage) catalogPage.classList.remove("active-page");
    if (detailPage) detailPage.classList.add("active-page");
    window.scrollTo(0, 0);
};

window.addReviewToProduct = function(id) {
    let text = document.getElementById("newReviewText")?.value.trim();
    if (!text) {
        showToast("Введите отзыв");
        return;
    }
    let art = artworks.find(a => a.id === id);
    if (art) {
        art.reviews.push(text);
        showToast("Спасибо за отзыв!");
        document.getElementById("newReviewText").value = "";
        showDetailPage(art);
    }
};

// ========== МОДАЛЬНОЕ ОКНО ЗАКАЗА ==========
function initOrderModal() {
    const modalElement = document.getElementById("orderModal");
    if (modalElement) {
        const checkoutBtn = document.getElementById("checkoutBtn");
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", () => {
                loadCart();
                if (cart.length === 0) {
                    showToast("Корзина пуста");
                    return;
                }
                
                if (!currentUser) {
                    alert('Войдите в аккаунт для оформления заказа');
                    showLoginModal();
                    return;
                }
                
                let total = 0;
                let itemsHtml = "";
                for (let i of cart) {
                    total += i.price * i.qty;
                    itemsHtml += `<span style="color: #642226; font-weight: 500;">${i.name}</span> x${i.qty}, `;
                }
                itemsHtml = itemsHtml.slice(0, -2);
                
                const orderSummary = document.getElementById("orderSummary");
                if (orderSummary) {
                    orderSummary.innerHTML = `<strong style="color: #642226;"><i class="fas fa-shopping-bag me-2"></i>Ваш заказ:</strong> ${itemsHtml}<br><strong style="color: #642226;"><i class="fas fa- ruble-sign me-2"></i>Итого: ${total.toLocaleString()} ₽</strong>`;
                }
                
                const phoneInput = document.getElementById("orderPhone");
                if (phoneInput && currentUser.phone) phoneInput.value = currentUser.phone;
                
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            });
        }
    }
}

const paymentRadios = document.querySelectorAll('input[name="paymentType"]');
if (paymentRadios.length) {
    for (let r of paymentRadios) {
        r.addEventListener("change", function() {
            const cardBlock = document.getElementById("cardDetailsBlock");
            if (cardBlock) {
                const checked = document.querySelector('input[name="paymentType"]:checked');
                cardBlock.style.display = checked && checked.value === "card" ? "block" : "none";
            }
        });
    }
}

const orderFormElem = document.getElementById("orderForm");
if (orderFormElem) {
    orderFormElem.addEventListener("submit", (e) => {
        e.preventDefault();
        
        let address = document.getElementById("orderAddress")?.value.trim();
        let phone = document.getElementById("orderPhone")?.value.trim();
        let dateTime = document.getElementById("orderDateTime")?.value;
        
        if (!address) {
            showToast("Заполните адрес");
            return;
        }
        if (!phone) {
            showToast("Заполните телефон");
            return;
        }
        if (!dateTime) {
            showToast("Выберите дату и время доставки");
            return;
        }
        
        let orders = JSON.parse(localStorage.getItem('artOrders') || '[]');
        const newOrder = {
            id: Date.now(),
            customerName: currentUser.name,
            customerEmail: currentUser.email,
            phone: phone,
            address: address,
            deliveryDate: dateTime,
            items: [...cart],
            total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
            status: 'new',
            date: new Date().toISOString(),
            userId: currentUser.id
        };
        orders.push(newOrder);
        localStorage.setItem('artOrders', JSON.stringify(orders));
        
        cart = [];
        saveCart();
        if (typeof renderCart === 'function') renderCart();
        
        showToast(`<i class="fas fa-check-circle me-2"></i>Заказ #${newOrder.id} оформлен! Доставка по адресу: ${address}`);
        
        const modalElement = document.getElementById("orderModal");
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        orderFormElem.reset();
        
        const cardBlock = document.getElementById("cardDetailsBlock");
        if (cardBlock) cardBlock.style.display = "none";
    });
}

// ========== ОБЩИЕ ФУНКЦИИ ==========

if (document.querySelector(".slider-swiper") && typeof Swiper !== 'undefined') {
    const swiperSlider = new Swiper(".slider-swiper", {
        spaceBetween: 30,
        slidesPerView: "auto",
        loop: true,
        speed: 6000,
        freeMode: true,
        allowTouchMove: false,
        autoplay: { delay: 0 },
    });
    const sliderContainer = document.querySelector(".slider-section");
    if (sliderContainer) {
        sliderContainer.addEventListener("mouseenter", () => swiperSlider.autoplay.stop());
        sliderContainer.addEventListener("mouseleave", () => swiperSlider.autoplay.start());
    }
}

document.querySelectorAll(".slider-swiper .favorite-icon").forEach((icon) => {
    icon.addEventListener("click", function (e) {
        e.stopPropagation();
        this.classList.toggle("active");
        this.classList.add("pulse");
        setTimeout(() => this.classList.remove("pulse"), 800);
    });
});

window.toggleFaq = function(header) {
    let body = header.nextElementSibling;
    if (body) {
        body.classList.toggle("open");
        let span = header.querySelector("span");
        if (span) span.innerHTML = body.classList.contains("open") ? "−" : "+";
    }
};

const feedbackFormElem = document.getElementById("feedbackFormMain");
if (feedbackFormElem) {
    feedbackFormElem.addEventListener("submit", (e) => {
        e.preventDefault();
        showToast("Спасибо! Мы свяжемся с вами.");
        e.target.reset();
    });
}

// ========== АДМИН-ПАНЕЛЬ ==========
if (document.querySelector('.admin-container')) {
    function checkAdminAccess() {
        const saved = localStorage.getItem('artCurrentUser');
        if (!saved) {
            window.location.href = 'index.html';
            return false;
        }
        const user = JSON.parse(saved);
        if (user.role !== 'admin') {
            alert('Доступ запрещён! Только для администратора.');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
    
    function loadArtworksAdmin() {
        const saved = localStorage.getItem('artworks');
        if (saved) return JSON.parse(saved);
        const defaultArtworks = [
            { id: 1, name: "Городской пейзаж", author: "Анна Иванова", price: 15000, image: "img/1.png", size: "60x80 см", technique: "масло", desc: "Ночной город в огнях", category: "modern" },
            { id: 2, name: "Весеннее утро", author: "Михаил Петров", price: 22500, image: "img/8.jpg", size: "50x70 см", technique: "акрил", desc: "Цветущие сады", category: "classic" },
            { id: 3, name: "Морской бриз", author: "Елена Соколова", price: 18900, image: "img/2.png", size: "70x90 см", technique: "масло", desc: "Свежий морской пейзаж", category: "modern" }
        ];
        localStorage.setItem('artworks', JSON.stringify(defaultArtworks));
        return defaultArtworks;
    }
    
    function saveArtworksAdmin(artworks) {
        localStorage.setItem('artworks', JSON.stringify(artworks));
    }
    
    function loadOrdersAdmin() {
        const saved = localStorage.getItem('artOrders');
        return saved ? JSON.parse(saved) : [];
    }
    
    function saveOrdersAdmin(orders) {
        localStorage.setItem('artOrders', JSON.stringify(orders));
    }
    
    function loadPromosAdmin() {
        const saved = localStorage.getItem('artPromos');
        if (saved) return JSON.parse(saved);
        const defaultPromos = [
            { id: 1, title: "Скидка 20% на всё!", desc: "При заказе от 5000 ₽", discount: 20 },
            { id: 2, title: "Бесплатная доставка", desc: "При заказе от 10000 ₽", discount: 0 }
        ];
        localStorage.setItem('artPromos', JSON.stringify(defaultPromos));
        return defaultPromos;
    }
    
    function savePromosAdmin(promos) {
        localStorage.setItem('artPromos', JSON.stringify(promos));
    }
    
    function renderDashboard() {
        const users = loadUsers();
        const artworks = loadArtworksAdmin();
        const orders = loadOrdersAdmin();
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        
        document.getElementById('statUsers').textContent = users.length;
        document.getElementById('statArtworks').textContent = artworks.length;
        document.getElementById('statOrders').textContent = orders.length;
        document.getElementById('statRevenue').textContent = totalRevenue.toLocaleString();
        
        const recent = orders.slice(-5).reverse();
        let html = '<table style="width:100%"><thead><tr><th><i class="fas fa-hashtag"></i> №</th><th><i class="fas fa-user"></i> Клиент</th><th><i class="fas fa- ruble-sign"></i> Сумма</th><th><i class="fas fa-info-circle"></i> Статус</th><th><i class="fas fa-calendar"></i> Дата</th></tr></thead><tbody>';
        recent.forEach(order => {
            html += `<tr><td>#${order.id}</td><td>${order.customerName || '-'}</td><td>${(order.total || 0).toLocaleString()} ₽</td><td><span class="status-badge status-${order.status}">${order.status || 'new'}</span></td><td>${order.date ? new Date(order.date).toLocaleDateString() : '-'}</td></tr>`;
        });
        html += '</tbody></table>';
        if (recent.length === 0) html = '<p class="text-muted"><i class="fas fa-inbox me-2"></i>Нет заказов</p>';
        document.getElementById('recentOrders').innerHTML = html;
    }
    
    function renderArtworksAdmin() {
        const artworks = loadArtworksAdmin();
        let html = '<table style="width:100%"><thead><tr><th>ID</th><th><i class="fas fa-image"></i> Изображение</th><th><i class="fas fa-palette"></i> Название</th><th><i class="fas fa-user"></i> Автор</th><th><i class="fas fa- ruble-sign"></i> Цена</th><th><i class="fas fa-cogs"></i> Действия</th></tr></thead><tbody>';
        artworks.forEach(art => {
            html += `<tr>
                <td>${art.id}</td>
                <td><img src="${art.image}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;" onerror="this.src='img/default-avatar.png'"></td>
                <td>${art.name}</td>
                <td>${art.author}</td>
                <td>${art.price.toLocaleString()} ₽</td>
                <td>
                    <button class="btn-icon btn-edit" onclick="editArtwork(${art.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete" onclick="deleteArtwork(${art.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        if (artworks.length === 0) html = '<p class="text-muted"><i class="fas fa-image me-2"></i>Нет картин. Добавьте первую!</p>';
        document.getElementById('artworksList').innerHTML = html;
    }
    
    function renderUsersAdmin() {
        const users = loadUsers();
        let html = '<table style="width:100%"><thead><tr><th>ID</th><th><i class="fas fa-user"></i> Имя</th><th><i class="fas fa-envelope"></i> Email</th><th><i class="fas fa-phone"></i> Телефон</th><th><i class="fas fa-user-tag"></i> Роль</th><th><i class="fas fa-cogs"></i> Действия</th></tr></thead><tbody>';
        users.forEach(user => {
            html += `<tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || '-'}</td>
                <td>${user.role === 'admin' ? '<i class="fas fa-crown me-1"></i>Админ' : '<i class="fas fa-user me-1"></i>Пользователь'}</td>
                <td>${user.role !== 'admin' ? `<button class="btn-icon btn-delete" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i></button>` : '-'}</td>
            </tr>`;
        });
        html += '</tbody></table>';
        document.getElementById('usersList').innerHTML = html;
    }
    
    function renderOrdersAdmin() {
        const orders = loadOrdersAdmin();
        let html = '<table style="width:100%"><thead><tr><th>№</th><th><i class="fas fa-user"></i> Клиент</th><th><i class="fas fa-phone"></i> Телефон</th><th><i class="fas fa-map-marker-alt"></i> Адрес</th><th><i class="fas fa-box"></i> Товаров</th><th><i class="fas fa- ruble-sign"></i> Сумма</th><th><i class="fas fa-info-circle"></i> Статус</th><th><i class="fas fa-cogs"></i> Действия</th></tr></thead><tbody>';
        orders.forEach(order => {
            const statusText = { 'new': 'Новый', 'processing': 'В обработке', 'shipped': 'Отправлен', 'delivered': 'Доставлен', 'cancelled': 'Отменён' }[order.status] || 'Новый';
            const statusIcon = { 'new': '🆕', 'processing': '⚙️', 'shipped': '🚚', 'delivered': '✅', 'cancelled': '❌' }[order.status] || '🆕';
            html += `<tr>
                <td>#${order.id}</td>
                <td>${order.customerName || '-'}</td>
                <td>${order.phone || '-'}</td>
                <td>${order.address || '-'}</td>
                <td>${order.items?.length || 0} шт</td>
                <td>${(order.total || 0).toLocaleString()} ₽</td>
                <td>${statusIcon} ${statusText}</td>
                <td><button class="btn-icon btn-edit" onclick="changeOrderStatus(${order.id}, '${order.status}')"><i class="fas fa-sync-alt"></i></button></td>
            </tr>`;
        });
        html += '</tbody></table>';
        if (orders.length === 0) html = '<p class="text-muted"><i class="fas fa-inbox me-2"></i>Нет заказов</p>';
        document.getElementById('ordersList').innerHTML = html;
    }
    
    function renderPromosAdmin() {
        const promos = loadPromosAdmin();
        let html = '<table style="width:100%"><thead><tr><th>ID</th><th><i class="fas fa-tag"></i> Название</th><th><i class="fas fa-align-left"></i> Описание</th><th><i class="fas fa-percent"></i> Скидка</th><th><i class="fas fa-cogs"></i> Действия</th></tr></thead><tbody>';
        promos.forEach(promo => {
            html += `<tr>
                <td>${promo.id}</td>
                <td>${promo.title}</td>
                <td>${promo.desc}</td>
                <td>${promo.discount > 0 ? promo.discount + '%' : '-'}</td>
                <td>
                    <button class="btn-icon btn-edit" onclick="editPromo(${promo.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete" onclick="deletePromo(${promo.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        if (promos.length === 0) html = '<p class="text-muted"><i class="fas fa-tags me-2"></i>Нет акций. Добавьте первую!</p>';
        document.getElementById('promosList').innerHTML = html;
    }
    
    window.openArtworkModal = function(artwork = null) {
        const modalElement = document.getElementById('artworkModal');
        if (artwork) {
            document.getElementById('artworkModalTitle').innerHTML = '<i class="fas fa-edit"></i> Редактировать картину';
            document.getElementById('artworkId').value = artwork.id;
            document.getElementById('artworkName').value = artwork.name;
            document.getElementById('artworkAuthor').value = artwork.author;
            document.getElementById('artworkPrice').value = artwork.price;
            document.getElementById('artworkImage').value = artwork.image;
            document.getElementById('artworkSize').value = artwork.size || '';
            document.getElementById('artworkTechnique').value = artwork.technique || '';
            document.getElementById('artworkDesc').value = artwork.desc || '';
            document.getElementById('artworkCategory').value = artwork.category || 'modern';
        } else {
            document.getElementById('artworkModalTitle').innerHTML = '<i class="fas fa-plus"></i> Добавить картину';
            document.getElementById('artworkForm').reset();
            document.getElementById('artworkId').value = '';
        }
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    };
    
    window.editArtwork = function(id) {
        const artworks = loadArtworksAdmin();
        const artwork = artworks.find(a => a.id === id);
        if (artwork) openArtworkModal(artwork);
    };
    
    window.deleteArtwork = function(id) {
        if (confirm('Удалить эту картину?')) {
            let artworks = loadArtworksAdmin();
            artworks = artworks.filter(a => a.id !== id);
            saveArtworksAdmin(artworks);
            renderArtworksAdmin();
            renderDashboard();
            showToast('Картина удалена');
        }
    };
    
    document.getElementById('artworkForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('artworkId').value;
        const artworks = loadArtworksAdmin();
        const artworkData = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('artworkName').value,
            author: document.getElementById('artworkAuthor').value,
            price: parseInt(document.getElementById('artworkPrice').value),
            image: document.getElementById('artworkImage').value,
            size: document.getElementById('artworkSize').value,
            technique: document.getElementById('artworkTechnique').value,
            desc: document.getElementById('artworkDesc').value,
            category: document.getElementById('artworkCategory').value
        };
        
        if (id) {
            const index = artworks.findIndex(a => a.id === parseInt(id));
            if (index !== -1) artworks[index] = artworkData;
        } else {
            artworks.push(artworkData);
        }
        saveArtworksAdmin(artworks);
        const modalElement = document.getElementById('artworkModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        renderArtworksAdmin();
        renderDashboard();
        showToast(id ? 'Картина обновлена' : 'Картина добавлена');
    });
    
    window.deleteUser = function(id) {
        if (confirm('Удалить пользователя?')) {
            let users = loadUsers();
            users = users.filter(u => u.id !== id);
            localStorage.setItem('artUsers', JSON.stringify(users));
            
            const current = localStorage.getItem('artCurrentUser');
            if (current) {
                const currUser = JSON.parse(current);
                if (currUser.id === id) {
                    localStorage.removeItem('artCurrentUser');
                    window.location.href = 'index.html';
                    return;
                }
            }
            renderUsersAdmin();
            renderDashboard();
            showToast('Пользователь удалён');
        }
    };
    
    let currentOrderId = null;
    
    window.changeOrderStatus = function(orderId, currentStatus) {
        currentOrderId = orderId;
        const select = document.getElementById('orderStatusSelect');
        select.value = currentStatus;
        const modalElement = document.getElementById('orderStatusModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    };
    
    window.updateOrderStatus = function() {
        const newStatus = document.getElementById('orderStatusSelect').value;
        let orders = loadOrdersAdmin();
        const index = orders.findIndex(o => o.id === currentOrderId);
        if (index !== -1) {
            orders[index].status = newStatus;
            saveOrdersAdmin(orders);
            renderOrdersAdmin();
            renderDashboard();
            showToast('Статус заказа обновлён');
        }
        const modalElement = document.getElementById('orderStatusModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
    };
    
    window.openPromoModal = function(promo = null) {
        const modalElement = document.getElementById('promoModal');
        if (promo) {
            document.getElementById('promoId').value = promo.id;
            document.getElementById('promoTitle').value = promo.title;
            document.getElementById('promoDesc').value = promo.desc;
            document.getElementById('promoDiscount').value = promo.discount;
        } else {
            document.getElementById('promoForm').reset();
            document.getElementById('promoId').value = '';
        }
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    };
    
    window.editPromo = function(id) {
        const promos = loadPromosAdmin();
        const promo = promos.find(p => p.id === id);
        if (promo) openPromoModal(promo);
    };
    
    window.deletePromo = function(id) {
        if (confirm('Удалить акцию?')) {
            let promos = loadPromosAdmin();
            promos = promos.filter(p => p.id !== id);
            savePromosAdmin(promos);
            renderPromosAdmin();
            showToast('Акция удалена');
        }
    };
    
    document.getElementById('promoForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('promoId').value;
        const promos = loadPromosAdmin();
        const promoData = {
            id: id ? parseInt(id) : Date.now(),
            title: document.getElementById('promoTitle').value,
            desc: document.getElementById('promoDesc').value,
            discount: parseInt(document.getElementById('promoDiscount').value) || 0
        };
        
        if (id) {
            const index = promos.findIndex(p => p.id === parseInt(id));
            if (index !== -1) promos[index] = promoData;
        } else {
            promos.push(promoData);
        }
        savePromosAdmin(promos);
        const modalElement = document.getElementById('promoModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        renderPromosAdmin();
        showToast(id ? 'Акция обновлена' : 'Акция добавлена');
    });
    
    function switchTab(tabId) {
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(`${tabId}-tab`).classList.add('active');
        document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`.admin-tab[data-tab="${tabId}"]`).classList.add('active');
        
        if (tabId === 'dashboard') renderDashboard();
        else if (tabId === 'artworks') renderArtworksAdmin();
        else if (tabId === 'users') renderUsersAdmin();
        else if (tabId === 'orders') renderOrdersAdmin();
        else if (tabId === 'promos') renderPromosAdmin();
    }
    
    if (checkAdminAccess()) {
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });
        renderDashboard();
    }
}

// ========== НОВОСТИ ==========
if (document.getElementById('newsGrid')) {
    const newsData = [
        { id: 1, title: "Открытие новой выставки «Вдохновение природой»", excerpt: "С 15 марта в нашей галерее стартует выставка пейзажей современных художников России.", fullText: "<p>С 15 марта по 15 апреля в ArtGallery пройдет выставка «Вдохновение природой», на которой будут представлены работы 25 современных художников.</p>", date: "2025-03-01", image: "img/news_4.jfif", category: "exhibition", views: 234, hot: true },
        { id: 2, title: "ArtGallery признана лучшим онлайн-маркетплейсом искусства 2025", excerpt: "Наш проект получил престижную премию в номинации «Лучшая цифровая платформа для искусства».", fullText: "<p>ArtGallery признана лучшим онлайн-маркетплейсом современного искусства.</p>", date: "2025-02-20", image: "img/news_1.jfif", category: "event", views: 567, hot: true },
        { id: 3, title: "Скидка 25% на все картины в честь весны", excerpt: "Только до 31 марта действует специальное весеннее предложение — скидка 25% на весь каталог!", fullText: "<p>В честь наступления весны ArtGallery дарит скидку 25% на все картины.</p>", date: "2025-03-05", image: "img/news_7.jfif", category: "promo", views: 892, hot: false },
        { id: 4, title: "В галерее появились работы 10 новых художников", excerpt: "Мы рады представить вам талантливых авторов из Санкт-Петербурга, Казани и Новосибирска.", fullText: "<p>Коллекция ArtGallery пополнилась работами 10 талантливых художников.</p>", date: "2025-02-10", image: "img/news_8.jfif", category: "artist", views: 345, hot: false },
        { id: 5, title: "Арт-завтрак с художником: встреча с Анной Ивановой", excerpt: "Приглашаем вас на неформальную встречу с основателем галереи.", fullText: "<p>25 марта в 11:00 пройдет «Арт-завтрак с художником».</p>", date: "2025-03-10", image: "img/news_6.jfif", category: "event", views: 178, hot: true },
        { id: 6, title: "Бесплатная доставка при заказе от 5000 ₽", excerpt: "По выходным бесплатная доставка при покупке от 5000 рублей.", fullText: "<p>Каждую субботу и воскресенье бесплатная доставка.</p>", date: "2025-03-12", image: "img/news_3.jfif", category: "promo", views: 612, hot: true }
    ];

    let currentCategory = "all";

    function loadNewsViews() {
        const saved = localStorage.getItem('artNewsViews');
        if (saved) {
            const views = JSON.parse(saved);
            newsData.forEach(news => { if (views[news.id]) news.views = views[news.id]; });
        }
    }

    function saveNewsView(newsId) {
        const views = JSON.parse(localStorage.getItem('artNewsViews') || '{}');
        views[newsId] = (views[newsId] || 0) + 1;
        localStorage.setItem('artNewsViews', JSON.stringify(views));
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    function renderNews() {
        const grid = document.getElementById('newsGrid');
        if (!grid) return;
        
        let filtered = currentCategory === "all" ? newsData : newsData.filter(n => n.category === currentCategory);
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filtered.length === 0) {
            grid.innerHTML = `<div class="col-12"><div class="empty-news"><i class="fas fa-newspaper" style="font-size: 48px; color: #8a8861;"></i><h3 class="mt-3">Новостей пока нет</h3><p>Попробуйте выбрать другую категорию</p></div></div>`;
            return;
        }
        
        let html = '';
        for (let news of filtered) {
            let badgeClass = news.hot ? 'hot' : (news.category === 'exhibition' ? 'exhibition' : (news.category === 'promo' ? 'promo' : (news.category === 'artist' ? 'artist' : 'event')));
            let badgeText = news.hot ? 'Горячая новость' : (news.category === 'exhibition' ? 'Выставка' : (news.category === 'promo' ? 'Акция' : (news.category === 'artist' ? 'Новый художник' : 'Событие')));
            let badgeIcon = news.hot ? '🔥' : (news.category === 'exhibition' ? '🎨' : (news.category === 'promo' ? '🎁' : (news.category === 'artist' ? '👨‍🎨' : '✨')));
            
            html += `<div class="col-md-6 col-lg-4"><div class="news-card" onclick="window.showNewsModal(${news.id})"><div class="news-image"><span class="news-badge ${badgeClass}">${badgeIcon} ${badgeText}</span><img src="${news.image}" alt="${news.title}" onerror="this.src='https://placehold.co/600x400/656f57/white?text=ArtGallery'"></div><div class="news-content"><div class="news-date"><i class="far fa-calendar-alt"></i> ${formatDate(news.date)}</div><h3 class="news-title">${news.title}</h3><p class="news-excerpt">${news.excerpt}</p><div class="news-meta"><span class="news-views"><i class="far fa-eye"></i> ${news.views} просмотров</span><span class="read-more-btn" onclick="event.stopPropagation(); window.showNewsModal(${news.id})">Читать далее <i class="fas fa-arrow-right"></i></span></div></div></div></div>`;
        }
        grid.innerHTML = html;
    }

    window.showNewsModal = function(newsId) {
        event.stopPropagation();
        const news = newsData.find(n => n.id === newsId);
        if (!news) return;
        news.views = (news.views || 0) + 1;
        saveNewsView(newsId);
        renderNews();
        document.getElementById('modalNewsImage').src = news.image;
        document.getElementById('modalNewsTitle').textContent = news.title;
        document.getElementById('modalNewsDate').innerHTML = `<i class="far fa-calendar-alt"></i> ${formatDate(news.date)} &nbsp;|&nbsp; <i class="far fa-eye"></i> ${news.views} просмотров`;
        document.getElementById('modalNewsFullText').innerHTML = news.fullText;
        const modal = new bootstrap.Modal(document.getElementById('newsModal'));
        modal.show();
    };

    function initFilters() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.category;
                renderNews();
            });
        });
    }

    loadNewsViews();
    renderNews();
    initFilters();
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    createTestUser();
    
    const saved = localStorage.getItem('artCurrentUser');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
        } catch(e) {}
    }
    updateUI();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', loginUser);
    
    const regForm = document.getElementById('regForm');
    if (regForm) regForm.addEventListener('submit', registerUser);
    
    const filterBadges = document.querySelectorAll(".filter-badge");
    if (filterBadges.length > 0) {
        for (let btn of filterBadges) {
            btn.addEventListener("click", function() {
                for (let b of filterBadges) b.classList.remove("active-filter");
                this.classList.add("active-filter");
                currentFilter = this.dataset.filter;
                renderCatalog();
            });
        }
    }
    
    const searchInputElem = document.getElementById("searchInput");
    if (searchInputElem) {
        searchInputElem.addEventListener("input", (e) => {
            currentSearch = e.target.value;
            renderCatalog();
        });
    }
    
    const sortSelectElem = document.getElementById("sortSelect");
    if (sortSelectElem) {
        sortSelectElem.addEventListener("change", (e) => {
            currentSort = e.target.value;
            renderCatalog();
        });
    }
    
    if (document.getElementById("catalogList")) renderCatalog();
    if (document.getElementById("cart-items-list")) renderCart();
    
    initOrderModal();
    loadCart();
    updateCartBadge();
    
    const offcanvasLinks = document.querySelectorAll('.offcanvas .nav-link, .offcanvas button');
    offcanvasLinks.forEach(link => {
        link.addEventListener('click', function() {
            const offcanvasElement = this.closest('.offcanvas');
            if (offcanvasElement && typeof bootstrap !== 'undefined') {
                const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if (offcanvas) offcanvas.hide();
            }
        });
    });
});

window.showToast = showToast;
window.closeAllModals = closeAllModals;
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.closeModal = closeModal;
window.artworksGlobal = artworks;