<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

$action = $_GET['action'] ?? '';

try {
    switch($action) {
        case 'getCards':
            $stmt = $pdo->query("
                SELECT c.*, r.name as rarity_name, r.color, r.base_value, ct.name as type_name
                FROM cards c
                JOIN rarities r ON c.rarity_id = r.id
                JOIN card_types ct ON c.card_type_id = ct.id
                ORDER BY c.id
            ");
            $cards = $stmt->fetchAll();
            echo json_encode(['success' => true, 'cards' => $cards]);
            break;
        
        case 'getPacks':
            $stmt = $pdo->query("SELECT * FROM packs WHERE is_active = 1");
            $packs = $stmt->fetchAll();
            
            foreach($packs as &$pack) {
                $stmt2 = $pdo->prepare("
                    SELECT pc.*, c.name, c.attack, c.hp, c.is_object, c.description,
                           r.name as rarity_name, r.color
                    FROM pack_card pc
                    JOIN cards c ON pc.card_id = c.id
                    JOIN rarities r ON c.rarity_id = r.id
                    WHERE pc.pack_id = ?
                ");
                $stmt2->execute([$pack['id']]);
                $pack['cards'] = $stmt2->fetchAll();
            }
            echo json_encode(['success' => true, 'packs' => $packs]);
            break;
        
        case 'openPack':
            if(!isset($_SESSION['user'])) {
                echo json_encode(['success' => false, 'error' => 'Non authentifié']);
                break;
            }
            $userId = $_SESSION['user']['id'];
            $packId = $_POST['pack_id'] ?? $_GET['pack_id'] ?? 1;
            
            $stmt = $pdo->prepare("
                SELECT pc.card_id, pc.weight, c.*, r.name as rarity_name
                FROM pack_card pc
                JOIN cards c ON pc.card_id = c.id
                JOIN rarities r ON c.rarity_id = r.id
                WHERE pc.pack_id = ?
            ");
            $stmt->execute([$packId]);
            $cardsInPack = $stmt->fetchAll();
            
            if(empty($cardsInPack)) {
                echo json_encode(['success' => false, 'error' => 'Ce pack ne contient aucune carte']);
                break;
            }
            
            $stmt2 = $pdo->prepare("SELECT cards_per_pack, name FROM packs WHERE id = ?");
            $stmt2->execute([$packId]);
            $pack = $stmt2->fetch();
            $cardsToDraw = $pack['cards_per_pack'] ?? 5;
            
            function weightedRandom($items) {
                $totalWeight = array_sum(array_column($items, 'weight'));
                $random = mt_rand(1, $totalWeight);
                $currentWeight = 0;
                foreach($items as $item) {
                    $currentWeight += $item['weight'];
                    if($random <= $currentWeight) {
                        return $item;
                    }
                }
                return $items[0];
            }
            
            $drawnCards = [];
            for($i = 0; $i < $cardsToDraw; $i++) {
                $card = weightedRandom($cardsInPack);
                $drawnCards[] = $card;
                
                $stmt3 = $pdo->prepare("SELECT id, quantity FROM inventory WHERE user_id = ? AND card_id = ?");
                $stmt3->execute([$userId, $card['card_id']]);
                $existing = $stmt3->fetch();
                
                if($existing) {
                    $stmt4 = $pdo->prepare("UPDATE inventory SET quantity = quantity + 1 WHERE id = ?");
                    $stmt4->execute([$existing['id']]);
                } else {
                    $stmt4 = $pdo->prepare("INSERT INTO inventory (user_id, card_id, quantity) VALUES (?, ?, 1)");
                    $stmt4->execute([$userId, $card['card_id']]);
                }
            }
            
            echo json_encode(['success' => true, 'cards' => $drawnCards, 'pack_name' => $pack['name'] ?? 'Pack']);
            break;
        
        case 'getInventory':
            $userId = $_SESSION['user']['id'] ?? 1;
            $stmt = $pdo->prepare("
                SELECT i.*, c.name, c.attack, c.hp, c.is_object, c.description,
                       r.name as rarity_name, r.color, r.base_value
                FROM inventory i
                JOIN cards c ON i.card_id = c.id
                JOIN rarities r ON c.rarity_id = r.id
                WHERE i.user_id = ?
            ");
            $stmt->execute([$userId]);
            $inventory = $stmt->fetchAll();
            
            $totalCards = 0;
            $totalValue = 0;
            foreach($inventory as $item) {
                $totalCards += $item['quantity'];
                $totalValue += $item['base_value'] * $item['quantity'];
            }
            
            echo json_encode(['success' => true, 'inventory' => $inventory, 'total_value' => $totalValue, 'total_cards' => $totalCards]);
            break;
        
        case 'login':
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if($user && password_verify($password, $user['password'])) {
                $_SESSION['user'] = [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ];
                echo json_encode(['success' => true, 'user' => $_SESSION['user']]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Email ou mot de passe incorrect']);
            }
            break;
        
        case 'register':
            $name = $_POST['name'] ?? '';
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $passwordConfirmation = $_POST['password_confirmation'] ?? '';
            
            if(empty($name) || empty($email) || empty($password)) {
                echo json_encode(['success' => false, 'error' => 'Tous les champs sont requis']);
                break;
            }
            
            if($password !== $passwordConfirmation) {
                echo json_encode(['success' => false, 'error' => 'Les mots de passe ne correspondent pas']);
                break;
            }
            
            if(strlen($password) < 6) {
                echo json_encode(['success' => false, 'error' => 'Le mot de passe doit contenir au moins 6 caractères']);
                break;
            }
            
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if($stmt->fetch()) {
                echo json_encode(['success' => false, 'error' => 'Cet email est déjà utilisé']);
                break;
            }
            
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'player')");
            $result = $stmt->execute([$name, $email, $hashedPassword]);
            
            if($result) {
                echo json_encode(['success' => true, 'email' => $email]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Erreur lors de la création du compte']);
            }
            break;
        
        case 'logout':
            session_destroy();
            echo json_encode(['success' => true]);
            break;
        
        // ⭐ ACTION MANQUANTE AJOUTÉE ICI ⭐
        case 'checkAuth':
            if(isset($_SESSION['user'])) {
                echo json_encode(['success' => true, 'user' => $_SESSION['user']]);
            } else {
                echo json_encode(['success' => false]);
            }
            break;
        
        default:
            echo json_encode(['success' => false, 'error' => 'Action inconnue : ' . $action]);
    }
} catch(Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>