const fs = require('fs');
const path = require('path');
//* import model Product
const Product = require('./model');
const Category = require('../category/model'); //todo 0. Import model Category
const Tag = require('../tag/model'); //todo 0. Import model Tag
const config = require('../config');
const { rootPath } = require('../config');
const { policyFor } = require('../policy/index');

//! FUNGSI STORE UNTUK MEMBUAT PRODUK BARU
async function store(req, res, next) {
  try {
    //! -------- Cek Policy --------//
    let policy = policyFor(req.user);

    if (!policy.can('create', 'Product')) {
      return res.json({
        error: 1,
        message: 'Anda tidak memiliki hak akses untuk membuat produk'
      });
    }

    //* tangkap data form yang dikirimkan client sebagai variable 'payload'
    let payload = req.body;

    //! RELATION ANTARA PRODUCT DENGAN CATEGORY
    //todo 1. apakah request memiliki data category / tidak ?
    if (payload.category) {
      //todo 2. jika ada : maka cari ke collection 'Category'
      let category = await Category.findOne({
        //todo 3. kriterianya yaitu field 'name' kemudian gunakan $regex & $options dgn value 'i' untuk incasesensitive. cth= "minuman" / "Minuman" dianggap sama saja.
        name: { $regex: payload.category, $options: 'i' }
      });
      //todo 4. kemudian cek lagi apakah category dgn kriteria yg diberikan ditemukan ?
      if (category) {
        //todo 5. jika ada : kita ambil _id nya lalu simpan sbgai category dalam payload seperti ini.
        payload = { ...payload, category: category._id };
      } else {
        //todo 6. jika tidak ada maka hapus category dari payload
        delete payload.category;
      }
    }

    //! RELATION ANTARA PRODUCT DENGAN TAG
    //todo 1. mengecek apakah request memiliki atributs tags && mengecek apakah atributs tags ada isinya, kalau hanya array kosong abaikan saja
    if (payload.tags && payload.tags.length) {
      //todo 2. gunakan method find untuk mencari 1 / lebih Tag yg berbeda
      let tags = await Tag.find({
        //todo 3. untuk kriteria sebagai berikut artinya nama Tag ada didalam payload.tags
        name: { $in: payload.tags }
      });
      //todo 4. kemudian cek  lagi apakah tags membuahkan hasil / ada isinya
      if (tags.length) {
        //todo 5. Jika ada, maka ambil "_id" untuk masing" Tag dan gabungkan dengan payload
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      }
    }

    //! untuk menangani file upload "image_url" pada payload
    if (req.file) {
      let tmp_path = req.file.path; //* menangkap lokasi sementara file yang diupload
      let originalExt = req.file.originalname.split('.')[ //* menangkap ekstensi dari file asli yang diupload
        req.file.originalname.split('.').length - 1 //* "req.file.originalname adalah nama file asli sementara"
      ];
      //* "req.file.filename adalah nama random yang digenerate oleh multer"
      let filename = req.file.filename + '.' + originalExt; //* membangun nama file baru lengkap dengan ekstensi asli yang kita tangkap tadi
      //! mengkonfigurasi tempat penyimpanan untuk file yang diupload
      let target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}` //! lokasi "public/upload/namafile.ekstensi"
      );

      const src = fs.createReadStream(tmp_path); //* baca file yang masih dilokasi sementara
      const dest = fs.createWriteStream(target_path); //* pindahkan file ke lokasi permanent
      src.pipe(dest); //* mulai pindahkan file dari "src" ke "dest"

      //todo Event Listener untuk mendeteksi bahwa proses pemindahan file sudah selesai
      src.on('end', async () => {
        let product = new Product({ ...payload, image_url: filename }); //* menyimpan product baru disertai dengan data nama file gambar yang diupload
        await product.save();
        return res.json(product);
      });

      //todo Event Listener untuk mendeteksi jika pada proses upload error
      src.on('error', async () => {
        next(err);
      });
    } else {
      //* Membuat product baru menggunakan data dari payload
      let product = new Product(payload);

      //* Simpan product yang baru dibuat ke MongoDB
      await product.save();

      //* Berikan response kepada client dengan mengembalikan product yang baru dibuat
      return res.json(product);
    }
  } catch (err) {
    //! -------- Cek Tipe Error ---------//
    if (err && err.name === 'ValidationError') {
      return res.json({
        error: 1, //! Error yang kita ketahui
        message: err.message,
        fields: err.errors //! error kemungkinnan dari validasi yang di handle langsung oleh mongodb dalam hal ini mongoose
      });
    }
    next(err); //! handling error oleh mongoose langsung
  }
}

//! FUNGSI INDEX UNTUK MENDAPATKAN DAFTAR LIST PRODUK
async function index(req, res, next) {
  try {
    let { limit = 10, skip = 0, q = '', category = '', tags = [] } = req.query; //todo menangkap query string yang dikirim oleh client (diberi nilai default)

    //! Filter Product berdasarkan _Keyword_
    //todo 1. buat variable "criteria" untuk digunakan saat melakukan query ke mongoDB
    let criteria = {};
    //todo 2. mengecek apakah variabel "q" memiliki nilai teks / yg artinya client mengirimkan query string "q"
    if (q.length) {
      //todo 3. jika variable "q" memiliki nilai maka gabung dengan variable "criteria"
      criteria = {
        ...criteria,
        name: { $regex: `${q}`, $options: 'i' }
      };
    }

    //! Filter Product sekaligus berdasarkan _Category & _Keyword_ / Salah satu juga bisa
    //todo 1. mengecek apakah category memiliki nilai / ada data terkait:
    if (category.length) {
      //todo 2. Maka lakukan pencarian category tersebut di collection "categories"
      category = await Category.findOne({
        name: { $regex: `${category}`, $options: 'i' }
      });
      //todo 3. jika category ditemukan :
      if (category) {
        //todo 4. maka gabungkan dengan variable criteria tapi ambil ObjectId nya saja dari category yg ditemukan
        criteria = { ...criteria, category: category._id };
      }
    }

    //! Filter Product berdasarkan _Tag_
    //todo 1. mengecek apakah tags memiliki nilai / ada isinya
    if (tags.length) {
      //todo 2. jika ada maka cari semua Tag dicollection Tag dengan kriteria berikut
      tags = await Tag.find({ name: { $in: tags } });
      //todo 3. lalu gabung dengan variable criteria untuk mencari Product. gunakan map untuk ambil _id untuk masing" tag
      criteria = { ...criteria, tags: { $in: tags.map((tag) => tag._id) } };
    }

    let count = await Product.find(criteria).countDocuments();

    let products = await Product.find(criteria) //* mengambil semua data produk dari mongoDB
      //* "parseInt" digunakan untuk mengubah query yang string menjadi integer dalam hal ini `limit` & `skip`
      .limit(parseInt(limit)) //todo limit digunakan untuk membatasi jumlah data yang diquery pada model tertentu
      .skip(parseInt(skip)) //todo skip digunakan untuk beberapa data yang ingin diskip
      .populate('category') //todo populate digunakan untuk mencari data terkait dalam hal ini category
      .populate('tags'); //todo populate digunakan untuk mencari data terkait dalam hal ini tags
    return res.json({ data: products, count: count });
  } catch (err) {
    next(err);
  }
}

//! FUNGSI UPDATE UNTUK MEMPERBARUI DATA PRODUK
async function update(req, res, next) {
  try {
    //! -------- Cek Policy --------//
    let policy = policyFor(req.user);

    if (!policy.can('update', 'Product')) {
      return res.json({
        error: 1,
        message: 'Anda tidak memiliki hak akses untuk mengupdate produk'
      });
    }

    let payload = req.body;

    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: 'i' }
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (payload.tags && payload.tags.length) {
      let tags = await Tag.find({
        name: { $in: payload.tags }
      });

      if (tags.length) {
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      }
    }

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt = req.file.originalname.split('.')[
        req.file.originalname.split('.').length - 1
      ];

      let filename = req.file.filename + '.' + originalExt;

      let target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}`
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on('end', async () => {
        let product = await Product.findOne({ _id: req.params.id }); //todo 1. cari produk yang akan diupdate
        let currentImage = `${config.rootPath}/public/upload/${product.image_url}`; //todo 2. dapatkan absolute path ke gambar dari produk yang akan diupdate
        //todo 3. cek apakah absolute path memang ada di file system
        if (fs.existsSync(currentImage)) {
          //todo 4. jika ada hapus dari file system
          fs.unlinkSync(currentImage);
        }

        //todo 5. update produk ke mongoDB
        product = await Product.findOneAndUpdate(
          { _id: req.params.id },
          { ...payload, image_url: filename },
          { new: true, runValidators: true }
        );
        return res.json(product);
      });

      src.on('error', async () => {
        next(err);
      });
    } else {
      //todo 6. update produk jika tidak ada file upload
      let product = await Product.findOneAndUpdate(
        { _id: req.params.id },
        payload,
        { new: true, runValidators: true }
      );
      return res.json(product);
    }
  } catch (err) {
    //! Cek tipe error
    if (err && err.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors
      });
    }
    next(err);
  }
}

//! FUNGI DESTROY UNTUK MENGHAPUS PRODUK
async function destroy(req, res, next) {
  try {
    //! -------- Cek Policy --------//
    let policy = policyFor(req.user);

    if (!policy.can('delete', 'Product')) {
      return res.json({
        error: 1,
        message: 'Anda tidak memiliki hak akses untuk menghapus produk'
      });
    }

    let product = await Product.findOneAndDelete({ _id: req.params.id });
    let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;

    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
    }
    return res.json(product);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  index,
  update,
  store,
  destroy
};
