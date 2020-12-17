const Category = require('./model'); //* import model category
const { policyFor } = require('../policy/index');

//! FUNGSI UNTUK MEMBUAT KATEGORI BARU
async function store(req, res, next) {
  try {
    //! --------- Cek policy --------- //
    let policy = policyFor(req.user);

    if (!policy.can('create', 'Category')) {
      return res.json({
        error: 1,
        message: 'Anda tidak memiliki hak akses untuk membuat kategori'
      });
    }

    //todo 1. Tangkap payload dari `Client Request`
    let payload = req.body;
    //todo 2. Membuat category baru dengan model Category
    let category = new Category(payload);
    //todo 3. Simpan category baru tadi kedalam mongoDB
    await category.save();
    //todo 4. Kembalikan respone client dengan data category yang baru
    return res.json(category);
  } catch (err) {
    //! Tangani error yang disebabkan oleh validasi Model Category
    if (err && err.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors
      });
    }
    //! Tangani error yang tidak kita ketahui
    next(err);
  }
}

async function index(req, res, next) {
  try {
    let category = await Category.find();
    return res.json(category);
  } catch (err) {
    next(err);
  }
}

//! FUNGSI UNTUK MEMPERBARUI KATEGORI YANG SUDAH ADA
async function update(req, res, next) {
  try {
    //! -------- Cek Policy --------//
    let policy = policyFor(req.user);

    if (!policy.can('update', 'Category')) {
      return res.json({
        error: 1,
        message: 'Anda tidak memiliki hak akses untuk mengupdate kategori'
      });
    }

    let payload = req.body;
    let category = await Category.findOneAndUpdate(
      { _id: req.params.id },
      payload,
      { new: true, runValidators: true }
    );
    return res.json(category);
  } catch (err) {
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

//! FUNGSI UNTUK MENGHAPUS KATEGORI
async function destroy(req, res, next) {
  try {
    //! -------- Cek Policy --------//
    let policy = policyFor(req.user);

    if (!policy.can('delete', 'Category')) {
      return res.json({
        error: 1,
        message: 'Anda tidak memiliki hak akses untuk menghapus Kategori'
      });
    }

    let deleted = await Category.findOneAndDelete({ _id: req.params.id });
    return res.json(deleted);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  store,
  index,
  update,
  destroy
};
