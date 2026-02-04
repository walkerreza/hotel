-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 29, 2024 at 08:27 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hoteljs`
--

-- --------------------------------------------------------

--
-- Table structure for table `gambars`
--

CREATE TABLE `gambars` (
  `id` int NOT NULL,
  `gambar_preview` varchar(255) NOT NULL,
  `gambar_kamar` varchar(255) NOT NULL,
  `gambar_fasilitas` varchar(255) NOT NULL,
  `gambar_lokasi` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `gambars`
--

INSERT INTO `gambars` (`id`, `gambar_preview`, `gambar_kamar`, `gambar_fasilitas`, `gambar_lokasi`) VALUES
(1, 'uploads\\gambar_preview-1731937385459-832342513.jpg', 'uploads\\gambar_kamar-1731937385463-877866196.jpg', 'uploads\\gambar_fasilitas-1731937385468-86424725.jpg', 'uploads\\gambar_lokasi-1731937385471-729257977.jpg'),
(2, 'uploads\\gambar_preview-1731937391681-856308158.jpg', 'uploads\\gambar_kamar-1731937391683-788157303.jpg', 'uploads\\gambar_fasilitas-1731937391686-947565779.jpg', 'uploads\\gambar_lokasi-1731937391689-602212623.jpg'),
(3, 'uploads\\gambar_preview-1731937393118-118521030.jpg', 'uploads\\gambar_kamar-1731937393120-891385362.jpg', 'uploads\\gambar_fasilitas-1731937393124-381518794.jpg', 'uploads\\gambar_lokasi-1731937393126-515386346.jpg'),
(4, 'uploads\\gambar_preview-1731937394402-379964532.jpg', 'uploads\\gambar_kamar-1731937394403-475615693.jpg', 'uploads\\gambar_fasilitas-1731937394409-641071646.jpg', 'uploads\\gambar_lokasi-1731937394412-928645514.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `kamars`
--

CREATE TABLE `kamars` (
  `id` int NOT NULL,
  `nomor_kamar` varchar(255) NOT NULL,
  `tipe_kamar` varchar(255) NOT NULL,
  `harga_per_malam` decimal(10,0) NOT NULL,
  `status_kamar` enum('tersedia','dipesan') DEFAULT 'tersedia',
  `gambar_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kamars`
--

INSERT INTO `kamars` (`id`, `nomor_kamar`, `tipe_kamar`, `harga_per_malam`, `status_kamar`, `gambar_id`, `created_at`, `updated_at`) VALUES
(1, '1', 'luxury', '4000000', 'tersedia', 1, '2024-11-18 13:44:10', '2024-11-18 13:44:10'),
(2, '2', 'economy', '4000000', 'tersedia', 2, '2024-11-18 13:44:35', '2024-11-18 13:44:35'),
(3, '3', 'double bed', '4000000', 'tersedia', 3, '2024-11-18 13:44:58', '2024-11-18 13:44:58'),
(4, '4', 'premium king', '4000000', 'tersedia', 4, '2024-11-18 13:45:18', '2024-11-18 13:45:18');

-- --------------------------------------------------------

--
-- Table structure for table `pembayarans`
--

CREATE TABLE `pembayarans` (
  `id` int NOT NULL,
  `reservasi_id` int NOT NULL,
  `jumlah` decimal(10,0) NOT NULL,
  `metode_pembayaran` enum('transfer','kartu kredit','cash') NOT NULL,
  `status_pembayaran` enum('pending','sukses','gagal') DEFAULT 'pending',
  `tanggal_pembayaran` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pembayarans`
--

INSERT INTO `pembayarans` (`id`, `reservasi_id`, `jumlah`, `metode_pembayaran`, `status_pembayaran`, `tanggal_pembayaran`, `created_at`, `updated_at`) VALUES
(1, 1, '4000000', 'transfer', 'sukses', '2024-11-18 14:28:36', '2024-11-18 14:28:36', '2024-11-18 14:28:36'),
(2, 2, '4000000', 'transfer', 'sukses', '2024-11-18 14:28:36', '2024-11-18 14:28:36', '2024-11-18 14:28:36'),
(3, 3, '604000000', 'transfer', 'sukses', '2024-11-18 14:44:37', '2024-11-18 14:44:37', '2024-11-18 14:44:37'),
(4, 4, '604000000', 'transfer', 'sukses', '2024-11-18 14:44:37', '2024-11-18 14:44:37', '2024-11-18 14:44:37');

-- --------------------------------------------------------

--
-- Table structure for table `reservasis`
--

CREATE TABLE `reservasis` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `kamar_id` int NOT NULL,
  `tanggal_checkin` datetime NOT NULL,
  `tanggal_checkout` datetime NOT NULL,
  `status_reservasi` enum('dipesan','dibatalkan','selesai') DEFAULT 'dipesan',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reservasis`
--

INSERT INTO `reservasis` (`id`, `user_id`, `kamar_id`, `tanggal_checkin`, `tanggal_checkout`, `status_reservasi`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2024-02-12 00:00:00', '2024-02-13 00:00:00', 'selesai', '2024-11-18 13:52:54', '2024-11-18 14:28:36'),
(2, 1, 2, '2024-02-12 00:00:00', '2024-02-13 00:00:00', 'selesai', '2024-11-18 13:54:37', '2024-11-18 14:28:36'),
(3, 1, 1, '2024-05-02 00:00:00', '2024-09-30 00:00:00', 'selesai', '2024-11-18 14:41:47', '2024-11-18 14:44:37'),
(4, 1, 4, '2024-05-02 00:00:00', '2024-09-30 00:00:00', 'selesai', '2024-11-18 14:41:47', '2024-11-18 14:44:37');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'reza', 'reza@gmail.com', '$2b$10$zIb4ikBiaNCeY3DuOTikreAYfrrhcPgTzIXtXh0TWKY8Y/ty/PXNi', 'user', '2024-11-18 13:34:04', '2024-11-18 13:34:04'),
(3, 'admin', 'admin@gmail.com', '$2b$10$ak61CXtFtZ.94MBCZU004.1V9JswxouCjZQVzjGrwEW7pfRsooO9G', 'admin', '2024-11-18 13:37:54', '2024-11-18 13:37:54');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `gambars`
--
ALTER TABLE `gambars`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kamars`
--
ALTER TABLE `kamars`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gambar_id` (`gambar_id`);

--
-- Indexes for table `pembayarans`
--
ALTER TABLE `pembayarans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservasi_id` (`reservasi_id`);

--
-- Indexes for table `reservasis`
--
ALTER TABLE `reservasis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `kamar_id` (`kamar_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `gambars`
--
ALTER TABLE `gambars`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `kamars`
--
ALTER TABLE `kamars`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pembayarans`
--
ALTER TABLE `pembayarans`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `reservasis`
--
ALTER TABLE `reservasis`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `kamars`
--
ALTER TABLE `kamars`
  ADD CONSTRAINT `kamars_ibfk_1` FOREIGN KEY (`gambar_id`) REFERENCES `gambars` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `pembayarans`
--
ALTER TABLE `pembayarans`
  ADD CONSTRAINT `pembayarans_ibfk_1` FOREIGN KEY (`reservasi_id`) REFERENCES `reservasis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reservasis`
--
ALTER TABLE `reservasis`
  ADD CONSTRAINT `reservasis_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reservasis_ibfk_2` FOREIGN KEY (`kamar_id`) REFERENCES `kamars` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
