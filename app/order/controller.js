const mongoose = require('mongoose');
const Order = require('./model'); //* import model dari order
const OrderItem = require('../order-item/model'); //* import model dari order-item
const CartItem = require('../cart-item/model'); //* import model dari cart-item
const DeliveryAddress = require('../delivery-address/model'); //* import model dari delivery-address
const { policyFor } = require('../policy');
const { subject } = require('@casl/ability');

//! FUNGSI UNTUK MEMBUAT ORDER
async function store(req, res, next) {
  //! ------------- Cek Policy ------------ //
  let policy = policyFor(req.user);

  if (!policy.can('create', 'Order')) {
    return res.json({
      error: 1,
      message: `You're not allowed to perform this action`
    });
  }

  try {
    //todo 1. dapatkan `delivery_fee` dan `delivery_address` dari client
    let { delivery_fee, delivery_address } = req.body;
    //todo 2. dapatkan items dari collection `cartitems` / dari keranjang belanja
    let items = await CartItem.find({ user: req.user._id }).populate('product');
    //todo 3. mengecek jika tidak ada items dikeranjang belanja alias kosong client tidak bisa melakukan order / error
    if (!items.length) {
      return res.json({
        error: 1,
        message: `Can not create order because you have no items in cart`
      });
    }
    //todo 4. kemudian cari data alamat pengiriman dgn bantuan model `DeliveryAddress` & kriterianya adalah berdasarkan payload `delivery_address` yg dikirim oleh client. data ini berisi string merepresentasikan ObjectId / id dari alamat.
    let address = await DeliveryAddress.findOne({ _id: delivery_address });
    //todo 5. membuat objek order baru menggunakan new Order / create order but don't save it yet.
    let order = new Order({
      //? kode yang dimaksudkan dibawah adalah Karena sebelum menyimpan ke MongoDB, kita ingin merelasikan objek order ini ke OrderItems yang akan kita buat. / using mongoose.Types.ObjectId() to generate id for saving ref
      _id: new mongoose.Types.ObjectId(),
      status: 'waiting_payment',
      delivery_fee,
      delivery_address: {
        provinsi: address.provinsi,
        kabupaten: address.kabupaten,
        kecamatan: address.kecamatan,
        kelurahan: address.kelurahan,
        detail: address.detail
      },
      user: req.user._id
    });
    //todo 5. membuat dan menyimpan sekaligus `OrderItem` berdasarkan data items dikeranjang belanja yang sudah didapatkan sebelumnya. Pada saat menyimpan OrderItem di atas, kita tidak hanya menyimpan satu saja tetapi ada beberapa items yang mungkin didapatkan dari keranjang belanja. Artinya dalam bentuk array, sehingga kita tidak menyimpannya satu per satu, tetapi kita menggunakan fungsi insertMany untuk menyimpan seluruh item di array items. Kemudian kenapa kita perlu melakukan map terhadap items, karena kita akan menyimpan beberapa field yang harus diproses terlebih dahulu. / create order items too
    let orderItems = await OrderItem.insertMany(
      items.map((item) => ({
        ...item,
        name: item.product.name,
        qty: parseInt(item.qty),
        price: parseInt(item.product.price),
        order: order._id,
        product: item.product._id
      }))
    );
    //todo 6. sebelum kita menyimpan objek order yang kita buat, kita perlu merelasikan juga ke `OrderItem` yang baru saja kita buat pada variabel orderItems
    orderItems.forEach((item) => order.order_items.push(item));
    //todo 7. simpan objek `order` yang sudah dibuat sebelumnya
    await order.save();
    //todo 8. Setelah itu kita hapus seluruh items yang ada dikeranjang belanja user terkait, karena order sudah berhasil dibuat
    await CartItem.deleteMany({ user: req.user._id });
    //todo 9. Dan terakhir kita repson ke client disertai data order yang berhasil dibuat
    return res.json(order);
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

//! FUNGSI UNTUK MELIHAT DAFTAR ORDER
async function index(req, res, next) {
  let policy = policyFor(req.user);

  if (!policy.can('view', 'Order')) {
    return res.json({
      error: 1,
      message: `You're not allowed to perform this action`
    });
  }

  try {
    //todo 1. dapatkan `limit` & `skip` dari _query string_
    let { limit = 10, skip = 0 } = req.query;

    //todo 2. kemudian hitung jumlah semua order yg dimiliki oleh user yang sdng login tanpa pagination / tanpa limit & skip
    let count = await Order.find({ user: req.user._id }).countDocuments();

    let orders = await Order.find({ user: req.user._id })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('order_items') //* ambil data order_items terkait dengan pesanan / order ini
      .sort('-createdAt'); //* lakukan sortir berdasarkan tanggal dibuatnya pesanan / order secara DESCENDING

    return res.json({
      //todo 3. yg dimaksudkan kode dibawah karena schema `Order` memiliki field virtual yaitu `items_count` jika tidak menggunakan `toJSON({ virtuals: true })` maka field tersebut tidak akan tersedia pada saat diubah menjadi JSON
      data: orders.map((order) => order.toJSON({ virtuals: true })),
      count: count
    });
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
  index
};
