const express = require("express");
const router = express.Router();
const Model_Pendaftaran = require('../model/Model_Pendaftaran.js');
const Model_Users = require('../model/Model_Users.js');
const Model_Admin = require('../model/Model_Admin.js');
const Model_Daftar_Ulang = require('../model/Model_Daftar_Ulang.js');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const axios = require("axios");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/pendaftaran')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
})

async function sendWhatsappMessage(no_telp, message) {
    try {
        const response = await axios.post('https://api.fonnte.com/send', {
            target: no_telp, // ← ini harus 'target', bukan 'number'
            message: message,
        }, {
            headers: {
                'Authorization': 'dJ1Dbn1xeBudvXvBn1b6',
            }
        });

        if (response.data.status === true) {
            return { success: true };
        } else {
            console.error('Fonnte API error:', response.data);
            return { success: false };
        }
    } catch (error) {
        console.error('Error saat mengirim pesan WhatsApp:', error);
        return { success: false };
    }
}


router.get('/', async (req, res, next) => {
    try {
        let id = req.session.adminId;
        let Data2 = await Model_Users.getId(id);
        let Data = await Model_Admin.getId(id);
        let rows = await Model_Pendaftaran.getAll();
        let daftarUlangList = await Model_Daftar_Ulang.getAll(); // ambil semua daftar ulang
        let daftarUlangIds = daftarUlangList.map(d => d.id_pendaftaran); // ambil id_pendaftaran-nya
        res.render('pendaftaran/index', {
            data: rows,
            data2: Data,
            data3: Data2,
            daftarUlangIds: daftarUlangIds,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/create', async function (req, res, next) {
    try {
        // let level_users = req.session.level;
        let id = req.session.userId;
        let user = await Model_Users.getId(id);
        let Data = await Model_Pendaftaran.getAll();
        // if(Data[0].level_users == "2") {
        res.render('pendaftaran/create', {
            nama_service: '',
            data: Data,
            data2:user[0],
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

router.post('/store', upload.single("gambar_pendaftar"), async function (req, res, next) {
    try {
        let {id_users, nama_pendaftar, nik, alamat_pendaftar, ttl, gender, waktu_pendaftaran, nama_ortu_pendaftar, no_telp_ortu_pendaftar, pekerjaan_ortu_pendaftar, alamat_ortu_pendaftar, status_pendaftaran} = req.body;
        let Data = {
            id_users, 
            nama_pendaftar, 
            nik,
            alamat_pendaftar,
            ttl,
            gender,
            waktu_pendaftaran,
            nama_ortu_pendaftar,
            no_telp_ortu_pendaftar,
            pekerjaan_ortu_pendaftar,
            alamat_ortu_pendaftar,
            status_pendaftaran: 'proses',
            gambar_pendaftar: req.file.filename
        }
        await Model_Pendaftaran.Store(Data);
        req.flash('success', `Berhasil Melakukan Pendaftaran <a href="/users/profil" class="btn btn-sm btn-light border ml-2">Lihat Informasi Pendaftaran</a>`);

        res.redirect('create');
        
    } catch (error) {
        req.flash('error', 'Terjadi kesalahan pada fungsi')
        console.log(error);
        res.redirect('create')
    }
    
})

router.post('/update_status/:id', async function (req, res, next) {
    try {
        let id_pendaftaran = req.params.id;
        let status_pendaftaran = req.body.status_pendaftaran;

        // Mendapatkan data pendaftaran berdasarkan id
        let pendaftaranData = await Model_Pendaftaran.getId(id_pendaftaran);
        if (!pendaftaranData || pendaftaranData.length === 0) {
            return res.status(404).json({ success: false, message: "Data pendaftaran tidak ditemukan" });
        }

        let pendaftar = pendaftaranData[0];

        // Ambil nomor telepon dari tabel users
        let user = await Model_Users.getId(pendaftar.id_users);
        if (!user || user.length === 0) {
            return res.status(404).json({ success: false, message: "Data pengguna tidak ditemukan" });
        }

        let no_telp = user[0].no_telp_users;

        // Update status pendaftaran
        await Model_Pendaftaran.UpdateStatus(id_pendaftaran, status_pendaftaran);

        // Jika status diterima, kirim pesan WA
        if (status_pendaftaran === 'diterima' && no_telp) {
            const message = `Selamat!, Peserta dengan nama ${pendaftar.nama_pendaftar} telah diterima, Silahkan lanjut ke daftar ulang dengan Mengakses website kami di Link Berikut :  `;
            const response = await sendWhatsappMessage(no_telp, message);
            if (response.success) {
                console.log(`Pesan berhasil dikirim ke ${no_telp}`);
            } else {
                console.error('Gagal mengirim pesan');
            }
        }

        // Jika status ditolak, kirim pesan WA juga
        if (status_pendaftaran === 'ditolak' && no_telp) {
            const message = `Mohon maaf, pendaftaran Anda dengan nama ${pendaftar.nama_pendaftar} telah ditolak karena data yang tidak valid.`;
            const response = await sendWhatsappMessage(no_telp, message);
            if (response.success) {
                console.log(`Pesan penolakan berhasil dikirim ke ${no_telp}`);
            } else {
                console.error('Gagal mengirim pesan penolakan');
            }
        }

        return res.json({ success: true, message: "Status berhasil diperbarui" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan saat mengubah status" });
    }
});



router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_Pendaftaran.Delete(id);
        req.flash('success', 'Berhasil menghapus data pendaftaran');
        res.redirect('/pendaftaran');
    } catch (error) {
        req.flash("error", "Gagal menghapus data pendaftaran");
        res.redirect("/pendaftaran");
    }
});


module.exports = router;