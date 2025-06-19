var express = require("express");
const Model_Admin = require("../model/Model_Admin");
const Model_Pendaftaran = require("../model/Model_Pendaftaran");
const Model_Daftar_Ulang = require("../model/Model_Daftar_Ulang");
const Model_Siswa = require("../model/Model_Siswa");
const Model_Keuangan = require("../model/Model_Keuangan");
var router = express.Router();

/* GET users listing. */
router.get('/', async function (req, res, next) {
  try {
    let id = req.session.adminId;
    if (!id) {
      req.flash('failure', 'Silakan login terlebih dahulu');
      return res.redirect('/login');
    }

    let Data = await Model_Admin.getId(id);
    let Data_Pendaftar = await Model_Pendaftaran.getAll();
    let Data_Daftar_Ulang = await Model_Daftar_Ulang.getAll();
    let Data_Siswa = await Model_Siswa.getAll();
    let SaldoSaatIni = await Model_Keuangan.getSaldoSaatIni();
    let tahunSekarang = new Date().getFullYear();
    
    // Get available years for financial data
    let tahunKeuangan = await Model_Keuangan.getDistinctYears();
    // Use the latest available year or current year if available
    let tahunUntukGrafik = tahunKeuangan.includes(tahunSekarang) ? tahunSekarang : (tahunKeuangan[0] || tahunSekarang);
    
    let GrafikKeuangan = await Model_Keuangan.getGrafikKeuanganPerBulan(tahunUntukGrafik); 
    let totalPendaftar = Data_Pendaftar.length;
    let totalDaftarUlang = Data_Daftar_Ulang.length;
    let totalSiswa = Data_Siswa.length;
    let jumlahDaftarUlangBaru = await Model_Daftar_Ulang.countBaru();
    let pendaftaranBaru = Data_Pendaftar.filter(p => p.status_pendaftaran === 'proses');
    let jumlahPendaftaranBaru = pendaftaranBaru.length;

    if (Data.length > 0) {
      res.render("users/superusers", {
        title: "Admin Home",
        email: Data[0].email_admin,
        nama_admin: Data[0].nama_admin,
        data2: Data,
        data_pendaftar: Data_Pendaftar,
        data_daftar_ulang: Data_Daftar_Ulang,
        data_siswa: Data_Siswa,
        totalPendaftar,
        totalDaftarUlang,
        totalSiswa,
        saldo: SaldoSaatIni,
        grafikKeuangan: GrafikKeuangan,
        jumlahDaftarUlangBaru: jumlahDaftarUlangBaru,
        jumlahPendaftaranBaru: jumlahPendaftaranBaru,
        tahunKeuangan: tahunKeuangan, // Pass available years to view
        tahunSekarang: tahunSekarang,
        tahunUntukGrafik: tahunUntukGrafik // Pass the selected year for initial chart
      });
    } else {
      res.status(401).json({ error: "User tidak ditemukan" });
    }
  } catch (error) {
    console.log(error);
    req.flash('failure', 'Terjadi kesalahan, silakan login ulang');
    res.redirect('/login');
  }
});

router.get('/grafik-keuangan/:tahun', async function(req, res, next) {
  try {
    const tahun = req.params.tahun;
    // Bisa tambah validasi tahun di sini kalau mau, misal cek format atau range tahun
    
    const dataGrafik = await Model_Keuangan.getGrafikKeuanganPerBulan(tahun);
    res.json(dataGrafik);
  } catch (error) {
    console.error('Error ambil data grafik:', error);
    res.status(500).json({ error: 'Gagal mengambil data grafik keuangan' });
  }
});

router.get('/tahun-keuangan', async function(req, res, next) {
  try {
    const data = await Model_Keuangan.getDistinctYears();
    res.json(data);
  } catch (error) {
    console.error('Error ambil data tahun keuangan:', error);
    res.status(500).json({ error: 'Gagal mengambil data tahun keuangan' });
  }
});

router.get('/grafik-siswa-per-tahun', async function (req, res, next) {
  try {
    const data = await Model_Siswa.getStatistikPerTahun(); // Fungsi ini perlu kamu buat di model
    res.json(data);
  } catch (error) {
    console.error('Error ambil data siswa per tahun:', error);
    res.status(500).json({ error: 'Gagal mengambil data siswa' });
  }
});



router.get('/profil_admin', async function (req, res, next) {
  try {
    let id = req.session.adminId;
    let admin = await Model_Admin.getId(id);

    res.render('users/profil_admin', {
      id: id,
      data1: admin,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash('invalid', 'Terjadi kesalahan saat memuat data pengguna');
    res.redirect('/login_users');
  }
});


module.exports = router;
