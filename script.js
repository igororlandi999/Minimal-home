// Configurações do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC8FEStQLy23yiMQCl6rWJpGC7ZpygwWa4",
    authDomain: "minimal-house.firebaseapp.com",
    projectId: "minimal-house",
    storageBucket: "minimal-house.firebasestorage.app",
    messagingSenderId: "755455177627",
    appId: "1:755455177627:web:e6d50839925ff244b7e73e",
    measurementId: "G-ZBC45Y33Y4"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Elementos do DOM para autenticação
const loginModal = document.getElementById('loginModal');
const resetPasswordModal = document.getElementById('resetPasswordModal');
const loginBtn = document.getElementById('loginBtn');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const closeBtns = document.querySelectorAll('.close-modal');
const userMenu = document.getElementById('userMenu');
const userEmail = document.getElementById('userEmail');
const authMessage = document.getElementById('authMessage');
const resetMessage = document.getElementById('resetMessage');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const resetEmailInput = document.getElementById('resetEmail');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const resetButton = document.getElementById('resetButton');
const backToLoginButton = document.getElementById('backToLoginButton');
const menuToggle = document.getElementById('menuToggle');
const header = document.querySelector('header');

// Adicionar evento de clique para o botão de menu
menuToggle.addEventListener('click', function() {
    header.classList.toggle('menu-active');
});

// =================================
// GERENCIAMENTO DE AUTENTICAÇÃO
// =================================

// Controle dos Modais
loginBtn.onclick = function(e) {
    e.preventDefault();
    openModal(loginModal);
}

forgotPasswordLink.onclick = function(e) {
    e.preventDefault();
    closeModal(loginModal);
    setTimeout(() => {
        openModal(resetPasswordModal);
    }, 300);
}

backToLoginButton.onclick = function() {
    closeModal(resetPasswordModal);
    setTimeout(() => {
        openModal(loginModal);
    }, 300);
}

// Adiciona evento de fechar para todos os botões de fechar
closeBtns.forEach(btn => {
    btn.onclick = function() {
        const modalToClose = this.closest('.modal');
        closeModal(modalToClose);
    }
});

window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target);
    }
});

function openModal(modal) {
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        if (modal === loginModal) {
            resetForm('authForm', authMessage);
        } else if (modal === resetPasswordModal) {
            resetForm('resetForm', resetMessage);
        }
    }, 300);
}

function resetForm(formId, messageElement) {
    document.getElementById(formId).reset();
    messageElement.className = '';
    messageElement.textContent = '';
    
    // Resetar campos de login
    if (formId === 'authForm') {
        emailInput.style.borderColor = '#e1e1e1';
        passwordInput.style.borderColor = '#e1e1e1';
        document.getElementById('emailError').style.display = 'none';
        document.getElementById('passwordError').style.display = 'none';
    }
    
    // Resetar campos de redefinição de senha
    if (formId === 'resetForm') {
        resetEmailInput.style.borderColor = '#e1e1e1';
        document.getElementById('resetEmailError').style.display = 'none';
    }
}

function validateForm(formType = 'login') {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formType === 'login' || formType === 'register') {
        if (!emailRegex.test(emailInput.value)) {
            document.getElementById('emailError').textContent = 'Email inválido';
            document.getElementById('emailError').style.display = 'block';
            emailInput.style.borderColor = '#e74c3c';
            isValid = false;
        }

        if (passwordInput.value.length < 6) {
            document.getElementById('passwordError').textContent = 'Senha deve ter no mínimo 6 caracteres';
            document.getElementById('passwordError').style.display = 'block';
            passwordInput.style.borderColor = '#e74c3c';
            isValid = false;
        }
    } else if (formType === 'reset') {
        if (!emailRegex.test(resetEmailInput.value)) {
            document.getElementById('resetEmailError').textContent = 'Email inválido';
            document.getElementById('resetEmailError').style.display = 'block';
            resetEmailInput.style.borderColor = '#e74c3c';
            isValid = false;
        }
    }

    return isValid;
}

