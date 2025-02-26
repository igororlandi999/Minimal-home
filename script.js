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

// Elementos do DOM
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

// Controle dos Modais
loginBtn.onclick = function() {
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

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target);
    }
}

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

// Substitua o código de produtos que adicionamos anteriormente por este código completo

// Gerenciamento de produtos
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
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const closeProductModal = productModal.querySelector('.close-modal');
    
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
    
    // Fechar modal
    closeProductModal.addEventListener('click', function() {
        closeModal(productModal);
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target === productModal) {
            closeModal(productModal);
        }
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
    
    // Adicionar ao carrinho (placeholder para funcionalidade futura)
    addToCartBtn.addEventListener('click', function() {
        const product = {
            name: modalProductName.textContent,
            price: modalProductPrice.textContent,
            quantity: parseInt(quantityInput.value)
        };
        
        // Aqui você implementaria a lógica do carrinho
        // Por enquanto, exibiremos apenas um alerta
        alert(`${product.quantity}x ${product.name} adicionado ao carrinho!`);
        
        // Fechar o modal após adicionar ao carrinho
        closeModal(productModal);
    });
    
    // Funções auxiliares para abrir/fechar o modal
    function openModal(modal) {
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('active'), 10);
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
});