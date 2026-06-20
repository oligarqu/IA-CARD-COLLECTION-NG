<?php
// Copier ce fichier en config.php et remplir les valeurs
$host     = '127.0.0.1';
$dbname   = 'carteia';
$username = 'root';
$password = 'root';

// Clé Gemini (Google AI Studio) – commence par AIzaSy...
define('GEMINI_API_KEY', '');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->query("SELECT 1");
} catch (PDOException $e) {
    die(json_encode(['success' => false, 'error' => 'Erreur BDD : ' . $e->getMessage()]));
}
?>
