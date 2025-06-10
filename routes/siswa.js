const express = require("express");
const router = express.Router();
const Model_Siswa = require('../model/Model_Siswa.js');
const Model_Daftar_Ulang = require('../model/Model_Daftar_Ulang.js'); 
const Model_Admin = require('../model/Model_Admin.js'); 
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// Setup multer default untuk penyimpanan file siswa
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const jalur = req.body.jalur_daftar || req.query.jalur_daftar || 'offline';

    let folder = 'images/siswa';
    if (file.fieldname === 'file_kk') {
      folder = jalur === 'online' ? 'files/daftar_ulang_kk' : 'images/siswa';
    }
    if (file.fieldname === 'file_akta') {
      folder = jalur === 'online' ? 'files/daftar_ulang_akta' : 'images/siswa';
    }

    // Buat folder jika belum ada
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },
filename: function (req, file, cb) {
  const namaSiswa = (req.body.nama_siswa || 'siswa')
    .toLowerCase()
    .replace(/\s+/g, '_') // ubah spasi jadi underscore
    .replace(/[^a-z0-9_]/g, ''); // hapus karakter tidak valid

  let prefix = 'file';

  if (file.fieldname === 'gambar_siswa') {
    prefix = 'foto';
  } else if (file.fieldname === 'file_kk') {
    prefix = 'fotokk';
  } else if (file.fieldname === 'file_akta') {
    prefix = 'fotoakta';
  }

  const ext = path.extname(file.originalname);
  cb(null, `${prefix}_${namaSiswa}${ext}`);
}

});

function createMulterUpload(jalurDaftar) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let folder;

      if (jalurDaftar === "online") {
        if (file.fieldname === "file_kk") {
          folder = "public/files/daftar_ulang_kk";
        } else if (file.fieldname === "file_akta") {
          folder = "public/files/daftar_ulang_akta";
        } else {
          folder = "public/images/pendaftaran";
        }
      } else {
        // offline → semua file ke public/images/siswa
        folder = "public/images/siswa";
      }

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      cb(null, folder);
    },
    filename: function (req, file, cb) {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
      cb(null, uniqueName);
    },
  });

  return multer({ storage });
}

const upload = multer({ storage });

router.get('/', async (req, res, next) => {
    try {
        let id = req.session.adminId;
        let dataAdmin = await Model_Admin.getId(id);

        let allSiswa = await Model_Siswa.getAll();

        const selectedTahun = req.query.tahun;

        let filteredSiswa = selectedTahun
            ? allSiswa.filter(s => new Date(s.waktu_siswa).getFullYear().toString() === selectedTahun)
            : allSiswa;

        const tahunList = [...new Set(allSiswa.map(s => new Date(s.waktu_siswa).getFullYear()))].sort((a, b) => b - a);

        res.render('siswa/index', {
            data: filteredSiswa,
            data2: dataAdmin,
            tahunList,
            selectedTahun
        });
    } catch (error) {
        next(error);
    }
});

// =========================
// CREATE
// =========================
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
        gambar_siswa: '',
        file_kk: '',
        file_akta: '',
        waktu_daftar_ulang: ''
    });
});

// =========================
// STORE
// =========================
router.post("/store", upload.fields([
    { name: 'gambar_siswa', maxCount: 1 },
    { name: 'file_kk', maxCount: 1 },
    { name: 'file_akta', maxCount: 1 }
]), async (req, res) => {
    try {
        let {
            id_pendaftaran,
            id_daftar_ulang,
            nama_siswa,
            nik,
            alamat_siswa,
            ttl,
            gender,
            nama_ortu_siswa,
            no_telp_ortu_siswa,
            pekerjaan_ortu_siswa,
            alamat_ortu_siswa,
            waktu_siswa
        } = req.body;

        let Data = {
            id_pendaftaran,
            id_daftar_ulang,
            nama_siswa,
            nik,
            alamat_siswa,
            ttl,
            gender,
            jalur_daftar: "offline",
            nama_ortu_siswa,
            no_telp_ortu_siswa,
            pekerjaan_ortu_siswa,
            alamat_ortu_siswa,
            gambar_siswa: req.files['gambar_siswa']?.[0]?.filename,
            file_kk: req.files['file_kk']?.[0]?.filename,
            file_akta: req.files['file_akta']?.[0]?.filename,
            waktu_siswa: waktu_siswa ? new Date(waktu_siswa) : new Date()
        };

        await Model_Siswa.Store(Data);
        req.flash("success", "Berhasil menambahkan data siswa");
        res.redirect("/siswa");
    } catch (error) {
        console.log(error);
        req.flash("error", "Gagal menyimpan data siswa");
        res.redirect("/siswa");
    }
});

// =========================
// EDIT
// =========================
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

