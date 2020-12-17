//todo 1. Import csctojson
const csv = require('csvtojson');
const path = require('path');

//! FUNGSI UNTUK DATA WILAYAH PROVINSI
async function getProvinsi(req, res, next) {
  //todo 2. ambil directory path dari provinsi dan simpan ke variabel
  const db_provinsi = path.resolve(__dirname, './data/provinces.csv');

  try {
    //todo 3. kode dibawah difungsikan untuk membaca file ext csv dari provinsi dan disimpan ke variabel data
    const data = await csv().fromFile(db_provinsi);
    //todo 4. response provinsi ke client dalam bentuk json
    return res.json(data);
  } catch (err) {
    //todo 5. tangani error
    return res.json({
      error: 1,
      message: 'Tidak bisa mengambil data provinsi, Coba hubungi administrator'
    });
  }
}

//! FUNGSI UNTUK DATA KABUPATEN BERDASARKAN PROVINSI YANG DIPILIH
async function getKabupaten(req, res, next) {
  //todo 1. ambil directory path dari kabupaten lalu simpan ke variabel
  const db_kabupaten = path.resolve(__dirname, './data/regencies.csv');

  try {
    //todo 2. Data provinsi yang dipilih akan dilewatkan melalui query string pada URL dalam bentuk kode provinsi.
    let { kode_induk } = req.query;
    //todo 3. kode dibawah difungsikan untuk membaca file ext csv dari kabupaten dan disimpan ke variabel data
    const data = await csv().fromFile(db_kabupaten);
    //todo 4. jika tidak ada data provinsi dari request query maka kembalikan response data dalam bentuk json
    if (!kode_induk) return res.json(data);

    return res.json(
      //todo 5. Kemudian data kabupatennya akan kita filter dengan dasar kode_induk tersebut.
      data.filter((kabupaten) => kabupaten.kode_provinsi === kode_induk)
    );
  } catch (err) {
    return res.json({
      error: 1,
      message:
        'Tidak bisa mengambil data kabupaten, silahkan hubungi administrator'
    });
  }
}

//! FUNGSI UNTUK DATA KECAMATAN BERDASARKAN KABUPATEN YANG DIPILIH
async function getKecamatan(req, res, next) {
  const db_kecamatan = path.resolve(__dirname, './data/districts.csv');

  try {
    let { kode_induk } = req.query;
    const data = await csv().fromFile(db_kecamatan);
    if (!kode_induk) return res.json(data);
    return res.json(
      data.filter((kecamatan) => kecamatan.kode_kabupaten === kode_induk)
    );
  } catch (err) {
    return res.json({
      error: 1,
      message:
        'Tidak bisa mengambil data kecamatan, mohon hubungi administrator'
    });
  }
}

//! FUNGSI UNTUK DATA DESA BERDASRKAN KECAMATAN YANG DIPILIH
async function getDesa(req, res, next) {
  const db_desa = path.resolve(__dirname, './data/villages.csv');

  try {
    let { kode_induk } = req.query;
    const data = await csv().fromFile(db_desa);
    if (!kode_induk) return res.json(data);

    return res.json(data.filter((desa) => desa.kode_kecamatan === kode_induk));
  } catch (err) {
    return res.json({
      error: 1,
      message: 'Tidak dapat mengambil data desa, silahkan hubungi administrator'
    });
  }
}

module.exports = {
  getProvinsi,
  getKabupaten,
  getKecamatan,
  getDesa
};