function showMessage(message, type, messageElement = authMessage) {
    messageElement.textContent = message;
    messageElement.className = type;
}

async function login() {
    if (!validateForm('login')) return;
    
    try {
        const result = await auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value);
        showMessage('Login realizado com sucesso!', 'success');
        setTimeout(() => {
            closeModal(loginModal);
            showUserMenu(result.user);
        }, 1000);
    } catch (error) {
        showMessage(getErrorMessage(error.code), 'error');
    }
}

async function register() {
    if (!validateForm('register')) return;
    
    try {
        const result = await auth.createUserWithEmailAndPassword(emailInput.value, passwordInput.value);
        showMessage('Conta criada com sucesso!', 'success');
        setTimeout(() => {
            closeModal(loginModal);
            showUserMenu(result.user);
        }, 1000);
    } catch (error) {
        showMessage(getErrorMessage(error.code), 'error');
    }
}

async function sendPasswordReset() {
    if (!validateForm('reset')) return;
    
    try {
        await auth.sendPasswordResetEmail(resetEmailInput.value);
        showMessage('Link de redefinição enviado! Verifique seu email.', 'success', resetMessage);
        
        // Desabilitar botão para evitar múltiplos envios
        resetButton.disabled = true;
        setTimeout(() => {
            resetButton.disabled = false;
            closeModal(resetPasswordModal);
        }, 3000);
    } catch (error) {
        showMessage(getErrorMessage(error.code), 'error', resetMessage);
    }
}

function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'Este email já está em uso';
        case 'auth/invalid-email':
            return 'Email inválido';
        case 'auth/weak-password':
            return 'Senha muito fraca';
        case 'auth/user-not-found':
            return 'Usuário não encontrado';
        case 'auth/wrong-password':
            return 'Senha incorreta';
        case 'auth/too-many-requests':
            return 'Muitas tentativas. Tente novamente mais tarde';
        case 'auth/user-disabled':
            return 'Esta conta foi desativada';
        default:
            return 'Erro ao realizar a operação';
    }
}

function showUserMenu(user) {
    loginBtn.style.display = 'none';
    userMenu.style.display = 'block';
    userEmail.textContent = user.email;
}

function logout() {
    auth.signOut().then(() => {
        userMenu.style.display = 'none';
        loginBtn.style.display = 'block';
    });
}

// Validação em tempo real
emailInput.addEventListener('input', function() {
    this.style.borderColor = '#e1e1e1';
    document.getElementById('emailError').style.display = 'none';
});

passwordInput.addEventListener('input', function() {
    this.style.borderColor = '#e1e1e1';
    document.getElementById('passwordError').style.display = 'none';
});

resetEmailInput.addEventListener('input', function() {
    this.style.borderColor = '#e1e1e1';
    document.getElementById('resetEmailError').style.display = 'none';
});

// Observer de autenticação
auth.onAuthStateChanged((user) => {
    if (user) {
        showUserMenu(user);
    } else {
        userMenu.style.display = 'none';
        loginBtn.style.display = 'block';
    }
});

// =================================
// GERENCIAMENTO DE PRODUTOS
// =================================

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM para o modal de produto
    const productModal = document.getElementById('productModal');
    const modalProductName = document.getElementById('modalProductName');
    const modalProductDescription = document.getElementById('modalProductDescription');
    const modalProductPrice = document.getElementById('modalProductPrice');
    const modalProductImage = document.querySelector('.product-modal-image');
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    
    // Botões de produto
    const productButtons = document.querySelectorAll('.product-button');
    
    // Abrir modal ao clicar em "Ver Detalhes"
    productButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Obtendo informações do produto
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productDesc = productCard.querySelector('.product-description').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            const productImageStyle = productCard.querySelector('.product-image').style.backgroundImage;
            
            // Preenchendo o modal com as informações do produto
            modalProductName.textContent = productName;
            modalProductDescription.textContent = productDesc;
            modalProductPrice.textContent = productPrice;
            modalProductImage.style.backgroundImage = productImageStyle;
            
            // Resetando quantidade
            quantityInput.value = 1;
            
            // Exibindo o modal
            openModal(productModal);
        });
    });
    
    // Controle de quantidade
    minusBtn.addEventListener('click', function() {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
    });
    
    // Validar entrada direta de quantidade
    quantityInput.addEventListener('change', function() {
        if (this.value < 1) {
            this.value = 1;
        }
    });
});

