var express = require('express');
var router = express.Router();

router.get('/users', async function (req, res, next) {
    try {
        // let level_users = req.session.level;
        res.render('tentang_kami/users/index', {
        })
    } catch (error) {
        console.error("Error:", error);
        req.flash('invalid', 'Terjadi kesalahan saat memuat data pengguna');
        res.redirect('/login');
    }

});
module.exports = router;