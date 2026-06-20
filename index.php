<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <title>NationsGlory – Cartes &amp; Collection</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,600;14..32,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="app-container">
        <!-- CONTENU PRINCIPAL -->
        <main class="main-content" id="app">
            <p style="color:#8b9bb5;text-align:center;padding:40px">Chargement…</p>
        </main>

        <!-- BOTTOM NAV -->
        <nav class="bottom-nav">
            <div class="nav-item-bottom" data-page="packs">
                <i class="fas fa-box-open"></i>
                <span>Packs</span>
            </div>
            <div class="nav-item-bottom active" data-page="menu">
                <i class="fas fa-dragon"></i>
                <span>Accueil</span>
            </div>
            <div class="nav-item-bottom" data-page="collection">
                <i class="fas fa-layer-group"></i>
                <span>Collection</span>
            </div>
        </nav>
    </div>

    <!-- MODAL CARTE -->
    <div id="cardModal" class="modal">
        <div class="modal-content" style="padding:0;overflow:hidden;border-radius:24px">
            <div id="cardModalBody"></div>
        </div>
    </div>

    <!-- TOAST -->
    <div id="toast" class="toast"></div>

    <script src="script.js"></script>
</body>
</html>
