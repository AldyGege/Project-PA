const express = require("express");
const router = express.Router();
const Model_Keahlian = require('../model/Model_Keahlian.js');
const Model_Users = require('../model/Model_Users.js');




router.get('/', async (req, res, next) => {
    try {
        let id = req.session.userId;
        let Data = await Model_Users.getId(id);
        let rows = await Model_Keahlian.getAll();
        res.render('keahlian/index', {
            data: rows,
            data2: Data,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/create', async function (req, res, next) {
    try {
        let level_users = req.session.level;
        let id = req.session.userId;
        let Data = await Model_Keahlian.getAll();
        // if(Data[0].level_users == "2") {
        res.render('keahlian/create', {
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

router.post('/store', async function (req, res, next) {
    try {
        let { keahlian } = req.body;
        
        let Data = {
            keahlian, 
        }
        await Model_Keahlian.Store(Data);
        req.flash('success', 'Berhasil Menyimpan Data!');
        res.redirect("/keahlian");
    } catch(error) {
        console.log(error);
        req.flash('error', "Terjadi kesalahan pada Menyimpan Data!");
        res.redirect("/keahlian");
    }
});



router.get("/edit/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        let rows = await Model_Keahlian.getId(id);
        let rows2 = await Model_Keahlian.getAll();
        if (rows.length > 0) {
            res.render("keahlian/edit", {
                id: id,
                data: rows[0],
                data_keahlian: rows2,
            });
        } else {
            req.flash("error", "keahlian not found");
            res.redirect("/keahlian");
        }
    } catch (error) {
        next(error);
    }
});

router.post("/update/:id", async (req, res, next) => {
    try {
        const id = req.params.id;

        let {
            keahlian
        } = req.body;

        let Data = {
            keahlian
        }
        console.log(req.body);
        console.log(Data);
        await Model_Keahlian.Update(id, Data);
        req.flash("success", "Berhasil mengupdate data dokter");
        res.redirect("/keahlian");
    } catch (error) {
        console.log(error);
    }
});

router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_Keahlian.Delete(id);
        req.flash('success', 'Berhasil menghapus data keahlian');
        res.redirect('/keahlian');
    } catch (error) {
        req.flash("error", "Gagal menghapus data keahlian");
        res.redirect("/keahlian");
    }
});

module.exports = router;