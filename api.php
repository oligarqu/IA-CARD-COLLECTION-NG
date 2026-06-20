<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

// ══════════════════════════════════════════════════════════════════════════════
// AUTO-MIGRATIONS (idempotentes — ignorées si déjà appliquées)
// ══════════════════════════════════════════════════════════════════════════════

$migrations = [
    "ALTER TABLE users ADD COLUMN coins INT DEFAULT 800",
    "ALTER TABLE users ADD COLUMN packs_opened INT DEFAULT 0",
    "ALTER TABLE users ADD COLUMN trades_done INT DEFAULT 0",
    "ALTER TABLE users ADD COLUMN logins_total INT DEFAULT 0",
    "ALTER TABLE users ADD COLUMN is_banned TINYINT(1) DEFAULT 0",
    "ALTER TABLE trades ADD COLUMN proposer_coins INT DEFAULT 0",
    "CREATE TABLE IF NOT EXISTS quests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(60) DEFAULT 'fas fa-star',
        reward_coins INT DEFAULT 100,
        quest_type ENUM('one_time','daily','weekly') DEFAULT 'one_time',
        condition_type VARCHAR(50) NOT NULL,
        condition_value INT DEFAULT 1,
        is_active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS user_quests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        quest_id INT NOT NULL,
        progress INT DEFAULT 0,
        completed TINYINT DEFAULT 0,
        claimed TINYINT DEFAULT 0,
        period_key VARCHAR(20) DEFAULT 'permanent',
        UNIQUE KEY uq_upk (user_id, quest_id, period_key)
    )",
    "CREATE TABLE IF NOT EXISTS activity_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED,
        user_name VARCHAR(255),
        action VARCHAR(100),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "UPDATE users SET coins = 800 WHERE coins = 0 OR coins IS NULL",
];
foreach ($migrations as $sql) {
    try { $pdo->exec($sql); } catch (Exception $e) { /* déjà appliquée */ }
}

// Seed quêtes par défaut
try {
    if ((int)$pdo->query("SELECT COUNT(*) FROM quests")->fetchColumn() === 0) {
        $pdo->exec("INSERT INTO quests
            (id, title, description, icon, reward_coins, quest_type, condition_type, condition_value) VALUES
            (1,'Bienvenue !','Connectez-vous pour la premiere fois','fas fa-door-open',200,'one_time','login',1),
            (2,'Premier Pack','Ouvrez votre premier pack de cartes','fas fa-box-open',150,'one_time','open_pack',1),
            (3,'Collectionneur Bronze','Possedez 5 cartes dans votre collection','fas fa-layer-group',200,'one_time','collect_cards',5),
            (4,'Collectionneur Argent','Possedez 15 cartes dans votre collection','fas fa-layer-group',400,'one_time','collect_cards',15),
            (5,'Collectionneur Or','Possedez 30 cartes dans votre collection','fas fa-trophy',750,'one_time','collect_cards',30),
            (6,'Negociateur','Proposez votre premier echange','fas fa-handshake',100,'one_time','make_trade',1),
            (7,'Partenaire','Concluez votre premier echange','fas fa-check-circle',300,'one_time','complete_trade',1),
            (8,'Marathonien des Packs','Ouvrez 10 packs au total','fas fa-fire',500,'one_time','open_pack',10),
            (9,'Connexion du jour','Connectez-vous aujourd hui pour gagner des pieces','fas fa-calendar-check',50,'daily','login',1),
            (10,'Pack du jour','Ouvrez un pack aujourd hui','fas fa-gift',75,'daily','open_pack',1),
            (11,'Chasseur hebdo','Ouvrez 5 packs cette semaine','fas fa-bolt',300,'weekly','open_pack',5),
            (12,'Echangiste hebdo','Concluez 2 echanges cette semaine','fas fa-exchange-alt',400,'weekly','complete_trade',2)
        ");
    }
} catch (Exception $e) {}

// Seed packs supplémentaires + cards
try {
    $pdo->exec("UPDATE packs SET price=250 WHERE id=1 AND price=100");
    $pdo->exec("INSERT IGNORE INTO packs (id,name,description,cards_per_pack,price,is_active) VALUES
        (2,'Pack Debutant','Parfait pour commencer - cartes communes garanties',5,50,1),
        (3,'Pack Standard','Equilibre communes et rares',5,200,1),
        (4,'Pack Epique','Des cartes epiques vous attendent !',5,500,1),
        (5,'Pack Legendaire','Les cartes les plus rares du jeu',5,1000,1)
    ");
    // Pack 2 – communes only
    $pdo->exec("INSERT IGNORE INTO pack_card(pack_id,card_id,weight) VALUES
        (2,1,15),(2,2,15),(2,3,15),(2,4,15),(2,5,10),(2,6,10),(2,7,10),(2,8,10),(2,9,10),(2,10,10)");
    // Pack 3 – communes + rares
    $pdo->exec("INSERT IGNORE INTO pack_card(pack_id,card_id,weight) VALUES
        (3,1,40),(3,3,40),(3,7,40),(3,8,35),(3,11,20),(3,12,20),(3,14,20),(3,15,20),(3,17,20),(3,20,8),(3,22,5)");
    // Pack 4 – rares + epics
    $pdo->exec("INSERT IGNORE INTO pack_card(pack_id,card_id,weight) VALUES
        (4,11,20),(4,12,20),(4,14,20),(4,17,20),(4,20,25),(4,21,25),(4,22,25),(4,23,25),(4,24,20),(4,25,15),(4,28,15),(4,29,5),(4,30,5)");
    // Pack 5 – epics + legendaires
    $pdo->exec("INSERT IGNORE INTO pack_card(pack_id,card_id,weight) VALUES
        (5,20,15),(5,21,15),(5,22,15),(5,24,15),(5,25,20),(5,27,15),(5,28,15),(5,29,25),(5,30,25),(5,31,25),(5,32,25),(5,33,25)");
} catch (Exception $e) {}

// Créer dossier images
$imgDir = __DIR__ . '/img/cards/';
if (!is_dir($imgDir)) @mkdir($imgDir, 0755, true);

$action = $_GET['action'] ?? '';

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function requireAuth() {
    if (!isset($_SESSION['user'])) {
        echo json_encode(['success' => false, 'error' => 'Non authentifié']);
        exit();
    }
    return $_SESSION['user'];
}

function requireAdmin() {
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        echo json_encode(['success' => false, 'error' => 'Accès refusé – Admin requis']);
        exit();
    }
    return $_SESSION['user'];
}

function weightedRandom($items) {
    $total = array_sum(array_column($items, 'weight'));
    $rand = mt_rand(1, $total);
    $cur = 0;
    foreach ($items as $item) {
        $cur += $item['weight'];
        if ($rand <= $cur) return $item;
    }
    return $items[0];
}

function getPeriodKey($type) {
    if ($type === 'daily')  return date('Y-m-d');
    if ($type === 'weekly') return date('Y-\WW');
    return 'permanent';
}

function updateQuestProgress($pdo, $userId, $condType, $amount = 1) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM quests WHERE condition_type=? AND is_active=1");
        $stmt->execute([$condType]);
        foreach ($stmt->fetchAll() as $q) {
            $pk = getPeriodKey($q['quest_type']);
            $pdo->prepare("INSERT IGNORE INTO user_quests(user_id,quest_id,progress,period_key) VALUES(?,?,0,?)")
                ->execute([$userId, $q['id'], $pk]);
            $pdo->prepare("UPDATE user_quests SET progress=LEAST(progress+?,?) WHERE user_id=? AND quest_id=? AND period_key=? AND claimed=0")
                ->execute([$amount, $q['condition_value'], $userId, $q['id'], $pk]);
            $pdo->prepare("UPDATE user_quests SET completed=1 WHERE user_id=? AND quest_id=? AND period_key=? AND progress>=? AND completed=0")
                ->execute([$userId, $q['id'], $pk, $q['condition_value']]);
        }
    } catch (Exception $e) {}
}

function updateQuestProgressAbsolute($pdo, $userId, $condType, $value) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM quests WHERE condition_type=? AND quest_type='one_time' AND is_active=1");
        $stmt->execute([$condType]);
        foreach ($stmt->fetchAll() as $q) {
            $pdo->prepare("INSERT IGNORE INTO user_quests(user_id,quest_id,progress,period_key) VALUES(?,?,0,'permanent')")
                ->execute([$userId, $q['id']]);
            $pdo->prepare("UPDATE user_quests SET progress=LEAST(?,?) WHERE user_id=? AND quest_id=? AND period_key='permanent' AND claimed=0")
                ->execute([$value, $q['condition_value'], $userId, $q['id']]);
            $pdo->prepare("UPDATE user_quests SET completed=1 WHERE user_id=? AND quest_id=? AND period_key='permanent' AND progress>=? AND completed=0")
                ->execute([$userId, $q['id'], $q['condition_value']]);
        }
    } catch (Exception $e) {}
}

function countClaimable($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM user_quests uq
            JOIN quests q ON uq.quest_id=q.id
            WHERE uq.user_id=? AND uq.completed=1 AND uq.claimed=0
            AND ((q.quest_type='one_time' AND uq.period_key='permanent')
              OR (q.quest_type='daily'   AND uq.period_key=?)
              OR (q.quest_type='weekly'  AND uq.period_key=?))
        ");
        $stmt->execute([$userId, date('Y-m-d'), date('Y-\WW')]);
        return (int)$stmt->fetchColumn();
    } catch (Exception $e) { return 0; }
}

