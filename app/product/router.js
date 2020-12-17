//* Import router dari Express
const router = require('express').Router();
//* require multer untuk menangkap respone dari form data
const multer = require('multer');
const os = require('os');

//* Import product controller
const productController = require('./controller');

//! route untuk mendapatkan daftar produk
router.get('/products', productController.index);

//! route untuk membuat produk baru
router.post(
  '/products',
  //todo endpoint ini untuk membuat produk agar bisa menerima file upload dgn nama 'image' & menyimpannya dulu pada lokasi sementara (temp)
  //todo 'os.tmptdir()' digunakan untuk mendapatkan lokasi temp
  multer({ dest: os.tmpdir() }).single('image'),
  productController.store
);

//! route untuk update produk
router.put(
  '/products/:id',
  multer({ dest: os.tmpdir() }).single('image'),
  productController.update
);

//! route untuk hapus produk
router.delete('/products/:id', productController.destroy);

//* Exports router
module.exports = router;
