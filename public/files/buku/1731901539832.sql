-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 16, 2024 at 06:51 AM
-- Server version: 8.0.30
-- PHP Version: 8.2.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rsi_garam`
--

-- --------------------------------------------------------

--
-- Table structure for table `album`
--

CREATE TABLE `album` (
  `id_album` int NOT NULL,
  `nama_album` varchar(255) NOT NULL,
  `jenis_album` enum('perkumpulan','ramadhan','pelatihan','acara') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `deskripsi_album` varchar(255) NOT NULL,
  `gambar_album` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `album`
--

INSERT INTO `album` (`id_album`, `nama_album`, `jenis_album`, `deskripsi_album`, `gambar_album`) VALUES
(2, 'Rapat 1', 'perkumpulan', 'rapat rakernas', '1725929860811.jpeg'),
(3, 'bukber', 'ramadhan', 'bukber di restoran', '1725929918114.jpeg'),
(4, 'pelaatihan 1', 'pelatihan', 'pelatihan kerja', '1725929941506.jpeg'),
(5, 'kunjungan kerja', 'acara', 'kunjungan kerja direktur', '1725929967107.jpeg'),
(6, 'perkumpulan dokter', 'perkumpulan', 'kumpul', '1725930406733.jpeg'),
(7, 'Rapat 3', 'perkumpulan', 'ini rapat', '1725930505406.jpeg');

-- --------------------------------------------------------

--
-- Table structure for table `berita`
--

CREATE TABLE `berita` (
  `id_berita` int NOT NULL,
  `nama_berita` varchar(255) NOT NULL,
  `deskripsi_berita` varchar(255) NOT NULL,
  `gambar_berita` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `berita`
--

INSERT INTO `berita` (`id_berita`, `nama_berita`, `deskripsi_berita`, `gambar_berita`) VALUES
(2, 'Mahasiswi ini Pemecah Rekor Magang', 'WaH keren banget yaa teman teman', '1723694124434.jpg'),
(3, 'Mahasiswi ini Pemecah Rekor Website Developer', 'Satu kata \"HEBAT\"', '1725073305849.jpg'),
(5, 'Trio Serangkai Kembali Mengguncang!!', 'Saksikan malam ini di Televisi Kesayangan anda', '1725073278499.jpg'),
(7, 'Inilah anak magang RSI Garam', 'Anak magang ini dari PENS Kampus Sumenep', '1725073236905.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `buku`
--

CREATE TABLE `buku` (
  `id_buku` int NOT NULL,
  `nama_buku` varchar(255) NOT NULL,
  `deskripsi_buku` varchar(255) NOT NULL,
  `gambar_buku` varchar(255) NOT NULL,
  `file_buku` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `buku`
--

INSERT INTO `buku` (`id_buku`, `nama_buku`, `deskripsi_buku`, `gambar_buku`, `file_buku`) VALUES
(3, 'prosedur', 'ini prosedur', '1726108446944.jpeg', '1726108446947.pdf'),
(4, 'prosedur 2', 'ini prosedur 2', '1726109033213.jpeg', '1726109033214.pdf'),
(5, 'prosedur 3', 'ini prosedur 3', '1726109058642.jpeg', '1726109058644.pdf'),
(6, 'prosedur 4', 'ini prosedur 4', '1726109127891.jpeg', '1726109127892.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `dokter`
--

CREATE TABLE `dokter` (
  `id_dokter` int NOT NULL,
  `nama_dokter` varchar(255) NOT NULL,
  `no_hp` varchar(13) NOT NULL,
  `alamat_dokter` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `id_keahlian` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `gambar_dokter` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `dokter`
--

INSERT INTO `dokter` (`id_dokter`, `nama_dokter`, `no_hp`, `alamat_dokter`, `id_keahlian`, `gambar_dokter`) VALUES
(8, 'Dr. H Utomo', '0947223632322', 'Batuan', '6', '1730960836624.jpg'),
(10, 'Dr. Arya Rasyi', '082332761532', 'Pabian', '10', '1730960766953.jpg'),
(11, 'Dr, Budi Herlambang', '0882341241232', 'Sumenep', '11', '1730960750918.jpeg'),
(12, 'Dr. Fajar Harini', '0984837432', 'Batuan', '11', '1730961034811.jpg'),
(13, 'Dr. Fazarrahmah', '0947223632322', 'Kalianget', '11', '1730961084483.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `jadwal`
--

CREATE TABLE `jadwal` (
  `id_jadwal` int NOT NULL,
  `id_dokter` int NOT NULL,
  `senin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `selasa` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `rabu` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `kamis` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `jumat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `sabtu` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `minggu` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `jadwal`
--

INSERT INTO `jadwal` (`id_jadwal`, `id_dokter`, `senin`, `selasa`, `rabu`, `kamis`, `jumat`, `sabtu`, `minggu`) VALUES
(81, 10, '07:30', '-', '09:00', '-', '08:40', '-', '-'),
(82, 11, '07:30', '-', '09:00', '08:30', '10:30', '-', '-');

--
-- Triggers `jadwal`
--
DELIMITER $$
CREATE TRIGGER `set_default_days_insert` BEFORE INSERT ON `jadwal` FOR EACH ROW BEGIN
    IF NEW.senin = '' THEN
        SET NEW.senin = '-';
    END IF;
    IF NEW.selasa = '' THEN
        SET NEW.selasa = '-';
    END IF;
    IF NEW.rabu = '' THEN
        SET NEW.rabu = '-';
    END IF;
    IF NEW.kamis = '' THEN
        SET NEW.kamis = '-';
    END IF;
    IF NEW.jumat = '' THEN
        SET NEW.jumat = '-';
    END IF;
    IF NEW.sabtu = '' THEN
        SET NEW.sabtu = '-';
    END IF;
    IF NEW.minggu = '' THEN
        SET NEW.minggu = '-';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `kategori_menu`
--

CREATE TABLE `kategori_menu` (
  `id_kategori` int NOT NULL,
  `nama_kategori` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kategori_menu`
