var express = require('express');
var router = express.Router();
var connection = require('../config/Database.js');
const fs = require('fs');
const multer = require('multer');
const path = require('path'); 
const bcrypt = require('bcrypt');

var Model_Admin = require('../model/Model_Admin.js');
var Model_Users = require('../model/Model_Users.js');
var Model_Mapel = require('../model/Model_Mapel.js');
var Model_Guru = require('../model/Model_Guru.js');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/images/users')
  },
  filename: (req, file, cb) => {
      console.log(file)
      cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
      let mapel = await Model_Mapel.getAll();
      let guru = await Model_Guru.getAll();
      res.render('index', {
          data1: mapel,
          data2: guru,
      });
  } catch (error) {
      console.error("Error:", error);
      req.flash('invalid', 'Terjadi kesalahan saat memuat data pengguna');
      res.redirect('/login');
  }
});

router.get('/register', function(req, res, next) {
  res.render('auth/register');
})
router.get('/register_users', function(req, res, next) {
  res.render('auth/register_users');
})
router.get('/login', function(req, res, next) {
  res.render('auth/login');
})
router.get('/login_users', function(req, res, next) {
  res.render('auth/login_users');
})

router.post('/saveadmin', upload.single("gambar_admin"), async (req, res) => {
  try {
    let { nama_admin, no_telp_admin, email_admin, password_admin } = req.body;
    let enkripsi = await bcrypt.hash(password_admin, 10);
    let Data = {
      nama_admin,
      no_telp_admin,
      email_admin,
      password_admin: enkripsi,
      gambar_admin: req.file.filename
    };
    await Model_Admin.Store(Data);
    req.flash('success', 'Berhasil Register');
    res.redirect('/login');
  } catch (error) {
    console.log(error);
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/register');
  }
});

router.post('/saveusers', upload.single("gambar_users"), async (req, res) => {
  try {
    let { nama_users, no_telp_users, email_users, password_users } = req.body;
    let enkripsi = await bcrypt.hash(password_users, 10);
    let Data = {
      nama_users,
      no_telp_users,
      email_users,
      password_users: enkripsi,
      gambar_users: req.file.filename
    };
    await Model_Users.Store(Data);
    req.flash('success', 'Berhasil Register');
    res.redirect('/login_users');
  } catch (error) {
    console.log(error);
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/register_users');
  }
});

router.post("/updateusers/:id",  upload.single("gambar_users"), async (req, res, next) => {
  try {
      const id = req.params.id;
      let filebaru = req.file ? req.file.filename : null;
      let rows = await Model_Users.getId(id);
      const namaFileLama = rows[0].gambar_users;

      if (filebaru && namaFileLama) {
          const pathFileLama = path.join(__dirname, '../public/images/users', namaFileLama);
          fs.unlinkSync(pathFileLama);
      }

      let {
        nama_users,
        no_telp_users,
        email_users,
      } = req.body;
      
      let gambar_users = filebaru || namaFileLama

      let Data = {
          nama_users: nama_users,
          no_telp_users: no_telp_users,
          email_users: email_users,
          gambar_users
      }
      console.log(req.body);
      console.log(Data);
      await Model_Users.Update(id, Data);
      req.flash("success", "Berhasil mengupdate data profil");
      res.redirect("/users/profil");
  } catch (error) {
      console.log(error);
  }
});

// router.post('/log', async (req,res) => {
//   let {email_users, password_users } = req.body;
//   try {
//     let Data = await Model_Users.Login(email_users);
//     if(Data.length > 0) {
//       let enkripsi = Data[0].password_users;
//       let cek = await bcrypt.compare(password_users, enkripsi);
//       if(cek) {
//         req.session.userId = Data[0].id_users;
//         req.session.gambar_users= Data[0].gambar_users;
//         req.session.nama_users = Data[0].nama_users;
//         req.session.alamat_users = Data[0].alamat_users;
//         req.session.no_telp_users = Data[0].no_telp_users;
//         req.session.email_users = Data[0].email_users;
//         // tambahkan kondisi pengecekan level pada user yang login
//         if(Data[0].level_users == 1){
//           req.flash('success','Berhasil login');
//           res.redirect('/superusers');
//           //console.log(Data[0]);
//         }else if(Data[0].level_users == 2){
//           req.flash('success', 'Berhasil login');
//           res.redirect('/users');
//         }else{
//           res.redirect('/login');
//           console.log(Data[0]);
//         }
//       } else {
//         req.flash('failure', 'Email atau password salah');
//         res.redirect('/login');
//       }
//     } else {
//       req.flash('failure', 'Akun tidak ditemukan');
//       res.redirect('/login');
//     }
//   } catch (err) {
//     res.redirect('/login');
//     req.flash('failure', 'Error pada fungsi');
//     console.log(err);
//   }
// })

router.post('/logadmin', async (req,res) => {
  let {email_admin, password_admin } = req.body;
  try {
    let Data = await Model_Admin.Login(email_admin);
    if(Data.length > 0) {
      let enkripsi = Data[0].password_admin;
      let cek = await bcrypt.compare(password_admin, enkripsi);
      if(cek) {
        req.session.adminId = Data[0].id_admin;
        req.session.gambar_admin= Data[0].gambar_admin;
        req.session.nama_admin = Data[0].nama_admin;
        req.session.alamat_admin = Data[0].alamat_admin;
        req.session.no_telp_admin = Data[0].no_telp_admin;
        req.session.email_admin = Data[0].email_admin;
        // tambahkan kondisi pengecekan level pada user yang logi
          req.flash('success','Berhasil login');
          res.redirect('/superusers');
          //console.log(Data[0]);
      } else {
        req.flash('failure', 'Email atau password salah');
        res.redirect('/login');
      }
    } else {
      req.flash('failure', 'Akun tidak ditemukan');
      res.redirect('/login');
    }
  } catch (err) {
    res.redirect('/login_admin');
    req.flash('failure', 'Error pada fungsi');
    console.log(err);
  }
})

router.post('/logusers', async (req,res) => {
  let {email_users, password_users } = req.body;
  try {
    let Data = await Model_Users.Login(email_users);
    if(Data.length > 0) {
      let enkripsi = Data[0].password_users;
      let cek = await bcrypt.compare(password_users, enkripsi);
      if(cek) {
        req.session.userId = Data[0].id_users;
        req.session.gambar_users= Data[0].gambar_users;
        req.session.nama_users = Data[0].nama_users;
        req.session.alamat_users = Data[0].alamat_users;
        req.session.no_telp_users = Data[0].no_telp_users;
        req.session.email_users = Data[0].email_users;
        // tambahkan kondisi pengecekan level pada user yang logi
          req.flash('success','Berhasil login');
          res.redirect('/users');
          //console.log(Data[0]);
      } else {
        req.flash('failure', 'Email atau password salah');
        res.redirect('/login_users');
      }
    } else {
      req.flash('failure', 'Akun tidak ditemukan');
      res.redirect('/login_users');
    }
  } catch (err) {
    res.redirect('/login_users');
    req.flash('failure', 'Error pada fungsi');
    console.log(err);
  }
})

router.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if(err) {
      console.error(err);
    } else {
      res.redirect('/login');
    }
  });
});

router.get('/logout_users', function(req, res) {
  req.session.destroy(function(err) {
    if(err) {
      console.error(err);
    } else {
      res.redirect('/login_users');
    }
  });
});


module.exports = router;