// =================================
// GERENCIAMENTO DO CARRINHO
// =================================

const cartManager = (() => {
    // Estado do carrinho
    let cart = [];
    
    // Elementos DOM
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCountElement = document.querySelector('.cart-count');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Inicialização
    function init() {
        // Carregar carrinho do localStorage, se existir
        loadCart();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Atualizar a UI do carrinho
        updateCartUI();
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Abrir carrinho
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openCart();
        });
        
        // Fechar carrinho (botão X)
        closeCartBtn.addEventListener('click', closeCart);
        
        // Fechar carrinho (clique no overlay)
        cartOverlay.addEventListener('click', closeCart);
        
        // Checkout button
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                alert('Redirecionando para checkout...');
                // Aqui você implementaria a lógica de checkout
            }
        });
        
        // Adicionar evento para o botão "Adicionar ao Carrinho" na modal de produto
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                const modalProductName = document.getElementById('modalProductName').textContent;
                const modalProductPrice = document.getElementById('modalProductPrice').textContent;
                const modalProductImage = document.querySelector('.product-modal-image').style.backgroundImage;
                const quantity = parseInt(document.getElementById('quantity').value);
                
                // Extrair o valor numérico do preço (remover "R$ " e converter vírgula para ponto)
                const priceText = modalProductPrice.replace('R$ ', '').replace('.', '').replace(',', '.');
                const price = parseFloat(priceText);
                
                addToCart({
                    id: generateProductId(modalProductName),
                    name: modalProductName,
                    price: price,
                    image: modalProductImage,
                    quantity: quantity
                });
                
                // Fechar o modal de produto
                const productModal = document.getElementById('productModal');
                if (productModal) {
                    closeModal(productModal);
                }
                
                // Abrir o carrinho
                openCart();
            });
        }
    }
    
    // Gerar ID para o produto baseado no nome
    function generateProductId(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
    
    // Adicionar produto ao carrinho
    function addToCart(product) {
        // Verificar se o produto já está no carrinho
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingProductIndex >= 0) {
            // Se o produto já existe, apenas atualizar a quantidade
            cart[existingProductIndex].quantity += product.quantity;
        } else {
            // Se é um novo produto, adicionar ao carrinho
            cart.push(product);
        }
        
        // Salvar no localStorage e atualizar UI
        saveCart();
        updateCartUI();
    }
    
    // Remover produto do carrinho
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartUI();
    }
    
    // Atualizar quantidade de um produto
    function updateQuantity(productId, newQuantity) {
        const productIndex = cart.findIndex(item => item.id === productId);
        
        if (productIndex >= 0) {
            // Atualizar a quantidade
            if (newQuantity > 0) {
                cart[productIndex].quantity = newQuantity;
            } else {
                // Se a quantidade for 0 ou negativa, remover o produto
                removeFromCart(productId);
            }
            
            // Salvar e atualizar UI
            saveCart();
            updateCartUI();
        }
    }
    
    // Calcular o total do carrinho
    function calculateTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    // Formatar preço para exibição
    function formatPrice(price) {
        return 'R$ ' + price.toFixed(2).replace('.', ',');
    }
    
    // Abrir o carrinho
    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Impede o scroll da página
    }
    
    // Fechar o carrinho
    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restaura o scroll da página
    }
    
    // Atualizar a UI do carrinho
    function updateCartUI() {
        // Atualizar contador de itens
        cartCountElement.textContent = cart.reduce((count, item) => count + item.quantity, 0);
        
        // Atualizar o valor total
        cartTotalElement.textContent = formatPrice(calculateTotal());
        
        // Habilitar/desabilitar botão de checkout
        checkoutBtn.disabled = cart.length === 0;
        
        // Atualizar lista de itens
        renderCartItems();
    }
    
    // Renderizar itens do carrinho
    function renderCartItems() {
        // Limpar o container
        cartItemsContainer.innerHTML = '';
        
        // Se o carrinho estiver vazio, mostrar mensagem
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Seu carrinho está vazio</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <a href="#products" class="shop-now-btn">Ver produtos</a>
                </div>
            `;
            return;
        }
        
        // Renderizar cada item do carrinho
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-image" style="${item.image}"></div>
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                    <div class="cart-item-actions">
                        <div class="cart-quantity">
                            <button class="cart-quantity-btn minus" data-id="${item.id}">-</button>
                            <span class="cart-quantity-value">${item.quantity}</span>
                            <button class="cart-quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-from-cart" data-id="${item.id}">Remover</button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        // Adicionar event listeners para os botões de quantidade e remover
        const minusBtns = cartItemsContainer.querySelectorAll('.cart-quantity-btn.minus');
        const plusBtns = cartItemsContainer.querySelectorAll('.cart-quantity-btn.plus');
        const removeBtns = cartItemsContainer.querySelectorAll('.remove-from-cart');
        
        minusBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                const currentItem = cart.find(item => item.id === productId);
                if (currentItem) {
                    updateQuantity(productId, currentItem.quantity - 1);
                }
            });
        });
        
        plusBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                const currentItem = cart.find(item => item.id === productId);
                if (currentItem) {
                    updateQuantity(productId, currentItem.quantity + 1);
                }
            });
        });
        
        removeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                removeFromCart(productId);
            });
        });
    }
    
    // Salvar o carrinho no localStorage
    function saveCart() {
        localStorage.setItem('minimalHomeCart', JSON.stringify(cart));
    }
    
    // Carregar o carrinho do localStorage
    function loadCart() {
        const savedCart = localStorage.getItem('minimalHomeCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    }
    
    // API pública
    return {
        init,
        addToCart,
        removeFromCart,
        updateQuantity,
        openCart,
        closeCart
    };
})();

// =================================
// CARROSSEL DE BANNERS
// =================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar o carrinho
    cartManager.init();
    
    // Carrossel de Banners
    const carouselSlide = document.querySelector('.carousel-slide');
    const carouselDots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.querySelector('.carousel-arrow.prev');
    const nextBtn = document.querySelector('.carousel-arrow.next');
    let counter = 0;
    const size = 33.33; // Cada slide ocupa 33.33% da largura

    // Definir posição inicial
    carouselSlide.style.transform = 'translateX(0)';

    // Botões de navegação
    nextBtn.addEventListener('click', () => {
        if (counter >= 2) return; // Impedir navegação além do último slide
        counter++;
        carouselSlide.style.transform = `translateX(-${counter * size}%)`;
        updateDots();
    });

    prevBtn.addEventListener('click', () => {
        if (counter <= 0) return; // Impedir navegação antes do primeiro slide
        counter--;
        carouselSlide.style.transform = `translateX(-${counter * size}%)`;
        updateDots();
    });

    // Navegação por pontos
    carouselDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            counter = index;
            carouselSlide.style.transform = `translateX(-${counter * size}%)`;
            updateDots();
        });
    });

    // Atualizar indicadores visuais
    function updateDots() {
        carouselDots.forEach((dot, index) => {
            if (index === counter) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Rotação automática do carrossel
    function autoSlide() {
        counter = (counter < 2) ? counter + 1 : 0;
        carouselSlide.style.transform = `translateX(-${counter * size}%)`;
        updateDots();
    }

    // Iniciar rotação automática com intervalo de 5 segundos
    let slideInterval = setInterval(autoSlide, 5000);

    // Pausar rotação ao passar o mouse
    document.querySelector('.carousel-container').addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    // Retomar rotação ao remover o mouse
    document.querySelector('.carousel-container').addEventListener('mouseleave', () => {
        slideInterval = setInterval(autoSlide, 5000);
    });
});