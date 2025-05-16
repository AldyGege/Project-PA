const express = require("express");
const router = express.Router();
const Model_Buku = require('../model/Model_Buku.js');
const Model_Users = require('../model/Model_Users.js');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Check the field name to determine where to store the file
        if (file.fieldname === 'gambar_buku') {
            cb(null, 'public/images/buku'); // Save images here
        } else if (file.fieldname === 'file_buku') {
            cb(null, 'public/files/buku'); // Save files here
        }
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with a timestamp
    }
});

const upload = multer({
    storage: storage
});

router.get('/', async (req, res, next) => {
    try {
        let id = req.session.userId;
        let Data = await Model_Users.getId(id);
        let rows = await Model_Buku.getAll();
        res.render('buku/index', {
            data: rows,
            data2: Data,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/users', async function (req, res, next) {
    try {
        let rows = await Model_Buku.getAll();
        res.render('buku/users/index', {
            data: rows
        });
    } catch (error) {
        console.error("Error:", error);
        req.flash('invalid', 'Terjadi kesalahan saat memuat data pengguna');
    }
});


router.get('/create', async function (req, res, next) {
    try {
        let level_users = req.session.level;
        let id = req.session.userId;
        let Data = await Model_Buku.getAll();
        // if(Data[0].level_users == "2") {
        res.render('buku/create', {
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

router.post('/store', upload.fields([{
        name: 'gambar_buku',
        maxCount: 1
    },
    {
        name: 'file_buku',
        maxCount: 1
    }
]), async function (req, res, next) {
    try {
        let {
            nama_buku,
            deskripsi_buku
        } = req.body;

        let Data = {
            nama_buku,
            deskripsi_buku,
            gambar_buku: req.files['gambar_buku'][0].filename, // Accessing the first file for 'gambar_buku'
            file_buku: req.files['file_buku'][0].filename // Accessing the first file for 'file_buku'
        };

        await Model_Buku.Store(Data);
        req.flash('success', 'Berhasil menyimpan data');
        res.redirect('/buku');
    } catch (error) {
        req.flash('error', 'Terjadi kesalahan pada fungsi');
        console.log(error);
        res.redirect('/buku');
    }
});


router.get("/edit/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        let rows = await Model_Buku.getId(id);
        let rows2 = await Model_Buku.getAll();
        if (rows.length > 0) {
            res.render("buku/edit", {
                id: id,
                data: rows[0],
                data_buku: rows2,
            });
        } else {
            req.flash("error", "buku not found");
            res.redirect("/buku");
        }
    } catch (error) {
        next(error);
    }
});


router.post("/update/:id", upload.fields([
    { name: 'gambar_buku', maxCount: 1 },
    { name: 'file_buku', maxCount: 1 }
]), async (req, res, next) => {
    try {
        const id = req.params.id;
        const files = req.files;

        let newGambarBuku = files['gambar_buku'] ? files['gambar_buku'][0].filename : null;
        let newFileBuku = files['file_buku'] ? files['file_buku'][0].filename : null;

        let rows = await Model_Buku.getId(id);
        const oldGambarBuku = rows[0].gambar_buku;
        const oldFileBuku = rows[0].file_buku;

        // Delete the old image if a new one is uploaded
        if (newGambarBuku && oldGambarBuku) {
            const oldGambarBukuPath = path.join(__dirname, '../public/images/buku', oldGambarBuku);
            fs.unlinkSync(oldGambarBukuPath);
        }

        // Delete the old file if a new one is uploaded
        if (newFileBuku && oldFileBuku) {
            const oldFileBukuPath = path.join(__dirname, '../public/files/buku', oldFileBuku);
            fs.unlinkSync(oldFileBukuPath);
        }

        // Handle form data
        let { nama_buku, deskripsi_buku } = req.body;

        let gambar_buku = newGambarBuku || oldGambarBuku;
        let file_buku = newFileBuku || oldFileBuku;

        // Prepare data for update
        let Data = {
            nama_buku,
            deskripsi_buku,
            gambar_buku,
            file_buku
        };

        console.log(req.body);
        console.log(Data);

        // Update the record
        await Model_Buku.Update(id, Data);
        req.flash("success", "Berhasil mengupdate data buku");
        res.redirect("/buku");
    } catch (error) {
        console.log(error);
        req.flash("error", "Terjadi kesalahan saat memperbarui data buku");
        res.redirect("/buku");
    }
});


router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;

        // Fetch the record by its ID to get the filenames
        const rows = await Model_Buku.getId(id);
        const gambarBuku = rows[0].gambar_buku;
        const fileBuku = rows[0].file_buku;

        // Delete the image file if it exists
        if (gambarBuku) {
            const gambarBukuPath = path.join(__dirname, '../public/images/buku', gambarBuku);
            if (fs.existsSync(gambarBukuPath)) {
                fs.unlinkSync(gambarBukuPath);
            }
        }

        // Delete the document file if it exists
        if (fileBuku) {
            const fileBukuPath = path.join(__dirname, '../public/files/buku', fileBuku);
            if (fs.existsSync(fileBukuPath)) {
                fs.unlinkSync(fileBukuPath);
            }
        }

        // Now, delete the record from the database
        await Model_Buku.Delete(id);
        
        req.flash('success', 'Berhasil menghapus data buku');
        res.redirect('/buku');
    } catch (error) {
        console.log(error);
        req.flash("error", "Gagal menghapus data buku");
        res.redirect("/buku");
    }
});



module.exports = router;