function logActivity($pdo, $userId, $userName, $action, $details = '') {
    try {
        $pdo->prepare("INSERT INTO activity_log(user_id,user_name,action,details) VALUES(?,?,?,?)")
            ->execute([$userId, $userName, $action, $details]);
    } catch (Exception $e) {}
}

// ══════════════════════════════════════════════════════════════════════════════
// ROUTER
// ══════════════════════════════════════════════════════════════════════════════

try {
    switch ($action) {

        // ─── CARTES & PACKS ────────────────────────────────────────────────
        case 'getCards':
            $stmt = $pdo->query("SELECT c.*,r.name as rarity_name,r.color,r.base_value,ct.name as type_name
                FROM cards c JOIN rarities r ON c.rarity_id=r.id JOIN card_types ct ON c.card_type_id=ct.id ORDER BY c.id");
            echo json_encode(['success'=>true,'cards'=>$stmt->fetchAll()]);
            break;

        case 'getRarities':
            echo json_encode(['success'=>true,'rarities'=>$pdo->query("SELECT * FROM rarities ORDER BY id")->fetchAll()]);
            break;

        case 'getCardTypes':
            echo json_encode(['success'=>true,'types'=>$pdo->query("SELECT * FROM card_types ORDER BY id")->fetchAll()]);
            break;

        case 'getPacks':
            $stmt = $pdo->query("SELECT * FROM packs WHERE is_active=1 ORDER BY price ASC");
            $packs = $stmt->fetchAll();
            foreach ($packs as &$pack) {
                $s = $pdo->prepare("SELECT pc.*,c.name,c.attack,c.hp,c.is_object,c.description,r.name as rarity_name,r.color
                    FROM pack_card pc JOIN cards c ON pc.card_id=c.id JOIN rarities r ON c.rarity_id=r.id WHERE pc.pack_id=?");
                $s->execute([$pack['id']]);
                $pack['cards'] = $s->fetchAll();
            }
            echo json_encode(['success'=>true,'packs'=>$packs]);
            break;

        case 'openPack':
            $user   = requireAuth();
            $userId = $user['id'];
            $packId = $_POST['pack_id'] ?? 1;

            // Récupérer le pack
            $sp = $pdo->prepare("SELECT * FROM packs WHERE id=? AND is_active=1");
            $sp->execute([$packId]);
            $pack = $sp->fetch();
            if (!$pack) { echo json_encode(['success'=>false,'error'=>'Pack introuvable']); break; }

            // Vérifier les pièces
            $coins = (int)$pdo->prepare("SELECT coins FROM users WHERE id=?")->execute([$userId]) ? $pdo->prepare("SELECT coins FROM users WHERE id=?")->execute([$userId]) || true : 0;
            $coinsStmt = $pdo->prepare("SELECT coins FROM users WHERE id=?");
            $coinsStmt->execute([$userId]);
            $coins = (int)$coinsStmt->fetchColumn();

            if ($coins < (int)$pack['price']) {
                echo json_encode(['success'=>false,'error'=>"Pièces insuffisantes — vous avez $coins 🪙, il en faut {$pack['price']}"]);
                break;
            }

            // Cartes disponibles dans ce pack
            $sc = $pdo->prepare("SELECT pc.card_id,pc.weight,c.*,r.name as rarity_name
                FROM pack_card pc JOIN cards c ON pc.card_id=c.id JOIN rarities r ON c.rarity_id=r.id WHERE pc.pack_id=?");
            $sc->execute([$packId]);
            $cardsInPack = $sc->fetchAll();
            if (empty($cardsInPack)) { echo json_encode(['success'=>false,'error'=>'Ce pack ne contient aucune carte']); break; }

            // Tirer les cartes
            $drawn = [];
            for ($i = 0; $i < (int)$pack['cards_per_pack']; $i++) {
                $card = weightedRandom($cardsInPack);
                $drawn[] = $card;
                $se = $pdo->prepare("SELECT id,quantity FROM inventory WHERE user_id=? AND card_id=?");
                $se->execute([$userId, $card['card_id']]);
                $existing = $se->fetch();
                if ($existing) {
                    $pdo->prepare("UPDATE inventory SET quantity=quantity+1,updated_at=NOW() WHERE id=?")->execute([$existing['id']]);
                } else {
                    $pdo->prepare("INSERT INTO inventory(user_id,card_id,quantity,created_at,updated_at) VALUES(?,?,1,NOW(),NOW())")->execute([$userId,$card['card_id']]);
                }
            }

            // Déduire pièces + incrémenter stats
            $pdo->prepare("UPDATE users SET coins=coins-?,packs_opened=packs_opened+1,updated_at=NOW() WHERE id=?")
                ->execute([$pack['price'],$userId]);

            // Progression des quêtes
            updateQuestProgress($pdo, $userId, 'open_pack', 1);
            $totalCards = (int)$pdo->prepare("SELECT COALESCE(SUM(quantity),0) FROM inventory WHERE user_id=?")->execute([$userId]) ? 0 : 0;
            $tcStmt = $pdo->prepare("SELECT COALESCE(SUM(quantity),0) FROM inventory WHERE user_id=?");
            $tcStmt->execute([$userId]);
            $totalCards = (int)$tcStmt->fetchColumn();
            updateQuestProgressAbsolute($pdo, $userId, 'collect_cards', $totalCards);

            // Nouvelles pièces
            $newCoins = (int)$pdo->prepare("SELECT coins FROM users WHERE id=?")->execute([$userId]) ? 0 : 0;
            $ncStmt = $pdo->prepare("SELECT coins FROM users WHERE id=?");
            $ncStmt->execute([$userId]);
            $newCoins = (int)$ncStmt->fetchColumn();

            logActivity($pdo, $userId, $user['name'], 'Pack ouvert', $pack['name'].' ('.$pack['price'].' 🪙)');
            echo json_encode([
                'success'   => true,
                'cards'     => $drawn,
                'pack_name' => $pack['name'],
                'coins_spent'=> $pack['price'],
                'coins_left' => $newCoins,
                'claimable' => countClaimable($pdo, $userId),
            ]);
            break;

        // ─── INVENTAIRE ────────────────────────────────────────────────────
        case 'getInventory':
            $user   = requireAuth();
            $userId = $user['id'];
            $stmt = $pdo->prepare("SELECT i.*,c.name,c.attack,c.hp,c.is_object,c.description,c.image_url,
                r.name as rarity_name,r.color,r.base_value
                FROM inventory i JOIN cards c ON i.card_id=c.id JOIN rarities r ON c.rarity_id=r.id
                WHERE i.user_id=? ORDER BY r.probability_weight ASC,c.name ASC");
            $stmt->execute([$userId]);
            $inventory = $stmt->fetchAll();
            $totalCards=0; $totalValue=0;
            foreach ($inventory as $item) { $totalCards+=$item['quantity']; $totalValue+=$item['base_value']*$item['quantity']; }
            // Coins
            $cs = $pdo->prepare("SELECT coins FROM users WHERE id=?"); $cs->execute([$userId]);
            $coins = (int)$cs->fetchColumn();
            echo json_encode(['success'=>true,'inventory'=>$inventory,'total_value'=>$totalValue,'total_cards'=>$totalCards,'coins'=>$coins]);
            break;

        // ─── AUTH ──────────────────────────────────────────────────────────
        case 'login':
            $email    = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email=?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            if ($user && password_verify($password, $user['password'])) {
                if (!empty($user['is_banned'])) { echo json_encode(['success'=>false,'error'=>'Votre compte a été banni.']); break; }
                $pdo->prepare("UPDATE users SET logins_total=logins_total+1,updated_at=NOW() WHERE id=?")->execute([$user['id']]);
                $_SESSION['user'] = ['id'=>$user['id'],'name'=>$user['name'],'email'=>$user['email'],'role'=>$user['role']];
                updateQuestProgress($pdo, $user['id'], 'login', 1);
                logActivity($pdo, $user['id'], $user['name'], 'Connexion', '');
                $claimable = countClaimable($pdo, $user['id']);
                echo json_encode(['success'=>true,'user'=>$_SESSION['user'],'claimable'=>$claimable]);
            } else {
                echo json_encode(['success'=>false,'error'=>'Email ou mot de passe incorrect']);
            }
            break;

        case 'register':
            $name=$_POST['name']??''; $email=$_POST['email']??''; $password=$_POST['password']??''; $conf=$_POST['password_confirmation']??'';
            if (empty($name)||empty($email)||empty($password)) { echo json_encode(['success'=>false,'error'=>'Tous les champs sont requis']); break; }
            if ($password!==$conf) { echo json_encode(['success'=>false,'error'=>'Mots de passe différents']); break; }
            if (strlen($password)<6) { echo json_encode(['success'=>false,'error'=>'Mot de passe trop court (min 6)']); break; }
            $se = $pdo->prepare("SELECT id FROM users WHERE email=?"); $se->execute([$email]);
            if ($se->fetch()) { echo json_encode(['success'=>false,'error'=>'Email déjà utilisé']); break; }
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $pdo->prepare("INSERT INTO users(name,email,password,role,coins,created_at,updated_at) VALUES(?,?,?,'player',800,NOW(),NOW())")->execute([$name,$email,$hashed]);
            echo json_encode(['success'=>true,'email'=>$email]);
            break;

        case 'logout':
            session_destroy();
            echo json_encode(['success'=>true]);
            break;

        case 'checkAuth':
            if (isset($_SESSION['user'])) {
                $userId = $_SESSION['user']['id'];
                updateQuestProgress($pdo, $userId, 'login', 1); // daily login auto
                $cs2 = $pdo->prepare("SELECT coins,packs_opened,trades_done FROM users WHERE id=?"); $cs2->execute([$userId]);
                $stats = $cs2->fetch();
                $claimable = countClaimable($pdo, $userId);
                echo json_encode(['success'=>true,'user'=>$_SESSION['user'],'coins'=>(int)($stats['coins']??800),'claimable'=>$claimable]);
            } else {
                echo json_encode(['success'=>false]);
            }
            break;

        // ─── PROFIL ────────────────────────────────────────────────────────
        case 'getProfile':
            $user   = requireAuth();
            $userId = $user['id'];
            $su = $pdo->prepare("SELECT coins,packs_opened,trades_done,logins_total,created_at FROM users WHERE id=?");
            $su->execute([$userId]);
            $stats = $su->fetch();
            $si = $pdo->prepare("SELECT COALESCE(SUM(quantity),0) as total,COALESCE(SUM(i.quantity*r.base_value),0) as value
                FROM inventory i JOIN cards c ON i.card_id=c.id JOIN rarities r ON c.rarity_id=r.id WHERE i.user_id=?");
            $si->execute([$userId]);
            $inv = $si->fetch();
            $claimable = countClaimable($pdo, $userId);
            echo json_encode(['success'=>true,'stats'=>array_merge($stats,$inv),'claimable'=>$claimable]);
            break;

        // ─── QUÊTES ────────────────────────────────────────────────────────
        case 'getQuests':
            $user   = requireAuth();
            $userId = $user['id'];
            $quests = $pdo->query("SELECT * FROM quests WHERE is_active=1 ORDER BY quest_type,id")->fetchAll();
            foreach ($quests as &$q) {
                $pk = getPeriodKey($q['quest_type']);
                $su = $pdo->prepare("SELECT * FROM user_quests WHERE user_id=? AND quest_id=? AND period_key=?");
                $su->execute([$userId,$q['id'],$pk]);
                $uq = $su->fetch();
                $q['user_progress'] = $uq ? (int)$uq['progress'] : 0;
                $q['completed']     = $uq ? (bool)$uq['completed'] : false;
                $q['claimed']       = $uq ? (bool)$uq['claimed'] : false;
                $q['period_key']    = $pk;
            }
            echo json_encode(['success'=>true,'quests'=>$quests]);
            break;

        case 'claimQuest':
            $user     = requireAuth();
            $userId   = $user['id'];
            $questId  = (int)($_POST['quest_id']??0);
            $periodKey= $_POST['period_key']??'permanent';

            $sq = $pdo->prepare("SELECT uq.*,q.reward_coins,q.title FROM user_quests uq
                JOIN quests q ON uq.quest_id=q.id
                WHERE uq.user_id=? AND uq.quest_id=? AND uq.period_key=? AND uq.completed=1 AND uq.claimed=0");
            $sq->execute([$userId,$questId,$periodKey]);
            $uq = $sq->fetch();
            if (!$uq) { echo json_encode(['success'=>false,'error'=>'Quête non terminée ou déjà réclamée']); break; }

            $pdo->prepare("UPDATE users SET coins=coins+?,updated_at=NOW() WHERE id=?")->execute([$uq['reward_coins'],$userId]);
            $pdo->prepare("UPDATE user_quests SET claimed=1 WHERE user_id=? AND quest_id=? AND period_key=?")->execute([$userId,$questId,$periodKey]);

            $nc = $pdo->prepare("SELECT coins FROM users WHERE id=?"); $nc->execute([$userId]);
            $newCoins = (int)$nc->fetchColumn();
            logActivity($pdo,$userId,$user['name'],'Quête réclamée',$uq['title'].' (+'.($uq['reward_coins']).' 🪙)');
            echo json_encode(['success'=>true,'coins_earned'=>$uq['reward_coins'],'new_coins'=>$newCoins,'quest_title'=>$uq['title']]);
            break;

        // Admin – gérer quêtes
        case 'adminCreateQuest':
            requireAdmin();
            $title  = trim($_POST['title']??'');
            $desc   = trim($_POST['description']??'');
            $icon   = trim($_POST['icon']??'fas fa-star');
            $reward = (int)($_POST['reward_coins']??100);
            $type   = $_POST['quest_type']??'one_time';
            $cond   = $_POST['condition_type']??'login';
            $val    = (int)($_POST['condition_value']??1);
            if (empty($title)) { echo json_encode(['success'=>false,'error'=>'Titre requis']); break; }
            $pdo->prepare("INSERT INTO quests(title,description,icon,reward_coins,quest_type,condition_type,condition_value) VALUES(?,?,?,?,?,?,?)")
                ->execute([$title,$desc,$icon,$reward,$type,$cond,$val]);
            echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId()]);
            break;

        case 'adminToggleQuest':
            requireAdmin();
            $id = (int)($_POST['id']??0);
            $pdo->prepare("UPDATE quests SET is_active=1-is_active WHERE id=?")->execute([$id]);
            echo json_encode(['success'=>true]);
            break;

        case 'adminDeleteQuest':
            requireAdmin();
            $id = (int)($_POST['id']??$_GET['id']??0);
            $pdo->prepare("DELETE FROM quests WHERE id=?")->execute([$id]);
            echo json_encode(['success'=>true]);
            break;

        // ─── UTILISATEURS (pour échanges) ──────────────────────────────────
        case 'getUsers':
            $user = requireAuth();
            $stmt = $pdo->prepare("SELECT id,name FROM users WHERE id!=? AND (is_banned IS NULL OR is_banned=0) ORDER BY name");
            $stmt->execute([$user['id']]);
            echo json_encode(['success'=>true,'users'=>$stmt->fetchAll()]);
            break;

        case 'getUserCards':
            requireAuth();
            $targetId = (int)($_GET['user_id']??0);
            $stmt = $pdo->prepare("SELECT i.*,c.name,c.attack,c.hp,c.is_object,c.description,c.image_url,
                r.name as rarity_name,r.color,r.base_value
                FROM inventory i JOIN cards c ON i.card_id=c.id JOIN rarities r ON c.rarity_id=r.id
                WHERE i.user_id=? ORDER BY r.probability_weight ASC,c.name ASC");
            $stmt->execute([$targetId]);
            echo json_encode(['success'=>true,'inventory'=>$stmt->fetchAll()]);
            break;

        // ─── ÉCHANGES ──────────────────────────────────────────────────────
        case 'getTrades':
            $user   = requireAuth();
            $userId = $user['id'];
            $stmt = $pdo->prepare("SELECT t.*,up.name as proposer_name,ur.name as receiver_name
                FROM trades t JOIN users up ON t.proposer_id=up.id JOIN users ur ON t.receiver_id=ur.id
                WHERE t.status='pending' AND (t.proposer_id=? OR t.receiver_id=?) ORDER BY t.created_at DESC");
            $stmt->execute([$userId,$userId]);
            $trades = $stmt->fetchAll();
            foreach ($trades as &$t) {
                $si = $pdo->prepare("SELECT ti.*,c.name,c.attack,c.hp,c.description,c.image_url,c.is_object,r.name as rarity_name,r.color
                    FROM trade_items ti JOIN cards c ON ti.card_id=c.id JOIN rarities r ON c.rarity_id=r.id WHERE ti.trade_id=?");
                $si->execute([$t['id']]);
                $t['items'] = $si->fetchAll();
            }
            echo json_encode(['success'=>true,'trades'=>$trades]);
            break;

        case 'getTradeHistory':
            $user   = requireAuth();
            $userId = $user['id'];
            $stmt = $pdo->prepare("SELECT t.*,up.name as proposer_name,ur.name as receiver_name
                FROM trades t JOIN users up ON t.proposer_id=up.id JOIN users ur ON t.receiver_id=ur.id
                WHERE t.status!='pending' AND (t.proposer_id=? OR t.receiver_id=?) ORDER BY t.updated_at DESC LIMIT 30");
            $stmt->execute([$userId,$userId]);
            echo json_encode(['success'=>true,'trades'=>$stmt->fetchAll()]);
            break;

        case 'proposeTrade':
            $user       = requireAuth();
            $proposerId = $user['id'];
            $receiverId = (int)($_POST['receiver_id']??0);
            $myCards    = json_decode($_POST['my_cards']??'[]', true);
            $wantedCards= json_decode($_POST['wanted_cards']??'[]', true);
            $coinsOffer = max(0,(int)($_POST['coins_offered']??0));

            if (!$receiverId||empty($myCards)||empty($wantedCards)) {
                echo json_encode(['success'=>false,'error'=>"Données incomplètes"]);break;
            }
            if ($receiverId===$proposerId) {
                echo json_encode(['success'=>false,'error'=>"Impossible de s'échanger avec soi-même"]);break;
            }
            // Vérifier pièces du proposeur si offre de pièces
            if ($coinsOffer > 0) {
                $cs = $pdo->prepare("SELECT coins FROM users WHERE id=?"); $cs->execute([$proposerId]);
                $avail = (int)$cs->fetchColumn();
                if ($avail < $coinsOffer) {
                    echo json_encode(['success'=>false,'error'=>"Vous n'avez pas assez de pièces ($avail 🪙)"]); break;
                }
            }
            // Vérifier possession + non-blocage des cartes
            foreach ($myCards as $cardId) {
                $s = $pdo->prepare("SELECT quantity FROM inventory WHERE user_id=? AND card_id=? AND quantity>0");
                $s->execute([$proposerId,$cardId]);
                if (!$s->fetch()) { echo json_encode(['success'=>false,'error'=>"Vous ne possédez pas la carte #$cardId"]); break 2; }
                $sb = $pdo->prepare("SELECT ti.id FROM trade_items ti JOIN trades t ON ti.trade_id=t.id WHERE t.status='pending' AND ti.from_user_id=? AND ti.card_id=? LIMIT 1");
                $sb->execute([$proposerId,$cardId]);
                if ($sb->fetch()) { echo json_encode(['success'=>false,'error'=>"Carte #$cardId déjà dans un échange en attente"]); break 2; }
            }
            foreach ($wantedCards as $cardId) {
                $s = $pdo->prepare("SELECT quantity FROM inventory WHERE user_id=? AND card_id=? AND quantity>0");
                $s->execute([$receiverId,$cardId]);
                if (!$s->fetch()) { echo json_encode(['success'=>false,'error'=>"Le joueur n'a pas la carte #$cardId"]); break 2; }
            }
            $pdo->beginTransaction();
            $pdo->prepare("INSERT INTO trades(proposer_id,receiver_id,status,proposer_coins,created_at,updated_at) VALUES(?,?,'pending',?,NOW(),NOW())")
                ->execute([$proposerId,$receiverId,$coinsOffer]);
            $tradeId = $pdo->lastInsertId();
            $si = $pdo->prepare("INSERT INTO trade_items(trade_id,card_id,from_user_id,to_user_id,created_at,updated_at) VALUES(?,?,?,?,NOW(),NOW())");
            foreach ($myCards as $cardId)    $si->execute([$tradeId,$cardId,$proposerId,$receiverId]);
            foreach ($wantedCards as $cardId) $si->execute([$tradeId,$cardId,$receiverId,$proposerId]);
            $pdo->commit();
            updateQuestProgress($pdo,$proposerId,'make_trade',1);
            logActivity($pdo,$proposerId,$user['name'],'Échange proposé','vers '.$receiverId.' (coins: '.$coinsOffer.')');
            echo json_encode(['success'=>true,'trade_id'=>$tradeId]);
            break;

        case 'acceptTrade':
            $user    = requireAuth();
            $tradeId = (int)($_POST['trade_id']??0);
            $stmt = $pdo->prepare("SELECT * FROM trades WHERE id=? AND receiver_id=? AND status='pending'");
            $stmt->execute([$tradeId,$user['id']]);
            $trade = $stmt->fetch();
            if (!$trade) { echo json_encode(['success'=>false,'error'=>'Échange introuvable ou non autorisé']); break; }

            $si = $pdo->prepare("SELECT * FROM trade_items WHERE trade_id=?"); $si->execute([$tradeId]);
            $items = $si->fetchAll();
            $pdo->beginTransaction();
            foreach ($items as $item) {
                $fromId=$item['from_user_id']; $toId=$item['to_user_id']; $cardId=$item['card_id'];
                $pdo->prepare("UPDATE inventory SET quantity=quantity-1 WHERE user_id=? AND card_id=?")->execute([$fromId,$cardId]);
                $pdo->prepare("DELETE FROM inventory WHERE user_id=? AND card_id=? AND quantity<=0")->execute([$fromId,$cardId]);
                $sc=$pdo->prepare("SELECT id FROM inventory WHERE user_id=? AND card_id=?"); $sc->execute([$toId,$cardId]);
                if ($sc->fetch()) { $pdo->prepare("UPDATE inventory SET quantity=quantity+1,updated_at=NOW() WHERE user_id=? AND card_id=?")->execute([$toId,$cardId]); }
                else { $pdo->prepare("INSERT INTO inventory(user_id,card_id,quantity,created_at,updated_at) VALUES(?,?,1,NOW(),NOW())")->execute([$toId,$cardId]); }
            }
            // Transfert des pièces offertes
            if ((int)$trade['proposer_coins'] > 0) {
                $pdo->prepare("UPDATE users SET coins=coins-? WHERE id=?")->execute([$trade['proposer_coins'],$trade['proposer_id']]);
                $pdo->prepare("UPDATE users SET coins=coins+? WHERE id=?")->execute([$trade['proposer_coins'],$trade['receiver_id']]);
            }
            $pdo->prepare("UPDATE trades SET status='accepted',updated_at=NOW() WHERE id=?")->execute([$tradeId]);
            $pdo->prepare("UPDATE users SET trades_done=trades_done+1 WHERE id IN (?,?)")->execute([$trade['proposer_id'],$trade['receiver_id']]);
            $pdo->commit();
            updateQuestProgress($pdo,$user['id'],'complete_trade',1);
            updateQuestProgress($pdo,$trade['proposer_id'],'complete_trade',1);
            logActivity($pdo,$user['id'],$user['name'],'Échange accepté','Trade #'.$tradeId);
            echo json_encode(['success'=>true]);
            break;

        case 'refuseTrade':
            $user=requireAuth(); $tradeId=(int)($_POST['trade_id']??0);
            $stmt=$pdo->prepare("SELECT id FROM trades WHERE id=? AND receiver_id=? AND status='pending'");
            $stmt->execute([$tradeId,$user['id']]);
            if (!$stmt->fetch()) { echo json_encode(['success'=>false,'error'=>'Non autorisé']); break; }
            $pdo->prepare("UPDATE trades SET status='refused',updated_at=NOW() WHERE id=?")->execute([$tradeId]);
            echo json_encode(['success'=>true]);
            break;

        case 'cancelTrade':
            $user=requireAuth(); $tradeId=(int)($_POST['trade_id']??0);
            $stmt=$pdo->prepare("SELECT id FROM trades WHERE id=? AND proposer_id=? AND status='pending'");
            $stmt->execute([$tradeId,$user['id']]);
            if (!$stmt->fetch()) { echo json_encode(['success'=>false,'error'=>'Non autorisé']); break; }
            $pdo->prepare("UPDATE trades SET status='cancelled',updated_at=NOW() WHERE id=?")->execute([$tradeId]);
            echo json_encode(['success'=>true]);
            break;

        // ─── GÉNÉRATION IA (OpenAI) ───────────────────────────────────────
        case 'generateCard':
            requireAdmin();
            $cardType   = $_POST['card_type']??'humain';
            $rarityName = $_POST['rarity']??'commun';
            $mults = ['commun'=>1,'rare'=>2,'epic'=>4,'legendaire'=>8];
            $mult  = $mults[$rarityName]??1;

            // Fallback procédural si pas de clé OpenAI
            if (!defined('OPENAI_API_KEY') || empty(OPENAI_API_KEY)) {
                $byType = [
                    'humain' => ['Guerrier Ancien','Mage Mystique','Paladin Sacre','Archer Legendaire','Assassin Maudit','Sorcier des Ruines'],
                    'animal' => ['Loup Celeste','Dragon Argente','Phenix Ardent','Tigre Spectral','Faucon Divin','Ours Chamanique'],
                    'mob'    => ['Zombie Renforce','Squelette Ancien','Araignee Venimeuse','Creeper Silencieux','Ghast Infernal'],
                    'boss'   => ['Wither Dechaine','Dragon de l Ombre','Gardien Abyssal','Titan des Neiges','Demon du Nether'],
                    'objet'  => ['Epee des Anciens','Bouclier Runique','Potion Eternelle','Amulette du Destin','Cristal de Pouvoir'],
                ];
                $names = $byType[$cardType] ?? $byType['humain'];
                $name  = $names[array_rand($names)];
                if ($rarityName === 'legendaire') $name .= ' Legendaire';
                elseif ($rarityName === 'epic')   $name .= ' Epique';
                $descs = [
                    "Une entite de rarete $rarityName, forgee dans les flammes de la creation.",
                    "Un etre aux capacites extraordinaires, redoute de tous ses adversaires.",
                    "Porteur d un pouvoir ancien, cette creature incarne la puissance brute.",
                    "Venu des profondeurs du monde, cet etre represente une force implacable.",
                ];
                echo json_encode(['success'=>true,'generated'=>[
                    'name'       => $name,
                    'description'=> $descs[array_rand($descs)],
                    'attack'     => $cardType==='objet' ? null : rand(10,25)*$mult,
                    'hp'         => $cardType==='objet' ? null : rand(15,30)*$mult,
                    'is_object'  => $cardType==='objet' ? 1 : 0,
                    'image_url'  => null,
                ], 'note'=>'Generation procedurale (cle OpenAI non configuree)']);
                break;
            }

            // Appel OpenAI
            $isObj  = ($cardType === 'objet');
            $atkMin = $isObj ? 0 : 10*$mult;
            $atkMax = $isObj ? 0 : 30*$mult;
            $hpMin  = $isObj ? 0 : 15*$mult;
            $hpMax  = $isObj ? 0 : 40*$mult;

            $prompt = "Tu es un generateur de cartes pour le jeu NationsGlory (univers Minecraft/fantasy). "
                . "Genere une carte de type '$cardType' et de rarete '$rarityName'. "
                . ($isObj
                    ? "C est un objet (is_object=1), pas de stats d attaque ni PV. "
                    : "C est un personnage/creature avec attack entre $atkMin et $atkMax, hp entre $hpMin et $hpMax. ")
                . "Reponds UNIQUEMENT en JSON valide, sans markdown, sans code block : "
                . "{\"name\":\"...\",\"description\":\"...\","
                . ($isObj ? "\"attack\":null,\"hp\":null,\"is_object\":1" : "\"attack\":NOMBRE,\"hp\":NOMBRE,\"is_object\":0")
                . "}";

            $payload = json_encode([
                'model'    => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => 'Tu generes des cartes de jeu en JSON strict. Reponds uniquement avec du JSON valide, aucun markdown.'],
                    ['role' => 'user',   'content' => $prompt],
                ],
                'temperature'=> 1.0,
                'max_tokens' => 256,
            ]);

            $ch = curl_init('https://api.openai.com/v1/chat/completions');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_TIMEOUT        => 30,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_HTTPHEADER     => [
                    'Content-Type: application/json',
                    'Authorization: Bearer ' . OPENAI_API_KEY,
                ],
                CURLOPT_POSTFIELDS     => $payload,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_FOLLOWLOCATION => true,
            ]);
            $resp    = curl_exec($ch);
            $code    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlErr = curl_error($ch);
            curl_close($ch);

            if ($code === 0) {
                echo json_encode(['success'=>false,'error'=>'Impossible de joindre OpenAI : '.$curlErr]);
                break;
            }
            if ($code !== 200) {
                $errData = json_decode($resp, true);
                $errMsg  = $errData['error']['message'] ?? "HTTP $code";
                echo json_encode(['success'=>false,'error'=>'Erreur OpenAI : '.$errMsg]);
                break;
            }

            $data    = json_decode($resp, true);
            $rawText = $data['choices'][0]['message']['content'] ?? '{}';
            $rawText = preg_replace('/^```[a-z]*\n?/i', '', trim($rawText));
            $rawText = preg_replace('/\n?```$/', '', $rawText);
            $gen = json_decode(trim($rawText), true);

            if (!$gen || !isset($gen['name'])) {
                echo json_encode(['success'=>false,'error'=>'Reponse OpenAI invalide : '.$rawText]);
                break;
            }

            $gen['image_url'] = null;
            echo json_encode(['success'=>true,'generated'=>$gen,'note'=>'Genere par GPT-4o Mini']);
            break;

        // ─── ADMIN – CARTES ────────────────────────────────────────────────
        case 'adminGetCards':
            requireAdmin();
            echo json_encode(['success'=>true,'cards'=>$pdo->query("SELECT c.*,r.name as rarity_name,r.color,r.base_value,ct.name as type_name
                FROM cards c JOIN rarities r ON c.rarity_id=r.id JOIN card_types ct ON c.card_type_id=ct.id ORDER BY r.probability_weight DESC,c.name")->fetchAll()]);
            break;

        case 'adminCreateCard':
            requireAdmin();
            $name=trim($_POST['name']??'');
            if(empty($name)){echo json_encode(['success'=>false,'error'=>'Nom requis']);break;}
            $desc=trim($_POST['description']??'')?:null;
            $atk=(isset($_POST['attack'])&&$_POST['attack']!=='')?((int)$_POST['attack']):null;
            $hp=(isset($_POST['hp'])&&$_POST['hp']!=='')?((int)$_POST['hp']):null;
            $pdo->prepare("INSERT INTO cards(name,description,attack,hp,is_object,card_type_id,rarity_id,image_url,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,NOW(),NOW())")
                ->execute([$name,$desc,$atk,$hp,(int)($_POST['is_object']??0),(int)($_POST['card_type_id']??1),(int)($_POST['rarity_id']??1),trim($_POST['image_url']??'')?:null]);
            logActivity($pdo,$_SESSION['user']['id'],$_SESSION['user']['name'],'Carte créée',$name);
            echo json_encode(['success'=>true,'card_id'=>$pdo->lastInsertId()]);
            break;

        case 'adminUpdateCard':
            requireAdmin();
            $id=(int)($_POST['id']??0); $name=trim($_POST['name']??'');
            if(!$id||empty($name)){echo json_encode(['success'=>false,'error'=>'ID et nom requis']);break;}
            $desc=trim($_POST['description']??'')?:null;
            $atk=(isset($_POST['attack'])&&$_POST['attack']!=='')?((int)$_POST['attack']):null;
            $hp=(isset($_POST['hp'])&&$_POST['hp']!=='')?((int)$_POST['hp']):null;
            $pdo->prepare("UPDATE cards SET name=?,description=?,attack=?,hp=?,is_object=?,card_type_id=?,rarity_id=?,image_url=?,updated_at=NOW() WHERE id=?")
                ->execute([$name,$desc,$atk,$hp,(int)($_POST['is_object']??0),(int)($_POST['card_type_id']??1),(int)($_POST['rarity_id']??1),trim($_POST['image_url']??'')?:null,$id]);
            echo json_encode(['success'=>true]);
            break;

        case 'adminDeleteCard':
            requireAdmin(); $id=(int)($_POST['id']??$_GET['id']??0);
            $pdo->prepare("DELETE FROM cards WHERE id=?")->execute([$id]);
            echo json_encode(['success'=>true]);
            break;

        // ─── ADMIN – PACKS ─────────────────────────────────────────────────
        case 'adminGetPacks':
            requireAdmin();
            $packs=$pdo->query("SELECT * FROM packs ORDER BY price ASC")->fetchAll();
            foreach ($packs as &$p){
                $s=$pdo->prepare("SELECT pc.*,c.name,r.name as rarity_name,r.color FROM pack_card pc JOIN cards c ON pc.card_id=c.id JOIN rarities r ON c.rarity_id=r.id WHERE pc.pack_id=?");
                $s->execute([$p['id']]); $p['cards']=$s->fetchAll();
            }
            echo json_encode(['success'=>true,'packs'=>$packs]);
            break;

        case 'adminCreatePack':
            requireAdmin();
            $name=trim($_POST['name']??'');
            if(empty($name)){echo json_encode(['success'=>false,'error'=>'Nom requis']);break;}
            $pdo->prepare("INSERT INTO packs(name,description,cards_per_pack,price,is_active,created_at,updated_at) VALUES(?,?,?,?,?,NOW(),NOW())")
                ->execute([$name,trim($_POST['description']??'')?:null,(int)($_POST['cards_per_pack']??5),(int)($_POST['price']??100),(int)($_POST['is_active']??1)]);
            echo json_encode(['success'=>true,'pack_id'=>$pdo->lastInsertId()]);
            break;

        case 'adminUpdatePack':
            requireAdmin(); $id=(int)($_POST['id']??0);
            $pdo->prepare("UPDATE packs SET name=?,description=?,cards_per_pack=?,price=?,is_active=?,updated_at=NOW() WHERE id=?")
                ->execute([trim($_POST['name']??''),trim($_POST['description']??'')?:null,(int)($_POST['cards_per_pack']??5),(int)($_POST['price']??100),(int)($_POST['is_active']??1),$id]);
            echo json_encode(['success'=>true]);
            break;

        case 'adminDeletePack':
            requireAdmin(); $id=(int)($_POST['id']??$_GET['id']??0);
            $pdo->prepare("DELETE FROM packs WHERE id=?")->execute([$id]);
            echo json_encode(['success'=>true]);
            break;

        case 'adminAssignCard':
            requireAdmin();
            $packId=(int)($_POST['pack_id']??0); $cardId=(int)($_POST['card_id']??0); $w=(int)($_POST['weight']??10);
            $s=$pdo->prepare("SELECT id FROM pack_card WHERE pack_id=? AND card_id=?"); $s->execute([$packId,$cardId]);
            if ($s->fetch()) $pdo->prepare("UPDATE pack_card SET weight=?,updated_at=NOW() WHERE pack_id=? AND card_id=?")->execute([$w,$packId,$cardId]);
            else $pdo->prepare("INSERT INTO pack_card(pack_id,card_id,weight,created_at,updated_at) VALUES(?,?,?,NOW(),NOW())")->execute([$packId,$cardId,$w]);
            echo json_encode(['success'=>true]);
            break;

        case 'adminRemoveCard':
            requireAdmin();
            $pdo->prepare("DELETE FROM pack_card WHERE pack_id=? AND card_id=?")->execute([(int)($_POST['pack_id']??0),(int)($_POST['card_id']??0)]);
            echo json_encode(['success'=>true]);
            break;

        // ─── ADMIN – UTILISATEURS ──────────────────────────────────────────
        case 'adminGetUsers':
            requireAdmin();
            echo json_encode(['success'=>true,'users'=>$pdo->query("SELECT u.id,u.name,u.email,u.role,u.is_banned,u.coins,u.packs_opened,u.trades_done,u.created_at,
                COUNT(i.id) as card_types,COALESCE(SUM(i.quantity),0) as total_cards
                FROM users u LEFT JOIN inventory i ON u.id=i.user_id GROUP BY u.id ORDER BY u.created_at DESC")->fetchAll()]);
            break;

        case 'adminBanUser':
            requireAdmin();
            $targetId=(int)($_POST['user_id']??0); $ban=(int)($_POST['ban']??1);
            if ($targetId===(int)$_SESSION['user']['id']){echo json_encode(['success'=>false,'error'=>'Impossible de se bannir soi-même']);break;}
            $pdo->prepare("UPDATE users SET is_banned=? WHERE id=?")->execute([$ban,$targetId]);
            logActivity($pdo,$_SESSION['user']['id'],$_SESSION['user']['name'],$ban?'Ban':'Unban','User #'.$targetId);
            echo json_encode(['success'=>true]);
            break;

        case 'adminSetRole':
            requireAdmin();
            $targetId=(int)($_POST['user_id']??0); $role=$_POST['role']??'player';
            if (!in_array($role,['player','admin'])){echo json_encode(['success'=>false,'error'=>'Rôle invalide']);break;}
            if ($targetId===(int)$_SESSION['user']['id']){echo json_encode(['success'=>false,'error'=>'Impossible de changer son propre rôle']);break;}
            $pdo->prepare("UPDATE users SET role=? WHERE id=?")->execute([$role,$targetId]);
            logActivity($pdo,$_SESSION['user']['id'],$_SESSION['user']['name'],'Changement de rôle','User #'.$targetId.' → '.$role);
            echo json_encode(['success'=>true]);
            break;

        case 'adminAddCoins':
            requireAdmin();
            $targetId=(int)($_POST['user_id']??0); $amount=(int)($_POST['amount']??0);
            if (!$targetId||$amount===0){echo json_encode(['success'=>false,'error'=>'user_id et amount requis']);break;}
            $pdo->prepare("UPDATE users SET coins=GREATEST(0,coins+?),updated_at=NOW() WHERE id=?")->execute([$amount,$targetId]);
            $nc=$pdo->prepare("SELECT coins FROM users WHERE id=?"); $nc->execute([$targetId]);
            logActivity($pdo,$_SESSION['user']['id'],$_SESSION['user']['name'],'Coins ajoutés','User #'.$targetId.' : '.($amount>0?'+'.$amount:$amount).' 🪙');
            echo json_encode(['success'=>true,'new_coins'=>(int)$nc->fetchColumn()]);
            break;

        case 'adminGetUserInventory':
            requireAdmin(); $targetId=(int)($_GET['user_id']??0);
            $su=$pdo->prepare("SELECT name,email,coins FROM users WHERE id=?"); $su->execute([$targetId]);
            $ui=$su->fetch();
            $si=$pdo->prepare("SELECT i.*,c.name,c.attack,c.hp,c.description,c.image_url,r.name as rarity_name,r.color,r.base_value
                FROM inventory i JOIN cards c ON i.card_id=c.id JOIN rarities r ON c.rarity_id=r.id WHERE i.user_id=? ORDER BY r.probability_weight ASC");
            $si->execute([$targetId]);
            echo json_encode(['success'=>true,'inventory'=>$si->fetchAll(),'user'=>$ui]);
            break;

        case 'adminDeleteUserCard':
            requireAdmin();
            $pdo->prepare("DELETE FROM inventory WHERE user_id=? AND card_id=?")->execute([(int)($_POST['user_id']??0),(int)($_POST['card_id']??0)]);
            echo json_encode(['success'=>true]);
            break;

        // ─── ADMIN – DASHBOARD ─────────────────────────────────────────────
        case 'adminDashboard':
            requireAdmin();
            $stats=[
                'total_users'   => (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
                'total_coins'   => (int)$pdo->query("SELECT COALESCE(SUM(coins),0) FROM users")->fetchColumn(),
                'total_packs'   => (int)$pdo->query("SELECT COALESCE(SUM(packs_opened),0) FROM users")->fetchColumn(),
                'total_trades'  => (int)$pdo->query("SELECT COUNT(*) FROM trades WHERE status='accepted'")->fetchColumn(),
                'total_cards_db'=> (int)$pdo->query("SELECT COUNT(*) FROM cards")->fetchColumn(),
                'total_packs_db'=> (int)$pdo->query("SELECT COUNT(*) FROM packs WHERE is_active=1")->fetchColumn(),
                'pending_trades'=> (int)$pdo->query("SELECT COUNT(*) FROM trades WHERE status='pending'")->fetchColumn(),
                'total_inventory'=> (int)$pdo->query("SELECT COALESCE(SUM(quantity),0) FROM inventory")->fetchColumn(),
            ];
            $activity=$pdo->query("SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 25")->fetchAll();
            $topUsers=$pdo->query("SELECT name,coins,packs_opened,trades_done FROM users ORDER BY coins DESC LIMIT 5")->fetchAll();
            echo json_encode(['success'=>true,'stats'=>$stats,'activity'=>$activity,'top_users'=>$topUsers]);
            break;

        default:
            echo json_encode(['success'=>false,'error'=>'Action inconnue: '.$action]);
    }
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}
?>
