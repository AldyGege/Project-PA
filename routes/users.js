var express = require("express");
const Model_Users = require("../model/Model_Users");
const Model_Mapel = require("../model/Model_Mapel");
const Model_Pendaftaran = require("../model/Model_Pendaftaran");
const Model_Guru = require("../model/Model_Guru");
const Model_Album = require("../model/Model_Album");
var router = express.Router();


router.get('/', async function (req, res, next) {
  try {
    let id = req.session.userId;
    let users = await Model_Users.getId(id);
      let mapel = await Model_Mapel.getAll();
      let guru = await Model_Guru.getAll();
      let album = await Model_Album.getAll();
      res.render('users/index', {
        data1: users,
        data2: mapel,
        data3: guru,
        data4: album,
      });
  } catch (error) {
      console.error("Error:", error);
      req.flash('invalid', 'Terjadi kesalahan saat memuat data pengguna');
      res.redirect('/login_users');
  }
});

router.get('/profil', async function (req, res, next) {
  try {
    let id = req.session.userId;
    let users = await Model_Users.getId(id);
    let mapel = await Model_Mapel.getAll();
    let pendaftaran = await Model_Pendaftaran.getByUserId(id); // Ambil data pendaftaran berdasarkan user yang login

    res.render('users/profil', {
      id: id,
      data1: users,
      data2: mapel,
      data3: pendaftaran // Pastikan ini hanya berisi data pendaftaran milik user
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash('invalid', 'Terjadi kesalahan saat memuat data pengguna');
    res.redirect('/login_users');
  }
});

router.get('/petunjuk', async function (req, res, next) {
  try {
      let mapel = await Model_Mapel.getAll();
      let guru = await Model_Guru.getAll();
      res.render('users/petunjuk', {
          data1: mapel,
          data2: guru,
      });
  } catch (error) {
      console.error("Error:", error);
      req.flash('invalid', 'Terjadi kesalahan saat memuat data pengguna');
      res.redirect('/login_users');
  }
});

router.get('/get-pendaftaran/:id', async function (req, res) {
    try {
        let id_pendaftaran = req.params.id;
        console.log("🟡 ID yang diterima di backend:", id_pendaftaran);  // ✅ Debug di server

        let pendaftaran = await Model_Pendaftaran.getId(id_pendaftaran);
        console.log("📍 Hasil Query:", pendaftaran); // ✅ Debug hasil query

        if (!pendaftaran) {
            console.warn("⚠️ Data tidak ditemukan untuk ID:", id_pendaftaran);
            return res.status(404).json({ error: "Data tidak ditemukan" });
        }

        res.json(pendaftaran);
    } catch (error) {
        console.error("❌ Error fetching pendaftaran:", error);
        res.status(500).json({ error: "Terjadi kesalahan saat mengambil data" });
    }
});


module.exports = router;
