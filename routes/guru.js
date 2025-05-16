    const express = require("express");
    const router = express.Router();
    const Model_Guru = require('../model/Model_Guru.js');
    const Model_Mapel = require('../Model/Model_Mapel.js');
    const Model_Admin = require('../model/Model_Admin.js');
    const Model_Users = require('../model/Model_Users.js');
    const fs = require('fs');
    const multer = require('multer');
    const path = require('path');

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/images/guru')
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
            let rows = await Model_Guru.getAll();
            res.render('guru/index', {
                data: rows,
                data2: Data
            });
        } catch (error) {
            next(error);
        }
    });

    router.get('/users', async (req, res, next) => {
        try {
            let id = req.session.userId;
            let Data = await Model_Users.getId(id);
            let rows = await Model_Guru.getAll();
            res.render('users/guru', {
                data: rows,
                data1: Data,
            });
        } catch (error) {
            next(error);
        }
    });

    router.get('/create', async function (req, res, next) {
        try {
            // let level_users = req.session.level;
            let id = req.session.adminId;
            let Data = await Model_Guru.getAll();
            let Data2 = await Model_Mapel.getAll();
            // if(Data[0].level_users == "2") {
            res.render('guru/create', {
                nama_service: '',
                data: Data,
                data_mapel: Data2
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

    router.post('/store', upload.single("gambar_guru"), async function (req, res, next) {
        try {
            let {id_mapel, nama_guru} = req.body;
            let Data = {
                id_mapel,
                nama_guru,
                gambar_guru: req.file.filename
            }
            await Model_Guru.Store(Data);
            req.flash('success', 'Berhasil menyimpan data');
            res.redirect('/guru');
            
        } catch (error) {
            req.flash('error', 'Terjadi kesalahan pada fungsi')
            console.log(error);
            res.redirect('/guru')
        }
        
    })


    router.get("/edit/:id", async (req, res, next) => {
        try {
            const id = req.params.id;
            let rows = await Model_Guru.getId(id);
            let rows2 = await Model_Guru.getAll();
            let rows3 = await Model_Mapel.getAll();
            if (rows.length > 0) {
                res.render("guru/edit", {
                    id: id,
                    data: rows[0],
                    data_guru: rows2,
                    data_mapel: rows3,
                });
            } else {
                req.flash("error", "guru not found");
                res.redirect("/guru");
            }
        } catch (error) {
            next(error);
        }
    });


    router.post("/update/:id",  upload.single("gambar_guru"), async (req, res, next) => {
        try {
            const id = req.params.id;
            let filebaru = req.file ? req.file.filename : null;
            let rows = await Model_Guru.getId(id);
            const namaFileLama = rows[0].gambar_guru;

            if (filebaru && namaFileLama) {
                const pathFileLama = path.join(__dirname, '../public/images/guru', namaFileLama);
                fs.unlinkSync(pathFileLama);
            }

            let {
                id_mapel,
                nama_guru,
            } = req.body;
            
            let gambar_guru = filebaru || namaFileLama

            let Data = {
                id_mapel,
                nama_guru: nama_guru,
                gambar_guru
            }
            console.log(req.body);
            console.log(Data);
            await Model_Guru.Update(id, Data);
            req.flash("success", "Berhasil mengupdate data guru");
            res.redirect("/guru");
        } catch (error) {
            console.log(error);
        }
    });

    router.get('/delete/:id', async (req, res, next) => {
        try {
            const id = req.params.id;
            await Model_Guru.Delete(id);
            req.flash('success', 'Berhasil menghapus data guru');
            res.redirect('/guru');
        } catch (error) {
            req.flash("error", "Gagal menghapus data guru");
            res.redirect("/guru");
        }
    });


    module.exports = router;