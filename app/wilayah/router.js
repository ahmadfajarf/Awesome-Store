//todo 1. import router dari express
const router = require('express').Router();

//todo 2. import provinsi dari controller wilayah
const wilayahController = require('./controller');

//todo 3. buat endpoint wilayah untuk provinsi
router.get('/wilayah/provinsi', wilayahController.getProvinsi);
//todo 3.1 buat endpoint wilayah untuk kabupaten berdasarkan provinsi
router.get('/wilayah/kabupaten', wilayahController.getKabupaten);
//todo 3.2 buat endpoint wilayah untuk kecamatan berdasarkan kabupaten
router.get('/wilayah/kecamatan', wilayahController.getKecamatan);
//todo 3.3 buat endpoint wilayah untuk desa berdasarkan kecamatan
router.get('/wilayah/desa', wilayahController.getDesa);

//todo 4. export router
module.exports = router;
