const express = require("express");
const router = express.Router();
const Model_Siswa = require('../model/Model_Siswa.js');
const Model_Users = require('../model/Model_Users.js'); 
const Model_Pendaftaran = require('../model/Model_Pendaftaran.js'); 
const Model_Daftar_Ulang = require('../model/Model_Daftar_Ulang.js'); 
const Model_Admin = require('../model/Model_Admin.js'); 
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Setup multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/siswa');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

function createMulterUpload(folderName) {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `public/images/${folderName}`);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    });
    return multer({ storage });
}


// Index
router.get('/', async (req, res, next) => {
    try {
        let id = req.session.adminId;
        let Data = await Model_Admin.getId(id);
        let rows = await Model_Siswa.getAll();
        res.render('siswa/index', {
            data: rows,
            data2: Data,
        });
    } catch (error) {
        next(error);
    }
});

// Form tambah
router.get('/create', async (req, res) => {
    res.render('siswa/create', {
        nama_siswa: '',
        nik: '',
        alamat_siswa: '',
        ttl: '',
        gender: '',
        nama_ortu_siswa: '',
        no_telp_ortu_siswa: '',
        pekerjaan_ortu_siswa: '',
        alamat_ortu_siswa: '',
        gambar_siswa: ''
    });
});

// Store
router.post('/store', upload.single("gambar_siswa"), async (req, res) => {
    try {
        let {
            id_pendaftaran, id_daftar_ulang, nama_siswa, nik, alamat_siswa, ttl, gender,
            nama_ortu_siswa, no_telp_ortu_siswa,
            pekerjaan_ortu_siswa, alamat_ortu_siswa
        } = req.body;

        let Data = {
            id_pendaftaran,
            id_daftar_ulang,
            nama_siswa,
            nik,
            alamat_siswa,
            ttl,
            gender,
            jalur_daftar: 'offline',
            nama_ortu_siswa,
            no_telp_ortu_siswa,
            pekerjaan_ortu_siswa,
            alamat_ortu_siswa,
            gambar_siswa: req.file ? req.file.filename : null,
            id_users: req.session.userId
        };

        await Model_Siswa.Store(Data);
        req.flash('success', 'Berhasil menambahkan data siswa');
        res.redirect('/siswa');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Gagal menyimpan data siswa');
        res.redirect('/siswa');
    }
});

// Edit
router.get("/edit/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        let rows = await Model_Siswa.getId(id);
        if (rows.length > 0) {
            res.render("siswa/edit", {
                id: id,
                data: rows[0]
            });
        } else {
            req.flash("error", "Data siswa tidak ditemukan");
            res.redirect("/siswa");
        }
    } catch (error) {
        next(error);
    }
});

// Update
router.post("/update/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const siswa = await Model_Siswa.getId(id);
        const jalurDaftar = siswa[0].jalur_daftar; // offline atau online

        // Pakai multer upload dinamis
        const upload = createMulterUpload(jalurDaftar === 'online' ? 'pendaftaran' : 'siswa');
        
        upload.single('gambar_siswa')(req, res, async (err) => {
            if (err) {
                console.log(err);
                req.flash("error", "Gagal upload gambar");
                return res.redirect("/siswa");
            }

            const fileBaru = req.file ? req.file.filename : null;
            const namaFileLama = siswa[0].gambar_siswa;

            // Hapus file lama jika ada dan diganti
            if (fileBaru && namaFileLama) {
                const folder = jalurDaftar === 'online' ? 'pendaftaran' : 'siswa';
                const pathFileLama = path.join(__dirname, `../public/images/${folder}`, namaFileLama);
                if (fs.existsSync(pathFileLama)) {
                    fs.unlinkSync(pathFileLama);
                }
            }

            let {
                id_pendaftaran, id_daftar_ulang, id_users, nama_siswa, nik, alamat_siswa, ttl, gender,
                nama_ortu_siswa, no_telp_ortu_siswa, pekerjaan_ortu_siswa, alamat_ortu_siswa
            } = req.body;

            const Data = {
                id_pendaftaran,
                id_daftar_ulang,
                id_users,
                nama_siswa,
                nik,
                alamat_siswa,
                ttl,
                gender,
                nama_ortu_siswa,
                no_telp_ortu_siswa,
                pekerjaan_ortu_siswa,
                alamat_ortu_siswa,
                gambar_siswa: fileBaru || namaFileLama
            };

            await Model_Siswa.Update(id, Data);
            req.flash("success", "Berhasil memperbarui data siswa");
            res.redirect("/siswa");
        });
    } catch (error) {
        console.log(error);
        req.flash("error", "Gagal memperbarui data siswa");
        res.redirect("/siswa");
    }
});


// Delete

router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Ambil data siswa terlebih dahulu
        const rows = await Model_Siswa.getId(id);
        const siswa = rows[0];

        if (!siswa) {
            req.flash('error', 'Data siswa tidak ditemukan');
            return res.redirect('/siswa');
        }

        // Hapus file gambar siswa jika ada
        const namaFile = siswa.gambar_siswa;
        if (namaFile) {
            const pathFile = path.join(__dirname, '../public/images/siswa', namaFile);
            if (fs.existsSync(pathFile)) {
                fs.unlinkSync(pathFile);
            }
        }

        // Hapus data siswa
        await Model_Siswa.Delete(id);

        // Kembalikan status daftar ulang menjadi 'proses'
        await Model_Daftar_Ulang.UpdateStatusByPendaftaranId(siswa.id_pendaftaran, 'proses');

        req.flash("success", "Data siswa berhasil dibatalkan dan status daftar ulang dikembalikan ke 'proses'");
        res.redirect('/siswa');
    } catch (error) {
        console.log(error);
        req.flash("error", "Gagal membatalkan data siswa");
        res.redirect('/siswa');
    }
});


module.exports = router;
