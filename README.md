🃏Plateforme de Cartes de Collection IA NationsGlory - Minecraft TCG Pack Opening



**Minecraft TCG Pack Opening** est une application web de "Pack Opening" (c'est à dire d'ouverture de paquets de cartes) et de collection de cartes à collectionner (TCG) inspirée de l'univers de **Minecraft**.


Elle permet de s'authentifier, d'acheter et d'ouvrir des boosters, de gérer sa collection de cartes, et pose les bases d'un système d'échange et de marché de cartes entre joueurs.


Chaque carte est tirée de personnages et/ou d'objets de l'univers Minecraft.


Elle possède des points d'attaque, de défense ainsi que des PV.


De plus, elles disposent de 4 niveaux de rareté différents :


🟢 Commun 
🔵 Rare 
🟣 Épique 
🟡 Légendaire 




🚀 Fonctionnalités Principales



**🔑 Authentification Sécurisée** : Inscription et connexion des utilisateurs avec hachage sécurisé des mots de passe (`password_hash`).


<br><br>
<img width="1899" height="940" alt="authentification-nationsglory" src="https://github.com/user-attachments/assets/6a51a47b-2a6b-4949-8d8a-619a100f6a4c" />
<br><br>



**📦 Boutique de Packs** : Un système d'ouverture de boosters interactif en temps réel utilisant un algorithme de tirage pondéré.


Il y a différents packs : 

- **Pack Débutant** : On aura plus de chance d'avoir ds cartes communes.
  
- **Pack Standard** : Ici on aura plus ou moins autant de commune que de rares.
  
- **Pack Héroique** : Quand à là, on a des chances plus élevées d'avoir des cartes épiques et/ou légendaires.
  

<br><br>
<img width="1907" height="946" alt="boutique-nationsglory" src="https://github.com/user-attachments/assets/8b372b7b-e474-416f-8ea2-83c0e1d9222f" />
<br><br>


**💎 Système de Raretés** : Les cartes possèdent 4 niveaux de rareté distincts (Commun, Rare, Épique, Légendaire) qui influent sur leur valeur en étoiles (⭐) et leur probabilité d'obtention.


**🎒  Collection** : On peut visualiser la totalité de globale de sa collection de cartes avec un système de filtres par rareté et un affichage automatique du nombre total de cartes de la collection.


<br><br>
<img width="1909" height="943" alt="collection-nationsglory" src="https://github.com/user-attachments/assets/a9d2d54f-d06c-4c34-a8c8-6bb0bbe044cd" />
<br><br>

**🛡️ Espace Administration** : Une distinction de rôles entre Joueur (`player`) et Administrateur (`admin`) prévue pour gérer le catalogue de cartes et de packs.


<br><br>
<img width="1907" height="942" alt="admin-nationsglory" src="https://github.com/user-attachments/assets/40e1c8f9-8d66-4937-ac1b-0e5d2ae02584" />
<br><br>


**Système d'échange de carte entre utilisateurs** : Les utilisateurs peuvent échanger ds cartes de leur collection avec les collections d'autres joueurs qu'importe le niveau de rareté de la carte ou des cartes.


<br><br>
<img width="1896" height="933" alt="propositionéchanges-nationsglory" src="https://github.com/user-attachments/assets/5067af18-49c1-437a-9650-c43f61fd1cdc" />
<br><br>

Un historique s'affiche en dessous des échanges en attente avec l'heure, la date et le pseudo des utilisateurs.


<br><br>
<img width="1909" height="952" alt="échanges-nationsglory" src="https://github.com/user-attachments/assets/4933019d-26b1-48c3-b3d1-d9fd92b231d5" />
<br><br>



🛠️ Architecture du projet


### 1. Base de Données (`carteia.sql`)


La base relationnelle MySQL est structurée pour assurer l'intégrité des données via des clés étrangères (avec contraintes `ON DELETE CASCADE`) :

