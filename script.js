// ═══════════════════════════════════════════════════════════════════
// NationsGlory Cards – SPA Frontend
// ═══════════════════════════════════════════════════════════════════

let currentUser  = null;
let userCoins    = 0;
let claimableCount = 0;

// ── API helper ────────────────────────────────────────────────────
async function fetchAPI(action, method = 'GET', data = null) {
    const opts = { method };
    if (method === 'POST' && data) {
        const fd = new FormData();
        for (const [k, v] of Object.entries(data)) {
            if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
            else if (v !== null && v !== undefined) fd.append(k, v);
        }
        opts.body = fd;
    }
    const r = await fetch(`api.php?action=${action}`, opts);
    return r.json();
}

// ── Toast ─────────────────────────────────────────────────────────
function showToast(msg, isError = false) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast' + (isError ? ' toast-error' : '');
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3200);
}

// ── Auth ──────────────────────────────────────────────────────────
async function checkAuth() {
    const d = await fetchAPI('checkAuth');
    if (!d.success) { window.location.href = 'login.php'; return false; }
    currentUser    = d.user;
    userCoins      = d.coins ?? 800;
    claimableCount = d.claimable ?? 0;
    return true;
}

function isAdmin() { return currentUser && currentUser.role === 'admin'; }

// ── Coin display ──────────────────────────────────────────────────
function coinsHtml(amount) {
    return `<span style="color:#ffb347;font-weight:700">${Number(amount).toLocaleString()} \u{1FA99}</span>`;
}

// ── Rarity helpers ────────────────────────────────────────────────
function rarityIcon(r) {
    const icons = { commun: '⚪', rare: '🔵', epic: '🟣', legendaire: '🟡' };
    return icons[r] || '⚪';
}
function rarityClass(r) {
    const c = { commun: 'rarity-commun', rare: 'rarity-rare', epic: 'rarity-epic', legendaire: 'rarity-legendaire' };
    return c[r] || 'rarity-commun';
}
function rarityBorderClass(r) {
    const c = { commun: 'rarity-border-commun', rare: 'rarity-border-rare', epic: 'rarity-border-epic', legendaire: 'rarity-border-legendaire' };
    return c[r] || 'rarity-border-commun';
}

// ── Card image (tries img/cards/[id].png, then shows icon) ────────
function cardImgHtml(card, h) {
    if (!h) h = '120px';
    const id  = card.id || card.card_id;
    const src = card.image_url || (id ? 'img/cards/' + id + '.png' : null);
    const icon = card.is_object ? 'fa-box' : 'fa-dragon';
    if (src) {
        return '<div style="position:relative;height:' + h + ';overflow:hidden;background:linear-gradient(145deg,#1a253c,#0f172a);border-radius:inherit">' +
            '<img src="' + src + '" alt="' + (card.name||'') + '"' +
            ' style="width:100%;height:100%;object-fit:cover;display:block"' +
            ' onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
            '<div class="card-img" style="height:' + h + ';display:none"><i class="fas ' + icon + '"></i></div>' +
            '</div>';
    }
    return '<div class="card-img" style="height:' + h + '"><i class="fas ' + icon + '"></i></div>';
}

// ── Mini card ────────────────────────────────────────────────────
function cardMiniHtml(card) {
    const rn = card.rarity_name || 'commun';
    return '<div class="card-mini ' + rarityBorderClass(rn) + '">' +
        cardImgHtml(Object.assign({}, card, {id: card.card_id}), '70px') +
        '<div style="padding:4px 6px;font-size:.7rem;line-height:1.2">' +
        '<div style="font-weight:700">' + rarityIcon(rn) + ' ' + (card.name||'?') + '</div>' +
        (card.is_object ? '' : '<div style="color:#b9c3da">⚔' + (card.attack||0) + ' ❤' + (card.hp||0) + '</div>') +
        '</div></div>';
}

function statusBadge(s) {
    const label = { pending: 'En attente', accepted: 'Accepté', refused: 'Refusé', cancelled: 'Annulé' };
    return '<span class="badge badge-' + s + '">' + (label[s]||s) + '</span>';
}

// ── Main router ───────────────────────────────────────────────────
function renderPage(page) {
    document.querySelectorAll('.nav-item-bottom').forEach(n => {
        n.classList.toggle('active', n.dataset.page === page);
    });
    switch (page) {
        case 'menu':            renderMainMenu();        break;
        case 'packs':           renderPacksView();       break;
        case 'collection':      renderCollectionView();  break;
        case 'quests':          renderQuestsView();      break;
        case 'profile':         renderProfile();         break;
        case 'trades':          renderTradesView();      break;
        case 'admin-dashboard': renderAdminDashboard();  break;
        case 'admin-cards':     renderAdminCards();      break;
        case 'admin-packs':     renderAdminPacks();      break;
        case 'admin-users':     renderAdminUsers();      break;
        case 'admin-quests':    renderAdminQuests();     break;
        default: renderMainMenu();
    }
}

// ═══════════════════════════════════════════════════════════════════
// MENU PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
async function renderMainMenu() {
    const app = document.getElementById('app');
    const claimBadge = claimableCount > 0
        ? '<span style="background:#ef4444;color:#fff;font-size:.65rem;padding:2px 6px;border-radius:20px;margin-left:6px">' + claimableCount + '</span>'
        : '';

    let html = '<div style="padding-bottom:4px">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">'
        + '<div><h2 style="font-size:1.4rem">Bonjour, ' + currentUser.name + ' 👋</h2>'
        + '<div style="font-size:.85rem;color:#8b9bb5;margin-top:2px">' + (isAdmin() ? '<span style="color:#f59e0b">⭐ Admin</span>' : 'Joueur') + '</div></div>'
        + '<div style="text-align:right"><div style="font-size:1.4rem;font-weight:700;color:#ffb347">' + userCoins.toLocaleString() + ' 🪙</div>'
        + '<div style="font-size:.75rem;color:#8b9bb5">Pièces</div></div></div>'
        + '<div class="menu-grid">'
        + '<div class="menu-card" onclick="renderPage(\'packs\')"><i class="fas fa-box-open"></i><div>Boutique</div></div>'
        + '<div class="menu-card" onclick="renderPage(\'collection\')"><i class="fas fa-layer-group"></i><div>Collection</div></div>'
        + '<div class="menu-card" onclick="renderPage(\'quests\')"><i class="fas fa-scroll"></i><div>Quêtes' + claimBadge + '</div></div>'
        + '<div class="menu-card" onclick="renderPage(\'trades\')"><i class="fas fa-exchange-alt"></i><div>Échanges</div></div>'
        + '<div class="menu-card" onclick="renderPage(\'profile\')"><i class="fas fa-user-circle"></i><div>Profil</div></div>'
        + '<div class="menu-card" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div>Déconnexion</div></div>'
        + '</div>';

    if (isAdmin()) {
        html += '<div class="admin-section"><h3 style="color:#f59e0b;margin-bottom:16px">⭐ Administration</h3>'
            + '<div class="menu-grid">'
            + '<div class="menu-card" onclick="renderPage(\'admin-dashboard\')" style="border-color:#f59e0b22"><i class="fas fa-chart-bar" style="color:#f59e0b"></i><div>Dashboard</div></div>'
            + '<div class="menu-card" onclick="renderPage(\'admin-cards\')" style="border-color:#f59e0b22"><i class="fas fa-dragon" style="color:#f59e0b"></i><div>Cartes</div></div>'
            + '<div class="menu-card" onclick="renderPage(\'admin-packs\')" style="border-color:#f59e0b22"><i class="fas fa-box" style="color:#f59e0b"></i><div>Packs</div></div>'
            + '<div class="menu-card" onclick="renderPage(\'admin-users\')" style="border-color:#f59e0b22"><i class="fas fa-users" style="color:#f59e0b"></i><div>Joueurs</div></div>'
            + '<div class="menu-card" onclick="renderPage(\'admin-quests\')" style="border-color:#f59e0b22"><i class="fas fa-tasks" style="color:#f59e0b"></i><div>Quêtes</div></div>'
            + '</div></div>';
    }
    html += '</div>';
    app.innerHTML = html;
}

async function logout() {
    await fetchAPI('logout', 'POST');
    window.location.href = 'login.php';
}

