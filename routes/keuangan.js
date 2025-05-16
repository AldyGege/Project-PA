const express = require("express");
const router = express.Router();
const Model_Keuangan = require('../model/Model_Keuangan.js');
const Model_Admin = require('../model/Model_Admin.js');




router.get('/', async (req, res, next) => {
    try {
        let id = req.session.adminId;
        let Data = await Model_Admin.getId(id);
        let rows = await Model_Keuangan.getAll();
        res.render('keuangan/index', {
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
        let Data = await Model_Keuangan.getAll();
        res.render('keuangan/create', {
            nama_service: '',
            data: Data,
            data2:admin[0],
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/store', async function (req, res, next) {
    try {
        let { id_admin, nama_keuangan, jenis_keuangan, deskripsi_keuangan, nominal, waktu_keuangan } = req.body;
        
        let Data = {
            id_admin,
            nama_keuangan,
            jenis_keuangan,
            deskripsi_keuangan,
            nominal,
            waktu_keuangan,
        }
        await Model_Keuangan.Store(Data);
        req.flash('success', 'Berhasil Menyimpan Data!');
        res.redirect("/keuangan");
    } catch(error) {
        console.log(error);
        req.flash('error', "Terjadi kesalahan pada Menyimpan Data!");
        res.redirect("/keuangan");
    }
});



router.get("/edit/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        let rows = await Model_Keuangan.getId(id);
        let admin = await Model_Admin.getId(req.session.adminId);
        let rows2 = await Model_Keuangan.getAll();
        if (rows.length > 0) {
            res.render("keuangan/edit", {
                id: id,
                data: rows[0],
                data_keuangan: rows2,
                data2:admin[0],
            });
        } else {
            req.flash("error", "keuangan not found");
            res.redirect("/keuangan");
        }
    } catch (error) {
        next(error);
    }
});

router.post("/update/:id", async (req, res, next) => {
    try {
        const id = req.params.id;

        let {
            nama_keuangan,
            jenis_keuangan,
            deskripsi_keuangan,
            nominal,
            waktu_keuangan,
        } = req.body;

        let Data = {
            nama_keuangan,
            jenis_keuangan,
            deskripsi_keuangan,
            nominal,
            waktu_keuangan,
        }
        console.log(req.body);
        console.log(Data);
        await Model_Keuangan.Update(id, Data);
        req.flash("success", "Berhasil mengupdate data dokter");
        res.redirect("/keuangan");
    } catch (error) {
        console.log(error);
    }
});

router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_Keuangan.Delete(id);
        req.flash('success', 'Berhasil menghapus data keuangan');
        res.redirect('/keuangan');
    } catch (error) {
        req.flash("error", "Gagal menghapus data keuangan");
        res.redirect("/keuangan");
    }
});

module.exports = router;