const express = require("express");
const router = express.Router();
const Model_Fasilitas = require('../model/Model_Fasilitas.js');
const Model_Admin = require('../model/Model_Admin.js');
const Model_Users = require('../model/Model_Users.js');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/fasilitas')
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
        let rows = await Model_Fasilitas.getAll();
        res.render('fasilitas/index', {
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
        let rows = await Model_Fasilitas.getAll();
        res.render('users/fasilitas', {
            data: rows,
            data1: Data,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/create', async function (req, res, next) {
    try {
        // let level_admin = req.session.level;
        let id = req.session.adminId;
        let admin = await Model_Admin.getId(id);
        let Data = await Model_Fasilitas.getAll();
        // if(Data[0].level_admins == "2") {
        res.render('fasilitas/create', {
            nama_service: '',
            data: Data,
            data2:admin[0],
        })
        // }
        // else if (Data[0].level_admins == "1"){
        //     req.flash('failure', 'Anda bukan admin');
        //     res.redirect('/sevice')
        // }
    } catch (error) {
        console.log(error);
    }
})

router.post('/store', upload.single("gambar_fasilitas"), async function (req, res, next) {
    try {
        let {id_admin, nama_fasilitas, deskripsi_fasilitas} = req.body;
        let Data = {
            id_admin, 
            nama_fasilitas, 
            deskripsi_fasilitas,
            gambar_fasilitas: req.file.filename
        }
        await Model_Fasilitas.Store(Data);
        req.flash('success', 'Berhasil menyimpan data');
        res.redirect('/fasilitas');
        
    } catch (error) {
        req.flash('error', 'Terjadi kesalahan pada fungsi')
        console.log(error);
        res.redirect('/fasilitas')
    }
    
})


router.get("/edit/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        let rows = await Model_Fasilitas.getId(id);
        let admin = await Model_Admin.getId(req.session.adminId); // Ambil data pengguna yang login

        if (rows.length > 0) {
            res.render("fasilitas/edit", {
                id: id,
                data: rows[0],
                data2: admin[0], // Kirim data pengguna yang login
            });
        } else {
            req.flash("error", "fasilitas not found");
            res.redirect("/fasilitas");
        }
    } catch (error) {
        next(error);
    }
});


router.post("/update/:id",  upload.single("gambar_fasilitas"), async (req, res, next) => {
    try {
        const id = req.params.id;
        let filebaru = req.file ? req.file.filename : null;
        let rows = await Model_Fasilitas.getId(id);
        const namaFileLama = rows[0].gambar_fasilitas;

        if (filebaru && namaFileLama) {
            const pathFileLama = path.join(__dirname, '../public/images/fasilitas', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }

        let id_admin = req.session.adminId;
        let {
            nama_fasilitas, deskripsi_fasilitas
        } = req.body;
        
        let gambar_fasilitas = filebaru || namaFileLama

        let Data = {
            id_admin,
            nama_fasilitas: nama_fasilitas,
            deskripsi_fasilitas: deskripsi_fasilitas,
            gambar_fasilitas
        }
        console.log(req.body);
        console.log(Data);
        await Model_Fasilitas.Update(id, Data);
        req.flash("success", "Berhasil mengupdate data fasilitas");
        res.redirect("/fasilitas");
    } catch (error) {
        console.log(error);
    }
});

router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_Fasilitas.Delete(id);
        req.flash('success', 'Berhasil menghapus data fasilitas');
        res.redirect('/fasilitas');
    } catch (error) {
        req.flash("error", "Gagal menghapus data fasilitas");
        res.redirect("/fasilitas");
    }
});


module.exports = router;