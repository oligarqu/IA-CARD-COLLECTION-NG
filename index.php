<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once "connection.php";

// Récupère toutes les recommandations
$sql = 'SELECT * FROM reco_item';
$stmt_sql = $connexion->query($sql);
$rows = $stmt_sql->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Accueil - Recommandations</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(to right, #e0eafc, #cfdef3);
            min-height: 100vh;
        }

        .container {
            max-width: 900px;
            margin: 50px auto;
            padding: 20px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.15);
        }

        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }

        ul {
            list-style-type: none;
            padding: 0;
        }

        li {
            margin-bottom: 15px;
        }

        a {
            display: block;
            background-color: #007BFF;
            color: white;
            text-decoration: none;
            padding: 15px 20px;
            border-radius: 8px;
            transition: background-color 0.3s ease;
        }

        a:hover {
            background-color: #0056b3;
        }

        /* Responsive */
        @media (max-width: 600px) {
            .container {
                margin: 20px;
                padding: 15px;
            }

            a {
                padding: 12px;
                font-size: 16px;
            }
        }
    </style>
</head>

<body>
    <?php require_once "_menu.php"; ?>

    <div class="container">
        <h1>Liste des recommandations</h1>
        <ul>
            <?php foreach ($rows as $item) { ?>
                <li>
                    <a href="reco.php?id=<?php echo htmlspecialchars($item['id']); ?>">
                        <?php echo htmlspecialchars($item['label']); ?>
                    </a>
                </li>
            <?php } ?>
        </ul>
    </div>
</body>
</html>
