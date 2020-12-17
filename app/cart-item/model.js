const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const cartItemSchema = Schema({
  name: {
    type: String,
    minLength: [5, 'Panjang nama makanan minimal adalah 5 karakter'],
    required: [true, 'Name must be filled']
  },

  qty: {
    type: Number,
    required: [true, 'qty harus diisi'],
    min: [1, 'Minimal qty adalah 1']
  },

  price: {
    type: Number,
    default: 0
  },

  image_url: String,

  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }
});

module.exports = model('CartItem', cartItemSchema);
