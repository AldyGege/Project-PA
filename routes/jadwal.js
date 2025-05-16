var express = require('express');
var router = express.Router();

var Model_Jadwal = require('../Model/Model_Jadwal.js');
var Model_Users = require('../Model/Model_Users.js');
var Model_Dokter = require('../Model/Model_Dokter.js');

router.get('/', async function (req, res, next) {
    let id = req.session.userId;
    let Data = await Model_Users.getId(id);
    let rows = await Model_Jadwal.getAll();
    res.render('jadwal/index', {
        data: rows,
        data2: Data,
    })
});

router.get('/create', async function (req, res, next) {
    let rows = await Model_Dokter.getAll()
    res.render('jadwal/create', {
        jadwal: '',
        data: rows
    });
});

router.post('/store', async function (req, res, next) {
    try {
        let { id_dokter, senin, selasa, rabu, kamis, jumat, sabtu, minggu } = req.body;

        let Data = {
            id_dokter,
            senin,
            selasa,
            rabu,
            kamis,
            jumat,
            sabtu,
            minggu
        }
        await Model_Jadwal.Store(Data);
        req.flash('success', 'Berhasil Menyimpan Data!');
        res.redirect("/jadwal");
    } catch (error) {
        console.log(error);
        req.flash('error', "Terjadi kesalahan pada Menyimpan Data!");
        res.redirect("/jadwal");
    }
});

router.get('/edit/(:id)', async function (req, res, next) {
    let id = req.params.id;
    let rows = await Model_Jadwal.getId(id);
    let rows2 = await Model_Dokter.getAll()
    res.render('jadwal/edit', {
        id: rows[0].id_jadwal,
        id_dokter: rows[0].id_dokter,
        nama_dokter: rows[0].nama_dokter,
        senin: rows[0].senin,
        selasa: rows[0].selasa,
        rabu: rows[0].rabu,
        kamis: rows[0].kamis,
        jumat: rows[0].jumat,
        sabtu: rows[0].sabtu,
        minggu: rows[0].minggu,
        data: rows
    })
});

// router.post('/update/(:id)', async function (req, res, next) {
//     try {
//         let id = req.params.id;
//         let { id_dokter, senin, selasa, rabu, kamis, jumat, sabtu, minggu } = req.body;

//         let Data = {
//             id_dokter, 
//             senin, 
//             selasa, 
//             rabu, 
//             kamis, 
//             jumat, 
//             sabtu, 
//             minggu
//         }

//         console.log('Data : ', id ,Data);
//         await Model_Jadwal.Update(id, Data);
//         req.flash('Success', 'Berhasil Menyimpan Data Baru')
//         res.redirect('/jadwal')
//     } catch(error) {
//         console.log(error)
//         req.flash('error', 'Gagal Menyimpan Data Baru')
//         res.redirect('/jadwal')
//     }
// });

router.post("/update/:id", async (req, res, next) => {
    try {
        const id = req.params.id;

        let { id_dokter, senin, selasa, rabu, kamis, jumat, sabtu, minggu } = req.body;

        let Data = {
            id_dokter,
            senin,
            selasa,
            rabu,
            kamis,
            jumat,
            sabtu,
            minggu
        }
        await Model_Jadwal.Update(id, Data);
        req.flash('Success', 'Berhasil Menyimpan Data Baru')
        res.redirect('/jadwal')
    } catch (error) {
        console.log(error);
    }
});


router.get('/delete/(:id)', async function (req, res) {
    let id = req.params.id;
    await Model_Jadwal.Delete(id);
    req.flash('success', 'Berhasil Menghapus data!');
    res.redirect('/jadwal');
})

router.get('/users/(:id)', async function (req, res, next) {
    try {
        let id = req.params.id;
        // let level_users = req.session.level;
        let id_users = req.session.userId;
        let rows = await Model_Jadwal.getId(id);
        res.render('jadwal/users/index', {
            data: rows[0]
        })
    } catch (error) {
        console.error("Error:", error);
        req.flash('invalid', 'Terjadi kesalahan saat memuat data pengguna');
        res.redirect('/login');
    }

});

module.exports = router;