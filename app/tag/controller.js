const Tag = require('./model'); //* import model Tag
const { policyFor } = require('../policy/index');

//! FUNGSI UNTUK MEMBUAT TAG BARU
async function store(req, res, next) {
  try {
    //! ---------- Cek Policy -----------//
    let policy = policyFor(req.user);

    if (!policy.can('create', 'Tag')) {
      return res.json({
        error: 1,
        message: 'Anda tidak memiliki hak akses untuk membuat tag'
      });
    }

    //todo 1. Tangkap payload dari _Client Request_
    let payload = req.body;
    //todo 2. Buat tag baru dengan model Tag
    let tag = new Tag(payload);
    //todo 3. Simpan tag baru tadi ke dalam mongoDB
    await tag.save();
    //todo 4. Kembalikan response client dengan data tag yang baru
    return res.json(tag);
  } catch (err) {
    //! Tanganin error yang disebabkan oleh validasi Model Tag
    if (err && err.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors
      });
    }
    //! Tanganin error yang tidak kita ketahui
    next(err);
  }
}

async function index(req, res, next) {
  try {
    const tags = await Tag.find();
    return res.json(tags);
  } catch (err) {
    next(err);
  }
}

//! FUNGSI UNTUK MEMPERARUI TAG YANG SUDAH ADA
async function update(req, res, next) {
  try {
    //! ---------- Cek Policy -----------//
    let policy = policyFor(req.user);

    if (!policy.can('update', 'Tag')) {
      return res.json({
        error: 1,
        message: 'Anda tidak memiliki hak akses untuk mengupdate tag'
      });
    }

    let payload = req.body;
    let tag = await Tag.findOneAndUpdate({ _id: req.params.id }, payload, {
      new: true,
      runValidators: true
    });
    return res.json(tag);
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

//! FUNGSI UNTUK MENGHAPUS TAG
async function destroy(req, res, next) {
  try {
    //! ---------- Cek Policy -----------//
    let policy = policyFor(req.user);

    if (!policy.can('delete', 'Tag')) {
      return res.json({
        error: 1,
        message: 'Anda tidak memiliki hak akses untuk menghapus tag'
      });
    }

    let delTag = await Tag.findOneAndDelete({ _id: req.params.id });
    return res.json(delTag);
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
