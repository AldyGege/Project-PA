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
    let id = req.session.adminId; // Pastikan menggunakan adminId yang benar
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
    let GrafikKeuangan = await Model_Keuangan.getGrafikKeuanganPerBulan(tahunSekarang); 
    let totalPendaftar = Data_Pendaftar.length;
    let totalDaftarUlang = Data_Daftar_Ulang.length;
    let totalSiswa = Data_Siswa.length;


    if (Data.length > 0) {
      res.render("users/superusers", {
        title: "Admin Home",
        email: Data[0].email_admin, // Perbaiki agar sesuai dengan database
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

module.exports = router;
