//todo 1. Import Router dari package Express
const router = require('express').Router();
//todo 2. Import package multer untuk menangani form data
const multer = require('multer');
//todo 3. Import Tag Controller
const tagController = require('./controller');

//todo 4. endpoint untuk membuat tag baru, memperbarui tag, menghapus tag
router.post('/tags', multer().none(), tagController.store);
router.get('/tags', tagController.index);
router.put('/tags/:id', multer().none(), tagController.update);
router.delete('/tags/:id', tagController.destroy);

//todo 5. export router supaya bisa digunakan difile _app.js_
module.exports = router;
