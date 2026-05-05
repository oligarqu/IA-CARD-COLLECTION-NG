<?php
// config.php
$host = '127.0.0.1';  // localhost parfois problématique
$dbname = 'carteia';
$username = 'root';
$password = 'root';  // Laisse vide pour XAMPP par défaut

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Test rapide (optionnel)
    $pdo->query("SELECT 1");
    
} catch(PDOException $e) {
    // Affiche l'erreur clairement
    die(json_encode(['success' => false, 'error' => 'Erreur BDD : ' . $e->getMessage()]));
}
?>