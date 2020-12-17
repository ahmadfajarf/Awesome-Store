//todo 1. import package yang dibutuhkan
const router = require('express').Router();
const multer = require('multer');
//todo 0. Import untuk localStrategy
const passport = require('passport');
const LocalStrategy = require('passport-local');

//todo 2. import auth controller
const authController = require('../auth/controller');

//todo 3. buat endpoint untuk register user baru
router.post('/register', multer().none(), authController.register);
//todo 1. buat endpoint untuk login
router.post('/login', multer().none(), authController.login);

//todo 1. buat endpoint me untuk data user yg sedang login
router.get('/me', authController.me);
//todo buat endpoint logout data user
router.post('/logout', authController.logout);

//todo 2. Secara bawaan passport akan mengasumsikan bahwa request akan mengandung _username & password_, tetapi karena ingin menggunakan _email & password_ maka harus di konfigurasi seperti ini.
passport.use(
  new LocalStrategy({ usernameField: 'email' }, authController.localStrategy)
);

//todo 4. export router
module.exports = router;
