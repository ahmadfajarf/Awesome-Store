const User = require('../user/model');
//todo 0. Import untuk localStrategy
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const { getToken } = require('../utils/get-token');

//! FUNGSI UNTUK MEMBUAT USER BARU
async function register(req, res, next) {
  try {
    //todo 1. tangkap request dari client
    const payload = req.body;

    //todo 2. buat object baru user
    const user = new User(payload);

    //todo 3. simpan user baru ke mongoDB
    await user.save();

    //todo 4. kembalikan response ke client
    return res.json(user);
  } catch (err) {
    //todo 5. cek kemungkinan kesalahan terkait validasi
    if (err && err.name) {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.error
      });
    }
    //todo 6. error lainnya
    next(err);
  }
}

//! FUNGSI UNTUK MENDEFINISIKAN BAGAIMANA STRATEGI UNTUK LOGIN PADA APLIKASI INI
async function localStrategy(email, password, done) {
  try {
    //todo 1. cari user ke mongoDB
    let user = await User.findOne({ email }).select(
      '-__v -createdAt -updatedAt -cart_items -token'
    );
    //todo 2. jika user tidak ditemukan, akhiri proses login
    if (!user) return done();

    //todo 3. sampai disini artinya user ditemukan, cek password sesuai atau tidak
    if (bcrypt.compareSync(password, user.password)) {
      ({ password, ...userWithoutPassword } = user.toJSON());
      //todo 4. akhiri pengecekan, user berhasil login
      //todo 5. berika data user tanpa password
      return done(null, userWithoutPassword);
    }
  } catch (err) {
    done(err, null); //todo 6. tangani error
  }
  done();
}

//! FUNGSI UNTUK LOGIN UNTUK USER YANG SUDAH ADA
//todo 1. fungsi login ini yang akan memanggil passport.authenticate
async function login(req, res, next) {
  //todo 2. fungsi passport.authenticate terdapat 2 parameter, yg ke-1: strategi yg digunakan. yg ke-2: fungsi yg digunakan untuk menentukan pemrosesan lebih lanjut setelah _localStrategy_ dijalankan oleh passport
  passport.authenticate('local', async function (err, user) {
    //todo 3. setelah itu jika terjadi error pada _localStraregy_ kita serahkan pada Express
    if (err) return next(err);
    //todo 4. mengecek apakah hasil dari _localStrategy_ membuahkan user / tidak, jika tidak ada berikan response ke client.
    if (!user)
      return res.json({ error: 1, message: 'email or password incorrect' });
    //todo 5. sebaliknya jika user ditemukan maka buat token menggunakan JSON Web Token & simpan ke attribut user terkait di mongoDB
    //todo 6. membuat JSON Web Token
    let signed = jwt.sign(user, config.secretKey);
    //todo 7. simpan token tersebut ke user terkait
    await User.findOneAndUpdate(
      { _id: user._id },
      { $push: { token: signed } },
      { new: true }
    );
    //todo 8. response ke client
    return res.json({
      message: 'Logged In Succesfully',
      user: user,
      token: signed
    });
  })(req, res, next);
}

//! FUNGSI ENDPOINT UNTUK MENDAPATKAN DATA USER YANG SEDANG LOGIN
function me(req, res, next) {
  if (!req.user) {
    return res.json({
      error: 1,
      message: `Your're not login or token expired`
    });
  }
  return res.json(req.user);
}

//! FUNGSI UNTUK LOGOUT USER
async function logout(req, res, next) {
  //todo 1. ambil token dari request
  let token = getToken(req);
  //todo 2. hapus token dar _user_
  let user = await User.findOneAndUpdate(
    { token: { $in: [token] } },
    { $pull: { token } },
    { useFindAndModify: false }
  );
  //todo 3. cek user atau token
  if (!user || !token) {
    return res.json({
      error: 1,
      message: 'No User Found'
    });
  }
  //todo 4. logout berhasil
  return res.json({
    error: 0,
    message: 'Logout Berhasil'
  });
}

module.exports = {
  register,
  localStrategy,
  login,
  me,
  logout
};
