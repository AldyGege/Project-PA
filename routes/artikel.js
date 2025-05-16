var express = require('express');
var router = express.Router();
const Model_Berita = require('../model/Model_Berita.js');
const Model_Album = require('../Model/Model_Album.js');
const Model_Buku = require('../Model/Model_Buku.js');

router.get('/users', async function (req, res, next) {
    try {
        let rows = await Model_Berita.getAll();
        let rows2 = await Model_Album.getAll();
        let rows3 = await Model_Buku.getAll();
        res.render('artikel/users/index', {
            data: rows, 
            data_album: rows2,
            data_buku: rows3
        });
    } catch (error) {
        console.error("Error:", error);
        req.flash('invalid', 'Terjadi kesalahan saat memuat data pengguna');
        res.redirect('/login');
    }
});

router.get('/detail/:id', async (req, res, next) => {
    try {
        const id = req.params.id; // ID berita utama dari URL
        const beritaUtama = await Model_Berita.getId(id); // Mendapatkan data berita utama
        const beritaLain = await Model_Berita.getLimited(3, id); // Mendapatkan 3 berita lainnya (kecuali berita utama)

        res.render('artikel/users/detail', {
            data: beritaUtama[0],  // Data berita utama
            beritaLain: beritaLain // Data berita lainnya
        });
    } catch (error) {
        next(error);
    }
});






module.exports = router;