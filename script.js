document.addEventListener('DOMContentLoaded', () => {
    // ---------- DONNÉES MOCK ----------
    const mockCards = [
        { id: 1, name: 'Steve', type: 'humain', rarity: 'commun', atk: 10, hp: 20, desc: null },
        { id: 2, name: 'Cochon', type: 'animal', rarity: 'commun', atk: 0, hp: 15, desc: null },
        { id: 3, name: 'Pomme', type: 'objet', rarity: 'commun', desc: 'Une pomme croquante et rafraîchissante.' },
        { id: 4, name: 'FER', type: 'objet', rarity: 'commun', desc: 'Minerai robuste pour l’artisanat.' },
        { id: 5, name: 'Squelette', type: 'mob', rarity: 'rare', atk: 15, hp: 20 },
        { id: 6, name: 'Vache', type: 'animal', rarity: 'rare', atk: 0, hp: 20 },
        { id: 7, name: 'Creeper', type: 'mob', rarity: 'epic', atk: 25, hp: 15 },
        { id: 8, name: 'Ender Dragon', type: 'boss', rarity: 'legendaire', atk: 45, hp: 50 },
        { id: 9, name: 'Elytra', type: 'objet', rarity: 'legendaire', desc: 'Ailes mythiques permettant de planer.' },
        { id: 10, name: 'Netherite', type: 'objet', rarity: 'legendaire', desc: 'Métal ultime.' }
    ];

    let currentUserRole = 'player'; // 'admin' pour tester

    // Gestion navigation basse
    let currentView = 'main'; // main, packs, collection

    const mainContent = document.getElementById('mainContent');

    function renderMainMenu() {
        mainContent.innerHTML = `
            <div class="dashboard-stats">
                <div class="stat-badge"><i class="fas fa-gem"></i> Valeur: 12 450 ⭐</div>
                <div class="stat-badge"><i class="fas fa-layer-group"></i> Cartes: 47</div>
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
            ${currentUserRole === 'admin' ? `
            <div class="admin-section">
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
            ` : ''}
        `;

        // Ajout des événements
        document.querySelectorAll('[data-menu]').forEach(el => {
            el.addEventListener('click', () => {
                const page = el.getAttribute('data-menu');
                renderPage(page);
            });
        });
    }

    function renderPacksView() {
        mainContent.innerHTML = `
            <h2><i class="fas fa-box-open"></i> Boutique de packs</h2>
            <div class="card-grid" style="grid-template-columns:1fr">
                <div class="card-item" style="padding:20px; text-align:center">
                    <i class="fas fa-gem" style="font-size:3rem"></i>
                    <h3>Pack Héroïque</h3>
                    <p>5 cartes | 70% communes, 20% rares, 9% épiques, 1% légendaire</p>
                    <button class="pack-btn" id="openHeroPack">Ouvrir (1 clé)</button>
                </div>
                <div class="card-item" style="padding:20px; text-align:center">
                    <i class="fas fa-fire" style="font-size:3rem"></i>
                    <h3>Pack Légendaire</h3>
                    <p>3 cartes rares+ | 5 clés</p>
                    <button class="pack-btn">Ouvrir (5 clés)</button>
                </div>
            </div>
            <div id="packResult"></div>
        `;
        const openBtn = document.getElementById('openHeroPack');
        if(openBtn) {
            openBtn.addEventListener('click', () => {
                document.getElementById('packResult').innerHTML = '<div class="card-grid"><div class="card-item"><div class="card-img">🎉</div><div class="card-info">Vous avez obtenu: STEVE, Cochon, Pomme, Squelette (Rare), FER</div></div></div>';
            });
        }
    }

    function renderCollectionView(filterRarity = 'all') {
        let filtered = mockCards;
        if(filterRarity !== 'all') filtered = mockCards.filter(c => c.rarity === filterRarity);

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
        filtered.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card-item';
            let statHtml = '';
            if(card.atk !== undefined && card.hp !== undefined) {
                statHtml = `<div class="card-stats">⚔️ ${card.atk} | ❤️ ${card.hp}</div>`;
            } else if(card.desc) {
                statHtml = `<div class="card-stats">📜 ${card.desc.substring(0, 40)}...</div>`;
            }
            cardDiv.innerHTML = `
                <div class="card-img"><i class="fas fa-scroll"></i></div>
                <div class="card-info">
                    <div class="card-name">${card.name}</div>
                    <div class="rarity-${card.rarity}">${card.rarity.toUpperCase()}</div>
                    ${statHtml}
                </div>
            `;
            cardDiv.addEventListener('click', () => showCardModal(card));
            grid.appendChild(cardDiv);
        });

        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const newFilter = chip.getAttribute('data-filter');
                renderCollectionView(newFilter);
            });
        });
    }

    function renderPage(pageName) {
        switch(pageName) {
            case 'dashboard':
                renderMainMenu();
                break;
            case 'trades':
                mainContent.innerHTML = `<div class="card-item" style="padding:20px"><h3>Échanges</h3><p>Demande: Elytra contre 2 Netherite <button>Accepter</button></p></div>`;
                break;
            case 'market':
                mainContent.innerHTML = `<div class="card-item" style="padding:20px"><h3>Marketplace</h3><p>Creeper (Épique) → 450 ⭐</p><p>Elytra (Légendaire) → 5400 ⭐</p></div>`;
                break;
            case 'profile':
                mainContent.innerHTML = `<div class="card-item" style="padding:20px"><h3>Profil de GuerrierNG</h3><p>47 cartes | Valeur 12 450 ⭐</p></div>`;
                break;
            case 'admin-cards':
                mainContent.innerHTML = `<div class="card-item" style="padding:20px"><h3>Admin - Gestion cartes</h3><p>Liste des cartes + génération IA</p><button>+ Générer carte IA</button></div>`;
                break;
            case 'admin-packs':
                mainContent.innerHTML = `<div class="card-item" style="padding:20px"><h3>Admin - Packs</h3><p>Probabilités : communes 70% ...</p></div>`;
                break;
            case 'admin-users':
                mainContent.innerHTML = `<div class="card-item" style="padding:20px"><h3>Admin - Utilisateurs</h3><p>Bannir, voir inventaire...</p></div>`;
                break;
            default:
                renderMainMenu();
        }
    }

    function showCardModal(card) {
        const modal = document.getElementById('cardModal');
        const content = document.getElementById('modalDynamicContent');
        content.innerHTML = `
            <h2>${card.name}</h2>
            <p>Rareté : <strong class="rarity-${card.rarity}">${card.rarity}</strong></p>
            ${card.atk ? `<p>⚔️ ATK ${card.atk} | ❤️ HP ${card.hp}</p>` : ''}
            ${card.desc ? `<p>📖 ${card.desc}</p>` : ''}
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
            currentView = view;
            if(view === 'main') renderMainMenu();
            else if(view === 'packs') renderPacksView();
            else if(view === 'collection') renderCollectionView();
        });
    });

    // Chargement initial
    renderMainMenu();
    window.showCardModal = showCardModal;
});