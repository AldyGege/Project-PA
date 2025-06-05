var express = require('express');
var router = express.Router();
var connection = require('../config/Database.js');
const fs = require('fs');
const multer = require('multer');
const path = require('path'); 
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const axios = require("axios");

var Model_Admin = require('../model/Model_Admin.js');
var Model_Users = require('../model/Model_Users.js');
var Model_Mapel = require('../model/Model_Mapel.js');
var Model_Guru = require('../model/Model_Guru.js');
var Model_Album = require('../model/Model_Album.js');
var Model_Fasilitas = require('../model/Model_Fasilitas.js');
var Model_Berita = require('../model/Model_Berita.js');


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


/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
      let mapel = await Model_Mapel.getAll();
      let guru = await Model_Guru.getAll();
      let album = await Model_Album.getAll();
      res.render('index', {
        data2: mapel,
        data3: guru,
        data4: album,
      });
  } catch (error) {
      console.error("Error:", error);
      req.flash('invalid', 'Terjadi kesalahan saat memuat data pengguna');
      res.redirect('/login');
  }
});

router.get('/fasilitaslogin', async (req, res, next) => {
    try {
        let rows = await Model_Fasilitas.getAll();
        res.render('fasilitas', {
            data: rows,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/albumlogin', async (req, res, next) => {
    try {
        let rows = await Model_Album.getAll();
        res.render('album', {
            data: rows,
        });
    } catch (error) {
        next(error);
    }
});

    router.get('/beritalogin', async (req, res, next) => {
        try {
            let rows = await Model_Berita.getAll();
            res.render('berita', {
                data: rows,
            });
        } catch (error) {
            next(error);
        }
    });

router.get('/detail_berita/:id', async (req, res, next) => {
  try {
    let beritaId = req.params.id; // <- harus ini dulu
    let berita = await Model_Berita.getId(beritaId);

    if (!berita || berita.length === 0) {
      req.flash('error', 'Berita tidak ditemukan');
      return res.redirect('/berita');
    }

    let beritaLain = await Model_Berita.getLimited(5, beritaId); // pakai setelah beritaId sudah dideklarasi

    res.render('detail_berita', {
      data: berita[0],
      beritaLain
    });
  } catch (error) {
    next(error);
  }
});


    router.get('/gurulogin', async (req, res, next) => {
        try {
            let rows = await Model_Guru.getAll();
            res.render('guru', {
                data: rows,
            });
        } catch (error) {
            next(error);
        }
    });

    router.get('/petunjuklogin', async function (req, res, next) {
  try {
      let mapel = await Model_Mapel.getAll();
      let guru = await Model_Guru.getAll();
      res.render('petunjuk', {
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

router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot_password');
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { no_telp_users } = req.body;
    const user = await Model_Users.findByPhone(no_telp_users); // kamu harus buat method ini

    if (!user || user.length === 0) {
      req.flash('failure', 'Nomor tidak ditemukan');
      return res.redirect('/forgot-password');
    }

    const token = crypto.randomBytes(20).toString('hex');
    await Model_Users.saveResetToken(user[0].id_users, token);

    const resetLink = `http://localhost:3000/reset-password/${token}`;
    const message = `Halo ${user[0].nama_users}, klik link berikut untuk reset password (dengan email: ${user[0].email_users}):\n\n${resetLink}`;

    const result = await sendWhatsappMessage(no_telp_users, message);

    if (result.success) {
      req.flash('success', 'Link reset berhasil dikirim ke WhatsApp Anda');
    } else {
      req.flash('failure', 'Gagal mengirim pesan WhatsApp');
    }

    res.redirect('/forgot-password');
  } catch (err) {
    console.error(err);
    req.flash('failure', 'Terjadi kesalahan');
    res.redirect('/forgot-password');
  }
});

router.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const user = await Model_Users.findByToken(token); // kamu perlu buat method ini

  if (!user) {
    req.flash('failure', 'Token tidak valid atau kadaluarsa');
    return res.redirect('/login_users');
  }

  res.render('auth/reset_password', { token });
});

router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password_users } = req.body;
  const user = await Model_Users.findByToken(token);

  if (!user) {
    req.flash('failure', 'Token tidak valid');
    return res.redirect('/login_users');
  }

  const hashed = await bcrypt.hash(password_users, 10);
  await Model_Users.updatePassword(user.id_users, hashed);
  await Model_Users.clearResetToken(user.id_users); // hapus token agar tidak bisa digunakan ulang

  req.flash('success', 'Password berhasil diubah, silakan login');
  res.redirect('/login_users');
});

// Tambahkan fungsi masking ini di atas router.post('/check-phone')
function maskEmail(email) {
  const [user, domain] = email.split('@');
  return user.slice(0, 3) + '***@' + domain;
}

router.post('/check-phone', async (req, res) => {
  const { no_telp_users } = req.body;
  const user = await Model_Users.findByPhone(no_telp_users);
  
  if (user && user.length > 0) {
    const maskedEmail = maskEmail(user[0].email_users);
    res.json({ found: true, email: maskedEmail });
  } else {
    res.json({ found: false });
  }
});



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

router.post("/updateadmin/:id",  upload.single("gambar_admin"), async (req, res, next) => {
  try {
      const id = req.params.id;
      let filebaru = req.file ? req.file.filename : null;
      let rows = await Model_Admin.getId(id);
      const namaFileLama = rows[0].gambar_admin;

      if (filebaru && namaFileLama) {
          const pathFileLama = path.join(__dirname, '../public/images/users', namaFileLama);
          fs.unlinkSync(pathFileLama);
      }

      let {
        nama_admin,
        no_telp_admin,
        email_admin,
      } = req.body;
      
      let gambar_admin = filebaru || namaFileLama

      let Data = {
          nama_admin: nama_admin,
          no_telp_admin: no_telp_admin,
          email_admin: email_admin,
          gambar_admin
      }
      console.log(req.body);
      console.log(Data);
      await Model_Admin.Update(id, Data);
      req.flash("success", "Berhasil mengupdate data profil");
      res.redirect("/superusers/profil_admin");
  } catch (error) {
      console.log(error);
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