// =========================
// DETAIL (JSON)
// =========================
router.get('/detail/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const siswa = await Model_Siswa.getId(id);
        if (siswa.length > 0) {
            res.json(siswa[0]);
        } else {
            res.status(404).json({ error: 'Data siswa tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// =========================
// UPDATE
// =========================
router.post("/update/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const siswa = await Model_Siswa.getId(id);
        const jalurDaftar = siswa[0].jalur_daftar;
        const upload = createMulterUpload(jalurDaftar); 


        upload.fields([
            { name: "gambar_siswa", maxCount: 1 },
            { name: "file_kk", maxCount: 1 },
            { name: "file_akta", maxCount: 1 }
        ])(req, res, async (err) => {
            if (err) {
                console.log(err);
                req.flash("error", "Gagal upload file");
                return res.redirect("/siswa");
            }

            const fileBaru = req.files["gambar_siswa"]?.[0]?.filename || null;
            const fileKKBaru = req.files["file_kk"]?.[0]?.filename || null;
            const fileAktaBaru = req.files["file_akta"]?.[0]?.filename || null;

            const folderGambar = jalurDaftar === "online" ? "pendaftaran" : "siswa";

            if (fileBaru && siswa[0].gambar_siswa) {
                const pathFileLama = path.join(__dirname, `../public/images/${folderGambar}`, siswa[0].gambar_siswa);
                if (fs.existsSync(pathFileLama)) fs.unlinkSync(pathFileLama);
            }
            if (fileKKBaru && siswa[0].file_kk) {
                const pathKK = path.join(__dirname, "../public/files/daftar_ulang_kk", siswa[0].file_kk);
                if (fs.existsSync(pathKK)) fs.unlinkSync(pathKK);
            }
            if (fileAktaBaru && siswa[0].file_akta) {
                const pathAkta = path.join(__dirname, "../public/files/daftar_ulang_akta", siswa[0].file_akta);
                if (fs.existsSync(pathAkta)) fs.unlinkSync(pathAkta);
            }

            const {
                id_pendaftaran, id_daftar_ulang, id_users,
                nama_siswa, nik, alamat_siswa, ttl, gender,
                nama_ortu_siswa, no_telp_ortu_siswa, pekerjaan_ortu_siswa, alamat_ortu_siswa,
                waktu_siswa
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
                gambar_siswa: fileBaru || siswa[0].gambar_siswa,
                file_kk: fileKKBaru || siswa[0].file_kk,
                file_akta: fileAktaBaru || siswa[0].file_akta,
                waktu_siswa: waktu_siswa ? new Date(waktu_siswa) : new Date()
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

router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const rows = await Model_Siswa.getId(id);
        const siswa = rows[0];

        if (!siswa) {
            req.flash('error', 'Data siswa tidak ditemukan');
            return res.redirect('/siswa');
        }

        const namaFile = siswa.gambar_siswa;
        if (namaFile) {
            const pathFile = path.join(__dirname, '../public/images/siswa', namaFile);
            if (fs.existsSync(pathFile)) fs.unlinkSync(pathFile);
        }

        await Model_Siswa.Delete(id);

        await Model_Daftar_Ulang.UpdateStatusByPendaftaranId(siswa.id_pendaftaran, 'proses');

        req.flash("success", "Data siswa berhasil dibatalkan dan status daftar ulang dikembalikan ke 'proses'");
        res.redirect('/siswa');
    } catch (error) {
        console.log(error);
        req.flash("error", "Gagal membatalkan data siswa");
        res.redirect('/siswa');
    }
});

router.get('/download', async (req, res, next) => {
    try {
        const selectedTahun = req.query.tahun;
        if (!selectedTahun) return res.redirect('/siswa');

        const allSiswa = await Model_Siswa.getAll();

        const filteredSiswa = allSiswa.filter(s => new Date(s.waktu_siswa).getFullYear().toString() === selectedTahun);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Siswa ${selectedTahun}`);

        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Nama', key: 'nama_siswa', width: 25 },
            { header: 'NIK', key: 'nik', width: 20 },
            { header: 'Alamat', key: 'alamat_siswa', width: 30 },
            { header: 'TTL', key: 'ttl', width: 20 },
            { header: 'Gender', key: 'gender', width: 10 },
            { header: 'Nama Ortu', key: 'nama_ortu_siswa', width: 25 },
            { header: 'Pekerjaan Ortu', key: 'pekerjaan_ortu_siswa', width: 20 },
            { header: 'Alamat Ortu', key: 'alamat_ortu_siswa', width: 30 },
            { header: 'Jalur Daftar', key: 'jalur_daftar', width: 10 },
            { header: 'Diterima Pada', key: 'waktu_siswa', width: 20 }
        ];

        filteredSiswa.forEach((siswa, index) => {
            worksheet.addRow({
                no: index + 1,
                nama_siswa: siswa.nama_siswa,
                nik: siswa.nik,
                alamat_siswa: siswa.alamat_siswa,
                ttl: siswa.ttl,
                gender: siswa.gender,
                nama_ortu_siswa: siswa.nama_ortu_siswa,
                pekerjaan_ortu_siswa: siswa.pekerjaan_ortu_siswa,
                alamat_ortu_siswa: siswa.alamat_ortu_siswa,
                jalur_daftar: siswa.jalur_daftar,
                waktu_siswa: new Date(siswa.waktu_siswa).toLocaleDateString('id-ID')
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="data_siswa_${selectedTahun}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
