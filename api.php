<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

$action = $_GET['action'] ?? '';

try {
    switch($action) {
        // Récupérer toutes les cartes
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
        
        // Récupérer les packs
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
        
        // Ouvrir un pack
        case 'openPack':
            $packId = $_POST['pack_id'] ?? $_GET['pack_id'] ?? 1;
            $userId = $_POST['user_id'] ?? $_GET['user_id'] ?? 1;
            
            // Récupérer les cartes du pack avec leurs poids
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
            
            // Récupérer le nombre de cartes par pack
            $stmt2 = $pdo->prepare("SELECT cards_per_pack, name FROM packs WHERE id = ?");
            $stmt2->execute([$packId]);
            $pack = $stmt2->fetch();
            $cardsToDraw = $pack['cards_per_pack'] ?? 5;
            
            // Fonction de tirage pondéré
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
                
                // Ajouter à l'inventaire
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
        
        // Récupérer l'inventaire d'un joueur
        case 'getInventory':
            $userId = $_GET['user_id'] ?? 1;
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
        
        // Connexion simplifiée
        case 'login':
            // Pour les tests, on connecte directement l'utilisateur 2 (JoueurTest)
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = 2");
            $stmt->execute();
            $user = $stmt->fetch();
            echo json_encode(['success' => true, 'user' => ['id' => $user['id'], 'name' => $user['name'], 'role' => $user['role']]]);
            break;
        
        default:
            echo json_encode(['success' => false, 'error' => 'Action inconnue : ' . $action]);
    }
} catch(Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>