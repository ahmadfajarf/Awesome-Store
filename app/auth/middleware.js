const config = require('../config');
const jwt = require('jsonwebtoken');
const User = require('../user/model');
const { getToken } = require('../utils/get-token');

//! MIDDLEWARE UNTUK MEMBACA TOKEN DAN MENGUBAHNYA MENJADI OBJEK "USER" KEMBALI / DECODING
function decodeToken() {
  return async function (req, res, next) {
    try {
      //todo 1. dapatkan token dari request _get-token.js_
      let token = getToken(req);
      //todo 2. jika token request tidak memiliki token maka serahkan ke middleware "next()" untuk proses
      if (!token) return next();
      //todo 3. dalam menyimpan token bukan didalam variable user tetapi di _req.user_ dikarenakan kita ingin menambahkan data "user" tersebut ke request. berarti selanjutnya baik di middleware lainnya / dicontroller kita akan bisa mendapatkan data "user" yg login dgn req.user
      req.user = jwt.verify(token, config.secretKey);
      //todo 4. gunakan model _User_ untuk mengecek apakah token yang dipakai belum expired / masih ada didata mongoDB User terkait
      let user = await User.findOne({
        token: { $in: [token] }
      });
      //todo 5. jika user tidak ditemukan maka _token expired_
      if (!user) {
        return res.json({
          error: 1,
          message: `Token Expired`
        });
      }
    } catch (err) {
      //todo 6. tangani error yang terjadi terkait _JsonWebTokenError_
      if (err && err.name === 'JsonWebTokenError') {
        return res.json({
          error: 1,
          message: err.message
        });
      }
      //todo 7. tangani error lainnya
      next(err);
    }
    //todo 8. panggin next();
    return next();
  };
}

module.exports = {
  decodeToken
};
