const express = require("express");
const router = express.Router();
const Model_Siswa = require('../model/Model_Siswa.js');
const Model_Daftar_Ulang = require('../model/Model_Daftar_Ulang.js'); 
const Model_Admin = require('../model/Model_Admin.js'); 
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

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
        let dataAdmin = await Model_Admin.getId(id);

        // Ambil semua data siswa
        let allSiswa = await Model_Siswa.getAll();

        // Ambil tahun dari query (misalnya ?tahun=2024)
        const selectedTahun = req.query.tahun;

        // Filter data jika tahun dipilih
        let filteredSiswa = selectedTahun
            ? allSiswa.filter(s => {
                const waktu = new Date(s.waktu_siswa);
                return waktu.getFullYear().toString() === selectedTahun;
            })
            : allSiswa;

        // Ambil list tahun unik dari semua siswa
        const tahunList = [...new Set(
            allSiswa.map(s => new Date(s.waktu_siswa).getFullYear())
        )].sort((a, b) => b - a); // Urutkan dari yang terbaru

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
                    gambar_siswa: '',
                    file_kk: '',
                    file_akta: '',
                    waktu_daftar_ulang: ''
        });
        });
// Store
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
      waktu_siswa // <-- dari form admin, optional
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

router.get('/detail/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const siswa = await Model_Siswa.getId(id);
        if (siswa.length > 0) {
            res.json(siswa[0]);  // Kirim data siswa pertama (sesuai id)
        } else {
            res.status(404).json({ error: 'Data siswa tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// Update
router.post("/update/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const siswa = await Model_Siswa.getId(id);
    const jalurDaftar = siswa[0].jalur_daftar;

    const upload = createMulterUpload(jalurDaftar === 'online' ? 'pendaftaran' : 'siswa');

    upload.single('gambar_siswa')(req, res, async (err) => {
      if (err) {
        console.log(err);
        req.flash("error", "Gagal upload gambar");
        return res.redirect("/siswa");
      }

      const fileBaru = req.file ? req.file.filename : null;
      const namaFileLama = siswa[0].gambar_siswa;

      if (fileBaru && namaFileLama) {
        const folder = jalurDaftar === 'online' ? 'pendaftaran' : 'siswa';
        const pathFileLama = path.join(__dirname, `../public/images/${folder}`, namaFileLama);
        if (fs.existsSync(pathFileLama)) {
          fs.unlinkSync(pathFileLama);
        }
      }

      let {
        id_pendaftaran, id_daftar_ulang, id_users,
        nama_siswa, nik, alamat_siswa, ttl, gender,
        nama_ortu_siswa, no_telp_ortu_siswa, pekerjaan_ortu_siswa, alamat_ortu_siswa,
        waktu_siswa // ← ambil dari form
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
        gambar_siswa: fileBaru || namaFileLama,
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

router.get('/download', async (req, res, next) => {
    try {
        const selectedTahun = req.query.tahun;
        if (!selectedTahun) return res.redirect('/siswa');

        const allSiswa = await Model_Siswa.getAll();

        // Filter berdasarkan tahun
        const filteredSiswa = allSiswa.filter(s => {
            const waktu = new Date(s.waktu_siswa);
            return waktu.getFullYear().toString() === selectedTahun;
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Siswa ${selectedTahun}`);

        // Header
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

        // Data
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

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="data_siswa_${selectedTahun}.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
