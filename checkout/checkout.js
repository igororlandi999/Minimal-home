

document.addEventListener('DOMContentLoaded', function() {
    // Checkout Manager
    const checkoutManager = (() => {
        // Variables
        const cart = getCartFromLocalStorage();
        let currentStep = 1;
        let shippingPrice = 15.9; // Default to standard shipping
        let orderDetails = {};
        
        // DOM Elements
        const progressSteps = document.querySelectorAll('.progress-step');
        const progressLines = document.querySelectorAll('.progress-line');
        const formSteps = document.querySelectorAll('.checkout-step');
        const nextBtns = document.querySelectorAll('.next-step');
        const prevBtns = document.querySelectorAll('.prev-step');
        const paymentTabs = document.querySelectorAll('.payment-tab');
        const paymentForms = document.querySelectorAll('.payment-form');
        const shippingOptions = document.querySelectorAll('input[name="shipping"]');
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        
        // Form Elements
        const fullNameInput = document.getElementById('fullName');
        const addressInput = document.getElementById('address');
        const cityInput = document.getElementById('city');
        const stateInput = document.getElementById('state');
        const postalCodeInput = document.getElementById('postalCode');
        const phoneInput = document.getElementById('phone');
        const cardNumberInput = document.getElementById('cardNumber');
        const cardNameInput = document.getElementById('cardName');
        const cardExpiryInput = document.getElementById('cardExpiry');
        const cardCVVInput = document.getElementById('cardCVV');
        const cpfInput = document.getElementById('cpf');
        
        // Initialize checkout
        function init() {
            // If cart is empty, redirect to products page
            if (!cart || cart.length === 0) {
                window.location.href = '../index.html#products';
                return;
            }
            
            // Show step 1
            updateStep(1);
            
            // Render order summary
            renderOrderSummary();
            renderOrderSidebar();
            updateTotals();
            
            // Setup event listeners
            setupEventListeners();
            
            // Format input fields
            setupInputFormatting();
        }
        
        // Get cart from localStorage
        function getCartFromLocalStorage() {
            const savedCart = localStorage.getItem('minimalHomeCart');
            return savedCart ? JSON.parse(savedCart) : [];
        }
        
        // Setup event listeners
        function setupEventListeners() {
            // Next and Previous buttons
            nextBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const nextStep = parseInt(this.dataset.next);
                    
                    // Validate current step before proceeding
                    if (validateStep(currentStep)) {
                        updateStep(nextStep);
                        
                        // If final step, process order
                        if (nextStep === 4) {
                            processOrder();
                        }
                    }
                });
            });
            
            prevBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const prevStep = parseInt(this.dataset.prev);
                    updateStep(prevStep);
                });
            });
            
            // Payment method tabs
            paymentTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const method = this.dataset.method;
                    switchPaymentMethod(method);
                });
            });
            
            // Shipping options
            shippingOptions.forEach(option => {
                option.addEventListener('change', function() {
                    shippingPrice = this.value === 'express' ? 29.9 : 15.9;
                    updateTotals();
                });
            });
        }
        
        // Setup input formatting
        function setupInputFormatting() {
            // Format postal code (CEP)
            if (postalCodeInput) {
                postalCodeInput.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 5) {
                        value = value.substring(0, 5) + '-' + value.substring(5, 8);
                    }
                    e.target.value = value;
                });
            }
            
            // Format phone number
            if (phoneInput) {
                phoneInput.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 0) {
                        value = '(' + value;
                        if (value.length > 3) {
                            value = value.substring(0, 3) + ') ' + value.substring(3, 13);
                            if (value.length > 10) {
                                value = value.substring(0, 10) + '-' + value.substring(10, 15);
                            }
                        }
                    }
                    e.target.value = value;
                });
            }
            
            // Format credit card number
            if (cardNumberInput) {
                cardNumberInput.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    let formattedValue = '';
                    for (let i = 0; i < value.length; i++) {
                        if (i > 0 && i % 4 === 0) {
                            formattedValue += ' ';
                        }
                        formattedValue += value[i];
                    }
                    e.target.value = formattedValue;
                });
            }
            
            // Format expiry date (MM/YY)
            if (cardExpiryInput) {
                cardExpiryInput.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 0) {
                        if (value.length > 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                        }
                    }
                    e.target.value = value;
                });
            }
            
            // Format CPF
            if (cpfInput) {
                cpfInput.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 0) {
                        if (value.length > 3) {
                            value = value.substring(0, 3) + '.' + value.substring(3);
                        }
                        if (value.length > 7) {
                            value = value.substring(0, 7) + '.' + value.substring(7);
                        }
                        if (value.length > 11) {
                            value = value.substring(0, 11) + '-' + value.substring(11, 13);
                        }
                    }
                    e.target.value = value;
                });
            }
        }
        
        // Update step
        function updateStep(step) {
            // Update current step
            currentStep = step;
            
            // Update progress indicators
            progressSteps.forEach((stepEl, index) => {
                const stepNum = index + 1;
                
                if (stepNum < currentStep) {
                    stepEl.classList.add('completed');
                    stepEl.classList.remove('active');
                } else if (stepNum === currentStep) {
                    stepEl.classList.add('active');
                    stepEl.classList.remove('completed');
                } else {
                    stepEl.classList.remove('active', 'completed');
                }
            });
            
            // Update progress lines
            progressLines.forEach((line, index) => {
                if (index + 2 <= currentStep) {
                    line.classList.add('active');
                } else {
                    line.classList.remove('active');
                }
            });
            
            // Show current step form
            formSteps.forEach((step, index) => {
                if (index + 1 === currentStep) {
                    step.style.display = 'block';
                } else {
                    step.style.display = 'none';
                }
            });
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Switch payment method
        function switchPaymentMethod(method) {
            // Update tabs
            paymentTabs.forEach(tab => {
                if (tab.dataset.method === method) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
            // Show active form
            paymentForms.forEach(form => {
                if (form.id === `${method}Form`) {
                    form.style.display = 'block';
                } else {
                    form.style.display = 'none';
                }
            });
        }
        
        // Validate step
        function validateStep(step) {
            let isValid = true;
            
            if (step === 2) {
                // Validate shipping info
                isValid = validateShippingInfo();
            } else if (step === 3) {
                // Validate payment info based on selected method
                const activeTab = document.querySelector('.payment-tab.active');
                const method = activeTab ? activeTab.dataset.method : 'creditCard';
                
                if (method === 'creditCard') {
                    isValid = validateCreditCardInfo();
                } else if (method === 'boleto') {
                    isValid = validateBoletoInfo();
                } else if (method === 'pix') {
                    isValid = true; // No validation required for PIX
                }
            }
            
            return isValid;
        }
        
        // Validate shipping info
        function validateShippingInfo() {
            let isValid = true;
            const requiredFields = [
                { input: fullNameInput, error: 'fullNameError', message: 'Nome é obrigatório' },
                { input: addressInput, error: 'addressError', message: 'Endereço é obrigatório' },
                { input: cityInput, error: 'cityError', message: 'Cidade é obrigatória' },
                { input: stateInput, error: 'stateError', message: 'Estado é obrigatório' },
                { input: postalCodeInput, error: 'postalCodeError', message: 'CEP é obrigatório' },
                { input: phoneInput, error: 'phoneError', message: 'Telefone é obrigatório' }
            ];
            
            // Check required fields
            requiredFields.forEach(field => {
                const errorElement = document.getElementById(field.error);
                if (!field.input || !errorElement) return;
                
                if (!field.input.value.trim()) {
                    errorElement.textContent = field.message;
                    errorElement.style.display = 'block';
                    field.input.style.borderColor = 'var(--error-color)';
                    isValid = false;
                } else {
                    errorElement.style.display = 'none';
                    field.input.style.borderColor = 'var(--border-color)';
                }
            });
            
            // Validate CEP format
            if (postalCodeInput && postalCodeInput.value.trim() && !postalCodeInput.value.match(/^\d{5}-\d{3}$/)) {
                const errorElement = document.getElementById('postalCodeError');
                if (errorElement) {
                    errorElement.textContent = 'CEP inválido (formato: 00000-000)';
                    errorElement.style.display = 'block';
                    postalCodeInput.style.borderColor = 'var(--error-color)';
                    isValid = false;
                }
            }
            
            // Validate phone format
            if (phoneInput && phoneInput.value.trim() && !phoneInput.value.match(/^\(\d{2}\) \d{5}-\d{4}$/)) {
                const errorElement = document.getElementById('phoneError');
                if (errorElement) {
                    errorElement.textContent = 'Telefone inválido (formato: (99) 99999-9999)';
                    errorElement.style.display = 'block';
                    phoneInput.style.borderColor = 'var(--error-color)';
                    isValid = false;
                }
            }
            
            return isValid;
        }
        
        // Validate credit card info
        function validateCreditCardInfo() {
            let isValid = true;
            const requiredFields = [
                { input: cardNumberInput, error: 'cardNumberError', message: 'Número do cartão é obrigatório' },
                { input: cardNameInput, error: 'cardNameError', message: 'Nome no cartão é obrigatório' },
                { input: cardExpiryInput, error: 'cardExpiryError', message: 'Data de validade é obrigatória' },
                { input: cardCVVInput, error: 'cardCVVError', message: 'CVV é obrigatório' }
            ];
            
            // Check required fields
            requiredFields.forEach(field => {
                const errorElement = document.getElementById(field.error);
                if (!field.input || !errorElement) return;
                
                if (!field.input.value.trim()) {
                    errorElement.textContent = field.message;
                    errorElement.style.display = 'block';
                    field.input.style.borderColor = 'var(--error-color)';
                    isValid = false;
                } else {
                    errorElement.style.display = 'none';
                    field.input.style.borderColor = 'var(--border-color)';
                }
            });
            
            // Validate card number format
            if (cardNumberInput && cardNumberInput.value.trim() && cardNumberInput.value.replace(/\s/g, '').length < 16) {
                const errorElement = document.getElementById('cardNumberError');
                if (errorElement) {
                    errorElement.textContent = 'Número do cartão inválido';
                    errorElement.style.display = 'block';
                    cardNumberInput.style.borderColor = 'var(--error-color)';
                    isValid = false;
                }
            }
            
            // Validate expiry date format
            if (cardExpiryInput && cardExpiryInput.value.trim() && !cardExpiryInput.value.match(/^\d{2}\/\d{2}$/)) {
                const errorElement = document.getElementById('cardExpiryError');
                if (errorElement) {
                    errorElement.textContent = 'Data inválida (formato: MM/AA)';
                    errorElement.style.display = 'block';
                    cardExpiryInput.style.borderColor = 'var(--error-color)';
                    isValid = false;
                }
            }
            
            // Validate CVV format
            if (cardCVVInput && cardCVVInput.value.trim() && (cardCVVInput.value.length < 3 || cardCVVInput.value.length > 4)) {
                const errorElement = document.getElementById('cardCVVError');
                if (errorElement) {
                    errorElement.textContent = 'CVV inválido';
                    errorElement.style.display = 'block';
                    cardCVVInput.style.borderColor = 'var(--error-color)';
                    isValid = false;
                }
            }
            
            return isValid;
        }
        
        // Validate boleto info
        function validateBoletoInfo() {
            let isValid = true;
            
            // Validate CPF
            if (cpfInput) {
                const errorElement = document.getElementById('cpfError');
                if (!errorElement) return isValid;
                
                if (!cpfInput.value.trim()) {
                    errorElement.textContent = 'CPF é obrigatório';
                    errorElement.style.display = 'block';
                    cpfInput.style.borderColor = 'var(--error-color)';
                    isValid = false;
                } else if (!cpfInput.value.match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
                    errorElement.textContent = 'CPF inválido (formato: 000.000.000-00)';
                    errorElement.style.display = 'block';
                    cpfInput.style.borderColor = 'var(--error-color)';
                    isValid = false;
                } else {
                    errorElement.style.display = 'none';
                    cpfInput.style.borderColor = 'var(--border-color)';
                }
            }
            
            return isValid;
        }
        
        // Process order
        function processOrder() {
            // Get payment method
            const activeTab = document.querySelector('.payment-tab.active');
            const paymentMethod = activeTab ? activeTab.dataset.method : 'creditCard';
            
            // Generate order details
            orderDetails = {
                orderId: generateOrderId(),
                orderDate: new Date().toLocaleDateString('pt-BR'),
                items: cart,
                customer: {
                    name: fullNameInput ? fullNameInput.value : '',
                    address: addressInput ? addressInput.value : '',
                    city: cityInput ? cityInput.value : '',
                    state: stateInput ? stateInput.value : '',
                    postalCode: postalCodeInput ? postalCodeInput.value : '',
                    phone: phoneInput ? phoneInput.value : ''
                },
                shipping: {
                    method: document.querySelector('input[name="shipping"]:checked')?.value || 'standard',
                    price: shippingPrice
                },
                payment: {
                    method: paymentMethod,
                    details: getPaymentDetails(paymentMethod)
                },
                totals: {
                    subtotal: calculateSubtotal(),
                    shipping: shippingPrice,
                    total: calculateTotal()
                }
            };
            
            // Display order confirmation
            displayOrderConfirmation();
            
            // Clear cart
            localStorage.removeItem('minimalHomeCart');
        }
        
        // Generate order ID
        function generateOrderId() {
            const timestamp = new Date().getTime().toString().slice(-6);
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            return `#MH${timestamp}${random}`;
        }
        
        // Get payment details based on method
        function getPaymentDetails(method) {
            if (method === 'creditCard') {
                return {
                    cardNumber: cardNumberInput ? maskCardNumber(cardNumberInput.value) : '',
                    cardName: cardNameInput ? cardNameInput.value : '',
                    cardExpiry: cardExpiryInput ? cardExpiryInput.value : '',
                    installments: document.getElementById('installments')?.value || '1'
                };
            } else if (method === 'boleto') {
                return {
                    cpf: cpfInput ? cpfInput.value : ''
                };
            } else if (method === 'pix') {
                return {
                    pixKey: document.getElementById('pixKey')?.value || 'N/A'
                };
            }
            
            return {};
        }
        
        // Mask credit card number (show only last 4 digits)
        function maskCardNumber(cardNumber) {
            const lastFourDigits = cardNumber.replace(/\s/g, '').slice(-4);
            return `**** **** **** ${lastFourDigits}`;
        }
        
        // Display order confirmation
        function displayOrderConfirmation() {
            // Set order details
            const orderNumberEl = document.getElementById('orderNumber');
            const orderDateEl = document.getElementById('orderDate');
            const confirmationTotalEl = document.getElementById('confirmationTotal');
            const paymentDetailsEl = document.getElementById('paymentDetails');
            
            if (orderNumberEl) orderNumberEl.textContent = orderDetails.orderId;
            if (orderDateEl) orderDateEl.textContent = orderDetails.orderDate;
            if (confirmationTotalEl) confirmationTotalEl.textContent = formatPrice(orderDetails.totals.total);
            
            // Display payment details
            if (paymentDetailsEl) {
                let paymentHTML = `<h4>Forma de Pagamento: `;
                
                if (orderDetails.payment.method === 'creditCard') {
                    paymentHTML += `Cartão de Crédito</h4>
                    <p>Número: ${orderDetails.payment.details.cardNumber}</p>
                    <p>Parcelas: ${orderDetails.payment.details.installments}x</p>`;
                } else if (orderDetails.payment.method === 'boleto') {
                    paymentHTML += `Boleto Bancário</h4>
                    <p>CPF: ${orderDetails.payment.details.cpf}</p>
                    <p>O boleto será enviado para seu email em instantes.</p>`;
                } else if (orderDetails.payment.method === 'pix') {
                    paymentHTML += `PIX</h4>
                    <p>O QR Code do PIX e as instruções serão enviados para seu email.</p>`;
                }
                
                paymentDetailsEl.innerHTML = paymentHTML;
            }
        }
        
        // Render order summary
        function renderOrderSummary() {
            const checkoutItemsEl = document.getElementById('checkoutItems');
            if (!checkoutItemsEl) return;
            
            checkoutItemsEl.innerHTML = '';
            
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'checkout-item';
                itemElement.innerHTML = `
                    <div class="checkout-item-image" style="${item.image}"></div>
                    <div class="checkout-item-details">
                        <div class="checkout-item-name">${item.name}</div>
                        <div class="checkout-item-price">${formatPrice(item.price)}</div>
                        <div class="checkout-item-quantity">Quantidade: ${item.quantity}</div>
                    </div>
                    <div class="checkout-item-total">${formatPrice(item.price * item.quantity)}</div>
                `;
                
                checkoutItemsEl.appendChild(itemElement);
            });
        }
        
        // Render order sidebar
        function renderOrderSidebar() {
            const sidebarItemsEl = document.getElementById('sidebarItems');
            if (!sidebarItemsEl) return;
            
            sidebarItemsEl.innerHTML = '';
            
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'sidebar-item';
                itemElement.innerHTML = `
                    <div class="sidebar-item-image" style="${item.image}"></div>
                    <div class="sidebar-item-details">
                        <div class="sidebar-item-name">${item.name}</div>
                        <div class="sidebar-item-price">${formatPrice(item.price)}</div>
                    </div>
                    <div class="sidebar-item-quantity">${item.quantity}</div>
                `;
                
                sidebarItemsEl.appendChild(itemElement);
            });
        }
        
        // Update totals
        function updateTotals() {
            const subtotal = calculateSubtotal();
            const total = calculateTotal();
            
            // Update main totals
            const subtotalPriceEl = document.getElementById('subtotalPrice');
            const shippingPriceEl = document.getElementById('shippingPrice');
            const totalPriceEl = document.getElementById('totalPrice');
            
            if (subtotalPriceEl) subtotalPriceEl.textContent = formatPrice(subtotal);
            if (shippingPriceEl) shippingPriceEl.textContent = formatPrice(shippingPrice);
            if (totalPriceEl) totalPriceEl.textContent = formatPrice(total);
            
            // Update sidebar totals
            const sidebarSubtotalEl = document.getElementById('sidebarSubtotal');
            const sidebarShippingEl = document.getElementById('sidebarShipping');
            const sidebarTotalEl = document.getElementById('sidebarTotal');
            
            if (sidebarSubtotalEl) sidebarSubtotalEl.textContent = formatPrice(subtotal);
            if (sidebarShippingEl) sidebarShippingEl.textContent = formatPrice(shippingPrice);
            if (sidebarTotalEl) sidebarTotalEl.textContent = formatPrice(total);
        }
        
        // Calculate subtotal
        function calculateSubtotal() {
            return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        }
        
        // Calculate total
        function calculateTotal() {
            return calculateSubtotal() + shippingPrice;
        }
        
        // Format price
        function formatPrice(price) {
            return `R$ ${price.toFixed(2).replace('.', ',')}`;
        }
        
        // Return public methods
        return {
            init
        };
    })();

    // Initialize checkout
    checkoutManager.init();
});

// JavaScript para a página principal (index.html)
// Este código será executado apenas quando o botão "Finalizar Compra" for clicado na página principal
// Ele deve estar em um arquivo separado ou em script.js
document.addEventListener('DOMContentLoaded', function() {
    // Procura pelo botão de checkout apenas na página principal
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            // Verificar se cartManager existe e tem a função closeCart
            if (typeof window.cartManager !== 'undefined' && typeof window.cartManager.closeCart === 'function') {
                window.cartManager.closeCart();
            }
            
            // Redirecionar para a página de checkout
            window.location.href = 'checkout/checkout.html';
        });
    }
});