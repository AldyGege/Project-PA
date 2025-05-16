var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('express-flash');
var session = require('express-session');
const MemoryStore = require('session-memory-store')(session);
const Model_Pendaftaran = require('./model/Model_Pendaftaran');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/users');
var superusersRouter = require('./routes/superusers');
var keahlianRouter = require('./routes/keahlian');
var jadwalRouter = require('./routes/jadwal');
var tentang_kamiRouter = require('./routes/tentang_kami');
var pendaftaranRouter = require('./routes/pendaftaran');
var daftarulangRouter = require('./routes/daftar_ulang');
var artikelRouter = require('./routes/artikel');
var beritaRouter = require('./routes/berita'); 
var fasilitasRouter = require('./routes/fasilitas'); 
var bukuRouter = require('./routes/buku'); 
var albumRouter = require('./routes/album');
var mapelRouter = require('./routes/mapel');
var guruRouter = require('./routes/guru');
var siswaRouter = require('./routes/siswa');
var keuanganRouter = require('./routes/keuangan');




//var pemesananRouter = require('./routes/pemesanan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  cookie: {
    maxAge: 6000000000,
    secure: false,
    httpOnly: true,
    sameSite: 'strict',
  },
  store: new MemoryStore,
  saveUninitialized: true,
  resave: 'false',
  secret: 'secret'
}))

app.use(flash())

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/superusers', superusersRouter);
app.use('/keahlian', keahlianRouter);
app.use('/jadwal', jadwalRouter);
app.use('/tentang_kami', tentang_kamiRouter);
app.use('/pendaftaran', pendaftaranRouter);
app.use('/daftar_ulang', daftarulangRouter);
app.use('/artikel', artikelRouter);
app.use('/berita', beritaRouter);
app.use('/fasilitas', fasilitasRouter);
app.use('/buku', bukuRouter);
app.use('/album', albumRouter);
app.use('/mapel', mapelRouter);
app.use('/guru', guruRouter);
app.use('/siswa', siswaRouter);
app.use('/keuangan', keuanganRouter);


app.get('/get-pendaftaran/:id', async function (req, res) { 
  try {
      let id_pendaftaran = req.params.id;
      console.log("🟡 ID yang diterima di backend:", id_pendaftaran);  // Debug

      let pendaftaran = await Model_Pendaftaran.getId(id_pendaftaran);
      console.log("📍 Hasil Query:", pendaftaran); // Debug

      if (!pendaftaran) {
          console.warn("⚠️ Data tidak ditemukan untuk ID:", id_pendaftaran);
          return res.status(404).json({ error: "Data tidak ditemukan" });
      }

      res.json(pendaftaran[0]);
  } catch (error) {
      console.error("❌ Error fetching pendaftaran:", error);
      res.status(500).json({ error: "Terjadi kesalahan saat mengambil data" });
  }
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
