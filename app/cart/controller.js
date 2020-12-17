const { policyFor } = require('../policy');
const Product = require('../product/model');
const CartItem = require('../cart-item/model');

//! FUNGSI UPDATE CART UNTUK MENGUPDATE SELURUH ISI KERANJANG SECARA `BULK`
async function update(req, res, next) {
  let policy = policyFor(req.user);

  if (!policy.can('update', 'Cart')) {
    return res.json({
      error: 1,
      message: `You're not allowed to perform this action`
    });
  }

  try {
    //todo 1. dapatkan payload `items` dari client
    const { items } = req.body;
    //todo 2. ekstrak `id` dari masing - masing `item`
    const productIds = items.map((itm) => itm._id);
    //todo 3. cari data produk di mongoDB dan simpan sebagai `products`
    const products = await Product.find({ _id: { $in: productIds } });
    //! kode dibawah untuk persiapkan data `cartItem`
    //todo 4. lakukan map terhadap items di dalamnya lalu cari relatedProduct / produk terkait dan bangun data masing-masing item dari relatedProduct dan data masing-masing item, seperti ini.
    let cartItems = items.map((item) => {
      //todo 5. cari related product dari `products` berdasarkan `product._id` dan `item._id`
      let relatedProduct = products.find(
        (product) => product._id.toString() === item._id
      );
      //todo 6. buat objek yang memuat informasi untuk disimpan sebagai `CartItem`
      return {
        _id: relatedProduct._id,
        product: relatedProduct._id,
        price: relatedProduct.price,
        image_url: relatedProduct.image_url,
        name: relatedProduct.name,
        user: req.user._id,
        qty: item.qty
      };
    });
    //todo 7. update / simpan ke mongoDB semua item pada `cartItems`
    await CartItem.bulkWrite(
      cartItems.map((item) => {
        return {
          updateOne: {
            filter: { user: req.user._id, product: item.product },
            update: item,
            upsert: true
          }
        };
      })
    );
    //todo 8. response ke client
    return res.json(cartItems);
  } catch (err) {
    if (err & (err.name === 'ValidationError')) {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors
      });
    }
    next(err);
  }
}

//! FUNGSI UNTUK MELIHAT DAFTAR ITEMS PADA CART
async function index(req, res, next) {
  let policy = policyFor(req.user);
  if (!policy.can('read', 'Cart')) {
    return res.json({
      error: 1,
      message: `You're not allowed to perform this action`
    });
  }

  try {
    //todo 1. cari items dari mongoDB berdasarkan `user`
    let items = await CartItem.find({ user: req.user._id }).populate('product');
    //todo 2. response ke client
    return res.json(items);
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
  update,
  index
};
