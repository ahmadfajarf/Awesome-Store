//todo 1. import package `router` dan `multer`
const router = require('express').Router();
const multer = require('multer');

//todo 2. import `cart controller`
const cartController = require('../cart/controller');

//todo 3. buat route untuk update cart
router.put('/carts', multer().none(), cartController.update);
//todo 3.1 buat route untuk melihat daftar items pada cart
router.get('/carts', cartController.index);

//todo 4. exports router
module.exports = router;