* `users` : Gère les profils (Id, Nom, Email, Password haché, Rôle).

* `cards` & `card_types` : Contient l'ensemble du catalogue Minecraft (Steve, Creeper, Diamant, Netherite...).
  
* `packs` & `pack_card` : Définit les boosters et associe les cartes disponibles à l'intérieur avec leur **poids de probabilité** (`weight`).
  
* `inventory` : Table pivot liant les utilisateurs à leurs cartes avec un compteur de quantité (`quantity`).
  
* `trades` & `trade_items` : Tables prêtes à accueillir la future mécanique d'échange.

  

### 2. Backend API (`api.php`)


On a créé un clé API sur le ciye OpenAI pour l'activer et l'inclure dans notre projet.

Elle permet de communiquer avec la base de données via **PDO** et renvoie exclusivement du **JSON**. Les sessions PHP (`session_start`) sécurisent l'accès aux routes sensibles comme `openPack` ou `getInventory`.


### 3. Frontend Dynamique (`script.js`)


L'interface utilisateur/administrateur fonctionne comme une **SPA (Single Page Application)**.
Elle se recharge dynamiquement sans jamais rafraîchir la page web.

On y retrouve un menu composé de différentes fonctionnalités dont celles déja présentées :

<br><br>
<img width="1908" height="943" alt="menu-nationsglory" src="https://github.com/user-attachments/assets/298514d4-4ec5-4c6a-98e6-0088d3ee9cb3" />
<br><br>

En plus des fonctionnalités principales, la plateforme dispose de fonctionnalités supplémentaires afin de se développer davantage :


**Gestion de cartes** : On peut directement ajouter de nouvelles cartes sur la plateforme soit par génération avc l'IA ou manuellement en indiquant le nom,le type,la rareté,l'attaque,les PV,la description ainsi que l'URL de l'image de la carte.

<br><br>
<img width="1896" height="832" alt="gestiondecartes-nationsglory" src="https://github.com/user-attachments/assets/953d758c-a5cc-47bb-a04f-d492d3517a58" />
<br><br>


**Controle des utilisateurs** : En compte admin, on peut bannir/débannir des utilisateurs.

<br><br>
<img width="1905" height="949" alt="joueurs-nationsglory" src="https://github.com/user-attachments/assets/e03a01a1-2abd-4f4f-83ca-52407812baa1" />
<br><br>


**Quetes** : On peut créer des quetes journalières en tant qu'admin pour les utilisateurs afin qu'ils gagnent des pièces pour acheter des packs de cartes.

<br><br>
<img width="1906" height="936" alt="quetes-nationsglory" src="https://github.com/user-attachments/assets/361c9955-c051-4f78-83e6-ce0b2dc479af" />
<br><br>



## 👥 Collaboration & Répartition des Tâches


Ce projet a été réalisé en équipe de trois : Oscar, Félix et Yèmi.

L'ensemble des fichiers de l'archive `IA-CARD-COLLECTION-NG-master.zip` a été partagé et versionné via un dépôt GitHub commun.

Afin de maximiser l'efficacité de l'équipe, nous avons divisé le projet selon nos spécialisations :



### 🗄️ Oscar — Architecture des Données, Système de Quêtes & Design



* **Modélisation SQL (`carteia.sql`)** : Conception de l'architecture de la base de données relationnelle MySQL (gestion des utilisateurs, cartes, inventaires, transactions et quêtes) avec contraintes `ON DELETE CASCADE`.
  
* **Moteur d'Échanges & d'Historique** : Structure et logique des tables pivots nécessaires au fonctionnement du système d'échange inter-joueurs, ainsi que la journalisation des transactions (historique daté avec heure et pseudos).
  
* **UI/UX & Thémisation Minecraft (`style.css`, `index.php`)** : Création de la charte graphique immersive (polices, bordures pixelisées, boutons thématiques). Design des cartes avec affichage de leurs caractéristiques (PV, Attaque, Défense, Étoiles) et intégration visuelle des 4 niveaux de rareté.
  



