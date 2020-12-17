//todo 1. import router dan multer
const router = require('express').Router();
const multer = require('multer');

//todo 2. import controller deliveryAddress
const addressController = require('../delivery-address/controller');

//todo 3. route untuk membuat alamat pengiriman
router.post('/delivery-addresses', multer().none(), addressController.store);
//todo 3.1 route untuk memperbarui alamat pengiriman berdasarkan _id_
router.put(
  '/delivery-addresses/:id',
  multer().none(),
  addressController.update
);
//todo 3.2 route untuk menghapus alamat pengiriman berdasarkan _id_
router.delete('/delivery-addresses/:id', addressController.destroy);
//todo 3.3 route untuk mendapatkan daftar alamat pengiriman dari user
router.get('/delivery-addresses', addressController.index);

//todo 4. exports router
module.exports = router;
