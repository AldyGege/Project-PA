const express = require("express");
const router = express.Router();
const Model_Daftar_Ulang = require('../model/Model_Daftar_Ulang.js');
const Model_Users = require('../model/Model_Users.js');
const Model_Admin = require('../model/Model_Admin.js');
const Model_Pendaftaran = require('../model/Model_Pendaftaran.js');
const Model_Siswa = require('../model/Model_Siswa');
const multer = require('multer');
const path = require('path');
const axios = require("axios");

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Check the field name to determine where to store the file
        if (file.fieldname === 'file_kk') {
            cb(null, 'public/files/daftar_ulang_kk'); // Save images here
        } else if (file.fieldname === 'file_akta') {
            cb(null, 'public/files/daftar_ulang_akta'); // Save files here
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

async function sendWhatsappMessage(no_telp, message) {
    console.log("🔔 Mengirim WA ke:", no_telp); 
    try {
        const response = await axios.post('https://api.fonnte.com/send', {
            target: no_telp, 
            message: message,
        }, {
            headers: {
                'Authorization': 'dJ1Dbn1xeBudvXvBn1b6' // Token kamu
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


// Halaman utama daftar ulang (untuk admin melihat semua data)
router.get('/', async (req, res, next) => {
    try {
        let id = req.session.adminId;
        let Data2 = await Model_Users.getId(id);
        let Data = await Model_Admin.getId(id);
        let Rows = await Model_Daftar_Ulang.getAll();
        let Rows2 = await Model_Pendaftaran.getAll();
        res.render('daftar_ulang/index', {
            data: Rows,
            data1: Rows2,
            data2: Data,
            data3: Data2,
        });
    } catch (error) {
        next(error);
    }
});

// Halaman form daftar ulang (user yang sudah diterima)
router.get('/create', async (req, res, next) => {
    try {
        let id = req.session.userId;
        if (!id) return res.redirect('/login_users');

        let userResult = await Model_Users.getId(id);
        let user = Array.isArray(userResult) ? userResult[0] : userResult;

        if (!user || !user.id_users) {
            return res.status(400).send('User tidak valid atau tidak ditemukan');
        }

        let pendaftar = await Model_Pendaftaran.getByUserId(id);
        let daftarUlang = await Model_Daftar_Ulang.getByUserId(id);

        let sudahDaftarUlangIds = daftarUlang.map(item => item.id_pendaftaran);

        res.render('daftar_ulang/create', {
            user: req.session.user,
            data: user,
            data2: pendaftar,
            sudahDaftarUlangIds: sudahDaftarUlangIds,
        });
    } catch (error) {
        next(error);
    }
});



router.post('/store', upload.fields([
    { name: 'file_kk', maxCount: 1 },
    { name: 'file_akta', maxCount: 1 }
  ]), async function (req, res, next) {
    try {
      let { id_users, id_pendaftaran, waktu_daftar_ulang } = req.body;
  
      let file_kk_name = req.files['file_kk']?.[0]?.filename || null;
      let file_akta_name = req.files['file_akta']?.[0]?.filename || null;
  
      let Data = {
        id_users,
        id_pendaftaran,
        waktu_daftar_ulang,
        status_daftar_ulang: 'proses',
        file_kk: file_kk_name,
        file_akta: file_akta_name
      };
  
      // Ambil nama_pendaftar
      let pendaftar = await Model_Pendaftaran.getId(id_pendaftaran);
      let nama = pendaftar?.[0]?.nama_pendaftar || 'Peserta';
  
      await Model_Daftar_Ulang.Store(Data);
      req.flash('success', `Peserta ${nama} berhasil melakukan daftar ulang`);
      res.redirect('create');
    } catch (error) {
      req.flash('error', 'Terjadi kesalahan pada fungsi');
      console.log(error);
      res.redirect('create');
    }
  });
  

// Update status daftar ulang (oleh admin)
router.post('/update_status/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { status_daftar_ulang, alasan } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'ID tidak valid' });
        }

        const resultDU = await Model_Daftar_Ulang.getId(id);
        const dataDU = resultDU[0];

        if (!dataDU) {
            return res.status(404).json({ success: false, message: 'Data daftar ulang tidak ditemukan' });
        }

        const id_pendaftaran = dataDU.id_pendaftaran;

        if (status_daftar_ulang === 'ditolak') {
            if (!alasan || alasan.trim() === "") {
                return res.status(400).json({ success: false, message: 'Alasan penolakan wajib diisi' });
            }

            // Simpan status dan alasan ke DB
            await Model_Daftar_Ulang.UpdateStatusWithAlasan(id, status_daftar_ulang, alasan);

            const resultPendaftaran = await Model_Pendaftaran.getId(id_pendaftaran);
            const p = resultPendaftaran[0];

            if (!p) {
                return res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan' });
            }

            const user = await Model_Users.getId(p.id_users);
            if (user && user.length > 0) {
                const no_telp = user[0].no_telp_users;
                const message = `Mohon maaf, daftar ulang Anda dengan nama ${p.nama_pendaftar} ditolak\n` +
                `dengan alasan: "${alasan}".\n` +
                `Silakan melakukan daftar ulang kembali melalui website kami.`;


                const waResponse = await sendWhatsappMessage(no_telp, message);
                if (waResponse.success) {
                    console.log(`✅ WA penolakan berhasil dikirim ke ${no_telp}`);
                } else {
                    console.error(`❌ Gagal kirim WA penolakan ke ${no_telp}:`, waResponse.detail);
                }
            }
            await Model_Daftar_Ulang.Delete(id);

            return res.json({ success: true, message: 'Status ditolak dan alasan disimpan' });
        }

        if (status_daftar_ulang === 'diterima') {
            await Model_Daftar_Ulang.UpdateStatus(id, status_daftar_ulang);

            const siswaExist = await Model_Siswa.getByPendaftaran(id_pendaftaran);
            if (!siswaExist || siswaExist.length === 0) {
                const resultPendaftaran = await Model_Pendaftaran.getId(id_pendaftaran);
                const p = resultPendaftaran[0];

                if (!p) {
                    return res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan' });
                }

                const dataSiswa = {
                    id_pendaftaran: p.id_pendaftaran,
                    id_daftar_ulang: dataDU.id_daftar_ulang,
                    id_users: p.id_users,
                    nama_siswa: p.nama_pendaftar,
                    nik: p.nik,
                    alamat_siswa: p.alamat_pendaftar,
                    ttl: p.ttl,
                    gender: p.gender,
                    jalur_daftar: 'online',
                    nama_ortu_siswa: p.nama_ortu_pendaftar,
                    no_telp_ortu_siswa: p.no_telp_ortu_pendaftar,
                    pekerjaan_ortu_siswa: p.pekerjaan_ortu_pendaftar,
                    alamat_ortu_siswa: p.alamat_ortu_pendaftar,
                    gambar_siswa: p.gambar_pendaftar || null
                };

                await Model_Siswa.Store(dataSiswa);
                console.log("✅ Data siswa berhasil disimpan");

                const user = await Model_Users.getId(p.id_users);
                if (user && user.length > 0) {
                    const no_telp = user[0].no_telp_users;
                    const message = `Selamat! ${p.nama_pendaftar} telah resmi menjadi siswa. Terima kasih telah melakukan daftar ulang.`;

                    const waResponse = await sendWhatsappMessage(no_telp, message);
                    if (waResponse.success) {
                        console.log(`✅ WA berhasil dikirim ke ${no_telp}`);
                    } else {
                        console.error(`❌ Gagal kirim WA ke ${no_telp}:`, waResponse.detail);
                    }
                }
            }

            return res.json({ success: true, message: 'Status berhasil diperbarui dan siswa ditambahkan' });
        }

        // Default update biasa
        await Model_Daftar_Ulang.UpdateStatus(id, status_daftar_ulang);
        res.json({ success: true, message: 'Status berhasil diperbarui' });

    } catch (error) {
        console.error("❌ ERROR update_status:", error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat update status' });
    }
});



// Hapus data daftar ulang (admin)
router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_Daftar_Ulang.Delete(id);
        req.flash('success', 'Data daftar ulang berhasil dihapus');
        res.redirect('/daftar_ulang');
    } catch (error) {
        req.flash('error', 'Gagal menghapus data daftar ulang');
        res.redirect('/daftar_ulang');
    }
});

module.exports = router;
