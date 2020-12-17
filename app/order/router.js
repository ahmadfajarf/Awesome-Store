//todo 1. import package `Router` dan `Multer`
const router = require('express').Router();
const multer = require('multer');

//todo 2. import `orderController`
const orderController = require('../order/controller');

//todo 3. router untuk membuat order
router.post('/orders', multer().none(), orderController.store);
//todo 3.1 router untuk melihat daftar order / pesanan
router.get('/orders', orderController.index);

//todo 4. export router
module.exports = router;
