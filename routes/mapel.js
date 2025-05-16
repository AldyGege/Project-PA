const express = require("express");
const router = express.Router();
const Model_Mapel = require('../model/Model_Mapel.js');
const Model_Admin = require('../model/Model_Admin.js');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/mapel')
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
        let rows = await Model_Mapel.getAll();
        res.render('mapel/index', {
            data: rows,
            data2: Data,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/create', async function (req, res, next) {
    try {
        let id = req.session.adminId;
        let admin = await Model_Admin.getId(id);
        let Data = await Model_Mapel.getAll();
        res.render('mapel/create', {
            nama_service: '',
            data: Data,
            data2:admin[0],
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/store', upload.single("gambar_mapel"), async function (req, res, next) {
    try {
        let {id_admin, nama_mapel, deskripsi_mapel} = req.body;
        let Data = {
            id_admin, 
            nama_mapel, 
            deskripsi_mapel,
            gambar_mapel: req.file.filename
        }
        await Model_Mapel.Store(Data);
        req.flash('success', 'Berhasil menyimpan data');
        res.redirect('/mapel');
        
    } catch (error) {
        req.flash('error', 'Terjadi kesalahan pada fungsi')
        console.log(error);
        res.redirect('/mapel')
    }
    
})


router.get("/edit/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        let rows = await Model_Mapel.getId(id);
        let admin = await Model_Admin.getId(req.session.adminId); // Ambil data pengguna yang login

        if (rows.length > 0) {
            res.render("mapel/edit", {
                id: id,
                data: rows[0],
                data2: admin[0], // Kirim data pengguna yang login
            });
        } else {
            req.flash("error", "mapel not found");
            res.redirect("/mapel");
        }
    } catch (error) {
        next(error);
    }
});


router.post("/update/:id",  upload.single("gambar_mapel"), async (req, res, next) => {
    try {
        const id = req.params.id;
        let filebaru = req.file ? req.file.filename : null;
        let rows = await Model_Mapel.getId(id);
        const namaFileLama = rows[0].gambar_mapel;

        if (filebaru && namaFileLama) {
            const pathFileLama = path.join(__dirname, '../public/images/mapel', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }

        let id_admin = req.session.adminId;
        let {
            nama_mapel, deskripsi_mapel
        } = req.body;
        
        let gambar_mapel = filebaru || namaFileLama

        let Data = {
            id_admin,
            nama_mapel: nama_mapel,
            deskripsi_mapel: deskripsi_mapel,
            gambar_mapel
        }
        console.log(req.body);
        console.log(Data);
        await Model_Mapel.Update(id, Data);
        req.flash("success", "Berhasil mengupdate data mapel");
        res.redirect("/mapel");
    } catch (error) {
        console.log(error);
    }
});

router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_Mapel.Delete(id);
        req.flash('success', 'Berhasil menghapus data mapel');
        res.redirect('/mapel');
    } catch (error) {
        req.flash("error", "Gagal menghapus data mapel");
        res.redirect("/mapel");
    }
});


module.exports = router;