// ═══════════════════════════════════════════════════════════════════
// BOUTIQUE PACKS
// ═══════════════════════════════════════════════════════════════════
async function renderPacksView() {
    const app = document.getElementById('app');
    app.innerHTML = '<p style="color:#8b9bb5;text-align:center;padding:40px">Chargement des packs…</p>';
    const d = await fetchAPI('getPacks');
    if (!d.success) { app.innerHTML = '<p style="color:#ef4444">' + d.error + '</p>'; return; }

    const packIcons  = { 1:'fa-shield-alt', 2:'fa-seedling', 3:'fa-star', 4:'fa-gem', 5:'fa-crown' };
    const packColors = { 1:'#3b82f6', 2:'#22c55e', 3:'#8b5cf6', 4:'#a855f7', 5:'#fbbf24' };

    let html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">'
        + '<button onclick="renderPage(\'menu\')" class="btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></button>'
        + '<h2>🏪 Boutique</h2>'
        + '<div style="margin-left:auto">' + coinsHtml(userCoins) + '</div></div>';

    for (const pack of d.packs) {
        const icon      = packIcons[pack.id]  || 'fa-box';
        const color     = packColors[pack.id] || '#ffb347';
        const canAfford = userCoins >= pack.price;
        const rarities  = {};
        (pack.cards || []).forEach(c => { rarities[c.rarity_name] = (rarities[c.rarity_name]||0) + 1; });
        const rarityTags = Object.entries(rarities).map(([r,n]) =>
            '<span class="' + rarityClass(r) + '" style="font-size:.75rem">' + rarityIcon(r) + ' ' + r + ' (' + n + ')</span>'
        ).join(' ');

        html += '<div class="pack-card-shop" style="border-color:' + color + '33">'
            + '<i class="fas ' + icon + ' pack-icon" style="color:' + color + '"></i>'
            + '<div style="font-size:1.2rem;font-weight:700">' + pack.name + '</div>'
            + '<div style="color:#8b9bb5;font-size:.85rem;margin:6px 0">' + (pack.description||'') + '</div>'
            + '<div class="pack-price">' + pack.price + ' 🪙</div>'
            + '<div style="font-size:.8rem;color:#8b9bb5;margin-bottom:14px">' + pack.cards_per_pack + ' cartes · ' + rarityTags + '</div>'
            + '<button onclick="openPack(' + pack.id + ')" class="btn-primary" ' + (canAfford?'':'disabled') + '>'
            + (canAfford ? '<i class="fas fa-box-open"></i> Ouvrir (' + pack.price + ' 🪙)' : '🔒 ' + (pack.price - userCoins) + ' 🪙 manquantes')
            + '</button></div>';
    }
    app.innerHTML = html;
}

async function openPack(packId) {
    const btn = event.target.closest('button');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tirage…'; }
    const d = await fetchAPI('openPack', 'POST', { pack_id: packId });
    if (!d.success) {
        showToast(d.error || 'Erreur', true);
        if (btn) { btn.disabled = false; btn.innerHTML = 'Ouvrir'; }
        return;
    }
    userCoins      = d.coins_left ?? (userCoins - (d.coins_spent || 0));
    claimableCount = d.claimable ?? claimableCount;
    showPackResult(d.cards, d.pack_name);
}

