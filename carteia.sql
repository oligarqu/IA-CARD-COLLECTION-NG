-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : mer. 29 avr. 2026 à 11:05
-- Version du serveur : 5.7.24
-- Version de PHP : 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `carteia`
--

-- --------------------------------------------------------

--
-- Structure de la table `cards`
--

CREATE TABLE `cards` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `attack` int(11) DEFAULT NULL,
  `hp` int(11) DEFAULT NULL,
  `is_object` tinyint(1) DEFAULT '0',
  `card_type_id` bigint(20) UNSIGNED NOT NULL,
  `rarity_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `cards`
--

INSERT INTO `cards` (`id`, `name`, `description`, `image_url`, `attack`, `hp`, `is_object`, `card_type_id`, `rarity_id`, `created_at`, `updated_at`) VALUES
(1, 'Steve', NULL, NULL, 10, 20, 0, 1, 1, NULL, NULL),
(2, 'Alexa', NULL, NULL, 10, 20, 0, 1, 1, NULL, NULL),
(3, 'Cochon', NULL, NULL, 0, 15, 0, 2, 1, NULL, NULL),
(4, 'Poule', NULL, NULL, 0, 10, 0, 2, 1, NULL, NULL),
(5, 'Steak', 'Un morceau de viande cuit, idéal pour récupérer des forces.', NULL, NULL, NULL, 1, 5, 1, NULL, NULL),
(6, 'Pomme', 'Une pomme croquante et rafraîchissante.', NULL, NULL, NULL, 1, 5, 1, NULL, NULL),
(7, 'FER', 'Un minerai très répandu, utilisé pour fabriquer des outils et armures.', NULL, NULL, NULL, 1, 5, 1, NULL, NULL),
(8, 'SABLE', 'Du sable fin, utile pour fabriquer du verre ou des TNT.', NULL, NULL, NULL, 1, 5, 1, NULL, NULL),
(9, 'LAINE', 'Une fibre douce, obtenue auprès des moutons.', NULL, NULL, NULL, 1, 5, 1, NULL, NULL),
(10, 'POISSON', 'Un poisson frais, bon à manger.', NULL, NULL, NULL, 1, 5, 1, NULL, NULL),
(11, 'Vache', NULL, NULL, 0, 20, 0, 2, 2, NULL, NULL),
(12, 'OR', 'Un métal précieux, moins résistant que le fer mais plus rare.', NULL, NULL, NULL, 1, 5, 2, NULL, NULL),
(13, 'BOIS', 'Matériau de base pour l\'artisanat et la construction.', NULL, NULL, NULL, 1, 5, 2, NULL, NULL),
(14, 'Squelette', NULL, NULL, 15, 20, 0, 3, 2, NULL, NULL),
(15, 'Zombie', NULL, NULL, 12, 25, 0, 3, 2, NULL, NULL),
(16, 'CHARBON', 'Une roche noire qui brûle longtemps.', NULL, NULL, NULL, 1, 5, 2, NULL, NULL),
(17, 'Loup', NULL, NULL, 15, 18, 0, 2, 2, NULL, NULL),
(18, 'Livre', 'Un recueil de connaissances, parfois enchanté.', NULL, NULL, NULL, 1, 5, 2, NULL, NULL),
(19, 'Arc', 'Une arme à distance essentielle pour tout archer.', NULL, NULL, NULL, 1, 5, 2, NULL, NULL),
(20, 'Potion', 'Une fiole aux effets magiques, capable de soigner ou renforcer.', NULL, NULL, NULL, 1, 5, 3, NULL, NULL),
(21, 'Ender Perle', 'Une perle mystérieuse permettant de se téléporter.', NULL, NULL, NULL, 1, 5, 3, NULL, NULL),
(22, 'Creeper', NULL, NULL, 25, 15, 0, 3, 3, NULL, NULL),
(23, 'Redstone', 'Une poudre rouge qui transmet l\'énergie des mécanismes.', NULL, NULL, NULL, 1, 5, 3, NULL, NULL),
(24, 'Blaze Squelette', NULL, NULL, 20, 20, 0, 3, 3, NULL, NULL),
(25, 'Warden', NULL, NULL, 35, 45, 0, 4, 3, NULL, NULL),
(26, 'Weather', 'Une carte ou un artefact permettant de contrôler la météo.', NULL, NULL, NULL, 1, 5, 3, NULL, NULL),
(27, 'Blaze Rod', 'Un bâton enflammé, source de puissance brute.', NULL, NULL, NULL, 1, 5, 3, NULL, NULL),
(28, 'DIAMAND', 'Le minerai le plus solide après la netherite.', NULL, NULL, NULL, 1, 5, 3, NULL, NULL),
(29, 'Elytra', 'Des ailes d\'insecte permettant de planer dans les airs.', NULL, NULL, NULL, 1, 5, 4, NULL, NULL),
(30, 'Netherite', 'Le métal le plus rare et le plus résistant qui soit.', NULL, NULL, NULL, 1, 5, 4, NULL, NULL),
(31, 'Under Drag', NULL, NULL, 45, 50, 0, 4, 4, NULL, NULL),
(32, 'Egg', 'Un œuf mystérieux et ancien, peut-être celui d\'un dragon.', NULL, NULL, NULL, 1, 5, 4, NULL, NULL),
(33, 'Totem', 'Un artefact sacré qui sauve son porteur de la mort.', NULL, NULL, NULL, 1, 5, 4, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `card_types`
--

CREATE TABLE `card_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `card_types`
--

