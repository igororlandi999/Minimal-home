// Sistema de Avaliações de Produtos integrado com Firebase - VERSÃO CORRIGIDA
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar o sistema de avaliações
    const productReviewSystem = (() => {
        // Referência do Firestore para avaliações
        const db = firebase.firestore();
        const reviewsCollection = db.collection('productReviews');
        
        // Variável local para armazenar avaliações após carregamento
        let reviewsCache = {};
        
        // Mapear nomes de produtos para IDs
        const productNameToId = {
            'Poltrona Minimalista': 'poltrona_minimalista',
            'Mesa de Centro': 'mesa_de_centro',
            'Luminária Suspensa': 'luminaria_suspensa',
            'Estante Modular': 'estante_modular',
            'Conjunto Decorativo': 'conjunto_decorativo',
            'Sofá Escandinavo': 'sofa_escandinavo'
        };

        // Inicializar avaliações nos cards de produtos
        async function initProductCards() {
            const productCards = document.querySelectorAll('.product-card');
            
            // Carregar avaliações do Firebase para todos os produtos
            await loadAllReviews();
            
            productCards.forEach(card => {
                const productName = card.querySelector('h3').textContent;
                const productId = productNameToId[productName];
                
                if (productId && reviewsCache[productId]) {
                    const productInfo = card.querySelector('.product-info');
                    const priceElement = card.querySelector('.product-price');
                    
                    // Calcular classificação média - APENAS APROVADAS
                    const approvedReviews = reviewsCache[productId].filter(review => review.status === 'approved');
                    const averageRating = calculateAverageRating(approvedReviews);
                    const reviewCount = approvedReviews.length;
                    
                    // Criar elemento de classificação
                    const ratingElement = document.createElement('div');
                    ratingElement.className = 'rating';
                    ratingElement.innerHTML = `
                        ${generateStarRating(averageRating)}
                        <span class="rating-count">(${reviewCount})</span>
                    `;
                    
                    // Inserir após o preço
                    if (priceElement) {
                        priceElement.insertAdjacentElement('afterend', ratingElement);
                    }
                }
            });
        }

        // Carregar todas as avaliações do Firebase
        async function loadAllReviews() {
            try {
                // Limpar cache primeiro
                reviewsCache = {};
                
                // Obter todas as avaliações do Firestore
                const snapshot = await reviewsCollection.get();
                
                snapshot.forEach(doc => {
                    const review = doc.data();
                    if (!reviewsCache[review.productId]) {
                        reviewsCache[review.productId] = [];
                    }
                    
                    reviewsCache[review.productId].push({
                        id: doc.id,
                        name: review.name,
                        rating: review.rating,
                        comment: review.comment,
                        date: review.date,
                        userId: review.userId || null,
                        status: review.status || 'pending' // Garantir que o status exista
                    });
                });
                
                console.log('Avaliações carregadas do Firebase:', reviewsCache);
            } catch (error) {
                console.error('Erro ao carregar avaliações do Firebase:', error);
            }
        }

        // Carregar avaliações para um produto específico
        async function loadProductReviews(productId) {
            try {
                // Modificado para carregar apenas avaliações aprovadas para exibição
                const snapshot = await reviewsCollection
                    .where('productId', '==', productId)
                    .get();
                
                const reviews = [];
                snapshot.forEach(doc => {
                    const review = doc.data();
                    reviews.push({
                        id: doc.id,
                        name: review.name,
                        rating: review.rating,
                        comment: review.comment,
                        date: review.date,
                        userId: review.userId || null,
                        status: review.status || 'pending'
                    });
                });
                
                // Atualizar o cache
                reviewsCache[productId] = reviews;
                
                return reviews;
            } catch (error) {
                console.error(`Erro ao carregar avaliações para ${productId}:`, error);
                return [];
            }
        }

        // Atualizar modal de produto para mostrar avaliações
        function initProductModal() {
            const addToCartBtn = document.querySelector('.add-to-cart-btn');
            
            if (addToCartBtn) {
                const productModal = document.getElementById('productModal');
                const productModalDetails = productModal.querySelector('.product-modal-details');
                
                // Adicionar listener para atualizar as avaliações quando o modal abrir
                const productButtons = document.querySelectorAll('.product-button');
                productButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const productCard = this.closest('.product-card');
                        const productName = productCard.querySelector('h3').textContent;
                        const productId = productNameToId[productName];
                        
                        // Atualizar avaliações quando o modal abrir
                        if (productId) {
                            setTimeout(async () => {
                                await updateProductReviews(productId);
                            }, 100);
                        }
                    });
                });
            }
        }

        // Atualizar a seção de avaliações no modal de produto
        async function updateProductReviews(productId) {
            const productReviews = document.getElementById('productReviews');
            if (!productReviews) return;
            
            // Carregar avaliações atualizadas do Firebase
            const allProductReviews = await loadProductReviews(productId);
            
            // Filtrar apenas avaliações aprovadas para exibição
            const productReviewsList = allProductReviews.filter(review => review.status === 'approved');
            
            const averageRating = calculateAverageRating(productReviewsList);
            const reviewCount = productReviewsList.length;
            
            // Criar contagem de cada classificação
            const ratingCounts = [0, 0, 0, 0, 0]; // índices 0-4 correspondem a 1-5 estrelas
            productReviewsList.forEach(review => {
                ratingCounts[review.rating - 1]++;
            });
            
            // HTML para a seção de avaliações
            let reviewsHTML = `
                <div class="reviews-header">
                    <h3 class="reviews-title">Avaliações dos Clientes</h3>
                    <button class="review-form-toggle" id="writeReviewBtn">Escrever Avaliação</button>
                </div>
                
                <div class="reviews-summary">
                    <div class="average-rating">${averageRating.toFixed(1)}</div>
                    <div class="rating">
                        ${generateStarRating(averageRating)}
                        <span class="rating-count">(${reviewCount} avaliações)</span>
                    </div>
                    <div class="rating-breakdown">
            `;
            
            // Adicionar barras de progresso para cada classificação
            for (let i = 5; i >= 1; i--) {
                const count = ratingCounts[i - 1];
                const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                
                reviewsHTML += `
                    <div class="rating-bar">
                        <span class="rating-label">${i}★</span>
                        <div class="rating-progress">
                            <div class="rating-progress-value" style="width: ${percentage}%"></div>
                        </div>
                        <span class="rating-count-value">${count}</span>
                    </div>
                `;
            }
            
            reviewsHTML += `
                    </div>
                </div>
            `;
            
            // Lista de avaliações
            if (reviewCount > 0) {
                reviewsHTML += '<div class="reviews-list">';
                
                // Ordenar avaliações por data (mais recentes primeiro)
                const sortedReviews = [...productReviewsList].sort((a, b) => new Date(b.date) - new Date(a.date));
                
                sortedReviews.forEach(review => {
                    const formattedDate = formatDate(review.date);
                    
                    reviewsHTML += `
                        <div class="review-item">
                            <div class="review-header">
                                <span class="reviewer-name">${review.name}</span>
                                <span class="review-date">${formattedDate}</span>
                            </div>
                            <div class="review-rating">
                                ${generateStarRating(review.rating)}
                            </div>
                            <p class="review-content">${review.comment}</p>
                        </div>
                    `;
                });
                
                reviewsHTML += '</div>';
            } else {
                reviewsHTML += '<p>Ainda não há avaliações aprovadas para este produto. Seja o primeiro a avaliar!</p>';
            }
            
            // Formulário de avaliação
            reviewsHTML += `
                <div class="review-form">
                    <h4>Deixe sua avaliação</h4>
                    <p class="review-note">Sua avaliação será analisada por nossa equipe antes de ser publicada.</p>
                    <div class="star-rating-select" id="ratingSelect">
                        <span class="star" data-rating="1">★</span>
                        <span class="star" data-rating="2">★</span>
                        <span class="star" data-rating="3">★</span>
                        <span class="star" data-rating="4">★</span>
                        <span class="star" data-rating="5">★</span>
                    </div>
                    <input type="text" id="reviewerName" placeholder="Seu nome" required>
                    <textarea id="reviewComment" rows="4" placeholder="Compartilhe sua experiência com o produto" required></textarea>
                    <div class="review-form-actions">
                        <button class="review-cancel-btn">Cancelar</button>
                        <button class="review-submit-btn" data-product-id="${productId}">Enviar Avaliação</button>
                    </div>
                </div>
            `;
            
            // Atualizar o conteúdo
            productReviews.innerHTML = reviewsHTML;
            
            // Adicionar event listeners para o formulário
            setupReviewForm(productId);
            
            // Verificar autenticação para o botão de avaliação
            checkAuthForReviewButton();
        }

        // Verificar autenticação e configurar botão de avaliação
        function checkAuthForReviewButton() {
            const writeReviewBtn = document.getElementById('writeReviewBtn');
            const reviewForm = document.querySelector('.review-form');
            
            if (writeReviewBtn && reviewForm) {
                // Verificar se o usuário está logado
                firebase.auth().onAuthStateChanged(user => {
                    if (user) {
                        // Usuário logado - permitir escrever avaliação
                        writeReviewBtn.textContent = "Escrever Avaliação";
                        writeReviewBtn.addEventListener('click', function() {
                            reviewForm.classList.add('active');
                            
                            // Preencher o nome do usuário automaticamente se disponível
                            const reviewerNameInput = document.getElementById('reviewerName');
                            if (reviewerNameInput && user.displayName) {
                                reviewerNameInput.value = user.displayName;
                            }
                        });
                    } else {
                        // Usuário não logado - redirecionar para login
                        writeReviewBtn.textContent = "Faça login para avaliar";
                        writeReviewBtn.addEventListener('click', function() {
                            // Abrir modal de login
                            const loginModal = document.getElementById('loginModal');
                            if (loginModal) {
                                openModal(loginModal);
                            } else {
                                alert("Você precisa estar logado para avaliar produtos.");
                            }
                        });
                    }
                });
            }
        }

        // Abrir modal (usando a função existente no site)
        function openModal(modal) {
            if (typeof window.openModal === 'function') {
                window.openModal(modal);
            } else {
                modal.style.display = 'block';
                setTimeout(() => modal.classList.add('active'), 10);
            }
        }

        // Configurar event listeners para o formulário de avaliação
        function setupReviewForm(productId) {
            const reviewForm = document.querySelector('.review-form');
            const cancelButton = document.querySelector('.review-cancel-btn');
            const submitButton = document.querySelector('.review-submit-btn');
            const ratingSelect = document.getElementById('ratingSelect');
            let selectedRating = 0;
            
            // Cancelar avaliação
            if (cancelButton && reviewForm) {
                cancelButton.addEventListener('click', function() {
                    reviewForm.classList.remove('active');
                    resetForm();
                });
            }
            
            // Seleção de estrelas
            if (ratingSelect) {
                const stars = ratingSelect.querySelectorAll('.star');
                
                stars.forEach(star => {
                    star.addEventListener('click', function() {
                        selectedRating = parseInt(this.dataset.rating);
                        
                        // Atualizar visual das estrelas
                        stars.forEach(s => {
                            if (parseInt(s.dataset.rating) <= selectedRating) {
                                s.classList.add('filled');
                            } else {
                                s.classList.remove('filled');
                            }
                        });
                    });
                });
            }
            
            // Enviar avaliação
            if (submitButton) {
                submitButton.addEventListener('click', function() {
                    // Verificar autenticação
                    const user = firebase.auth().currentUser;
                    if (!user) {
                        alert("Você precisa estar logado para enviar uma avaliação.");
                        return;
                    }
                    
                    const name = document.getElementById('reviewerName').value;
                    const comment = document.getElementById('reviewComment').value;
                    
                    // Validar o formulário
                    if (!name || !comment || selectedRating === 0) {
                        alert('Por favor, preencha todos os campos e selecione uma classificação.');
                        return;
                    }
                    
                    // Adicionar nova avaliação com informações do usuário
                    addReview(productId, {
                        name: name,
                        rating: selectedRating,
                        comment: comment,
                        date: new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
                        userId: user.uid,
                        userEmail: user.email,
                        status: 'pending' // Todas as avaliações começam como pendentes
                    }).then(() => {
                        // Atualizar a exibição
                        updateProductReviews(productId);
                        
                        // Fechar o formulário
                        reviewForm.classList.remove('active');
                        resetForm();
                        
                        // Feedback para o usuário
                        alert('Sua avaliação foi enviada e será analisada por nossa equipe antes de ser publicada. Obrigado pelo feedback!');
                    }).catch(error => {
                        console.error("Erro ao salvar avaliação:", error);
                        alert('Ocorreu um erro ao enviar sua avaliação. Por favor, tente novamente.');
                    });
                });
            }
            
            // Resetar formulário
            function resetForm() {
                document.getElementById('reviewerName').value = '';
                document.getElementById('reviewComment').value = '';
                selectedRating = 0;
                
                const stars = ratingSelect.querySelectorAll('.star');
                stars.forEach(s => s.classList.remove('filled'));
            }
        }

        // Adicionar nova avaliação ao Firebase
        async function addReview(productId, review) {
            try {
                // Adicionar ao Firestore com status pendente
                const docRef = await reviewsCollection.add({
                    productId: productId,
                    name: review.name,
                    rating: review.rating,
                    comment: review.comment,
                    date: review.date,
                    userId: review.userId,
                    userEmail: review.userEmail,
                    status: 'pending', // Todas as novas avaliações começam como pendentes
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Adicionar o ID do documento à revisão
                review.id = docRef.id;
                
                // Atualizar o cache local
                if (!reviewsCache[productId]) {
                    reviewsCache[productId] = [];
                }
                reviewsCache[productId].push(review);
                
                // Atualizar os cards de produtos - não é necessário aqui pois só mostramos aprovadas
                // initProductCards();
                
                return docRef;
            } catch (error) {
                console.error('Erro ao adicionar avaliação:', error);
                throw error;
            }
        }

        // Verificar se o usuário pode editar/excluir uma avaliação
        function canModifyReview(reviewUserId) {
            const user = firebase.auth().currentUser;
            return user && (user.uid === reviewUserId || user.email.endsWith('@admin.com')); // Exemplo simples de permissão de admin
        }

        // Calcular a média das avaliações
        function calculateAverageRating(reviewsList) {
            if (!reviewsList || reviewsList.length === 0) {
                return 0;
            }
            
            const sum = reviewsList.reduce((total, review) => total + review.rating, 0);
            return sum / reviewsList.length;
        }

        // Gerar HTML para classificação por estrelas
        function generateStarRating(rating) {
            let starsHTML = '';
            
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(rating)) {
                    // Estrela cheia
                    starsHTML += '<span class="star filled">★</span>';
                } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
                    // Meia estrela (quando o rating não é um número inteiro)
                    starsHTML += '<span class="star half-filled">★</span>';
                } else {
                    // Estrela vazia
                    starsHTML += '<span class="star">★</span>';
                }
            }
            
            return starsHTML;
        }

        // Formatar data para exibição
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('pt-BR');
        }

        // Inicialização
        async function init() {
            try {
                await initProductCards();
                initProductModal();
            } catch (error) {
                console.error('Erro ao inicializar sistema de avaliações:', error);
            }
        }

        // API pública
        return {
            init,
            addReview,
            loadProductReviews
        };
    })();

    // Inicializar o sistema de avaliações
    productReviewSystem.init();
});