--

INSERT INTO `kategori_menu` (`id_kategori`, `nama_kategori`) VALUES
(2, 'makanan'),
(3, 'minuman');

-- --------------------------------------------------------

--
-- Table structure for table `keahlian`
--

CREATE TABLE `keahlian` (
  `id_keahlian` int NOT NULL,
  `keahlian` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `keahlian`
--

INSERT INTO `keahlian` (`id_keahlian`, `keahlian`) VALUES
(6, 'Spesialis Gizi'),
(10, 'Spesilis Mata'),
(11, 'Spesialis Umum');

-- --------------------------------------------------------

--
-- Table structure for table `layanan`
--

CREATE TABLE `layanan` (
  `id_layanan` int NOT NULL,
  `nama_layanan` varchar(255) NOT NULL,
  `subnama_layanan` varchar(255) NOT NULL,
  `deskripsi_layanan` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `gambar_layanan` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `layanan`
--

INSERT INTO `layanan` (`id_layanan`, `nama_layanan`, `subnama_layanan`, `deskripsi_layanan`, `gambar_layanan`) VALUES
(3, 'Rawat Inap', 'Ruang Shofa (VIP)', 'Ruang rawat inap adalah ruang tempat pasien dirawat. Ruangan ini dulunya sering hanya berupa bangsal yang dihuni oleh banyak orang sekaligus. Saat ini, ruang rawat inap di banyak rumah sakit sudah sangat mirip dengan kamar-kamar hotel.', '1730962371303.jpg'),
(4, 'IGD 24 Jam', 'Instalasi Gawat Darurat', 'Instalasi Emergensi/Instalasi Gawat Darurat (IGD) adalah salah satu bagian di dalam sebuah rumah sakit yang menyediakan penanganan awal bagi pasien yang menderita sakit dan cedera, yang dapat mengancam kelangsungan hidupnya. Di IGD terdapat dokter dari berbagai spesialisasi bersama sejumlah perawat dan dokter jaga', '1730962697610.png');

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `id_menu` int NOT NULL,
  `nama_menu` varchar(255) NOT NULL,
  `harga_menu` varchar(255) NOT NULL,
  `deskripsi_menu` varchar(255) NOT NULL,
  `gambar_menu` varchar(255) NOT NULL,
  `id_kategori` int NOT NULL,
  `stock` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`id_menu`, `nama_menu`, `harga_menu`, `deskripsi_menu`, `gambar_menu`, `id_kategori`, `stock`) VALUES
(2, 'Jus Mangga', '5000', 'Jus mangga sehat', '1731143637150.jpeg', 3, 25),
(3, 'Healty Salad', '45000', 'Salad Sehat Khas RSI', '1731143118242.jpeg', 3, 100),
(4, 'Healty Nasi Goreng', '50000', 'Mulailah hidup sehat dengan makanan sehat', '1731142985430.jpeg', 2, 250);

-- --------------------------------------------------------

--
-- Table structure for table `pembayaran`
--

CREATE TABLE `pembayaran` (
  `id_pembayaran` int NOT NULL,
  `id_menu` int NOT NULL,
  `id_users` int NOT NULL,
  `kategori_pesanan` enum('pedas','tidak pedas','dingin','normal','hangat') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `status_pemesanan` enum('order','done') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `jumlah` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pembayaran`
--

INSERT INTO `pembayaran` (`id_pembayaran`, `id_menu`, `id_users`, `kategori_pesanan`, `status_pemesanan`, `jumlah`) VALUES
(4, 4, 2, 'pedas', 'order', 1),
(5, 4, 2, 'pedas', 'order', 1),
(6, 3, 2, 'pedas', 'order', 1),
(7, 4, 2, 'pedas', 'order', 1),
(12, 3, 2, 'tidak pedas', 'order', 3),
(13, 2, 2, 'normal', 'order', 1),
(15, 2, 2, 'dingin', 'order', 2),
(16, 2, 2, 'hangat', 'order', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_users` int NOT NULL,
  `nama_users` varchar(255) NOT NULL,
  `alamat_users` varchar(255) NOT NULL,
  `no_telp_users` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email_users` varchar(255) NOT NULL,
  `password_users` varchar(255) NOT NULL,
  `gambar_users` varchar(255) NOT NULL,
  `level_users` enum('1','2') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_users`, `nama_users`, `alamat_users`, `no_telp_users`, `email_users`, `password_users`, `gambar_users`, `level_users`) VALUES
(1, 'Shobri', 'Sumenep', '08995744932', 'shobri45@gmail.com', '$2b$10$3NP88wQK1mM4k/E3jItdue9OPV8xWdJUOa61R7cYKcIS8Bc/3AQ0e', '1721699570340.jpeg', '1'),
(2, 'Raihan Gaming', 'Talango', '0823782373', 'shobri45@gmail.com', '$2b$10$jxX58wMLraxwporO6G4bNeRv8wkQNIdoJe1G640THyBY4gAM9/zE2', '1722061430472.jpg', '1'),
(3, 'Aldy Hari Putra', 'Sumenep', '09987343231', 'aldy86@gmail.com', '$2b$10$RH9N7iK6kYOs/lTunkYFcOJDnuuRS/9JXfCbkyovej0tYqyOT/TmS', '1722061639346.jpg', '1');

-- --------------------------------------------------------

--
-- Table structure for table `userskantin`
--

CREATE TABLE `userskantin` (
  `id_users` int NOT NULL,
  `nama_users` varchar(255) NOT NULL,
  `nama_panggilan_users` varchar(255) NOT NULL,
  `no_telp_users` varchar(13) NOT NULL,
  `jenis_kelamin` enum('Pria','Wanita') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email_users` varchar(255) NOT NULL,
  `password_users` varchar(255) NOT NULL,
  `gambar_users` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `userskantin`
--

INSERT INTO `userskantin` (`id_users`, `nama_users`, `nama_panggilan_users`, `no_telp_users`, `jenis_kelamin`, `email_users`, `password_users`, `gambar_users`) VALUES
(1, 'Aldy Hari Putra', 'Aldyansd', '0823782373', 'Pria', 'aldy8688@gmail.com', '$2b$10$PrvNLuyKNIjnUNtoOLvbZOZd7TZuGCDcQ0LDur1eztL0NAbtqxe36', '1731738954014.jpg'),
(2, 'Shobri', '', '08995744932', 'Pria', 'shobri45@gmail.com', '$2b$10$xsbUwLd4pJ6/cN3tjOOIBe6S7FgUEeewPwlW2YvbJQ.jhj1upZCOS', '1729222579643.jpeg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `album`
--
ALTER TABLE `album`
  ADD PRIMARY KEY (`id_album`);

--
-- Indexes for table `berita`
--
ALTER TABLE `berita`
  ADD PRIMARY KEY (`id_berita`);

--
-- Indexes for table `buku`
--
ALTER TABLE `buku`
  ADD PRIMARY KEY (`id_buku`);

--
-- Indexes for table `dokter`
--
ALTER TABLE `dokter`
  ADD PRIMARY KEY (`id_dokter`),
  ADD KEY `keahlian_dokter` (`id_keahlian`);

--
-- Indexes for table `jadwal`
--
ALTER TABLE `jadwal`
  ADD PRIMARY KEY (`id_jadwal`),
  ADD KEY `id_dokter` (`id_dokter`);

--
-- Indexes for table `kategori_menu`
--
ALTER TABLE `kategori_menu`
  ADD PRIMARY KEY (`id_kategori`);

--
-- Indexes for table `keahlian`
--
ALTER TABLE `keahlian`
  ADD PRIMARY KEY (`id_keahlian`);

--
-- Indexes for table `layanan`
--
ALTER TABLE `layanan`
  ADD PRIMARY KEY (`id_layanan`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id_menu`),
  ADD KEY `kategoriMenu` (`id_kategori`);

--
-- Indexes for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD PRIMARY KEY (`id_pembayaran`),
  ADD KEY `id_menu` (`id_menu`),
  ADD KEY `id_users` (`id_users`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_users`);

--
-- Indexes for table `userskantin`
--
ALTER TABLE `userskantin`
  ADD PRIMARY KEY (`id_users`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `album`
--
ALTER TABLE `album`
  MODIFY `id_album` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `berita`
--
ALTER TABLE `berita`
  MODIFY `id_berita` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `buku`
--
ALTER TABLE `buku`
  MODIFY `id_buku` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `dokter`
--
ALTER TABLE `dokter`
  MODIFY `id_dokter` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `jadwal`
--
ALTER TABLE `jadwal`
  MODIFY `id_jadwal` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `kategori_menu`
--
ALTER TABLE `kategori_menu`
  MODIFY `id_kategori` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `keahlian`
--
ALTER TABLE `keahlian`
  MODIFY `id_keahlian` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `layanan`
--
ALTER TABLE `layanan`
  MODIFY `id_layanan` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id_menu` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pembayaran`
--
ALTER TABLE `pembayaran`
  MODIFY `id_pembayaran` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_users` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `userskantin`
--
ALTER TABLE `userskantin`
  MODIFY `id_users` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