INSERT INTO `card_types` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'humain', NULL, NULL),
(2, 'animal', NULL, NULL),
(3, 'mob', NULL, NULL),
(4, 'boss', NULL, NULL),
(5, 'objet', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `inventory`
--

CREATE TABLE `inventory` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `card_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `packs`
--

CREATE TABLE `packs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `cards_per_pack` int(11) DEFAULT '5',
  `price` int(11) DEFAULT '100',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `packs`
--

INSERT INTO `packs` (`id`, `name`, `description`, `cards_per_pack`, `price`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Pack Héroïque', 'Un pack équilibré avec des chances de cartes rares', 5, 100, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `pack_card`
--

CREATE TABLE `pack_card` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pack_id` bigint(20) UNSIGNED NOT NULL,
  `card_id` bigint(20) UNSIGNED NOT NULL,
  `weight` int(11) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `pack_card`
--

INSERT INTO `pack_card` (`id`, `pack_id`, `card_id`, `weight`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 70, NULL, NULL),
(2, 1, 3, 70, NULL, NULL),
(3, 1, 6, 50, NULL, NULL),
(4, 1, 14, 20, NULL, NULL),
(5, 1, 22, 9, NULL, NULL),
(6, 1, 29, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `rarities`
--

CREATE TABLE `rarities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `color` varchar(20) DEFAULT '#ffffff',
  `probability_weight` int(11) DEFAULT '1',
  `base_value` int(11) DEFAULT '10',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `rarities`
--

INSERT INTO `rarities` (`id`, `name`, `color`, `probability_weight`, `base_value`, `created_at`, `updated_at`) VALUES
(1, 'commun', '#9ca3af', 70, 10, NULL, NULL),
(2, 'rare', '#3b82f6', 20, 50, NULL, NULL),
(3, 'epic', '#a855f7', 9, 200, NULL, NULL),
(4, 'legendaire', '#fbbf24', 1, 1000, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `trades`
--

CREATE TABLE `trades` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `proposer_id` bigint(20) UNSIGNED NOT NULL,
  `receiver_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pending','accepted','refused','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `trade_items`
--

CREATE TABLE `trade_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `trade_id` bigint(20) UNSIGNED NOT NULL,
  `card_id` bigint(20) UNSIGNED NOT NULL,
  `from_user_id` bigint(20) UNSIGNED NOT NULL,
  `to_user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('player','admin') DEFAULT 'player',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@carteia.com', NULL, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, NULL, NULL),
(2, 'JoueurTest', 'joueur@carteia.com', NULL, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'player', NULL, NULL, NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `cards`
--
ALTER TABLE `cards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `card_type_id` (`card_type_id`),
  ADD KEY `rarity_id` (`rarity_id`);

--
-- Index pour la table `card_types`
--
ALTER TABLE `card_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `card_id` (`card_id`);

--
-- Index pour la table `packs`
--
ALTER TABLE `packs`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `pack_card`
--
ALTER TABLE `pack_card`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pack_id` (`pack_id`),
  ADD KEY `card_id` (`card_id`);

--
-- Index pour la table `rarities`
--
ALTER TABLE `rarities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `trades`
--
ALTER TABLE `trades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposer_id` (`proposer_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Index pour la table `trade_items`
--
ALTER TABLE `trade_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trade_id` (`trade_id`),
  ADD KEY `card_id` (`card_id`),
  ADD KEY `from_user_id` (`from_user_id`),
  ADD KEY `to_user_id` (`to_user_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `cards`
--
ALTER TABLE `cards`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT pour la table `card_types`
--
ALTER TABLE `card_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `packs`
--
ALTER TABLE `packs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `pack_card`
--
ALTER TABLE `pack_card`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `rarities`
--
ALTER TABLE `rarities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `trades`
--
ALTER TABLE `trades`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `trade_items`
--
ALTER TABLE `trade_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `cards`
--
ALTER TABLE `cards`
  ADD CONSTRAINT `cards_ibfk_1` FOREIGN KEY (`card_type_id`) REFERENCES `card_types` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cards_ibfk_2` FOREIGN KEY (`rarity_id`) REFERENCES `rarities` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `pack_card`
--
ALTER TABLE `pack_card`
  ADD CONSTRAINT `pack_card_ibfk_1` FOREIGN KEY (`pack_id`) REFERENCES `packs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pack_card_ibfk_2` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `trades`
--
ALTER TABLE `trades`
  ADD CONSTRAINT `trades_ibfk_1` FOREIGN KEY (`proposer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trades_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `trade_items`
--
ALTER TABLE `trade_items`
  ADD CONSTRAINT `trade_items_ibfk_1` FOREIGN KEY (`trade_id`) REFERENCES `trades` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trade_items_ibfk_2` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trade_items_ibfk_3` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trade_items_ibfk_4` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
