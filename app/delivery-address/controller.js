const DeliveryAddress = require('./model');
const { policyFor } = require('../policy/index');
const { subject } = require('@casl/ability'); //todo 0. import subject untuk memproteksi fungsi update / mengecek policy untuk update address

//! FUNGSI UNTUK MEMBUAT ALAMAT PENGIRIMAN
async function store(req, res, next) {
  //! --------- Cek Policy ---------//
  let policy = policyFor(req.user);

  if (!policy.can('create', 'DeliveryAddress')) {
    return res.json({
      error: 1,
      message: `You're not allowed to perform this action`
    });
  }

  try {
    let payload = req.body;
    let user = req.user;
    //todo 1. buat instance 'DeliveryAddress' berdasarkan payload dan data 'user'
    let address = new DeliveryAddress({ ...payload, user: user._id });
    //todo 2. simpan instance diatas ke mongoDB
    await address.save();
    //todo 3. response dengan data 'address' dari mongoDB
    return res.json(address);
  } catch (err) {
    //todo 4. tangani error
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

//! FUNGSI UNTUK MENDAPATKAN DAFTAR ALAMAT PENGIRIMAN DARI USER
async function index(req, res, next) {
  let policy = policyFor(req.user);
  //todo 1. cek apakah user yang sedang login bisa melihat daftar alamat
  if (!policy.can('view', 'DeliveryAddress')) {
    return res.json({
      error: 1,
      message: `You're not allowed to perform this action`
    });
  }

  try {
    //todo 2. baca query string limit dan skip dari req.query
    let { limit = 10, skip = 0 } = req.query;
    //todo 3. dapatkan jumlah data alamat pengiriman
    let count = await DeliveryAddress.find({
      user: req.user._id
    }).countDocuments();
    //todo 4. Setelah itu kita akan melakukan query data alamat pengiriman yang dimiliki oleh user dengan limit dan skip untuk pagination dan disortir secara DESCENDING berdasarkan createdAt.
    let deliveryAddresses = await DeliveryAddress.find({ user: req.user._id })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort('-createdAt');
    //todo 5. respon `data` dan `count`, `count` digunakan untuk pagination client
    return res.json({ data: deliveryAddresses, count: count });
  } catch (err) {
    //todo 6. tangani kemungkinan terjadi error
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

//! FUNGSI UNTUK MEMPERBARUI ALAMAT PENGIRIMAN SESUAI USER_.ID
async function update(req, res, next) {
  let policy = policyFor(req.user);

  try {
    //todo 1. dapatkan "id" dari "req.params"
    let { id } = req.params;
    //todo 2. buat "payload" dan keluarkan "_id"
    let { _id, ...payload } = req.body;
    //! -------- Cek Policy ----------//
    //todo 3. variabel address berisi data alamat pengiriman yang akan diupdate & ambil dari mongoDB
    let address = await DeliveryAddress.findOne({ _id: id });
    //todo 4. kode dibawah menginformasikan supaya CASL tahu bahwa objek yang dikirimkan bertipe _DeliveryAddress_ dan kemudian kita juga berikan properti bayangan user_id yang nilainya kita ambil dari address.user supaya policy terkait bisa mengecek kepemilikan objek tersebut dibandingkan dengan user yang sedang login.
    let subjectAddress = subject('DeliveryAddress', {
      ...address,
      user_id: address.user
    });
    //todo 5. cek policy
    if (!policy.can('update', subjectAddress)) {
      return res.json({
        error: 1,
        message: `You're not allowed to modify this resource`
      });
    }
    //! -------- End Cek Policy ----------//
    //todo 6. update ke mongoDB
    address = await DeliveryAddress.findOneAndUpdate({ _id: id }, payload, {
      new: true
    });
    //todo 7. response dengan data _address_
    return res.json(address);
  } catch (err) {
    //todo 8. tangani kemungkinan adanya error
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

//! FUNGSI UNTUK MENGHAPUS ALAMAT PENGIRIMAN
async function destroy(req, res, next) {
  let policy = policyFor(req.user);

  try {
    let { id } = req.params;
    let address = await DeliveryAddress.findOne({ _id: id });
    let subjectAddress = subject({ ...address, user: address.user });
    if (!policy.can('delete', subjectAddress)) {
      return res.json({
        error: 1,
        message: `You're not allowed to delete this resource`
      });
    }
    await DeliveryAddress.findOneAndDelete({ _id: id });
    return res.json(address);
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

module.exports = {
  store,
  index,
  update,
  destroy
};
