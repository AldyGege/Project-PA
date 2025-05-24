const express = require("express");
const router = express.Router();
const Model_Berita = require('../model/Model_Berita.js');
const Model_Admin = require('../model/Model_Admin.js');
const Model_Users = require('../model/Model_Users.js');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/berita')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
})

router.get('/', async (req, res, next) => {
    try {
        let id = req.session.adminId;
        let Data = await Model_Admin.getId(id);
        let rows = await Model_Berita.getAll();
        res.render('berita/index', {
            data: rows,
            data2: Data,
        });
    } catch (error) {
        next(error);
    }
});

    router.get('/users', async (req, res, next) => {
        try {
            let id = req.session.userId;
            let Data = await Model_Users.getId(id);
            let rows = await Model_Berita.getAll();
            res.render('users/berita', {
                data: rows,
                data1: Data,
            });
        } catch (error) {
            next(error);
        }
    });

router.get('/detail/:id', async (req, res, next) => {
  try {
    let userId = req.session.userId;
    let userData = await Model_Users.getId(userId);
    let beritaId = req.params.id; // <- harus ini dulu
    let berita = await Model_Berita.getId(beritaId);

    if (!berita || berita.length === 0) {
      req.flash('error', 'Berita tidak ditemukan');
      return res.redirect('/berita/users');
    }

    let beritaLain = await Model_Berita.getLimited(5, beritaId); // pakai setelah beritaId sudah dideklarasi

    res.render('users/detail_berita', {
      data: berita[0],
      data1: userData,
      beritaLain
    });
  } catch (error) {
    next(error);
  }
});




router.get('/create', async function (req, res, next) {
    try {
        let id = req.session.adminId;
        let admin = await Model_Admin.getId(id);
        let Data = await Model_Berita.getAll();
        res.render('berita/create', {
            nama_service: '',
            data: Data,
            data2:admin[0],
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/store', upload.single("gambar_berita"), async function (req, res, next) {
    try {
        let {id_admin, nama_berita, deskripsi_berita, tanggal_upload, } = req.body;
        let Data = {
            id_admin, 
            nama_berita,
            deskripsi_berita,
            tanggal_upload,
            gambar_berita: req.file.filename
        }
        await Model_Berita.Store(Data);
        req.flash('success', 'Berhasil menyimpan data');
        res.redirect('/berita');
        
    } catch (error) {
        req.flash('error', 'Terjadi kesalahan pada fungsi')
        console.log(error);
        res.redirect('/berita')
    }
    
})


router.get("/edit/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        let rows = await Model_Berita.getId(id);
        let admin = await Model_Admin.getId(req.session.adminId); // Ambil data pengguna yang login

        if (rows.length > 0) {
            res.render("berita/edit", {
                id: id,
                data: rows[0],
                data2: admin[0], // Kirim data pengguna yang login
            });
        } else {
            req.flash("error", "berita not found");
            res.redirect("/berita");
        }
    } catch (error) {
        next(error);
    }
});

router.post("/update/:id",  upload.single("gambar_berita"), async (req, res, next) => {
    try {
        const id = req.params.id;
        let filebaru = req.file ? req.file.filename : null;
        let rows = await Model_Berita.getId(id);
        const namaFileLama = rows[0].gambar_berita;

        if (filebaru && namaFileLama) {
            const pathFileLama = path.join(__dirname, '../public/images/berita', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }

        let id_admin = req.session.adminId;
        let {
            nama_berita, deskripsi_berita
        } = req.body;
        
        let gambar_berita = filebaru || namaFileLama

        let Data = {
            id_admin,
            nama_berita: nama_berita,
            deskripsi_berita: deskripsi_berita,
            gambar_berita
        }
        console.log(req.body);
        console.log(Data);
        await Model_Berita.Update(id, Data);
        req.flash("success", "Berhasil mengupdate data berita");
        res.redirect("/berita");
    } catch (error) {
        console.log(error);
    }
});


router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_Berita.Delete(id);
        req.flash('success', 'Berhasil menghapus data berita');
        res.redirect('/berita');
    } catch (error) {
        req.flash("error", "Gagal menghapus data berita");
        res.redirect("/berita");
    }
});


module.exports = router;