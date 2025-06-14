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
const fs = require('fs');
const PDFDocument = require('pdfkit');

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

function generateBuktiDaftarUlang(data, outputPath) {
    const fs = require('fs');
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

    function formatTanggal(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }

    doc.pipe(fs.createWriteStream(outputPath));

// === HEADER BARU YANG LEBIH FORMAL ===
doc.image('public/images/logo-madrasah3.jpg', 60, 40, { width: 60 });

doc.font('Helvetica-Bold')
   .fontSize(14)
   .fillColor('#000000')
   .text('KEMENTERIAN AGAMA REPUBLIK INDONESIA', 0, 40, { align: 'center' });

doc.font('Helvetica-Bold')
   .fontSize(16)
   .text('MADRASAH IBTIDAIYAH AT-TAQWA', 0, 60, { align: 'center' });

doc.font('Helvetica')
   .fontSize(10)
   .text('Jl. Panji Waji No.30, Kalianget, Telp. 082332172543', 0, 78, { align: 'center' });

doc.moveTo(50, 100).lineTo(545, 100).stroke();


    doc.moveTo(50, 105)
       .lineTo(545, 105)
       .lineWidth(1)
       .stroke('#aaaaaa');

    // ===== JUDUL DOKUMEN =====
    doc.moveDown(2);
    doc.font('Helvetica-Bold')
       .fontSize(18)
       .fillColor('#000000')
       .text('BUKTI DAFTAR ULANG', { align: 'center' });

    // ===== ISI DATA =====
    const startY = doc.y + 30;
    const labelWidth = 150;
    const valueX = 50 + labelWidth + 15;
    const lineHeight = 24;

    function addRow(label, value, y) {
        doc.roundedRect(50, y - 3, labelWidth, 20, 4).fill('#f0f0f0');
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .fillColor('#555555')
           .text(label, 50, y, { width: labelWidth, align: 'right' });

        doc.rect(valueX, y - 3, 360, 20).stroke('#eeeeee');
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor('#333333')
           .text(value || '-', valueX + 10, y, { width: 340 });
    }

    const fields = [
        { label: 'No. Daftar Ulang', value: data.no_daftar_ulang },
        { label: 'Nama Siswa', value: data.nama_siswa },
        { label: 'NIK', value: data.nik },
        { label: 'Alamat', value: data.alamat },
        { label: 'Jenis Kelamin', value: data.gender },
        { label: 'Tanggal Lahir', value: formatTanggal(data.ttl) },
        { label: 'Orang Tua', value: data.nama_ortu },
        { label: 'No. Telp Ortu', value: data.no_telp },
        { label: 'Waktu Daftar Ulang', value: formatTanggal(data.waktu_daftar_ulang) },
        { label: 'Status', value: 'Diterima' }
    ];

    let currentY = startY;
    fields.forEach(field => {
        addRow(field.label + ' :', field.value, currentY);
        currentY += lineHeight;
    });

    // ===== FOOTER: UCAPAN & TANDA TANGAN =====
    const footerY = currentY + 40;

    doc.font('Helvetica-Oblique')
       .fontSize(10)
       .fillColor('#555555')
       .text('✓ Terima kasih atas kepercayaan Anda', 50, footerY)
       .text('menjadi bagian dari keluarga besar Madrasah At-Taqwa.', 50, footerY + 15);

    // ===== TANDA TANGAN & STAMP =====
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#333333')
       .text('Mengetahui,', 400, footerY, { align: 'center' });

    // Tanda tangan image (pastikan path dan ukuran sesuai)
    doc.image('public/images/logo-madrasah.png', 420, footerY + 20, {
        width: 100,
        height: 50
    });

    doc.moveTo(400, footerY + 80)
       .lineTo(550, footerY + 80)
       .lineWidth(1)
       .stroke();

    doc.font('Helvetica-Bold')
       .text('Kepala Madrasah', 400, footerY + 85, { align: 'center' });

    // ===== FOOTNOTE =====
    const printedAt = new Date().toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#999999')
       .text(`Dokumen ini dicetak pada: ${printedAt}`, 50, doc.page.height - 50, {
           align: 'center'
       });

    // Border luar (opsional, dekoratif)
    doc.rect(40, 40, 515, doc.page.height - 80)
       .lineWidth(0.5)
       .stroke('#dddddd');

    doc.end();
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
  
        // Fungsi untuk generate nomor daftar ulang
        function generateNomorDaftarUlang(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `DU${year}${month}${day}${hours}${minutes}${seconds}`;
        }

        const waktuDaftar = new Date(); // ambil waktu saat ini
        const noDaftarUlang = generateNomorDaftarUlang(waktuDaftar);

        let Data = {
        id_users,
        id_pendaftaran,
        waktu_daftar_ulang: waktuDaftar,
        status_daftar_ulang: 'proses',
        file_kk: file_kk_name,
        file_akta: file_akta_name,
        no_daftar_ulang: noDaftarUlang
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

        const resultDU = await Model_Daftar_Ulang.getId(id);
        const dataDU = resultDU[0];

        if (!dataDU) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

        const id_pendaftaran = dataDU.id_pendaftaran;
        const resultPendaftaran = await Model_Pendaftaran.getId(id_pendaftaran);
        const p = resultPendaftaran[0];

        if (!p) return res.status(404).json({ success: false, message: 'Pendaftaran tidak ditemukan' });

        const user = await Model_Users.getId(p.id_users);
        const no_telp = user?.[0]?.no_telp_users;

        if (status_daftar_ulang === 'ditolak') {
            if (!alasan || alasan.trim() === "") {
                return res.status(400).json({ success: false, message: 'Alasan wajib diisi' });
            }

            await Model_Daftar_Ulang.UpdateStatusWithAlasan(id, status_daftar_ulang, alasan);

            const message = `Mohon maaf, daftar ulang atas nama ${p.nama_pendaftar} ditolak.\nAlasan: "${alasan}". Silakan daftar ulang kembali.`;
            await sendWhatsappMessage(no_telp, message);
            await Model_Daftar_Ulang.Delete(id);

            return res.json({
                success: true,
                message: 'Status ditolak dan data dihapus',
                deletedId: id
            });
        }

        if (status_daftar_ulang === 'diterima') {
            await Model_Daftar_Ulang.UpdateStatus(id, status_daftar_ulang);

            const siswaExist = await Model_Siswa.getByPendaftaran(id_pendaftaran);
            if (!siswaExist || siswaExist.length === 0) {
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
                    gambar_siswa: p.gambar_pendaftar || null,
                    file_kk: dataDU.file_kk || null,
                    file_akta: dataDU.file_akta || null,
                    waktu_daftar_ulang: dataDU.waktu_daftar_ulang || null,
                    no_daftar_ulang: dataDU.no_daftar_ulang 
                };

                await Model_Siswa.Store(dataSiswa);

                // ✅ Buat PDF
                const pdfName = `bukti-daftarulang-${dataDU.id_daftar_ulang}.pdf`;
                const pdfPath = path.join(__dirname, '../public/files/bukti_terima', pdfName);
                const dir = path.dirname(pdfPath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

                generateBuktiDaftarUlang({
                    nama_siswa: p.nama_pendaftar,
                    nik: p.nik,
                    alamat: p.alamat_pendaftar,
                    gender: p.gender,
                    ttl: p.ttl,
                    nama_ortu: p.nama_ortu_pendaftar,
                    no_telp: p.no_telp_ortu_pendaftar,
                    waktu_daftar_ulang: dataDU.waktu_daftar_ulang,
                    no_daftar_ulang: dataDU.no_daftar_ulang
                }, pdfPath);

                // ✅ Kirim WA berisi link download
                const linkPDF = `http://localhost:3000/files/bukti_terima/${pdfName}`;
                const message = `Selamat! ${p.nama_pendaftar} telah diterima sebagai siswa.\nBerikut bukti daftar ulang:\n${linkPDF}`;
                await sendWhatsappMessage(no_telp, message);
            }

            // ✅ Kirim juga data updatedRow ke frontend
            return res.json({
                success: true,
                message: 'Status diterima, siswa ditambahkan, PDF dikirim',
                updatedRow: {
                    id_daftar_ulang: dataDU.id_daftar_ulang,
                    nama_pendaftar: p.nama_pendaftar,
                    nama_users: user?.[0]?.nama_users || '',
                    nik: p.nik,
                    file_kk: dataDU.file_kk,
                    file_akta: dataDU.file_akta,
                    waktu_daftar_ulang: dataDU.waktu_daftar_ulang,
                    status_daftar_ulang: status_daftar_ulang
                }
            });
        }

        await Model_Daftar_Ulang.UpdateStatus(id, status_daftar_ulang);
        res.json({ success: true, message: 'Status diperbarui' });

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

// Route untuk mendownload file PDF bukti daftar ulang
router.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../public/files/bukti_terima', req.params.filename);
    res.download(filePath, (err) => {
        if (err) {
            console.error("❌ Gagal mengunduh file:", err);
            res.status(404).send('File tidak ditemukan');
        }
    });
});


module.exports = router;
