// Variables globales (seront remplies après auth)
let currentUserId = null;
let currentUserName = '';
let currentUserRole = 'player';
let userInventory = [];

const mainContent = document.getElementById('mainContent');

// ========== APPELS API ==========
async function fetchAPI(action, method = 'GET', data = null) {
    let url = `api.php?action=${action}`;
    const options = {
        method: method,
        headers: {}
    };
    
    if(method === 'POST' && data) {
        options.method = 'POST';
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        options.body = new URLSearchParams(data).toString();
    } else if(method === 'GET' && data) {
        url += '&' + new URLSearchParams(data).toString();
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log(`API ${action}:`, result);
        return result;
    } catch(error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// Vérifier l'authentification
async function checkAuth() {
    const result = await fetchAPI('checkAuth');
    if(result.success && result.user) {
        currentUserId = result.user.id;
        currentUserName = result.user.name;
        currentUserRole = result.user.role;
        return true;
    } else {
        window.location.href = 'login.php';
        return false;
    }
}

// Déconnexion
async function logout() {
    const result = await fetchAPI('logout');
    if(result.success) {
        window.location.href = 'login.php';
    }
}

// Charger l'inventaire
async function loadUserInventory() {
    const result = await fetchAPI('getInventory', 'GET', { user_id: currentUserId });
    if(result.success) {
        userInventory = result.inventory || [];
        return result;
    }
    return { success: false, inventory: [], total_cards: 0, total_value: 0 };
}

// ========== RENDU DES VUES ==========
async function renderMainMenu() {
    const inv = await loadUserInventory();
    const totalCards = inv.total_cards || 0;
    const totalValue = inv.total_value || 0;
    
    mainContent.innerHTML = `
        <div class="dashboard-stats">
            <div class="stat-badge"><i class="fas fa-user"></i> ${currentUserName}</div>
            <div class="stat-badge"><i class="fas fa-gem"></i> Valeur: ${totalValue} ⭐</div>
            <div class="stat-badge"><i class="fas fa-layer-group"></i> Cartes: ${totalCards}</div>
            <div class="stat-badge" style="cursor:pointer" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Déconnexion</div>
        </div>
        <div class="menu-grid" id="mainMenuGrid">
            <div class="menu-card" data-menu="dashboard">
                <i class="fas fa-chart-line"></i>
                <h3>Dashboard</h3>
            </div>
            <div class="menu-card" data-menu="trades">
                <i class="fas fa-handshake"></i>
                <h3>Échanges</h3>
            </div>
            <div class="menu-card" data-menu="market">
                <i class="fas fa-store"></i>
                <h3>Marketplace</h3>
            </div>
            <div class="menu-card" data-menu="profile">
                <i class="fas fa-user"></i>
                <h3>Profil public</h3>
            </div>
        </div>
        <div class="admin-section" id="adminSection" style="display: ${currentUserRole === 'admin' ? 'block' : 'none'}">
            <h3><i class="fas fa-shield-alt"></i> Administration</h3>
            <div class="menu-grid">
                <div class="menu-card" data-menu="admin-cards">
                    <i class="fas fa-id-card"></i>
                    <h4>Gérer cartes</h4>
                </div>
                <div class="menu-card" data-menu="admin-packs">
                    <i class="fas fa-cubes"></i>
                    <h4>Gérer packs</h4>
                </div>
                <div class="menu-card" data-menu="admin-users">
                    <i class="fas fa-users"></i>
                    <h4>Utilisateurs</h4>
                </div>
            </div>
        </div>
    `;

    document.querySelectorAll('[data-menu]').forEach(el => {
        el.addEventListener('click', () => {
            const page = el.getAttribute('data-menu');
            renderPage(page);
        });
    });
    
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

async function renderPacksView() {
    mainContent.innerHTML = '<div class="card-item" style="padding:20px; text-align:center">Chargement des packs...</div>';
    
    const packsResult = await fetchAPI('getPacks');
    
    if(!packsResult.success || !packsResult.packs || packsResult.packs.length === 0) {
        mainContent.innerHTML = `
            <h2><i class="fas fa-box-open"></i> Boutique de packs</h2>
            <div class="card-item" style="padding:20px; text-align:center; color:red">
                Erreur: ${packsResult.error || 'Aucun pack trouvé'}
            </div>
        `;
        return;
    }
    
    let packsHtml = '<h2><i class="fas fa-box-open"></i> Boutique de packs</h2>';
    
    for(const pack of packsResult.packs) {
        packsHtml += `
            <div class="card-item" style="padding:20px; text-align:center; margin-bottom:20px">
                <i class="fas fa-gem" style="font-size:3rem"></i>
                <h3>${pack.name}</h3>
                <p>${pack.description || `${pack.cards_per_pack} cartes par pack`}</p>
                <p>Prix: ${pack.price} ⭐</p>
                <button class="pack-btn" data-pack-id="${pack.id}">Ouvrir (${pack.price} ⭐)</button>
            </div>
        `;
    }
    
    packsHtml += `<div id="packResult"></div>`;
    mainContent.innerHTML = packsHtml;
    
    document.querySelectorAll('.pack-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const packId = btn.getAttribute('data-pack-id');
            const resultDiv = document.getElementById('packResult');
            resultDiv.innerHTML = '<div class="card-item" style="padding:20px; text-align:center">Ouverture en cours...</div>';
            
            const openResult = await fetchAPI('openPack', 'POST', { pack_id: packId });
            
            if(openResult.success && openResult.cards) {
                let cardsHtml = `<h3>🎉 ${openResult.pack_name} ouvert !</h3><div class="card-grid">`;
                for(const card of openResult.cards) {
                    cardsHtml += `
                        <div class="card-item" onclick='showCardModalFromData(${JSON.stringify(card).replace(/'/g, "\\'")})'>
                            <div class="card-img"><i class="fas fa-scroll"></i></div>
                            <div class="card-info">
                                <div class="card-name">${card.name}</div>
                                <div class="rarity-${card.rarity_name}">${(card.rarity_name || 'commun').toUpperCase()}</div>
                                ${card.attack !== null && card.hp !== null ? `<div class="card-stats">⚔️ ${card.attack} | ❤️ ${card.hp}</div>` : ''}
                                ${card.description ? `<div class="card-stats">📜 ${card.description.substring(0, 40)}...</div>` : ''}
                            </div>
                        </div>
                    `;
                }
                cardsHtml += `</div>`;
                resultDiv.innerHTML = cardsHtml;
                
                await loadUserInventory();
            } else {
                resultDiv.innerHTML = `<div class="card-item" style="padding:20px; text-align:center; color:red">Erreur: ${openResult.error || 'Ouverture impossible'}</div>`;
            }
        });
    });
}

