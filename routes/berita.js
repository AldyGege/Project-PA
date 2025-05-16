const express = require("express");
const router = express.Router();
const Model_Berita = require('../model/Model_Berita.js');
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
        let Data = await Model_Users.getId(id);
        let rows = await Model_Berita.getAll();
        res.render('berita/index', {
            data: rows,
            data2: Data,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/users', async function (req, res, next) {
    try {
        let rows = await Model_Berita.getAll();
        res.render('artikel/users/index', {
            data: rows
        });
    } catch (error) {
        console.error("Error:", error);
        req.flash('invalid', 'Terjadi kesalahan saat memuat data artikel');
        res.redirect('/artikel');
    }
});



router.get('/create', async function (req, res, next) {
    try {
        let level_users = req.session.level;
        let id = req.session.userId;
        let Data = await Model_Berita.getAll();
        // if(Data[0].level_users == "2") {
        res.render('berita/create', {
            nama_service: '',
            data: Data,
        })
        // }
        // else if (Data[0].level_users == "1"){
        //     req.flash('failure', 'Anda bukan admin');
        //     res.redirect('/sevice')
        // }
    } catch (error) {
        console.log(error);
    }
})

router.post('/store', upload.single("gambar_berita"), async function (req, res, next) {
    try {
        let {nama_berita, deskripsi_berita} = req.body;
        let Data = {
            nama_berita,
            deskripsi_berita,
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
        let rows2 = await Model_Berita.getAll();
        if (rows.length > 0) {
            res.render("berita/edit", {
                id: id,
                data: rows[0],
                data_berita: rows2,
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

        let {
            nama_berita,
            deskripsi_berita,
        } = req.body;
        
        let gambar_berita = filebaru || namaFileLama

        let Data = {
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