const mongoose = require('mongoose');
const { model, Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Invoice = require('../invoice/model'); //* import model dari invoice untuk post-save mongoose hook

const orderSchema = Schema(
  {
    status: {
      type: String,
      enum: ['waiting_payment', 'processing', 'in_delivery', 'delivered'],
      default: 'waiting_payment'
    },

    delivery_fee: {
      type: Number,
      default: 0
    },

    delivery_address: {
      provinsi: { type: String, required: [true, 'Provinsi harus diisi'] },
      kabupaten: { type: String, required: [true, 'Kabupaten harus diisi'] },
      kecamatan: { type: String, required: [true, 'Kecamatan harus diisi'] },
      kelurahan: { type: String, required: [true, 'Kelurahan harus diisi'] },
      detail: { type: String }
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },

    order_items: [{ type: Schema.Types.ObjectId, ref: 'OrderItem' }]
  },
  { timestamps: true }
);

//! AUTO INCREMENT UNTUK `ORDER_NUMBER`
orderSchema.plugin(AutoIncrement, { inc_field: 'order_number' });

//! FIELD VIRTUAL UNTUK `ITEMS_COUNT` untuk jumlah item / hitungan item yg ada dipesanan
orderSchema.virtual('items_count').get(function () {
  //todo 1. menghitung order, berapa total item yg ada, total item didapat dari order_items, dan untuk masing" item didalamnya maka ambil `qty` kemudian jumlahkan seluruhnya. pada fungsi ini kita bisa mengakses order dgn menggunakan `this`, sehingga untuk mendapatkan `order_items` dari order kita gunakan `this.order_items`
  return this.order_items.reduce((total, item) => {
    //todo 2. gunakan _reduce_ untuk menjumlahkan seluruh `qty`
    return total + parseInt(item.qty);
  }, 0);
});

//! kode untuk implementasi dari Mongoose Hook Post-Save
orderSchema.post('save', async function () {
  //todo 1. menghitung sub_total dgn cara menjumlahkan seluruh harga(price) dikalikan dgn jumlah(qty) dari masing" items didalam `order_items` yg dimiliki oleh pesanan / Order
  let sub_total = this.order_items.reduce(
    (sum, item) => (sum += item.price * item.qty),
    0
  );
  //todo 2. membuat objek `Invoice` baru
  let invoice = new Invoice({
    user: this.user,
    order: this._id,
    sub_total: sub_total,
    delivery_fee: parseInt(this.delivery_fee),
    total: parseInt(sub_total + this.delivery_fee),
    delivery_address: this.delivery_address
  });
  //todo 3. simpan ke mongoDB
  await invoice.save();
});

module.exports = model('Order', orderSchema);