async function renderCollectionView(filterRarity = 'all') {
    mainContent.innerHTML = '<div class="card-item" style="padding:20px; text-align:center">Chargement de votre collection...</div>';
    
    const inv = await loadUserInventory();
    let inventoryCards = inv.inventory || [];
    
    if(filterRarity !== 'all') {
        inventoryCards = inventoryCards.filter(item => item.rarity_name === filterRarity);
    }
    
    mainContent.innerHTML = `
        <h2><i class="fas fa-layer-group"></i> Ma collection</h2>
        <div class="filter-bar" id="filterBar">
            <div class="filter-chip ${filterRarity === 'all' ? 'active' : ''}" data-filter="all">Toutes</div>
            <div class="filter-chip ${filterRarity === 'commun' ? 'active' : ''}" data-filter="commun">Communes</div>
            <div class="filter-chip ${filterRarity === 'rare' ? 'active' : ''}" data-filter="rare">Rares</div>
            <div class="filter-chip ${filterRarity === 'epic' ? 'active' : ''}" data-filter="epic">Épiques</div>
            <div class="filter-chip ${filterRarity === 'legendaire' ? 'active' : ''}" data-filter="legendaire">Légendaires</div>
        </div>
        <div class="card-grid" id="collectionGrid"></div>
    `;
    
    const grid = document.getElementById('collectionGrid');
    
    if(inventoryCards.length === 0) {
        grid.innerHTML = '<div class="card-item" style="padding:20px; text-align:center">Aucune carte dans votre collection. Ouvrez des packs !</div>';
    } else {
        for(const item of inventoryCards) {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card-item';
            let statHtml = '';
            if(item.attack !== null && item.hp !== null) {
                statHtml = `<div class="card-stats">⚔️ ${item.attack} | ❤️ ${item.hp}</div>`;
            } else if(item.description) {
                statHtml = `<div class="card-stats">📜 ${item.description.substring(0, 40)}...</div>`;
            }
            cardDiv.innerHTML = `
                <div class="card-img"><i class="fas fa-scroll"></i></div>
                <div class="card-info">
                    <div class="card-name">${item.name} <span style="font-size:0.7rem">(x${item.quantity})</span></div>
                    <div class="rarity-${item.rarity_name}">${(item.rarity_name || 'commun').toUpperCase()}</div>
                    ${statHtml}
                </div>
            `;
            cardDiv.addEventListener('click', () => showCardModalFromData(item));
            grid.appendChild(cardDiv);
        }
    }
    
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            const newFilter = chip.getAttribute('data-filter');
            renderCollectionView(newFilter);
        });
    });
}

