const express = require("express");
const router = express.Router();
const Model_Keuangan = require('../model/Model_Keuangan.js');
const Model_Admin = require('../model/Model_Admin.js');
const moment = require('moment');
const ExcelJS = require('exceljs'); 



router.get('/', async (req, res, next) => {
  try {
    const adminId = req.session.adminId;
    const Data = await Model_Admin.getId(adminId);

    const tahun = req.query.tahun;
    const bulan = req.query.bulan;

    let rows = await Model_Keuangan.getAll();

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
      data: rows,
      data2: Data,
      tahunList,
      bulanList,
      selectedTahun: tahun || '',
      selectedBulan: bulan || ''
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