function showPackResult(cards, packName) {
    const app = document.getElementById('app');
    let html = '<div style="text-align:center"><div class="pack-result-header">✨ ' + packName + '</div>'
        + '<div style="color:#8b9bb5;font-size:.85rem;margin-bottom:16px">Vous avez obtenu :</div>'
        + '<div class="card-grid">';
    for (const card of cards) {
        const rn = card.rarity_name || 'commun';
        const cardJson = JSON.stringify(card).replace(/'/g, "&#39;");
        html += '<div class="card-item ' + rarityBorderClass(rn) + '" onclick=\'showCardModalFromData(' + cardJson + ')\'>'
            + cardImgHtml(card)
            + '<div class="card-info">'
            + '<div class="card-name ' + rarityClass(rn) + '">' + rarityIcon(rn) + ' ' + card.name + '</div>'
            + '<div class="card-stats">' + (card.is_object ? '🧪 Objet' : '⚔️ ' + (card.attack||0) + '  ❤️ ' + (card.hp||0)) + '</div>'
            + '</div></div>';
    }
    html += '</div>'
        + '<div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">'
        + '<button onclick="renderPacksView()" class="btn-primary">Ouvrir un autre</button>'
        + '<button onclick="renderCollectionView()" class="btn-secondary">Voir ma collection</button></div>'
        + '<div style="margin-top:12px;font-size:.85rem;color:#8b9bb5">Solde : ' + coinsHtml(userCoins) + '</div></div>';
    app.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════
// COLLECTION
// ═══════════════════════════════════════════════════════════════════
async function renderCollectionView(filterRarity, search) {
    if (!filterRarity) filterRarity = 'all';
    if (!search) search = '';
    const app = document.getElementById('app');
    app.innerHTML = '<p style="color:#8b9bb5;text-align:center;padding:40px">Chargement…</p>';
    const d = await fetchAPI('getInventory');
    if (!d.success) { app.innerHTML = '<p style="color:#ef4444">' + d.error + '</p>'; return; }
    userCoins = d.coins ?? userCoins;

    const rarities = ['all', 'commun', 'rare', 'epic', 'legendaire'];
    let inv = d.inventory || [];
    if (filterRarity !== 'all') inv = inv.filter(c => c.rarity_name === filterRarity);
    if (search) inv = inv.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    let html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">'
        + '<button onclick="renderPage(\'menu\')" class="btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></button>'
        + '<h2>🗂️ Collection</h2>'
        + '<div style="margin-left:auto;font-size:.85rem;color:#8b9bb5">' + d.total_cards + ' cartes · ' + coinsHtml(d.coins) + '</div></div>'
        + '<input type="text" class="form-input" placeholder="🔍 Rechercher…" style="margin-bottom:12px"'
        + ' oninput="renderCollectionView(\'' + filterRarity + '\', this.value)" value="' + search + '">'
        + '<div class="filter-bar">';
    for (const r of rarities) {
        html += '<div class="filter-chip ' + (filterRarity===r?'active':'') + '" onclick="renderCollectionView(\'' + r + '\',\'' + search + '\')">'
            + (r==='all' ? 'Toutes' : r.charAt(0).toUpperCase()+r.slice(1)) + '</div>';
    }
    html += '</div>';

    if (inv.length === 0) {
        html += '<div style="text-align:center;padding:40px;color:#8b9bb5">'
            + (search||filterRarity!=='all' ? 'Aucune carte correspondante' : 'Votre collection est vide – ouvrez des packs !')
            + '</div>';
    } else {
        html += '<div class="card-grid">';
        for (const card of inv) {
            const rn = card.rarity_name || 'commun';
            const merged = Object.assign({}, card, {id: card.card_id});
            const cardJson = JSON.stringify(merged).replace(/'/g, "&#39;");
            html += '<div class="card-item ' + rarityBorderClass(rn) + '" onclick=\'showCardModalFromData(' + cardJson + ')\'>'
                + cardImgHtml(merged)
                + '<div class="card-info">'
                + '<div class="card-name ' + rarityClass(rn) + '">' + rarityIcon(rn) + ' ' + card.name + '</div>'
                + '<div class="card-stats">' + (card.is_object ? '🧪 Objet' : '⚔️ ' + (card.attack||0) + '  ❤️ ' + (card.hp||0)) + '</div>'
                + (card.quantity>1 ? '<div style="font-size:.7rem;color:#fbbf24;margin-top:4px">x' + card.quantity + '</div>' : '')
                + '</div></div>';
        }
        html += '</div>';
    }
    app.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════
// QUÊTES
// ═══════════════════════════════════════════════════════════════════
async function renderQuestsView() {
    const app = document.getElementById('app');
    app.innerHTML = '<p style="color:#8b9bb5;text-align:center;padding:40px">Chargement des quêtes…</p>';
    const d = await fetchAPI('getQuests');
    if (!d.success) { app.innerHTML = '<p style="color:#ef4444">' + d.error + '</p>'; return; }

    const groups = { daily: [], weekly: [], one_time: [] };
    const labels = { daily: '📅 Quêtes Quotidiennes', weekly: '📆 Quêtes Hebdomadaires', one_time: '🏆 Quêtes Permanentes' };
    for (const q of d.quests) { if (groups[q.quest_type]) groups[q.quest_type].push(q); }

    let html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">'
        + '<button onclick="renderPage(\'menu\')" class="btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></button>'
        + '<h2>📜 Quêtes</h2>'
        + '<div style="margin-left:auto">' + coinsHtml(userCoins) + '</div></div>';

    const typeOrder = ['daily', 'weekly', 'one_time'];
    for (const type of typeOrder) {
        const quests = groups[type];
        if (!quests.length) continue;
        html += '<h3 style="margin:20px 0 12px;color:#b9c3da">' + labels[type] + '</h3>';
        for (const q of quests) {
            const pct     = Math.min(100, Math.round((q.user_progress / q.condition_value) * 100));
            const done    = q.completed;
            const claimed = q.claimed;
            const barColor = claimed ? '#374151' : (done ? '#22c55e' : '#3b82f6');
            const iconColor = claimed ? '#374151' : (done ? '#22c55e' : '#ffb347');
            html += '<div style="background:#111827;border:1px solid ' + (done&&!claimed?'#22c55e33':claimed?'#37415133':'#2d3a5e') + ';border-radius:16px;padding:16px;margin-bottom:12px">'
                + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">'
                + '<i class="' + (q.icon||'fas fa-star') + '" style="font-size:1.4rem;color:' + iconColor + ';min-width:28px"></i>'
                + '<div style="flex:1"><div style="font-weight:700;' + (claimed?'color:#6b7280':'') + '">' + q.title + '</div>'
                + '<div style="font-size:.8rem;color:#8b9bb5">' + q.description + '</div></div>'
                + '<div style="text-align:right;white-space:nowrap">'
                + '<div style="font-size:1rem;font-weight:700;color:' + (claimed?'#6b7280':'#ffb347') + '">+' + q.reward_coins + ' 🪙</div>'
                + (type !== 'one_time' ? '<div style="font-size:.7rem;color:#8b9bb5">' + (type==='daily'?'Reset demain':'Reset lundi') + '</div>' : '')
                + '</div></div>'
                + '<div style="background:#1e2a3a;border-radius:20px;height:8px;overflow:hidden;margin-bottom:10px">'
                + '<div style="background:' + barColor + ';height:100%;width:' + (claimed?100:pct) + '%;transition:width .4s;border-radius:20px"></div></div>'
                + '<div style="display:flex;justify-content:space-between;align-items:center">'
                + '<span style="font-size:.8rem;color:#8b9bb5">' + q.user_progress + ' / ' + q.condition_value + '</span>'
                + (done && !claimed
                    ? '<button onclick="claimQuest(' + q.id + ',\'' + q.period_key + '\')" class="btn-success btn-sm"><i class="fas fa-hand-holding-usd"></i> Réclamer +' + q.reward_coins + ' 🪙</button>'
                    : claimed
                    ? '<span style="font-size:.8rem;color:#6b7280"><i class="fas fa-check-circle"></i> Réclamée</span>'
                    : '<span style="font-size:.8rem;color:#8b9bb5">En cours…</span>')
                + '</div></div>';
        }
    }
    app.innerHTML = html;
}

async function claimQuest(questId, periodKey) {
    const d = await fetchAPI('claimQuest', 'POST', { quest_id: questId, period_key: periodKey });
    if (d.success) {
        userCoins      = d.new_coins ?? userCoins;
        claimableCount = Math.max(0, claimableCount - 1);
        showToast('✨ +' + d.coins_earned + ' 🪙 — ' + (d.quest_title || 'Quête réclamée !'));
        renderQuestsView();
    } else {
        showToast(d.error || 'Erreur', true);
    }
}

// ═══════════════════════════════════════════════════════════════════
// PROFIL
// ═══════════════════════════════════════════════════════════════════
async function renderProfile() {
    const app = document.getElementById('app');
    app.innerHTML = '<p style="color:#8b9bb5;text-align:center;padding:40px">Chargement…</p>';
    const [dp, di] = await Promise.all([fetchAPI('getProfile'), fetchAPI('getInventory')]);
    const stats = dp.stats || {};
    const inv   = di.inventory || [];
    userCoins   = stats.coins ?? userCoins;

    const rarityCount = {};
    inv.forEach(c => { rarityCount[c.rarity_name] = (rarityCount[c.rarity_name]||0) + (c.quantity||1); });

    let html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
        + '<button onclick="renderPage(\'menu\')" class="btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></button>'
        + '<h2>👤 Profil</h2></div>'
        + '<div class="profile-header">'
        + '<div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#ffb347,#ff8c00);display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto">'
        + currentUser.name.charAt(0).toUpperCase() + '</div>'
        + '<h2>' + currentUser.name + '</h2>'
        + '<span class="role-badge">' + (currentUser.role==='admin'?'⭐ Admin':'🎮 Joueur') + '</span></div>'
        + '<div class="profile-stats">'
        + '<div class="profile-stat"><div class="ps-value">' + Number(stats.coins||0).toLocaleString() + '</div><div class="ps-label">🪙 Pièces</div></div>'
        + '<div class="profile-stat"><div class="ps-value">' + (stats.total||0) + '</div><div class="ps-label">📦 Cartes</div></div>'
        + '<div class="profile-stat"><div class="ps-value">' + Number(stats.value||0).toLocaleString() + '</div><div class="ps-label">⭐ Valeur</div></div>'
        + '<div class="profile-stat"><div class="ps-value">' + (stats.packs_opened||0) + '</div><div class="ps-label">📫 Packs</div></div>'
        + '<div class="profile-stat"><div class="ps-value">' + (stats.trades_done||0) + '</div><div class="ps-label">🤝 Échanges</div></div>'
        + '</div>'
        + '<div style="background:#111827;border:1px solid #2d3a5e;border-radius:16px;padding:16px;margin-bottom:20px">'
        + '<h3 style="margin-bottom:12px;font-size:1rem">Répartition des raretés</h3>'
        + '<div class="profile-rarity-bar">'
        + ['legendaire','epic','rare','commun'].map(r =>
            '<div class="pbar-item"><span class="' + rarityClass(r) + '">' + rarityIcon(r) + ' ' + r + '</span>: <strong>' + (rarityCount[r]||0) + '</strong></div>'
        ).join('') + '</div></div>'
        + (dp.claimable > 0
            ? '<div style="background:#16a34a22;border:1px solid #22c55e44;border-radius:16px;padding:14px;margin-bottom:16px;cursor:pointer" onclick="renderPage(\'quests\')">'
              + '<span style="color:#22c55e">🎁 ' + dp.claimable + ' quête(s) à réclamer !</span></div>'
            : '')
        + '<div style="text-align:center;color:#8b9bb5;font-size:.8rem">Membre depuis '
        + new Date(stats.created_at||Date.now()).toLocaleDateString('fr-FR') + '</div>';
    app.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════
// ÉCHANGES
// ═══════════════════════════════════════════════════════════════════
async function renderTradesView() {
    const app = document.getElementById('app');
    app.innerHTML = '<p style="color:#8b9bb5;text-align:center;padding:40px">Chargement…</p>';
    const [dt, dh] = await Promise.all([fetchAPI('getTrades'), fetchAPI('getTradeHistory')]);
    const trades  = dt.trades  || [];
    const history = dh.trades  || [];

    let html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;flex-wrap:wrap">'
        + '<button onclick="renderPage(\'menu\')" class="btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></button>'
        + '<h2>🔁 Échanges</h2>'
        + '<button onclick="renderProposeTrade()" class="btn-primary btn-sm" style="margin-left:auto">'
        + '<i class="fas fa-plus"></i> Proposer</button></div>';

    html += '<div class="trade-section"><h3>⏳ En attente (' + trades.length + ')</h3>';
    if (!trades.length) html += '<div class="trade-empty">Aucun échange en attente</div>';
    for (const t of trades) {
        const isProposer = t.proposer_id == currentUser.id;
        const myItems    = t.items.filter(i => i.from_user_id == currentUser.id);
        const theirItems = t.items.filter(i => i.to_user_id   == currentUser.id);
        html += '<div class="trade-card">'
            + '<div class="trade-meta"><strong>' + (isProposer ? 'Vous → '+t.receiver_name : t.proposer_name+' → Vous') + '</strong>'
            + '<span style="color:#8b9bb5;font-size:.8rem;margin-left:8px">' + new Date(t.created_at).toLocaleDateString('fr-FR') + '</span>'
            + (t.proposer_coins > 0 && !isProposer ? '<div style="color:#ffb347;font-size:.85rem;margin-top:4px">+ ' + t.proposer_coins + ' 🪙 offerts</div>' : '')
            + (t.proposer_coins > 0 &&  isProposer ? '<div style="color:#ffb347;font-size:.85rem;margin-top:4px">Vous offrez ' + t.proposer_coins + ' 🪙</div>' : '')
            + '</div>'
            + '<div class="trade-row">'
            + '<div class="trade-col"><div class="trade-col-title">' + (isProposer?'Vos cartes':'Cartes reçues') + '</div>'
            + '<div class="trade-cards-mini">' + myItems.map(cardMiniHtml).join('') + '</div></div>'
            + '<div class="trade-arrow">⇄</div>'
            + '<div class="trade-col"><div class="trade-col-title">' + (isProposer?'Cartes demandées':'Vos cartes à donner') + '</div>'
            + '<div class="trade-cards-mini">' + theirItems.map(cardMiniHtml).join('') + '</div></div>'
            + '</div>'
            + '<div class="trade-actions">'
            + (!isProposer ? '<button onclick="respondTrade('+t.id+',\'accept\')" class="btn-success btn-sm">✅ Accepter</button>'
                           + '<button onclick="respondTrade('+t.id+',\'refuse\')" class="btn-danger btn-sm">❌ Refuser</button>' : '')
            + ( isProposer ? '<button onclick="respondTrade('+t.id+',\'cancel\')" class="btn-secondary btn-sm">🚫 Annuler</button>' : '')
            + '</div></div>';
    }
    html += '</div>';

    html += '<div class="trade-section"><h3>📋 Historique</h3>';
    if (!history.length) html += '<div class="trade-empty">Aucun historique</div>';
    for (const t of history) {
        const isP = t.proposer_id == currentUser.id;
        html += '<div class="trade-history-item">'
            + statusBadge(t.status)
            + '<span>' + (isP ? 'Vous → '+t.receiver_name : t.proposer_name+' → Vous') + '</span>'
            + (t.proposer_coins > 0 ? '<span style="color:#ffb347;font-size:.8rem">' + t.proposer_coins + ' 🪙</span>' : '')
            + '<span style="color:#8b9bb5;font-size:.8rem;margin-left:auto">' + new Date(t.updated_at||t.created_at).toLocaleDateString('fr-FR') + '</span>'
            + '</div>';
    }
    html += '</div>';
    app.innerHTML = html;
}

async function respondTrade(tradeId, action) {
    const map = { accept: 'acceptTrade', refuse: 'refuseTrade', cancel: 'cancelTrade' };
    const d = await fetchAPI(map[action], 'POST', { trade_id: tradeId });
    if (d.success) { showToast('Échange mis à jour'); renderTradesView(); }
    else showToast(d.error || 'Erreur', true);
}

async function renderProposeTrade() {
    const app = document.getElementById('app');
    app.innerHTML = '<p style="color:#8b9bb5;text-align:center;padding:40px">Chargement…</p>';
    const [du, di] = await Promise.all([fetchAPI('getUsers'), fetchAPI('getInventory')]);
    const users = du.users || [];
    const myInv = di.inventory || [];
    userCoins = di.coins ?? userCoins;

    let html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
        + '<button onclick="renderTradesView()" class="btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></button>'
        + '<h2>➕ Proposer un échange</h2></div>'
        + '<div class="form-group"><label>Joueur cible</label>'
        + '<select id="tradeReceiver" class="form-input"><option value="">-- Choisir un joueur --</option>'
        + users.map(u => '<option value="' + u.id + '">' + u.name + '</option>').join('')
        + '</select></div>'
        + '<div class="form-group"><label>Pièces à offrir <small style="color:#8b9bb5">(optionnel – vous avez ' + coinsHtml(userCoins) + ')</small></label>'
        + '<input type="number" id="tradeCoins" class="form-input" placeholder="0" min="0" max="' + userCoins + '" value="0"></div>'
        + '<div class="trade-propose-grid">'
        + '<div><h4 style="margin-bottom:12px">Vos cartes à offrir</h4>'
        + '<div class="card-select-grid" id="myCardGrid">'
        + (myInv.length === 0 ? '<p style="color:#8b9bb5;font-size:.85rem">Aucune carte</p>' :
            myInv.map(c => {
                const merged = Object.assign({}, c, {id: c.card_id});
                return '<div class="card-selectable ' + rarityBorderClass(c.rarity_name) + '" data-id="' + c.card_id + '" onclick="this.classList.toggle(\'selected\')">'
                    + cardImgHtml(merged, '70px')
                    + '<div style="padding:4px 6px;font-size:.7rem"><div style="font-weight:700">' + rarityIcon(c.rarity_name) + ' ' + c.name + '</div>'
                    + (c.quantity>1?'<div style="color:#fbbf24">x'+c.quantity+'</div>':'')
                    + '</div></div>';
            }).join(''))
        + '</div></div>'
        + '<div><h4 style="margin-bottom:12px">Cartes à recevoir</h4>'
        + '<div id="theirCardGrid" class="card-select-grid"><p style="color:#8b9bb5;font-size:.85rem">Sélectionnez un joueur</p></div>'
        + '</div></div>'
        + '<div style="margin-top:20px;display:flex;gap:10px">'
        + '<button onclick="submitTrade()" class="btn-primary"><i class="fas fa-paper-plane"></i> Envoyer l\'échange</button>'
        + '<button onclick="renderTradesView()" class="btn-secondary">Annuler</button></div>';
    app.innerHTML = html;

    document.getElementById('tradeReceiver').addEventListener('change', async function () {
        const uid = this.value;
        const grid = document.getElementById('theirCardGrid');
        if (!uid) { grid.innerHTML = '<p style="color:#8b9bb5;font-size:.85rem">Sélectionnez un joueur</p>'; return; }
        grid.innerHTML = '<p style="color:#8b9bb5;font-size:.85rem">Chargement…</p>';
        const d2 = await fetchAPI('getUserCards&user_id=' + uid);
        const inv2 = d2.inventory || [];
        grid.innerHTML = inv2.length === 0
            ? '<p style="color:#8b9bb5;font-size:.85rem">Ce joueur n\'a aucune carte</p>'
            : inv2.map(c => {
                const merged = Object.assign({}, c, {id: c.card_id});
                return '<div class="card-selectable ' + rarityBorderClass(c.rarity_name) + '" data-id="' + c.card_id + '" onclick="this.classList.toggle(\'selected\')">'
                    + cardImgHtml(merged, '70px')
                    + '<div style="padding:4px 6px;font-size:.7rem"><div style="font-weight:700">' + rarityIcon(c.rarity_name) + ' ' + c.name + '</div></div>'
                    + '</div>';
            }).join('');
    });
}

async function submitTrade() {
    const receiverId = document.getElementById('tradeReceiver')?.value;
    const coinsOffer = parseInt(document.getElementById('tradeCoins')?.value || '0', 10);
    const myCards    = Array.from(document.querySelectorAll('#myCardGrid .card-selectable.selected')).map(e => e.dataset.id);
    const wantCards  = Array.from(document.querySelectorAll('#theirCardGrid .card-selectable.selected')).map(e => e.dataset.id);

    if (!receiverId)         { showToast('Sélectionnez un joueur', true); return; }
    if (!myCards.length)     { showToast('Sélectionnez au moins une de vos cartes', true); return; }
    if (!wantCards.length)   { showToast('Sélectionnez au moins une carte à recevoir', true); return; }
    if (coinsOffer > userCoins) { showToast('Pas assez de pièces', true); return; }

    const d = await fetchAPI('proposeTrade', 'POST', {
        receiver_id: receiverId,
        my_cards: myCards,
        wanted_cards: wantCards,
        coins_offered: coinsOffer
    });
    if (d.success) { showToast('Échange proposé !'); renderTradesView(); }
    else showToast(d.error || 'Erreur', true);
}

// ═══════════════════════════════════════════════════════════════════
// MODAL CARTE
// ═══════════════════════════════════════════════════════════════════
function showCardModalFromData(card) {
    const modal = document.getElementById('cardModal');
    const body  = document.getElementById('cardModalBody');
    const rn    = card.rarity_name || 'commun';
    body.innerHTML = cardImgHtml(card, '200px')
        + '<div style="padding:20px">'
        + '<div style="font-size:1.3rem;font-weight:700;margin-bottom:6px;' + (rn==='legendaire'?'color:#fbbf24':'') + '">' + rarityIcon(rn) + ' ' + card.name + '</div>'
        + '<div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap">'
        + '<span class="badge badge-pending">' + rn + '</span>'
        + (card.is_object ? '<span class="badge badge-accepted">Objet</span>' : '')
        + (card.type_name ? '<span class="badge badge-pending">' + card.type_name + '</span>' : '')
        + '</div>'
        + (card.description ? '<p style="color:#b9c3da;font-size:.9rem;margin-bottom:14px">' + card.description + '</p>' : '')
        + (!card.is_object ? '<div style="display:flex;gap:20px;margin-bottom:12px">'
            + '<div><span style="color:#ef4444;font-size:1.4rem">⚔️ ' + (card.attack||0) + '</span><br><span style="font-size:.75rem;color:#8b9bb5">ATT</span></div>'
            + '<div><span style="color:#22c55e;font-size:1.4rem">❤️ ' + (card.hp||0) + '</span><br><span style="font-size:.75rem;color:#8b9bb5">PV</span></div>'
            + '</div>' : '')
        + (card.base_value ? '<div style="font-size:.85rem;color:#ffb347">⭐ Valeur : ' + card.base_value + '</div>' : '')
        + '</div>';
    modal.style.display = 'flex';
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN – DASHBOARD
// ═══════════════════════════════════════════════════════════════════
async function renderAdminDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = '<p style="color:#8b9bb5;text-align:center;padding:40px">Chargement…</p>';
    const d = await fetchAPI('adminDashboard');
    if (!d.success) { app.innerHTML = '<p style="color:#ef4444">' + d.error + '</p>'; return; }
    const s = d.stats;

    const statCards = [
        ['fas fa-users','#3b82f6', s.total_users, 'Joueurs'],
        ['fas fa-coins','#fbbf24', Number(s.total_coins).toLocaleString(), '🪙 Circulation'],
        ['fas fa-box','#8b5cf6',   s.total_packs, 'Packs ouverts'],
        ['fas fa-handshake','#22c55e', s.total_trades, 'Échanges conclus'],
        ['fas fa-dragon','#f59e0b', s.total_cards_db, 'Cartes en BDD'],
        ['fas fa-shopping-bag','#06b6d4', s.total_packs_db, 'Packs actifs'],
        ['fas fa-clock','#ef4444', s.pending_trades, 'Trades en attente'],
        ['fas fa-layer-group','#a3e635', s.total_inventory, 'Cartes distribuées'],
    ];

    let html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">'
        + '<button onclick="renderPage(\'menu\')" class="btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></button>'
        + '<h2>⭐ Dashboard Admin</h2></div>'
        + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:24px">'
        + statCards.map(([icon, color, val, label]) =>
            '<div style="background:#111827;border-radius:16px;padding:16px;border:1px solid ' + color + '33;text-align:center">'
            + '<i class="' + icon + '" style="color:' + color + ';font-size:1.5rem;margin-bottom:8px;display:block"></i>'
            + '<div style="font-size:1.3rem;font-weight:700;color:' + color + '">' + val + '</div>'
            + '<div style="font-size:.75rem;color:#8b9bb5;margin-top:2px">' + label + '</div></div>'
        ).join('') + '</div>';

    if (d.top_users && d.top_users.length) {
        html += '<div style="background:#111827;border:1px solid #2d3a5e;border-radius:16px;padding:16px;margin-bottom:20px">'
            + '<h3 style="margin-bottom:12px">🏅 Top Joueurs (Pièces)</h3>'
            + d.top_users.map((u, i) =>
                '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #1e2a3a">'
                + '<span style="color:#fbbf24;width:20px">' + ['🥇','🥈','🥉','4.','5.'][i] + '</span>'
                + '<span style="flex:1">' + u.name + '</span>'
                + '<span style="color:#ffb347">' + Number(u.coins).toLocaleString() + ' 🪙</span>'
                + '<span style="color:#8b9bb5;font-size:.8rem">' + u.packs_opened + ' packs</span>'
                + '</div>'
            ).join('') + '</div>';
    }

    html += '<div style="background:#111827;border:1px solid #2d3a5e;border-radius:16px;padding:16px;margin-bottom:20px">'
        + '<h3 style="margin-bottom:12px">📋 Activité récente</h3>';
    if (!d.activity || !d.activity.length) {
        html += '<p style="color:#8b9bb5;font-size:.85rem">Aucune activité enregistrée</p>';
    } else {
        for (const a of d.activity) {
            const dt = new Date(a.created_at);
            html += '<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #1e2a3a;font-size:.82rem;flex-wrap:wrap">'
                + '<span style="color:#8b9bb5;white-space:nowrap">' + dt.toLocaleDateString('fr-FR') + ' ' + dt.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) + '</span>'
                + '<span style="color:#ffb347;min-width:80px">' + (a.user_name||'?') + '</span>'
                + '<span style="color:#b9c3da">' + a.action + '</span>'
                + (a.details ? '<span style="color:#6b7280">' + a.details + '</span>' : '')
                + '</div>';
        }
    }
    html += '</div>'
        + '<div style="display:flex;gap:10px;flex-wrap:wrap">'
        + '<button onclick="renderPage(\'admin-cards\')" class="btn-secondary">🐉 Cartes</button>'
        + '<button onclick="renderPage(\'admin-packs\')" class="btn-secondary">📦 Packs</button>'
        + '<button onclick="renderPage(\'admin-users\')" class="btn-secondary">👥 Joueurs</button>'
        + '<button onclick="renderPage(\'admin-quests\')" class="btn-secondary">📜 Quêtes</button></div>';
    app.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN – CARTES
// ═══════════════════════════════════════════════════════════════════
async function renderAdminCards() {
    const app = document.getElementById('app');
    app.innerHTML = '<p style="color:#8b9bb5;text-align:center;padding:40px">Chargement…</p>';
    const [dc, dr, dt] = await Promise.all([fetchAPI('adminGetCards'), fetchAPI('getRarities'), fetchAPI('getCardTypes')]);
    const cards    = dc.cards    || [];
    const rarities = dr.rarities || [];
    const types    = dt.types    || [];

    const rarOpts = rarities.map(r => '<option value="' + r.id + '">' + r.name + '</option>').join('');
    const typOpts = types.map(t   => '<option value="' + t.id + '">' + t.name + '</option>').join('');

    let html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
        + '<button onclick="renderPage(\'admin-dashboard\')" class="btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></button>'
        + '<h2>🐉 Gestion Cartes</h2></div>'
        + '<div class="ia-section"><h3><i class="fas fa-robot"></i> Génération IA</h3>'
        + '<div class="form-row"><div class="form-group"><label>Type</label>'
        + '<select id="genType" class="form-input">' + typOpts + '</select></div>'
        + '<div class="form-group"><label>Rareté</label>'
        + '<select id="genRarity" class="form-input">' + rarOpts + '</select></div></div>'
        + '<label style="display:flex;align-items:center;gap:8px;margin-bottom:12px;cursor:pointer">'
        + '<input type="checkbox" id="genImg"> Générer une image (nécessite clé OpenAI)</label>'
        + '<button onclick="adminGenerateCard()" class="btn-primary btn-sm"><i class="fas fa-magic"></i> Générer</button>'
        + '<div id="genResult" style="margin-top:12px"></div></div>'
        + '<div class="admin-form-card" id="cardFormArea">'
        + '<h3 id="cardFormTitle">➕ Nouvelle carte</h3>'
        + '<input type="hidden" id="editCardId">'
        + '<div class="form-row"><div class="form-group"><label>Nom</label><input id="cf_name" class="form-input" placeholder="Nom de la carte"></div>'
        + '<div class="form-group"><label>Type</label><select id="cf_type" class="form-input">' + typOpts + '</select></div></div>'
        + '<div class="form-row"><div class="form-group"><label>Rareté</label><select id="cf_rarity" class="form-input">' + rarOpts + '</select></div>'
        + '<div class="form-group"><label>Attaque</label><input id="cf_atk" type="number" class="form-input" placeholder="(vide si objet)"></div>'
        + '<div class="form-group"><label>PV</label><input id="cf_hp" type="number" class="form-input" placeholder="(vide si objet)"></div></div>'
        + '<div class="form-group"><label>Description</label><textarea id="cf_desc" class="form-input" rows="2"></textarea></div>'
        + '<div class="form-group"><label>URL Image <small style="color:#8b9bb5">(ex: img/cards/34.png)</small></label>'
        + '<input id="cf_img" class="form-input" placeholder="img/cards/1.png ou https://…"></div>'
        + '<label style="display:flex;align-items:center;gap:8px;margin-bottom:14px;cursor:pointer">'
        + '<input type="checkbox" id="cf_obj"> C\'est un objet</label>'
        + '<div style="display:flex;gap:10px">'
        + '<button onclick="adminSaveCard()" class="btn-primary btn-sm"><i class="fas fa-save"></i> Enregistrer</button>'
        + '<button onclick="adminResetCardForm()" class="btn-secondary btn-sm">Annuler</button></div></div>'
        + '<div class="admin-table-wrap"><table class="admin-table">'
        + '<thead><tr><th>#</th><th>Img</th><th>Nom</th><th>Rareté</th><th>Type</th><th>ATT</th><th>PV</th><th>Actions</th></tr></thead>'
        + '<tbody>';
    for (const c of cards) {
        const imgSrc = c.image_url || ('img/cards/' + c.id + '.png');
        html += '<tr><td>#' + c.id + '</td>'
            + '<td><img src="' + imgSrc + '" style="width:36px;height:36px;object-fit:cover;border-radius:6px" onerror="this.style.display=\'none\'"></td>'
            + '<td style="font-weight:600">' + c.name + '</td>'
            + '<td><span class="' + rarityClass(c.rarity_name) + '">' + rarityIcon(c.rarity_name) + ' ' + c.rarity_name + '</span></td>'
            + '<td>' + c.type_name + '</td>'
            + '<td>' + (c.attack ?? '—') + '</td>'
            + '<td>' + (c.hp ?? '—') + '</td>'
            + '<td style="white-space:nowrap">'
            + '<button onclick=\'adminEditCard(' + JSON.stringify(c).replace(/'/g,"&#39;") + ')\' class="btn-secondary btn-sm">✏️</button> '
            + '<button onclick="adminDeleteCard(' + c.id + ',\'' + c.name.replace(/'/g,"\\'") + '\')" class="btn-danger btn-sm">🗑️</button>'
            + '</td></tr>';
    }
    html += '</tbody></table></div>';
    app.innerHTML = html;
}

async function adminGenerateCard() {
    const res = document.getElementById('genResult');
    res.innerHTML = '<span style="color:#8b9bb5"><i class="fas fa-spinner fa-spin"></i> Génération…</span>';
    const rarEl = document.getElementById('genRarity');
    const rarName = rarEl.options[rarEl.selectedIndex].text.toLowerCase();
    const d = await fetchAPI('generateCard', 'POST', {
        card_type: document.getElementById('genType').options[document.getElementById('genType').selectedIndex].text.toLowerCase(),
        rarity: rarName,
        with_image: document.getElementById('genImg').checked ? '1' : '0'
    });
    if (!d.success) { res.innerHTML = '<span style="color:#ef4444">' + d.error + '</span>'; return; }
    const g = d.generated;
    res.innerHTML = '<div style="background:#0f172a;border-radius:12px;padding:12px;margin-top:8px">'
        + '<strong style="color:#22c55e">✅ Généré : ' + g.name + '</strong>'
        + (d.note ? '<div style="color:#fbbf24;font-size:.8rem">ℹ️ ' + d.note + '</div>' : '')
        + '<div style="font-size:.85rem;color:#b9c3da;margin:6px 0">' + (g.description||'') + '</div>'
        + (g.image_url ? '<img src="' + g.image_url + '" style="width:80px;height:80px;object-fit:cover;border-radius:8px;margin-bottom:8px"><br>' : '')
        + '<button onclick=\'adminFillFormFromGen(' + JSON.stringify(g).replace(/'/g,"&#39;") + ')\' class="btn-primary btn-sm">⬇️ Remplir le formulaire</button>'
        + '</div>';
}

function adminFillFormFromGen(g) {
    document.getElementById('cf_name').value = g.name || '';
    document.getElementById('cf_desc').value = g.description || '';
    document.getElementById('cf_atk').value  = g.attack !== null ? g.attack : '';
    document.getElementById('cf_hp').value   = g.hp !== null ? g.hp : '';
    document.getElementById('cf_img').value  = g.image_url || '';
    document.getElementById('cf_obj').checked = !!g.is_object;
    document.getElementById('editCardId').value = '';
    document.getElementById('cardFormTitle').textContent = '➕ Nouvelle carte (depuis IA)';
}

function adminEditCard(c) {
    document.getElementById('editCardId').value = c.id;
    document.getElementById('cf_name').value    = c.name;
    document.getElementById('cf_type').value    = c.card_type_id;
    document.getElementById('cf_rarity').value  = c.rarity_id;
    document.getElementById('cf_atk').value     = c.attack !== null && c.attack !== undefined ? c.attack : '';
    document.getElementById('cf_hp').value      = c.hp    !== null && c.hp    !== undefined ? c.hp    : '';
    document.getElementById('cf_desc').value    = c.description || '';
    document.getElementById('cf_img').value     = c.image_url || '';
    document.getElementById('cf_obj').checked   = !!c.is_object;
    document.getElementById('cardFormTitle').textContent = '✏️ Modifier : ' + c.name;
    document.getElementById('cardFormArea').scrollIntoView({ behavior: 'smooth' });
}

function adminResetCardForm() {
    document.getElementById('editCardId').value = '';
    ['cf_name','cf_atk','cf_hp','cf_desc','cf_img'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('cf_obj').checked = false;
    document.getElementById('cardFormTitle').textContent = '➕ Nouvelle carte';
}

async function adminSaveCard() {
    const id = document.getElementById('editCardId').value;
    const data = {
        name:         document.getElementById('cf_name').value,
        card_type_id: document.getElementById('cf_type').value,
        rarity_id:    document.getElementById('cf_rarity').value,
        attack:       document.getElementById('cf_atk').value,
        hp:           document.getElementById('cf_hp').value,
        description:  document.getElementById('cf_desc').value,
        image_url:    document.getElementById('cf_img').value,
        is_object:    document.getElementById('cf_obj').checked ? 1 : 0
    };
    if (!data.name) { showToast('Nom requis', true); return; }
    if (id) data.id = id;
    const d = await fetchAPI(id ? 'adminUpdateCard' : 'adminCreateCard', 'POST', data);
    if (d.success) { showToast('Carte enregistrée ✅'); renderAdminCards(); }
    else showToast(d.error || 'Erreur', true);
}

async function adminDeleteCard(id, name) {
    if (!confirm('Supprimer la carte "' + name + '" ?')) return;
    const d = await fetchAPI('adminDeleteCard', 'POST', { id });
    if (d.success) { showToast('Carte supprimée'); renderAdminCards(); }
    else showToast(d.error || 'Erreur', true);
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN – PACKS
// ═══════════════════════════════════════════════════════════════════
async function renderAdminPacks() {
    const app = document.getElementById('app');
    app.innerHTML = '<p style="color:#8b9bb5;text-align:center;padding:40px">Chargement…</p>';
    const [dp, dc] = await Promise.all([fetchAPI('adminGetPacks'), fetchAPI('adminGetCards')]);
    const packs = dp.packs || [];
    const cards = dc.cards || [];
    const cardOpts = cards.map(c => '<option value="' + c.id + '">' + c.name + ' (' + c.rarity_name + ')</option>').join('');

    let html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
        + '<button onclick="renderPage(\'admin-dashboard\')" class="btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></button>'
        + '<h2>📦 Gestion Packs</h2></div>'
        + '<div class="admin-form-card"><h3>➕ Nouveau pack</h3>'
        + '<div class="form-row">'
        + '<div class="form-group"><label>Nom</label><input id="pf_name" class="form-input" placeholder="Nom du pack"></div>'
        + '<div class="form-group"><label>Prix (🪙)</label><input id="pf_price" type="number" class="form-input" value="100"></div>'
        + '<div class="form-group"><label>Cartes/tirage</label><input id="pf_cpp" type="number" class="form-input" value="5"></div></div>'
        + '<div class="form-group"><label>Description</label><input id="pf_desc" class="form-input" placeholder="Description"></div>'
        + '<label style="display:flex;align-items:center;gap:8px;margin-bottom:12px;cursor:pointer"><input type="checkbox" id="pf_active" checked> Actif</label>'
        + '<button onclick="adminCreatePack()" class="btn-primary btn-sm"><i class="fas fa-save"></i> Créer</button></div>';

    for (const pack of packs) {
        const safeDesc = (pack.description||'').replace(/'/g,"\\'");
        const safeName = pack.name.replace(/'/g,"\\'");
        html += '<div class="admin-form-card">'
            + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">'
            + '<h3>📦 ' + pack.name + ' — ' + pack.price + ' 🪙 (' + pack.cards_per_pack + ' cartes)</h3>'
            + '<div style="display:flex;gap:8px">'
            + '<button onclick="adminEditPack(' + pack.id + ',\'' + safeName + '\',' + pack.price + ',' + pack.cards_per_pack + ',\'' + safeDesc + '\')" class="btn-secondary btn-sm">✏️</button>'
            + '<button onclick="adminDeletePack(' + pack.id + ',\'' + safeName + '\')" class="btn-danger btn-sm">🗑️</button>'
            + '</div></div>'
            + '<div style="margin-bottom:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
            + '<select id="addCard_' + pack.id + '" class="form-input" style="flex:1;min-width:180px">' + cardOpts + '</select>'
            + '<input id="addWeight_' + pack.id + '" type="number" value="10" min="1" class="form-input" style="width:70px" placeholder="Poids">'
            + '<button onclick="adminAddCardToPack(' + pack.id + ')" class="btn-primary btn-sm">+ Ajouter</button></div>'
            + '<div style="display:flex;flex-wrap:wrap;gap:6px">'
            + (pack.cards||[]).map(c =>
                '<span style="background:#0f172a;border:1px solid ' + (c.color||'#2d3a5e') + ';border-radius:8px;padding:4px 10px;font-size:.75rem">'
                + rarityIcon(c.rarity_name) + ' ' + c.name + ' (' + c.weight + 'w)'
                + '<button onclick="adminRemoveCardFromPack(' + pack.id + ',' + c.card_id + ')" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:0 0 0 6px">✕</button></span>'
            ).join('') + '</div></div>';
    }
    app.innerHTML = html;
}

async function adminCreatePack() {
    const d = await fetchAPI('adminCreatePack', 'POST', {
        name: document.getElementById('pf_name').value,
        description: document.getElementById('pf_desc').value,
        price: document.getElementById('pf_price').value,
        cards_per_pack: document.getElementById('pf_cpp').value,
        is_active: document.getElementById('pf_active').checked ? 1 : 0
    });
    if (d.success) { showToast('Pack créé'); renderAdminPacks(); }
    else showToast(d.error || 'Erreur', true);
}

async function adminEditPack(id, name, price, cpp, desc) {
    const newName  = prompt('Nom du pack', name);    if (newName  === null) return;
    const newPrice = prompt('Prix (🪙)',   price);   if (newPrice === null) return;
    const newCpp   = prompt('Cartes/tirage', cpp);   if (newCpp   === null) return;
    const newDesc  = prompt('Description', desc) ?? desc;
    const d = await fetchAPI('adminUpdatePack', 'POST', { id, name: newName, price: newPrice, cards_per_pack: newCpp, description: newDesc, is_active: 1 });
    if (d.success) { showToast('Pack mis à jour'); renderAdminPacks(); }
    else showToast(d.error || 'Erreur', true);
}

async function adminDeletePack(id, name) {
    if (!confirm('Supprimer le pack "' + name + '" ?')) return;
    const d = await fetchAPI('adminDeletePack', 'POST', { id });
    if (d.success) { showToast('Pack supprimé'); renderAdminPacks(); }
    else showToast(d.error || 'Erreur', true);
}

async function adminAddCardToPack(packId) {
    const cardId = document.getElementById('addCard_' + packId).value;
    const weight = document.getElementById('addWeight_' + packId).value || 10;
    const d = await fetchAPI('adminAssignCard', 'POST', { pack_id: packId, card_id: cardId, weight });
    if (d.success) { showToast('Carte ajoutée'); renderAdminPacks(); }
    else showToast(d.error || 'Erreur', true);
}

async function adminRemoveCardFromPack(packId, cardId) {
    const d = await fetchAPI('adminRemoveCard', 'POST', { pack_id: packId, card_id: cardId });
    if (d.success) { showToast('Carte retirée'); renderAdminPacks(); }
    else showToast(d.error || 'Erreur', true);
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN – JOUEURS
// ═══════════════════════════════════════════════════════════════════
async function renderAdminUsers() {
    const app = document.getElementById('app');
    app.innerHTML = '<p style="color:#8b9bb5;text-align:center;padding:40px">Chargement…</p>';
    const d = await fetchAPI('adminGetUsers');
    const users = d.users || [];

    let html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
        + '<button onclick="renderPage(\'admin-dashboard\')" class="btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></button>'
        + '<h2>👥 Joueurs (' + users.length + ')</h2></div>'
        + '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>'
        + '<th>Joueur</th><th>Rôle</th><th>🪙</th><th>Packs</th><th>Trades</th><th>Cartes</th><th>Statut</th><th>Actions</th>'
        + '</tr></thead><tbody>';

    for (const u of users) {
        const isSelf = u.id == currentUser.id;
        const safeName = u.name.replace(/'/g, "\\'");
        html += '<tr>'
            + '<td><div style="font-weight:600">' + u.name + '</div><div style="font-size:.75rem;color:#8b9bb5">' + u.email + '</div></td>'
            + '<td><span style="color:' + (u.role==='admin'?'#fbbf24':'#8b9bb5') + '">' + (u.role==='admin'?'⭐ Admin':'Joueur') + '</span></td>'
            + '<td>' + Number(u.coins||0).toLocaleString() + '</td>'
            + '<td>' + (u.packs_opened||0) + '</td>'
            + '<td>' + (u.trades_done||0) + '</td>'
            + '<td>' + (u.total_cards||0) + '</td>'
            + '<td>' + (u.is_banned ? '<span style="color:#ef4444">🚫</span>' : '<span style="color:#22c55e">✅</span>') + '</td>'
            + '<td style="white-space:nowrap">'
            + '<button onclick="adminViewUserInventory(' + u.id + ',\'' + safeName + '\')" class="btn-secondary btn-sm" title="Inventaire">📦</button>'
            + (!isSelf
                ? ' <button onclick="adminGiveCoins(' + u.id + ',\'' + safeName + '\')" class="btn-secondary btn-sm" title="Pièces">🪙</button>'
                + ' <button onclick="adminToggleRole(' + u.id + ',\'' + safeName + '\',\'' + u.role + '\')" class="btn-secondary btn-sm" title="Rôle">⭐</button>'
                + ' <button onclick="adminToggleBan(' + u.id + ',' + (u.is_banned?0:1) + ',\'' + safeName + '\')" class="' + (u.is_banned?'btn-success':'btn-danger') + ' btn-sm">' + (u.is_banned?'Débannir':'Bannir') + '</button>'
                : ' <span style="color:#8b9bb5;font-size:.75rem">(vous)</span>')
            + '</td></tr>';
    }
    html += '</tbody></table></div><div id="userInventoryPanel" style="display:none;margin-top:20px"></div>';
    app.innerHTML = html;
}

async function adminGiveCoins(userId, userName) {
    const amount = prompt('Pièces à donner à ' + userName + ' :\n(négatif pour retirer)', '100');
    if (amount === null) return;
    const d = await fetchAPI('adminAddCoins', 'POST', { user_id: userId, amount: parseInt(amount) });
    if (d.success) { showToast(userName + ' : ' + d.new_coins + ' 🪙'); renderAdminUsers(); }
    else showToast(d.error || 'Erreur', true);
}

async function adminToggleRole(userId, userName, currentRole) {
    const newRole = currentRole === 'admin' ? 'player' : 'admin';
    if (!confirm((currentRole==='admin' ? 'Rétrograder ' : 'Promouvoir admin ') + userName + ' ?')) return;
    const d = await fetchAPI('adminSetRole', 'POST', { user_id: userId, role: newRole });
    if (d.success) { showToast(userName + ' → ' + newRole); renderAdminUsers(); }
    else showToast(d.error || 'Erreur', true);
}

async function adminToggleBan(userId, ban, userName) {
    if (!confirm((ban?'Bannir ':'Débannir ') + userName + ' ?')) return;
    const d = await fetchAPI('adminBanUser', 'POST', { user_id: userId, ban });
    if (d.success) { showToast(userName + (ban?' banni':' débanni')); renderAdminUsers(); }
    else showToast(d.error || 'Erreur', true);
}

async function adminViewUserInventory(userId, userName) {
    const panel = document.getElementById('userInventoryPanel');
    if (!panel) return;
    panel.style.display = 'block';
    panel.innerHTML = '<p style="color:#8b9bb5">Chargement…</p>';
    const d = await fetchAPI('adminGetUserInventory&user_id=' + userId);
    const inv = d.inventory || [];
    const safeName = userName.replace(/'/g, "\\'");
    let html = '<div style="background:#111827;border:1px solid #2d3a5e;border-radius:16px;padding:16px">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">'
        + '<h3>📦 ' + userName + ' (' + inv.length + ' types) — ' + coinsHtml(d.user?.coins||0) + '</h3>'
        + '<button onclick="document.getElementById(\'userInventoryPanel\').style.display=\'none\'" class="btn-secondary btn-sm">✕ Fermer</button></div>'
        + (inv.length === 0 ? '<p style="color:#8b9bb5">Collection vide</p>'
            : '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Img</th><th>Nom</th><th>Rareté</th><th>Qté</th><th>Action</th></tr></thead><tbody>'
            + inv.map(c => '<tr>'
                + '<td><img src="' + (c.image_url||('img/cards/'+c.card_id+'.png')) + '" style="width:36px;height:36px;object-fit:cover;border-radius:6px" onerror="this.style.display=\'none\'"></td>'
                + '<td>' + c.name + '</td>'
                + '<td><span class="' + rarityClass(c.rarity_name) + '">' + rarityIcon(c.rarity_name) + ' ' + c.rarity_name + '</span></td>'
                + '<td>' + c.quantity + '</td>'
                + '<td><button onclick="window.adminRemoveUserCard(' + userId + ',' + c.card_id + ',\'' + safeName + '\')" class="btn-danger btn-sm">🗑️</button></td>'
                + '</tr>').join('')
            + '</tbody></table></div>')
        + '</div>';
    panel.innerHTML = html;
    panel.scrollIntoView({ behavior: 'smooth' });
}

window.adminRemoveUserCard = async (userId, cardId, userName) => {
    if (!confirm('Retirer cette carte de la collection de ' + userName + ' ?')) return;
    const d = await fetchAPI('adminDeleteUserCard', 'POST', { user_id: userId, card_id: cardId });
    if (d.success) { showToast('Carte retirée'); adminViewUserInventory(userId, userName); }
    else showToast(d.error || 'Erreur', true);
};

// ═══════════════════════════════════════════════════════════════════
// ADMIN – QUÊTES
// ═══════════════════════════════════════════════════════════════════
async function renderAdminQuests() {
    const app = document.getElementById('app');
    app.innerHTML = '<p style="color:#8b9bb5;text-align:center;padding:40px">Chargement…</p>';
    const d = await fetchAPI('getQuests');
    const quests = d.quests || [];

    const condTypes = ['login','open_pack','collect_cards','make_trade','complete_trade'];
    const condLabels = { login:'Connexion', open_pack:'Ouvrir un pack', collect_cards:'Posséder X cartes', make_trade:'Proposer un échange', complete_trade:'Conclure un échange' };

    let html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
        + '<button onclick="renderPage(\'admin-dashboard\')" class="btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></button>'
        + '<h2>📜 Gestion Quêtes</h2></div>'
        + '<div class="admin-form-card"><h3>➕ Nouvelle quête</h3>'
        + '<div class="form-row">'
        + '<div class="form-group"><label>Titre</label><input id="qf_title" class="form-input" placeholder="Titre"></div>'
        + '<div class="form-group"><label>Icône Font Awesome</label><input id="qf_icon" class="form-input" value="fas fa-star"></div></div>'
        + '<div class="form-group"><label>Description</label><input id="qf_desc" class="form-input" placeholder="Description"></div>'
        + '<div class="form-row">'
        + '<div class="form-group"><label>Récompense (🪙)</label><input id="qf_reward" type="number" class="form-input" value="100"></div>'
        + '<div class="form-group"><label>Type</label><select id="qf_type" class="form-input"><option value="one_time">Permanente</option><option value="daily">Quotidienne</option><option value="weekly">Hebdomadaire</option></select></div>'
        + '<div class="form-group"><label>Condition</label><select id="qf_cond" class="form-input">'
        + condTypes.map(c => '<option value="' + c + '">' + condLabels[c] + '</option>').join('') + '</select></div>'
        + '<div class="form-group"><label>Cible (nombre)</label><input id="qf_val" type="number" class="form-input" value="1" min="1"></div></div>'
        + '<button onclick="adminCreateQuest()" class="btn-primary btn-sm"><i class="fas fa-save"></i> Créer</button></div>'
        + '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>'
        + '<th>#</th><th>Titre</th><th>Type</th><th>Condition</th><th>Cible</th><th>🪙</th><th>Statut</th><th>Actions</th>'
        + '</tr></thead><tbody>'
        + quests.map(q => '<tr>'
            + '<td>#' + q.id + '</td>'
            + '<td><i class="' + (q.icon||'fas fa-star') + '" style="color:#ffb347"></i> ' + q.title + '</td>'
            + '<td>' + ({one_time:'🏆 Perm.',daily:'📅 Jour',weekly:'📆 Semaine'}[q.quest_type]||q.quest_type) + '</td>'
            + '<td style="font-size:.8rem">' + (condLabels[q.condition_type]||q.condition_type) + '</td>'
            + '<td>' + q.condition_value + '</td>'
            + '<td style="color:#ffb347">' + q.reward_coins + '</td>'
            + '<td>' + (q.is_active ? '<span style="color:#22c55e">✅</span>' : '<span style="color:#6b7280">⏸</span>') + '</td>'
            + '<td style="white-space:nowrap">'
            + '<button onclick="adminToggleQuest(' + q.id + ')" class="' + (q.is_active?'btn-secondary':'btn-success') + ' btn-sm">' + (q.is_active?'⏸':'▶') + '</button> '
            + '<button onclick="adminDeleteQuest(' + q.id + ',\'' + q.title.replace(/'/g,"\\'") + '\')" class="btn-danger btn-sm">🗑️</button>'
            + '</td></tr>'
        ).join('') + '</tbody></table></div>';
    app.innerHTML = html;
}

async function adminCreateQuest() {
    const d = await fetchAPI('adminCreateQuest', 'POST', {
        title:           document.getElementById('qf_title').value,
        description:     document.getElementById('qf_desc').value,
        icon:            document.getElementById('qf_icon').value,
        reward_coins:    document.getElementById('qf_reward').value,
        quest_type:      document.getElementById('qf_type').value,
        condition_type:  document.getElementById('qf_cond').value,
        condition_value: document.getElementById('qf_val').value
    });
    if (d.success) { showToast('Quête créée'); renderAdminQuests(); }
    else showToast(d.error || 'Erreur', true);
}

async function adminToggleQuest(id) {
    const d = await fetchAPI('adminToggleQuest', 'POST', { id });
    if (d.success) { showToast('Quête mise à jour'); renderAdminQuests(); }
    else showToast(d.error || 'Erreur', true);
}

async function adminDeleteQuest(id, title) {
    if (!confirm('Supprimer la quête "' + title + '" ?')) return;
    const d = await fetchAPI('adminDeleteQuest', 'POST', { id });
    if (d.success) { showToast('Quête supprimée'); renderAdminQuests(); }
    else showToast(d.error || 'Erreur', true);
}

// ═══════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
    const ok = await checkAuth();
    if (!ok) return;

    document.querySelectorAll('.nav-item-bottom').forEach(nav => {
        nav.addEventListener('click', () => renderPage(nav.dataset.page));
    });

    const modal = document.getElementById('cardModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) this.style.display = 'none';
        });
    }

    renderMainMenu();
});
