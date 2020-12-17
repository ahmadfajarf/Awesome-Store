//todo 1. Dapatkan router dari package Express
const router = require('express').Router();
//todo 2. Import multer untuk menangani form data
const multer = require('multer');
//todo 3. import category controller
const categoryController = require('./controller');

//todo 4. endpoint untuk membuat category baru, memperbarui category, menghapus category
router.post('/categories', multer().none(), categoryController.store);
router.get('/categories', categoryController.index);
router.put('/categories/:id', multer().none(), categoryController.update);
router.delete('/categories/:id', categoryController.destroy);

//todo 5. export router supaya bisa dipakai difile _app.js_
module.exports = router;