async function renderPage(pageName) {
    switch(pageName) {
        case 'dashboard':
            renderMainMenu();
            break;
        case 'trades':
            mainContent.innerHTML = `<div class="card-item" style="padding:20px"><h3>Échanges</h3><p>Fonctionnalité à venir...</p></div>`;
            break;
        case 'market':
            mainContent.innerHTML = `<div class="card-item" style="padding:20px"><h3>Marketplace</h3><p>Fonctionnalité à venir...</p></div>`;
            break;
        case 'profile':
            const inv = await loadUserInventory();
            mainContent.innerHTML = `<div class="card-item" style="padding:20px"><h3>Profil de ${currentUserName}</h3><p>Cartes: ${inv.total_cards || 0} | Valeur: ${inv.total_value || 0} ⭐</p></div>`;
            break;
        case 'admin-cards':
            mainContent.innerHTML = `<div class="card-item" style="padding:20px"><h3>Admin - Gestion cartes</h3><p>Liste des cartes + génération IA (à venir)</p></div>`;
            break;
        case 'admin-packs':
            mainContent.innerHTML = `<div class="card-item" style="padding:20px"><h3>Admin - Packs</h3><p>Configuration des packs (à venir)</p></div>`;
            break;
        case 'admin-users':
            mainContent.innerHTML = `<div class="card-item" style="padding:20px"><h3>Admin - Utilisateurs</h3><p>Gestion des joueurs (à venir)</p></div>`;
            break;
        default:
            renderMainMenu();
    }
}

// Fonction modale
window.showCardModalFromData = function(card) {
    const modal = document.getElementById('cardModal');
    const content = document.getElementById('modalDynamicContent');
    content.innerHTML = `
        <h2>${card.name}</h2>
        <p>Rareté : <strong class="rarity-${card.rarity_name || 'commun'}">${(card.rarity_name || 'commun').toUpperCase()}</strong></p>
        ${card.attack !== null && card.hp !== null ? `<p>⚔️ ATK ${card.attack} | ❤️ HP ${card.hp}</p>` : ''}
        ${card.description ? `<p>📖 ${card.description}</p>` : ''}
        <button class="close-modal-btn" style="margin-top:16px;">Fermer</button>
    `;
    modal.style.display = 'flex';
    const closeModal = () => modal.style.display = 'none';
    modal.querySelector('.close-modal')?.addEventListener('click', closeModal);
    content.querySelector('.close-modal-btn')?.addEventListener('click', closeModal);
}

// Navigation basse
document.querySelectorAll('.nav-item-bottom').forEach(nav => {
    nav.addEventListener('click', () => {
        document.querySelectorAll('.nav-item-bottom').forEach(n => n.classList.remove('active'));
        nav.classList.add('active');
        const view = nav.getAttribute('data-nav');
        if(view === 'main') renderMainMenu();
        else if(view === 'packs') renderPacksView();
        else if(view === 'collection') renderCollectionView();
    });
});

// INITIALISATION : vérifier l'auth d'abord
document.addEventListener('DOMContentLoaded', async () => {
    const isAuth = await checkAuth();
    if(isAuth) {
        renderMainMenu();
    }
}); 