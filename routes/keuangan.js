const express = require("express");
const router = express.Router();
const Model_Keuangan = require('../model/Model_Keuangan.js');
const Model_Admin = require('../model/Model_Admin.js');
const moment = require('moment');
const ExcelJS = require('exceljs'); 
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/keuangan')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

router.get('/', async (req, res, next) => {
  try {
    const adminId = req.session.adminId;
    const Data = await Model_Admin.getId(adminId);

    const tahun = req.query.tahun;
    const bulan = req.query.bulan;

    let rows = await Model_Keuangan.getAll();
    const dataProses = rows.filter(k => k.status_validasi === 'proses');
    const dataDisetujui = rows.filter(k => k.status_validasi === 'disetujui');

    // Filter berdasarkan bulan dan tahun (jika diberikan)
    if (tahun || bulan) {
      rows = rows.filter(item => {
        const tgl = new Date(item.waktu_keuangan);
        const yearMatch = !tahun || tgl.getFullYear().toString() === tahun;
        const monthMatch = !bulan || (tgl.getMonth() + 1).toString() === bulan;
        return yearMatch && monthMatch;
      });
    }

    // Ambil list tahun unik dari data
    const tahunList = [...new Set((await Model_Keuangan.getAll()).map(item =>
      new Date(item.waktu_keuangan).getFullYear()
    ))].sort((a, b) => b - a);

    // Ambil bulanList dari model berdasarkan tahun yang dipilih
    let bulanList = [];
    if (tahun) {
      bulanList = await Model_Keuangan.getDistinctBulanByYear(tahun);
    }

    res.render('keuangan/index', {
      dataProses,
      dataDisetujui,
      data: rows,
      data2: Data,
      tahunList,
      bulanList,
      selectedTahun: tahun || '',
      selectedBulan: bulan || '',
      adminLogin: Data[0]
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

router.post('/store', upload.single("gambar_keuangan"), async function (req, res, next) {
    try {
        let { id_admin, nama_keuangan, jenis_keuangan, deskripsi_keuangan, nominal, waktu_keuangan } = req.body;
        
        let Data = {
            id_admin,
            nama_keuangan,
            jenis_keuangan,
            deskripsi_keuangan,
            nominal,
            waktu_keuangan,
            status_validasi: 'proses',
            gambar_keuangan: req.file ? req.file.filename : null
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

router.post("/update/:id", upload.single("gambar_keuangan"), async (req, res, next) => {
    const id = req.params.id;
    let fileBaru = req.file ? req.file.filename : null;
    let rows = await Model_Keuangan.getId(id);
    const namaFileLama = rows[0].gambar_keuangan;

    // Hapus file lama jika ada file baru
    if (fileBaru && namaFileLama) {
        const pathFileLama = path.join(__dirname, '../public/images/keuangan', namaFileLama);
        if (fs.existsSync(pathFileLama)) fs.unlinkSync(pathFileLama);
    }

    let {
        nama_keuangan,
        jenis_keuangan,
        deskripsi_keuangan,
        nominal,
        waktu_keuangan,
    } = req.body;

    let gambar_keuangan = fileBaru || namaFileLama;

    let Data = {
        nama_keuangan,
        jenis_keuangan,
        deskripsi_keuangan,
        nominal,
        waktu_keuangan,
        gambar_keuangan
    };

    await Model_Keuangan.Update(id, Data);
    req.flash("success", "Berhasil mengupdate data keuangan");
    res.redirect("/keuangan");
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

router.post('/validasi/:id', async (req, res) => {
  try {
    const { aksi } = req.query; // 'setuju' atau 'tolak'
    const id = req.params.id;
    const status_validasi = aksi === 'setuju' ? 'disetujui' : 'ditolak';
    await Model_Keuangan.UpdateStatusValidasi(id, status_validasi);
    req.flash("success", `Data berhasil divalidasi sebagai "${status_validasi}"`);
    res.redirect('/keuangan');
  } catch (error) {
    console.error(error);
    req.flash("error", "Terjadi kesalahan saat memvalidasi data.");
    res.redirect('/keuangan');
  }
});

router.get('/download', async (req, res, next) => {
    try {
        const selectedTahun = req.query.tahun;
        if (!selectedTahun) return res.redirect('/keuangan');

        const allKeuangan = await Model_Keuangan.getAll();

        const filteredKeuangan = allKeuangan.filter(k => 
            new Date(k.waktu_keuangan).getFullYear().toString() === selectedTahun
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Keuangan ${selectedTahun}`);

        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Nama', key: 'nama_keuangan', width: 30 },
            { header: 'Jenis', key: 'jenis_keuangan', width: 20 },
            { header: 'Deskripsi', key: 'deskripsi_keuangan', width: 50 },
            { header: 'Nominal', key: 'nominal', width: 15 },
            { header: 'Waktu', key: 'waktu_keuangan', width: 20 },
            { header: 'Uploader', key: 'uploader', width: 25 },
        ];

        filteredKeuangan.forEach((item, index) => {
            worksheet.addRow({
                no: index + 1,
                nama_keuangan: item.nama_keuangan,
                jenis_keuangan: item.jenis_keuangan,
                deskripsi_keuangan: item.deskripsi_keuangan,
                nominal: item.nominal,
                waktu_keuangan: new Date(item.waktu_keuangan).toLocaleDateString('id-ID'),
                uploader: item.nama_admin || '-' // atau sesuai struktur data
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="data_keuangan_${selectedTahun}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
});


module.exports = router;