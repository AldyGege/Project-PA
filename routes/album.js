const express = require("express");
const router = express.Router();
const Model_Album = require('../model/Model_Album.js');
const Model_Admin = require('../model/Model_Admin.js');
const Model_Users = require('../model/Model_Users.js');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/album')
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
        let rows = await Model_Album.getAll();
        res.render('album/index', {
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
        let rows = await Model_Album.getAll();
        res.render('users/album', {
            data: rows,
            data1: Data,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/create', async function (req, res, next) {
    try {
        let id = req.session.adminId;
        let admin = await Model_Admin.getId(id);
        let Data = await Model_Album.getAll();
        res.render('album/create', {
            nama_service: '',
            data: Data,
            data2:admin[0],
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/store', upload.single("gambar_album"), async function (req, res, next) {
    try {
        let {id_admin, nama_album, jenis_album, deskripsi_album} = req.body;
        let Data = {
            id_admin, 
            nama_album, 
            jenis_album,
            deskripsi_album,
            gambar_album: req.file.filename
        }
        await Model_Album.Store(Data);
        req.flash('success', 'Berhasil menyimpan data');
        res.redirect('/album');
        
    } catch (error) {
        req.flash('error', 'Terjadi kesalahan pada fungsi')
        console.log(error);
        res.redirect('/album')
    }
    
})


router.get("/edit/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        let rows = await Model_Album.getId(id);
        let admin = await Model_Admin.getId(req.session.adminId); // Ambil data pengguna yang login

        if (rows.length > 0) {
            res.render("album/edit", {
                id: id,
                data: rows[0],
                data2: admin[0], // Kirim data pengguna yang login
            });
        } else {
            req.flash("error", "album not found");
            res.redirect("/album");
        }
    } catch (error) {
        next(error);
    }
});


router.post("/update/:id",  upload.single("gambar_album"), async (req, res, next) => {
    try {
        const id = req.params.id;
        let filebaru = req.file ? req.file.filename : null;
        let rows = await Model_Album.getId(id);
        const namaFileLama = rows[0].gambar_album;

        if (filebaru && namaFileLama) {
            const pathFileLama = path.join(__dirname, '../public/images/album', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }

        let id_admin = req.session.adminId;
        let {
            nama_album, jenis_album, deskripsi_album
        } = req.body;
        
        let gambar_album = filebaru || namaFileLama

        let Data = {
            id_admin,
            nama_album: nama_album,
            jenis_album: jenis_album,
            deskripsi_album: deskripsi_album,
            gambar_album
        }
        console.log(req.body);
        console.log(Data);
        await Model_Album.Update(id, Data);
        req.flash("success", "Berhasil mengupdate data album");
        res.redirect("/album");
    } catch (error) {
        console.log(error);
    }
});

router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_Album.Delete(id);
        req.flash('success', 'Berhasil menghapus data album');
        res.redirect('/album');
    } catch (error) {
        req.flash("error", "Gagal menghapus data album");
        res.redirect("/album");
    }
});


module.exports = router;