### ⚙️ Félix — API REST, Intégration de l'IA & Logique Métier Backend



* **Développement de l'API REST (`api.php`)** : Centralisation des routes de traitement, gestion des sessions sécurisées (`session_start`) pour l'authentification (`password_hash`) et réponses exclusivement formatées en JSON.
  
* **Algorithme de Tirage & Intégration de l'IA** : Implémentation du script de sélection pondérée pour l'ouverture des différents boosters (Packs Débutant, Standard, Héroïque) et connexion avec l'API OpenAI pour automatiser la génération de nouvelles cartes.
  
* **Système Économique & Quêtes** : Code backend gérant la création des quêtes journalières et l'attribution des récompenses en pièces de monnaie.
  


### 💻 Yèmi — Interface Utilisateur, Dynamisme SPA & Back-Office



* **Moteur de la SPA (`script.js`)** : Développement complet de la Single Page Application en JavaScript Vanilla. Gestion du menu de navigation interactif et rechargement dynamique des composants (Boutique, Collection, Échanges, Zone Admin) sans rafraîchir la page web.
  
* **Consommation Asynchrone de l'API** : Intégration de l'API  pour lier dynamiquement l'interface aux scripts PHP (envoi des formulaires, récupération instantanée de l'inventaire filtré par rareté et affichage des boosters).
  
* **Back-Office d'Administration** : Développement du panneau de contrôle des joueurs permettant aux administrateurs de modérer la communauté (système de bannissement et débannissement).





## 💻 Prérequis Techniques pour lancer le projet localement



Pour exécuter et faire fonctionner l'environnement local de l'application, les prérequis suivants sont nécessaires :


*   **Serveur Web Local** : Une pile de serveurs comme **Laragon** (recommandé), **XAMPP**, **MAMP** ou **WampServer**.
    
*   **PHP** : Version **8.0 ou supérieure** (avec les extensions `pdo_mysql` et `session` activées).
    
*   **Base de données** : **MySQL 5.7+** ou **MariaDB 10.4+**.
   
*   **Clé API OpenAI** : Un compte développeur OpenAI avec une clé secrète active pour utiliser la génération automatique de cartes par IA.
    
*   **Navigateur Web** : Un navigateur moderne (Chrome, Firefox, Edge, Safari) supportant ES6+ (`fetch`, modules asynchrones).




## 🚀 Installation et Configuration de la platforme


Suivez ces étapes pour déployer le projet sur votre machine locale :



### 1. Préparation des Fichiers

1. Téléchargez ou récupérez l'archive du projet nommée `IA-CARD-COLLECTION-NG-master.zip`.

2. Extrayez l'intégralité du contenu du dossier `IA-CARD-COLLECTION-NG-master`[cite: 1] dans le répertoire racine de votre serveur web local (par exemple `C:\laragon\www\carteia\` ou `C:\xampp\htdocs\carteia\`).

   

### 2. Configuration de la Base de Données


1. Démarrez vos services **Apache** et **MySQL** via votre panneau de contrôle (Laragon/XAMPP).

2. Ouvrez votre gestionnaire de base de données (ex: **phpMyAdmin** ou Adminer) à l'adresse `http://localhost/phpmyadmin`.

3. Créez une nouvelle base de données nommée `carteia`.

4. Allez dans l'onglet **Importer**, sélectionnez le fichier `carteia.sql`[cite: 1] situé à la racine du projet extrait, puis cliquez sur **Exécuter** pour injecter les tables et le jeu de données Minecraft initial[cite: 1].



### 3. Lancement


Ouvrez votre navigateur web.

Démarrer le serveur local et accéder à l'application en ouvrant une fenetre à partir de ce dernier.

Créer un compte ou connecter-vous pour commencer à ouvrir vos premiers boosters Minecraft !




**Ce projet a été développé dans un cadre académique pour la plateforme **NationsGlory**.**


