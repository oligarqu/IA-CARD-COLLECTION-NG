-- ============================================================
-- NationsGlory Cards – Schema complet v2
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `card_types` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `rarities` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `color` varchar(20) DEFAULT '#ffffff',
  `probability_weight` int(11) DEFAULT '1',
  `base_value` int(11) DEFAULT '10',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `cards` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `attack` int(11) DEFAULT NULL,
  `hp` int(11) DEFAULT NULL,
  `is_object` tinyint(1) DEFAULT '0',
  `card_type_id` bigint(20) UNSIGNED NOT NULL,
  `rarity_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `card_type_id` (`card_type_id`),
  KEY `rarity_id` (`rarity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('player','admin') DEFAULT 'player',
  `coins` int(11) DEFAULT '800',
  `packs_opened` int(11) DEFAULT '0',
  `trades_done` int(11) DEFAULT '0',
  `logins_total` int(11) DEFAULT '0',
  `is_banned` tinyint(1) DEFAULT '0',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `packs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `cards_per_pack` int(11) DEFAULT '5',
  `price` int(11) DEFAULT '100',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `pack_card` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `pack_id` bigint(20) UNSIGNED NOT NULL,
  `card_id` bigint(20) UNSIGNED NOT NULL,
  `weight` int(11) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pack_id` (`pack_id`),
  KEY `card_id` (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `inventory` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `card_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `card_id` (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `trades` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `proposer_id` bigint(20) UNSIGNED NOT NULL,
  `receiver_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pending','accepted','refused','cancelled') DEFAULT 'pending',
  `proposer_coins` int(11) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `proposer_id` (`proposer_id`),
  KEY `receiver_id` (`receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `trade_items` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `trade_id` bigint(20) UNSIGNED NOT NULL,
  `card_id` bigint(20) UNSIGNED NOT NULL,
  `from_user_id` bigint(20) UNSIGNED NOT NULL,
  `to_user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `trade_id` (`trade_id`),
  KEY `card_id` (`card_id`),
  KEY `from_user_id` (`from_user_id`),
  KEY `to_user_id` (`to_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `quests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `icon` varchar(60) DEFAULT 'fas fa-star',
  `reward_coins` int(11) DEFAULT '100',
  `quest_type` enum('one_time','daily','weekly') DEFAULT 'one_time',
  `condition_type` varchar(50) NOT NULL,
  `condition_value` int(11) DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `user_quests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `quest_id` int(11) NOT NULL,
  `progress` int(11) DEFAULT '0',
  `completed` tinyint(1) DEFAULT '0',
  `claimed` tinyint(1) DEFAULT '0',
  `period_key` varchar(20) DEFAULT 'permanent',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_upk` (`user_id`,`quest_id`,`period_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `details` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ============================================================
-- DONNEES
-- ============================================================

INSERT INTO `card_types` (`id`, `name`) VALUES
(1, 'humain'),
(2, 'animal'),
(3, 'mob'),
(4, 'boss'),
(5, 'objet');

INSERT INTO `rarities` (`id`, `name`, `color`, `probability_weight`, `base_value`) VALUES
(1, 'commun',    '#9ca3af', 70, 10),
(2, 'rare',      '#3b82f6', 20, 50),
(3, 'epic',      '#a855f7',  9, 200),
(4, 'legendaire','#fbbf24',  1, 1000);

INSERT INTO `cards` (`id`, `name`, `description`, `image_url`, `attack`, `hp`, `is_object`, `card_type_id`, `rarity_id`) VALUES
(1,  'Steve',          NULL, NULL, 10, 20, 0, 1, 1),
(2,  'Alexa',          NULL, NULL, 10, 20, 0, 1, 1),
(3,  'Cochon',         NULL, NULL,  0, 15, 0, 2, 1),
(4,  'Poule',          NULL, NULL,  0, 10, 0, 2, 1),
(5,  'Steak',          'Un morceau de viande cuit, ideal pour recuperer des forces.', NULL, NULL, NULL, 1, 5, 1),
(6,  'Pomme',          'Une pomme croquante et rafraichissante.', NULL, NULL, NULL, 1, 5, 1),
(7,  'FER',            'Un minerai tres repandu, utilise pour fabriquer des outils et armures.', NULL, NULL, NULL, 1, 5, 1),
(8,  'SABLE',          'Du sable fin, utile pour fabriquer du verre ou des TNT.', NULL, NULL, NULL, 1, 5, 1),
(9,  'LAINE',          'Une fibre douce, obtenue aupres des moutons.', NULL, NULL, NULL, 1, 5, 1),
(10, 'POISSON',        'Un poisson frais, bon a manger.', NULL, NULL, NULL, 1, 5, 1),
(11, 'Vache',          NULL, NULL,  0, 20, 0, 2, 2),
(12, 'OR',             'Un metal precieux, moins resistant que le fer mais plus rare.', NULL, NULL, NULL, 1, 5, 2),
(13, 'BOIS',           'Materiau de base pour l artisanat et la construction.', NULL, NULL, NULL, 1, 5, 2),
(14, 'Squelette',      NULL, NULL, 15, 20, 0, 3, 2),
(15, 'Zombie',         NULL, NULL, 12, 25, 0, 3, 2),
(16, 'CHARBON',        'Une roche noire qui brule longtemps.', NULL, NULL, NULL, 1, 5, 2),
(17, 'Loup',           NULL, NULL, 15, 18, 0, 2, 2),
(18, 'Livre',          'Un recueil de connaissances, parfois enchante.', NULL, NULL, NULL, 1, 5, 2),
(19, 'Arc',            'Une arme a distance essentielle pour tout archer.', NULL, NULL, NULL, 1, 5, 2),
(20, 'Potion',         'Une fiole aux effets magiques, capable de soigner ou renforcer.', NULL, NULL, NULL, 1, 5, 3),
(21, 'Ender Perle',    'Une perle mysterieuse permettant de se teleporter.', NULL, NULL, NULL, 1, 5, 3),
(22, 'Creeper',        NULL, NULL, 25, 15, 0, 3, 3),
(23, 'Redstone',       'Une poudre rouge qui transmet l energie des mecanismes.', NULL, NULL, NULL, 1, 5, 3),
(24, 'Blaze Squelette',NULL, NULL, 20, 20, 0, 3, 3),
(25, 'Warden',         NULL, NULL, 35, 45, 0, 4, 3),
(26, 'Weather',        'Une carte permettant de controler la meteo.', NULL, NULL, NULL, 1, 5, 3),
(27, 'Blaze Rod',      'Un baton enflamme, source de puissance brute.', NULL, NULL, NULL, 1, 5, 3),
(28, 'DIAMAND',        'Le minerai le plus solide apres la netherite.', NULL, NULL, NULL, 1, 5, 3),
(29, 'Elytra',         'Des ailes d insecte permettant de planer dans les airs.', NULL, NULL, NULL, 1, 5, 4),
(30, 'Netherite',      'Le metal le plus rare et le plus resistant qui soit.', NULL, NULL, NULL, 1, 5, 4),
(31, 'Under Drag',     NULL, NULL, 45, 50, 0, 4, 4),
(32, 'Egg',            'Un oeuf mysterieux et ancien, peut-etre celui d un dragon.', NULL, NULL, NULL, 1, 5, 4),
(33, 'Totem',          'Un artefact sacre qui sauve son porteur de la mort.', NULL, NULL, NULL, 1, 5, 4);

-- Comptes par defaut (mot de passe : "password")
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `coins`) VALUES
(1, 'Admin',      'admin@carteia.com',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',  9999),
(2, 'JoueurTest', 'joueur@carteia.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'player', 800);

-- 5 packs
INSERT INTO `packs` (`id`, `name`, `description`, `cards_per_pack`, `price`, `is_active`) VALUES
(1, 'Pack Heroique',   'Un pack equilibre avec des chances de cartes rares', 5, 250,  1),
(2, 'Pack Debutant',   'Parfait pour commencer - cartes communes garanties',  5, 50,   1),
(3, 'Pack Standard',   'Equilibre communes et rares',                         5, 200,  1),
(4, 'Pack Epique',     'Des cartes epiques vous attendent !',                 5, 500,  1),
(5, 'Pack Legendaire', 'Les cartes les plus rares du jeu',                   5, 1000, 1);

-- Cards dans les packs
INSERT INTO `pack_card` (`pack_id`, `card_id`, `weight`) VALUES
-- Pack Heroique
(1,1,70),(1,3,70),(1,6,50),(1,14,20),(1,22,9),(1,29,1),
-- Pack Debutant (communes)
(2,1,15),(2,2,15),(2,3,15),(2,4,15),(2,5,10),(2,6,10),(2,7,10),(2,8,10),(2,9,10),(2,10,10),
-- Pack Standard
(3,1,40),(3,3,40),(3,7,40),(3,8,35),(3,11,20),(3,12,20),(3,14,20),(3,15,20),(3,17,20),(3,20,8),(3,22,5),
-- Pack Epique
(4,11,20),(4,12,20),(4,14,20),(4,17,20),(4,20,25),(4,21,25),(4,22,25),(4,23,25),(4,24,20),(4,25,15),(4,28,15),(4,29,5),(4,30,5),
-- Pack Legendaire
(5,20,15),(5,21,15),(5,22,15),(5,24,15),(5,25,20),(5,27,15),(5,28,15),(5,29,25),(5,30,25),(5,31,25),(5,32,25),(5,33,25);

-- Quetes par defaut
INSERT INTO `quests` (`id`, `title`, `description`, `icon`, `reward_coins`, `quest_type`, `condition_type`, `condition_value`) VALUES
(1,  'Bienvenue !',           'Connectez-vous pour la premiere fois',          'fas fa-door-open',       200, 'one_time', 'login',          1),
(2,  'Premier Pack',          'Ouvrez votre premier pack de cartes',           'fas fa-box-open',        150, 'one_time', 'open_pack',      1),
(3,  'Collectionneur Bronze', 'Possedez 5 cartes dans votre collection',       'fas fa-layer-group',     200, 'one_time', 'collect_cards',  5),
(4,  'Collectionneur Argent', 'Possedez 15 cartes dans votre collection',      'fas fa-layer-group',     400, 'one_time', 'collect_cards',  15),
(5,  'Collectionneur Or',     'Possedez 30 cartes dans votre collection',      'fas fa-trophy',          750, 'one_time', 'collect_cards',  30),
(6,  'Negociateur',           'Proposez votre premier echange',                'fas fa-handshake',       100, 'one_time', 'make_trade',     1),
(7,  'Partenaire',            'Concluez votre premier echange',                'fas fa-check-circle',    300, 'one_time', 'complete_trade', 1),
(8,  'Marathonien des Packs', 'Ouvrez 10 packs au total',                     'fas fa-fire',            500, 'one_time', 'open_pack',      10),
(9,  'Connexion du jour',     'Connectez-vous chaque jour',                   'fas fa-calendar-check',  50,  'daily',    'login',          1),
(10, 'Pack du jour',          'Ouvrez un pack aujourd hui',                   'fas fa-gift',            75,  'daily',    'open_pack',      1),
(11, 'Chasseur hebdo',        'Ouvrez 5 packs cette semaine',                 'fas fa-bolt',            300, 'weekly',   'open_pack',      5),
(12, 'Echangiste hebdo',      'Concluez 2 echanges cette semaine',            'fas fa-exchange-alt',    400, 'weekly',   'complete_trade', 2);

-- ============================================================
-- CONTRAINTES
-- ============================================================

ALTER TABLE `cards`
  ADD CONSTRAINT `cards_ibfk_1` FOREIGN KEY (`card_type_id`) REFERENCES `card_types` (`id`),
  ADD CONSTRAINT `cards_ibfk_2` FOREIGN KEY (`rarity_id`)    REFERENCES `rarities`   (`id`);

ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE;

ALTER TABLE `pack_card`
  ADD CONSTRAINT `pack_card_ibfk_1` FOREIGN KEY (`pack_id`) REFERENCES `packs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pack_card_ibfk_2` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE;

ALTER TABLE `trades`
  ADD CONSTRAINT `trades_ibfk_1` FOREIGN KEY (`proposer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trades_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `trade_items`
  ADD CONSTRAINT `trade_items_ibfk_1` FOREIGN KEY (`trade_id`)      REFERENCES `trades` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trade_items_ibfk_2` FOREIGN KEY (`card_id`)       REFERENCES `cards`  (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trade_items_ibfk_3` FOREIGN KEY (`from_user_id`)  REFERENCES `users`  (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trade_items_ibfk_4` FOREIGN KEY (`to_user_id`)    REFERENCES `users`  (`id`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
